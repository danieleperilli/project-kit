# Contributing

## Working style

- Keep changes focused and reviewable.
- Use AI assistance to accelerate delivery, not to bypass repository understanding or review.
- Prefer updating existing files over adding new abstractions.
- Do not duplicate code contracts or implementation details in documentation.
- Open a pull request for every code change. Do not merge new code directly into the default branch.
- Name branches using lowercase initials plus a kebab-case feature slug: `ab/new-feature`.

## Before editing

1. Read `README.md`.
2. Read `AGENTS.md`.
3. Read `CHANGELOG.md`.
4. Read `CODE_STYLE.md`.
5. Read `.project/overview.md`.
6. Read `.project/features.md`.
7. Read `.project/architecture.md`.
8. Read `.project/decisions.md`.

## Documentation updates

- Update durable context only when repository understanding materially changes.
- Add a dated note to `.project/decisions.md` when a decision becomes worth preserving.
- Keep the `Core Functionality` section in `.project/overview.md` up to date and use it as the reference for unit test coverage.
- Create or update a feature spec only when ambiguity, risk, or review complexity justifies it.
- Add a new entry to `CHANGELOG.md` for every meaningful change included in a pull request.
- Add product-facing changes under the `Unreleased` release sections.
- Add agent-maintained or implementation-oriented notes under `Unreleased > Codex Log`, even when the project version does not change.
- Prefer repository tooling and config over project style guides when they disagree.

## Testing

- Do not add tests for every change by default.
- Add or update unit tests when a change affects a behavior listed under `Core Functionality` in `.project/overview.md`.
- Prefer high-signal tests for critical behavior over exhaustive low-value coverage.
- For new repositories, place automated tests under `tests/` unless the repository already uses a different convention.

## Versioning

- Follow Semantic Versioning: `MAJOR.MINOR.PATCH`.
- Increase `MAJOR` for breaking changes.
- Increase `MINOR` for backward-compatible features.
- Increase `PATCH` for backward-compatible fixes.
- Do not bump the project version for every merged pull request.
- When preparing a release, move the relevant `Unreleased` entries into a versioned section using the format `## [x.y.z] - YYYY-MM-DD`.
- Keep the version stored in the project manifest aligned with the latest released version.
