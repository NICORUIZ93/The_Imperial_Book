import { CourseModule, createModule as m } from '../course-module.model';

export const TYPESCRIPT_MODULES: CourseModule[] = [
  m(0, 'TypeScript esencial para devs de JavaScript', 'TypeScript', 'Experto', '3 h', '#e9b400',
    'El puente hacia Angular, React con tipos y Node tipado: aprende lo justo para ser productivo desde el día uno.',['Tipos básicos, interfaces y type aliases', 'Narrowing y union types', 'tsconfig esencial y modo strict', 'Generics', 'Decoradores estándar de TypeScript 5', 'TypeScript avanzado: sobrecargas, tipos mapeados, condicionales y satisfies'],
    [
      'Convierte un archivo .js a .ts y corrige todos los errores que aparezcan con strict: true activado',
      'Define una interface Usuario y un type alias EstadoPedido = "pendiente" | "enviado" | "entregado", y úsalos en una función',
      'Escribe una función genérica primero<T>(lista: T[]): T | undefined que funcione para arrays de cualquier tipo',
      'Usa narrowing (typeof, instanceof, in) para manejar un parámetro de tipo string | number de forma segura',
      'Tipa la respuesta de un fetch con una interface y usa un type guard para validar la forma del JSON recibido en runtime',
      'Activa noImplicitAny y corrige cada any implícito que el compilador señale en el código del módulo 1',
    ],
    ['¿Qué pierdes realmente si usas any en vez de tipar correctamente?', '¿Cuándo usarías un type alias en vez de una interface?', '¿Por qué TypeScript no protege contra datos mal formados que vienen de una API en runtime?'],
    ['TypeScript'],
    'Migración de un módulo JavaScript existente a TypeScript estricto sin usar any.'),
  m(1, 'TypeScript, contratos e integraciones confiables', 'Contratos y resiliencia', 'Experto', '8 h 20 min', '#3c873a',
    'Evoluciona la API productiva hacia un servicio con tipos estrictos, contratos HTTP verificables y efectos seguros frente a reintentos, caídas y entregas duplicadas.',[
      'Tipos estáticos dentro, datos desconocidos en la frontera',
      'Un contrato HTTP es comportamiento, no solo documentación',
      'OpenAPI como contrato ejecutable',
      'Reintentar sin duplicar el efecto',
      'Webhooks verificables y recuperación por reconciliación'
    ],
    [
      'Migra una vertical completa a TypeScript estricto sin any ni casts que oculten validación',
      'Genera y verifica OpenAPI contra requests y responses reales en CI',
      'Demuestra que un comando repetido o concurrente produce un único efecto',
      'Entrega webhooks firmados con outbox y recupera fallos mediante reconciliación',
    ],
    [
      '¿Por qué un tipo TypeScript no valida JSON recibido por red?',
      '¿Qué cambio compatible puede romper semánticamente a un consumidor?',
      '¿Por qué exactamente una vez se diseña como efecto y no como promesa del broker?',
    ],
    ['TypeScript', 'OpenAPI', 'Zod', 'PostgreSQL', 'Vitest'],
    'API tipada y contract-first con idempotencia transaccional, outbox, webhooks firmados, pruebas de duplicación y procedimiento de reconciliación.'),
];
