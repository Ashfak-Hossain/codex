# Notebook plans

This folder is the brain of the Hilbert Notebooks project. Nothing in here is published: Quartz only builds `content/`.

It lets any working session (Claude in the app, Claude Code in the terminal, or you by hand) pick up exactly where the last one stopped.

| File                               | What it holds                                                                     | Who changes it                      |
| ---------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------- |
| [PRIME_PROMPT.md](PRIME_PROMPT.md) | The prompt that starts a working session: orient → report → do one task → save    | Rarely; only to change the workflow |
| [PROGRESS.md](PROGRESS.md)         | **The save file.** What's done, what's in progress, what's next, the session log  | Every session, at start and end     |
| [ROADMAP.md](ROADMAP.md)           | Every phase and task, with its goal and definition of done                        | When scope changes                  |
| [STYLE_GUIDE.md](STYLE_GUIDE.md)   | How notes are written: plain words, deep ideas, "nobody needs to google anything" | When the writing rules change       |
| [DESIGN.md](DESIGN.md)             | How the site looks and feels, components to build, libraries allowed              | When the design changes             |

## How to start a session

**Claude Code in the terminal** (in the repo folder). One-time setup, because the commands live in `plans/claude-commands/`:

```bash
mkdir -p .claude/commands && cp plans/claude-commands/*.md .claude/commands/
```

Then:

```
/notebook          # run the next task
/notebook P4.2     # run a specific task
/notebook-status   # only report where things stand; change nothing
```

**Any other Claude session** with this repo connected: paste the contents of [PRIME_PROMPT.md](PRIME_PROMPT.md).

## The loop every session follows

```text
  1 ORIENT   read CLAUDE.md, this folder, git log
  2 REPORT   previous · current · next · waiting on you
  3 CONFIRM  which task? any decision needed first?
  4 MARK     task → 🟨 in progress in PROGRESS.md
  5 WORK     one task, by STYLE_GUIDE + DESIGN
  6 VERIFY   build, check, look at it (light, dark, phone)
  7 SAVE     PROGRESS.md: status, session log, next
  8 HAND OFF what changed · how to preview · commit message
```

## Status legend

⬜ todo · 🟨 in progress · 👀 done, waiting for your review · ✅ done · ⏸ parked
