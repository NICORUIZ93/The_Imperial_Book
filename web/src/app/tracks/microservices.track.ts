import { CourseModule, createModule as m } from '../course-module.model';

/** Publicación progresiva: sólo se registra un módulo cuando su lección real supera la puerta editorial. */
export const MICROSERVICES_MODULES: CourseModule[] = [
  m(0, 'Antes de distribuir: proceso, red y falacias', 'Proceso, red y fallos', 'Fundamentos', '6 h', '#0f766e',
    'Reproduce los fallos que aparecen al separar procesos antes de elegir frameworks, brokers u orquestadores.',
    ['Proceso, host, puerto, socket y DNS', 'Latencia, deadline y timeouts por fase', 'Fallo parcial y estados desconocidos', 'Relojes, concurrencia y orden parcial', 'Serialización y evolución compatible', 'Falacias de la computación distribuida'],
    [
      'Ejecuta dos procesos Java y confirma el socket TCP con lsof o ss',
      'Introduce latencia y distingue timeout de conexión de timeout de solicitud',
      'Mata el servidor después de aceptar una operación y clasifica el resultado como desconocido',
      'Ordena eventos por versión del agregado, no por la hora de pared',
      'Evoluciona un mensaje sin romper un consumidor anterior',
      'Registra evidencia de una falacia reproducida y su mitigación',
    ],
    ['¿Por qué un timeout no demuestra que la operación falló?', '¿Qué información necesitas para reintentar sin duplicar un efecto?', '¿Por qué dos marcas de tiempo no garantizan causalidad?'],
    ['Java HttpClient', 'TCP', 'OpenTelemetry'],
    'Laboratorio de dos procesos con latencia, timeout, fallo parcial y contrato compatible demostrados.'),
];
