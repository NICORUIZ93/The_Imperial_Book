import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArrowRight, BookOpen, Check, Clock3, LucideAngularModule, Play, Target } from 'lucide-angular';
import { map } from 'rxjs';
import { CourseModule, findTrack } from '../course-data';
import { TRACK_GUIDES } from '../track-guides';
import { projectFor } from '../learning-activities';
import { ProgressService } from '../progress.service';
import { TopicIndexService } from '../topic-index.service';

type ModuleStatus = 'next' | 'in-progress' | 'done' | 'available';

interface ModuleGroup {
  level: CourseModule['level'];
  modules: CourseModule[];
}

@Component({
  selector: 'app-track-overview',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './track-overview.html',
  styleUrl: './track-overview.scss',
})
export class TrackOverviewComponent {
  readonly icons = { ArrowRight, BookOpen, Check, Clock3, Play, Target };
  readonly topicIndex = inject(TopicIndexService);
  readonly progressService = inject(ProgressService);
  private readonly route = inject(ActivatedRoute);

  readonly trackId = toSignal(
    this.route.parent!.paramMap.pipe(map(params => params.get('trackId') ?? '')),
    { initialValue: this.route.parent?.snapshot.paramMap.get('trackId') ?? '' },
  );
  readonly track = computed(() => findTrack(this.trackId()));
  readonly guide = computed(() => TRACK_GUIDES[this.trackId()]);
  readonly project = computed(() => projectFor(this.trackId()));
  readonly percent = computed(() => {
    const track = this.track();
    return track ? this.progressService.percentComplete(track.id, track.modules.length) : 0;
  });
  readonly nextModuleId = computed(() => {
    const track = this.track();
    return track ? this.progressService.nextPendingModuleId(track.id, track.modules.length) : 0;
  });
  readonly groups = computed<ModuleGroup[]>(() => {
    const track = this.track();
    if (!track) return [];
    const order: CourseModule['level'][] = ['Fundamentos', 'Aplicación', 'Integración', 'Experto'];
    return order
      .map(level => ({ level, modules: track.modules.filter(module => module.level === level) }))
      .filter(group => group.modules.length > 0);
  });

  topicCount(moduleId: number): number {
    return this.topicIndex.topics(this.trackId(), moduleId).length;
  }

  status(moduleId: number): ModuleStatus {
    const track = this.track();
    if (!track) return 'available';
    if (this.progressService.isModuleComplete(track.id, moduleId)) return 'done';
    if (moduleId === this.nextModuleId()) return 'next';
    const modulePosition = track.modules.findIndex(module => module.id === moduleId);
    const nextPosition = track.modules.findIndex(module => module.id === this.nextModuleId());
    if (modulePosition >= 0 && nextPosition >= 0 && modulePosition < nextPosition) return 'in-progress';
    return 'available';
  }

  statusLabel(moduleId: number): string {
    return {
      next: 'Siguiente',
      'in-progress': 'En curso',
      done: 'Completado',
      available: 'Disponible',
    }[this.status(moduleId)];
  }

  moduleIndex(moduleId: number): number {
    return (this.track()?.modules.findIndex(module => module.id === moduleId) ?? 0) + 1;
  }

  totalTopics(): number {
    return this.track()?.modules.reduce((total, module) => total + this.topicCount(module.id), 0) ?? 0;
  }

  private durationValue(duration: string): number {
    const match = duration.match(/(\d+(?:[.,]\d+)?)/);
    return match ? Number(match[1].replace(',', '.')) : 0;
  }

  moduleHours(modules: CourseModule[]): string {
    const hours = modules.reduce((total, module) => total + this.durationValue(module.duration), 0);
    return `${Math.round(hours)} h`;
  }
}
