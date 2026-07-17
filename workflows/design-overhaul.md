# Workflow: Visual design overhaul (gallery, Novosti, day/night)

## Objective
Take three homepage/gallery features from "working" to "polished":
1. `galerija.html` — 3x3 grid of photos, each row auto-flipping to its next photo every 3.5s (row 1 & 3 flip upward, row 2 flips downward).
2. Homepage `#novosti` cards (`assets/js/novosti.js`) — each event/job card gets its own circular photo medallion behind the text (not the same stock photo repeated on every card), with a frosted overlay so the photo stays visible but the text stays readable.
3. Homepage `.daytime` section — becomes a day/night toggle: a sun/moon switch (click or drag) swaps between a "by day" panel and a "by night" panel, defaulting to whichever matches the visitor's real local time.

## Required inputs
- Existing brand tokens in `assets/css/styles.css` (`:root` — ink/panel/gold/cream/azure, `--font-display`/`--font-ui`, `--edge`).
- Photo library in `assets/images/gallery/` (no CMS image field exists for events/jobs — matching is done client-side by keyword).
- No build step; this is static HTML/CSS/JS served directly (or via a throwaway static server for local screenshots).

## Agent-to-subtask mapping (WAT Layer 2)
Per CLAUDE.md, the agent running this should switch which tool/agent handles a subtask based on the subtask's shape, not run everything the same way:

| Subtask | Handler | Why |
|---|---|---|
| Reading existing HTML/CSS/JS state, git diff of in-progress work | Direct tools (Read/Grep/Bash) by the primary agent | Small number of targeted lookups — spawning a subagent for a single file read is pure overhead. |
| Gallery grid restructure, Novosti card CSS/JS, day/night toggle implementation | Primary agent, inline | Needs tight cross-file consistency (HTML markup ↔ CSS selectors ↔ JS hooks) held in one context; splitting this across agents risks mismatched class names/contracts. |
| Visual iteration loop (screenshot → judge → refine CSS) | Primary agent, inline, using Playwright via `npx playwright` | Requires actually looking at the rendered screenshot and making an aesthetic judgment call each round — a subagent's text report can't substitute for the primary agent seeing the image. |
| Independent QA / code-review pass over the finished diff (unused CSS, accessibility gaps, naming consistency) | Delegated to a `general-purpose` background agent | Self-contained, doesn't need the visual context, and runs usefully in parallel with the primary agent's own screenshot loop. |

## Steps
1. Inventory current state (git diff, existing CSS classes, JS hooks that must not break — e.g. `main.js` targets `.daytime` for its scroll-reveal `IntersectionObserver`, so that class name is kept on the outer section even though its content changes).
2. Rebuild the gallery markup/CSS: 9 square tiles in 3 rows (2x3 on mobile); each tile is an `overflow:hidden` window containing exactly N stacked photos, no throwaway duplicate frames. `jump-end` `steps(N)` never holds at a full `1.0` — only at fractions `0/N .. (N-1)/N` — so `to` has to be the full `translateY(-100%)` for every step to land on a whole image; using `-(N-1)/N * 100%` (a natural-looking guess, tried and reverted during this pass) makes every step land mid-image, splitting two frames on screen at once.
3. Rebuild Novosti cards: keyword-match each event/job's own title text to a themed photo (see `IMAGE MAP` comment in `novosti.js`), render it as a full-bleed circular medallion bleeding off one corner of the card, with a radial-gradient foil between the photo and the text layer.
4. Build the day/night section: two absolutely-stacked background photos + two copy panels, switched via a `data-mode` attribute on the section, driven by a sun/moon switch (click **and** drag/swipe), defaulting from `new Date().getHours()` unless the visitor already chose a side (persisted in `localStorage`).
5. Serve the site locally (`npx serve` or equivalent) and screenshot each feature with Playwright at a few widths; iterate CSS until it reads as intentional and premium, not just "working."
6. Kick off the delegated QA pass in parallel with step 5.
7. Reconcile QA findings, do a final screenshot pass, leave the working tree uncommitted for the owner to review/deploy.

## Edge cases / gotchas learned
- Percentage `translateY()` on an animated element resolves against *that element's own* border-box height, not the parent's — so a flip-strip built from `aspect-ratio: 1/1` images stacked in a flex column doesn't need an explicit height hack; the math falls out on its own.
- Job "vrsta" (`Stalno`/`Studentski`) is not a role — it's employment type. Photo matching for job cards has to key off `naslov` (title) text (e.g. "konobar", "barmen"), not `vrsta`.
- `eurodom.jpg` / `tvrdja.jpg` are Osijek city landmarks (used for location context elsewhere), not bar-interior shots — excluded from the "Hedonist, iznutra" gallery pool to keep it thematically about the inside of the bar.
- No night-time video asset exists (`assets/videos/` has only the daytime `kava-priprema.mp4`); the night panel uses a photo instead of trying to source/fake a second video.
- A binary toggle is a `role="switch"` + `aria-checked`, not `role="slider"` + `aria-valuenow` — the latter implies a continuous range and conventional Arrow-Up/Down + Home/End keys that a two-state control has no use for.
- Don't rely on an *external* script (`assets/js/daynight.js`) to be the only thing that ever corrects a static `aria-pressed`/`aria-checked` default baked into the HTML — if that file 404s or is blocked, the ARIA state is wrong forever, not just for a moment. The same inline, un-404-able script that sets `data-mode` from local time/`localStorage` before first paint should also set the matching ARIA attributes in the same pass; the external file only needs to *keep* them in sync on user interaction afterwards.
- Toggling background photos with opacity (for the crossfade) doesn't remove the hidden one from the accessibility tree the way `display:none` does — if both carry real `alt` text, a screen reader hits both regardless of which is visually showing. Purely decorative crossfading photos should be `alt="" aria-hidden="true"`, especially when the copy panel next to them already says the same thing in text.
