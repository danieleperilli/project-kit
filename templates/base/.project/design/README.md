# Design Context

Use this directory only when the project includes user-facing UI or the human team provided design artifacts.

## Ownership

- UI/UX decisions, mockups, interaction design, and visual hierarchy remain human-owned.
- Codex should implement the provided design context, not invent a new one.
- If mockups are ambiguous, record the assumption or ask for clarification before treating it as final.

## Directory Layout

- `assets/` stores exported mockups and annotated variants.
- `flows.md` captures navigation, states, and multi-screen behavior.
- `sources.md` stores canonical Figma links or other remote design sources.

## Asset Pairing Convention

- Put exported mockups, screenshots, and SVGs under `assets/`.
- Use paired files when possible:
  - `screen-name.png`
  - `screen-name.annotated.png`
- Add `screen-name.annotations.md` when the annotated screen uses numeric callouts instead of full text labels.
- The same convention applies to `.jpg`, `.jpeg`, `.svg`, and `.webp`.
- Treat `.annotated` files as documentation overlays only. Arrows, notes, and highlight colors are not part of the final UI.
- Prefer stable names that describe the screen or state, for example `editor-toolbar.default.png` and `editor-toolbar.default.annotated.png`.

## Discovery Rules

- Scan `assets/` recursively for `.png`, `.jpg`, `.jpeg`, `.svg`, and `.webp`.
- Pair files by matching the same base name plus the `.annotated` suffix.
- If `screen-name.annotations.md` exists, treat it as a companion file for the same screen.
- Prefer exact extension matches during pairing.
- If only the base asset exists, treat it as an unannotated mockup.
- If only the annotated asset exists, use it but note that the clean design source is missing.
