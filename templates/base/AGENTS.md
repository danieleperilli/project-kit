# Agents Instructions

## Context Loading

Do not read every project document by default.

Always start with task files. For non-trivial implementation work, also read `.project/overview.md`, `.project/architecture.md`, and `.project/constraints.md` before editing.

Load additional context only when it applies:

- `README.md`: purpose, setup, workflow.
- `CONTRIBUTING.md`: contribution or review conventions.
- `CHANGELOG.md`: release notes; only `Unreleased` unless history is requested.
- `CODE_STYLE.md`: before source edits, if present.
- `.project/features/index.md`: feature brief lookup.
- Relevant `.project/features/*.md`: changed feature only.
- `.project/decisions.md`: durable decision check or addition.
- `.project/review-checklist.md`: before non-trivial handoff.
- `.project/design/README.md`, `flows.md`, and `sources.md`: UI or design alignment.

## Language Policy (Mandatory)

- If the user writes in non-English, you must respond in the same language in chat, otherwise always respond in English.
- Common words and technical terms in English should be used even in non-English sentences, to avoid confusion and maintain consistency with the codebase.
- If the user writes in non-English but includes English technical terms, you should respond in the same non-English language but keep the technical terms in English.
- If the user responds in English or includes English words but the thread is mainly in a non-English language, you should respond in that non-English language.
- If the user provides metadata, descriptions, notes, or requirements in non-English and those values must be written into repository files, translate them into clear English before writing them.
- Keep proper names, product names, brand names, APIs, and code identifiers unchanged unless the user explicitly asks for a different English label.
- All source code, comments, identifiers, docstrings, and JSDoc/PHPDoc MUST always be in English.
- Repository documentation, changelog entries, durable notes, and scaffolded text written by the agent MUST always be in English.
- Never use non-English words inside code or code comments.

## Style Guide Precedence

- Follow the actual repository configuration first.
- If project config, linters, formatters, or existing conventions define a rule, those rules override `CODE_STYLE.md`.
- Project style guides provide defaults only when the repository does not define a stricter convention.

## Operating Model

- Humans own architecture, scope, UI/UX decisions, and acceptance.
- Treat `.project/overview.md`, `.project/architecture.md`, `.project/constraints.md`, and the relevant feature briefs as the primary execution context.
- Use small implementation batches that a human can review comfortably.
- Do not mark a non-trivial batch as truly done until a human review has happened.

## Security First Principle

Security has priority over stylistic improvements.

Always evaluate:

- SQL injection
- XSS
- SSRF
- Command injection
- Path traversal
- Unsafe deserialization
- Authentication / authorization bypass
- CSRF
- Secret leakage
- Insecure dependency usage

Rules:

- Always validate and sanitize untrusted input.
- Prefer explicit validation over implicit assumptions.
- Do not introduce new dependencies unless clearly justified.
- Do not expose secrets in logs or error messages.
- Mention security implications when relevant.

## Multi-Agent Discipline

For non-trivial changes, follow this sequence even if the work stays inside a single agent:

1. Explorer
   - Analyze entry points and trust boundaries.
   - Identify risks.
2. Worker
   - Apply minimal and controlled changes.
   - Avoid refactoring unrelated code.
3. Reviewer
   - Validate security, correctness, and necessity.
   - Perform the anti-overengineering gate below.
   - Classify issues: High / Medium / Low.
   - Suggest minimal hardening and test cases.

Do not skip the reviewer phase for complex changes.

## General Code Principles

- Do not introduce unnecessary helper functions or classes if they do not add clear value or can be reused from existing code.
- Do not introduce unnecessary abstractions.
- Do not refactor existing code unless you introduced useful functions that can be reused in multiple places.
- Reuse existing code whenever possible. Before writing new code, check if the functionality you need already exists in the codebase and can be reused or extended.
- Explain *why* a choice is made when it is not obvious.
- Add comments to explain non-obvious code, but do not add comments for self-explanatory code.
- Always add JSDoc/PHPDoc comments for all functions and methods, even if their purpose seems obvious.

### Helper Function Discipline

- Do not extract helper functions for trivial logic.
- Keep simple predicates, comparators, mappers, and formatters inline unless reused in at least three places or clearly complex.
- A helper is allowed only when it removes meaningful complexity or names a domain concept that is not obvious from the code.
- Do not split one simple operation into multiple helper functions.
- Prefer a local constant plus inline callback for small ordering, filtering, or mapping rules.

## Anti-Overengineering Gate

Apply this gate during the Reviewer phase.

- Prefer the smallest change that fully satisfies the current requirement.
- Do not add abstractions, wrappers, configuration, fallback paths, extension points, or defensive layers for hypothetical future needs.
- Add defensive checks at trust boundaries and for plausible failure modes; do not duplicate validation across trusted internal layers.
- Remove new code, steps, tests, or documentation that does not protect a stated requirement, security boundary, data integrity rule, external integration, or known regression.
- When a simpler implementation is sufficient, prefer it and document any material assumption.
- Security and correctness take precedence over simplicity; the gate removes ceremony, not necessary safeguards.

## Design Context

- If `.project/design/` exists, treat it as the authoritative source for UI implementation context.
- UI/UX decisions, visual hierarchy, and mockups remain human-owned.
- Codex should implement the provided design context, not invent a different interface.
- When the mockups are ambiguous, record the assumption explicitly or ask for clarification.
- Treat `.annotated` assets as explanatory overlays, not as product UI.

## Testing Policy

- Do not add tests for every change by default.
- Treat the `Core Functionality` section in `.project/overview.md` as the source of truth for behavior that should be protected by unit tests.
- Add or update unit tests when a change affects core functionality, security-sensitive behavior, data integrity, external integrations, or a previously broken behavior.
- Prefer a small number of high-signal tests over many low-value tests.
- For new repositories, place automated tests under `tests/` by default.
- If the repository already has a different testing convention, follow the existing structure instead of forcing `tests/`.
- If no test is added for a risky change, explain why.

## Documentation Updates

- Prefer updating existing files over creating new ones.
- Do not duplicate code contracts or directory listings in docs.
- Treat `.project/features/index.md` as the map of the feature brief directory.
- Treat the relevant `.project/features/*.md` file as the source of truth for feature scope, acceptance, and review focus.
- Update `.project/constraints.md` when durable product, technical, security, or delivery constraints change.
- If `.project/design/` exists, keep asset references, flow notes, and remote design sources aligned with the implementation.
- Append a dated note to `.project/decisions.md` when a technical or workflow decision becomes durable.
- Add a changelog entry for every meaningful change.
- Use `Unreleased > Codex Log` for agent-maintained notes when the work should be tracked but does not justify a version bump yet.
- Surface assumptions clearly when the repository does not provide enough context.

## Review Gate

- Before handing off a non-trivial batch, read `.project/review-checklist.md`.
- Call out mismatches against architecture, constraints, feature briefs, or design references explicitly.
- Flag any missing tests or unresolved ambiguity instead of hiding them behind optimistic language.

## Git Workflow

- Use pull requests as the default integration path for new code.
- Do not merge new code directly into the default branch.
- Use branch names in the form `<initials>/<feature-slug>`, for example `ab/new-feature`.
- Follow Semantic Versioning when proposing or applying version bumps.
