import { CommonModule } from '@angular/common';
import { Component, Input, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { CourseModule, findTrack } from '../course-data';
import { courseLevelLabel } from '../course-module.model';
import { ProgressService } from '../progress.service';
import { IndexedTopic, TopicIndexService } from '../topic-index.service';

interface LevelGroup {
  level: CourseModule['level'];
  modules: CourseModule[];
}

export type ModuleStatus = 'done' | 'current' | 'pending';

const LEVEL_ORDER: CourseModule['level'][] = ['Fundamentos', 'Aplicación', 'Integración', 'Experto'];

@Component({
  selector: 'app-lesson-index',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './lesson-index.html',
  styleUrl: './lesson-index.scss',
})
export class LessonIndexComponent {
  @Input({ required: true }) trackId!: string;
  private readonly router = inject(Router);
  readonly topicIndex = inject(TopicIndexService);
  readonly topicQuery = signal('');
  readonly levelLabel = courseLevelLabel;

  readonly track = computed(() => findTrack(this.trackId));

  readonly groups = computed<LevelGroup[]>(() => {
    const modules = this.track()?.modules ?? [];
    return LEVEL_ORDER
      .map(level => ({ level, modules: modules.filter(m => m.level === level) }))
      .filter(group => group.modules.length > 0);
  });

  /** Módulo actualmente abierto, derivado de la URL (/curso/:trackId/:moduleId). */
  private readonly currentModuleId = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.extractModuleId(this.router.url)),
      startWith(this.extractModuleId(this.router.url)),
    ),
    { initialValue: this.extractModuleId(this.router.url) },
  );

  constructor(readonly progressService: ProgressService) {}

  topics(moduleId: number): IndexedTopic[] {
    const topics = this.topicIndex.topics(this.trackId, moduleId);
    const query = this.normalize(this.topicQuery());
    return query ? topics.filter(topic => this.normalize(topic.title).includes(query)) : topics;
  }

  moduleMatches(module: CourseModule): boolean {
    const query = this.normalize(this.topicQuery());
    if (!query) return true;
    return this.normalize(`${module.title} ${module.shortTitle}`).includes(query) || this.topics(module.id).length > 0;
  }

  hasSearchMatches(): boolean {
    return this.groups().some(group => group.modules.some(module => this.moduleMatches(module)));
  }

  updateQuery(event: Event): void {
    this.topicQuery.set((event.target as HTMLInputElement).value);
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  }

  private extractModuleId(url: string): number | null {
    const match = url.match(/\/curso\/[^/]+\/(\d+)/);
    return match ? Number(match[1]) : null;
  }

  isDone(moduleId: number): boolean {
    return this.progressService.isModuleComplete(this.trackId, moduleId);
  }

  status(moduleId: number): ModuleStatus {
    if (this.isDone(moduleId)) return 'done';
    if (this.currentModuleId() === moduleId) return 'current';
    return 'pending';
  }
}
