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
    assert.match(result.stdout, /--features <a,b,c>/);
    assert.match(result.stdout, /--design-context/);
    assert.match(result.stdout, /AI-assisted repository baseline/);
    assert.doesNotMatch(result.stdout, /\bharden\b/);
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
        features: ["User authentication", "Usage reporting"],
        initGit: false
    }, null, 4));

    const result = runScaffold(["--mode", "init", "--target", "./demo"], tempDir);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Scaffolded \d+ files in/);
    assert.equal(await pathExists(path.join(targetPath, "src")), true);
    assert.equal(await pathExists(path.join(targetPath, "tests")), true);
    assert.equal(await pathExists(path.join(targetPath, ".git")), false);
    assert.equal(await pathExists(path.join(targetPath, ".project", "features.md")), true);

    const packageJson = JSON.parse(await fs.readFile(path.join(targetPath, "package.json"), "utf8")) as { name: string; version: string; };
    const readme = await fs.readFile(path.join(targetPath, "README.md"), "utf8");
    const features = await fs.readFile(path.join(targetPath, ".project", "features.md"), "utf8");

    assert.equal(packageJson.name, "demo-kit");
    assert.equal(packageJson.version, "0.1.0");
    assert.match(readme, /AI-assisted workflow/);
    assert.match(features, /## User authentication/);
    assert.match(features, /## Usage reporting/);
    assert.match(features, /- Summary:/);
});

test("init requires high-level features metadata", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "missing-features");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    const result = runScaffold([
        "--mode",
        "init",
        "--target",
        targetPath,
        "--project-name",
        "Missing Features",
        "--description",
        "Init without feature inventory",
        "--primary-language",
        "TypeScript",
        "--stack",
        "TypeScript,React"
    ], repositoryRoot);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /--features/);
});

test("align requires high-level features when features.md is missing", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "legacy-no-features");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    await fs.mkdir(targetPath, { recursive: true });
    await fs.writeFile(path.join(targetPath, "package.json"), `${JSON.stringify({
        name: "legacy-no-features",
        version: "1.0.0"
    }, null, 4)}\n`);

    const result = runScaffold([
        "--mode",
        "align",
        "--target",
        targetPath,
        "--project-name",
        "Legacy No Features",
        "--description",
        "Aligned without an existing features file",
        "--primary-language",
        "TypeScript",
        "--stack",
        "TypeScript,Express"
    ], repositoryRoot);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Missing required align metadata/);
    assert.match(result.stderr, /--features/);
});

test("align does not require features when features.md already exists", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "legacy-with-features");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    await fs.mkdir(path.join(targetPath, ".project"), { recursive: true });
    await fs.writeFile(path.join(targetPath, ".project", "features.md"), "# Features\n");
    await fs.writeFile(path.join(targetPath, "package.json"), `${JSON.stringify({
        name: "legacy-with-features",
        version: "1.0.0"
    }, null, 4)}\n`);

    const result = runScaffold([
        "--mode",
        "align",
        "--target",
        targetPath,
        "--project-name",
        "Legacy With Features",
        "--description",
        "Aligned with an existing features file",
        "--primary-language",
        "TypeScript",
        "--stack",
        "TypeScript,Express"
    ], repositoryRoot);

    assert.equal(result.status, 0, result.stderr);
});

test("align reports a missing target before requiring features", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "missing-target");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    const result = runScaffold([
        "--mode",
        "align",
        "--target",
        targetPath
    ], repositoryRoot);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Target directory does not exist/);
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
        "TypeScript,Express",
        "--features",
        "Legacy admin interface,Reporting exports"
    ], repositoryRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(await pathExists(path.join(targetPath, "src")), false);
    assert.equal(await pathExists(path.join(targetPath, "tests")), false);
    assert.equal(await pathExists(path.join(targetPath, "CONTRIBUTING.md")), true);

    const packageJson = JSON.parse(await fs.readFile(path.join(targetPath, "package.json"), "utf8")) as { version: string; };
    const readme = await fs.readFile(path.join(targetPath, "README.md"), "utf8");

    assert.equal(packageJson.version, "1.2.3");
    assert.match(readme, /`app\/`/);
});

test("init scaffolds optional design context when requested", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "design-aware-demo");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    const result = runScaffold([
        "--mode",
        "init",
        "--target",
        targetPath,
        "--project-name",
        "Design Aware Demo",
        "--description",
        "Init with design references",
        "--primary-language",
        "TypeScript",
        "--stack",
        "TypeScript,React",
        "--features",
        "Onboarding flow,Profile settings",
        "--design-context"
    ], repositoryRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(await pathExists(path.join(targetPath, ".project", "design", "README.md")), true);
    assert.equal(await pathExists(path.join(targetPath, ".project", "design", "assets", ".gitkeep")), true);

    const designReadme = await fs.readFile(path.join(targetPath, ".project", "design", "README.md"), "utf8");

    assert.match(designReadme, /screen-name\.png/);
    assert.match(designReadme, /screen-name\.annotated\.png/);
    assert.match(designReadme, /screen-name\.annotations\.md/);
    assert.match(designReadme, /#FF0095/);
});
