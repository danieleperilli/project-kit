const fs = require("node:fs/promises") as typeof import("node:fs/promises");
const childProcess = require("node:child_process") as typeof import("node:child_process");
const path = require("node:path") as typeof import("node:path");

interface IScaffoldOptions {
    mode: "init" | "align";
    target: string;
    projectName: string;
    description: string;
    primaryLanguage: string | null;
    projectVersion: string;
    stack: string[];
    features: string[];
    designContext: boolean;
    initGit: boolean;
    force: boolean;
}

interface ITemplateFile {
    templatePath: string;
    outputPath: string;
}

interface ITemplateVariables {
    projectName: string;
    description: string;
    currentDate: string;
    manifestName: string;
    projectVersion: string;
    stackSummary: string;
    featureSummary: string;
    directorySummary: string;
}

interface IStyleGuideDefinition {
    id: string;
    label: string;
    fileName: string;
}

interface IManifestDefinition {
    fileName: string;
    kind: "package-json" | "composer-json" | "project-json";
}

interface IInitMetadata {
    projectName?: unknown;
    description?: unknown;
    primaryLanguage?: unknown;
    stack?: unknown;
    features?: unknown;
    designContext?: unknown;
    initGit?: unknown;
}

type GitInitializationStatus = "not-requested" | "initialized" | "skipped-existing-worktree";
const DEFAULT_PROJECT_CONFIG_FILE_NAME = "project-config.json";
const DEFAULT_INITIAL_PROJECT_VERSION = "0.1.0";
const HELP_FLAGS = new Set(["--help", "-h"]);

/**
 * Check whether the current CLI invocation should print the help output.
 * @param {string[]} argv
 */
function shouldShowHelp(argv: string[]): boolean {
    return argv.length === 0 || argv.some((token) => HELP_FLAGS.has(token));
}

/**
 * Build the human-readable CLI help output.
 */
function buildHelpText(): string {
    return [
        "Project Kit Scaffold",
        "",
        "Bootstrap or align a human-led, AI-assisted repository baseline.",
        "",
        "Usage:",
        "  project-kit-scaffold --mode <init|align> --target <path> [options]",
        "",
        "Options:",
        "  --mode <init|align>           Select whether to scaffold a new repo or align an existing one.",
        "  --target <path>               Target repository path.",
        "  --meta <path>                 Optional JSON metadata file for init.",
        "  --project-name <name>         Project name written into generated files.",
        "  --description <text>          Short human-facing project summary.",
        "  --primary-language <name>     Primary language used to select the manifest and style guide.",
        "  --stack <a,b,c>               Comma-separated stack summary.",
        "  --features <a,b,c>            Comma-separated high-level project features.",
        "  --design-context              Scaffold optional design references for UI mockups, links, and annotations.",
        "  --init-git                    Initialize Git when running init and the target is not already in a worktree.",
        "  --force                       Overwrite generated files that already exist.",
        "  --help, -h                    Show this message.",
        "",
        "Notes:",
        "  - `init` requires project name, description, primary language, stack, and high-level features.",
        "  - `align` requires --features when `.project/features.md` does not already exist.",
        `  - If --meta is omitted, ${DEFAULT_PROJECT_CONFIG_FILE_NAME} is loaded automatically from the current working directory when present.`,
        "  - Existing files are preserved unless --force is used.",
        "  - The scripted CLI supports `init` and `align`.",
        "",
        "Examples:",
        "  project-kit-scaffold --mode init --target /absolute/path/to/repo --project-name demo --description \"AI-assisted demo\" --primary-language TypeScript --stack TypeScript,React --features authentication,reporting",
        "  project-kit-scaffold --mode init --target /absolute/path/to/repo --project-name demo-ui --description \"AI-assisted UI demo\" --primary-language TypeScript --stack TypeScript,React --features authentication,reporting --design-context",
        "  project-kit-scaffold --mode align --target /absolute/path/to/existing-repo --project-name existing-repo --description \"Aligned for AI-assisted work\" --primary-language TypeScript --stack TypeScript,React --features authentication,reporting"
    ].join("\n");
}

/**
 * Parse CLI arguments into scaffold options.
 * @param {string[]} argv
 * @param {string} cwd
 */
async function parseArgs(argv: string[], cwd: string): Promise<IScaffoldOptions> {
    const values = new Map<string, string>();
    const flags = new Set<string>();

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];

        if (!token.startsWith("--")) {
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

    const mode = values.get("mode");

    if (mode !== "init" && mode !== "align") {
        throw new Error('Missing or invalid "--mode". Use "init" or "align".');
    }

    const targetArg = values.get("target");

    if (!targetArg) {
        throw new Error('Missing required "--target" argument.');
    }

    if (values.has("project-version")) {
        throw new Error('Unsupported "--project-version" argument. Project version is assigned automatically: `0.1.0` for `init`, or the existing root manifest version for `align`.');
    }

    const metadataPath = await resolveMetadataPath(values.get("meta") ?? values.get("config"), cwd);
    const metadata = metadataPath ? await loadMetadataFile(metadataPath) : {};
    const target = path.resolve(cwd, targetArg);
    const projectNameValue = values.get("project-name") ?? readStringMetadata(metadata.projectName);
    const descriptionValue = values.get("description") ?? readStringMetadata(metadata.description);
    const primaryLanguage = values.get("primary-language") ?? values.get("language") ?? readStringMetadata(metadata.primaryLanguage) ?? null;
    const stack = values.has("stack") ? parseList(values.get("stack")) : parseMetadataList(metadata.stack);
    const features = values.has("features") ? parseList(values.get("features")) : parseMetadataList(metadata.features);
    const projectVersion = await resolveProjectVersion(mode, target);
    const targetExists = await pathExists(target);
    const featuresPath = path.join(target, ".project", "features.md");
    const requiresFeatures = mode === "init" || (mode === "align" && targetExists && !(await pathExists(featuresPath)));

    validateProjectVersion(projectVersion);

    if (mode === "init" || mode === "align") {
        const missingArguments: string[] = [];

        if (mode === "init" && !projectNameValue) {
            missingArguments.push("--project-name");
        }

        if (mode === "init" && !descriptionValue) {
            missingArguments.push("--description");
        }

        if (mode === "init" && !primaryLanguage) {
            missingArguments.push("--primary-language");
        }

        if (mode === "init" && stack.length === 0) {
            missingArguments.push("--stack");
        }

        if (requiresFeatures && features.length === 0) {
            missingArguments.push("--features");
        }

        if (missingArguments.length > 0) {
            throw new Error(`Missing required ${mode} metadata: ${missingArguments.join(", ")}.`);
        }
    }

    const projectName = projectNameValue ?? path.basename(target);
    const description = descriptionValue ?? "Describe the project purpose and boundaries.";

    return {
        mode,
        target,
        projectName,
        description,
        primaryLanguage,
        projectVersion,
        stack,
        features,
        designContext: flags.has("design-context") || metadata.designContext === true,
        initGit: flags.has("init-git") || metadata.initGit === true,
        force: flags.has("force")
    };
}

/**
 * Resolve the project version for the current run.
 * @param {"init" | "align"} mode
 * @param {string} target
 */
async function resolveProjectVersion(mode: "init" | "align", target: string): Promise<string> {
    if (mode === "init") {
        return DEFAULT_INITIAL_PROJECT_VERSION;
    }

    const detectedVersion = await detectExistingProjectVersion(target);

    return detectedVersion ?? DEFAULT_INITIAL_PROJECT_VERSION;
}

/**
 * Load init metadata from a JSON file.
 * @param {string} metadataPath
 */
async function loadMetadataFile(metadataPath: string): Promise<IInitMetadata> {
    const rawContent = await fs.readFile(metadataPath, "utf8");
    let parsed: unknown;

    try {
        parsed = JSON.parse(rawContent);
    } catch {
        throw new Error(`Invalid metadata JSON: ${metadataPath}.`);
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error(`Metadata file must contain a JSON object: ${metadataPath}.`);
    }

    return parsed as IInitMetadata;
}

/**
 * Resolve the metadata file path from explicit CLI input or the default project config.
 * @param {string | undefined} metadataFileArg
 * @param {string} cwd
 */
async function resolveMetadataPath(metadataFileArg: string | undefined, cwd: string): Promise<string | null> {
    if (metadataFileArg) {
        return path.resolve(cwd, metadataFileArg);
    }

    const defaultPath = path.join(cwd, DEFAULT_PROJECT_CONFIG_FILE_NAME);

    if (await pathExists(defaultPath)) {
        return defaultPath;
    }

    return null;
}

/**
 * Read a string metadata value when available.
 * @param {unknown} value
 */
function readStringMetadata(value: unknown): string | undefined {
    return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

/**
 * Parse a string list from a metadata value.
 * @param {unknown} value
 */
function parseMetadataList(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .filter((entry): entry is string => typeof entry === "string")
            .map((entry) => entry.trim())
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return parseList(value);
    }

    return [];
}

/**
 * Detect the current project version from known root manifests when available.
 * @param {string} targetRoot
 */
async function detectExistingProjectVersion(targetRoot: string): Promise<string | null> {
    const manifestPaths = [
        path.join(targetRoot, "package.json"),
        path.join(targetRoot, "composer.json"),
        path.join(targetRoot, "project.json")
    ];

    for (const manifestPath of manifestPaths) {
        const version = await readVersionFromJsonManifest(manifestPath);

        if (version) {
            return version;
        }
    }

    return null;
}

/**
 * Read a Semantic Version string from a JSON manifest when available.
 * @param {string} manifestPath
 */
async function readVersionFromJsonManifest(manifestPath: string): Promise<string | null> {
    if (!(await pathExists(manifestPath))) {
        return null;
    }

    const rawContent = await fs.readFile(manifestPath, "utf8");
    let parsed: unknown;

    try {
        parsed = JSON.parse(rawContent);
    } catch {
        return null;
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return null;
    }

    const version = (parsed as { version?: unknown }).version;

    if (typeof version !== "string") {
        return null;
    }

    return /^\d+\.\d+\.\d+$/.test(version.trim()) ? version.trim() : null;
}

/**
 * Parse a comma-separated list.
 * @param {string | undefined} value
 */
function parseList(value: string | undefined): string[] {
    if (!value) {
        return [];
    }

    return value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
}

/**
 * Ensure the provided version string follows a simple Semantic Version format.
 * @param {string} projectVersion
 */
function validateProjectVersion(projectVersion: string): void {
    if (!/^\d+\.\d+\.\d+$/.test(projectVersion)) {
        throw new Error(`Invalid project version: ${projectVersion}. Use Semantic Version format like "0.1.0".`);
    }
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
 * Ensure the repository root exists for the requested mode.
 * @param {IScaffoldOptions} options
 */
async function ensureTargetRoot(options: IScaffoldOptions): Promise<void> {
    const exists = await pathExists(options.target);

    if (options.mode === "align" && !exists) {
        throw new Error(`Target directory does not exist: ${options.target}`);
    }

    if (!exists) {
        await fs.mkdir(options.target, { recursive: true });
    }
}

/**
 * Run a Git command in the target repository.
 * @param {string[]} args
 * @param {string} cwd
 */
function runGitCommand(args: string[], cwd: string): childProcess.SpawnSyncReturns<string> {
    const result = childProcess.spawnSync("git", args, {
        cwd,
        encoding: "utf8"
    });

    if (result.error) {
        const error = result.error as NodeJS.ErrnoException;

        if (error.code === "ENOENT") {
            throw new Error("Git is not available in PATH.");
        }

        throw result.error;
    }

    return result;
}

/**
 * Check whether the target directory is already inside a Git worktree.
 * @param {string} targetRoot
 */
function isInsideGitWorkTree(targetRoot: string): boolean {
    const result = runGitCommand(["rev-parse", "--is-inside-work-tree"], targetRoot);

    return result.status === 0 && result.stdout.trim() === "true";
}

/**
 * Ensure baseline directories exist for new repositories before templates are rendered.
 * @param {IScaffoldOptions} options
 */
async function ensureBaselineDirectories(options: IScaffoldOptions): Promise<void> {
    if (options.mode !== "init") {
        return;
    }

    await fs.mkdir(path.join(options.target, "src"), { recursive: true });
    await fs.mkdir(path.join(options.target, "tests"), { recursive: true });
}

/**
 * Build the template file list for the current run.
 * @param {IScaffoldOptions} options
 */
function buildTemplateFiles(options: IScaffoldOptions): ITemplateFile[] {
    const files: ITemplateFile[] = [
        {
            templatePath: path.join("templates", "base", ".gitignore"),
            outputPath: ".gitignore"
        },
        {
            templatePath: path.join("templates", "base", "README.md"),
            outputPath: "README.md"
        },
        {
            templatePath: path.join("templates", "base", "CONTRIBUTING.md"),
            outputPath: "CONTRIBUTING.md"
        },
        {
            templatePath: path.join("templates", "base", "CHANGELOG.md"),
            outputPath: "CHANGELOG.md"
        },
        {
            templatePath: path.join("templates", "base", "AGENTS.md"),
            outputPath: "AGENTS.md"
        },
        {
            templatePath: path.join("templates", "base", ".project", "overview.md"),
            outputPath: path.join(".project", "overview.md")
        },
        {
            templatePath: path.join("templates", "base", ".project", "features.md"),
            outputPath: path.join(".project", "features.md")
        },
        {
            templatePath: path.join("templates", "base", ".project", "architecture.md"),
            outputPath: path.join(".project", "architecture.md")
        },
        {
            templatePath: path.join("templates", "base", ".project", "decisions.md"),
            outputPath: path.join(".project", "decisions.md")
        }
    ];

    if (options.designContext) {
        files.push(
            {
                templatePath: path.join("templates", "base", ".project", "design", "README.md"),
                outputPath: path.join(".project", "design", "README.md")
            },
            {
                templatePath: path.join("templates", "base", ".project", "design", "assets", ".gitkeep"),
                outputPath: path.join(".project", "design", "assets", ".gitkeep")
            }
        );
    }

    return files;
}

/**
 * Normalize a language name to a comparison-friendly form.
 * @param {string} value
 */
function normalizeLanguage(value: string): string {
    return value.trim().toLowerCase();
}

/**
 * Resolve one supported internal style guide from a language candidate.
 * @param {string} candidate
 */
function resolveStyleGuide(candidate: string): IStyleGuideDefinition | null {
    const normalized = normalizeLanguage(candidate);

    if (normalized === "typescript" || normalized === "ts") {
        return {
            id: "typescript",
            label: "TypeScript",
            fileName: "typescript.md"
        };
    }

    if (normalized === "php") {
        return {
            id: "php",
            label: "PHP",
            fileName: "php.md"
        };
    }

    return null;
}

/**
 * Detect the supported style guides that apply to the repository.
 * @param {string | null} primaryLanguage
 * @param {string[]} stack
 */
function detectStyleGuides(primaryLanguage: string | null, stack: string[]): IStyleGuideDefinition[] {
    const candidates = [
        ...(primaryLanguage ? [primaryLanguage] : []),
        ...stack
    ];
    const detectedGuides = new Map<string, IStyleGuideDefinition>();

    for (const candidate of candidates) {
        const guide = resolveStyleGuide(candidate);

        if (guide && !detectedGuides.has(guide.id)) {
            detectedGuides.set(guide.id, guide);
        }
    }

    return Array.from(detectedGuides.values());
}

/**
 * Resolve the project manifest definition for the repository stack.
 * @param {string | null} primaryLanguage
 * @param {string[]} stack
 */
function resolveManifest(primaryLanguage: string | null, stack: string[]): IManifestDefinition {
    const candidates = [
        ...(primaryLanguage ? [primaryLanguage] : []),
        ...stack
    ];

    for (const candidate of candidates) {
        const normalized = normalizeLanguage(candidate);

        if (normalized === "typescript" || normalized === "ts" || normalized === "node" || normalized === "node.js" || normalized === "javascript" || normalized === "js") {
            return {
                fileName: "package.json",
                kind: "package-json"
            };
        }

        if (normalized === "php") {
            return {
                fileName: "composer.json",
                kind: "composer-json"
            };
        }
    }

    return {
        fileName: "project.json",
        kind: "project-json"
    };
}

/**
 * List top-level directories to help populate the README.
 * @param {string} targetDir
 */
async function listTopLevelDirectories(targetDir: string): Promise<string[]> {
    const ignored = new Set([
        ".codex",
        ".git",
        ".github",
        ".project",
        "node_modules"
    ]);

    const entries = await fs.readdir(targetDir, { withFileTypes: true });

    return entries
        .filter((entry) => entry.isDirectory() && !ignored.has(entry.name))
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right));
}

/**
 * Render a human-readable stack summary.
 * @param {string[]} stack
 */
function buildStackSummary(stack: string[]): string {
    if (stack.length === 0) {
        return "- Capture the real stack once the repository choices are confirmed.";
    }

    return stack.map((entry) => `- ${entry}`).join("\n");
}

/**
 * Render a human-readable feature summary.
 * @param {string[]} features
 */
function buildFeatureSummary(features: string[]): string {
    if (features.length === 0) {
        return [
            "## Feature Name",
            "",
            "- Summary:",
            "- In scope:",
            "- Out of scope:"
        ].join("\n");
    }

    return features.map((entry) => [
        `## ${entry}`,
        "",
        "- Summary:",
        "- In scope:",
        "- Out of scope:"
    ].join("\n")).join("\n\n");
}

/**
 * Render a human-readable directory summary.
 * @param {string[]} directories
 */
function buildDirectorySummary(directories: string[]): string {
    if (directories.length === 0) {
        return "- Add the main runtime directories once the codebase shape is clear.";
    }

    return directories.map((entry) => `- \`${entry}/\``).join("\n");
}

/**
 * Render a template using simple token replacement.
 * @param {string} template
 * @param {ITemplateVariables} variables
 */
function renderTemplate(template: string, variables: ITemplateVariables): string {
    return template
        .replaceAll("{{projectName}}", variables.projectName)
        .replaceAll("{{description}}", variables.description)
        .replaceAll("{{currentDate}}", variables.currentDate)
        .replaceAll("{{manifestName}}", variables.manifestName)
        .replaceAll("{{projectVersion}}", variables.projectVersion)
        .replaceAll("{{stackSummary}}", variables.stackSummary)
        .replaceAll("{{featureSummary}}", variables.featureSummary)
        .replaceAll("{{directorySummary}}", variables.directorySummary);
}

/**
 * Write a rendered template unless an existing file should be preserved.
 * @param {string} templateRoot
 * @param {string} targetRoot
 * @param {ITemplateFile} file
 * @param {ITemplateVariables} variables
 * @param {boolean} force
 */
async function writeTemplate(templateRoot: string, targetRoot: string, file: ITemplateFile, variables: ITemplateVariables, force: boolean): Promise<boolean> {
    const templateSource = path.join(templateRoot, file.templatePath);
    const targetPath = path.join(targetRoot, file.outputPath);
    const targetExists = await pathExists(targetPath);

    if (targetExists && !force) {
        return false;
    }

    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    const template = await fs.readFile(templateSource, "utf8");
    const rendered = renderTemplate(template, variables);

    await fs.writeFile(targetPath, rendered, "utf8");
    return true;
}

/**
 * Compose the final CODE_STYLE.md content from detected language guides or the generic fallback.
 * @param {IStyleGuideDefinition[]} styleGuides
 * @param {string[]} sections
 */
function buildCodeStyleDocument(styleGuides: IStyleGuideDefinition[], sections: string[]): string {
    const lines = [
        "# Code Style",
        "",
        "## Precedence",
        "",
        "- Follow the actual repository configuration first.",
        "- If project config, linters, formatters, or existing conventions define a rule, those rules override this file.",
        "- This file provides defaults only when the repository does not define a stricter convention.",
        ""
    ];

    if (styleGuides.length > 0) {
        lines.push("## Included Guides", "");

        for (const styleGuide of styleGuides) {
            lines.push(`- ${styleGuide.label}`);
        }

        lines.push("");
    } else {
        lines.push("## Scope", "");
        lines.push("- This file uses a generic fallback because the repository stack has no dedicated built-in style guide yet.");
        lines.push("- Replace or refine these rules once project-specific conventions become clear.");
        lines.push("");
    }

    return `${lines.join("\n")}\n${sections.map((section) => section.trim()).join("\n\n")}\n`;
}

/**
 * Write CODE_STYLE.md unless an existing file should be preserved.
 * @param {string} skillRoot
 * @param {string} targetRoot
 * @param {IStyleGuideDefinition[]} styleGuides
 * @param {boolean} force
 */
async function writeCodeStyle(skillRoot: string, targetRoot: string, styleGuides: IStyleGuideDefinition[], force: boolean): Promise<boolean> {
    const targetPath = path.join(targetRoot, "CODE_STYLE.md");
    const targetExists = await pathExists(targetPath);

    if (targetExists && !force) {
        return false;
    }

    const sourceFiles = styleGuides.length > 0 ?
        styleGuides.map((styleGuide) => path.join(skillRoot, "code-style", styleGuide.fileName)) :
        [path.join(skillRoot, "code-style", "generic.md")];
    const sections = await Promise.all(sourceFiles.map((sourceFile) => fs.readFile(sourceFile, "utf8")));
    const document = buildCodeStyleDocument(styleGuides, sections);

    await fs.writeFile(targetPath, document, "utf8");
    return true;
}

/**
 * Convert a project name into a manifest-safe slug.
 * @param {string} projectName
 */
function buildManifestName(projectName: string): string {
    const normalizedName = projectName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return normalizedName || "project";
}

/**
 * Write the stack-native project manifest or the generic fallback.
 * @param {string} targetRoot
 * @param {IManifestDefinition} manifestDefinition
 * @param {ITemplateVariables} variables
 * @param {string | null} primaryLanguage
 * @param {boolean} force
 */
async function writeProjectManifest(targetRoot: string, manifestDefinition: IManifestDefinition, variables: ITemplateVariables, primaryLanguage: string | null, force: boolean): Promise<boolean> {
    const targetPath = path.join(targetRoot, manifestDefinition.fileName);
    const targetExists = await pathExists(targetPath);

    if (targetExists && !force) {
        return false;
    }

    if (manifestDefinition.kind === "package-json") {
        const packageJson = {
            name: variables.manifestName,
            version: variables.projectVersion,
            private: true,
            description: variables.description
        };

        await fs.writeFile(targetPath, `${JSON.stringify(packageJson, null, 4)}\n`, "utf8");
        return true;
    }

    if (manifestDefinition.kind === "composer-json") {
        const composerJson = {
            name: `project/${variables.manifestName}`,
            description: variables.description,
            type: "project",
            version: variables.projectVersion,
            require: {}
        };

        await fs.writeFile(targetPath, `${JSON.stringify(composerJson, null, 4)}\n`, "utf8");
        return true;
    }

    const projectJson = {
        name: variables.projectName,
        slug: variables.manifestName,
        version: variables.projectVersion,
        description: variables.description,
        primaryLanguage: primaryLanguage ?? null
    };

    await fs.writeFile(targetPath, `${JSON.stringify(projectJson, null, 4)}\n`, "utf8");
    return true;
}

/**
 * Write a minimal VS Code workspace file unless an existing file should be preserved.
 * @param {string} targetRoot
 * @param {ITemplateVariables} variables
 * @param {boolean} force
 */
async function writeVSCodeWorkspace(targetRoot: string, variables: ITemplateVariables, force: boolean): Promise<boolean> {
    const targetPath = path.join(targetRoot, `${variables.manifestName}.code-workspace`);
    const targetExists = await pathExists(targetPath);

    if (targetExists && !force) {
        return false;
    }

    const workspace = {
        folders: [
            {
                path: "."
            }
        ],
        settings: {}
    };

    await fs.writeFile(targetPath, `${JSON.stringify(workspace, null, 4)}\n`, "utf8");
    return true;
}

/**
 * Initialize Git for a new project only when explicitly requested and safe.
 * @param {IScaffoldOptions} options
 */
function initializeGitRepository(options: IScaffoldOptions): GitInitializationStatus {
    if (options.mode !== "init" || !options.initGit) {
        return "not-requested";
    }

    if (isInsideGitWorkTree(options.target)) {
        return "skipped-existing-worktree";
    }

    const result = runGitCommand(["init"], options.target);

    if (result.status !== 0) {
        const stderr = result.stderr.trim();
        throw new Error(stderr || `Failed to initialize Git in ${options.target}.`);
    }

    return "initialized";
}

/**
 * Build the template variables for the current repository state.
 * @param {IScaffoldOptions} options
 */
async function buildTemplateVariables(options: IScaffoldOptions): Promise<ITemplateVariables> {
    const directories = await listTopLevelDirectories(options.target);

    return {
        projectName: options.projectName,
        description: options.description,
        currentDate: new Date().toISOString().slice(0, 10),
        manifestName: buildManifestName(options.projectName),
        projectVersion: options.projectVersion,
        stackSummary: buildStackSummary(options.stack),
        featureSummary: buildFeatureSummary(options.features),
        directorySummary: buildDirectorySummary(directories)
    };
}

/**
 * Scaffold the requested baseline into the target repository.
 */
async function main(): Promise<void> {
    const cwd = process.cwd();
    const argv = process.argv.slice(2);

    if (shouldShowHelp(argv)) {
        process.stdout.write(`${buildHelpText()}\n`);
        return;
    }

    const options = await parseArgs(argv, cwd);

    await ensureTargetRoot(options);
    await ensureBaselineDirectories(options);

    const skillRoot = path.resolve(__dirname, "..");
    const variables = await buildTemplateVariables(options);
    const templateFiles = buildTemplateFiles(options);
    const styleGuides = detectStyleGuides(options.primaryLanguage, options.stack);
    const manifestDefinition = resolveManifest(options.primaryLanguage, options.stack);
    let writtenFiles = 0;

    for (const file of templateFiles) {
        const wasWritten = await writeTemplate(skillRoot, options.target, file, variables, options.force);

        if (wasWritten) {
            writtenFiles += 1;
        }
    }

    const codeStyleWasWritten = await writeCodeStyle(skillRoot, options.target, styleGuides, options.force);

    if (codeStyleWasWritten) {
        writtenFiles += 1;
    }

    const manifestWasWritten = await writeProjectManifest(options.target, manifestDefinition, variables, options.primaryLanguage, options.force);

    if (manifestWasWritten) {
        writtenFiles += 1;
    }

    const workspaceWasWritten = await writeVSCodeWorkspace(options.target, variables, options.force);

    if (workspaceWasWritten) {
        writtenFiles += 1;
    }

    const gitInitializationStatus = initializeGitRepository(options);
    const output = [`Scaffolded ${writtenFiles} files in ${options.target}.`];

    if (gitInitializationStatus === "initialized") {
        output.push("Initialized a Git repository.");
    }

    if (gitInitializationStatus === "skipped-existing-worktree") {
        output.push("Skipped Git initialization because the target is already inside a Git worktree.");
    }

    process.stdout.write(`${output.join(" ")}\n`);
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
});
