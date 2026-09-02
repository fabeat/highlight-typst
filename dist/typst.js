/*! `typst` grammar built and tested with Highlight.js 11.12.0 */

var hljsTypst = (function () {
  'use strict';

  /*
  Language: Typst
  Requires: highlight.js >= 11
  Author: fabeat
  Description: Typst markup + code hybrid with three top-level modes (markup, code, math). Markup is the default; code is triggered by a leading "#" and contains keywords, builtins, literals, function calls, balanced (...) and {...} expressions, and content blocks "[...]" that switch back to markup; math is "$...$". Comments, strings, numbers, headings, lists, emphasis, escapes, labels, references, em-dash, and ellipsis are recognised. Sourced from the official Typst reference at https://typst.app/docs/reference/.
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
   * Typst is a three-mode language, modelled here with
   * three sub-grammars:
   *
   *   - MARKUP MODE (the default at the top level and inside
   *     content blocks). Plain text, headings (`= Title`),
   *     lists, emphasis (`*foo*`, `_foo_`, `**foo**`,
   *     `__foo__`), sub/superscript (`~foo~`), character
   *     escapes (`\#`, `\*`, `\[`, etc.), labels (`<foo>`),
   *     references (`@foo`), em-dash (`---`), ellipsis
   *     (`...`). NO keyword/builtin/literal highlighting
   *     here: a word like `text` in a markup paragraph is
   *     just text, not a function call.
   *
   *   - CODE MODE (triggered by a leading `#` that isn't an
   *     escape `\#`). The `#` is followed by an expression
   *     that may contain: keywords (`let`, `if`, `for`, ...),
   *     literals (`true`, `false`, `none`, `auto`), the
   *     standard library (`text`, `heading`, `emph`, ...),
   *     user-defined function calls, balanced `(...)` and
   *     `{...}` sub-expressions, and `[...]` content blocks
   *     that switch back to markup. Ends at `;`, end of line,
   *     or end of file.
   *
   *   - MATH MODE (triggered by `$...$`, with the inline and
   *     block variants sharing the same end pattern). Inside
   *     math, only the markup-level rules apply - we don't
   *     try to parse math syntax beyond recognising the
   *     delimiters. `$x^2$` is highlighted as a single
   *     `<span class="hljs-meta">` span.
   *
   * The grammar is intentionally incomplete - hljs's regex
   * modes are greedy and a true parser would be hundreds of
   * times bigger. The goal is "make this readable", not "this
   * is the Typst grammar". See the design notes for the
   * specific limitations.
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
   *   - Tinymist (the reference VSCode highlighter, uses
   *     tree-sitter): https://github.com/Myriad-Dreamin/tinymist
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
  function typst (hljs) {
    // Union of the three reserved-word lists, used as a
    // negative-lookahead alternation for the function and
    // variable rules inside code mode so they don't
    // double-paint words that the keyword engine is about
    // to colour as a keyword / literal / built-in.
    const reservedWords = [...KEYWORDS, ...LITERALS, ...BUILT_INS];
    const reservedAlt = reservedWords
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');

    // -----------------------------------------------------------------
    // MARKUP MODE: rules that apply at the top level AND inside a
    // content block `[...]`. No code-mode entry, no top-level
    // keywords. Plain text, structural markup, and math.
    // -----------------------------------------------------------------
    const markupRules = [
      // Line comment (`// ...` to end of line).
      hljs.COMMENT('//', '$', { relevance: 0 }),

      // Block comment (`/* ... */`).
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
    ];

    // -----------------------------------------------------------------
    // CODE MODE: rules that apply inside `#`-prefixed expressions
    // and inside the `(...)` / `{...}` sub-expressions of a code
    // expression. Each sub-mode has its own `keywords` field so
    // the keyword engine runs in the correct scope.
    // -----------------------------------------------------------------
    const codeKeywords = {
      keyword: KEYWORDS,
      literal: LITERALS,
      built_in: BUILT_INS,
    };

    // The "atomic" rules that apply at any code-mode depth
    // (top-level code, parens, braces). Comments, strings,
    // numbers, and the two identifier rules.
    const codeAtomRules = [
      hljs.COMMENT('//', '$', { relevance: 0 }),
      hljs.COMMENT('/\\*', '\\*/', { relevance: 0 }),
      {
        className: 'string',
        begin: '"',
        end: '"',
        contains: [{ begin: '\\\\(?:.|$)' }],
        relevance: 0,
      },
      {
        className: 'number',
        begin:
          '\\b\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?(?:pt|mm|cm|in|em|rem|px|deg|rad|fr|%)?\\b',
        relevance: 0,
      },
      // Function call: identifier followed by `(`, `[`, or
      // `{` (the three call-site delimiters in Typst). The
      // negative lookbehind for a word character and the
      // negative lookahead over reserved words together
      // ensure this only matches at a word boundary AND
      // skips reserved words, so the keyword engine can
      // colour them as keyword / literal / built-in
      // instead. Without the word-boundary lookbehind, the
      // rule would match starting inside a reserved word
      // (e.g. `et` inside `let`), consume the suffix, and
      // prevent the keyword engine from seeing the full
      // word. Must come before the `variable` rule so a
      // function call wins over a plain variable match
      // for the same identifier.
      {
        className: 'function',
        begin: `(?<!\\w)(?!${reservedAlt}\\b)[a-zA-Z_][a-zA-Z0-9_\\-]*(?=\\s*[(\\[{])`,
        relevance: 0,
      },
      // Variable: any other identifier. Same
      // word-boundary + reserved-word exclusion.
      {
        className: 'variable',
        begin: `(?<!\\w)(?!${reservedAlt}\\b)[a-zA-Z_][a-zA-Z0-9_\\-]*`,
        relevance: 0,
      },
    ];

    // Balanced parens `(...)` - code inside code. The `'self'`
    // reference allows nested parens, and the `codeAtomRules`
    // are duplicated for this scope. `keywords` is the same
    // as the outer code mode.
    const parensMode = {
      begin: '\\(',
      end: '\\)',
      keywords: codeKeywords,
      contains: ['self', ...codeAtomRules],
    };

    // Balanced braces `{...}` - same as parens.
    const bracesMode = {
      begin: '\\{',
      end: '\\}',
      keywords: codeKeywords,
      contains: ['self', ...codeAtomRules],
    };

    // -----------------------------------------------------------------
    // CONTENT BLOCK `[...]` - markup inside code. The bracket
    // pair surrounds a markup expression, so we re-enter
    // markup mode here. `endsParent: true` (NOT to be
    // confused with `endsWithParent`, which is the opposite
    // - it makes the sub-mode end when the parent ends)
    // means that when the content block's closing `]`
    // matches, the content block AND its parent (the code
    // mode) both end. This is what makes
    // `#emph[Hello] and more text` correctly switch back to
    // markup after the `]`, instead of leaving `and more
    // text` inside the code mode where `and` would be
    // highlighted as a keyword.
    //
    // Limitation: nested content blocks like
    // `#text[outer [inner] more]` are not handled
    // correctly - the inner `]` ends both the inner and
    // outer content blocks plus the code mode, leaving the
    // outer content block's `]` and `more` unparsed. This
    // is rare enough in practice to accept the trade-off.
    // A proper parser (e.g. Tinymist) handles this with
    // full expression-level bracket tracking.
    // -----------------------------------------------------------------
    const contentBlockMode = {
      begin: '\\[',
      end: '\\]',
      endsParent: true,
      contains: [...markupRules],
    };

    return {
      name: 'Typst',
      aliases: ['typst'],
      case_insensitive: false,
      contains: [
        // Top-level markup rules.
        ...markupRules,

        // CODE MODE entry: a `#` that isn't an escape (`\#`)
        // starts a code expression. Ends at `;`, end of line,
        // or end of file. Balanced brackets inside the
        // expression are handled by the `parensMode` /
        // `bracesMode` sub-modes; a `[...]` content block
        // switches back to markup via `contentBlockMode`.
        {
          begin: '(?<!\\\\)#',
          end: /(?=[;\n]|$)/,
          keywords: codeKeywords,
          contains: [
            ...codeAtomRules,
            parensMode,
            bracesMode,
            contentBlockMode,
          ],
        },
      ],
    }
  }

  return typst;

})();
hljs.registerLanguage("typst", hljsTypst);
