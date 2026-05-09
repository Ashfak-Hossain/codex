// @ts-ignore
import mazeLabScript from "./scripts/mazeLab.inline"
import mazeLabStyles from "./styles/mazeLab.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const MazeLab: QuartzComponent = (_props: QuartzComponentProps) => {
  return (
    <div class="ml-wrap">
      <div class="ml-ctl">
        <div class="ml-group">
          <button class="ml-btn ml-gen active" data-gen="dfs">
            dfs
          </button>
          <button class="ml-btn ml-gen" data-gen="prim">
            prim
          </button>
          <button class="ml-btn ml-gen" data-gen="binary">
            binary
          </button>
        </div>
        <span class="ml-sep">·</span>
        <div class="ml-group">
          <button class="ml-btn ml-spd" data-spd="1">
            slow
          </button>
          <button class="ml-btn ml-spd active" data-spd="8">
            med
          </button>
          <button class="ml-btn ml-spd" data-spd="25">
            fast
          </button>
        </div>
        <span class="ml-sep">·</span>
        <div class="ml-group">
          <button class="ml-btn ml-salgo active" data-salgo="bfs">
            bfs
          </button>
          <button class="ml-btn ml-salgo" data-salgo="dfs">
            dfs
          </button>
          <button class="ml-btn ml-salgo" data-salgo="astar">
            a*
          </button>
        </div>
        <span class="ml-sep">·</span>
        <button class="ml-btn ml-act" id="ml-gen-btn">
          generate
        </button>
        <button class="ml-btn ml-act" id="ml-solve-btn">
          solve
        </button>
        <button class="ml-btn ml-act" id="ml-clear-btn">
          clear
        </button>
      </div>
      <div class="ml-status" id="ml-status">
        click generate to start
      </div>
      <canvas id="ml-canvas" class="ml-canvas" />
      <div class="ml-info" id="ml-info" />
    </div>
  )
}

MazeLab.afterDOMLoaded = mazeLabScript
MazeLab.css = mazeLabStyles

export default (() => MazeLab) satisfies QuartzComponentConstructor
