import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Injector, OnDestroy, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookOpen, Boxes, Check, CircleCheck, ChevronLeft, ChevronRight, Clock3, Code2, Copy, Database, Gauge, LockKeyhole, LucideAngularModule, ShieldCheck, Zap } from 'lucide-angular';
import { map } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { findTrack } from '../course-data';
import { courseLevelLabel } from '../course-module.model';
import { ANATOMY_SLUG_CLASS_PREFIX, ContentService } from '../content.service';
import { ProgressService } from '../progress.service';
import { ThemeService } from '../theme.service';
import { TRACK_GUIDES } from '../track-guides';
import { projectFor } from '../learning-activities';
import { glossaryFor } from '../technical-glossary';
import { TopicIndexService, type IndexedTopic } from '../topic-index.service';

let mermaidInitialized = false;


const TRACK_OFFICIAL_SOURCES: Record<string, { label: string; url: string }> = {
  foundations: { label: 'Currículo oficial de MDN', url: 'https://developer.mozilla.org/en-US/curriculum/' },
  rutaflow: { label: 'Fundamentos web de MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development' },
  javascript: { label: 'JavaScript en MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
  node: { label: 'Documentación de Node.js', url: 'https://nodejs.org/en/learn' },
  angular: { label: 'Tutoriales de Angular', url: 'https://angular.dev/tutorials' },
  react: { label: 'Aprende React', url: 'https://react.dev/learn' },
  java: { label: 'Aprende Java', url: 'https://dev.java/learn/' },
  'spring-boot': { label: 'Guías de Spring', url: 'https://spring.io/guides' },
  'kotlin-multiplatform': { label: 'Kotlin Multiplatform', url: 'https://kotlinlang.org/docs/multiplatform/get-started.html' },
  android: { label: 'Android con Compose', url: 'https://developer.android.com/courses/android-basics-compose/course' },
  ios: { label: 'Tutoriales de Apple', url: 'https://developer.apple.com/tutorials/app-dev-training' },
  flutter: { label: 'Aprende Flutter', url: 'https://docs.flutter.dev/learn' },
  devops: { label: 'Tutoriales de Kubernetes', url: 'https://kubernetes.io/docs/tutorials/' },
  cloud: { label: 'Floci AWS oficial', url: 'https://floci.io/aws/' },
};

const CLOUD_MODULE_SOURCES: Record<number, { label: string; url: string }> = {
  2: { label: 'Amazon S3', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html' },
  3: { label: 'Amazon SQS', url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html' },
  4: { label: 'Amazon DynamoDB', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html' },
  5: { label: 'AWS Lambda', url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html' },
  6: { label: 'Amazon API Gateway', url: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html' },
  7: { label: 'AWS IAM', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html' },
  10: { label: 'AWS Secrets Manager', url: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html' },
  11: { label: 'Amazon EventBridge', url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html' },
  12: { label: 'Amazon CloudWatch', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html' },
  13: { label: 'Amazon RDS', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html' },
  14: { label: 'Amazon ECS', url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html' },
  15: { label: 'AWS CloudFormation', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html' },
  16: { label: 'AWS Step Functions', url: 'https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html' },
  17: { label: 'Amazon Kinesis', url: 'https://docs.aws.amazon.com/streams/latest/dev/introduction.html' },
  18: { label: 'Amazon Cognito', url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html' },
  19: { label: 'Amazon Athena', url: 'https://docs.aws.amazon.com/athena/latest/ug/what-is.html' },
  20: { label: 'Amazon Bedrock', url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html' },
  21: { label: 'Amazon EC2', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html' },
  22: { label: 'Elastic Load Balancing', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html' },
  23: { label: 'Amazon ElastiCache', url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html' },
  24: { label: 'AWS CodeBuild', url: 'https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html' },
  25: { label: 'AWS Config', url: 'https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html' },
  26: { label: 'Amazon Data Firehose', url: 'https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html' },
  27: { label: 'AWS AppSync', url: 'https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html' },
  28: { label: 'Amazon Neptune', url: 'https://docs.aws.amazon.com/neptune/latest/userguide/intro.html' },
  29: { label: 'AWS Cost Explorer', url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html' },
  30: { label: 'AWS Transfer Family', url: 'https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html' },
  34: { label: 'Floci AWS oficial', url: 'https://floci.io/aws/' },
};

function slugify(text: string, seen: Set<string>): string {
  const base = text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'seccion';
  let slug = base;
  let i = 2;
  while (seen.has(slug)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  seen.add(slug);
  return slug;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

/**
 * Vista de lectura tipo libro: título, teoría y navegación simple al
 * capítulo/módulo anterior y siguiente. Las prácticas verificables ofrecen
 * feedback local, sin quizzes ni paneles de gamificación.
 */
@Component({
  selector: 'app-lesson-viewer',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './lesson-viewer.html',
  styleUrl: './lesson-viewer.scss',
})
export class LessonViewerComponent implements OnDestroy {
  readonly icons = { BookOpen, Boxes, Check, ChevronLeft, ChevronRight, CircleCheck, Clock3, Code2, Copy, Database, Gauge, LockKeyhole, ShieldCheck, Zap };

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contentService = inject(ContentService);
  readonly progressService = inject(ProgressService);
  readonly topicIndex = inject(TopicIndexService);

  readonly trackId = toSignal(
    this.route.parent!.paramMap.pipe(map(params => params.get('trackId') ?? '')),
    { initialValue: this.route.parent?.snapshot.paramMap.get('trackId') ?? '' },
  );
  readonly moduleId = toSignal(
    this.route.paramMap.pipe(map(params => Number(params.get('moduleId') ?? 0))),
    { initialValue: Number(this.route.snapshot.paramMap.get('moduleId') ?? 0) },
  );
  private readonly requestedFragment = toSignal(this.route.fragment, {
    initialValue: this.route.snapshot.fragment,
  });
  private readonly topicIndexParam = toSignal(
    this.route.paramMap.pipe(map(params => params.get('topicIndex'))),
    { initialValue: this.route.snapshot.paramMap.get('topicIndex') },
  );
  /** Índice 0-based cuando la URL es /curso/:trackId/:moduleId/tema/:n (n = 1-based). */
  readonly focusedTopicIndex = computed(() => {
    const raw = this.topicIndexParam();
    if (raw === null) return null;
    const index = Number(raw) - 1;
    return Number.isInteger(index) && index >= 0 ? index : null;
  });

  readonly track = computed(() => findTrack(this.trackId()));
  readonly module = computed(() => this.track()?.modules.find(m => m.id === this.moduleId()));
  readonly officialSource = computed(() => {
    if (this.trackId() === 'foundations' && this.moduleId() === 12) {
      return { label: 'MIT: circuitos y electrónica', url: 'https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/' };
    }
    return this.trackId() === 'cloud'
      ? (CLOUD_MODULE_SOURCES[this.moduleId()] ?? TRACK_OFFICIAL_SOURCES['cloud'])
      : TRACK_OFFICIAL_SOURCES[this.trackId()];
  });
  readonly courseGuide = computed(() => TRACK_GUIDES[this.trackId()]);
  readonly trackProject = computed(() => projectFor(this.trackId()));
  readonly projectStep = computed(() => {
    const project = this.trackProject();
    const track = this.track();
    if (!project || !track) return 0;
    return Math.min(project.milestones.length, Math.max(1, Math.ceil((this.moduleIndex() + 1) / Math.max(1, track.modules.length) * project.milestones.length)));
  });
  readonly projectProgress = computed(() => {
    const track = this.track();
    if (!track) return 0;
    const completed = track.modules.filter(module => this.progressService.isModuleComplete(this.trackId(), module.id)).length;
    return Math.round(completed / Math.max(1, track.modules.length) * 100);
  });
  readonly showTrackProject = computed(() => {
    const track = this.track();
    return Boolean(this.trackProject()) && this.moduleIndex() === (track?.modules.length ?? 0) - 1;
  });
  readonly moduleIndex = computed(() => this.track()?.modules.findIndex(m => m.id === this.moduleId()) ?? -1);
  readonly levelLabel = courseLevelLabel;
  readonly isCloudIntroduction = computed(() => this.trackId() === 'cloud' && this.moduleId() === 0);
  readonly flociMetrics = [
    { value: '24 ms', label: 'Arranque de referencia', detail: 'Binario nativo' },
    { value: '13 MiB', label: 'Memoria en reposo', detail: 'Huella local reducida' },
    { value: '68', label: 'Servicios AWS', detail: 'Sin niveles de pago' },
    { value: '1.925/1.925', label: 'Pruebas SDK', detail: 'Suite publicada por Floci' },
  ];
  readonly flociCapabilities = [
    { icon: Zap, title: 'Ciclo de trabajo inmediato', text: 'Levanta, prueba y destruye recursos dentro del mismo ciclo de edición, sin esperar una cuenta remota.' },
    { icon: LockKeyhole, title: 'Sin secretos cloud reales', text: 'Los clientes usan credenciales locales desechables. El estudiante aprende endpoints e IAM sin exponer una cuenta productiva.' },
    { icon: Boxes, title: 'Herramientas conocidas', text: 'AWS CLI, SDK, Terraform, OpenTofu y tests cambian el endpoint; no necesitas una API educativa diferente.' },
    { icon: ShieldCheck, title: 'Radio de impacto local', text: 'Un error afecta el contenedor de práctica. La validación final de seguridad y operación todavía debe ocurrir en nube real.' },
  ];
  readonly flociEngines = [
    { icon: Boxes, name: 'Lambda y ECS', detail: 'Ejecución en contenedores Docker reales' },
    { icon: Database, name: 'RDS', detail: 'PostgreSQL, MySQL y MariaDB reales' },
    { icon: Zap, name: 'MSK', detail: 'Kafka compatible mediante Redpanda' },
    { icon: Gauge, name: 'Athena', detail: 'Consultas SQL locales mediante DuckDB' },
  ];
  readonly previousModule = computed(() => {
    const track = this.track();
    const index = this.moduleIndex();
    return track && index > 0 ? track.modules[index - 1] : null;
  });
  readonly nextModule = computed(() => {
    const track = this.track();
    const index = this.moduleIndex();
    return track && index >= 0 && index < track.modules.length - 1 ? track.modules[index + 1] : null;
  });
  readonly chapterAnnouncement = computed(() => {
    const module = this.module();
    return module ? `Módulo ${module.id}: ${module.title}` : '';
  });
  /** Resumen corto del capítulo para que el siguiente tema no quede escondido
   * al final del documento largo. El Markdown sigue siendo la fuente real. */
  readonly chapterTopics = computed(() => this.topicIndex.topics(this.trackId(), this.moduleId()));
  readonly focusedTopic = computed(() => {
    const index = this.focusedTopicIndex();
    return index === null ? null : (this.chapterTopics()[index] ?? null);
  });
  readonly currentTopicIndex = computed(() => {
    const focused = this.focusedTopicIndex();
    if (focused !== null) return focused;
    const fragment = this.requestedFragment();
    const topics = this.chapterTopics();
    const index = fragment ? topics.findIndex(topic => topic.fragment === fragment) : -1;
    return index >= 0 ? index : 0;
  });
  readonly completedTopicCount = computed(() => {
    const trackId = this.trackId();
    const moduleId = this.moduleId();
    return this.chapterTopics()
      .filter(topic => this.progressService.isTopicComplete(trackId, moduleId, topic.fragment))
      .length;
  });
  private static readonly PRACTICE_ANCHOR = 'practica-del-capitulo';

  readonly lessonHtml = signal<string | null>(null);
  readonly lessonLoading = signal(true);
  readonly lessonError = signal<string | null>(null);
  readonly diagramError = signal<string | null>(null);
  private readonly lessonContent = viewChild<ElementRef<HTMLElement>>('lessonContent');
  private readonly injector = inject(Injector);
  private readonly themeService = inject(ThemeService);
  private readonly titleService = inject(Title);

  readonly readingProgress = signal(0);
  /** Reduce la carga visual cuando el estudiante quiere leer un único tema. */
  readonly focusMode = signal(false);
  readonly copiedCode = signal<string | null>(null);
  private copyTimer: ReturnType<typeof setTimeout> | null = null;

  // La caja de lectura limita cada diagrama a 680×360 para no romper la columna
  // de texto; los diagramas anchos o altos se leen en este diálogo, a tamaño
  // natural y con desplazamiento, en vez de encogerse hasta ser ilegibles.
  readonly diagramDialogTitle = signal('');
  readonly diagramZoom = signal(1);
  readonly diagramZoomLabel = computed(() => `${Math.round(this.diagramZoom() * 100)} %`);
  private readonly diagramDialog = viewChild<ElementRef<HTMLDialogElement>>('diagramDialog');
  private readonly diagramDialogBody = viewChild<ElementRef<HTMLElement>>('diagramDialogBody');
  private expandedSvg: SVGSVGElement | null = null;
  private expandedPre: HTMLElement | null = null;
  private expandedSvgStyle: string | null = null;
  private diagramTrigger: HTMLElement | null = null;
  private previousBodyOverflow = '';
  private static readonly DIAGRAM_ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5];
  private readonly updateReadingProgress = (): void => {
    const article = this.lessonContent()?.nativeElement;
    if (!article) return;
    const rect = article.getBoundingClientRect();
    const total = Math.max(1, article.offsetHeight - window.innerHeight * .55);
    this.readingProgress.set(Math.max(0, Math.min(100, (-rect.top + 160) / total * 100)));
  };

  readonly isComplete = computed(() => this.progressService.isModuleComplete(this.trackId(), this.moduleId()));
  constructor() {
    effect(() => {
      const announcement = this.chapterAnnouncement();
      if (announcement) this.titleService.setTitle(`${announcement} · The Imperial Book`);
    });
    effect(() => {
      const trackId = this.trackId();
      const module = this.module();
      // El componente se reutiliza entre capítulos: sin esto la lectura del
      // siguiente empieza con el scroll del anterior.
      window.scrollTo({ top: 0, behavior: 'auto' });
      void this.loadLesson(trackId, module?.id);
    });

    // Diagramas Mermaid y verificación de laboratorios se aplican sobre el DOM ya
    // renderizado (no se puede enlazar Angular sobre HTML inyectado con [innerHTML]),
    // así que se espera al siguiente render tras cada cambio de lección.
    effect(() => {
      if (!this.lessonHtml()) return;
      afterNextRender(() => this.enhanceRenderedLesson(), { injector: this.injector });
    });

    effect(() => {
      const fragment = this.requestedFragment();
      if (!fragment || !this.lessonHtml()) return;
      afterNextRender(() => {
        const container = this.lessonContent()?.nativeElement;
        if (container) this.scrollToRequestedFragment(container, fragment);
      }, { injector: this.injector });
    });

    effect(() => {
      const index = this.focusedTopicIndex();
      if (index === null || !this.lessonHtml()) return;
      afterNextRender(() => {
        const container = this.lessonContent()?.nativeElement;
        if (container) this.applyTopicFocus(container);
      }, { injector: this.injector });
    });
  }

  retryLesson(): void {
    const trackId = this.trackId();
    const module = this.module();
    void this.loadLesson(trackId, module?.id);
  }

  private lessonRequest = 0;

  private async loadLesson(trackId: string, moduleId: number | undefined): Promise<void> {
    const request = ++this.lessonRequest;
    this.closeDiagram();
    this.lessonHtml.set(null);
    this.lessonError.set(null);
    this.lessonLoading.set(moduleId !== undefined);
    if (moduleId === undefined) return;
    try {
      const html = await this.contentService.loadLessonHtml(trackId, moduleId);
      if (request === this.lessonRequest) this.lessonHtml.set(html);
    } catch (error) {
      if (request === this.lessonRequest) {
        this.lessonError.set(error instanceof Error ? error.message : 'No pudimos cargar la lección.');
      }
    } finally {
      if (request === this.lessonRequest) this.lessonLoading.set(false);
    }
  }

  private async enhanceRenderedLesson(): Promise<void> {
    const container = this.lessonContent()?.nativeElement;
    if (!container) return;

    this.diagramError.set(null);
    const diagrams = container.querySelectorAll<HTMLElement>('pre.mermaid');
    if (diagrams.length) {
      const { default: mermaid } = await import('mermaid');
      if (!this.lessonContent()?.nativeElement.isConnected) return;
      this.prepareMermaidDiagrams(container);
      if (!mermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          fontFamily: '"Fira Sans", "Helvetica Neue", Arial, sans-serif',
          flowchart: { htmlLabels: true, curve: 'basis', padding: 10, nodeSpacing: 28, rankSpacing: 34 },
          sequence: { diagramMarginX: 24, diagramMarginY: 18, actorMargin: 48 },
          theme: 'base',
          themeVariables: {
            // Diagramas a tinta, como los del libro: cajas blancas con trazo
            // oscuro, flechas finas y el rojo solo como acento secundario.
            primaryColor: this.themeService.isDark() ? '#192940' : '#ffffff',
            primaryTextColor: this.themeService.isDark() ? '#e6edf8' : '#17253b',
            primaryBorderColor: this.themeService.isDark() ? '#b5c3d8' : '#17253b',
            lineColor: this.themeService.isDark() ? '#b5c3d8' : '#52627a',
            secondaryColor: this.themeService.isDark() ? '#1f3655' : '#e9f0ff',
            tertiaryColor: this.themeService.isDark() ? '#121f32' : '#edf2f8',
            fontSize: '12px',
          },
        });
        mermaidInitialized = true;
      }
      try {
        await mermaid.run({ nodes: Array.from(diagrams) });
        if (container.querySelector('[transform*="NaN"], [transform*="undefined"]')) {
          throw new Error('Un diagrama produjo coordenadas no válidas.');
        }
      } catch (error) {
        const detail = error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
              ? error.message
              : String(error);
        this.diagramError.set(`No se pudo renderizar un diagrama: ${detail}`);
      }
      this.attachDiagramZoom(container);
    }

    this.prepareAnatomyFigures(container);
    this.prepareArchifyVisuals(container);
    this.enhanceEducationalContent(container);
    const hasPractice = this.markChapterPractice(container);
    this.applyTopicFocus(container);
    this.enhanceVerifiableExercises(container);
    this.addTopicNavigation(Array.from(container.querySelectorAll<HTMLHeadingElement>('h3.topic-heading')), hasPractice);
    const fragment = this.requestedFragment();
    if (fragment) this.scrollToRequestedFragment(container, fragment);
    window.removeEventListener('scroll', this.updateReadingProgress);
    window.addEventListener('scroll', this.updateReadingProgress, { passive: true });
    this.updateReadingProgress();
  }

  private prepareMermaidDiagrams(container: HTMLElement): void {
    container.querySelectorAll<HTMLElement>('pre.mermaid').forEach((diagram, index) => {
      if (diagram.parentElement?.classList.contains('visual-diagram')) return;
      let previous: Element | null = diagram.previousElementSibling;
      while (previous && previous.tagName !== 'H3' && previous.tagName !== 'H2') previous = previous.previousElementSibling;
      const context = diagram.closest('.topic-card')?.querySelector('.topic-heading')?.textContent?.trim()
        ?? previous?.textContent?.trim()
        ?? `Diagrama ${index + 1}`;
      const figure = document.createElement('figure');
      figure.className = 'visual-diagram';
      figure.setAttribute('aria-label', `Diagrama técnico: ${context}`);
      const caption = document.createElement('figcaption');
      caption.innerHTML = `<span aria-hidden="true">◇</span><div><small>Diagrama</small><strong>${escapeHtml(context.replace(/^Tema\s+\d+\s*:\s*/i, ''))}</strong></div>`;
      diagram.parentNode?.insertBefore(figure, diagram);
      figure.append(caption, diagram);
      diagram.setAttribute('role', 'img');
      diagram.setAttribute('aria-label', `Relaciones y flujo de ${context}`);
      diagram.tabIndex = 0;
    });
  }

  private attachDiagramZoom(container: HTMLElement): void {
    container.querySelectorAll<HTMLElement>('.visual-diagram').forEach(figure => {
      if (figure.querySelector('.diagram-zoom-open') || !figure.querySelector('svg')) return;
      const title = figure.querySelector('figcaption strong')?.textContent?.trim() || 'Diagrama';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'diagram-zoom-open';
      button.textContent = 'Ampliar';
      button.setAttribute('aria-label', `Ampliar el diagrama: ${title}`);
      button.addEventListener('click', () => this.openDiagram(figure, title, button));
      (figure.querySelector('figcaption') ?? figure).append(button);
      const pre = figure.querySelector<HTMLElement>('pre.mermaid');
      if (pre) {
        pre.style.cursor = 'zoom-in';
        pre.setAttribute('aria-label', `${pre.getAttribute('aria-label') ?? 'Diagrama'}. Pulsa Enter para ampliarlo.`);
        pre.addEventListener('click', () => this.openDiagram(figure, title, button));
        pre.addEventListener('keydown', event => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          this.openDiagram(figure, title, button);
        });
      }
    });
  }

  private openDiagram(figure: HTMLElement, title: string, trigger: HTMLElement): void {
    const svg = figure.querySelector<SVGSVGElement>('pre.mermaid svg');
    const dialog = this.diagramDialog()?.nativeElement;
    const body = this.diagramDialogBody()?.nativeElement;
    if (!svg || !dialog || !body) return;
    this.expandedSvg = svg;
    this.expandedPre = svg.parentElement;
    this.expandedSvgStyle = svg.getAttribute('style');
    this.diagramTrigger = trigger;
    this.diagramDialogTitle.set(title);
    this.diagramZoom.set(1);
    body.replaceChildren(svg);
    this.applyDiagramZoom();
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
  }

  closeDiagram(): void {
    const dialog = this.diagramDialog()?.nativeElement;
    if (dialog?.open) dialog.close();
  }

  closeDiagramFromBackdrop(event: MouseEvent): void {
    if (event.target === this.diagramDialog()?.nativeElement) this.closeDiagram();
  }

  stepDiagramZoom(direction: number): void {
    const steps = LessonViewerComponent.DIAGRAM_ZOOM_STEPS;
    const current = this.diagramZoom();
    const found = steps.findIndex(step => Math.abs(step - current) < 0.01);
    const index = found < 0 ? steps.indexOf(1) : found;
    const next = steps[Math.max(0, Math.min(steps.length - 1, index + direction))];
    this.diagramZoom.set(next);
    this.applyDiagramZoom();
  }

  private applyDiagramZoom(): void {
    const svg = this.expandedSvg;
    if (!svg) return;
    const naturalWidth = svg.viewBox.baseVal.width || svg.getBoundingClientRect().width;
    svg.style.width = `${Math.round(naturalWidth * this.diagramZoom())}px`;
    svg.style.maxWidth = 'none';
    svg.style.height = 'auto';
  }

  /** Devuelve el SVG a su figura original cuando el diálogo se cierra o el lector navega. */
  restoreDiagram(): void {
    const svg = this.expandedSvg;
    if (svg) {
      if (this.expandedSvgStyle === null) svg.removeAttribute('style');
      else svg.setAttribute('style', this.expandedSvgStyle);
      if (this.expandedPre?.isConnected) this.expandedPre.appendChild(svg);
    }
    this.expandedSvg = null;
    this.expandedPre = null;
    this.expandedSvgStyle = null;
    document.body.style.overflow = this.previousBodyOverflow;
    this.diagramZoom.set(1);
    const trigger = this.diagramTrigger;
    this.diagramTrigger = null;
    trigger?.focus();
  }

  // Un <div class="anatomy-figure" data-figure="..."> es un marcador que dejó
  // content.service.ts (ver ANATOMY_BLOCK): acá, no en el Markdown, se crea el
  // <iframe> real vía DOM API. [innerHTML] sanitiza <iframe>/<script>, así que
  // inyectarlo aquí (fuera del binding) es lo que permite que la figura
  // interactiva (skill Anatomy) conserve su JS en vivo, en vez de quedar
  // reducida a una imagen estática.
  private prepareAnatomyFigures(container: HTMLElement): void {
    container.querySelectorAll<HTMLElement>('.anatomy-figure').forEach(marker => {
      if (marker.childElementCount > 0) return;
      const slugClass = Array.from(marker.classList).find(cls => cls.startsWith(ANATOMY_SLUG_CLASS_PREFIX));
      const slug = slugClass ? slugClass.slice(ANATOMY_SLUG_CLASS_PREFIX.length) : '';
      if (!slug) return;
      const theme = this.themeService.isDark() ? '' : '-light';
      const iframe = document.createElement('iframe');
      iframe.src = `content/figures/${slug}/figure${theme}.html`;
      iframe.className = 'anatomy-figure-frame';
      iframe.loading = 'lazy';
      iframe.title = `Figura interactiva: ${slug.replace(/-/g, ' ')}`;
      iframe.setAttribute('sandbox', 'allow-scripts');
      iframe.setAttribute('scrolling', 'no');
      marker.replaceChildren(iframe);
    });
  }

  private prepareArchifyVisuals(container: HTMLElement): void {
    container.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(link => {
      const paragraph = link.closest('p');
      if (!paragraph || paragraph.querySelectorAll('a').length !== 1) return;

      const visualUrl = new URL(link.href);
      if (visualUrl.origin !== window.location.origin
        || !/^\/visuals\/temas\/[a-z0-9-]+\/[a-z0-9-]+\.html$/i.test(visualUrl.pathname)) return;

      const title = link.textContent?.trim();
      if (!title) return;

      const figure = document.createElement('figure');
      figure.className = 'archify-visual';
      figure.setAttribute('aria-label', `Diagrama interactivo: ${title}`);

      const caption = document.createElement('figcaption');
      const icon = document.createElement('span');
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '◇';
      const heading = document.createElement('div');
      const label = document.createElement('small');
      label.textContent = 'Diagrama interactivo';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const strong = document.createElement('strong');
      strong.textContent = title;
      link.replaceChildren(strong);
      heading.append(label, link);
      caption.append(icon, heading);

      const frame = document.createElement('iframe');
      visualUrl.searchParams.set('embed', '1');
      frame.src = visualUrl.toString();
      frame.className = 'archify-visual-frame';
      frame.loading = 'lazy';
      frame.title = `Diagrama interactivo: ${title}`;
      frame.setAttribute('sandbox', 'allow-scripts');

      figure.append(caption, frame);
      paragraph.replaceWith(figure);
    });
  }

  private enhanceEducationalContent(container: HTMLElement): void {
    this.groupLessonSections(container);
    this.addSectionGuides(container);

    // Numeración "§ capítulo.tema" (como un libro de texto real) en vez del
    // prefijo "Tema N:" suelto — el número se calcula, no se escribe a mano
    // en el Markdown, así que no depende de que cada archivo lo lleve bien.
    const chapterNumber = this.module()?.id ?? 0;
    let temaIndex = 0;
    const topicSlugSeen = new Set<string>();
    container.querySelectorAll<HTMLHeadingElement>('h3').forEach(heading => {
      const text = heading.textContent?.trim() ?? '';
      if (!text.startsWith('Tema ')) return;
      heading.classList.add('topic-heading');
      temaIndex += 1;
      // El id se calcula sobre el TÍTULO CRUDO (con "Tema N:"), igual que
      // scripts/build_web_topic_index.py genera el fragment del índice. Así el
      // ancla del encabezado coincide con el fragment del menú lateral y el
      // click en un tema sí hace scroll hasta él. Debe asignarse ANTES de quitar
      // el prefijo "Tema N:", porque después ese texto ya no está disponible.
      if (!heading.id) heading.id = slugify(text, topicSlugSeen);
      const title = text.replace(/^Tema\s+\d+\s*:\s*/i, '');
      heading.innerHTML = `<span class="section-number">§ ${chapterNumber}.${temaIndex}</span>${escapeHtml(title)}`;
    });

    container.querySelectorAll('p').forEach(paragraph => {
      const strong = paragraph.querySelector(':scope > strong:first-child');
      const label = strong?.textContent?.trim() ?? '';
      if (label.startsWith('Definición')) paragraph.classList.add('definition-callout');
      if (label.startsWith('Analogía:')) paragraph.classList.add('learning-callout', 'analogy-callout');
      if (label.startsWith('¿Por qué es importante?')) paragraph.classList.add('learning-callout', 'importance-callout');
      if (label.startsWith('Casos de uso reales:')) paragraph.classList.add('learning-callout', 'cases-callout');
      if (label.startsWith('Conceptos clave:')) this.renderKeyTerms(paragraph, label);
      // Convención "libro de texto": términos clave y referencias cruzadas ("Ver
      // Tema 3.4") viven en el margen, igual que en Stewart Calculus o Halliday.
      if (label.startsWith('Margen:')) paragraph.classList.add('margin-note');
    });

    container.querySelectorAll<HTMLElement>('pre:not(.mermaid)').forEach((pre, index) => {
      if (pre.parentElement?.classList.contains('code-example')) return;
      const code = pre.querySelector('code');
      const languageClass = Array.from(code?.classList ?? []).find(name => name.startsWith('language-'));
      const language = languageClass?.replace('language-', '') || 'código';
      const isTerminal = /^(bash|sh|shell|console|powershell|zsh)$/i.test(language);
      const previous = pre.previousElementSibling;
      const previousText = previous?.matches('p, li') ? previous.textContent?.trim() ?? '' : '';
      const path = previousText.match(/(?:[\w.-]+\/)+(?:[\w.-]+\.[a-z0-9]+|[\w.-]+)/i)?.[0];
      const languageLabels: Record<string, string> = {
        bash: 'Terminal', sh: 'Terminal', shell: 'Terminal', console: 'Terminal', powershell: 'PowerShell', zsh: 'Terminal',
        js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript', jsx: 'React JSX', tsx: 'React TSX',
        java: 'Java', kotlin: 'Kotlin', swift: 'Swift', dart: 'Dart', python: 'Python', py: 'Python', json: 'JSON', yaml: 'YAML', yml: 'YAML',
        html: 'HTML', css: 'CSS', scss: 'SCSS', sql: 'SQL', hcl: 'Terraform HCL', go: 'Go', rust: 'Rust', xml: 'XML',
      };
      const languageLabel = languageLabels[language.toLowerCase()] ?? language;
      // Una sola etiqueta: si no hay ruta de archivo, el lenguaje ya es el
      // título del bloque y repetirlo ("Terminal · Terminal") solo agrega ruido.
      const label = path ?? languageLabel;
      const showLanguage = Boolean(path) && languageLabel.toLowerCase() !== label.toLowerCase();
      const wrapper = document.createElement('div');
      wrapper.className = 'code-example';
      wrapper.dataset['language'] = language.toLowerCase();
      wrapper.innerHTML = `<div class="code-example-bar"><span class="code-example-label">${escapeHtml(label)}</span>${showLanguage ? `<span class="code-example-language">${escapeHtml(languageLabel)}</span>` : ''}<button type="button" data-wrap-code aria-pressed="false" aria-label="Ajustar líneas de ${escapeHtml(label)}">Ajustar</button><button type="button" data-copy-code="${index}" aria-label="Copiar ${escapeHtml(label)}">Copiar</button></div>`;
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      this.decorateCodeLines(pre);
      pre.setAttribute('tabindex', '0');
      pre.dataset['rawCode'] = code?.textContent ?? '';
      pre.setAttribute('aria-label', `${isTerminal ? 'Comandos' : 'Código'} en ${languageLabel}: ${label}`);
    });

    this.buildSessionCards(container);
    this.collapseProjectDeepDives(container);
    this.groupTopics(container);
    this.enhanceTextbookBlocks(container);
    this.annotateTechnicalTerms(container);
  }

  private decorateCodeLines(pre: HTMLElement): void {
    const code = pre.querySelector<HTMLElement>('code');
    if (!code || code.dataset['lineDecorated'] === 'true') return;
    const raw = code.textContent ?? '';
    code.dataset['lineDecorated'] = 'true';
    code.innerHTML = raw.split('\n').map((line, index) =>
      `<span class="code-line"><span class="code-line-number" aria-hidden="true">${index + 1}</span><span class="code-line-text">${escapeHtml(line) || ' '}</span></span>`
    ).join('');
  }

  /**
   * Los "Paso N · Título" de un Tema dejan de ser encabezados sueltos y se
   * agrupan en una única ficha de sesión (checklist compacto), en vez de una
   * escalera de círculos numerados intercalada en la lectura. Solo agrupa si
   * hay 2+ pasos consecutivos tras el contenido de apertura del Tema.
   */
  private buildSessionCards(container: HTMLElement): void {
    container.querySelectorAll<HTMLHeadingElement>('h3.topic-heading').forEach(heading => {
      type Step = { number: string; label: string; headingEl: Element; bodyNodes: Element[] };
      const steps: Step[] = [];
      // El tema puede abrir con objetivo, conceptos clave, un diagrama o una
      // subsección propia ("Cómo leer @id, @default...") antes del Paso 1: ese
      // contenido se lee antes de la ficha y no pertenece a un paso, así que la
      // ficha se inserta después de él, no tras el encabezado.
      let insertAfter: Element = heading;
      let node: Element | null = heading.nextElementSibling;
      while (node && !['H2', 'H3'].includes(node.tagName)) {
        if (node.tagName === 'H4' && /^Paso\s+\d+/i.test(node.textContent?.trim() ?? '')) break;
        insertAfter = node;
        node = node.nextElementSibling;
      }
      while (node && node.tagName === 'H4') {
        const match = node.textContent?.trim().match(/^Paso\s+(\d+)\s*(?:·|-|:)?\s*(.*)$/i);
        const bodyNodes: Element[] = [];
        let sibling: Element | null = node.nextElementSibling;
        while (sibling && sibling.tagName !== 'H4' && !['H2', 'H3'].includes(sibling.tagName)) {
          bodyNodes.push(sibling);
          sibling = sibling.nextElementSibling;
        }
        if (match) {
          const [, number, label] = match;
          steps.push({ number, label, headingEl: node, bodyNodes });
        } else if (steps.length) {
          // Sección intermedia del tema ("Profundización · Diseño", notas de
          // arquitectura): se lee dentro del paso anterior en vez de cortar la
          // ficha y dejar los pasos siguientes como encabezados sueltos.
          steps[steps.length - 1].bodyNodes.push(node, ...bodyNodes);
        } else {
          break;
        }
        node = sibling;
      }
      if (steps.length < 2) return;

      const card = document.createElement('div');
      card.className = 'session-card';
      const head = document.createElement('div');
      head.className = 'session-card-head';
      head.innerHTML = `<span>Ficha de la sesión</span><small>${steps.length} pasos</small>`;
      const list = document.createElement('ol');
      list.className = 'session-steps';
      steps.forEach(step => {
        const li = document.createElement('li');
        // data-step permite que la hoja de estilos dibuje el icono de línea de
        // cada paso (objetivo, problema, solución, código...), como las
        // secciones con icono del libro de patrones.
        li.dataset['step'] = step.number;
        const stepHead = document.createElement('div');
        stepHead.className = 'step-head';
        stepHead.innerHTML = `<i class="step-icon" aria-hidden="true"></i><b>${step.number.padStart(2, '0')}</b><em>${escapeHtml(step.label || `Paso ${step.number}`)}</em>`;
        const body = document.createElement('div');
        body.className = 'step-body';
        step.bodyNodes.forEach(bodyNode => body.appendChild(bodyNode));
        li.append(stepHead, body);
        list.appendChild(li);
      });
      card.append(head, list);
      insertAfter.insertAdjacentElement('afterend', card);
      steps.forEach(step => step.headingEl.remove());
    });
  }

  /**
   * "Profundización · Diseño: ..." es lectura complementaria sobre el proyecto
   * integrador. Se conserva íntegra, pero plegada al cierre del tema: el
   * recorrido principal (objetivo → teoría → demostración → práctica) no queda
   * interrumpido por un bloque largo que se repite en cada tema.
   */
  private collapseProjectDeepDives(container: HTMLElement): void {
    container.querySelectorAll<HTMLHeadingElement>('h4').forEach(heading => {
      const text = heading.textContent?.trim() ?? '';
      if (!/^Profundización\b/i.test(text) || heading.closest('.project-deep-dive')) return;
      const title = text.replace(/^Profundización\s*(?:·|:|-)?\s*(?:Diseño\s*(?:·|:|-)?\s*)?/i, '').trim() || 'Proyecto integrador';
      const details = document.createElement('details');
      details.className = 'project-deep-dive';
      const summary = document.createElement('summary');
      summary.innerHTML = `<span>Conexión con el proyecto integrador</span><strong>${escapeHtml(title)}</strong>`;
      const body = document.createElement('div');
      body.className = 'project-deep-dive-body';
      const nextSibling: Element | null = heading.nextElementSibling;
      heading.parentNode?.insertBefore(details, heading);
      details.appendChild(summary);
      // El título ya vive en el summary; conservarlo dentro duplicaría el rótulo.
      heading.remove();
      let node: Element | null = nextSibling;
      while (node && !(node instanceof HTMLHeadingElement && ['H2', 'H3', 'H4'].includes(node.tagName))) {
        const next: Element | null = node.nextElementSibling;
        body.appendChild(node);
        node = next;
      }
      details.appendChild(body);
    });
  }

  /**
   * "Conceptos clave: A, B, C" deja de ser una línea corrida con borde y pasa
   * a una caja de glosario reconocible, con un chip por término — el mismo
   * lenguaje visual que un recuadro de "términos clave" al inicio de una
   * sección de libro de texto (OpenStax, Halliday), en vez de texto corrido
   * fácil de saltarse al leer.
   */
  private renderKeyTerms(paragraph: HTMLElement, label: string): void {
    const rest = paragraph.textContent?.slice(label.length).replace(/^:/, '').trim() ?? '';
    const terms = rest.split(/,(?![^(]*\))/).map(term => term.trim()).filter(Boolean);
    if (!terms.length) {
      paragraph.classList.add('key-terms');
      return;
    }
    const box = document.createElement('div');
    box.className = 'key-terms';
    box.innerHTML = `<div class="key-terms-heading">Términos de esta sección</div><div class="key-terms-chips">${terms.map(term => `<span class="term-chip">${escapeHtml(term)}</span>`).join('')}</div>`;
    paragraph.replaceWith(box);
  }

  /**
   * "Checkpoint N.N" (Halliday/Resnick) intercala una pregunta conceptual corta
   * directamente en el cuerpo del texto, con la respuesta oculta hasta pedirla —
   * igual que las respuestas al final del libro. "Problema resuelto N.N" (Stewart)
   * exige una sección **Razonamiento:** explícita con los pasos, no solo el
   * resultado numérico.
   */
  private enhanceTextbookBlocks(container: HTMLElement): void {
    this.wrapLabeledBlocks(container, /^Checkpoint\s+[\d.]+/i, 'checkpoint', section => this.decorateCheckpoint(section));
    this.wrapLabeledBlocks(container, /^Problema resuelto\s+[\d.]+/i, 'sample-problem', section => this.decorateSampleProblem(section));
  }

  private wrapLabeledBlocks(container: HTMLElement, pattern: RegExp, className: string, decorate: (section: HTMLElement) => void): void {
    const headings = Array.from(container.querySelectorAll<HTMLHeadingElement>('h4')).filter(heading => pattern.test(heading.textContent?.trim() ?? ''));
    headings.forEach(heading => {
      if (heading.closest(`.${className}`)) return;
      const section = document.createElement('section');
      section.className = className;
      heading.parentNode?.insertBefore(section, heading);
      let node: Node | null = heading;
      while (node && (node === heading || !(node instanceof HTMLHeadingElement && ['H2', 'H3', 'H4'].includes(node.tagName)))) {
        const next: Node | null = node.nextSibling;
        section.appendChild(node);
        node = next;
      }
      decorate(section);
    });
  }

  private decorateCheckpoint(section: HTMLElement): void {
    const answer = Array.from(section.querySelectorAll('p')).find(p => /^Respuesta:/i.test(p.textContent?.trim() ?? ''));
    if (!answer) return;
    answer.classList.add('checkpoint-answer');
    answer.hidden = true;
    const reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.className = 'checkpoint-reveal';
    reveal.dataset['revealAnswer'] = '';
    reveal.textContent = 'Mostrar respuesta';
    answer.insertAdjacentElement('beforebegin', reveal);
  }

  private decorateSampleProblem(section: HTMLElement): void {
    // No inventamos un razonamiento si el autor no lo escribió: sin el párrafo
    // **Razonamiento:** explícito, el bloque se muestra sin ese realce, en vez
    // de simular una explicación que no existe en el Markdown.
    const nodes = Array.from(section.childNodes);
    const reasoningStart = nodes.findIndex(node => node instanceof HTMLParagraphElement && /^Razonamiento:/i.test(node.textContent?.trim() ?? ''));
    if (reasoningStart === -1) return;
    const answerIndex = nodes.findIndex((node, index) => index > reasoningStart && node instanceof HTMLParagraphElement && /^Respuesta:/i.test(node.textContent?.trim() ?? ''));
    const end = answerIndex === -1 ? nodes.length : answerIndex;
    const wrap = document.createElement('div');
    wrap.className = 'sample-problem-reasoning';
    section.insertBefore(wrap, nodes[reasoningStart]);
    for (let i = reasoningStart; i < end; i += 1) {
      if (nodes[i].parentNode) wrap.appendChild(nodes[i]);
    }
    if (answerIndex !== -1) (nodes[answerIndex] as HTMLElement).classList.add('sample-problem-answer');
  }

  private enhanceVerifiableExercises(container: HTMLElement): void {
    const headings = Array.from(container.querySelectorAll<HTMLHeadingElement>('h4'))
      .filter(heading => /^Ejercicio verificable\s+\d+/i.test(heading.textContent?.trim() ?? ''));
    headings.forEach((heading, index) => {
      if (heading.closest('.verifiable-exercise')) return;
      const answerParagraph = this.findExerciseAnswer(heading);
      const answerText = answerParagraph?.textContent?.replace(/^Respuesta esperada:\s*/i, '').trim();
      if (!answerParagraph || !answerText) return;

      const exerciseId = heading.id || `ejercicio-${index + 1}`;
      heading.id = exerciseId;
      const card = document.createElement('section');
      card.className = 'verifiable-exercise';
      card.dataset['exerciseId'] = exerciseId;
      card.dataset['answers'] = answerText;
      heading.parentNode?.insertBefore(card, heading);
      let node: Node | null = heading;
      while (node && (node === heading || !(node instanceof HTMLHeadingElement && ['H2', 'H3', 'H4'].includes(node.tagName)))) {
        const next: Node | null = node.nextSibling;
        card.appendChild(node);
        node = next;
      }
      answerParagraph.hidden = true;
      const completed = this.progressService.isExerciseComplete(this.trackId(), this.moduleId(), exerciseId);
      const controls = document.createElement('div');
      controls.className = 'exercise-controls';
      controls.innerHTML = `
        <label for="answer-${escapeHtml(exerciseId)}">Tu respuesta</label>
        <div><input id="answer-${escapeHtml(exerciseId)}" type="text" autocomplete="off" spellcheck="false" ${completed ? 'disabled' : ''}><button type="button" data-verify-exercise ${completed ? 'disabled' : ''}>${completed ? 'Completado' : 'Verificar'}</button></div>
        <p class="exercise-feedback ${completed ? 'correct' : ''}" role="status" aria-live="polite">${completed ? 'Correcto. Esta práctica ya quedó guardada.' : 'Escribe la salida o concepto solicitado y compruébalo.'}</p>`;
      card.appendChild(controls);
    });
  }

  private findExerciseAnswer(heading: HTMLHeadingElement): HTMLParagraphElement | null {
    let node = heading.nextElementSibling;
    while (node && !/^H[234]$/.test(node.tagName)) {
      if (node instanceof HTMLParagraphElement && /^Respuesta esperada:/i.test(node.textContent?.trim() ?? '')) return node;
      node = node.nextElementSibling;
    }
    return null;
  }

  private normalizeExerciseAnswer(value: string): string {
    return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().replace(/["'`]/g, '').replace(/\s+/g, ' ').trim();
  }

  private addSectionGuides(container: HTMLElement): void {
    const lab = container.querySelector<HTMLElement>('.section-laboratorio-practico');
    if (lab && !lab.querySelector('.target-demo')) {
      const target = document.createElement('aside');
      target.className = 'target-demo';
      target.innerHTML = `<small>Resultado que debes poder demostrar</small><strong>${escapeHtml(this.module()?.deliverable ?? 'Un incremento funcional, probado y reproducible.')}</strong>`;
      lab.querySelector(':scope > h2')?.insertAdjacentElement('afterend', target);
    }
  }

  private groupLessonSections(container: HTMLElement): void {
    const headings = Array.from(container.querySelectorAll<HTMLHeadingElement>(':scope > h2'));
    headings.forEach(heading => {
      if (heading.parentElement?.classList.contains('lesson-section')) return;
      const section = document.createElement('section');
      const title = heading.textContent?.trim() ?? '';
      section.className = `lesson-section section-${slugify(title, new Set())}`;
      heading.parentNode?.insertBefore(section, heading);
      let node: Node | null = heading;
      while (node && (node === heading || !(node instanceof HTMLHeadingElement && node.tagName === 'H2'))) {
        const next: Node | null = node.nextSibling;
        section.appendChild(node);
        node = next;
      }
    });
  }

  private groupTopics(container: HTMLElement): void {
    const headings = Array.from(container.querySelectorAll<HTMLHeadingElement>('h3.topic-heading'));
    headings.forEach((heading, index) => {
      if (heading.parentElement?.classList.contains('topic-card')) return;
      const card = document.createElement('section');
      card.className = 'topic-card';
      card.dataset['topicIndex'] = String(index);
      heading.parentNode?.insertBefore(card, heading);
      let node: Node | null = heading;
      while (node && (node === heading || !(node instanceof HTMLHeadingElement && ['H2', 'H3'].includes(node.tagName)))) {
        const next: Node | null = node.nextSibling;
        card.appendChild(node);
        node = next;
      }
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'topic-toggle';
      toggle.dataset['topicToggle'] = String(index);
      toggle.setAttribute('aria-expanded', String(index === 0));
      toggle.innerHTML = `<span>${index === 0 ? 'Ocultar tema' : 'Abrir tema'}</span><span aria-hidden="true">⌄</span>`;
      heading.appendChild(toggle);
      const body = document.createElement('div');
      body.className = 'topic-body';
      let bodyNode = heading.nextSibling;
      while (bodyNode) {
        const next = bodyNode.nextSibling;
        body.appendChild(bodyNode);
        bodyNode = next;
      }
      card.classList.toggle('expanded', index === 0);
      card.appendChild(body);
      this.addTopicTroubleshooting(body);
      this.addTopicFocusLink(body, index);
    });
  }

  /** Enlace permanente al tema como página propia; solo visible al abrir el tema. */
  private addTopicFocusLink(container: HTMLElement, index: number): void {
    const link = document.createElement('a');
    link.className = 'topic-focus-link';
    link.href = `/curso/${encodeURIComponent(this.trackId())}/${this.moduleId()}/tema/${index + 1}`;
    link.dataset['topicFocus'] = String(index + 1);
    link.textContent = 'Ver solo este tema';
    container.appendChild(link);
  }

  /** Deja expandido solo el tema pedido por la URL y lo trae a la vista. */
  private applyTopicFocus(container: HTMLElement): void {
    const index = this.focusedTopicIndex();
    if (index === null) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.topic-card'));
    const card = cards[index];
    if (!card) return;
    cards.forEach((item, position) => {
      const expanded = position === index;
      item.classList.toggle('expanded', expanded);
      const toggle = item.querySelector<HTMLButtonElement>('[data-topic-toggle]');
      toggle?.setAttribute('aria-expanded', String(expanded));
      const label = toggle?.querySelector('span');
      if (label) label.textContent = expanded ? 'Ocultar tema' : 'Abrir tema';
    });
    requestAnimationFrame(() => card.scrollIntoView({ behavior: this.scrollBehavior(), block: 'start' }));
  }

  /** Da ancla a la sección de práctica del capítulo cuando el autor la escribió. */
  private markChapterPractice(container: HTMLElement): boolean {
    const heading = Array.from(container.querySelectorAll<HTMLHeadingElement>('h3'))
      .find(item => !item.classList.contains('topic-heading') && /^Comprueba lo construido\b/i.test(item.textContent?.trim() ?? ''));
    if (!heading) return false;
    heading.id = LessonViewerComponent.PRACTICE_ANCHOR;
    return true;
  }

  isTopicDone(topic: IndexedTopic): boolean {
    return this.progressService.isTopicComplete(this.trackId(), this.moduleId(), topic.fragment);
  }

  private addTopicNavigation(headings: HTMLHeadingElement[], hasPractice: boolean): void {
    const trackId = this.trackId();
    const moduleId = this.moduleId();
    headings.forEach((heading, index) => {
      const card = heading.closest<HTMLElement>('.topic-card');
      const body = card?.querySelector<HTMLElement>(':scope > .topic-body');
      if (!body || body.querySelector('.topic-step-navigation')) return;
      const navigation = document.createElement('nav');
      navigation.className = 'topic-step-navigation';
      navigation.setAttribute('aria-label', `Navegación del tema ${index + 1}`);
      const previous = index > 0 ? headings[index - 1] : null;
      const next = index < headings.length - 1 ? headings[index + 1] : null;
      // En el último tema la flecha sigue hacia el capítulo siguiente en vez
      // de quedar vacía: la lectura continúa sin volver al pie.
      const followingModule = next ? null : this.nextModule();
      const followingLink = next
        ? `<a class="topic-next" href="#${escapeHtml(next.id)}" data-topic-destination="${escapeHtml(next.id)}"><span>Siguiente →</span><small>${escapeHtml(this.topicTitle(next))}</small></a>`
        : followingModule
          ? `<a class="topic-next topic-module-next" href="/curso/${encodeURIComponent(trackId)}/${followingModule.id}" data-next-module="${followingModule.id}"><span>Capítulo siguiente →</span><small>${escapeHtml(followingModule.shortTitle)}</small></a>`
          : '<span class="topic-next-slot"></span>';
      const done = this.progressService.isTopicComplete(trackId, moduleId, heading.id);
      navigation.innerHTML = `
        ${previous ? `<a class="topic-prev" href="#${escapeHtml(previous.id)}" data-topic-destination="${escapeHtml(previous.id)}"><span>← Anterior</span><small>${escapeHtml(this.topicTitle(previous))}</small></a>` : '<span class="topic-prev-slot"></span>'}
        <div class="topic-step-center">
          <strong>Tema ${index + 1} de ${headings.length}</strong>
          <button type="button" class="topic-complete${done ? ' done' : ''}" data-topic-complete="${escapeHtml(heading.id)}" aria-pressed="${done}">${done ? 'Tema leído' : 'Marcar tema como leído'}</button>
          ${hasPractice ? `<a class="topic-practice-link" href="#${LessonViewerComponent.PRACTICE_ANCHOR}" data-practice-link>Práctica del capítulo</a>` : ''}
        </div>
        ${followingLink}`;
      body.appendChild(navigation);
    });
  }

  private topicTitle(heading: HTMLElement): string {
    const copy = heading.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('button, .section-number').forEach(el => el.remove());
    return copy.textContent?.replace(/^Tema(?:\s+\d+)?\s*:\s*/i, '').trim() || 'Tema';
  }

  private annotateTechnicalTerms(container: HTMLElement): void {
    const terms = glossaryFor(this.trackId()).sort((a, b) => b.term.length - a.term.length);
    const inlineCode = Array.from(container.querySelectorAll<HTMLElement>('.topic-body code:not(pre code)'));
    inlineCode.forEach(code => {
      const value = code.textContent?.trim();
      if (!value || code.closest('.technical-term')) return;
      const match = terms.find(item => item.term.toLocaleLowerCase() === value.toLocaleLowerCase());
      if (!match) return;
      const definition = document.createElement('span');
      definition.className = 'technical-term';
      definition.tabIndex = 0;
      definition.setAttribute('role', 'definition');
      definition.setAttribute('aria-label', `${match.term}: ${match.definition}`);
      definition.dataset['definition'] = match.definition;
      code.parentNode?.insertBefore(definition, code);
      definition.appendChild(code);
    });
  }

  private addTopicTroubleshooting(body: HTMLElement): void {
    // No inventamos explicaciones para rellenar huecos: si el autor no escribió
    // la sección, la lección debe mostrar esa deuda editorial en la auditoría,
    // no presentar una frase genérica como si fuera contenido pedagógico.

    const editorialErrors = Array.from(body.querySelectorAll<HTMLParagraphElement>('p')).find(paragraph => /^(?:Errores comunes|Errores frecuentes|Fallos comunes|Fallos frecuentes):/i.test(paragraph.textContent?.trim() ?? ''));
    if (!editorialErrors) return;
    const parent = editorialErrors.parentNode;
    const details = document.createElement('details');
    details.className = 'topic-troubleshooting editorial-troubleshooting';
    const summary = document.createElement('summary');
    summary.textContent = 'Errores comunes y cómo diagnosticarlos';
    parent?.insertBefore(details, editorialErrors);
    details.append(summary, editorialErrors);
  }

  async copyCode(event: Event): Promise<void> {
    const revealButton = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-reveal-answer]');
    if (revealButton) {
      const answer = revealButton.nextElementSibling as HTMLElement | null;
      if (answer) answer.hidden = false;
      revealButton.remove();
      return;
    }
    const verifyButton = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-verify-exercise]');
    if (verifyButton) {
      const card = verifyButton.closest<HTMLElement>('.verifiable-exercise');
      const input = card?.querySelector<HTMLInputElement>('input');
      const feedback = card?.querySelector<HTMLElement>('.exercise-feedback');
      const accepted = (card?.dataset['answers'] ?? '').split('|').map(answer => this.normalizeExerciseAnswer(answer));
      const response = this.normalizeExerciseAnswer(input?.value ?? '');
      const correct = Boolean(response) && accepted.includes(response);
      if (feedback) {
        feedback.classList.toggle('correct', correct);
        feedback.classList.toggle('incorrect', !correct);
        feedback.textContent = correct
          ? 'Correcto. Compara tu respuesta con la ejecución y continúa.'
          : 'Todavía no coincide. Ejecuta el ejemplo, observa la salida y vuelve a intentarlo.';
      }
      if (correct && card && input) {
        this.progressService.completeExercise(this.trackId(), this.moduleId(), card.dataset['exerciseId'] ?? 'ejercicio');
        input.disabled = true;
        verifyButton.disabled = true;
        verifyButton.textContent = 'Completado';
      }
      return;
    }
    const topicComplete = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-topic-complete]');
    if (topicComplete) {
      const key = topicComplete.dataset['topicComplete'];
      if (!key) return;
      this.progressService.toggleTopicComplete(this.trackId(), this.moduleId(), key);
      const done = this.progressService.isTopicComplete(this.trackId(), this.moduleId(), key);
      topicComplete.setAttribute('aria-pressed', String(done));
      topicComplete.classList.toggle('done', done);
      topicComplete.textContent = done ? 'Tema leído' : 'Marcar tema como leído';
      return;
    }
    const nextModuleLink = (event.target as HTMLElement).closest<HTMLAnchorElement>('[data-next-module]');
    if (nextModuleLink) {
      event.preventDefault();
      const destination = Number(nextModuleLink.dataset['nextModule']);
      if (Number.isInteger(destination)) this.goToModule(destination);
      return;
    }
    const practiceLink = (event.target as HTMLElement).closest<HTMLAnchorElement>('[data-practice-link]');
    if (practiceLink) {
      event.preventDefault();
      const container = this.lessonContent()?.nativeElement;
      container?.querySelector<HTMLElement>(`#${LessonViewerComponent.PRACTICE_ANCHOR}`)
        ?.scrollIntoView({ behavior: this.scrollBehavior(), block: 'start' });
      void this.router.navigate([], { relativeTo: this.route, fragment: LessonViewerComponent.PRACTICE_ANCHOR, replaceUrl: true });
      return;
    }
    const focusLink = (event.target as HTMLElement).closest<HTMLAnchorElement>('[data-topic-focus]');
    if (focusLink) {
      event.preventDefault();
      const index = focusLink.dataset['topicFocus'];
      if (index) void this.router.navigate(['/curso', this.trackId(), this.moduleId(), 'tema', index]);
      return;
    }
    const topicDestination = (event.target as HTMLElement).closest<HTMLAnchorElement>('[data-topic-destination]');
    if (topicDestination) {
      event.preventDefault();
      const id = topicDestination.dataset['topicDestination'];
      const destination = id ? document.getElementById(id) : null;
      const card = destination?.closest<HTMLElement>('.topic-card');
      if (destination && card) {
        card.classList.add('expanded');
        const toggle = card.querySelector<HTMLButtonElement>('[data-topic-toggle]');
        toggle?.setAttribute('aria-expanded', 'true');
        const label = toggle?.querySelector('span');
        if (label) label.textContent = 'Ocultar tema';
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        destination.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        this.router.navigate([], { relativeTo: this.route, fragment: id, replaceUrl: true });
      }
      return;
    }
    const topicToggle = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-topic-toggle]');
    if (topicToggle) {
      const card = topicToggle.closest<HTMLElement>('.topic-card');
      const expanded = card?.classList.toggle('expanded') ?? false;
      topicToggle.setAttribute('aria-expanded', String(expanded));
      const label = topicToggle.querySelector('span');
      if (label) label.textContent = expanded ? 'Ocultar tema' : 'Abrir tema';
      return;
    }
    const wrapButton = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-wrap-code]');
    if (wrapButton) {
      const wrapper = wrapButton.closest<HTMLElement>('.code-example');
      const wrapped = wrapper?.classList.toggle('wrap-lines') ?? false;
      wrapButton.setAttribute('aria-pressed', String(wrapped));
      wrapButton.textContent = wrapped ? 'Sin ajuste' : 'Ajustar';
      return;
    }
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-copy-code]');
    if (!button) return;
    const pre = button.closest('.code-example')?.querySelector<HTMLPreElement>('pre');
    const code = pre?.dataset['rawCode'] ?? pre?.querySelector('code')?.textContent ?? '';
    await navigator.clipboard.writeText(code);
    const id = button.dataset['copyCode'] ?? '';
    this.copiedCode.set(id);
    button.textContent = 'Copiado';
    if (this.copyTimer) clearTimeout(this.copyTimer);
    this.copyTimer = setTimeout(() => {
      button.textContent = 'Copiar';
      this.copiedCode.set(null);
    }, 1800);
  }

  private scrollToRequestedFragment(container: HTMLElement, fragment: string): void {
    requestAnimationFrame(() => {
      const target = container.querySelector<HTMLElement>(`#${CSS.escape(fragment)}`);
      target?.scrollIntoView({ behavior: this.scrollBehavior(), block: 'start' });
    });
  }

  private scrollBehavior(): ScrollBehavior {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }


  toggleComplete(): void {
    this.progressService.toggleModuleComplete(this.trackId(), this.moduleId());
  }

  goToModule(moduleId: number): void {
    this.router.navigate(['/curso', this.trackId(), moduleId]);
  }

  /** j/k siguen el orden de lectura; se ignoran al escribir o con un diálogo abierto. */
  @HostListener('window:keydown', ['$event'])
  onShortcut(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (document.querySelector('dialog[open]')) return;
    const target = event.target as HTMLElement | null;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName ?? ''))) return;
    const key = event.key.toLowerCase();
    const destination = key === 'j' ? this.nextModule() : key === 'k' ? this.previousModule() : null;
    if (!destination) return;
    event.preventDefault();
    this.goToModule(destination.id);
  }

  jumpToTopic(event: Event, fragment: string): void {
    event.preventDefault();
    const container = this.lessonContent()?.nativeElement;
    const destination = container?.querySelector<HTMLElement>(`#${CSS.escape(fragment)}`);
    const card = destination?.closest<HTMLElement>('.topic-card');
    if (destination && card) {
      card.classList.add('expanded');
      const toggle = card.querySelector<HTMLButtonElement>('[data-topic-toggle]');
      toggle?.setAttribute('aria-expanded', 'true');
      const label = toggle?.querySelector('span');
      if (label) label.textContent = 'Ocultar tema';
      destination.scrollIntoView({ behavior: this.scrollBehavior(), block: 'start' });
    }
    void this.router.navigate([], { relativeTo: this.route, fragment, replaceUrl: true });
  }

  ngOnDestroy(): void {
    ++this.lessonRequest;
    this.closeDiagram();
    this.restoreDiagram();
    window.removeEventListener('scroll', this.updateReadingProgress);
    if (this.copyTimer) clearTimeout(this.copyTimer);
  }
}
