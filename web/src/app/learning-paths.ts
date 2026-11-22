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
    id: 'start', number: '01', title: 'Base común',
    description: 'Entorno, terminal, programación, web, datos, Git, pruebas y depuración antes de elegir una especialidad.',
    trackIds: ['foundations'],
  },
  {
    id: 'languages', number: '02', title: 'Lenguajes y plataformas base',
    description: 'Domina un lenguaje y su modelo de ejecución antes de incorporar frameworks.',
    trackIds: ['javascript', 'java'],
  },
  {
    id: 'applications', number: '03', title: 'Construcción de aplicaciones',
    description: 'Elige una ruta web, backend o móvil y completa al menos un producto ejecutable.',
    trackIds: ['node', 'angular', 'react', 'spring-boot', 'flutter', 'android', 'ios', 'kotlin-multiplatform'],
  },
  {
    id: 'systems', number: '04', title: 'Sistemas, entrega y operación',
    description: 'Distribución, contenedores, nube, confiabilidad y operación después de construir una aplicación completa.',
    trackIds: ['microservices', 'spring-microservices', 'node-microservices', 'devops', 'cloud'],
  },
  {
    id: 'capstone', number: '05', title: 'Integración profesional',
    description: 'Integra frontend, backend, datos, móvil y operación en un proyecto con evidencia y decisiones justificadas.',
    trackIds: ['rutaflow'],
  },
  {
    id: 'engineering', number: '06', title: 'Ingeniería especializada',
    description: 'Itinerarios independientes con sus propios prerrequisitos matemáticos y técnicos.',
    trackIds: ['control-1'],
  },
];

export const TRACK_PREREQUISITES: Record<string, string[]> = {
  foundations: [],
  javascript: ['foundations'],
  java: ['foundations'],
  node: ['javascript'],
  angular: ['javascript'],
  react: ['javascript'],
  'spring-boot': ['java'],
  flutter: ['foundations'],
  android: ['foundations'],
  ios: ['foundations'],
  'kotlin-multiplatform': ['android'],
  microservices: ['spring-boot'],
  'spring-microservices': ['spring-boot', 'microservices'],
  'node-microservices': ['node', 'microservices'],
  devops: ['foundations'],
  cloud: ['devops'],
  rutaflow: ['node', 'spring-boot', 'flutter', 'devops'],
  'control-1': [],
};

const ORDER = ACADEMY_STAGES.flatMap(stage => stage.trackIds);

export const academyTrackPosition = (trackId: string): number => {
  const position = ORDER.indexOf(trackId);
  return position < 0 ? Number.MAX_SAFE_INTEGER : position;
};

export const stageForTrack = (trackId: string): AcademyStage | undefined =>
  ACADEMY_STAGES.find(stage => stage.trackIds.includes(trackId));
