# Style guide: easy words, deep ideas

**The promise to every reader:** you can start knowing almost nothing, finish understanding the topic deeply, and never once need to open another tab.

**The reader:** curious, can use a computer, knows a little programming. Not necessarily a CS student. Assume nothing else.

**Scope:** this guide covers the Networking and System Design tracks. Mathematics keeps its own style, including the playful voice in Combinatorics.

---

## The three-level ladder

Every concept is explained three times, each deeper than the last:

1. **Plain.** One or two sentences anyone could understand. No jargon. (`plain` callout)
2. **Mechanism.** How it actually works, with a picture or an interactive, using the terms now that they're defined.
3. **Detail.** Edge cases, exact numbers, header fields, the RFC. Long or advanced detail goes in a collapsible `deeper` callout so beginners can skip it without feeling lost.

## Page skeleton

```markdown
---
title: …
description: … (one sentence, plain words, used for search and link previews)
tags: [topic, domain, cs]
date: YYYY-MM-DD
track: networking # networking | system-design
stage: 1
step: 3 # position in the track's reading order
---

Hook: a real situation in 2–4 sentences (a bug, a question, a moment everyone knows).

> [!plain] In plain words
> One or two sentences.

**You'll learn:** 3–5 bullets. · _Prereqs: [[Page]] · [[Page]]_

---

## The picture ← a diagram or interactive FIRST, before the words

## Sections ← each: plain → analogy → mechanism → try it → (deeper)

## Common mistakes ← `pitfall` callouts

## Check yourself ← 4–6 `question` callouts, plus the quiz widget

## Recap ← 5 bullets max

_Next: [[Page]] — one sentence on why it's the natural next step._

### References
```

## Writing rules

- **Short sentences.** Aim for 15–20 words on average. One idea per paragraph.
- **Say why before how.** Start every section with the problem the thing solves.
- **"You", present tense, active voice.** "Your laptop sends…", not "A request is sent…".
- **Define every term the first time it appears,** in the sentence itself ("a _port_, a number that picks which program gets the data,") and link it to its `Glossary/` entry.
- **No unexplained acronym, ever.** Expand it on first use: "TTL (time to live)".
- **Concrete over abstract.** Real addresses, real commands, real numbers with units: `ashfak.dev`, `192.168.0.12`, "60 ms from Dhaka to Singapore".
- **One analogy world per track.** Networking uses the **parcel and post office** world (letter, locked box, numbered boxes and receipts, address label, vehicle). Don't mix in new metaphors when the existing world can stretch.
- **Banned words:** simply, just, obviously, easy, trivial, of course. They make a confused reader feel stupid.
- **Warm, a little playful, never childish.** Jokes are welcome if they also teach.
- **Plain and small, never formal.** Common words, short pages, no padding. Nothing that reads like a research paper, or like it was copied or written by an AI.
- **Keep it hands-on.** Real commands with sample output, what you'd see on the wire, and symptom-to-cause troubleshooting. These live in `try` callouts and normal sections, not in a fixed section order.

## The no-google checklist

Before a page is done, every box must be true:

- [ ] Every technical term is defined in place **or** links to a glossary entry.
- [ ] Every acronym is expanded on first use.
- [ ] Every command is explained flag by flag the first time it appears, with sample output and how to read it.
- [ ] Every number has a unit and a sense of scale ("about 60 ms, a blink is 100 ms").
- [ ] Every surprising claim has a reference.
- [ ] Every "see X" points to a page in this notebook, not to an outside site, unless it's a reference.
- [ ] Commands work on macOS and Linux, or both versions are given.

## Callouts

Seven types, each with one job. The title is optional; leave it off to get the default.

| Type       | Job                                         | Default title         |
| ---------- | ------------------------------------------- | --------------------- |
| `plain`    | The idea in one or two jargon-free lines    | In plain words        |
| `analogy`  | The idea in the track's analogy world       | Think of it like this |
| `aha`      | The one thing to remember                   | The key idea          |
| `pitfall`  | A common mistake and how to avoid it        | Watch out             |
| `try`      | A command or experiment, and what to notice | Try it yourself       |
| `deeper`   | Optional detail; always write `[!deeper]-`  | Go deeper             |
| `question` | Check yourself; always write `[!question]-` | Question              |

Add `-` after the bracket to start a callout collapsed, as in `> [!deeper]- Why 1460 bytes?`. Don't stack more than two callouts in a row.

## Interactives

- A page whose concept has a **moving part** (a handshake, a table filling up, a calculation) gets an interactive. Static concepts get a good diagram instead.
- All interactives live in `NotebookWidgets` and are embedded with `<div class="nbw" data-widget="…"></div>`.
- Every widget: works with keyboard, readable in light and dark mode, usable on a phone, respects `prefers-reduced-motion`, starts in a meaningful state (never an empty box).
- Below each widget, give 2–3 "try this" experiments, each with what the reader should notice.

## Diagrams

- ASCII diagrams in ```text blocks, **at most 66 characters wide**.
- Sequence diagrams (handshakes, request flows) may use Mermaid, which Quartz renders.
- Use the layer colours consistently (see DESIGN.md).

## Accuracy

- Cite RFCs, books with section numbers, and official documentation. No blogs as the only source for a fact.
- Mark typical values as typical. Never invent numbers.
- When in doubt, verify by running the command or reading the spec.

## Page definition of done

- [ ] Follows the skeleton; has `track`, `stage`, `step` front matter if it's on a track.
- [ ] Passes the no-google checklist.
- [ ] Has a `plain` callout, at least one analogy, a picture first, check-yourself questions with answers.
- [ ] Interactive present (or a stated reason why not), and it passes the widget rules.
- [ ] Prereqs at the top and `_Next_` at the bottom are correct; the domain and chapter `index.md` list it; its title is in the Explorer `order` list.
- [ ] `npx quartz build` succeeds; no new `npm run check` errors; looked at in light, dark and phone width.
