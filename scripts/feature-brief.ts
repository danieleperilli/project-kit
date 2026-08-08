interface IFeatureBriefDocumentInput {
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

type FeatureStatus = "discovery" | "ready";
type UiMaturity = "unassessed" | "none" | "final" | "provisional";

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
 * Render the readiness section of a feature brief.
 * @param {FeatureStatus | undefined} status
 * @param {string | null | undefined} approvalEvidence
 * @param {string[] | undefined} approvedDecisions
 * @param {string[] | undefined} openDecisions
 */
function buildReadinessSection(status: FeatureStatus | undefined, approvalEvidence: string | null | undefined, approvedDecisions: string[] | undefined, openDecisions: string[] | undefined): string {
    return [
        `- Status: ${status ?? "discovery"}`,
        `- Approval evidence: ${approvalEvidence ?? ""}`.trimEnd(),
        `- Approved decisions: ${approvedDecisions && approvedDecisions.length > 0 ? approvedDecisions.join("; ") : ""}`.trimEnd(),
        `- Open decisions: ${openDecisions && openDecisions.length > 0 ? openDecisions.join("; ") : ""}`.trimEnd()
    ].join("\n");
}

/**
 * Render the current implementation batch section of a feature brief.
 * @param {string | null | undefined} currentBatch
 */
function buildCurrentBatchSection(currentBatch: string | null | undefined): string {
    return `- ${currentBatch ?? ""}`.trimEnd();
}

/**
 * Render the explicit change contract for one implementation batch.
 * @param {string | null | undefined} persistenceImpact
 * @param {string | null | undefined} apiImpact
 * @param {string | null | undefined} configurationImpact
 * @param {string | null | undefined} uiImpact
 * @param {UiMaturity | undefined} uiMaturity
 */
function buildChangeContractSection(persistenceImpact: string | null | undefined, apiImpact: string | null | undefined, configurationImpact: string | null | undefined, uiImpact: string | null | undefined, uiMaturity: UiMaturity | undefined): string {
    return [
        `- Persistence: ${persistenceImpact ?? ""}`.trimEnd(),
        `- APIs: ${apiImpact ?? ""}`.trimEnd(),
        `- Configuration and resources: ${configurationImpact ?? ""}`.trimEnd(),
        `- UI: ${uiImpact ?? ""}`.trimEnd(),
        `- UI maturity: ${uiMaturity ?? "unassessed"}`
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
        "## Readiness",
        "",
        buildReadinessSection(input.status, input.approvalEvidence, input.approvedDecisions, input.openDecisions),
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
        "## Current batch",
        "",
        buildCurrentBatchSection(input.currentBatch),
        "",
        "## Modules involved",
        "",
        buildBulletSection(input.modules, ""),
        "",
        "## Change contract",
        "",
        buildChangeContractSection(input.persistenceImpact, input.apiImpact, input.configurationImpact, input.uiImpact, input.uiMaturity),
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
        "## Local verification",
        "",
        buildBulletSection(input.verification, ""),
        "",
        "## Required follow-up tasks",
        "",
        buildBulletSection(input.followUps, ""),
        "",
        "## Risks and review focus",
        "",
        buildBulletSection(input.risks, "")
    ].join("\n");
}

module.exports = {
    buildBulletSection,
    buildChangeContractSection,
    buildCurrentBatchSection,
    buildDesignReferencesSection,
    buildFeatureBriefDocument,
    buildFeatureSlug,
    buildGoalSection,
    buildReadinessSection
};
