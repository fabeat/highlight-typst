/**
 * Bootstrap the markup test golden files from the actual
 * hljs output. Run with `node scripts/bootstrap-expects.mjs`
 * after editing or adding a `test/markup/typst/<name>.txt`
 * fixture, then visually inspect the new
 * `test/markup/typst/<name>.expect.txt` and commit it.
 *
 * Intentionally not a `prepublish` script - golden files are
 * always authored by hand (or carefully reviewed) so we
 * don't bake in silent grammar regressions.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import hljs from 'highlight.js/lib/core'
import typst from '../dist/typst.es.js'

hljs.registerLanguage('typst', typst)

const here = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(here, '..', 'test', 'markup', 'typst')

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.txt') || file.endsWith('.expect.txt')) continue
  const src = fs.readFileSync(path.join(dir, file), 'utf8')
  const html = hljs.highlight(src, { language: 'typst' }).value
  const out = path.join(dir, file.replace(/\.txt$/, '.expect.txt'))
  fs.writeFileSync(out, html + '\n')
  console.log(`wrote ${path.relative(process.cwd(), out)} (${html.length} bytes)`)
}
