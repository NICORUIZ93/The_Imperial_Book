import { Injectable, signal } from '@angular/core';
import { TRACKS } from './course-data';

export interface TrackProgress {
  completedModules: number[];
  completedExercises: string[];
}

type ProgressState = Record<string, TrackProgress>;

const EMPTY_TRACK_PROGRESS: TrackProgress = {
  completedModules: [],
  completedExercises: [],
};
const STORAGE_KEY = 'academia-progress-v2';
const LEGACY_CLOUD_KEY = 'cloud-local-academy-progress';
const BACKUP_FORMAT = 'academia-floci-progress';
const BACKUP_VERSION = 1;
const MAX_BACKUP_BYTES = 1_000_000;

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private state = signal<ProgressState>(this.loadInitialState());

  private loadInitialState(): ProgressState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ProgressState;
    } catch {
      // localStorage corrupto: se ignora y se continúa con estado vacío
    }
    return this.migrateLegacyCloudProgress();
  }

  /** Migra una sola vez el progreso pre-existente (solo Cloud) al nuevo esquema multi-track. */
  private migrateLegacyCloudProgress(): ProgressState {
    try {
      const legacyRaw = localStorage.getItem(LEGACY_CLOUD_KEY);
      if (!legacyRaw) return {};
      const legacy = JSON.parse(legacyRaw) as Partial<TrackProgress>;
      const migrated: ProgressState = {
        cloud: {
          completedModules: legacy.completedModules ?? [],
          completedExercises: [],
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch {
      return {};
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
  }

  exportProgress(): string {
    return JSON.stringify({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      tracks: this.state(),
    }, null, 2);
  }

  importProgress(raw: string): void {
    if (new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES) {
      throw new Error('El archivo supera el tamaño máximo de 1 MB.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('El archivo no contiene JSON válido.');
    }

    const progress = this.validateBackup(parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    this.state.set(progress);
  }

  private validateBackup(value: unknown): ProgressState {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('La copia no tiene un formato reconocido.');
    }
    const backup = value as Record<string, unknown>;
    if (
      backup['format'] !== BACKUP_FORMAT ||
      backup['version'] !== BACKUP_VERSION ||
      typeof backup['exportedAt'] !== 'string' ||
      Number.isNaN(Date.parse(backup['exportedAt'])) ||
      !backup['tracks'] ||
      typeof backup['tracks'] !== 'object' ||
      Array.isArray(backup['tracks'])
    ) {
      throw new Error('La copia no tiene un formato o versión compatibles.');
    }

    const tracks: ProgressState = {};
    const entries = Object.entries(backup['tracks']);
    const modulesByTrack = new Map(TRACKS.map(track => [track.id, track.modules.length]));
    if (entries.length > 100) {
      throw new Error('La copia contiene demasiadas rutas.');
    }
    for (const [trackId, progress] of entries) {
      const totalModules = modulesByTrack.get(trackId);
      if (!totalModules || !progress || typeof progress !== 'object' || Array.isArray(progress)) {
        throw new Error('La copia contiene datos de ruta inválidos.');
      }
      const track = progress as Record<string, unknown>;
      const modules = track['completedModules'];
      const exercises = track['completedExercises'];
      if (
        !Array.isArray(modules) ||
        modules.length > totalModules ||
        !modules.every(id => Number.isSafeInteger(id) && id >= 0 && id < totalModules) ||
        new Set(modules).size !== modules.length ||
        !Array.isArray(exercises) ||
        exercises.length > 10_000 ||
        !exercises.every(key => {
          if (typeof key !== 'string') return false;
          const match = /^(\d+):.{1,200}$/.exec(key);
          return !!match && Number.isSafeInteger(Number(match[1])) && Number(match[1]) < totalModules;
        }) ||
        new Set(exercises).size !== exercises.length
      ) {
        throw new Error(`La copia contiene progreso inválido para la ruta "${trackId}".`);
      }
      tracks[trackId] = {
        completedModules: modules,
        completedExercises: exercises,
      };
    }
    return tracks;
  }

  trackProgress(trackId: string): TrackProgress {
    return { ...EMPTY_TRACK_PROGRESS, ...(this.state()[trackId] ?? {}) };
  }

  isModuleComplete(trackId: string, moduleId: number): boolean {
    return this.trackProgress(trackId).completedModules.includes(moduleId);
  }

  percentComplete(trackId: string, totalModules: number): number {
    if (!totalModules) return 0;
    return Math.round((this.trackProgress(trackId).completedModules.length / totalModules) * 100);
  }

  toggleModuleComplete(trackId: string, moduleId: number): void {
    const current = this.trackProgress(trackId);
    const completedModules = current.completedModules.includes(moduleId)
      ? current.completedModules.filter(id => id !== moduleId)
      : [...current.completedModules, moduleId];
    this.state.update(s => ({ ...s, [trackId]: { ...current, completedModules } }));
    this.persist();
  }

  isExerciseComplete(trackId: string, moduleId: number, exerciseId: string): boolean {
    return this.trackProgress(trackId).completedExercises.includes(`${moduleId}:${exerciseId}`);
  }

  completeExercise(trackId: string, moduleId: number, exerciseId: string): void {
    const current = this.trackProgress(trackId);
    const key = `${moduleId}:${exerciseId}`;
    if (current.completedExercises.includes(key)) return;
    this.state.update(state => ({
      ...state,
      [trackId]: { ...current, completedExercises: [...current.completedExercises, key] },
    }));
    this.persist();
  }

  nextPendingModuleId(trackId: string, totalModules: number): number {
    const completed = this.trackProgress(trackId).completedModules;
    for (let id = 0; id < totalModules; id++) {
      if (!completed.includes(id)) return id;
    }
    return Math.max(0, totalModules - 1);
  }
}
