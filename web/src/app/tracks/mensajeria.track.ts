import { CourseModule, createModule as m } from '../course-module.model';

export const MENSAJERIA_MODULES: CourseModule[] = [
  m(0, 'Eventos de dominio y consistencia eventual', 'Eventos y outbox', 'Experto', '6 h', '#475569',
    'Publica hechos de negocio sin perderlos ni duplicarlos: separa eventos de dominio e integración, guarda el mensaje con el cambio, haz idempotentes los consumidores y coordina procesos largos con sagas.',['Eventos de dominio e integración: hechos, no comandos', 'Outbox transaccional: guardar el hecho y el mensaje juntos', 'Idempotencia y orden: consumidores que sobreviven a reintentos', 'Sagas y compensaciones: procesos largos sin transacción distribuida'],
    [
      'Distingue un evento de dominio de un comando y de un evento de integración',
      'Guarda un agregado y su evento en la misma transacción de DynamoDB',
      'Diseña un consumidor idempotente que sobreviva a entregas duplicadas',
      'Modela una saga con compensación y prueba el camino de fallo',
    ],
    ['¿Qué problema resuelve el outbox y qué no resuelve?', '¿Por qué una entrega al menos una vez exige idempotencia?', '¿Cuándo una saga es preferible a una transacción distribuida?'],
    ['Node.js', 'DynamoDB', 'SQS'],
    'Flujo de confirmación con outbox transaccional, consumidor idempotente, saga compensada y pruebas de reintento.'),
  m(1, 'Event-Driven Architecture y mensajería en Spring', 'EDA y mensajería', 'Experto', '6 h', '#6db33f',
    'EDA en Spring: Kafka, RabbitMQ, Schema Registry, DLQ y idempotencia para consumidores confiables.',
    ['Kafka, particiones y consumer groups', 'RabbitMQ, acks y DLQ', 'Schema Registry y evolución', 'Idempotencia en consumidores'],
    ['Diseña claves de partición y orden', 'Maneja DLQ y retries acotados', 'Evoluciona esquemas compatiblemente'],
    ['¿Orden global o por partición?', '¿Cuándo DLQ?', '¿Cómo manejar duplicados?'],
    ['Kafka', 'RabbitMQ', 'Schema Registry'],
    'Mensajería desacoplada con contratos y garantías claras.'),
];
