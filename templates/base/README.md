# {{projectName}}

{{description}}

## Working model

- Humans own scope, acceptance criteria, and decisions.
- Agents help with implementation and repository understanding.
- This baseline is designed for an AI-assisted workflow with reviewable context, not for unreviewed vibe-coding.
- Durable context lives in `.project/context/overview.md`, `.project/context/architecture.md`, and `.project/context/decisions.md`.
- Coding conventions live in `.project/CODE_STYLE.md`.
- Project name and version live in the project manifest.
- New repositories use `src/` for application code and `tests/` for automated tests by default.
- Existing repositories should keep their established layout when this baseline is added via alignment.
- Feature specs are created only when a change is ambiguous or risky.

## Testing strategy

- Core functionality is listed in `.project/context/overview.md`.
- Changes that affect core functionality should be protected by unit tests.
- Not every change needs new tests; prefer high-signal tests for high-risk behavior.

## Stack

{{stackSummary}}

## Main directories

{{directorySummary}}
