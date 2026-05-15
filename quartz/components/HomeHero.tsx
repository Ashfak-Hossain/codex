// @ts-ignore
import homeHeroScript from "./scripts/homeHero.inline"
import styles from "./styles/homeHero.scss"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

const HomeHero: QuartzComponent = () => {
  return (
    <section class="hero-full">
      <canvas id="hero-canvas" class="hero-canvas" aria-hidden="true" />
      <div class="hero-layout">
        {/* Left — identity */}
        <div class="hero-left">
          <div class="hero-name">Ashfak Hossain</div>
          <div class="hero-role">CS undergrad · AIUB</div>
          <p class="hero-bio">
            Notes on proofs, algorithms, and ideas that <em>almost</em> make sense — written mostly
            to find out whether they do.
          </p>
        </div>

        {/* Right — interactive terminal */}
        <div id="iterm">
          <div class="iterm-bar">
            <span class="tdot tdot-r" />
            <span class="tdot tdot-y" />
            <span class="tdot tdot-g" />
            <span class="iterm-title">ashfak@epsilon: ~</span>
          </div>
          <div class="iterm-body">
            <div class="iterm-log" id="iterm-log">
              <div class="iterm-welcome">
                Type <span class="c-warm">help</span> to see available commands.
              </div>
            </div>
            <div class="iterm-input-row">
              <span class="iterm-ps">❯</span>
              <input
                id="iterm-input"
                class="iterm-input"
                type="text"
                autocomplete="off"
                spellcheck={false}
                aria-label="Terminal input"
                placeholder="type a command…"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

HomeHero.afterDOMLoaded = homeHeroScript
HomeHero.css = styles

export default (() => HomeHero) satisfies QuartzComponentConstructor

