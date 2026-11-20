import type { TrackProgress } from './progress.service';

/**
 * Renumeraciones de módulos (specs/020). Cuando un curso fusiona o mueve módulos, se agrega aquí un paso
 * con la traducción `id antiguo → id nuevo` de cada curso afectado. El progreso guardado del estudiante se
 * traduce una sola vez por paso, en orden, para que no pierda lo que ya completó.
 */
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
];

export const RENUMBERING_VERSION_KEY = 'imperial-book-renumbering-version';

function translateKey(key: string, map: Record<number, number>): string {
  const match = /^(\d+):(.*)$/s.exec(key);
  if (!match) return key;
  const moved = map[Number(match[1])];
  return moved === undefined ? key : `${moved}:${match[2]}`;
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
