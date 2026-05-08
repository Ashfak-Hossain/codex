# The Hilbert Notebooks

A personal digital garden covering mathematics, algorithms, competitive programming, and quiet thinking — built with [Quartz v4](https://quartz.jzhao.xyz/) and written in Obsidian.

**Live site:** <!-- add your domain here -->

---

## Content Structure

```
content/
├── forge-of-algorithms/    # Competitive programming & algorithm analysis
│   ├── basic/              # Foundational algorithms
│   ├── numbercraft/        # Number theory
│   ├── dp-lab/             # Dynamic programming
│   ├── graph-theory/       # Graph algorithms
│   └── data-structures/    # Trees, heaps, segment trees
│
├── math-canvas/            # Math derivations and proofs
│   ├── calculus/
│   ├── linear-algebra/
│   ├── discrete-math/
│   └── probability/
│
├── scribble-vault/         # Essays and personal writing
│   ├── tech-thoughts/
│   └── life/
│
└── reading-log/            # Book notes and paper reviews
```

---

## Running Locally

**Prerequisites:** Node.js v22+, npm 10.9+

```bash
# Install dependencies
npm install

# Preview with live reload
npx quartz build --serve

# Production build
npx quartz build

# Type check + formatting check
npm run check

# Auto-format
npm run format
```

The dev server runs at `http://localhost:8080`.

---

## Writing New Articles

1. Copy `content/template/blog.md` to the appropriate folder
2. Fill in `title`, `description`, `tags`, and `date`
3. Set `draft: true` while writing; flip to `draft: false` when ready to publish
4. Commit and push to `main` — CI will build and deploy automatically

**Frontmatter reference:**

```yaml
---
title: "Your Title"
description: "One-sentence description for SEO"
tags:
  - category-tag
  - topic-tag
date: 2026-05-08
draft: false
---
```

Tags automatically generate `/tags/<name>` index pages. KaTeX math rendering is enabled — use `$inline$` and `$$block$$` syntax.

---

## Contributing

Found a typo, broken link, or math error? See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

- **Content** (all `.md` files under `content/`): [CC BY 4.0](LICENSE)
- **Quartz framework** (`quartz/`): [MIT](https://github.com/jackyzha0/quartz/blob/v4/LICENSE)
