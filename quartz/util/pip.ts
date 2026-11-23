// Pip, the notebook's mascot: an original parcel with a face and a ribbon bow.
// This is the only copy of the drawing. The files in quartz/static/pip/ are generated from it
// (see pip.test.ts), and the 404 page inlines it.

export type PipPose = "hello" | "lost"

/** Outline colours: dark brown on light paper, light tan on dark paper */
export const PIP_LINE = { light: "#4a3423", dark: "#c9a77a" } as const

const INK = "#2a1d12"

function body(line: string): string {
  return [
    `<path class="pl" d="M38 87v6M62 87v6" stroke="${line}" stroke-width="5" stroke-linecap="round"/>`,
    `<rect class="pl" x="17" y="26" width="66" height="62" rx="13" fill="#e9c89b" stroke="${line}" stroke-width="3.5"/>`,
    `<path class="pl" d="M18.5 42h63" stroke="${line}" stroke-width="2.5" opacity="0.45"/>`,
    `<path d="M44 27.5h12V42H44z" fill="#f6e7cf"/>`,
    `<path class="pl" d="M50 26c-4-9-15-11-16-5s9 7 16 5c7 2 17 1 16-5s-12-4-16 5z" fill="#0d7a6d" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>`,
    `<circle cx="29" cy="70" r="4.5" fill="#e58e73" opacity="0.7"/>`,
    `<circle cx="71" cy="70" r="4.5" fill="#e58e73" opacity="0.7"/>`,
  ].join("")
}

const FACES: Record<PipPose, (line: string) => string> = {
  hello: (line) =>
    [
      `<circle cx="38" cy="60" r="4.5" fill="${INK}"/>`,
      `<circle cx="62" cy="60" r="4.5" fill="${INK}"/>`,
      `<path d="M43 69q7 7 14 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
      `<path class="pl" d="M83 58q10-5 11-16" fill="none" stroke="${line}" stroke-width="5" stroke-linecap="round"/>`,
    ].join(""),
  lost: () =>
    [
      `<path d="M33 55l9 9m0-9l-9 9M58 55l9 9m0-9l-9 9" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`,
      `<path d="M43 74q7-6 14 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
    ].join(""),
}

/** Pip as a standalone SVG string. Outlines carry class "pl" so inline copies can recolour them. */
export function pipSvg(pose: PipPose, line: string = PIP_LINE.light): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">${body(line)}${FACES[pose](line)}</svg>\n`
}
