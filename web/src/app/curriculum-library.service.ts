import { Injectable, computed, signal } from '@angular/core';

export interface CurriculumSource {
  bookId: number;
  page: number | null;
}

export interface CurriculumTopic {
  title: string;
  status: 'actual' | 'actual+libros' | 'candidato-libros' | 'candidato-cursos';
  current: { module: string; order: number; fragment: string } | null;
  sources: CurriculumSource[];
  courseSources: Array<{ courseId: number }>;
}

export interface CurriculumModule {
  id: string;
  kind: 'current' | 'candidate' | 'course';
  title: string | null;
  topicCount: number;
  topics: CurriculumTopic[];
}

export interface CurriculumBook {
  title: string;
  language: 'es' | 'en' | 'indeterminado';
}

export interface CurriculumCourse {
  provider: string;
  title: string;
  url: string;
  language: 'es' | 'en' | 'indeterminado';
  audience: string;
  sourceNote: string;
  projectFeatures: string[];
}

export interface CurriculumStack {
  stackId: string;
  modules: CurriculumModule[];
  books: CurriculumBook[];
  courses: CurriculumCourse[];
  booksRequiringOcr: Array<{ title: string; pages: number }>;
}

export interface CurriculumStackSummary {
  id: string;
  asset: string;
  hasCurrentTrack: boolean;
  currentTopicCount: number;
  exactBookEvidenceTopicCount: number;
  bookCandidateCount: number;
  courseCandidateCount: number;
  topicCount: number;
  moduleCount: number;
  bookCount: number;
  courseCount: number;
  booksRequiringOcr: number;
  modules: Array<{ id: string; kind: 'current' | 'candidate' | 'course'; title: string | null; topicCount: number }>;
}

export interface CurriculumCatalog {
  summary: {
    currentTopics: number;
    currentTopicsWithExactBookEvidence: number;
    bookCandidates: number;
    courseCandidates: number;
    courses: number;
    provisionalTopics: number;
    booksRequiringOcr: number;
  };
  stacks: CurriculumStackSummary[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function parseCatalog(value: unknown): CurriculumCatalog {
  if (!isRecord(value) || value['schemaVersion'] !== 1 || !isRecord(value['summary']) || !Array.isArray(value['stacks'])) {
    throw new Error('El índice del temario bibliográfico tiene un formato inválido.');
  }

  const rawSummary = value['summary'];
  const currentTopics = rawSummary['currentTopics'];
  const currentTopicsWithExactBookEvidence = rawSummary['currentTopicsWithExactBookEvidence'];
  const bookCandidates = rawSummary['bookCandidates'];
  const courseCandidates = rawSummary['courseCandidates'];
  const courses = rawSummary['courses'];
  const provisionalTopics = rawSummary['provisionalTopics'];
  const booksRequiringOcr = rawSummary['booksRequiringOcr'];
  if (!isNonNegativeInteger(currentTopics)
    || !isNonNegativeInteger(currentTopicsWithExactBookEvidence)
    || !isNonNegativeInteger(bookCandidates)
    || !isNonNegativeInteger(courseCandidates)
    || !isNonNegativeInteger(courses)
    || !isNonNegativeInteger(provisionalTopics)
    || !isNonNegativeInteger(booksRequiringOcr)) {
    throw new Error('El resumen del temario bibliográfico está incompleto.');
  }
  const summary = {
    currentTopics,
    currentTopicsWithExactBookEvidence,
    bookCandidates,
    courseCandidates,
    courses,
    provisionalTopics,
    booksRequiringOcr,
  };

  const stacks: CurriculumStackSummary[] = [];
  for (const rawStack of value['stacks']) {
    if (!isRecord(rawStack) || typeof rawStack['id'] !== 'string'
      || typeof rawStack['asset'] !== 'string'
      || !rawStack['asset'].startsWith('content/curriculum-stacks/')
      || !rawStack['asset'].endsWith('.json')
      || typeof rawStack['hasCurrentTrack'] !== 'boolean'
      || !Array.isArray(rawStack['modules'])) {
      throw new Error('Una ruta del temario bibliográfico tiene un formato inválido.');
    }

    const currentTopicCount = rawStack['currentTopicCount'];
    const exactBookEvidenceTopicCount = rawStack['exactBookEvidenceTopicCount'];
    const bookCandidateCount = rawStack['bookCandidateCount'];
    const courseCandidateCount = rawStack['courseCandidateCount'];
    const topicCount = rawStack['topicCount'];
    const moduleCount = rawStack['moduleCount'];
    const bookCount = rawStack['bookCount'];
    const courseCount = rawStack['courseCount'];
    const stackOcrCount = rawStack['booksRequiringOcr'];
    if (!isNonNegativeInteger(currentTopicCount)
      || !isNonNegativeInteger(exactBookEvidenceTopicCount)
      || !isNonNegativeInteger(bookCandidateCount)
      || !isNonNegativeInteger(courseCandidateCount)
      || !isNonNegativeInteger(topicCount)
      || !isNonNegativeInteger(moduleCount)
      || !isNonNegativeInteger(bookCount)
      || !isNonNegativeInteger(courseCount)
      || !isNonNegativeInteger(stackOcrCount)) {
      throw new Error(`El resumen de ${rawStack['id']} está incompleto.`);
    }

    const modules: CurriculumStackSummary['modules'] = rawStack['modules'].map(rawModule => {
      if (!isRecord(rawModule) || typeof rawModule['id'] !== 'string'
        || !['current', 'candidate', 'course'].includes(String(rawModule['kind']))
        || (rawModule['title'] !== undefined && rawModule['title'] !== null && typeof rawModule['title'] !== 'string')
        || !isNonNegativeInteger(rawModule['topicCount'])) {
        throw new Error(`Un módulo de ${rawStack['id']} tiene un formato inválido.`);
      }
      return {
        id: rawModule['id'],
        kind: rawModule['kind'] as CurriculumStackSummary['modules'][number]['kind'],
        title: typeof rawModule['title'] === 'string' ? rawModule['title'] : null,
        topicCount: rawModule['topicCount'],
      };
    });

    stacks.push({
      id: rawStack['id'],
      asset: rawStack['asset'],
      hasCurrentTrack: rawStack['hasCurrentTrack'],
      currentTopicCount,
      exactBookEvidenceTopicCount,
      bookCandidateCount,
      courseCandidateCount,
      topicCount,
      moduleCount,
      bookCount,
      courseCount,
      booksRequiringOcr: stackOcrCount,
      modules,
    });
  }

  if (new Set(stacks.map(stack => stack.id)).size !== stacks.length) {
    throw new Error('El índice del temario bibliográfico repite rutas.');
  }
  if (summary.provisionalTopics !== summary.currentTopics + summary.bookCandidates + summary.courseCandidates) {
    throw new Error('Los totales del temario bibliográfico no coinciden.');
  }

  return { summary, stacks };
}

function parseStack(value: unknown, expectedId: string): CurriculumStack {
  if (!isRecord(value) || value['schemaVersion'] !== 1 || value['stackId'] !== expectedId
    || !Array.isArray(value['modules']) || !Array.isArray(value['books']) || !Array.isArray(value['courses'])
    || !Array.isArray(value['booksRequiringOcr'])) {
    throw new Error(`El contenido bibliográfico de ${expectedId} tiene un formato inválido.`);
  }

  const books = value['books'].map(book => {
    if (!isRecord(book) || typeof book['title'] !== 'string'
      || !['es', 'en', 'indeterminado'].includes(String(book['language']))
      || 'path' in book) {
      throw new Error(`Una fuente bibliográfica de ${expectedId} tiene un formato inválido.`);
    }
    return { title: book['title'], language: book['language'] as CurriculumBook['language'] };
  });

  const courses = value['courses'].map(course => {
    if (!isRecord(course) || typeof course['provider'] !== 'string' || typeof course['title'] !== 'string'
      || typeof course['url'] !== 'string' || !course['url'].startsWith('https://')
      || !['es', 'en', 'indeterminado'].includes(String(course['language']))
      || typeof course['audience'] !== 'string' || typeof course['sourceNote'] !== 'string'
      || !Array.isArray(course['projectFeatures'])
      || !course['projectFeatures'].every(feature => typeof feature === 'string')
      || 'path' in course) {
      throw new Error(`Un curso fuente de ${expectedId} tiene un formato inválido.`);
    }
    return {
      provider: course['provider'],
      title: course['title'],
      url: course['url'],
      language: course['language'] as CurriculumCourse['language'],
      audience: course['audience'],
      sourceNote: course['sourceNote'],
      projectFeatures: course['projectFeatures'],
    };
  });

  const booksRequiringOcr = value['booksRequiringOcr'].map(book => {
    if (!isRecord(book) || typeof book['title'] !== 'string' || !isNonNegativeInteger(book['pages']) || 'path' in book) {
      throw new Error(`Un libro pendiente de OCR de ${expectedId} tiene un formato inválido.`);
    }
    return { title: book['title'], pages: book['pages'] };
  });

  const modules: CurriculumModule[] = value['modules'].map(rawModule => {
    if (!isRecord(rawModule) || typeof rawModule['id'] !== 'string'
      || !['current', 'candidate', 'course'].includes(String(rawModule['kind']))
      || !Array.isArray(rawModule['topics'])) {
      throw new Error(`Un módulo de ${expectedId} tiene un formato inválido.`);
    }
    const topics = rawModule['topics'].map(rawTopic => {
      if (!isRecord(rawTopic) || typeof rawTopic['title'] !== 'string'
        || !['actual', 'actual+libros', 'candidato-libros', 'candidato-cursos'].includes(String(rawTopic['status']))
        || !Array.isArray(rawTopic['sources']) || !Array.isArray(rawTopic['courseSources'])) {
        throw new Error(`Un tema de ${expectedId} tiene un formato inválido.`);
      }

      let current: CurriculumTopic['current'] = null;
      if (rawTopic['current'] !== null) {
        const placement = rawTopic['current'];
        if (!isRecord(placement) || typeof placement['module'] !== 'string'
          || !isNonNegativeInteger(placement['order']) || Number(placement['order']) < 1
          || typeof placement['fragment'] !== 'string') {
          throw new Error(`La ubicación actual de un tema de ${expectedId} tiene un formato inválido.`);
        }
        current = {
          module: placement['module'],
          order: placement['order'],
          fragment: placement['fragment'],
        };
      }

      const isCurrentTopic = current !== null;
      const isCourseCandidate = rawTopic['status'] === 'candidato-cursos';
      const isBookCandidate = rawTopic['status'] === 'candidato-libros';
      if (isCurrentTopic === (isBookCandidate || isCourseCandidate)) {
        throw new Error(`La categoría y ubicación de un tema de ${expectedId} no coinciden.`);
      }

      const sources = rawTopic['sources'].map(rawSource => {
        if (!isRecord(rawSource) || !isNonNegativeInteger(rawSource['bookId'])
          || Number(rawSource['bookId']) >= books.length
          || (rawSource['page'] !== null && (!isNonNegativeInteger(rawSource['page']) || Number(rawSource['page']) < 1))) {
          throw new Error(`Una referencia de página de ${expectedId} tiene un formato inválido.`);
        }
        return { bookId: rawSource['bookId'], page: rawSource['page'] };
      });
      const courseSources = rawTopic['courseSources'].map(rawSource => {
        if (!isRecord(rawSource) || !isNonNegativeInteger(rawSource['courseId'])
          || Number(rawSource['courseId']) >= courses.length) {
          throw new Error(`Una referencia de curso de ${expectedId} tiene un formato inválido.`);
        }
        return { courseId: rawSource['courseId'] };
      });

      return {
        title: rawTopic['title'],
        status: rawTopic['status'] as CurriculumTopic['status'],
        current,
        sources,
        courseSources,
      };
    });

    if (rawModule['topicCount'] !== undefined && rawModule['topicCount'] !== topics.length) {
      throw new Error(`El conteo de temas de ${expectedId}/${rawModule['id']} no coincide.`);
    }
    const kind = rawModule['kind'] as CurriculumModule['kind'];
    const id = rawModule['id'];
    return {
      id,
      kind,
      title: typeof rawModule['title'] === 'string' ? rawModule['title'] : null,
      topicCount: topics.length,
      topics,
    };
  });

  return { stackId: expectedId, modules, books, courses, booksRequiringOcr };
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

@Injectable({ providedIn: 'root' })
export class CurriculumLibraryService {
  private readonly catalogSignal = signal<CurriculumCatalog | null>(null);
  private readonly stackSignals = signal<Record<string, CurriculumStack>>({});
  readonly catalog = this.catalogSignal.asReadonly();
  readonly stacks = this.stackSignals.asReadonly();
  readonly catalogError = signal<string | null>(null);
  readonly stackErrors = signal<Record<string, string>>({});
  readonly isLoadingCatalog = signal(false);
  readonly loadingStacks = signal<Record<string, boolean>>({});
  readonly totalTopics = computed(() => this.catalog()?.summary.provisionalTopics ?? 0);

  private catalogRequest: Promise<void> | null = null;
  private readonly stackRequests = new Map<string, Promise<void>>();

  stack(stackId: string): CurriculumStack | null {
    return this.stackSignals()[stackId] ?? null;
  }

  stackSummary(stackId: string): CurriculumStackSummary | null {
    return this.catalog()?.stacks.find(stack => stack.id === stackId) ?? null;
  }

  loadCatalog(): Promise<void> {
    if (this.catalog()?.stacks.length) return Promise.resolve();
    if (this.catalogRequest) return this.catalogRequest;
    this.isLoadingCatalog.set(true);
    this.catalogError.set(null);
    this.catalogRequest = fetch(new URL('content/curriculum-catalog.json', document.baseURI))
      .then(response => {
        if (!response.ok) throw new Error(`El índice del temario respondió ${response.status}.`);
        return response.json() as Promise<unknown>;
      })
      .then(parseCatalog)
      .then(catalog => this.catalogSignal.set(catalog))
      .catch(error => this.catalogError.set(errorMessage(error, 'No se pudo cargar el índice del temario.')))
      .finally(() => {
        this.isLoadingCatalog.set(false);
        this.catalogRequest = null;
      });
    return this.catalogRequest;
  }

  retryCatalog(): void {
    this.catalogSignal.set(null);
    this.catalogRequest = null;
    void this.loadCatalog();
  }

  loadStack(stackId: string): Promise<void> {
    if (this.stack(stackId)) return Promise.resolve();
    const existing = this.stackRequests.get(stackId);
    if (existing) return existing;
    const summary = this.stackSummary(stackId);
    if (!summary) {
      this.stackErrors.update(errors => ({ ...errors, [stackId]: 'Esta ruta no existe en el índice provisional.' }));
      return Promise.resolve();
    }

    this.loadingStacks.update(loading => ({ ...loading, [stackId]: true }));
    this.stackErrors.update(errors => ({ ...errors, [stackId]: '' }));
    const request = fetch(new URL(summary.asset, document.baseURI))
      .then(response => {
        if (!response.ok) throw new Error(`El temario de ${stackId} respondió ${response.status}.`);
        return response.json() as Promise<unknown>;
      })
      .then(data => parseStack(data, stackId))
      .then(data => this.stackSignals.update(stacks => ({ ...stacks, [stackId]: data })))
      .catch(error => this.stackErrors.update(errors => ({
        ...errors,
        [stackId]: errorMessage(error, `No se pudo cargar el temario de ${stackId}.`),
      })))
      .finally(() => {
        this.loadingStacks.update(loading => ({ ...loading, [stackId]: false }));
        this.stackRequests.delete(stackId);
      });
    this.stackRequests.set(stackId, request);
    return request;
  }

  retryStack(stackId: string): void {
    this.stackErrors.update(errors => ({ ...errors, [stackId]: '' }));
    void this.loadStack(stackId);
  }
}
