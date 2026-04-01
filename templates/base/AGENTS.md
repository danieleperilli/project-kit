# Agents Instructions

## Read Order

1. `README.md`
2. `CONTRIBUTING.md`
3. `CHANGELOG.md`
4. `CODE_STYLE.md`
5. `.project/overview.md`
6. `.project/features.md`
7. `.project/architecture.md`
8. `.project/decisions.md`

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
   - Validate security and correctness.
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
- Treat `.project/features.md` as the required source of truth for the project feature inventory.
- Update `.project/features.md` when stable feature scope changes.
- Never duplicate interfaces, schemas, routes, or other code contracts inside `.project/features.md`.
- Append a dated note to `.project/decisions.md` when a technical or workflow decision becomes durable.
- Add a changelog entry for every meaningful change.
- Use `Unreleased > Codex Log` for agent-maintained notes when the work should be tracked but does not justify a version bump yet.
- Surface assumptions clearly when the repository does not provide enough context.

## Git Workflow

- Use pull requests as the default integration path for new code.
- Do not merge new code directly into the default branch.
- Use branch names in the form `<initials>/<feature-slug>`, for example `ab/new-feature`.
- Follow Semantic Versioning when proposing or applying version bumps.
