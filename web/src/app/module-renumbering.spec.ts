import { describe, expect, it } from 'vitest';
import { applyRenumberings, latestRenumberingVersion, RenumberingStep } from './module-renumbering';

const steps: RenumberingStep[] = [
  { version: 1, tracks: { flutter: { 18: 13, 19: 14 } } },
  { version: 2, tracks: { flutter: { 20: 15 } } },
];

describe('module-renumbering', () => {
  const state = {
    flutter: { completedModules: [13, 18, 20], completedExercises: ['19:a'], completedTopics: ['18:Tema 1', '2:x'] },
    java: { completedModules: [18], completedExercises: [], completedTopics: ['18:t'] },
  };

  it('traduce módulos, ejercicios y temas del curso afectado y no toca los demás', () => {
    const out = applyRenumberings(state, 0, steps);
    expect(out['flutter'].completedModules).toEqual([13, 15]);
    expect(out['flutter'].completedExercises).toEqual(['14:a']);
    expect(out['flutter'].completedTopics).toEqual(['13:Tema 1', '2:x']);
    expect(out['java']).toBe(state.java);
  });

  it('solo aplica los pasos posteriores a la versión ya aplicada', () => {
    const out = applyRenumberings(state, 1, steps);
    expect(out['flutter'].completedModules).toEqual([13, 18, 15]);
    expect(latestRenumberingVersion(steps)).toBe(2);
  });
});
