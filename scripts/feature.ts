const fs = require("node:fs/promises") as typeof import("node:fs/promises");
const path = require("node:path") as typeof import("node:path");
const featureBrief = require("./feature-brief.ts") as typeof import("./feature-brief");

interface IFeatureCommandOptions {
    command: "create" | "update" | "check" | "list";
    target: string;
    name: string | null;
    slug: string | null;
    renameSlug: string | null;
    force: boolean;
    input: IFeatureBriefInput;
}

interface IFeatureBriefInput {
    status?: FeatureStatus;
    approvalEvidence?: string | null;
    approvedDecisions?: string[];
    openDecisions?: string[];
    problem?: string | null;
    outcome?: string | null;
    behavior?: string[];
    inScope?: string[];
    outOfScope?: string[];
    currentBatch?: string | null;
    modules?: string[];
    persistenceImpact?: string | null;
    apiImpact?: string | null;
    configurationImpact?: string | null;
    uiImpact?: string | null;
    uiMaturity?: UiMaturity;
    designAssets?: string[];
    designFlows?: string[];
    designSources?: string[];
    acceptance?: string[];
    tests?: string[];
    verification?: string[];
    followUps?: string[];
    risks?: string[];
}

interface IFeatureEntry {
    slug: string;
    title: string;
    status: FeatureStatus;
    path: string;
}

interface IGoalFields {
    problem: string | null;
    outcome: string | null;
}

interface IDesignReferenceFields {
    designAssets: string[];
    designFlows: string[];
    designSources: string[];
}

interface IReadinessFields {
    status: FeatureStatus;
    approvalEvidence: string | null;
    approvedDecisions: string[];
    openDecisions: string[];
}

interface IChangeContractFields {
    persistenceImpact: string | null;
    apiImpact: string | null;
    configurationImpact: string | null;
    uiImpact: string | null;
    uiMaturity: UiMaturity;
}

type FeatureStatus = "discovery" | "ready";
type UiMaturity = "unassessed" | "none" | "final" | "provisional";

const HELP_FLAGS = new Set(["--help", "-h"]);
const SLUG_PATTERN = /^[a-z0-9._-]+$/;

/**
 * Check whether the current CLI invocation should print the help output.
 * @param {string[]} argv
 */
function shouldShowHelp(argv: string[]): boolean {
    return argv.length === 0 || argv.some((token) => HELP_FLAGS.has(token));
}

/**
 * Build the feature command help output.
 */
function buildHelpText(): string {
    return [
        "Project Kit Feature",
        "",
        "Manage discovery and implementation-ready feature briefs without rerunning init or align.",
        "",
        "Usage:",
        "  project-kit feature <create|update|check|list> [options]",
        "",
        "Options:",
        "  --target <path>               Target repository path. Defaults to the current working directory.",
        "  --name <name>                 Feature name for create, or updated title for update.",
        "  --slug <slug>                 Existing feature slug for update or check.",
        "  --rename-slug <slug>          Rename the feature file during update.",
        "  --status <discovery|ready>    Feature delivery readiness.",
        "  --approval <text>             Evidence of the user's batch approval.",
        "  --approved-decisions <a,b>    Comma-separated decisions approved for this batch.",
        "  --open-decisions <a,b|none>   Blocking decisions; use none after they are resolved.",
        "  --problem <text>              Goal problem statement.",
        "  --outcome <text>              Goal primary outcome.",
        "  --behavior <a,b,c>            Comma-separated user-visible behavior bullets.",
        "  --in-scope <a,b,c>            Comma-separated in-scope bullets.",
        "  --out-of-scope <a,b,c>        Comma-separated out-of-scope bullets.",
        "  --batch <text>                One risk-focused implementation batch.",
        "  --modules <a,b,c>             Comma-separated modules involved.",
        "  --persistence-impact <text>   Persistence changes, or None.",
        "  --api-impact <text>           API or contract changes, or None.",
        "  --config-impact <text>        Configuration and resource changes, or None.",
        "  --ui-impact <text>            UI changes, or None.",
        "  --ui-maturity <value>         One of unassessed, none, final, or provisional.",
        "  --design-assets <a,b,c>       Comma-separated local design asset references.",
        "  --design-flows <a,b,c>        Comma-separated flow notes.",
        "  --design-sources <a,b,c>      Comma-separated remote design sources.",
        "  --acceptance <a,b,c>          Comma-separated acceptance criteria.",
        "  --tests <a,b,c>               Comma-separated test expectations.",
        "  --verification <a,b,c>        Comma-separated local user-journey checks.",
        "  --follow-ups <a,b,c>          Comma-separated required follow-up tasks.",
        "  --risks <a,b,c>               Comma-separated risks and review focus notes.",
        "  --force                       Overwrite an existing file during create, or allow overwrite when renaming.",
        "  --help, -h                    Show this message.",
        "",
        "Examples:",
        "  project-kit feature create --name \"User authentication\"",
        "  project-kit feature create --name \"Billing dashboard\" --design-assets billing-dashboard.png,billing-dashboard.annotated.png --acceptance \"Shows invoice totals,Shows overdue state\"",
        "  project-kit feature update --slug user-authentication --status ready --approval \"User approved the session-boundary batch\" --batch \"Implement the session boundary\" --acceptance \"Can sign in,Can sign out\" --tests \"Add auth controller tests\"",
        "  project-kit feature check --slug user-authentication",
        "  project-kit feature update --slug billing-dashboard --name \"Billing overview\" --rename-slug billing-overview",
        "  project-kit feature list"
    ].join("\n");
}

/**
 * Parse a comma-separated list.
 * @param {string | undefined} value
 */
function parseList(value: string | undefined): string[] | undefined {
    if (!value) {
        return undefined;
    }

    const items = value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);

    return items.length > 0 ? items : undefined;
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

/**
 * Validate a feature slug before it is used in a file path.
 * @param {string} slug
 * @param {string} flagName
 */
function validateSlug(slug: string, flagName: string): void {
    if (!SLUG_PATTERN.test(slug)) {
        throw new Error(`Invalid ${flagName} value: ${slug}. Use lowercase letters, numbers, ".", "_", or "-".`);
    }
}

/**
 * Parse section input flags into a feature brief payload.
 * @param {Map<string, string>} values
 */
function parseFeatureInput(values: Map<string, string>): IFeatureBriefInput {
    const status = values.get("status");
    const uiMaturity = values.get("ui-maturity");
    const openDecisions = values.get("open-decisions");

    if (status && status !== "discovery" && status !== "ready") {
        throw new Error(`Invalid --status value: ${status}. Use discovery or ready.`);
    }

    if (uiMaturity && uiMaturity !== "unassessed" && uiMaturity !== "none" && uiMaturity !== "final" && uiMaturity !== "provisional") {
        throw new Error(`Invalid --ui-maturity value: ${uiMaturity}. Use unassessed, none, final, or provisional.`);
    }

    return {
        status: status as FeatureStatus | undefined,
        approvalEvidence: values.get("approval") ?? undefined,
        approvedDecisions: parseList(values.get("approved-decisions")),
        openDecisions: openDecisions?.trim().toLowerCase() === "none" ? [] : parseList(openDecisions),
        problem: values.get("problem") ?? undefined,
        outcome: values.get("outcome") ?? undefined,
        behavior: parseList(values.get("behavior")),
        inScope: parseList(values.get("in-scope")),
        outOfScope: parseList(values.get("out-of-scope")),
        currentBatch: values.get("batch") ?? undefined,
        modules: parseList(values.get("modules")),
        persistenceImpact: values.get("persistence-impact") ?? undefined,
        apiImpact: values.get("api-impact") ?? undefined,
        configurationImpact: values.get("config-impact") ?? undefined,
        uiImpact: values.get("ui-impact") ?? undefined,
        uiMaturity: uiMaturity as UiMaturity | undefined,
        designAssets: parseList(values.get("design-assets")),
        designFlows: parseList(values.get("design-flows")),
        designSources: parseList(values.get("design-sources")),
        acceptance: parseList(values.get("acceptance")),
        tests: parseList(values.get("tests")),
        verification: parseList(values.get("verification")),
        followUps: parseList(values.get("follow-ups")),
        risks: parseList(values.get("risks"))
    };
}

/**
 * Parse feature command arguments.
 * @param {string[]} argv
 * @param {string} cwd
 */
function parseArgs(argv: string[], cwd: string): IFeatureCommandOptions {
    const values = new Map<string, string>();
    const flags = new Set<string>();
    const positional: string[] = [];

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];

        if (!token.startsWith("--")) {
            positional.push(token);
            continue;
        }

        const key = token.slice(2);
        const nextToken = argv[index + 1];

        if (!nextToken || nextToken.startsWith("--")) {
            flags.add(key);
            continue;
        }

        values.set(key, nextToken);
        index += 1;
    }

    const command = positional[0];

    if (command !== "create" && command !== "update" && command !== "check" && command !== "list") {
        throw new Error("Missing or invalid feature command. Use create, update, check, or list.");
    }

    const target = values.get("target") ? path.resolve(cwd, values.get("target") as string) : cwd;
    const name = values.get("name") ?? null;
    const slug = values.get("slug") ?? null;
    const renameSlug = values.get("rename-slug") ?? null;

    if (slug) {
        validateSlug(slug, "--slug");
    }

    if (renameSlug) {
        validateSlug(renameSlug, "--rename-slug");
    }

    if (command === "create" && !name) {
        throw new Error("Missing required create metadata: --name.");
    }

    if ((command === "update" || command === "check") && !slug) {
        throw new Error(`Missing required ${command} metadata: --slug.`);
    }

    return {
        command,
        target,
        name,
        slug,
        renameSlug,
        force: flags.has("force"),
        input: parseFeatureInput(values)
    };
}

/**
 * Return the feature directory path for a repository.
 * @param {string} targetRoot
 */
function getFeatureDirectory(targetRoot: string): string {
    return path.join(targetRoot, ".project", "features");
}

/**
 * Return the feature index path for a repository.
 * @param {string} targetRoot
 */
function getFeatureIndexPath(targetRoot: string): string {
    return path.join(getFeatureDirectory(targetRoot), "index.md");
}

/**
 * Ensure the repository already contains the Project Kit feature workspace.
 * @param {string} targetRoot
 */
async function ensureFeatureWorkspace(targetRoot: string): Promise<void> {
    const featureDirectory = getFeatureDirectory(targetRoot);

    if (!(await pathExists(featureDirectory))) {
        throw new Error(`Feature workspace not found in ${targetRoot}. Run init or align first.`);
    }
}

/**
 * Escape a string so it can be used inside a regular expression.
 * @param {string} value
 */
function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Read the content of one markdown section body.
 * @param {string} document
 * @param {string} heading
 */
function readSectionBody(document: string, heading: string): string {
    const body = readOptionalSectionBody(document, heading);

    if (body === null) {
        throw new Error(`Section not found in feature brief: ${heading}.`);
    }

    return body;
}

/**
 * Read a markdown section body when it exists.
 * @param {string} document
 * @param {string} heading
 */
function readOptionalSectionBody(document: string, heading: string): string | null {
    const pattern = new RegExp(`^## ${escapeRegExp(heading)}\\n\\n([\\s\\S]*?)(?=\\n## |(?![\\s\\S]))`, "m");
    const match = document.match(pattern);

    if (!match) {
        return null;
    }

    return match[1].trimEnd();
}

/**
 * Replace one markdown section body while preserving the rest of the document.
 * @param {string} document
 * @param {string} heading
 * @param {string} body
 */
function replaceSectionBody(document: string, heading: string, body: string): string {
    const pattern = new RegExp(`(^## ${escapeRegExp(heading)}\\n\\n)([\\s\\S]*?)(?=\\n## |(?![\\s\\S]))`, "m");

    if (!pattern.test(document)) {
        throw new Error(`Section not found in feature brief: ${heading}.`);
    }

    return document.replace(pattern, (_match: string, prefix: string) => `${prefix}${body.trimEnd()}\n\n`);
}

/**
 * Add delivery sections to feature briefs created by earlier Project Kit versions.
 * @param {string} document
 */
function ensureFeatureDeliverySections(document: string): string {
    let updatedDocument = document;

    if (readOptionalSectionBody(updatedDocument, "Readiness") === null) {
        updatedDocument = updatedDocument.replace(/^## Goal$/m, `## Readiness\n\n${featureBrief.buildReadinessSection(undefined, undefined, undefined, undefined)}\n\n## Goal`);
    }

    if (readOptionalSectionBody(updatedDocument, "Current batch") === null) {
        updatedDocument = updatedDocument.replace(/^## Modules involved$/m, `## Current batch\n\n${featureBrief.buildCurrentBatchSection(undefined)}\n\n## Modules involved`);
    }

    if (readOptionalSectionBody(updatedDocument, "Change contract") === null) {
        updatedDocument = updatedDocument.replace(/^## Design references$/m, `## Change contract\n\n${featureBrief.buildChangeContractSection(undefined, undefined, undefined, undefined, undefined)}\n\n## Design references`);
    }

    if (readOptionalSectionBody(updatedDocument, "Local verification") === null) {
        updatedDocument = updatedDocument.replace(/^## Risks and review focus$/m, `## Local verification\n\n${featureBrief.buildBulletSection(undefined, "")}\n\n## Risks and review focus`);
    }

    if (readOptionalSectionBody(updatedDocument, "Required follow-up tasks") === null) {
        updatedDocument = updatedDocument.replace(/^## Risks and review focus$/m, `## Required follow-up tasks\n\n${featureBrief.buildBulletSection(undefined, "")}\n\n## Risks and review focus`);
    }

    return updatedDocument;
}

/**
 * Parse the current goal fields from a feature brief document.
 * @param {string} document
 */
function readGoalFields(document: string): IGoalFields {
    const body = readSectionBody(document, "Goal");
    const lines = body.split("\n").map((line) => line.trim());

    return {
        problem: readSingleField(lines, "- Problem solved:"),
        outcome: readSingleField(lines, "- Primary outcome:")
    };
}

/**
 * Parse the current design reference fields from a feature brief document.
 * @param {string} document
 */
function readDesignReferenceFields(document: string): IDesignReferenceFields {
    const body = readSectionBody(document, "Design references");
    const lines = body.split("\n").map((line) => line.trim());

    return {
        designAssets: readListField(lines, "- Local assets:"),
        designFlows: readListField(lines, "- Flow notes:"),
        designSources: readListField(lines, "- Remote sources:")
    };
}

/**
 * Parse the current readiness fields from a feature brief document.
 * @param {string} document
 */
function readReadinessFields(document: string): IReadinessFields {
    const body = readSectionBody(document, "Readiness");
    const lines = body.split("\n").map((line) => line.trim());
    const status = readSingleField(lines, "- Status:");

    return {
        status: status === "ready" ? "ready" : "discovery",
        approvalEvidence: readSingleField(lines, "- Approval evidence:"),
        approvedDecisions: readListField(lines, "- Approved decisions:"),
        openDecisions: readListField(lines, "- Open decisions:")
    };
}

/**
 * Parse the current change contract from a feature brief document.
 * @param {string} document
 */
function readChangeContractFields(document: string): IChangeContractFields {
    const body = readSectionBody(document, "Change contract");
    const lines = body.split("\n").map((line) => line.trim());
    const uiMaturity = readSingleField(lines, "- UI maturity:");

    return {
        persistenceImpact: readSingleField(lines, "- Persistence:"),
        apiImpact: readSingleField(lines, "- APIs:"),
        configurationImpact: readSingleField(lines, "- Configuration and resources:"),
        uiImpact: readSingleField(lines, "- UI:"),
        uiMaturity: uiMaturity === "none" || uiMaturity === "final" || uiMaturity === "provisional" ? uiMaturity : "unassessed"
    };
}

/**
 * Extract one scalar field from a markdown bullet line.
 * @param {string[]} lines
 * @param {string} prefix
 */
function readSingleField(lines: string[], prefix: string): string | null {
    const line = lines.find((candidate) => candidate.startsWith(prefix));

    if (!line) {
        return null;
    }

    const value = line.slice(prefix.length).trim();

    return value.length > 0 ? value : null;
}

/**
 * Extract a semicolon-separated list field from a markdown bullet line.
 * @param {string[]} lines
 * @param {string} prefix
 */
function readListField(lines: string[], prefix: string): string[] {
    const rawValue = readSingleField(lines, prefix);

    if (!rawValue) {
        return [];
    }

    return rawValue
        .split(";")
        .map((entry) => entry.trim())
        .filter(Boolean);
}

/**
 * Replace the top-level title of a feature brief document.
 * @param {string} document
 * @param {string} title
 */
function replaceTitle(document: string, title: string): string {
    return document.replace(/^# .+$/m, `# ${title}`);
}

/**
 * Check whether the update payload includes at least one document change.
 * @param {IFeatureCommandOptions} options
 */
function hasDocumentChanges(options: IFeatureCommandOptions): boolean {
    const inputValues = Object.values(options.input);

    return Boolean(options.name || options.renameSlug || inputValues.some((value) => value !== undefined));
}

/**
 * Apply update flags to an existing feature brief document.
 * @param {string} document
 * @param {IFeatureCommandOptions} options
 */
function applyFeatureUpdates(document: string, options: IFeatureCommandOptions): string {
    let updatedDocument = ensureFeatureDeliverySections(document);

    if (options.name) {
        updatedDocument = replaceTitle(updatedDocument, options.name);
    }

    if (options.input.status !== undefined || options.input.approvalEvidence !== undefined || options.input.approvedDecisions !== undefined || options.input.openDecisions !== undefined) {
        const currentReadiness = readReadinessFields(updatedDocument);
        updatedDocument = replaceSectionBody(
            updatedDocument,
            "Readiness",
            featureBrief.buildReadinessSection(
                options.input.status ?? currentReadiness.status,
                options.input.approvalEvidence !== undefined ? options.input.approvalEvidence : currentReadiness.approvalEvidence,
                options.input.approvedDecisions ?? currentReadiness.approvedDecisions,
                options.input.openDecisions ?? currentReadiness.openDecisions
            )
        );
    }

    if (options.input.problem !== undefined || options.input.outcome !== undefined) {
        const currentGoal = readGoalFields(updatedDocument);
        updatedDocument = replaceSectionBody(
            updatedDocument,
            "Goal",
            featureBrief.buildGoalSection(
                options.input.problem !== undefined ? options.input.problem : currentGoal.problem,
                options.input.outcome !== undefined ? options.input.outcome : currentGoal.outcome
            )
        );
    }

    if (options.input.behavior) {
        updatedDocument = replaceSectionBody(
            updatedDocument,
            "User-visible behavior",
            featureBrief.buildBulletSection(options.input.behavior, "Describe the behavior in terms the reviewer can verify.")
        );
    }

    if (options.input.inScope) {
        updatedDocument = replaceSectionBody(updatedDocument, "In scope", featureBrief.buildBulletSection(options.input.inScope, ""));
    }

    if (options.input.outOfScope) {
        updatedDocument = replaceSectionBody(updatedDocument, "Out of scope", featureBrief.buildBulletSection(options.input.outOfScope, ""));
    }

    if (options.input.currentBatch !== undefined) {
        updatedDocument = replaceSectionBody(updatedDocument, "Current batch", featureBrief.buildCurrentBatchSection(options.input.currentBatch));
    }

    if (options.input.modules) {
        updatedDocument = replaceSectionBody(updatedDocument, "Modules involved", featureBrief.buildBulletSection(options.input.modules, ""));
    }

    if (options.input.persistenceImpact !== undefined || options.input.apiImpact !== undefined || options.input.configurationImpact !== undefined || options.input.uiImpact !== undefined || options.input.uiMaturity !== undefined) {
        const currentChangeContract = readChangeContractFields(updatedDocument);
        updatedDocument = replaceSectionBody(
            updatedDocument,
            "Change contract",
            featureBrief.buildChangeContractSection(
                options.input.persistenceImpact !== undefined ? options.input.persistenceImpact : currentChangeContract.persistenceImpact,
                options.input.apiImpact !== undefined ? options.input.apiImpact : currentChangeContract.apiImpact,
                options.input.configurationImpact !== undefined ? options.input.configurationImpact : currentChangeContract.configurationImpact,
                options.input.uiImpact !== undefined ? options.input.uiImpact : currentChangeContract.uiImpact,
                options.input.uiMaturity ?? currentChangeContract.uiMaturity
            )
        );
    }

    if (options.input.designAssets || options.input.designFlows || options.input.designSources) {
        const currentDesignReferences = readDesignReferenceFields(updatedDocument);
        updatedDocument = replaceSectionBody(
            updatedDocument,
            "Design references",
            featureBrief.buildDesignReferencesSection(
                options.input.designAssets ?? currentDesignReferences.designAssets,
                options.input.designFlows ?? currentDesignReferences.designFlows,
                options.input.designSources ?? currentDesignReferences.designSources
            )
        );
    }

    if (options.input.acceptance) {
        updatedDocument = replaceSectionBody(updatedDocument, "Acceptance criteria", featureBrief.buildBulletSection(options.input.acceptance, ""));
    }

    if (options.input.tests) {
        updatedDocument = replaceSectionBody(updatedDocument, "Test expectations", featureBrief.buildBulletSection(options.input.tests, ""));
    }

    if (options.input.verification) {
        updatedDocument = replaceSectionBody(updatedDocument, "Local verification", featureBrief.buildBulletSection(options.input.verification, ""));
    }

    if (options.input.followUps) {
        updatedDocument = replaceSectionBody(updatedDocument, "Required follow-up tasks", featureBrief.buildBulletSection(options.input.followUps, ""));
    }

    if (options.input.risks) {
        updatedDocument = replaceSectionBody(updatedDocument, "Risks and review focus", featureBrief.buildBulletSection(options.input.risks, ""));
    }

    return updatedDocument;
}

/**
 * Read the current feature brief entries from the repository.
 * @param {string} targetRoot
 */
async function readFeatureEntries(targetRoot: string): Promise<IFeatureEntry[]> {
    const featureDirectory = getFeatureDirectory(targetRoot);
    const entries = await fs.readdir(featureDirectory, { withFileTypes: true });
    const featureFiles = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name !== "index.md")
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right));
    const featureEntries: IFeatureEntry[] = [];

    for (const fileName of featureFiles) {
        const featurePath = path.join(featureDirectory, fileName);
        const document = await fs.readFile(featurePath, "utf8");
        const titleMatch = document.match(/^# (.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : path.basename(featurePath, ".md");
        const readinessBody = readOptionalSectionBody(document, "Readiness");
        const status = readinessBody === null ? "discovery" : readReadinessFields(document).status;

        featureEntries.push({
            slug: fileName.slice(0, -3),
            title,
            status,
            path: featurePath
        });
    }

    featureEntries.sort((left, right) => left.title.localeCompare(right.title));

    return featureEntries;
}

/**
 * Render the feature index summary list from actual feature files.
 * @param {IFeatureEntry[]} featureEntries
 */
function buildFeatureIndexSummary(featureEntries: IFeatureEntry[]): string {
    if (featureEntries.length === 0) {
        return "- Create a discovery brief just in time when the next feature is selected.";
    }

    return featureEntries
        .map((featureEntry) => `- [${featureEntry.title}](./${featureEntry.slug}.md)`)
        .join("\n");
}

/**
 * Keep the feature index aligned with the actual feature brief files.
 * @param {string} skillRoot
 * @param {string} targetRoot
 */
async function syncFeatureIndex(skillRoot: string, targetRoot: string): Promise<void> {
    const indexPath = getFeatureIndexPath(targetRoot);
    const templatePath = path.join(skillRoot, "templates", "base", ".project", "features", "index.md");
    const template = await fs.readFile(templatePath, "utf8");
    const featureEntries = await readFeatureEntries(targetRoot);
    const summary = buildFeatureIndexSummary(featureEntries);
    const renderedTemplate = template.replaceAll("{{featureIndexSummary}}", summary);

    if (!(await pathExists(indexPath))) {
        await fs.writeFile(indexPath, renderedTemplate, "utf8");
        return;
    }

    const currentDocument = await fs.readFile(indexPath, "utf8");

    if (!/^## Active Feature Briefs$/m.test(currentDocument)) {
        await fs.writeFile(indexPath, renderedTemplate, "utf8");
        return;
    }

    const nextDocument = replaceSectionBody(currentDocument, "Active Feature Briefs", summary);

    await fs.writeFile(indexPath, nextDocument, "utf8");
}

/**
 * Create one feature brief file and refresh the feature index.
 * @param {string} skillRoot
 * @param {IFeatureCommandOptions} options
 */
async function createFeature(skillRoot: string, options: IFeatureCommandOptions): Promise<void> {
    const featureName = options.name as string;
    const featureSlug = featureBrief.buildFeatureSlug(featureName);
    const featurePath = path.join(getFeatureDirectory(options.target), `${featureSlug}.md`);

    if (await pathExists(featurePath)) {
        if (!options.force) {
            throw new Error(`Feature brief already exists: ${featurePath}. Use --force to overwrite it.`);
        }
    }

    const document = `${featureBrief.buildFeatureBriefDocument(featureName, options.input)}\n`;

    await fs.writeFile(featurePath, document, "utf8");
    await syncFeatureIndex(skillRoot, options.target);
    process.stdout.write(`Created feature brief ${featureSlug} in ${featurePath}.\n`);
}

/**
 * Update one feature brief file and refresh the feature index.
 * @param {string} skillRoot
 * @param {IFeatureCommandOptions} options
 */
async function updateFeature(skillRoot: string, options: IFeatureCommandOptions): Promise<void> {
    const currentSlug = options.slug as string;
    const featureDirectory = getFeatureDirectory(options.target);
    const currentPath = path.join(featureDirectory, `${currentSlug}.md`);

    if (!(await pathExists(currentPath))) {
        throw new Error(`Feature brief not found: ${currentPath}.`);
    }

    if (!hasDocumentChanges(options)) {
        throw new Error("No update flags were provided. Pass at least one field to update.");
    }

    const currentDocument = await fs.readFile(currentPath, "utf8");
    const updatedDocument = `${applyFeatureUpdates(currentDocument, options).trimEnd()}\n`;
    const nextSlug = options.renameSlug ?? currentSlug;
    const nextPath = path.join(featureDirectory, `${nextSlug}.md`);

    if (nextPath !== currentPath && await pathExists(nextPath) && !options.force) {
        throw new Error(`Feature brief already exists: ${nextPath}. Use --force to overwrite it.`);
    }

    if (nextPath !== currentPath) {
        await fs.writeFile(nextPath, updatedDocument, "utf8");
        await fs.rm(currentPath);
    } else {
        await fs.writeFile(currentPath, updatedDocument, "utf8");
    }

    await syncFeatureIndex(skillRoot, options.target);
    process.stdout.write(nextPath === currentPath ?
        `Updated feature brief ${currentSlug} in ${currentPath}.\n` :
        `Updated feature brief ${currentSlug} and renamed it to ${nextSlug}.\n`);
}

/**
 * Read non-empty bullet values from one feature brief section.
 * @param {string} document
 * @param {string} heading
 */
function readBulletItems(document: string, heading: string): string[] {
    const body = readOptionalSectionBody(document, heading);

    if (body === null) {
        return [];
    }

    return body
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("- "))
        .map((line) => line.slice(2).trim())
        .filter(Boolean);
}

/**
 * Validate whether one feature brief is ready for implementation.
 * @param {string} document
 */
function validateFeatureReadiness(document: string): string[] {
    const issues: string[] = [];
    const readinessBody = readOptionalSectionBody(document, "Readiness");
    const goalBody = readOptionalSectionBody(document, "Goal");
    const changeContractBody = readOptionalSectionBody(document, "Change contract");
    const behavior = readBulletItems(document, "User-visible behavior").filter((item) => item !== "Describe the behavior in terms the reviewer can verify.");
    const inScope = readBulletItems(document, "In scope");
    const outOfScope = readBulletItems(document, "Out of scope");
    const currentBatch = readBulletItems(document, "Current batch");
    const modules = readBulletItems(document, "Modules involved");
    const acceptance = readBulletItems(document, "Acceptance criteria");
    const tests = readBulletItems(document, "Test expectations");
    const verification = readBulletItems(document, "Local verification");
    const followUps = readBulletItems(document, "Required follow-up tasks");
    const risks = readBulletItems(document, "Risks and review focus");

    if (readinessBody === null) {
        issues.push("Add the Readiness section by updating the brief with the current Project Kit version.");
    } else {
        const readiness = readReadinessFields(document);

        if (readiness.status !== "ready") {
            issues.push("Set Readiness status to ready after the batch contract is approved.");
        }

        if (!readiness.approvalEvidence) {
            issues.push("Record evidence of the user's approval for this exact batch contract.");
        }

        if (readiness.openDecisions.length > 0) {
            issues.push(`Resolve or remove open decisions: ${readiness.openDecisions.join("; ")}.`);
        }
    }

    if (goalBody === null) {
        issues.push("Add the Goal section.");
    } else {
        const goal = readGoalFields(document);

        if (!goal.problem || !goal.outcome) {
            issues.push("Define both the problem solved and the primary outcome.");
        }
    }

    if (behavior.length === 0) {
        issues.push("Define verifiable user-visible behavior, including an explicit no-user-visible-change statement when applicable.");
    }

    if (inScope.length === 0 || outOfScope.length === 0) {
        issues.push("Define both in-scope and out-of-scope boundaries; use an explicit None when appropriate.");
    }

    if (currentBatch.length !== 1) {
        issues.push("Define exactly one current implementation batch.");
    }

    if (modules.length === 0) {
        issues.push("Identify the modules involved in the current batch.");
    }

    if (changeContractBody === null) {
        issues.push("Add the Change contract section.");
    } else {
        const changeContract = readChangeContractFields(document);

        if (!changeContract.persistenceImpact || !changeContract.apiImpact || !changeContract.configurationImpact || !changeContract.uiImpact) {
            issues.push("Make persistence, API, configuration/resource, and UI impacts explicit; use None where applicable.");
        }

        if (changeContract.uiMaturity === "unassessed") {
            issues.push("Set UI maturity to none, final, or provisional.");
        }

        if (changeContract.uiMaturity === "provisional" && followUps.length === 0) {
            issues.push("Add a final UI refinement task before treating a provisional UI feature as complete.");
        }
    }

    if (acceptance.length === 0 || tests.length === 0 || verification.length === 0 || risks.length === 0) {
        issues.push("Define acceptance criteria, test expectations, local verification, and review risks; use an explicit None with a reason when appropriate.");
    }

    return issues;
}

/**
 * Check whether one feature brief is ready for implementation without changing it.
 * @param {IFeatureCommandOptions} options
 */
async function checkFeature(options: IFeatureCommandOptions): Promise<void> {
    const slug = options.slug as string;
    const featurePath = path.join(getFeatureDirectory(options.target), `${slug}.md`);

    if (!(await pathExists(featurePath))) {
        throw new Error(`Feature brief not found: ${featurePath}.`);
    }

    const document = await fs.readFile(featurePath, "utf8");
    const issues = validateFeatureReadiness(document);

    if (issues.length > 0) {
        throw new Error([`Feature brief ${slug} is not ready:`, ...issues.map((issue) => `- ${issue}`)].join("\n"));
    }

    process.stdout.write(`Feature brief ${slug} is ready for one implementation batch.\n`);
}

/**
 * List the current feature brief files.
 * @param {string} targetRoot
 */
async function listFeatures(targetRoot: string): Promise<void> {
    const featureEntries = await readFeatureEntries(targetRoot);

    if (featureEntries.length === 0) {
        process.stdout.write(`No feature briefs found in ${getFeatureDirectory(targetRoot)}.\n`);
        return;
    }

    const lines = [
        `Feature briefs in ${getFeatureDirectory(targetRoot)}:`,
        ...featureEntries.map((featureEntry) => `- ${featureEntry.slug} :: ${featureEntry.title} [${featureEntry.status}]`)
    ];

    process.stdout.write(`${lines.join("\n")}\n`);
}

/**
 * Run the requested feature command.
 */
async function main(): Promise<void> {
    const cwd = process.cwd();
    const argv = process.argv.slice(2);

    if (shouldShowHelp(argv)) {
        process.stdout.write(`${buildHelpText()}\n`);
        return;
    }

    const options = parseArgs(argv, cwd);
    const skillRoot = path.resolve(__dirname, "..");

    await ensureFeatureWorkspace(options.target);

    if (options.command === "create") {
        await createFeature(skillRoot, options);
        return;
    }

    if (options.command === "update") {
        await updateFeature(skillRoot, options);
        return;
    }

    if (options.command === "check") {
        await checkFeature(options);
        return;
    }

    await listFeatures(options.target);
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
});
