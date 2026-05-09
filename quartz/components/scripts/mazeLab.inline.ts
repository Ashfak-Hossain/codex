function initMazeLab() {
  const canvas = document.getElementById("ml-canvas") as HTMLCanvasElement | null
  const statusEl = document.getElementById("ml-status") as HTMLElement | null
  const infoEl = document.getElementById("ml-info") as HTMLElement | null
  const genBtn = document.getElementById("ml-gen-btn") as HTMLButtonElement | null
  const solveBtn = document.getElementById("ml-solve-btn") as HTMLButtonElement | null
  const clearBtn = document.getElementById("ml-clear-btn") as HTMLButtonElement | null
  if (!canvas) return

  const ctx = canvas.getContext("2d")!
  const CS = 18 // cell size px — large enough to read clearly

  let W = 0,
    H = 0,
    cols = 0,
    rows = 0
  let walls = new Uint8Array(0) // N=1 E=2 S=4 W=8
  let genVis = new Uint8Array(0)
  let solveVis = new Uint8Array(0)
  let solvePrev: Int32Array
  let solveGScore: Float32Array

  type State = "idle" | "generating" | "ready" | "solving" | "solved"
  let state: State = "idle"
  let genAlgo = "dfs"
  let solveAlgo = "bfs"
  let speed = 8
  let animId = 0

  // generation cursors
  let dfsStack: number[] = []
  let primFrontier: [number, number][] = []
  let binaryRow = 0,
    binaryCol = 0
  let genCur = -1

  // flags
  let flagStart = -1,
    flagEnd = -1,
    flagMode: "start" | "end" = "start"

  // solve
  let solveFrontier: number[] = []
  let solvePath: number[] = []
  let solveFound = false
  let solveExplored = 0

  const DR = [-1, 0, 1, 0]
  const DC = [0, 1, 0, -1]
  const WB = [1, 2, 4, 8]
  const OB = [4, 8, 1, 2]

  function gi(r: number, c: number) {
    return r * cols + c
  }

  function cellFromPx(px: number, py: number) {
    const c = Math.floor(px / CS),
      r = Math.floor(py / CS)
    return r >= 0 && r < rows && c >= 0 && c < cols ? gi(r, c) : -1
  }

  function setStatus(s: string) {
    if (statusEl) statusEl.textContent = s
  }
  function setInfo(s: string) {
    if (infoEl) infoEl.textContent = s
  }

  function updateButtons() {
    const busy = state === "generating" || state === "solving"
    const canSolve =
      (state === "ready" || state === "solved") &&
      flagStart >= 0 &&
      flagEnd >= 0 &&
      flagStart !== flagEnd
    if (genBtn) genBtn.textContent = state === "generating" ? "stop" : "generate"
    if (solveBtn) {
      solveBtn.textContent = state === "solving" ? "stop" : "solve"
      solveBtn.disabled = !canSolve && state !== "solving"
    }
    if (clearBtn) clearBtn.disabled = busy
  }

  // ── Grid init ─────────────────────────────────────────────────────────

  function initGrid() {
    cols = Math.max(1, Math.floor(W / CS))
    rows = Math.max(1, Math.floor(H / CS))
    walls = new Uint8Array(cols * rows).fill(15)
    genVis = new Uint8Array(cols * rows)
    solveVis = new Uint8Array(cols * rows)
    solvePrev = new Int32Array(cols * rows).fill(-1)
    solveGScore = new Float32Array(cols * rows).fill(Infinity)
    flagStart = -1
    flagEnd = -1
    flagMode = "start"
    genCur = -1
    dfsStack = []
    primFrontier = []
    binaryRow = 0
    binaryCol = 0
    solveFrontier = []
    solvePath = []
    solveFound = false
    solveExplored = 0
  }

  // ── Generation ────────────────────────────────────────────────────────

  function addPrimNeighbors(r: number, c: number) {
    for (let d = 0; d < 4; d++) {
      const nr = r + DR[d],
        nc = c + DC[d]
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !genVis[gi(nr, nc)])
        primFrontier.push([gi(r, c), d])
    }
  }

  function startGeneration() {
    initGrid()
    state = "generating"
    genCur = 0
    genVis[0] = 1

    if (genAlgo === "dfs") {
      dfsStack = [0]
    } else if (genAlgo === "prim") {
      addPrimNeighbors(0, 0)
    } else {
      // binary tree: step-by-step row scan
      binaryRow = 0
      binaryCol = 0
    }
    setStatus("generating…")
    updateButtons()
  }

  function stepDFS(): boolean {
    if (!dfsStack.length) return true
    genCur = dfsStack[dfsStack.length - 1]
    const r = Math.floor(genCur / cols),
      c = genCur % cols
    const nbrs: [number, number, number][] = []
    for (let d = 0; d < 4; d++) {
      const nr = r + DR[d],
        nc = c + DC[d]
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !genVis[gi(nr, nc)])
        nbrs.push([gi(nr, nc), WB[d], OB[d]])
    }
    if (nbrs.length) {
      const [ni, mw, ow] = nbrs[Math.floor(Math.random() * nbrs.length)]
      walls[genCur] &= ~mw
      walls[ni] &= ~ow
      genVis[ni] = 1
      dfsStack.push(ni)
      genCur = ni
    } else {
      dfsStack.pop()
    }
    return false
  }

  function stepPrim(): boolean {
    while (primFrontier.length) {
      const idx = Math.floor(Math.random() * primFrontier.length)
      const [fromI, d] = primFrontier[idx]
      primFrontier.splice(idx, 1)
      const fr = Math.floor(fromI / cols),
        fc = fromI % cols
      const tr = fr + DR[d],
        tc = fc + DC[d]
      if (tr < 0 || tr >= rows || tc < 0 || tc >= cols) continue
      const toI = gi(tr, tc)
      if (genVis[toI]) continue
      walls[fromI] &= ~WB[d]
      walls[toI] &= ~OB[d]
      genVis[toI] = 1
      genCur = toI
      addPrimNeighbors(tr, tc)
      return false
    }
    return true
  }

  function stepBinaryTree(): boolean {
    if (binaryRow >= rows) return true
    const r = binaryRow,
      c = binaryCol
    const i = gi(r, c)
    genVis[i] = 1
    genCur = i
    const canN = r > 0,
      canE = c < cols - 1
    if (canN && canE) {
      if (Math.random() < 0.5) {
        walls[i] &= ~1
        walls[gi(r - 1, c)] &= ~4
      } else {
        walls[i] &= ~2
        walls[gi(r, c + 1)] &= ~8
      }
    } else if (canN) {
      walls[i] &= ~1
      walls[gi(r - 1, c)] &= ~4
    } else if (canE) {
      walls[i] &= ~2
      walls[gi(r, c + 1)] &= ~8
    }
    binaryCol++
    if (binaryCol >= cols) {
      binaryCol = 0
      binaryRow++
    }
    return false
  }

  function finishGeneration() {
    flagStart = 0
    flagEnd = gi(rows - 1, cols - 1)
    state = "ready"
    setStatus("ready · click S or E flags to remove · click elsewhere to place")
    setInfo(`${cols}×${rows} · ${cols * rows} cells`)
    updateButtons()
  }

  // ── Solving ───────────────────────────────────────────────────────────

  function heuristic(i: number) {
    const r1 = Math.floor(i / cols),
      c1 = i % cols
    const r2 = Math.floor(flagEnd / cols),
      c2 = flagEnd % cols
    return Math.abs(r1 - r2) + Math.abs(c1 - c2)
  }

  function startSolving() {
    if (flagStart < 0 || flagEnd < 0) return
    state = "solving"
    solveVis = new Uint8Array(cols * rows)
    solvePrev = new Int32Array(cols * rows).fill(-1)
    solveGScore = new Float32Array(cols * rows).fill(Infinity)
    solveFrontier = [flagStart]
    solvePath = []
    solveFound = false
    solveExplored = 0
    // BFS marks when added to queue; DFS and A* mark on pop
    if (solveAlgo === "bfs") solveVis[flagStart] = 1
    solveGScore[flagStart] = 0
    setStatus("solving…")
    updateButtons()
  }

  function stepBFS(): boolean {
    if (!solveFrontier.length) return true
    const cur = solveFrontier.shift()!
    solveExplored++
    if (cur === flagEnd) {
      solveFound = true
      return true
    }
    const r = Math.floor(cur / cols),
      c = cur % cols
    for (let d = 0; d < 4; d++) {
      if (walls[cur] & WB[d]) continue
      const nr = r + DR[d],
        nc = c + DC[d]
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      const ni = gi(nr, nc)
      if (solveVis[ni]) continue
      solveVis[ni] = 1
      solvePrev[ni] = cur
      solveFrontier.push(ni)
    }
    return false
  }

  function stepDFSSolve(): boolean {
    if (!solveFrontier.length) return true
    const cur = solveFrontier.pop()!
    if (solveVis[cur]) return false
    solveVis[cur] = 1
    solveExplored++
    if (cur === flagEnd) {
      solveFound = true
      return true
    }
    const r = Math.floor(cur / cols),
      c = cur % cols
    for (let d = 0; d < 4; d++) {
      if (walls[cur] & WB[d]) continue
      const nr = r + DR[d],
        nc = c + DC[d]
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      const ni = gi(nr, nc)
      if (!solveVis[ni]) {
        solvePrev[ni] = cur
        solveFrontier.push(ni)
      }
    }
    return false
  }

  function stepAstar(): boolean {
    if (!solveFrontier.length) return true
    // pick lowest f = g + h from open list (lazy deletion via solveVis)
    let bi = 0,
      bf = Infinity
    for (let i = 0; i < solveFrontier.length; i++) {
      const f = solveGScore[solveFrontier[i]] + heuristic(solveFrontier[i])
      if (f < bf) {
        bf = f
        bi = i
      }
    }
    const cur = solveFrontier.splice(bi, 1)[0]
    // skip stale entries already closed
    if (solveVis[cur]) return false
    solveVis[cur] = 1
    solveExplored++
    if (cur === flagEnd) {
      solveFound = true
      return true
    }
    const g = solveGScore[cur],
      r = Math.floor(cur / cols),
      c = cur % cols
    for (let d = 0; d < 4; d++) {
      if (walls[cur] & WB[d]) continue
      const nr = r + DR[d],
        nc = c + DC[d]
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      const ni = gi(nr, nc)
      if (solveVis[ni]) continue
      const ng = g + 1
      if (ng < solveGScore[ni]) {
        solveGScore[ni] = ng
        solvePrev[ni] = cur
        solveFrontier.push(ni)
      }
    }
    return false
  }

  function buildPath() {
    solvePath = []
    let c = flagEnd
    while (c !== -1) {
      solvePath.unshift(c)
      c = solvePrev[c]
      if (c === flagStart) {
        solvePath.unshift(c)
        break
      }
    }
  }

  function finishSolving() {
    if (solveFound) {
      buildPath()
      setInfo(`path: ${solvePath.length - 1} steps · explored: ${solveExplored} cells`)
      setStatus("solved · click flags to reposition · solve again")
    } else {
      setInfo("no path found")
      setStatus("no solution")
    }
    state = "solved"
    updateButtons()
  }

  // ── Drawing ───────────────────────────────────────────────────────────

  function draw() {
    ctx.clearRect(0, 0, W, H)

    const light = document.documentElement.getAttribute("saved-theme") === "light"
    const rs = getComputedStyle(document.documentElement)
    const sec = rs.getPropertyValue("--secondary").trim()
    const ter = rs.getPropertyValue("--tertiary").trim()
    const gw = cols * CS,
      gh = rows * CS

    // Idle: draw a faint dot grid to show the canvas area
    if (state === "idle") {
      ctx.fillStyle = sec
      ctx.globalAlpha = light ? 0.18 : 0.22
      const r2 = 1.5
      for (let r = 0; r < rows; r++) {
        for (let c2 = 0; c2 < cols; c2++) {
          const x = c2 * CS + CS / 2,
            y = r * CS + CS / 2
          ctx.beginPath()
          ctx.arc(x, y, r2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      return
    }

    // Subtle grid background
    ctx.fillStyle = sec
    ctx.globalAlpha = light ? 0.04 : 0.06
    ctx.fillRect(0, 0, gw, gh)
    ctx.globalAlpha = 1

    // Generation fog — unvisited cells
    if (state === "generating") {
      ctx.fillStyle = light ? "#000" : "#fff"
      ctx.globalAlpha = light ? 0.06 : 0.05
      for (let r = 0; r < rows; r++)
        for (let c2 = 0; c2 < cols; c2++)
          if (!genVis[gi(r, c2)]) ctx.fillRect(c2 * CS, r * CS, CS, CS)
      ctx.globalAlpha = 1
    }

    // Solve explored flood
    if (state === "solving" || state === "solved") {
      ctx.fillStyle = sec
      ctx.globalAlpha = light ? 0.14 : 0.18
      for (let r = 0; r < rows; r++)
        for (let c2 = 0; c2 < cols; c2++) {
          const i = gi(r, c2)
          if (solveVis[i] && i !== flagStart && i !== flagEnd)
            ctx.fillRect(c2 * CS + 1, r * CS + 1, CS - 2, CS - 2)
        }
      ctx.globalAlpha = 1
    }

    // Solution path
    if ((state === "solved" || state === "solving") && solvePath.length > 1) {
      ctx.strokeStyle = sec
      ctx.globalAlpha = 0.88
      ctx.lineWidth = Math.max(3, CS * 0.28)
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()
      solvePath.forEach((ci, idx) => {
        const cr = Math.floor(ci / cols),
          cc = ci % cols
        const x = cc * CS + CS / 2,
          y = cr * CS + CS / 2
        idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // Walls — draw N and E edges per cell; S edge for bottom row; W edge for left col
    ctx.strokeStyle = light ? "#000" : "#fff"
    ctx.globalAlpha = light ? 0.38 : 0.42
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let r = 0; r < rows; r++) {
      for (let c2 = 0; c2 < cols; c2++) {
        const i = gi(r, c2),
          x = c2 * CS,
          y = r * CS
        if (walls[i] & 1) {
          // N wall
          ctx.moveTo(x, y)
          ctx.lineTo(x + CS, y)
        }
        if (walls[i] & 2) {
          // E wall
          ctx.moveTo(x + CS, y)
          ctx.lineTo(x + CS, y + CS)
        }
        if (r === rows - 1 && walls[i] & 4) {
          // S border row
          ctx.moveTo(x, y + CS)
          ctx.lineTo(x + CS, y + CS)
        }
        if (c2 === 0 && walls[i] & 8) {
          // W border col
          ctx.moveTo(x, y)
          ctx.lineTo(x, y + CS)
        }
      }
    }
    ctx.stroke()
    ctx.globalAlpha = 1

    // Grid border outline
    ctx.strokeStyle = light ? "#000" : "#fff"
    ctx.globalAlpha = light ? 0.25 : 0.3
    ctx.lineWidth = 1.5
    ctx.strokeRect(0, 0, gw, gh)
    ctx.globalAlpha = 1

    // Generation frontier highlight
    if (state === "generating" && genCur >= 0) {
      const cr = Math.floor(genCur / cols),
        cc = genCur % cols
      ctx.fillStyle = sec
      ctx.globalAlpha = 0.65
      ctx.fillRect(cc * CS + 1, cr * CS + 1, CS - 2, CS - 2)
      ctx.globalAlpha = 1
    }

    // Flags
    function drawFlag(cell: number, color: string, label: string) {
      const fr = Math.floor(cell / cols),
        fc = cell % cols
      const x = fc * CS,
        y = fr * CS
      ctx.fillStyle = color
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      ctx.roundRect(x + 1, y + 1, CS - 2, CS - 2, 3)
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.fillStyle = "#fff"
      ctx.font = `bold ${Math.max(9, Math.floor(CS * 0.55))}px monospace`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(label, x + CS / 2, y + CS / 2 + 0.5)
    }

    if (flagStart >= 0) drawFlag(flagStart, light ? "#1a7a28" : "#2ec84a", "S")
    if (flagEnd >= 0) drawFlag(flagEnd, ter, "E")
  }

  // ── Main loop ─────────────────────────────────────────────────────────

  function loop() {
    if (state === "generating") {
      let done = false
      for (let i = 0; i < speed && !done; i++) {
        if (genAlgo === "dfs") done = stepDFS()
        else if (genAlgo === "prim") done = stepPrim()
        else done = stepBinaryTree()
      }
      if (done) finishGeneration()
    } else if (state === "solving") {
      const ss = Math.max(1, Math.ceil(speed / 2))
      let done = false
      for (let i = 0; i < ss && !done; i++) {
        if (solveAlgo === "bfs") done = stepBFS()
        else if (solveAlgo === "dfs") done = stepDFSSolve()
        else done = stepAstar()
      }
      if (done) finishSolving()
    }
    draw()
    animId = requestAnimationFrame(loop)
  }

  // ── Event handlers ────────────────────────────────────────────────────

  genBtn?.addEventListener("click", () => {
    if (state === "generating") {
      state = "ready"
      finishGeneration()
    } else startGeneration()
  })

  solveBtn?.addEventListener("click", () => {
    if (state === "solving") {
      state = "ready"
      solveVis.fill(0)
      solveFrontier = []
      solvePath = []
      setStatus("stopped · adjust flags and try again")
      updateButtons()
    } else if (state === "ready" || state === "solved") {
      startSolving()
    }
  })

  clearBtn?.addEventListener("click", () => {
    if (state === "solving" || state === "generating") return
    flagStart = -1
    flagEnd = -1
    flagMode = "start"
    solveVis.fill(0)
    solveFrontier = []
    solvePath = []
    if (state === "solved") state = "ready"
    setStatus("flags cleared · click canvas to place start")
    setInfo("")
    updateButtons()
  })

  canvas.addEventListener("click", (e) => {
    if (state !== "ready" && state !== "solved") return
    const rect = canvas.getBoundingClientRect()
    const sx = W / rect.width,
      sy = H / rect.height
    const cell = cellFromPx((e.clientX - rect.left) * sx, (e.clientY - rect.top) * sy)
    if (cell < 0) return

    if (cell === flagStart) {
      flagStart = -1
      flagMode = "start"
    } else if (cell === flagEnd) {
      flagEnd = -1
      flagMode = "end"
    } else if (flagMode === "start" || flagStart < 0) {
      flagStart = cell
      flagMode = "end"
    } else {
      flagEnd = cell
      flagMode = "start"
    }

    if (state === "solved") {
      state = "ready"
      solveVis.fill(0)
      solveFrontier = []
      solvePath = []
      setInfo("")
    }
    const n = (flagStart >= 0 ? 1 : 0) + (flagEnd >= 0 ? 1 : 0)
    setStatus(
      n === 0
        ? "click to place start (S)"
        : n === 1
          ? "click to place end (E)"
          : "both flags set · hit solve",
    )
    updateButtons()
  })

  document.querySelectorAll<HTMLElement>(".ml-gen").forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".ml-gen").forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      genAlgo = btn.dataset.gen!
    }),
  )
  document.querySelectorAll<HTMLElement>(".ml-spd").forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".ml-spd").forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      speed = parseInt(btn.dataset.spd!)
    }),
  )
  document.querySelectorAll<HTMLElement>(".ml-salgo").forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".ml-salgo").forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      solveAlgo = btn.dataset.salgo!
    }),
  )

  function resize() {
    W = canvas!.width = canvas!.offsetWidth
    H = canvas!.height = canvas!.offsetHeight
    if (state !== "idle") {
      initGrid()
      state = "idle"
      setStatus("resized · click generate")
      updateButtons()
    } else {
      initGrid()
    }
  }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()
  setStatus("click generate to start")
  updateButtons()
  loop()

  window.addCleanup(() => {
    cancelAnimationFrame(animId)
    ro.disconnect()
  })
}

document.addEventListener("nav", () => {
  if (document.body.dataset.slug === "math-canvas/maze-lab") initMazeLab()
})
