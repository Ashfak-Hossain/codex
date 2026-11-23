import { QuartzPluginData } from "../plugins/vfile"

export interface TrackPosition {
  track: string
  stage?: number
  /** 1-based position among the pages that exist in this track */
  position: number
  total: number
  prev?: QuartzPluginData
  next?: QuartzPluginData
}

function stepOf(file: QuartzPluginData): number | undefined {
  const step = file.frontmatter?.step
  return typeof step === "number" && Number.isFinite(step) ? step : undefined
}

/**
 * Where a page sits in its learning track, or undefined if it isn't on one.
 * `step` in front matter only sets the order, so a track can have planned gaps
 * and new pages can slot in without renumbering the rest.
 */
export function getTrackPosition(
  file: QuartzPluginData,
  allFiles: QuartzPluginData[],
): TrackPosition | undefined {
  const track = file.frontmatter?.track
  if (typeof track !== "string" || stepOf(file) === undefined) return undefined

  const pages = allFiles
    .filter((f) => f.frontmatter?.track === track && stepOf(f) !== undefined)
    .sort((a, b) => stepOf(a)! - stepOf(b)! || (a.slug ?? "").localeCompare(b.slug ?? ""))

  const index = pages.findIndex((f) => f.slug === file.slug)
  if (index === -1) return undefined

  const stage = file.frontmatter?.stage
  return {
    track,
    stage: typeof stage === "number" ? stage : undefined,
    position: index + 1,
    total: pages.length,
    prev: pages[index - 1],
    next: pages[index + 1],
  }
}
