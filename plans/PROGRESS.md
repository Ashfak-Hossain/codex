# Progress

_The save file. Read it all at the start of a session; update it at the start and end of every task._

_Last updated: 2026-11-07, session 2 (Claude Code)._

## Now

- **Phase:** 1 · Design system
- **Current task:** **P1.1 Typography and palette**: 👀 applied and audited, uncommitted; two contrast exceptions need Ashfak's call
- **Next task:** P1.2 Callout set
- **Waiting on Ashfak:** review P1.1 at `localhost:8080`; answer the open questions below (inline colours, Explorer scroll, cursive dates, duplicate index titles, voice)

## Status board

Legend: ⬜ todo · 🟨 in progress · 👀 waiting for review · ✅ done · ⏸ parked

| ID   | Task                                 | Status | Notes                                                |
| ---- | ------------------------------------ | ------ | ---------------------------------------------------- |
| P0.1 | Plan and progress system             | ✅     | This folder, `/notebook` commands, CLAUDE.md section |
| P1.0 | Design decisions (gate)              | ✅     | Answers in DESIGN.md → Decisions                     |
| P1.1 | Typography and palette               | 👀     | Applied; canvas and 4 Math notes still under 4.5:1   |
| P1.2 | Callout set                          | ⬜     |                                                      |
| P1.3 | Learning path bar                    | ⬜     |                                                      |
| P1.4 | Home learning map                    | ⬜     | Depends on P2.1 for filled stations                  |
| P1.5 | Mascot                               | ⬜     | Approved in P1.0                                     |
| P1.6 | Design review (gate)                 | ⬜     |                                                      |
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
| P9.1 | Accessibility audit                  | ⬜     |                                                      |
| P9.2 | Performance                          | ⬜     |                                                      |
| P9.3 | Link and reference check             | ⬜     |                                                      |
| P9.4 | Make `npm run check` pass            | ⬜     | See Known issues                                     |

## Session log

_Newest first. One entry per session: date, task, done, files, decisions, problems, next._

### 2026-11-07 · session 2 (continued) · Claude Code · P1.0 done, P1.1 applied

**Done**

- P1.0: recorded Ashfak's answers in DESIGN.md (typography A, teal/violet/amber, Pip yes, keep hero with map below).
- P1.1: Fraunces, Atkinson Hyperlegible Next and JetBrains Mono in `quartz.config.ts`; track colours as `--track-*` and `--track-*-ink` in `custom.scss`; track colour on index and chapter page titles; code ligatures off site-wide (`calt` only, so fi/fl stay); updated the font credit in `content/About.md`.
- Contrast fixes found by auditing every page: light `gray` to `#666b74`; amber to `#9e5a00` (track and `--nbw-tcp`); syntax themes to `github-*-default`, plus a stronger light comment colour; callout titles mixed toward the text colour; hero terminal dim text; table of contents, footer and list dates less transparent.

**Verified**

- Audit of 46 pages (tag pages excluded) in both themes, 92 runs, counting CSS opacity: 78 clean. The other 14 are the two exceptions under Open questions.
- Looked at desktop (home, GCD, Extended Euclidean, Networking index, Fourier) and phone width (Layers and Encapsulation, GCD). KaTeX, code and the Fourier canvas render fine. An Open Graph image renders in the new fonts.
- Build succeeds. `tsc` shows the same 4 baseline errors; Prettier warns on 10 files, the same count as before this work.
- Not covered by the audit: hover states, widget states after clicking, generated terminal output, and CSS-generated text such as code line numbers. Not every Mathematics page was looked at by eye.

**Files:** `quartz.config.ts`, `quartz/styles/custom.scss`, `quartz/styles/callouts.scss`, `quartz/components/styles/` (`homeHero`, `notebookWidgets`, `toc`, `footer`, `listPage`, `recentNotes`), `content/About.md`, `plans/`.

**Problems**

- `quartz build --serve` wipes `public/` when it rebuilds, which spoiled one audit run. While a dev server is running, build elsewhere with `npx quartz build -o <dir>`.
- `plans/preview/design-preview.html` still shows the old amber `#a35d00` and grey. Harmless; it goes away in P1.6.

**Next**

- Ashfak reviews P1.1 and answers the open questions, then P1.2 Callout set.

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

| Date       | Decision                                                                   |
| ---------- | -------------------------------------------------------------------------- |
| 2026-11-06 | Evergreen notebook notes, second-person teacher voice, scenario-led intros |
| 2026-11-06 | Reading palette: warm near-white / off-black, all text ≥ 4.5:1             |
| 2026-11-06 | Plans live in `plans/` (unpublished); progress saved in this file          |
| 2026-11-06 | P1.0: typography A, teal/violet/amber, Pip yes, keep hero with map below   |
| 2026-11-07 | Mathematics note text left untouched; canvas contrast proposed for P9.1    |

## Open questions

- Inline colours in 4 Mathematics notes (Counting Principles, Inclusion–Exclusion, Permutations and Combinations, Greatest Common Divisor) measure 3.56–4.47:1. They're written into the notes, which are off limits unless Ashfak asks. Change them, or accept them as an exception?
- Canvas controls on Fourier Series, Game of Life and Maze Lab measure 1.26–4.42:1 because they're deliberately dim. Proposal: move this to P9.1 rather than restyle three toys in P1.1. OK?
- Explorer: `activeElement.scrollIntoView({ behavior: "smooth" })` in `explorer.inline.ts` scrolls the whole page on load when nothing is saved in `sessionStorage` (scrollY of 2–165 px measured in headless Chrome, with a blank band at the top in captures). Upstream Quartz code, not caused by the font change. Not yet confirmed in a real browser. Possible fix: add `block: "nearest"`.
- Dates use `font-family: cursive` (`contentMeta.scss`, a local customisation), so they don't use the chosen fonts. Keep the personality, or switch to the body font?
- 12 index pages have a `# Title` in the body as well as the page title, so the title shows twice. Remove the body headings? Mathematics indexes would need his OK.
- Voice: STYLE_GUIDE.md says "you" and one skeleton for every track. Claude's older saved notes say System Design pages avoid I/we/you, and Networking pages use a different section flow (Why It Exists, On the Wire, See It Yourself). Claude proposed following the style guide; Ashfak hasn't confirmed. Settle before Phase 3, then update those notes.

## Known issues

- `npm run check` fails before any of our changes: 4 TypeScript errors in `quartz/components/scripts/spa.inline.ts`, `quartz/processors/parse.ts` and `quartz/components/pages/og.tsx` (plus a related `micromorph` typings message), and Prettier warnings on some Mathematics notes. `npx quartz build` works regardless. Tracked as P9.4.
- Diagram characters (`─ │ ┌ →` and friends) aren't in the Google Fonts subsets of JetBrains Mono or IBM Plex Mono, so they come from a system font. On macOS Chrome they measure 9.633 px against 9.600 px for letters at 16 px, about 2 px of drift across a 66-character line. Line height 1.6 also leaves gaps in vertical lines. Same for every option and for today's site.
- In a sandbox without access to Google Fonts, `npx quartz build` fails in the `CustomOgImages` emitter; comment it out locally to test, never in a commit.
