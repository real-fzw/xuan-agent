# Source Policy

XuanAgent supports RAG, but the repository must not bundle copyrighted books or private study notes without permission.

## Allowed In This Repository

- Original explanations written by contributors.
- Public-domain classics where the specific edition is legally reusable.
- Metadata about sources, such as title, author, school, topic tags, and bibliographic notes.
- Short quotations within applicable legal limits, only when necessary and properly attributed.

## Not Allowed In This Repository

- Full scans, OCR dumps, or copied chapters of modern copyrighted books.
- Paid course transcripts or private class notes.
- Large paraphrases that reconstruct a copyrighted source.

## Local Private Corpora

Users can ingest legally owned materials into `corpus/private/` or `data/private/`. These paths are ignored by Git.

The ingestion pipeline should store:

- source title
- author or teacher
- edition or provenance
- usage scope
- chunk id
- page or section locator
- topic tags

## About Ni Haixia Materials

Ni Haixia's Zi Wei Dou Shu materials can inspire the system design if the user owns them, but this repository should not ship those book contents. The intended workflow is:

1. User places legally owned text files in `corpus/private/ni-haixia/`.
2. `tools/ingest` builds a local index.
3. Generated reports cite local chunk ids and user-owned source metadata.
4. No private corpus files are committed to GitHub.
