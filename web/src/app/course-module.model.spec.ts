import { courseLevelLabel } from './course-module.model';

describe('courseLevelLabel', () => {
  it('presents the expert tier as an intended specialization, not a credential', () => {
    expect(courseLevelLabel('Experto')).toBe('Especialización (objetivo)');
  });

  it('keeps the existing labels for earlier study stages', () => {
    expect(courseLevelLabel('Fundamentos')).toBe('Fundamentos');
    expect(courseLevelLabel('Aplicación')).toBe('Aplicación');
    expect(courseLevelLabel('Integración')).toBe('Integración');
  });
});
