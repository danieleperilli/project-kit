---
name: project-kit
description: Bootstrap or align a repository for an architecture-first, developer-led Codex workflow with feature briefs, optional design context, and review gates.
---

# Project Kit

Use this skill when the user wants to:

- bootstrap a new repository with a disciplined Codex workflow;
- align an existing repository around architecture, constraints, feature briefs, and review gates;
- keep UI design human-owned while still using Codex to implement UI;
- avoid heavyweight Agile rituals while preserving delivery discipline;
- reduce ambiguity before implementation starts.

## Mission

Keep the human in control.
Codex should implement inside a clear perimeter of architecture, constraints, design context, and review expectations.

## Operating Model

Classify the request before making changes:

1. `init`
   Create a new baseline for a repository that does not yet have durable project guidance.
2. `align`
   Inspect an existing repository and add only the missing files that improve developer-led Codex collaboration.

## Core Rules

- Prefer updating existing files over creating new ones.
- Never duplicate code structure, types, routes, schemas, or contracts in documentation.
- Default to a lean durable structure with root entry points plus project docs under `.project/`:
  - `.gitignore`
  - `project-name.code-workspace`
  - `README.md`
  - `AGENTS.md`
  - `CONTRIBUTING.md`
  - `CHANGELOG.md`
  - `CODE_STYLE.md`
  - `.project/overview.md`
  - `.project/architecture.md`
  - `.project/constraints.md`
  - `.project/decisions.md`
  - `.project/review-checklist.md`
  - `.project/features/index.md`
  - one file per feature under `.project/features/`
  - optional `.project/design/` for mockups, annotations, flows, and source links
  - one project manifest
- Build `CODE_STYLE.md` from the internal `code-style/` defaults for the languages that are actually used by the repository.
- If no supported language-specific guide applies, create `CODE_STYLE.md` from the generic fallback and let the user refine it later.
- Always create one manifest that stores the project name and Semantic Version:
  - `package.json` for TypeScript or Node.js
  - `composer.json` for PHP
  - `project.json` as a generic fallback
- Treat `.project/features/index.md` as the map of the feature brief directory.
- Treat each `.project/features/*.md` file as the source of truth for feature scope, acceptance, and review focus.
- Do not create a contracts directory by default. Introduce explicit contract docs only when the project needs them.
- Avoid placeholder noise. Prompts like "Primary outcome:" are acceptable; `TODO` filler is not.
- Repository configuration overrides project style guides. Treat project style files as defaults, not as higher-precedence truth.
- Prefer the smallest change that fully satisfies the current requirement.
- Treat anti-overengineering as a Reviewer responsibility rather than a mandatory additional agent or process phase.
- Do not add abstractions, configuration, fallback paths, extension points, or defensive layers for hypothetical future needs.
- Keep necessary security, correctness, data-integrity, and trust-boundary protections even when simplifying a change.

## Workflow

### Init input contract

For `init`, expect this metadata:

```json
{
  "projectName": "project-kit",
  "description": "Architecture-first baseline for developer-led Codex work",
  "originalPromptEnglish": "Create a disciplined Codex-ready baseline for a TypeScript and React project with feature briefs and review gates.",
  "primaryLanguage": "TypeScript",
  "stack": ["TypeScript", "React"],
  "features": ["User authentication", "Usage reporting"],
  "designContext": true,
  "initGit": true
}
```

Required fields:

- `projectName`
- `description`
- `primaryLanguage`
- `stack`

Optional fields:

- `features`
- `originalPromptEnglish`
- `initGit` defaults to `false`
- `designContext` defaults to `false`

Version is not part of the `init` metadata contract:

- for `init`, use `0.1.0` by default
- for `align`, read the existing version from the root project manifest when available
- do not accept `--project-version`

If `project-config.json` exists in the current working directory, use it as the default metadata source for `init`.
If the user asks for `init` without enough metadata after reading `project-config.json`, ask for the missing required fields before generating files.
If `project-config.json` does not exist and you collect `init` metadata in chat, write the resolved metadata to `project-config.json` in the target repository during `init` so the user can restart from it later.
When the config is derived from a free-form user request, persist the full request translated into English under `originalPromptEnglish` so the original intent remains recoverable.
Treat feature briefs as optional during `init`; users can add them later with `project-kit feature create`.
If the user does not provide `initGit`, ask whether Git should be initialized.
For `align`, reuse `.project/features/index.md` when it already captures the feature directory.
If the user provides metadata values in non-English, keep the conversation in the user's language but translate all file-facing text to English before scaffolding.
The scaffold can read the metadata from `project-config.json`, from `project-config.sample.json`, or from any JSON file passed with `--meta`.

### 1. Inspect first

For existing repositories, inspect the real project before generating anything:

- entry points;
- package manifests and runtime choices;
- top-level directories;
- existing docs that should be reused instead of replaced;
- trust boundaries and integration points;
- existing UI assets, mockups, or Figma references when the project has a UI.

### 2. Establish the durable context

Use these files to capture stable project truth:

- `README.md`
  Human-first entry point: purpose, workflow, stack, and where durable context lives.
- `.project/overview.md`
  Product and delivery goal, core functionality, scope, and non-goals.
- `.project/architecture.md`
  Entry points, modules, trust boundaries, data ownership, and integrations.
- `.project/constraints.md`
  Product, technical, security, and delivery constraints.
- `.project/decisions.md`
  Append-only log of durable decisions.

### 3. Define feature briefs

Use `.project/features/` for implementation-ready feature briefs.
Each feature file should capture:

- goal;
- user-visible behavior;
- in scope;
- out of scope;
- modules involved;
- design references;
- acceptance criteria;
- test expectations;
- risks and review focus.

Prefer one file per feature rather than a single monolithic features document.

### 4. Handle UI work through design context

When the user provides mockups, screenshots, exports, or Figma links:

- create `.project/design/` only if it adds real value;
- store local exports under `.project/design/assets/`;
- use paired assets as the default convention:
  - `screen-name.png`
  - `screen-name.annotated.png`
  - `screen-name.annotations.md` when the annotated asset uses numeric callouts
  - the same rule applies to `.jpg`, `.jpeg`, `.svg`, and `.webp`
- use `.project/design/flows.md` for navigation and state transitions;
- use `.project/design/sources.md` for canonical Figma or prototype links;
- treat `.annotated` files as documentation overlays, not as product UI;
- keep UI/UX decisions human-owned;
- if the design is ambiguous, write the assumption down or ask before treating it as final.

### 5. Execute through reviewable batches

Project Kit is not sprint planning software.
The delivery primitive is a small implementation batch that a human can review.

For every non-trivial batch:

- align the work with `.project/architecture.md`, `.project/constraints.md`, and the relevant feature brief;
- keep the diff small enough for meaningful review;
- use the Reviewer phase to challenge speculative abstractions, duplicated validation, unnecessary fallback paths, and code that can be removed without weakening the stated requirement;
- use `.project/review-checklist.md` before considering the batch complete.

### 6. Preserve human ownership

The skill must improve collaboration, not replace product, design, or engineering judgment.

- Do not invent roadmap commitments.
- Do not invent UI when design artifacts exist.
- Do not create fictional modules or directory trees.
- Do not hardcode a process heavier than the team needs.
- Prefer concise, auditable updates that a human can review quickly.
- Keep repository-facing prose in English even when the user supplied the source information in another language.

## Scripted Scaffolding

When bootstrapping or aligning the baseline, prefer:

```bash
node --experimental-strip-types scripts/scaffold.ts ...
```

Use the script to create the baseline consistently, then refine file contents based on the actual repository context.
For `init`, the script accepts `--meta /path/to/file.json`; if `--meta` is omitted, it automatically reads `project-config.json` from the current working directory when present. CLI flags override JSON values when both are present.
The scripted CLI covers `init` and `align`.
Use `--design-context` or `"designContext": true` when the baseline should include the optional UI design workspace.

## Feature Brief Commands

After the baseline exists, use the feature command for the daily implementation loop:

```bash
node --experimental-strip-types scripts/feature.ts create --name "User authentication"
node --experimental-strip-types scripts/feature.ts update --slug user-authentication --acceptance "Can sign in,Can sign out"
node --experimental-strip-types scripts/feature.ts list
```

Use this command to:

- create a new implementation-ready feature brief;
- refine acceptance criteria, test expectations, design references, or review focus;
- inspect the current feature brief inventory without touching scaffold files.

## Output Standard

When you use this skill:

- explain why each created file exists;
- keep the file count low;
- mention any files you intentionally did not create;
- if `.project/design/` is created, explain how mockups, flow notes, and remote links should be maintained;
- if the existing repository already has a good equivalent, reuse it instead of forcing the baseline above.
