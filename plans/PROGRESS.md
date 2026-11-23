# Progress

_The save file. Read it all at the start of a session; update it at the start and end of every task._

_Last updated: 2026-11-23, session 5 (Claude Code)._

## Now

- **Phase:** 1 · Design system
- **Current task:** **P1.6 Design review (gate)**: in progress; waiting for Ashfak's notes
- **Next task:** Phase 2 · P2.1 Reading progress
- **Waiting on Ashfak:** review the site (checklist in this session's log) and send notes; merge `design/home-map-and-sidebar` into `master`

## Status board

Legend: ⬜ todo · 🟨 in progress · 👀 waiting for review · ✅ done · ⏸ parked

| ID   | Task                                 | Status | Notes                                                |
| ---- | ------------------------------------ | ------ | ---------------------------------------------------- |
| P0.1 | Plan and progress system             | ✅     | This folder, `/notebook` commands, CLAUDE.md section |
| P1.0 | Design decisions (gate)              | ✅     | Answers in DESIGN.md → Decisions                     |
| P1.1 | Typography and palette               | ✅     | Canvas controls moved to P9.1 by agreement           |
| P1.2 | Callout set                          | ✅     | Demo in `plans/preview/callouts/`, deleted at P1.6   |
| P1.3 | Learning path bar                    | ✅     | Shows real position; `step` is a sort key            |
| P1.4 | Home learning map                    | ✅     | Filled stations and "continue" wait for P2.1         |
| P1.5 | Mascot                               | ✅     | First `plain` callout and 404 page; home map in P1.4 |
| P1.6 | Design review (gate)                 | 🟨     | Waiting for Ashfak's notes                           |
| P1.7 | Sidebar (Explorer) redesign          | ✅     | VS Code / Notion style; review in P1.6               |
| P2.1 | Reading progress                     | ⬜     |                                                      |
| P2.2 | Glossary                             | ⬜     |                                                      |
| P2.3 | Quiz widget                          | ⬜     |                                                      |
| P2.4 | Review deck                          | ⬜     |                                                      |
| P3.1 | Rewrite: Layers and Encapsulation    | ⬜     | First version exists (session 1)                     |
| P3.2 | Rewrite: A Packet's Journey          | ⬜     | First version exists (session 1)                     |
| P3.3 | Rewrite: DHCP                        | ⬜     | Prereqs, questions and next link added in session 1  |
| P3.4 | Rewrite: ARP                         | ⬜     | Prereqs, questions and next link added in session 1  |
| P3.5 | Rewrite: Connectivity Debug Ladder   | ⬜     | First version exists (session 1)                     |
| P4.1 | IP Addresses and Subnets             | ⬜     |                                                      |
| P4.2 | Routing                              | ⬜     |                                                      |
| P4.3 | NAT                                  | ⬜     |                                                      |
| P4.4 | DNS                                  | ⬜     |                                                      |
| P5.1 | Ports and Sockets                    | ⬜     |                                                      |
| P5.2 | UDP                                  | ⬜     |                                                      |
| P5.3 | TCP                                  | ⬜     |                                                      |
| P6.1 | TLS and Certificates                 | ⬜     |                                                      |
| P6.2 | HTTP                                 | ⬜     |                                                      |
| P6.3 | Re-link the chain                    | ⬜     |                                                      |
| P7.1 | IPv6                                 | ⬜     |                                                      |
| P7.2 | Load Balancers and Reverse Proxies   | ⬜     |                                                      |
| P7.3 | CDNs and Anycast                     | ⬜     |                                                      |
| P7.4 | Firewalls and VPNs                   | ⬜     |                                                      |
| P7.5 | Kubernetes Networking                | ⬜     |                                                      |
| P7.6 | BGP                                  | ⬜     |                                                      |
| P8.1 | Rewrite the four System Design pages | ⬜     | First versions exist (session 1)                     |
| P8.2 | Caching                              | ⬜     |                                                      |
| P8.3 | Rate Limiting                        | ⬜     |                                                      |
| P8.4 | Queues and Streams                   | ⬜     |                                                      |
| P8.5 | Replication and Consistency          | ⬜     |                                                      |
| P8.6 | Sharding and Partitioning            | ⬜     |                                                      |
| P8.7 | Consensus (Raft)                     | ⬜     |                                                      |
| P8.8 | Observability                        | ⬜     |                                                      |
| P8.9 | API Design                           | ⬜     |                                                      |
| P9.1 | Accessibility audit                  | ⬜     | Includes canvas control contrast (1.26–4.42:1)       |
| P9.2 | Performance                          | ⬜     |                                                      |
| P9.3 | Link and reference check             | ⬜     |                                                      |
| P9.4 | Make `npm run check` pass            | ⬜     | See Known issues                                     |

## Session log

_Newest first. One entry per session: date, task, done, files, decisions, problems, next._

### 2026-11-23 · session 5 (continued) · Claude Code · P1.6 design review started

**Done**

- Committed the home map, sidebar and plans as 9bc6c14 on a new branch `design/home-map-and-sidebar`, because Claude doesn't commit straight to `master`. Ashfak's own ac8ec58 (path bar, Pip, AI Engineering) is on `master` and not yet pushed.
- Fixed the logged phone-header issue: the site title is 1.2rem below 800 px, so it takes two lines at 380 px instead of three. One line doesn't fit beside the search box and buttons. Uncommitted.

**Review checklist for Ashfak** (open each in light and dark, and once at phone width)

1. Home, `localhost:8080`: terminal hero, then the learning map below it.
2. A track page, `/Networking/Host-Configuration/DHCP`: path bar, sidebar, fonts, colours.
3. A Mathematics page, `/Mathematics/Euclidean-Algorithms/Greatest-Common-Divisor`: maths colours, code, sidebar.
4. Callout demo (`npx quartz build --serve -d plans/preview/callouts --port 8081 --wsPort 3002 -o /tmp/callout-demo`, then `localhost:8081/demo`) and the 404 page (`npx quartz build --serve --base /codex/`, any made-up address).
5. Open choices: a Mathematics line on the map (needs `track`/`step` front matter on Math notes), cursive dates (kept for now), and long sidebar titles wrapping or ending in "…".

**Next**

- Fix what Ashfak flags, delete `plans/preview/`, set P1.6 to ✅, then Phase 2 (P2.1 Reading progress).

### 2026-11-23 · session 5 (continued) · Claude Code · P1.7 round 2: VS Code / Notion style

**Why:** Ashfak's feedback: files and folders looked the same. Wanted something like the Notion or VS Code sidebar.

**Done** (replaces round 1's look; the keyboard arrows stay)

- Folders: arrow on the left, then a folder icon that switches to an open folder when expanded, then the name in semibold.
- Pages: a page icon, indented past the arrow column so it lines up under folder icons; regular weight.
- Top-level folder icons are tinted with the track colour (teal, violet, amber; grey otherwise), replacing round 1's dots.
- Rows are compact (about 30 px; 42 px in the phone menu). The current page sits in a tinted pill, and its icon takes the track colour. VS Code-style guide lines, with the active branch coloured.
- Icons are Lucide-style SVGs used as CSS masks, so they take any colour and follow the theme. All in the "Notebook sidebar" block of `styles/explorer.scss`.

**Verified**

- Desktop light and dark on Networking and Mathematics pages; phone menu at 380 px. Contrast clean on 3 pages in both themes. `npm test` and `tsc` unchanged.

**Notes**

- Long page titles wrap onto two lines rather than being cut off with "…", so every title stays readable.

### 2026-11-23 · session 5 (continued) · Claude Code · P1.7 sidebar redesign done

**Done** (asked by Ashfak mid-session; added to the roadmap as P1.7)

- New look for the "Living Archive" sidebar, as an override block at the end of `quartz/components/styles/explorer.scss`:
  - "Living Archive" is now a small spaced label.
  - Top-level sections get a coloured dot (teal, violet, amber; grey for the rest), with the arrow on the right.
  - Every row has a soft rounded hover and is at least 32 px tall (about 42 px in the phone menu).
  - The current page sits in a pill tinted with its track colour, and the guide line of its branch takes that colour.
  - About, Home and Privacy sit below a divider.
- The folder arrows now work with the keyboard: focusable, `role="button"`, `aria-label` and `aria-expanded`, toggled with Enter or Space (`quartz/components/scripts/explorer.inline.ts`). This is a local patch to Quartz code, like the earlier scroll fix.

**Verified**

- On Quartz's dev server in Chrome: desktop light and dark on Networking, System Design and Mathematics pages, the right dot colours and active pill; Tab reaches every row with a focus ring; Enter and Space toggle a folder and update `aria-expanded`; the page doesn't scroll. Phone menu at 380 px: arrows inside the screen edge. Contrast clean on 3 pages in both themes. `npm test` 80 of 80, `tsc` the same 4 baseline errors.

**Notes**

- Folder paths in the Explorer end in `/index` (for example `Networking/index`), so colour selectors use `[data-folderpath^="Networking/"]`.
- The bottom of the list fades out when it overflows. That's Quartz's OverflowList, unchanged.

### 2026-11-23 · session 5 (continued) · Claude Code · P1.4 done

**Done**

- `quartz/components/LearningMap.tsx` + `styles/learningMap.scss`: below the hero on the home page, one line per track (Networking, System Design), one station per page, built from the same front matter as the path bar (`getTrackPages` in `util/trackPath.ts`, with tests). Pip greets the reader in the heading.
- Horizontal line when there's room, vertical when the map is narrower than 44rem (a container query, so tablets with the sidebar open also get the vertical line).
- Each station link has `data-slug`, and `a.is-read .lm-dot` is already styled filled, so P2.1 only has to add the class. The "continue where you left off" button also waits for P2.1.

**Decisions**

- Mathematics has no line yet: its pages have no `track`/`step`, and adding them means touching Mathematics notes, so that's Ashfak's call. Adding a line later is front matter plus one entry in `TRACKS`.

**Verified**

- Built output: both lines, every station linked to the right page, map only on the home page. In Chrome at 1400, 900 and 380 px in both themes: no page overflow, no sideways scrolling, Tab reaches each station with a focus ring. Home page contrast clean in both themes. `npm test` 80 of 80.

### 2026-11-23 · session 5 · Claude Code · P1.5 Mascot done

**Done**

- Pip's drawing lives in one place, `quartz/util/pip.ts` (poses `hello` and `lost`). The four files in `quartz/static/pip/` are generated from it. To regenerate, call `pipSvg(pose, PIP_LINE[theme])` and write `<pose>-<theme>.svg`. `quartz/util/pip.test.ts` fails if they drift.
- Pip waves from the first `plain` callout on each page only (CSS in `quartz/styles/callouts.scss`, 52 px, 40 px on phones; the speech-bubble icon is hidden there). The image paths are relative to `index.css`, so they work with and without the `/codex/` base.
- The 404 page shows Pip lost, inline, with the outline following the theme (`quartz/components/pages/404.tsx`, `.pip-lost` in `custom.scss`).

**Verified so far**

- `npm test` 78 of 78 pass; `tsc` the same 4 baseline errors; the build copies `static/pip/*.svg` and `index.css` references them; `404.html` contains Pip.

**Verified in Chrome**

- Callout demo, light, dark and 380 px: the first `plain` callout shows Pip (52 px, 40 px on phones, matching theme file); the second keeps its speech-bubble icon. No page overflow.
- 404 page served under `/codex/`, light, dark and 380 px: Pip renders and its outline switches colour with the theme.
- Docs updated: STYLE_GUIDE.md → Callouts, DESIGN.md → Mascot, CLAUDE.md → Custom Components.

**Problems**

- The 404 page loads `/codex/index.css`, so on a local server without `--base /codex/` it shows unstyled. This is how Quartz builds 404 pages, not new. Preview it with `npx quartz build --serve --base /codex/`.

**Next**

- P1.4 Home learning map, then P1.6 Design review.

### 2026-11-15 · session 4 · Claude (chat) · new domain: AI Engineering

**Done**

- New domain `content/AI Engineering/` with a landing map (`index.md`) and a `Weekly Notes/` topic folder (`index.md` log table + `Week 01.md` stub, `draft: true` until filled).
- Weekly-note template at `content/template/weekly-note.md` (ignored by Quartz): goal → TL;DR → learned → built → stuck on → checkpoint → next week → references.
- `"Weekly Notes"` added to both Explorer `order` lists in `quartz.layout.ts`.

**Decisions**

- Weekly notes are a log, not a track: no `track`/`step` front matter, no path bar. Topic pages distilled from them can become a track later.
- Tags: `ai-engineering`, `weekly-notes`, `cs`.

**Next**

- Fill Week 01 and remove `draft: true`; add a row per week to `Weekly Notes/index.md`.

### 2026-11-07 · session 3 · Claude Code · P1.3 done

**Done**

- New path bar on every track page: track name in its colour, stage, "Step n of N", previous and next links. Files: `quartz/components/LearningPath.tsx`, `quartz/components/styles/learningPath.scss`, `quartz/util/trackPath.ts` (+ test), wired in `components/index.ts` and at the top of `beforeBody` in `quartz.layout.ts`.
- Front matter added to the 9 track pages. Networking steps 1, 2, 4, 5, 14 with stages 1, 1, 1, 1, 3. System Design steps 1–4, no stage.
- Corrected this file: P1.2 was committed by Ashfak in e1d60f1.

**Decisions**

- The bar shows the real position among existing pages ("Step 3 of 5"), not the planned number. `step` is only a sort key, so planned gaps never show and new pages need no renumbering.
- `stage` is optional. System Design has no stages yet.
- The last page in a track has no next link. The `_Next_` line at the bottom still carries readers from Networking into System Design.

**Verified**

- Every built page checked: the 9 track pages show the right position and links, matching their `_Next_` chain; the other 54 show nothing, including all index pages and home.
- On Quartz's real dev server in Chrome: next and previous update the bar with no page reload, the bar disappears when moving to a non-track page, real Tab reaches both links with a 2 px focus ring, Enter follows them.
- Contrast audit: 9 track pages clean in both themes.
- Looked at desktop in both themes and 380 px; no page overflow. `npm test` 74 of 74 pass, `tsc` the same 4 baseline errors, Prettier the same 10 files.

**Problems**

- Python's `http.server` can't serve Quartz's extensionless URLs, so SPA tests need `quartz build --serve`.

**Next**

- P1.5 Mascot, or P1.4 Home learning map if Ashfak prefers.

### 2026-11-07 · session 2 (continued) · Claude Code · P1.2 done

**Done**

- Added callouts `plain`, `analogy`, `aha`, `pitfall`, `try` and `deeper`, each with its own colour per theme and icon (`quartz/styles/callouts.scss`), and default titles (`quartz/plugins/transformers/ofm.ts`).
- Moved `question` from gold to blue so it doesn't blur into `aha`. This changes all 44 existing check-yourself callouts.
- Collapsible callouts now work with the keyboard: `role="button"`, `tabindex`, `aria-expanded`, Enter and Space (`callout.inline.ts`). Links inside a closed callout are out of the Tab order. Fold motion is off under `prefers-reduced-motion`.
- Rules added to STYLE_GUIDE.md → Callouts. Demo page at `plans/preview/callouts/demo.md`.

**Preview the demo:** `npx quartz build --serve -d plans/preview/callouts --port 8081 --wsPort 3002 -o /tmp/callout-demo`, then open `localhost:8081/demo`.

**Verified**

- Audit with every collapsed callout opened first: demo clean in both themes; site 86 of 92 runs clean, and the other 6 are the canvas pages left for P9.1.
- Keyboard tested in Chrome over DevTools: Enter and Space toggle, Tab skips a closed callout's link and reaches it once open.
- Looked at desktop in both themes and 380 px (no page overflow), before tuning `try` to a yellower green. The change is colour only.

**Decisions**

- `analogy` uses a parcel icon, matching the Networking analogy world. It may need changing when System Design gets its own analogies.
- `plain` uses a speech bubble until Pip arrives in P1.5.

**Next**

- P1.3 Learning path bar.

### 2026-11-07 · session 2 (continued) · Claude Code · P1.0 and P1.1 done

**Done**

- P1.0: recorded Ashfak's answers in DESIGN.md (typography A, teal/violet/amber, Pip yes, keep hero with map below).
- P1.1: Fraunces, Atkinson Hyperlegible Next and JetBrains Mono in `quartz.config.ts`; track colours as `--track-*` and `--track-*-ink` in `custom.scss`; track colour on index and chapter page titles; code ligatures off site-wide (`calt` only, so fi/fl stay); updated the font credit in `content/About.md`.
- Contrast fixes found by auditing every page: light `gray` to `#666b74`; amber to `#9e5a00` (track and `--nbw-tcp`); syntax themes to `github-*-default`, plus a stronger light comment colour; callout titles mixed toward the text colour; hero terminal dim text; table of contents, footer and list dates less transparent.
- Note colours: `--note-blue`, `--note-teal`, `--note-red` and `--note-orange` in `custom.scss`, one shade per theme, mapped onto the notes' `<font color>` tags and KaTeX `\color{}`. No note text changed. No single value can reach 4.5:1 on both papers.
- Explorer no longer scrolls the page past its title on load: added `block: "nearest"` in `explorer.inline.ts`, a local patch to upstream Quartz code.
- Removed the repeated `# Title` from 13 index pages (5 Mathematics, 5 Networking, 3 System Design).

**Verified**

- Audit of 46 pages (tag pages excluded) in both themes, 92 runs, counting CSS opacity and KaTeX text: 86 clean. The other 6 are the three canvas pages, moved to P9.1 by agreement.
- Explorer fix measured in Chrome over DevTools, in real time: on desktop, four long pages opened at scrollY 324–375 with the title off screen; now scrollY 0 with the title visible and the active item in view. Phone width was unaffected before and after.
- Looked at desktop (home, GCD, Extended Euclidean, Networking index, Fourier) and phone width (Layers and Encapsulation, GCD). KaTeX, code and the Fourier canvas render fine. An Open Graph image renders in the new fonts.
- Build succeeds. `tsc` shows the same 4 baseline errors; Prettier warns on 10 files, the same count as before this work.
- Not covered by the audit: hover states, widget states after clicking, generated terminal output, and CSS-generated text such as code line numbers. Not every Mathematics page was looked at by eye.
- Voice settled: "you" on both tracks, in plain short words, with hands-on labs kept (STYLE_GUIDE.md updated).
- Ashfak's answers: change the Math colours; canvas waits for P9.1; "yes" on cursive dates, read as keep them; remove repeated titles.

**Files:** `quartz.config.ts`, `quartz/styles/custom.scss`, `quartz/styles/callouts.scss`, `quartz/components/styles/` (`homeHero`, `notebookWidgets`, `toc`, `footer`, `listPage`, `recentNotes`), `quartz/components/scripts/explorer.inline.ts`, `content/About.md`, 13 `index.md` files, `plans/`.

**Problems**

- `quartz build --serve` wipes `public/` when it rebuilds, which spoiled one audit run. While a dev server is running, build elsewhere with `npx quartz build -o <dir>`.
- `plans/preview/design-preview.html` still shows the old amber `#a35d00` and grey. Harmless; it goes away in P1.6.

**Next**

- P1.2 Callout set.

### 2026-11-06 · session 2 · Claude Code · P1.0 preview

**Done**

- Corrected this file: the `/notebook` commands were already installed, so that waiting item is gone. Ashfak committed `plans/` and the commands mid-session (15a7c9f).
- Built `plans/preview/design-preview.html`: four typography specimens (A, B, C, today) on real text from Layers and Encapsulation, track colours with live contrast figures, Pip in three poses with and without a mock `plain` callout, and two home page layouts. Includes a Light / Dark switch.
- Confirmed all candidate fonts load from Google Fonts, using the same URL format as `quartz/util/theme.ts`.
- Checked in headless Chrome: desktop in both themes, 380 px wide with no page overflow, theme buttons work, all 8 font families load. `npx quartz build` succeeds and emits nothing from the preview. `tsc` still shows the 4 baseline errors. Prettier passes on the new file.

**Files:** `plans/preview/design-preview.html` (new), `plans/PROGRESS.md`, `plans/ROADMAP.md`, `plans/DESIGN.md`.

**Decisions**

- The preview lives in `plans/preview/`, not `content/`. A `draft: true` page would be filtered out of the dev server too, and a normal page could get published by accident.

**Problems**

- Teal and amber text fell below 4.5:1 on a 9% tint in light mode (4.43 and 4.34). Fixed in the preview with a stronger shade for text on tints (now 5.66 and 5.55). See DESIGN.md → Notes for P1.1 onward.
- The home map sketch is too small to read at 380 px. It's only a layout sketch, but P1.4 needs a real phone layout.

**Next**

- Record Ashfak's answers in DESIGN.md, set P1.0 to ✅, start P1.1.

### 2026-11-06 · session 1 · Claude (chat app) · foundations

**Done**

- Wrote 5 Networking pages and 4 System Design pages, each with TL;DR, check-yourself callouts, recap, prereqs/next chain and references:
  - `content/Networking/Foundations/`: Layers and Encapsulation, A Packet's Journey (+ `index.md`)
  - `content/Networking/Troubleshooting/`: Connectivity Debug Ladder (+ `index.md`)
  - `content/System Design/Foundations/`: Latency Numbers, Reading Any System (+ `index.md`)
  - `content/System Design/Reliability/`: Network Failure Modes, Delivery Guarantees and Idempotency (+ `index.md`)
  - `content/System Design/index.md`; rewrote `content/Networking/index.md` as a numbered learning path
- Updated ARP and DHCP: prereqs, four check-yourself questions each, `_Next_` links; fixed broken folder links in their chapter indexes. (Prettier also reformatted their tables.)
- Built `quartz/components/NotebookWidgets.tsx` + `scripts/notebookWidgets.inline.ts` + `styles/notebookWidgets.scss`, registered in `quartz/components/index.ts` and `quartz.layout.ts` (afterBody). Widgets: `packet-journey` (with `data-steps`), `tcp-sim`, `latency-scale`.
- New reading palette in `quartz.config.ts` (all text ≥ 4.5:1 contrast).
- Explorer `sortFn` in `quartz.layout.ts` with a reading-order `order` list.
- CLAUDE.md: current structure, widget usage, note template.
- Created `plans/` and `.claude/commands/notebook.md`, `notebook-status.md`.

**Decisions**

- Notes are evergreen notebook pages (not dated blog posts), in a second-person teacher voice.
- Networking is organized by problem, in chapters under `Foundations/`, `Host Configuration/`, `Address Resolution/`, `Troubleshooting/`.
- Work order: design system → reader engine → rewrite existing pages → new Networking pages → System Design.

**Problems**

- The repo's `node_modules` was half-installed; Ashfak reinstalled with `npm ci`.

**Next**

- P1.0: get Ashfak's design decisions, starting from DESIGN.md → Decisions needed.

## Decisions

| Date       | Decision                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------ |
| 2026-11-06 | Evergreen notebook notes, second-person teacher voice, scenario-led intros                 |
| 2026-11-06 | Reading palette: warm near-white / off-black, all text ≥ 4.5:1                             |
| 2026-11-06 | Plans live in `plans/` (unpublished); progress saved in this file                          |
| 2026-11-06 | P1.0: typography A, teal/violet/amber, Pip yes, keep hero with map below                   |
| 2026-11-07 | Note colours via CSS per theme, note text untouched; canvas contrast waits for P9.1        |
| 2026-11-07 | Keep the cursive date font; index pages carry no body `# Title`                            |
| 2026-11-07 | Voice: \"you\" and one skeleton on Networking and System Design; Mathematics keeps its own |

## Open questions

- None right now.

## Known issues

- `npm run check` fails before any of our changes: 4 TypeScript errors in `quartz/components/scripts/spa.inline.ts`, `quartz/processors/parse.ts` and `quartz/components/pages/og.tsx` (plus a related `micromorph` typings message), and Prettier warnings on some Mathematics notes. `npx quartz build` works regardless. Tracked as P9.4.
- Diagram characters (`─ │ ┌ →` and friends) aren't in the Google Fonts subsets of JetBrains Mono or IBM Plex Mono, so they come from a system font. On macOS Chrome they measure 9.633 px against 9.600 px for letters at 16 px, about 2 px of drift across a 66-character line. Line height 1.6 also leaves gaps in vertical lines. Same for every option and for today's site.
- In a sandbox without access to Google Fonts, `npx quartz build` fails in the `CustomOgImages` emitter; comment it out locally to test, never in a commit.
