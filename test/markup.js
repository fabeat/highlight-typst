import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { globSync } from 'glob'
import 'should'
import hljs from 'highlight.js/lib/core'
import typst from '../dist/typst.es.js'

hljs.registerLanguage('typst', typst)

const here = path.dirname(fileURLToPath(import.meta.url))
const expects = globSync(path.join(here, 'markup/typst/*.expect.txt'))

/**
 * Markup tests for the Typst grammar.
 *
 * Each test reads a `test/markup/typst/<name>.txt` fixture
 * and compares the highlighter's output to the matching
 * `test/markup/typst/<name>.expect.txt` golden file. To
 * regenerate the golden after an intentional grammar change,
 * delete the `.expect.txt` and re-run `npm test`; the test
 * runner will print the actual output so you can pipe it
 * into a new `.expect.txt` (or use the
 * `highlightjs-grammar-template` workflow).
 */
describe('Typst syntax highlighting', () => {
  expects.forEach((filename) => {
    const name = path.basename(filename, '.expect.txt')
    const skipped = name.endsWith('.skip')
    const run = skipped ? it.skip : it
    run(`should markup ${name}`, () => {
      const source = fs.readFileSync(filename.replace(/\.expect/, ''), 'utf8')
      const expected = fs.readFileSync(filename, 'utf8')
      hljs.highlight(source, { language: 'typst' }).value
        .trim()
        .should.equal(expected.trim())
    })
  })
})
