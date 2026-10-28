import { CommonModule } from '@angular/common';
import { Component, ElementRef, Injector, OnDestroy, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookOpen, Boxes, Check, CircleCheck, ChevronLeft, ChevronRight, Clock3, Code2, Copy, Database, Gauge, ListTree, LockKeyhole, LucideAngularModule, ShieldCheck, Trophy, Zap } from 'lucide-angular';
import { map } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { findTrack } from '../course-data';
import type { CourseModule } from '../course-module.model';
import { ANATOMY_SLUG_CLASS_PREFIX, ContentService } from '../content.service';
import { ProgressService } from '../progress.service';
import { ThemeService } from '../theme.service';
import { findProjectBootstrap } from '../project-bootstrap';
import { projectFor } from '../learning-activities';
import { glossaryFor } from '../technical-glossary';
import { learningPrompt, LearningPromptMode } from '../learning-prompts';

let mermaidInitialized = false;

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const LEVEL_STAGES: CourseModule['level'][] = ['Fundamentos', 'Aplicación', 'Integración', 'Experto'];

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
  readonly icons = { BookOpen, Boxes, Check, ChevronLeft, ChevronRight, CircleCheck, Clock3, Code2, Copy, Database, Gauge, ListTree, LockKeyhole, ShieldCheck, Trophy, Zap };

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contentService = inject(ContentService);
  readonly progressService = inject(ProgressService);

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
  readonly projectBootstrap = computed(() => findProjectBootstrap(this.trackId()));
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
  readonly showProjectBootstrap = computed(() => this.moduleId() === 0 && Boolean(this.projectBootstrap()));
  readonly showTrackProject = computed(() => {
    const track = this.track();
    return Boolean(this.trackProject()) && this.moduleIndex() === (track?.modules.length ?? 0) - 1;
  });
  readonly moduleIndex = computed(() => this.track()?.modules.findIndex(m => m.id === this.moduleId()) ?? -1);
  // Barra "de cero a master": las 4 etapas reales del modelo de datos
  // (course-module.model.ts), para señalar visualmente en qué punto de la
  // escala Fundamentos → Experto está el módulo actual del track.
  readonly levelStages = LEVEL_STAGES;
  readonly levelIndex = computed(() => {
    const level = this.module()?.level;
    return level ? LEVEL_STAGES.indexOf(level) : -1;
  });
  readonly levelFillPercent = computed(() => {
    const index = this.levelIndex();
    return index < 0 ? 0 : ((index + 1) / LEVEL_STAGES.length) * 100;
  });
  readonly chapterPrerequisite = computed(() => {
    const track = this.track();
    const index = this.moduleIndex();
    return track && index > 0 ? track.modules[index - 1] : null;
  });
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
    const track = this.track();
    const module = this.module();
    return track && module ? `Módulo ${this.moduleIndex() + 1} de ${track.modules.length}: ${module.title}` : '';
  });

  readonly lessonHtml = signal<string | null>(null);
  readonly lessonLoading = signal(true);
  readonly lessonError = signal<string | null>(null);
  readonly diagramError = signal<string | null>(null);
  private readonly lessonContent = viewChild<ElementRef<HTMLElement>>('lessonContent');
  private readonly injector = inject(Injector);
  private readonly themeService = inject(ThemeService);
  private readonly titleService = inject(Title);

  readonly tocItems = signal<TocItem[]>([]);
  readonly activeTocId = signal<string | null>(null);
  readonly readingProgress = signal(0);
  /** Cuando la lección trae notas al margen, el margen reemplaza al índice
   * lateral (evita que ambos ocupen la misma columna y se superpongan). */
  readonly hasMarginNotes = signal(false);
  /** Reduce la carga visual cuando el estudiante quiere leer un único tema. */
  readonly focusMode = signal(false);
  readonly copiedCode = signal<string | null>(null);
  private tocObserver: IntersectionObserver | null = null;
  private copyTimer: ReturnType<typeof setTimeout> | null = null;
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
  }

  retryLesson(): void {
    const trackId = this.trackId();
    const module = this.module();
    void this.loadLesson(trackId, module?.id);
  }

  private lessonRequest = 0;

  private async loadLesson(trackId: string, moduleId: number | undefined): Promise<void> {
    const request = ++this.lessonRequest;
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
          fontFamily: 'Inter, system-ui, sans-serif',
          flowchart: { htmlLabels: true, curve: 'basis', padding: 10, nodeSpacing: 28, rankSpacing: 34 },
          sequence: { diagramMarginX: 24, diagramMarginY: 18, actorMargin: 48 },
          theme: 'base',
          themeVariables: {
            primaryColor: this.themeService.isDark() ? '#173238' : '#dcedee',
            primaryTextColor: this.themeService.isDark() ? '#e7eeee' : '#141b1f',
            primaryBorderColor: this.themeService.isDark() ? '#4fc4bd' : '#0e6b74',
            lineColor: this.themeService.isDark() ? '#4fc4bd' : '#0e6b74',
            secondaryColor: this.themeService.isDark() ? '#2c2312' : '#f3e6d1',
            tertiaryColor: this.themeService.isDark() ? '#161e22' : '#ffffff',
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
    }

    this.prepareAnatomyFigures(container);
    this.prepareArchifyVisuals(container);
    this.enhanceEducationalContent(container);
    this.enhanceVerifiableExercises(container);
    this.buildTableOfContents(container);
    this.addTopicNavigation(Array.from(container.querySelectorAll<HTMLHeadingElement>('h3.topic-heading')));
    this.buildTopicMap(container);
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
    this.hasMarginNotes.set(false);

    // Numeración "§ capítulo.tema" (como un libro de texto real) en vez del
    // prefijo "Tema N:" suelto — el número se calcula, no se escribe a mano
    // en el Markdown, así que no depende de que cada archivo lo lleve bien.
    const chapterNumber = this.moduleIndex() + 1;
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
      if (label.startsWith('Margen:')) {
        paragraph.classList.add('margin-note');
        this.hasMarginNotes.set(true);
      }
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
      const label = path ?? (isTerminal ? 'Terminal' : language);
      const languageLabels: Record<string, string> = {
        bash: 'Terminal', sh: 'Terminal', shell: 'Terminal', console: 'Terminal', powershell: 'PowerShell', zsh: 'Terminal',
        js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript', jsx: 'React JSX', tsx: 'React TSX',
        java: 'Java', kotlin: 'Kotlin', swift: 'Swift', dart: 'Dart', python: 'Python', py: 'Python', json: 'JSON', yaml: 'YAML', yml: 'YAML',
        html: 'HTML', css: 'CSS', scss: 'SCSS', sql: 'SQL', hcl: 'Terraform HCL', go: 'Go', rust: 'Rust', xml: 'XML',
      };
      const languageLabel = languageLabels[language.toLowerCase()] ?? language;
      const lineCount = code?.textContent?.replace(/\n$/, '').split('\n').length ?? 0;
      const wrapper = document.createElement('div');
      wrapper.className = 'code-example';
      wrapper.dataset['language'] = language.toLowerCase();
      wrapper.innerHTML = `<div class="code-example-bar"><span class="window-controls" aria-hidden="true"><i></i><i></i><i></i></span><span class="code-example-label">${escapeHtml(label)}</span><span class="code-example-meta"><span class="code-example-language">${escapeHtml(languageLabel)}</span><span>${lineCount} ${lineCount === 1 ? 'línea' : 'líneas'}</span></span><button type="button" data-wrap-code aria-pressed="false" aria-label="Ajustar líneas de ${escapeHtml(label)}">Ajustar</button><button type="button" data-copy-code="${index}" aria-label="Copiar ${escapeHtml(label)}">Copiar</button></div>`;
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      this.decorateCodeLines(pre);
      pre.setAttribute('tabindex', '0');
      pre.dataset['rawCode'] = code?.textContent ?? '';
      pre.setAttribute('aria-label', `${isTerminal ? 'Comandos' : 'Código'} en ${languageLabel}: ${label}`);
    });

    this.buildSessionCards(container);
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
   * hay 2+ pasos consecutivos justo después del encabezado del Tema.
   */
  private buildSessionCards(container: HTMLElement): void {
    container.querySelectorAll<HTMLHeadingElement>('h3.topic-heading').forEach(heading => {
      type Step = { number: string; label: string; headingEl: Element; bodyNodes: Element[] };
      const steps: Step[] = [];
      let node: Element | null = heading.nextElementSibling;
      while (node && node.tagName === 'H4') {
        const match = node.textContent?.trim().match(/^Paso\s+(\d+)\s*(?:·|-|:)?\s*(.*)$/i);
        if (!match) break;
        const [, number, label] = match;
        const bodyNodes: Element[] = [];
        let sibling: Element | null = node.nextElementSibling;
        while (sibling && sibling.tagName !== 'H4' && !['H2', 'H3'].includes(sibling.tagName)) {
          bodyNodes.push(sibling);
          sibling = sibling.nextElementSibling;
        }
        steps.push({ number, label, headingEl: node, bodyNodes });
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
        const stepHead = document.createElement('div');
        stepHead.className = 'step-head';
        stepHead.innerHTML = `<b>${step.number.padStart(2, '0')}</b><em>${escapeHtml(step.label || `Paso ${step.number}`)}</em>`;
        const body = document.createElement('div');
        body.className = 'step-body';
        step.bodyNodes.forEach(bodyNode => body.appendChild(bodyNode));
        li.append(stepHead, body);
        list.appendChild(li);
      });
      card.append(head, list);
      heading.insertAdjacentElement('afterend', card);
      steps.forEach(step => step.headingEl.remove());
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

  /**
   * Vista mapa/hub: en vez de forzar Tema 1 → 2 → 3 en un único scroll, el
   * estudiante ve todos los temas del capítulo como tarjetas numeradas y elige
   * cuál abrir primero. Reutiliza el mismo destino (`data-topic-destination`)
   * que ya expande y desplaza hacia un tema puntual.
   */
  private buildTopicMap(container: HTMLElement): void {
    if (container.querySelector('.topic-map')) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.topic-card'));
    if (cards.length < 2) return;
    const firstCard = cards[0];
    const chapter = this.moduleIndex() + 1;
    const items = cards.map((card, index) => {
      const heading = card.querySelector<HTMLElement>('.topic-heading');
      const id = heading?.id ?? '';
      const title = heading ? this.topicTitle(heading) : `Tema ${index + 1}`;
      return `<a href="#${escapeHtml(id)}" data-topic-destination="${escapeHtml(id)}" class="topic-map-item"><span class="topic-map-index">${chapter}.${index + 1}</span><span class="topic-map-title">${escapeHtml(title)}</span></a>`;
    }).join('');
    const map = document.createElement('nav');
    map.className = 'topic-map';
    map.setAttribute('aria-label', 'Mapa de temas de este capítulo');
    map.innerHTML = `<div class="topic-map-heading"><strong>Elegí un tema</strong><span>Sin orden obligatorio: abrí primero el que te interese.</span></div><div class="topic-map-grid">${items}</div>`;
    firstCard.parentNode?.insertBefore(map, firstCard);
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
      this.addTopicLearningSupport(body, heading);
    });
  }

  private addTopicNavigation(headings: HTMLHeadingElement[]): void {
    headings.forEach((heading, index) => {
      const card = heading.closest<HTMLElement>('.topic-card');
      const body = card?.querySelector<HTMLElement>(':scope > .topic-body');
      if (!body || body.querySelector('.topic-step-navigation')) return;
      const navigation = document.createElement('nav');
      navigation.className = 'topic-step-navigation';
      navigation.setAttribute('aria-label', `Navegación del tema ${index + 1}`);
      const previous = index > 0 ? headings[index - 1] : null;
      const next = index < headings.length - 1 ? headings[index + 1] : null;
      navigation.innerHTML = `
        ${previous ? `<a href="#${escapeHtml(previous.id)}" data-topic-destination="${escapeHtml(previous.id)}"><span>← Anterior</span><small>${escapeHtml(this.topicTitle(previous))}</small></a>` : '<span></span>'}
        <strong>Tema ${index + 1} de ${headings.length}</strong>
        ${next ? `<a href="#${escapeHtml(next.id)}" data-topic-destination="${escapeHtml(next.id)}"><span>Siguiente →</span><small>${escapeHtml(this.topicTitle(next))}</small></a>` : '<span></span>'}`;
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

  private addTopicLearningSupport(body: HTMLElement, heading: HTMLElement): void {
    const context = body.innerText || body.textContent || '';
    const prompts = document.createElement('details');
    prompts.className = 'topic-learning-prompts generated-learning-support';
    const summary = document.createElement('summary');
    summary.textContent = 'Prompts para estudiar y practicar este tema';
    const description = document.createElement('p');
    description.textContent = 'Adaptados del PDF: explicación paso a paso, ruta de aprendizaje y revisión profesional. Incluyen el contenido de este tema como referencia. Puedes editarlos y copiarlos para usarlos con tu asistente; no acreditan que hayas terminado la práctica.';
    prompts.append(summary, description);
    const modes: [LearningPromptMode, string][] = [['tutor', 'Tutor paso a paso'], ['roadmap', 'Ruta de 30 pasos'], ['review', 'Revisión profesional'], ['research', 'Informe con evidencia']];
    modes.forEach(([mode, label]) => {
      const section = document.createElement('details');
      const title = document.createElement('summary');
      title.textContent = label;
      const input = document.createElement('textarea');
      input.rows = 9;
      input.style.width = '100%';
      input.setAttribute('aria-label', `${label}: ${this.topicTitle(heading)}`);
      input.value = learningPrompt(this.topicTitle(heading), this.track()?.name ?? this.trackId(), context, mode);
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.dataset['copyLearningPrompt'] = '';
      copy.textContent = 'Copiar prompt';
      const feedback = document.createElement('p');
      feedback.setAttribute('role', 'status');
      section.append(title, input, copy, feedback);
      prompts.append(section);
    });
    body.appendChild(prompts);
    // No inventamos explicaciones para rellenar huecos: si el autor no escribió
    // la sección, la lección debe mostrar esa deuda editorial en la auditoría,
    // no presentar una frase genérica como si fuera contenido pedagógico.

    const editorialErrors = Array.from(body.querySelectorAll<HTMLParagraphElement>('p')).find(paragraph => /^(?:Errores comunes|Errores frecuentes|Fallos comunes|Fallos frecuentes):/i.test(paragraph.textContent?.trim() ?? ''));
    if (editorialErrors) {
      const parent = editorialErrors.parentNode;
      const details = document.createElement('details');
      details.className = 'topic-troubleshooting editorial-troubleshooting generated-learning-support';
      const summary = document.createElement('summary');
      summary.textContent = 'Errores comunes y cómo diagnosticarlos';
      parent?.insertBefore(details, editorialErrors);
      details.append(summary, editorialErrors);
      return;
    }
    // Cuando el autor aún no documentó fallos concretos, mostramos una lista
    // explícitamente marcada como checklist general (no como contenido del tema).
    const language = body.querySelector<HTMLElement>('.code-example')?.dataset['language'] ?? 'concept';
    const profiles: Record<string, string[]> = {
      terminal: ['Ejecutar el comando desde una carpeta diferente a la indicada.', 'Continuar después del primer error y perder su causa original.', 'Usar credenciales, puertos o variables de otro entorno sin comprobarlos.'],
      web: ['Crear el archivo en una ruta que no coincide con la importación.', 'Confiar en datos externos sin validar estados de carga, vacío y error.', 'Cambiar estado o efectos sin comprobar cuándo vuelve a renderizar la interfaz.'],
      jvm: ['Compilar con una versión de JDK distinta a la declarada por el proyecto.', 'Usar una anotación o dependencia sin comprender qué registra en el contenedor.', 'Bloquear un flujo concurrente o reactivo con una llamada síncrona.'],
      mobile: ['Probar solo el caso con permiso concedido y conexión disponible.', 'Ignorar ciclo de vida, restauración de estado o cancelación de tareas.', 'Validar en un único dispositivo sin revisar batería, accesibilidad y tamaños.'],
      concept: ['Memorizar el concepto sin relacionarlo con una entrada y una salida.', 'Aceptar una ejecución exitosa como evidencia suficiente sin provocar un fallo.', 'Aplicar una abstracción antes de identificar qué responsabilidad resuelve.'],
    };
    const profile = /bash|sh|shell|console|powershell|zsh/.test(language) ? 'terminal'
      : /js|javascript|ts|typescript|jsx|tsx|html|css|scss/.test(language) ? 'web'
      : /java|kotlin|xml/.test(language) ? 'jvm'
      : /swift|dart/.test(language) ? 'mobile'
      : 'concept';
    const details = document.createElement('details');
    details.className = 'topic-troubleshooting generated-learning-support';
    details.innerHTML = `<summary>Errores comunes y cómo diagnosticarlos <small>(checklist general)</small></summary><p>Esta lista es una ayuda transversal; los fallos específicos del ejemplo deben documentarse en la lección.</p><ol>${profiles[profile].map(error => `<li>${escapeHtml(error)}</li>`).join('')}</ol><p>Corrige un elemento a la vez, repite el comando y conserva la salida antes y después.</p>`;
    body.appendChild(details);
  }

  async copyCode(event: Event): Promise<void> {
    const promptButton = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-copy-learning-prompt]');
    if (promptButton) {
      const input = promptButton.parentElement?.querySelector('textarea');
      const feedback = promptButton.nextElementSibling;
      if (!input) return;
      try {
        await navigator.clipboard.writeText(input.value);
        if (feedback) feedback.textContent = 'Prompt copiado';
      } catch {
        input.focus();
        input.select();
        if (feedback) feedback.textContent = 'Seleccionado: usa el comando de copiar de tu dispositivo.';
      }
      return;
    }
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

  private buildTableOfContents(container: HTMLElement): void {
    this.tocObserver?.disconnect();
    // El índice muestra la estructura pedagógica principal. Los subtítulos
    // internos (Windows, macOS, pasos, etc.) permanecen en la lectura, pero no
    // compiten con capítulos y temas en una navegación ya extensa.
    const headings = Array.from(container.querySelectorAll<HTMLElement>('h2, h3.topic-heading'));
    const seen = new Set<string>();
    const items: TocItem[] = headings.map(el => {
      const level = el.tagName === 'H2' ? 2 : 3;
      const label = el.cloneNode(true) as HTMLElement;
      label.querySelectorAll('button, .section-number').forEach(node => node.remove());
      const text = label.textContent?.trim() ?? '';
      const id = el.id || slugify(text, seen);
      el.id = id;
      return { id, text, level };
    });
    this.tocItems.set(items);
    this.activeTocId.set(items[0]?.id ?? null);
    if (!headings.length || typeof IntersectionObserver === 'undefined') return;
    this.tocObserver = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).map(e => e.target as HTMLElement);
        if (!visible.length) return;
        const topmost = visible.reduce((a, b) => (a.getBoundingClientRect().top <= b.getBoundingClientRect().top ? a : b));
        this.activeTocId.set(topmost.id);
      },
      { rootMargin: '-72px 0px -70% 0px', threshold: 0 },
    );
    headings.forEach(h => this.tocObserver!.observe(h));
  }

  private scrollToRequestedFragment(container: HTMLElement, fragment: string): void {
    requestAnimationFrame(() => {
      const target = container.querySelector<HTMLElement>(`#${CSS.escape(fragment)}`);
      target?.scrollIntoView({ behavior: this.scrollBehavior(), block: 'start' });
      if (target) this.activeTocId.set(fragment);
    });
  }

  scrollToHeading(event: Event, id: string): void {
    event.preventDefault();
    const target = this.lessonContent()?.nativeElement.querySelector(`#${CSS.escape(id)}`);
    if (!target) return;
    const topicCard = target.closest<HTMLElement>('.topic-card');
    if (topicCard && !topicCard.classList.contains('expanded')) {
      topicCard.classList.add('expanded');
      const toggle = topicCard.querySelector<HTMLButtonElement>('[data-topic-toggle]');
      toggle?.setAttribute('aria-expanded', 'true');
      const label = toggle?.querySelector('span');
      if (label) label.textContent = 'Ocultar tema';
    }
    target.scrollIntoView({ behavior: this.scrollBehavior(), block: 'start' });
    this.router.navigate([], { relativeTo: this.route, fragment: id, replaceUrl: true });
    this.activeTocId.set(id);
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

  ngOnDestroy(): void {
    ++this.lessonRequest;
    this.tocObserver?.disconnect();
    window.removeEventListener('scroll', this.updateReadingProgress);
    if (this.copyTimer) clearTimeout(this.copyTimer);
  }
}
