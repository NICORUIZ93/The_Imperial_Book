import type { TrackProgress } from './progress.service';

/**
 * Renumeraciones de módulos (specs/020). Cuando un curso fusiona o mueve módulos, se agrega aquí un paso
 * con la traducción `id antiguo → id nuevo` de cada curso afectado. El progreso guardado del estudiante se
 * traduce una sola vez por paso, en orden, para que no pierda lo que ya completó.
 */
export interface RenumberingMove {
  fromTrack: string;
  fromModule: number;
  toTrack: string;
  toModule: number;
  /** When true, keep the source progress and also copy it to destination. */
  copy?: boolean;
}

export interface RenumberingStep {
  /** Número creciente; el progreso guarda el último paso aplicado. */
  version: number;
  /** Por curso: módulo antiguo → módulo nuevo. Los módulos que no aparecen conservan su id. */
  tracks: Record<string, Record<number, number>>;
  /**
   * Por curso: tema antiguo → tema nuevo, como claves completas `módulo:fragmento` (ya traducidas por
   * `tracks`). Sirve cuando un tema se renumera o se fusiona en otro módulo sin cambiar de módulo el resto.
   */
  topics?: Record<string, Record<string, string>>;
  /** Mueve módulos (y sus claves `módulo:tema`) entre tracks. Se aplica tras `tracks`. */
  moves?: RenumberingMove[];
}

export const RENUMBERING_STEPS: RenumberingStep[] = [
  {
    // specs/020: temas nuevos, fusiones y renumeración interna de React y Angular (sin renumerar módulos).
    // Spring Boot: 27 → 21 módulos (fusión de duplicados y orden por dependencias). Java: records e igualdad
    // antes de usarse (M7 T1 → M1 T5, M22 T1–T2 → M2 T2–T3) y colas en M2 T6.
    version: 1,
    tracks: {
      'spring-boot': { 3: 4, 4: 5, 5: 7, 8: 10, 9: 13, 10: 16, 11: 19, 12: 20, 13: 17, 14: 20, 16: 4, 17: 3, 19: 12, 20: 8, 21: 10, 22: 15, 23: 15, 24: 14, 25: 11, 26: 9 },
    },
    topics: {
      'spring-boot': {
        '3:tema-2-transactional-rollback-y-limites-de-transaccion':
          '3:tema-3-transactional-rollback-y-limites-de-transaccion',
        '4:tema-2-lazy-eager-n-1-y-consultas-de-caso-de-uso':
          '4:tema-3-mas-alla-del-n-1-el-limite-de-lazy-y-paginas-dto',
        '4:tema-3-migraciones-con-flyway':
          '4:tema-4-migraciones-con-flyway',
        '4:tema-4-spring-data-mongodb-documentos-consultas-derivadas-y-cuando-elegir-un-modelo-de-documentos':
          '4:tema-5-spring-data-mongodb-documentos-consultas-derivadas-y-cuando-elegir-un-modelo-de-documentos',
        '15:tema-2-contenedores-testcontainers-reutilizados-entre-clases':
          '6:tema-5-contenedores-testcontainers-reutilizados-entre-clases',
        '7:tema-1-actuator-y-health-checks-personalizados':
          '7:tema-5-actuator-y-health-checks-personalizados',
        '7:tema-2-contar-operaciones-de-negocio-con-micrometer':
          '7:tema-6-contar-operaciones-de-negocio-con-micrometer',
        '7:tema-3-liveness-y-readiness-sin-reinicios-en-cadena':
          '7:tema-7-liveness-y-readiness-sin-reinicios-en-cadena',
        '7:tema-4-logging-en-spring-boot-niveles-grupos-y-logs-estructurados-en-json':
          '7:tema-8-logging-en-spring-boot-niveles-grupos-y-logs-estructurados-en-json',
        '8:tema-6-integraciones-empresariales-soap-y-fronteras-de-protocolo':
          '8:tema-5-integraciones-empresariales-soap-y-fronteras-de-protocolo',
        '8:tema-7-spring-ai-chatclient-y-herramientas-con-autorizacion-fuera-del-modelo':
          '8:tema-6-spring-ai-chatclient-y-herramientas-con-autorizacion-fuera-del-modelo',
        '8:tema-8-rag-desde-la-frontera-de-datos-recuperar-evidencia-autorizada-antes-de-generar':
          '8:tema-7-rag-desde-la-frontera-de-datos-recuperar-evidencia-autorizada-antes-de-generar',
        '8:tema-9-model-context-protocol-mcp-con-spring-ai-exponer-y-consumir-herramientas':
          '8:tema-8-model-context-protocol-mcp-con-spring-ai-exponer-y-consumir-herramientas',
        '8:tema-5-async-y-ejecutores-trabajo-en-segundo-plano-con-limites':
          '9:tema-1-async-y-ejecutores-trabajo-en-segundo-plano-con-limites',
        '9:tema-1-completablefuture-async-y-el-bug-de-la-autoinvocacion':
          '9:tema-2-completablefuture-async-y-el-bug-de-la-autoinvocacion',
        '9:tema-2-locks-deadlocks-semaforos-y-mdc-en-concurrencia':
          '9:tema-3-locks-deadlocks-semaforos-y-mdc-en-concurrencia',
        '10:tema-3-outbox-transaccional-y-flujo-de-negocio':
          '10:tema-4-outbox-transaccional-y-flujo-de-negocio',
        '10:tema-4-rebalanceo-de-consumer-groups-y-asignacion-de-particiones':
          '10:tema-5-rebalanceo-de-consumer-groups-y-asignacion-de-particiones',
        '10:tema-7-kafka-streams-con-spring-para-transformar-eventos':
          '10:tema-6-kafka-streams-con-spring-para-transformar-eventos',
        '10:tema-8-avro-y-schema-registry-para-contratos-de-eventos':
          '10:tema-7-avro-y-schema-registry-para-contratos-de-eventos',
        '10:tema-5-kafka-frente-a-rabbitmq':
          '11:tema-1-kafka-frente-a-rabbitmq',
        '10:tema-9-rabbitmq-con-spring-amqp-routing-ack-y-prefetch':
          '11:tema-2-rabbitmq-con-spring-amqp-routing-ack-y-prefetch',
        '10:tema-10-jms-con-spring-y-activemq-artemis-colas-punto-a-punto-y-transacciones':
          '11:tema-3-jms-con-spring-y-activemq-artemis-colas-punto-a-punto-y-transacciones',
        '11:tema-1-bindings-y-destinations':
          '11:tema-4-bindings-y-destinations',
        '11:tema-2-binder-kafka-y-binder-rabbitmq':
          '11:tema-5-binder-kafka-y-binder-rabbitmq',
        '11:tema-3-reintentos-error-handler-y-dead-letter':
          '11:tema-6-reintentos-error-handler-y-dead-letter',
        '11:tema-4-test-binder-y-limites-de-la-prueba':
          '11:tema-7-test-binder-y-limites-de-la-prueba',
        '15:tema-1-backpressure-real-en-webflux-con-reactor-test':
          '13:tema-4-backpressure-real-en-webflux-con-reactor-test',
        '15:tema-3-arquitectura-hexagonal-verificada-con-archunit':
          '15:tema-2-arquitectura-hexagonal-verificada-con-archunit',
        '15:tema-8-clean-architecture-y-ddd-tactico-caso-de-uso-antes-que-framework':
          '15:tema-3-clean-architecture-y-ddd-tactico-caso-de-uso-antes-que-framework',
        '15:tema-2-c4-contexto-contenedores-componentes-y-codigo':
          '15:tema-4-c4-contexto-contenedores-componentes-y-codigo',
        '15:tema-3-adr-decisiones-con-contexto-alternativas-y-consecuencias':
          '15:tema-5-adr-decisiones-con-contexto-alternativas-y-consecuencias',
        '15:tema-1-modulos-y-limites-entre-paquetes':
          '15:tema-6-modulos-y-limites-entre-paquetes',
        '15:tema-2-eventos-entre-modulos-sin-importar-implementacion':
          '15:tema-7-eventos-entre-modulos-sin-importar-implementacion',
        '15:tema-3-documentacion-generada-y-mapa-de-dependencias':
          '15:tema-8-documentacion-generada-y-mapa-de-dependencias',
        '15:tema-4-pruebas-de-integracion-por-modulo':
          '15:tema-9-pruebas-de-integracion-por-modulo',
        '15:tema-4-bulkhead-y-ratelimiter-de-resilience4j':
          '16:tema-4-bulkhead-y-ratelimiter-de-resilience4j',
        '16:tema-4-oauth2-oidc-keycloak-y-token-relay-sin-perder-la-frontera-de-autorizacion':
          '16:tema-5-oauth2-oidc-keycloak-y-token-relay-sin-perder-la-frontera-de-autorizacion',
        '16:tema-5-http-interfaces-deadlines-y-descubrimiento-segun-el-entorno':
          '16:tema-6-http-interfaces-deadlines-y-descubrimiento-segun-el-entorno',
        '16:tema-6-spring-grpc-contrato-http-2-y-evolucion-segura':
          '16:tema-7-spring-grpc-contrato-http-2-y-evolucion-segura',
        '16:tema-7-ddd-para-decidir-limites-y-propiedad-de-datos':
          '16:tema-8-ddd-para-decidir-limites-y-propiedad-de-datos',
        '16:tema-8-orquestar-pedidos-con-temporal-y-spring-boot':
          '16:tema-9-orquestar-pedidos-con-temporal-y-spring-boot',
        '15:tema-5-saga-con-compensacion-real':
          '17:tema-5-saga-con-compensacion-real',
        '15:tema-6-event-sourcing-con-replay-real':
          '17:tema-6-event-sourcing-con-replay-real',
        '15:tema-7-compensacion-que-falla-conservar-trabajo-pendiente-y-reintentar-sin-duplicar':
          '17:tema-7-compensacion-que-falla-conservar-trabajo-pendiente-y-reintentar-sin-duplicar',
        '20:tema-1-crud-api-y-contratos':
          '20:tema-4-crud-api-y-contratos',
        '20:tema-2-mysql-y-datos-espaciales':
          '20:tema-5-mysql-y-datos-espaciales',
        '20:tema-3-jpa-e-hibernate-spatial':
          '20:tema-6-jpa-e-hibernate-spatial',
        '20:tema-4-jwt-bearer-y-autorizacion-por-roles':
          '20:tema-7-jwt-bearer-y-autorizacion-por-roles',
        '20:tema-5-tiempo-real-con-stomp':
          '20:tema-8-tiempo-real-con-stomp',
        '20:tema-6-archivos-y-notificaciones-push':
          '20:tema-9-archivos-y-notificaciones-push',
        '5:tema-2-filtro-jwt-y-autorizacion-por-rol':
          '5:tema-2-jwt-con-el-resource-server-de-spring-security-y-autorizacion-por-rol',
        '10:tema-1-productor-topico-key-y-consumidor':
          '10:tema-1-producers-y-consumers-con-spring-kafka',
        '10:tema-2-reintentos-dlt-entrega-al-menos-una-vez-e-idempotencia':
          '10:tema-2-dead-letter-queue',
        '10:tema-6-spring-cloud-stream-y-binders-de-kafka-rabbitmq':
          '11:tema-4-bindings-y-destinations',
        '16:tema-9-comprueba-modulos-antes-de-separar-servicios':
          '15:tema-6-modulos-y-limites-entre-paquetes',
      },
      java: {
        '2:tema-2-genericos-wildcards-y-type-erasure':
          '2:tema-4-genericos-wildcards-y-type-erasure',
        '2:tema-3-comparable-vs-comparator-e-iteracion':
          '2:tema-5-comparable-vs-comparator-e-iteracion',
        '7:tema-1-record-modelos-inmutables-sin-boilerplate':
          '1:tema-5-record-modelos-inmutables-sin-boilerplate',
        '7:tema-2-sealed-jerarquias-cerradas-y-exhaustividad':
          '7:tema-1-sealed-jerarquias-cerradas-y-exhaustividad',
        '7:tema-3-pattern-matching-exhaustivo-y-para-instanceof':
          '7:tema-2-pattern-matching-exhaustivo-y-para-instanceof',
        '7:tema-4-unnamed-variables-y-patterns-java-22':
          '7:tema-3-unnamed-variables-y-patterns-java-22',
        '9:tema-1-junit-5-anotaciones-y-ciclo-de-vida':
          '9:tema-1-junit-6-jupiter-anotaciones-y-ciclo-de-vida',
        '15:tema-4-junit-5-mockito-y-assertions-expresivas':
          '15:tema-4-junit-6-mockito-y-assertions-expresivas',
        '22:tema-1-el-contrato-de-equals-y-hashcode':
          '2:tema-2-el-contrato-de-equals-y-hashcode',
        '22:tema-2-claves-mutables-y-el-mapa-que-pierde-entradas':
          '2:tema-3-claves-mutables-y-el-mapa-que-pierde-entradas',
        '22:tema-3-copia-defensiva-copia-superficial-y-clone':
          '22:tema-1-copia-defensiva-copia-superficial-y-clone',
        '22:tema-4-enums-de-dominio-estado-codigo-y-comportamiento':
          '22:tema-2-enums-de-dominio-estado-codigo-y-comportamiento',
        '22:tema-5-clases-anidadas-this-0-y-la-referencia-que-retiene':
          '22:tema-3-clases-anidadas-this-0-y-la-referencia-que-retiene',
      },
      react: {
        '2:tema-2-useref-valores-mutables-sin-re-render':
          '2:tema-3-useref-valores-mutables-sin-re-render',
        '2:tema-3-usememo-y-usecallback-con-criterio':
          '2:tema-4-usememo-y-usecallback-con-criterio',
        '2:tema-4-reglas-de-los-hooks-usereducer-y-useimperativehandle':
          '2:tema-5-reglas-de-los-hooks-usereducer-y-useimperativehandle',
        '2:tema-5-error-boundaries-contener-errores-de-render-sin-romper-toda-la-app':
          '2:tema-6-error-boundaries-contener-errores-de-render-sin-romper-toda-la-app',
        '2:tema-6-efectos-cancelables-impedir-que-una-respuesta-antigua-sobrescriba-la-seleccion-actual':
          '2:tema-7-efectos-cancelables-impedir-que-una-respuesta-antigua-sobrescriba-la-seleccion-actual',
        '2:tema-7-uselayouteffect-y-useeffectevent-medir-antes-de-pintar-y-leer-valores-sin-reconectar':
          '2:tema-8-uselayouteffect-y-useeffectevent-medir-antes-de-pintar-y-leer-valores-sin-reconectar',
        '5:tema-3-rutas-protegidas-y-code-splitting-por-ruta':
          '5:tema-3-rutas-protegidas',
        '9:tema-3-virtualizacion-y-code-splitting':
          '9:tema-3-virtualizacion-de-listas-largas',
        '9:tema-5-suspense-y-react-lazy-carga-diferida-del-lado-cliente':
          '9:tema-5-suspense-y-react-lazy-carga-diferida-de-componentes-y-rutas',
        '14:tema-1-server-components-y-streaming':
          '10:tema-3-streaming-con-suspense-en-el-servidor',
        '14:tema-2-server-actions-y-seguridad':
          '13:tema-3-cliente-y-servidor-forman-una-sola-frontera-de-seguridad',
        '14:tema-3-next-js-isr-metadata-y-proxy-antes-middleware':
          '14:tema-1-next-js-isr-metadata-y-proxy-antes-middleware',
        '14:tema-4-optimizacion-de-imagenes-y-fuentes':
          '14:tema-2-optimizacion-de-imagenes-y-fuentes',
        '14:tema-5-accesibilidad-y-react-aria':
          '14:tema-3-accesibilidad-y-react-aria',
        '14:tema-6-i18n-pluralizacion-y-rtl':
          '14:tema-4-i18n-pluralizacion-y-rtl',
      },
      angular: {
        '7:tema-1-httpclient-con-backend-fetch':
          '7:tema-1-httpclient-fetch-por-defecto-y-peticiones-tipadas',
        '11:tema-5-modos-de-render-por-ruta-ssr-prerender-ssg-y-csr-con-app-routes-server-ts':
          '11:tema-6-modos-de-render-por-ruta-ssr-prerender-ssg-y-csr-con-app-routes-server-ts',
        '11:tema-6-hidratacion-incremental-defer-con-hydrate-on-para-despertar-solo-lo-que-se-usa':
          '11:tema-7-hidratacion-incremental-defer-con-hydrate-on-para-despertar-solo-lo-que-se-usa',
        '15:tema-1-testbed-y-componentfixture':
          '10:tema-1-testbed-y-componentes-standalone',
        '15:tema-2-pruebas-de-signals':
          '15:tema-1-pruebas-de-signals',
        '15:tema-3-cypress-y-playwright':
          '15:tema-2-cypress-y-playwright',
        '15:tema-4-animaciones-accesibles':
          '15:tema-3-animaciones-accesibles',
        '15:tema-5-ssr-y-transferstate':
          '15:tema-4-ssr-y-transferstate',
        '15:tema-6-hidratacion-y-provideserverrendering':
          '11:tema-2-hidratacion',
      },
    },
  },
  // specs/018: el curso de Microservicios se rehízo con otro temario; el progreso de los módulos
  // anteriores (M0 falacias, M1 monolito modular) no corresponde a los módulos nuevos 0.1 y 0.2.
  { version: 2, tracks: { microservices: { 0: 900, 1: 901 } } },
  // Separación de microservicios: contenido agnóstico queda en microservices; Spring y Node se
  // extraen a tracks dedicados. Los módulos 0-4,9-16,28-36 se conservan en microservices con
  // renumeración; 5-8 van a spring-microservices; 17-27 van a node-microservices.
  {
    version: 3,
    tracks: {
      microservices: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 9: 5, 10: 6, 11: 7, 12: 8, 13: 9, 14: 10, 15: 11, 16: 12, 28: 13, 29: 14, 30: 15, 31: 16, 32: 17, 33: 18, 34: 19, 35: 20, 36: 21 },
    },
    moves: [
      { fromTrack: 'microservices', fromModule: 5, toTrack: 'spring-microservices', toModule: 0 },
      { fromTrack: 'microservices', fromModule: 6, toTrack: 'spring-microservices', toModule: 1 },
      { fromTrack: 'microservices', fromModule: 7, toTrack: 'spring-microservices', toModule: 2 },
      { fromTrack: 'microservices', fromModule: 8, toTrack: 'spring-microservices', toModule: 3 },
      { fromTrack: 'microservices', fromModule: 17, toTrack: 'node-microservices', toModule: 0 },
      { fromTrack: 'microservices', fromModule: 18, toTrack: 'node-microservices', toModule: 1 },
      { fromTrack: 'microservices', fromModule: 19, toTrack: 'node-microservices', toModule: 2 },
      { fromTrack: 'microservices', fromModule: 20, toTrack: 'node-microservices', toModule: 3 },
      { fromTrack: 'microservices', fromModule: 21, toTrack: 'node-microservices', toModule: 4 },
      { fromTrack: 'microservices', fromModule: 22, toTrack: 'node-microservices', toModule: 5 },
      { fromTrack: 'microservices', fromModule: 23, toTrack: 'node-microservices', toModule: 6 },
      { fromTrack: 'microservices', fromModule: 24, toTrack: 'node-microservices', toModule: 7 },
      { fromTrack: 'microservices', fromModule: 25, toTrack: 'node-microservices', toModule: 8 },
      { fromTrack: 'microservices', fromModule: 26, toTrack: 'node-microservices', toModule: 9 },
      { fromTrack: 'microservices', fromModule: 27, toTrack: 'node-microservices', toModule: 10 },
    ],
  },
  // El track agnóstico `microservices` se retira. Se copian solo mapeos claros a módulos ya existentes.
  // Los conceptos restantes se reescribirán dentro de cada track por stack.
  {
    version: 4,
    tracks: {},
    moves: [
      { fromTrack: 'microservices', fromModule: 0, toTrack: 'node-microservices', toModule: 0, copy: true },
      { fromTrack: 'microservices', fromModule: 1, toTrack: 'node-microservices', toModule: 1, copy: true },
      { fromTrack: 'microservices', fromModule: 2, toTrack: 'node-microservices', toModule: 3, copy: true },
      { fromTrack: 'microservices', fromModule: 3, toTrack: 'node-microservices', toModule: 4, copy: true },
      { fromTrack: 'microservices', fromModule: 6, toTrack: 'node-microservices', toModule: 5, copy: true },
      { fromTrack: 'microservices', fromModule: 8, toTrack: 'node-microservices', toModule: 6, copy: true },
      { fromTrack: 'microservices', fromModule: 9, toTrack: 'node-microservices', toModule: 7, copy: true },
      { fromTrack: 'microservices', fromModule: 10, toTrack: 'node-microservices', toModule: 8, copy: true },
      { fromTrack: 'microservices', fromModule: 11, toTrack: 'node-microservices', toModule: 9, copy: true },
      { fromTrack: 'microservices', fromModule: 12, toTrack: 'node-microservices', toModule: 10, copy: true },
      { fromTrack: 'microservices', fromModule: 0, toTrack: 'spring-microservices', toModule: 0, copy: true },
      { fromTrack: 'microservices', fromModule: 1, toTrack: 'spring-microservices', toModule: 1, copy: true },
      { fromTrack: 'microservices', fromModule: 2, toTrack: 'spring-microservices', toModule: 2, copy: true },
      { fromTrack: 'microservices', fromModule: 3, toTrack: 'spring-microservices', toModule: 3, copy: true },
    ],
  },
  {
    // Reestructuración fase 1 (docs/REESTRUCTURACION_CURSOS.md): cursos nuevos (Git, Linux, SQL, Docker,
    // Kubernetes…), Microservicios unificado con rutas Spring y Node, y DevOps convertido en ruta.
    // Paso 5 lleva cada módulo a un curso temporal `__v5__<destino>` para que ningún movimiento encadene
    // con otro del mismo curso; el paso 6 los deja en su curso definitivo.
    version: 5,
    tracks: {},
    moves: [
      { fromTrack: 'android', fromModule: 0, toTrack: '__v5__kotlin', toModule: 0 },
      { fromTrack: 'android', fromModule: 1, toTrack: '__v5__android', toModule: 0 },
      { fromTrack: 'android', fromModule: 2, toTrack: '__v5__android', toModule: 1 },
      { fromTrack: 'android', fromModule: 3, toTrack: '__v5__android', toModule: 2 },
      { fromTrack: 'android', fromModule: 4, toTrack: '__v5__android', toModule: 3 },
      { fromTrack: 'android', fromModule: 5, toTrack: '__v5__android', toModule: 4 },
      { fromTrack: 'android', fromModule: 6, toTrack: '__v5__android', toModule: 5 },
      { fromTrack: 'android', fromModule: 7, toTrack: '__v5__android', toModule: 6 },
      { fromTrack: 'android', fromModule: 8, toTrack: '__v5__android', toModule: 7 },
      { fromTrack: 'android', fromModule: 9, toTrack: '__v5__android', toModule: 8 },
      { fromTrack: 'android', fromModule: 10, toTrack: '__v5__android', toModule: 9 },
      { fromTrack: 'android', fromModule: 11, toTrack: '__v5__android', toModule: 10 },
      { fromTrack: 'android', fromModule: 12, toTrack: '__v5__android', toModule: 11 },
      { fromTrack: 'android', fromModule: 13, toTrack: '__v5__android', toModule: 12 },
      { fromTrack: 'android', fromModule: 14, toTrack: '__v5__android', toModule: 13 },
      { fromTrack: 'android', fromModule: 15, toTrack: '__v5__android', toModule: 14 },
      { fromTrack: 'android', fromModule: 16, toTrack: '__v5__android', toModule: 15 },
      { fromTrack: 'android', fromModule: 17, toTrack: '__v5__android', toModule: 16 },
      { fromTrack: 'android', fromModule: 18, toTrack: '__v5__android', toModule: 17 },
      { fromTrack: 'cloud', fromModule: 1, toTrack: '__v5__docker', toModule: 2 },
      { fromTrack: 'cloud', fromModule: 2, toTrack: '__v5__cloud', toModule: 1 },
      { fromTrack: 'cloud', fromModule: 3, toTrack: '__v5__cloud', toModule: 2 },
      { fromTrack: 'cloud', fromModule: 4, toTrack: '__v5__cloud', toModule: 3 },
      { fromTrack: 'cloud', fromModule: 5, toTrack: '__v5__cloud', toModule: 4 },
      { fromTrack: 'cloud', fromModule: 6, toTrack: '__v5__cloud', toModule: 5 },
      { fromTrack: 'cloud', fromModule: 7, toTrack: '__v5__cloud', toModule: 6 },
      { fromTrack: 'cloud', fromModule: 8, toTrack: '__v5__cloud', toModule: 7 },
      { fromTrack: 'cloud', fromModule: 9, toTrack: '__v5__cloud', toModule: 8 },
      { fromTrack: 'cloud', fromModule: 10, toTrack: '__v5__cloud', toModule: 9 },
      { fromTrack: 'cloud', fromModule: 11, toTrack: '__v5__cloud', toModule: 10 },
      { fromTrack: 'cloud', fromModule: 12, toTrack: '__v5__cloud', toModule: 11 },
      { fromTrack: 'cloud', fromModule: 13, toTrack: '__v5__cloud', toModule: 12 },
      { fromTrack: 'cloud', fromModule: 14, toTrack: '__v5__cloud', toModule: 13 },
      { fromTrack: 'cloud', fromModule: 15, toTrack: '__v5__cloud', toModule: 14 },
      { fromTrack: 'cloud', fromModule: 16, toTrack: '__v5__cloud', toModule: 15 },
      { fromTrack: 'cloud', fromModule: 17, toTrack: '__v5__cloud', toModule: 16 },
      { fromTrack: 'cloud', fromModule: 18, toTrack: '__v5__cloud', toModule: 17 },
      { fromTrack: 'cloud', fromModule: 19, toTrack: '__v5__cloud', toModule: 18 },
      { fromTrack: 'cloud', fromModule: 20, toTrack: '__v5__cloud', toModule: 19 },
      { fromTrack: 'cloud', fromModule: 21, toTrack: '__v5__cloud', toModule: 20 },
      { fromTrack: 'cloud', fromModule: 22, toTrack: '__v5__cloud', toModule: 21 },
      { fromTrack: 'cloud', fromModule: 23, toTrack: '__v5__cloud', toModule: 22 },
      { fromTrack: 'cloud', fromModule: 24, toTrack: '__v5__cloud', toModule: 23 },
      { fromTrack: 'cloud', fromModule: 25, toTrack: '__v5__cloud', toModule: 24 },
      { fromTrack: 'cloud', fromModule: 26, toTrack: '__v5__cloud', toModule: 25 },
      { fromTrack: 'cloud', fromModule: 27, toTrack: '__v5__cloud', toModule: 26 },
      { fromTrack: 'cloud', fromModule: 28, toTrack: '__v5__cloud', toModule: 27 },
      { fromTrack: 'cloud', fromModule: 29, toTrack: '__v5__cloud', toModule: 28 },
      { fromTrack: 'cloud', fromModule: 30, toTrack: '__v5__cloud', toModule: 29 },
      { fromTrack: 'cloud', fromModule: 31, toTrack: '__v5__cloud', toModule: 30 },
      { fromTrack: 'cloud', fromModule: 32, toTrack: '__v5__cloud', toModule: 31 },
      { fromTrack: 'cloud', fromModule: 33, toTrack: '__v5__cloud', toModule: 32 },
      { fromTrack: 'cloud', fromModule: 34, toTrack: '__v5__cloud', toModule: 33 },
      { fromTrack: 'devops', fromModule: 0, toTrack: '__v5__linux', toModule: 0 },
      { fromTrack: 'devops', fromModule: 1, toTrack: '__v5__git', toModule: 0 },
      { fromTrack: 'devops', fromModule: 2, toTrack: '__v5__docker', toModule: 0 },
      { fromTrack: 'devops', fromModule: 3, toTrack: '__v5__docker', toModule: 1 },
      { fromTrack: 'devops', fromModule: 4, toTrack: '__v5__cicd', toModule: 0 },
      { fromTrack: 'devops', fromModule: 5, toTrack: '__v5__cicd', toModule: 1 },
      { fromTrack: 'devops', fromModule: 6, toTrack: '__v5__kubernetes', toModule: 0 },
      { fromTrack: 'devops', fromModule: 7, toTrack: '__v5__kubernetes', toModule: 1 },
      { fromTrack: 'devops', fromModule: 8, toTrack: '__v5__iac', toModule: 0 },
      { fromTrack: 'devops', fromModule: 9, toTrack: '__v5__observabilidad', toModule: 0 },
      { fromTrack: 'devops', fromModule: 10, toTrack: '__v5__observabilidad', toModule: 1 },
      { fromTrack: 'devops', fromModule: 11, toTrack: '__v5__seguridad', toModule: 1 },
      { fromTrack: 'devops', fromModule: 12, toTrack: '__v5__cloud', toModule: 34 },
      { fromTrack: 'devops', fromModule: 13, toTrack: '__v5__cicd', toModule: 2 },
      { fromTrack: 'devops', fromModule: 14, toTrack: '__v5__observabilidad', toModule: 2 },
      { fromTrack: 'devops', fromModule: 15, toTrack: '__v5__kubernetes', toModule: 2 },
      { fromTrack: 'devops', fromModule: 16, toTrack: '__v5__cicd', toModule: 3 },
      { fromTrack: 'devops', fromModule: 17, toTrack: '__v5__arquitectura', toModule: 2 },
      { fromTrack: 'devops', fromModule: 18, toTrack: '__v5__linux', toModule: 1 },
      { fromTrack: 'devops', fromModule: 19, toTrack: '__v5__arquitectura', toModule: 3 },
      { fromTrack: 'devops', fromModule: 20, toTrack: '__v5__mensajeria', toModule: 0 },
      { fromTrack: 'devops', fromModule: 21, toTrack: '__v5__arquitectura', toModule: 4 },
      { fromTrack: 'devops', fromModule: 22, toTrack: '__v5__cloud', toModule: 35 },
      { fromTrack: 'flutter', fromModule: 18, toTrack: '__v5__flutter', toModule: 13 },
      { fromTrack: 'flutter', fromModule: 21, toTrack: '__v5__flutter', toModule: 18 },
      { fromTrack: 'flutter', fromModule: 22, toTrack: '__v5__flutter', toModule: 19 },
      { fromTrack: 'foundations', fromModule: 4, toTrack: '__v5__sql', toModule: 0 },
      { fromTrack: 'foundations', fromModule: 5, toTrack: '__v5__foundations', toModule: 4 },
      { fromTrack: 'foundations', fromModule: 6, toTrack: '__v5__seguridad', toModule: 0 },
      { fromTrack: 'foundations', fromModule: 7, toTrack: '__v5__arquitectura', toModule: 0 },
      { fromTrack: 'foundations', fromModule: 8, toTrack: '__v5__foundations', toModule: 5 },
      { fromTrack: 'foundations', fromModule: 9, toTrack: '__v5__foundations', toModule: 6 },
      { fromTrack: 'foundations', fromModule: 10, toTrack: '__v5__arquitectura', toModule: 1 },
      { fromTrack: 'foundations', fromModule: 11, toTrack: '__v5__foundations', toModule: 7 },
      { fromTrack: 'foundations', fromModule: 12, toTrack: '__v5__foundations', toModule: 8 },
      { fromTrack: 'foundations', fromModule: 13, toTrack: '__v5__foundations', toModule: 9 },
      { fromTrack: 'foundations', fromModule: 14, toTrack: '__v5__foundations', toModule: 10 },
      { fromTrack: 'javascript', fromModule: 11, toTrack: '__v5__typescript', toModule: 0 },
      { fromTrack: 'javascript', fromModule: 12, toTrack: '__v5__javascript', toModule: 11 },
      { fromTrack: 'javascript', fromModule: 13, toTrack: '__v5__javascript', toModule: 12 },
      { fromTrack: 'javascript', fromModule: 14, toTrack: '__v5__javascript', toModule: 13 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 0, toTrack: '__v5__kotlin', toModule: 1 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 1, toTrack: '__v5__kotlin', toModule: 2 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 2, toTrack: '__v5__kotlin', toModule: 3 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 3, toTrack: '__v5__kotlin-multiplatform', toModule: 0 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 4, toTrack: '__v5__kotlin-multiplatform', toModule: 1 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 5, toTrack: '__v5__kotlin-multiplatform', toModule: 2 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 6, toTrack: '__v5__kotlin-multiplatform', toModule: 3 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 7, toTrack: '__v5__kotlin-multiplatform', toModule: 4 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 8, toTrack: '__v5__kotlin-multiplatform', toModule: 5 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 9, toTrack: '__v5__kotlin-multiplatform', toModule: 6 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 10, toTrack: '__v5__kotlin-multiplatform', toModule: 7 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 11, toTrack: '__v5__kotlin-multiplatform', toModule: 8 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 12, toTrack: '__v5__kotlin-multiplatform', toModule: 9 },
      { fromTrack: 'kotlin-multiplatform', fromModule: 13, toTrack: '__v5__kotlin-multiplatform', toModule: 10 },
      { fromTrack: 'node', fromModule: 13, toTrack: '__v5__typescript', toModule: 1 },
      { fromTrack: 'node-microservices', fromModule: 1, toTrack: '__v5__microservicios', toModule: 1 },
      { fromTrack: 'node-microservices', fromModule: 2, toTrack: '__v5__microservicios', toModule: 2 },
      { fromTrack: 'node-microservices', fromModule: 3, toTrack: '__v5__microservicios', toModule: 4 },
      { fromTrack: 'node-microservices', fromModule: 4, toTrack: '__v5__microservicios', toModule: 12 },
      { fromTrack: 'node-microservices', fromModule: 5, toTrack: '__v5__microservicios', toModule: 9 },
      { fromTrack: 'node-microservices', fromModule: 6, toTrack: '__v5__microservicios', toModule: 15 },
      { fromTrack: 'node-microservices', fromModule: 7, toTrack: '__v5__microservicios', toModule: 17 },
      { fromTrack: 'node-microservices', fromModule: 8, toTrack: '__v5__microservicios', toModule: 19 },
      { fromTrack: 'node-microservices', fromModule: 9, toTrack: '__v5__microservicios', toModule: 20 },
      { fromTrack: 'node-microservices', fromModule: 10, toTrack: '__v5__microservicios', toModule: 24 },
      { fromTrack: 'node-microservices', fromModule: 11, toTrack: '__v5__microservicios', toModule: 7 },
      { fromTrack: 'node-microservices', fromModule: 12, toTrack: '__v5__microservicios', toModule: 30 },
      { fromTrack: 'node-microservices', fromModule: 13, toTrack: '__v5__microservicios', toModule: 13 },
      { fromTrack: 'node-microservices', fromModule: 14, toTrack: '__v5__microservicios', toModule: 25 },
      { fromTrack: 'node-microservices', fromModule: 15, toTrack: '__v5__microservicios', toModule: 27 },
      { fromTrack: 'spring-boot', fromModule: 16, toTrack: '__v5__microservicios', toModule: 11 },
      { fromTrack: 'spring-boot', fromModule: 17, toTrack: '__v5__microservicios', toModule: 22 },
      { fromTrack: 'spring-boot', fromModule: 18, toTrack: '__v5__spring-boot', toModule: 16 },
      { fromTrack: 'spring-boot', fromModule: 19, toTrack: '__v5__spring-boot', toModule: 17 },
      { fromTrack: 'spring-boot', fromModule: 20, toTrack: '__v5__spring-boot', toModule: 18 },
      { fromTrack: 'spring-microservices', fromModule: 1, toTrack: '__v5__microservicios', toModule: 0 },
      { fromTrack: 'spring-microservices', fromModule: 2, toTrack: '__v5__microservicios', toModule: 3 },
      { fromTrack: 'spring-microservices', fromModule: 3, toTrack: '__v5__microservicios', toModule: 5 },
      { fromTrack: 'spring-microservices', fromModule: 4, toTrack: '__v5__microservicios', toModule: 6 },
      { fromTrack: 'spring-microservices', fromModule: 5, toTrack: '__v5__microservicios', toModule: 8 },
      { fromTrack: 'spring-microservices', fromModule: 6, toTrack: '__v5__microservicios', toModule: 10 },
      { fromTrack: 'spring-microservices', fromModule: 7, toTrack: '__v5__microservicios', toModule: 14 },
      { fromTrack: 'spring-microservices', fromModule: 8, toTrack: '__v5__microservicios', toModule: 16 },
      { fromTrack: 'spring-microservices', fromModule: 9, toTrack: '__v5__microservicios', toModule: 18 },
      { fromTrack: 'spring-microservices', fromModule: 10, toTrack: '__v5__mensajeria', toModule: 1 },
      { fromTrack: 'spring-microservices', fromModule: 11, toTrack: '__v5__microservicios', toModule: 21 },
      { fromTrack: 'spring-microservices', fromModule: 12, toTrack: '__v5__microservicios', toModule: 23 },
      { fromTrack: 'spring-microservices', fromModule: 13, toTrack: '__v5__microservicios', toModule: 26 },
      { fromTrack: 'spring-microservices', fromModule: 14, toTrack: '__v5__microservicios', toModule: 28 },
      { fromTrack: 'spring-microservices', fromModule: 15, toTrack: '__v5__microservicios', toModule: 29 },
      { fromTrack: 'spring-microservices', fromModule: 0, toTrack: '__retirados_v5__', toModule: 0 },
      { fromTrack: 'node-microservices', fromModule: 0, toTrack: '__retirados_v5__', toModule: 0 },
      { fromTrack: 'flutter', fromModule: 19, toTrack: '__retirados_v5__', toModule: 19 },
      { fromTrack: 'flutter', fromModule: 20, toTrack: '__retirados_v5__', toModule: 20 },
    ],
  },
  {
    version: 6,
    tracks: {},
    moves: [
      { fromTrack: '__v5__android', fromModule: 0, toTrack: 'android', toModule: 0 },
      { fromTrack: '__v5__android', fromModule: 1, toTrack: 'android', toModule: 1 },
      { fromTrack: '__v5__android', fromModule: 2, toTrack: 'android', toModule: 2 },
      { fromTrack: '__v5__android', fromModule: 3, toTrack: 'android', toModule: 3 },
      { fromTrack: '__v5__android', fromModule: 4, toTrack: 'android', toModule: 4 },
      { fromTrack: '__v5__android', fromModule: 5, toTrack: 'android', toModule: 5 },
      { fromTrack: '__v5__android', fromModule: 6, toTrack: 'android', toModule: 6 },
      { fromTrack: '__v5__android', fromModule: 7, toTrack: 'android', toModule: 7 },
      { fromTrack: '__v5__android', fromModule: 8, toTrack: 'android', toModule: 8 },
      { fromTrack: '__v5__android', fromModule: 9, toTrack: 'android', toModule: 9 },
      { fromTrack: '__v5__android', fromModule: 10, toTrack: 'android', toModule: 10 },
      { fromTrack: '__v5__android', fromModule: 11, toTrack: 'android', toModule: 11 },
      { fromTrack: '__v5__android', fromModule: 12, toTrack: 'android', toModule: 12 },
      { fromTrack: '__v5__android', fromModule: 13, toTrack: 'android', toModule: 13 },
      { fromTrack: '__v5__android', fromModule: 14, toTrack: 'android', toModule: 14 },
      { fromTrack: '__v5__android', fromModule: 15, toTrack: 'android', toModule: 15 },
      { fromTrack: '__v5__android', fromModule: 16, toTrack: 'android', toModule: 16 },
      { fromTrack: '__v5__android', fromModule: 17, toTrack: 'android', toModule: 17 },
      { fromTrack: '__v5__arquitectura', fromModule: 0, toTrack: 'arquitectura', toModule: 0 },
      { fromTrack: '__v5__arquitectura', fromModule: 1, toTrack: 'arquitectura', toModule: 1 },
      { fromTrack: '__v5__arquitectura', fromModule: 2, toTrack: 'arquitectura', toModule: 2 },
      { fromTrack: '__v5__arquitectura', fromModule: 3, toTrack: 'arquitectura', toModule: 3 },
      { fromTrack: '__v5__arquitectura', fromModule: 4, toTrack: 'arquitectura', toModule: 4 },
      { fromTrack: '__v5__cicd', fromModule: 0, toTrack: 'cicd', toModule: 0 },
      { fromTrack: '__v5__cicd', fromModule: 1, toTrack: 'cicd', toModule: 1 },
      { fromTrack: '__v5__cicd', fromModule: 2, toTrack: 'cicd', toModule: 2 },
      { fromTrack: '__v5__cicd', fromModule: 3, toTrack: 'cicd', toModule: 3 },
      { fromTrack: '__v5__cloud', fromModule: 1, toTrack: 'cloud', toModule: 1 },
      { fromTrack: '__v5__cloud', fromModule: 2, toTrack: 'cloud', toModule: 2 },
      { fromTrack: '__v5__cloud', fromModule: 3, toTrack: 'cloud', toModule: 3 },
      { fromTrack: '__v5__cloud', fromModule: 4, toTrack: 'cloud', toModule: 4 },
      { fromTrack: '__v5__cloud', fromModule: 5, toTrack: 'cloud', toModule: 5 },
      { fromTrack: '__v5__cloud', fromModule: 6, toTrack: 'cloud', toModule: 6 },
      { fromTrack: '__v5__cloud', fromModule: 7, toTrack: 'cloud', toModule: 7 },
      { fromTrack: '__v5__cloud', fromModule: 8, toTrack: 'cloud', toModule: 8 },
      { fromTrack: '__v5__cloud', fromModule: 9, toTrack: 'cloud', toModule: 9 },
      { fromTrack: '__v5__cloud', fromModule: 10, toTrack: 'cloud', toModule: 10 },
      { fromTrack: '__v5__cloud', fromModule: 11, toTrack: 'cloud', toModule: 11 },
      { fromTrack: '__v5__cloud', fromModule: 12, toTrack: 'cloud', toModule: 12 },
      { fromTrack: '__v5__cloud', fromModule: 13, toTrack: 'cloud', toModule: 13 },
      { fromTrack: '__v5__cloud', fromModule: 14, toTrack: 'cloud', toModule: 14 },
      { fromTrack: '__v5__cloud', fromModule: 15, toTrack: 'cloud', toModule: 15 },
      { fromTrack: '__v5__cloud', fromModule: 16, toTrack: 'cloud', toModule: 16 },
      { fromTrack: '__v5__cloud', fromModule: 17, toTrack: 'cloud', toModule: 17 },
      { fromTrack: '__v5__cloud', fromModule: 18, toTrack: 'cloud', toModule: 18 },
      { fromTrack: '__v5__cloud', fromModule: 19, toTrack: 'cloud', toModule: 19 },
      { fromTrack: '__v5__cloud', fromModule: 20, toTrack: 'cloud', toModule: 20 },
      { fromTrack: '__v5__cloud', fromModule: 21, toTrack: 'cloud', toModule: 21 },
      { fromTrack: '__v5__cloud', fromModule: 22, toTrack: 'cloud', toModule: 22 },
      { fromTrack: '__v5__cloud', fromModule: 23, toTrack: 'cloud', toModule: 23 },
      { fromTrack: '__v5__cloud', fromModule: 24, toTrack: 'cloud', toModule: 24 },
      { fromTrack: '__v5__cloud', fromModule: 25, toTrack: 'cloud', toModule: 25 },
      { fromTrack: '__v5__cloud', fromModule: 26, toTrack: 'cloud', toModule: 26 },
      { fromTrack: '__v5__cloud', fromModule: 27, toTrack: 'cloud', toModule: 27 },
      { fromTrack: '__v5__cloud', fromModule: 28, toTrack: 'cloud', toModule: 28 },
      { fromTrack: '__v5__cloud', fromModule: 29, toTrack: 'cloud', toModule: 29 },
      { fromTrack: '__v5__cloud', fromModule: 30, toTrack: 'cloud', toModule: 30 },
      { fromTrack: '__v5__cloud', fromModule: 31, toTrack: 'cloud', toModule: 31 },
      { fromTrack: '__v5__cloud', fromModule: 32, toTrack: 'cloud', toModule: 32 },
      { fromTrack: '__v5__cloud', fromModule: 33, toTrack: 'cloud', toModule: 33 },
      { fromTrack: '__v5__cloud', fromModule: 34, toTrack: 'cloud', toModule: 34 },
      { fromTrack: '__v5__cloud', fromModule: 35, toTrack: 'cloud', toModule: 35 },
      { fromTrack: '__v5__docker', fromModule: 0, toTrack: 'docker', toModule: 0 },
      { fromTrack: '__v5__docker', fromModule: 1, toTrack: 'docker', toModule: 1 },
      { fromTrack: '__v5__docker', fromModule: 2, toTrack: 'docker', toModule: 2 },
      { fromTrack: '__v5__flutter', fromModule: 13, toTrack: 'flutter', toModule: 13 },
      { fromTrack: '__v5__flutter', fromModule: 18, toTrack: 'flutter', toModule: 18 },
      { fromTrack: '__v5__flutter', fromModule: 19, toTrack: 'flutter', toModule: 19 },
      { fromTrack: '__v5__foundations', fromModule: 4, toTrack: 'foundations', toModule: 4 },
      { fromTrack: '__v5__foundations', fromModule: 5, toTrack: 'foundations', toModule: 5 },
      { fromTrack: '__v5__foundations', fromModule: 6, toTrack: 'foundations', toModule: 6 },
      { fromTrack: '__v5__foundations', fromModule: 7, toTrack: 'foundations', toModule: 7 },
      { fromTrack: '__v5__foundations', fromModule: 8, toTrack: 'foundations', toModule: 8 },
      { fromTrack: '__v5__foundations', fromModule: 9, toTrack: 'foundations', toModule: 9 },
      { fromTrack: '__v5__foundations', fromModule: 10, toTrack: 'foundations', toModule: 10 },
      { fromTrack: '__v5__git', fromModule: 0, toTrack: 'git', toModule: 0 },
      { fromTrack: '__v5__iac', fromModule: 0, toTrack: 'iac', toModule: 0 },
      { fromTrack: '__v5__javascript', fromModule: 11, toTrack: 'javascript', toModule: 11 },
      { fromTrack: '__v5__javascript', fromModule: 12, toTrack: 'javascript', toModule: 12 },
      { fromTrack: '__v5__javascript', fromModule: 13, toTrack: 'javascript', toModule: 13 },
      { fromTrack: '__v5__kotlin', fromModule: 0, toTrack: 'kotlin', toModule: 0 },
      { fromTrack: '__v5__kotlin', fromModule: 1, toTrack: 'kotlin', toModule: 1 },
      { fromTrack: '__v5__kotlin', fromModule: 2, toTrack: 'kotlin', toModule: 2 },
      { fromTrack: '__v5__kotlin', fromModule: 3, toTrack: 'kotlin', toModule: 3 },
      { fromTrack: '__v5__kotlin-multiplatform', fromModule: 0, toTrack: 'kotlin-multiplatform', toModule: 0 },
      { fromTrack: '__v5__kotlin-multiplatform', fromModule: 1, toTrack: 'kotlin-multiplatform', toModule: 1 },
      { fromTrack: '__v5__kotlin-multiplatform', fromModule: 2, toTrack: 'kotlin-multiplatform', toModule: 2 },
      { fromTrack: '__v5__kotlin-multiplatform', fromModule: 3, toTrack: 'kotlin-multiplatform', toModule: 3 },
      { fromTrack: '__v5__kotlin-multiplatform', fromModule: 4, toTrack: 'kotlin-multiplatform', toModule: 4 },
      { fromTrack: '__v5__kotlin-multiplatform', fromModule: 5, toTrack: 'kotlin-multiplatform', toModule: 5 },
      { fromTrack: '__v5__kotlin-multiplatform', fromModule: 6, toTrack: 'kotlin-multiplatform', toModule: 6 },
      { fromTrack: '__v5__kotlin-multiplatform', fromModule: 7, toTrack: 'kotlin-multiplatform', toModule: 7 },
      { fromTrack: '__v5__kotlin-multiplatform', fromModule: 8, toTrack: 'kotlin-multiplatform', toModule: 8 },
      { fromTrack: '__v5__kotlin-multiplatform', fromModule: 9, toTrack: 'kotlin-multiplatform', toModule: 9 },
      { fromTrack: '__v5__kotlin-multiplatform', fromModule: 10, toTrack: 'kotlin-multiplatform', toModule: 10 },
      { fromTrack: '__v5__kubernetes', fromModule: 0, toTrack: 'kubernetes', toModule: 0 },
      { fromTrack: '__v5__kubernetes', fromModule: 1, toTrack: 'kubernetes', toModule: 1 },
      { fromTrack: '__v5__kubernetes', fromModule: 2, toTrack: 'kubernetes', toModule: 2 },
      { fromTrack: '__v5__linux', fromModule: 0, toTrack: 'linux', toModule: 0 },
      { fromTrack: '__v5__linux', fromModule: 1, toTrack: 'linux', toModule: 1 },
      { fromTrack: '__v5__mensajeria', fromModule: 0, toTrack: 'mensajeria', toModule: 0 },
      { fromTrack: '__v5__mensajeria', fromModule: 1, toTrack: 'mensajeria', toModule: 1 },
      { fromTrack: '__v5__microservicios', fromModule: 0, toTrack: 'microservicios', toModule: 0 },
      { fromTrack: '__v5__microservicios', fromModule: 1, toTrack: 'microservicios', toModule: 1 },
      { fromTrack: '__v5__microservicios', fromModule: 2, toTrack: 'microservicios', toModule: 2 },
      { fromTrack: '__v5__microservicios', fromModule: 3, toTrack: 'microservicios', toModule: 3 },
      { fromTrack: '__v5__microservicios', fromModule: 4, toTrack: 'microservicios', toModule: 4 },
      { fromTrack: '__v5__microservicios', fromModule: 5, toTrack: 'microservicios', toModule: 5 },
      { fromTrack: '__v5__microservicios', fromModule: 6, toTrack: 'microservicios', toModule: 6 },
      { fromTrack: '__v5__microservicios', fromModule: 7, toTrack: 'microservicios', toModule: 7 },
      { fromTrack: '__v5__microservicios', fromModule: 8, toTrack: 'microservicios', toModule: 8 },
      { fromTrack: '__v5__microservicios', fromModule: 9, toTrack: 'microservicios', toModule: 9 },
      { fromTrack: '__v5__microservicios', fromModule: 10, toTrack: 'microservicios', toModule: 10 },
      { fromTrack: '__v5__microservicios', fromModule: 11, toTrack: 'microservicios', toModule: 11 },
      { fromTrack: '__v5__microservicios', fromModule: 12, toTrack: 'microservicios', toModule: 12 },
      { fromTrack: '__v5__microservicios', fromModule: 13, toTrack: 'microservicios', toModule: 13 },
      { fromTrack: '__v5__microservicios', fromModule: 14, toTrack: 'microservicios', toModule: 14 },
      { fromTrack: '__v5__microservicios', fromModule: 15, toTrack: 'microservicios', toModule: 15 },
      { fromTrack: '__v5__microservicios', fromModule: 16, toTrack: 'microservicios', toModule: 16 },
      { fromTrack: '__v5__microservicios', fromModule: 17, toTrack: 'microservicios', toModule: 17 },
      { fromTrack: '__v5__microservicios', fromModule: 18, toTrack: 'microservicios', toModule: 18 },
      { fromTrack: '__v5__microservicios', fromModule: 19, toTrack: 'microservicios', toModule: 19 },
      { fromTrack: '__v5__microservicios', fromModule: 20, toTrack: 'microservicios', toModule: 20 },
      { fromTrack: '__v5__microservicios', fromModule: 21, toTrack: 'microservicios', toModule: 21 },
      { fromTrack: '__v5__microservicios', fromModule: 22, toTrack: 'microservicios', toModule: 22 },
      { fromTrack: '__v5__microservicios', fromModule: 23, toTrack: 'microservicios', toModule: 23 },
      { fromTrack: '__v5__microservicios', fromModule: 24, toTrack: 'microservicios', toModule: 24 },
      { fromTrack: '__v5__microservicios', fromModule: 25, toTrack: 'microservicios', toModule: 25 },
      { fromTrack: '__v5__microservicios', fromModule: 26, toTrack: 'microservicios', toModule: 26 },
      { fromTrack: '__v5__microservicios', fromModule: 27, toTrack: 'microservicios', toModule: 27 },
      { fromTrack: '__v5__microservicios', fromModule: 28, toTrack: 'microservicios', toModule: 28 },
      { fromTrack: '__v5__microservicios', fromModule: 29, toTrack: 'microservicios', toModule: 29 },
      { fromTrack: '__v5__microservicios', fromModule: 30, toTrack: 'microservicios', toModule: 30 },
      { fromTrack: '__v5__observabilidad', fromModule: 0, toTrack: 'observabilidad', toModule: 0 },
      { fromTrack: '__v5__observabilidad', fromModule: 1, toTrack: 'observabilidad', toModule: 1 },
      { fromTrack: '__v5__observabilidad', fromModule: 2, toTrack: 'observabilidad', toModule: 2 },
      { fromTrack: '__v5__seguridad', fromModule: 0, toTrack: 'seguridad', toModule: 0 },
      { fromTrack: '__v5__seguridad', fromModule: 1, toTrack: 'seguridad', toModule: 1 },
      { fromTrack: '__v5__spring-boot', fromModule: 16, toTrack: 'spring-boot', toModule: 16 },
      { fromTrack: '__v5__spring-boot', fromModule: 17, toTrack: 'spring-boot', toModule: 17 },
      { fromTrack: '__v5__spring-boot', fromModule: 18, toTrack: 'spring-boot', toModule: 18 },
      { fromTrack: '__v5__sql', fromModule: 0, toTrack: 'sql', toModule: 0 },
      { fromTrack: '__v5__typescript', fromModule: 0, toTrack: 'typescript', toModule: 0 },
      { fromTrack: '__v5__typescript', fromModule: 1, toTrack: 'typescript', toModule: 1 },
    ],
  },
];

export const RENUMBERING_VERSION_KEY = 'imperial-book-renumbering-version';

function translateKey(key: string, map: Record<number, number>): string {
  const match = /^(\d+):(.*)$/s.exec(key);
  if (!match) return key;
  const moved = map[Number(match[1])];
  return moved === undefined ? key : `${moved}:${match[2]}`;
}

function moveModuleKey(key: string, fromModule: number, toModule: number): string | null {
  const match = /^(\d+):(.*)$/s.exec(key);
  if (!match || Number(match[1]) !== fromModule) return null;
  return `${toModule}:${match[2]}`;
}

function emptyProgress(): TrackProgress {
  return { completedModules: [], completedExercises: [], completedTopics: [] };
}

/** Aplica, en orden, los pasos posteriores a `fromVersion`. Devuelve el progreso traducido. */
export function applyRenumberings(
  state: Record<string, TrackProgress>,
  fromVersion: number,
  steps: RenumberingStep[] = RENUMBERING_STEPS,
): Record<string, TrackProgress> {
  let result = state;
  for (const step of steps.filter(s => s.version > fromVersion).sort((a, b) => a.version - b.version)) {
    const next: Record<string, TrackProgress> = { ...result };
    for (const [trackId, map] of Object.entries(step.tracks)) {
      const current = result[trackId];
      if (!current) continue;
      next[trackId] = {
        completedModules: [...new Set(current.completedModules.map(id => map[id] ?? id))],
        completedExercises: [...new Set(current.completedExercises.map(k => translateKey(k, map)))],
        completedTopics: [...new Set(current.completedTopics.map(k => translateKey(k, map)))],
      };
    }
    for (const move of step.moves ?? []) {
      const source = next[move.fromTrack] ?? emptyProgress();
      const target = next[move.toTrack] ?? emptyProgress();
      const movedModule = source.completedModules.includes(move.fromModule);
      const movedExercises = source.completedExercises
        .map(k => moveModuleKey(k, move.fromModule, move.toModule))
        .filter((k): k is string => k !== null);
      const movedTopics = source.completedTopics
        .map(k => moveModuleKey(k, move.fromModule, move.toModule))
        .filter((k): k is string => k !== null);
      if (movedModule || movedExercises.length || movedTopics.length) {
        if (!move.copy) {
          next[move.fromTrack] = {
            completedModules: source.completedModules.filter(id => id !== move.fromModule),
            completedExercises: source.completedExercises.filter(k => !/^(\d+):/.exec(k) || Number(/^(\d+):/.exec(k)?.[1]) !== move.fromModule),
            completedTopics: source.completedTopics.filter(k => !/^(\d+):/.exec(k) || Number(/^(\d+):/.exec(k)?.[1]) !== move.fromModule),
          };
        }
        next[move.toTrack] = {
          completedModules: [...new Set([...target.completedModules, ...(movedModule ? [move.toModule] : [])])],
          completedExercises: [...new Set([...target.completedExercises, ...movedExercises])],
          completedTopics: [...new Set([...target.completedTopics, ...movedTopics])],
        };
      }
    }
    for (const [trackId, renames] of Object.entries(step.topics ?? {})) {
      const current = next[trackId];
      if (!current) continue;
      next[trackId] = {
        ...current,
        completedTopics: [...new Set(current.completedTopics.map(k => renames[k] ?? k))],
      };
    }
    result = next;
  }
  return result;
}

export function latestRenumberingVersion(steps: RenumberingStep[] = RENUMBERING_STEPS): number {
  return steps.reduce((max, s) => Math.max(max, s.version), 0);
}
