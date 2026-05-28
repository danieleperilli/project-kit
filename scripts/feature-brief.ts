interface IFeatureBriefDocumentInput {
    problem?: string | null;
    outcome?: string | null;
    behavior?: string[];
    inScope?: string[];
    outOfScope?: string[];
    modules?: string[];
    designAssets?: string[];
    designFlows?: string[];
    designSources?: string[];
    acceptance?: string[];
    tests?: string[];
    risks?: string[];
}

/**
 * Convert a feature name into a path-safe slug.
 * @param {string} featureName
 */
function buildFeatureSlug(featureName: string): string {
    const normalizedFeatureName = featureName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return normalizedFeatureName || "feature";
}

/**
 * Render one bullet list section of a feature brief.
 * @param {string[] | undefined} items
 * @param {string} fallback
 */
function buildBulletSection(items: string[] | undefined, fallback: string): string {
    if (!items || items.length === 0) {
        return `- ${fallback}`;
    }

    return items.map((item) => `- ${item}`).join("\n");
}

/**
 * Render the goal section of a feature brief.
 * @param {string | null | undefined} problem
 * @param {string | null | undefined} outcome
 */
function buildGoalSection(problem: string | null | undefined, outcome: string | null | undefined): string {
    return [
        `- Problem solved: ${problem ?? ""}`.trimEnd(),
        `- Primary outcome: ${outcome ?? ""}`.trimEnd()
    ].join("\n");
}

/**
 * Render the design references section of a feature brief.
 * @param {string[] | undefined} designAssets
 * @param {string[] | undefined} designFlows
 * @param {string[] | undefined} designSources
 */
function buildDesignReferencesSection(designAssets: string[] | undefined, designFlows: string[] | undefined, designSources: string[] | undefined): string {
    return [
        `- Local assets: ${designAssets && designAssets.length > 0 ? designAssets.join("; ") : ""}`.trimEnd(),
        `- Flow notes: ${designFlows && designFlows.length > 0 ? designFlows.join("; ") : ""}`.trimEnd(),
        `- Remote sources: ${designSources && designSources.length > 0 ? designSources.join("; ") : ""}`.trimEnd()
    ].join("\n");
}

/**
 * Build the default content for one feature brief document.
 * @param {string} featureName
 * @param {IFeatureBriefDocumentInput} input
 */
function buildFeatureBriefDocument(featureName: string, input: IFeatureBriefDocumentInput = {}): string {
    return [
        `# ${featureName}`,
        "",
        "## Goal",
        "",
        buildGoalSection(input.problem, input.outcome),
        "",
        "## User-visible behavior",
        "",
        buildBulletSection(input.behavior, "Describe the behavior in terms the reviewer can verify."),
        "",
        "## In scope",
        "",
        buildBulletSection(input.inScope, ""),
        "",
        "## Out of scope",
        "",
        buildBulletSection(input.outOfScope, ""),
        "",
        "## Modules involved",
        "",
        buildBulletSection(input.modules, ""),
        "",
        "## Design references",
        "",
        buildDesignReferencesSection(input.designAssets, input.designFlows, input.designSources),
        "",
        "## Acceptance criteria",
        "",
        buildBulletSection(input.acceptance, ""),
        "",
        "## Test expectations",
        "",
        buildBulletSection(input.tests, ""),
        "",
        "## Risks and review focus",
        "",
        buildBulletSection(input.risks, "")
    ].join("\n");
}

module.exports = {
    buildBulletSection,
    buildDesignReferencesSection,
    buildFeatureBriefDocument,
    buildFeatureSlug,
    buildGoalSection
};
