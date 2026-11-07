const assert: typeof import("node:assert/strict") = require("node:assert/strict");
const childProcess = require("node:child_process") as typeof import("node:child_process");
const fs = require("node:fs/promises") as typeof import("node:fs/promises");
const os = require("node:os") as typeof import("node:os");
const path = require("node:path") as typeof import("node:path");
const test = require("node:test") as typeof import("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const cliPath = path.join(repositoryRoot, "bin", "project-kit.js");
const scaffoldBinPath = path.join(repositoryRoot, "bin", "project-kit-scaffold.js");

interface IFeatureTestWorkspace {
    target: string;
    briefPath: string;
    indexPath: string;
    original: string;
}

/** Create a complete persisted contract independently of the feature renderer. */
async function createReadyFeatureWorkspace(): Promise<IFeatureTestWorkspace> {
    const target = await createTemporaryDirectory();
    const directory = path.join(target, ".project", "features");
    await fs.mkdir(directory, { recursive: true });
    const briefPath = path.join(directory, "account-sync.md");
    const indexPath = path.join(directory, "index.md");
    const original = [
        "# Account sync",
        "",
        "## Readiness",
        "",
        "- Status: ready",
        "- Approval evidence: approval-001",
        "- Approved decisions: D-007",
        "- Open decisions:",
        "",
        "## Goal",
        "",
        "- Problem solved: Accounts lack synchronized balances",
        "- Primary outcome: Preserve account totals",
        "",
        "## User-visible behavior",
        "",
        "- Account totals converge",
        "",
        "## In scope",
        "",
        "- Account synchronization",
        "",
        "## Out of scope",
        "",
        "- Provider migration",
        "",
        "## Current batch",
        "",
        "- Synchronize balances",
        "",
        "## Modules involved",
        "",
        "- Account service",
        "",
        "## Change contract",
        "",
        "- Persistence: None",
        "- APIs: None",
        "- Configuration and resources: None",
        "- UI: None",
        "- UI maturity: none",
        "",
        "## Acceptance criteria",
        "",
        "- Totals match the source",
        "",
        "## Test expectations",
        "",
        "- Verify account invariants",
        "",
        "## Local verification",
        "",
        "- Synchronize a fixture",
        "",
        "## Risks and review focus",
        "",
        "- Duplicate accounting",
        ""
    ].join("\n");
    await fs.writeFile(briefPath, original);
    await fs.writeFile(indexPath, "# Project-specific index\n\nRetain this editorial introduction.\n");
    return { target, briefPath, indexPath, original };
}

/**
 * Run the public scaffold CLI and capture the result.
 * @param {string[]} args
 * @param {string} cwd
 */
function runScaffold(args: string[], cwd: string): import("node:child_process").SpawnSyncReturns<string> {
    return childProcess.spawnSync(process.execPath, [scaffoldBinPath, ...args], {
        cwd,
        encoding: "utf8"
    });
}

/**
 * Run the top-level Project Kit CLI and capture the result.
 * @param {string[]} args
 * @param {string} cwd
 */
function runProjectKit(args: string[], cwd: string): import("node:child_process").SpawnSyncReturns<string> {
    return childProcess.spawnSync(process.execPath, [cliPath, ...args], {
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
    assert.match(result.stdout, /--project-type <type>/);
    assert.match(result.stdout, /--design-context/);
    assert.match(result.stdout, /architecture-first/);
});

test("prints help output through the top-level project-kit CLI", async () => {
    const result = runProjectKit(["--help"], repositoryRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Project Kit CLI/);
    assert.match(result.stdout, /project-kit feature <create\|update\|check\|list>/);
    assert.match(result.stdout, /project-kit init/);
});

test("loads project-config.json automatically during init", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "demo");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    await fs.writeFile(path.join(tempDir, "project-config.json"), JSON.stringify({
        projectName: "Demo Kit",
        description: "Developer-led Codex demo",
        originalPromptEnglish: "Build a browser-only tool that creates and edits SVG maps for Power BI.",
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
    assert.equal(await pathExists(path.join(targetPath, "project-config.json")), true);
    assert.equal(await pathExists(path.join(targetPath, ".project", "features", "index.md")), true);
    assert.equal(await pathExists(path.join(targetPath, ".project", "constraints.md")), true);
    assert.equal(await pathExists(path.join(targetPath, ".project", "review-checklist.md")), true);
    assert.equal(await pathExists(path.join(targetPath, ".project", "features", "user-authentication.md")), true);
    assert.equal(await pathExists(path.join(targetPath, ".project", "features", "usage-reporting.md")), true);

    const packageJson = JSON.parse(await fs.readFile(path.join(targetPath, "package.json"), "utf8")) as { name: string; version: string; };
    const projectConfig = JSON.parse(await fs.readFile(path.join(targetPath, "project-config.json"), "utf8")) as { features: string[]; primaryLanguage: string; originalPromptEnglish?: string; };
    const agents = await fs.readFile(path.join(targetPath, "AGENTS.md"), "utf8");
    const featureIndex = await fs.readFile(path.join(targetPath, ".project", "features", "index.md"), "utf8");
    const featureBrief = await fs.readFile(path.join(targetPath, ".project", "features", "user-authentication.md"), "utf8");

    assert.equal(packageJson.name, "demo-kit");
    assert.equal(packageJson.version, "0.1.0");
    assert.equal(projectConfig.primaryLanguage, "TypeScript");
    assert.equal(projectConfig.originalPromptEnglish, "Build a browser-only tool that creates and edits SVG maps for Power BI.");
    assert.deepEqual(projectConfig.features, ["User authentication", "Usage reporting"]);
    assert.ok(Buffer.byteLength(agents, "utf8") < 32768, "Generated AGENTS.md must remain below Codex's default 32 KiB project instruction limit.");
    assert.match(featureIndex, /\[User authentication\]\(\.\/user-authentication\.md\)/);
    assert.match(featureIndex, /\[Usage reporting\]\(\.\/usage-reporting\.md\)/);
    assert.match(featureBrief, /## Readiness\n\n- Status: discovery/);
    assert.match(featureBrief, /## Current batch/);
    assert.match(featureBrief, /## Change contract/);
    assert.match(featureBrief, /## Local verification/);
    assert.match(featureBrief, /## Required follow-up tasks/);
    assert.match(featureBrief, /## Acceptance criteria/);
    assert.match(featureBrief, /## Risks and review focus/);
});

test("init does not require feature brief metadata and persists project-config.json", async (t) => {
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
        "Init without feature briefs",
        "--primary-language",
        "TypeScript",
        "--stack",
        "TypeScript,React"
    ], repositoryRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(await pathExists(path.join(targetPath, "project-config.json")), true);
    assert.equal(await pathExists(path.join(targetPath, ".project", "features", "index.md")), true);

    const featureIndex = await fs.readFile(path.join(targetPath, ".project", "features", "index.md"), "utf8");
    const featureEntries = await fs.readdir(path.join(targetPath, ".project", "features"));
    const projectConfig = JSON.parse(await fs.readFile(path.join(targetPath, "project-config.json"), "utf8")) as { features: string[]; stack: string[]; originalPromptEnglish?: string; };

    assert.equal([...featureIndex.matchAll(/\]\(\.\/[^)]+\.md\)/g)].length, 0);
    assert.deepEqual(featureEntries.sort(), ["index.md"]);
    assert.deepEqual(projectConfig.features, []);
    assert.deepEqual(projectConfig.stack, ["TypeScript", "React"]);
    assert.equal(projectConfig.originalPromptEnglish, undefined);
});

test("init applies the bundled react-spa project type with rendered metadata", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "react-demo");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    const args = [
        "--mode",
        "init",
        "--target",
        targetPath,
        "--project-type",
        "react-spa",
        "--project-name",
        "React \"Demo\" <script>",
        "--description",
        "Bundled \"React\" application <starter>",
        "--primary-language",
        "TypeScript",
        "--stack",
        "TypeScript,React,Vite"
    ];
    const result = runScaffold(args, repositoryRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Applied project type react-spa/);

    const packageJson = JSON.parse(await fs.readFile(path.join(targetPath, "package.json"), "utf8")) as { name: string; version: string; description: string; scripts: Record<string, string>; };
    const packageLock = JSON.parse(await fs.readFile(path.join(targetPath, "package-lock.json"), "utf8")) as { name: string; version: string; };
    const projectConfig = JSON.parse(await fs.readFile(path.join(targetPath, "project-config.json"), "utf8")) as { projectType?: string; };
    const constants = await fs.readFile(path.join(targetPath, "src", "constants.ts"), "utf8");
    const indexHtml = await fs.readFile(path.join(targetPath, "index.html"), "utf8");
    const readme = await fs.readFile(path.join(targetPath, "README.md"), "utf8");
    const robots = await fs.readFile(path.join(targetPath, "public", "robots.txt"), "utf8");
    const sourceFont = await fs.readFile(path.join(repositoryRoot, "templates", "project-types", "react-spa", "src", "style", "icons.woff2"));
    const generatedFont = await fs.readFile(path.join(targetPath, "src", "style", "icons.woff2"));

    assert.equal(packageJson.name, "react-demo-script");
    assert.equal(packageJson.version, "0.1.0");
    assert.equal(packageJson.description, "Bundled \"React\" application <starter>");
    assert.equal(packageJson.scripts.build, "tsc -b && vite build");
    assert.equal(packageLock.name, "react-demo-script");
    assert.equal(packageLock.version, "0.1.0");
    assert.equal(projectConfig.projectType, "react-spa");
    assert.match(constants, /APP_NAME = "React \\"Demo\\" <script>"/);
    assert.match(indexHtml, /<title>React &quot;Demo&quot; &lt;script&gt;<\/title>/);
    assert.doesNotMatch(indexHtml, /noindex|icon\.png|maskable-icon/);
    assert.match(readme, /## React SPA Starter/);
    assert.match(readme, /npm ci/);
    assert.match(readme, /Google Fonts/);
    assert.match(robots, /Allow: \//);
    assert.deepEqual(generatedFont, sourceFont);
});

test("react-spa init rejects application file collisions before writing the baseline", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "existing-app");
    const existingPackage = "{\"name\":\"existing-app\"}\n";

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    await fs.mkdir(targetPath, { recursive: true });
    await fs.writeFile(path.join(targetPath, "package.json"), existingPackage);

    const args = [
        "--mode",
        "init",
        "--target",
        targetPath,
        "--project-type",
        "react-spa",
        "--project-name",
        "Existing App",
        "--description",
        "Collision test",
        "--primary-language",
        "TypeScript",
        "--stack",
        "TypeScript,React,Vite"
    ];
    const result = runScaffold(args, repositoryRoot);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Cannot apply project type "react-spa"/);
    assert.match(result.stderr, /package\.json/);
    assert.equal(await fs.readFile(path.join(targetPath, "package.json"), "utf8"), existingPackage);
    assert.equal(await pathExists(path.join(targetPath, "README.md")), false);
    assert.equal(await pathExists(path.join(targetPath, "src", "App.tsx")), false);

    const forcedResult = runScaffold([...args, "--force"], repositoryRoot);
    const forcedPackage = JSON.parse(await fs.readFile(path.join(targetPath, "package.json"), "utf8")) as { name: string; scripts: Record<string, string>; };

    assert.equal(forcedResult.status, 0, forcedResult.stderr);
    assert.equal(forcedPackage.name, "existing-app");
    assert.equal(forcedPackage.scripts.build, "tsc -b && vite build");
    assert.equal(await pathExists(path.join(targetPath, "README.md")), true);
    assert.equal(await pathExists(path.join(targetPath, "src", "App.tsx")), true);
});

test("align ignores a persisted project type and does not inject application files", async (t) => {
    const tempDir = await createTemporaryDirectory();

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    await fs.writeFile(path.join(tempDir, "project-config.json"), JSON.stringify({
        projectType: "react-spa",
        projectName: "Aligned App",
        description: "Existing repository alignment",
        primaryLanguage: "TypeScript",
        stack: ["TypeScript", "React"]
    }, null, 4));
    await fs.writeFile(path.join(tempDir, "package.json"), JSON.stringify({
        name: "aligned-app",
        version: "2.0.0"
    }, null, 4));

    const result = runScaffold(["--mode", "align", "--target", "."], tempDir);
    const packageJson = JSON.parse(await fs.readFile(path.join(tempDir, "package.json"), "utf8")) as { version: string; };

    assert.equal(result.status, 0, result.stderr);
    assert.equal(packageJson.version, "2.0.0");
    assert.equal(await pathExists(path.join(tempDir, "src", "App.tsx")), false);
});

test("align does not require feature brief names when no feature inventory exists", async (t) => {
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
        "Aligned without an existing feature inventory",
        "--primary-language",
        "TypeScript",
        "--stack",
        "TypeScript,Express"
    ], repositoryRoot);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(await pathExists(path.join(targetPath, ".project", "features", "index.md")), true);

    const featureIndex = await fs.readFile(path.join(targetPath, ".project", "features", "index.md"), "utf8");

    assert.equal([...featureIndex.matchAll(/\]\(\.\/[^)]+\.md\)/g)].length, 0);
});

test("align does not require features when the new feature index already exists", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "legacy-with-feature-index");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    await fs.mkdir(path.join(targetPath, ".project", "features"), { recursive: true });
    await fs.writeFile(path.join(targetPath, ".project", "features", "index.md"), "# Features\n");
    await fs.writeFile(path.join(targetPath, "package.json"), `${JSON.stringify({
        name: "legacy-with-feature-index",
        version: "1.0.0"
    }, null, 4)}\n`);

    const result = runScaffold([
        "--mode",
        "align",
        "--target",
        targetPath,
        "--project-name",
        "Legacy With Feature Index",
        "--description",
        "Aligned with an existing feature index",
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
        "Aligned for review-gated Codex work",
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
    assert.equal(await pathExists(path.join(targetPath, ".project", "design", "flows.md")), true);
    assert.equal(await pathExists(path.join(targetPath, ".project", "design", "sources.md")), true);
    assert.equal(await pathExists(path.join(targetPath, ".project", "design", "assets", ".gitkeep")), true);

    const designReadme = await fs.readFile(path.join(targetPath, ".project", "design", "README.md"), "utf8");
    const flows = await fs.readFile(path.join(targetPath, ".project", "design", "flows.md"), "utf8");

    assert.match(designReadme, /UI\/UX decisions, mockups, interaction design, and visual hierarchy remain human-owned/);
    assert.match(designReadme, /screen-name\.annotated\.png/);
    assert.match(flows, /Capture navigation, state transitions, and multi-screen behavior here/);
});

test("feature create adds a new brief and refreshes the index", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "feature-loop-demo");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    const initResult = runScaffold([
        "--mode",
        "init",
        "--target",
        targetPath,
        "--project-name",
        "Feature Loop Demo",
        "--description",
        "Init for feature command testing",
        "--primary-language",
        "TypeScript",
        "--stack",
        "TypeScript,React",
        "--features",
        "User authentication"
    ], repositoryRoot);

    assert.equal(initResult.status, 0, initResult.stderr);

    const createResult = runProjectKit([
        "feature",
        "create",
        "--target",
        targetPath,
        "--name",
        "Billing dashboard",
        "--design-assets",
        "billing-dashboard.png,billing-dashboard.annotated.png",
        "--acceptance",
        "Shows invoice totals,Shows overdue state"
    ], repositoryRoot);

    assert.equal(createResult.status, 0, createResult.stderr);
    assert.match(createResult.stdout, /Created feature brief billing-dashboard/);

    const featureBrief = await fs.readFile(path.join(targetPath, ".project", "features", "billing-dashboard.md"), "utf8");
    const featureIndex = await fs.readFile(path.join(targetPath, ".project", "features", "index.md"), "utf8");

    assert.match(featureBrief, /# Billing dashboard/);
    assert.match(featureBrief, /## Readiness\n\n- Status: discovery/);
    assert.match(featureBrief, /- Local assets: billing-dashboard\.png; billing-dashboard\.annotated\.png/);
    assert.match(featureBrief, /- Shows invoice totals/);
    assert.match(featureBrief, /- Shows overdue state/);
    assert.match(featureIndex, /\[Billing dashboard\]\(\.\/billing-dashboard\.md\)/);
});

test("feature update can rename a brief and list reflects the new slug", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "feature-update-demo");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    const initResult = runScaffold([
        "--mode",
        "init",
        "--target",
        targetPath,
        "--project-name",
        "Feature Update Demo",
        "--description",
        "Init for feature update testing",
        "--primary-language",
        "TypeScript",
        "--stack",
        "TypeScript,React",
        "--features",
        "User authentication"
    ], repositoryRoot);

    assert.equal(initResult.status, 0, initResult.stderr);

    const updateResult = runProjectKit([
        "feature",
        "update",
        "--target",
        targetPath,
        "--slug",
        "user-authentication",
        "--name",
        "Authentication core",
        "--rename-slug",
        "authentication-core",
        "--acceptance",
        "Can sign in,Can sign out",
        "--tests",
        "Add auth controller tests"
    ], repositoryRoot);

    assert.equal(updateResult.status, 0, updateResult.stderr);
    assert.match(updateResult.stdout, /renamed it to authentication-core/);
    assert.equal(await pathExists(path.join(targetPath, ".project", "features", "user-authentication.md")), false);
    assert.equal(await pathExists(path.join(targetPath, ".project", "features", "authentication-core.md")), true);

    const featureBrief = await fs.readFile(path.join(targetPath, ".project", "features", "authentication-core.md"), "utf8");
    const featureIndex = await fs.readFile(path.join(targetPath, ".project", "features", "index.md"), "utf8");
    const listResult = runProjectKit([
        "feature",
        "list",
        "--target",
        targetPath
    ], repositoryRoot);

    assert.equal(listResult.status, 0, listResult.stderr);
    assert.match(featureBrief, /# Authentication core/);
    assert.match(featureBrief, /- Can sign in/);
    assert.match(featureBrief, /- Can sign out/);
    assert.match(featureBrief, /- Add auth controller tests/);
    assert.match(featureIndex, /\[Authentication core\]\(\.\/authentication-core\.md\)/);
    assert.match(listResult.stdout, /authentication-core :: Authentication core/);
});

test("feature update migrates legacy briefs into the delivery lifecycle", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "legacy-feature-demo");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    const initResult = runScaffold([
        "--mode",
        "init",
        "--target",
        targetPath,
        "--project-name",
        "Legacy Feature Demo",
        "--description",
        "Init for legacy feature migration testing",
        "--primary-language",
        "TypeScript",
        "--stack",
        "TypeScript"
    ], repositoryRoot);

    assert.equal(initResult.status, 0, initResult.stderr);

    const featurePath = path.join(targetPath, ".project", "features", "legacy-feature.md");

    await fs.writeFile(featurePath, [
        "# Legacy feature",
        "",
        "## Goal",
        "",
        "- Problem solved: Legacy briefs have no delivery lifecycle",
        "- Primary outcome: Existing work can adopt the readiness gate",
        "",
        "## User-visible behavior",
        "",
        "- No user-visible change",
        "",
        "## In scope",
        "",
        "- Feature brief migration",
        "",
        "## Out of scope",
        "",
        "- Product code changes",
        "",
        "## Modules involved",
        "",
        "- Project documentation",
        "",
        "## Design references",
        "",
        "- Local assets:",
        "- Flow notes:",
        "- Remote sources:",
        "",
        "## Acceptance criteria",
        "",
        "- Existing brief content is preserved",
        "",
        "## Test expectations",
        "",
        "- Run the Project Kit test suite",
        "",
        "## Risks and review focus",
        "",
        "- Legacy markdown compatibility",
        ""
    ].join("\n"), "utf8");

    const updateResult = runProjectKit([
        "feature",
        "update",
        "--target",
        targetPath,
        "--slug",
        "legacy-feature",
        "--status",
        "ready",
        "--approval",
        "User approved the legacy migration batch",
        "--open-decisions",
        "none",
        "--batch",
        "Migrate the legacy brief structure",
        "--persistence-impact",
        "None",
        "--api-impact",
        "None",
        "--config-impact",
        "None",
        "--ui-impact",
        "None",
        "--ui-maturity",
        "none",
        "--verification",
        "Run the readiness check against the migrated brief"
    ], repositoryRoot);
    const checkResult = runProjectKit([
        "feature",
        "check",
        "--target",
        targetPath,
        "--slug",
        "legacy-feature"
    ], repositoryRoot);
    const migratedBrief = await fs.readFile(featurePath, "utf8");

    assert.equal(updateResult.status, 0, updateResult.stderr);
    assert.equal(checkResult.status, 0, checkResult.stderr);
    assert.equal(migratedBrief.match(/^## Readiness$/gm)?.length, 1);
    assert.equal(migratedBrief.match(/^## Change contract$/gm)?.length, 1);
    assert.match(migratedBrief, /- Problem solved: Legacy briefs have no delivery lifecycle/);
    assert.match(migratedBrief, /- UI maturity: none/);
});

test("feature check enforces readiness and a refinement task for provisional UI", async (t) => {
    const tempDir = await createTemporaryDirectory();
    const targetPath = path.join(tempDir, "feature-readiness-demo");

    t.after(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    const initResult = runScaffold([
        "--mode",
        "init",
        "--target",
        targetPath,
        "--project-name",
        "Feature Readiness Demo",
        "--description",
        "Init for feature readiness testing",
        "--primary-language",
        "TypeScript",
        "--stack",
        "TypeScript,React"
    ], repositoryRoot);

    assert.equal(initResult.status, 0, initResult.stderr);

    const createResult = runProjectKit([
        "feature",
        "create",
        "--target",
        targetPath,
        "--name",
        "Usage dashboard"
    ], repositoryRoot);
    const discoveryCheck = runProjectKit([
        "feature",
        "check",
        "--target",
        targetPath,
        "--slug",
        "usage-dashboard"
    ], repositoryRoot);

    assert.equal(createResult.status, 0, createResult.stderr);
    assert.equal(discoveryCheck.status, 1);
    assert.match(discoveryCheck.stderr, /Set Readiness status to ready/);

    const readyUpdate = runProjectKit([
        "feature",
        "update",
        "--target",
        targetPath,
        "--slug",
        "usage-dashboard",
        "--status",
        "ready",
        "--approval",
        "User approved the functional validation batch",
        "--open-decisions",
        "none",
        "--problem",
        "Users cannot inspect current usage",
        "--outcome",
        "Users can validate usage data locally",
        "--behavior",
        "Users can open the usage dashboard",
        "--in-scope",
        "Usage summary",
        "--out-of-scope",
        "Historical exports",
        "--batch",
        "Build the functional usage dashboard",
        "--modules",
        "Usage UI",
        "--persistence-impact",
        "None",
        "--api-impact",
        "None",
        "--config-impact",
        "None",
        "--ui-impact",
        "Add a functional dashboard for validation",
        "--ui-maturity",
        "provisional",
        "--acceptance",
        "Usage summary is visible",
        "--tests",
        "Add dashboard rendering tests",
        "--verification",
        "Start locally and open the usage dashboard",
        "--risks",
        "Provisional visual hierarchy"
    ], repositoryRoot);
    const missingRefinementCheck = runProjectKit([
        "feature",
        "check",
        "--target",
        targetPath,
        "--slug",
        "usage-dashboard"
    ], repositoryRoot);

    assert.equal(readyUpdate.status, 0, readyUpdate.stderr);
    assert.equal(missingRefinementCheck.status, 1);
    assert.match(missingRefinementCheck.stderr, /Add a final UI refinement task/);

    const refinementUpdate = runProjectKit([
        "feature",
        "update",
        "--target",
        targetPath,
        "--slug",
        "usage-dashboard",
        "--follow-ups",
        "Refine the dashboard from the approved visual direction"
    ], repositoryRoot);
    const readyCheck = runProjectKit([
        "feature",
        "check",
        "--target",
        targetPath,
        "--slug",
        "usage-dashboard"
    ], repositoryRoot);
    const readyList = runProjectKit([
        "feature",
        "list",
        "--target",
        targetPath
    ], repositoryRoot);

    assert.equal(refinementUpdate.status, 0, refinementUpdate.stderr);
    assert.equal(readyCheck.status, 0, readyCheck.stderr);
    assert.match(readyCheck.stdout, /ready for one implementation batch/);
    assert.equal(readyList.status, 0, readyList.stderr);
    assert.match(readyList.stdout, /usage-dashboard :: Usage dashboard \[ready\]/);
});

test("archived briefs retain evidence but cannot authorize or reappear in active work", async (t) => {
    const workspace = await createReadyFeatureWorkspace();
    t.after(async () => { await fs.rm(workspace.target, { recursive: true, force: true }); });
    const args = ["--target", workspace.target, "--slug", "account-sync"];
    assert.equal(runProjectKit(["feature", "check", ...args], repositoryRoot).status, 0);
    assert.equal(runProjectKit(["feature", "update", ...args, "--status", "archived"], repositoryRoot).status, 1);
    assert.equal(await fs.readFile(workspace.briefPath, "utf8"), workspace.original);
    const archived = runProjectKit(["feature", "update", ...args, "--status", "archived", "--archive-reason", "Superseded by D-008", "--current-reference", "../architecture.md#accounts"], repositoryRoot);
    assert.equal(archived.status, 0, archived.stderr);
    const document = await fs.readFile(workspace.briefPath, "utf8");
    assert.ok(document.includes("- Approval evidence: approval-001"));
    assert.ok(document.includes("- Current reference: ../architecture.md#accounts"));
    assert.equal(document.slice(document.indexOf("## Goal")), workspace.original.slice(workspace.original.indexOf("## Goal")));
    assert.equal(runProjectKit(["feature", "check", ...args], repositoryRoot).status, 1);
    const active = runProjectKit(["feature", "list", "--target", workspace.target], repositoryRoot);
    const all = runProjectKit(["feature", "list", "--all", "--target", workspace.target], repositoryRoot);
    assert.equal(active.status, 0, active.stderr);
    assert.equal(all.status, 0, all.stderr);
    assert.ok(!active.stdout.includes("account-sync"));
    assert.ok(all.stdout.includes("account-sync"));
    assert.equal(await fs.readFile(workspace.briefPath, "utf8"), document);
    const created = runProjectKit(["feature", "create", "--target", workspace.target, "--name", "Next sync"], repositoryRoot);
    assert.equal(created.status, 0, created.stderr);
    const index = await fs.readFile(workspace.indexPath, "utf8");
    const activeRegion = index.split("<!-- project-kit:features:active:start -->")[1].split("<!-- project-kit:features:active:end -->")[0];
    const archivedRegion = index.split("<!-- project-kit:features:archived:start -->")[1].split("<!-- project-kit:features:archived:end -->")[0];
    assert.ok(!activeRegion.includes("./account-sync.md"));
    assert.ok(activeRegion.includes("./next-sync.md"));
    assert.ok(archivedRegion.includes("./account-sync.md"));
    assert.ok(index.startsWith("# Project-specific index\n\nRetain this editorial introduction.\n"));
    assert.equal(await fs.readFile(workspace.briefPath, "utf8"), document);
});

test("reopening requires discovery and fresh batch approval while preserving provenance", async (t) => {
    const workspace = await createReadyFeatureWorkspace();
    t.after(async () => { await fs.rm(workspace.target, { recursive: true, force: true }); });
    const args = ["--target", workspace.target, "--slug", "account-sync"];
    const archive = runProjectKit(["feature", "update", ...args, "--status", "archived", "--archive-reason", "Completed"], repositoryRoot);
    assert.equal(archive.status, 0, archive.stderr);
    const archived = await fs.readFile(workspace.briefPath, "utf8");
    for (const flags of [["--status", "ready", "--approval", "approval-002"], ["--status", "discovery", "--approval", "approval-002"]]) {
        assert.equal(runProjectKit(["feature", "update", ...args, ...flags], repositoryRoot).status, 1);
        assert.equal(await fs.readFile(workspace.briefPath, "utf8"), archived);
    }
    const reopened = runProjectKit(["feature", "update", ...args, "--status", "discovery"], repositoryRoot);
    assert.equal(reopened.status, 0, reopened.stderr);
    const document = await fs.readFile(workspace.briefPath, "utf8");
    const readiness = document.split("## Readiness\n\n")[1].split("\n## ")[0];
    assert.ok(readiness.includes("- Status: discovery"));
    assert.ok(!readiness.includes("approval-001"));
    assert.ok(document.includes("approval-001"));
    assert.ok(document.includes("Synchronize balances"));
    assert.ok(document.includes("D-007"));
    assert.equal(runProjectKit(["feature", "check", ...args], repositoryRoot).status, 1);
    assert.equal(runProjectKit(["feature", "update", ...args, "--status", "ready"], repositoryRoot).status, 0);
    assert.equal(runProjectKit(["feature", "check", ...args], repositoryRoot).status, 1);
    const approved = runProjectKit(["feature", "update", ...args, "--approval", "approval-002", "--batch", "Reconcile balances"], repositoryRoot);
    assert.equal(approved.status, 0, approved.stderr);
    assert.equal(runProjectKit(["feature", "check", ...args], repositoryRoot).status, 0);
});

test("missing and unknown persisted states stay visible as diagnostics without implicit readiness", async (t) => {
    const workspace = await createReadyFeatureWorkspace();
    t.after(async () => { await fs.rm(workspace.target, { recursive: true, force: true }); });
    const args = ["--target", workspace.target, "--slug", "account-sync"];
    for (const status of ["", "- Status: implemented locally", "- Status:"]) {
        const invalid = workspace.original.replace("- Status: ready", status);
        await fs.writeFile(workspace.briefPath, invalid);
        const active = runProjectKit(["feature", "list", "--target", workspace.target], repositoryRoot);
        const all = runProjectKit(["feature", "list", "--target", workspace.target, "--all"], repositoryRoot);
        assert.equal(active.status, 0, active.stderr);
        assert.ok(!active.stdout.includes("account-sync"));
        assert.ok(active.stderr.includes("account-sync.md"));
        assert.ok(all.stdout.includes("account-sync"));
        assert.ok(all.stdout.includes("[invalid]"));
        assert.equal(runProjectKit(["feature", "check", ...args], repositoryRoot).status, 1);
        assert.equal(runProjectKit(["feature", "update", ...args, "--risks", "Account reconciliation"], repositoryRoot).status, 1);
        assert.equal(await fs.readFile(workspace.briefPath, "utf8"), invalid);
    }
    const repair = runProjectKit(["feature", "update", ...args, "--status", "discovery"], repositoryRoot);
    assert.equal(repair.status, 0, repair.stderr);
    assert.ok(runProjectKit(["feature", "list", "--target", workspace.target], repositoryRoot).stdout.includes("account-sync"));
});

test("index adoption and later regeneration preserve editorial sections and maintained links", async (t) => {
    const workspace = await createReadyFeatureWorkspace();
    t.after(async () => { await fs.rm(workspace.target, { recursive: true, force: true }); });
    const prefix = "# Curated map\n\n[Architecture](../architecture.md)\n\n";
    const note = "Keep this manually maintained note, [guide](../guide.md), and [handbook](./maintainer-guide.md).";
    const suffix = "## Maintainer notes\n\nOwner: account-team.\n";
    await fs.writeFile(workspace.indexPath, `${prefix}## Active Feature Briefs\n\n${note}\n\n- [Account sync](./account-sync.md)\n\n${suffix}`);
    const args = ["feature", "update", "--target", workspace.target, "--slug", "account-sync"];
    const archived = runProjectKit([...args, "--status", "archived", "--archive-reason", "Retired"], repositoryRoot);
    assert.equal(archived.status, 0, archived.stderr);
    let index = await fs.readFile(workspace.indexPath, "utf8");
    assert.ok(index.startsWith(prefix));
    assert.ok(index.includes(note));
    assert.ok(index.includes(suffix));
    assert.equal(index.split("./account-sync.md").length - 1, 1);
    const manual = "Keep this text outside the generated region.\n";
    index = index.replace("<!-- project-kit:features:active:start -->", manual + "<!-- project-kit:features:active:start -->");
    await fs.writeFile(workspace.indexPath, index);
    const updated = runProjectKit([...args, "--archive-reason", "Superseded by account-v2"], repositoryRoot);
    assert.equal(updated.status, 0, updated.stderr);
    assert.equal(await fs.readFile(workspace.indexPath, "utf8"), index);
});

test("archive metadata rejects multiline field injection without changing the contract", async (t) => {
    const workspace = await createReadyFeatureWorkspace();
    t.after(async () => { await fs.rm(workspace.target, { recursive: true, force: true }); });
    const args = ["feature", "update", "--target", workspace.target, "--slug", "account-sync"];
    for (const flags of [
        ["--status", "archived", "--archive-reason"],
        ["--status", "archived", "--archive-reason", "Closed\n- Status: ready"],
        ["--status", "archived", "--archive-reason", "Closed", "--current-reference", "owner\r\n## Readiness"],
        ["--all", "--status", "archived", "--archive-reason", "Closed"]
    ]) {
        assert.equal(runProjectKit([...args, ...flags], repositoryRoot).status, 1);
        assert.equal(await fs.readFile(workspace.briefPath, "utf8"), workspace.original);
    }
});

test("malformed index regions fail before a brief is created or updated", async (t) => {
    const workspace = await createReadyFeatureWorkspace();
    t.after(async () => { await fs.rm(workspace.target, { recursive: true, force: true }); });
    const malformed = "# Index\n\n<!-- project-kit:features:active:start -->\nMaintained text.\n";
    await fs.writeFile(workspace.indexPath, malformed);
    const updated = runProjectKit(["feature", "update", "--target", workspace.target, "--slug", "account-sync", "--status", "archived", "--archive-reason", "Closed"], repositoryRoot);
    const created = runProjectKit(["feature", "create", "--target", workspace.target, "--name", "New sync"], repositoryRoot);
    assert.equal(updated.status, 1);
    assert.equal(created.status, 1);
    assert.equal(await fs.readFile(workspace.briefPath, "utf8"), workspace.original);
    assert.equal(await fs.readFile(workspace.indexPath, "utf8"), malformed);
    assert.equal(await pathExists(path.join(workspace.target, ".project", "features", "new-sync.md")), false);
});

test("archiving a legacy record adds disposition without normalizing its historical body", async (t) => {
    const workspace = await createReadyFeatureWorkspace();
    t.after(async () => { await fs.rm(workspace.target, { recursive: true, force: true }); });
    const historical = "# Account sync\n\n## D-007\n\nOriginal approval and [evidence](../reviews/account.md).\n";
    await fs.writeFile(workspace.briefPath, historical);
    const result = runProjectKit(["feature", "update", "--target", workspace.target, "--slug", "account-sync", "--status", "archived", "--archive-reason", "Historical implementation"], repositoryRoot);
    assert.equal(result.status, 0, result.stderr);
    const archived = await fs.readFile(workspace.briefPath, "utf8");
    assert.ok(archived.startsWith(historical));
    assert.ok(archived.includes("- Status: archived"));
    assert.equal(runProjectKit(["feature", "check", "--target", workspace.target, "--slug", "account-sync"], repositoryRoot).status, 1);
});

test("align preserves adopted history and feature lifecycle metadata", async (t) => {
    const workspace = await createReadyFeatureWorkspace();
    t.after(async () => { await fs.rm(workspace.target, { recursive: true, force: true }); });
    const archive = runProjectKit(["feature", "update", "--target", workspace.target, "--slug", "account-sync", "--status", "archived", "--archive-reason", "Reviewed"], repositoryRoot);
    assert.equal(archive.status, 0, archive.stderr);
    const decisionsPath = path.join(workspace.target, ".project", "decisions.md");
    const history = "# Accepted decisions\n\n## D-001 — Original rule\n\nPreserve this accepted text.\n";
    await fs.writeFile(decisionsPath, history);
    const brief = await fs.readFile(workspace.briefPath, "utf8");
    const index = await fs.readFile(workspace.indexPath, "utf8");
    const aligned = runScaffold(["--mode", "align", "--target", workspace.target, "--project-name", "Account", "--description", "Account synchronization", "--primary-language", "TypeScript", "--stack", "TypeScript"], repositoryRoot);
    assert.equal(aligned.status, 0, aligned.stderr);
    assert.equal(await fs.readFile(decisionsPath, "utf8"), history);
    assert.equal(await fs.readFile(workspace.briefPath, "utf8"), brief);
    assert.equal(await fs.readFile(workspace.indexPath, "utf8"), index);
});
