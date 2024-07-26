"use client";

import { useEffect, useReducer, useState } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { FontDict } from "cvdl-ts/dist/AnyLayout";
import { render as pdfRender } from "cvdl-ts/dist/PdfLayout";
import { LocalStorage } from "cvdl-ts/dist/LocalStorage";
import * as Resume from "cvdl-ts/dist/Resume";
import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { ResumeLayout } from "cvdl-ts/dist/ResumeLayout";
import { DataSchema } from "cvdl-ts/dist/DataSchema";
// import * as pdfjsLib from 'pdfjs-dist/webpack';
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore
import workerSrc from "pdfjs-dist/build/pdf.worker.entry";
import Section from "@/components/Section";
import { render as domRender } from "@/logic/DomLayout";
import Layout from "@/components/layout";
import LayoutEditor from "@/components/LayoutEditor";
import DataSchemaEditor from "@/components/DataSchemaEditor";
import { convert } from "@/logic/JsonResume";
import { fetchGist, fetchGistById } from "@/api/fetchGist";
import {
	DocumentDispatchContext,
	DocumentReducer,
	EditorContext,
} from "./State";
import AddNewSection from "./AddNewSection";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const storage = new LocalStorage();

function App() {
	console.log = () => { };
	console.warn = () => { };
	console.info = () => { };

	const [state, dispatch] = useReducer(DocumentReducer, {
		resume: Resume.resume("Default", "SingleColumnSchema", []),
		editorPath: { tag: "none" },
		dataSchemas: [],
		layoutSchemas: [],
		editHistory: [],
	});
	const [resume, setResume] = useState<string>("Default");
	const [resumes, setResumes] = useState<string[] | null>(null);
	// const [resumeData, setResumeData] = useState<Resume | null>(state)
	const [bindings, setBindings] = useState<Map<string, unknown>>(new Map());
	const [fontDict, setFontDict] = useState<FontDict>(new FontDict());
	const [debug, setDebug] = useState<boolean>(false);
	const [storageInitiated, setStorageInitiated] = useState<boolean>(false);
	const [currentTab, setCurrentTab] = useState<
		"content-editor" | "layout-editor" | "schema-editor"
	>("content-editor");

	useEffect(() => {
		require("../registerStaticFiles.js");
		storage.initiate_storage().then(() => {
			fontDict.load_fonts(storage).then((fontDict) => {
				setFontDict(fontDict);
				setStorageInitiated(true);
			});
		});

		if (localStorage.getItem("version") !== "0.1.1") {
			localStorage.clear();
			localStorage.setItem("version", "0.1.1");
		}

		// Check if query parameter is present
		if (window.location.search) {
			const urlParams = new URLSearchParams(window.location.search);
			const load_resume = urlParams.get("user");
			console.log(load_resume);
			if (load_resume) {
				fetchGist(load_resume).then((data) => {
					const resume = convert(data);
					dispatch({ type: "load", value: resume });
				});
			}
		}
	}, []);

	useEffect(() => {
		if (!storageInitiated) {
			return;
		}
		try {
			console.error("Trying to load local resume");
			storage.load_resume(resume).then((data: Resume.t) => {
				console.error("Loaded local data", data);
				dispatch({ type: "load", value: data });
			});
		} catch (e) {
			console.error(e);
		}
	}, [resume, storageInitiated]);

	useEffect(() => {
		if (!storageInitiated) {
			return;
		}
		const data_schema_loader = () => {
			storage.list_data_schemas().then((dataSchemaNames: string[]) => {
				Promise.all(
					dataSchemaNames.map((schema) => storage.load_data_schema(schema)),
				).then((dataSchemas: DataSchema.t[]) => {
					dispatch({ type: "load-data-schemas", value: dataSchemas });
				});
			});
		};

		const layout_schema_loader = () => {
			storage.list_layout_schemas().then((layoutSchemaNames: string[]) => {
				Promise.all(
					layoutSchemaNames.map((schema) => storage.load_layout_schema(schema)),
				).then((layoutSchemas: LayoutSchema[]) => {
					dispatch({ type: "load-layout-schemas", value: layoutSchemas });
				});
			});
		};

		const bindings_loader = () => {
			storage.load_bindings().then((bindings: Map<string, unknown>) => {
				setBindings(bindings);
			});
		};

		const resumes_loader = () => {
			storage.list_resumes().then((resumes: string[]) => {
				setResumes(resumes);
			});
		};

		data_schema_loader();
		bindings_loader();
		layout_schema_loader();
		resumes_loader();
	}, [state.resume, storageInitiated]);

	useEffect(() => {
		if (!storageInitiated) {
			return;
		}
		domRender({
			resume_name: resume,
			resume: state.resume!,
			storage: new LocalStorage(),
			bindings,
			fontDict,
			state,
			dispatch,
			debug,
		});
	}, [resume, fontDict, debug, storageInitiated, state, dispatch]);

	const saveResumeToGithub = () => {
		if (!state.resume) {
			return;
		}
		const githubToken = localStorage.getItem("github_token");
		if (!githubToken) {
			alert("Please login with Github to save your resume");
			return;
		}
		alert(githubToken);
		fetch("https://api.github.com/gists", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${githubToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				description: "Resume",
				public: true,
				files: {
					[`${resume}.json`]: {
						content: JSON.stringify(state.resume),
					},
				},
			}),
		}).then((response) => {
			if (response.status === 201) {
				alert("Resume saved successfully");
			} else {
				alert("Error saving resume");
			}
		});
	};

	const saveResume = () => {
		if (!state.resume) {
			return;
		}
		// Download the current resume as a json file
		const data = JSON.stringify(state.resume);
		const blob = new Blob([data], { type: "application/json" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${resume}.json`;
		link.click();
	};

	const downloadResume = () => {
		pdfRender({
			resume_name: resume,
			resume: state.resume!,
			bindings,
			storage,
			fontDict,
			debug,
		}).then(({ blob }) => {
			const pdf = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = pdf;
			link.download = "resume.pdf";
			link.click();
		});
	};

	const uploadResume = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files![0];
			const reader = new FileReader();
			reader.onload = (e) => {
				const data = JSON.parse((e.target as any).result);
				const resume = "layout" in data ? data : convert(data);
				dispatch({ type: "load", value: resume });
			};
			reader.readAsText(file);
		};
		input.click();
	};

	const uploadResumeFromGist = () => {
		// Prompt for Gist ID
		const gistId = prompt("Enter Gist ID");
		if (!gistId) {
			return;
		}
		fetchGistById(gistId).then((data) => {
			const resume = "layout" in data ? data : convert(data);
			dispatch({ type: "load", value: resume });
		});
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.key === "z" && e.ctrlKey) || (e.key === "z" && e.metaKey)) {
				if (e.repeat) {
					return;
				}
				e.preventDefault();
				dispatch({ type: "undo" });
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	});

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.key === "s" && e.ctrlKey) || (e.key === "s" && e.metaKey)) {
				if (e.repeat) {
					return;
				}
				e.preventDefault();
				saveResume();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	});

	return (
		<EditorContext.Provider value={state}>
			<DocumentDispatchContext.Provider value={dispatch}>
				<Layout>
					<div style={{ display: "flex", flexDirection: "row" }}>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								margin: "20px",
							}}
						>
							<button
								className="bordered"
								style={{
									backgroundColor:
										currentTab === "content-editor" ? "#101010" : "white",
									color: currentTab === "content-editor" ? "white" : "black",
								}}
								onClick={() => setCurrentTab("content-editor")}
							>
								Content Editor
							</button>
							<button
								className="bordered"
								style={{
									backgroundColor:
										currentTab === "layout-editor" ? "#101010" : "white",
									color: currentTab === "layout-editor" ? "white" : "black",
								}}
								onClick={() => setCurrentTab("layout-editor")}
							>
								Layout Editor
							</button>
							<button
								className="bordered"
								style={{
									backgroundColor:
										currentTab === "schema-editor" ? "#101010" : "white",
									color: currentTab === "schema-editor" ? "white" : "black",
								}}
								onClick={() => setCurrentTab("schema-editor")}
							>
								Schema Editor
							</button>
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								width: "50%",
								margin: "20px",
								minWidth: "250px",
								maxHeight: "95vh",
								overflow: "scroll",
							}}
						>
							<div style={{ display: "flex", flexDirection: "row" }}>
								<select
									value={state.resume?.name}
									onChange={(e) => {
										setResume(e.target.value);
										dispatch({
											type: "switch-resume",
											resumeName: e.target.value,
										});
									}}
								>
									{resumes &&
										resumes.map((resume) => {
											return (
												<option key={resume} value={resume}>
													{resume}
												</option>
											);
										})}
								</select>
								<button
									className="bordered"
									onClick={() => {
										const name = prompt("Enter new resume name");
										if (name) {
											setResume(name);
											dispatch({ type: "create-new-resume", resumeName: name });
										}
									}}
								>
									⊕ New Resume
								</button>
							</div>

							{currentTab === "content-editor" && (
								<div>
									<h1>Content Editor</h1>
									<AddNewSection />
									{state.resume &&
										state.resume.sections.map((section, index) => {
											return (
												<Section
													key={index}
													section={section}
												/>
											);
										})}
								</div>
							)}
							{currentTab === "layout-editor" && (
								<LayoutEditor />
							)}
							{currentTab === "schema-editor" && (
								<DataSchemaEditor />
							)}
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								margin: "20px",
								minWidth: "640px",
								maxHeight: "95vh",
								overflow: "scroll",
							}}
						>
							<div
								style={{
									display: "flex",
									flexDirection: "row",
									marginBottom: "5px",
								}}
							>
								<button className="bordered" onClick={uploadResume}>
									&#x1F4C1; Import
								</button>
								<button className="bordered" onClick={uploadResumeFromGist}>
									&#x1F517; Import
								</button>
								<button className="bordered" onClick={downloadResume}>
									⤓ Download
								</button>
								<button className="bordered" onClick={() => setDebug(!debug)}>
									&#x1F41E; Debug
								</button>
							</div>
							<div
								id="pdf-container"
								style={{ display: "flex", flexDirection: "column" }}
							></div>
						</div>
					</div>
				</Layout>
			</DocumentDispatchContext.Provider>
		</EditorContext.Provider>
	);
}

export default App;
