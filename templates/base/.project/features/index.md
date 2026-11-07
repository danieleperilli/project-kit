# Features

Use this directory for just-in-time feature briefs. Each feature file should stay small, technical, and implementation-oriented.

- Keep feature briefs behavior-facing.
- A new brief starts in `discovery`; it is not authorization to edit product code.
- Move a brief to `ready` only after the user approves the exact batch contract and that approval, decisions, affected surfaces, acceptance, tests, local verification, and review risks are explicit.
- Run `project-kit feature check --slug <feature-slug>` before implementing a non-trivial batch.
- Do not duplicate interfaces, schemas, routes, payload examples, or code structure.
- When UI is involved, link to `.project/design/` assets and flows instead of describing the interface from scratch.
- Without a precise design, mark a functional UI as `provisional` and create a final UI refinement task before feature completion. Under Control Room, record the dependent task ID in the brief.
- Update the relevant feature file when scope, acceptance, or review focus changes materially.
- Keep only the current batch in an active brief. Review records retain delivery evidence.
- Archive a closed or superseded brief with a reason and a current reference when one exists; its path and historical approvals remain intact.
- Use `project-kit feature list` for active work and `project-kit feature list --all` to include history and status diagnostics.
- The CLI owns only the marked link regions below. Keep editorial notes outside those markers.

## Active Feature Briefs

<!-- project-kit:features:active:start -->
{{featureIndexSummary}}
<!-- project-kit:features:active:end -->

## Archived Feature Briefs

<!-- project-kit:features:archived:start -->
<!-- project-kit:features:archived:end -->
