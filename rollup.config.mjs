import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const hljsVersion = require('highlight.js/package.json').version
const banner = `/*! \`typst\` grammar built and tested with Highlight.js ${hljsVersion} */\n`

/**
 * Rollup config for highlightjs-typst.
 *
 * Produces three artefacts per source entry:
 *   - `dist/<name>.es.js`  - ESM bundle
 *   - `dist/<name>.cjs`    - CommonJS bundle
 *   - `dist/<name>.js`     - IIFE for direct <script> use
 *     (the language only; auto-registers with the global hljs)
 *
 * Mirrors the layout of the official `highlightjs-grammar-template`
 * so consumers who learn the template can also navigate ours.
 */
export default [
  // The grammar itself - small, no hljs bundled. The IIFE
  // auto-registers with `window.hljs` so the file can be
  // dropped in as a <script> after `highlight.min.js`.
  {
    input: 'src/languages/typst.js',
    output: [
      { file: 'dist/typst.es.js', format: 'es', banner },
      {
        file: 'dist/typst.cjs',
        format: 'cjs',
        exports: 'default',
        banner,
      },
      {
        file: 'dist/typst.js',
        format: 'iife',
        name: 'hljsTypst',
        banner,
        footer: 'hljs.registerLanguage("typst", hljsTypst);',
      },
    ],
  },
  // The `highlightTypst()` wrapper. Highlights hljs as a
  // peer dep so the consumer's own hljs instance is used
  // (matches the package.json peerDependencies). The
  // `external` declaration also silences rollup's
  // "unresolved dependencies" warning for hljs.
  {
    input: 'src/highlight.js',
    output: [
      { file: 'dist/highlight.es.js', format: 'es', banner },
      { file: 'dist/highlight.cjs', format: 'cjs', banner },
    ],
    external: ['highlight.js', 'highlight.js/lib/core'],
  },
]
