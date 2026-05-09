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
        <tr><td class="c-dim">── math ──────────────────────────</td><td></td></tr>
        <tr><td class="c-accent">euler</td><td>the most beautiful equation</td></tr>
        <tr><td class="c-accent">fib [n]</td><td>fibonacci sequence</td></tr>
        <tr><td class="c-accent">prime [n]</td><td>first n primes</td></tr>
        <tr><td class="c-accent">gcd a b</td><td>euclidean algorithm with steps</td></tr>
        <tr><td class="c-accent">collatz n</td><td>3n+1 conjecture sequence</td></tr>
        <tr><td class="c-accent">factor n</td><td>prime factorization</td></tr>
        <tr><td class="c-accent">pi</td><td>Leibniz convergence demo</td></tr>
        <tr><td class="c-accent">det a b c d</td><td>2×2 matrix determinant</td></tr>
        <tr><td class="c-accent">tree</td><td>directory tree</td></tr>
        <tr><td class="c-accent">neofetch</td><td>system info</td></tr>
        <tr><td class="c-accent">echo &lt;text&gt;</td><td>echo text</td></tr>
        <tr><td class="c-accent">clear</td><td>clear screen</td></tr>
      </table>`),

    whoami: () =>
      out(`<span class="c-accent">ashfak-hossain</span> — CS undergrad @ AIUB<br>
interests: algorithms · proofs · competitive programming<br>
writing at: <span class="c-warm">the hilbert notebooks</span>`),

    ls: () =>
      out(
        `<span class="c-dir">forge-of-algorithms/</span>  <span class="c-dir">math-canvas/</span>  <span class="c-dir">scribble-vault/</span>  <span class="c-dir">reading-log/</span>`,
      ),

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

    euler: () =>
      out(`<span class="c-accent" style="font-size:1.1em;letter-spacing:.04em">e<sup>iπ</sup> + 1 = 0</span>
<span class="c-dim">five constants: e, i, π, 1, 0 — one equation.</span>
<span class="c-dim">Euler's identity, 1748. still unreasonably beautiful.</span>`),

    fib: (args) => {
      const n = Math.min(Math.max(parseInt(args) || 10, 1), 30)
      const seq: number[] = [0, 1]
      while (seq.length < n) seq.push(seq[seq.length - 1] + seq[seq.length - 2])
      const nums = seq.slice(0, n).join(", ")
      out(`<span class="c-dim">F(0..${n - 1}):</span> <span class="c-accent">${nums}</span>
<span class="c-dim">golden ratio φ ≈ F(n+1)/F(n) → ${(seq[n - 1] / seq[n - 2]).toFixed(8)}</span>`)
    },

    prime: (args) => {
      const n = Math.min(Math.max(parseInt(args) || 10, 1), 50)
      const primes: number[] = []
      for (let c = 2; primes.length < n; c++) {
        if (primes.every(p => c % p !== 0)) primes.push(c)
      }
      out(`<span class="c-dim">first ${n} primes:</span> <span class="c-accent">${primes.join(", ")}</span>
<span class="c-dim">p(${n}) = ${primes[primes.length - 1]} &nbsp;·&nbsp; by prime number theorem: ~${n} · ln(${primes[primes.length - 1]}) ≈ ${Math.round(n * Math.log(primes[primes.length - 1]))}</span>`)
    },

    gcd: (args) => {
      const [a, b] = args.trim().split(/\s+/).map(Number)
      if (!a || !b || isNaN(a) || isNaN(b)) {
        out(`<span class="c-err">usage: gcd &lt;a&gt; &lt;b&gt;</span>`); return
      }
      const steps: string[] = []
      let x = Math.abs(Math.floor(a)), y = Math.abs(Math.floor(b))
      while (y !== 0) {
        steps.push(`gcd(${x}, ${y})`)
        ;[x, y] = [y, x % y]
      }
      steps.push(`gcd(${x}, 0) = <span class="c-warm">${x}</span>`)
      out(`<span class="c-dim">euclidean algorithm:</span><br>${steps.map(s => `  ${s}`).join("<br>")}`)
    },

    collatz: (args) => {
      const n0 = parseInt(args)
      if (!n0 || isNaN(n0) || n0 < 1) {
        out(`<span class="c-err">usage: collatz &lt;n&gt;  (positive integer)</span>`); return
      }
      const seq: number[] = [n0]
      let c = n0, steps = 0
      while (c !== 1 && steps < 500) {
        c = c % 2 === 0 ? c / 2 : 3 * c + 1
        seq.push(c); steps++
      }
      const peak = Math.max(...seq)
      const display = seq.length <= 24 ? seq.join(" → ") : seq.slice(0, 12).join(" → ") + ` → … → ${seq[seq.length - 1]}`
      out(`<span class="c-dim">${display}</span>
<span class="c-dim">steps: <span class="c-accent">${steps}</span> &nbsp;·&nbsp; peak: <span class="c-warm">${peak}</span> &nbsp;·&nbsp; ${steps < 500 ? "reached 1 ✓" : "limit hit"}</span>`)
    },

    factor: (args) => {
      const n = Math.abs(Math.floor(parseFloat(args)))
      if (!n || isNaN(n) || n < 2) { out(`<span class="c-err">usage: factor &lt;n&gt;  (integer ≥ 2)</span>`); return }
      if (n > 1e9) { out(`<span class="c-err">too large (max 10⁹)</span>`); return }
      const factors: number[] = []
      let x = n, d = 2
      while (d * d <= x) { while (x % d === 0) { factors.push(d); x /= d } d++ }
      if (x > 1) factors.push(x)
      const grouped = factors.reduce((acc: Record<number, number>, f) => { acc[f] = (acc[f] || 0) + 1; return acc }, {})
      const display = Object.entries(grouped).map(([p, e]) => e > 1 ? `${p}<sup>${e}</sup>` : p).join(" × ")
      out(`<span class="c-dim">${n} =</span> <span class="c-accent">${display}</span>${factors.length === 1 ? ' <span class="c-dim">(prime)</span>' : ''}`)
    },

    pi: () => {
      let sum = 0
      const terms: string[] = []
      for (let i = 0; i < 8; i++) {
        const sign = i % 2 === 0 ? 1 : -1
        sum += sign / (2 * i + 1)
        terms.push(`${sign > 0 ? "+" : "−"}1/${2 * i + 1}`)
      }
      out(`<span class="c-dim">Leibniz: π/4 = 1 − 1/3 + 1/5 − 1/7 + …</span>
<span class="c-dim">8 terms: ${terms.join(" ")} + …</span>
<span class="c-dim">× 4 ≈ </span><span class="c-accent">${(sum * 4).toFixed(8)}</span>
<span class="c-dim">actual: ${Math.PI.toFixed(8)}  · needs ~10⁶ terms for 6 correct digits</span>`)
    },

    det: (args) => {
      const nums = args.trim().split(/[\s,]+/).map(Number)
      if (nums.length !== 4 || nums.some(isNaN)) {
        out(`<span class="c-err">usage: det a b c d</span><br><span class="c-dim">  |a b|  →  ad − bc</span><br><span class="c-dim">  |c d|</span>`); return
      }
      const [a, b, c, d] = nums
      const det = a * d - b * c
      out(`<span class="c-dim">  |<span class="c-accent">${a}</span> <span class="c-accent">${b}</span>|</span>
<span class="c-dim">  |<span class="c-accent">${c}</span> <span class="c-accent">${d}</span>|  →  ${a}×${d} − ${b}×${c} = </span><span class="c-warm">${det}</span>
<span class="c-dim">${det === 0 ? "singular — not invertible" : "invertible ✓  (det ≠ 0)"}</span>`)
    },

    tree: () =>
      out(`<span class="c-dim">/hilbert-notebooks</span>
<span class="c-dir">  ├── forge-of-algorithms/</span>  <span class="c-dim">algorithms & proofs</span>
<span class="c-dir">  ├── math-canvas/</span>         <span class="c-dim">pure mathematics</span>
<span class="c-dir">  ├── scribble-vault/</span>      <span class="c-dim">loose thoughts</span>
<span class="c-dir">  └── reading-log/</span>         <span class="c-dim">books & papers</span>`),

    neofetch: () =>
      out(`<span class="c-accent"> █ █  </span>  <span class="c-warm">ashfak</span><span class="c-dim">@</span><span class="c-accent">hilbert-notebooks</span>
<span class="c-accent"> █ █  </span>  <span class="c-dim">──────────────────────────────</span>
<span class="c-accent"> █████</span>  <span class="c-dim">role  </span><span class="c-accent">CS undergrad</span><span class="c-dim"> @ AIUB</span>
<span class="c-accent"> █ █  </span>  <span class="c-dim">focus </span><span class="c-warm">algorithms · proofs · CP</span>
<span class="c-accent"> █ █  </span>  <span class="c-dim">tools </span>obsidian · vim · c++ · python
       <span class="c-dim">lang  </span><span class="c-accent">math</span> (<span class="c-warm">first</span>) · code (second)
       <span class="c-dim">now   </span>greedy proofs &amp; segment trees`),

    echo: (args) => out(`<span class="c-dim">${args.replace(/</g, "&lt;") || ""}</span>`),

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

// ── Fourier Series ────────────────────────────────────────────────────
function initFourier() {
  const canvas  = document.getElementById("fourier-canvas") as HTMLCanvasElement | null
  const barsEl  = document.getElementById("fourier-bars")   as HTMLElement | null
  const eqEl    = document.getElementById("fourier-eq")     as HTMLElement | null
  if (!canvas || !barsEl) return

  const ctx = canvas.getContext("2d")!
  const N = 8, TAU = Math.PI * 2

  const PRESETS: Record<string, number[]> = {
    square: [1, 0, 1/3, 0, 1/5, 0, 1/7, 0],
    saw:    [1, -1/2, 1/3, -1/4, 1/5, -1/6, 1/7, -1/8],
    tri:    [1, 0, -1/9, 0, 1/25, 0, -1/49, 0],
    pulse:  [1, 0.88, 0.65, 0.45, 0.28, 0.14, 0.06, 0.02],
    rand:   [],
  }

  const HINTS: Record<string, string> = {
    square: "odd harmonics only · amplitude ∝ 1/n",
    saw:    "all harmonics · amplitude ∝ 1/n · sign alternates",
    tri:    "odd harmonics · amplitude ∝ 1/n² · converges faster",
    pulse:  "wide bandwidth · sharp edge = many harmonics",
    rand:   "drag bars to sculpt your own waveform",
  }

  const hintEl = document.getElementById("fourier-hint") as HTMLElement | null
  if (hintEl) hintEl.textContent = HINTS.square

  let amps = [...PRESETS.square]
  let tOff = 0, animId = 0
  let dragIdx = -1, dragStartY = 0, dragStartAmp = 0

  type BarEl = { fill: HTMLElement; val: HTMLElement }
  const bars: BarEl[] = []

  for (let i = 0; i < N; i++) {
    const col = document.createElement("div")
    col.className = "fb-col"
    col.innerHTML = `<div class="fb-val" id="fv${i}">0.00</div><div class="fb-track" data-i="${i}"><div class="fb-zero"></div><div class="fb-fill" id="ff${i}"></div></div><div class="fb-n">n=${i+1}</div>`
    barsEl.appendChild(col)
    bars.push({ fill: col.querySelector(".fb-fill")!, val: col.querySelector(".fb-val")! })

    const track = col.querySelector(".fb-track") as HTMLElement
    track.addEventListener("mousedown", (e) => { dragIdx = i; dragStartY = (e as MouseEvent).clientY; dragStartAmp = amps[i]; e.preventDefault() })
    track.addEventListener("touchstart", (e) => { dragIdx = i; dragStartY = (e as TouchEvent).touches[0].clientY; dragStartAmp = amps[i]; e.preventDefault() }, { passive: false })
  }

  function updateBar(i: number) {
    const a = Math.max(-1, Math.min(1, amps[i]))
    bars[i].val.textContent = a.toFixed(2)
    const pct = Math.abs(a) * 46
    const rs = getComputedStyle(document.documentElement)
    const pos = rs.getPropertyValue("--secondary").trim()
    const neg = rs.getPropertyValue("--tertiary").trim()
    if (a >= 0) {
      bars[i].fill.style.cssText = `top:${50 - pct}%;height:${pct}%;background:${pos};border-radius:2px;opacity:0.85`
    } else {
      bars[i].fill.style.cssText = `top:50%;height:${pct}%;background:${neg};border-radius:2px;opacity:0.85`
    }
  }

  function updateEq() {
    if (!eqEl) return
    const terms = amps
      .map((a, i) => ({ a, n: i + 1 }))
      .filter(({ a }) => Math.abs(a) > 0.005)
    if (!terms.length) { eqEl.textContent = "f(t) = 0"; return }
    eqEl.textContent = "f(t) = " + terms.map(({ a, n }, idx) => {
      const abs = Math.abs(a).toFixed(2)
      const neg = a < 0
      const pre = idx === 0 ? (neg ? "−" : "") : (neg ? " − " : " + ")
      return `${pre}${abs}·sin(${n > 1 ? n : ""}ωt)`
    }).join("")
  }

  function updateAll() { amps.forEach((_, i) => updateBar(i)); updateEq() }

  const onMove = (clientY: number) => {
    if (dragIdx < 0) return
    amps[dragIdx] = Math.max(-1, Math.min(1, dragStartAmp + (dragStartY - clientY) / 80))
    updateBar(dragIdx); updateEq()
    document.querySelectorAll(".fourier-preset").forEach(b => b.classList.remove("active"))
  }
  const onMouseMove = (e: MouseEvent) => onMove(e.clientY)
  const onTouchMove = (e: TouchEvent) => { if (dragIdx >= 0) { onMove(e.touches[0].clientY); e.preventDefault() } }
  const onUp = () => { dragIdx = -1 }

  document.addEventListener("mousemove", onMouseMove)
  document.addEventListener("touchmove", onTouchMove, { passive: false })
  document.addEventListener("mouseup", onUp)
  document.addEventListener("touchend", onUp)

  document.querySelectorAll(".fourier-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".fourier-preset").forEach(b => b.classList.remove("active"))
      btn.classList.add("active")
      const p = (btn as HTMLElement).dataset.p!
      amps = p === "rand"
        ? Array.from({ length: N }, (_, i) => (Math.random() * 2 - 1) / (i * 0.8 + 1))
        : [...PRESETS[p]]
      if (hintEl && HINTS[p]) hintEl.textContent = HINTS[p]
      updateAll()
    })
  })

  function resize() {
    const dpr = window.devicePixelRatio || 1
    canvas.width  = canvas.offsetWidth  * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function draw() {
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    ctx.clearRect(0, 0, W, H)
    const cy = H / 2, sc = H * 0.38
    const light = document.documentElement.getAttribute("saved-theme") === "light"
    const rs = getComputedStyle(document.documentElement)
    const secondary = rs.getPropertyValue("--secondary").trim()

    // Subtle grid
    ctx.lineWidth = 0.5
    ctx.strokeStyle = light ? "rgba(80,80,100,0.1)" : "rgba(200,200,220,0.07)"
    for (const f of [0.5, 1]) {
      ctx.beginPath(); ctx.moveTo(0, cy - f * sc); ctx.lineTo(W, cy - f * sc); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, cy + f * sc); ctx.lineTo(W, cy + f * sc); ctx.stroke()
    }
    ctx.strokeStyle = light ? "rgba(80,80,100,0.18)" : "rgba(200,200,220,0.13)"
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()

    // Y-axis labels
    ctx.font = "9px monospace"
    ctx.fillStyle = light ? "rgba(80,80,100,0.35)" : "rgba(200,200,220,0.22)"
    ctx.textAlign = "left"
    ctx.fillText("+1", 5, cy - sc + 11)
    ctx.fillText("0",  5, cy - 4)
    ctx.fillText("−1", 5, cy + sc - 3)

    // Ghost harmonics — colorized by harmonic index
    ctx.lineWidth = 1
    for (let n = 0; n < N; n++) {
      if (Math.abs(amps[n]) < 0.02) continue
      const hue = 205 - (n / N) * 50
      const alpha = light
        ? 0.07 + Math.abs(amps[n]) * 0.08
        : 0.09 + Math.abs(amps[n]) * 0.11
      ctx.beginPath()
      ctx.strokeStyle = `hsla(${hue}, 55%, ${light ? 38 : 68}%, ${alpha})`
      for (let x = 0; x <= W; x += 2) {
        const y = cy - amps[n] * Math.sin((n + 1) * TAU * (x / W + tOff)) * sc
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    // Sum wave — glow in dark, clean in light
    ctx.save()
    ctx.shadowColor = secondary
    ctx.shadowBlur = light ? 5 : 12
    ctx.beginPath()
    ctx.strokeStyle = secondary
    ctx.lineWidth = 2.2
    for (let x = 0; x <= W; x++) {
      let s = 0
      for (let n = 0; n < N; n++) s += amps[n] * Math.sin((n + 1) * TAU * (x / W + tOff))
      const y = cy - s * sc
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke(); ctx.restore()

    tOff += 0.004
    animId = requestAnimationFrame(draw)
  }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize(); updateAll(); draw()

  window.addCleanup(() => {
    cancelAnimationFrame(animId); ro.disconnect()
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("touchmove", onTouchMove)
    document.removeEventListener("mouseup", onUp)
    document.removeEventListener("touchend", onUp)
    barsEl.innerHTML = ""
  })
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
    "algorithms explorer",
    "proof enthusiast",
    "competitive programmer",
    "math notebook keeper",
    "quiet thinker",
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

// ── Conway's Game of Life ─────────────────────────────────────────────
function initGameOfLife() {
  const canvas = document.getElementById("gol-canvas") as HTMLCanvasElement | null
  const genEl = document.getElementById("gol-gen") as HTMLElement | null
  const resetBtn = document.getElementById("gol-reset") as HTMLButtonElement | null
  if (!canvas) return

  const ctx = canvas.getContext("2d")!
  const CELL = 6

  let W = 0, H = 0, cols = 0, rows = 0
  let grid = new Uint8Array(0), next = new Uint8Array(0)
  let animId = 0, gen = 0, frameCount = 0

  const PATTERNS = [
    [[0,1],[1,2],[2,0],[2,1],[2,2]],   // glider
    [[0,1],[0,2],[1,0],[1,1],[2,1]],   // R-pentomino
    [[0,0],[0,1],[0,2],[1,0],[2,1]],   // L-shape
    [[0,0],[0,1],[1,2],[1,3],[2,1],[2,2]], // beacon-ish
  ]

  function idx(r: number, c: number) { return r * cols + c }

  function randomize() {
    gen = 0
    for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.22 ? 1 : 0
    for (let p = 0; p < 18; p++) {
      const pat = PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
      const r0 = Math.floor(Math.random() * Math.max(1, rows - 6)) + 2
      const c0 = Math.floor(Math.random() * Math.max(1, cols - 6)) + 2
      for (const [dr, dc] of pat) {
        const r = r0 + dr, c = c0 + dc
        if (r >= 0 && r < rows && c >= 0 && c < cols) grid[idx(r, c)] = 1
      }
    }
    if (genEl) genEl.textContent = "gen 0"
  }

  function resize() {
    W = canvas!.width = canvas!.offsetWidth
    H = canvas!.height = canvas!.offsetHeight
    cols = Math.floor(W / CELL)
    rows = Math.floor(H / CELL)
    grid = new Uint8Array(cols * rows)
    next = new Uint8Array(cols * rows)
    randomize()
  }

  function step() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let n = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            n += grid[idx((r + dr + rows) % rows, (c + dc + cols) % cols)]
          }
        }
        const alive = grid[idx(r, c)]
        next[idx(r, c)] = (alive && (n === 2 || n === 3)) || (!alive && n === 3) ? 1 : 0
      }
    }
    ;[grid, next] = [next, grid]
    gen++
    if (genEl) genEl.textContent = `gen ${gen}`
  }

  function draw() {
    const light = document.documentElement.getAttribute("saved-theme") === "light"
    // match color-mix(in srgb, var(--lightgray) 38%, var(--light)) approximation
    ctx.fillStyle = light ? "#eeece5" : "#131318"
    ctx.fillRect(0, 0, W, H)
    ctx.shadowColor = light ? "rgba(22,100,40,0.35)" : "rgba(40,200,64,0.45)"
    ctx.shadowBlur = 2
    ctx.fillStyle = light ? "#1e7a2a" : "#2ec84a"
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[idx(r, c)]) ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 1, CELL - 1)
      }
    }
  }

  function loop() {
    if (frameCount++ % 4 === 0) { step(); draw() }
    animId = requestAnimationFrame(loop)
  }

  canvas.addEventListener("click", (e) => {
    const rect = canvas!.getBoundingClientRect()
    const c = Math.floor((e.clientX - rect.left) / CELL)
    const r = Math.floor((e.clientY - rect.top) / CELL)
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[idx(r, c)] = grid[idx(r, c)] ? 0 : 1
      draw()
    }
  })

  resetBtn?.addEventListener("click", () => { randomize(); draw() })

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()
  loop()

  window.addCleanup(() => {
    cancelAnimationFrame(animId)
    ro.disconnect()
  })
}

// ── Entry ──────────────────────────────────────────────────────────────
document.addEventListener("nav", () => {
  if (document.body.dataset.slug === "index") {
    initHeroCanvas()
    initTerminal()
    initFourier()
    initGameOfLife()
    animateHeroName()
    initBioAnimation()
  }
})
