// @ts-ignore
import golScript from "./scripts/gameOfLife.inline"
import golStyles from "./styles/gameOfLife.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const GameOfLife: QuartzComponent = (_props: QuartzComponentProps) => {
  return (
    <div class="gol-wrap">
      <div class="gol-hdr">
        <span class="gol-title">Conway's Game of Life</span>
        <div class="gol-controls">
          <span class="gol-gen" id="gol-gen">
            gen 0
          </span>
          <button class="gol-btn" id="gol-reset">
            reseed
          </button>
        </div>
      </div>
      <div class="gol-pats">
        <button class="gol-pat" data-pat="glider">
          glider
        </button>
        <button class="gol-pat" data-pat="blinker">
          blinker
        </button>
        <button class="gol-pat" data-pat="pulsar">
          pulsar
        </button>
        <button class="gol-pat" data-pat="rpent">
          r-pento
        </button>
      </div>
      <canvas id="gol-canvas" class="gol-canvas" />
    </div>
  )
}

GameOfLife.afterDOMLoaded = golScript
GameOfLife.css = golStyles

export default (() => GameOfLife) satisfies QuartzComponentConstructor
