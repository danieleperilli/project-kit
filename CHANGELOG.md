# Changelog

This project follows Semantic Versioning.

## Unreleased

### Added

- Root project changelog for tracking meaningful Project Kit changes.

### Changed

- Repositioned Project Kit around an architecture-first, developer-led Codex workflow with feature briefs, review gates, and human-owned design context.
- Updated the scaffold to generate `.project/constraints.md`, `.project/review-checklist.md`, `.project/features/index.md`, per-feature brief files, and richer optional `.project/design/` files.
- Changed scaffolded agent and contributor guidance to load project context conditionally and inspect only `Unreleased` changelog entries by default.
- Added an anti-overengineering gate to the scaffolded Reviewer workflow and review checklist.
- Documented Codex's default 32 KiB combined project instruction limit and added a regression check for the generated `AGENTS.md` size.
- Added discovery and ready feature states, explicit per-batch change contracts, and the read-only `project-kit feature check` readiness gate.
- Moved anti-overengineering checks into planning, required real local user-journey verification, and allowed provisional UI work only with a recorded final refinement task.

### Fixed

- Fixed feature updates so replacing a multi-line section removes all previous fields instead of retaining stale lines.

### Security

### Codex Log

- 2026-04-13 - Realigned docs, templates, and scaffold behavior around the new operating model.
- 2026-08-04 - Added Reviewer checks for speculative abstractions, duplicated validation, unnecessary fallback paths, and removable code.
- 2026-08-06 - Kept generated project guidance within Codex's default 32 KiB instruction limit.
- 2026-08-08 - Added a just-in-time delivery loop so review validates a narrow approved batch instead of discovering its scope after implementation.
