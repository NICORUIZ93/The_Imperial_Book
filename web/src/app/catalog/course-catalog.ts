import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CloudCog, Search, BookOpen, ArrowUpRight, LucideAngularModule, LucideIconData, Moon, Sun } from 'lucide-angular';
import { TRACKS } from '../course-data';
import { TRACK_GUIDES } from '../track-guides';
import { CommandPaletteService } from '../command-palette.service';
import { TRACK_ICONS, TRACK_MARKS } from '../icon-registry';
import { OFFICIAL_UPDATES } from '../official-updates';
import { ProgressService } from '../progress.service';
import { ThemeService } from '../theme.service';
import { TopicIndexService } from '../topic-index.service';

interface TrackCard {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  color: string;
  icon: LucideIconData;
  mark: string;
  logo: string | null;
  moduleCount: number;
  percent: number;
  totalHours: string;
  levels: string;
  modules: string[];
  outcome: string;
  category: string;
  topicCount: number;
  nextModuleId: number;
  guide: typeof TRACK_GUIDES[string];
}

/** Biblioteca de cursos: cada track es un libro con capítulos (módulos). */
@Component({
  selector: 'app-course-catalog',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './course-catalog.html',
  styleUrl: './course-catalog.scss',
})
export class CourseCatalogComponent {
  readonly brandIcon = CloudCog;
  readonly icons = { Sun, Moon, Search, BookOpen, ArrowUpRight };
  readonly palette = inject(CommandPaletteService);
  readonly query = signal('');
  readonly category = signal('all');
  readonly categories = [
    { id: 'all', label: 'Todos los cursos' }, { id: 'base', label: 'Desde cero' },
    { id: 'web', label: 'Desarrollo web' }, { id: 'backend', label: 'Backend' },
    { id: 'mobile', label: 'Aplicaciones móviles' }, { id: 'platform', label: 'Cloud y DevOps' },
    { id: 'project', label: 'Proyecto RutaFlow' },
  ];
  readonly themeService = inject(ThemeService);
  readonly topicIndex = inject(TopicIndexService);
  readonly officialUpdates = OFFICIAL_UPDATES;
  readonly backupStatus = signal('');

  constructor(private readonly progressService: ProgressService) {}

  readonly cards = computed<TrackCard[]>(() =>
    [...TRACKS].sort((a, b) => ['foundations', 'javascript', 'java', 'angular', 'react', 'node', 'spring-boot', 'flutter', 'android', 'ios', 'kotlin-multiplatform', 'cloud', 'devops', 'rutaflow'].indexOf(a.id) - ['foundations', 'javascript', 'java', 'angular', 'react', 'node', 'spring-boot', 'flutter', 'android', 'ios', 'kotlin-multiplatform', 'cloud', 'devops', 'rutaflow'].indexOf(b.id)).map(track => ({
      id: track.id,
      name: track.name,
      shortName: track.shortName,
      tagline: track.tagline,
      color: track.color,
      icon: TRACK_ICONS[track.icon],
      mark: TRACK_MARKS[track.id],
      logo: track.id === 'rutaflow' ? null : `brands/${track.id}.svg`,
      moduleCount: track.modules.length,
      percent: this.percentFor(track.id, track.modules.length),
      totalHours: this.totalHours(track.modules),
      levels: [...new Set(track.modules.map(module => module.level))].join(' → '),
      modules: track.modules.map(module => module.shortTitle),
      outcome: track.modules.at(-1)?.deliverable ?? 'Proyecto final de la ruta.',
      category: TRACK_GUIDES[track.id].category,
      topicCount: Object.values(this.topicIndex.data()[track.id] ?? {}).reduce((n, topics) => n + topics.length, 0),
      nextModuleId: this.progressService.nextPendingModuleId(track.id, track.modules.length),
      guide: TRACK_GUIDES[track.id],
    }))
  );

  readonly featuredTracks = computed(() => this.cards().filter(card => ['rutaflow', 'cloud', 'devops'].includes(card.id)));
  readonly foundationTracks = computed(() => this.cards().filter(card => ['foundations', 'javascript', 'java', 'node', 'angular', 'react', 'spring-boot'].includes(card.id)));
  readonly mobileTracks = computed(() => this.cards().filter(card => ['flutter', 'android', 'ios', 'kotlin-multiplatform'].includes(card.id)));

  readonly filteredCards = computed(() => {
    const query = this.normalize(this.query());
    return this.cards().filter(card =>
      (this.category() === 'all' || card.category === this.category()) &&
      (!query || this.normalize([card.name, card.tagline, ...card.modules, ...card.guide.skills].join(' ')).includes(query) ||
        this.topicIndex.allTopics().some(topic => topic.trackId === card.id && this.normalize(topic.title).includes(query)))
    );
  });

  trackGroups() {
    return [{ title: this.categories.find(category => category.id === this.category())?.label ?? 'Cursos', cards: this.filteredCards() }];
  }

  categoryCount(id: string): number { return this.cards().filter(card => id === 'all' || card.category === id).length; }
  updateQuery(event: Event): void { this.query.set((event.target as HTMLInputElement).value); }
  clearFilters(): void { this.query.set(''); this.category.set('all'); }
  private normalize(value: string): string { return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim(); }

  readonly resumableTracks = computed(() => TRACKS.flatMap(track => {
    const completed = this.progressService.trackProgress(track.id).completedModules;
    if (!completed.length) return [];
    const module = track.modules.find(module => !completed.includes(module.id));
    return module ? [{ trackId: track.id, name: track.shortName, module }] : [];
  }));

  readonly totalModules = computed(() => this.cards().reduce((sum, card) => sum + card.moduleCount, 0));

  private percentFor(trackId: string, totalModules: number): number {
    return this.progressService.percentComplete(trackId, totalModules);
  }

  private totalHours(modules: { duration: string }[]): string {
    const total = modules.reduce((sum, module) => {
      const match = module.duration.match(/(\d+(?:[.,]\d+)?)/);
      return sum + (match ? Number(match[1].replace(',', '.')) : 0);
    }, 0);
    return `${Math.round(total)} h`;
  }

  downloadProgressBackup(): void {
    try {
      const blob = new Blob([this.progressService.exportProgress()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'the-imperial-book-progreso.json';
      link.click();
      URL.revokeObjectURL(url);
      this.backupStatus.set('Copia de progreso descargada.');
    } catch (error) {
      this.backupStatus.set(error instanceof Error ? `No se pudo exportar: ${error.message}` : 'No se pudo exportar la copia de progreso.');
    }
  }

  async restoreProgress(fileInput: HTMLInputElement): Promise<void> {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      if (file.size > 1_000_000) {
        throw new Error('El archivo supera el tamaño máximo de 1 MB.');
      }
      this.progressService.importProgress(await file.text());
      this.backupStatus.set('Progreso restaurado y aplicado a las rutas.');
    } catch (error) {
      this.backupStatus.set(error instanceof Error ? `No se pudo restaurar: ${error.message}` : 'No se pudo restaurar la copia de progreso.');
    } finally {
      fileInput.value = '';
    }
  }
}
