# {{projectName}}

{{description}}

## Operating Model

- Humans own architecture, scope, UI/UX decisions, review, and release decisions.
- Codex helps with implementation, repository analysis, and controlled documentation updates.
- This baseline is architecture-first and review-gated: use small implementation batches and review every non-trivial change before moving on.
- Durable context lives in `.project/overview.md`, `.project/architecture.md`, `.project/constraints.md`, `.project/decisions.md`, `.project/features/index.md`, and `.project/review-checklist.md`.
- When the project has UI, treat `.project/design/` as the source of truth. Mockups, annotated assets, and flow notes are human-owned inputs that Codex should implement rather than invent.
- Coding conventions live in `CODE_STYLE.md`.
- Project name and version live in the project manifest.
- New repositories use `src/` for application code and `tests/` for automated tests by default.
- Existing repositories should keep their established layout when this baseline is added via alignment.

## Delivery Workflow

1. Capture or refine the system shape in `.project/overview.md`, `.project/architecture.md`, and `.project/constraints.md`.
2. Define one feature brief in `.project/features/` before implementation starts.
3. Add or update `.project/design/` assets and notes when UI behavior or layout matters.
4. Ask Codex to implement one small, reviewable batch at a time.
5. Review the resulting diff against `.project/review-checklist.md` before the next batch.

## Stack

{{stackSummary}}

## Main Directories

{{directorySummary}}
