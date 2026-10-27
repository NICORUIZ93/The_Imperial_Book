#!/usr/bin/env node
/**
 * Barrido automatizado de la app The Imperial Book: visita cada página de módulo
 * (una por trackId/moduleId, derivadas de topic-index.json) y revisa, para
 * cada tema dentro de ella, señales de fidelidad de renderizado y errores de
 * flujo que un audit estático sobre el Markdown no puede ver: errores de
 * consola, estados de error visibles, enlaces internos rotos, bloques de
 * código o diagramas que no llegaron a renderizar, y presencia de las
 * secciones que lesson-viewer.ts genera por tema.
 *
 * Esto NO vuelve a evaluar los 9 criterios editoriales de
 * docs/editorial-contract.md (eso ya lo hace scripts/audit_topic_learning_quality.py
 * sobre el Markdown). Este barrido mide si lo que el Markdown promete se ve
 * igual una vez que Angular lo renderiza, y si la navegación entre partes no
 * se rompe.
 *
 * Uso (desde la raíz del repo, con `npm start` corriendo en web/):
 *   node .claude/skills/academy-flow-inspector/scripts/sweep_topics.cjs \
 *     [--base-url=http://127.0.0.1:4201] [--tracks=foundations,devops] \
 *     [--concurrency=6] [--out=docs/app-flow-inspection.json]
 *
 * Requiere el paquete `playwright` ya instalado en web/node_modules. Se
 * resuelve con una ruta absoluta en vez de un `require('playwright')` normal
 * porque este script vive fuera del árbol de web/ y la resolución de módulos
 * de Node no sube desde ahí hasta web/node_modules.
 */
const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.join(__dirname, '..', '..', '..', '..');
const { chromium } = require(path.join(ROOT, 'web', 'node_modules', 'playwright'));

function parseArgs(argv) {
  const args = { baseUrl: 'http://127.0.0.1:4201', concurrency: 6, out: 'docs/app-flow-inspection.json' };
  for (const raw of argv) {
    const [key, value] = raw.replace(/^--/, '').split('=');
    if (key === 'base-url') args.baseUrl = value;
    else if (key === 'tracks') args.tracks = value.split(',').map(t => t.trim()).filter(Boolean);
    else if (key === 'concurrency') args.concurrency = Number(value) || 6;
    else if (key === 'out') args.out = value;
  }
  return args;
}

function loadModulePages(tracksFilter) {
  const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'web/public/content/topic-index.json'), 'utf8'));
  const pages = [];
  for (const [trackId, modules] of Object.entries(index)) {
    if (tracksFilter && !tracksFilter.includes(trackId)) continue;
    for (const [moduleId, topics] of Object.entries(modules)) {
      pages.push({ trackId, moduleId, expectedTopicCount: topics.length, expectedTitles: topics.map(t => t.title) });
    }
  }
  return pages;
}

async function inspectPage(browser, baseUrl, target) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(err.message));

  const url = `${baseUrl}/curso/${target.trackId}/${target.moduleId}`;
  const findings = [];
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    if (!response || response.status() >= 400) {
      findings.push({ severity: 'error', segment: 'navegación', message: `HTTP ${response ? response.status() : 'sin respuesta'} al abrir ${url}` });
    }
  } catch (err) {
    findings.push({ severity: 'error', segment: 'navegación', message: `No cargó ${url}: ${err.message}` });
    await context.close();
    return { ...target, url, findings, consoleErrors, pageErrors, topics: [] };
  }

  const errorAlert = page.locator('.lesson-error[role="alert"]').first();
  if (await errorAlert.count() > 0) {
    findings.push({ severity: 'error', segment: 'carga-contenido', message: `Estado de error visible: ${(await errorAlert.textContent())?.trim()}` });
  }

  const cards = page.locator('.topic-card');
  const cardCount = await cards.count();
  if (cardCount !== target.expectedTopicCount) {
    findings.push({
      severity: 'error',
      segment: 'estructura',
      message: `Se esperaban ${target.expectedTopicCount} temas (topic-index.json) y el DOM tiene ${cardCount} .topic-card`,
    });
  }

  const topics = await cards.evaluateAll(cards => cards.map(card => {
    const title = card.querySelector('.topic-heading')?.textContent?.trim() || '(sin título)';
    const hasCode = !!card.querySelector('pre:not(.mermaid)');
    const mermaidBlocks = card.querySelectorAll('pre.mermaid').length;
    const mermaidRendered = card.querySelectorAll('pre.mermaid svg').length;
    const hasPrompts = !!card.querySelector('.topic-learning-prompts');
    const promptTextareasEmpty = Array.from(card.querySelectorAll('.topic-learning-prompts textarea')).some(ta => !ta.value || ta.value.trim().length < 20);
    const internalLinks = Array.from(card.querySelectorAll('a[href]'))
      .map(a => a.getAttribute('href'))
      .filter(href => href && !href.startsWith('http') && !href.startsWith('#'));
    return { title, hasCode, mermaidBlocks, mermaidRendered, hasPrompts, promptTextareasEmpty, internalLinks };
  }));

  for (const topic of topics) {
    if (topic.mermaidBlocks > 0 && topic.mermaidRendered < topic.mermaidBlocks) {
      findings.push({ severity: 'error', segment: 'renderizado-diagrama', topic: topic.title, message: `${topic.mermaidBlocks - topic.mermaidRendered} de ${topic.mermaidBlocks} diagrama(s) mermaid no renderizó como <svg>` });
    }
    if (!topic.hasPrompts) {
      findings.push({ severity: 'warning', segment: 'prompts-estudio', topic: topic.title, message: 'No se encontró el bloque .topic-learning-prompts generado por lesson-viewer.ts' });
    } else if (topic.promptTextareasEmpty) {
      findings.push({ severity: 'warning', segment: 'prompts-estudio', topic: topic.title, message: 'Algún textarea de prompt quedó vacío o con menos de 20 caracteres' });
    }
  }

  const allInternalLinks = new Set();
  for (const topic of topics) for (const href of topic.internalLinks) allInternalLinks.add(href);
  for (const href of allInternalLinks) {
    try {
      const resolved = new URL(href, url).toString();
      const linkResponse = await page.request.get(resolved, { timeout: 8000 }).catch(() => null);
      if (!linkResponse || linkResponse.status() >= 400) {
        findings.push({ severity: 'error', segment: 'enlace-roto', message: `Enlace interno roto en ${target.trackId}/${target.moduleId}: ${href} -> ${linkResponse ? linkResponse.status() : 'sin respuesta'}` });
      }
    } catch {
      findings.push({ severity: 'warning', segment: 'enlace-roto', message: `Enlace interno con formato inesperado en ${target.trackId}/${target.moduleId}: ${href}` });
    }
  }

  if (consoleErrors.length) {
    findings.push({ severity: 'error', segment: 'consola', message: `${consoleErrors.length} error(es) de consola: ${consoleErrors.slice(0, 3).join(' | ')}` });
  }
  if (pageErrors.length) {
    findings.push({ severity: 'error', segment: 'excepción-js', message: `${pageErrors.length} excepción(es) no capturada(s): ${pageErrors.slice(0, 3).join(' | ')}` });
  }

  await context.close();
  return { ...target, url, findings, consoleErrors, pageErrors, topics };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  try {
    const probe = await fetch(args.baseUrl, { method: 'GET' });
    if (!probe.ok) throw new Error(`status ${probe.status}`);
  } catch (err) {
    console.error(`No se pudo contactar ${args.baseUrl} (${err.message}).`);
    console.error('Arranca el servidor primero: cd web && npm start   (o ajusta --base-url)');
    process.exit(2);
  }

  const pages = loadModulePages(args.tracks);
  console.log(`Barrido de ${pages.length} páginas de módulo (${args.tracks ? args.tracks.join(', ') : 'todas las rutas'})...`);

  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
  const results = [];
  let cursor = 0;
  async function worker() {
    while (cursor < pages.length) {
      const target = pages[cursor++];
      const result = await inspectPage(browser, args.baseUrl, target);
      results.push(result);
      const bad = result.findings.filter(f => f.severity === 'error').length;
      console.log(`[${results.length}/${pages.length}] ${target.trackId}/${target.moduleId}: ${bad ? bad + ' error(es)' : 'sin hallazgos de error'}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(args.concurrency, pages.length) }, worker));
  await browser.close();

  results.sort((a, b) => a.trackId.localeCompare(b.trackId) || Number(a.moduleId) - Number(b.moduleId));
  const totalFindings = results.flatMap(r => r.findings);
  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: args.baseUrl,
    pagesInspected: results.length,
    errors: totalFindings.filter(f => f.severity === 'error').length,
    warnings: totalFindings.filter(f => f.severity === 'warning').length,
    scopeNote: 'Este barrido verifica renderizado y flujo, no sustituye la auditoría editorial de scripts/audit_topic_learning_quality.py sobre el Markdown.',
  };

  const outPath = path.resolve(ROOT, args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ summary, pages: results }, null, 2) + '\n', 'utf8');

  console.log(`\nResumen: ${summary.pagesInspected} páginas, ${summary.errors} error(es), ${summary.warnings} advertencia(s).`);
  console.log(`Reporte completo: ${args.out}`);
  process.exit(summary.errors > 0 ? 1 : 0);
}

main();
