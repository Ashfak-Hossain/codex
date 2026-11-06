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

Chosen 2026-11-06: option A, applied in P1.1. Replaced Proza Libre, Bricolage Grotesque and IBM Plex Mono. The options were:

| Option      | Headings                       | Body                       | Code           | Feel                             |
| ----------- | ------------------------------ | -------------------------- | -------------- | -------------------------------- |
| A · Cosy    | Fraunces (soft, rounded serif) | Atkinson Hyperlegible Next | JetBrains Mono | Warm, friendly, very readable    |
| B · Bookish | Fraunces                       | Literata                   | IBM Plex Mono  | A real book; best for long reads |
| C · Clean   | Bricolage Grotesque (keep)     | Inter                      | IBM Plex Mono  | Modern, closest to today         |

All of these fonts are on Google Fonts (checked 2026-11-06). Compare them in `plans/preview/design-preview.html`.

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

## Notes for P1.1 onward (from the P1.0 preview)

- **Code ligatures off (done in P1.1):** `font-variant-ligatures: no-contextual` on `:root`. JetBrains Mono otherwise draws `!=` as `≠` and `->` as an arrow, so readers see characters they can't type.
- **Text on a tint:** teal and amber fall below 4.5:1 on a 9% tint in light mode. Use `var(--track-*-ink)` from `custom.scss` for text on tinted bars and callouts, never the plain accent.
- **Amber changed:** the light amber is now `#9e5a00` (track and `--nbw-tcp`), so widget labels pass 4.5:1 on their tint.
- **Slashed zero:** Atkinson Hyperlegible Next slashes its zero everywhere, including prose and dates ("300 BC"). That's a font trait, not a bug.
- **Fraunces:** Quartz requests it without the optical size axis, so large headings use the default cut. The preview shows this as it would ship. Changing it means changing `formatFontSpecification` in `quartz/util/theme.ts`.
- **Amber vs hover:** the amber accent sits close to the site's hover colour (`tertiary`). Check this if Mathematics pages look confusing.
- **Home map on phones:** the sketch's labels are unreadable at 380 px, so P1.4 needs a separate phone layout, likely vertical.

## Decisions needed (P1.0)

- [x] Typography: option A, B or C (or another)?
- [x] Track colours: teal / violet / amber, OK?
- [x] Mascot Pip: yes or no? If yes, approve the sketch.
- [x] Home page: keep the terminal hero and add the map below, or replace the hero?

## Decisions

| Date       | Decision                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| 2026-11-06 | Typography: **A · Cosy**. Fraunces headings, Atkinson Hyperlegible Next body, JetBrains Mono code         |
| 2026-11-06 | Track colours: Networking teal, System Design violet, Mathematics amber                                   |
| 2026-11-06 | Mascot: **yes**, Pip as sketched in `plans/preview/design-preview.html`, at most 2–3 appearances per page |
| 2026-11-06 | Home page: keep the terminal hero and add the learning map below it                                       |
