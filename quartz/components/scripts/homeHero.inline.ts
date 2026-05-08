// ── Canvas: falling math symbols ──────────────────────────────────────
function initHeroCanvas() {
  const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null
  if (!canvas) return

  const ctx = canvas.getContext("2d")!
  const SYMBOLS = "∫∑∀∃∂∇εδπλφΩαβγρθΔ→←⊂∈≡≤≥≈∞·O(n)dp[]log n²".split("")
  const FONT_SIZE = 15

  let W = (canvas.width = canvas.offsetWidth)
  let H = (canvas.height = canvas.offsetHeight)

  const cols = Math.floor(W / FONT_SIZE) + 1
  const drops = Array.from({ length: cols }, () => Math.random() * -(H / FONT_SIZE))
  const speeds = Array.from({ length: cols }, () => 0.25 + Math.random() * 0.35)
  let animId: number

  function draw() {
    ctx.clearRect(0, 0, W, H)
    ctx.font = `${FONT_SIZE}px monospace`

    for (let i = 0; i < drops.length; i++) {
      const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      const x = i * FONT_SIZE
      const y = drops[i] * FONT_SIZE
      const progress = y / H
      const alpha = Math.max(0, Math.min(0.28, progress * 0.45))
      ctx.fillStyle = `rgba(122,175,212,${alpha})`
      ctx.fillText(sym, x, y)
      if (y > H && Math.random() > 0.978) drops[i] = 0
      drops[i] += speeds[i]
    }

    animId = requestAnimationFrame(draw)
  }

  draw()

  const ro = new ResizeObserver(() => {
    W = canvas.width = canvas.offsetWidth
    H = canvas.height = canvas.offsetHeight
  })
  ro.observe(canvas.parentElement ?? canvas)
  window.addCleanup(() => {
    cancelAnimationFrame(animId)
    ro.disconnect()
  })
}

// ── Interactive terminal ───────────────────────────────────────────────
function initTerminal() {
  const input = document.getElementById("iterm-input") as HTMLInputElement | null
  const log = document.getElementById("iterm-log") as HTMLElement | null
  const iterm = document.getElementById("iterm") as HTMLElement | null
  if (!input || !log || !iterm) return

  const history: string[] = []
  let histIdx = -1

  const NOTEBOOKS: Record<string, string> = {
    "forge-of-algorithms": "./forge-of-algorithms/",
    "math-canvas": "./math-canvas/",
    "scribble-vault": "./scribble-vault/",
    "reading-log": "./reading-log/",
  }

  function out(html: string, cls = "iterm-out") {
    const d = document.createElement("div")
    d.className = cls
    d.innerHTML = html
    log!.appendChild(d)
    log!.scrollTop = log!.scrollHeight
  }

  const CMDS: Record<string, (args: string) => void> = {
    help: () =>
      out(`<table class="iterm-help">
        <tr><td class="c-accent">whoami</td><td>who I am</td></tr>
        <tr><td class="c-accent">ls</td><td>list notebooks</td></tr>
        <tr><td class="c-accent">cat about</td><td>read my bio</td></tr>
        <tr><td class="c-accent">cat now</td><td>what I'm studying</td></tr>
        <tr><td class="c-warm">cd &lt;notebook&gt;</td><td>navigate there</td></tr>
        <tr><td class="c-accent">pwd</td><td>current path</td></tr>
        <tr><td class="c-accent">date</td><td>today's date</td></tr>
        <tr><td class="c-accent">clear</td><td>clear screen</td></tr>
      </table>`),

    whoami: () =>
      out(`<span class="c-accent">ashfak-hossain</span> — CS undergrad @ AIUB<br>
interests: algorithms · proofs · competitive programming<br>
writing at: <span class="c-warm">the hilbert notebooks</span>`),

    ls: () =>
      out(`<span class="c-dir">forge-of-algorithms/</span>  <span class="c-dir">math-canvas/</span>  <span class="c-dir">scribble-vault/</span>  <span class="c-dir">reading-log/</span>`),

    pwd: () => out(`<span class="c-dim">/home/ashfak/hilbert-notebooks</span>`),

    date: () => out(`<span class="c-dim">${new Date().toLocaleString()}</span>`),

    cat: (args) => {
      const f = args.trim().replace(/\.txt$/, "")
      if (f === "about" || f === "bio" || f === "me") {
        out(`Tracing proofs, algorithms, and ideas that <em>almost</em> make sense.<br>
A CS undergrad @ AIUB. This blog is a parking lot for half-formed thoughts,
math that sometimes behaves, and quiet "wait — does this work?" moments.`)
      } else if (f === "now") {
        out(`<span class="c-warm">▸ now:</span> studying greedy proofs &amp; segment trees`)
      } else if (f === "mission") {
        out(`make the hard stuff legible. one proof at a time.`)
      } else {
        out(`<span class="c-err">cat: ${f}: no such file</span>`)
      }
    },

    cd: (args) => {
      const dest = args.trim().replace(/\/$/, "")
      if (!dest || dest === "~" || dest === ".") {
        out(`<span class="c-dim">already home</span>`)
      } else if (dest === "..") {
        out(`<span class="c-dim">already at root</span>`)
      } else if (NOTEBOOKS[dest]) {
        out(`<span class="c-dim">→ navigating to <span class="c-accent">${dest}/</span></span>`)
        setTimeout(() => {
          window.location.href = NOTEBOOKS[dest]
        }, 350)
      } else {
        out(
          `<span class="c-err">cd: ${dest}: no such notebook</span><br><span class="c-dim">try: <span class="c-warm">ls</span></span>`,
        )
      }
    },

    clear: () => {
      log!.innerHTML = ""
    },
  }

  function run(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) return
    history.unshift(trimmed)
    histIdx = -1

    const echo = document.createElement("div")
    echo.className = "iterm-echo"
    echo.innerHTML = `<span class="c-ps">❯</span> ${trimmed.replace(/</g, "&lt;")}`
    log!.appendChild(echo)

    const [cmd, ...rest] = trimmed.split(/\s+/)
    const handler = CMDS[cmd.toLowerCase()]
    if (handler) {
      handler(rest.join(" "))
    } else {
      out(
        `<span class="c-err">command not found: ${cmd}</span> — try <span class="c-warm">help</span>`,
      )
    }
    log!.scrollTop = log!.scrollHeight
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Enter") {
      run(input!.value)
      input!.value = ""
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (histIdx < history.length - 1) {
        histIdx++
        input!.value = history[histIdx]
        setTimeout(() => input!.setSelectionRange(input!.value.length, input!.value.length), 0)
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (histIdx > 0) {
        histIdx--
        input!.value = history[histIdx]
      } else {
        histIdx = -1
        input!.value = ""
      }
    }
  }

  input.addEventListener("keydown", onKey)
  iterm.addEventListener("click", () => input!.focus())
  input.focus()
  window.addCleanup(() => input!.removeEventListener("keydown", onKey))
}

// ── Entry ──────────────────────────────────────────────────────────────
document.addEventListener("nav", () => {
  if (document.body.dataset.slug === "index") {
    initHeroCanvas()
    initTerminal()
  }
})
