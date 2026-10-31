export interface LearningStage {
  label: string;
  outcome: string;
  modules: number[];
}

export interface OfficialLearningPath {
  trackId: string;
  source: string;
  sourceUrl: string;
  stages: LearningStage[];
}

const stages = (groups: Array<[string, string, number[]]>): LearningStage[] =>
  groups.map(([label, outcome, modules]) => ({ label, outcome, modules }));

/** Rutas editoriales contrastadas con las guías de aprendizaje mantenidas por cada stack. */
export const OFFICIAL_LEARNING_PATHS: OfficialLearningPath[] = [
  { trackId: 'foundations', source: 'MDN Curriculum y SWEBOK', sourceUrl: 'https://developer.mozilla.org/en-US/curriculum/', stages: stages([
    ['Preparar', 'Computador, sistema operativo, terminal y primer programa.', [0]],
    ['Comprender', 'Lógica, datos, algoritmos clásicos, web, redes y bases de datos.', [1, 2, 13, 3, 4]],
    ['Construir', 'Calidad, colaboración, seguridad, ingeniería de software y modelos de sensores e IoT.', [5, 6, 7, 12, 14]],
    ['Asegurar calidad', 'Ejecución reproducible, razonamiento y diagnóstico.', [8, 9, 15]],
    ['Llevar a producción', 'Sistemas distribuidos y elección fundamentada de especialidad.', [10, 11]],
  ]) },
  { trackId: 'rutaflow', source: 'Proyecto integrador basado en las guías oficiales de los 12 stacks', sourceUrl: 'https://developer.mozilla.org/en-US/curriculum/', stages: stages([
    ['Preparar', 'Problema, alcance, actores, entorno y repositorio profesional.', [0]],
    ['Comprender', 'Dominio logístico, arquitectura, datos y contratos.', [1]],
    ['Construir', 'Backend, web, móvil, GPS, mapas, rutas y operación offline.', [2, 3, 4]],
    ['Asegurar calidad', 'Infraestructura, observabilidad, seguridad, pruebas y contabilidad.', [5, 6]],
    ['Llevar a producción', 'Entrega incremental, SLO, evidencias y defensa del sistema completo.', [7]],
  ]) },
  { trackId: 'javascript', source: 'MDN Learn Web Development', sourceUrl: 'https://developer.mozilla.org/en-US/docs/Learn_web_development', stages: stages([
    ['Preparar', 'Editor, navegador, terminal y primer programa verificable.', [0]],
    ['Comprender', 'Lenguaje, control de flujo, funciones, objetos y módulos.', [1, 2, 3]],
    ['Construir', 'DOM, formularios, asincronía, datos y APIs del navegador.', [4, 5, 6, 7]],
    ['Asegurar calidad', 'Depuración, pruebas, accesibilidad y rendimiento.', [8, 9, 10]],
    ['Llevar a producción', 'Arquitectura avanzada, seguridad y proyecto integrador.', [11, 12, 13, 14]],
  ]) },
  { trackId: 'node', source: 'Node.js Learn', sourceUrl: 'https://nodejs.org/en/learn', stages: stages([
    ['Preparar', 'Runtime, npm, módulos y ejecución local.', [0, 1]],
    ['Comprender', 'Event loop, asincronía, archivos, procesos y red.', [2, 3, 4]],
    ['Construir', 'API, persistencia, autenticación y tiempo real.', [5, 6, 7, 8]],
    ['Asegurar calidad', 'Pruebas, diagnóstico, seguridad y observabilidad.', [9, 10, 11]],
    ['Llevar a producción', 'Escalado, rendimiento y servicio propio desplegable.', [12, 13, 14]],
  ]) },
  { trackId: 'angular', source: 'Angular Tutorials', sourceUrl: 'https://angular.dev/tutorials', stages: stages([
    ['Preparar', 'CLI, TypeScript, proyecto y herramientas de desarrollo.', [0, 1]],
    ['Comprender', 'Componentes, templates, signals y composición.', [2, 3, 4]],
    ['Construir', 'Servicios, routing, formularios, HTTP y estado.', [5, 6, 7, 8, 9]],
    ['Asegurar calidad', 'Pruebas, accesibilidad, seguridad y rendimiento.', [10, 11, 12]],
    ['Llevar a producción', 'Arquitectura, SSR, despliegue, panel propio y evaluación de Angular Native.', [13, 14, 15, 16]],
  ]) },
  { trackId: 'react', source: 'React Learn', sourceUrl: 'https://react.dev/learn', stages: stages([
    ['Preparar', 'Entorno moderno, TypeScript y primera interfaz.', [0, 1]],
    ['Comprender', 'Describir la UI con componentes, JSX y props.', [2, 3, 4]],
    ['Construir', 'Interactividad, estado, formularios, rutas y datos.', [5, 6, 7, 8, 9]],
    ['Asegurar calidad', 'Escape hatches, pruebas, accesibilidad y rendimiento.', [10, 11, 12]],
    ['Llevar a producción', 'Arquitectura full stack, seguridad y proyecto integrador.', [13, 14]],
  ]) },
  { trackId: 'java', source: 'Dev.java Learn', sourceUrl: 'https://dev.java/learn/', stages: stages([
    ['Preparar', 'JDK, IDE, compilación y ejecución multiplataforma.', [0, 1]],
    ['Comprender', 'Sintaxis, orientación a objetos, tipos y colecciones.', [2, 3, 4, 5]],
    ['Construir', 'I/O, HTTP, persistencia JDBC/JPA, concurrencia y diseño.', [6, 7, 8, 9, 16, 17, 19]],
    ['Asegurar calidad', 'Pruebas, build, diagnóstico, seguridad HTTP y JVM.', [10, 11, 12, 18]],
    ['Llevar a producción', 'Rendimiento, arquitectura y servicio propio.', [13, 14, 15]],
  ]) },
  { trackId: 'spring-boot', source: 'Spring Guides', sourceUrl: 'https://spring.io/guides', stages: stages([
    ['Preparar', 'Initializr, dependencias, perfiles y primera aplicación.', [0, 1]],
    ['Comprender', 'IoC, configuración, web y contratos REST.', [2, 3, 4]],
    ['Construir', 'Datos JPA/JDBC, seguridad, mensajería Kafka, caché, correo y tareas programadas.', [5, 6, 7, 8, 9, 16, 17, 20, 21]],
    ['Asegurar calidad', 'Pruebas, observabilidad, resiliencia, seguridad y documentación.', [10, 11, 12, 18]],
    ['Llevar a producción', 'Contenedores, cloud, rendimiento, jobs batch y backend propio.', [13, 14, 15, 19]],
  ]) },
  { trackId: 'kotlin-multiplatform', source: 'Kotlin Multiplatform Get started', sourceUrl: 'https://kotlinlang.org/docs/multiplatform/get-started.html', stages: stages([
    ['Preparar', 'Toolchain, proyecto y ejecución en cada destino.', [0, 1]],
    ['Comprender', 'Kotlin, source sets, Gradle y código compartido.', [2, 3, 4]],
    ['Construir', 'UI, red, persistencia, concurrencia e interoperabilidad.', [5, 6, 7, 8, 9]],
    ['Asegurar calidad', 'Pruebas comunes/específicas y arquitectura.', [10, 11]],
    ['Llevar a producción', 'Publicación, rendimiento y cliente propio.', [12, 13]],
  ]) },
  { trackId: 'android', source: 'Android Basics with Compose', sourceUrl: 'https://developer.android.com/courses/android-basics-compose/course', stages: stages([
    ['Preparar', 'Android Studio, emulador, Kotlin y primera app.', [0, 1]],
    ['Comprender', 'Compose, estado, ciclo de vida y arquitectura.', [2, 3, 4]],
    ['Construir', 'Navegación, datos, red, mapas, ubicación y batería.', [5, 6, 7, 8, 9, 15]],
    ['Asegurar calidad', 'Pruebas, accesibilidad, UI adaptable y rendimiento.', [10, 11, 12]],
    ['Llevar a producción', 'Seguridad, publicación y app de reparto propia.', [13, 14]],
  ]) },
  { trackId: 'ios', source: 'Apple App Dev Tutorials', sourceUrl: 'https://developer.apple.com/tutorials/app-dev-training', stages: stages([
    ['Preparar', 'Xcode, Swift y primer proyecto SwiftUI.', [0, 1]],
    ['Comprender', 'Vistas, navegación, bindings, estado y ciclo de vida.', [2, 3, 4, 5]],
    ['Construir', 'Persistencia, red, concurrencia, mapas y capacidades.', [6, 7, 8, 9]],
    ['Asegurar calidad', 'Pruebas, accesibilidad, errores y rendimiento.', [10, 11, 12]],
    ['Llevar a producción', 'Distribución y aplicación propia.', [13, 14]],
  ]) },
  { trackId: 'flutter', source: 'Dart and Flutter learning pathway', sourceUrl: 'https://docs.flutter.dev/learn', stages: stages([
    ['Preparar', 'SDK, editor, dispositivos y Dart esencial.', [0, 1]],
    ['Comprender', 'Widgets, layout, estado y ciclo de vida.', [2, 3, 4]],
    ['Construir', 'Navegación, red, datos, arquitectura, mapas y plataforma.', [5, 6, 7, 8, 9, 10]],
    ['Asegurar calidad', 'Pruebas, accesibilidad, adaptabilidad y rendimiento.', [11, 12, 13]],
    ['Llevar a producción', 'Release, observabilidad y app propia.', [14, 15]],
  ]) },
  { trackId: 'devops', source: 'Docker, Kubernetes, Terraform y OpenTelemetry', sourceUrl: 'https://kubernetes.io/docs/tutorials/', stages: stages([
    ['Preparar', 'Linux, terminal, Git, redes y laboratorio reproducible.', [0, 1, 2]],
    ['Comprender', 'Contenedores, imágenes, Compose y entrega continua.', [3, 4, 5]],
    ['Construir', 'Kubernetes, configuración, estado e infraestructura como código.', [6, 7, 8, 9]],
    ['Asegurar calidad', 'Observabilidad, seguridad, políticas, confiabilidad y QA automation.', [10, 11, 12, 13, 16]],
    ['Llevar a producción', 'GitOps, plataforma interna y operación de un servicio propio.', [14, 15]],
  ]) },
  { trackId: 'cloud', source: 'AWS, Microsoft Learn y Google Cloud Training', sourceUrl: 'https://aws.amazon.com/training/learn-about/', stages: stages([
    ['Preparar', 'Cloud, responsabilidad compartida, Docker, CLI y Floci.', [0, 1]],
    ['Comprender', 'Identidad, red, cómputo, almacenamiento, datos y costos.', [2, 3, 4, 5, 6, 7, 8]],
    ['Construir', 'Serverless, eventos, contenedores, integración y multi-nube.', [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]],
    ['Asegurar calidad', 'Seguridad, observabilidad, resiliencia, gobierno y FinOps.', [20, 21, 22, 23, 24, 25, 26, 27, 28]],
    ['Llevar a producción', 'Arquitectura avanzada, operación, documentación oficial y plataforma propia multi-nube.', [29, 30, 31, 32, 33, 34]],
  ]) },
];

export const findOfficialLearningPath = (trackId: string): OfficialLearningPath | undefined =>
  OFFICIAL_LEARNING_PATHS.find(path => path.trackId === trackId);
