#!/usr/bin/env node
/**
 * Build-time smoke test for email server routes.
 *
 * Verifies that:
 *   1. All registered email templates can be imported.
 *   2. Each template renders to HTML and plain text via @react-email/render.
 *   3. Each template has a resolvable subject.
 *   4. The three email server route modules type-check via tsc (run separately in CI).
 *
 * This script intentionally avoids touching the network, Supabase, or process.env
 * so it can run in any CI environment.
 */
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import * as React from 'react'
import { render } from '@react-email/render'

const projectRoot = process.cwd()
const registryPath = resolve(projectRoot, 'src/lib/email-templates/registry.ts')

// Use tsx loader-compatible dynamic import via bun/node --import tsx (CI invokes with tsx).
const { TEMPLATES } = await import(pathToFileURL(registryPath).href)

const names = Object.keys(TEMPLATES)
if (names.length === 0) {
  console.error('[smoke] No templates registered')
  process.exit(1)
}

let failed = 0
for (const name of names) {
  const entry = TEMPLATES[name]
  try {
    if (!entry.component) throw new Error('missing component')
    if (!entry.subject) throw new Error('missing subject')
    const data = entry.previewData ?? {}
    const el = React.createElement(entry.component, data)
    const html = await render(el)
    const text = await render(el, { plainText: true })
    const subject = typeof entry.subject === 'function' ? entry.subject(data) : entry.subject
    if (!html || html.length < 20) throw new Error('html too short')
    if (!text || text.length < 5) throw new Error('text too short')
    if (!subject || typeof subject !== 'string') throw new Error('subject not resolvable')
    console.log(`[smoke] ok  ${name}  (subject: "${subject}")`)
  } catch (err) {
    failed++
    console.error(`[smoke] FAIL ${name}:`, err instanceof Error ? err.message : err)
  }
}

if (failed > 0) {
  console.error(`[smoke] ${failed} template(s) failed`)
  process.exit(1)
}
console.log(`[smoke] all ${names.length} templates rendered successfully`)
