# Design

**Direction: a cosy lab notebook.** Warm paper, soft rounded shapes, small moments of delight, but crisp and serious where it matters: the text, the code, the diagrams. It should feel like someone's well-loved notebook that also happens to be very well engineered.

**What hooks readers:** a visible path (where am I, what's next), small rewards (ticks, a filling map, a quiz score), something to touch on most pages, and never feeling lost.

---

## Already in place (2026-11-06)

- **Palette** in `quartz.config.ts`: warm near-white paper (`#fbfaf7`) / off-black (`#16181c`); every text colour ≥ 4.5:1 contrast in both themes.
- **Layer colours** (widgets, used identically everywhere): application violet, security pink, transport amber, network teal, link blue. Defined as `--nbw-*` in `quartz/components/styles/notebookWidgets.scss`.
- **Interactives** via `NotebookWidgets`: `packet-journey`, `tcp-sim`, `latency-scale`.
- **Explorer** sorted by reading order (`order` list in `quartz.layout.ts`).

## Proposals (need Ashfak's decision in P1.0)

### Typography

Current: headers Proza Libre, body Bricolage Grotesque, code IBM Plex Mono. Bricolage has character but is tiring for long reading. Options to show side by side on a draft page:

| Option      | Headings                       | Body                       | Code           | Feel                             |
| ----------- | ------------------------------ | -------------------------- | -------------- | -------------------------------- |
| A · Cosy    | Fraunces (soft, rounded serif) | Atkinson Hyperlegible Next | JetBrains Mono | Warm, friendly, very readable    |
| B · Bookish | Fraunces                       | Literata                   | IBM Plex Mono  | A real book; best for long reads |
| C · Clean   | Bricolage Grotesque (keep)     | Inter                      | IBM Plex Mono  | Modern, closest to today         |

Check each font is available on Google Fonts before proposing it.

### Track colours

Each track gets one accent, used in its path bar, its line on the home map and its index page:

- Networking: **teal** · System Design: **violet** · Mathematics: **amber**

### Mascot (optional)

"**Pip**", an original small parcel-shaped packet with a face, drawn as simple SVG. Appears in `plain` callouts, the home map and empty states, and maybe on the 404 page. At most 2–3 times per page. Must stay original, never resembling an existing character.

### Home page

Keep the terminal hero's personality, and add a **learning map** below it: a subway-style map, one coloured line per track, one station per page, filled stations for pages read, and a "continue where you left off" button.

## Components to build

| Component           | Phase | What it does                                                      |
| ------------------- | ----- | ----------------------------------------------------------------- |
| Callout set         | P1.2  | `plain`, `analogy`, `aha`, `pitfall`, `try`, `deeper`, with icons |
| Learning path bar   | P1.3  | Track · stage · step n of N · previous / next                     |
| Home learning map   | P1.4  | Subway map of tracks with read progress                           |
| Reading progress    | P2.1  | Ticks in Explorer, path bar and map; "continue reading"           |
| Glossary + popovers | P2.2  | Hover a term → instant definition (Quartz popovers are on)        |
| Quiz widget         | P2.3  | Scored multiple choice with explanations                          |
| Review deck         | P2.4  | Spaced repetition across all pages                                |

## Libraries

Prefer **no new dependencies**. Already available: Quartz's popovers, callouts, KaTeX, Mermaid diagrams, D3 (used by the graph view), and the `NotebookWidgets` pattern for vanilla TypeScript interactives. Any new npm dependency needs Ashfak's approval first.

## Rules

- Contrast ≥ 4.5:1 for all text, both themes.
- Visible focus states; everything works with a keyboard.
- Motion is small and purposeful, and off under `prefers-reduced-motion`.
- Phone first: check every page and widget at about 380 px wide.
- Don't break the Mathematics pages or the `canvas/` visualizations.

## Decisions needed (P1.0)

- [ ] Typography: option A, B or C (or another)?
- [ ] Track colours: teal / violet / amber, OK?
- [ ] Mascot Pip: yes or no? If yes, approve the sketch.
- [ ] Home page: keep the terminal hero and add the map below, or replace the hero?

## Decisions

_Record each decision here with its date once Ashfak answers._
