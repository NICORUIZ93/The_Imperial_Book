import { describe, expect, it } from 'vitest';
import { applyRenumberings, latestRenumberingVersion, RENUMBERING_STEPS, RenumberingStep } from './module-renumbering';

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

  it('renombra temas con claves completas, también hacia otro módulo, sin tocar módulos ni ejercicios', () => {
    const conTemas: RenumberingStep[] = [
      { version: 1, tracks: {}, topics: { react: { '2:tema-2-a': '2:tema-3-a', '14:tema-1-b': '10:tema-3-b' } } },
    ];
    const inicial = {
      react: { completedModules: [2, 14], completedExercises: ['2:e'], completedTopics: ['2:tema-2-a', '14:tema-1-b', '2:tema-1-c'] },
    };
    const out = applyRenumberings(inicial, 0, conTemas);
    expect(out['react'].completedTopics).toEqual(['2:tema-3-a', '10:tema-3-b', '2:tema-1-c']);
    expect(out['react'].completedModules).toEqual([2, 14]);
    expect(out['react'].completedExercises).toEqual(['2:e']);
  });

  it('specs/020: conserva el progreso de Spring Boot (27 → 21 módulos) y de los temas movidos de Java', () => {
    const inicial = {
      'spring-boot': {
        completedModules: [17, 21, 26],
        completedExercises: [],
        completedTopics: ['17:tema-2-transactional-rollback-y-limites-de-transaccion', '25:tema-1-bindings-y-destinations'],
      },
      java: { completedModules: [7], completedExercises: [], completedTopics: ['7:tema-1-record-modelos-inmutables-sin-boilerplate'] },
    };
    const out = applyRenumberings(inicial, 0, RENUMBERING_STEPS);
    expect(out['spring-boot'].completedModules).toEqual([3, 10, 9]);
    expect(out['spring-boot'].completedTopics).toEqual([
      '3:tema-3-transactional-rollback-y-limites-de-transaccion',
      '11:tema-4-bindings-y-destinations',
    ]);
    expect(out['java'].completedModules).toEqual([7]);
    expect(out['java'].completedTopics).toEqual(['1:tema-5-record-modelos-inmutables-sin-boilerplate']);
  });

  it('reestructuración v5–v6: el progreso de DevOps y de los microservicios llega a sus cursos nuevos', () => {
    const viejo = {
      devops: { completedModules: [1, 6], completedExercises: [], completedTopics: ['1:tema-1-x', '6:tema-2-y'] },
      'spring-microservices': { completedModules: [0, 7], completedExercises: [], completedTopics: [] },
      android: { completedModules: [0, 1], completedExercises: [], completedTopics: [] },
    };
    const out = applyRenumberings(viejo, 4);
    expect(out['git'].completedModules).toEqual([0]);
    expect(out['git'].completedTopics).toEqual(['0:tema-1-x']);
    expect(out['kubernetes'].completedModules).toEqual([0]);
    expect(out['microservicios'].completedModules).toEqual([14]);
    expect(out['kotlin'].completedModules).toEqual([0]);
    expect(out['android'].completedModules).toEqual([0]);
    expect(out['devops']?.completedModules ?? []).toEqual([]);
    expect(Object.keys(out).filter(id => id.startsWith('__v5__') && out[id].completedModules.length)).toEqual([]);
  });
});
