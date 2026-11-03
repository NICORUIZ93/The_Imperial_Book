import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Los recorridos de este archivo verifican el capítulo completo en una sola
  // columna; el modo libro (paginado y activo por defecto) tiene sus propias
  // pruebas al final.
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('academia-floci-book-mode', 'off');
  });
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
  await expect(page.getByRole('link', { name: /Consultar inventario bibliográfico provisional/ })).toBeVisible();
});

test('temario bibliográfico: separa los temas actuales de los candidatos y conserva fuentes sin rutas privadas', async ({ page }) => {
  await page.goto('/temario');

  await expect(page.getByRole('heading', { name: /Un índice de temas, no una colección de lecciones/i })).toBeVisible();
  await expect(page.locator('.curriculum-stats')).toContainText('74.189');
  await expect(page.locator('.curriculum-stats')).toContainText('73.027');
  await expect(page.locator('.curriculum-stats')).toContainText('18');
  await expect(page.locator('.curriculum-caveat')).toContainText('no se presentan como lecciones publicadas');

  await page.goto('/temario/foundations');
  await expect(page.getByRole('heading', { name: 'Fundamentos de Ingeniería de Software' })).toBeVisible();
  await expect(page.locator('.stack-detail-hero')).toContainText('2421');
  await page.getByRole('button', { name: 'Candidatos de libros' }).click();
  await expect(page.locator('.topic-list .topic-row').first()).toContainText('Candidato de libros');
  await page.locator('.source-details summary').first().click();
  await expect(page.locator('.source-details').first()).toContainText('p.');
  await expect(page.locator('body')).not.toContainText('/Volumes/');

  await page.goto('/temario/foundations');
  await page.getByRole('button', { name: 'Temas actuales' }).click();
  await page.getByRole('link', { name: 'Abrir tema actual' }).first().click();
  await expect(page).toHaveURL(/\/curso\/foundations\/0\/tema\/tema-1$/);
  await expect(page.locator('.topic-card').first()).toContainText('Del hardware al programa en ejecución');
});

test('temario Angular: incluye el curso de Udemy como fuente provisional y separada', async ({ page }) => {
  await page.goto('/temario/angular');

  const courseTitle = 'Angular Native: Crea apps nativas para Android y iOS desde cero usando Angular 22';
  await expect(page.locator('.course-source-card')).toContainText(courseTitle);
  await expect(page.locator('.course-source-card')).toContainText('no parte de cero absoluto');
  await page.locator('.course-source-card details summary').click();
  await expect(page.locator('.course-source-card')).toContainText('Row Level Security');

  await page.getByRole('button', { name: 'Temas de cursos externos' }).click();
  await expect(page.locator('.section-heading > span')).toContainText('18 resultados');
  await expect(page.locator('.topic-list .topic-row').first()).toContainText('Angular Native');
  await page.locator('.topic-list .source-details summary').first().click();
  const courseLink = page.locator('.topic-list .source-details a').first();
  await expect(courseLink).toHaveAttribute('href', /^https:\/\/www\.udemy\.com\/course\/angular-native-/);
  await expect(courseLink).not.toHaveAttribute('href', /fbclid/);
});

test('Fundamentos módulo 1: muestra los estados inválidos y bytes UTF-8 en la lección', async ({ page }) => {
  await page.goto('/curso/foundations/1');

  const topics = page.locator('.topic-card');
  await expect(topics).toHaveCount(5);
  await expect(topics.nth(0)).toContainText('Tarea 2: estado no admitido: archivada');
  await expect(topics.nth(4)).toContainText('4 bytes');
});

test('Fundamentos módulo 2: renderiza el ejemplo de identidad por id y sus resultados', async ({ page }) => {
  await page.goto('/curso/foundations/2');

  const topic = page.locator('.topic-card').first();
  await expect(page.locator('.topic-card')).toHaveCount(8);
  await expect(topic).toContainText('buscar_por_id_lista');
  await expect(topic).toContainText('llamar al dentista');
});

test('Fundamentos módulo 3: muestra HTTP, sitio accesible y servidor local seguro', async ({ page }) => {
  await page.goto('/curso/foundations/3');

  const topics = page.locator('.topic-card');
  await expect(topics).toHaveCount(5);
  await expect(topics.nth(0)).toContainText('--bind 127.0.0.1');
  await expect(topics.nth(0)).toContainText('Rutas 404 vs 500');
  await expect(topics.nth(0)).toContainText('HTTP/1.0 200 OK');

  await topics.nth(3).getByRole('button', { name: 'Abrir tema' }).click();
  await expect(topics.nth(3)).toContainText('4.5:1');
  await expect(topics.nth(4)).toContainText('Proyecto integrador');
});

test('Fundamentos módulo 4: verifica el plan del índice y los límites de la transacción', async ({ page }) => {
  await page.goto('/curso/foundations/4');

  const topics = page.locator('.topic-card');
  await expect(topics).toHaveCount(7);
  await topics.nth(2).getByRole('button', { name: 'Abrir tema' }).click();
  await expect(topics.nth(2)).toContainText('SCAN tareas');
  await expect(topics.nth(2)).toContainText('SEARCH tareas USING INDEX idx_tareas_estado');

  await topics.nth(3).getByRole('button', { name: 'Abrir tema' }).click();
  await expect(topics.nth(3)).toContainText('.rowcount');
  await expect(topics.nth(3)).toContainText('El destino no existe');
});

test('Fundamentos módulo 5: comprueba depuración, pruebas, Git y CI', async ({ page }) => {
  await page.goto('/curso/foundations/5');

  const topics = page.locator('.topic-card');
  await expect(topics).toHaveCount(4);
  await expect(topics.nth(0)).toContainText('Stack trace');

  await topics.nth(1).getByRole('button', { name: 'Abrir tema' }).click();
  await expect(topics.nth(1)).toContainText('test_contar_pendientes_bd_integracion');

  await topics.nth(2).getByRole('button', { name: 'Abrir tema' }).click();
  await expect(topics.nth(2)).toContainText('git init -b main');

  await topics.nth(3).getByRole('button', { name: 'Abrir tema' }).click();
  await expect(topics.nth(3)).toContainText('tmp_path');
  await expect(topics.nth(3)).toContainText('tareas_prueba.json');
});

test('Java módulo 0: renderiza los diagramas de tipos, flujo y fechas', async ({ page }) => {
  await page.goto('/curso/java/0');

  const topics = page.locator('.topic-card');
  await expect(topics).toHaveCount(8);
  for (const index of [3, 4, 5, 6, 7]) {
    await expect(topics.nth(index).locator('.visual-diagram pre.mermaid svg')).toHaveCount(1);
  }
  await expect(page.locator('.lesson-error[role="alert"]')).toHaveCount(0);
});

test('Java módulo 20: profundiza lambdas y conserva su evidencia observable', async ({ page }) => {
  await page.goto('/curso/java/20');

  const topics = page.locator('.topic-card');
  await expect(topics).toHaveCount(4);
  const lambda = topics.first();
  await expect(lambda).toContainText('tipo objetivo');
  await expect(lambda).toContainText('Captura y variable efectivamente final');
  await expect(lambda).toContainText('Referencias estática, ligada, no ligada y constructor');
  await expect(lambda).toContainText('la referencia a elegir es ambigua');
  await expect(lambda).toContainText('Checklist de salida');
  await expect(page.locator('.lesson-error[role="alert"]')).toHaveCount(0);
});

test('Spring Master: renderiza la recuperación idempotente de una compensación', async ({ page }) => {
  await page.goto('/curso/spring-boot/15');

  const heading = page.locator('h3.topic-heading').filter({ hasText: 'Compensación que falla: conservar trabajo pendiente' });
  await expect(heading).toHaveCount(1);
  const topic = heading.locator('xpath=ancestor::section[contains(@class, "topic-card")]');
  await expect(topic.locator('.visual-diagram pre.mermaid svg')).toHaveCount(1);
  await expect(topic).toContainText('no representa dos consumidores concurrentes');
  await expect(page.locator('.lesson-error[role="alert"]')).toHaveCount(0);
});

test('Node módulo 0: renderiza configuración explícita y eventos no durables', async ({ page }) => {
  await page.goto('/curso/node/0');

  const topics = page.locator('.topic-card');
  await expect(topics).toHaveCount(4);
  for (const index of [2, 3]) {
    await expect(topics.nth(index).locator('.visual-diagram pre.mermaid svg')).toHaveCount(1);
  }
  await expect(page.locator('.lesson-error[role="alert"]')).toHaveCount(0);
});

test('Flutter módulo 0: renderiza mixins y el flujo de Future sin confundirlo con hilos', async ({ page }) => {
  await page.goto('/curso/flutter/0');

  const topics = page.locator('.topic-card');
  await expect(topics).toHaveCount(4);
  for (const index of [1, 2]) {
    await expect(topics.nth(index).locator('.visual-diagram pre.mermaid svg')).toHaveCount(1);
  }
  await expect(topics.nth(2)).toContainText('no bloquea el isolate ni crea un hilo paralelo');
  await expect(page.locator('.lesson-error[role="alert"]')).toHaveCount(0);
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
  const eyebrow = page.locator('.lesson-eyebrow');
  await expect(eyebrow).toContainText('Especialización (objetivo)');
  await expect(eyebrow).not.toContainText('Experto');
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

test('figuras anatómicas: no generan geometría SVG inválida', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  const figures = [
    '/content/figures/event-loop-dispatcher/figure.html',
    '/content/figures/event-loop-dispatcher/figure-light.html',
    '/content/figures/outbox-transaccional/figure.html',
    '/content/figures/outbox-transaccional/figure-light.html',
  ];

  for (const figure of figures) {
    consoleErrors.length = 0;
    await page.goto(figure);
    await expect(page.locator('.iso-stage')).toBeVisible();
    await expect(page.locator('path[d*="NaN"], path[d*="undefined"], path[d*="Infinity"]')).toHaveCount(0);
    expect(consoleErrors, figure).toEqual([]);
  }
});

test('prototipo: los seis contextos muestran contenido y progreso navegable', async ({ page }) => {
  const contexts = [
    { track: 'foundations', module: 0, heading: 'El primer resultado que puedes repetir' },
    { track: 'javascript', module: 8, heading: 'De datos a una vista segura' },
    { track: 'java', module: 22, heading: 'El contrato de equals y hashCode' },
    { track: 'node', module: 12, heading: 'Arquitectura por capas' },
    { track: 'android', module: 14, heading: 'Por qué una captura visual no basta' },
    { track: 'spring-boot', module: 22, heading: 'Hexagonal: puertos' },
  ];

  for (const context of contexts) {
    await page.goto(`/curso/${context.track}/${context.module}`);
    const topic = page.locator('.topic-card').first();
    await expect(topic).toContainText(context.heading);
    await expect(topic.locator('pre:not(.mermaid)').first()).toBeVisible();
    await expect(topic.locator('button.topic-complete[data-topic-complete]')).toHaveAttribute('aria-pressed', 'false');
    await expect(topic.locator('.topic-step-navigation')).toBeVisible();
  }
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
    { track: 'devops', module: 19, diagrams: 4 },
    { track: 'devops', module: 20, diagrams: 4 },
    { track: 'devops', module: 21, diagrams: 4 },
    { track: 'devops', module: 22, diagrams: 4 },
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
  // El porcentaje se deriva del número real de módulos de la ruta, no de una
  // cifra fija que envejezca cuando el track crece.
  const meta = await javaCard.locator('.card-meta').innerText();
  const totalModules = Number(meta.match(/(\d+) módulos/)?.[1]);
  expect(totalModules).toBeGreaterThan(0);
  await expect(javaCard.locator('.card-bottom')).toContainText(`${Math.round(100 / totalModules)}% marcado`);
});

test('curso cloud: abre primero el mapa de ruta y después el contenido base de Floci', async ({ page }) => {
  await page.goto('/curso/cloud');

  await expect(page.locator('.overview-page')).toContainText('Cloud Local — AWS, Azure y GCP');
  await expect(page.locator('.module-row').first()).toContainText('Introducción');
  await expect(page.locator('.module-row').nth(1)).toContainText('Docker');
  await page.locator('.module-row').first().getByRole('link', { name: /Abrir módulo 0/ }).click();
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
  const third = page.locator('.topic-card').nth(2);
  await third.locator('.topic-toggle').click();
  await third.locator('.topic-focus-link').click();
  await expect(page).toHaveURL(/\/curso\/angular\/0\/tema\/3$/);
  await expect(page.locator('.topic-card').nth(2)).toHaveClass(/expanded/);
});

test('lector: marca un tema como leído y lo conserva al recargar', async ({ page }) => {
  await page.goto('/curso/angular/0');
  const button = page.locator('.topic-card').first().locator('.topic-complete');
  const stripCount = page.locator('.chapter-topic-strip-heading small');

  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(stripCount).toContainText('0 leídos');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.chapter-topic-strip-list a.done')).toHaveCount(1);
  await expect(stripCount).toContainText('1 leídos');

  await page.reload();
  await expect(page.locator('.topic-card').first().locator('.topic-complete')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.chapter-topic-strip-heading small')).toContainText('1 leídos');
});

test('lector: el código largo se ajusta dentro del bloque', async ({ page }) => {
  await page.goto('/curso/spring-boot/16');
  const example = page.locator('.lesson-markdown .code-example').first();
  await example.waitFor();
  const toggle = example.locator('[data-wrap-code]');
  const pre = example.locator('pre');
  const narrow = (page.viewportSize()?.width ?? 0) <= 720;

  await expect(toggle).toHaveAttribute('aria-pressed', narrow ? 'true' : 'false');
  if (narrow) {
    await expect(example).toHaveClass(/wrap-lines/);
  } else {
    await expect(example).not.toHaveClass(/wrap-lines/);
    await toggle.click();
  }

  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(await pre.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
});

test('lector: j y k cambian de capítulo y no reaccionan al escribir', async ({ page }) => {
  await page.goto('/curso/angular/0');
  await expect(page.locator('.topic-step-navigation').first()).toBeVisible();

  await page.keyboard.press('j');
  await expect(page).toHaveURL(/\/curso\/angular\/1$/);
  await expect(page.locator('.lesson h1')).toBeVisible();
  await page.keyboard.press('k');
  await expect(page).toHaveURL(/\/curso\/angular\/0$/);
  await expect(page.locator('.lesson h1')).toBeVisible();

  await page.getByRole('button', { name: 'Buscar cursos, módulos y temas' }).click();
  const search = page.getByRole('textbox', { name: 'Buscar cursos, módulos y temas' });
  await search.fill('componente');
  await page.keyboard.press('j');
  await expect(page).toHaveURL(/\/curso\/angular\/0$/);
  await expect(search).toHaveValue('componentej');
});

test('lector: el último tema continúa al capítulo siguiente', async ({ page }) => {
  await page.goto('/curso/angular/0');
  const lastTopic = page.locator('.topic-card').last();
  const nextChapter = lastTopic.locator('[data-next-module]');

  await expect(nextChapter).toHaveAttribute('data-next-module', '1');
  await lastTopic.locator('.topic-toggle').click();
  await nextChapter.click();
  await expect(page).toHaveURL(/\/curso\/angular\/1$/);
  await expect(page.locator('.lesson h1')).toBeVisible();
});

test('lector: enlaza el tema con la práctica del capítulo cuando existe', async ({ page }) => {
  await page.goto('/curso/javascript/6');
  const practiceLink = page.locator('[data-practice-link]').first();

  await expect(practiceLink).toBeVisible();
  await practiceLink.click();
  await expect(page).toHaveURL(/#practica-del-capitulo$/);
  await expect(page.locator('#practica-del-capitulo')).toBeInViewport();
});

// --- Modo libro (paginado, activo por defecto) -------------------------------
// El beforeEach desactiva el modo libro para el resto del archivo; estas
// pruebas lo activan y verifican la paginación editorial.

async function enableBookMode(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => localStorage.setItem('academia-floci-book-mode', 'on'));
}

test('modo libro: portada, temas y cierre conservan todo el capítulo', async ({ page }) => {
  await enableBookMode(page);
  await page.goto('/curso/angular/0');

  const pagebar = page.locator('.book-pagebar');
  await expect(pagebar).toBeVisible();
  await expect(pagebar).toContainText('Portada');
  await expect(page.locator('.lesson-hero')).toBeVisible();
  const strip = page.locator('.chapter-topic-strip-list a');
  await expect(strip).toHaveCount(4);
  await expect(page.locator('.topic-card').first()).toBeHidden();

  const topicCount = await strip.count();
  await expect(page.locator('.book-page-select option')).toHaveCount(topicCount + 2);

  await page.locator('.chapter-topic-strip-list a').first().click();
  await expect(page).toHaveURL(/pagina=tema-1/);
  await expect(page.locator('.book-topic-head h2')).toBeVisible();
  await expect(page.locator('.topic-card').first()).toBeVisible();
  await expect(page.locator('.topic-card').nth(1)).toBeHidden();

  await page.getByRole('button', { name: 'Página siguiente' }).click();
  await expect(page).toHaveURL(/pagina=tema-2/);
  await expect(page.locator('.topic-card').nth(1)).toBeVisible();
  await expect(page.locator('.topic-card').first()).toBeHidden();

  await page.locator('.book-page-select').selectOption('cierre');
  await expect(page).toHaveURL(/pagina=cierre/);
  await expect(page.locator('.book-back-cover')).toBeVisible();
  await expect(page.locator('.project-progress-card')).toBeVisible();
  await expect(page.locator('.book-back-cover .book-summary-list li')).toHaveCount(topicCount);

  // La dirección de página es la canónica: recargar conserva el cierre.
  await page.reload();
  await expect(page.locator('.book-back-cover')).toBeVisible();

  await page.locator('.book-page-select').selectOption('portada');
  await expect(page).toHaveURL(/pagina=portada/);
  await expect(page.locator('.lesson-hero')).toBeVisible();
  await expect(page.locator('.book-topic-head')).toHaveCount(0);
});

test('modo libro: el objetivo viene del texto ya escrito y las flechas cambian de página', async ({ page }) => {
  await enableBookMode(page);
  await page.goto('/curso/angular/1');
  await expect(page.locator('.chapter-topic-strip-list a').first()).toBeVisible();

  await page.locator('.chapter-topic-strip-list a').first().click();
  const objective = page.locator('.book-topic-objective');
  await expect(objective).toContainText('Al terminar podrás');
  expect((await objective.innerText()).length).toBeGreaterThan(40);
  // Sin invención: el texto mostrado proviene del párrafo que ya escribió el
  // autor (oculto en la página para no repetirlo en la tarjeta del tema).
  const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
  const shown = normalize((await objective.innerText()).replace(/^al (?:terminar|finalizar) podrás/i, ''));
  const source = page.locator('.topic-card').first().locator('.book-objective-source');
  await expect(source).toHaveCount(1);
  expect(normalize((await source.textContent()) ?? '')).toContain(shown);

  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/pagina=tema-2/);
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/pagina=tema-1/);
});

test('modo libro: conserva el objetivo escrito por el autor sin reescribirlo', async ({ page }) => {
  await enableBookMode(page);
  await page.goto('/curso/java/12?pagina=tema-1');

  const objective = page.locator('.book-topic-objective').first();
  await expect(objective).toBeVisible();
  // La voz vigente del autor se conserva: el lector separa la etiqueta, pero
  // el contenido visible sigue siendo exactamente el del párrafo fuente.
  await expect(objective).toContainText('Al terminar podrás');
  await expect(objective).toContainText('construir un objeto inmutable');
  const source = page.locator('p.book-objective-source').first();
  await expect(source).toBeHidden();
  const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
  const shown = normalize((await objective.innerText()).replace(/^Al terminar podrás/i, ''));
  expect(normalize((await source.textContent()) ?? '')).toContain(shown);
});

test('modo libro: salir del modo devuelve el capítulo completo y persiste la elección', async ({ page }) => {
  await enableBookMode(page);
  await page.goto('/curso/angular/0');
  await page.locator('.book-pagebar .book-exit').click();

  await expect(page.locator('.book-pagebar')).toHaveCount(0);
  await expect(page.locator('.topic-card').nth(1)).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('academia-floci-book-mode'))).toBe('off');

  await page.reload();
  await expect(page.locator('.book-pagebar')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Leer como libro' })).toBeVisible();
});

test('modo libro: oculta el objetivo sin ocultar el prerrequisito que lo acompaña', async ({ page }) => {
  await enableBookMode(page);
  await page.goto('/curso/spring-boot/15?pagina=tema-7');

  const objective = page.locator('.book-topic-objective').first();
  await expect(objective).toBeVisible();
  await expect(objective).toContainText('recuperar una compensación');
  // El tema escribe objetivo y prerrequisitos en el mismo párrafo: la cabecera
  // repite el objetivo, pero el resto del párrafo debe seguir legible.
  await expect(page.locator('p.book-objective-source').first()).toBeHidden();
  await expect(page.locator('p:visible', { hasText: /Prerrequisitos?:/ }).first()).toBeVisible();
});
