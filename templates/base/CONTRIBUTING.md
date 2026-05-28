# Contributing

## Working Style

- Keep changes focused and reviewable.
- Use Codex to accelerate implementation, not to bypass architecture or human review.
- Prefer updating existing files over adding new abstractions.
- Do not duplicate contracts, schemas, routes, or implementation structure in documentation.
- Open a pull request for every code change. Do not merge new code directly into the default branch.
- Name branches using lowercase initials plus a kebab-case feature slug: `ab/new-feature`.

## Before Editing

1. Read `README.md`.
2. Read `AGENTS.md`.
3. Read `CHANGELOG.md`.
4. Read `CODE_STYLE.md`.
5. Read `.project/overview.md`.
6. Read `.project/architecture.md`.
7. Read `.project/constraints.md`.
8. Read `.project/features/index.md`.
9. Read the relevant `.project/features/*.md` files for the change.
10. Read `.project/decisions.md`.
11. Read `.project/review-checklist.md`.
12. Read `.project/design/README.md`, `flows.md`, and `sources.md` when UI context exists.

## Delivery Workflow

1. Update durable context only when project understanding materially changes.
2. Define or refine the relevant feature brief before implementation.
3. Keep implementation batches small enough for a meaningful human review.
4. Review the diff against `.project/review-checklist.md` before the next batch.
5. Add a changelog entry for every meaningful change included in a pull request.

## Documentation Updates

- Update `.project/overview.md`, `.project/architecture.md`, and `.project/constraints.md` when durable context changes.
- Keep `.project/features/index.md` as the map of the feature brief directory.
- Update the relevant `.project/features/*.md` file when stable feature behavior or boundaries change.
- Add a dated note to `.project/decisions.md` when a decision becomes worth preserving.
- If `.project/design/` exists, keep design links, flow notes, and annotated asset references aligned with the implementation.
- Add product-facing changes under the `Unreleased` release sections.
- Add agent-maintained or implementation-oriented notes under `Unreleased > Codex Log`, even when the project version does not change.
- Prefer repository tooling and config over project style guides when they disagree.

## Testing

- Do not add tests for every change by default.
- Add or update unit tests when a change affects a behavior listed under `Core Functionality` in `.project/overview.md`.
- Prefer high-signal tests for critical behavior over exhaustive low-value coverage.
- For new repositories, place automated tests under `tests/` unless the repository already uses a different convention.
- If a risky change is not covered by tests, explain why in the review or pull request.

## Versioning

- Follow Semantic Versioning: `MAJOR.MINOR.PATCH`.
- Increase `MAJOR` for breaking changes.
- Increase `MINOR` for backward-compatible features.
- Increase `PATCH` for backward-compatible fixes.
- Do not bump the project version for every merged pull request.
- When preparing a release, move the relevant `Unreleased` entries into a versioned section using the format `## [x.y.z] - YYYY-MM-DD`.
- Keep the version stored in the project manifest aligned with the latest released version.
