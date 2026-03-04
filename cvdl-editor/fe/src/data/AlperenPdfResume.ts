import { convert, JsonResume } from "@/logic/JsonResume";

export const AlperenPdfJsonResume: JsonResume = {
	basics: {
		name: "Alperen Keles",
		email: "akeles@umd.edu",
		url: "https://alperenkeles.com",
	},
	work: [
		{
			name: "University of Maryland - PLUM",
			position: "Graduate Research Assistant",
			startDate: "Aug 2022",
			endDate: "Present",
			summary:
				"Maryland, USA. Working with Leonidas Lampropoulos on the intersection of Property Based Testing, Fuzzing, and Formal Verification.",
			highlights: ["Property-Based Testing", "Fuzzing", "Formal Verification"],
		},
		{
			name: "Datadog",
			position: "Research Science Intern",
			startDate: "Jul 2025",
			endDate: "Aug 2025",
			summary:
				"New York, USA (Remote). Working on grounding of LLM generated programs via random testing and formal modeling.",
			highlights: [
				"Large Language Models",
				"Random Testing",
				"Formal Verification",
			],
		},
		{
			name: "Bloomberg L.P.",
			position: "Research Intern",
			startDate: "June 2024",
			endDate: "Aug 2024",
			summary:
				"New York, USA. Worked on executable semantics for inductive separation logic specifications to derive property-based tests for C code.",
			highlights: [
				"Separation Logic",
				"Property-Based Testing",
				"C",
				"OCaml",
				"Rust",
			],
		},
		{
			name: "Amazon Web Services",
			position: "Applied Science Intern - Privacy Engineering",
			startDate: "May 2023",
			endDate: "Aug 2023",
			summary:
				"New York, USA. Developed a dataflow analysis method for a state machine based DSL.",
			highlights: [
				"Python",
				"Java",
				"Dataflow Analysis",
				"Symbolic Execution",
				"Abstract Interpretation",
			],
		},
		{
			name: "Amazon Web Services",
			position: "Applied Science Intern - Privacy Engineering",
			startDate: "May 2022",
			endDate: "Aug 2022",
			summary:
				"New York, USA. Implemented a novel encryption scheme on top of the AWS Encryption SDK.",
			highlights: ["Python", "Dafny", "AWS Encryption SDK"],
		},
		{
			name: "University of Maryland - MC2",
			position: "Research Intern at MC2",
			startDate: "Jul 2020",
			endDate: "Dec 2020",
			summary: "Maryland, USA (Remote)",
			highlights: ["Program Synthesis", "Automatic Exploit Generation"],
		},
		{
			name: "Havelsan",
			position: "Part-Time Engineer",
			startDate: "Jul 2020",
			endDate: "Jul 2021",
			summary:
				"Ankara, Turkey. Designed and implemented a bandwidth detection and optimization algorithm for a video-conference application.",
			highlights: ["Javascript", "React"],
		},
		{
			name: "Emproof",
			position: "Embedded Security Engineering Intern",
			startDate: "Jun 2019",
			endDate: "Sept 2019",
			summary:
				"Bochum, Germany. Worked on translation validation of binary obfuscation techniques.",
			highlights: ["C++", "Z3 SMT Solver", "ARM Assembly", "Symbolic Execution"],
		},
	],
	volunteer: [
		{
			organization: "ICSE 2026 Shadow Program Committee",
			position: "Shadow Reviewer",
			startDate: "Aug 2025",
			endDate: "",
			summary: "",
			highlights: [],
		},
		{
			organization: "extendr: Frictionless bindings for R and Rust",
			position: "Reviewer",
			startDate: "Jul 2024",
			endDate: "",
			url: "10.21105/joss.06394",
			summary: "",
			highlights: [],
		},
		{
			organization: "afetbilgi.com",
			position: "Founder",
			startDate: "Feb 2023",
			endDate: "Jul 2023",
			url: "afetbilgi.com",
			summary: "",
			highlights: [],
		},
		{
			organization: "ICFP Programming Contest",
			position: "Co-Organizer of 26th Annual ICFP Programming Contest",
			startDate: "Sep 2022",
			endDate: "Jul 2023",
			summary: "",
			highlights: [],
		},
		{
			organization: "ICFP Programming Contest",
			position: "Organizer of 25th Annual ICFP Programming Contest",
			startDate: "Jun 2022",
			endDate: "Sep 2022",
			summary: "",
			highlights: [],
		},
	],
	education: [
		{
			institution: "University of Maryland",
			studyType: "Doctorate of Philosophy",
			area: "Computer Science",
			startDate: "2021",
			endDate: "May 2026 (Expected)",
			score: "Thesis: Designing Effective Property-Based Testing Frameworks",
		},
		{
			institution: "Middle East Technical University",
			studyType: "Bachelor of Engineering",
			area: "Computer Engineering",
			startDate: "2017",
			endDate: "2021",
			score: "GPA: 3.66/4.0 (top 5% in class of 229)",
		},
	],
	publications: [
		{
			name: "D4: Debugging Databases Under Development",
			releaseDate: "under review",
			summary:
				"Alperen Keles, Ethan Chou, Harrison Goldstein, Leonidas Lampropoulos",
		},
		{
			name: "Etna: An Evaluation Platform for Property-Based Testing",
			releaseDate: "under review",
			summary:
				"Alperen Keles, Jessica Shi, Nikhil Kamath, Tin Nam Liu, Ceren Mert, Harrison Goldstein, Benjamin C. Pierce, Leonidas Lampropoulos",
		},
		{
			name: "Deeper Properties for Programmable Testing",
			releaseDate: "under review",
			summary:
				"Alperen Keles, Justin Frank, Ceren Mert, Harrison Goldstein, Leonidas Lampropoulos",
		},
		{
			name: "Tail: A Typed and Structured Document Editor",
			publisher: "POPL 2024 SRC",
			summary: "Alperen Keles",
		},
		{
			name: "Etna: An Evaluation Platform for Property-Based Testing (Experience Report)",
			publisher: "ICFP 2023",
			summary:
				"Jessica Shi, Alperen Keles, Harrison Goldstein, Benjamin C. Pierce, Leonidas Lampropoulos",
		},
		{
			name: "Protocol Verification Language",
			publisher: "CGO 2020 SRC",
			summary: "Alperen Keles, Ozan Akin, Ozan Sazak, Umut Sahin",
		},
		{
			name: "DroPPPP: A P4 Approach to Mitigating DoS Attacks in SDN",
			publisher: "WISA 2019",
			summary:
				"Goksel Simsek, Hakan Bostan, Alper Kaan Sarica, Egemen Sarikaya, Alperen Keles, Pelin Angin, Hande Alemdar, Ertan Onur",
		},
	],
	projects: [
		{
			name: "Debugging Databases Under Development",
			startDate: "Dec 2024",
			endDate: "Present",
			description:
				"Random testing of an open source SQLite-compatible OLTP database, finding multiple logic and compatibility bugs, with an embedded DSL for correctness properties and a testing infrastructure from scratch.",
			highlights: ["Property-Based Testing", "SQLite", "Rust"],
		},
		{
			name: "tjq (typed jq)",
			startDate: "Dec 2024",
			endDate: "Present",
			description:
				"A gradual type system developed on top of jq, a JSON processing language.",
			highlights: ["Gradual Types", "Streams", "Rust"],
		},
		{
			name: "Tail Document Editor",
			startDate: "May 2023",
			endDate: "Present",
			description:
				"A template-oriented document editor automatically constructing forms from page templates for novel editing flows.",
			highlights: ["Rendering", "Live Editing", "Typescript"],
		},
		{
			name: "ETNA",
			startDate: "Sep 2022",
			endDate: "Present",
			description: "An evaluation and analysis framework for PBT libraries.",
			highlights: [
				"Property-Based Testing",
				"Rust",
				"Python",
				"Haskell",
				"Rocq",
				"OCaml",
				"Racket",
			],
		},
		{
			name: "Giving Types to jq",
			description: "Talk: NJPLS May 2025",
			highlights: ["Talk"],
		},
		{
			name: "Property-Based Testing: The Past, The Present, and The Future",
			description: "Talk: Bobkonf 25",
			highlights: ["Talk"],
		},
		{
			name: "Designing A Functional Document Processor",
			description: "Talk: LambdaConf 2024",
			highlights: ["Talk"],
		},
		{
			name: "Nitty Gritty Bits of Property-Based Testing",
			description: "Talk: DC Systems 003",
			highlights: ["Talk"],
		},
		{
			name: "Verifiability is the Limit",
			startDate: "Mar 2025",
			description: "Selected article",
			highlights: ["Article"],
		},
		{
			name: "Solving Algorithmic Problems in the Wild",
			startDate: "Mar 2024",
			description: "Selected article",
			highlights: ["Article"],
		},
		{
			name: "The Technical Pie",
			startDate: "Jun 2023",
			description: "Selected article",
			highlights: ["Article"],
		},
	],
};

export const AlperenPdfTailResume = convert(AlperenPdfJsonResume);
