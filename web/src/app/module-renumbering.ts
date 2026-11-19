import type { TrackProgress } from './progress.service';

/**
 * Renumeraciones de módulos (specs/016). Cuando un curso fusiona o mueve módulos, se agrega aquí un paso
 * con la traducción `id antiguo → id nuevo` de cada curso afectado. El progreso guardado del estudiante se
 * traduce una sola vez por paso, en orden, para que no pierda lo que ya completó.
 */
export interface RenumberingStep {
  /** Número creciente; el progreso guarda el último paso aplicado. */
  version: number;
  /** Por curso: módulo antiguo → módulo nuevo. Los módulos que no aparecen conservan su id. */
  tracks: Record<string, Record<number, number>>;
}

export const RENUMBERING_STEPS: RenumberingStep[] = [];

export const RENUMBERING_VERSION_KEY = 'imperial-book-renumbering-version';

function translateKey(key: string, map: Record<number, number>): string {
  const match = /^(\d+):(.*)$/s.exec(key);
  if (!match) return key;
  const moved = map[Number(match[1])];
  return moved === undefined ? key : `${moved}:${match[2]}`;
}

/** Aplica, en orden, los pasos posteriores a `fromVersion`. Devuelve el progreso traducido. */
export function applyRenumberings(
  state: Record<string, TrackProgress>,
  fromVersion: number,
  steps: RenumberingStep[] = RENUMBERING_STEPS,
): Record<string, TrackProgress> {
  let result = state;
  for (const step of steps.filter(s => s.version > fromVersion).sort((a, b) => a.version - b.version)) {
    const next: Record<string, TrackProgress> = { ...result };
    for (const [trackId, map] of Object.entries(step.tracks)) {
      const current = result[trackId];
      if (!current) continue;
      next[trackId] = {
        completedModules: [...new Set(current.completedModules.map(id => map[id] ?? id))],
        completedExercises: [...new Set(current.completedExercises.map(k => translateKey(k, map)))],
        completedTopics: [...new Set(current.completedTopics.map(k => translateKey(k, map)))],
      };
    }
    result = next;
  }
  return result;
}

export function latestRenumberingVersion(steps: RenumberingStep[] = RENUMBERING_STEPS): number {
  return steps.reduce((max, s) => Math.max(max, s.version), 0);
}
