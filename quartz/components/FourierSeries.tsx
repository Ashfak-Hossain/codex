// @ts-ignore
import fourierScript from "./scripts/fourierSeries.inline"
import fourierStyles from "./styles/fourierSeries.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const FourierSeries: QuartzComponent = (_props: QuartzComponentProps) => {
  return (
    <div class="fourier-wrap">
      <div class="fourier-hdr">
        <span class="fourier-title">Fourier Series</span>
        <div class="fourier-presets">
          <button class="fourier-preset active" data-p="square">
            sq
          </button>
          <button class="fourier-preset" data-p="saw">
            saw
          </button>
          <button class="fourier-preset" data-p="tri">
            tri
          </button>
          <button class="fourier-preset" data-p="pulse">
            pls
          </button>
          <button class="fourier-preset" data-p="organ">
            org
          </button>
          <button class="fourier-preset" data-p="even">
            evn
          </button>
          <button class="fourier-preset" data-p="rand">
            ∿
          </button>
        </div>
      </div>
      <canvas id="fourier-canvas" class="fourier-canvas" />
      <div id="fourier-bars" class="fourier-bars" />
      <div class="fourier-eq-bar">
        <span id="fourier-eq" class="fourier-eq">
          f(t) = …
        </span>
      </div>
    </div>
  )
}

FourierSeries.afterDOMLoaded = fourierScript
FourierSeries.css = fourierStyles

export default (() => FourierSeries) satisfies QuartzComponentConstructor
