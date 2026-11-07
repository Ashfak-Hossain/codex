# Roadmap

The goal: turn the Hilbert Notebooks into a cosy, beautiful hobby notebook that readers can't put down. Every concept is explained in **easy words first, then all the way down**, with something to touch on most pages, so nobody ever needs to open another tab.

Order of work: **design and reader engine first** (they change every page), then **rewrite** what exists, then **grow** the Networking track from the very beginning to advanced, then System Design.

Task IDs are stable. Never renumber; add new tasks with the next free number. Status lives in [PROGRESS.md](PROGRESS.md), not here.

---

## Phase 0 · Workflow ✅

- **P0.1 Plan and progress system.** This folder, the prime prompt, the `/notebook` commands.

## Phase 1 · Design system 🚦 _starts with a decision gate_

Goal: the site looks and feels like one cosy, well-made notebook. See [DESIGN.md](DESIGN.md).

- **P1.0 Design decisions (gate).** Show Ashfak 2–3 typography pairings, the track colours and the mascot sketch on a draft preview page (`plans/preview/design-preview.html`, never published), rendered in light and dark mode. Record his choices in DESIGN.md → Decisions. _Done when every item in DESIGN.md → Decisions needed is answered._
- **P1.1 Typography and palette.** Apply the chosen fonts and the track accent colours in `quartz.config.ts` and `quartz/styles/custom.scss`. _Done when all text passes 4.5:1 contrast in both themes and nothing in Mathematics looks broken._
- **P1.2 Callout set.** Custom callout types with their own colour and icon: `plain` (in plain words), `analogy`, `aha` (key idea), `pitfall`, `try` (try it yourself), `deeper` (collapsible "go deeper"), plus the existing `question` for check-yourself. _Done when a draft demo page shows all of them in both themes._
- **P1.3 Learning path bar.** A component at the top of every track page: track name and colour, stage, "step 3 of 14", previous and next buttons. Driven by front matter (`track`, `stage`, `step`). _Done when every Networking and System Design page shows it correctly, and pages without `track` show nothing._
- **P1.4 Home learning map.** Replace or extend the home hero with a "subway map" of the tracks: one line per track, one station per page, stations filled when read (uses P2.1). _Done when it renders on desktop and phone and links to every track page._
- **P1.5 Mascot (only if approved in P1.0).** An original, simple SVG character (proposal: "Pip", a small parcel-shaped packet) used in `plain` callouts and on the home map. At most 2–3 appearances per page.
- **P1.6 Design review (gate).** Ashfak reviews the draft preview page plus two real pages. Fix what he flags. Delete `plans/preview/` afterwards.

## Phase 2 · Reader engine

Goal: reading feels rewarding, and no term ever goes unexplained.

- **P2.1 Reading progress.** "Mark as read" at the end of each page (auto-marked when the reader reaches the recap), stored in `localStorage`. A ✓ appears in the Explorer, the path bar and the home map. A "Continue where you left off" link on the home page. _Must work when storage is unavailable (no errors, just no ticks)._
- **P2.2 Glossary.** `content/Glossary/` with one short page per term: a one-sentence plain definition, an analogy, and "learn it properly in [[Page]]". Quartz hover popovers show it in place. A Glossary index A–Z. Rule: the first use of a term on any page links to its glossary entry. _Done when every term used in the five existing Networking pages has an entry._
- **P2.3 Quiz widget.** A scored, multiple-choice `quiz` widget in `NotebookWidgets`, written in markdown-friendly HTML, with an explanation shown after each answer. Use it at the end of track pages alongside the `question` callouts.
- **P2.4 Review deck.** A `Review` page that gathers every check-yourself question from the site into a spaced-repetition deck (intervals of 1, 3, 7 and 21 days, stored in `localStorage`).

## Phase 3 · Rewrite the existing Networking pages

Goal: the five existing pages follow the new [STYLE_GUIDE.md](STYLE_GUIDE.md) and design, and gain front matter for the path bar.

- **P3.1 Layers and Encapsulation**
- **P3.2 A Packet's Journey**
- **P3.3 DHCP**
- **P3.4 ARP**
- **P3.5 Connectivity Debug Ladder.** Becomes the capstone of the basics (step 14). Update its `_Next_` link.

_Done for each when the page passes the STYLE_GUIDE checklist, every term links to the glossary, and it has at least one interactive or a clear reason why not._

## Phase 4 · Networking, Stage 1: how a machine finds anything

The full Networking path. ✅ marks pages that exist (to be rewritten in Phase 3):

```text
Stage 1  1 Layers ✅  2 Journey ✅  3 IP & Subnets  4 DHCP ✅  5 ARP ✅
         6 Routing  7 NAT  8 DNS
Stage 2  9 Ports & Sockets  10 UDP  11 TCP
Stage 3  12 TLS & Certificates  13 HTTP  14 Debug Ladder ✅
Stage 4  15 IPv6  16 Load Balancers  17 CDNs & Anycast
         18 Firewalls & VPNs  19 Kubernetes Networking  20 BGP
```

- **P4.1 IP Addresses and Subnets.** IPv4 addresses as 32 bits, CIDR (`/24`), the subnet mask, private ranges, "is it on my network?". _Widget: subnet calculator (type an address and prefix, see network, broadcast, host range, and a bit view)._
- **P4.2 Routing.** Routing tables, default gateway, longest-prefix match, hop by hop, `ip route` and `netstat -rn`. _Widget: route a packet through a small network by reading each router's table._
- **P4.3 NAT.** Private to public addresses, the translation table, port mapping, carrier-grade NAT, why hosting from home is hard, port forwarding. _Widget: watch a NAT table fill as devices open connections._
- **P4.4 DNS.** Names, records (A, AAAA, CNAME, MX, TXT, NS), recursive vs authoritative, the resolution walk, TTL and caching, `dig`. _Widget: step-by-step resolver with a cache._

## Phase 5 · Networking, Stage 2: moving data reliably

- **P5.1 Ports and Sockets.** What a socket is, `bind`/`listen`/`accept`/`connect`, the 4-tuple, ephemeral ports, "address already in use", `ss` and `lsof`. _Widget: socket lifecycle on client and server side by side._
- **P5.2 UDP.** Datagrams, no handshake, when "fast and unreliable" wins (DNS, games, voice, QUIC).
- **P5.3 TCP.** Handshake, sequence and ack numbers, flow control (window), congestion control (slow start, AIMD), retransmission, `TIME_WAIT`, teardown. _Widgets: reuse `tcp-sim`, add a congestion-window graph._

## Phase 6 · Networking, Stage 3: security and the web

- **P6.1 TLS and Certificates.** Encryption vs authentication, key exchange in plain words, certificates and the chain of trust, CAs, Let's Encrypt, SNI, mTLS. _Widget: verify a certificate chain step by step._
- **P6.2 HTTP.** Requests and responses, methods, status codes, headers, cookies, caching, HTTP/1.1 vs 2 vs 3. _Widget: build a request and see the raw bytes and the response._
- **P6.3 Re-link the chain.** Debug Ladder becomes step 14; update every `_Next_` link, the Networking index, and the Explorer order.

## Phase 7 · Networking, Stage 4: advanced, in production

- **P7.1 IPv6**
- **P7.2 Load Balancers and Reverse Proxies** (L4 vs L7, health checks, Nginx)
- **P7.3 CDNs and Anycast**
- **P7.4 Firewalls and VPNs** (stateful firewalls, WireGuard)
- **P7.5 Kubernetes Networking** (Pods, Services, kube-proxy, CNI, Ingress)
- **P7.6 BGP** (how ISPs route the internet; famous outages)

## Phase 8 · System Design track

- **P8.1 Rewrite the existing four pages** to the new style: Latency Numbers, Network Failure Modes, Delivery Guarantees and Idempotency, Reading Any System.
- **P8.2 Caching**
- **P8.3 Rate Limiting**
- **P8.4 Queues and Streams**
- **P8.5 Replication and Consistency**
- **P8.6 Sharding and Partitioning**
- **P8.7 Consensus (Raft)**
- **P8.8 Observability** (logs, metrics, traces, OpenTelemetry)
- **P8.9 API Design**

## Phase 9 · Polish

- **P9.1** Accessibility audit (keyboard, screen reader, contrast, reduced motion). Includes the canvas controls on Fourier Series, Game of Life and Maze Lab, which measure 1.26–4.42:1.
- **P9.2** Performance (page weight, font loading, widget scripts only where used).
- **P9.3** Link and reference check across the site.
- **P9.4** Fix the pre-existing TypeScript errors and Prettier warnings so `npm run check` passes.
