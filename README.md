# highlightjs-typst

Custom [highlight.js](https://highlightjs.org/) language definition for
[Typst](https://typst.app/) markup + code. Three top-level modes — markup,
code (triggered by a leading `#`), and math (`$…$`) — with the keyword,
literal, and built-in lists sourced from the official Typst reference.

[![CI](https://github.com/fabeat/highlight-typst/actions/workflows/ci.yml/badge.svg)](https://github.com/fabeat/highlight-typst/actions/workflows/ci.yml)

## Install

```bash
npm install highlightjs-typst highlight.js
```

`highlight.js` (≥ 11.11) is a peer dependency.

## Usage

### Register the language on your hljs instance

```js
import hljs from 'highlight.js'
import typst from 'highlightjs-typst'

hljs.registerLanguage('typst', typst)
hljs.highlight(source, { language: 'typst' })
```

The default export is the `LanguageFn`; named exports
(`registerTypstLanguage`, `TYPST_LANGUAGE`) are also available if you
need to wire it onto a pre-existing hljs core.

### One-shot helper

If you don't want to manage an hljs instance, the
`highlightjs-typst/highlight` sub-path bundles a private core:

```js
import { highlightTypst } from 'highlightjs-typst/highlight'

highlightTypst(source)
```

A browser IIFE is also published as `dist/typst.js` and auto-registers
with the global `hljs` when loaded after `highlight.min.js`.

## What it colours

Markup mode (default, and inside `[…]` content blocks):
section headings (`=`, `==`, …), line-start list / term / enum markers,
emphasis (`*foo*`, `_foo_`, `~sub~`), strong (`**foo**`, `__foo__`),
labels (`<foo>`), references (`@foo`), character escapes (`\#`,
`\u{1f600}`), em-dash (`---`), ellipsis (`...`), inline and block math
(`\$x\$`, `\$ x \$`).

Code mode (after `#`): language keywords (`let`, `if`, `for`, `set`,
`show`, `import`, `include`, `as`, `return`, `not`, `and`, `or`, …),
literals (`true`, `false`, `none`, `auto`), the standard library
(`align`, `block`, `text`, `grid`, `image`, `cite`, `table`, `figure`,
…), user-defined function calls (excluding keywords / literals /
builtins), and code-mode variable references.

Across all modes: line (`// …`) and block (`/* … */`) comments,
double-quoted strings, and numbers including unit-suffixed
(`12pt`, `50%`, `1.5em`, `90deg`).

The grammar is intentionally incomplete — hljs's regex modes are
greedy and a true parser would be hundreds of times bigger. The goal
is "make this readable", not "this is the Typst grammar".

## Theming

The grammar emits hljs's standard token classes (`.hljs-keyword`,
`.hljs-string`, …) so any hljs theme colours it without extra work.
See [`css-class-reference.md`](./css-class-reference.md) for the full
class list and a minimal theme.

## Develop

```bash
npm install
npm test          # builds dist/ via the pretest hook, then runs mocha
npm run check:drift  # rebuild dist/ and fail if it differs from git
```

`dist/` is committed, so a source change has to be paired with a
rebuild — `npm run check:drift` is what CI runs to catch the case
where you forget.

To regenerate the golden `.expect.txt` files after a deliberate
grammar change, delete the affected file and re-run
`node scripts/bootstrap-expects.mjs`, then visually inspect the
new output before committing.

## License

MIT. See [LICENSE](./LICENSE).