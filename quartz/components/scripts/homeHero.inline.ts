// ── Canvas: falling math symbols ──────────────────────────────────────
function initHeroCanvas() {
  const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null
  if (!canvas) return

  const ctx = canvas.getContext("2d")!
  const SYMBOLS = [
    "∫",
    "∑",
    "∀",
    "∃",
    "∂",
    "∇",
    "ε",
    "δ",
    "π",
    "λ",
    "φ",
    "Ω",
    "α",
    "β",
    "γ",
    "θ",
    "Δ",
    "⊂",
    "∈",
    "≡",
    "≤",
    "≥",
    "≈",
    "∞",
    "√",
    "∏",
    "ℝ",
    "ℕ",
    "ℤ",
    "⊗",
  ]
  const SIZES = [22, 28, 34, 42]
  const COL_GAP = 60

  let W = (canvas.width = canvas.offsetWidth)
  let H = (canvas.height = canvas.offsetHeight)

  const cols = Math.floor(W / COL_GAP) + 1

  type Drop = { y: number; speed: number; sym: string; size: number }

  function randSym() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
  }
  function randSize() {
    return SIZES[Math.floor(Math.random() * SIZES.length)]
  }
  function randSpeed() {
    return 0.018 + Math.random() * 0.028
  }

  const drops: Drop[] = Array.from({ length: cols }, () => ({
    y: Math.random() * -(H / 28) * 3,
    speed: randSpeed(),
    sym: randSym(),
    size: randSize(),
  }))

  let animId: number

  function draw() {
    ctx.clearRect(0, 0, W, H)

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i]
      const x = i * COL_GAP
      const y = d.y * d.size
      const progress = y / H

      // bell-curve opacity: fades in, peaks mid-screen, fades out
      const alpha = progress < 0 ? 0 : Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI) * 0.52

      ctx.save()
      ctx.font = `${d.size}px monospace`
      ctx.shadowColor = `rgba(122,175,212,${alpha * 1.6})`
      ctx.shadowBlur = 14
      ctx.fillStyle = `rgba(122,175,212,${alpha})`
      ctx.fillText(d.sym, x, y)
      ctx.restore()

      // only reassign symbol when column resets to top
      if (y > H + d.size * 2 && Math.random() > 0.982) {
        d.y = -2 - Math.random() * 10
        d.sym = randSym()
        d.size = randSize()
        d.speed = randSpeed()
      }
      d.y += d.speed
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

  const NOTEBOOKS = new Set(["forge-of-algorithms", "canvas"])

  function out(html: string, cls = "iterm-out") {
    const d = document.createElement("div")
    d.className = cls
    d.innerHTML = html.replace(/\n/g, "<br>")
    log!.appendChild(d)
    log!.scrollTop = log!.scrollHeight
  }

  const CMDS: Record<string, (args: string) => void> = {
    help: () =>
      out(`<table class="iterm-help">
        <tr><td class="c-accent">whoami</td><td>who I am</td></tr>
        <tr><td class="c-accent">ls</td><td>list sections</td></tr>
        <tr><td class="c-accent">cat about</td><td>bio</td></tr>
        <tr><td class="c-accent">cat now</td><td>what I'm working on</td></tr>
        <tr><td class="c-warm">cd &lt;section&gt;</td><td>navigate</td></tr>
        <tr><td class="c-accent">euler</td><td>the most beautiful equation</td></tr>
        <tr><td class="c-accent">fib [n]</td><td>fibonacci</td></tr>
        <tr><td class="c-accent">prime [n]</td><td>first n primes</td></tr>
        <tr><td class="c-accent">gcd a b</td><td>euclidean algorithm, step by step</td></tr>
        <tr><td class="c-accent">collatz n</td><td>3n+1 sequence</td></tr>
        <tr><td class="c-accent">factor n</td><td>prime factorization</td></tr>
        <tr><td class="c-accent">clear</td><td>clear</td></tr>
      </table>`),

    whoami: () =>
      out(`<span class="c-accent">ashfak-hossain</span><br>
algorithms · proofs · competitive programming<br>
<span class="c-warm">the hilbert notebooks</span>`),

    ls: () =>
      out(
        `<span class="c-dir">forge-of-algorithms/</span>  <span class="c-dir">canvas/</span>`,
      ),

    cat: (args) => {
      const f = args.trim().replace(/\.txt$/, "")
      if (f === "about" || f === "bio" || f === "me") {
        out(`proofs, algorithms, ideas that <em>almost</em> make sense.<br>
a parking lot for half-formed thoughts and quiet "wait — does this work?" moments.`)
      } else if (f === "now") {
        out(
          `<span class="c-warm">▸</span> number theory — modular inverses, linear congruences, CRT`,
        )
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
      } else if (NOTEBOOKS.has(dest)) {
        out(`<span class="c-dim">→ <span class="c-accent">${dest}/</span></span>`)
        setTimeout(() => {
          const { origin, pathname } = window.location
          const base = pathname.endsWith("/") ? pathname : pathname + "/"
          window.location.href = origin + base + dest + "/"
        }, 350)
      } else {
        out(
          `<span class="c-err">cd: ${dest}: not found</span> — try <span class="c-warm">ls</span>`,
        )
      }
    },

    euler: () =>
      out(`<span class="c-accent" style="font-size:1.1em;letter-spacing:.04em">e<sup>iπ</sup> + 1 = 0</span>
<span class="c-dim">five constants. one equation. Euler, 1748.</span>`),

    fib: (args) => {
      const n = Math.min(Math.max(parseInt(args) || 10, 1), 30)
      const seq: number[] = [0, 1]
      while (seq.length < n) seq.push(seq[seq.length - 1] + seq[seq.length - 2])
      out(`<span class="c-accent">${seq.slice(0, n).join(", ")}</span>
<span class="c-dim">φ ≈ ${(seq[n - 1] / seq[n - 2]).toFixed(8)}</span>`)
    },

    prime: (args) => {
      const n = Math.min(Math.max(parseInt(args) || 10, 1), 50)
      const primes: number[] = []
      for (let c = 2; primes.length < n; c++) {
        if (primes.every((p) => c % p !== 0)) primes.push(c)
      }
      out(`<span class="c-accent">${primes.join(", ")}</span>
<span class="c-dim">p(${n}) = ${primes[primes.length - 1]}</span>`)
    },

    gcd: (args) => {
      const [a, b] = args.trim().split(/\s+/).map(Number)
      if (!a || !b || isNaN(a) || isNaN(b)) {
        out(`<span class="c-err">usage: gcd &lt;a&gt; &lt;b&gt;</span>`)
        return
      }
      const steps: string[] = []
      let x = Math.abs(Math.floor(a)),
        y = Math.abs(Math.floor(b))
      while (y !== 0) {
        steps.push(`gcd(${x}, ${y})`)
        ;[x, y] = [y, x % y]
      }
      steps.push(`gcd(${x}, 0) = <span class="c-warm">${x}</span>`)
      out(steps.map((s) => `  ${s}`).join("<br>"))
    },

    collatz: (args) => {
      const n0 = parseInt(args)
      if (!n0 || isNaN(n0) || n0 < 1) {
        out(`<span class="c-err">usage: collatz &lt;n&gt;</span>`)
        return
      }
      const seq: number[] = [n0]
      let c = n0,
        steps = 0
      while (c !== 1 && steps < 500) {
        c = c % 2 === 0 ? c / 2 : 3 * c + 1
        seq.push(c)
        steps++
      }
      const display = seq.length <= 24 ? seq.join(" → ") : seq.slice(0, 12).join(" → ") + ` → … → 1`
      out(`<span class="c-dim">${display}</span>
<span class="c-dim">steps: <span class="c-accent">${steps}</span>  peak: <span class="c-warm">${Math.max(...seq)}</span></span>`)
    },

    factor: (args) => {
      const n = Math.abs(Math.floor(parseFloat(args)))
      if (!n || isNaN(n) || n < 2) {
        out(`<span class="c-err">usage: factor &lt;n&gt;</span>`)
        return
      }
      if (n > 1e9) {
        out(`<span class="c-err">too large (max 10⁹)</span>`)
        return
      }
      const factors: number[] = []
      let x = n,
        d = 2
      while (d * d <= x) {
        while (x % d === 0) {
          factors.push(d)
          x /= d
        }
        d++
      }
      if (x > 1) factors.push(x)
      const grouped = factors.reduce((acc: Record<number, number>, f) => {
        acc[f] = (acc[f] || 0) + 1
        return acc
      }, {})
      const display = Object.entries(grouped)
        .map(([p, e]) => (e > 1 ? `${p}<sup>${e}</sup>` : p))
        .join(" × ")
      out(
        `<span class="c-dim">${n} =</span> <span class="c-accent">${display}</span>${factors.length === 1 ? ' <span class="c-dim">(prime)</span>' : ""}`,
      )
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

// ── Name character cascade ────────────────────────────────────────────
function animateHeroName() {
  const el = document.querySelector(".hero-name") as HTMLElement | null
  if (!el) return
  const text = el.textContent ?? ""
  el.style.animation = "none"
  el.innerHTML = text
    .split("")
    .map((ch, i) => {
      const delay = (0.04 + i * 0.04).toFixed(2)
      return `<span class="hn-c" style="animation-delay:${delay}s">${ch === " " ? "&nbsp;" : ch}</span>`
    })
    .join("")
}

// ── Rotating bio role text ────────────────────────────────────────────
function initBioAnimation() {
  const roleEl = document.querySelector(".hero-role") as HTMLElement | null
  if (!roleEl) return

  const phrases = [
    "CS undergrad · AIUB",
    "convinced P ≠ NP but can't prove it",
    "epsilon-close to enlightenment",
    "proof by contradiction: I'm not lost",
    "one WA away from a clean solution",
    "believes in strong induction",
  ]

  let phraseIdx = 0
  let charIdx = phrases[0].length
  let erasing = false
  let timer: ReturnType<typeof setTimeout>

  function tick() {
    const current = phrases[phraseIdx]
    if (!erasing) {
      if (charIdx < current.length) {
        charIdx++
        roleEl!.textContent = current.slice(0, charIdx)
        timer = setTimeout(tick, 68)
      } else {
        timer = setTimeout(() => {
          erasing = true
          tick()
        }, 2400)
      }
    } else {
      if (charIdx > 0) {
        charIdx--
        roleEl!.textContent = current.slice(0, charIdx)
        timer = setTimeout(tick, 32)
      } else {
        phraseIdx = (phraseIdx + 1) % phrases.length
        erasing = false
        timer = setTimeout(tick, 280)
      }
    }
  }

  // start after entrance animation settles
  timer = setTimeout(() => {
    charIdx = 0
    tick()
  }, 900)
  window.addCleanup(() => clearTimeout(timer))
}

// ── Entry ──────────────────────────────────────────────────────────────
document.addEventListener("nav", () => {
  if (document.body.dataset.slug === "index") {
    initHeroCanvas()
    initTerminal()
    animateHeroName()
    initBioAnimation()
  }
})
