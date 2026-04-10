# Project Kit

<img src="./assets/icon.svg" height="60" align="left" style="margin-right: 10px;" />

Project Kit is primarily a Codex skill for teams that want a disciplined, human-led `AI-assisted` workflow.
It is intentionally not a `vibe-coding` starter: the main goal is to let you describe a project in simple language and have Codex turn that into durable repository context, while humans stay responsible for scope, architecture, and review.
The baseline expects a dedicated `features.md` up front as the single product-facing source of truth for features.

## Why the skill is the main path

Using Project Kit as a skill is the recommended workflow because it adds guided reasoning before files are generated.
You can describe goals, features, architecture, constraints, and stack in plain language, and Codex can turn that into:

- `README.md`
- `AGENTS.md`
- `CODE_STYLE.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- `.project/overview.md`
- `.project/features.md`
- `.project/architecture.md`
- `.project/decisions.md`
- optional `.project/design/README.md`

The standalone scaffold script is still useful, but it is secondary.
It creates the baseline quickly, then you still need to manually refine the generated files.

## Install As A Skill

Project Kit is a standard Codex skill directory: the repository root already contains `SKILL.md` plus the optional support files under `agents/`, `scripts/`, and `assets/`.

There are currently two paths you may encounter in real Codex setups:

- `~/.codex/skills`
  This is the user-level skill location used by some Codex app installations. The local macOS environment used for this repository currently has skills installed there.
- `.agents/skills`
  This is the path documented in the current Agent Skills docs for repository, user, and admin discovery.

OpenAI currently documents these `.agents/skills` discovery locations:

- repository-scoped: `.agents/skills` from the current working directory up to the repository root;
- user-scoped: `$HOME/.agents/skills`;
- admin-scoped: `/etc/codex/skills`.

Codex also supports symlinked skill folders.
For practical setup, use whichever root your Codex installation already uses:

- if you already have `~/.codex/skills`, install Project Kit there to stay consistent with your local app setup;
- if you want the path that matches the current Agent Skills docs and also works well for repo-scoped sharing, use `.agents/skills`.

### User-wide install on macOS or Linux with `~/.codex/skills`

```bash
mkdir -p "$HOME/.codex/skills"
ln -s "/absolute/path/to/project-kit" "$HOME/.codex/skills/project-kit"
```

### User-wide install on macOS or Linux with `~/.agents/skills`

```bash
mkdir -p "$HOME/.agents/skills"
ln -s "/absolute/path/to/project-kit" "$HOME/.agents/skills/project-kit"
```

### User-wide install on Windows PowerShell with `.codex\skills`

Use a junction as the default because it works well for directory links without depending on Developer Mode or elevated symlink privileges.

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.codex\skills" | Out-Null
New-Item -ItemType Junction -Path "$HOME\.codex\skills\project-kit" -Target "C:\absolute\path\to\project-kit"
```

### User-wide install on Windows PowerShell with `.agents\skills`

Use a junction as the default because it works well for directory links without depending on Developer Mode or elevated symlink privileges.

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.agents\skills" | Out-Null
New-Item -ItemType Junction -Path "$HOME\.agents\skills\project-kit" -Target "C:\absolute\path\to\project-kit"
```

If Developer Mode is enabled or you are running PowerShell as administrator, you can use `-ItemType SymbolicLink` instead of `Junction`.

### User-wide install inside WSL

If you run Codex inside WSL, install the skill inside the Linux home seen by WSL rather than inside the Windows profile. Match the root that your WSL Codex install already uses:

```bash
mkdir -p "$HOME/.codex/skills"
ln -s "/home/your-user/path/to/project-kit" "$HOME/.codex/skills/project-kit"
```

or:

```bash
mkdir -p "$HOME/.agents/skills"
ln -s "/home/your-user/path/to/project-kit" "$HOME/.agents/skills/project-kit"
```

Prefer keeping both the repository and the skill under WSL paths such as `~/code/...` instead of `/mnt/c/...`, because the Codex Windows guidance explicitly calls out fewer symlink and filesystem issues there.

If your Codex installation uses newer skill management features, use the official docs below as the source of truth.

## Learn How Skills Work

Read these first if you want to understand how Codex skills behave and where they fit:

- [Agent Skills docs](https://developers.openai.com/codex/skills)
- [Get started with Codex](https://openai.com/codex/get-started/)
- [Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540)
- [Introducing the Codex app](https://openai.com/index/introducing-the-codex-app/)
- [This skill definition in `SKILL.md`](./SKILL.md)

Why these links:

- the Agent Skills docs explain what a skill is, how explicit and implicit invocation work, and how skills are structured;
- the Codex getting started pages explain the product surfaces and setup flow;
- the local `SKILL.md` explains the operating model specific to Project Kit.

## Recommended Workflow

Use Project Kit through Codex whenever you want the repository structure to come from a guided conversation rather than from raw file generation.

### 1. Install the skill

- For a user-wide install, link the repository into the root your Codex setup already uses: usually `$HOME/.codex/skills/project-kit` or `$HOME/.agents/skills/project-kit`.
- For a repo-scoped install, link it into `.agents/skills/project-kit` inside one target repository.
- If the skill does not appear automatically, restart Codex.

### 2. Open the target repository or empty project folder

- Use an empty folder for a new project.
- Use an existing repository when you want to align it.

### 3. Optionally prepare metadata

- If you already know the basic project metadata, copy [project-config.sample.json](./project-config.sample.json) to `project-config.json`.
- If the repository includes user-facing UI, add `"designContext": true` so the scaffold also creates a place for mockups, annotated asset pairs, and optional design links.
- If you do not have it yet, describe the project in natural language directly to Codex.

### 4. Ask Codex to use the skill explicitly

Use prompts like:

```text
Use $project-kit to init a new TypeScript backend for a billing API.
```

```text
Use $project-kit to align this existing React repository.
```

```text
Use $project-kit to align this existing React repository and include design context for Figma mockups.
```

### 5. Describe the architecture in simple language

This is the critical part.
Tell Codex things like:

- what the project does;
- the main user-facing or operator-facing features;
- what is in scope and out of scope;
- the main modules or services;
- the integrations;
- the constraints;
- the stack;
- what must be tested;
- whether there are exported screens, screenshots, Figma files, or prototype links;
- whether annotated mockups follow a `name.ext` + `name.annotated.ext` convention;
- what the team wants agents to do or avoid.

That plain-language description is what Project Kit turns into durable documentation.

### 6. Review the generated baseline

Project Kit can scaffold the structure, but it should not be treated as final truth.
Review the generated files immediately and remove placeholders or assumptions that are not accurate.

## Files You Must Review Manually

Even when the skill is used correctly, these files need human editing.

- `AGENTS.md`
  Use this file to define how agents should work inside the repository.
  Add the real read order, review expectations, trust boundaries, testing expectations, documentation rules, and anything agents must never do.
  This is where you translate team process into actionable guardrails for AI-assisted work.

- `CHANGELOG.md`
  Use this file to track meaningful repository changes.
  Keep the initial scaffold entry, then add entries for changes that affect behavior, workflow, security, developer experience, or release history.
  Avoid turning it into a commit log. Codex is instructed to only add entries for meaningful changes made by agents.
  
- `CODE_STYLE.md`
  This is where you record coding conventions that are not already enforced by automated linters or formatters. It is used as a reference for both humans and agents, so it should be concise and high signal.

- `.project/overview.md`
  Use this file as the product truth.
  Write a short goal statement, define what is in scope and out of scope, list the few behaviors that are critical enough to deserve unit tests, and record the constraints that shape delivery.
  Good content here is stable and product-facing.
  Do not copy interfaces, schemas, routes, code structure, TODO lists, or speculative roadmap ideas into this file.

- `.project/features.md`
  Use this file as the stable feature inventory.
  For each feature, capture a short summary plus what is in scope and out of scope.
  Keep it product-facing and avoid copying interfaces, schemas, routes, payload examples, or implementation structure.

- `.project/architecture.md`
  Use this file as the technical map of the repository.
  Describe the main modules, execution entry points, trust boundaries, persistence layer, external integrations, and any architectural constraints that future changes must respect.
  Keep it high signal: explain how the system is shaped, not every implementation detail.

- `.project/decisions.md`
  Use this as an append-only log of durable decisions.
  Each entry should explain what was decided, why the decision was needed, and what tradeoffs or consequences it created.
  Only record decisions that future contributors will need to understand later.
  Do not leave placeholder headings or fake entries.

- `.project/design/README.md`
  Use this file only when the repository has user-facing UI or the user provides mockups.
  Use it to document the asset-pair convention and optional external design links.
  The default convention is `name.ext` plus `name.annotated.ext`, where the `.annotated` file contains arrows, notes, or labels that are not part of the final UI.
  If the annotated mockup uses only numeric callouts, pair it with `name.annotations.md` and explain each number there.
  Codex can infer local control meaning well from annotated pairs, but multi-screen flows still need explicit notes when they are not obvious.

## Modes

- `init`
  Bootstrap a new repository with the minimal durable baseline.
- `align`
  Inspect an existing repository and add only the missing high-value files.
  Reuse the existing `.project/features.md` when it already captures the feature inventory; otherwise provide the high-level features explicitly.

## Init Metadata

`init` expects this metadata shape:

```json
{
    "projectName": "project-kit",
    "description": "Lean baseline for human-led, AI-assisted development",
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
- `features`

Optional fields:

- `designContext` defaults to `false`
- `initGit` defaults to `false`

Version is not part of the `init` contract:

- new repositories start at `0.1.0`
- `align` reuses the version already present in the root manifest when available
- `--project-version` is intentionally not supported

## Alternative: Standalone Scaffold

Use the standalone scaffold only when you want a fast file baseline without the conversational workflow.

```bash
node ./bin/project-kit-scaffold.js --mode init --target /absolute/path/to/repo --meta ./project-config.sample.json
```

For UI-heavy projects, add `--design-context` to scaffold `.project/design/` as well.
The lightweight convention is to store paired assets like `editor.png` and `editor.annotated.png`.
If the overlay only contains numeric callouts, add `editor.annotations.md`.

This path is useful when:

- you already know the target structure;
- you want to generate files quickly from metadata;
- you are comfortable editing `.project/` manually afterward.

This path is weaker than the skill workflow because the user still has to manually correct and complete the generated context.

## Development

```bash
npm test
```

The test suite covers the public CLI, automatic `project-config.json` loading, and alignment behavior on existing repositories.

## Community

- [Contributing](./CONTRIBUTING.md)
- [Security](./SECURITY.md)
- [License](./LICENSE)
