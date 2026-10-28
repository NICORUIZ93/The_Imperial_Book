import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CloudCog, LucideAngularModule, LucideIconData, Moon, Sun } from 'lucide-angular';
import { TRACKS } from '../course-data';
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
  readonly icons = { Sun, Moon };
  readonly themeService = inject(ThemeService);
  readonly topicIndex = inject(TopicIndexService);
  readonly officialUpdates = OFFICIAL_UPDATES;
  readonly backupStatus = signal('');

  constructor(private readonly progressService: ProgressService) {}

  readonly cards = computed<TrackCard[]>(() =>
    TRACKS.map(track => ({
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
    }))
  );

  readonly featuredTracks = computed(() => this.cards().filter(card => ['rutaflow', 'cloud', 'devops'].includes(card.id)));
  readonly foundationTracks = computed(() => this.cards().filter(card => ['foundations', 'javascript', 'java', 'node', 'angular', 'react', 'spring-boot'].includes(card.id)));
  readonly mobileTracks = computed(() => this.cards().filter(card => ['flutter', 'android', 'ios', 'kotlin-multiplatform'].includes(card.id)));

  trackGroups() {
    return [
      { title: 'Recomendados', cards: this.featuredTracks() },
      { title: 'Lenguajes y frameworks', cards: this.foundationTracks() },
      { title: 'Móvil', cards: this.mobileTracks() },
    ];
  }

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
