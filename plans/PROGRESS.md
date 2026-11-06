# Progress

_The save file. Read it all at the start of a session; update it at the start and end of every task._

_Last updated: 2026-11-06, session 2 (Claude Code)._

## Now

- **Phase:** 1 · Design system
- **Current task:** **P1.0 Design decisions**: building the preview page
- **Next task:** P1.1 Typography and palette, once P1.0 is answered
- **Waiting on Ashfak:** answer the P1.0 design questions (DESIGN.md → Decisions needed)

## Status board

Legend: ⬜ todo · 🟨 in progress · 👀 waiting for review · ✅ done · ⏸ parked

| ID   | Task                                 | Status | Notes                                                     |
| ---- | ------------------------------------ | ------ | --------------------------------------------------------- |
| P0.1 | Plan and progress system             | ✅     | This folder, `/notebook` commands, CLAUDE.md section      |
| P1.0 | Design decisions (gate)              | 🟨     | Building preview page; then needs Ashfak                  |
| P1.1 | Typography and palette               | ⬜     | Palette already improved in session 1; fonts pending P1.0 |
| P1.2 | Callout set                          | ⬜     |                                                           |
| P1.3 | Learning path bar                    | ⬜     |                                                           |
| P1.4 | Home learning map                    | ⬜     | Depends on P2.1 for filled stations                       |
| P1.5 | Mascot                               | ⬜     | Only if approved in P1.0                                  |
| P1.6 | Design review (gate)                 | ⬜     |                                                           |
| P2.1 | Reading progress                     | ⬜     |                                                           |
| P2.2 | Glossary                             | ⬜     |                                                           |
| P2.3 | Quiz widget                          | ⬜     |                                                           |
| P2.4 | Review deck                          | ⬜     |                                                           |
| P3.1 | Rewrite: Layers and Encapsulation    | ⬜     | First version exists (session 1)                          |
| P3.2 | Rewrite: A Packet's Journey          | ⬜     | First version exists (session 1)                          |
| P3.3 | Rewrite: DHCP                        | ⬜     | Prereqs, questions and next link added in session 1       |
| P3.4 | Rewrite: ARP                         | ⬜     | Prereqs, questions and next link added in session 1       |
| P3.5 | Rewrite: Connectivity Debug Ladder   | ⬜     | First version exists (session 1)                          |
| P4.1 | IP Addresses and Subnets             | ⬜     |                                                           |
| P4.2 | Routing                              | ⬜     |                                                           |
| P4.3 | NAT                                  | ⬜     |                                                           |
| P4.4 | DNS                                  | ⬜     |                                                           |
| P5.1 | Ports and Sockets                    | ⬜     |                                                           |
| P5.2 | UDP                                  | ⬜     |                                                           |
| P5.3 | TCP                                  | ⬜     |                                                           |
| P6.1 | TLS and Certificates                 | ⬜     |                                                           |
| P6.2 | HTTP                                 | ⬜     |                                                           |
| P6.3 | Re-link the chain                    | ⬜     |                                                           |
| P7.1 | IPv6                                 | ⬜     |                                                           |
| P7.2 | Load Balancers and Reverse Proxies   | ⬜     |                                                           |
| P7.3 | CDNs and Anycast                     | ⬜     |                                                           |
| P7.4 | Firewalls and VPNs                   | ⬜     |                                                           |
| P7.5 | Kubernetes Networking                | ⬜     |                                                           |
| P7.6 | BGP                                  | ⬜     |                                                           |
| P8.1 | Rewrite the four System Design pages | ⬜     | First versions exist (session 1)                          |
| P8.2 | Caching                              | ⬜     |                                                           |
| P8.3 | Rate Limiting                        | ⬜     |                                                           |
| P8.4 | Queues and Streams                   | ⬜     |                                                           |
| P8.5 | Replication and Consistency          | ⬜     |                                                           |
| P8.6 | Sharding and Partitioning            | ⬜     |                                                           |
| P8.7 | Consensus (Raft)                     | ⬜     |                                                           |
| P8.8 | Observability                        | ⬜     |                                                           |
| P8.9 | API Design                           | ⬜     |                                                           |
| P9.1 | Accessibility audit                  | ⬜     |                                                           |
| P9.2 | Performance                          | ⬜     |                                                           |
| P9.3 | Link and reference check             | ⬜     |                                                           |
| P9.4 | Make `npm run check` pass            | ⬜     | See Known issues                                          |

## Session log

_Newest first. One entry per session: date, task, done, files, decisions, problems, next._

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

## Open questions

- Design decisions listed in DESIGN.md → Decisions needed (P1.0).

## Known issues

- `npm run check` fails before any of our changes: 4 TypeScript errors in `quartz/components/scripts/spa.inline.ts`, `quartz/processors/parse.ts` and `quartz/components/pages/og.tsx` (plus a related `micromorph` typings message), and Prettier warnings on some Mathematics notes. `npx quartz build` works regardless. Tracked as P9.4.
- In a sandbox without access to Google Fonts, `npx quartz build` fails in the `CustomOgImages` emitter; comment it out locally to test, never in a commit.
