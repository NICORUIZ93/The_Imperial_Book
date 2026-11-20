# 3 · Tabla de contenidos

> Entregable 3 del prompt del dueño: los **37 módulos** con duración, dificultad y dependencias. Fuente de los
> módulos y del número de fichas: [docs/temarios/microservicios-inventario.json](../temarios/microservicios-inventario.json)
> (187 fichas). Las semanas suman **32**, dentro de las 28–32 que pide el prompt.

## Cómo se calculó la duración

- **Ritmo de referencia:** 10–12 horas por semana (una ficha de 14 puntos con su laboratorio lleva entre 1.5 y
  3 horas; el Proyecto Final, más).
- **Conflicto del prompt, resuelto así:** las duraciones por fase que da el prompt (4 + 12 + 12 + 8) suman
  **36 semanas**, pero el objetivo global es **28–32**. Para cumplir el objetivo global se mantienen la Fase 0
  (4) y la Fase 3 (8) y se dan **10 semanas** a cada fase de stack. Motivo: quien hace las dos fases ya domina en
  la segunda los conceptos que se repiten (DDD, síncrono frente a asíncrono, Kubernetes, observabilidad) y avanza
  más rápido en ellos; cada fase sigue estando completa por sí misma.
- **Ruta extendida (36 semanas):** si prefieres las duraciones literales del prompt, suma 1 semana a los
  módulos 3, 9 y 12 (Fase 1) y a los módulos 13, 20 y 22 (Fase 2): 12 + 12 semanas.
- **Ruta de un solo stack (22 semanas):** Fase 0 + Fase 1 **o** Fase 2 + Fase 3. En la Fase 3, donde una
  dependencia dice «11 o 22», vale el módulo del stack que hiciste.

## Escala de dificultad

| Nivel | Significa |
|---|---|
| ★☆☆☆☆ (1) | Nunca programaste: todo se explica desde cero. |
| ★★☆☆☆ (2) | Escribes programas pequeños y usas la terminal. |
| ★★★☆☆ (3) | Construyes una API con base de datos y tests. |
| ★★★★☆ (4) | Operas varios servicios con infraestructura (broker, clúster, observabilidad). |
| ★★★★★ (5) | Decides arquitectura con trade-offs y la defiendes. |

## Fase 0 · Fundamentos absolutos — 4 semanas (el prompt indica 4)

| Módulo | Archivo | Título | Fichas | Semanas | Dificultad | Depende de |
|---|---|---|---|---|---|---|
| Módulo 0.1 | `modulo-0.md` | Qué es un programa, un servidor y una API (analogías visuales) | 3 | 0.5 | ★☆☆☆☆ (1/5) | — |
| Módulo 0.2 | `modulo-1.md` | Lógica de programación y pensamiento computacional | 2 | 1 | ★☆☆☆☆ (1/5) | 0.1 |
| Módulo 0.3 | `modulo-2.md` | Introducción a Java y Node.js lado a lado (comparativa visual) | 2 | 0.5 | ★☆☆☆☆ (1/5) | 0.2 |
| Módulo 0.4 | `modulo-3.md` | Git, terminal, HTTP, JSON, YAML, variables de entorno | 6 | 1 | ★☆☆☆☆ (1/5) | 0.1 |
| Módulo 0.5 | `modulo-4.md` | Primer "Hola Mundo" en ambos stacks + Docker básico | 3 | 1 | ★★☆☆☆ (2/5) | 0.3, 0.4 |
| **Total fase** | | | **16** | **4** | | |

## Fase 1 · Spring Boot de cero a experto — 10 semanas (el prompt indica 12)

| Módulo | Archivo | Título | Fichas | Semanas | Dificultad | Depende de |
|---|---|---|---|---|---|---|
| Módulo 1 | `modulo-5.md` | Java moderno y Spring Boot esencial | 8 | 1 | ★★☆☆☆ (2/5) | Fase 0 completa |
| Módulo 2 | `modulo-6.md` | APIs REST y persistencia | 7 | 1 | ★★☆☆☆ (2/5) | 1 |
| Módulo 3 | `modulo-7.md` | Testing y calidad | 5 | 1 | ★★★☆☆ (3/5) | 2 |
| Módulo 4 | `modulo-8.md` | Caching y rendimiento | 4 | 0.5 | ★★★☆☆ (3/5) | 2, 3 |
| Módulo 5 | `modulo-9.md` | Introducción a microservicios y DDD | 6 | 0.5 | ★★★☆☆ (3/5) | 2 |
| Módulo 6 | `modulo-10.md` | Comunicación entre servicios | 5 | 1 | ★★★☆☆ (3/5) | 5 |
| Módulo 7 | `modulo-11.md` | Spring Cloud e infraestructura | 5 | 0.5 | ★★★☆☆ (3/5) | 6 |
| Módulo 8 | `modulo-12.md` | Resiliencia | 4 | 0.5 | ★★★★☆ (4/5) | 6, 7 |
| Módulo 9 | `modulo-13.md` | Seguridad | 9 | 1.5 | ★★★★☆ (4/5) | 2, 7 |
| Módulo 10 | `modulo-14.md` | Observabilidad | 5 | 0.5 | ★★★☆☆ (3/5) | 6 |
| Módulo 11 | `modulo-15.md` | Mensajería avanzada | 6 | 1 | ★★★★☆ (4/5) | 6 |
| Módulo 12 | `modulo-16.md` | Docker, Kubernetes y despliegue | 8 | 1 | ★★★★☆ (4/5) | 0.5, 10 |
| **Total fase** | | | **72** | **10** | | |

## Fase 2 · Node.js de cero a experto — 10 semanas (el prompt indica 12)

| Módulo | Archivo | Título | Fichas | Semanas | Dificultad | Depende de |
|---|---|---|---|---|---|---|
| Módulo 13 | `modulo-17.md` | JavaScript/TypeScript moderno y Node.js esencial | 7 | 1.5 | ★★☆☆☆ (2/5) | Fase 0 completa |
| Módulo 14 | `modulo-18.md` | APIs REST con Express y NestJS | 5 | 1 | ★★☆☆☆ (2/5) | 13 |
| Módulo 15 | `modulo-19.md` | Persistencia | 4 | 1 | ★★★☆☆ (3/5) | 14 |
| Módulo 16 | `modulo-20.md` | Testing | 4 | 0.5 | ★★★☆☆ (3/5) | 14, 15 |
| Módulo 17 | `modulo-21.md` | Introducción a microservicios en Node | 4 | 0.5 | ★★★☆☆ (3/5) | 14 |
| Módulo 18 | `modulo-22.md` | Comunicación | 6 | 1 | ★★★☆☆ (3/5) | 17 |
| Módulo 19 | `modulo-23.md` | Resiliencia | 5 | 0.5 | ★★★★☆ (4/5) | 18 |
| Módulo 20 | `modulo-24.md` | Seguridad | 6 | 1 | ★★★★☆ (4/5) | 14 |
| Módulo 21 | `modulo-25.md` | Observabilidad | 5 | 0.5 | ★★★☆☆ (3/5) | 18 |
| Módulo 22 | `modulo-26.md` | Mensajería y patrones de datos | 7 | 1.5 | ★★★★☆ (4/5) | 15, 18 |
| Módulo 23 | `modulo-27.md` | Docker, Kubernetes y CI/CD | 6 | 1 | ★★★★☆ (4/5) | 0.5, 21 |
| **Total fase** | | | **59** | **10** | | |

## Fase 3 · Nivel maestro — 8 semanas (el prompt indica 8)

| Módulo | Archivo | Título | Fichas | Semanas | Dificultad | Depende de |
|---|---|---|---|---|---|---|
| Módulo 24 | `modulo-28.md` | Gobernanza arquitectónica | 4 | 0.5 | ★★★★☆ (4/5) | Fase 1 o Fase 2 completa |
| Módulo 25 | `modulo-29.md` | Consistencia distribuida | 5 | 1 | ★★★★★ (5/5) | 11 o 22, 24 |
| Módulo 26 | `modulo-30.md` | Mensajería avanzada y event-driven | 4 | 0.5 | ★★★★★ (5/5) | 11 o 22 |
| Módulo 27 | `modulo-31.md` | Seguridad Zero-Trust | 4 | 0.5 | ★★★★★ (5/5) | 9 o 20, 12 o 23 |
| Módulo 28 | `modulo-32.md` | FinOps y costo de arquitectura | 4 | 0.5 | ★★★★☆ (4/5) | 12 o 23 |
| Módulo 29 | `modulo-33.md` | Team Topologies y organización | 4 | 0.5 | ★★★☆☆ (3/5) | 24 |
| Módulo 30 | `modulo-34.md` | Anti-patrones y cuándo NO usar microservicios | 4 | 0.5 | ★★★★☆ (4/5) | 24, 25 |
| Módulo 31 | `modulo-35.md` | Migración desde monolito real | 4 | 1 | ★★★★★ (5/5) | 5, 30 |
| Módulo 32 | `modulo-36.md` | Proyecto Final y Comité de Arquitectura | 7 | 3 | ★★★★★ (5/5) | 24 a 31 |
| **Total fase** | | | **40** | **8** | | |

## Total del curso

| Fase | Módulos | Fichas | Semanas |
|---|---|---|---|
| Fase 0 · Fundamentos absolutos | 5 | 16 | 4 |
| Fase 1 · Spring Boot | 12 | 72 | 10 |
| Fase 2 · Node.js | 11 | 59 | 10 |
| Fase 3 · Nivel maestro | 9 | 40 | 8 |
| **Total** | **37** | **187** | **32** |

## Reglas de dependencia

- La Fase 0 es obligatoria para todos.
- La Fase 1 y la Fase 2 no dependen entre sí: puedes hacerlas en cualquier orden o solo una.
- La Fase 3 pide al menos una fase de stack completa; los módulos 25, 26, 27 y 28 aceptan el módulo equivalente
  de cualquiera de los dos stacks.
- El **Módulo 32 (Proyecto Final)** dura 3 semanas: 2 de construcción (saga con Temporal, gateway con rate
  limiting, test de carga con Gatling), 0.5 para la restricción sobrevenida y el ADR, y 0.5 para la defensa
  ante el Comité (rúbrica en [07-plantillas.md](07-plantillas.md)).
- Los ejercicios cuya respuesta correcta es **no usar microservicios** están en los Módulos 5, 30 y 31.
