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
        header: "Proza Libre",
        body: "Bricolage Grotesque",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#f1f3f5",
          lightgray: "#e2e5ea",
          gray: "#8c9099",
          darkgray: "#3c424f",
          dark: "#1c2028",
          secondary: "#4d7ea8",
          tertiary: "#b07848",
          highlight: "rgba(77, 126, 168, 0.08)",
          textHighlight: "rgba(176, 120, 72, 0.20)",
        },
        darkMode: {
          light: "#13151a",
          lightgray: "#1e2128",
          gray: "#4e5364",
          darkgray: "#bfc4cf",
          dark: "#e8eaf0",
          secondary: "#7aafd4",
          tertiary: "#d4956a",
          highlight: "rgba(122, 175, 212, 0.10)",
          textHighlight: "rgba(212, 149, 106, 0.22)",
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
          light: "github-light",
          dark: "github-dark",
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
