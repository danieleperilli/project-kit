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

### Fixed

### Security

### Codex Log

- 2026-04-13 - Realigned docs, templates, and scaffold behavior around the new operating model.
- 2026-08-04 - Added Reviewer checks for speculative abstractions, duplicated validation, unnecessary fallback paths, and removable code.
