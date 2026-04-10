# Design Context

Use this directory only when the project includes user-facing UI or the user supplied design artifacts.

## Pairing convention

- Put exported mockups, screenshots, and SVGs under `assets/`.
- Use paired files when possible:
  - `screen-name.png`
  - `screen-name.annotated.png`
- The same convention applies to `.jpg`, `.jpeg`, `.svg`, and `.webp`.
- Treat `.annotated` files as documentation overlays only. Arrows, notes, and highlight colors are not part of the final UI.
- Prefer stable names that describe the screen or state, for example `editor-toolbar.default.png` and `editor-toolbar.default.annotated.png`.

## Discovery rules

- Scan `assets/` recursively for `.png`, `.jpg`, `.jpeg`, `.svg`, and `.webp`.
- Pair files by matching the same base name plus the `.annotated` suffix.
- Prefer exact extension matches during pairing.
- If only the base asset exists, treat it as an unannotated mockup.
- If only the annotated asset exists, use it but note that the clean design source is missing.

## Annotation rules

- Prefer very bright, high-contrast annotation colors, for example `#FF0095`, so annotations are visually separate from the real UI.
- Keep the annotation color reserved for notes, arrows, and callouts instead of reusing it inside the actual UI mockup.
- Keep annotation text outside the component when possible and connect it with an arrow or a leader line.
- One annotation should describe one control or one behavior.
- Prefer direct labels such as `Magic Wand tool`, `Opens shape menu`, or `Imports SVG images`.
- If the source of truth lives in Figma or another tool, you may record plain links here, but links are optional.

## Optional cross-screen notes

- If navigation or state transitions are not already obvious from the paired annotated assets, add a short bullet list here.
- Mark uncertain links as assumptions instead of presenting them as facts.
