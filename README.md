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

The standalone scaffold script is still useful, but it is secondary.
It creates the baseline quickly, then you still need to manually refine the generated files.

## Install As A Skill

In this repository setup, the simplest installation path is to symlink Project Kit into your local Codex skills directory.

```bash
mkdir -p "$CODEX_HOME/skills"
ln -s "/absolute/path/to/project-kit" "$CODEX_HOME/skills/project-kit"
```

> Default `CODEX_HOME`is `~/.codex` on macOS and Linux, but it may differ based on your installation or OS.

After installation, restart Codex so the skill is discovered again.

If your Codex installation uses different skill discovery paths or newer skill management features, use the official docs below as the source of truth.

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

- Symlink the repository into your Codex skills directory.
- Restart Codex.

### 2. Open the target repository or empty project folder

- Use an empty folder for a new project.
- Use an existing repository when you want to align it.

### 3. Optionally prepare metadata

- If you already know the basic project metadata, copy [project-config.sample.json](./project-config.sample.json) to `project-config.json`.
- If you do not have it yet, describe the project in natural language directly to Codex.

### 4. Ask Codex to use the skill explicitly

Use prompts like:

```text
Use $project-kit to init a new TypeScript backend for a billing API.
```

```text
Use $project-kit to align this existing React repository.
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

Version is not part of the `init` contract:

- new repositories start at `0.1.0`
- `align` reuses the version already present in the root manifest when available
- `--project-version` is intentionally not supported

## Alternative: Standalone Scaffold

Use the standalone scaffold only when you want a fast file baseline without the conversational workflow.

```bash
node ./bin/project-kit-scaffold.js --mode init --target /absolute/path/to/repo --meta ./project-config.sample.json
```

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
