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
  { trackId: 'git', source: 'Pro Git (git-scm.com)', sourceUrl: 'https://git-scm.com/book/es/v2' },
  { trackId: 'linux', source: 'The Linux Command Line y documentación de Ubuntu', sourceUrl: 'https://ubuntu.com/tutorials/command-line-for-beginners' },
  { trackId: 'sql', source: 'Documentación de PostgreSQL', sourceUrl: 'https://www.postgresql.org/docs/current/tutorial.html' },
  { trackId: 'arquitectura', source: 'Microsoft Azure Architecture Center', sourceUrl: 'https://learn.microsoft.com/es-es/azure/architecture/' },
  { trackId: 'seguridad', source: 'OWASP Top 10', sourceUrl: 'https://owasp.org/www-project-top-ten/' },
  { trackId: 'typescript', source: 'Manual de TypeScript', sourceUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
  { trackId: 'kotlin', source: 'Kotlin docs', sourceUrl: 'https://kotlinlang.org/docs/getting-started.html' },
  { trackId: 'docker', source: 'Documentación de Docker', sourceUrl: 'https://docs.docker.com/get-started/' },
  { trackId: 'kubernetes', source: 'Tutoriales de Kubernetes', sourceUrl: 'https://kubernetes.io/docs/tutorials/' },
  { trackId: 'cicd', source: 'Documentación de GitHub Actions', sourceUrl: 'https://docs.github.com/actions' },
  { trackId: 'iac', source: 'Tutoriales de Terraform', sourceUrl: 'https://developer.hashicorp.com/terraform/tutorials' },
  { trackId: 'observabilidad', source: 'Documentación de OpenTelemetry', sourceUrl: 'https://opentelemetry.io/docs/' },
  { trackId: 'mensajeria', source: 'Documentación de Apache Kafka', sourceUrl: 'https://kafka.apache.org/documentation/' },
  { trackId: 'microservicios', source: 'Spring Cloud y Node.js', sourceUrl: 'https://spring.io/projects/spring-cloud' },
  { trackId: 'cloud', source: 'AWS, Microsoft Learn y Google Cloud Training', sourceUrl: 'https://aws.amazon.com/training/learn-about/' },
];

export const findOfficialLearningPath = (trackId: string): OfficialLearningPath | undefined =>
  OFFICIAL_LEARNING_PATHS.find(path => path.trackId === trackId);
