import test, { describe } from "node:test"
import assert from "node:assert"
import { QuartzPluginData } from "../plugins/vfile"
import { getTrackPosition } from "./trackPath"

const page = (slug: string, frontmatter: Record<string, unknown>) =>
  ({ slug, frontmatter: { title: slug, ...frontmatter } }) as unknown as QuartzPluginData

const a = page("a", { track: "networking", stage: 1, step: 1 })
const b = page("b", { track: "networking", stage: 1, step: 4 })
const c = page("c", { track: "networking", stage: 3, step: 14 })
const other = page("x", { track: "system-design", step: 2 })
const plain = page("p", {})
const all = [c, other, a, plain, b]

describe("getTrackPosition", () => {
  test("uses real position, not the step number, when steps have gaps", () => {
    const pos = getTrackPosition(b, all)!
    assert.strictEqual(pos.position, 2)
    assert.strictEqual(pos.total, 3)
    assert.strictEqual(pos.stage, 1)
    assert.strictEqual(pos.prev?.slug, "a")
    assert.strictEqual(pos.next?.slug, "c")
  })

  test("first page has no previous and last page has no next", () => {
    assert.strictEqual(getTrackPosition(a, all)!.prev, undefined)
    assert.strictEqual(getTrackPosition(c, all)!.next, undefined)
  })

  test("other tracks are not counted", () => {
    const pos = getTrackPosition(other, all)!
    assert.strictEqual(pos.total, 1)
    assert.strictEqual(pos.stage, undefined)
  })

  test("pages off a track get nothing", () => {
    assert.strictEqual(getTrackPosition(plain, all), undefined)
  })

  test("a track page without a numeric step gets nothing and isn't counted", () => {
    const bad = page("bad", { track: "networking", step: "3" })
    assert.strictEqual(getTrackPosition(bad, [...all, bad]), undefined)
    assert.strictEqual(getTrackPosition(a, [...all, bad])!.total, 3)
  })
})
