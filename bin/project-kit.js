#!/usr/bin/env node

const childProcess = require("node:child_process");
const path = require("node:path");

const HELP_FLAGS = new Set(["--help", "-h"]);

/**
 * Build the top-level CLI help output.
 */
function buildHelpText() {
    return [
        "Project Kit CLI",
        "",
        "Architecture-first tooling for developer-led Codex workflows.",
        "",
        "Usage:",
        "  project-kit init [scaffold options]",
        "  project-kit align [scaffold options]",
        "  project-kit feature <create|update|list> [feature options]",
        "  project-kit scaffold [scaffold options]",
        "",
        "Examples:",
        "  project-kit init --target /absolute/path/to/repo --project-name demo --description \"Architecture-first demo\" --primary-language TypeScript --stack TypeScript,React --features authentication,reporting",
        "  project-kit feature create --name \"User authentication\"",
        "  project-kit feature update --slug user-authentication --acceptance \"Can sign in,Can sign out\"",
        "  project-kit feature list",
        "",
        "Compatibility:",
        "  - `project-kit-scaffold` remains available as the low-level scaffold wrapper.",
        "  - `project-kit scaffold ...` forwards directly to that scaffold workflow."
    ].join("\n");
}

const argv = process.argv.slice(2);

if (argv.length === 0 || HELP_FLAGS.has(argv[0])) {
    process.stdout.write(`${buildHelpText()}\n`);
    process.exit(0);
}

let scriptPath = null;
let scriptArgs = [];

if (argv[0] === "init" || argv[0] === "align") {
    scriptPath = path.join(__dirname, "..", "scripts", "scaffold.ts");
    scriptArgs = ["--mode", argv[0], ...argv.slice(1)];
} else if (argv[0] === "feature") {
    scriptPath = path.join(__dirname, "..", "scripts", "feature.ts");
    scriptArgs = argv.slice(1);
} else if (argv[0] === "scaffold") {
    scriptPath = path.join(__dirname, "..", "scripts", "scaffold.ts");
    scriptArgs = argv.slice(1);
} else if (argv[0].startsWith("--")) {
    scriptPath = path.join(__dirname, "..", "scripts", "scaffold.ts");
    scriptArgs = argv;
} else {
    process.stderr.write(`Unknown command: ${argv[0]}\n${buildHelpText()}\n`);
    process.exit(1);
}

const result = childProcess.spawnSync(process.execPath, ["--experimental-strip-types", scriptPath, ...scriptArgs], {
    stdio: "inherit"
});

if (result.error) {
    throw result.error;
}

process.exit(result.status ?? 1);
