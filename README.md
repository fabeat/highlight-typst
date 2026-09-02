# highlightjs-typst

A custom [highlight.js](https://highlightjs.org/) language definition for
[Typst](https://typst.app/) markup + code. Built as a third-party grammar
following the official
[`highlightjs-grammar-template`](https://github.com/highlightjs/highlightjs-grammar-template)
so it can be listed in
[`SUPPORTED_LANGUAGES.md`](https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md)
and consumed the standard way.

## Install

```bash
npm install highlightjs-typst highlight.js
```

`highlight.js` is a peer dependency — you bring your own. Pin to
`^11.11.0` for the API this package targets.

## Usage

### Browser (script tag)

The package's `dist/typst.js` is an IIFE that auto-registers with
the global `hljs`. Drop it in after `highlight.min.js`:

```html
<script src="/path/to/highlight.min.js"></script>
<script src="/path/to/dist/typst.js"></script>
<script>hljs.highlightAll();</script>
```

### Node / bundler (CJS)

```js
const hljs = require('highlight.js')
const typst = require('highlightjs-typst')

hljs.registerLanguage('typst', typst)
const html = hljs.highlight(source, { language: 'typst' }).value
```

### Node / bundler (ESM)

```js
import hljs from 'highlight.js'
import typst from 'highlightjs-typst'

hljs.registerLanguage('typst', typst)
const html = hljs.highlight(source, { language: 'typst' }).value
```

### Register on an existing core

If you already have a hljs core in your bundle (e.g. a host that
uses hljs for markdown code blocks), teach it Typst without
bundling a second hljs:

```js
import hljs from 'highlight.js/lib/core'
import { registerTypstLanguage } from 'highlightjs-typst'

registerTypstLanguage(hljs)
const html = hljs.highlight(source, { language: 'typst' }).value
```

### One-shot helper

If you'd rather not manage an hljs instance at all, the
`highlightjs-typst/highlight` sub-path bundles a private hljs
core and gives you a one-call helper:

```js
import { highlightTypst } from 'highlightjs-typst/highlight'

const html = highlightTypst(source)
```

This is the entry the Spora plugin's admin UI uses.

## What it colours

- **Comments** — line (`// …`) and block (`/* … */`)
- **Strings** — double-quoted, with backslash escapes
- **Numbers** — plain, decimal, scientific, and unit-suffixed
  (`12pt`, `50%`, `1.5em`, `90deg`)
- **Markup-mode section headings** — `= Heading`, `== Subhead`, …
- **Markup-mode list / term / enum markers** — `-`, `+`, `/` at
  line start
- **Markup-mode strong / emph / sub / sup** — `*bold*`,
  `_italic_`, `~sub~`
- **Code-mode function calls** — `#identifier` (excluding the
  language keywords and built-ins, which get their own colour)
- **Keywords** — `let`, `if`, `else`, `for`, `in`, `while`,
  `break`, `continue`, `return`, `import`, `include`, `as`, `set`,
  `show`, `context`, `not`, `and`, `or`
- **Literals** — `true`, `false`, `none`, `auto`
- **Built-in functions** — `align`, `block`, `box`, `cite`,
  `grid`, `image`, `link`, `list`, `enum`, `table`, `figure`,
  `raw`, `par`, `emph`, `strong`, `underline`, `strike`,
  `highlight`, `pad`, `place`, `v`, `h`, `stack`, `terms`,
  `footnote`, `cite`, `bibliography`, `outline`, `query`,
  `counter`, `state`, `context`, `measure`, `page`, `line`,
  `parbreak`, `sequence`, plus a few dozen more
- **Code-mode variables** — `(label: value, …)` style, only
  matched when surrounded by typical code-mode punctuation

The grammar is intentionally incomplete — hljs's regex modes are
greedy and a true parser would be hundreds of times bigger. The
goal is "make this readable", not "this is the Typst grammar".

### What it does NOT colour

**Inline math** (`$x + y$`) and **block math** (`$$x + y$$`).
hljs's whole-file mode can't tell a `$` inside markup emphasis
(e.g. `*$#var*`) from a math delimiter, and the "first `$` to
next `$`" rule greedily swallows the rest of the document
whenever a `$` appears in markup. Removing the rule keeps
`*$#total*` and similar patterns correct; a future contribution
that needs math can layer it on with a stricter begin/end.

## Public API

| Export | Description |
| --- | --- |
| `default export` | The raw `LanguageFn` for `hljs.registerLanguage('typst', …)`. |
| `registerTypstLanguage(hljs)` | Register the language on a given hljs instance. Idempotent. |
| `isTypstReady()` | `true` once the bundled wrapper has registered Typst. |
| `TYPST_LANGUAGE` | Same as the default export, re-exported for symmetry with the `register*` helper. |

The `highlightjs-typst/highlight` sub-path adds:

| Export | Description |
| --- | --- |
| `highlightTypst(source)` | Returns highlighted HTML using a private hljs core. |
| `registerTypstLanguage(hljs)` | Same as above. |
| `isTypstReady()` | Same as above. |

## Theming

The grammar doesn't ship a theme — hljs's standard token
classes (`.hljs-keyword`, `.hljs-string`, `.hljs-comment`, etc.)
make it trivially themeable with any hljs theme or a custom
stylesheet. See [`css-class-reference.md`](./css-class-reference.md)
for the full class list and a minimal muted-palette theme.

## Develop

```bash
npm install
npm test
```

The `pretest` script runs `rollup -c` to build the `dist/`
artefacts, then `mocha` runs the markup tests against
`dist/typst.es.js`. To regenerate the golden `.expect.txt`
files after a deliberate grammar change, delete the affected
`.expect.txt` and re-run `node scripts/bootstrap-expects.mjs`,
then visually inspect the new output before committing.

## License

MIT. See [LICENSE](./LICENSE).
