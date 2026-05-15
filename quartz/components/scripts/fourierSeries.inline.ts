// ── Constants ──────────────────────────────────────────────────────────

const FS_N = 8
const FS_TAU = Math.PI * 2

const FS_PRESETS: Record<string, number[]> = {
  square: [1, 0, 1 / 3, 0, 1 / 5, 0, 1 / 7, 0],
  saw: [1, -1 / 2, 1 / 3, -1 / 4, 1 / 5, -1 / 6, 1 / 7, -1 / 8],
  tri: [1, 0, -1 / 9, 0, 1 / 25, 0, -1 / 49, 0],
  pulse: [1, 0.88, 0.65, 0.45, 0.28, 0.14, 0.06, 0.02],
  organ: [1, 0.55, 0.35, 0.18, 0.09, 0.05, 0.02, 0.01],
  even: [0, 0.8, 0, 0.6, 0, 0.4, 0, 0.25],
  rand: [],
}

// ── Algorithm (pure — no DOM) ──────────────────────────────────────────

function fsComputePeak(amps: number[]): number {
  let p = 0
  for (let i = 0; i < 256; i++) {
    const t = (i / 256) * FS_TAU
    let s = 0
    for (let n = 0; n < FS_N; n++) s += amps[n] * Math.sin((n + 1) * t)
    p = Math.max(p, Math.abs(s))
  }
  return Math.max(p, 0.01)
}

function fsBuildEquation(amps: number[]): string {
  const terms = amps.map((a, i) => ({ a, n: i + 1 })).filter(({ a }) => Math.abs(a) > 0.005)
  if (!terms.length) return "f(t) = 0"
  return (
    "f(t) = " +
    terms
      .map(({ a, n }, idx) => {
        const abs = Math.abs(a).toFixed(2)
        const neg = a < 0
        const pre = idx === 0 ? (neg ? "−" : "") : neg ? " − " : " + "
        return `${pre}${abs}·sin(${n > 1 ? n : ""}ωt)`
      })
      .join("")
  )
}

// ── Bar DOM ───────────────────────────────────────────────────────────

type FsBar = { fill: HTMLElement; val: HTMLElement }

function fsBuildBars(barsEl: HTMLElement): FsBar[] {
  const bars: FsBar[] = []
  for (let i = 0; i < FS_N; i++) {
    const col = document.createElement("div")
    col.className = "fb-col"
    col.innerHTML = `<div class="fb-val" id="fv${i}">0.00</div><div class="fb-track" data-i="${i}"><div class="fb-zero"></div><div class="fb-fill" id="ff${i}"></div></div><div class="fb-n">n=${i + 1}</div>`
    barsEl.appendChild(col)
    bars.push({
      fill: col.querySelector(".fb-fill")!,
      val: col.querySelector(".fb-val")!,
    })
  }
  return bars
}

function fsUpdateBar(bar: FsBar, amp: number, secondary: string, tertiary: string) {
  const a = Math.max(-1, Math.min(1, amp))
  bar.val.textContent = a.toFixed(2)
  const pct = Math.abs(a) * 46
  if (a >= 0) {
    bar.fill.style.cssText = `top:${50 - pct}%;height:${pct}%;background:${secondary};border-radius:2px;opacity:0.85`
  } else {
    bar.fill.style.cssText = `top:50%;height:${pct}%;background:${tertiary};border-radius:2px;opacity:0.85`
  }
}

// ── Renderer (canvas drawing) ──────────────────────────────────────────

function fsDrawGrid(
  ctx: CanvasRenderingContext2D,
  W: number,
  cy: number,
  sc: number,
  light: boolean,
) {
  ctx.lineWidth = 0.5
  ctx.strokeStyle = light ? "rgba(80,80,100,0.1)" : "rgba(200,200,220,0.07)"
  for (const f of [0.5, 1]) {
    ctx.beginPath()
    ctx.moveTo(0, cy - f * sc)
    ctx.lineTo(W, cy - f * sc)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, cy + f * sc)
    ctx.lineTo(W, cy + f * sc)
    ctx.stroke()
  }
  ctx.strokeStyle = light ? "rgba(80,80,100,0.18)" : "rgba(200,200,220,0.13)"
  ctx.beginPath()
  ctx.moveTo(0, cy)
  ctx.lineTo(W, cy)
  ctx.stroke()
}

function fsDrawLabels(
  ctx: CanvasRenderingContext2D,
  cy: number,
  sc: number,
  peakAmp: number,
  light: boolean,
) {
  const label =
    peakAmp >= 10 ? peakAmp.toFixed(0) : peakAmp >= 1.5 ? peakAmp.toFixed(1) : peakAmp.toFixed(2)
  ctx.font = "9px monospace"
  ctx.fillStyle = light ? "rgba(80,80,100,0.35)" : "rgba(200,200,220,0.22)"
  ctx.textAlign = "left"
  ctx.fillText(`+${label}`, 5, cy - sc + 11)
  ctx.fillText("0", 5, cy - 4)
  ctx.fillText(`−${label}`, 5, cy + sc - 3)
}

function fsDrawHarmonics(
  ctx: CanvasRenderingContext2D,
  amps: number[],
  W: number,
  cy: number,
  sc: number,
  tOff: number,
  light: boolean,
) {
  ctx.lineWidth = 1
  for (let n = 0; n < FS_N; n++) {
    if (Math.abs(amps[n]) < 0.02) continue
    const hue = 205 - (n / FS_N) * 50
    const alpha = light ? 0.07 + Math.abs(amps[n]) * 0.08 : 0.09 + Math.abs(amps[n]) * 0.11
    ctx.beginPath()
    ctx.strokeStyle = `hsla(${hue}, 55%, ${light ? 38 : 68}%, ${alpha})`
    for (let x = 0; x <= W; x += 2) {
      const y = cy - amps[n] * Math.sin((n + 1) * FS_TAU * (x / W + tOff)) * sc
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}

function fsDrawWave(
  ctx: CanvasRenderingContext2D,
  amps: number[],
  W: number,
  cy: number,
  sc: number,
  tOff: number,
  secondary: string,
  light: boolean,
) {
  ctx.save()
  ctx.shadowColor = secondary
  ctx.shadowBlur = light ? 5 : 12
  ctx.beginPath()
  ctx.strokeStyle = secondary
  ctx.lineWidth = 2.2
  for (let x = 0; x <= W; x++) {
    let s = 0
    for (let n = 0; n < FS_N; n++) s += amps[n] * Math.sin((n + 1) * FS_TAU * (x / W + tOff))
    const y = cy - s * sc
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.restore()
}

// ── Init ──────────────────────────────────────────────────────────────

function initFourierSeries() {
  const canvas = document.getElementById("fourier-canvas") as HTMLCanvasElement | null
  const barsEl = document.getElementById("fourier-bars") as HTMLElement | null
  const eqEl = document.getElementById("fourier-eq") as HTMLElement | null
  if (!canvas || !barsEl) return

  const ctx = canvas.getContext("2d")!
  const bars = fsBuildBars(barsEl)

  let amps = [...FS_PRESETS.square]
  let tOff = 0,
    animId = 0,
    peakAmp = 1.0
  let dragIdx = -1,
    dragStartY = 0,
    dragStartAmp = 0

  function getTheme() {
    const rs = getComputedStyle(document.documentElement)
    return {
      secondary: rs.getPropertyValue("--secondary").trim(),
      tertiary: rs.getPropertyValue("--tertiary").trim(),
      light: document.documentElement.getAttribute("saved-theme") === "light",
    }
  }

  function refreshBars() {
    const { secondary, tertiary } = getTheme()
    bars.forEach((b, i) => fsUpdateBar(b, amps[i], secondary, tertiary))
  }

  function refreshAll() {
    refreshBars()
    if (eqEl) eqEl.textContent = fsBuildEquation(amps)
    peakAmp = fsComputePeak(amps)
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1
    canvas!.width = canvas!.offsetWidth * dpr
    canvas!.height = canvas!.offsetHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function frame() {
    const W = canvas!.offsetWidth,
      H = canvas!.offsetHeight
    const cy = H / 2,
      sc = (H * 0.44) / peakAmp
    const { secondary, light } = getTheme()
    ctx.clearRect(0, 0, W, H)
    fsDrawGrid(ctx, W, cy, sc, light)
    fsDrawLabels(ctx, cy, sc, peakAmp, light)
    fsDrawHarmonics(ctx, amps, W, cy, sc, tOff, light)
    fsDrawWave(ctx, amps, W, cy, sc, tOff, secondary, light)
    tOff += 0.004
    animId = requestAnimationFrame(frame)
  }

  // drag handlers
  bars.forEach((_, i) => {
    const track = barsEl.querySelectorAll<HTMLElement>(".fb-track")[i]
    track.addEventListener("mousedown", (e) => {
      dragIdx = i
      dragStartY = e.clientY
      dragStartAmp = amps[i]
      e.preventDefault()
    })
    track.addEventListener(
      "touchstart",
      (e) => {
        dragIdx = i
        dragStartY = e.touches[0].clientY
        dragStartAmp = amps[i]
        e.preventDefault()
      },
      { passive: false },
    )
  })

  function onDrag(clientY: number) {
    amps[dragIdx] = Math.max(-1, Math.min(1, dragStartAmp + (dragStartY - clientY) / 80))
    const { secondary, tertiary } = getTheme()
    fsUpdateBar(bars[dragIdx], amps[dragIdx], secondary, tertiary)
    if (eqEl) eqEl.textContent = fsBuildEquation(amps)
    peakAmp = fsComputePeak(amps)
    document.querySelectorAll(".fourier-preset").forEach((b) => b.classList.remove("active"))
  }

  const onMouseMove = (e: MouseEvent) => {
    if (dragIdx >= 0) onDrag(e.clientY)
  }
  const onTouchMove = (e: TouchEvent) => {
    if (dragIdx >= 0) {
      onDrag(e.touches[0].clientY)
      e.preventDefault()
    }
  }
  const onUp = () => {
    dragIdx = -1
  }

  document.addEventListener("mousemove", onMouseMove)
  document.addEventListener("touchmove", onTouchMove, { passive: false })
  document.addEventListener("mouseup", onUp)
  document.addEventListener("touchend", onUp)

  document.querySelectorAll<HTMLElement>(".fourier-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".fourier-preset").forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      const p = btn.dataset.p!
      amps =
        p === "rand"
          ? Array.from({ length: FS_N }, (_, i) => (Math.random() * 2 - 1) / (i * 0.8 + 1))
          : [...(FS_PRESETS[p] ?? FS_PRESETS.square)]
      refreshAll()
    })
  })

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()
  refreshAll()
  frame()

  window.addCleanup(() => {
    cancelAnimationFrame(animId)
    ro.disconnect()
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("touchmove", onTouchMove)
    document.removeEventListener("mouseup", onUp)
    document.removeEventListener("touchend", onUp)
    barsEl.innerHTML = ""
  })
}

// ── Entry ──────────────────────────────────────────────────────────────

document.addEventListener("nav", () => {
  if (document.body.dataset.slug === "canvas/fourier-series") initFourierSeries()
})
