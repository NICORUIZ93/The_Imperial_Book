export interface OfficialLearningPath {
  trackId: string;
  source: string;
  sourceUrl: string;
}

/**
 * Cita a la guía oficial externa de cada stack. El orden/agrupación de módulos
 * por etapa vive en un solo lugar (CourseModule['level'], ver lesson-index.ts) --
 * esta lista ya no duplica esa taxonomía, solo conserva la atribución de fuente.
 */
export const OFFICIAL_LEARNING_PATHS: OfficialLearningPath[] = [
  { trackId: 'foundations', source: 'MDN Curriculum y SWEBOK', sourceUrl: 'https://developer.mozilla.org/en-US/curriculum/' },
  { trackId: 'rutaflow', source: 'Proyecto integrador basado en las guías oficiales de los 12 stacks', sourceUrl: 'https://developer.mozilla.org/en-US/curriculum/' },
  { trackId: 'javascript', source: 'MDN Learn Web Development', sourceUrl: 'https://developer.mozilla.org/en-US/docs/Learn_web_development' },
  { trackId: 'node', source: 'Node.js Learn', sourceUrl: 'https://nodejs.org/en/learn' },
  { trackId: 'angular', source: 'Angular Tutorials', sourceUrl: 'https://angular.dev/tutorials' },
  { trackId: 'react', source: 'React Learn', sourceUrl: 'https://react.dev/learn' },
  { trackId: 'java', source: 'Dev.java Learn', sourceUrl: 'https://dev.java/learn/' },
  { trackId: 'spring-boot', source: 'Spring Guides', sourceUrl: 'https://spring.io/guides' },
  { trackId: 'kotlin-multiplatform', source: 'Kotlin Multiplatform Get started', sourceUrl: 'https://kotlinlang.org/docs/multiplatform/get-started.html' },
  { trackId: 'android', source: 'Android Basics with Compose', sourceUrl: 'https://developer.android.com/courses/android-basics-compose/course' },
  { trackId: 'ios', source: 'Apple App Dev Tutorials', sourceUrl: 'https://developer.apple.com/tutorials/app-dev-training' },
  { trackId: 'flutter', source: 'Dart and Flutter learning pathway', sourceUrl: 'https://docs.flutter.dev/learn' },
  { trackId: 'devops', source: 'Docker, Kubernetes, Terraform y OpenTelemetry', sourceUrl: 'https://kubernetes.io/docs/tutorials/' },
  { trackId: 'cloud', source: 'AWS, Microsoft Learn y Google Cloud Training', sourceUrl: 'https://aws.amazon.com/training/learn-about/' },
];

export const findOfficialLearningPath = (trackId: string): OfficialLearningPath | undefined =>
  OFFICIAL_LEARNING_PATHS.find(path => path.trackId === trackId);
