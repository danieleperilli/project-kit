# Project Kit

<img src="./assets/icon.svg" height="40" align="left" alt="Project Kit icon" style="margin: 0 10px 0 0" />

Project Kit is a Codex skill and standalone scaffold for teams that want a disciplined, human-led `AI-assisted` development workflow.
It is intentionally not a `vibe-coding` starter: the goal is to give agents enough durable context to help effectively while keeping scope, review, and architectural ownership in human hands.

## Why it exists

- Keep the baseline small and maintainable.
- Prefer durable context over verbose documentation.
- Reuse existing files instead of forcing a rigid layout.
- Create specs only when ambiguity or risk justifies them.
- Support AI-assisted delivery without normalizing unreviewed automation.

## What it creates

For new repositories, Project Kit scaffolds a lean baseline around:

- `README.md`
- `AGENTS.md`
- `.project/CONTRIBUTING.md`
- `.project/CHANGELOG.md`
- `.project/CODE_STYLE.md`
- `.project/context/overview.md`
- `.project/context/architecture.md`
- `.project/context/decisions.md`
- `.gitignore`
- `project-name.code-workspace`
- `src/`
- `tests/`
- one manifest: `package.json`, `composer.json`, or `project.json`
- `.project/specs/features/_template.md` only when requested

When aligning an existing repository, the scaffold preserves the current layout and adds only the missing baseline files unless `--force` is used.
Files like `.project/context/README.md` and `.project/specs/README.md` are intentionally excluded.

## Requirements

- Node.js 22 or higher
- Git only if you want `--init-git`
- Codex only if you want to use the skill directly from the app

## Quickstart

### Standalone CLI

```bash
node ./bin/project-kit-scaffold.js --help
```

Example:

```bash
node ./bin/project-kit-scaffold.js --mode init --target /absolute/path/to/repo --meta ./project-config.sample.json
```

If you prefer a global local link during development:

```bash
npm link
project-kit-scaffold --help
```

### Codex skill

If you want Codex to invoke the skill directly, symlink the repository into your Codex skills directory.

Default `CODEX_HOME`:

```bash
mkdir -p "$HOME/.codex/skills"
ln -s "/absolute/path/to/project-kit" "$HOME/.codex/skills/project-kit"
```

Custom `CODEX_HOME`:

```bash
mkdir -p "$CODEX_HOME/skills"
ln -s "/absolute/path/to/project-kit" "$CODEX_HOME/skills/project-kit"
```

Restart Codex after installation so it reloads the skill.

## Operating modes

- `init`: bootstrap a new repository with the minimal durable baseline.
- `align`: inspect an existing repository and add only the missing high-value files.
- `harden`: review an existing repository to reduce doc sprawl and tighten context flow. This is part of the skill workflow, not a dedicated CLI mode yet.

## Init metadata

`init` expects this metadata shape:

```json
{
    "projectName": "project-kit",
    "description": "Lean baseline for human-led, AI-assisted development",
    "primaryLanguage": "TypeScript",
    "stack": ["TypeScript", "React"],
    "withSpecs": false,
    "initGit": true
}
```

Required fields:

- `projectName`
- `description`
- `primaryLanguage`
- `stack`

Optional fields:

- `withSpecs` defaults to `false`
- `initGit` defaults to `false` and initializes Git only for `init`, only when the target is not already inside a Git worktree

Version is not part of the `init` contract:

- new repositories start at `0.1.0`
- `align` reuses the version already present in the root manifest when available
- `--project-version` is intentionally not supported

If `--meta` is omitted and `project-config.json` exists in the current working directory, it is loaded automatically.
If metadata is provided in a non-English language, the conversation may stay in that language, but generated repository content should still be written in English.
Start from [project-config.sample.json](./project-config.sample.json) or copy it to `project-config.json` in the current working directory.

## CLI notes

Use `project-kit-scaffold --help` for the full command reference.

- `--with-specs` adds the optional feature spec template.
- `--primary-language` helps select both `.project/CODE_STYLE.md` and the project manifest.
- `--init-git` initializes Git only when requested and safe.
- `--force` overwrites generated files that already exist.

## Example output

```text
demo-repo/
  .gitignore
  README.md
  AGENTS.md
  package.json
  demo-repo.code-workspace
  src/
  tests/
  .project/
    CONTRIBUTING.md
    CHANGELOG.md
    CODE_STYLE.md
    context/
      overview.md
      architecture.md
      decisions.md
```

## Development

```bash
npm test
```

The test suite covers the public CLI, automatic `project-config.json` loading, and alignment behavior on existing repositories.

## Community

- [Contributing](./CONTRIBUTING.md)
- [Security](./SECURITY.md)
- [License](./LICENSE)

## Roadmap

- Support other LLM providers and models.
- Generate other language-specific code style guides like `python-style.md` or `ruby-style.md`.
