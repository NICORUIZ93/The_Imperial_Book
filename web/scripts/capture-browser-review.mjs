#!/usr/bin/env node
/**
 * Barrido estructural de navegador sobre todas las páginas de módulo.
 * Requiere un servidor ya levantado (npm start -- --port 4201) y usa
 * PLAYWRIGHT_CHANNEL=chrome para el Chrome instalado.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const index = JSON.parse(fs.readFileSync(path.join(webRoot, 'public/content/topic-index.json'), 'utf8'));
const output = path.join(repoRoot, 'docs/browser-course-review.json');
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4201';
const channel = process.env.PLAYWRIGHT_CHANNEL || undefined;

const routes = Object.keys(index)
  .sort()
  .flatMap(track =>
    Object.keys(index[track])
      .sort((a, b) => Number(a) - Number(b))
      .map(module => ({ track, module, expected: index[track][module].length })),
  );

const inventoryTopics = routes.reduce((sum, route) => sum + route.expected, 0);
const browser = await chromium.launch({ channel });
const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const page = await context.newPage();

const results = [];
const findings = [];
let coveredTopics = 0;

for (const [position, route] of routes.entries()) {
  const pageErrors = [];
  const onPageError = error => pageErrors.push(String(error?.message || error));
  page.on('pageerror', onPageError);

  const row = {
    track: route.track,
    module: route.module,
    count: route.expected,
    renderedTopics: 0,
    errors: [],
    invalidGeometry: 0,
    pageErrors,
    horizontalOverflow: false,
    missingDiagrams: 0,
  };

  try {
    const response = await page.goto(`${baseURL}/curso/${route.track}/${route.module}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    if (!response || !response.ok()) {
      row.errors.push(`HTTP ${response?.status() ?? 'sin respuesta'}`);
    } else {
      await page.waitForSelector('.lesson-hero', { timeout: 20_000 });
      await page.waitForFunction(
        expected => document.querySelectorAll('.session-card').length >= expected,
        route.expected,
        { timeout: 20_000 },
      ).catch(() => {});
      await page.waitForFunction(
        () => [...document.querySelectorAll('pre.mermaid')].every(node => node.querySelector('svg')),
        null,
        { timeout: 5_000 },
      ).catch(() => {});
      await page.waitForTimeout(150);

      const metrics = await page.evaluate(() => {
        const diagrams = [...document.querySelectorAll('pre.mermaid')];
        return {
          renderedTopics: document.querySelectorAll('.session-card').length,
          invalidGeometry: document.querySelectorAll(
            '.visual-diagram [transform*="NaN"], .visual-diagram [transform*="undefined"], .visual-diagram [d*="NaN"]',
          ).length,
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          missingDiagrams: diagrams.filter(node => !node.querySelector('svg')).length,
          lessonErrors: [...document.querySelectorAll('.lesson-error')].map(node => node.textContent?.trim() || ''),
        };
      });
      row.renderedTopics = metrics.renderedTopics;
      row.invalidGeometry = metrics.invalidGeometry;
      row.horizontalOverflow = metrics.horizontalOverflow;
      row.missingDiagrams = metrics.missingDiagrams;
      for (const message of metrics.lessonErrors) if (message) row.errors.push(message);
      if (metrics.renderedTopics !== route.expected) {
        row.errors.push(`fichas renderizadas ${metrics.renderedTopics}/${route.expected}`);
      }
    }
  } catch (error) {
    row.errors.push(String(error?.message || error).split('\n')[0]);
  } finally {
    page.off('pageerror', onPageError);
  }

  coveredTopics += row.renderedTopics;
  for (const error of row.errors) findings.push({ track: route.track, module: route.module, kind: 'render', detail: error });
  for (const error of row.pageErrors) findings.push({ track: route.track, module: route.module, kind: 'page-error', detail: error });
  if (row.invalidGeometry) findings.push({ track: route.track, module: route.module, kind: 'geometry', detail: row.invalidGeometry });
  if (row.horizontalOverflow) findings.push({ track: route.track, module: route.module, kind: 'overflow', detail: 'desborde horizontal' });
  if (row.missingDiagrams) findings.push({ track: route.track, module: route.module, kind: 'mermaid', detail: row.missingDiagrams });
  results.push(row);

  if ((position + 1) % 25 === 0 || position + 1 === routes.length) {
    console.log(`${position + 1}/${routes.length} páginas · ${coveredTopics} temas cubiertos · ${findings.length} hallazgos`);
  }
}

const report = {
  scope:
    'Renderizado estructural de todas las páginas; no ejecuta los ejercicios ni acredita calidad pedagógica.',
  generatedAt: new Date().toISOString(),
  baseUrl: baseURL,
  viewport: { width: 1366, height: 900 },
  pages: routes.length,
  topics: coveredTopics,
  coveredTopics,
  inventoryTopics,
  findings,
  results,
};

await browser.close();
fs.writeFileSync(output, `${JSON.stringify(report, null, 1)}\n`, 'utf8');
console.log(`Snapshot: ${output}`);
console.log(`Cobertura: ${coveredTopics}/${inventoryTopics} temas en ${routes.length} páginas; ${findings.length} hallazgos.`);

if (coveredTopics !== inventoryTopics) {
  console.error('Cobertura incompleta: el barrido no renderizó todos los temas del inventario.');
  process.exitCode = 1;
}
