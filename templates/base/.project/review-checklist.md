# Review Checklist

Use this checklist before a non-trivial batch is accepted.

## Readiness And Batch Contract

- Was the relevant feature brief `ready` with concrete user approval evidence and no open decisions before implementation began?
- Did `project-kit feature check --slug <feature-slug>` pass?
- Does the diff implement only the named current batch and its approved decisions?
- Are persistence, API, configuration/resource, and UI impacts explicit and accurate, including `None` entries?
- Was a cross-layer batch necessary for one independently verifiable outcome, or should it have been split?

## Architecture

- Is the change consistent with `.project/architecture.md` and `.project/constraints.md`?
- Did the change avoid introducing unnecessary abstractions or cross-module coupling?

## Simplicity And Necessity

- Is this the smallest change that fully satisfies the current requirement?
- Does every new abstraction, wrapper, configuration option, fallback path, or extension point serve a present need?
- Are defensive checks limited to trust boundaries and plausible failure modes without duplicating validation across trusted internal layers?
- Can any new code, process step, test, or documentation be removed without weakening correctness, security, data integrity, an external integration, or the stated acceptance criteria?

## Contracts And Behavior

- Does the change match the relevant feature brief and any explicit contracts?
- Are edge cases and failure behavior explicit enough?
- Did the implementation avoid adding tables, columns, endpoints, settings, resources, or future feature behavior outside the change contract?

## Security

- Check untrusted input handling, authentication and authorization, secrets, command execution, path handling, and external calls.

## Design Fidelity

- If `.project/design/` exists, does the UI match the mockups and annotations without invented behavior or layout?
- Are any ambiguities called out as assumptions?
- If the UI is intentionally provisional, is it usable for validation and is a final UI refinement task recorded before feature completion, including its Control Room task ID when applicable?

## Tests

- Are high-risk behaviors protected by tests when appropriate?
- If tests were omitted, is the reason defensible?
- Was the actual local user journey exercised, including setup, configuration, resource loading, integrations, and visible UI states when relevant?

## Maintainability

- Is the diff small enough to review?
- Are docs and changelog updated where durable context changed?
- Does the handoff enumerate actual persistence, API, configuration/resource, and UI changes plus exact automated and local verification evidence?
