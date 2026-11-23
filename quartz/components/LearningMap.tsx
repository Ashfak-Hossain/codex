import { resolveRelative } from "../util/path"
import { pipSvg } from "../util/pip"
import { getTrackPages } from "../util/trackPath"
import style from "./styles/learningMap.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

// One line per track, in this order. A track appears once it has pages with `track` and `step`.
const TRACKS = [
  {
    id: "networking",
    name: "Networking",
    blurb: "How a message leaves your laptop, crosses the internet and comes back.",
  },
  {
    id: "system-design",
    name: "System Design",
    blurb: "Building systems that stay fast and correct when the network lets you down.",
  },
]

const LearningMap: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const lines = TRACKS.map((t) => ({ ...t, pages: getTrackPages(allFiles, t.id) })).filter(
    (t) => t.pages.length > 0,
  )
  if (lines.length === 0) return null

  return (
    <section class="learning-map" aria-labelledby="lm-title">
      <div class="lm-head">
        <div
          class="lm-pip"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: pipSvg("hello") }}
        />
        <div>
          <span class="kicker">Learning map</span>
          <h2 id="lm-title" class="lm-title">
            Pick a line and start at the first stop
          </h2>
        </div>
      </div>
      {/* Filled in by the reading-progress script from the last page you opened */}
      <p class="lm-continue" hidden>
        <span>Continue where you left off:</span> <a href="#"></a> <span aria-hidden="true">→</span>
      </p>
      {lines.map((line) => (
        <div class="lm-line" data-track={line.id}>
          <h3 class="lm-name">
            {line.name}
            <span class="lm-count">
              {line.pages.length} {line.pages.length === 1 ? "stop" : "stops"}
            </span>
          </h3>
          <p class="lm-blurb">{line.blurb}</p>
          {/* Each link carries data-slug so reading progress (P2.1) can add .is-read */}
          <ol class="lm-stations">
            {line.pages.map((page) => (
              <li class="lm-station">
                <a href={resolveRelative(fileData.slug!, page.slug!)} data-slug={page.slug}>
                  <span class="lm-dot" aria-hidden="true" />
                  <span class="lm-label">{page.frontmatter?.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  )
}

LearningMap.css = style

export default (() => LearningMap) satisfies QuartzComponentConstructor
