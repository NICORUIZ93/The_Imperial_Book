# Temario propuesto · Diseño de sistemas

**Estado:** propuesta para aprobación del dueño. No hay lecciones escritas.
**Fecha de revisión de fuentes:** 2026-11-18.
**Identificador de ruta previsto:** `system-design`.

## 1. Público y prerrequisitos

Para quien ya construye backends y necesita decidir, con números, cómo crece un sistema: dónde va la caché,
cómo se reparten los datos, qué consistencia se acepta y qué pasa cuando algo falla. Sirve también para
preparar entrevistas de diseño, pero el objetivo es decidir sobre RutaFlow, no memorizar respuestas.

| Prerrequisito | Módulos | Para qué |
|---|---|---|
| Fundamentos | M3 (red y HTTP), M4 (SQL) y M10 (sistemas distribuidos) | Vocabulario base. Fundamentos M10 T7 («de requisitos a estimación») es la introducción que este curso profundiza |
| Spring Boot | M0–M3 | La API de RutaFlow que se mide |
| Docker | M7 (Compose) | Levantar los laboratorios: réplicas, caché y colas |

Recomendado: Microservicios M0, por las falacias de la red y los deadlines.

## 2. Resultado final medible

1. Un documento de diseño de RutaFlow a 10 veces su carga actual, con requisitos medibles, estimación de capacidad,
   diagrama C4 de contenedores, tres ADR y una revisión con los pilares de Well-Architected.
2. Una prueba de carga reproducible que encuentra el cuello de botella antes y después de cada cambio, con el p50,
   el p95 y el p99 registrados.
3. Cinco ejercicios de diseño (M8), cada uno con su estimación, sus decisiones y la alternativa descartada.
4. Una decisión de consistencia por cada flujo crítico de RutaFlow (crear envío, tracking, liquidación), con el
   fallo que la justifica.

## 3. Versiones de referencia

Es un curso de conceptos con laboratorios. Los laboratorios usan las versiones de `docs/VERSIONES.md`:
JDK 25, Spring Boot 4.1.x y Docker Engine 29. Los motores (PostgreSQL, caché y broker) se fijan por versión al
escribir cada tema.

## 4. Qué se incorpora desde otros cursos (reparto aprobado en specs/016)

| Origen | Contenido | Destino | Tratamiento |
|---|---|---|---|
| DevOps M17 T1 | El borde: balanceo, proxy inverso, CDN y límites de tasa | M1 T1–T3 | Se divide en tres temas |
| DevOps M17 T2 | Índices, réplicas, sharding y elección SQL/NoSQL | M2 T1–T4 | Se divide en cuatro temas |
| DevOps M17 T3 | CAP, consistencia e idempotencia | M4 T1, M4 T2 y M4 T4 | — |
| DevOps M17 T4 | Latencia, throughput, SLO y pruebas de carga | M6 T1–T3 | — |

Estos temas no se mueven; se enlazan:
- Fundamentos M10 T7: es el prerrequisito.
- Cloud M32 T5 (Well-Architected aplicado a AWS), desde M0 T4.
- Cloud M32 T3 (disponibilidad y recuperación), desde M7 T2.
- DevOps M14 T1 (SLO), desde M6 T2.
- Microservicios M3 (gateway) y M5 (consistencia entre servicios), desde M1 T4 y M4.

## 5. Módulos

### M0 · Método: de requisitos a números
**Objetivo:** convertir una petición vaga en requisitos medibles y una estimación.
**Origen:** nuevo; profundiza Fundamentos M10 T7.
- T1 · Requisitos funcionales y no funcionales medibles · 35 min
- T2 · Estimación de capacidad para RutaFlow: peticiones por segundo, almacenamiento y ancho de banda · 40 min
- T3 · Diagramas C4 y ADR de diseño · 40 min
- T4 · Revisar un diseño con los pilares de Well-Architected · 35 min

**Hito RutaFlow:** hoja de estimación y diagrama C4 de la situación actual.
**Duración:** 2 h 30 min

### M1 · El borde y el tráfico
**Objetivo:** decidir qué ocurre antes de que una petición llegue a la API.
**Origen:** DevOps M17 T1.
- T1 · DNS y CDN: qué se puede servir sin tocar el origen · 35 min
- T2 · Balanceo L4 y L7, y proxy inverso · 40 min
- T3 · Límite de tasa: token bucket y ventana deslizante, medidos · 45 min
- T4 · API gateway como decisión de diseño (la implementación está en Microservicios M3) · 30 min

**Hito RutaFlow:** límite de tasa en la API pública de tracking, con una prueba que lo dispara.
**Duración:** 2 h 30 min

### M2 · Datos que crecen
**Objetivo:** escalar lecturas y escrituras sin perder control de los datos.
**Origen:** DevOps M17 T2.
- T1 · Índices y planes de consulta en PostgreSQL · 40 min
- T2 · Réplicas de lectura y retraso de replicación observable · 40 min
- T3 · Particionado y sharding: elegir la clave y evitar claves calientes · 45 min
- T4 · Elegir el almacén: relacional, documental, clave-valor, columnar o de búsqueda · 40 min

**Hito RutaFlow:** la consulta de envíos por ciudad pasa de escaneo secuencial a uso de índice, con el plan como evidencia.
**Duración:** 2 h 45 min

### M3 · Caché
**Objetivo:** usar caché donde reduce latencia sin servir datos falsos.
**Origen:** nuevo.
- T1 · Cache-aside, read-through y write-through · 40 min
- T2 · TTL, invalidación y estampida de caché · 40 min
- T3 · Caché HTTP: `Cache-Control`, ETag y CDN · 35 min

**Hito RutaFlow:** el tracking público sirve desde caché, con la invalidación demostrada al cambiar el estado.
**Duración:** 1 h 55 min

### M4 · Consistencia y coordinación
**Objetivo:** elegir el modelo de consistencia por flujo, sabiendo lo que cuesta.
**Origen:** DevOps M17 T3.
- T1 · CAP y PACELC sin mitos · 40 min
- T2 · Modelos de consistencia: lineal, causal, eventual y «leer lo que escribí» · 45 min
- T3 · Consenso y elección de líder: cuándo hace falta (Raft, etcd) · 40 min
- T4 · Idempotencia como decisión de diseño (la implementación está en Microservicios M0 T5) · 35 min

**Hito RutaFlow:** tabla de consistencia por flujo, con el fallo que la justifica.
**Duración:** 2 h 40 min

### M5 · Asincronía
**Objetivo:** desacoplar en el tiempo sin perder trabajo.
**Origen:** nuevo.
- T1 · Cola frente a log de eventos · 40 min
- T2 · Backpressure y nivelación con cola · 40 min
- T3 · Lotes frente a streaming · 40 min

**Hito RutaFlow:** la generación de etiquetas pasa a una cola y la API responde en p95 menor que antes.
**Duración:** 2 h

### M6 · Capacidad, rendimiento y sobrecarga
**Objetivo:** medir antes de cambiar y fallar con control.
**Origen:** DevOps M17 T4.
- T1 · Latencia, throughput, percentiles y ley de Little · 45 min
- T2 · SLI, SLO y presupuesto de error en el diseño (enlaza DevOps M14) · 35 min
- T3 · Prueba de carga reproducible y lectura del cuello de botella · 45 min
- T4 · Sobrecarga y fallos en cascada: descarte de carga y timeouts · 40 min

**Hito RutaFlow:** informe de carga antes y después, con p50, p95 y p99.
**Duración:** 2 h 45 min

### M7 · Disponibilidad y recuperación
**Objetivo:** diseñar para el fallo de un componente, de una zona y de una región.
**Origen:** nuevo; enlaza Cloud M32 T3.
- T1 · Redundancia y dominios de falla · 40 min
- T2 · RPO y RTO, y cómo elegir una estrategia de recuperación · 40 min
- T3 · Multirregión: activo-pasivo frente a activo-activo · 40 min

**Hito RutaFlow:** RPO y RTO por servicio, y un simulacro de restauración medido.
**Duración:** 2 h

### M8 · Casos de diseño
**Objetivo:** aplicar el método completo a problemas conocidos.
**Origen:** nuevo.
- T1 · Acortador de enlaces para las guías de RutaFlow · 45 min
- T2 · Seguimiento de paquetes en tiempo real · 45 min
- T3 · Notificaciones a millones de destinatarios · 45 min
- T4 · Búsqueda geoespacial de conductores cercanos · 45 min
- T5 · Liquidaciones y pagos sin duplicados · 45 min

**Hito RutaFlow:** cinco documentos breves con estimación, decisiones y alternativa descartada.
**Duración:** 3 h 45 min

### M9 · Proyecto integrador
**Objetivo:** el documento de diseño de RutaFlow a 10 veces su carga, defendido con mediciones.
- T1 · Hito 1: requisitos, estimación y C4 (M0) · 45 min
- T2 · Hito 2: datos, caché y asincronía, con mediciones (M2, M3 y M5) · 45 min
- T3 · Hito 3: consistencia, disponibilidad y SLO (M4, M6 y M7) · 45 min
- T4 · Hito 4: revisión Well-Architected y defensa de tres ADR · 45 min

Trabajo autónomo del proyecto: 6 h.
**Duración:** 3 h de temas + 6 h de proyecto.

## 6. Proyecto integrador sobre RutaFlow

El sistema es el backend Spring Boot de RutaFlow, con PostgreSQL, levantado con Compose (curso Docker). Cada
módulo añade una medición o una decisión al mismo documento de diseño, y el integrador lo cierra. La rúbrica son
las cuatro evidencias del apartado 2.

## 7. Horas estimadas

Fórmula: suma de las duraciones de los temas más las horas de proyecto. Total: **25 h 50 min de temas + 6 h de proyecto = 31 h 50 min (≈ 32 h)**.

## 8. Cobertura frente a fuentes reconocidas

No existe una certificación de referencia en diseño de sistemas. La cobertura se mide frente a estas fuentes:

| Fuente | Qué aporta | Dónde |
|---|---|---|
| Kleppmann y Riccomini, *Designing Data-Intensive Applications*, 2.ª ed., O'Reilly, marzo de 2026 ([anuncio del autor](https://martin.kleppmann.com/2026/03/24/designing-data-intensive-applications-2e.html)) | Replicación, particionado, transacciones, consistencia, consenso, lotes y streams | M2, M4 y M5 |
| Google, *Site Reliability Engineering* ([índice](https://sre.google/sre-book/table-of-contents/)): cap. 4 «Service Level Objectives», 19–20 «Load Balancing», 21 «Handling Overload», 22 «Addressing Cascading Failures», 23 «Distributed Consensus» | SLO, balanceo, sobrecarga y consenso | M1, M4 T3 y M6 |
| [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html): seis pilares | Revisión de un diseño | M0 T4 y M9 |
| [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/pillars): cinco pilares | Contraste entre proveedores | M0 T4 |
| [System Design Primer](https://github.com/donnemartin/system-design-primer), repositorio comunitario. No es fuente primaria: sirve para comprobar que no falte un tema | Índice: rendimiento y escalabilidad, latencia y throughput, disponibilidad y consistencia, DNS, CDN, balanceador, proxy inverso, base de datos, caché, asincronía, comunicación y seguridad | Cada entrada del índice tiene módulo: M1–M7 |
| [Azure Architecture Center: patrones](https://learn.microsoft.com/en-us/azure/architecture/patterns/) | Cache-Aside, Queue-Based Load Leveling, Rate Limiting, Sharding, Throttling y Static Content Hosting | M3 T1, M5 T2, M1 T3, M2 T3, M6 T4 y M1 T1 |

## 9. Fuera de alcance, con motivo

Los patrones entre servicios (Saga, CQRS, BFF y Strangler) son del curso Microservicios. Aquí se citan como
decisión y se enlazan.

## Fuentes consultadas (2026-11-18)

- https://martin.kleppmann.com/2026/03/24/designing-data-intensive-applications-2e.html
- https://sre.google/sre-book/table-of-contents/
- https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html
- https://learn.microsoft.com/en-us/azure/well-architected/pillars
- https://learn.microsoft.com/en-us/azure/architecture/patterns/
- https://github.com/donnemartin/system-design-primer
