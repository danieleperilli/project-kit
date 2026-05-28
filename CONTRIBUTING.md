# Contributing

Project Kit exists to support disciplined, developer-led Codex workflows.
Changes should improve architecture clarity, implementation control, and review quality without turning the project into generic boilerplate or process theater.

## Local Setup

- Use Node.js 22 or higher.
- Run `node ./bin/project-kit.js --help` to exercise the public CLI without a global install.
- Run `npm link` if you want to exercise the public CLI as `project-kit`.
- Run `npm test` before opening a pull request.

## Change Rules

- Keep diffs focused and reviewable.
- Prefer updating existing files over adding new abstractions.
- Keep `README.md`, `SKILL.md`, `scripts/scaffold.ts`, `scripts/feature.ts`, and the generated templates aligned.
- Do not widen the scaffold just to add process vocabulary. Add structure only when it clarifies architecture, design context, or reviewability.
- Preserve existing repository layouts during `align`.
- Call out security implications when the scaffold changes file writing, command execution, or generated instructions.
- Keep UI design human-owned. If you change design-related guidance, make sure the docs still describe Codex as an implementer, not as the design authority.

## Pull Requests

- Explain the concrete user problem being solved.
- Include or update tests when CLI behavior changes.
- Mention any generated output or README examples that changed.
- Avoid unrelated refactors in the same pull request.
