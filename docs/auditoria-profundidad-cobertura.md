# Auditoría de profundidad y cobertura — The Imperial Book

**Fecha:** 2026-10-28
**Alcance:** los 14 tracks (987 temas). Auditoría honesta, basada en lectura real de
contenido + datos cuantitativos + comparación contra temario estándar de cada stack.
**Encargo:** el contenido se percibe "básico, no de cero a profesional, faltan temas,
ejemplos y explicación". Se auditan **dos ejes**: profundidad (¿los temas que existen
enseñan de verdad?) y cobertura (¿están todos los temas que debería tener el stack?).

> **Advertencia metodológica.** Esta auditoría combina: (a) lectura directa de ~13
> archivos de contenido, (b) métricas de texto sobre los 987 temas, y (c) comparación
> de títulos contra un temario estándar. **No** ejecuta los ejemplos ni sustituye la
> revisión humana. Cuando una métrica automática y la lectura humana discrepan, se
> prioriza la lectura.

---

## Resumen ejecutivo (sin adornos)

El contenido **no está vacío ni es relleno generado**: los temas tienen código real
correcto, caso RutaFlow coherente, analogías y los 7 pasos presentes. Pero la queja del
usuario **tiene base real y medible** en dos frentes:

1. **Profundidad desigual.** En varios tracks el **Paso 4 (demostración)** es un
   *fragmento de código suelto* (4-8 líneas), no un proyecto reproducible desde cero.
   El concepto está, pero un principiante absoluto no sabe dónde pegar el código, cómo
   crear el proyecto, ni cómo ejecutarlo para ver el resultado. Eso es exactamente lo
   que se siente "básico" aunque el tema sea técnicamente correcto.

2. **Cobertura con huecos.** Ningún track está vacío, pero varios tienen huecos
   profesionales concretos (Error Boundaries en React, Isolates en Flutter, push en
   móvil, estructuras de datos avanzadas en foundations, etc.).

3. **Una métrica miente.** La auditoría "practicable" reporta **987/987 completos**; la
   auditoría estricta de 7 pasos reporta números muy distintos. La primera está mal
   calibrada y es la que ocultó el problema. **Hay que arreglar el auditor antes de
   confiar en cualquier número.**

---

## Eje 1 — PROFUNDIDAD (¿el Paso 4 es ejecutable de cero a profesional?)

Dato duro medido sobre los 987 temas: comandos de **ejecución real** (node, mvn, flutter
run, curl, etc.) presentes en el contenido, y módulos con **setup desde cero**
(mkdir / npm install / Initializr / archetype).

| Track | Temas | Comandos de ejecución | Veredicto profundidad |
|---|---:|---:|---|
| devops | 99 | 285 | ✅ Sólido, manda a ejecutar |
| cloud | 154 | 204 | ✅ Sólido (laboratorios reales) |
| node | 73 | 172 | ✅ Sólido |
| android | 50 | 157 | ✅ Sólido |
| javascript | 83 | 129 | ✅ Bueno |
| kotlin-multiplatform | 54 | 122 | ✅ Bueno |
| spring-boot | 80 | 116 | ✅ Bueno |
| foundations | 68 | 114 | ⚠️ Bueno pero es el de ENTRADA (ver eje 2) |
| java | 72 | 112 | ⚠️ Código presente, Paso 4 a veces fragmento |
| react | 55 | 84 | ❌ Paso 4 = fragmentos sueltos, no proyecto |
| flutter | 57 | 28 | ❌ Casi sin comandos de ejecución |
| rutaflow | 24 | 25 | ❌ Poca ejecución reproducible |
| angular | 67 | 7 | ❌ Casi sin comandos de ejecución |
| ios | 51 | **0** | ❌❌ CERO comandos de ejecución en 51 temas |

**El caso más grave es iOS: 0 comandos de ejecución en 51 temas.** Nadie que estudie iOS
puede correr un solo ejemplo siguiendo el texto. Flutter (28) y Angular (7) le siguen.

### Evidencia directa (leída, no inferida)

**React M2, Tema 1 (useEffect)** — el Paso 4 completo es:
```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/envios?zona=${zona}`, { signal: controller.signal })
    .then(res => res.json()).then(setEnvios);
  return () => controller.abort();
}, [zona]);
```
Es correcto y bien explicado, PERO: no dice en qué componente va, ni cómo crear el
proyecto, ni cómo correrlo, ni qué se ve en pantalla. Un principiante no puede
reproducirlo. Contraste: Node M6 (JWT) sí tiene `mkdir`, `npm install`, archivo completo,
comando y resultado — ése sí es "de cero a profesional".

**Flutter M2, Tema 1 (LayoutBuilder)** — mismo patrón: muestra el widget en un `Row`,
pero no el `main.dart`, ni `flutter run`, ni cómo ver el resultado. Buen concepto,
demostración no autocontenida.

### Conclusión eje 1
La profundidad es **buena en 8 tracks** (los que mandan a ejecutar) y **deficiente en 5**
(react, flutter, angular, ios, rutaflow) donde el Paso 4 muestra el concepto pero no un
flujo ejecutable de principio a fin. **iOS es crítico.**

---

## Eje 2 — COBERTURA (¿están todos los temas del stack?)

Comparación de los títulos reales de cada track contra un temario profesional estándar.

| Track | Cobertura | Huecos concretos a cubrir |
|---|---|---|
| javascript | ✅ COMPLETO | — (a lo sumo symbols/iteradores como tema propio) |
| java | ✅ COMPLETO | — (menor: reflexión/anotaciones propias, regex) |
| spring-boot | ✅ COMPLETO | — (menor: springdoc/OpenAPI, GraphQL) |
| cloud | ✅ COMPLETO (amplitud) | VPC/redes AWS como módulo propio y temprano |
| devops | ✅ COMPLETO | menor: pruebas de carga (k6), chaos engineering |
| foundations | ⚠️ HUECOS | **POO conceptual; binario/punto flotante/UTF-8; estructuras avanzadas (árboles, heaps, hash); algoritmos (DP, greedy, BFS/DFS)** |
| react | ⚠️ HUECOS | **Error Boundaries; Suspense + React.lazy del lado cliente; Portals** |
| angular | ⚠️ HUECOS | directivas personalizadas; pipes personalizados |
| flutter | ⚠️ HUECOS | **Isolates (concurrencia Dart)**; slivers/scroll avanzado |
| android | ⚠️ HUECOS | **fundamentos de Kotlin y coroutines** (hoy implícitos); push/FCM; permisos runtime |
| ios | ⚠️ HUECOS | push (APNs); permisos/privacidad; Keychain |
| kotlin-multiplatform | ⚠️ HUECOS | kotlinx.serialization; kotlinx-datetime |
| node | ⚠️ HUECOS | WebSocket/tiempo real y uploads como temas propios |
| rutaflow | ⚠️ HUECOS | testing E2E/CI-CD del sistema completo (une Flutter↔Spring) |

**Ningún track está estructuralmente vacío.** Pero 9 de 14 tienen huecos de cobertura
que un curso "de cero a profesional" debería cerrar. Los más críticos: **foundations**
(es la puerta de entrada y le faltan estructuras de datos y algoritmos clásicos) y
**android** (asume Kotlin sin enseñarlo).

---

## El problema de la métrica (por qué esto estaba oculto)

Dos auditorías internas sobre los MISMOS 987 temas dan resultados opuestos:

| Track | "Practicable" (optimista) | 7 pasos (estricta) |
|---|---:|---:|
| flutter | 57/57 ✅ | **1/57** |
| react | 55/55 ✅ | **2/55** |
| ios | 51/51 ✅ | **3/51** |
| rutaflow | 24/24 ✅ | 6/24 |
| java | 72/72 ✅ | 18/72 |
| cloud | 154/154 ✅ | 30/154 |
| foundations | 68/68 ✅ | 23/68 |

La métrica "practicable" cuenta un tema como completo si **menciona** las palabras clave,
aunque el código sea un fragmento. Por eso dice "todo perfecto". La estricta exige un
comando de ejecución y resultado verificable — y coincide con la percepción del usuario y
con la lectura directa. **La métrica optimista debe endurecerse o retirarse.**

---

## Plan de corrección priorizado (propuesta, no ejecutado)

### P0 — Arreglar el instrumento de medición
Endurecer el auditor "practicable" para que exija Paso 4 autocontenido (setup + comando
de ejecución + resultado), de modo que la métrica deje de mentir y podamos medir avance.

### P1 — Profundidad crítica (Paso 4 ejecutable)
Por orden de gravedad medida: **ios (0 comandos) → angular (7) → flutter (28) →
rutaflow (25) → react (84 pero fragmentos)**. Convertir el Paso 4 de cada tema en un
flujo reproducible desde cero (crear proyecto, archivo completo, comando, resultado).

### P2 — Cobertura: puerta de entrada
**foundations**: añadir estructuras de datos avanzadas (árboles, heaps, hash tables),
algoritmos clásicos (DP, greedy, BFS/DFS, backtracking), representación binaria / punto
flotante / UTF-8, y POO conceptual. Es el track del principiante absoluto; sus huecos son
los que más duelen.

### P3 — Cobertura: huecos por track
android (fundamentos Kotlin + coroutines, push, permisos), react (Error Boundaries,
Suspense/lazy), flutter (Isolates), ios (push, permisos, Keychain),
kotlin-multiplatform (serialization), node (WebSocket, uploads), angular (directivas/pipes
propios), cloud (VPC temprano), rutaflow (E2E/CI-CD integrado).

### Volumen estimado
- P1 (profundidad): ~284 temas de 7 pasos marcados incompletos por la métrica estricta,
  concentrados en 5 tracks. No todos necesitan reescritura total; muchos solo necesitan
  que el Paso 4 pase de fragmento a flujo ejecutable.
- P3 (cobertura): ~25-35 temas nuevos repartidos en 9 tracks.

Es trabajo grande. Se recomienda un **piloto por track** (un módulo modelo que establezca
el estándar) antes de escalar, y regenerar índices + `validate.sh` tras cada lote.
