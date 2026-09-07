/*! `typst` grammar built and tested with Highlight.js 11.12.0 */

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

  // Unicode-aware identifier matcher. The character class
  // uses `\p{L}` (any Unicode letter) and `\p{N}` (any
  // Unicode digit) instead of `[a-zA-Z]` / `[0-9]`, and
  // the word-boundary lookbehind is `(?<![\p{L}\p{N}_-])`
  // instead of `(?<!\w)`, so a Typst identifier like
  // `grüße` is highlighted as a single `variable` span
  // rather than getting split into `gr` + `üß` (plain)
  // + `e`. Requires the `u` flag for `\p{...}` property
  // escapes. Typst itself restricts identifiers to ASCII
  // letters, digits, `_`, and `-` - we use the broader
  // Unicode classes so user-defined variables with
  // non-ASCII letters in markup text don't fall through
  // the cracks. (In code mode this is mostly cosmetic;
  // the rules just don't break on adjacent Unicode.)
  // Two bugs lived here before:
  //   1. `${reservedAlt}\\b` parsed as `(alt1|alt2|...|lastAlt)\\b`,
  //      so `\\b` only applied to the LAST alternative (alternation
  //      `|` has the lowest precedence). For any reserved word that
  //      was NOT last in the list - notably the single letter `h` -
  //      the negative lookahead matched at every position where a
  //      built-in's prefix happened to start, even when the next
  //      char was a letter (no word boundary). That rejected
  //      user-defined identifiers like `height` and `inset` which
  //      start with the prefix `h` of the built-in `h`.
  //   2. `\\b` itself is the wrong boundary for this grammar. Typst
  //      identifiers can contain `-` (e.g. `dm-sans`, `circle-fill`),
  //      and `\\b` matches between a word char and `-` because `-` is
  //      non-word. So `(?!circle\\b)` rejected `circle-fill` at the
  //      start because `circle` is a built-in and `\\b` matched
  //      between `e` and `-`.
  //
  // Fix: wrap the alternation in a non-capturing group so the boundary
  // applies to every alternative (`(?:alt1|alt2|...|lastAlt)`), and
  // replace `\\b` with an explicit "not followed by an identifier
  // char" check that includes `-`. So `(?!...)(?![\\p{L}\\p{N}_\\-])`
  // says: the input does not start with a reserved word UNLESS that
  // reserved word is immediately followed by more identifier chars
  // (in which case the reserved word is just a prefix of a longer
  // user-defined identifier like `circle-fill`).
  const identifierRe = new RegExp(
    `(?<![\\p{L}\\p{N}_\\-])(?!(?:${reservedAlt})(?![\\p{L}\\p{N}_\\-]))[\\p{L}_][\\p{L}\\p{N}_\\-]*`,
    'u'
  );
  const functionCallRe = new RegExp(
    `(?<![\\p{L}\\p{N}_\\-])(?!(?:${reservedAlt})(?![\\p{L}\\p{N}_\\-]))[\\p{L}_][\\p{L}\\p{N}_\\-]*(?=\\s*[(\\[{])`,
    'u'
  );

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

    // Markup numbers REQUIRE a unit suffix. The previous
    // version made the unit optional, which matched
    // every plain integer and decimal anywhere in markup
    // text (including the date `28.` in the Spora
    // plugin's Resilience Bakery teaser, where `28` lit
    // up as `hljs-number` even though the markup author
    // was writing prose, not code). In Typst, only
    // unit-bearing numbers (`12pt`, `50%`, `1.5em`,
    // `90deg`, `1fr`, ...) appear in markup in a way the
    // reader would call "numeric" - plain numbers like
    // `28` or `c^2`'s `2` are just part of the prose /
    // math notation and shouldn't be tinted. Code-mode
    // numbers are matched by a SEPARATE rule inside
    // `codeAtomRules`, so expressions in parens and
    // braces keep their numeric highlighting.
    //
    // Match examples: `12pt`, `25.4mm`, `2.5cm`, `1in`,
    // `1.5em`, `2rem`, `720px`, `90deg`, `3.14rad`,
    // `1fr`, `50%`.
    {
      className: 'number',
      begin:
        '\\b\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?(?:pt|mm|cm|in|em|rem|px|deg|rad|fr|%)\\b',
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
    // a word char, a backtick, OR a backslash (so
    // `` `$ ... $` `` in markup - inline code wrapping a
    // literal `$ ... $` - does not open a math span that
    // swallows the rest of the document, and `\$` in
    // markup - Typst's escape for a literal dollar sign -
    // does not start a math block either; this matters in
    // templates like `[\\$90k]` salary cells where `\\$`
    // is two escaped backslashes followed by an escaped
    // dollar, neither of which is a math delimiter);
    // followed by a non-whitespace, non-backtick char (so
    // `$ ` for display math is left alone - that case is
    // the `$$ ... $$` rule above - and `$`\`` at the end
    // of an inline-code span does not start a math).
    // Strict end: `$` not followed by a digit or letter
    // (so `100$` or `var$` don't match). This means
    // `$#var$` (Typst syntax inside math) still works
    // because `$` is at a word boundary, and `*$#var*` in
    // markup is safe because the `$` is preceded by `*`
    // (which is a word boundary for our purposes).
    {
      className: 'meta',
      begin: '(?<!\\w|`|\\\\)\\$(?![\\s`])',
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
    // The character class deliberately uses no redundant
    // escapes (with `unicodeRegex: true` on the
    // language, the `u` flag is on and `u`-mode is
    // strict about stray backslashes - so `\\#`,
    // `\\*`, etc. inside `[...]` would throw "Invalid
    // escape" at compile time. None of these characters
    // need escaping inside a character class anyway.
    {
      className: 'meta',
      begin:
        '\\\\(?:[#@<>(){}=+\\-\\/:\'";*]|(?:u\\{[0-9A-Fa-f]+\\}))',
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
    // negative lookbehind for an identifier character
    // (Unicode letter / digit / `_` / `-`) and the
    // negative lookahead over reserved words together
    // ensure this only matches at an identifier boundary
    // AND skips reserved words, so the keyword engine
    // can colour them as keyword / literal / built-in
    // instead. Without the word-boundary lookbehind, the
    // rule would match starting inside a reserved word
    // (e.g. `et` inside `let`), consume the suffix, and
    // prevent the keyword engine from seeing the full
    // word. Must come before the `variable` rule so a
    // function call wins over a plain variable match
    // for the same identifier.
    {
      className: 'function',
      match: functionCallRe,
      relevance: 0,
    },
    // Variable: any other identifier. Same
    // identifier-boundary + reserved-word exclusion.
    {
      className: 'variable',
      match: identifierRe,
      relevance: 0,
    },
  ];

  // -----------------------------------------------------------------
  // The `#` code mode entry is a recursive grammar: `#code`
  // can contain parens `(...)`, braces `{...}`, and a content
  // block `[...]`. A content block in turn can contain more
  // `#code`, which can contain another content block, and so
  // on. We model that with three modes that reference each
  // other in a cycle:
  //
  //   codeMode        -> contentBlockMode
  //   contentBlockMode -> codeMode
  //   nestedContentBlockMode -> codeMode (and 'self')
  //
  // To break the TDZ that a `const` cycle would create, the
  // modes are declared up front with empty `contains` arrays,
  // then their `contains` are assigned below once all three
  // objects exist. hljs processes the resulting references
  // at language-registration time, by which point every
  // pointer is populated.
  //
  // Two content-block variants:
  //
  //   - `contentBlockMode` uses `endsParent: true` and is
  //     used DIRECTLY under `codeMode` (after a leading
  //     `#code`). When its closing `]` matches, the
  //     content block AND its parent (the code expression
  //     started by `#`) both end, so `#emph[Hello] and
  //     more text` correctly switches back to markup for
  //     `and more text`. Without `endsParent: true` the
  //     trailing `and` would be highlighted as a keyword.
  //
  //   - `nestedContentBlockMode` does NOT use `endsParent`.
  //     It is used everywhere ELSE a `[...]` might appear:
  //     inside `parensMode`, inside `bracesMode`, and
  //     INSIDE `contentBlockMode` itself (for the case
  //     `#text[outer [inner] more]` where the inner `]`
  //     must only close the inner block). The closing `]`
  //     ends only the nested content block and returns us
  //     to the surrounding code-mode scope.
  //
  // Both variants include `codeMode` in their `contains`
  // so that `#text(...)`, `#box(...)`, `#h(0.6em)`, and
  // any other code-mode expression inside a content block
  // is highlighted as code (rather than dumped as plain
  // text). This is what makes the user-reported Datums-
  // Pille line and the `#place(... pad(x: 50pt, y: 88pt)
  // [#text(...)[Resilience] ...]` block highlight correctly.
  // -----------------------------------------------------------------
  const contentBlockMode = {
    begin: '\\[',
    end: '\\]',
    endsParent: true,
    contains: [],
  };
  const nestedContentBlockMode = {
    begin: '\\[',
    end: '\\]',
    contains: [],
  };
  // The `end` lookahead fires on `;`, `\n`, `]`, or end of
  // input. The `]` matters because a content block
  // `[content]` is the LAST argument of any function call
  // that uses one - `#text(size: 9pt)[hello]more` should
  // put `more` in the OUTER markup scope, not in the
  // leftover tail of the `#text` code mode. Without `]`
  // here, every identifier that follows a content block
  // on the same line (`KOSTENLOS`, `UHR`, etc.) gets
  // painted as a code-mode variable because the code
  // mode just keeps running until `\n`. The `\]` escape
  // case for a literal `]` in code mode is not a valid
  // Typst construct, so the lookahead does not need to
  // special-case it.
  const codeMode = {
    begin: '(?<!\\\\)#',
    end: /(?=[;\n\]|$])/,
    keywords: codeKeywords,
    contains: [],
  };

  // Balanced parens `(...)` - code inside code. The `'self'`
  // reference allows nested parens, and the `codeAtomRules`
  // are duplicated for this scope. `keywords` is the same
  // as the outer code mode. `nestedContentBlockMode` lets
  // an inline `[...]` argument to a function call be parsed
  // as markup instead of as a variable identifier.
  const parensMode = {
    begin: '\\(',
    end: '\\)',
    keywords: codeKeywords,
    contains: ['self', ...codeAtomRules, nestedContentBlockMode],
  };

  // Balanced braces `{...}` - same as parens.
  const bracesMode = {
    begin: '\\{',
    end: '\\}',
    keywords: codeKeywords,
    contains: ['self', ...codeAtomRules, nestedContentBlockMode],
  };

  // Now wire the cycles. The three arrays below complete
  // the mode definitions that were sketched with empty
  // `contains` above.
  codeMode.contains = [
    ...codeAtomRules,
    parensMode,
    bracesMode,
    contentBlockMode,
  ];
  contentBlockMode.contains = [
    ...markupRules,
    codeMode,
    nestedContentBlockMode,
  ];
  // `'self'` lets `nestedContentBlockMode` recurse so that
  // `[outer [inner [deepest]]]` works without us needing a
  // dedicated third-tier mode.
  nestedContentBlockMode.contains = [
    'self',
    ...markupRules,
    codeMode,
  ];

  return {
    name: 'Typst',
    aliases: ['typst'],
    case_insensitive: false,
    // Enable Unicode-aware regex compilation. hljs only
    // adds the `u` flag to its internal `beginRe` /
    // `endRe` if `unicodeRegex` is truthy, so without
    // this setting, `\p{L}` and `\p{N}` in the function
    // / variable rules above are silently downgraded to
    // literal characters and a Typst identifier like
    // `grüße` falls through to the ASCII-only
    // character class, splitting it into `gr` (matched
    // as a variable) + `üß` (no match) + `e` (matched
    // as a variable). Python, Haskell, and XML also
    // set this; it's effectively the opt-in for "this
    // language has identifiers that may contain
    // non-ASCII letters". Matches the Typst reference
    // by accepting any Unicode letter in identifiers
    // (Typst itself only supports ASCII, but the
    // engine's word-boundary handling needs to be
    // Unicode-aware so the highlighting doesn't
    // fragment adjacent to `ö ü ß` etc. in markup).
    unicodeRegex: true,
    contains: [
      // Top-level markup rules.
      ...markupRules,

      // CODE MODE entry: a `#` that isn't an escape (`\#`)
      // starts a code expression. Ends at `;`, end of line,
      // or end of file. Balanced brackets inside the
      // expression are handled by the `parensMode` /
      // `bracesMode` sub-modes; a `[...]` content block
      // switches back to markup via `contentBlockMode`.
      codeMode,
    ],
  }
}

module.exports = typst;
