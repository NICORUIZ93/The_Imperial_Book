# Calidad de temario: Fundamentos, JavaScript, Node.js y React

- **Fecha:** 2026-11-18
- **Alcance:** `web/public/content/{foundations,javascript,node,react}/modulo-*.md` (349 temas) y `web/src/app/tracks/{foundations,javascript,node,react}.track.ts`.
- **Qué no repite:** esta revisión no vuelve a puntuar la plantilla, las soluciones, el voseo, los errores ejecutables ni las métricas de `calidad-transversal.md`. Esos puntos ya están en `control1-fundamentos.md`, `javascript-react.md`, `android-node.md` y `calidad-transversal.md`. Cuando un hallazgo toca uno de ellos, se cita el informe y se añade solo lo nuevo.
- **Método:**
  1. Extraje con un script el temario declarado en cada `.track.ts` (temas, retos, herramientas, horas) y lo crucé con los `### Tema` reales de cada módulo.
  2. Medí palabras, bloques de código, enlaces externos y menciones de versiones por módulo.
  3. Comparé el temario con fuentes primarias: MDN JavaScript Guide, react.dev/learn, nodejs.org/learn, TC39 finished proposals, el calendario de Node.js, SWEBOK v4, el devguide de Python y el registro de npm consultado hoy con `npm view`.
  4. No edité lecciones ni código.
- **Horas:** las comparo con la regla de la metodología, que fija temas de 20–45 min (`docs/METODOLOGIA-DE-APRENDIZAJE.md`). La cota máxima de un módulo es entonces 45 min × número de temas.

## 0. Hallazgos que afectan a los cuatro cursos

| Aspecto | Hallazgo | Impacto | Propuesta |
|---|---|---|---|
| Versiones | La metodología dice: «Cada curso registra en su spec la línea estable o LTS de referencia, las notas de versiones, la guía de migración y la fecha de revisión». Ninguna spec lo hace: `grep -E "Node\|React\|Python 3\|LTS" specs/*.md` no devuelve nada. Por eso cada tema fija su propia versión mínima (ver §2.5, §3.5, §4.5 y §1.5). | alto | Crear una spec «líneas de referencia 2026-11» con Node 24/26 LTS, Python 3.14, React 19.3, TypeScript 7.0, Vite 8 y Next 16. Hacer que `validate.sh` rechace versiones menores que esa línea. |
| Escala de horas | Un tema dura de media 104 min en Fundamentos (178 h / 103 temas), 64 min en Node (95,8 h / 90), 49 min en React (52,5 h / 64) y 34 min en JavaScript (52 h / 92). La regla es 20–45 min. Los 16 módulos de Fundamentos superan 45 min × temas: M9 y M11 lo hacen ×4,0 y M5 y M8 ×3,2–3,3. JS M7 queda por debajo del mínimo (150 min para 8 temas). | medio | Declarar las horas como «temas × duración del tema + proyecto», con la misma fórmula en todos los cursos, y mostrar aparte las horas del proyecto. |
| Prerrequisitos entre cursos | `curriculum-catalog.json` no tiene ningún campo de prerrequisito (0 coincidencias de `prereq` o `requisito`). Node M0 pide «`const`, `import` y promesas elementales» (`node/modulo-0.md:61`), que se enseñan en JS M0, M7 y M5, pero no enlaza a esos módulos. React dice «conocimientos de JavaScript ES6+ (Módulos del track de JavaScript)» en la línea 589 del módulo 0, al final del módulo. | alto | Definir la ruta Fundamentos M0–M3 → JS M0–M8 → {Node, React}. Añadir un bloque «Antes de empezar necesitas…» con enlaces a módulos concretos al inicio de Node M0 y React M0. |
| Solapamientos entre cursos | El mismo tema se explica varias veces, con otro nombre y sin remitir a la otra explicación (detalle en §5). | medio | Elegir un curso «dueño» para cada tema y que los demás enlacen a él con un repaso de 5 min. |
| Cursos nuevos aprobados | La spec 013 aprueba los cursos Docker, Kubernetes, Diseño de sistemas, IA aplicada y Blockchain (`specs/013-programa-de-cursos-y-correcciones.md:13-14`). Ya existen temas equivalentes: Fundamentos M8 T4 (contenedores), M10 T7 (diseño de sistemas) y M7 T6–T7 (agentes de IA); JS M14 T6 (Web3); Node M11 y M14 T5 (Docker). | medio | Al aprobar esos temarios, decidir si estos temas se mueven o se quedan como introducción con enlace. |

## 1. Fundamentos (`foundations`, 16 módulos, 103 temas)

### 1.1 Hallazgos

| Aspecto | Hallazgo (cita) | Impacto | Propuesta |
|---|---|---|---|
| Cobertura | **No hay ningún tema de programación orientada a objetos y el curso usa clases desde el módulo 2.** La primera clase es `class Nodo:` (`modulo-2.md:681`). Después aparecen `@dataclass` (`modulo-8.md:66`), `Protocol` (`modulo-7.md:257`) y `Enum` (`modulo-9.md:102`). M14 T3 exige «herencia y clases abstractas (`abc`)» (`modulo-14.md:224`), y el curso nunca las enseña. | alto | Añadir el tema «Clases, objetos, herencia y composición en Python» en M1 o M2, antes del BST. |
| Cobertura | SWEBOK v4 tiene 18 áreas de conocimiento. Faltan casi por completo *Software Engineering Management*, *Process* y *Economics*: «Scrum/ágil/Kanban/sprint» aparece en 3 líneas de todo el curso (M9, M14, M15) y no hay ningún tema de planificación, estimación de esfuerzo ni proceso. *Professional Practice* (ética, licencias) solo aparece mencionado. | medio | Añadir en M7 un tema «Proceso y gestión: iteraciones, estimación y priorización». Incorporar la ética y las licencias junto al tema de la Ley 1581, ya aprobado en spec 013 P6. |
| Cobertura | Git es una herramienta declarada en M0, M1, M2, M4, M7, M8, M9, M13, M14 y M15 (`foundations.track.ts:23`, `:45`, `:70`, …), pero `git init`/`git commit` solo aparece a partir de M5. | medio | Mover un tema mínimo de Git (init, add, commit, log) a M0 o M1, o quitar Git de las herramientas de M0–M4. |
| Sobra u obsoleto | M11 «Mapa de especializaciones» declara 18 h con 6 temas y 5.728 palabras, que son 4,0 veces la cota máxima. Repite temas de M8 (SO), M4 (BD), M3 (redes) y M6 (seguridad) a nivel panorámico. | medio | Reducirlo a una lectura-guía de 2–3 h o convertirlo en un apéndice. |
| Solapamiento interno | Grafos y BFS/DFS se enseñan tres veces (M2 T7, M9 T3 y M13 T2–T3). Patrones aparecen en M7 T3 y en el catálogo de M14. Refactoring y nombres aparecen en M7 T3 y en M15 T1. Outbox, sagas e idempotencia están en M10 T3 y se repiten en Node M13 T3 y M14 T3. | medio | Que M2 T7 sea la única introducción a grafos y que M9 y M13 remitan a ella. Hacer que M15 sea la referencia de código limpio y que M7 T3 enlace. |
| Solapamiento con otros cursos | M12 (Electrónica y control, 24 h, 17 temas) incluye PID, estabilidad y muestreo (`modulo-12.md:507`, `:341`), que también están en el curso Control 1. | medio | Moverlo a Control 1 o a un curso optativo de IoT y dejar en Fundamentos solo el tema «software que habla con sensores». |
| Promesa frente a contenido | El track pone «Records de C#» como primer tema de M7 (`foundations.track.ts:160`), mientras que el Markdown lo deja en el Tema 5 de un curso en Python. Ya se señaló que C# está fuera de alcance; aquí se añade que el track lo anuncia como primer tema. | bajo | Sacarlo del track (y del módulo) o ponerlo al final como anexo. |
| Coherencia interna | Las pruebas usan `pytest` en M5 (`foundations.track.ts:134`) y `unittest` en M7, M9 y M15 (`modulo-15.md:364`), sin explicar el cambio. | bajo | Usar un solo framework, preferiblemente pytest, o dedicar un párrafo a explicar por qué se cambia. |
| Progresión | El curso no tiene un proyecto final integrador: el último módulo es «Código limpio», y el único tema llamado «Proyecto integrador» es M3 T5 (web). | medio | Añadir un M16 «Proyecto integrador» que una inventario o RutaFlow con BD, pruebas, CI, seguridad y contenedor. |
| Versiones | El entorno verificado del curso es `Python 3.9.6` (`modulo-0.md:26`, `modulo-1.md:3`, `modulo-2.md:3`), una versión fuera de soporte desde 2025-10-31. CI usa `python-version: '3.12'` (`modulo-5.md:474`), Docker `python:3.12-slim` (`modulo-8.md:377`) y M9 ejecuta con 3.13 (`modulo-9.md:443`). La versión estable más reciente es la 3.15 y la 3.14 está en *bugfix*. | alto | Declarar «Python 3.14 o superior» una sola vez en M0, verificar con 3.14 y alinear CI y Docker. |
| Versiones | `actions/checkout@v4` (`modulo-5.md:471`); el último major publicado es v7 (`git ls-remote`). La imagen `postgres:17` (`modulo-8.md:349`) es una versión válida. | bajo | Actualizar a la versión mayor vigente y fijarla en la spec de referencia. |
| Experiencia | M5 (Testing/Git/CI), M6 (Seguridad, 15.166 palabras), M9 y M11 no tienen ningún enlace externo. M6 lista OWASP como herramienta (`foundations.track.ts`, m6) y no enlaza a OWASP. | medio | Añadir en cada módulo 2–4 enlaces a documentación primaria (docs.pytest.org, git-scm.com/book, OWASP Top 10 y Cheat Sheets). |

### 1.2 Cambios de temario que debe aprobar el dueño (por prioridad)

1. **Añadir** el tema «Clases y objetos en Python (composición, herencia, `dataclass`, `abc`)» antes de M2 T5.
2. **Fijar** Python 3.14 como línea del curso, en M0 y en la spec.
3. **Añadir** un M16 «Proyecto integrador de Fundamentos».
4. **Adelantar** Git básico a M0 o M1.
5. **Añadir** el tema «Proceso, estimación y priorización» en M7, más ética y licencias (junto a la Ley 1581).
6. **Mover** M12 (Electrónica e IoT) a Control 1 o a un optativo. **Reducir** M11 a una guía de 2–3 h.
7. **Desduplicar** grafos (M2/M9/M13), patrones (M7/M14) y código limpio (M7/M15).
8. **Quitar** C# del track de M7.

## 2. JavaScript (`javascript`, 15 módulos, 92 temas)

### 2.1 Hallazgos

| Aspecto | Hallazgo (cita o fuente) | Impacto | Propuesta |
|---|---|---|---|
| Cobertura (MDN Guide, cap. 3) | **No se enseña el manejo de errores síncrono.** El capítulo de MDN «Control flow and error handling» (`throw`, `try/catch/finally`, tipos de `Error`, errores propios) no tiene equivalente. `try {` aparece por primera vez en M5. `extends Error` no aparece en ningún módulo. Solo existe M6 T2, «try/catch en flujos asíncronos». | alto | Añadir el tema «Errores: `throw`, `try/catch/finally`, `Error` y subclases, `cause`» en M1. |
| Cobertura (MDN Guide, cap. 7–9) | Faltan «Numbers and strings», «Dates» y «Regular expressions» básicas. No hay ningún tema de `Number`/`Math`/precisión decimal, métodos de string ni `Date`. Las expresiones regulares solo aparecen como «avanzadas» en M14 T9, y `Temporal` en M13–M14. | alto | Añadir a M0 o M1 el tema «Números, strings y fechas», y a M4 «Expresiones regulares básicas». |
| Cobertura | No se enseña depuración: `debugger` aparece 0 veces en el curso y no hay ningún tema de breakpoints en DevTools o VS Code. Node Learn sí incluye «Debugging Node.js». | medio | Añadir en M2 el tema «Depurar con breakpoints (DevTools y VS Code)». |
| Cobertura (ES2026, aprobado el 30-06-2026) | De las siete novedades se enseñan `Error.isError` (`modulo-6.md:124`) y `Array.fromAsync` (`modulo-14.md:1520`). Faltan `Math.sumPrecise`, `Uint8Array` a/desde base64 y hex, `Iterator.concat`, `Map.prototype.getOrInsert` (upsert) y `JSON.parse` con acceso al texto fuente: 0 coincidencias en el curso. También faltan las *iterator helpers* de ES2025: `.take(`/`.drop(`/`Iterator.from` dan 0. | medio | Añadir un subtema «Novedades ES2025–2026» en M14 T14 y llevar `Math.sumPrecise` a M4 (sumas de montos). |
| Exactitud de edición | Dice «La referencia estable del curso es **ECMAScript 2026**» y, a continuación, explica `Temporal` (`modulo-13.md:439`). Según TC39, Temporal y la gestión explícita de recursos (`using`, M14 T15) son de **ES2027**. | medio | Indicar «Temporal y `using` son Stage 4 (ES2027)» y mantener la detección de soporte. |
| Sobra u obsoleto | M1 T5 «IIFE y el objeto `arguments`» y M2 T5 «Module pattern» son patrones anteriores a ES2015 que ESM, `let/const` y rest ya resuelven. Ocupan dos de los 27 temas de la etapa Fundamentos (M0–M4). | medio | Fusionarlos en un recuadro «patrones heredados que verás en código antiguo» y liberar espacio para errores y strings. |
| Sobra u obsoleto | M14 T5 (WebAssembly con Rust/C) y T6 (Web3 y ML) requieren otros lenguajes y cadenas de herramientas. El tema de Web3 se solapa con el curso Blockchain que ya está aprobado. | medio | Mover el tema de Web3 al curso Blockchain. Dejar WASM como optativo. |
| Promesa frente a contenido | El track de M1 promete «for...of, for...in y for await...of», y el Tema 6 real es «Desestructuración» (`javascript.track.ts:20`). El contenido de bucles está repartido en el Tema 4. La desalineación general del track ya está en el informe anterior (M7). | bajo | Renombrar el tema del track. |
| Solapamiento interno | TypeScript avanzado aparece dos veces: M11 T5 «TypeScript avanzado: sobrecargas, tipos mapeados…» y M14 T1 «TypeScript avanzado». También se repiten los bundlers (M7 T2/T3/T6 y M14 T3), los Workers (M10 T3 y M14 T2), los Service Workers (M14 T2 y M14 T11), el almacenamiento (M8 T4 y M14 T8) y el GC/memoria (M5 T5 y M13 T2). | alto | Fusionar cada par en un solo tema. M14 debería quedarse solo con lo que no aparece antes. |
| Progresión | M14 «JavaScript Master» contiene temas básicos: cookies y sessionStorage (T8), expresiones regulares (T9) y patrones Observer/Strategy (T10). El motor V8 (JIT, AST) y el GC están en M5, etapa «Aplicación». | medio | Bajar los temas básicos a M4 y M8. Subir V8 y GC a M13 como «Experto». |
| Progresión e integrador | M12 (SPA sin framework) no usa TypeScript (0 archivos `.ts`), aunque M11 lo enseña justo antes. Tampoco usa ESLint (M9). | bajo | Hacer el integrador en TS, o declarar que es JS puro y añadir un reto de migración. |
| Horas | M7 declara 2 h 30 min para 8 temas (19 min por tema, por debajo del mínimo de 20). M12 y M13 declaran 6 h para 4 temas (×2,0 la cota). | bajo | Recalcular las horas con la fórmula común. |
| Versiones | Las versiones mínimas de Node en el mismo curso son «Node.js 18 o superior» (`modulo-7.md:858`), «Node.js 20 o posterior» (`modulo-7.md:12`), «Node.js 22 o superior» (`modulo-6.md:549`) y «Node 24 LTS» (`modulo-14.md:4`). Node 18 y Node 20 están en EOL; las LTS vigentes son 22, 24 y 26. | alto | Declarar Node 24 LTS (o 26) en M0 y quitar los mínimos por tema salvo excepciones justificadas. |
| Versiones | `npm install -D typescript@5` (`modulo-11.md:460`, `:589`) y «Decoradores estándar de TypeScript 5» (`modulo-11.md:610`). La versión vigente es **TypeScript 7.0.2** (npm, 2026-11-18; 7.0 se publicó el 8-7-2026). TS 7 activa `strict` por defecto y elimina `baseUrl`, `moduleResolution: node10` y `target: es5`. React M11 crea el proyecto con la plantilla `react-ts`, que trae TS 7, así que los dos cursos enseñan majors distintas. | medio | Pasar a `typescript@7` y explicar los nuevos valores por defecto. Mantener `@typescript/typescript6` solo si una herramienta lo exige. |
| Experiencia | El primer módulo cubre 5 de los 7 temas que promete el track. Ya está reportado; aquí se añade que el bloque de entorno (`modulo-0.md:40-60`) no dice qué versión de Node instalar («Node.js LTS»), aunque luego el curso exige 22, 23 o 24 según el tema. | medio | Indicar la versión exacta y el comando para comprobarla. |

### 2.2 Cambios de temario que debe aprobar el dueño (por prioridad)

1. **Añadir** «Errores síncronos: `throw`, `try/catch/finally`, `Error` y subclases» en M1.
2. **Añadir** «Números, strings y fechas» (M0 o M1) y «Expresiones regulares básicas» (M4).
3. **Fusionar** los duplicados: TS avanzado (M11 T5 + M14 T1), bundlers (M7 + M14 T3), Workers y Service Workers (M10 T3 + M14 T2 + T11), almacenamiento (M8 T4 + M14 T8) y GC (M5 T5 + M13 T2).
4. **Reubicar** por nivel: V8 y GC a Experto; cookies, regex y patrones de M14 a Fundamentos o Aplicación.
5. **Añadir** «Depuración con breakpoints» en M2.
6. **Reducir** IIFE, `arguments` y module pattern a un recuadro de «código heredado».
7. **Mover** Web3 al curso Blockchain y dejar WASM como optativo.
8. **Añadir** «Novedades ES2025–2026» y corregir la edición de Temporal y `using` (ES2027).
9. **Actualizar** a TypeScript 7 y fijar Node 24/26 LTS.

## 3. Node.js (`node`, 16 módulos, 90 temas)

### 3.1 Hallazgos

| Aspecto | Hallazgo (cita o fuente) | Impacto | Propuesta |
|---|---|---|---|
| Cobertura (nodejs.org/learn, «Command Line») | Faltan la entrada por terminal y la CLI moderna. `readline`/`process.stdin`, `util.parseArgs`, `node --watch` y `node --run` aparecen 0 veces. `--env-file` solo aparece en M11. | medio | Añadir en M0 el tema «Scripts de CLI: argumentos, stdin, `--watch`, `--env-file` y `node --run`». |
| Cobertura (nodejs.org/learn, «Diagnostics») | No se enseña perfilado de CPU: `--cpu-prof`, flame graphs y `--prof` dan 0. Hay heap snapshots (M8 T4) e `--inspect` (M7 T4), pero no un tema sobre «Don't Block the Event Loop» con medición. | medio | Añadir en M8 el tema «Perfilar CPU y encontrar el bloqueo del event loop». |
| Cobertura (nodejs.org/learn, «Test Runner») | El test runner nativo se enseña (M7 T5–T7), pero no sus mocks: `mock.fn`, `t.mock` y `mock.module` dan 0. Los mocks se hacen con Vitest (M7 T3). | bajo | Añadir un subtema «Mocking con `node:test`» en M7 T5. |
| Cobertura | No hay un tema de cliente HTTP saliente (`fetch`/undici, timeouts, reintentos contra APIs de terceros). `fetch(` aparece por primera vez en M11. | medio | Añadir en M3 o M4 el tema «Consumir APIs desde Node con `fetch`: timeouts, AbortSignal y reintentos». |
| Certificación | La certificación oficial OpenJS JSNAD se retiró el 30-09-2025. Por tanto la referencia de cobertura es nodejs.org/learn, no un programa de examen. | — | Eliminar del material cualquier mención a prepararse para JSNAD o JSNSD, si se añade alguna. |
| Sobra u obsoleto | El track de M12 promete «TypeScript con ts-node/tsx» (`node.track.ts:174`), mientras M14 T1 enseña TypeScript nativo (`node archivo.ts`). El track de M4 promete «express-validator como alternativa» (`node.track.ts:62`) y el track de M9 «pino/winston» y «Apollo Server» (`node.track.ts:132`): las tres herramientas aparecen 0 veces en el Markdown. | medio | Quitar ts-node, express-validator y winston del track. Usar Apollo en M9 o quitarlo de allí. |
| Solapamiento interno | Serverless se enseña en M11 T4 y en M14 T4; Docker productivo en M11 T1 y en M14 T5; CI en M7 T3 y en M14 T6; GraphQL en M9 T4 y en M14 T2; OpenAPI en dos temas de M13 (T2 y T5, track (2) y (3)); la idempotencia en M8 T5 y en M13 T3. | alto | Fusionar cada par. M14 debería quedarse con Federation, sagas y brokers. |
| Solapamiento con otros cursos | El Event Loop está en JS M5 T1 y en Node M0 T2; ESM/CJS en JS M7 T1/T7 y en Node M1 T6; lockfile y cadena de suministro en JS M7 T8 y en Node M1 T2 + M10 T5. Node no remite a JS en ninguno de estos casos. | medio | Hacer que Node M0 T2 parta de JS M5 («qué cambia en Node») y que Node M1 T6 remita a JS M7. |
| Progresión | M3 T5 exige «`node:test`» como prerrequisito (`modulo-3.md:411`), pero `node:test` se enseña en M7 T5. La suite de M7 mezcla tres runners: Vitest (T1–T3), Jest/Mocha (T4) y `node:test` (T5–T7). | medio | Presentar `node:test` en M1 o M3 como runner por defecto. Usar Vitest solo cuando aporte algo, y explicarlo. |
| Progresión e integrador | Casi todos los temas empiezan «en una carpeta vacía» y «no reutiliza…» (143 líneas con esas frases en los 16 módulos). Esto contradice la «Ruta del proyecto» de la metodología («No se crea una aplicación nueva por tema»). El integrador lo dice explícitamente: «No uses código, datos ni configuración de los laboratorios anteriores: escribe este proyecto desde cero» (`modulo-12.md:1635`). Además, M12 T5–T6 introduce tecnologías que no se enseñaron antes (PostGIS, Socket.IO, Firebase Admin). | alto | Mantener una API acumulativa de M3 a M12. Sacar PostGIS, Socket.IO y push a un módulo propio o a temas previos. |
| Promesa frente a contenido | El vocabulario del track (`GET /tareas`, 11 menciones de «tarea») no coincide con el del Markdown (593 menciones de envío/entrega/RutaFlow). | bajo | Actualizar los retos del track al dominio RutaFlow. |
| Versiones (incoherencia interna) | **El integrador usa la API de Prisma anterior a la 7, mientras que M5 enseña Prisma 7.** M5 usa `provider = "prisma-client"`, `prisma.config.ts` y `new PrismaClient({ adapter })` (`modulo-5.md:239-307`). M12 usa `provider = "prisma-client-js"`, `url = env("DATABASE_URL")` y `new PrismaClient({ datasources: … })` (`modulo-12.md:297`, `:302`, `:518`) e instala `prisma` sin versión (`:288-289`); la etiqueta `latest` de npm hoy es `8.0.0-rc.34`. La guía oficial de migración a Prisma 7 exige un *driver adapter*, declara obsoleto `url` en el schema y anuncia que `prisma-client-js` se eliminará. No lo ejecuté. | alto | Reescribir M12 con la API de M5 y fijar `prisma@7`. |
| Versiones | `"engines": { "node": ">=20" }` (`modulo-1.md:57`, `:553`) y «usa Node 20 o superior» (`modulo-1.md:428`), aunque Node 20 está en EOL desde marzo de 2026. CI usa `node-version: 22` (`modulo-7.md:387`, `modulo-10.md:609`), las imágenes `node:24-alpine` (M11, M14) y `node:lts-bookworm-slim` (`modulo-12.md:615`, una etiqueta flotante que hoy apunta a 26). Node 26 es LTS desde octubre de 2026. | medio | Usar Node 24 LTS como mínimo y 26 LTS como recomendada, iguales en `engines`, CI y Docker. |
| Versiones | `postgres:16-alpine` (M5, M7, M12, M13) y `actions/checkout@v4` (M7, M10), con v7 ya publicado. | bajo | Fijarlas en la spec de referencia. |
| Horas | M12 declara 12 h con 6 temas (×2,7 la cota) y M13 8 h 20 min (×2,2). La duración de los temas (75–180 min) ya está reportada. | bajo | Recalcular con la fórmula común. |
| Experiencia | `modulo-11.md:678` contiene una nota interna visible: «La ejecución práctica y la revisión pedagógica quedan pendientes hasta realizarlas y registrar sus resultados». | medio | Quitar la nota o convertirla en un aviso para el estudiante. |

### 3.2 Cambios de temario que debe aprobar el dueño (por prioridad)

1. **Reescribir** el integrador M12 sobre la API acumulada de M3–M11 con Prisma 7, y **sacar** PostGIS, Socket.IO y push a otro módulo.
2. **Fusionar** los duplicados: serverless, Docker, CI, GraphQL, OpenAPI (M13 T2 + T5) e idempotencia.
3. **Adelantar** `node:test` como runner por defecto y presentar Vitest y Jest como alternativas en un solo tema.
4. **Añadir** «CLI moderna de Node» (M0), «Cliente HTTP con `fetch`» (M3/M4) y «Perfilado de CPU» (M8).
5. **Enlazar** con JS para Event Loop, ESM y lockfiles en lugar de reexplicarlos.
6. **Limpiar** el track: ts-node, express-validator y winston.
7. **Unificar** las versiones: Node 24/26 LTS, Postgres y acciones de CI.

## 4. React (`react`, 15 módulos, 64 temas)

### 4.1 Hallazgos

| Aspecto | Hallazgo (cita o fuente) | Impacto | Propuesta |
|---|---|---|---|
| Cobertura (react.dev/learn, «Managing State») | **No se enseña a levantar el estado** («Sharing State Between Components»): «padre común», «levantar» y «estado compartido» aparecen 0 veces como concepto. El curso pasa de `useState` local (M1) a Context (M4) y luego a Zustand y Redux (M7). | alto | Añadir en M1 el tema «Compartir estado: levantar el estado al padre común». |
| Cobertura (react.dev/learn, «Escape Hatches») | «You Might Not Need an Effect» solo aparece como una línea en M13, de nivel Experto: «Usar Effect para derivar estado: calcula durante render…» (`modulo-13.md:689`). En M2, que enseña `useEffect`, no se trata. | alto | Añadir en M2 el tema «Cuándo NO usar un Effect: estado derivado y eventos». |
| Cobertura | Faltan «Updating Objects/Arrays in State» (inmutabilidad en el estado: «inmutab» aparece en 2 módulos y no se enseña como tema), «Choosing the State Structure» y «Thinking in React» (0). | medio | Añadir a M1 el tema «Estructura del estado e inmutabilidad», y un tema «Pensar en React» al cerrar M0. |
| Cobertura (React 19.2–19.3) | React 19.3 (9-9-2026) estabiliza `<ViewTransition>`, *Fragment refs* y `browser()`. En el curso `ViewTransition` aparece 0 veces y `Activity` solo en M13. `useSyncExternalStore` y `useId` tampoco tienen tema (0 y 1). | medio | Añadir en M9 el tema «APIs recientes: `<Activity>`, `<ViewTransition>`, Fragment refs». Añadir `useId` en el tema de formularios accesibles. |
| Cobertura (react.dev, «Creating a React App») | react.dev recomienda empezar con un framework (Next.js, React Router v7 o Expo) y reserva «desde cero con un build tool» para quien quiere «learn the basics». El curso usa Vite sin explicar esa decisión y no menciona React Router como framework. | bajo | Añadir en M0 un párrafo «por qué Vite aquí y frameworks en M10». |
| Sobra u obsoleto (track) | El track sigue prometiendo «useImperativeHandle y forwardRef» (`react.track.ts:32`), «Jotai (atoms) y Recoil (selectors)» (`:93`), «ISR, Metadata y Middleware» (`:188`) y «Estilos: … Styled Components» (`:6`). El Markdown ya los corrigió o los retiró (ref como prop, Recoil fuera, `proxy.ts`). El track de M10 promete una Server Action «sin necesidad de un endpoint API separado» (`:135`), y el Markdown explica correctamente que la acción *es* un endpoint público. | medio | Sincronizar el track con el contenido corregido. |
| Promesa frente a contenido | El integrador M12 promete «una aplicación real con TypeScript» y «SPA en React + TypeScript» (`react.track.ts:153`), pero todos sus archivos son `.js`/`.jsx` (54 menciones de archivos `.js`/`.jsx`, 0 `.ts`/`.tsx`). El track pide `features/tareas/, auth/` (`:156`) y el contenido usa `features/envios`. | alto | Hacer el integrador en TS, que se enseña en M11, o cambiar la promesa. |
| Progresión e integrador | El integrador no incluye formularios (M3), Context (M4), rendimiento (M9) ni accesibilidad. Además, M11 (TypeScript) va justo antes del integrador y el resto del curso es JS. | medio | Que el integrador cubra un formulario con validación, un Context y una medición, o declarar qué módulos deja fuera. |
| Progresión | M0 dice que «todos los ejemplos del curso se ejecutan dentro de este mismo proyecto `mi-react`». Sin embargo, el curso crea `academia-react` (`modulo-1.md:443`), `carrera-react` (`modulo-2.md:570`), `consulta-envios` (`modulo-6.md:67`) y `mi-react-ts` (`modulo-11.md:9`). | medio | Un solo proyecto, o explicitar cuándo y por qué se crea otro. |
| Progresión | Antes del primer componente, M0 obliga a configurar Vitest, Testing Library, jsdom y `setupTests` (`modulo-0.md:28-60`). El curso usa `npm test` desde M0, pero las consultas por rol se enseñan en M8. | medio | En M0, dar las pruebas ya escritas como «caja negra» y explicar Testing Library en M8, o adelantar un tema corto «tu primera prueba por rol». |
| Solapamiento interno | Suspense/lazy/code-splitting aparece tres veces: M5 T3 «code-splitting por ruta», M9 T3 «Virtualización y code-splitting» y M9 T5 «Suspense y React.lazy». Streaming y Server Components aparecen dos veces: M10 T1/T3 y M14 T1. Server Actions y seguridad, tres: M10 T4, M13 T3 y M14 T2. Error Boundaries, dos: M2 T5 y M13 T1. `memo`/`useMemo`, dos: M2 T3 y M9 T2. La accesibilidad está en M13 T2 y en M14 T5, y la i18n en M13 T4 y M14 T6. | alto | Fusionar M14 con M10 y M13. M14 tal como está («React Master») no aporta temas nuevos salvo imágenes, fuentes y React Aria. |
| Orden | M2 enseña `useMemo`/`useCallback` manuales (T3) y M9 T7 presenta React Compiler, que automatiza esa memoización. | bajo | En M2, presentar la memoización manual como algo que el compilador hará por ti, y profundizar en M9. |
| Horas | M12 declara 6 h con 3 temas (×2,7 la cota) y M14 10 h con 6 temas (×2,2). | bajo | Recalcular las horas. |
| Versiones | `z.string().email()` (`modulo-3.md:132`) está obsoleto en Zod 4 (zod 4.6.7 en npm), que usa `z.email()`. `react-router` se instala sin versión (`modulo-5.md:123`), y hoy resuelve la 8.5.2. La versión más alta que cita el curso es React 19.2 (M2, M13); la vigente es la 19.3.1. | medio | Usar `z.email()`, fijar `react-router@8` y registrar React 19.3 en la spec. |
| Experiencia | El curso tiene solo 29 enlaces externos (23 a react.dev). M4 (Context), M5 (Router), M6 (TanStack Query), M8 (Testing), M11 (TS) y M12 tienen 0, aunque cada uno usa una librería con documentación oficial. | medio | Añadir 2–4 enlaces por módulo: reactrouter.com, tanstack.com/query, testing-library.com, mswjs.io, react-typescript-cheatsheet y es.react.dev. |
| Experiencia | El prerrequisito de JavaScript solo aparece al final del módulo 0 (`modulo-0.md:589`) y no dice qué módulos de JS hacen falta. | alto | Ver §0: un bloque inicial con «JS M0–M8 (y M11 para el módulo 11)». |

### 4.2 Cambios de temario que debe aprobar el dueño (por prioridad)

1. **Añadir** «Levantar el estado» (M1) y «Cuándo NO usar un Effect» (M2).
2. **Fusionar** M14 con M10 y M13, y dejar en M14 solo lo nuevo (imágenes, fuentes, React Aria) o eliminarlo.
3. **Rehacer** el integrador M12 en TypeScript, con formularios, Context y medición.
4. **Añadir** «Estructura del estado e inmutabilidad» (M1) y «Pensar en React» (M0).
5. **Desduplicar** Suspense/lazy (M5/M9), Error Boundaries (M2/M13) y memoización (M2/M9).
6. **Añadir** «APIs recientes de React 19.2–19.3» (Activity, ViewTransition, Fragment refs).
7. **Sincronizar** el track: forwardRef, Recoil, Middleware, Styled Components y la promesa de M10.
8. **Unificar** un solo proyecto `mi-react` para todo el curso.

## 5. Mapa de solapamientos entre cursos

| Tema | Dónde se explica | Propuesta de dueño |
|---|---|---|
| Event Loop, microtareas | JS M5 T1; Node M0 T2 | JS (Node explica solo lo propio: fases, `nextTick`, `setImmediate`) |
| ESM frente a CommonJS | JS M7 T1 y T7; Node M1 T6 | JS (Node: `require(esm)` e interoperabilidad) |
| package.json, lockfile, cadena de suministro | JS M7 T4 y T8; Node M1 T1–T2; Node M10 T5 | Node M1 (JS enlaza) |
| Vitest y pruebas unitarias | JS M9; Node M7 T1; React M0/M8; Fundamentos M5 (pytest) | JS M9 para Vitest; cada curso, solo su capa |
| TypeScript | JS M11 + M14 T1; Node M13 T1 + M14 T1; React M11 | JS M11 (Node y React solo tipan su dominio) |
| Workers | JS M10 T3 + M14 T2; Node M8 T1 (worker_threads) | Mantener los dos; quitar el duplicado interno de JS |
| WebSocket | JS M14 T12; Node M4 T5; Node M12 T5 (Socket.IO) | Node M4 (JS: cliente; Node M12: enlazar) |
| XSS, CSP, CSRF | Fundamentos M6 T4; JS M13 T1; Node M6 T5 + M10 T3; React M13 T3 + M14 T2 | Fundamentos M6 para el concepto; cada curso, solo su mitigación |
| Accesibilidad | Fundamentos M3 T4; JS M8 T7 + M14 T4; React M13 T2 + M14 T5 | Fundamentos M3 + JS M8; React, solo foco y rutas |
| i18n (Intl) | JS M13 T4; React M13 T4 + M14 T6 | JS M13 (React: react-i18next) |
| Docker y CI | Fundamentos M5 T4 + M8 T4; Node M7 T3, M11, M14 T5–T6 | Futuro curso Docker / DevOps |
| Outbox, sagas, idempotencia | Fundamentos M10 T3; Node M8 T5, M13 T3, M14 T3 | Fundamentos M10 (concepto) + Node M13 (implementación) |
| Patrones de diseño | Fundamentos M7 T3 + M14; JS M14 T10 | Fundamentos M14 |
| Diseño de sistemas | Fundamentos M10 T7 | Futuro curso «Diseño de sistemas» |

## 6. Fuentes consultadas (2026-11-18)

- Node.js, estado de versiones (v26, v24 y v22 LTS; v20 y v25 EOL): https://nodejs.org/en/about/previous-releases
- Node.js, «Evolving the Node.js Release Schedule» (26 entra en LTS en octubre de 2026): https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule
- Node.js Learn (temario oficial): https://nodejs.org/en/learn
- Linux Foundation, JSNAD «retired as of September 30, 2025»: https://training.linuxfoundation.org/certification/jsnad
- TC39 finished proposals (ES2025, ES2026 y ES2027: Temporal, Explicit Resource Management): https://github.com/tc39/proposals/blob/main/finished-proposals.md
- Resumen de ES2026 (siete novedades, aprobado el 30-06-2026; fuente secundaria): https://pawelgrzybek.com/whats-new-in-ecmascript-2026/
- MDN JavaScript Guide (índice): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- react.dev Learn (índice): https://react.dev/learn
- React 19.3: https://react.dev/blog/2026/09/09/react-19-3
- react.dev, «Creating a React App»: https://react.dev/learn/creating-a-react-app
- TypeScript 7.0: https://devblogs.microsoft.com/typescript/announcing-typescript-7.0/
- Prisma, «Upgrade to Prisma ORM 7»: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- Zod 4 changelog (`z.string().email()` obsoleto): https://zod.dev/v4/changelog
- Python, estado de ramas (3.9 EOL el 2025-10-31; 3.14 y 3.15 en bugfix): https://devguide.python.org/versions/
- SWEBOK v4, 18 áreas de conocimiento: https://sfia-online.org/en/tools-and-resources/bodies-of-knowledge/swebok-software-engineering-body-of-knowledge/swebok4-sfia9-the-guide-to-the-software-engineering-body-of-knowledge
- Registro npm (`npm view <paquete> version`, 2026-11-18): vite 8.3.8, react 19.3.1, react-router 8.5.2, next 16.4.6, typescript 7.0.2, vitest 5.1.1, express 5.3.0, prisma `latest` = 8.0.0-rc.34 (`prev` 7.10.1), zod 4.6.7, recoil 0.7.7 (última publicación 2024-02-12).
- `git ls-remote --tags` de `actions/checkout` y `actions/setup-node`: el último major es v7.

## 7. Límites

- No ejecuté código. Los hallazgos de versiones (Prisma en M12, Zod) se basan en la documentación oficial, no en una ejecución. La incompatibilidad de M12 con Prisma 7 debe confirmarse ejecutando `prisma generate`.
- No existe un roadmap oficial de React ni de JavaScript. Por eso tomé como referencia el índice de react.dev/learn y la Guía de MDN, que son documentación primaria. roadmap.sh no es una fuente oficial y no lo usé.
- La estimación de horas usa la regla de la metodología (20–45 min por tema), no una medición con estudiantes.
- Las búsquedas por palabra clave (`grep`) pueden pasar por alto conceptos explicados con otras palabras. Revisé a mano los casos de impacto alto (POO en Fundamentos, errores síncronos en JS, levantar el estado y Effects en React, Prisma en Node).
