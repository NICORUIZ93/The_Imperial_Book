import { ACADEMY_STAGES, TRACK_PREREQUISITES, academyTrackPosition, stageForTrack } from './learning-paths';
import { TRACKS } from './course-data';

describe('academy learning sequence', () => {
  it('places every course exactly once', () => {
    const sequenced = ACADEMY_STAGES.flatMap(stage => stage.trackIds);
    expect(new Set(sequenced).size).toBe(sequenced.length);
    expect([...sequenced].sort()).toEqual(TRACKS.map(track => track.id).sort());
  });

  it('places prerequisites before their dependent course', () => {
    for (const [trackId, prerequisites] of Object.entries(TRACK_PREREQUISITES)) {
      for (const prerequisite of prerequisites) {
        expect(academyTrackPosition(prerequisite)).toBeLessThan(academyTrackPosition(trackId));
      }
    }
  });

  it('keeps frameworks and distributed systems in explicit stages', () => {
    expect(stageForTrack('angular')?.id).toBe('applications');
    expect(stageForTrack('spring-microservices')?.id).toBe('systems');
    expect(stageForTrack('node-microservices')?.id).toBe('systems');
    expect(stageForTrack('rutaflow')?.id).toBe('capstone');
  });
});
