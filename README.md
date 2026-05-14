# The Hilbert Notebooks

A personal digital garden covering mathematics, algorithms, competitive programming, and quiet thinking — built with [Quartz v4](https://quartz.jzhao.xyz/) and written in Obsidian.

**Live site:** <!-- add your domain here -->

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

## Contributing

Found a typo, broken link, or math error? See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

- **Content** (all `.md` files under `content/`): [CC BY 4.0](LICENSE)
- **Quartz framework** (`quartz/`): [MIT](https://github.com/jackyzha0/quartz/blob/v4/LICENSE)
