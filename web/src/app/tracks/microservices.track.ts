import { CourseModule, createModule as m } from '../course-module.model';

/** Publicación progresiva: sólo se registra un módulo cuando su lección real supera la puerta editorial. */
export const MICROSERVICES_MODULES: CourseModule[] = [
  m(0, 'Antes de distribuir: proceso, red y falacias', 'Proceso, red y fallos', 'Fundamentos', '11 h', '#0f766e',
    'Reproduce los fallos que aparecen al separar procesos antes de elegir frameworks, brokers u orquestadores.',
    ['Ejecutar dos procesos Java y comprobar su socket HTTP', 'Imponer un presupuesto temporal a una solicitud HTTP', 'Propagar un deadline absoluto entre servicios HTTP', 'Clasificar un resultado desconocido antes de reintentar', 'Evitar efectos duplicados con una clave idempotente', 'Seleccionar un reloj según la evidencia temporal', 'Preservar el orden de eventos por versión del agregado', 'Evolucionar un contrato JSON sin romper consumidores', 'Rechazar un frame excesivo antes de reservar memoria', 'Refutar falacias distribuidas mediante evidencia reproducible'],
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
  m(1, 'Construir un monolito modular antes de extraer servicios', 'Monolito modular', 'Fundamentos', '12 h', '#0f766e',
    'Organiza RutaFlow por capacidades, protege sus fronteras con tests y decide una extracción mediante evidencia, no por moda.',
    ['Distinguir estructura lógica de unidad de despliegue', 'Evaluar autonomía antes de extraer un proceso', 'Agrupar código por capacidad de negocio', 'Proteger la API pública de un módulo', 'Mantener reglas de dominio libres de frameworks', 'Sustituir adaptadores mediante puertos', 'Representar dependencias de módulos como un grafo', 'Romper ciclos según el tipo de acoplamiento', 'Bloquear accesos a internals con ArchUnit', 'Detectar ciclos de paquetes con ArchUnit', 'Evitar falsos verdes en fitness functions', 'Medir señales que justifican una extracción', 'Registrar una decisión reversible en un ADR'],
    [
      'Clasifica una aplicación sin confundir despliegue con estructura lógica',
      'Agrupa envíos y facturación por capacidad y mide dependencias',
      'Impide que un módulo importe internals de otro',
      'Sustituye un adaptador sin cambiar el dominio',
      'Provoca y corrige un ciclo detectado por ArchUnit',
      'Escribe un ADR que pueda decidir mantener el monolito',
    ],
    ['¿Qué autonomía real aporta separar un proceso?', '¿Cuándo una llamada interna es preferible a una llamada remota?', '¿Qué evidencia justificaría pagar el costo operacional de extraer?'],
    ['ArchUnit', 'Spring Modulith', 'DDD estratégico'],
    'Monolito modular RutaFlow con fronteras ejecutables y ADR de extracción basado en métricas.'),
];
