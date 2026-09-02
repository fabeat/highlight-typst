# CSS class reference

The Typst grammar emits a small set of hljs token classes. All
of them are standard hljs classes, so any hljs theme (or a custom
stylesheet that targets these selectors) will colour the source
without extra effort.

| Class | Purpose |
| --- | --- |
| `hljs-comment` | Line (`// …`) and block (`/* … */`) comments. |
| `hljs-string` | Double-quoted strings. Also used for em-dash (`---`) and ellipsis (`...`) shorthand tokens. |
| `hljs-number` | Numbers, including unit-suffixed (`12pt`, `50%`, `1.5em`, `90deg`). |
| `hljs-keyword` | Language keywords (`let`, `if`, `for`, `set`, `show`, `import`, `include`, `as`, `in`, `return`, `not`, `and`, `or`, `while`, `break`, `continue`, `else`). |
| `hljs-literal` | The literals `true`, `false`, `none`, `auto`. |
| `hljs-built_in` | Standard library functions and modules (`align`, `block`, `text`, `grid`, `table`, `image`, `link`, `figure`, `list`, `enum`, `page`, `calc`, `array`, `str`, …). |
| `hljs-function` | A user-defined or non-built-in function call (`#customFunc()`). Excludes the keyword/built-in/literal lists via negative lookahead so those get their proper colour. |
| `hljs-variable` | A code-mode variable reference (`(label: value, …)` style) — only matches when surrounded by typical code-mode punctuation so plain prose words aren't coloured. |
| `hljs-title` | Line-start markup section headings (`= Heading`, `== Subhead`, …). |
| `hljs-bullet` | Line-start list / term / enum markers (`- item`, `+ item`, `/ Term`). |
| `hljs-emphasis` | Markup-mode emphasis (`*foo*`, `_foo_`, `~sub~`). |
| `hljs-strong` | Markup-mode strong emphasis (`**foo**`, `__foo__`). |
| `hljs-symbol` | Label targets (`<label>`, `<ns:label>`) and reference use sites (`@label`, `@ns:label`). |
| `hljs-meta` | The `=` prefix on a heading. Inline and block math (`$x$`, `$ x $`). Character escapes (`\#`, `\*`, `\u{1f600}`, …). |

## Custom-class notice

`hljs-function`, `hljs-variable`, `hljs-bullet`, `hljs-emphasis`,
`hljs-strong`, `hljs-symbol`, and `hljs-meta` are not in every
hljs theme. The grammar assumes the following minimal theme;
if your theme doesn't include these, add them or import the
snippet below:

```css
.hljs-function, .hljs-title { color: #1d4ed8; }
.hljs-variable { color: #b91c1c; }
.hljs-bullet { color: #6b7280; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: bold; }
.hljs-symbol { color: #0f766e; }
.hljs-meta { color: #6d28d9; }
```

A complete minimal theme that pairs with the muted plugin palette:

```css
.hljs { background: transparent; color: #1f2937; }
.hljs-comment { color: #6b7280; font-style: italic; }
.hljs-string { color: #047857; }
.hljs-number { color: #b45309; }
.hljs-literal { color: #b45309; }
.hljs-keyword { color: #6d28d9; font-weight: 500; }
.hljs-built_in { color: #1d4ed8; }
.hljs-function { color: #1d4ed8; }
.hljs-title { color: #0f766e; }
.hljs-variable { color: #b91c1c; }
.hljs-bullet { color: #6b7280; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: bold; }
.hljs-symbol { color: #0f766e; }
.hljs-meta { color: #6d28d9; }
```

## Light / dark

The grammar emits the same classes regardless of theme. Use
the host's `.dark` class convention (or any prefers-color-scheme
media query) to swap palettes — the grammar is theme-agnostic.

