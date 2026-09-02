/**
 * Public TypeScript types for highlightjs-typst.
 *
 * The runtime is plain JS so the package ships with a small
 * .d.ts shim. The shape matches what hljs's custom-language
 * API expects, plus the package's own helpers.
 */

// Mirror of `import('highlight.js').HLJSApi` - kept inline so
// consumers don't need to import hljs just to type-check.
export interface HLJSApi {
  registerLanguage(name: string, language: LanguageFn): void
  getLanguage(name: string): unknown
  highlight(
    source: string,
    options: { language: string; ignoreIllegals?: boolean },
  ): { value: string }
}

// Mirror of `import('highlight.js').LanguageFn`.
export type LanguageFn = (hljs: HLJSApi) => Language

// Mirror of `import('highlight.js').Language` - the return
// shape of a `LanguageFn`. Only the fields we set in
// `src/languages/typst.js` are typed here; the rest is left
// open so a future grammar that adds more modes still
// type-checks.
export interface Language {
  name: string
  aliases?: string[]
  case_insensitive?: boolean
  keywords?: string | { [scope: string]: string | string[] }
  contains?: Array<Record<string, unknown>>
  [key: string]: unknown
}

/**
 * Register the Typst language on the given hljs instance.
 * Idempotent - subsequent calls are no-ops.
 */
export function registerTypstLanguage(hljs: HLJSApi): void

/**
 * Highlight a Typst source string using a private hljs core.
 * Returns hljs-highlighted HTML (`<span class="hljs-keyword">…
 * </span>` tokens inside a `<span class="hljs">` root).
 */
export function highlightTypst(source: string): string

/** True once the bundled hljs core has registered Typst. */
export function isTypstReady(): boolean

/**
 * The raw language function, exported for callers who want
 * to register it on a hljs instance themselves. The default
 * export of the package is the same value.
 */
export const TYPST_LANGUAGE: LanguageFn

export default TYPST_LANGUAGE
