import { resolveRelative } from "../util/path"
import { getTrackPosition } from "../util/trackPath"
import style from "./styles/learningPath.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const TRACK_NAMES: Record<string, string> = {
  networking: "Networking",
  "system-design": "System Design",
}

const LearningPath: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const pos = getTrackPosition(fileData, allFiles)
  const name = pos && TRACK_NAMES[pos.track]
  if (!pos || !name) return null

  const details = [pos.stage ? `Stage ${pos.stage}` : "", `Step ${pos.position} of ${pos.total}`]
    .filter(Boolean)
    .join(" · ")

  return (
    <nav class="learning-path" data-track={pos.track} aria-label={`${name} track`}>
      <div class="lp-where">
        <strong class="lp-track">{name}</strong>
        <span class="lp-step">{details}</span>
      </div>
      {(pos.prev || pos.next) && (
        <div class="lp-nav">
          {pos.prev && (
            <a class="lp-prev" rel="prev" href={resolveRelative(fileData.slug!, pos.prev.slug!)}>
              <span aria-hidden="true">← </span>
              <span class="lp-sr">Previous: </span>
              {pos.prev.frontmatter?.title}
            </a>
          )}
          {pos.next && (
            <a class="lp-next" rel="next" href={resolveRelative(fileData.slug!, pos.next.slug!)}>
              <span class="lp-sr">Next: </span>
              {pos.next.frontmatter?.title}
              <span aria-hidden="true"> →</span>
            </a>
          )}
        </div>
      )}
    </nav>
  )
}

LearningPath.css = style

export default (() => LearningPath) satisfies QuartzComponentConstructor
