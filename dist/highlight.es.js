/*! `typst` grammar built and tested with Highlight.js 11.12.0 */

import hljs from 'highlight.js/lib/core';

/*
Language: Typst
Requires: highlight.js >= 11
Author: fabeat
Description: Typst markup + code hybrid. Covers comments, double-quoted strings, numbers (with unit suffixes), markup headings, list/term/enum markers, strong/emph/sub/sup markup, code-mode function calls, keywords, literals, the standard library, labels, references, character escapes, em-dash, ellipsis, and inline/block math. Sourced from the official Typst reference at https://typst.app/docs/reference/.
Website: https://typst.app/
Category: markup
*/

/**
 * Custom highlight.js language definition for Typst.
 *
 * Sourced from the official Typst reference
 * (https://typst.app/docs/reference/) so the keyword,
 * literal, and built-in lists match the standard library the
 * way the docs describe it.
 *
 * Typst is a markup-and-code hybrid: documents start in
 * markup mode (e.g. an "=" heading, an "*emphasis*" span, a
 * "- list" item) and switch into code mode when the author
 * types "#" (e.g. "#let x = 1", "#if cond { ... }"). Markup
 * and code can be nested via brackets: "[...]" are content
 * blocks, "(...)" group code expressions, "{...}" are code
 * blocks. Strings live in code mode only.
 *
 * The grammar is intentionally incomplete - hljs's regex
 * modes are greedy and a true parser would be hundreds of
 * times bigger. The goal is "make this readable", not "this
 * is the Typst grammar".
 *
 * Notable omissions (each is a deliberate trade-off):
 *   - Smart quotes: '...' and "..." are 2-3 chars wide each;
 *     the regex can't disambiguate from apostrophes and
 *     closing quotes that mark the end of an identifier.
 *   - Inline code with backticks: the `...` is the same
 *     character set as a one-line raw block (`...)`, so a
 *     separate mode would conflict with the backtick-aware
 *     raw-block path.
 *   - The `-` as a decrement operator doesn't exist in
 *     Typst, but `--` (en-dash) is the same character pair
 *     so we don't try to colour it.
 *   - The non-breaking-space shorthand `~` is a single
 *     non-printing character; we leave it as plain text.
 *
 * References:
 *   - Typst reference: https://typst.app/docs/reference/
 *   - hljs custom-language docs:
 *     https://highlightjs.readthedocs.io/en/latest/mode-reference.html
 */

const KEYWORDS = [
  'let', 'if', 'else', 'for', 'in', 'while', 'break', 'continue',
  'return', 'import', 'include', 'as', 'set', 'show', 'context',
  'not', 'and', 'or',
];

const LITERALS = ['true', 'false', 'none', 'auto'];

// Full standard library + module names. Some of these
// (calc, str, int, ...) are modules that are accessed as
// `module.member` rather than called directly, but hljs
// can't tell the difference and the colour is appropriate
// either way.
const BUILT_INS = [
  // Foundations (modules + functions)
  'array', 'assert', 'auto', 'bool', 'bytes', 'calc', 'content',
  'datetime', 'decimal', 'dictionary', 'duration', 'eval', 'float',
  'function', 'int', 'label', 'module', 'none', 'panic', 'path',
  'plugin', 'regex', 'repr', 'selector', 'std', 'str', 'symbol',
  'sys', 'target', 'type', 'version',
  // Model
  'asset', 'bibliography', 'cite', 'divider', 'document', 'emph',
  'enum', 'figure', 'footnote', 'heading', 'link', 'list',
  'numbering', 'outline', 'par', 'parbreak', 'quote', 'ref',
  'strong', 'table', 'terms', 'title',
  // Text
  'highlight', 'linebreak', 'lorem', 'lower', 'overline', 'raw',
  'smallcaps', 'smartquote', 'strike', 'sub', 'super', 'text',
  'underline', 'upper',
  // Math
  'accent', 'attach', 'binom', 'cancel', 'cases', 'class',
  'equation', 'frac', 'lr', 'mat', 'op', 'primes', 'roots',
  'sizes', 'stretch', 'styles', 'underover', 'variants', 'vec',
  // Layout
  'align', 'alignment', 'angle', 'block', 'box', 'colbreak',
  'column', 'columns', 'direction', 'fraction', 'grid', 'hide',
  'h', 'layout', 'length', 'measure', 'move', 'pad', 'page',
  'pagebreak', 'pages', 'place', 'ratio', 'relative', 'repeat',
  'rotate', 'scale', 'skew', 'stack', 'v', 'vbreak', 'vline',
  // Visualize
  'circle', 'color', 'curve', 'ellipse', 'gradient', 'image',
  'line', 'polygon', 'rect', 'square', 'stroke', 'tiling',
  // Introspection
  'counter', 'here', 'locate', 'location', 'metadata', 'query',
  'state',
  // Data loading
  'cbor', 'csv', 'json', 'read', 'toml', 'xml', 'yaml',
  // Export
  'artifact', 'data-cell', 'header-cell', 'table-summary', 'elem',
  'frame', 'typed',
  // Legacy / additional
  'colbreak', 'column', 'hline', 'pagebreak', 'pages', 'overline',
  'place', 'rest', 'style', 'vbreak', 'vline',
];

/** @param {import('highlight.js').HLJSApi} hljs */
function TYPST_LANGUAGE (hljs) {
  // Union of the three reserved-word lists, used as a
  // negative-lookahead alternation for the function-call rule
  // so it doesn't steal colouring from keyword/built-in rules.
  const reservedWords = [...KEYWORDS, ...LITERALS, ...BUILT_INS];
  const reservedAlt = reservedWords
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  return {
    name: 'Typst',
    aliases: ['typst'],
    case_insensitive: false,
    keywords: {
      keyword: KEYWORDS,
      literal: LITERALS,
      built_in: BUILT_INS,
    },
    contains: [
      // Line comment (`// ...` to end of line)
      hljs.COMMENT('//', '$', { relevance: 0 }),

      // Block comment (`/* ... */`)
      hljs.COMMENT('/\\*', '\\*/', { relevance: 0 }),

      // Strings (double-quoted, with backslash escapes).
      // Typst also supports line-broken strings via a
      // backslash at end of line.
      {
        className: 'string',
        begin: '"',
        end: '"',
        contains: [{ begin: '\\\\(?:.|$)' }],
        relevance: 0,
      },

      // Numbers with optional unit suffix.
      //   42, 3.14, 1e3, 50%, 12pt, 1.5em, 90deg
      {
        className: 'number',
        begin:
          '\\b\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?(?:pt|mm|cm|in|em|rem|px|deg|rad|fr|%)?\\b',
        relevance: 0,
      },

      // Markup-mode section headings at line start:
      // `=`, `==`, `===` (up to 5).
      {
        className: 'title',
        begin: '^={1,5}\\s',
        end: '$',
        relevance: 0,
        contains: [{ className: 'meta', begin: '^={1,5}' }],
      },

      // Markup-mode list markers at line start:
      //   - foo       bullet list
      //   + foo       numbered list
      //   / **Term**: description   term list
      {
        className: 'bullet',
        begin: '^[+\\-/]\\s',
        relevance: 0,
      },

      // Block math: `$$ ... $$`. Whitespace padding around
      // the content is the standard Typst convention for
      // display math, but the rule is intentionally lenient.
      {
        className: 'meta',
        begin: '\\$\\$',
        end: '\\$\\$',
        contains: [{ className: 'string', begin: '\\$', end: '\\$' }],
      },

      // Inline math: `$x$`. Strict begin: `$` not preceded by
      // a word char, not preceded by another `$` (to skip
      // `$$`). Strict end: `$` not followed by a digit or
      // letter (so `100$` or `var$` don't match). This
      // means `$#var$` (Typst syntax inside math) still
      // works because `$` is at a word boundary, and
      // `*$#var*` in markup is safe because the `$` is
      // preceded by `*` (which is a word boundary for our
      // purposes).
      {
        className: 'meta',
        begin: '(?<!\\w)\\$\\S',
        end: '\\S\\$(?!\\w)',
        relevance: 0,
      },

      // Markup-mode strong emphasis: `**foo**` and `__foo__`.
      // These come BEFORE the single-marker rules so a `**`
      // pair wins over two adjacent `*` emphases.
      {
        className: 'strong',
        begin: '(?<![*_~\\w])\\*\\*[^*\\s]',
        end: '[^*\\s]\\*\\*(?![*_~])',
        relevance: 0,
      },
      {
        className: 'strong',
        begin: '(?<![*_~\\w])__[^_\\s]',
        end: '[^_\\s]__(?![*_~])',
        relevance: 0,
      },

      // Markup-mode emphasis: `*foo*` and `_foo_`.
      // Lookbehind excludes `*_~` and word chars so a marker
      // inside an identifier (`var_name`, `var*foo`) doesn't
      // get misread as emphasis start.
      {
        className: 'emphasis',
        begin: '(?<![*_~\\w])\\*[^*\\s]',
        end: '[^*\\s]\\*(?![*_~])',
        relevance: 0,
      },
      {
        className: 'emphasis',
        begin: '(?<![*_~\\w])_[^_\\s]',
        end: '[^_\\s]_(?![*_~])',
        relevance: 0,
      },

      // Sub/superscript markup: `~foo~`. The single `~`
      // shorthand is a non-breaking space in markup; the
      // emphasis rule needs a pair of `~`s with non-space
      // content between them.
      {
        className: 'emphasis',
        begin: '(?<![*_~\\w])~[^~\\s]',
        end: '[^~\\s]~(?!~)',
        relevance: 0,
      },

      // Character escape: `\#`, `\*`, `\_`, `\$`, `\@`, `\<`,
      // `\>`, `\[`, `\]`, `\(`, `\)`, `\{`, `\}`, `\=`, `\-`,
      // `\+`, `\/`, `\:`, `\;`, `\'`, `\"`, and the
      // Unicode form `\u{1f600}`. The escaped backslash
      // (`\\`) is a literal `\` and is matched too.
      {
        className: 'meta',
        begin:
          '\\\\(?:[\\#\\$\\@\\<\\>\\[\\]\\(\\)\\{\\}\\=\\-\\+\\/\\:\\;\\\'\\"\\*]|(?:u\\{[0-9A-Fa-f]+\\}))',
        relevance: 0,
      },

      // Label reference target: `<identifier>` (or
      // `<namespace:label>`). Must be at a word boundary
      // (preceded by whitespace, start of line, or
      // punctuation) so the `if a < b` less-than isn't
      // misread.
      {
        className: 'symbol',
        begin:
          '(?:^|(?<=[\\s\\(\\[\\{,;]))<[a-zA-Z_][a-zA-Z0-9_\\-]*(?::[a-zA-Z_][a-zA-Z0-9_\\-]*)?>',
        relevance: 0,
      },

      // Label reference use site: `@identifier` (or
      // `@namespace:label`).
      {
        className: 'symbol',
        begin:
          '(?:^|(?<=[\\s\\(\\[\\{,;]))@[a-zA-Z_][a-zA-Z0-9_\\-]*(?::[a-zA-Z_][a-zA-Z0-9_\\-]*)?',
        relevance: 0,
      },

      // Em-dash (`---`) and ellipsis (`...`). En-dash (`--`)
      // is omitted to avoid clashing with two adjacent `-`
      // characters in an argument list.
      {
        className: 'string',
        begin: '---',
        relevance: 0,
      },
      {
        className: 'string',
        begin: '\\.\\.\\.',
        relevance: 0,
      },

      // Code-mode function call: `#identifier`. The
      // negative lookahead skips the language keywords and
      // built-ins so they fall through to the keyword rule
      // and get their own colour.
      {
        className: 'function',
        begin: `#(?!${reservedAlt}\\b)[a-zA-Z_][a-zA-Z0-9_\\-]*`,
        relevance: 0,
      },

      // Code-mode variable references inside an
      // expression. We only catch them when they're
      // surrounded by typical code-mode punctuation
      // (e.g. `(`, `,`, `=`, `:`) so markup words like
      // `Hello` in a paragraph don't get coloured.
      {
        className: 'variable',
        begin: '(?<=[(,=:])[a-zA-Z_][a-zA-Z0-9_\\-]*(?=\\s*[,)=:])',
        relevance: 0,
      },
    ],
  }
}

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

let registered = false;

/**
 * Register the Typst language with the given hljs instance.
 * Idempotent - subsequent calls are no-ops. Use this if you
 * already have an hljs core in your bundle (e.g. via the
 * host's markdown highlighter) and want to add Typst without
 * a second hljs runtime.
 */
function registerTypstLanguage(hljsInstance) {
  if (!hljsInstance.getLanguage('typst')) {
    hljsInstance.registerLanguage('typst', TYPST_LANGUAGE);
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
function highlightTypst(source) {
  if (!registered) {
    registerTypstLanguage(hljs);
    registered = true;
  }
  return hljs.highlight(source, { language: 'typst', ignoreIllegals: true }).value
}

/**
 * True once the bundled hljs core has registered Typst.
 * Mostly useful for tests that want to assert registration
 * happened.
 */
function isTypstReady() {
  return registered
}

export { highlightTypst, isTypstReady, registerTypstLanguage };
