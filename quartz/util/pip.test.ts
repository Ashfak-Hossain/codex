import test, { describe } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { PIP_LINE, PipPose, pipSvg } from "./pip"

const file = (name: string) =>
  readFileSync(fileURLToPath(new URL(`../static/pip/${name}.svg`, import.meta.url)), "utf8")

describe("Pip static files", () => {
  for (const pose of ["hello", "lost"] as PipPose[]) {
    for (const theme of ["light", "dark"] as const) {
      test(`${pose}-${theme}.svg matches pip.ts`, () => {
        assert.strictEqual(file(`${pose}-${theme}`), pipSvg(pose, PIP_LINE[theme]))
      })
    }
  }
})
