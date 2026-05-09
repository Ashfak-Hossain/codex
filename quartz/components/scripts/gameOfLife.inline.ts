// ── Constants ──────────────────────────────────────────────────────────

const GOL_CELL = 6

const GOL_SEED_PATS: [number, number][][] = [
  [
    [0, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [2, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 2],
    [1, 3],
    [2, 1],
    [2, 2],
  ],
]

const GOL_NAMED_PATS: Record<string, [number, number][]> = {
  glider: [
    [0, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  blinker: [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  pulsar: [
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 8],
    [0, 9],
    [0, 10],
    [2, 0],
    [2, 5],
    [2, 7],
    [2, 12],
    [3, 0],
    [3, 5],
    [3, 7],
    [3, 12],
    [4, 0],
    [4, 5],
    [4, 7],
    [4, 12],
    [5, 2],
    [5, 3],
    [5, 4],
    [5, 8],
    [5, 9],
    [5, 10],
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 8],
    [7, 9],
    [7, 10],
    [8, 0],
    [8, 5],
    [8, 7],
    [8, 12],
    [9, 0],
    [9, 5],
    [9, 7],
    [9, 12],
    [10, 0],
    [10, 5],
    [10, 7],
    [10, 12],
    [12, 2],
    [12, 3],
    [12, 4],
    [12, 8],
    [12, 9],
    [12, 10],
  ],
  rpent: [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
}

// ── Algorithm (pure — no DOM) ──────────────────────────────────────────

function golIdx(r: number, c: number, cols: number): number {
  return r * cols + c
}

function golStep(grid: Uint8Array, next: Uint8Array, rows: number, cols: number): void {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let n = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          n += grid[golIdx((r + dr + rows) % rows, (c + dc + cols) % cols, cols)]
        }
      }
      const alive = grid[golIdx(r, c, cols)]
      next[golIdx(r, c, cols)] = (alive && (n === 2 || n === 3)) || (!alive && n === 3) ? 1 : 0
    }
  }
}

// ── Patterns ──────────────────────────────────────────────────────────

function golLoadPattern(name: string, grid: Uint8Array, rows: number, cols: number): void {
  const pat = GOL_NAMED_PATS[name]
  if (!pat) return
  grid.fill(0)
  const maxR = Math.max(...pat.map(([r]) => r))
  const maxC = Math.max(...pat.map(([, c]) => c))
  const r0 = Math.floor((rows - maxR - 1) / 2)
  const c0 = Math.floor((cols - maxC - 1) / 2)
  for (const [dr, dc] of pat) {
    const r = r0 + dr,
      c = c0 + dc
    if (r >= 0 && r < rows && c >= 0 && c < cols) grid[golIdx(r, c, cols)] = 1
  }
}

function golRandomize(grid: Uint8Array, rows: number, cols: number): void {
  for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.22 ? 1 : 0
  for (let p = 0; p < 18; p++) {
    const pat = GOL_SEED_PATS[Math.floor(Math.random() * GOL_SEED_PATS.length)]
    const r0 = Math.floor(Math.random() * Math.max(1, rows - 6)) + 2
    const c0 = Math.floor(Math.random() * Math.max(1, cols - 6)) + 2
    for (const [dr, dc] of pat) {
      const r = r0 + dr,
        c = c0 + dc
      if (r >= 0 && r < rows && c >= 0 && c < cols) grid[golIdx(r, c, cols)] = 1
    }
  }
}

// ── Renderer ──────────────────────────────────────────────────────────

function golDraw(
  ctx: CanvasRenderingContext2D,
  grid: Uint8Array,
  W: number,
  H: number,
  rows: number,
  cols: number,
  light: boolean,
): void {
  ctx.fillStyle = light ? "#eeece5" : "#131318"
  ctx.fillRect(0, 0, W, H)
  ctx.shadowColor = light ? "rgba(22,100,40,0.35)" : "rgba(40,200,64,0.45)"
  ctx.shadowBlur = 2
  ctx.fillStyle = light ? "#1e7a2a" : "#2ec84a"
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[golIdx(r, c, cols)])
        ctx.fillRect(c * GOL_CELL + 1, r * GOL_CELL + 1, GOL_CELL - 1, GOL_CELL - 1)
    }
  }
}

// ── Init ──────────────────────────────────────────────────────────────

function initGameOfLife() {
  const canvas = document.getElementById("gol-canvas") as HTMLCanvasElement | null
  const genEl = document.getElementById("gol-gen") as HTMLElement | null
  const resetBtn = document.getElementById("gol-reset") as HTMLButtonElement | null
  if (!canvas) return

  const ctx = canvas.getContext("2d")!

  let W = 0,
    H = 0,
    cols = 0,
    rows = 0
  let grid = new Uint8Array(0),
    next = new Uint8Array(0)
  let animId = 0,
    gen = 0,
    frameCount = 0

  function isLight() {
    return document.documentElement.getAttribute("saved-theme") === "light"
  }

  function resize() {
    W = canvas!.width = canvas!.offsetWidth
    H = canvas!.height = canvas!.offsetHeight
    cols = Math.floor(W / GOL_CELL)
    rows = Math.floor(H / GOL_CELL)
    grid = new Uint8Array(cols * rows)
    next = new Uint8Array(cols * rows)
    golRandomize(grid, rows, cols)
    gen = 0
    if (genEl) genEl.textContent = "gen 0"
  }

  function loop() {
    if (frameCount++ % 4 === 0) {
      golStep(grid, next, rows, cols)
      ;[grid, next] = [next, grid]
      gen++
      if (genEl) genEl.textContent = `gen ${gen}`
      golDraw(ctx, grid, W, H, rows, cols, isLight())
    }
    animId = requestAnimationFrame(loop)
  }

  canvas.addEventListener("click", (e) => {
    const rect = canvas!.getBoundingClientRect()
    const c = Math.floor((e.clientX - rect.left) / GOL_CELL)
    const r = Math.floor((e.clientY - rect.top) / GOL_CELL)
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[golIdx(r, c, cols)] ^= 1
      golDraw(ctx, grid, W, H, rows, cols, isLight())
    }
  })

  resetBtn?.addEventListener("click", () => {
    document.querySelectorAll(".gol-pat").forEach((b) => b.classList.remove("active"))
    golRandomize(grid, rows, cols)
    gen = 0
    if (genEl) genEl.textContent = "gen 0"
    golDraw(ctx, grid, W, H, rows, cols, isLight())
  })

  document.querySelectorAll<HTMLElement>(".gol-pat").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".gol-pat").forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      golLoadPattern(btn.dataset.pat!, grid, rows, cols)
      gen = 0
      if (genEl) genEl.textContent = "gen 0"
      golDraw(ctx, grid, W, H, rows, cols, isLight())
    })
  })

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
  if (document.body.dataset.slug === "math-canvas/game-of-life") initGameOfLife()
})
