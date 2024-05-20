# Tail

This is the monorepo for Tail, a typed and structured document editor. Tail
builds on the idea of documents with nested substructures, and provides a way to
derive editors based on a given document template.

This repository currently hosts two main subprojects:

1. Tail, the research.
2. CVDL, an initial prototype for Tail specialized in CV documents.

The research is still in its infancy. You can find the current state of the research at [`docs/tail.pdf`](/docs/tail.pdf).

The CVDL prototype encompasses a rendering engine for documents, as well as an editor for editing documents.

There are two implementations of the rendering engine:

1. Typescript Implementation: [`cvdl-ts`](/cvdl-ts)
2. Rust Implementation: [`cvdl-rs`](/cvdl-rs)

Currently, I focus on the Typescript implementation as I use it for the editor, which resides in the [`cvdl-editor`](/cvdl-editor) directory.