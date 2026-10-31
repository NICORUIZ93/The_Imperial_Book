import { TestBed } from '@angular/core/testing';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('stores module, exercise and quiz completion without duplicate entries', () => {
    const service = TestBed.inject(ProgressService);

    service.toggleModuleComplete('java', 0);
    service.completeExercise('java', 0, 'variables-1');
    service.completeExercise('java', 0, 'variables-1');
    expect(service.isModuleComplete('java', 0)).toBe(true);
    expect(service.isExerciseComplete('java', 0, 'variables-1')).toBe(true);
    expect(service.trackProgress('java').completedExercises).toEqual(['0:variables-1']);
    expect(service.percentComplete('java', 15)).toBe(7);
  });

  it('exports and restores a versioned progress backup', () => {
    const service = TestBed.inject(ProgressService);
    service.toggleModuleComplete('java', 2);
    service.completeExercise('java', 2, 'fetch-lazy');
    const backup = service.exportProgress();

    localStorage.clear();
    const restored = new ProgressService();
    restored.importProgress(backup);

    expect(restored.isModuleComplete('java', 2)).toBe(true);
    expect(restored.isExerciseComplete('java', 2, 'fetch-lazy')).toBe(true);
    expect(JSON.parse(localStorage.getItem('academia-progress-v2') ?? '{}').java.completedModules).toEqual([2]);
  });

  it('rejects an invalid backup without changing current progress', () => {
    const service = TestBed.inject(ProgressService);
    service.toggleModuleComplete('java', 1);

    expect(() => service.importProgress('not json')).toThrowError('El archivo no contiene JSON válido.');
    expect(() => service.importProgress(JSON.stringify({
      format: 'academia-floci-progress',
      version: 1,
      exportedAt: new Date().toISOString(),
      tracks: { java: { completedModules: ['invalid'], completedExercises: [] } },
    }))).toThrowError('La copia contiene progreso inválido para la ruta "java".');
    expect(service.isModuleComplete('java', 1)).toBe(true);
  });

  it('rejects backups larger than 1 MB', () => {
    const service = TestBed.inject(ProgressService);
    const backup = JSON.stringify({
      format: 'academia-floci-progress',
      version: 1,
      exportedAt: new Date().toISOString(),
      tracks: {},
      padding: 'x'.repeat(1_000_000),
    });

    expect(() => service.importProgress(backup)).toThrowError('El archivo supera el tamaño máximo de 1 MB.');
  });
});
