import { TRACK_PROJECTS } from './learning-activities';

describe('Learning activities', () => {
  it('defines one complete project for each specialization track', () => {
    expect(TRACK_PROJECTS).toHaveLength(14);
    expect(new Set(TRACK_PROJECTS.map(project => project.trackId)).size).toBe(14);
    TRACK_PROJECTS.forEach(project => {
      expect(project.milestones).toHaveLength(4);
      expect(project.verification).toHaveLength(4);
      expect(project.deliverable.length).toBeGreaterThan(40);
    });
  });
});
