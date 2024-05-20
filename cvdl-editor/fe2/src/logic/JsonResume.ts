// Import a jsonresume file and convert it to a resume object/

import { Width } from "cvdl-ts/dist/Width";
import { DataSchema } from "cvdl-ts/dist/DataSchema";
import { Font } from "cvdl-ts/dist/Font";
import { Elem, Row, SectionLayout, Stack } from "cvdl-ts/dist/Layout";
import { LayoutSchema } from "cvdl-ts/dist/LayoutSchema";
import { LocalStorage } from "cvdl-ts/dist/LocalStorage";
import { ItemContent, Resume, ResumeSection } from "cvdl-ts/dist/Resume";

export type JsonResume = {
    basics?: {
        name?: string;
        label?: string;
        image?: string;
        email?: string;
        phone?: string;
        url?: string;
        summary?: string;
        location?: {
            address?: string;
            postalCode?: string;
            city?: string;
            countryCode?: string;
            region?: string;
        };
        profiles?: {
            network?: string;
            username?: string;
            url?: string;
        };
    };
    work?: {
        name?: string;
        position?: string;
        url?: string;
        startDate?: string;
        endDate?: string;
        summary?: string;
        highlights?: string[];
    }[];
    volunteer?: {
        organization?: string;
        position?: string;
        url?: string;
        startDate?: string;
        endDate?: string;
        summary?: string;
        highlights?: string[];
    }[];
    education?: {
        institution?: string;
        url?: string;
        area?: string;
        studyType?: string;
        startDate?: string;
        endDate?: string;
        score?: string;
        courses?: string[];
    }[];
    awards?: {
        title?: string;
        date?: string;
        awarder?: string;
        summary?: string;
    }[];
    certificates?: {
        name?: string;
        date?: string;
        issuer?: string;
        url?: string;
    }[];
    publications?: {
        name?: string;
        publisher?: string;
        releaseDate?: string;
        url?: string;
        summary?: string;
    }[];
    skills?: {
        name?: string;
        level?: string;
        keywords?: string[];
    }[];
    languages?: {
        language?: string;
        fluency?: string;
    }[];
    interests?: {
        name?: string;
        keywords?: string[];
    }[];
    references?: {
        name?: string;
        reference?: string;
    }[];
    projects?: {
        name?: string;
        startDate?: string;
        endDate?: string;
        description?: string;
        highlights?: string[];
        url?: string;
    }[];
}

const jsonResumeBasics: DataSchema = new DataSchema("json-resume-basics", [
    {
        name: "name",
        data_type: { tag: "String" }
    },
    {
        name: "email",
        data_type: { tag: "String" }
    },
    {
        name: "phone",
        data_type: { tag: "String" }
    }
], []);

const jsonResumeBasicsLayout: LayoutSchema = new LayoutSchema(
    "json-resume-basics",
    "json-resume-basics",
    new SectionLayout(
        new Stack([
            new SectionLayout(Elem.default_().as_ref().with_item("name").with_width(Width.percent(100)).with_alignment("Center").with_font(new Font("Exo", 20, "Bold", "Normal", "Local"))),
            new SectionLayout(Row.default_().with_elements([
                new SectionLayout(Elem.default_().as_ref().with_item("email").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50))),
                new SectionLayout(Elem.default_().as_ref().with_item("phone").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50)).with_alignment("Right"))
            ]))
        ])
    ),
    new SectionLayout(
        new Stack([])
    )
);

const jsonResumeWork: DataSchema = new DataSchema("json-resume-work",
    [],
    [
        // name?: string;
        { name: 'name', data_type: { tag: 'String' } },
        // position?: string;
        { name: 'position', data_type: { tag: 'String' } },
        // url?: string;
        { name: 'url', data_type: { tag: 'String' } },
        // startDate?: string;
        { name: 'startDate', data_type: { tag: 'Date' } },
        // endDate?: string;
        { name: 'endDate', data_type: { tag: 'Date' } },
        // summary?: string;
        { name: 'summary', data_type: { tag: 'String' } },
        // highlights?: string[];
        { name: 'highlights', data_type: { tag: 'List', value: { tag: 'String' } } }
    ]
)

const jsonResumeWorkLayout: LayoutSchema = new LayoutSchema("json-resume-work", "json-resume-work",
    new SectionLayout(Elem.default_().with_item("Work").with_width(Width.percent(100)).with_alignment("Center").with_font(new Font("Exo", 16, "Bold", "Normal", "Local"))),
    new SectionLayout(
        new Stack([
            new SectionLayout(Elem.default_().as_ref().with_item("name").with_width(Width.percent(100)).with_font(new Font("Exo", 14, "Bold", "Normal", "Local"))),
            new SectionLayout(Row.default_().with_width(Width.percent(100)).with_elements([
                new SectionLayout(Elem.default_().as_ref().with_item("position").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50))),
                new SectionLayout(Row.default_().with_width(Width.percent(50)).with_alignment("Right").with_elements([
                    new SectionLayout(Elem.default_().as_ref().with_item("startDate").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_alignment("Left")),
                    new SectionLayout(Elem.default_().with_item("-").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_alignment("Center")),
                    new SectionLayout(Elem.default_().as_ref().with_item("endDate").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_alignment("Right"))
                ]))
            ])),
            new SectionLayout(Elem.default_().as_ref().with_item("summary").with_width(Width.percent(100)).with_font(new Font("Exo", 12, "Medium", "Normal", "Local"))),
        ]
        )
    )
)

const jsonResumeVolunteer: DataSchema = new DataSchema("json-resume-volunteer",
    [],
    [
        // organization?: string;
        { name: 'organization', data_type: { tag: 'String' } },
        // position?: string;
        { name: 'position', data_type: { tag: 'String' } },
        // url?: string;
        { name: 'url', data_type: { tag: 'String' } },
        // startDate?: string;
        { name: 'startDate', data_type: { tag: 'Date' } },
        // endDate?: string;
        { name: 'endDate', data_type: { tag: 'Date' } },
        // summary?: string;
        { name: 'summary', data_type: { tag: 'String' } },
        // highlights?: string[];
        { name: 'highlights', data_type: { tag: 'List', value: { tag: 'String' } } }
    ]
)

const jsonResumeVolunteerLayout: LayoutSchema = new LayoutSchema("json-resume-volunteer", "json-resume-volunteer",
    new SectionLayout(Elem.default_().with_item("Volunteer").with_width(Width.percent(100)).with_alignment("Center").with_font(new Font("Exo", 16, "Bold", "Normal", "Local"))),
    new SectionLayout(
        new Stack([
            new SectionLayout(Elem.default_().as_ref().with_item("organization").with_width(Width.percent(100)).with_font(new Font("Exo", 14, "Bold", "Normal", "Local"))),
            new SectionLayout(Row.default_().with_elements([
                new SectionLayout(Elem.default_().as_ref().with_item("position").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50))),
                new SectionLayout(Elem.default_().as_ref().with_item("startDate").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50)).with_alignment("Right"))
            ]))
        ])
    )
);

const jsonResumeEducation: DataSchema = new DataSchema("json-resume-education",
    [],
    [
        // institution?: string;
        { name: 'institution', data_type: { tag: 'String' } },
        // url?: string;
        { name: 'url', data_type: { tag: 'String' } },
        // area?: string;
        { name: 'area', data_type: { tag: 'String' } },
        // studyType?: string;
        { name: 'studyType', data_type: { tag: 'String' } },
        // startDate?: string;
        { name: 'startDate', data_type: { tag: 'Date' } },
        // endDate?: string;
        { name: 'endDate', data_type: { tag: 'Date' } },
        // score?: string;
        { name: 'score', data_type: { tag: 'String' } },
        // courses?: string[];
        { name: 'courses', data_type: { tag: 'List', value: { tag: 'String' } } }
    ]
)

const jsonResumeEducationLayout = new LayoutSchema("json-resume-education", "json-resume-education",
    new SectionLayout(Elem.default_().with_item("Education").with_width(Width.percent(100)).with_alignment("Center").with_font(new Font("Exo", 16, "Bold", "Normal", "Local"))),
    new SectionLayout(
        new Stack([
            new SectionLayout(Elem.default_().as_ref().with_item("institution").with_width(Width.percent(100)).with_font(new Font("Exo", 14, "Bold", "Normal", "Local"))),
            new SectionLayout(Row.default_().with_elements([
                new SectionLayout(Elem.default_().as_ref().with_item("area").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50))),
                new SectionLayout(Elem.default_().as_ref().with_item("studyType").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50)).with_alignment("Right"))
            ])
            )
        ])
    )
);

const jsonResumeAwards: DataSchema = new DataSchema("json-resume-awards",
    [],
    [
        // title?: string;
        { name: 'title', data_type: { tag: 'String' } },
        // date?: string;
        { name: 'date', data_type: { tag: 'Date' } },
        // awarder?: string;
        { name: 'awarder', data_type: { tag: 'String' } },
        // summary?: string;
        { name: 'summary', data_type: { tag: 'String' } }
    ]
)

const jsonResumeAwardsLayout = new LayoutSchema("json-resume-awards", "json-resume-awards",
    new SectionLayout(Elem.default_().with_item("Awards").with_width(Width.percent(100)).with_alignment("Center").with_font(new Font("Exo", 16, "Bold", "Normal", "Local"))),
    new SectionLayout(
        new Stack([
            new SectionLayout(Elem.default_().as_ref().with_item("title").with_width(Width.percent(100)).with_font(new Font("Exo", 14, "Bold", "Normal", "Local"))),
            new SectionLayout(Row.default_().with_elements([
                new SectionLayout(Elem.default_().as_ref().with_item("date").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50))),
                new SectionLayout(Elem.default_().as_ref().with_item("awarder").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50)).with_alignment("Right"))
            ])
            )
        ])
    )
);

const jsonResumeCertificates: DataSchema = new DataSchema("json-resume-certificates",
    [],
    [
        // name?: string;
        { name: 'name', data_type: { tag: 'String' } },
        // date?: string;
        { name: 'date', data_type: { tag: 'Date' } },
        // issuer?: string;
        { name: 'issuer', data_type: { tag: 'String' } },
        // url?: string;
        { name: 'url', data_type: { tag: 'String' } }
    ]
)

const jsonResumeCertificatesLayout = new LayoutSchema("json-resume-certificates", "json-resume-certificates",
    new SectionLayout(Elem.default_().with_item("Certificates").with_width(Width.percent(100)).with_alignment("Center").with_font(new Font("Exo", 16, "Bold", "Normal", "Local"))),
    new SectionLayout(
        new Stack([
            new SectionLayout(Elem.default_().as_ref().with_item("name").with_width(Width.percent(100)).with_font(new Font("Exo", 14, "Bold", "Normal", "Local"))),
            new SectionLayout(Row.default_().with_elements([
                new SectionLayout(Elem.default_().as_ref().with_item("date").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50))),
                new SectionLayout(Elem.default_().as_ref().with_item("issuer").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50)).with_alignment("Right"))
            ])
            )
        ])
    )
);

const jsonResumePublications: DataSchema = new DataSchema("json-resume-publications",
    [],
    [
        // name?: string;
        { name: 'name', data_type: { tag: 'String' } },
        // publisher?: string;
        { name: 'publisher', data_type: { tag: 'String' } },
        // releaseDate?: string;
        { name: 'releaseDate', data_type: { tag: 'Date' } },
        // url?: string;
        { name: 'url', data_type: { tag: 'String' } },
        // summary?: string;
        { name: 'summary', data_type: { tag: 'String' } }
    ]
)

const jsonResumePublicationsLayout = new LayoutSchema("json-resume-publications", "json-resume-publications",
    new SectionLayout(Elem.default_().with_item("Publications").with_width(Width.percent(100)).with_alignment("Center").with_font(new Font("Exo", 16, "Bold", "Normal", "Local"))),
    new SectionLayout(
        new Stack([
            new SectionLayout(Elem.default_().as_ref().with_item("name").with_width(Width.percent(100)).with_font(new Font("Exo", 14, "Bold", "Normal", "Local"))),
            new SectionLayout(Row.default_().with_elements([
                new SectionLayout(Elem.default_().as_ref().with_item("publisher").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50))),
                new SectionLayout(Elem.default_().as_ref().with_item("releaseDate").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50)).with_alignment("Right"))
            ])
            )
        ])
    )
);

const jsonResumeSkills: DataSchema = new DataSchema("json-resume-skills",
    [],
    [
        // name?: string;
        { name: 'name', data_type: { tag: 'String' } },
        // level?: string;
        { name: 'level', data_type: { tag: 'String' } },
        // keywords?: string[];
        { name: 'keywords', data_type: { tag: 'List', value: { tag: 'String' } } }
    ]
)

const jsonResumeSkillsLayout = new LayoutSchema("json-resume-skills", "json-resume-skills",
    new SectionLayout(Elem.default_().with_item("Skills").with_width(Width.percent(100)).with_alignment("Center").with_font(new Font("Exo", 16, "Bold", "Normal", "Local"))),
    new SectionLayout(
        new Stack([
            new SectionLayout(Elem.default_().as_ref().with_item("name").with_width(Width.percent(100)).with_font(new Font("Exo", 14, "Bold", "Normal", "Local"))),
            new SectionLayout(Row.default_().with_elements([
                new SectionLayout(Elem.default_().as_ref().with_item("level").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50))),
                new SectionLayout(Elem.default_().as_ref().with_item("keywords").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50)).with_alignment("Right"))
            ])
            )
        ])
    )
);

const jsonResumeLanguages: DataSchema = new DataSchema("json-resume-languages",
    [],
    [
        // language?: string;
        { name: 'language', data_type: { tag: 'String' } },
        // fluency?: string;
        { name: 'fluency', data_type: { tag: 'String' } }
    ]
)

const jsonResumeLanguagesLayout = new LayoutSchema("json-resume-languages", "json-resume-languages",
    new SectionLayout(Elem.default_().with_item("Languages").with_width(Width.percent(100)).with_alignment("Center").with_font(new Font("Exo", 16, "Bold", "Normal", "Local"))),
    new SectionLayout(
        new Stack([
            new SectionLayout(Elem.default_().as_ref().with_item("language").with_width(Width.percent(100)).with_font(new Font("Exo", 14, "Bold", "Normal", "Local"))),
            new SectionLayout(Row.default_().with_elements([
                new SectionLayout(Elem.default_().as_ref().with_item("fluency").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50)))
            ])
            )
        ])
    )
);

const jsonResumeInterests: DataSchema = new DataSchema("json-resume-interests",
    [],
    [
        // name?: string;
        { name: 'name', data_type: { tag: 'String' } },
        // keywords?: string[];
        { name: 'keywords', data_type: { tag: 'List', value: { tag: 'String' } } }
    ]
)

const jsonResumeInterestsLayout = new LayoutSchema("json-resume-interests", "json-resume-interests",
    new SectionLayout(Elem.default_().with_item("Interests").with_width(Width.percent(100)).with_alignment("Center").with_font(new Font("Exo", 16, "Bold", "Normal", "Local"))),
    new SectionLayout(
        new Stack([
            new SectionLayout(Elem.default_().as_ref().with_item("name").with_width(Width.percent(100)).with_font(new Font("Exo", 14, "Bold", "Normal", "Local"))),
            new SectionLayout(Row.default_().with_elements([
                new SectionLayout(Elem.default_().as_ref().with_item("keywords").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(100)))
            ])
            )
        ])
    )
);

const jsonResumeReferences: DataSchema = new DataSchema("json-resume-references",
    [],
    [
        // name?: string;
        { name: 'name', data_type: { tag: 'String' } },
        // reference?: string;
        { name: 'reference', data_type: { tag: 'String' } }
    ]
)

const jsonResumeReferencesLayout = new LayoutSchema("json-resume-references", "json-resume-references",
    new SectionLayout(Elem.default_().with_item("References").with_width(Width.percent(100)).with_alignment("Center").with_font(new Font("Exo", 16, "Bold", "Normal", "Local"))),
    new SectionLayout(
        new Stack([
            new SectionLayout(Elem.default_().as_ref().with_item("name").with_width(Width.percent(100)).with_font(new Font("Exo", 14, "Bold", "Normal", "Local"))),
            new SectionLayout(Row.default_().with_elements([
                new SectionLayout(Elem.default_().as_ref().with_item("reference").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(100)))
            ])
            )
        ])
    )
);

const jsonResumeProjects: DataSchema = new DataSchema("json-resume-projects",
    [],
    [
        // name?: string;
        { name: 'name', data_type: { tag: 'String' } },
        // startDate?: string;
        { name: 'startDate', data_type: { tag: 'Date' } },
        // endDate?: string;
        { name: 'endDate', data_type: { tag: 'Date' } },
        // description?: string;
        { name: 'description', data_type: { tag: 'String' } },
        // highlights?: string[];
        { name: 'highlights', data_type: { tag: 'List', value: { tag: 'String' } } },
        // url?: string;
        { name: 'url', data_type: { tag: 'String' } }
    ]
)

const jsonResumeProjectsLayout = new LayoutSchema("json-resume-projects", "json-resume-projects",
    new SectionLayout(Elem.default_().with_item("Projects").with_width(Width.percent(100)).with_alignment("Center").with_font(new Font("Exo", 16, "Bold", "Normal", "Local"))),
    new SectionLayout(
        new Stack([
            new SectionLayout(Elem.default_().as_ref().with_item("name").with_width(Width.percent(100)).with_font(new Font("Exo", 14, "Bold", "Normal", "Local"))),
            new SectionLayout(Row.default_().with_elements([
                new SectionLayout(Elem.default_().as_ref().with_item("startDate").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50))),
                new SectionLayout(Elem.default_().as_ref().with_item("endDate").with_font(new Font("Exo", 12, "Medium", "Normal", "Local")).with_width(Width.percent(50)).with_alignment("Right"))
            ])),
        ])
    )
)


const get = (obj: any, key: string): ItemContent => {
    return obj[key] ? { tag: "String", value: obj[key] } : { tag: "String", value: "" };
}


const randomId = () => {
    return Math.random().toString(36).substring(7);
}

export const convert = (json: JsonResume): Resume => {
    const storage = new LocalStorage();
    storage.save_data_schema(jsonResumeBasics);
    storage.save_layout_schema(jsonResumeBasicsLayout);
    storage.save_data_schema(jsonResumeWork);
    storage.save_layout_schema(jsonResumeWorkLayout);
    storage.save_data_schema(jsonResumeVolunteer);
    storage.save_layout_schema(jsonResumeVolunteerLayout);
    storage.save_data_schema(jsonResumeEducation);
    storage.save_layout_schema(jsonResumeEducationLayout);
    storage.save_data_schema(jsonResumeAwards);
    storage.save_layout_schema(jsonResumeAwardsLayout);
    storage.save_data_schema(jsonResumeCertificates);
    storage.save_layout_schema(jsonResumeCertificatesLayout);
    storage.save_data_schema(jsonResumePublications);
    storage.save_layout_schema(jsonResumePublicationsLayout);
    storage.save_data_schema(jsonResumeSkills);
    storage.save_layout_schema(jsonResumeSkillsLayout);
    storage.save_data_schema(jsonResumeLanguages);
    storage.save_layout_schema(jsonResumeLanguagesLayout);
    storage.save_data_schema(jsonResumeInterests);
    storage.save_layout_schema(jsonResumeInterestsLayout);
    storage.save_data_schema(jsonResumeReferences);
    storage.save_layout_schema(jsonResumeReferencesLayout);
    storage.save_data_schema(jsonResumeProjects);
    storage.save_layout_schema(jsonResumeProjectsLayout);



    const basics: ResumeSection = new ResumeSection();
    basics.section_name = "Basics";
    basics.data_schema = "json-resume-basics"
    basics.layout_schema = "json-resume-basics"
    basics.data = new Map([
        ["name", get(json.basics, "name")],
        ["email", get(json.basics, "email")],
        ["phone", get(json.basics, "phone")]
    ]);

    const work: ResumeSection = new ResumeSection();
    work.section_name = "Work Experience";
    work.data_schema = "json-resume-work";
    work.layout_schema = "json-resume-work";
    json.work?.map((w) => new Map([
        ["name", get(w, "name")],
        ["position", get(w, "position")],
        ["url", get(w, "url")],
        ["startDate", get(w, "startDate")],
        ["endDate", get(w, "endDate")],
        ["summary", get(w, "summary")],
        ["highlights", { tag: "List", value: (w.highlights?.map((h: string) => ({ tag: "String", value: h })) || []) } as ItemContent]
    ])
    ).forEach((w) => {
        work.items.push({
            id: randomId(),
            fields: w
        });
    });

    const volunteer: ResumeSection = new ResumeSection();
    volunteer.section_name = "Volunteer";
    volunteer.data_schema = "json-resume-volunteer";
    volunteer.layout_schema = "json-resume-volunteer";
    json.volunteer?.map((v) => new Map([
        ["organization", get(v, "organization")],
        ["position", get(v, "position")],
        ["url", get(v, "url")],
        ["startDate", get(v, "startDate")],
        ["endDate", get(v, "endDate")],
        ["summary", get(v, "summary")],
        ["highlights", { tag: "List", value: (v.highlights?.map((h: string) => ({ tag: "String", value: h })) || []) } as ItemContent]
    ])
    ).forEach((v) => {
        volunteer.items.push({
            id: randomId(),
            fields: v
        });
    });

    const education: ResumeSection = new ResumeSection();
    education.section_name = "Education";
    education.data_schema = "json-resume-education";
    education.layout_schema = "json-resume-education";
    json.education?.map((e) => new Map([
        ["institution", get(e, "institution")],
        ["url", get(e, "url")],
        ["area", get(e, "area")],
        ["studyType", get(e, "studyType")],
        ["startDate", get(e, "startDate")],
        ["endDate", get(e, "endDate")],
        ["score", get(e, "score")],
        ["courses", { tag: "List", value: (e.courses?.map((c: string) => ({ tag: "String", value: c })) || []) } as ItemContent]
    ])
    ).forEach((e) => {
        education.items.push({
            id: randomId(),
            fields: e
        });
    });

    const awards: ResumeSection = new ResumeSection();
    awards.section_name = "Awards";
    awards.data_schema = "json-resume-awards";
    awards.layout_schema = "json-resume-awards";
    json.awards?.map((a) => new Map([
        ["title", get(a, "title")],
        ["date", get(a, "date")],
        ["awarder", get(a, "awarder")],
        ["summary", get(a, "summary")]
    ])
    ).forEach((a) => {
        awards.items.push({
            id: randomId(),
            fields: a
        });
    });

    const certificates: ResumeSection = new ResumeSection();
    certificates.section_name = "Certificates";
    certificates.data_schema = "json-resume-certificates";
    certificates.layout_schema = "json-resume-certificates";
    json.certificates?.map((c) => new Map([
        ["name", get(c, "name")],
        ["date", get(c, "date")],
        ["issuer", get(c, "issuer")],
        ["url", get(c, "url")]
    ])
    ).forEach((c) => {
        certificates.items.push({
            id: randomId(),
            fields: c
        });
    });

    const publications: ResumeSection = new ResumeSection();
    publications.section_name = "Publications";
    publications.data_schema = "json-resume-publications";
    publications.layout_schema = "json-resume-publications";
    json.publications?.map((p) => new Map([
        ["name", get(p, "name")],
        ["publisher", get(p, "publisher")],
        ["releaseDate", get(p, "releaseDate")],
        ["url", get(p, "url")],
        ["summary", get(p, "summary")]
    ])
    ).forEach((p) => {
        publications.items.push({
            id: randomId(),
            fields: p
        });
    });

    const skills: ResumeSection = new ResumeSection();
    skills.section_name = "Skills";
    skills.data_schema = "json-resume-skills";
    skills.layout_schema = "json-resume-skills";
    json.skills?.map((s) => new Map([
        ["name", get(s, "name")],
        ["level", get(s, "level")],
        ["keywords", { tag: "List", value: (s.keywords?.map((k: string) => ({ tag: "String", value: k })) || []) } as ItemContent]
    ])
    ).forEach((s) => {
        skills.items.push({
            id: randomId(),
            fields: s
        });
    });

    const languages: ResumeSection = new ResumeSection();
    languages.section_name = "Languages";
    languages.data_schema = "json-resume-languages";
    languages.layout_schema = "json-resume-languages";
    json.languages?.map((l) => new Map([
        ["language", get(l, "language")],
        ["fluency", get(l, "fluency")]
    ])
    ).forEach((l) => {
        languages.items.push({
            id: randomId(),
            fields: l
        });
    });

    const interests: ResumeSection = new ResumeSection();
    interests.section_name = "Interests";
    interests.data_schema = "json-resume-interests";
    interests.layout_schema = "json-resume-interests";
    json.interests?.map((i) => new Map([
        ["name", get(i, "name")],
        ["keywords", { tag: "List", value: (i.keywords?.map((k: string) => ({ tag: "String", value: k })) || []) } as ItemContent]
    ])
    ).forEach((i) => {
        interests.items.push({
            id: randomId(),
            fields: i
        });
    });

    const references: ResumeSection = new ResumeSection();
    references.section_name = "References";
    references.data_schema = "json-resume-references";
    references.layout_schema = "json-resume-references";
    json.references?.map((r) => new Map([
        ["name", get(r, "name")],
        ["reference", get(r, "reference")]
    ])
    ).forEach((r) => {
        references.items.push({
            id: randomId(),
            fields: r
        });
    });

    const projects: ResumeSection = new ResumeSection();
    projects.section_name = "Projects";
    projects.data_schema = "json-resume-projects";
    projects.layout_schema = "json-resume-projects";
    json.projects?.map((p) => new Map([
        ["name", get(p, "name")],
        ["startDate", get(p, "startDate")],
        ["endDate", get(p, "endDate")],
        ["description", get(p, "description")],
        ["highlights", { tag: "List", value: (p.highlights?.map((h: string) => ({ tag: "String", value: h })) || []) } as ItemContent],
        ["url", get(p, "url")]
    ])
    ).forEach((p) => {
        projects.items.push({
            id: randomId(),
            fields: p
        });
    });

    return new Resume("SingleColumnSchema", [
        basics,
        work,
        volunteer,
        education,
        awards,
        certificates,
        publications,
        skills,
        languages,
        interests,
        references,
        projects
    ]);
}
