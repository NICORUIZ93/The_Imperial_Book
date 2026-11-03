import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArrowLeft, ArrowRight, BookOpen, LucideAngularModule, Search } from 'lucide-angular';
import { map } from 'rxjs';
import { findTrack } from '../course-data';
import {
  CurriculumCatalog,
  CurriculumStackSummary,
  CurriculumLibraryService,
  CurriculumTopic,
} from '../curriculum-library.service';

const STACK_NAMES: Record<string, string> = {
  foundations: 'Fundamentos',
  javascript: 'JavaScript',
  node: 'Node.js',
  angular: 'Angular',
  react: 'React',
  java: 'Java',
  'spring-boot': 'Spring Boot',
  microservices: 'Microservicios',
  'kotlin-multiplatform': 'Kotlin Multiplatform',
  android: 'Android',
  ios: 'iOS',
  flutter: 'Flutter',
  devops: 'DevOps',
  cloud: 'Cloud',
  rutaflow: 'RutaFlow',
  python: 'Python',
  cpp: 'C++',
  'data-ai': 'Datos e inteligencia artificial',
  cybersecurity: 'Ciberseguridad',
  databases: 'Bases de datos',
  'iot-embedded': 'IoT y sistemas embebidos',
  'robotics-drones': 'Robótica y drones',
  'ui-ux': 'Diseño UI/UX',
  'game-development': 'Desarrollo de videojuegos',
  'quantum-computing': 'Computación cuántica',
  electronics: 'Electrónica',
  'math-science': 'Matemáticas y ciencias',
  'general-technical': 'Temas técnicos generales',
};

function normalize(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

@Component({
  selector: 'app-curriculum-library',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './curriculum-library.html',
  styleUrl: './curriculum-library.scss',
})
export class CurriculumLibraryComponent {
  readonly icons = { ArrowRight, BookOpen, Search };
  readonly library = inject(CurriculumLibraryService);
  readonly query = signal('');
  readonly scope = signal<'all' | 'current' | 'proposed'>('all');
  readonly catalog = this.library.catalog;
  readonly filteredStacks = computed(() => {
    const catalog = this.catalog();
    if (!catalog) return [];
    const query = normalize(this.query());
    return catalog.stacks
      .filter(stack => this.scope() === 'all'
        || (this.scope() === 'current' ? stack.hasCurrentTrack : !stack.hasCurrentTrack))
      .filter(stack => !query || normalize(`${this.stackName(stack.id)} ${stack.id}`).includes(query))
      .sort((a, b) => Number(b.hasCurrentTrack) - Number(a.hasCurrentTrack)
        || this.stackName(a.id).localeCompare(this.stackName(b.id), 'es'));
  });

  constructor() {
    void this.library.loadCatalog();
  }

  stackName(stackId: string): string {
    return findTrack(stackId)?.name ?? STACK_NAMES[stackId] ?? stackId;
  }

  updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  number(value: number): string {
    return value.toLocaleString('es');
  }

  selectScope(scope: 'all' | 'current' | 'proposed'): void {
    this.scope.set(scope);
  }
}

interface DisplayTopic {
  topic: CurriculumTopic;
  moduleId: string;
  moduleKind: 'current' | 'candidate' | 'course';
}

@Component({
  selector: 'app-curriculum-stack',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './curriculum-stack.html',
  styleUrl: './curriculum-library.scss',
})
export class CurriculumStackComponent {
  readonly icons = { ArrowLeft, ArrowRight, BookOpen, Search };
  readonly library = inject(CurriculumLibraryService);
  private readonly route = inject(ActivatedRoute);
  readonly stackId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('stackId') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('stackId') ?? '' },
  );
  readonly query = signal('');
  readonly topicScope = signal<'all' | 'current' | 'book-candidates' | 'course-candidates'>('all');
  readonly selectedModule = signal('all');
  readonly visibleCount = signal(80);
  readonly catalog = this.library.catalog;
  readonly summary = computed(() => this.library.stackSummary(this.stackId()));
  readonly stack = computed(() => this.library.stack(this.stackId()));
  readonly currentTrack = computed(() => findTrack(this.stackId()));
  readonly filteredTopics = computed<DisplayTopic[]>(() => {
    const stack = this.stack();
    if (!stack) return [];
    const query = normalize(this.query());
    return stack.modules
      .flatMap(module => module.topics.map(topic => ({
        topic,
        moduleId: module.id,
        moduleKind: module.kind,
      })))
      .filter(item => this.selectedModule() === 'all' || item.moduleId === this.selectedModule())
      .filter(item => {
        switch (this.topicScope()) {
          case 'current': return item.topic.current !== null;
          case 'book-candidates': return item.topic.status === 'candidato-libros';
          case 'course-candidates': return item.topic.status === 'candidato-cursos';
          default: return true;
        }
      })
      .filter(item => !query || normalize(item.topic.title).includes(query));
  });
  readonly visibleTopics = computed(() => this.filteredTopics().slice(0, this.visibleCount()));
  readonly moduleOptions = computed(() => {
    const stack = this.stack();
    if (!stack) return [];
    return stack.modules.map(module => {
      const currentModule = module.kind === 'current'
        ? this.currentTrack()?.modules.find(item => item.id === Number(module.id))
        : null;
      return {
        id: module.id,
        label: currentModule?.title
          ?? (module.kind === 'course' ? `Curso fuente: ${module.title ?? module.id}`
            : module.kind === 'candidate' ? 'Expansión editorial por organizar' : `Módulo ${module.id}`),
        topicCount: module.topicCount,
      };
    });
  });
  private readonly requestStack = effect(() => {
    const id = this.stackId();
    if (!id) return;
    void this.library.loadCatalog().then(() => this.library.loadStack(id));
  });

  stackName(stackId = this.stackId()): string {
    return findTrack(stackId)?.name ?? STACK_NAMES[stackId] ?? stackId;
  }

  number(value: number): string {
    return value.toLocaleString('es');
  }

  updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.visibleCount.set(80);
  }

  selectTopicScope(scope: 'all' | 'current' | 'book-candidates' | 'course-candidates'): void {
    this.topicScope.set(scope);
    this.visibleCount.set(80);
  }

  selectModule(event: Event): void {
    this.selectedModule.set((event.target as HTMLSelectElement).value);
    this.visibleCount.set(80);
  }

  showMore(): void {
    this.visibleCount.update(count => count + 80);
  }

  topicStatus(topic: CurriculumTopic): string {
    if (topic.status === 'actual+libros') return 'Tema actual · coincidencia bibliográfica exacta';
    if (topic.status === 'actual') return 'Tema actual';
    return topic.status === 'candidato-cursos'
      ? 'Tema anunciado en curso externo · pendiente de revisión'
      : 'Candidato de libros · pendiente de revisión';
  }

  language(language: string): string {
    return language === 'es' ? 'español' : language === 'en' ? 'inglés' : 'idioma por confirmar';
  }

  topicLink(topic: CurriculumTopic): string[] | null {
    if (!topic.current) return null;
    return ['/curso', this.stackId(), topic.current.module, 'tema', `tema-${topic.current.order}`];
  }

  moduleLabel(moduleId: string): string {
    return this.moduleOptions().find(module => module.id === moduleId)?.label ?? `Módulo ${moduleId}`;
  }

  retry(): void {
    this.library.retryStack(this.stackId());
  }
}
