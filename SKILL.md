---
name: project-kit
description: Bootstrap, align, or deliver changes in a repository through an architecture-first, developer-led Codex workflow with ready feature briefs, explicit batch contracts, optional design context, runtime verification, and review gates.
---

# Project Kit

Use this skill when the user wants to:

- bootstrap a new repository with a disciplined Codex workflow;
- align an existing repository around architecture, constraints, feature briefs, and review gates;
- deliver a non-trivial change in a repository already initialized with Project Kit;
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
3. `deliver`
   Prepare and execute exactly one ready implementation batch, verify its real user journey, and hand it to an independent review pass.

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
- Only active discovery/ready briefs describe current work. Archived briefs retain evidence and cannot authorize implementation.
- Do not create a contracts directory by default. Introduce explicit contract docs only when the project needs them.
- Avoid placeholder noise. Prompts like "Primary outcome:" are acceptable; `TODO` filler is not.
- Repository configuration overrides project style guides. Treat project style files as defaults, not as higher-precedence truth.
- Prefer the smallest change that fully satisfies the current requirement.
- Apply anti-overengineering before implementation while defining the batch and again during review.
- Do not add abstractions, configuration, fallback paths, extension points, or defensive layers for hypothetical future needs.
- Keep necessary security, correctness, data-integrity, and trust-boundary protections even when simplifying a change.

## Workflow

### Init input contract

For `init`, expect this metadata:

```json
{
  "projectType": "react-spa",
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

- `projectType` currently supports `react-spa` and applies only during `init`
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
Feature names supplied during `init` are discovery seeds, not implementation authorization. Keep generated briefs in `discovery` until their decisions and batch contract are explicit.
Do not turn brainstorming, broad prompts, or possible roadmap items into detailed future briefs unless the user explicitly asks for them.
If the user does not provide `initGit`, ask whether Git should be initialized.
For `align`, reuse `.project/features/index.md` when it already captures the feature directory.
If the user provides metadata values in non-English, keep the conversation in the user's language but translate all file-facing text to English before scaffolding.
The scaffold can read the metadata from `project-config.json`, from `project-config.sample.json`, or from any JSON file passed with `--meta`.
The `react-spa` project type applies the bundled TypeScript, React, and Vite starter before the durable Project Kit baseline is rendered. It is explicit rather than inferred from `stack`, because React may also describe frameworks, libraries, extensions, or non-SPA projects.

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
  Historical decision entry point. Current rules live at their architecture or constraints owner.

Read the overview and architecture map first, then only affected constraints, domain references and the current batch. Search historical records by ID or domain when intent, rationale or supersession is relevant; do not load the complete log, all briefs or all reviews by default.

Record accepted durable rule changes in `.project/history/decisions/YYYY-MM.md`, creating a monthly file only when the first decision needs it and linking it from `.project/decisions.md`. Keep the repository's ID sequence across periods and preserve accepted text, headings and references. For existing projects, adopt this layout explicitly and retain an old monolithic log in place. `align` preserves existing files; never use `--force` as a documentation migration.

Update one current rule owner and link its decision evidence. Routine implementation edits do not need a decision entry. During rework, revise the active brief's current batch; retain one concise final review receipt with checks, outcomes and remaining risks. Preserve material approval and evidence without copying chat transcripts or raw terminal output.

### 3. Define feature briefs

Use `.project/features/` for just-in-time feature briefs. A newly created brief defaults to `discovery`; it becomes implementation-ready only after its status is `ready` and `project-kit feature check` succeeds. Close or supersede it with `archived`, a reason and a current reference when one exists. Preserve its path and historical approvals; archival does not imply successful completion.
Each feature file should capture:

- readiness, user approval evidence, approved decisions, and open decisions;
- goal;
- user-visible behavior;
- in scope;
- out of scope;
- exactly one current implementation batch;
- modules involved;
- persistence, API, configuration/resource, and UI impact;
- design references;
- acceptance criteria;
- test expectations;
- local user-journey verification;
- required follow-up tasks;
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
- keep final UI/UX direction and acceptance human-owned;
- if the design is ambiguous, write the assumption down or ask before treating it as final;
- when no precise design direction exists, a functional provisional UI is allowed for validation;
- mark that UI as `provisional` in the feature brief and create a final UI refinement task before the feature can be treated as complete;
- when Control Room manages the project, enqueue that refinement as a dependent top-level task and record its task ID under `Required follow-up tasks`; otherwise record an explicit follow-up task and complete it before final feature acceptance.

### 5. Execute through reviewable batches

Project Kit is not sprint planning software.
The delivery primitive is a small implementation batch that a human can review.

For every non-trivial batch:

- align the work with `.project/architecture.md`, `.project/constraints.md`, and the relevant feature brief;
- do not edit product code while the brief is in `discovery`, is archived, has an unknown status, has open decisions, or fails `project-kit feature check`;
- only the user can authorize the transition to `ready`; the agent may draft the contract but must record concrete approval evidence instead of self-approving it;
- state one concise change contract before implementation: approved decisions, current batch, explicit non-goals, affected persistence, APIs, configuration/resources, UI, verification, and review risks;
- challenge speculative abstractions, future configuration, duplicated validation, and unrelated cleanup during planning, before they enter the diff;
- split work by risk surface. A batch crossing persistence, backend, worker/runtime, UI, and operations should be split unless the cross-layer slice is necessary for one independently verifiable outcome and the user explicitly accepts that scope;
- keep the diff small enough for meaningful review;
- run the automated checks required by the brief and exercise the actual local user journey, including setup, configuration, resource loading, and visible UI states when relevant;
- use the Reviewer phase to challenge speculative abstractions, duplicated validation, unnecessary fallback paths, and code that can be removed without weakening the stated requirement;
- use a fresh-context Reviewer agent for non-trivial persistence, security, architecture, or cross-layer work when agents are available and authorized; otherwise perform a distinct Reviewer pass and disclose that it was local;
- use `.project/review-checklist.md` before considering the batch complete.

Control Room and Project Kit have separate responsibilities: Control Room may own task queueing, worker branches, review iteration, and approval-only Git integration; Project Kit owns whether a task is ready, how narrowly it is implemented, and what evidence is required before review.

### 6. Preserve human ownership

The skill must improve collaboration, not replace product, design, or engineering judgment.

- Do not invent roadmap commitments.
- Do not invent UI when design artifacts exist.
- Do not create fictional modules or directory trees.
- Do not hardcode a process heavier than the team needs.
- Prefer concise, auditable updates that a human can review quickly.
- In the handoff, enumerate actual persistence, API, configuration/resource, and UI changes, then provide exact automated and local verification evidence.
- Keep repository-facing prose in English even when the user supplied the source information in another language.

## Scripted Scaffolding

When bootstrapping or aligning the baseline, prefer:

```bash
node --experimental-strip-types scripts/scaffold.ts ...
```

Use the script to create the baseline consistently, then refine file contents based on the actual repository context.
For `init`, the script accepts `--meta /path/to/file.json`; if `--meta` is omitted, it automatically reads `project-config.json` from the current working directory when present. CLI flags override JSON values when both are present.
Use `--project-type react-spa` or `"projectType": "react-spa"` to apply the bundled application starter. Project types never add application files during `align`.
The scripted CLI covers `init` and `align`.
Use `--design-context` or `"designContext": true` when the baseline should include the optional UI design workspace.

## Feature Brief Commands

After the baseline exists, use the feature command for the daily implementation loop:

```bash
node --experimental-strip-types scripts/feature.ts create --name "User authentication"
node --experimental-strip-types scripts/feature.ts update \
  --slug user-authentication \
  --status ready \
  --approval "User approved the session-boundary batch" \
  --open-decisions none \
  --problem "Users cannot start a session" \
  --outcome "Users can sign in safely" \
  --behavior "Users can sign in,Invalid credentials are rejected" \
  --in-scope "Session creation,Sign-in form" \
  --out-of-scope "Password recovery" \
  --batch "Implement the session boundary" \
  --modules "Authentication API,Sign-in UI" \
  --persistence-impact "None" \
  --api-impact "Add the session endpoint" \
  --config-impact "None" \
  --ui-impact "Add the sign-in form" \
  --ui-maturity final \
  --acceptance "Can sign in,Can sign out" \
  --tests "Add session boundary tests" \
  --verification "Start locally and complete sign-in" \
  --risks "Authentication boundary"
node --experimental-strip-types scripts/feature.ts check --slug user-authentication
node --experimental-strip-types scripts/feature.ts list
node --experimental-strip-types scripts/feature.ts update --slug user-authentication --status archived --archive-reason "Delivered and reviewed" --current-reference ".project/architecture.md"
node --experimental-strip-types scripts/feature.ts list --all
node --experimental-strip-types scripts/feature.ts update --slug user-authentication --status discovery
```

Use this command to:

- create a new discovery brief;
- refine acceptance criteria, test expectations, design references, or review focus;
- make the current implementation batch and all affected surfaces explicit;
- verify that no blocking decision or required evidence is missing before code changes begin;
- inspect the current feature brief inventory and readiness statuses without touching scaffold files.

Default listing and the active index exclude archives and invalid states; `list --all` includes them for diagnosis. Missing or unknown states are reported rather than inferred. Reopening an archive explicitly returns it to discovery, retains the previous batch/approval in its history, and clears current approval and batch; obtain fresh approval before marking the new batch ready.

The CLI maintains only marked link regions in the feature index. On the first update of a legacy index it adopts direct feature links under its existing generated section while preserving surrounding editorial notes. Keep manually maintained notes and links outside those marked regions.

## Output Standard

When you use this skill:

- explain why each created file exists;
- keep the file count low;
- mention any files you intentionally did not create;
- if `.project/design/` is created, explain how mockups, flow notes, and remote links should be maintained;
- if the existing repository already has a good equivalent, reuse it instead of forcing the baseline above.
