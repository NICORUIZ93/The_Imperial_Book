# Validación extensa de los 14 tracks contra roadmaps oficiales 2026

**Fecha:** 2026-10-28
**Método:** cada track del repo (contenido real + `topic-index.json`) comparado contra el
roadmap profesional vigente 2026 del stack, verificado con fuentes públicas citables
(roadmap.sh, documentación oficial, roadmaps de la industria). **No se usó Udemy** (pago,
con copyright, inaccesible). Se cruzan **dos ejes**: cobertura (¿faltan temas?) y
profundidad (¿el tema existente enseña de cero a profesional? — medido con el auditor ya
corregido: 739/987 practicables).

Fuentes de referencia por stack: React/Angular/Node/Spring/Java/Flutter/iOS/Android/AWS/
KMP/DevOps/DSA roadmaps 2026 (roadmap.sh y guías de la industria), doc oficial de cada
tecnología.

---

## Tablero maestro: cobertura + profundidad por track

| Track | Cobertura vs roadmap 2026 | Profundidad (practicable) | Prioridad |
|---|---|---|---|
| foundations | ⚠️ huecos (DSA, binario, POO) | 42/68 (61%) | **P1 — puerta de entrada** |
| javascript | ✅ completo | 83/83 (100%) | mantener |
| java | ✅ completo | 41/72 (56%) | P2 profundidad |
| spring-boot | ✅ completo (+ Temporal) | 64/80 (80%) | P3 |
| node | ⚠️ 2 huecos | 64/73 (87%) | P3 |
| react | ⚠️ 3-4 huecos | 11/55 (20%) | **P1 profundidad** |
| angular | ⚠️ 2 huecos menores | 65/67 (97%) | P3 cobertura |
| flutter | ⚠️ 1 hueco (Isolates) | 24/57 (42%) | **P1 profundidad** |
| android | ⚠️ huecos (Kotlin base, push) | 44/50 (88%) | P2 cobertura |
| ios | ⚠️ huecos (push, permisos) | 6/51 (11%) | **P1 profundidad (el peor)** |
| kotlin-multiplatform | ⚠️ 1 hueco (serialization) | 38/54 (70%) | P3 |
| cloud | ✅ completo (amplitud AWS) | 149/154 (96%) | P2 cobertura (VPC) |
| devops | ✅ completo | 91/99 (91%) | P3 |
| rutaflow | ⚠️ 1 hueco (E2E) | 15/24 (62%) | P2 |

**Conclusión transversal:** el problema dominante NO es cobertura (la mayoría de tracks
cubren su roadmap 2026), sino **profundidad en 5 tracks** (ios, react, flutter, java,
foundations). Donde tú percibes "faltan temas", en la práctica suele ser que el tema
existe pero su Paso 4 no es ejecutable de cero. La excepción real de cobertura es
**foundations** (le faltan áreas enteras de DSA).

---

## Detalle por track: qué falta y con qué empezar

### foundations — ⚠️ el más crítico (puerta de entrada)
**Roadmap DSA/CS 2026:** Big-O → arrays → strings → hash maps → recursión → pilas/colas →
árboles/BST → heaps → BFS/DFS → ordenamiento → programación dinámica → grafos.
**Tiene:** variables, control de flujo, funciones, pilas/colas, búsqueda, ordenamiento,
complejidad, recursión; además web, BD, seguridad, SO, matemática discreta.
**FALTAN (empezar por aquí):**
1. **Representación de datos**: binario/hexadecimal, complemento a dos, punto flotante
   IEEE 754, ASCII/UTF-8. *(Es literalmente "de cero" y no está.)*
2. **Estructuras de datos avanzadas**: árboles binarios y BST, árboles balanceados,
   heaps/colas de prioridad, hash tables (implementación).
3. **Algoritmos clásicos**: BFS/DFS sobre grafos, programación dinámica, greedy,
   backtracking.
4. **POO conceptual** (clases/herencia/polimorfismo/encapsulación como fundamento
   transversal, no dentro de cada lenguaje).
5. **Paradigma funcional** conceptual (inmutabilidad, funciones puras, map/reduce).

### ios — ⚠️ profundidad crítica (6/51 practicable)
**Roadmap iOS 2026:** Swift → SwiftUI-first → concurrencia Swift 6 → datos (SwiftData) →
arquitectura → testing → push/permisos/Keychain → App Store → Apple Intelligence/CoreML.
**Cobertura:** buena (cubre casi todo el roadmap).
**FALTA (cobertura):** notificaciones push (APNs/UserNotifications), permisos y privacidad
(Info.plist), Keychain, y una mención a CoreML/Apple Intelligence (tendencia 2026).
**PROFUNDIDAD (empezar por aquí):** los 45 temas sin comando ejecutable. Añadir a cada
Paso 4 el flujo real: crear proyecto en Xcode + `xcodebuild`/Preview + resultado.

### react — ⚠️ profundidad crítica (11/55 practicable)
**Roadmap React 2026:** fundamentos JS → core React → React 19 (Server Components,
Actions, Suspense) → hooks → estado (Zustand/TanStack Query) → routing → UI/styling →
APIs → Next.js → performance → testing → deploy.
**Cobertura:** muy buena. **FALTAN:** Error Boundaries (tema propio), Suspense +
`React.lazy` del lado cliente (lazy loading explícito), área de **Styling/UI** (Tailwind,
CSS Modules, shadcn, Framer Motion), GraphQL cliente.
**PROFUNDIDAD (empezar por aquí):** 44 temas con Paso 4 = fragmento suelto; convertir en
proyecto Vite reproducible (`npm create vite`, componente completo, `npm run dev`, qué se ve).

### flutter — ⚠️ profundidad (24/57) + 1 hueco
**Roadmap Flutter 2026:** Dart → widgets → responsive → navegación → estado → red →
persistencia → platform channels → animaciones → testing → release → Impeller.
**FALTA:** Isolates (concurrencia Dart multihilo); menor: slivers/scroll avanzado.
**PROFUNDIDAD:** 33 temas; añadir `flutter create` + archivo + `flutter run`/`flutter test`.

### java — profundidad (41/72)
**Cobertura:** ✅ completa contra el roadmap Java 2026 (incluye virtual threads, records,
pattern matching, Spring AI vía Spring Boot). Menor: regex, reflexión/anotaciones propias.
**PROFUNDIDAD:** 31 temas; el Paso 4 a veces es fragmento — añadir proyecto Maven/Gradle
ejecutable con `mvn test`/`./gradlew test` y resultado.

### android — cobertura
**FALTA:** un módulo de **fundamentos de Kotlin + coroutines** (hoy se usan desde M5 sin
enseñarse; el roadmap 2026 pone Kotlin ANTES de Compose); notificaciones push/FCM;
permisos runtime. Profundidad buena (88%).

### cloud — cobertura (amplitud enorme, bien)
**FALTA:** **VPC/redes AWS** como módulo propio y temprano (subredes, security groups,
route tables, NAT) — el roadmap 2026 lo pone en el núcleo y en el repo aparece tarde.

### node — cobertura (casi completo)
**FALTA:** WebSocket/tiempo real y manejo de uploads (multipart) como temas didácticos
propios (hoy solo viven en el proyecto integrador).

### angular — cobertura (casi completo)
**FALTA:** directivas personalizadas y pipes personalizados como temas propios.

### kotlin-multiplatform — cobertura (casi completo)
**FALTA:** kotlinx.serialization (central para red/persistencia en KMP) y kotlinx-datetime.

### rutaflow — cobertura
**FALTA:** módulo de testing E2E/CI-CD del sistema completo (une Flutter ↔ Spring Boot).

### javascript, spring-boot, devops — ✅ completos
Cobertura al día con sus roadmaps 2026. Solo mantenimiento y (spring/devops) algo de
profundidad en temas sueltos.

---

## Plan: con qué temas empezar (orden recomendado)

### Fase 1 — PROFUNDIDAD de los 5 tracks críticos (mayor impacto en "se siente básico")
Orden por gravedad medida:
1. **iOS** (6/51) — 45 temas: Paso 4 ejecutable. *Nota: no verificable por ejecución en
   este entorno (sin toolchain Apple); código según doc oficial de Apple.*
2. **React** (11/55) — 44 temas: proyecto Vite reproducible. *Verificable ejecutando.*
3. **Flutter** (24/57) — 33 temas. *Verificable si hay SDK Flutter.*
4. **Java** (41/72) — 31 temas. *Verificable ejecutando.*
5. **foundations profundidad** (42/68) — 26 temas.

### Fase 2 — COBERTURA: empezar por foundations (lo más "de cero" que falta)
Temas nuevos, en este orden de dependencia:
1. foundations: **representación binaria / punto flotante / UTF-8** (antes que nada).
2. foundations: **estructuras de datos** (árboles, BST, heaps, hash tables).
3. foundations: **algoritmos** (BFS/DFS, DP, greedy, backtracking).
4. android: **módulo de fundamentos Kotlin + coroutines** (antes de Compose).
5. cloud: **VPC/redes AWS** temprano.

### Fase 3 — COBERTURA: huecos por track
react (Error Boundaries, Suspense/lazy, Styling/UI), flutter (Isolates), ios (push,
permisos, Keychain), node (WebSocket, uploads), angular (directivas/pipes), kmp
(serialization), rutaflow (E2E/CI-CD), java (regex/reflexión), ios (CoreML).

### Método de ejecución (ya probado en P0 + iOS M2 piloto)
- Auditor honesto arreglado (trinquete en 739, sube con cada lote).
- Reescribir Paso 4 = crear proyecto + archivo completo + comando + resultado.
- Regenerar índices + `validate.sh` tras cada lote; verificar ejecutando donde el entorno
  lo permita (React/Node/Java/Spring sí; iOS/Flutter según toolchain).

### Nota de vigencia (eje "actualizado")
Las versiones del repo están al día (verificado antes: React 19.2, Spring Boot 4.1,
Angular 22, Node 26 LTS, Java 25). Lo que falta no es actualizar versiones, sino **añadir
temas vigentes que el roadmap 2026 incluye y el repo no** (Server Components ya está;
faltan: Styling/UI moderno en React, CoreML/Apple Intelligence en iOS, Impeller en Flutter
como nota, kotlinx.serialization en KMP).
