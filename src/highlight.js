/**
 * highlight-typst - thin wrapper around highlight.js with a
 * custom Typst language.
 *
 * Two consumption patterns:
 *
 *   1. Register the language on an hljs instance you already
 *      have (e.g. the host's markdown code-block hljs):
 *
 *        import hljs from 'highlight.js/lib/core'
 *        import { registerTypstLanguage } from 'highlightjs-typst'
 *        registerTypstLanguage(hljs)
 *        const html = hljs.highlight(source, { language: 'typst' }).value
 *
 *      Zero new runtime cost - the language is ~3KB on top of
 *      the existing hljs core.
 *
 *   2. Use the bundled `highlightTypst(source)` wrapper, which
 *      uses a private hljs core instance. Adds highlight.js's
 *      `core` runtime (~10KB gzipped) to your bundle. The
 *      language is registered lazily on the first call.
 *
 * The output is hljs-highlighted HTML wrapped in `<span
 * class="hljs">` with token spans (`<span class="hljs-keyword">`
 * etc.). hljs escapes all text and attribute content, so the
 * result is XSS-safe to render with `v-html` (Vue),
 * `dangerouslySetInnerHTML` (React), `innerHTML` (vanilla), or
 * any equivalent.
 */
import TYPST_LANGUAGE from './languages/typst.js'

// Private hljs core for the bundled `highlightTypst` helper.
// Consumers that prefer to use their own hljs instance can
// ignore this runtime cost by calling `registerTypstLanguage(hljs)`
// instead.
import hljs from 'highlight.js/lib/core'

let registered = false

/**
 * Register the Typst language with the given hljs instance.
 * Idempotent - subsequent calls are no-ops. Use this if you
 * already have an hljs core in your bundle (e.g. via the
 * host's markdown highlighter) and want to add Typst without
 * a second hljs runtime.
 */
export function registerTypstLanguage(hljsInstance) {
  if (!hljsInstance.getLanguage('typst')) {
    hljsInstance.registerLanguage('typst', TYPST_LANGUAGE)
  }
}

/**
 * Highlight a Typst source string. Returns the highlighted HTML
 * (`<span class="hljs-keyword">…</span>` tokens inside a
 * `<span class="hljs">` root).
 *
 * Internally uses a private hljs core instance and lazily
 * registers the language on the first call. Subsequent calls
 * are O(source-length) and do not re-register.
 */
export function highlightTypst(source) {
  if (!registered) {
    registerTypstLanguage(hljs)
    registered = true
  }
  return hljs.highlight(source, { language: 'typst', ignoreIllegals: true }).value
}

/**
 * True once the bundled hljs core has registered Typst.
 * Mostly useful for tests that want to assert registration
 * happened.
 */
export function isTypstReady() {
  return registered
}
