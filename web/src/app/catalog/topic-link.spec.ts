import { CurriculumTopic } from '../curriculum-library.service';
import { topicRoute } from './curriculum-library';

describe('enlace del temario con el visor (specs/025 C1)', () => {
  const topic: CurriculumTopic = {
    title: 'Computador, sistema operativo, programa y proceso',
    status: 'actual',
    current: { module: '0', order: 1, fragment: 'tema-1-computador' },
    sources: [],
    courseSources: [],
  };

  it('pasa el orden como índice numérico 1-based', () => {
    expect(topicRoute('foundations', topic)).toEqual(['/curso', 'foundations', '0', 'tema', '1']);
  });

  it('no devuelve enlace para un tema sin lección', () => {
    expect(topicRoute('foundations', { ...topic, current: null })).toBeNull();
  });
});
