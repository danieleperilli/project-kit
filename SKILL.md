---
name: project-kit
description: Create a new project baseline or align an existing repository for a human-led, AI-assisted workflow with minimal durable documentation, lean agent instructions, and a required dedicated features document.
---

# Project Kit

Use this skill when the user wants to:

- bootstrap a new repository with a lean AI-friendly structure;
- improve an existing repository so agents can work with better context;
- reduce documentation sprawl while keeping durable project understanding;
- favor an AI-assisted engineering workflow with explicit review and ownership instead of vibe-coding;
- require a dedicated project features document as the single product-facing source of truth for features.

## Mission

Keep the human in control. Build just enough structure for agents to work well without turning the repository into a pile of stale files or a vibe-coded mess that nobody can safely maintain.

## Operating Model

Classify the request before making changes:

1. `init`
Create a new baseline for a repository that does not yet have durable project guidance.

2. `align`
Inspect an existing repository and add only the missing files that improve agent collaboration.

## Core Rules

- Prefer updating existing files over creating new ones.
- Never duplicate code structure, types, or contracts in documentation.
- Default to a lean durable structure with root entry points plus project docs under `.project/`:
  - `.gitignore`
  - `project-name.code-workspace`
  - `README.md`
  - `AGENTS.md`
  - `CONTRIBUTING.md`
  - `CHANGELOG.md`
  - `CODE_STYLE.md`
  - `.project/overview.md`
  - `.project/features.md`
  - `.project/architecture.md`
  - `.project/decisions.md`
  - one project manifest
- Build `CODE_STYLE.md` from the internal `code-style/` defaults for the languages that are actually used by the repository.
- If no supported language-specific guide applies, create `CODE_STYLE.md` from the generic fallback and let the user refine it later.
- Always create one manifest that stores the project name and Semantic Version:
  - `package.json` for TypeScript or Node.js
  - `composer.json` for PHP
  - `project.json` as a generic fallback
- Always capture stable project features in `.project/features.md`.
- Never duplicate interfaces, schemas, routes, or other code contracts inside `.project/features.md`.
- Do not create `.project/README.md` unless the user explicitly asks for it.
- Avoid placeholder noise. Prompts like "Describe the goal" are acceptable; `TODO` filler is not.
- Repository configuration overrides project style guides. Treat project style files as defaults, not as higher-precedence truth.

## Workflow

### Init input contract

For `init`, expect this metadata:

```json
{
  "projectName": "project-kit",
  "description": "Lean baseline for AI-assisted development",
  "primaryLanguage": "TypeScript",
  "stack": ["TypeScript", "React"],
  "features": ["User authentication", "Usage reporting"],
  "initGit": true
}
```

Required fields:

- `projectName`
- `description`
- `primaryLanguage`
- `stack`
- `features`

Optional fields:

- `initGit` defaults to `false`

Version is not part of the `init` metadata contract:

- for `init`, use `0.1.0` by default
- for `align`, read the existing version from the root project manifest when available
- do not accept `--project-version`

If `project-config.json` exists in the current working directory, use it as the default metadata source for `init`.
If the user asks for `init` without enough metadata after reading `project-config.json`, ask for the missing required fields before generating files.
If the user does not provide `initGit`, ask whether Git should be initialized.
For `align`, reuse `.project/features.md` when it already captures the feature inventory. If it does not exist yet, ask the user for the missing high-level features before scaffolding.
If the user provides metadata values in non-English, keep the conversation in the user's language but translate all file-facing text to English before scaffolding.
The scaffold can read the metadata from `project-config.json`, from `project-config.sample.json`, or from any JSON file passed with `--meta`.

### 1. Inspect first

For existing repositories, inspect the real project before generating anything:

- entry points;
- package manifests and runtime choices;
- top-level directories;
- existing docs that should be reused instead of replaced;
- trust boundaries and integration points.

### 2. Decide the minimum viable structure

Use this default structure unless the repository already has a better equivalent:

```text
src/
tests/
.gitignore
project-name.code-workspace
README.md
AGENTS.md
CONTRIBUTING.md
CHANGELOG.md
CODE_STYLE.md
.project/
  overview.md
  features.md
  architecture.md
  decisions.md
package.json | composer.json | project.json
```

### 3. Keep each file narrow

- `README.md`
  Human-first entry point: purpose, stack, commands, and where durable context lives.
- `src/`
  Default location for the project application code.
- `tests/`
  Default location for automated tests in new repositories, unless the existing project already uses a different testing convention.
- `.gitignore`
  Baseline ignore rules for common OS, editor, dependency, build, and coverage artifacts.
- `project-name.code-workspace`
  Minimal VS Code workspace file pointing to the repository root.
- `AGENTS.md`
  Working rules for agents: how to read the repository, how to update context, and what not to do.
- `CODE_STYLE.md`
  Repository-level coding defaults composed from one or more internal language guides, or from a generic fallback when no dedicated guide exists.
- project manifest
  Store the project name and version in the stack-native manifest, or in `project.json` when no native manifest is supported.
- `.project/overview.md`
  Durable understanding of goals, scope, constraints, and non-goals.
- `.project/features.md`
  Stable product-facing feature inventory with summary, in-scope boundaries, and explicit out-of-scope notes.
- `.project/architecture.md`
  Durable technical shape: entry points, components, integrations, and stack choices.
- `.project/decisions.md`
  Append-only record of relevant technical or workflow decisions.

### 4. Preserve human ownership

The skill must improve collaboration, not replace product or engineering judgment.

- Do not invent roadmap commitments.
- Do not create fictional modules or directory trees.
- Do not hardcode a process heavier than the team needs.
- Prefer concise, auditable updates that a human can review quickly.
- Keep `CHANGELOG.md` updated for meaningful changes, including a `Codex Log` trail when version bumps are not yet appropriate.
- Keep repository-facing prose in English even when the user supplied the source information in another language.

## Scripted Scaffolding

When bootstrapping or aligning the baseline, prefer:

```bash
node --experimental-strip-types scripts/scaffold.ts ...
```

Use the script to create the lean baseline consistently, then refine file contents based on the actual repository context.
For `init`, the script accepts `--meta /path/to/file.json`; if `--meta` is omitted, it automatically reads `project-config.json` from the current working directory when present. CLI flags override JSON values when both are present.
The scripted CLI covers `init` and `align`.

## Output Standard

When you use this skill:

- explain why each created file exists;
- keep the file count low;
- mention any files you intentionally did not create;
- if the existing repository already has a good equivalent, reuse it instead of forcing the baseline above.
