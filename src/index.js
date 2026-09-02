/**
 * Public entry for the highlightjs-typst package.
 *
 * The default export is the language function so hljs-style
 * consumers can do:
 *
 *   import typst from 'highlightjs-typst'
 *   hljs.registerLanguage('typst', typst)
 *
 * The named exports give you a one-shot helper that uses a
 * private hljs core (see {@link highlightTypst}) plus the
 * same register / readiness helpers exposed by the wrapper.
 */
import TYPST_LANGUAGE from './languages/typst.js'
import {
  highlightTypst,
  registerTypstLanguage,
  isTypstReady,
} from './highlight.js'

export { highlightTypst, registerTypstLanguage, isTypstReady, TYPST_LANGUAGE }

export default TYPST_LANGUAGE
