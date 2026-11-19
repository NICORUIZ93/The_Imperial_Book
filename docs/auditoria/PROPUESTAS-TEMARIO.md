# Propuestas de cambio de temario — para aprobación del dueño

Fuente: las cuatro revisiones de calidad del 18 nov 2026 (`calidad-*.md` en esta carpeta) y la medición
transversal (`calidad-transversal.md`). Nada de esto está aplicado: `CLAUDE.md` exige que el dueño apruebe
los temarios antes de escribir temas.

## 1. Línea de versiones de referencia (una spec, como exige la metodología)

| Plataforma | Propuesta | Hoy en las lecciones |
|---|---|---|
| Java | JDK 25 LTS | 21, 25 y 27 mezclados |
| Spring | Spring Boot 4.1.x / Framework 7 | 4.1.2 fijado, temas que aún dicen 3.x |
| Node | Node 24 LTS (26 LTS como opción) | 18, 20, 22 y 24 mezclados |
| Python | 3.14 | 3.9 (EOL), 3.12 y 3.13 |
| TypeScript | 7.x | `typescript@5` |
| Angular | 22 | 22 (ok) |
| React | 19.x con Vite 8 y Next.js 16 para servidor | ok tras specs/014 |
| Kotlin / KMP | Kotlin 2.4, AGP 9, JDK según prueba en el Mac | `androidTarget()` sin AGP 9 |
| Swift / iOS | Xcode 27, Swift 6.4, iOS 26+ | Xcode 26, Swift 6.2 |
| Flutter | la estable que haya en el Mac del dueño (3.47.2 hoy; las lecciones dicen 3.50) | verificar |

## 2. Fusiones de duplicados

- **Flutter:** fusionar 14↔19 y 15↔20 (iguales tema por tema) y 13↔18 (temas 2–4); una sola enseñanza de arquitectura (guía oficial). Ahorra ~15 h.
- **Spring Boot:** fusionar M8↔M21 (Kafka), M8 T6↔M25 (Cloud Stream), M10 T9↔M23 (Modulith), M3↔M16 (N+1), M4↔M18 (seguridad), M16/M17 con Java M16/M17 (JPA): de 27 a 21 módulos.
- **React:** M14 repite M10 y M13. **JavaScript:** TS avanzado, bundlers y Workers duplicados. **Node:** serverless, Docker, CI, GraphQL y OpenAPI duplicados.
- **Angular:** pruebas (M10/M15) y SSR (M11/M15). **iOS:** M13 T2/T5. **KMP:** M12/M13. **Android:** M9/M14 y rendimiento en tres módulos.
- **Cloud:** tres proyectos finales (M9, M31, M33) y ~8 h repetidas.

## 3. Reparto hacia los cursos nuevos ya aprobados

- **Docker:** DevOps M2, M3, M15 T1 y Cloud M1.
- **Kubernetes:** DevOps M6, M7, M15 T2–T4 y Cloud M14 T3; completar CKA/CKAD (Kustomize, kubeadm/etcd, Gateway API, troubleshooting).
- **Diseño de sistemas:** DevOps M17.
- **Microservicios (12 módulos, ~111 h, con Strangler, BFF y CQRS):** DevOps M19–M21.
- **Fundamentos M12:** Electrónica, Web3 y Docker a sus cursos.
- DevOps queda en ~12 módulos.

## 4. Temas que faltan (fuente oficial en cada informe)

- **Fundamentos:** clases y POO (se usan desde M2 y M14 las exige).
- **JavaScript:** errores síncronos (`throw`, `try/catch/finally`, subclases de `Error`), números, strings, fechas y regex básicas.
- **React:** levantar el estado y «You Might Not Need an Effect»; integrador en TypeScript.
- **Node:** CLI moderna (`parseArgs`, `--watch`, `node --run`), `fetch`, perfilado; integrador con Prisma 7.
- **Java:** `Deque`/`Queue` y novedades de Java 25 (examen 1Z0-830); orden: `record` antes de usarlo.
- **Spring Boot:** versionado de API, `@Retryable`/`@ConcurrencyLimit`, Jackson 3, `RestTestClient`, `JdbcClient`, AOP, SpEL, resource server de Spring Security.
- **Android:** Navigation 3, edge-to-edge, `targetSdk` 36. **KMP:** plugin `com.android.kotlin.multiplatform.library` (AGP 9). **Angular:** Signal Forms, OnPush por defecto. **iOS:** Xcode 27, Liquid Glass.
- **Cloud:** SAM, CodePipeline, OpenTelemetry (X-Ray SDK en mantenimiento), VPC a fondo, costos; Bedrock con Converse; quitar launch configurations. Orientar a DVA-C02/SAA-C03 en vez del catálogo de Floci.
- **DevOps:** Gateway API en lugar de Ingress-NGINX (retirado), Alloy en lugar de Promtail, Vault 2.x, provider AWS 6.x, reusable workflows, environments con aprobación, Dependabot/CodeQL.
- **Control 1:** Nyquist, compensación en frecuencia, controlabilidad/observabilidad, observadores y método algebraico (programa UD 7303); simulacro de examen, `python-control`, bibliografía Ogata/Nise/Dorf.

## 5. Decisiones estructurales

- **Backend de referencia de RutaFlow:** hoy es Node, mientras Spring Boot M14 promete ser ese backend. Recomendación: Spring Boot.
- **Duración real:** recalcular horas de todos los tracks desde el contenido (Java declara 100 h y tiene ~60; Control 1 tiene 50 h de ~135 reales) y partir los temas de más de 45 min.
- **Promesas de los tracks:** borrar de los `.track.ts` lo que el curso no enseña (Angular anuncia 14 conceptos ausentes; Java/Spring/RutaFlow más de 45).
- **Prerrequisitos entre cursos** visibles en el catálogo y al inicio de cada curso.
