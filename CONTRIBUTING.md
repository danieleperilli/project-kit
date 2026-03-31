# Contributing

Project Kit exists to support disciplined, human-led `AI-assisted` development.
Changes should improve repository clarity and tooling without turning the project into generic boilerplate or a vibe-coding starter.

## Local setup

- Use Node.js 22 or higher.
- Run `node ./bin/project-kit-scaffold.js --help` to exercise the public CLI without a global install.
- Run `npm link` if you want to exercise the public CLI as `project-kit-scaffold`.
- Run `npm test` before opening a pull request.

## Change rules

- Keep diffs focused and reviewable.
- Prefer updating existing files over adding new abstractions.
- Keep `README.md`, `SKILL.md`, `scripts/scaffold.ts`, and the generated templates aligned.
- Do not widen the scaffold just to add fashionable files; add structure only when it improves adoption, clarity, or safety.
- Preserve existing repository layouts during `align`.
- Call out security implications when the scaffold changes file writing, command execution, or generated instructions.

## Pull requests

- Explain the concrete user problem being solved.
- Include or update tests when CLI behavior changes.
- Mention any generated output or README examples that changed.
- Avoid unrelated refactors in the same pull request.
