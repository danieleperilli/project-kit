# Project Kit

<img src="./assets/icon.svg" height="40" align="left" style="margin-right: 10px;" />

Project Kit is primarily a Codex skill for teams that want a disciplined, human-led `AI-assisted` workflow.
It is intentionally not a `vibe-coding` starter: the main goal is to let you describe a project in simple language and have Codex turn that into durable repository context, while humans stay responsible for scope, architecture, and review.

## Why the skill is the main path

Using Project Kit as a skill is the recommended workflow because it adds guided reasoning before files are generated.
You can describe goals, architecture, constraints, and stack in plain language, and Codex can turn that into:

- `README.md`
- `AGENTS.md`
- `.project/CODE_STYLE.md`
- `.project/context/overview.md`
- `.project/context/architecture.md`
- `.project/context/decisions.md`
- `.project/CONTRIBUTING.md`
- `.project/CHANGELOG.md`

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
- Use an existing repository when you want to align or harden it.

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

```text
Use $project-kit to harden this repo and reduce documentation sprawl.
```

### 5. Describe the architecture in simple language

This is the critical part.
Tell Codex things like:

- what the project does;
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

- `.project/context/overview.md`
  This should become the real description of scope, core functionality, constraints, and non-goals.
- `.project/context/architecture.md`
  This should describe the actual modules, boundaries, entry points, and integrations.
- `.project/CODE_STYLE.md`
  Keep it only as a default. Tighten it or trim it based on the real repository tooling.
- `AGENTS.md`
  Adjust agent instructions so they match the project’s real review and delivery rules.
- `.project/context/decisions.md`
  Add durable decisions once they are real. Do not leave template placeholders as if they were decisions.
- `.project/CHANGELOG.md`
  Keep the initial scaffold entry, then update it only for meaningful changes.

If these files stay generic, the repo will look organized but still behave like undocumented software.

## Modes

- `init`
  Bootstrap a new repository with the minimal durable baseline.
- `align`
  Inspect an existing repository and add only the missing high-value files.
- `harden`
  Review an existing repository to reduce doc sprawl and tighten context flow. This is part of the skill workflow, not a dedicated CLI mode.

## Init Metadata

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
