"use client";

import { useEffect, useReducer, useState } from "react";
import dynamic from "next/dynamic";
import { FontDict } from "cvdl-ts/dist/AnyLayout";
import { LocalStorage } from "cvdl-ts/dist/LocalStorage";
import * as Resume from "cvdl-ts/dist/Resume";
import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { ResumeLayout } from "cvdl-ts/dist/ResumeLayout";
import { DataSchema } from "cvdl-ts/dist/DataSchema";
import Section from "@/components/Section";
import { render as domRender } from "@/logic/DomLayout";
import Layout from "@/components/layout";
import { convert, convertBack } from "@/logic/JsonResume";
import { fetchGist } from "@/api/fetchGist";
import {
	DocumentDispatchContext,
	DocumentReducer,
	EditorContext,
} from "./State";
import AddNewSection from "./AddNewSection";
import * as Defaults from "cvdl-ts/dist/Defaults";
import Dropdown from "./Dropdown";

const LayoutEditor = dynamic(() => import("@/components/LayoutEditor"));
const DataSchemaEditor = dynamic(() => import("@/components/DataSchemaEditor"));
const RawEditor = dynamic(() => import("@/components/RawEditor"));

const storage = new LocalStorage();
const RESUME_GIST_LINKS_KEY = "tail_resume_gist_links";
const GIST_FILE_NAME = "resume.json";

type GithubSessionState = {
	connected: boolean;
	login?: string | null;
	name?: string | null;
	avatarUrl?: string | null;
	scope?: string | null;
};

type ResumeGistLink = {
	id: string;
	htmlUrl: string;
	fileName: string;
	updatedAt: string;
};

function App() {
	console.log = () => {};
	console.warn = () => {};
	console.info = () => {};

	const [state, dispatch] = useReducer(DocumentReducer, {
		resume: Resume.resume("Default", "SingleColumnSchema", []),
		editorPath: { tag: "none" },
		dataSchemas: [],
		layoutSchemas: [],
		editHistory: [],
		resumeLayout: Defaults.DefaultResumeLayout,
	});
	const [resume, setResume] = useState<string>("Default");
	const [resumes, setResumes] = useState<string[] | null>(null);
	// const [resumeData, setResumeData] = useState<Resume | null>(state)
	const [bindings, setBindings] = useState<Map<string, unknown>>(new Map());
	const [fontDict, setFontDict] = useState<FontDict>(new FontDict());
	const [debug, setDebug] = useState<boolean>(false);
	const [storageInitiated, setStorageInitiated] = useState<boolean>(false);
	const [currentTab, setCurrentTab] = useState<
		"content-editor" | "layout-editor" | "schema-editor" | "raw-editor"
	>("content-editor");
	const [githubSession, setGithubSession] = useState<GithubSessionState>({
		connected: false,
	});
	const [isGithubBusy, setIsGithubBusy] = useState<boolean>(false);
	const [resumeGistLinks, setResumeGistLinks] = useState<
		Record<string, ResumeGistLink>
	>({});
	const currentResumeName = state.resume?.name ?? resume;
	const currentResumeGistLink = resumeGistLinks[currentResumeName];

	useEffect(() => {
		require("../registerStaticFiles.js");
		storage.initiate_storage().then(() => {
			const loadedFontDict = new FontDict();
			loadedFontDict.load_fonts(storage).then((loaded) => {
				setFontDict(loaded);
				setStorageInitiated(true);
			});
		});

		const rawLinks = localStorage.getItem(RESUME_GIST_LINKS_KEY);
		if (rawLinks) {
			try {
				setResumeGistLinks(JSON.parse(rawLinks) as Record<string, ResumeGistLink>);
			} catch {
				setResumeGistLinks({});
			}
		}

		void fetch("/api/github/session", { cache: "no-store" })
			.then((response) => {
				if (!response.ok) {
					setGithubSession({ connected: false });
					return null;
				}
				return response.json();
			})
			.then((data) => {
				if (data) {
					setGithubSession(data as GithubSessionState);
				}
			})
			.catch(() => {
				setGithubSession({ connected: false });
			});

		// Check if query parameters are present
		if (window.location.search) {
			const urlParams = new URLSearchParams(window.location.search);
			const load_resume = urlParams.get("user");
			const githubStatus = urlParams.get("github");
			const githubReason = urlParams.get("reason");

			if (githubStatus === "connected") {
				alert("GitHub account connected.");
			} else if (githubStatus === "error") {
				alert(`GitHub connection failed${githubReason ? ` (${githubReason})` : ""}.`);
			}

			if (load_resume && localStorage.getItem(load_resume) !== "loaded") {
				fetchGist(load_resume).then((data) => {
					const resume = convert(data);
					localStorage.setItem(load_resume, "loaded");
					dispatch({ type: "load", value: resume });
				});
			}

			if (githubStatus || githubReason) {
				urlParams.delete("github");
				urlParams.delete("reason");
				const nextSearch = urlParams.toString();
				const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`;
				window.history.replaceState({}, "", nextUrl);
			}
		}
	}, [dispatch]);

	useEffect(() => {
		if (!storageInitiated) {
			return;
		}
		try {
			storage.load_resume(resume).then((data: Resume.t) => {
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
		localStorage.setItem(RESUME_GIST_LINKS_KEY, JSON.stringify(resumeGistLinks));
	}, [resumeGistLinks]);

	useEffect(() => {
		if (!storageInitiated) {
			return;
		}
		domRender({
			resume: state.resume!,
			layout_schemas: state.layoutSchemas!,
			data_schemas: state.dataSchemas!,
			resume_layout: state.resumeLayout!,
			storage,
			bindings,
			fontDict,
			state,
			dispatch,
			debug,
		});
	}, [resume, bindings, fontDict, debug, storageInitiated, state, dispatch]);

	const connectGithub = () => {
		const returnTo = `${window.location.pathname}${window.location.search}`;
		window.location.href = `/api/github/login?returnTo=${encodeURIComponent(returnTo)}`;
	};

	const disconnectGithub = async () => {
		setIsGithubBusy(true);
		try {
			await fetch("/api/github/logout", { method: "POST" });
			setGithubSession({ connected: false });
		} finally {
			setIsGithubBusy(false);
		}
	};

	const publishResumeToGithub = async () => {
		if (!state.resume) {
			return;
		}
		if (!githubSession.connected) {
			alert("Connect your GitHub account first.");
			return;
		}
		setIsGithubBusy(true);
		try {
			const response = await fetch("/api/github/gists", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						content: JSON.stringify(convertBack(state.resume), null, 2),
						fileName: GIST_FILE_NAME,
						description: `Tail resume: ${currentResumeName}`,
						isPublic: true,
					}),
			});
			const data = (await response.json()) as {
				error?: string;
				id?: string;
				htmlUrl?: string;
				fileName?: string;
				updatedAt?: string;
			};
			if (!response.ok || !data.id || !data.htmlUrl || !data.fileName) {
				alert(data.error ?? "Failed to publish gist.");
				return;
			}

			setResumeGistLinks((previous) => ({
				...previous,
				[currentResumeName]: {
					id: data.id!,
					htmlUrl: data.htmlUrl!,
					fileName: data.fileName!,
					updatedAt: data.updatedAt ?? new Date().toISOString(),
				},
			}));
			alert(`Published to GitHub gist: ${data.htmlUrl}`);
		} catch (error) {
			alert(`Failed to publish gist: ${String(error)}`);
		} finally {
			setIsGithubBusy(false);
		}
	};

	const updateResumeOnGithub = async () => {
		if (!state.resume) {
			return;
		}
		if (!githubSession.connected) {
			alert("Connect your GitHub account first.");
			return;
		}
		if (!currentResumeGistLink) {
			await publishResumeToGithub();
			return;
		}

		setIsGithubBusy(true);
		try {
			const response = await fetch(
				`/api/github/gists/${encodeURIComponent(currentResumeGistLink.id)}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							content: JSON.stringify(convertBack(state.resume), null, 2),
							fileName: GIST_FILE_NAME,
							description: `Tail resume: ${currentResumeName}`,
						}),
					},
			);
			const data = (await response.json()) as {
				error?: string;
				id?: string;
				htmlUrl?: string;
				fileName?: string;
				updatedAt?: string;
			};
			if (!response.ok || !data.id || !data.htmlUrl || !data.fileName) {
				alert(data.error ?? "Failed to update gist.");
				return;
			}

			setResumeGistLinks((previous) => ({
				...previous,
				[currentResumeName]: {
					id: data.id!,
					htmlUrl: data.htmlUrl!,
					fileName: data.fileName!,
					updatedAt: data.updatedAt ?? new Date().toISOString(),
				},
			}));
			alert(`Updated GitHub gist: ${data.htmlUrl}`);
		} catch (error) {
			alert(`Failed to update gist: ${String(error)}`);
		} finally {
			setIsGithubBusy(false);
		}
	};

	const copyCurrentGistUrl = async () => {
		if (!currentResumeGistLink) {
			alert("No linked gist for this resume yet.");
			return;
		}
		try {
			await navigator.clipboard.writeText(currentResumeGistLink.htmlUrl);
			alert("Gist URL copied to clipboard.");
		} catch {
			prompt("Copy gist URL", currentResumeGistLink.htmlUrl);
		}
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

	const downloadResume = async () => {
		const { render: pdfRender } = await import("cvdl-ts/dist/PdfLayout");
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
			link.download = `${state.resume.name}.pdf`;
			link.click();
		});
	};

	const downloadJsonResume = () => {
		const pdf = window.URL.createObjectURL(
			new Blob([JSON.stringify(convertBack(state.resume), null, 2)]),
		);
		const link = document.createElement("a");
		link.href = pdf;
		link.download = `${state.resume.name}-JsonResume.json`;
		link.click();
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
					<div
						style={{ display: "flex", flexDirection: "row", height: "100%" }}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								margin: "20px",
							}}
						>
							<button
								className={`bordered ${currentTab === "content-editor" ? "selected" : ""}`}
								onClick={() => setCurrentTab("content-editor")}
							>
								Content Editor
							</button>
							<button
								className={`bordered ${currentTab === "layout-editor" ? "selected" : ""}`}
								onClick={() => setCurrentTab("layout-editor")}
							>
								Layout Editor
							</button>
							<button
								className={`bordered ${currentTab === "schema-editor" ? "selected" : ""}`}
								onClick={() => setCurrentTab("schema-editor")}
							>
								Schema Editor
							</button>
							<button
								className={`bordered ${currentTab === "raw-editor" ? "selected" : ""}`}
								onClick={() => setCurrentTab("raw-editor")}
							>
								Raw Editor
							</button>
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								width: "50%",
								margin: "20px",
								minWidth: "250px",
								maxHeight: "calc(100vh - 40px)",
								overflow: "auto",
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
											return <Section key={index} section={section} />;
										})}
								</div>
							)}
							{currentTab === "layout-editor" && <LayoutEditor />}
							{currentTab === "schema-editor" && <DataSchemaEditor />}
							{currentTab === "raw-editor" && <RawEditor />}
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								margin: "20px",
								minWidth: "640px",
								maxHeight: "calc(100vh - 40px)",
								overflow: "auto",
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
									<button className="bordered" onClick={downloadResume}>
										⤓ Download
									</button>
									<Dropdown
										text="Export"
										items={[
											{ text: "pdf", fn: downloadResume },
											{ text: "JsonResume", fn: downloadJsonResume },
										]}
									/>
									{githubSession.connected ? (
										<>
											<button
												className={`bordered ${isGithubBusy ? "disabled" : ""}`}
												disabled={isGithubBusy}
												onClick={publishResumeToGithub}
											>
												GitHub Publish
											</button>
											<button
												className={`bordered ${isGithubBusy ? "disabled" : ""}`}
												disabled={isGithubBusy}
												onClick={updateResumeOnGithub}
											>
												GitHub Update
											</button>
											<button className="bordered" onClick={copyCurrentGistUrl}>
												GitHub Copy URL
											</button>
											<button
												className={`bordered ${isGithubBusy ? "disabled" : ""}`}
												disabled={isGithubBusy}
												onClick={disconnectGithub}
											>
												GitHub Disconnect
											</button>
										</>
									) : (
										<button
											className={`bordered ${isGithubBusy ? "disabled" : ""}`}
											disabled={isGithubBusy}
											onClick={connectGithub}
										>
											GitHub Connect
										</button>
									)}
									<button className="bordered" onClick={() => setDebug(!debug)}>
										&#x1F41E; Debug
									</button>
								</div>
								<div style={{ marginBottom: "8px", fontSize: "0.85rem" }}>
									{githubSession.connected ? (
										<span>
											GitHub connected
											{githubSession.login ? ` as @${githubSession.login}` : ""}.
											{currentResumeGistLink
												? ` Synced gist: ${currentResumeGistLink.id}`
												: " This resume is not linked to a gist yet."}
										</span>
									) : (
										<span>GitHub not connected.</span>
									)}
								</div>
								<div
									id="pdf-container"
									style={{ display: "flex", flexDirection: "column" }}
								></div>
							{/* {
                                (storageInitiated && state.resume && state.dataSchemas.length !== 0 && state.layoutSchemas.length !== 0) &&
                                <ReactLayout
                                    resume_name={state!.resume.name}
                                    resume={state!.resume}
                                    data_schemas={state.dataSchemas}
                                    layout_schemas={state.layoutSchemas}
                                    resume_layout={state.resumeLayout}
                                    bindings={bindings}
                                    storage={storage}
                                    fontDict={fontDict}
                                    state={state}
                                    dispatch={dispatch}
                                    debug={false}
                                />
                            } */}
						</div>
					</div>
				</Layout>
			</DocumentDispatchContext.Provider>
		</EditorContext.Provider>
	);
}

export default App;
