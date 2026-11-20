import { courseLevelLabel } from './course-module.model';

describe('courseLevelLabel', () => {
  it('presents the expert tier as an intended specialization, not a credential', () => {
    expect(courseLevelLabel('Experto')).toBe('4 · Diagnóstico y decisión profesional');
  });

  it('keeps the existing labels for earlier study stages', () => {
    expect(courseLevelLabel('Fundamentos')).toBe('1 · Fundamentos');
    expect(courseLevelLabel('Aplicación')).toBe('2 · Práctica guiada');
    expect(courseLevelLabel('Integración')).toBe('3 · Integración y proyecto');
  });
});
