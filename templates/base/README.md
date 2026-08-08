# {{projectName}}

{{description}}

## Operating Model

- Humans own architecture, scope, final UI/UX direction, review, and release decisions.
- Codex helps with implementation, repository analysis, and controlled documentation updates.
- This baseline is architecture-first and review-gated: use small implementation batches and review every non-trivial change before moving on.
- Durable context lives in `.project/overview.md`, `.project/architecture.md`, `.project/constraints.md`, `.project/decisions.md`, `.project/features/index.md`, and `.project/review-checklist.md`.
- When the project has UI, treat `.project/design/` as the source of truth. Without a precise design, a functional provisional UI is allowed for validation but requires a final UI refinement task before feature completion.
- Coding conventions live in `CODE_STYLE.md`.
- Project name and version live in the project manifest.
- New repositories use `src/` for application code and `tests/` for automated tests by default.
- Existing repositories should keep their established layout when this baseline is added via alignment.

## Delivery Workflow

1. Capture or refine the system shape in `.project/overview.md`, `.project/architecture.md`, and `.project/constraints.md`.
2. Define one feature brief in `.project/features/`, resolve open decisions, obtain and record approval for one current batch, set it to `ready`, and run `project-kit feature check --slug <feature-slug>` before implementation starts.
3. Add or update `.project/design/` assets and notes when UI behavior or layout matters.
4. Ask Codex to implement the one ready, risk-focused batch named in the brief.
5. Run automated checks, exercise the real local user journey, and review the resulting diff against `.project/review-checklist.md` before the next batch.

## Stack

{{stackSummary}}

## Main Directories

{{directorySummary}}
