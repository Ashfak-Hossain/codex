// Reading progress (P2.1): which track pages you've read, kept in this browser.
// Every read and write is guarded: with storage blocked, nothing is shown and nothing breaks.

const READ_KEY = "hilbert-notebooks:read" // { [slug]: ISO date read }
const LAST_KEY = "hilbert-notebooks:last" // { slug, title } of the last track page opened

type ReadMap = Record<string, string>

function storageWorks(): boolean {
  try {
    const probe = "hilbert-notebooks:probe"
    localStorage.setItem(probe, "1")
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

function loadRead(): ReadMap {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_KEY) ?? "{}")
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function saveRead(read: ReadMap) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(read))
  } catch {}
}

function loadLast(): { slug: string; title: string } | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(LAST_KEY) ?? "null")
    return parsed && typeof parsed.slug === "string" ? parsed : null
  } catch {
    return null
  }
}

function saveLast(slug: string, title: string) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ slug, title }))
  } catch {}
}

/** Show the read state everywhere it appears on the current page */
function paint(read: ReadMap) {
  document.querySelectorAll<HTMLElement>(".explorer-content a[data-for]").forEach((a) => {
    a.classList.toggle("is-read", Boolean(read[a.dataset.for!]))
  })

  document.querySelectorAll<HTMLAnchorElement>(".lm-station a[data-slug]").forEach((a) => {
    const isRead = Boolean(read[a.dataset.slug!])
    a.classList.toggle("is-read", isRead)
    const label = a.querySelector(".lm-label")?.textContent ?? ""
    if (isRead) a.setAttribute("aria-label", `${label} (read)`)
    else a.removeAttribute("aria-label")
  })

  const box = document.querySelector<HTMLElement>(".reading-progress")
  const slug = box?.dataset.slug
  document.querySelector(".learning-path")?.classList.toggle("is-read", Boolean(slug && read[slug]))
  if (box && slug) {
    const isRead = Boolean(read[slug])
    const button = box.querySelector<HTMLButtonElement>(".rp-toggle")!
    button.setAttribute("aria-pressed", String(isRead))
    button.textContent = isRead ? "✓ Read · mark as unread" : "Mark as read"
    box.classList.toggle("is-read", isRead)
  }

  paintContinue(read)
}

/** Home page: link to the last page you opened, or the next unread stop after it */
function paintContinue(read: ReadMap) {
  const box = document.querySelector<HTMLElement>(".lm-continue")
  if (!box) return
  const link = box.querySelector<HTMLAnchorElement>("a")!
  const last = loadLast()
  const station = last
    ? document.querySelector<HTMLAnchorElement>(
        `.lm-station a[data-slug="${CSS.escape(last.slug)}"]`,
      )
    : null
  if (!last || !station) {
    box.hidden = true
    return
  }

  let target: HTMLAnchorElement | null = station
  if (read[last.slug]) {
    const line = [...station.closest(".lm-stations")!.querySelectorAll<HTMLAnchorElement>("a")]
    target = line.slice(line.indexOf(station) + 1).find((a) => !read[a.dataset.slug!]) ?? null
  }
  if (!target) {
    box.hidden = true
    return
  }
  link.href = target.href
  link.textContent = target.querySelector(".lm-label")?.textContent ?? last.title
  box.hidden = false
}

document.addEventListener("nav", () => {
  if (!storageWorks()) return
  let read = loadRead()

  const box = document.querySelector<HTMLElement>(".reading-progress")
  const slug = box?.dataset.slug
  if (box && slug) {
    box.hidden = false
    saveLast(slug, box.dataset.title ?? slug)

    const setRead = (value: boolean) => {
      read = loadRead()
      if (value) read[slug] = new Date().toISOString()
      else delete read[slug]
      saveRead(read)
      paint(read)
    }

    // Manual toggle. Unmarking stops the auto-tick for the rest of this visit.
    let autoTick = true
    const button = box.querySelector<HTMLButtonElement>(".rp-toggle")!
    const onClick = () => {
      const isRead = Boolean(loadRead()[slug])
      if (isRead) autoTick = false
      setRead(!isRead)
    }
    button.addEventListener("click", onClick)
    window.addCleanup(() => button.removeEventListener("click", onClick))

    // Reaching the Recap (or the button, on a page without one) counts as reading the page
    const marker = document.querySelector("article h2#recap") ?? box
    const observer = new IntersectionObserver((entries) => {
      if (autoTick && entries.some((e) => e.isIntersecting) && !loadRead()[slug]) {
        autoTick = false
        setRead(true)
      }
    })
    observer.observe(marker)
    window.addCleanup(() => observer.disconnect())
  }

  // The sidebar is built after navigation, so repaint when it appears or changes
  const explorer = document.querySelector(".explorer-content")
  if (explorer) {
    let queued = false
    const watcher = new MutationObserver(() => {
      if (queued) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        paint(loadRead())
      })
    })
    watcher.observe(explorer, { childList: true, subtree: true })
    window.addCleanup(() => watcher.disconnect())
  }

  paint(read)
})
