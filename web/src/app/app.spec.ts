import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { CourseCatalogComponent } from './catalog/course-catalog';
import { ContentService } from './content.service';
import { TRACKS } from './course-data';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the library catalog at the root route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', CourseCatalogComponent);
    harness.detectChanges();
    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('The Imperial Book');
    expect(text).toContain('Academia técnica en español');
    expect(TRACKS).toHaveLength(14);
    expect(harness.routeNativeElement?.querySelectorAll('.card').length).toBeGreaterThanOrEqual(14);
    expect(harness.routeNativeElement?.querySelectorAll('.card-icon img').length).toBeGreaterThanOrEqual(12);
    expect(text).toContain('Fundamentos de Ingeniería de Software');
    expect(text).toContain('Cloud Local — AWS, Azure y GCP');
    expect(text).toContain('RutaFlow — Proyecto integrador logístico');
  });

  it('renders a clean educational lesson with progressive topics', async () => {
    const markdown = `# título repetido

## Aprende construyendo

### Tema 1: Un concepto verificable

**Conceptos clave:** entrada, transformación y salida.

**Analogía:** una receta reproducible.

**¿Por qué es importante?** permite explicar el resultado.

La explicación detallada continúa después del ejemplo ejecutable.

\`\`\`ts
const answer = 42;
\`\`\`

### Tema 2: Una decisión verificable

**Conceptos clave:** contexto, alternativas y consecuencias.

**Analogía:** elegir una ruta con restricciones explícitas.

**¿Por qué es importante?** permite justificar una elección sin inventar código.

## Laboratorio práctico

Construye y verifica el ejemplo.

#### Ejercicio verificable 1

¿Qué valor devuelve el ejemplo?

**Respuesta esperada:** 42|cuarenta y dos`;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(input => {
      const url = String(input);
      return Promise.resolve(url.includes('topic-index.json')
        ? new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
        : new Response(markdown, { status: 200 }));
    });

    try {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/foundations/0');
      await harness.fixture.whenStable();
      harness.detectChanges();
      await harness.fixture.whenStable();
      harness.detectChanges();

      const page = harness.fixture.nativeElement as HTMLElement;
      const text = page.textContent ?? '';
      expect(fetchSpy).toHaveBeenCalled();
      expect(text).not.toContain('XP');
      expect(text).not.toContain('Racha');
      expect(page.querySelector('.lesson-markdown')).toBeTruthy();
      expect(page.querySelector('.build-method')).toBeFalsy();
      expect(page.querySelectorAll('.implementation-guide')).toHaveLength(0);
      expect(page.querySelector('.learning-contract')).toBeFalsy();
      expect(page.querySelectorAll('.topic-card.expanded')).toHaveLength(1);
      expect(text).toContain('Aprende construyendo');
      expect(text).not.toContain('Contenido teórico');
      expect(page.querySelector('.topic-practice')).toBeFalsy();
      const firstTopicBody = page.querySelector('.topic-card.expanded > .topic-body');
      const firstCode = firstTopicBody?.querySelector('.code-example');
      const detailedExplanation = Array.from(firstTopicBody?.children ?? []).find(element => element.textContent?.includes('explicación detallada'));
      expect(firstCode && detailedExplanation).toBeTruthy();
      // El orden puede variar según el formato editorial; ambos bloques deben existir.
      expect(firstTopicBody?.contains(firstCode!)).toBe(true);
      expect(firstTopicBody?.contains(detailedExplanation!)).toBe(true);
      const secondTopicToggle = page.querySelectorAll<HTMLButtonElement>('.topic-toggle')[1];
      expect(secondTopicToggle?.getAttribute('aria-expanded')).toBe('false');
      secondTopicToggle?.click();
      expect(secondTopicToggle?.getAttribute('aria-expanded')).toBe('true');
      expect(text).toContain('Guía oficial');
      expect(page.querySelector('.official-source a')).toBeTruthy();
      expect(page.querySelector('.lesson-toc')).toBeFalsy();
      expect(page.querySelector('.module-checkpoint')).toBeFalsy();
      expect(page.querySelector('.module-lab-link')).toBeFalsy();
      expect(page.querySelector('.code-example .window-controls')).toBeFalsy();
      expect(page.querySelector('.code-example .code-example-label')?.textContent).toContain('TypeScript');
      expect(text).not.toContain('1 línea');
      const wrapCode = page.querySelector<HTMLButtonElement>('[data-wrap-code]');
      expect(wrapCode?.getAttribute('aria-pressed')).toBe('false');
      wrapCode?.click();
      expect(page.querySelector('.code-example.wrap-lines')).toBeTruthy();
      expect(wrapCode?.getAttribute('aria-pressed')).toBe('true');
      expect(text).not.toContain('Práctica opcional');
      expect(text).not.toContain('Ejercicios de evaluación');
      expect(page.querySelector('.module-practice')).toBeFalsy();
      expect(page.querySelector('.module-quiz')).toBeFalsy();
      const exercise = page.querySelector<HTMLElement>('.verifiable-exercise');
      const exerciseInput = exercise?.querySelector<HTMLInputElement>('input');
      const verifyExercise = exercise?.querySelector<HTMLButtonElement>('[data-verify-exercise]');
      expect(exercise && exerciseInput && verifyExercise).toBeTruthy();
      exerciseInput!.value = '42';
      verifyExercise!.click();
      expect(exercise?.querySelector('.exercise-feedback.correct')?.textContent).toContain('Correcto');
      expect(verifyExercise?.disabled).toBe(true);
      expect(page.querySelectorAll('.topic-troubleshooting')).toHaveLength(0);
      expect(page.querySelector('.topic-learning-prompts')).toBeFalsy();
      expect(page.querySelector('[data-copy-learning-prompt]')).toBeFalsy();
      expect(page.querySelectorAll('.topic-step-navigation')).toHaveLength(2);
      expect(page.querySelector('.topic-step-navigation')?.textContent).toContain('Tema 1 de 2');
      expect(text).not.toContain('Errores comunes y cómo diagnosticarlos');
      // Fundamentos enseña su preparación en el Markdown, sin anteponer otro entorno.
      expect(page.querySelector('.project-bootstrap')).toBeFalsy();
      expect(page.querySelector('.lesson-resources')).toBeFalsy();
    } finally {
      fetchSpy.mockRestore();
    }
  });
  it.each(['success', 'error'])('ignores a stale lesson %s after navigation', async outcome => {
    let resolveOld!: (html: string) => void;
    let rejectOld!: (error: Error) => void;
    const oldLesson = new Promise<string>((resolve, reject) => {
      resolveOld = resolve;
      rejectOld = reject;
    });
    const spy = vi.spyOn(TestBed.inject(ContentService), 'loadLessonHtml')
      .mockImplementation((_track, module) => module === 0 ? oldLesson : Promise.resolve('<p>Contenido vigente</p>'));
    try {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/curso/foundations/0');
      await harness.navigateByUrl('/curso/foundations/1');
      await harness.fixture.whenStable();
      if (outcome === 'success') resolveOld('<p>Contenido anterior</p>');
      else rejectOld(new Error('Error anterior'));
      await harness.fixture.whenStable();
      harness.detectChanges();
      const text = harness.fixture.nativeElement.textContent;
      expect(text).toContain('Contenido vigente');
      expect(text).not.toContain('Contenido anterior');
      expect(text).not.toContain('Error anterior');
    } finally {
      spy.mockRestore();
    }
  });

});
