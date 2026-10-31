import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('inicio: muestra la biblioteca de cursos', async ({ page }) => {
  await expect(page.locator('.topbar')).toContainText('The Imperial Book');
  await expect(page.locator('.card').first()).toBeVisible();
  await expect(page.locator('.hero-stats')).toContainText('14');
});

test('catalogo: lista los tracks agrupados sin secciones de marketing', async ({ page }) => {
  await page.goto('/catalogo');

  await expect(page.locator('.topbar')).toContainText('The Imperial Book');
  await expect(page.locator('.group-title').first()).toBeVisible();
  await expect(page.locator('.card')).toHaveCount(14);
  await expect(page.locator('.hero-stats dd').nth(2)).not.toHaveText('—');
});

test('ruta: presenta los niveles como orientación, no como certificación', async ({ page }) => {
  await page.goto('/curso/javascript/overview');

  await expect(page.locator('.overview-page h1')).toContainText('fundamentos y temas avanzados');
  await expect(page.locator('.module-section')).toContainText(
    'Los niveles describen la progresión prevista; no son una evaluación ni una certificación de dominio.',
  );
  await expect(
    page.locator('.module-group .group-heading').filter({ hasText: 'Especialización (objetivo)' }),
  ).toHaveCount(1);
  await expect(page.locator('.overview-page')).not.toContainText('Experto');

  await page.goto('/curso/javascript/14');
  await expect(page.locator('.scale-label')).toContainText('Especialización (objetivo)');
  await expect(page.locator('.scale-label')).not.toContainText('Experto');
});

test('catalogo: informa si el índice de temas no está disponible', async ({ page }) => {
  let requests = 0;
  await page.route('**/content/topic-index.json', route => {
    requests += 1;
    return requests === 1
      ? route.fulfill({ status: 503, body: 'unavailable' })
      : route.continue();
  });
  await page.goto('/catalogo');

  await expect(page.getByRole('alert')).toContainText('503');
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  const index = await (await page.request.get('/content/topic-index.json')).json();
  const total = Object.values(index).flatMap(track => Object.values(track as Record<string, unknown[]>)).reduce((sum, topics) => sum + topics.length, 0);
  await expect(page.locator('.hero-stats dd').nth(2)).toHaveText(String(total));
});

test('diagramas: el módulo final de Angular no genera geometría SVG inválida', async ({ page }) => {
  await page.goto('/curso/angular/16');
  await expect(page.locator('.visual-diagram svg')).toHaveCount(4);
  await expect(page.locator('.visual-diagram [transform*="NaN"], .visual-diagram [transform*="undefined"]')).toHaveCount(0);
  await expect(page.locator('.lesson-error')).toHaveCount(0);
});

test('diagramas: renderiza Mermaid en capítulos con etiquetas complejas', async ({ page }) => {
  const chapters = [
    { track: 'android', module: 17, diagrams: 5 },
    { track: 'android', module: 18, diagrams: 4 },
    { track: 'cloud', module: 1, diagrams: 5 },
    { track: 'cloud', module: 2, diagrams: 6 },
    { track: 'cloud', module: 4, diagrams: 7 },
    { track: 'devops', module: 7, diagrams: 6 },
    { track: 'devops', module: 8, diagrams: 5 },
    { track: 'flutter', module: 5, diagrams: 3 },
    { track: 'foundations', module: 8, diagrams: 5 },
    { track: 'ios', module: 12, diagrams: 3 },
    { track: 'ios', module: 14, diagrams: 7 },
    { track: 'react', module: 6, diagrams: 3 },
    { track: 'spring-boot', module: 2, diagrams: 5 },
  ];

  for (const { track, module, diagrams } of chapters) {
    await page.goto(`/curso/${track}/${module}`);
    await expect(page.locator('.visual-diagram pre.mermaid svg')).toHaveCount(diagrams);
    await expect(page.locator('.lesson-error[role="alert"]')).toHaveCount(0);
  }
});

test('diagramas: la vista ampliada muestra el diagrama completo sin encogerlo', async ({ page }) => {
  await page.goto('/curso/angular/16');
  const figure = page.locator('.visual-diagram').nth(3);
  const topicCard = figure.locator('xpath=ancestor::section[contains(@class, "topic-card")]');
  if (!(await topicCard.getAttribute('class'))?.includes('expanded')) {
    await topicCard.locator('.topic-toggle').click();
  }
  const open = figure.getByRole('button', { name: /^Ampliar el diagrama/ });
  await open.scrollIntoViewIfNeeded();
  await open.click();
  const dialog = page.locator('dialog.diagram-dialog');
  await expect(dialog).toBeVisible();
  const natural = await dialog.locator('svg').evaluate(svg => (svg as SVGSVGElement).viewBox.baseVal.width);
  const rendered = await dialog.locator('svg').evaluate(svg => svg.getBoundingClientRect().width);
  expect(natural).toBeGreaterThan(680);
  expect(rendered).toBeGreaterThan(natural * 0.99);
  await dialog.getByRole('button', { name: 'Cerrar' }).click();
  await expect(dialog).toBeHidden();
  await expect(figure.locator('pre.mermaid svg')).toHaveCount(1);
});

test('diagramas Archify: muestra Java y Spring Boot dentro de la lección', async ({ page }) => {
  for (const path of ['/curso/java/4', '/curso/spring-boot/0']) {
    await page.goto(path);
    const figure = page.locator('.archify-visual').first();
    const topicCard = figure.locator('xpath=ancestor::section[contains(@class, "topic-card")]');
    if (!(await topicCard.getAttribute('class'))?.includes('expanded')) {
      await topicCard.locator('.topic-toggle').click();
    }
    await expect(figure).toBeVisible();
    await expect(figure.locator('iframe')).toHaveAttribute('src', /\/visuals\/temas\/.+\.html\?embed=1$/);
    await expect(figure.getByRole('link')).toHaveAttribute('target', '_blank');
    await expect(figure.frameLocator('iframe').locator('html')).toHaveAttribute('data-embed', 'true');
  }
});

test('accesibilidad y respaldo: exporta y restaura progreso desde controles etiquetados', async ({ page }) => {
  await page.goto('/catalogo');

  const exportButton = page.getByRole('button', { name: 'Descargar copia' });
  const restoreButton = page.getByRole('button', { name: 'Restaurar copia' });
  const fileInput = page.getByLabel('Seleccionar copia de progreso JSON');
  await expect(exportButton).toBeVisible();
  await expect(restoreButton).toBeVisible();
  await expect(fileInput).toBeAttached();

  const downloadPromise = page.waitForEvent('download');
  await exportButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('the-imperial-book-progreso.json');
  await expect(page.getByRole('status')).toContainText('Copia de progreso descargada.');

  await fileInput.setInputFiles({
    name: 'progreso.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      format: 'academia-floci-progress',
      version: 1,
      exportedAt: new Date().toISOString(),
      tracks: { java: { completedModules: [0], completedExercises: [] } },
    })),
  });
  await expect(page.getByRole('status')).toContainText('Progreso restaurado y aplicado');
  const javaCard = page.locator('.card').filter({
    has: page.getByRole('link', { name: 'Abrir Java: fundamentos y temas avanzados', exact: true }),
  });
  await expect(javaCard.locator('.card-bottom')).toContainText('5% marcado');
});

test('curso cloud: abre primero el mapa de ruta y después el contenido base de Floci', async ({ page }) => {
  await page.goto('/curso/cloud');

  await expect(page.locator('.overview-page')).toContainText('Cloud Local — AWS, Azure y GCP');
  await expect(page.locator('.module-row').first()).toContainText('Introducción');
  await expect(page.locator('.module-row').nth(1)).toContainText('Docker');
  await page.locator('.module-row').first().getByRole('link', { name: /Abrir módulo 1/ }).click();
  await expect(page).toHaveURL(/\/curso\/cloud\/0$/);
  await expect(page.locator('body')).toContainText('Introducción y preparación');
});

test('ruta antigua de laboratorio vuelve al inicio nuevo', async ({ page }) => {
  await page.goto('/laboratorio/floci');

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.topbar')).toContainText('The Imperial Book');
});

test('búsqueda: encuentra un tema real y navega a su fragmento', async ({ page }) => {
  await page.goto('/curso/angular/0');
  await page.getByRole('button', { name: 'Buscar cursos, módulos y temas' }).click();
  await page.getByRole('textbox', { name: 'Buscar cursos, módulos y temas' }).fill('TypeScript');
  const result = page.locator('.palette-result').first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/curso\/.+\/\d+/);
});

test('aprendizaje: presenta el proyecto integrador sin evaluación generada', async ({ page }) => {
  await page.goto('/curso/angular');
  const finalModule = await page.locator('.lesson-index-item').last().getAttribute('href');
  expect(finalModule).toBeTruthy();
  await page.goto(finalModule!);
  await expect(page.locator('.module-practice')).toHaveCount(0);
  await expect(page.locator('.module-quiz')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('XP');
  await expect(page.locator('.project-progress-card')).toContainText('Centro de control logístico');
  await expect(page.locator('.project-definition-of-done')).toBeAttached();
  await expect(page.locator('.topic-troubleshooting').first()).toBeAttached();
  await expect(page.locator('.topic-step-navigation')).toHaveCount(
    await page.locator('h3.topic-heading').count(),
  );
});

test('lector: avanza entre temas y explica términos técnicos', async ({ page }) => {
  await page.goto('/curso/angular/0');
  const navigation = page.locator('.topic-step-navigation');
  await expect(navigation).toHaveCount(4);
  await expect(navigation.locator('[data-topic-destination]').first()).toContainText('Siguiente');
  await expect(page.locator('.technical-term').first()).toHaveAttribute('aria-label', /.+: .+/);
});

test('accesibilidad: la búsqueda se puede operar con teclado', async ({ page }) => {
  await page.goto('/curso/angular/0');
  const trigger = page.getByRole('button', { name: 'Buscar cursos, módulos y temas' });
  await trigger.click();
  const input = page.getByRole('textbox', { name: 'Buscar cursos, módulos y temas' });
  await input.fill('TypeScript');
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', /palette-result-\d+/);
  await input.press('Enter');
  await expect(page).toHaveURL(/\/curso\/.+\/\d+/);
});

test('accesibilidad móvil: Escape cierra el índice y devuelve el foco', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/curso/angular/0');
  const open = page.getByRole('button', { name: 'Abrir índice del curso' });
  await open.click();
  await expect(open).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(open).toHaveAttribute('aria-expanded', 'false');
  await expect(open).toBeFocused();
});

test('lector: muestra la transferencia al proyecto y los límites editoriales', async ({ page }) => {
  await page.goto('/curso/angular/0');
  const firstTopic = page.locator('.topic-card').first();
  await expect(firstTopic.getByText('Transferencia al proyecto integrador', { exact: false })).toBeVisible();
  await expect(firstTopic).toContainText('Crea el componente standalone de tarjeta de entrega');

  await page.goto('/curso/cloud/0');
  const cloudTopic = page.locator('.topic-card').first();
  await expect(cloudTopic.getByText('Límites y decisión de uso:', { exact: true })).toBeVisible();
  await expect(cloudTopic).toContainText('Un comando interpretado por Bash');
});

test('estructura: cada Tema se muestra como una tarjeta separada, no anidado en otro', async ({ page }) => {
  // foundations/4 tuvo un bloque ``` desbalanceado que atrapaba los temas 2-4
  // dentro del tema 1. Este caso fija que sus siete temas (incluidos SQL avanzado,
  // PL/pgSQL y Excel) se ven como
  // topic-card independientes y que ninguna anida a otra.
  await page.goto('/curso/foundations/4');
  await expect(page.locator('.topic-card')).toHaveCount(7);
  await expect(page.locator('.topic-card .topic-card')).toHaveCount(0);
  await expect(page.locator('.topic-card.expanded')).toHaveCount(1);
  await expect(page.locator('.lesson-error')).toHaveCount(0);
});

test('formación: electrónica incorpora ejemplos sin prompts generados en la lectura', async ({ page }) => {
  await page.goto('/curso/foundations/12');
  await expect(page.locator('.topic-card')).toHaveCount(17);
  await expect(page.locator('.lesson-meta')).toContainText('MIT: circuitos y electrónica');
  const topic = page.locator('.topic-card').first();
  await expect(topic.locator('.topic-learning-prompts')).toHaveCount(0);
  await expect(topic.locator('[data-copy-learning-prompt]')).toHaveCount(0);
  await expect(topic).toContainText('Carga: 9.0 C');
  await expect(page.locator('.lesson-error')).toHaveCount(0);
  await topic.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `/tmp/academia-electronica-${test.info().project.name}.png` });
});

test('inicio desde cero: conduce de la página inicial a la primera sesión', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  const start = page.getByRole('link', { name: 'Empezar desde cero', exact: true });
  await expect(start).toBeVisible();
  await expect(page.locator('.starter-steps')).toContainText('Crea el archivo indicado');
  await start.click();
  await expect(page).toHaveURL(/\/curso\/foundations\/0$/);
  await expect(page.locator('.lesson h1')).toContainText('Cómo funciona tu entorno');
  await expect(page.locator('.topic-card').first()).toContainText('saludo.py');
});

test('inicio desde cero: mapa Archify y lectura responsive sin errores', async ({ page }) => {
  const errors: string[] = [];
  for (const width of [375, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.getByRole('link', { name: 'Empezar desde cero', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: /Ver el mapa de estudio/ }).click();
  const popup = await popupPromise;
  popup.on('pageerror', error => errors.push(error.message));
  await popup.waitForLoadState('domcontentloaded');
  await expect(popup).toHaveURL(/\/visuals\/recorrido-estudio\.html$/);
  await expect(popup.locator('body')).toContainText('Cómo estudiar: recorrido recomendado');
  await expect(popup.locator('svg').first()).toBeVisible();
  await popup.emulateMedia({ reducedMotion: 'reduce' });
  await popup.setViewportSize({ width: 390, height: 844 });
  expect(await popup.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const controls = await popup.locator('.diagram-nav button:visible').evaluateAll(buttons => buttons.map(button => {
    const rect = button.getBoundingClientRect();
    return { left: rect.left, right: rect.right, width: rect.width, height: rect.height };
  }));
  controls.forEach(rect => {
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(390);
    expect(rect.width).toBeGreaterThanOrEqual(44);
    expect(rect.height).toBeGreaterThanOrEqual(44);
  });
  await expect(popup.getByRole('button', { name: 'Acercar', exact: true })).toBeVisible();
  await popup.screenshot({ path: `/tmp/academia-archify-mobile-${test.info().project.name}.png` });
  expect(errors).toEqual([]);
  await popup.close();
});

test('renovación: retoma el siguiente capítulo y conserva el progreso al recargar', async ({ page }) => {
  await page.getByRole('link', { name: 'Empezar desde cero', exact: true }).click();
  await expect(page.locator('.topic-card').first()).toContainText('Hola, mundo');
  await expect(page.locator('.project-bootstrap')).toHaveCount(0);
  await page.getByRole('button', { name: 'Marcar capítulo como leído', exact: true }).click();
  await page.getByRole('link', { name: 'Catálogo', exact: true }).click();
  const resume = page.locator('.resume-list').getByRole('link').filter({ hasText: 'Fundamentos' });
  await expect(resume).toHaveAttribute('href', '/curso/foundations/1');
  await page.reload();
  await expect(resume).toHaveAttribute('href', '/curso/foundations/1');
  await resume.click();
  await expect(page).toHaveURL(/\/curso\/foundations\/1$/);
  await expect(page.locator('.lesson h1')).toContainText('Pensamiento computacional');
});

test('biblioteca: filtra por área y encuentra temas reales sin perder accesos', async ({ page }) => {
  await page.locator('.category-tabs').getByRole('button', { name: 'Aplicaciones móviles', exact: true }).click();
  await expect(page.locator('.card')).toHaveCount(4);
  const query = page.getByRole('searchbox', { name: 'Filtrar cursos y temas' });
  await query.fill('no-existe-este-curso');
  await expect(page.locator('.no-results')).toBeVisible();
  await page.getByRole('button', { name: 'Mostrar todos los cursos', exact: true }).click();
  await expect(page.locator('.card')).toHaveCount(14);
  await query.fill('Tiempo determinista');
  await expect(page.locator('.card')).toHaveCount(1);
  await expect(page.locator('.card')).toContainText('Kotlin MP');
  await page.locator('.card-topics summary').click();
  await expect(page.locator('.card-topics')).toContainText('Antes de empezar');
  await expect(page.locator('.card-topics')).toContainText('Resultado del curso');
});

test('tema: la ruta propia enfoca un solo tema y vuelve al capítulo', async ({ page }) => {
  await page.goto('/curso/angular/0/tema/2');
  const cards = page.locator('.topic-card');
  await expect(cards.nth(0)).not.toHaveClass(/expanded/);
  await expect(cards.nth(1)).toHaveClass(/expanded/);
  const banner = page.locator('.topic-focus-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Vista de un tema');

  await banner.getByRole('link', { name: 'Volver al capítulo completo' }).click();
  await expect(page).toHaveURL(/\/curso\/angular\/0$/);
});

test('tema: el enlace «Ver solo este tema» abre la ruta enfocada', async ({ page }) => {
  await page.goto('/curso/angular/0');
  await page.locator('.topic-card').nth(2).locator('.topic-focus-link').click();
  await expect(page).toHaveURL(/\/curso\/angular\/0\/tema\/3$/);
  await expect(page.locator('.topic-card').nth(2)).toHaveClass(/expanded/);
});
