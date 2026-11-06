import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "The Hilbert Notebooks",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-GWWKFYRCX9",
    },
    locale: "en-US",
    baseUrl: "ashfak-hossain.github.io/codex",
    ignorePatterns: ["private", "template", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Fraunces",
        body: "Atkinson Hyperlegible Next",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          // Reading palette: near-white warm paper, every text colour ≥ 4.5:1 (WCAG AA)
          light: "#fbfaf7",
          lightgray: "#e7e4dd",
          gray: "#666b74",
          darkgray: "#2b2f36",
          dark: "#16191d",
          secondary: "#1f5f99",
          tertiary: "#9a531c",
          highlight: "rgba(31, 95, 153, 0.08)",
          textHighlight: "rgba(154, 83, 28, 0.18)",
        },
        darkMode: {
          // Off-black and off-white: high contrast without the glare of pure white on black
          light: "#16181c",
          lightgray: "#262a30",
          gray: "#8f959e",
          darkgray: "#d3d6dc",
          dark: "#eef0f3",
          secondary: "#8fbbe8",
          tertiary: "#e3a574",
          highlight: "rgba(143, 187, 232, 0.10)",
          textHighlight: "rgba(227, 165, 116, 0.22)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light-default",
          dark: "github-dark-default",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
