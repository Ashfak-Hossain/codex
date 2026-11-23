// @ts-ignore
import script from "./scripts/readingProgress.inline"
import style from "./styles/readingProgress.scss"
import { getTrackPosition } from "../util/trackPath"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

/**
 * Reading progress (P2.1). On track pages: a "Mark as read" button at the end of the page.
 * The script also ticks pages in the sidebar, path bar and home map, and fills the home page's
 * "Continue" link. Progress lives in localStorage; without storage nothing is shown.
 */
const ReadingProgress: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const pos = getTrackPosition(fileData, allFiles)
  if (!pos) return null

  return (
    <div
      class="reading-progress"
      data-slug={fileData.slug}
      data-title={fileData.frontmatter?.title}
      data-track={pos.track}
      hidden
    >
      <button type="button" class="rp-toggle" aria-pressed="false">
        Mark as read
      </button>
      <span class="rp-note">Saved in this browser only.</span>
    </div>
  )
}

ReadingProgress.css = style
ReadingProgress.afterDOMLoaded = script

export default (() => ReadingProgress) satisfies QuartzComponentConstructor
