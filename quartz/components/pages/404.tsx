import { i18n } from "../../i18n"
import { pipSvg } from "../../util/pip"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const NotFound: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  // If baseUrl contains a pathname after the domain, use this as the home link
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = url.pathname

  return (
    <article class="popover-hint">
      <div
        class="pip-lost"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: pipSvg("lost") }}
      />
      <h1>404</h1>
      <p>{i18n(cfg.locale).pages.error.notFound}</p>
      <a href={baseDir}>{i18n(cfg.locale).pages.error.home}</a>
    </article>
  )
}

export default (() => NotFound) satisfies QuartzComponentConstructor
