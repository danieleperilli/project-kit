const assert = require("node:assert/strict") as typeof import("node:assert/strict");
const childProcess = require("node:child_process") as typeof import("node:child_process");
const fs = require("node:fs/promises") as typeof import("node:fs/promises");
const os = require("node:os") as typeof import("node:os");
const path = require("node:path") as typeof import("node:path");
const test = require("node:test") as typeof import("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const cliPath = path.join(repositoryRoot, "bin", "project-kit.js");
const scaffoldBinPath = path.join(repositoryRoot, "bin", "project-kit-scaffold.js");

/**
 * Run the public scaffold CLI and capture the result.
 * @param {string[]} args
 * @param {string} cwd
 */
function runScaffold(args: string[], cwd: string): childProcess.SpawnSyncReturns<string> {
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
function runProjectKit(args: string[], cwd: string): childProcess.SpawnSyncReturns<string> {
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
    const contributing = await fs.readFile(path.join(targetPath, "CONTRIBUTING.md"), "utf8");
    const readme = await fs.readFile(path.join(targetPath, "README.md"), "utf8");
    const reviewChecklist = await fs.readFile(path.join(targetPath, ".project", "review-checklist.md"), "utf8");
    const featureIndex = await fs.readFile(path.join(targetPath, ".project", "features", "index.md"), "utf8");
    const featureBrief = await fs.readFile(path.join(targetPath, ".project", "features", "user-authentication.md"), "utf8");

    assert.equal(packageJson.name, "demo-kit");
    assert.equal(packageJson.version, "0.1.0");
    assert.equal(projectConfig.primaryLanguage, "TypeScript");
    assert.equal(projectConfig.originalPromptEnglish, "Build a browser-only tool that creates and edits SVG maps for Power BI.");
    assert.deepEqual(projectConfig.features, ["User authentication", "Usage reporting"]);
    assert.match(agents, /## Context Loading/);
    assert.match(agents, /default `project_doc_max_bytes` limit of 32 KiB \(32,768 bytes\)/);
    assert.ok(Buffer.byteLength(agents, "utf8") < 32768, "Generated AGENTS.md must remain below Codex's default 32 KiB project instruction limit.");
    assert.match(agents, /For non-trivial implementation work, also read `\.project\/overview\.md`, `\.project\/architecture\.md`, and `\.project\/constraints\.md` before editing/);
    assert.match(agents, /only `Unreleased` unless history is requested/);
    assert.match(agents, /## Anti-Overengineering Gate/);
    assert.match(agents, /## Delivery Readiness/);
    assert.match(agents, /project-kit feature check --slug <feature-slug>/);
    assert.match(agents, /functional provisional UI for validation/);
    assert.match(agents, /Security and correctness take precedence over simplicity/);
    assert.doesNotMatch(agents, /## Read Order/);
    assert.match(contributing, /## Context Loading/);
    assert.match(contributing, /For non-trivial implementation work, also read `\.project\/overview\.md`, `\.project\/architecture\.md`, and `\.project\/constraints\.md` before editing/);
    assert.match(contributing, /`CODE_STYLE\.md`: before source edits, if present/);
    assert.match(readme, /review-gated/);
    assert.match(reviewChecklist, /## Simplicity And Necessity/);
    assert.match(reviewChecklist, /## Readiness And Batch Contract/);
    assert.match(reviewChecklist, /actual local user journey exercised/);
    assert.match(reviewChecklist, /smallest change that fully satisfies the current requirement/);
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

    assert.match(featureIndex, /Create a discovery brief just in time when the next feature is selected/);
    assert.deepEqual(featureEntries.sort(), ["index.md"]);
    assert.deepEqual(projectConfig.features, []);
    assert.deepEqual(projectConfig.stack, ["TypeScript", "React"]);
    assert.equal(projectConfig.originalPromptEnglish, undefined);
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

    assert.match(featureIndex, /Create a discovery brief just in time when the next feature is selected/);
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
