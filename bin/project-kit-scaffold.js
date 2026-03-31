#!/usr/bin/env node

const childProcess = require("node:child_process");
const path = require("node:path");

const scriptPath = path.join(__dirname, "..", "scripts", "scaffold.ts");
const result = childProcess.spawnSync(process.execPath, ["--experimental-strip-types", scriptPath, ...process.argv.slice(2)], {
    stdio: "inherit"
});

if (result.error) {
    throw result.error;
}

process.exit(result.status ?? 1);
