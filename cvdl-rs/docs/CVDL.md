# CVDL: CV Description Language

CVDL is a language for creating CVs and resumes. This repository contains a compiler, as well as some informal specifications of the language design.

## Introduction

CVDL aims to fill in a gap within the current status of CV/Resume builder tools. To describe this gap, let us start by defining a set of
CV builder tools.

1. WYSIWYG(What You See Is What You Get) Editors
   1. Word Processors: Word, Pages, Google Docs...
   2. Design Interfaces: Canva, Figma, Illustrator...
2. Markup Languages: Latex, Typst
3. Closed Source CV Builder Vendors: Kickresume, Zety, Resume.io...
4. JsonResume

Each builder type has its pros and cons. We view these pros and cons on several axes.

1. Exportability: The ability to export your data out of the system to use it in a different one.
2. Vendor-Level-Portability: Even though the data is exportable, sometimes it is unusable in other vendors. Portability
    refers to the capability of switching vendors easily.
3. Data-View Independence: WYSIWYG editors tightly couple the information you put on your document with how you
    people view it. This prevents switching between different views of the same information, as well as exporting
    your data.
4. Customizability: While some options allow for customizing potentially every part of your document, some only
    allow a limited set of configurations.
5. Reusable Templates: When they have data-view independence, vendors usually also have various templates you can switch
    between.
6. Extensibility: While some vendors allow you to extend your document with arbitrary types of data/information, some
    limit it.

Now, for each vendor type, we will assess them on these axes.

1. Word Processors: Word, Pages, Google Docs...  
    *Exportability:* **No.** As they don't have data-view independence, you cannot export your data but you can export your whole document
    together with its style.  
    *Vendor-Level-Portability:* **Limited.** some documents that are compatible between vendors, but usually you have distortions
    when switching.  
    *Data-View Independence:* **No.**  
    *Customizability:* **Yes.**  
    *Reusable Templates:* **No.** This is again due to data-view independence, you simply cannot move between templates easily.  
    *Extensibility:* **Yes.**
2. Design Interfaces: Canva, Figma, Illustrator...  
    *Exportability:* **No.** As they don't have data-view independence, you cannot export your data but you can export your whole document
    together with its style.  
    *Vendor-Level-Portability:* **Limited.** some documents that are compatible between vendors, but sometimes you have distortions
    when switching.  
    *Data-View Independence:* **No.**  
    *Customizability:* **Yes.**  
    *Reusable Templates:* **No.** This is again due to data-view independence, you simply cannot move between templates easily.  
    *Extensibility:* **Yes.**
3. Markup Languages: Latex, Typst  
    *Exportability:* **Limited.** Even though you might have some structure on your markup definition as you are using previously
    defined libraries, it usually involves manual work to retrieve your data.  
    *Vendor-Level-Portability:* **Limited.** You have in-vendor portability in the sense that you can work on your local computer as well as Overleaf, but you cannot switch from Latex to Typst easily.  
    *Data-View Independence:* **Limited.** Due to custom commands, some templates may have a considerable amount of separation between data and view. Yet this is dependent on the template, as well as the writer.  
    *Customizability:* **Yes.**  
    *Reusable Templates:* **Almost never.** Almost every template will have its own syntax and constructs, so it is very hard to switch
    seamlessly between different templates.  
    *Extensibility:* **Yes.**  
4. Closed Source CV Builder Vendors: Kickresume, Zety, Resume.io...  
    *Exportability:* **Rarely.** Closed-source vendors try to lock you in. They usually do not allow you to export your data.  
    *Vendor-Level-Portability:* **No.**  
    *Data-View Independence:* **Yes.** These vendors allow you to separately control your data and your view.  
    *Customizability:* **Limited.** Vendors may allow for custom sections, as well as limited configurations, but you are not as free as
    using the Word editor.  
    *Reusable Templates:* **Yes.**  
    *Extensibility:* **Limited.** Vendors may allow for custom sections, as well as limited configurations, but you are not as free as
    using the Word editor.
5. JsonResume  
    JsonResume is an open-source standard that defines a Json Schema for resumes. It has several vendors built on top of it,
    as well as a large community supporting it. Looking at JsonResume, it ticks a lot of the boxes.
    *Exportability:* **Yes.**  
    *Vendor-Level-Portability:* **Yes.**  
    *Data-View Independence:* **Yes.**  
    *Customizability:* **Limited.**  
    *Reusable Templates:* **Yes.**  
    *Extensibility:* **Limited.**  
    My biggest problem with JsonResume is that (as far as I understand) it locks you into the defined schema, hence you wouldn't
    be able to easily add custom sections or do anything custom in your designs.

This project aims to become a better JsonResume by keeping the good parts that lead to very good portability and adding
the capability to customize your designs and contents. Let us now talk about how we plan to do that.

![Pipeline](image.png)

Above, you see a mapping from some data(a set of sections) into a document. We see several
concepts in the diagram, namely **Data, Section, Data Schema, Layout Schema, and Document**.

1. **Data:** Data is information that the user aims to present to the reader of the document.
2. **Document:** The document is the end product of the system. Data, combined with data and layout schemas, is compiled into the document. The document may be a text, markdown or latex file; an image file such as a PNG or JPEG, an HTML page or a PDF document.
3. **Section:** In CVDL, we have several layers of hierarchy. A section is a top-level construct that defines the highest layer of hierarchy on a document.
4. **Data Schema:** A data schema defines the types of items in a section.
5. **Layout Schema:** A layout schema defines a mapping from some set of information into how they are translated into the document.

As a proof of concept, the first backend layout we support is markdown. Below, you can see how a **section** conforming to a **data schema** is translated into **markdown** using a **layout schema**.

1. Data Schema  

    ```json
    {
        "schema-name": "Projects",
        "header-schema": [
            { "name": "Title", "type": "String" }
        ],
        "item-schema": [
            { "name": "Title", "type": "String" },
            { "name": "Subtitle", "type": "String" },
            { "name": "Skills", "type": "List<String>" },
            { "name": "Date-Started", "type": "Date" },
            { "name": "Date-Finished", "type": "Date | String" },
            { "name": "Location", "type": "String" },
            { "name": "Text", "type": "MarkdownString" }
        ]
    }
    ```

2. Section Data

    ```json
    {
        "section-name": "Projects",
        "data-schema": "Projects",
        "layout-schema": "Projects",
        "data": {
            "Title": "Projects"
        },
        "items": [
            {
                "Title": "Enhancing Coq Extraction",
                "Subtitle": "Graduate Level Research",
                "Text": "Designing and implementing a set of tooling around Coq Extraction capabilities for improving user experience for working with hybrid Coq-OCaml code bases.",
                "Skills": ["Coq", "OCaml", "Extraction"],
                "Date-Started": "March 2023",
                "Date-Finished": "Present"
            }
        ]
    }
    ```

3. Layout Schema

    ```json
    {
        "schema-name": "Projects",
        "header-layout-schema": "# {Title}\n\n",
        "item-layout-schema": "**{Title}**  \n— {Subtitle} \\hfill {Date-Started} - {Date-Finished}  \n{Text}  \n{Skills}\n\n"
    }
    ```

4. Markdown Output

    ```markdown
    **Enhancing Coq Extraction**  
    — Graduate Level Research \hfill March 2023 - Present  
    Designing and implementing a set of tooling around Coq Extraction capabilities for improving user experience for working with hybrid Coq-OCaml code bases.  
    Coq, OCaml, Extraction
    ```

What happens behind the curtain? A data schema defines a set of fields and their types. These types
might be `String, MarkdownString, List<Type>, Type | Type(or), Date`. This list will be expanded as
we continue working on the project. Types have validator/serializer/deserializer functions. For example,
when `Date-Started` has a piece of data that is not decodable as a valid date, the user will be prompted
with an error or a warning.

For now, you may see we are directly using Markdown in the layout schema, this will not be the case. We will
define a simple language for defining alignment/justification/positioning of data, and implement it for each backend type. This way, users will be able to easily switch between different layouts and compile their documents for different backends.

## Where Are We?

So, this was a veeeery long introduction to the project. You may ask what is up with the current implementation. Currently, I am focusing on solidifying the data schema definitions and how resume data is linked to them. My first milestone is to be able to compile my CV by compiling the produced markdown with Pandoc into PDF. After I have a data model that handles that, I will continue with the future plans.

## Future Plans

My high-level plans are;

- Design the initial version of the layout language.
- Implement the PDF backend.
- Create a Terminal UI for manipulating documents.
- Add JsonResume compatibility
- Create a human-readable language for defining information. Potentially TOML.
  
Of course, in the meantime I'll continue refining my data models.

## Contributions

If you have any questions, please open up an issue. I will also try to add some issues for anyone interested
in contributing. You may also write versions of your CV's by adding new schemas, which would allow for really nice tips on what is missing.
