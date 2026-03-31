const assert = require("node:assert/strict") as typeof import("node:assert/strict");
const childProcess = require("node:child_process") as typeof import("node:child_process");
const fs = require("node:fs/promises") as typeof import("node:fs/promises");
const os = require("node:os") as typeof import("node:os");
const path = require("node:path") as typeof import("node:path");
const test = require("node:test") as typeof import("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const binPath = path.join(repositoryRoot, "bin", "project-kit-scaffold.js");

/**
 * Run the public scaffold CLI and capture the result.
 * @param {string[]} args
 * @param {string} cwd
 */
function runScaffold(args: string[], cwd: string): childProcess.SpawnSyncReturns<string> {
    return childProcess.spawnSync(process.execPath, [binPath, ...args], {
        cwd,
        encoding: "utf8"
    });
}

/**
 * Create a temporary working directory for one test case.
 */
async function createTemporaryDirectory(): Promise<string> {
    return fs.mkdtemp(path.join(os.tmpdir(), "project-kit-test-"));
}

/**
 * Check whether a file system path exists.
 * @param {string} targetPath
 */
async function pathExists(targetPath: string): Promise<boolean> {
    try {
        await fs.access(targetPath);
        return true;
    } catch {
        return false;
    }
}

test("prints help output through the public CLI wrapper", async () => {
    const result = runScaffold(["--help"], repositoryRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Project Kit Scaffold/);
    assert.match(result.stdout, /--mode <init\|align>/);
    assert.match(result.stdout, /AI-assisted repository baseline/);
});

test("loads project-config.json automatically during init", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "demo");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    await fs.writeFile(path.join(tempDir, "project-config.json"), JSON.stringify({
        projectName: "Demo Kit",
        description: "Human-led AI-assisted demo",
        primaryLanguage: "TypeScript",
        stack: ["TypeScript", "React"],
        withSpecs: false,
        initGit: false
    }, null, 4));

    const result = runScaffold(["--mode", "init", "--target", "./demo"], tempDir);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Scaffolded \d+ files in/);
    assert.equal(await pathExists(path.join(targetPath, "src")), true);
    assert.equal(await pathExists(path.join(targetPath, "tests")), true);
    assert.equal(await pathExists(path.join(targetPath, ".git")), false);

    const packageJson = JSON.parse(await fs.readFile(path.join(targetPath, "package.json"), "utf8")) as { name: string; version: string; };
    const readme = await fs.readFile(path.join(targetPath, "README.md"), "utf8");

    assert.equal(packageJson.name, "demo-kit");
    assert.equal(packageJson.version, "0.1.0");
    assert.match(readme, /AI-assisted workflow/);
});

test("align preserves existing repository layouts without forcing src or tests", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "legacy-repo");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    await fs.mkdir(path.join(targetPath, "app"), { recursive: true });
    await fs.mkdir(path.join(targetPath, "spec"), { recursive: true });
    await fs.writeFile(path.join(targetPath, "package.json"), `${JSON.stringify({
        name: "legacy-repo",
        version: "1.2.3",
        description: "Legacy repository"
    }, null, 4)}\n`);

    const result = runScaffold([
        "--mode",
        "align",
        "--target",
        targetPath,
        "--project-name",
        "Legacy Repo",
        "--description",
        "Aligned for AI-assisted work",
        "--primary-language",
        "TypeScript",
        "--stack",
        "TypeScript,Express"
    ], repositoryRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(await pathExists(path.join(targetPath, "src")), false);
    assert.equal(await pathExists(path.join(targetPath, "tests")), false);
    assert.equal(await pathExists(path.join(targetPath, ".project", "CONTRIBUTING.md")), true);

    const packageJson = JSON.parse(await fs.readFile(path.join(targetPath, "package.json"), "utf8")) as { version: string; };
    const readme = await fs.readFile(path.join(targetPath, "README.md"), "utf8");

    assert.equal(packageJson.version, "1.2.3");
    assert.match(readme, /`app\/`/);
});
