function toggleCallout(this: HTMLElement) {
  const outerBlock = this.parentElement!
  outerBlock.classList.toggle("is-collapsed")
  const content = outerBlock.getElementsByClassName("callout-content")[0] as HTMLElement
  if (!content) return
  const collapsed = outerBlock.classList.contains("is-collapsed")
  content.style.gridTemplateRows = collapsed ? "0fr" : "1fr"
  this.setAttribute("aria-expanded", String(!collapsed))
}

function onTitleKey(this: HTMLElement, e: KeyboardEvent) {
  // Leave keys alone when focus is on a link inside the title
  if (e.target !== this || (e.key !== "Enter" && e.key !== " ")) return
  e.preventDefault()
  toggleCallout.call(this)
}

function setupCallout() {
  const collapsible = document.getElementsByClassName(
    `callout is-collapsible`,
  ) as HTMLCollectionOf<HTMLElement>
  for (const div of collapsible) {
    const title = div.getElementsByClassName("callout-title")[0] as HTMLElement
    const content = div.getElementsByClassName("callout-content")[0] as HTMLElement
    if (!title || !content) continue

    title.addEventListener("click", toggleCallout)
    title.addEventListener("keydown", onTitleKey)
    window.addCleanup(() => {
      title.removeEventListener("click", toggleCallout)
      title.removeEventListener("keydown", onTitleKey)
    })

    const collapsed = div.classList.contains("is-collapsed")
    content.style.gridTemplateRows = collapsed ? "0fr" : "1fr"
    title.setAttribute("role", "button")
    title.setAttribute("tabindex", "0")
    title.setAttribute("aria-expanded", String(!collapsed))
  }
}

document.addEventListener("nav", setupCallout)
