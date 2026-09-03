import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import ts from 'typescript'

const root = process.cwd()
const outputDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tooldur-seo-audit-'))
const require = createRequire(import.meta.url)
const errors = []
const warnings = []

function error(message) { errors.push(message) }
function warn(message) { warnings.push(message) }

function compile(sourcePath, outputName) {
  const source = fs.readFileSync(path.join(root, sourcePath), 'utf8')
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: sourcePath,
    reportDiagnostics: true,
  })
  const diagnostics = (result.diagnostics || []).filter((item) => item.category === ts.DiagnosticCategory.Error)
  if (diagnostics.length) throw new Error(`Could not transpile ${sourcePath}`)
  const outputPath = path.join(outputDirectory, outputName)
  fs.writeFileSync(outputPath, result.outputText)
  return outputPath
}

function duplicates(values) {
  const seen = new Set()
  const found = new Set()
  for (const value of values) {
    if (seen.has(value)) found.add(value)
    seen.add(value)
  }
  return [...found]
}

try {
  const toolsPath = compile('src/data/tools.ts', 'tools.js')
  const seoFocusPath = compile('src/lib/seoFocus.ts', 'seoFocus.js')
  const { tools, categories } = require(toolsPath)
  const {
    NON_INDEXABLE_CATEGORY_IDS,
    NON_INDEXABLE_TOOL_SLUGS,
    isIndexableTool,
    isIndexableCategory,
  } = require(seoFocusPath)

  for (const value of duplicates(categories.map((item) => item.id))) error(`Duplicate category id: ${value}`)
  for (const value of duplicates(categories.map((item) => item.slug))) error(`Duplicate category slug: ${value}`)
  for (const value of duplicates(tools.map((item) => item.id))) error(`Duplicate tool id: ${value}`)
  for (const value of duplicates(tools.map((item) => item.slug))) error(`Duplicate tool slug: ${value}`)
  for (const value of duplicates(tools.map((item) => item.name.toLocaleLowerCase('tr-TR')))) error(`Duplicate tool name: ${value}`)

  const categoryIds = new Set(categories.map((item) => item.id))
  const toolSlugs = new Set(tools.map((item) => item.slug))
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

  for (const category of categories) {
    if (!slugPattern.test(category.slug)) error(`Invalid category slug: ${category.slug}`)
    if (!String(category.description || '').trim()) error(`Category has no description: ${category.id}`)
  }

  for (const tool of tools) {
    if (!slugPattern.test(tool.slug)) error(`Invalid tool slug: ${tool.slug}`)
    if (!categoryIds.has(tool.category)) error(`${tool.slug}: unknown category ${tool.category}`)
    if (!String(tool.description || '').trim()) error(`${tool.slug}: missing description`)
    else if (tool.description.trim().length < 50 && isIndexableTool(tool)) warn(`${tool.slug}: short indexable description (${tool.description.trim().length} chars)`)

    if (NON_INDEXABLE_CATEGORY_IDS.has(tool.category) && isIndexableTool(tool)) {
      error(`${tool.slug}: tool in non-indexable category is unexpectedly indexable`)
    }
    if (NON_INDEXABLE_TOOL_SLUGS.has(tool.slug) && isIndexableTool(tool)) {
      error(`${tool.slug}: explicitly non-indexable tool is unexpectedly indexable`)
    }
  }

  for (const slug of NON_INDEXABLE_TOOL_SLUGS) {
    if (!toolSlugs.has(slug)) warn(`SEO focus list references a tool slug not present in registry: ${slug}`)
  }

  for (const categoryId of NON_INDEXABLE_CATEGORY_IDS) {
    if (!categoryIds.has(categoryId)) warn(`SEO focus list references a category id not present in registry: ${categoryId}`)
  }

  for (const category of categories) {
    const categoryTools = tools.filter((tool) => tool.category === category.id)
    if (!categoryTools.length) warn(`Category has no tools: ${category.id}`)
    if (isIndexableCategory(category)) {
      const indexableCount = categoryTools.filter(isIndexableTool).length
      if (!indexableCount) error(`Indexable category has no indexable tools: ${category.id}`)
    }
  }

  const indexableTools = tools.filter(isIndexableTool)
  const indexableCategories = categories.filter(isIndexableCategory)
  if (indexableTools.length < 20) error(`Indexable tool count unexpectedly low: ${indexableTools.length}`)
  if (indexableCategories.length < 4) error(`Indexable category count unexpectedly low: ${indexableCategories.length}`)

  for (const message of warnings) console.warn(`[Tooldur SEO warning] ${message}`)
  if (errors.length) {
    for (const message of errors) console.error(`[Tooldur SEO error] ${message}`)
    console.error(`Tooldur SEO data audit failed with ${errors.length} error(s), ${warnings.length} warning(s).`)
    process.exitCode = 1
  } else {
    console.log(`Tooldur SEO data audit passed: ${tools.length} tools, ${indexableTools.length} indexable tools, ${categories.length} categories, ${warnings.length} warning(s).`)
  }
} finally {
  fs.rmSync(outputDirectory, { recursive: true, force: true })
}
