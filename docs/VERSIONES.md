# Línea de versiones de referencia

Aprobada por el dueño el 2026-11-18 (specs/016). Toda lección usa estas versiones; si un tema necesita otra,
lo dice y explica por qué. Antes de cambiar una fila, se comprueba en la fuente oficial o ejecutándola en el
Mac del dueño (specs/015) y se anota la fecha.

| Plataforma | Versión de referencia | Comprobación |
|---|---|---|
| Java | JDK 25 (LTS) | openjdk.org/projects/jdk/25 · auditoría de calidad 2026-11-18 |
| Spring | Spring Boot 4.1.x / Spring Framework 7 | spring.io/projects/spring-boot · auditoría de calidad 2026-11-18 |
| Build JVM | Maven 3.9.x, Gradle 9.x con wrapper | Mac del dueño (Maven por Homebrew) |
| Node.js | Node 24 (LTS activa) | nodejs.org/en/about/previous-releases · auditoría de calidad 2026-11-18 |
| Python | Python 3.14 | python.org/downloads · auditoría de calidad 2026-11-18 |
| TypeScript | TypeScript 7.x | auditoría de calidad 2026-11-18 (la plantilla de React ya trae TS 7) |
| Angular | Angular 22 (zoneless, Vitest, OnPush por defecto) con TypeScript 6.0, que exige su compilador (`typescript >=6.0 <6.1`) | proyecto real `@angular/cli@22` compilado en specs/014; `ng new` con CLI 22.2.8 / core 22.3.0 el 2026-11-18 |
| React | React 19.x · Vite 8 · Next.js 16 para servidor | proyectos reales compilados en specs/014 |
| Kotlin / Android | Kotlin 2.4 · AGP 9 · `targetSdk` 36 · compila con JDK 25 + Gradle 9.7 | developer.android.com · sonda de specs/015 en el Mac del dueño (2026-11-18): Kotlin 2.4.21 con JDK 27 cae a destino JVM 26 con aviso; con JDK 25 + Gradle 9.7.0 pasa limpio |
| Kotlin Multiplatform | Kotlin 2.4 con `com.android.kotlin.multiplatform.library` · JDK 25 + Gradle 9.7 | kotlinlang.org/docs/multiplatform · auditoría de calidad 2026-11-18 · sonda de specs/015 (2026-11-18) |
| iOS | Xcode 27 · Swift 6.4 · destino mínimo iOS 26 | Mac del dueño: Xcode 27.2, Swift 6.4.2 (2026-11-18) |
| Flutter | la estable vigente al verificar | Mac del dueño: 3.47.2 el 2026-11-18; se actualiza y se confirma en specs/015 |
| Contenedores | Docker Engine 29 · Kubernetes 1.37 · kind | Mac del dueño: Docker 29.9.2 · kubernetes.io/releases |
| Cloud local | Floci 2.2.0 (AWS), floci-az 0.14.0, floci-gcp 0.10.0 | `docker-compose.yml` de la raíz |

## Retiradas: no se enseñan

Python 3.9, Node 18 y 20, `typescript@5`, Ingress-NGINX, Promtail, launch configurations de AWS,
`nodejs20.x` en Lambda, App Mesh, imágenes `jenkins:*-jdk17`, Recoil.
