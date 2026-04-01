# {{projectName}}

{{description}}

## Working model

- Humans own scope, acceptance criteria, and decisions.
- Agents help with implementation and repository understanding.
- This baseline is designed for an AI-assisted workflow with reviewable context, not for unreviewed vibe-coding.
- Durable context lives in `.project/overview.md`, `.project/features.md`, `.project/architecture.md`, and `.project/decisions.md`.
- Coding conventions live in `CODE_STYLE.md`.
- Project name and version live in the project manifest.
- New repositories use `src/` for application code and `tests/` for automated tests by default.
- Existing repositories should keep their established layout when this baseline is added via alignment.
- High-level project features live in `.project/features.md`.

## Testing strategy

- Core functionality is listed in `.project/overview.md`.
- Changes that affect core functionality should be protected by unit tests.
- Not every change needs new tests; prefer high-signal tests for high-risk behavior.

## Stack

{{stackSummary}}

## Main directories

{{directorySummary}}
