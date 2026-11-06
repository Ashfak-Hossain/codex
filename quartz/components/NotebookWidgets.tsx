// @ts-ignore
import script from "./scripts/notebookWidgets.inline"
import styles from "./styles/notebookWidgets.scss"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

/**
 * Renders nothing itself. It ships one client script that mounts interactive widgets
 * wherever a note contains a placeholder such as:
 *
 *   <div class="nbw" data-widget="packet-journey"></div>
 *   <div class="nbw" data-widget="tcp-sim"></div>
 *   <div class="nbw" data-widget="latency-scale"></div>
 *
 * `packet-journey` also accepts data-steps="0-4" to show a subset of the steps.
 */
const NotebookWidgets: QuartzComponent = () => null

NotebookWidgets.afterDOMLoaded = script
NotebookWidgets.css = styles

export default (() => NotebookWidgets) satisfies QuartzComponentConstructor
