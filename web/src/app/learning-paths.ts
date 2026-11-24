export interface AcademyStage {
  id: string;
  number: string;
  title: string;
  description: string;
  trackIds: string[];
}

/**
 * Orden académico transversal. No cambia los ids de cursos ni módulos: así las
 * URLs, el progreso y las referencias editoriales siguen siendo estables.
 */
export const ACADEMY_STAGES: AcademyStage[] = [
  {
    id: 'start', number: '01', title: 'Bases',
    description: 'Entorno, programación, Git, terminal, datos, arquitectura y seguridad: lo que todo ingeniero usa sin importar el lenguaje.',
    trackIds: ['foundations', 'git', 'linux', 'sql'],
  },
  {
    id: 'languages', number: '02', title: 'Lenguajes',
    description: 'Domina un lenguaje y su modelo de ejecución antes de incorporar frameworks.',
    trackIds: ['java', 'javascript', 'typescript', 'kotlin'],
  },
  {
    id: 'applications', number: '03', title: 'Construcción de aplicaciones',
    description: 'Elige una ruta web, backend o móvil y completa al menos un producto ejecutable.',
    trackIds: ['spring-boot', 'node', 'angular', 'react', 'flutter', 'android', 'ios', 'kotlin-multiplatform'],
  },
  {
    id: 'systems', number: '04', title: 'Arquitectura y sistemas distribuidos',
    description: 'Cómo se diseñan, protegen y comunican los sistemas cuando dejan de caber en un solo proceso.',
    trackIds: ['arquitectura', 'seguridad', 'mensajeria', 'microservicios'],
  },
  {
    id: 'platform', number: '05', title: 'Infraestructura y operación',
    description: 'Contenedores, orquestación, entrega continua, infraestructura como código, observabilidad y nube.',
    trackIds: ['docker', 'kubernetes', 'cicd', 'iac', 'observabilidad', 'cloud'],
  },
  {
    id: 'engineering', number: '06', title: 'Ingeniería especializada',
    description: 'Itinerarios independientes con sus propios prerrequisitos matemáticos y técnicos.',
    trackIds: ['control-1'],
  },
];

export const TRACK_PREREQUISITES: Record<string, string[]> = {
  foundations: [],
  git: ['foundations'],
  linux: ['foundations'],
  sql: ['foundations'],
  java: ['foundations'],
  javascript: ['foundations'],
  typescript: ['javascript'],
  kotlin: ['foundations'],
  'spring-boot': ['java', 'sql'],
  node: ['javascript'],
  angular: ['typescript'],
  react: ['javascript'],
  flutter: ['foundations'],
  android: ['kotlin'],
  ios: ['foundations'],
  'kotlin-multiplatform': ['android'],
  arquitectura: ['java', 'sql'],
  seguridad: ['foundations'],
  mensajeria: ['arquitectura'],
  microservicios: ['arquitectura', 'spring-boot', 'node'],
  docker: ['linux'],
  kubernetes: ['docker'],
  cicd: ['git', 'docker'],
  iac: ['linux'],
  observabilidad: ['docker'],
  cloud: ['docker'],
  'control-1': [],
};

/** Rutas: recorridos que encadenan cursos en orden. No tienen contenido propio. */
export interface LearningRoute {
  id: string;
  title: string;
  description: string;
  trackIds: string[];
}

export const LEARNING_ROUTES: LearningRoute[] = [
  { id: 'devops', title: 'DevOps', description: 'De la terminal a un servicio desplegado, observado y recuperable.', trackIds: ['linux', 'git', 'docker', 'kubernetes', 'cicd', 'iac', 'observabilidad', 'cloud'] },
  { id: 'backend-java', title: 'Backend Java', description: 'De Java a microservicios Spring en producción.', trackIds: ['foundations', 'git', 'java', 'sql', 'spring-boot', 'arquitectura', 'microservicios', 'mensajeria', 'docker', 'kubernetes'] },
  { id: 'backend-node', title: 'Backend Node', description: 'De JavaScript a microservicios con Node.js.', trackIds: ['foundations', 'git', 'javascript', 'typescript', 'sql', 'node', 'arquitectura', 'microservicios'] },
  { id: 'frontend', title: 'Frontend', description: 'Aplicaciones web con un framework moderno.', trackIds: ['javascript', 'typescript', 'angular', 'react'] },
  { id: 'movil', title: 'Móvil', description: 'Apps nativas o multiplataforma.', trackIds: ['kotlin', 'android', 'kotlin-multiplatform', 'flutter', 'ios'] },
];

const ORDER = ACADEMY_STAGES.flatMap(stage => stage.trackIds);

export const academyTrackPosition = (trackId: string): number => {
  const position = ORDER.indexOf(trackId);
  return position < 0 ? Number.MAX_SAFE_INTEGER : position;
};

export const stageForTrack = (trackId: string): AcademyStage | undefined =>
  ACADEMY_STAGES.find(stage => stage.trackIds.includes(trackId));
