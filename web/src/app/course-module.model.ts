export interface CourseModule {
  id: number;
  title: string;
  shortTitle: string;
  level: 'Fundamentos' | 'Aplicación' | 'Integración' | 'Experto';
  duration: string;
  description: string;
  concepts: string[];
  challenges: string[];
  questions: string[];
  services: string[];
  deliverable: string;
  color: string;
  clouds?: ('aws' | 'azure' | 'gcp')[];
}

export const courseLevelLabel = (level: CourseModule['level']): string =>
  level === 'Experto' ? 'Especialización (objetivo)' : level;

export interface Track {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  color: string;
  icon: string;
  modules: CourseModule[];
}

export const createModule = (
  id: number, title: string, shortTitle: string,
  level: CourseModule['level'], duration: string, color: string,
  description: string, concepts: string[], challenges: string[],
  questions: string[], services: string[], deliverable: string,
  clouds: ('aws' | 'azure' | 'gcp')[] = []
): CourseModule => ({ id, title, shortTitle, level, duration, color, description, concepts, challenges, questions, services, deliverable, clouds });
