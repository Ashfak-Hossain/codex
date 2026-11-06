import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.ConditionalRender({
    component: Component.Footer({
      links: {
        About: "/About",
        Privacy: "/Privacy",
        GitHub: "https://github.com/Ashfak-Hossain",
      },
    }),
    condition: () => true,
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.HomeHero(),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.TagList(),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({
      // Chapters and pages in reading order; anything not listed sorts alphabetically after.
      // This function is serialized and run in the browser, so it must stay self-contained.
      sortFn: (a, b) => {
        const order = [
          "Foundations",
          "Host Configuration",
          "Address Resolution",
          "Troubleshooting",
          "Reliability",
          "Layers and Encapsulation",
          "A Packet's Journey",
          "Latency Numbers",
          "Reading Any System",
          "Network Failure Modes",
          "Delivery Guarantees and Idempotency",
        ]
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
        const ia = order.indexOf(a.displayName)
        const ib = order.indexOf(b.displayName)
        if (ia !== -1 || ib !== -1) {
          if (ia === -1) return 1
          if (ib === -1) return -1
          return ia - ib
        }
        return a.displayName.localeCompare(b.displayName, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      },
    }),
  ],
  right: [
    Component.ConditionalRender({
      component: Component.Graph(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.DesktopOnly(Component.TableOfContents()),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.Backlinks(),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
  afterBody: [
    // Mounts interactive widgets on any note containing <div class="nbw" data-widget="...">
    Component.NotebookWidgets(),
    Component.ConditionalRender({
      component: Component.MazeLab(),
      condition: (page) => page.fileData.slug === "canvas/maze-lab",
    }),
    Component.ConditionalRender({
      component: Component.FourierSeries(),
      condition: (page) => page.fileData.slug === "canvas/fourier-series",
    }),
    Component.ConditionalRender({
      component: Component.GameOfLife(),
      condition: (page) => page.fileData.slug === "canvas/game-of-life",
    }),
  ],
} as PageLayout

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      // Chapters and pages in reading order; anything not listed sorts alphabetically after.
      // This function is serialized and run in the browser, so it must stay self-contained.
      sortFn: (a, b) => {
        const order = [
          "Foundations",
          "Host Configuration",
          "Address Resolution",
          "Troubleshooting",
          "Reliability",
          "Layers and Encapsulation",
          "A Packet's Journey",
          "Latency Numbers",
          "Reading Any System",
          "Network Failure Modes",
          "Delivery Guarantees and Idempotency",
        ]
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
        const ia = order.indexOf(a.displayName)
        const ib = order.indexOf(b.displayName)
        if (ia !== -1 || ib !== -1) {
          if (ia === -1) return 1
          if (ib === -1) return -1
          return ia - ib
        }
        return a.displayName.localeCompare(b.displayName, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      },
    }),
  ],
  right: [],
}
