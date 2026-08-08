# Contributing

## Working Style

- Keep changes focused and reviewable.
- Use Codex to accelerate implementation, not to bypass architecture or human review.
- Prefer updating existing files over adding new abstractions.
- Do not duplicate contracts, schemas, routes, or implementation structure in documentation.
- Open a pull request for every code change. Do not merge new code directly into the default branch.
- Name branches using lowercase initials plus a kebab-case feature slug: `ab/new-feature`.

## Context Loading

Start with `AGENTS.md` and task files. For non-trivial implementation work, also read `.project/overview.md`, `.project/architecture.md`, and `.project/constraints.md` before editing.

Load additional context only when it applies:

- `README.md`: purpose, setup, workflow.
- `CHANGELOG.md`: release notes; only `Unreleased` unless history is requested.
- `CODE_STYLE.md`: before source edits, if present.
- `.project/features/index.md` and relevant `.project/features/*.md`: feature-scoped work.
- `.project/decisions.md`: durable decision check or addition.
- `.project/review-checklist.md`: before non-trivial handoff.
- `.project/design/README.md`, `flows.md`, and `sources.md`: UI or design alignment.

## Delivery Workflow

1. Update durable context only when project understanding materially changes.
2. Create or refine the relevant feature brief just in time. New briefs default to `discovery`.
3. Resolve blocking decisions, define exactly one batch and its change contract, record the user's approval, set the brief to `ready`, then run `project-kit feature check --slug <feature-slug>`.
4. Implement only that batch. Split work that crosses several risk surfaces unless one cross-layer slice is necessary for an independently verifiable outcome.
5. Run relevant automated checks and exercise the real local user journey.
6. Review the diff against `.project/review-checklist.md` before the next batch.
7. Add a changelog entry for every meaningful change included in a pull request.

When no precise design exists, a functional provisional UI is acceptable for validation. Mark it as `provisional` in the feature brief and create a final UI refinement task before the feature is considered complete. Under Control Room, enqueue it as a dependent top-level task and record its task ID.

## Documentation Updates

- Update `.project/overview.md`, `.project/architecture.md`, and `.project/constraints.md` when durable context changes.
- Keep `.project/features/index.md` as the map of the feature brief directory.
- Update the relevant `.project/features/*.md` file when stable feature behavior or boundaries change.
- Keep its readiness, current batch, explicit impact contract, local verification, and required follow-up tasks aligned with the implementation.
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
- Report local user-journey verification separately from automated test results.

## Versioning

- Follow Semantic Versioning: `MAJOR.MINOR.PATCH`.
- Increase `MAJOR` for breaking changes.
- Increase `MINOR` for backward-compatible features.
- Increase `PATCH` for backward-compatible fixes.
- Do not bump the project version for every merged pull request.
- When preparing a release, move the relevant `Unreleased` entries into a versioned section using the format `## [x.y.z] - YYYY-MM-DD`.
- Keep the version stored in the project manifest aligned with the latest released version.
