## Design Concept
This deck serves a Professional Learners scenario, delivering a rigorous curriculum design and status update for a Spring Boot microservices course. To communicate technical depth and pedagogical clarity, the visual foundation borrows the strict grid discipline and clear information hierarchy of the Swiss International Style, paired with Muji’s functional, distraction-free neutral backgrounds that allow complex diagrams and code to breathe. The color story avoids the cliché of neon "hacker" green on dark backgrounds; instead, it adopts a steady, cool white and mineral temperature. The primary ink is a deep, legible green-gray, grounded by cool off-white backgrounds and punctuated by a precise, educational green accent that subtly nods to the Spring framework while remaining highly professional. The type chain uses the Engineered serif set, featuring IBM Plex Serif for headings and IBM Plex Sans for body text, providing a precise, institutional voice perfectly suited for software engineering instruction.

## Visual Language
- **Imagery**: Photography focuses on realistic software engineering environments (developers typing at laptops, code editor screens, server racks, technical whiteboards) shown from clear, well-lit angles. Avoid abstract metaphors (e.g., no literal gears, puzzles, or glowing brains); subjects must show the literal tools and spaces of development.
- **Containers**: Card-based. All cards, panels, and framed images share a 4 px corner radius. Cards and panels feature a 1 px stroke in the divider color with no drop shadows; framed images have no stroke beyond their layout border. 
- **Icons**: Solid, highly legible geometric icons, used strictly to anchor lists, technical layers, or operational states (e.g., design, test, build).
- **Dataviz**: Tables use flat surface fills for headers with thin 1 px divider lines for rows; chart series rely on the primary and accent colors with clear data labels, avoiding 3D effects or gradients.
- **Motif**: A 2 px thin horizontal progress line in the accent color, placed at the very top edge of the canvas, spanning from the left corner to a width corresponding to the course module or presentation section.

## Layout Directives
- **Global**: Page margins at 60 px. Page numbers and source notes sit at the bottom right, aligned to the baseline. Content adheres to a strict left-aligned column grid.
- **Cover**: Title, one subtitle line, one meta line; no body text, lists, cards, buttons, source notes or page numbers.
- **Table of contents**: Never a plain bullet list.
- **Section dividers**: Never bare number + title.
- **Closing**: Echo the cover.

| id | pattern | image layout | cutouts | density |
|---|---|---|---|---|
| portada | title and subtitle block over bottom band | cover-band-bottom(developer writing code on multiple monitors) | none | low |
| resultado | two columns comparing initial profile and final capability | inset@left(programmer looking at terminal output) | none | medium |
| sistema | six-step flow architecture diagram | strip-side@left(server rack in a data center) | none | high |
| calendario | five-row table with weekly objectives and evidence | strip-top(clean desk with a laptop and open notebook) | none | high |
| metodo | nine numbered pedagogical steps | inset-narrow@right(close-up of hands typing on a mechanical keyboard) | none | high |
| modulos | four connected blocks detailing technical progression | side@right(development team reviewing software architecture on a whiteboard) | none | medium |
| brechas | three status cards for design, code, and test | cards-3(technical specification document on a desk, code editor on a monitor, software tester reviewing logs on a screen) | none | medium |

## Design Tokens

| token | hex | usage |
|---|---|---|
| primary | #3B7A57 | accent text, key highlights, active icons, motif |
| primary-text | #387352 | primary for text under 24 px (added by the slides add-on: primary is 4.27:1 on card-surface) |
| body-text | #1D2D27 | headings, body paragraphs, data, table text |
| secondary-text | #54665C | captions, source notes, disabled states, secondary bullet text |
| page-background | #F4F7F6 | slide background |
| card-surface | #E6ECEA | cards, panels, code block backgrounds |
| divider | #D0D8D5 | structural lines, table borders, card strokes |

| role | family | size (px) | color | applies_to |
|---|---|---|---|---|
| display | IBM Plex Serif | 54–64 | body-text | cover and section headlines only |
| heading | IBM Plex Serif | 36–42 | body-text | page titles |
| body | IBM Plex Sans | 22–28 | body-text | paragraphs and bullets |
| data | IBM Plex Sans | 22–28 | body-text | numbers, table cells, chart labels and KPIs |
| caption | IBM Plex Sans | 14–18 | secondary-text | sources, notes and page numbers |
| code | JetBrains Mono | 18–22 | secondary-text | code snippets and terminal outputs |

## Guardrails
- **Forbidden**: Do not use dark backgrounds for content pages; projection readability is paramount for adult training.
- **Forbidden**: Do not use neon gradients or glowing text effects.
- **Forbidden**: Do not use metaphorical stock imagery (e.g., puzzle pieces or lightbulbs); stick to literal software development scenes.
- **Forbidden**: Do not reduce code snippet or table font sizes below 16px to fit content; split the page instead if density overloads the canvas.

## Color contrast
Checked by the slides add-on against the Colors table (WCAG contrast: text under 24 px — under 19 px at font-weight 700+ — needs 4.5:1; larger text and meaningful graphics need 3:1).
Text under 24 px uses only colors whose row says "any text" or the listed smaller-text variant (the -text rows added to the Colors table); card titles, subheads and labels under 24 px count as smaller text unless their font-weight is 700+. Keep the original accent hex for fills, lines, charts and large numerals.

| token | hex | lowest contrast on the deck's backgrounds | text use |
|---|---|---|---|
| primary | #3B7A57 | 4.27:1 on card-surface | large text (≥ 24 px, or ≥ 19 px at font-weight 700+) and graphics; use #387352 (primary-text) for smaller text |
| body-text | #1D2D27 | 12.04:1 on card-surface | any text |
| secondary-text | #54665C | 5.11:1 on card-surface | any text |

## Image frames
Resolved by the slides add-on from the Slide map's image layout column — canvas 1280×720 px, x, y = top-left corner. Generate one image per frame with exactly the listed aspect_ratio and place each image in its own frame (cover-fit); never reuse one image for several frames. Text boxes are where the layout expects the page text; when a layout lists no title box, the page title goes at the top of its first text box, in the same column — page titles and source notes never run across an image frame.
Rows marked (n items) list one line per item count: pick the line for the number of items the page actually has, generate each image with that line's aspect_ratio and place it at that line's coordinates. If the page's count is not listed, use another image layout from the catalog that lists that count — never drop the images or leave a gap.
A text box given as w×h is the column beside the image. Fill it in four steps: (1) estimate the content's height at the Text role sizes; (2) keep each group together — a heading with its lines, a prompt with its questions, a note directly under the group it explains — with about one line of space between groups; (3) if lines fill less than about 60% of the box width or the stack is well short of the box, raise sizes toward the top of each role's range, or set each group in a card as wide as the box; if room is still left, add one item the outline already supports (an example, a definition, a check question) or a small explanatory cutout; (4) center the whole stack vertically in the box. Never spread groups to the top, middle and bottom of the box, and never pin a single note to its bottom.

| id | layout | image frame(s): x, y, w×h → aspect_ratio | text box(es): x, y, w×h or width (lines) |
|---|---|---|---|
| portada | cover-band-bottom | 0, 272, 1280×448 → 21:9 | 60, 34, 1160 wide — title (at most 2 lines, never one word on a line), one subtitle line, one meta line |
| resultado | inset@left | 60, 65, 472×590 → 4:5 | 620, 120, 600×535 |
| sistema | strip-side@left | 0, 0, 180×720 → 1:4 | 240, 60, 900 wide (title) |
| calendario | strip-top | 0, 0, 1280×320 → 4:1 | 60, 352, 700 wide (title); 840, 430, 380 wide (4 lines) |
| metodo | inset-narrow@right | 880, 150, 340×510 → 2:3 | 60, 60, 1160 wide (title); 60, 150, 780×510 |
| modulos | side@right | 800, 0, 480×720 → 2:3 | 60, 120, 680×544 |
| brechas (2 items) | cards-3 | 60, 195, 560×315 → 16:9; 660, 195, 560×315 → 16:9 | 60, 60, 900 wide (title); 60, 540, 560 wide (2 lines); 660, 540, 560 wide (2 lines) |
| brechas (3 items) | cards-3 | 60, 217, 360×270 → 4:3; 460, 217, 360×270 → 4:3; 860, 217, 360×270 → 4:3 | 60, 60, 900 wide (title); 60, 517, 360 wide (2 lines); 460, 517, 360 wide (2 lines); 860, 517, 360 wide (2 lines) |
| brechas (4 items) | cards-3 | 60, 222, 260×260 → 1:1; 360, 222, 260×260 → 1:1; 660, 222, 260×260 → 1:1; 960, 222, 260×260 → 1:1 | 60, 60, 900 wide (title); 60, 512, 260 wide (2 lines); 360, 512, 260 wide (2 lines); 660, 512, 260 wide (2 lines); 960, 512, 260 wide (2 lines) |
| brechas (5 items) | cards-3 | 60, 219, 213×266 → 4:5; 297, 219, 213×266 → 4:5; 534, 219, 213×266 → 4:5; 770, 219, 213×266 → 4:5; 1007, 219, 213×266 → 4:5 | 60, 60, 900 wide (title); 60, 515, 213 wide (2 lines); 297, 515, 213 wide (2 lines); 534, 515, 213 wide (2 lines); 770, 515, 213 wide (2 lines); 1007, 515, 213 wide (2 lines) |
