# Temario objetivo · Fundamentos, de cero a experto

**Estado:** Aprobado por el dueño el 2026-11-20, con la opción recomendada en cada decisión. Propuesta (specs/021, Fase 3, criterio Z2). No hay lecciones escritas ni
cambiadas: este documento solo fija qué temas tendrá el curso, en qué orden y de dónde sale cada uno.
**Fecha de revisión de fuentes:** 2026-11-20.
**Identificador de ruta:** `foundations` (se conserva, y con él el progreso de lectura).
**Papel en la academia:** Fundamentos es el curso dueño de lo transversal (regla 1 de specs/021): cómo
funcionan un computador y un programa, terminal, Git, redes y HTTP, SQL y modelado de datos, estructuras de
datos y algoritmos, pruebas básicas, seguridad básica, pensamiento computacional y formatos de datos. Los
demás cursos usan estos conceptos y enlazan aquí.
**Versiones de referencia:** Python 3.14 (`docs/VERSIONES.md`). Las demás herramientas del curso (Git, bash,
PostgreSQL, SQLite, `curl`) no están en `docs/VERSIONES.md`; fijarlas es la decisión D8.

## 1. Resumen

### 1.1 El curso hoy

El listado medido (`docs/reestructuracion/listado-de-temas.csv`, filas `foundations`) tiene **105 temas en 16
módulos** (M0–M15) y 114.033 palabras.

| Medida de hoy | Valor |
|---|---:|
| Temas sin nivel ni duración declarados | 101 de 105 |
| Temas con nivel declarado | 4 (2 Básico y 2 Intermedio) |
| Temas de menos de 900 palabras | 42 |
| Temas de más de 2.000 palabras (no caben en 45 min) | 5 (todo el M6) |
| Temas sin diagrama ni imagen | 31 |
| Módulos con más de 7 temas | 3 (M2 y M14 con 8, y M12 con 17) |
| Laboratorios en `examples/foundations/` | 0 (la carpeta no existe; los 11 «Proyecto N» viven dentro de las lecciones) |

Ningún tema actual está declarado Avanzado ni Experto, así que la regla 4 de la spec («al menos la mitad en
Integración o Experto») no se puede comprobar hoy. La portada del M0 reparte los 16 módulos en cuatro etapas,
pero el orden de estudio no las sigue: M12 y M13 son de «Aplicación» y van después de M9–M11, que son de
«Experto».

De los 105 temas, **86 alimentan el temario objetivo** y **19 salen** como temas (sección 3.2): los 17 de
Electrónica (M12), el tema de records de C# (M7 T5) y el proyecto integrador M3 T5, que pasa a ser un
laboratorio.

### 1.2 El curso objetivo

**298 temas en 46 módulos** (de 3 a 7 temas cada uno), en los cuatro tramos del formato único.

| Tramo (nivel) | Módulos | Temas | Ya está | Está pero básico | Falta |
|---|---|---:|---:|---:|---:|
| Fundamentos (Básico) | M0–M9 | 66 | 16 | 27 | 23 |
| Aplicación (Intermedio) | M10–M19 | 68 | 13 | 41 | 14 |
| Integración (Avanzado) | M20–M36 | 111 | 18 | 50 | 43 |
| Experto (Experto) | M37–M45 | 53 | 18 | 12 | 23 |
| **Total** | M0–M45 | **298** | **65** | **130** | **103** |

- **Integración + Experto: 164 de 298 temas (55 %)**. Cumple la regla «al menos la mitad».
- **Faltan 103 temas** (35 %): no existen hoy ni en Fundamentos ni, como tema propio, en otro curso.
- **130 temas están pero son básicos** (44 %): el asunto existe y cada fila dice qué le falta.
- **65 temas ya están** (22 %) con la profundidad suficiente. También pasan al formato de 12 secciones
  en la Fase 5, como todos.
- **37 temas objetivo llegan de otros cursos** (9 «ya está» y 28 «está pero básico»): hoy se
  enseñan en DevOps, Microservicios, Cloud, Node, Java, JavaScript o Spring Boot, y Fundamentos pasa a ser su
  dueño (sección 3.1).
- Duración estimada: 298 temas a 35 min de media ≈ 174 h, más unas 20 h de proyecto final. Es una
  estimación; los minutos reales se fijan tema a tema (20–45 min) al escribirlos.

Por tramo, de hoy al objetivo:

| Tramo | Hoy (etapas de la portada del M0) | Objetivo |
|---|---|---|
| Fundamentos | M0–M3: entorno, programación, estructuras y web en 26 temas; la terminal es un solo tema y Git no aparece hasta M5 | M0–M9, 66 temas: computador, terminal, pensamiento computacional, programación, representación de datos, Git hasta el pull request, web y formatos |
| Aplicación | M4, M5, M12 y M13: SQL, pruebas y Git en 11 temas, más 17 de electrónica y 5 de algoritmos | M10–M19, 68 temas: shell como lenguaje, herramientas, código limpio, pruebas, estructuras y algoritmos I, SQL I–II, HTTP y diseño de API, HTML y CSS |
| Integración | M6–M8, M14 y M15: seguridad, diseño, sistemas operativos, patrones y código limpio en 29 temas | M20–M36, 111 temas: Git profesional y por dentro, sistemas operativos, concurrencia, redes, seguridad y OWASP Top 10:2025, HTTP avanzado, transacciones, modelos de datos, CI, arquitectura, patrones y trabajo con agentes de IA |
| Experto | M9–M11: matemáticas discretas, sistemas distribuidos y mapa de especializaciones en 17 temas | M37–M45, 53 temas: árboles balanceados y estructuras especializadas, grafos, diseño de algoritmos, matemáticas, sistemas distribuidos, cómo funciona un lenguaje, rendimiento y mapa de la disciplina |

### 1.3 Cómo se decidió el estado de cada tema

- **ya está**: hay un tema actual dedicado al asunto, con unas 900 palabras o más.
- **está pero básico**: el asunto aparece, pero en un tema corto, compartido con otros asuntos, o sin la traza
  real, el error diagnosticado o la medición. La fila dice qué falta.
- **falta**: ningún tema actual lo trata como tema propio.

Entre paréntesis va el tema actual de origen con la numeración de hoy («M5 T3» es el tema 3 del módulo 5 actual
de Fundamentos). Cuando el origen está en otro curso, la fila lo dice con el nombre del curso («DevOps M1 T2»);
para Microservicios se usa el nombre de módulo que muestra el curso («0.4» es el «Módulo 0.4», que en el CSV es
el módulo 3). Un tema actual puede alimentar a varios temas objetivo cuando se parte. El anexo A da el destino
de los 105 temas actuales, uno por uno.

**Límite de esta clasificación:** se hizo con el título, el nivel y el número de palabras de cada tema en el
CSV, con los encabezados de los módulos y con búsquedas de términos concretos en las lecciones (por ejemplo,
que `modulo-5.md` no contiene `.gitignore` o que `modulo-3.md` no contiene «cookie»). No se leyeron las 105
lecciones línea a línea. Al reescribir cada tema (Fase 5) se comprueba contra la lección real y lo que ya esté
se conserva.

### 1.4 Rigor: qué se verificó y qué no

- Los capítulos y secciones citados en «Fuentes» se leyeron el 2026-11-20 en las páginas de la sección 6.
- OWASP: la edición vigente que sirve owasp.org es el **Top 10:2025**; sus diez categorías (A01–A10) se copian
  de esa página y el módulo M31 las cubre todas.
- HTTP: las secciones citadas son las de RFC 9110. Los temas que hablan de caché, HTTP/2 y HTTP/3 se apoyan aquí
  solo en las guías de MDN; sus RFC propias no se abrieron y se leen al escribir esos temas.
- PostgreSQL: la documentación «current» corresponde, según su propia portada, a PostgreSQL 19. La academia no
  tiene una versión de PostgreSQL fijada (decisión D8).
- Los nombres de órdenes que aparecen en los títulos (`git restore`, `git bisect`, `grep`, `awk`…) son los de
  la documentación citada. Su salida real y la versión exacta se comprueban al escribir cada tema (regla 9).

## 2. Temario objetivo completo

Orden lineal: los módulos se estudian en el orden M0 → M45 y el nivel no baja. Las abreviaturas de la
columna «Fuentes» están en la sección 6. El lenguaje de los ejemplos es Python 3.14, con bash para la terminal
y SQL para los datos (decisión D7).

### Tramo 1 · Fundamentos (nivel Básico) — 66 temas

#### M0 · El computador y tu entorno de trabajo (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Qué hay dentro de un computador: CPU, memoria, almacenamiento y periféricos | Básico | **está pero básico** (M0 T1); también en Microservicios 0.1 T1: hoy es un solo tema de 90 min que mezcla hardware, sistema operativo y proceso; se parte en dos y falta mirar el hardware real de la máquina del estudiante | CSAPP c1·CS50 s0·UTP u1·RM-CS·CS2023 SF |
| 2 | Sistema operativo, programa y proceso: quién ejecuta qué | Básico | **ya está** (M0 T1) | CSAPP c1·MS26 1·UTP u1·CS2023 OS |
| 3 | Archivos, carpetas y rutas absolutas y relativas sin perderse | Básico | **está pero básico** (M0 T3): faltan las diferencias entre Windows, macOS y Linux, los archivos ocultos y las extensiones | MS26 1·FCC-LNX p4·CSAPP c10 |
| 4 | Del archivo fuente al programa en ejecución: intérprete y compilador | Básico | **está pero básico** (M0 T2): falta ver los pasos con un intérprete y con un compilador reales, y el tema no tiene diagrama | CSAPP c1·CS50 s1·UTP u1 |
| 5 | El editor de código: VS Code, terminal integrada y atajos comprobables | Básico | **está pero básico** (M0 T6): faltan extensiones, configuración por proyecto y el criterio para confiar en una carpeta | PP t18·MS26 3·CS2023 SDF-Practices |
| 6 | Primer programa, primer error y primera evidencia | Básico | **está pero básico** (M0 T5): falta el ciclo completo editar → ejecutar → leer el error → corregir con su salida real, y no tiene diagrama | MIT c1·CS50 s1·TLAP c1 |
| 7 | Pedir ayuda bien: `--help`, `man`, documentación oficial y cómo leer un mensaje de error | Básico | **falta** | PG c1.7·MS26 1·PP t7·FCC-LNX p2 |

#### M1 · La terminal desde cero (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Terminal, shell y comando: anatomía de una orden antes de ejecutarla | Básico | **está pero básico** (M0 T4); también en Cloud M0 T1 y Microservicios 0.4 T2: falta distinguir terminal, shell y programa, y las opciones cortas y largas | BASH c1–2·POSIX 2.1·MS26 1·FCC-LNX p2 |
| 2 | Moverse y manipular archivos: `ls`, `cd`, `cp`, `mv`, `rm`, `mkdir` y comodines | Básico | **está pero básico** en otro curso (Microservicios 0.4 T2): el tema actual vive en Microservicios; falta el riesgo real de `rm` y los comodines | MS26 1·FCC-LNX p4·POSIX 2.14·PP t17 |
| 3 | Ver y buscar: `cat`, `less`, `head`, `tail`, `grep` y `find` | Básico | **falta** (DevOps M0 T3 lo toca de paso) | MS20 2·FCC-LNX p4·PP t21 |
| 4 | Entrada, salida y error: redirección y tuberías | Básico | **está pero básico** en otro curso (DevOps M0 T3): 805 palabras, compartido con los filtros; falta dibujar los tres flujos y sus descriptores | BASH 3.6·POSIX 2.7·CSAPP c10·MS26 1·FCC-LNX p8 |
| 5 | Permisos, usuarios, grupos y `sudo` con mínimo privilegio | Básico | **ya está** en otro curso (DevOps M0 T1 y M0 T10): se mudan y se fusionan | FCC-LNX p8·MS26 1·CSAPP c10 |
| 6 | Variables de entorno y `PATH`: por qué «comando no encontrado» | Básico | **ya está** en otro curso (Microservicios 0.4 T6): DevOps M0 T4 aporta la parte de shell | BASH c5·POSIX 2.5·MS26 2·RM-BE |
| 7 | La misma tarea en macOS, Linux y Windows: zsh, bash, PowerShell y WSL | Básico | **falta** (RutaFlow M0 T2 lo resuelve solo para su proyecto) | PG cA1·MS26 2·BASH 6.11 |

#### M2 · Pensamiento computacional (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Del problema al algoritmo y a los casos de prueba | Básico | **ya está** (M1 T1) | TLAP c1·MIT c1·CS50 s0·UTP u1–2·CS2023 SDF |
| 2 | Descomposición, reconocimiento de patrones y abstracción | Básico | **ya está** en otro curso (Microservicios 0.2 T2): Fundamentos pasa a ser el dueño | TLAP c1–2·CS50 s0·MIT c7·UTP u5 |
| 3 | Lógica de programación: pseudocódigo y diagramas de flujo | Básico | **ya está** en otro curso (Microservicios 0.2 T1): Fundamentos pasa a ser el dueño | UTP u1–2·CS50 s0·TLAP c2 |
| 4 | Prueba de escritorio: trazar la ejecución a mano | Básico | **está pero básico** (M1 T3): hoy va dentro de «decisiones y repeticiones»; falta como técnica propia con tabla de estado | TLAP c2·MIT c3·UNAM III |
| 5 | Estrategias para destrabarse: reducir el problema, casos extremos y trabajar hacia atrás | Básico | **falta** | TLAP c1, c8·PP t46·MIT c4, c6 |
| 6 | Estimar antes de calcular: órdenes de magnitud y comprobación de resultados | Básico | **falta** | PP t15·MIT c5·ENT |

#### M3 · Programar I: datos y control (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Variables, tipos, expresiones y cambios de estado | Básico | **ya está** (M1 T2) | MIT c1–2·CS50 s1·CS2023 SDF-Fundamentals·UTP u2 |
| 2 | Texto y consola: cadenas, entrada, salida y formato | Básico | **está pero básico** (M1 T2): hoy es un apartado del tema de variables; faltan los métodos de cadena, el formateo y la validación de la entrada | MIT c2, c4·CS2023 SDF-DataStructures·CS50 s6 |
| 3 | Decisiones: condiciones, operadores lógicos y tablas de verdad | Básico | **ya está** (M1 T3) | MIT c2·UTP u4·CS50 s1 |
| 4 | Repeticiones: `while`, `for`, acumuladores y el error por uno | Básico | **está pero básico** (M1 T3): comparte tema con las decisiones; faltan los bucles anidados y el error por uno reproducido | MIT c3–4·UTP u4·TLAP c2 |
| 5 | Funciones: parámetros, retorno, ámbito y descomposición | Básico | **ya está** (M1 T4) | MIT c7–8·CS2023 SDF-Fundamentals·UTP u5·TLAP c7 |
| 6 | Colecciones del lenguaje: listas, tuplas, diccionarios y conjuntos; mutabilidad y alias | Básico | **está pero básico** (M2 T1): hoy se eligen estructuras sin haber enseñado antes las del lenguaje; faltan la mutabilidad y los alias dibujados | MIT c9–11, c14·CS2023 SDF-Fundamentals·TLAP c3·ESPOL 5 |
| 7 | Errores en ejecución: leer un traceback y manejar excepciones | Básico | **falta** | MIT c13·CS2023 SDF-Fundamentals·PP t24 |

#### M4 · Programar II: programas completos (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Archivos: leer y escribir texto, rutas y codificación | Básico | **falta** | CS2023 SDF-Fundamentals·UTP u4·CSAPP c10·MIT c13 |
| 2 | Módulos, biblioteca estándar, entornos virtuales y dependencias | Básico | **falta** | CS2023 SDF-Fundamentals·MS26 6·UTP u5·RM-BE |
| 3 | Un programa de línea de comandos: argumentos, entrada estándar y códigos de salida | Básico | **falta** | MS26 2·POSIX 2.8·PP t17·CSAPP c8 |
| 4 | Recursión: caso base, caso recursivo y la pila de llamadas | Básico | **está pero básico** (M2 T4): hoy comparte un tema con complejidad, medición y ordenamiento; falta la pila de llamadas dibujada | MIT c15–16·GROK c3·TLAP c6·UNAM V |
| 5 | Objetos y clases: atributos, métodos e `__init__` | Básico | **ya está** (M1 T6): no tiene diagrama | MIT c17–18·TLAP c5·UTP u6·CS2023 SDF-Fundamentals |
| 6 | Documentar lo que haces: comentarios, docstrings y un README que otro pueda seguir | Básico | **falta** | CS2023 SDF-Fundamentals·RM-GIT·PP t7 |

#### M5 · Cómo representa el computador la información (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Bits, bytes, binario y hexadecimal | Básico | **está pero básico** (M1 T5): un solo tema para binario, texto y decimales; se parte en tres y falta el diagrama | CSAPP c2.1·CS50 s0·MIT c4·RM-CS |
| 2 | Enteros: complemento a dos, rangos y desbordamiento | Básico | **falta** | CSAPP c2.2–2.3·RM-CS·CS2023 AR |
| 3 | Decimales: coma flotante y por qué 0,1 + 0,2 no da 0,3 | Básico | **está pero básico** (M1 T5): falta el formato por dentro, la comparación con tolerancia y el dinero con decimales exactos | CSAPP c2.4·MIT c5·RM-CS |
| 4 | Texto: ASCII, Unicode y UTF-8 | Básico | **está pero básico** (M1 T5); también en JavaScript M14 T8 (parte de Unicode): falta ver los bytes de una «ñ» y de un emoji, la normalización y el error clásico de codificación | RM-CS·CSAPP c2.1·CS50 s0 |
| 5 | Tiempo: fechas, zonas horarias, UTC e ISO 8601 | Básico | **falta** | DDIA c9·RFC §5·RM-SQL·ENT |
| 6 | Archivos de texto y binarios: tamaños, compresión y sumas de verificación | Básico | **falta** | ALG 5.5·MDN·RM-CS·CSAPP c10 |

#### M6 · Git I: el historial local (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Qué es el control de versiones y cómo piensa Git: instantáneas y tres áreas | Básico | **ya está** (M5 T3); también en Microservicios 0.4 T1: Fundamentos es el dueño; los dos temas se fusionan | PG c1.1–1.3·RM-GIT·MS26 5·PP t19·YT-GIT |
| 2 | Instalar y configurar Git: identidad, editor y niveles de `git config` | Básico | **falta** | PG c1.5–1.6, c8.1·RM-GIT·YT-GIT |
| 3 | El primer repositorio: `init`, `status`, `add` y `commit` | Básico | **está pero básico** (M5 T3): un solo tema de 1.286 palabras cubre todo Git; falta el área de preparación paso a paso | PG c2.1–2.2·RM-GIT·YT-GIT·CS50 s8 |
| 4 | Leer el historial: `log`, `diff` y `show` | Básico | **está pero básico** (M5 T3): faltan las opciones de `log` y leer un diff línea a línea | PG c2.3·RM-GIT·YT-GIT |
| 5 | `.gitignore` y lo que nunca se versiona | Básico | **falta** (la lección actual no menciona `.gitignore`) | PG c2.2·RM-GIT·PP t19 |
| 6 | Deshacer con seguridad: `restore`, `commit --amend` y `revert` | Básico | **falta** (DevOps M1 T6 (parte)) | PG c2.4·RM-GIT·YT-GIT |
| 7 | Commits atómicos y mensajes que explican el porqué | Básico | **está pero básico** (M5 T3): falta la convención de mensaje y un historial malo reescrito como ejemplo | PG c5.2·RM-GIT·PP t19 |

#### M7 · Git II: ramas, remotos y GitHub (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Ramas: un puntero que se mueve, `HEAD` y `switch` | Básico | **está pero básico** (M5 T3): falta el modelo de punteros dibujado y el estado de `HEAD` separado | PG c3.1, c3.3·RM-GIT·YT-GIT |
| 2 | Fusionar: avance rápido, commit de fusión y resolución de conflictos | Básico | **está pero básico** (M5 T3): falta un conflicto real resuelto con su salida | PG c3.2·RM-GIT·YT-GIT |
| 3 | Remotos: `clone`, `fetch`, `pull`, `push` y ramas de seguimiento | Básico | **está pero básico** (M5 T3): falta la diferencia entre `fetch` y `pull` demostrada | PG c2.5, c3.5·RM-GIT·YT-GIT |
| 4 | Autenticarse con el servidor: claves SSH y HTTPS con credenciales | Básico | **falta** (DevOps M0 T6 (parte de SSH)) | PG c4.1, c4.3, c7.14·RM-GIT·FCC-LNX p8 |
| 5 | GitHub: repositorio, issues, fork y pull request | Básico | **está pero básico** (M5 T3): la lección nombra el pull request tres veces; falta el flujo completo | PG c6.1–6.2·RM-GIT·YT-GIT |
| 6 | Etiquetas y versiones: `tag` y versionado semántico | Básico | **falta** (Android M11, iOS M11 y KMP M10 lo usan sin que nadie lo enseñe) | PG c2.6·RM-GIT |
| 7 | Markdown y el README de un repositorio | Básico | **falta** | RM-GIT·PG c6.2·PP t16 |

#### M8 · Internet y la web desde cero (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Cliente, servidor y API: quién pide y quién responde | Básico | **ya está** en otro curso (Microservicios 0.1 T2 y 0.1 T3): Fundamentos pasa a ser el dueño | CSAPP c11.1·KR c1–2·RM-BE·ENT |
| 2 | De una URL al servidor: red, DNS, IP y puertos | Básico | **ya está** (M3 T1); también en Cloud M0 T2 y DevOps M0 T7 (parte) | KR c1–2·MDN·RM-BE·CSAPP c11·YT-NET |
| 3 | Anatomía de una URL: esquema, autoridad, ruta, consulta y fragmento | Básico | **está pero básico** (M3 T1): es un apartado del tema anterior; falta la codificación de caracteres en la URL | RFC §4·MDN |
| 4 | HTTP como contrato observable: petición y respuesta leídas con `curl -v` | Básico | **ya está** (M3 T2); también en Microservicios 0.4 T3 y Node M3 T1: se fusionan | RFC §3, §6·MDN·RM-BE·ENT |
| 5 | Métodos y códigos de estado: qué significa cada familia | Básico | **está pero básico** (M3 T2); también en Node M3 T4 (parte): falta la tabla de métodos y familias con un ejemplo real de cada una | RFC §9, §15·MDN·ENT |
| 6 | Cabeceras y tipos de contenido | Básico | **está pero básico** (M3 T2); también en Node M3 T3 (parte): faltan los tipos MIME y las cabeceras de petición y de respuesta más comunes | RFC §5–6, §8·MDN |
| 7 | Las herramientas del navegador: la pestaña Red como instrumento | Básico | **falta** | MS19·MDN·RM-BE |

#### M9 · Datos con forma: texto plano, JSON y YAML (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Texto plano y CSV: por qué duran y dónde se rompen | Básico | **falta** | PP t16·MS20 4·CS50 s7 |
| 2 | JSON: sintaxis, tipos y errores típicos | Básico | **ya está** en otro curso (Microservicios 0.4 T4): Fundamentos pasa a ser el dueño | RM-BE·MDN·DDIA c5 |
| 3 | YAML: indentación, tipos implícitos y sorpresas | Básico | **ya está** en otro curso (Microservicios 0.4 T5): Fundamentos pasa a ser el dueño | RM-GIT·RM-BE |
| 4 | Consultar y transformar JSON desde la terminal | Básico | **falta** | MS20 4·PP t21 |
| 5 | Configuración: archivos de entorno, TOML, INI y orden de precedencia | Básico | **está pero básico** en otro curso (Microservicios 0.4 T6): el tema actual cubre las variables de entorno; faltan los formatos de archivo y quién gana cuando hay varios | PP t32·RM-BE·RM-GIT |
| 6 | XML y otros formatos con etiquetas: leerlos cuando aparecen | Básico | **falta** (el temario de Java deja XML fuera (su decisión D6)) | DDIA c5·RM-BE |

### Tramo 2 · Aplicación (nivel Intermedio) — 68 temas

#### M10 · El shell como lenguaje (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Expansiones y comillas: por qué una variable sin comillas rompe un script | Intermedio | **falta** | BASH 3.5·POSIX 2.2, 2.6·MS20 2 |
| 2 | Filtros de texto: `grep`, `sed`, `awk`, `sort`, `uniq`, `cut` y `wc` | Intermedio | **está pero básico** en otro curso (DevOps M0 T3): 805 palabras para tuberías y filtros a la vez; falta un caso de datos reales por filtro | MS20 4·PP t21·FCC-LNX p8·POSIX |
| 3 | Expresiones regulares: básicas, extendidas y las de cada lenguaje | Intermedio | **falta** (Java M19 T2 y JavaScript M14 T8 enseñan solo la API de su lenguaje) | ALG 5.4·MS20 4·PP t21 |
| 4 | Scripts: shebang, argumentos, códigos de salida y modo estricto | Intermedio | **está pero básico** en otro curso (DevOps M0 T4): 826 palabras; falta el script que falla en silencio y su diagnóstico | BASH 3.8, 4.3·POSIX 2.8·MS20 2 |
| 5 | Condicionales, bucles y funciones en bash | Intermedio | **falta** | BASH 3.2–3.3, 6.4·POSIX 2.9·FCC-LNX p6 |
| 6 | Procesos, señales y trabajos en segundo plano | Intermedio | **ya está** en otro curso (DevOps M0 T2): se muda | BASH c7·CSAPP c8·MS26 2·FCC-LNX p8 |
| 7 | Scripts portables y revisados: bash frente a `sh` de POSIX y análisis estático | Intermedio | **falta** | BASH 6.11·POSIX 2.1·MS20 2·MS26 9 |

#### M11 · Herramientas del oficio (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El editor a fondo: búsqueda, edición múltiple y refactorizaciones asistidas | Intermedio | **está pero básico** (M0 T6): el tema actual se queda en los atajos básicos | PP t18·MS26 3·MS20 3 |
| 2 | Depurar con evidencia: reproducir, aislar y probar hipótesis | Intermedio | **ya está** (M5 T1) | PP t20·MS26 4·TLAP c8·CS2023 SDF-Fundamentals·ENT |
| 3 | El depurador y el registro de eventos como instrumentos | Intermedio | **está pero básico** (M5 T1): la lección tiene seis menciones de `pdb` o `breakpoint`; falta la sesión completa con puntos de parada y el uso de niveles de registro | CS2023 SDF-Practices·MS26 4·MIT c12 |
| 4 | SSH: entrar a otra máquina, claves, archivo de configuración y túneles | Intermedio | **está pero básico** en otro curso (DevOps M0 T6): en DevOps es parte del endurecimiento del servidor; aquí se enseña como herramienta de trabajo | MS26 2·FCC-LNX p8·PG c4.3 |
| 5 | Automatizar tareas repetidas: `make` y tareas programadas | Intermedio | **está pero básico** en otro curso (DevOps M0 T5): DevOps cubre cron (755 palabras); falta `make` como punto de entrada del proyecto | MS20 8·MS19·FCC-LNX p8·PP t17 |
| 6 | Instalar y fijar versiones de herramientas: gestores de paquetes del sistema y del lenguaje | Intermedio | **falta** | MS26 6·FCC-LNX p7·RM-BE |
| 7 | Tu entorno como código: alias, archivos de inicio y varias sesiones de terminal | Intermedio | **falta** | MS26 2·BASH 6.2, 6.6·MS19·PG c2.7 |

#### M12 · Diseño de programas y código limpio (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Herencia, composición y clases abstractas | Intermedio | **ya está** (M1 T7): no tiene diagrama | MIT c19·TLAP c5·PP t31·OSSU |
| 2 | Nombres que revelan intención y funciones pequeñas | Intermedio | **ya está** (M15 T1) | PP t44·CS2023 SDF-Practices·MS26 9 |
| 3 | Comentarios honestos y excepciones en lugar de códigos de error | Intermedio | **está pero básico** (M15 T2): falta el ejemplo antes y después con su prueba | PP t24·CS2023 SDF-Fundamentals |
| 4 | Objetos frente a estructuras de datos y la ley de Deméter | Intermedio | **está pero básico** (M15 T3): falta el caso real de acoplamiento y su medida | PP t28·OSSU |
| 5 | Manejo de errores: fallar pronto, propagar o recuperar | Intermedio | **falta** | PP t24–26·CS2023 SDF-Fundamentals·MIT c13 |
| 6 | Contratos: precondiciones, postcondiciones, invariantes y aserciones | Intermedio | **está pero básico** (M2 T3); también en Java M19 T4 lo enseña para Java: hoy las precondiciones aparecen solo dentro de la búsqueda binaria | PP t23, t25·MIT c13·UNAM III |
| 7 | Estilo uniforme: formateador y analizador estático del lenguaje | Intermedio | **está pero básico** (M5 T4): comparte tema con la revisión y la integración continua (la lección ya usa Ruff) | CS2023 SDF-Practices·MS26 9·PP t51 |

#### M13 · Pruebas básicas (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Qué es una prueba y qué demuestra: preparar, actuar y comprobar | Intermedio | **está pero básico** (M5 T2): el tema actual junta el propósito y los niveles | CS2023 SDF-Practices·MIT c12·PP t41·61B c6 |
| 2 | Diseñar casos: particiones, valores límite y casos de error | Intermedio | **está pero básico** (M1 T1, M5 T2): los casos de prueba se nombran desde el M1 actual, pero la técnica no se enseña | CS2023 SDF-Practices·MIT c12·TLAP c1 |
| 3 | Pruebas unitarias con el marco del lenguaje: descubrimiento, preparación y pruebas parametrizadas | Intermedio | **está pero básico** (M5 T2): falta la preparación compartida y las pruebas parametrizadas | OSSU·RM-BE·61B c6 |
| 4 | Niveles de prueba: unitaria, de integración y de extremo a extremo | Intermedio | **ya está** (M5 T2) | RM-BE·ENT·PP t41 |
| 5 | Dobles de prueba: stub, fake y mock, y cuándo sobran | Intermedio | **está pero básico** (M5 T2): la lección los menciona; falta un tema propio con el fallo de simular de más | RM-BE·OSSU·ENT |
| 6 | Pruebas limpias: F.I.R.S.T. y un concepto por prueba | Intermedio | **ya está** (M15 T4) | PP t41·OSSU |
| 7 | Cobertura: qué mide, qué no mide y cómo leer el informe | Intermedio | **está pero básico** (M5 T2): aparece como dato; falta el caso de cobertura alta con un defecto sin detectar | RM-BE·ENT·MS26 9 |

#### M14 · Estructuras de datos I: lineales y por clave (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Tipos abstractos de datos: elegir la estructura según las operaciones | Intermedio | **ya está** (M2 T1) | UNAM I·ESPOL 1·ALG 1.2·CS2023 SDF-DataStructures·61B c2 |
| 2 | Arreglos y arreglos dinámicos: redimensionar y coste amortizado | Intermedio | **falta** (la lección nombra el coste amortizado una vez) | 61B c5, c7·COS226 3·UNAM IV·RM-CS |
| 3 | Listas enlazadas simples y dobles | Intermedio | **falta** | 61B c3–5·COS226 4·UNAM VI·ESPOL 2·RM-CS·TLAP c4 |
| 4 | Pilas, colas y abstracciones de comportamiento | Intermedio | **ya está** (M2 T2) | ALG 1.3·UNAM VII–VIII·ESPOL 3–4·COS226 3–4·RM-CS |
| 5 | Tablas hash: función de dispersión, colisiones y factor de carga | Intermedio | **está pero básico** (M2 T6): 696 palabras y sin diagrama; falta implementar una y medir cómo se degrada | GROK c5·ALG 3.4·61B c19–20·UNAM XIII·MIT c26·COS226 14 |
| 6 | Conjuntos y mapas como tipos abstractos | Intermedio | **falta** | ESPOL 5·ALG 3.1, 3.5·61B c2, c16·CS2023 SDF-DataStructures |
| 7 | Complejidad: contar operaciones, medir tiempos y notación O grande | Intermedio | **está pero básico** (M2 T4): comparte tema con ordenamiento y recursión | GROK c1·ALG 1.4·MIT c21–22·UNAM II·61B c11·PP t39 |

#### M15 · Algoritmos I: buscar y ordenar (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Búsqueda lineal y binaria: precondiciones y demostración de corrección | Intermedio | **ya está** (M2 T3) | GROK c1·MIT c6·ALG 1.1·RM-CS·UNAM III |
| 2 | Ordenamientos elementales: selección e inserción | Intermedio | **está pero básico** (M13 T1): un tema de 975 palabras para tres algoritmos; falta el de selección y la traza paso a paso | GROK c2·ALG 2.1·COS226 5·61B c28·RM-CS |
| 3 | Mergesort y la idea de divide y vencerás | Intermedio | **está pero básico** (M13 T1): falta la recurrencia y la medición | ALG 2.2·COS226 6·61B c30·MIT c24·OSSU |
| 4 | Quicksort: partición, elección de pivote y peor caso | Intermedio | **está pero básico** (M13 T1): falta el peor caso provocado y su arreglo | GROK c4·ALG 2.3·COS226 7·61B c30, c33 |
| 5 | Recursión a fondo: árbol de llamadas, recursión de cola y vuelta atrás | Intermedio | **está pero básico** (M2 T4): falta el árbol de llamadas y el límite de la pila | GROK c3·TLAP c6·MIT c16·RM-CS |
| 6 | Ordenar en la práctica: estabilidad, criterios de comparación y el ordenamiento de la biblioteca | Intermedio | **falta** | ALG 2.5·61B c33–34·UNAM XV |
| 7 | Análisis asintótico: O, Ω y Θ; mejor caso, peor caso y caso promedio | Intermedio | **está pero básico** (M2 T4): hoy solo O grande | RM-CS·MIT c22–23·61B c13–14·COS226 2·ALG 1.4 |

#### M16 · SQL I: modelo relacional y consultas (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Del mundo real al modelo relacional: entidades, relaciones y claves | Intermedio | **ya está** (M4 T1) | PSQL c1–2·CS50SQL 1–2·RM-SQL·RM-CS·OSSU |
| 2 | Definir tablas: tipos de datos y restricciones | Intermedio | **está pero básico** (M4 T2): un tema de 1.319 palabras para definir, escribir, consultar y relacionar; se parte en cuatro | PSQL c5, c8·RM-SQL·YT-SQL·CS50SQL 2 |
| 3 | Escribir datos: `INSERT`, `UPDATE` y `DELETE` sin sustos | Intermedio | **está pero básico** (M4 T2): falta el `UPDATE` sin `WHERE` reproducido y cómo evitarlo | PSQL c6·RM-SQL·YT-SQL·CS50SQL 3 |
| 4 | Consultar: `SELECT`, filtros, orden, límites y `NULL` | Intermedio | **está pero básico** (M4 T2): falta la lógica de tres valores de `NULL` con un ejemplo que sorprende | PSQL c7·RM-SQL·YT-SQL·CS50SQL 0 |
| 5 | Relacionar tablas: `JOIN` interno, externos, cruzado y consigo misma | Intermedio | **está pero básico** (M4 T2): faltan los `JOIN` externos dibujados y el producto cartesiano accidental | PSQL c2, c7·RM-SQL·YT-SQL·CS50SQL 1 |
| 6 | Agregar: funciones de agregación, `GROUP BY` y `HAVING` | Intermedio | **está pero básico** (M4 T2): la lección lo usa; falta un tema propio con el error de la columna no agrupada | PSQL c2, c7·RM-SQL·YT-SQL |
| 7 | El cliente de SQL y la salida: consola, scripts, CSV y reportes en hoja de cálculo | Intermedio | **está pero básico** (M4 T7): hoy cubre solo el reporte en Excel; faltan el cliente de consola y la importación y exportación de CSV | PSQL VI·CS50SQL 3·PP t16 |

#### M17 · SQL II: diseño y consultas avanzadas (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Normalización hasta la tercera forma normal y cuándo desnormalizar | Intermedio | **está pero básico** (M4 T1): la lección habla de normalizar; falta un tema propio con las anomalías provocadas | RM-SQL·RM-CS·RM-BE·CS50SQL 2·OSSU |
| 2 | Subconsultas y expresiones de tabla comunes, también recursivas | Intermedio | **está pero básico** (M4 T5): un tema para subconsultas, vistas, triggers y ventanas; la lección no usa `WITH` | PSQL c7·RM-SQL·YT-SQL |
| 3 | Funciones de ventana | Intermedio | **está pero básico** (M4 T5): la lección tiene dos usos de `OVER`; faltan marcos, rangos y los rankings | PSQL c3, c7·RM-SQL |
| 4 | Vistas y vistas materializadas | Intermedio | **está pero básico** (M4 T5): faltan las materializadas y cuándo refrescarlas | PSQL c3·RM-SQL·RM-CS·CS50SQL 4 |
| 5 | Índices: qué estructura son, compuestos, parciales y cuándo estorban | Intermedio | **ya está** (M4 T3) | PSQL c11·RM-SQL·RM-BE·CS50SQL 5·ENT |
| 6 | Leer un plan de ejecución con `EXPLAIN` | Intermedio | **está pero básico** (M4 T3): comparte tema con índices y restricciones; falta leer un plan nodo a nodo | PSQL c14·RM-SQL·CS50SQL 5 |
| 7 | Tipos de datos con criterio: texto, números exactos, fechas, identificadores y JSON | Intermedio | **falta** | PSQL c8·RM-SQL·DDIA c3 |

#### M18 · HTTP a fondo I: semántica y diseño de API (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Semántica de los métodos: seguros, idempotentes y almacenables en caché | Intermedio | **está pero básico** (M3 T2): la lección nombra la idempotencia; falta la tabla de propiedades y el `POST` repetido | RFC §9·MDN·ENT |
| 2 | Representaciones y negociación de contenido | Intermedio | **está pero básico** en otro curso (Node M3 T4): en Node son 585 palabras ligadas a `node:http`; el concepto pasa a Fundamentos | RFC §8, §12·MDN |
| 3 | Cookies y sesiones sobre un protocolo sin estado | Intermedio | **está pero básico** en otro curso (Node M6 T5 y JavaScript M14 T7): la lección de HTTP de Fundamentos no menciona las cookies | MDN·RFC §3·ENT·RM-BE |
| 4 | Autenticación en HTTP: desafío, credenciales, `Basic` y `Bearer` | Intermedio | **está pero básico** (M6 T2); también en Java M18 T2 y Node M6 T2 (el concepto de token): falta verlo en la traza HTTP; los tokens firmados se usan en Spring y Node | RFC §11·MDN·RM-BE |
| 5 | Redirecciones: permanentes, temporales y qué método sobrevive | Intermedio | **falta** | MDN·RFC §15 |
| 6 | REST como estilo: recursos, representaciones y restricciones | Intermedio | **está pero básico** en otro curso (Java M18 T1 (parte de teoría)): el temario de Java ya envía aquí la teoría de REST | RM-CS·RM-BE·OSSU·ENT |
| 7 | Diseñar una API HTTP: errores, paginación, versionado y contrato escrito | Intermedio | **está pero básico** en otro curso (Node M3 T5, Spring Boot M2 T5–T6 y RutaFlow M2 T4): cada curso lo explica con su framework; falta el criterio común | RM-BE·ENT·RFC §15 |

#### M19 · La web como plataforma: HTML, CSS y accesibilidad (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | HTML semántico y el DOM | Intermedio | **ya está** (M3 T3) | CS50 s8·RM-BE·MDN |
| 2 | Formularios: del `<form>` a la petición HTTP | Intermedio | **está pero básico** (M3 T3): falta seguir el envío del formulario en la pestaña Red | CS50 s8·MDN·RFC §8 |
| 3 | CSS: cascada, modelo de caja y diseño adaptable | Intermedio | **ya está** (M3 T4) | CS50 s8·RM-BE |
| 4 | Accesibilidad verificable: teclado, lector de pantalla y contraste | Intermedio | **está pero básico** (M3 T4); también en JavaScript M14 T4: comparte tema con CSS; falta la auditoría con una herramienta y su informe | CS2023 HCI·RM-BE |
| 5 | Cómo convierte el navegador el HTML en píxeles | Intermedio | **falta** | RM-BE·MS19·CS2023 SPD |

### Tramo 3 · Integración (nivel Avanzado) — 111 temas

#### M20 · Git III: colaboración profesional (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Flujos de trabajo con ramas: desarrollo en el tronco, flujo de GitHub y GitFlow | Avanzado | **ya está** en otro curso (DevOps M1 T1): se muda | PG c3.4, c5.1·RM-GIT·ENT |
| 2 | Rebase y rebase interactivo frente a fusión | Avanzado | **está pero básico** en otro curso (DevOps M1 T2): 809 palabras; falta la regla de no reescribir lo publicado demostrada con su error | PG c3.6, c7.6·RM-GIT |
| 3 | `cherry-pick`, `stash` y `reset` frente a `revert` | Avanzado | **está pero básico** en otro curso (DevOps M1 T6): 786 palabras para cuatro órdenes; faltan los tres modos de `reset` dibujados | PG c7.3, c7.7·RM-GIT |
| 4 | Revisión de código: pull requests que se pueden revisar | Avanzado | **está pero básico** (M5 T4): comparte tema con el análisis estático y la integración continua | PG c5.2–5.3, c6.3·RM-GIT·RM-BE·PP t47 |
| 5 | Conflictos difíciles: fusión avanzada y estrategias | Avanzado | **falta** | PG c7.8–7.9·RM-GIT |
| 6 | Encontrar cuándo se rompió: `bisect`, `blame` y búsqueda en la historia | Avanzado | **está pero básico** en otro curso (DevOps M1 T3): 787 palabras; faltan `blame` y la búsqueda por contenido | PG c7.5, c7.10·RM-GIT·MS26 5 |
| 7 | Hooks, commits firmados y políticas del repositorio | Avanzado | **está pero básico** en otro curso (DevOps M1 T4): 839 palabras; falta la política aplicada en el servidor | PG c7.4, c8.3–8.4·RM-GIT |

#### M21 · Git IV: por dentro y a escala (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Objetos de Git: blob, árbol, commit y etiqueta, direccionados por contenido | Avanzado | **falta** | PG c10.1–10.2·MS26 5 |
| 2 | Referencias, `HEAD` y `reflog`: recuperar lo que parecía perdido | Avanzado | **está pero básico** en otro curso (DevOps M1 T7): comparte tema con worktree y submódulos; falta el modelo de referencias | PG c10.3, c10.7, c7.1·RM-GIT |
| 3 | Empaquetado, recolección de basura y mantenimiento | Avanzado | **falta** | PG c10.4, c10.7 |
| 4 | Qué viaja en un `fetch` y en un `push`: refspecs y protocolos | Avanzado | **falta** | PG c10.5–10.6, c4.1 |
| 5 | Varios árboles de trabajo y repositorios dentro de repositorios | Avanzado | **está pero básico** en otro curso (DevOps M1 T7): comparte tema con reflog; falta el criterio para no usar submódulos | PG c7.11·RM-GIT |
| 6 | Repositorios grandes: monorepo frente a varios repositorios y archivos pesados | Avanzado | **está pero básico** en otro curso (DevOps M1 T5): 752 palabras; faltan los archivos grandes y las clonaciones parciales | RM-GIT·PG c8.2·ENT |
| 7 | Reescribir historia ya publicada y retirar un secreto del repositorio | Avanzado | **falta** | PG c7.6·RM-GIT |

#### M22 · Sistemas operativos I: procesos y memoria (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | El sistema operativo como administrador y frontera: núcleo, modo usuario y llamadas al sistema | Avanzado | **ya está** (M8 T1) | CSAPP c1.7, c8.1·OSSU·TYCS·RM-CS |
| 2 | Procesos: creación, estados, árbol de procesos y código de salida | Avanzado | **está pero básico** (M8 T1): falta crear un proceso hijo y ver su estado | CSAPP c8.2–8.4·RM-CS·ENT |
| 3 | Señales y terminación ordenada | Avanzado | **está pero básico** en otro curso (DevOps M0 T2): el uso desde la terminal se enseña antes (módulo del shell); aquí falta el mecanismo y un programa que las maneja | CSAPP c8.5·RM-CS·FCC-LNX p8 |
| 4 | Planificación de CPU: cómo se reparte el procesador | Avanzado | **falta** | RM-CS·OSSU·TYCS·CS2023 OS |
| 5 | Memoria virtual: direcciones, páginas y fallos de página | Avanzado | **está pero básico** (M8 T2): un tema para memoria y concurrencia; se parte | CSAPP c9.1–9.6·RM-CS·OSSU |
| 6 | Pila y montón, asignación dinámica, recolección de basura y fugas | Avanzado | **está pero básico** (M8 T2); también en JavaScript M5 T5 lo dibuja para su motor: falta la fuga reproducida y medida | CSAPP c9.9–9.11·CS50 s4·TLAP c4·RM-CS |
| 7 | Jerarquía de memoria y cachés: por qué importa la localidad | Avanzado | **falta** | CSAPP c6·RM-CS·OSSU |

#### M23 · Sistemas operativos II: archivos, E/S y Linux observable (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Todo es un archivo: descriptores y E/S de Unix | Avanzado | **falta** | CSAPP c10·OSSU·RM-CS |
| 2 | Sistemas de archivos: inodos, enlaces, montajes y durabilidad | Avanzado | **falta** | CSAPP c10.6–10.8·FCC-LNX p4·DDIA c4 |
| 3 | Linux como entorno observable: procesos, memoria, disco y registros del sistema | Avanzado | **está pero básico** (M8 T3); también en DevOps M0 T11 (parte de registros): 855 palabras; falta un diagnóstico guiado con cada herramienta | FCC-LNX p3, p8·MS19·MS26 4·ENT |
| 4 | Ver qué hace un programa por dentro: trazar llamadas al sistema y perfilar | Avanzado | **falta** | MS26 4·MS20 7·CSAPP c8.7 |
| 5 | Del fuente al ejecutable: compilar, enlazar, cargar y bibliotecas compartidas | Avanzado | **está pero básico** (M0 T2): el tema básico solo presenta la idea; falta el enlazado y el error de biblioteca no encontrada | CSAPP c7·CS50 s1·OSSU |
| 6 | Cómo ejecuta la CPU un programa: instrucciones, registros y un ensamblador leído, no escrito | Avanzado | **falta** | CSAPP c3–4·RM-CS·OSSU·CS50 s4 |
| 7 | Contenedores en una página: aislamiento reproducible y enlace al curso de Docker | Avanzado | **ya está** (M8 T4): se reduce a un resumen; el tema completo pasa a Docker M0 T1–T3 | CSAPP c8·RM-BE |

#### M24 · Concurrencia (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Concurrencia y paralelismo; hilos y procesos | Avanzado | **está pero básico** (M8 T2): comparte tema con la memoria | CSAPP c12.1, c12.3·RM-CS·PP t33·ENT |
| 2 | Condiciones de carrera y secciones críticas, reproducidas | Avanzado | **está pero básico** (M8 T2); también en Java M5 T4 lo enseña para Java: falta el fallo reproducible y contado | CSAPP c12.4·PP t34·RM-CS |
| 3 | Cerrojos, semáforos y monitores | Avanzado | **está pero básico** (M8 T5): se usan en los problemas clásicos sin tema propio | CSAPP c12.5·RM-CS·OSSU |
| 4 | Interbloqueo e inanición: filósofos y lectores-escritores | Avanzado | **ya está** (M8 T5) | CSAPP c12.7·RM-CS·ENT |
| 5 | E/S asíncrona y bucle de eventos: concurrencia en un solo hilo | Avanzado | **falta** (JavaScript M5 T1 y Node lo enseñan para su entorno) | CSAPP c12.2·OSSU·RM-BE |
| 6 | Concurrencia sin memoria compartida: mensajes, actores y colas | Avanzado | **falta** | PP t35–36·RM-BE·DDIA c12 |
| 7 | Medir la concurrencia: latencia, rendimiento y el límite de lo paralelizable | Avanzado | **está pero básico** (M10 T6): 736 palabras; faltan los percentiles y el límite teórico de la mejora | CSAPP c12.6·DDIA c2·ENT |

#### M25 · Redes I: de la aplicación al cable (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Capas de red: el modelo TCP/IP y el modelo OSI sobre una captura real | Avanzado | **está pero básico** en otro curso (DevOps M0 T7): 712 palabras para OSI, TCP/IP, DNS y balanceadores; se parte | KR c1·RM-CS·YT-NET·OSSU·TYCS |
| 2 | DNS a fondo: jerarquía, tipos de registro, caché y tiempo de vida | Avanzado | **está pero básico** (M3 T1); también en Node M3 T6 (parte): en el tema básico es un paso del recorrido; falta la consulta seguida servidor a servidor | KR c2·RM-CS·RM-BE·YT-NET·ENT |
| 3 | Transporte: UDP y TCP, puertos, conexión, fiabilidad y control de congestión | Avanzado | **está pero básico** en otro curso (Node M3 T6): en Node es la API de `net` y `dgram`; el mecanismo pasa a Fundamentos | KR c3·RM-CS·YT-NET·CS2023 NC |
| 4 | Sockets: escribir un cliente y un servidor TCP | Avanzado | **falta** | CSAPP c11.4–11.6·RM-CS·KR c2 |
| 5 | Direcciones IP, subredes y traducción de direcciones; IPv4 e IPv6 | Avanzado | **está pero básico** en otro curso (Cloud M0 T2): en Cloud son 615 palabras para IP, puertos, HTTP y API | KR c4·YT-NET·CSAPP c11.3·RM-CS |
| 6 | Enrutamiento: cómo llega un paquete al otro lado del mundo | Avanzado | **falta** | KR c5·YT-NET·CS2023 NC |
| 7 | La red local: enlace, direcciones físicas, Wi-Fi y asignación automática de direcciones | Avanzado | **falta** | KR c6–7·YT-NET |

#### M26 · Seguridad I: pensar como atacante y como defensor (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Activos, amenazas, riesgos y límites de confianza | Avanzado | **ya está** (M6 T1): con 3.064 palabras se reparte entre este tema y el de privacidad | OSSU·CS2023 SEC·RM-BE·PP t43 |
| 2 | Identidad, contraseñas, sesiones y autorización | Avanzado | **ya está** (M6 T2); también en Node M6 T1 (el concepto de hash de contraseñas) | RM-BE·RM-CS·OWASP A07·ENT |
| 3 | Criptografía aplicada: resumen, cifrado simétrico y asimétrico, y firma | Avanzado | **ya está** (M6 T3): la parte de TLS pasa al módulo de redes | MS20 9·RM-CS·RM-BE·KR c8·OWASP A04 |
| 4 | Validación de entradas y vulnerabilidades web | Avanzado | **ya está** (M6 T4): con 2.792 palabras se reparte entre este tema, el de privacidad y el módulo de OWASP | RFC §17·RM-BE·OWASP A05 |
| 5 | Ingeniería social y suplantación: analizar el correo, no solo mirarlo | Avanzado | **ya está** (M6 T5): con 3.629 palabras supera los 45 min; se ajusta al reescribir | MS19·OSSU·CS2023 SEC |
| 6 | Secretos: dónde viven, cómo rotan y cómo no llegan al repositorio | Avanzado | **está pero básico** (M6 T3); también en DevOps M11 T3 enseña las herramientas: es un apartado del tema de criptografía | RM-GIT·RM-BE·OWASP A02·PP t43 |
| 7 | Privacidad y datos personales: minimizar, conservar y responder | Avanzado | **está pero básico** (M6 T4, M6 T1): falta la ley colombiana de datos personales, que el temario de Blockchain da por existente en Fundamentos | OSSU·ENT·RFC §17·CS2023 SEP |

#### M27 · Redes II: diagnóstico e infraestructura (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Diagnosticar por capas con herramientas de terminal y capturas de tráfico | Avanzado | **falta** (DevOps M11 T7 (escaneo de puertos, parte)) | FCC-LNX p8·KR c1·YT-NET·MS26 4·ENT |
| 2 | TLS: saludo, certificados y cadena de confianza | Avanzado | **está pero básico** (M6 T3); también en Node M3 T7 (parte): hoy es un apartado de un tema de 2.943 palabras sobre criptografía; falta leer un saludo TLS y un certificado reales | KR c8·RM-CS·RM-BE·MDN |
| 3 | Proxies, proxy inverso, balanceadores y redes de distribución de contenido | Avanzado | **está pero básico** en otro curso (DevOps M0 T7 y M0 T9 (el concepto)): la configuración de NGINX se queda en DevOps | MDN·RFC §3.7, §7·RM-CS·RM-BE·ENT |
| 4 | Cortafuegos, puertos expuestos y superficie mínima | Avanzado | **está pero básico** en otro curso (DevOps M0 T6): el endurecimiento del servidor se queda en DevOps; aquí va el concepto y su comprobación | YT-NET·KR c8·RM-BE |
| 5 | Tiempo real sobre la web: sondeo, eventos del servidor y WebSocket | Avanzado | **está pero básico** en otro curso (JavaScript M14 T10 y Node M4 T5): cada curso enseña su API; falta comparar los tres mecanismos en la traza | RM-CS·RM-BE·MDN·RFC §7.8 |
| 6 | Más allá de REST: RPC, gRPC, GraphQL y mensajería, y cuándo conviene cada uno | Avanzado | **falta** (Microservicios y Spring enseñan cada tecnología; aquí solo el criterio de elección) | RM-CS·RM-BE·DDIA c5·ENT |

#### M28 · HTTP a fondo II: caché, conexiones y seguridad del protocolo (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Caché HTTP: frescura, validación y quién guarda qué | Avanzado | **falta** (la lección de HTTP nombra la caché de paso) | MDN·RFC §3.8, §8.8·RM-BE·ENT |
| 2 | Peticiones condicionales y de rango | Avanzado | **falta** | RFC §13–14·MDN |
| 3 | Mismo origen y CORS | Avanzado | **está pero básico** en otro curso (Spring Boot M5 T3): en Spring es configuración; el porqué del navegador pasa a Fundamentos | MDN·RM-BE·ENT |
| 4 | Conexiones y versiones: de HTTP/1.1 a HTTP/2 y HTTP/3 | Avanzado | **está pero básico** en otro curso (Node M3 T7): en Node es la API; falta comparar las versiones con una medición | MDN·RFC §2.5·KR c2 |
| 5 | Compresión y rendimiento de una respuesta | Avanzado | **falta** | MDN·RFC §8.4 |
| 6 | Cabeceras de seguridad: política de contenido y transporte seguro obligatorio | Avanzado | **está pero básico** en otro curso (Node M10 T1): en Node es el uso de una biblioteca; el concepto pasa a Fundamentos | MDN·RM-BE·OWASP A02 |
| 7 | Idempotencia, reintentos, tiempos máximos y límites de tasa | Avanzado | **está pero básico** (M3 T2); también en Node M10 T2 y JavaScript M6 T4: falta el reintento que duplica un pedido y su arreglo con clave de idempotencia | RFC §9.2·ENT·RM-BE·DDIA c9 |

#### M29 · SQL III: transacciones y PostgreSQL por dentro (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Transacciones y ACID | Avanzado | **ya está** (M4 T4); también en Java M17 T2 (el concepto): la elección SQL/NoSQL del mismo tema pasa al módulo siguiente | PSQL c3·RM-SQL·RM-CS·RM-BE·DDIA c8 |
| 2 | Niveles de aislamiento y anomalías, reproducidos con dos sesiones | Avanzado | **está pero básico** (M4 T4): la lección cita el aislamiento tres veces; falta cada anomalía provocada | PSQL c13·RM-SQL·DDIA c8·ENT |
| 3 | Bloqueos, control multiversión e interbloqueos | Avanzado | **falta** | PSQL c13·RM-CS·ENT·DDIA c8 |
| 4 | Optimizar consultas: estadísticas, estrategias de combinación y cuándo no se usa el índice | Avanzado | **está pero básico** (M4 T3): falta el caso del índice ignorado y su causa | PSQL c14·RM-SQL·RM-BE·CS50SQL 5 |
| 5 | Lógica en el servidor: funciones, procedimientos, cursores y triggers con PL/pgSQL | Avanzado | **ya está** (M4 T6, M4 T5): recibe la parte de triggers de M4 T5 | PSQL c37, c41·RM-SQL·RM-CS |
| 6 | Evolucionar el esquema: migraciones versionadas y cambios sin corte | Avanzado | **falta** (Spring y Microservicios enseñan Flyway y Liquibase; aquí el concepto y un cambio compatible hecho a mano) | RM-BE·ENT·DDIA c5 |
| 7 | Roles, permisos e inyección de SQL | Avanzado | **está pero básico** (M6 T4); también en Node M10 T3 (parte): la inyección aparece en seguridad; faltan roles y permisos de la base | PSQL c20–21·RM-SQL·ENT·OWASP A05 |

#### M30 · Modelos y almacenamiento de datos más allá de lo relacional (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Relacional, documentos, clave-valor, columnas y grafos: elegir el modelo | Avanzado | **está pero básico** (M4 T4); también en Cloud M4 T1 y Cloud M13 T1: hoy es el cierre del tema de transacciones | DDIA c3·RM-CS·RM-BE·OSSU·ENT |
| 2 | Cómo guarda los datos un motor: árboles B y estructuras de registro | Avanzado | **falta** | DDIA c4·ALG 6.2·TYCS |
| 3 | Codificación y evolución de esquemas: compatibilidad hacia atrás y hacia delante | Avanzado | **falta** (RutaFlow M2 T4 lo aplica) | DDIA c5·RM-BE |
| 4 | Validar datos en la frontera con un esquema | Avanzado | **falta** | RM-BE·DDIA c5·PP t23 |
| 5 | Cachés: políticas de reemplazo e invalidación | Avanzado | **falta** | RM-CS·RM-BE·ENT·CSAPP c6 |
| 6 | Búsqueda de texto completo e índices invertidos | Avanzado | **falta** | PSQL c12·RM-BE·ENT |
| 7 | Datos para operar y datos para analizar | Avanzado | **está pero básico** (M11 T3): 668 palabras y sin diagrama; falta la misma consulta en los dos tipos de almacén | DDIA c1, c4·OSSU |

#### M31 · Seguridad II: el OWASP Top 10:2025 como concepto (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Cómo leer el OWASP Top 10 y los catálogos de debilidades y vulnerabilidades | Avanzado | **está pero básico** (M6 T4); también en Node M10 T4–T5 y Microservicios (pista Node, M20 T5): Fundamentos lo cita cuatro veces sin enseñar la lista | OWASP·RM-CS·RM-BE·OSSU |
| 2 | A01 · Control de acceso roto | Avanzado | **falta** | OWASP A01·ENT·RM-BE |
| 3 | A05 · Inyección: SQL, órdenes del sistema y scripts entre sitios | Avanzado | **está pero básico** (M6 T4); también en Node M10 T3: falta reproducir y corregir cada variante | OWASP A05·RFC §17·RM-BE·ENT |
| 4 | A02 · Configuración insegura y A10 · Mal manejo de condiciones excepcionales | Avanzado | **falta** | OWASP A02, A10·PP t24 |
| 5 | A03 · Fallos en la cadena de suministro y A08 · Fallos de integridad | Avanzado | **falta** (DevOps M11 T1 y M11 T5 enseñan las herramientas; aquí el concepto) | OWASP A03, A08·MS26 6 |
| 6 | A04 · Fallos criptográficos y A07 · Fallos de autenticación | Avanzado | **está pero básico** (M6 T2, M6 T3): el contenido existe repartido; falta ordenarlo por categoría con su fallo reproducido | OWASP A04, A07·RM-BE |
| 7 | A06 · Diseño inseguro y A09 · Fallos de registro y alerta | Avanzado | **falta** | OWASP A06, A09·OSSU |

#### M32 · Pruebas y calidad avanzadas, e integración continua (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Escribir la prueba primero como ritmo de diseño | Avanzado | **falta** | PP t41·OSSU·ENT |
| 2 | Pruebas basadas en propiedades | Avanzado | **falta** | PP t42·OSSU |
| 3 | Pruebas de integración con dependencias reales: base de datos y HTTP | Avanzado | **falta** (Node M7 T4 y Spring Boot M6 lo hacen con su framework) | RM-BE·ENT·CS50SQL 6 |
| 4 | Pruebas inestables: tiempo, azar, orden y red | Avanzado | **falta** | ENT·MS26 9·PP t38 |
| 5 | Análisis estático, tipos y revisión automática | Avanzado | **ya está** (M5 T4) | MS26 9·CS2023 SE·PP t51 |
| 6 | Integración continua: la primera canalización que compila, prueba y bloquea | Avanzado | **está pero básico** (M5 T4); también en DevOps M4 es el dueño de las canalizaciones: la lección describe la canalización, pero no hay ninguna ejecutada en un servicio real con su registro | RM-GIT·RM-BE·PP t51·ENT |
| 7 | Refactorizar código heredado con red de seguridad | Avanzado | **está pero básico** (M7 T3): comparte tema con principios y patrones | PP t40·OSSU·RM-BE |

#### M33 · Requisitos, diseño y arquitectura (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Requisitos, interesados y criterios verificables | Avanzado | **ya está** (M7 T1) | PP t45·OSSU·CS2023 SE |
| 2 | Arquitectura guiada por atributos de calidad | Avanzado | **está pero básico** (M7 T2): 895 palabras; falta un atributo convertido en escenario medible | DDIA c2·OSSU·RM-CS·PP t8 |
| 3 | Diseño modular: cohesión, acoplamiento y principios | Avanzado | **ya está** (M7 T3) | PP t9–10, t28·OSSU·RM-CS |
| 4 | Decisiones, documentación, deuda técnica y evolución | Avanzado | **ya está** (M7 T4) | PP t3, t11·OSSU·CS2023 SE |
| 5 | Diagramas que sirven: secuencia, clases, estados y actividad | Avanzado | **falta** | RM-CS·OSSU |
| 6 | Estimar, planificar y trabajar en equipo | Avanzado | **falta** | PP t15, t47–49·RM-GIT·CS2023 SE |

#### M34 · Catálogo de patrones de diseño I (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Qué es un patrón de diseño y cómo se lee un catálogo | Avanzado | **falta** (Java M12 lo da por sabido) | RM-CS·OSSU·PP t8 |
| 2 | Decorator: agregar comportamiento sin heredar | Avanzado | **está pero básico** (M14 T1): 703 palabras; falta el error real y el criterio de cuándo no usarlo | RM-CS·OSSU |
| 3 | Flyweight: compartir estado para ahorrar memoria | Avanzado | **ya está** (M14 T8) | RM-CS·OSSU |
| 4 | Template Method: un algoritmo fijo con pasos variables | Avanzado | **está pero básico** (M14 T3): 673 palabras; falta la alternativa con funciones y la comparación | RM-CS·OSSU·PP t31 |
| 5 | State: un objeto que cambia de comportamiento según su estado | Avanzado | **está pero básico** (M14 T2): 663 palabras; falta la máquina de estados dibujada y la transición inválida | RM-CS·OSSU·PP t29 |

#### M35 · Catálogo de patrones de diseño II (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Chain of Responsibility: una cadena de validadores | Avanzado | **está pero básico** (M14 T4): 710 palabras; falta el eslabón que se traga la petición y su diagnóstico | RM-CS·OSSU |
| 2 | Mediator: coordinar objetos sin que se conozcan | Avanzado | **está pero básico** (M14 T5): 686 palabras; falta el mediador que crece hasta saberlo todo | RM-CS·OSSU·PP t28 |
| 3 | Memento: guardar y restaurar estado para deshacer | Avanzado | **está pero básico** (M14 T6): 624 palabras; falta el coste en memoria medido | RM-CS·OSSU |
| 4 | Visitor: operaciones nuevas sin tocar las clases | Avanzado | **está pero básico** (M14 T7): 680 palabras; falta la comparación con la solución sin patrón | RM-CS·OSSU |
| 5 | Cuándo no usar un patrón: sobreingeniería y antipatrones | Avanzado | **falta** | PP t8, t10·RM-CS·ENT |

#### M36 · Desarrollo con asistentes y agentes de IA (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Desarrollo guiado por especificación con agentes de IA | Avanzado | **ya está** (M7 T6) | MS26 7·RM-BE |
| 2 | Evaluar una skill de agente antes de usarla: validar, deduplicar y medir | Avanzado | **ya está** (M7 T7) | MS26 7·RM-BE |
| 3 | Programar con un asistente: contexto, verificación y límites | Avanzado | **falta** | MS26 7·RM-BE·RM-GIT |
| 4 | Revisar código generado: pruebas, seguridad y dependencias inventadas | Avanzado | **falta** | MS26 7, 9·OWASP A03·RM-BE |
| 5 | Propiedad intelectual, licencias de software y responsabilidad profesional | Avanzado | **falta** | CS2023 SDF-SEP·OSSU·MS26 8 |

### Tramo 4 · Experto (nivel Experto) — 53 temas

#### M37 · Estructuras de datos II: árboles y estructuras especializadas (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Árboles y árboles binarios de búsqueda | Experto | **está pero básico** (M2 T5): 862 palabras; faltan el borrado, los recorridos y el árbol degenerado | ALG 3.2·GROK c7·61B c16·UNAM IX–XI·ESPOL 6·RM-CS |
| 2 | Árboles balanceados: 2-3, rojo-negro y AVL | Experto | **falta** | ALG 3.3·GROK c8·61B c17–18·COS226 10·UNAM XII·RM-CS |
| 3 | Árboles B: la estructura detrás de los índices de una base de datos | Experto | **falta** | ALG 6.2·61B c17·RM-CS·DDIA c4 |
| 4 | Montículos y colas de prioridad | Experto | **falta** (M13 T3 usa una cola de prioridad dentro de Dijkstra sin enseñarla) | ALG 2.4·61B c21·COS226 8·UNAM XIV·RM-CS |
| 5 | Tries y estructuras para cadenas | Experto | **falta** | ALG 5.1–5.2·61B c27·RM-CS |
| 6 | Conjuntos disjuntos (union-find) | Experto | **falta** | ALG 1.5·61B c15·COS226 1 |
| 7 | Estructuras probabilísticas y listas por saltos | Experto | **falta** | RM-CS·DDIA c4 |

#### M38 · Grafos (6 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Grafos: representaciones y recorridos en anchura y en profundidad | Experto | **está pero básico** (M2 T7, M9 T3): 761 palabras; faltan las dos representaciones comparadas y la detección de ciclos | GROK c6·ALG 4.1·61B c22–23·UNAM XVI·ESPOL 7·RM-CS |
| 2 | Grafos dirigidos: orden topológico y componentes | Experto | **está pero básico** (M9 T3): el orden topológico aparece en matemáticas discretas; falta implementarlo y faltan los componentes | ALG 4.2·61B c26·COS226 15–16 |
| 3 | Caminos más cortos con Dijkstra | Experto | **está pero básico** (M13 T3): 868 palabras; falta la cola de prioridad por dentro y el caso de pesos negativos | GROK c9·ALG 4.4·61B c24·COS226 18·RM-CS |
| 4 | Pesos negativos y búsqueda informada: Bellman-Ford y A* | Experto | **falta** | ALG 4.4·RM-CS·61B c24 |
| 5 | Árbol de expansión mínima: Prim y Kruskal | Experto | **está pero básico** (M13 T2): comparte tema con los algoritmos codiciosos | ALG 4.3·61B c25·COS226 17·RM-CS·OSSU |
| 6 | Flujo máximo y corte mínimo | Experto | **falta** | ALG 6.4·COS226 20·RM-CS |

#### M39 · Técnicas de diseño de algoritmos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Algoritmos codiciosos: cuándo la decisión local basta | Experto | **ya está** (M13 T2) | GROK c10·OSSU·RM-CS·COS226 24 |
| 2 | Programación dinámica: resolver una vez y recordar el resultado | Experto | **ya está** (M2 T8): no tiene diagrama | GROK c11·COS226 19·OSSU·61B c37 |
| 3 | Programación dinámica II: mochila, subsecuencias y reconstrucción de la solución | Experto | **falta** | GROK c11·RM-CS·COS226 19 |
| 4 | Vuelta atrás y poda: explorar sin recorrerlo todo | Experto | **falta** | RM-CS·TLAP c6·ALG 6.5 |
| 5 | Búsqueda en cadenas: de la fuerza bruta a KMP y Rabin-Karp | Experto | **está pero básico** (M13 T4): 844 palabras; falta Rabin-Karp y la comparación medida | ALG 5.3·RM-CS |
| 6 | Compresión sin pérdida: códigos de Huffman | Experto | **falta** | ALG 5.5·RM-CS·61B c38 |
| 7 | Problemas intratables: P, NP y heurísticas | Experto | **ya está** (M13 T5) | ALG 6.5–6.6·GROK cB·61B c39·COS226 23·RM-CS·OSSU |

#### M40 · Matemáticas discretas y probabilidad para software (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Lógica para especificar antes de programar | Experto | **ya está** (M9 T1) | OSSU·TYCS·CS2023 MSF·RM-CS |
| 2 | Conjuntos, relaciones y funciones | Experto | **ya está** (M9 T2) | OSSU·TYCS·CS2023 MSF |
| 3 | Inducción, invariantes de bucle y demostraciones de corrección | Experto | **está pero básico** (M9 T2, M2 T3): la inducción es un apartado; falta un invariante demostrado sobre código real | UNAM III·OSSU·TYCS·ALG 1.1 |
| 4 | Conteo y combinatoria | Experto | **ya está** (M9 T3): la parte de grafos pasa al módulo de grafos | OSSU·RM-CS·CS2023 MSF |
| 5 | Probabilidad y evidencia para decisiones técnicas | Experto | **ya está** (M9 T4) | OSSU·RM-CS·COS226 22·MIT c26 |
| 6 | Aritmética modular y números primos: la base de los resúmenes y las claves | Experto | **falta** | OSSU·TYCS·RM-CS·MS20 9 |
| 7 | Estadística para medir software: percentiles, variabilidad y comparaciones honestas | Experto | **falta** | DDIA c2·OSSU·MS26 4 |

#### M41 · Sistemas distribuidos I: red, réplicas y particiones (4 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | La red convierte el resultado en una incertidumbre | Experto | **ya está** (M10 T1) | DDIA c9·TYCS·OSSU·ENT |
| 2 | Replicación: líder y seguidores, retraso y lecturas viejas | Experto | **ya está** (M10 T2) | DDIA c6·RM-CS·RM-BE·ENT |
| 3 | Particionado de datos: claves, rangos y reequilibrio | Experto | **falta** | DDIA c7·RM-CS·RM-BE·CS50SQL 6 |
| 4 | Modelos de consistencia y los teoremas CAP y PACELC | Experto | **está pero básico** (M10 T2): es parte del tema de replicación; falta cada modelo con una ejecución que lo distingue | DDIA c10·RM-CS·RM-BE·ENT |

#### M42 · Sistemas distribuidos II: mensajes, acuerdo y operación (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Mensajes que se procesan con efectos exactamente una vez | Experto | **ya está** (M10 T3) | DDIA c12·RM-BE·ENT |
| 2 | Tiempo, coordinación y acuerdo: relojes lógicos, elección de líder y commit en dos fases | Experto | **ya está** (M10 T5) | DDIA c9–10·TYCS·OSSU |
| 3 | Consenso por dentro: un registro replicado paso a paso | Experto | **está pero básico** (M10 T5): la lección nombra Raft una vez; falta seguir el registro replicado entrada por entrada | DDIA c10·OSSU·TYCS |
| 4 | Resiliencia y observabilidad orientadas a objetivos | Experto | **ya está** (M10 T4) | DDIA c2·RM-BE·ENT |
| 5 | De requisitos a estimación de capacidad y cuello de botella | Experto | **ya está** (M10 T7): es la introducción que el curso de Diseño de sistemas profundiza | DDIA c1–2·RM-CS·ENT |

#### M43 · Cómo funciona un lenguaje de programación (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Autómatas y lenguajes regulares: por qué funciona una expresión regular | Experto | **está pero básico** (M11 T2): hoy es un párrafo del mapa de especializaciones | ALG 5.4·OSSU·TYCS·CS2023 FPL |
| 2 | Del texto al árbol: componentes léxicos, gramáticas y árbol de sintaxis | Experto | **falta** | TYCS·OSSU·CS2023 FPL |
| 3 | Intérpretes, compiladores, código intermedio y compilación en ejecución | Experto | **está pero básico** (M0 T2, M11 T2); también en JavaScript M5 T4 lo enseña para V8: el tema básico solo los distingue | TYCS·CSAPP c1.2·OSSU |
| 4 | Sistemas de tipos: estáticos y dinámicos, fuertes y débiles | Experto | **falta** | OSSU·CS2023 FPL·TYCS |
| 5 | Paradigmas: imperativo, orientado a objetos, funcional y declarativo | Experto | **falta** | OSSU·TYCS·PP t30·CS2023 FPL |

#### M44 · Rendimiento con evidencia (5 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Medir antes de optimizar: perfiles y bancos de pruebas | Experto | **falta** | MS26 4·MS20 7·CSAPP c5·PP t39 |
| 2 | Código amigable con la caché | Experto | **falta** | CSAPP c6.5–6.6·RM-CS |
| 3 | El coste de la E/S: disco, red y llamadas al sistema | Experto | **falta** | CSAPP c10·DDIA c4·ENT |
| 4 | Cuando la notación asintótica engaña: constantes, tamaños reales y memoria | Experto | **falta** | PP t39·ALG 1.4·61B c34 |
| 5 | Diagnóstico de un incidente de principio a fin | Experto | **falta** | FCC-LNX p8·MS26 4·ENT·PP t20 |

#### M45 · Mapa de las ciencias de la computación y siguientes pasos (7 temas)

| # | Tema | Nivel | Estado frente al curso actual | Fuentes |
|---:|---|---|---|---|
| 1 | Sistemas, arquitectura y sistemas operativos | Experto | **ya está** (M11 T1) | CS2023 AR, OS, SF·TYCS·OSSU |
| 2 | Algoritmos, autómatas, lenguajes y compiladores | Experto | **ya está** (M11 T2) | CS2023 AL, FPL·TYCS·OSSU |
| 3 | Bases de datos, almacenes analíticos y minería de datos | Experto | **está pero básico** (M11 T3): 668 palabras y sin diagrama | CS2023 DM·TYCS·OSSU |
| 4 | Inteligencia artificial, aprendizaje automático y visión | Experto | **ya está** (M11 T4) | CS2023 AI·OSSU·CS50 |
| 5 | Gráficos y cómputo científico | Experto | **ya está** (M11 T5) | CS2023 GIT·OSSU |
| 6 | Redes, seguridad, web e ingeniería profesional | Experto | **ya está** (M11 T6): no tiene diagrama | CS2023 NC, SEC, SE, SEP·OSSU |
| 7 | Tu ruta por la academia: qué curso sigue y por qué | Experto | **falta** | OSSU·TYCS·RM-CS·RM-BE |

### 2.1 Notas de linealidad

En esta sección los números de módulo y tema son los del temario objetivo, salvo donde dice «actual».

- **Git** se enseña en M6 y M7; ningún laboratorio anterior pide un repositorio. Desde
  M7 todos los laboratorios se entregan como rama y pull request.
- **Las pruebas** se ejecutan desde M0 (cada laboratorio trae su `verificar.sh`) y se diseñan a mano desde
  M2 (casos de prueba en papel); escribirlas con un marco se enseña en
  M13. Ningún tema anterior pide escribir una prueba automática.
- **Las colecciones del lenguaje** (M3 T6) se enseñan antes de elegir estructuras (M14).
  Hoy es al revés: el M2 T1 actual elige estructuras sin haberlas presentado.
- **Aparecen dos veces a propósito**, con primer uso y funcionamiento interno: las señales (M10
  T6 y M22 T3), la recursión (M4 T4 y M15 T5), DNS (M8 T2 y
  M25 T2), las tablas hash y los árboles frente a los índices de SQL (M17 T5 usa la idea;
  M37 T3 la abre), la idempotencia (M18 T1 y M28 T7) y la
  inyección de SQL (M29 T7 y M31 T3). En cada par, el segundo tema enlaza al primero y no lo
  repite.
- **M26 va antes de M27** porque TLS (M27 T2) usa el cifrado asimétrico y la firma
  que se enseñan en M26 T3.
- **Contenedores:** desde M11 algunos laboratorios piden `docker compose up` (un servidor SSH
  local, PostgreSQL). El curso solo exige ejecutar esa orden; el porqué vive en el curso de Docker (decisión D8).
- **Niveles actuales que cambian:** el M1 T7 actual (Intermedio) queda en Aplicación; el M7 T7 actual
  (Intermedio) pasa a Integración junto con el M7 T6 actual. Los 101 temas sin nivel lo reciben del tramo donde quedan.

### 2.2 Equivalencias para los prerrequisitos que ya citan otros temarios

Los temarios aprobados o propuestos de otros cursos citan a Fundamentos con la numeración de hoy. Con este
temario, esas citas pasan a ser:

| Cita actual | Quién la usa | Módulos objetivo |
|---|---|---|
| Fundamentos M2 (estructuras de datos: hash y árboles) | Blockchain | M14 y M37 |
| Fundamentos M3 T1–T2 (red, DNS, IP, puertos y HTTP) | Docker, Kubernetes, Diseño de sistemas, Microservicios | M8, M18, M25 y M28 |
| Fundamentos M4 (SQL) | Docker, Diseño de sistemas, Microservicios, Spring | M16, M17 y M29 |
| Fundamentos M6 (seguridad y privacidad) | IA aplicada, Blockchain | M26 y M31 |
| Fundamentos M7 T6–T7 (agentes de IA) | IA aplicada | M36 T1–T2 |
| Fundamentos M8 T1–T3 (sistema operativo, memoria y Linux observable) | Docker, Kubernetes | M22 y M23 |
| Fundamentos M8 T4 (contenedores) | Docker (es su origen) | M23 T7, como resumen |
| Fundamentos M10 (sistemas distribuidos) y M10 T7 | Diseño de sistemas, Microservicios | M41 y M42 (M10 T7 es su T5) |
| «Fundamentos (terminal, Git)» | Gradle | M1, M6 y M7 |
| «El tema de Ley 1581 de Fundamentos» | Blockchain | No existe hoy: ninguna lección de Fundamentos menciona esa ley. Lo crea M26 T7 |

Al aprobar este temario hay que actualizar esas citas en `docs/temarios/` (no se tocan ahora).

### 2.3 Temas de las fuentes que se dejan fuera a propósito

| Tema que aparece en las fuentes | Dónde aparece | Propuesta |
|---|---|---|
| Programar en C: punteros y memoria manual | CS50 s1–s5, TLAP c4, CSAPP c3 y c9 | Fuera como lenguaje del curso. M22 y M23 muestran fragmentos de C para leerlos, no para escribirlos. Decisión D7 |
| Scratch | CS50 s0 | Fuera: el curso empieza en la terminal y en Python |
| Vim como editor principal | MS20 3 | Fuera; una nota en M11 T1 con lo mínimo para salir de `vi` en un servidor |
| Flask y frameworks web | CS50 s9 | Cursos Node y Spring. Aquí la API se escribe con la biblioteca estándar para ver HTTP sin magia |
| Puertas lógicas, diseño de procesadores y segmentación | CSAPP c4, OSSU (Nand to Tetris), CS2023 AR | Fuera; M23 T6 da la visión que un desarrollador necesita. La electrónica digital actual (M12 T4) sale con el resto de M12 |
| Cálculo y álgebra lineal | OSSU (matemáticas) | Curso Control |
| Aprendizaje automático, k vecinos más cercanos | GROK c12, OSSU, CS50 (sesión de IA) | Curso IA aplicada; aquí solo el mapa (M45 T4) |
| Administración de redes: cableado, conmutadores, armarios, enlaces WAN | YT-NET | Fuera: es oficio de redes, no de desarrollo |
| Administración de PostgreSQL: copias, replicación, alta disponibilidad, ajuste del servidor | PSQL c18–c31 | Cursos DevOps y Cloud. Aquí solo roles y permisos (M29 T7) |
| Producto GitHub más allá del flujo de trabajo: Pages, Packages, Codespaces, Sponsors, Classroom, aplicaciones | RM-GIT | Fuera. GitHub Actions a fondo vive en DevOps; aquí la primera canalización (M32 T6) |
| Motores concretos: MongoDB, Redis, Cassandra, Elasticsearch, Kafka, RabbitMQ | RM-BE | Cursos Node, Spring, Microservicios y Cloud. Aquí el criterio de elección (M30) |
| OAuth 2.0, OpenID Connect, SAML y JWT como implementación | RM-BE | Cursos Spring y Node. Aquí el concepto en la traza HTTP (M18 T4 y M26 T2) |
| Procesamiento por lotes y de flujos | DDIA c11–c13 | Curso Microservicios |
| Ordenamientos por dígitos, arreglos de sufijos, aplicaciones geométricas de árboles, pesos multiplicativos | ALG 5.1 y 6.3, 61B c36, COS226 13 y 21 | Fuera por ahora. Si el dueño aplica la regla 10 de forma estricta, forman un módulo «Algoritmos III» de 5 temas en Experto. Decisión D13 |
| Sistemas embebidos, señales y electrónica | CS2023 SPD y AR; M12 actual | Curso Control u optativo de IoT. Decisión D2 |

## 3. Temas transversales: qué llega a Fundamentos y qué sale

Regla 1 de la spec: un concepto, un curso dueño. Búsqueda hecha sobre el CSV (1.608 filas) con los términos HTTP,
Git, SQL, terminal, bash, shell, JSON, YAML, Linux, DNS, TCP, TLS, regex, OWASP, REST, CORS, cookie, WebSocket,
transacción, índice, hash, cifrado y depuración, y revisión de los módulos que salieron.

### 3.1 Lo que hoy vive en otros cursos y debe vivir aquí

**27 temas completos** pasan a tener a Fundamentos como dueño (la columna «Tema objetivo» usa la numeración
de la sección 2):

| Asunto | Temas actuales en otro curso | Tema objetivo en Fundamentos | Qué queda en el curso de origen |
|---|---|---|---|
| Qué es un programa, un servidor y una API | Microservicios 0.1 T1–T3 (3) | M0 T1 objetivo y M8 T1 | Repaso de una página con enlace. Decisión D5 |
| Lógica de programación y pensamiento computacional | Microservicios 0.2 T1–T2 (2) | M2 T2–T3 | Repaso con enlace. Decisión D5 |
| Git, terminal, HTTP, JSON, YAML y variables de entorno | Microservicios 0.4 T1–T6 (6) | M6 T1, M1 T1–T2 y T6, M8 T4, M9 T2, T3 y T5 | Repaso con enlace. Decisión D5 |
| Qué es una terminal; IP, puertos, HTTP y API | Cloud M0 T1–T2 (2) | M1 T1, M8 T2 y M25 T5 | Enlace en la portada de Cloud |
| Linux y shell: archivos y permisos, procesos y señales, tuberías y filtros, scripts robustos, cron, redes, usuarios y `sudo` | DevOps M0 T1, T2, T3, T4, T5, T7 y T10 (7) | M1 T4–T5, M10 T2, T4 y T6, M11 T5, M25 T1 | DevOps M0 queda con cultura DevOps (T8), endurecimiento del servidor (T6), NGINX (T9) y systemd (T11). Decisión D6 |
| Git avanzado: flujos de ramas, rebase, bisect, hooks y firmas, monorepos, cherry-pick/stash/reset, reflog/worktree/submódulos | DevOps M1 T1–T7 (7) | M20 T1–T3, T6 y T7; M21 T2, T5 y T6 | DevOps conserva la estrategia de ramas ligada al despliegue como una nota con enlace. Decisión D6 |

**41 temas de otros cursos conservan su tema y ceden solo el concepto**: Fundamentos lo explica una vez y el
curso se queda con la API de su lenguaje o con la herramienta.

| Concepto que pasa a Fundamentos | Temas que hoy lo explican por su cuenta | Tema objetivo | Qué conserva el curso |
|---|---|---|---|
| Modelo petición-respuesta, cabeceras, códigos de estado y negociación de contenido | Node M3 T1, T3 y T4 | M8 T4–T6 y M18 T2 | El servidor con `node:http` |
| Diseño de API: paginación, límites, contrato y versionado | Node M3 T5; Spring Boot M2 T5 y T6; RutaFlow M2 T4 | M18 T7 | La implementación con cada framework |
| TCP, UDP y DNS; TLS y HTTP/2 | Node M3 T6 y T7 | M25 T2–T3, M27 T2 y M28 T4 | Los módulos `net`, `dgram`, `tls` y `http2` |
| Tiempo real: WebSocket | Node M4 T5; JavaScript M14 T10 | M27 T5 | La API de cada entorno |
| Hash de contraseñas, tokens, sesiones, cookies y CSRF | Node M6 T1, T2 y T5; Java M18 T2; JavaScript M14 T7 | M18 T3–T4 y M26 T2 | Las bibliotecas y su configuración |
| Cabeceras de seguridad y límites de tasa | Node M10 T1 y T2; JavaScript M6 T4 | M28 T6–T7 | El uso de la biblioteca |
| Inyección de SQL y XSS; OWASP; CVE y CWE | Node M10 T3, T4 y T5; Microservicios pista Node, M20 T5 (módulo 24 del CSV) | M31 T1 y T3, M29 T7 | El OWASP API Security Top 10 y `npm audit` |
| Mismo origen, CORS y CSRF | Spring Boot M5 T3 | M28 T3 | La configuración en Spring Security |
| Teoría de REST y de HTTP | Java M18 T1 | M18 T6 | `HttpClient` (ya lo dice el temario de Java) |
| ACID y aislamiento como concepto | Java M17 T2 | M29 T1–T2 | JDBC y las anomalías desde Java |
| Expresiones regulares y Unicode | Java M19 T2; JavaScript M14 T8 | M10 T3 y M5 T4 objetivo | `Pattern`/`Matcher` y las banderas de `RegExp` |
| Aserciones y diseño por contrato | Java M19 T4 | M12 T6 | `assert` de Java |
| Condiciones de carrera; bucle de eventos; pila y montón; intérprete y compilación en ejecución | Java M5 T4; JavaScript M5 T1, T4 y T5 | M24 T2 y T5, M22 T6, M43 T3 | El modelo propio de cada plataforma |
| Accesibilidad web | JavaScript M14 T4 | M19 T4 | Las API de accesibilidad desde JavaScript |
| SSH, cortafuegos, proxy inverso, registros del sistema y reconocimiento de puertos | DevOps M0 T6, T9 y T11; DevOps M11 T7 | M11 T4, M27 T1, T3 y T4, M23 T3 | Endurecimiento, NGINX, systemd y el laboratorio de reconocimiento |
| SQL frente a NoSQL | Cloud M4 T1 y M13 T1 | M30 T1 | DynamoDB y RDS |
| Entorno reproducible en Windows, macOS y Linux | RutaFlow M0 T2 | M1 T7 | El arranque del proyecto RutaFlow |

Además, tres asuntos que varios cursos usan sin que nadie los enseñe quedan con dueño: el versionado semántico
(Android M11, iOS M11 y KMP M10 lo aplican; M7 T6), `.gitignore` y los secretos fuera del repositorio
(M6 T5 y M26 T6) y la lectura de un plan de ejecución (M17 T6).

**No se muda nada hasta aprobar** este temario y, para Microservicios y DevOps, hasta que sus propios temarios
lo recojan (regla 2: nada se pierde).

### 3.2 Lo que sale de Fundamentos

| Qué hay hoy en Fundamentos | Temas actuales | Curso dueño propuesto | Qué queda en Fundamentos |
|---|---|---|---|
| Electrónica, sensores y control: circuitos, analógica y digital, microcontroladores, señales, DSP, instrumentación, PID, potencia, PCB, embebidos, PLC | M12 T1–T17 (17 temas) | **Control** u optativo de IoT (ya lo proponen `docs/auditoria/PROPUESTAS-TEMARIO.md` §3 y `docs/temarios/README.md`). Decisión D2 | Nada. La representación binaria y la visión de la CPU quedan en el M5 objetivo y en M23 T6 |
| Records de C# | M7 T5 (1 tema) | Rama `archivo`: la academia no tiene curso de C#. La idea se enlaza desde Java objetivo M9 T2. Decisión D9 | Nada |
| Contenedores: aislamiento reproducible | M8 T4 (1 tema) | **Docker** M0 T1–T3 (ya lo fija `docs/temarios/docker.md`) | Un resumen con enlace (M23 T7) |
| Proyecto integrador — sitio de seguimiento accesible | M3 T5 (1 tema) | No cambia de curso: deja de ser tema y pasa a ser el laboratorio de M19 | El contenido completo, como laboratorio |
| Integración continua más allá de la primera canalización | parte de M5 T4 | **DevOps** (M4 es el dueño de las canalizaciones) | La primera canalización que prueba y bloquea (M32 T6) |
| TLS dentro del tema de criptografía | parte de M6 T3 | No cambia de curso: pasa a M27 T2 | — |
| Estimación de capacidad y diseño de sistemas | M10 T7 | Se queda como introducción; **Diseño de sistemas** lo profundiza (ya lo dice su temario) | M42 T5 |

Se quedan, aunque podrían discutirse: HTML, CSS y accesibilidad (decisión D4), el catálogo de patrones (decisión
D3), los sistemas distribuidos (decisión D10) y los temas de agentes de IA (decisión D11).

Nada se pierde (regla 2): los 19 temas que dejan de ser temas de Fundamentos tienen su destino en el anexo A, y
el contenido se mueve solo cuando el dueño apruebe el temario del curso de destino.

### 3.3 La frontera con cada curso, en una línea

| Curso | Fundamentos enseña | El curso enseña |
|---|---|---|
| Java, JavaScript, Node, Spring | El concepto y su traza: HTTP, SQL, Git, concurrencia, pruebas, seguridad | La API, el framework y el modelo de ejecución propios |
| Gradle | Terminal y Git | El build |
| Docker y Kubernetes | Procesos, señales, sistema de archivos, redes y puertos | Aislamiento, imágenes y orquestación |
| DevOps | Shell, Git, la primera canalización, secretos como concepto | Servidores, canalizaciones, despliegue, observabilidad y herramientas de seguridad |
| Cloud | Redes, HTTP, modelos de datos | Los servicios, primero en Floci |
| Microservicios y Diseño de sistemas | La base de sistemas distribuidos y la estimación de capacidad | Los patrones, las tecnologías y los diseños completos |
| IA aplicada | Trabajo con agentes guiado por especificación y revisión de código generado | Modelos, RAG, evaluación y agentes a fondo |
| Control | Nada de electrónica | Electrónica, señales y control |

## 4. Proyecto guía y laboratorio por módulo

### 4.1 Proyecto guía: `rutaflow-bodega`

El inventario de una bodega de RutaFlow: un solo proyecto que crece módulo a módulo. Continúa el «inventario»
que ya recorre los proyectos 2, 4, 5, 8 y 10 del curso actual y lo sitúa en el dominio común de la academia
(envíos, rutas, bodegas), de modo que Java (`rutaflow-nucleo`) y Spring parten de un dominio conocido.

| Tramo | Qué es el proyecto al terminar el tramo |
|---|---|
| Fundamentos (M0–M9) | Programa de consola en Python que registra entradas y salidas de paquetes en un archivo, recibe argumentos y devuelve códigos de salida; exporta a CSV, JSON y YAML; vive en un repositorio de GitHub con README, `.gitignore`, ramas, un pull request y la etiqueta `v0.1.0` |
| Aplicación (M10–M19) | El mismo inventario con scripts de shell para el informe diario, `Makefile`, pruebas con cobertura, tres implementaciones en memoria medidas, datos en una base relacional con reportes en SQL, una API HTTP con contrato escrito y una página accesible |
| Integración (M20–M36) | Repositorio con flujo de revisión, hooks y canalización que bloquea la fusión; servidor con sockets propios detrás de un proxy inverso con TLS local; operaciones concurrentes sin carreras; transacciones con aislamiento demostrado; modelo de amenazas y los diez grupos del OWASP Top 10:2025 revisados; expediente de diseño con registros de decisión |
| Experto (M37–M45) | Índice propio con árbol balanceado y trie; planificador de entregas sobre un grafo; optimizador de carga; inventario replicado en tres procesos con mensajes duplicados y partición de red; mini-intérprete de reglas; informe de rendimiento con percentiles |

**Proyecto final (con rúbrica, formato único §3):** entregar `rutaflow-bodega` con (1) el repositorio con
historial limpio, pull requests revisados y la canalización en verde; (2) la API HTTP con su contrato y las
trazas `curl -v` que lo prueban; (3) el esquema SQL con sus migraciones, las consultas de reporte y dos planes
de ejecución explicados; (4) el modelo de amenazas y el informe de los diez grupos del OWASP Top 10:2025; (5)
un informe de rendimiento con objetivo en percentiles y una mejora demostrada; (6) el informe de un fallo
distribuido provocado y diagnosticado; y (7) un registro de decisiones.

### 4.2 Convenciones de los laboratorios

- Carpeta `examples/foundations/modulo-N/` con `README.md`, versiones fijadas y `verificar.sh`, que termina en
  `RESULTADO: OK` (formato único §3). Hoy esa carpeta no existe: los 11 «Proyecto N» del curso están dentro de
  las lecciones y se extraen a laboratorios en la Fase 5.
- Solo la biblioteca estándar de Python 3.14, bash, Git, `curl` y un cliente de SQL. Sin Gradle: el curso no
  usa la JVM.
- Énfasis propio del curso (spec 021 §3): del problema cotidiano a la abstracción; todo se prueba en la
  terminal del estudiante; cada concepto (HTTP, Git, SQL, redes) con una traza real que se lee línea a línea.
  Cada laboratorio guarda su traza real (`curl -v`, `git log --graph`, `EXPLAIN`, una captura de tráfico) junto
  al código.
- SQLite en M16; PostgreSQL en un contenedor desde M17 (decisión D8).
- Cada laboratorio parte del estado final del anterior; el README dice qué archivo cambia y por qué.
- Los laboratorios se verifican en el Mac del dueño (regla 9). Las instrucciones para Windows se dan con WSL
  y se marcan como contrastadas con la documentación, no ejecutadas (decisión D12).

### 4.3 Laboratorio por módulo

| Módulo | Tramo | Laboratorio (`examples/foundations/modulo-N/`) |
|---|---|---|
| M0 · El computador y tu entorno de trabajo | Fundamentos | Carpeta `primera-sesion`: instalar Python 3.14 y VS Code, ejecutar `saludo.py`, provocar un error, corregirlo y dejar un `README.md` con los comandos y su salida real |
| M1 · La terminal desde cero | Fundamentos | Recorrer y ordenar una carpeta desordenada de la bodega solo con la terminal; `verificar.sh` comprueba la estructura final y los permisos |
| M2 · Pensamiento computacional | Fundamentos | Cuaderno de problemas de la bodega: cada problema con su descomposición, su algoritmo en pseudocódigo, su prueba de escritorio y sus casos de prueba |
| M3 · Programar I: datos y control | Fundamentos | Calculadora de cupo de la bodega (peso, volumen y coste) desde una carpeta vacía; recoge el actual «Proyecto 1: calculadora de presupuesto» |
| M4 · Programar II: programas completos | Fundamentos | El inventario de la bodega como programa de consola: lee y guarda un archivo, recibe argumentos y devuelve códigos de salida correctos |
| M5 · Cómo representa el computador la información | Fundamentos | Inspector de bytes: un script que muestra en binario y hexadecimal un entero, un decimal, un texto con tildes y un archivo, y explica cada salida |
| M6 · Git I: el historial local | Fundamentos | Convertir la carpeta del inventario en un repositorio: primeros commits atómicos, `.gitignore`, un error deshecho de tres formas y el historial leído con `git log` |
| M7 · Git II: ramas, remotos y GitHub | Fundamentos | Publicar el inventario en GitHub: una rama por cambio, un conflicto provocado y resuelto, una clave SSH, un pull request propio y la etiqueta `v0.1.0` |
| M8 · Internet y la web desde cero | Fundamentos | Seguir una petición real a la API del inventario con `curl -v` y con la pestaña Red del navegador, y anotar cada línea de la traza |
| M9 · Datos con forma: texto plano, JSON y YAML | Fundamentos | El inventario exportado a CSV, JSON y YAML; un script valida los tres y detecta un archivo roto a propósito |
| M10 · El shell como lenguaje | Aplicación | Informe diario de la bodega: un script de bash que lee el registro de movimientos, filtra con `grep`, `sed` y `awk`, falla con el código correcto y pasa el analizador de scripts |
| M11 · Herramientas del oficio | Aplicación | Estación de trabajo reproducible: un `Makefile` con las tareas del proyecto, una sesión de depuración guardada paso a paso y una conexión SSH con clave a un contenedor local |
| M12 · Diseño de programas y código limpio | Aplicación | Rescate de un módulo heredado del inventario: renombrar, partir funciones, cambiar códigos de error por excepciones y añadir contratos, con las pruebas en verde en cada paso (recoge el «Proyecto 15») |
| M13 · Pruebas básicas | Aplicación | Batería de pruebas del inventario: casos por partición y por límite, un doble para el reloj y para el archivo, y un informe de cobertura leído con criterio |
| M14 · Estructuras de datos I: lineales y por clave | Aplicación | Tres implementaciones del inventario en memoria (arreglo, lista enlazada y tabla hash) medidas con el mismo banco de operaciones; recoge el «Proyecto 2» |
| M15 · Algoritmos I: buscar y ordenar | Aplicación | Buscador y ordenador de guías de envío: búsqueda binaria con su invariante, tres ordenamientos implementados y la comparación medida contra el de la biblioteca |
| M16 · SQL I: modelo relacional y consultas | Aplicación | El inventario pasa de JSON a una base relacional: esquema con restricciones, carga de datos y diez consultas con su salida esperada (recoge el «Proyecto 4» con SQLite) |
| M17 · SQL II: diseño y consultas avanzadas | Aplicación | Reportes de la bodega sobre PostgreSQL: esquema normalizado, consultas con CTE y funciones de ventana, y dos consultas lentas arregladas con un índice y su plan antes y después |
| M18 · HTTP a fondo I: semántica y diseño de API | Aplicación | Una API HTTP mínima para el inventario con la biblioteca estándar: recursos, códigos correctos, sesión por cookie y un contrato escrito que `curl` comprueba línea a línea |
| M19 · La web como plataforma: HTML, CSS y accesibilidad | Aplicación | Página de seguimiento de la bodega, accesible y adaptable, desde una carpeta vacía; recoge el «Proyecto 3» y el actual M3 T5 |
| M20 · Git III: colaboración profesional | Integración | Simulación de equipo sobre el repositorio del inventario: dos ramas en conflicto, un rebase interactivo, una regresión encontrada con `bisect` y un hook que rechaza un commit |
| M21 · Git IV: por dentro y a escala | Integración | Autopsia de un repositorio: leer objetos con las órdenes de fontanería, recuperar un commit «perdido» con `reflog` y limpiar un secreto subido por error |
| M22 · Sistemas operativos I: procesos y memoria | Integración | Laboratorio de procesos: crear procesos hijos, enviarles señales, agotar la memoria de un contenedor con límite y explicar cada observación con las herramientas del sistema |
| M23 · Sistemas operativos II: archivos, E/S y Linux observable | Integración | Diagnóstico a ciegas: tres programas con fallos (archivo que no se cierra, disco lleno, biblioteca que falta) que se resuelven solo observando el sistema; recoge el «Proyecto 8» |
| M24 · Concurrencia | Integración | Contador de existencias compartido: una condición de carrera reproducida mil veces, corregida con un cerrojo, con una cola de mensajes y con E/S asíncrona, y medida en cada versión |
| M25 · Redes I: de la aplicación al cable | Integración | Un servidor de eco y un servidor HTTP mínimo escritos con sockets, y la misma conversación capturada y leída capa por capa |
| M26 · Seguridad I: pensar como atacante y como defensor | Integración | Modelo de amenazas de la API del inventario: activos, fronteras de confianza, contraseñas bien guardadas, un secreto fuera del repositorio y el análisis de un correo de suplantación real |
| M27 · Redes II: diagnóstico e infraestructura | Integración | Avería de red por capas: cinco fallos provocados (DNS, puerto cerrado, certificado caducado, proxy mal configurado, cortafuegos) y su diagnóstico con herramientas de terminal |
| M28 · HTTP a fondo II: caché, conexiones y seguridad del protocolo | Integración | La API del inventario detrás de un proxy inverso: validadores y caché medidos, CORS roto y arreglado, y un cliente con reintentos que no duplica operaciones |
| M29 · SQL III: transacciones y PostgreSQL por dentro | Integración | Dos sesiones contra la misma base: cada anomalía de concurrencia provocada y evitada, un interbloqueo leído en el registro del servidor y una migración sin corte |
| M30 · Modelos y almacenamiento de datos más allá de lo relacional | Integración | El mismo catálogo de la bodega en tres modelos (relacional, documento y clave-valor), con una evolución de esquema que no rompe al lector antiguo |
| M31 · Seguridad II: el OWASP Top 10:2025 como concepto | Integración | Aplicación vulnerable a propósito: un fallo por cada grupo del Top 10:2025 reproducido contra la API del inventario, corregido y comprobado con una prueba |
| M32 · Pruebas y calidad avanzadas, e integración continua | Integración | El repositorio del inventario con una canalización que formatea, analiza, prueba y bloquea la fusión; incluye una prueba inestable cazada y una propiedad que encuentra un defecto (recoge el «Proyecto 5») |
| M33 · Requisitos, diseño y arquitectura | Integración | Expediente de diseño del inventario: requisitos verificables, atributos de calidad con números, tres diagramas y dos registros de decisión |
| M34 · Catálogo de patrones de diseño I | Integración | Núcleo de envíos con patrones (primera parte): cada patrón entra para quitar un problema medido del código, no por catálogo; recoge el «Proyecto 14» |
| M35 · Catálogo de patrones de diseño II | Integración | Núcleo de envíos con patrones (segunda parte): validación en cadena, deshacer una operación y un informe nuevo sin tocar las clases; termina con un patrón retirado porque sobraba |
| M36 · Desarrollo con asistentes y agentes de IA | Integración | Una función del inventario construida con un agente a partir de una especificación con criterios, verificada con pruebas propias y revisada como si la hubiera escrito otra persona |
| M37 · Estructuras de datos II: árboles y estructuras especializadas | Experto | Índice de guías de envío hecho a mano: un árbol de búsqueda que se desbalancea, su versión balanceada, una cola de prioridad para despachos y un trie para autocompletar, todos medidos |
| M38 · Grafos | Experto | Planificador de entregas de RutaFlow: red de bodegas como grafo, ruta más corta, orden de carga por dependencias y red mínima de enlaces (recoge el «Proyecto 13») |
| M39 · Técnicas de diseño de algoritmos | Experto | Optimizador de carga de camiones: el mismo problema resuelto con fuerza bruta, vuelta atrás, algoritmo codicioso y programación dinámica, con los tiempos y la calidad de cada solución |
| M40 · Matemáticas discretas y probabilidad para software | Experto | Cuaderno de propiedades y evidencia: invariantes demostrados, conteos comprobados por simulación y un informe de latencias con percentiles (recoge el «Proyecto 9») |
| M41 · Sistemas distribuidos I: red, réplicas y particiones | Experto | Inventario replicado en tres procesos: una partición de red provocada, lecturas viejas observadas y la decisión de consistencia escrita con sus consecuencias (primera parte del «Proyecto 10») |
| M42 · Sistemas distribuidos II: mensajes, acuerdo y operación | Experto | El inventario distribuido recibe mensajes duplicados y desordenados, elige un líder y se observa con métricas y trazas; termina con una estimación de capacidad (segunda parte del «Proyecto 10») |
| M43 · Cómo funciona un lenguaje de programación | Experto | Mini-intérprete de expresiones para las reglas de la bodega: analizador léxico, árbol de sintaxis y evaluador, con sus errores de sintaxis bien explicados |
| M44 · Rendimiento con evidencia | Experto | Informe de rendimiento del inventario: objetivo en percentiles, perfil antes y después, una mejora por algoritmo, otra por localidad de memoria y otra por E/S, cada una con su medición |
| M45 · Mapa de las ciencias de la computación y siguientes pasos | Experto | Proyecto final con rúbrica: `rutaflow-bodega` entregado completo, más un plan de estudio personal que elige los siguientes cursos de la academia con su justificación |

## 5. Decisiones que debe tomar el dueño

- **D1 · Tamaño.** Aprobar 298 temas en 46 módulos (hoy 105 en 16), unas 174 h más el proyecto.
  Es la versión extendida (regla 10). Quedaría por encima de Java (279 temas aprobados) y de Spring (281).
- **D2 · Electrónica (M12, 17 temas).** Confirmar que sale completa hacia Control o hacia un optativo de IoT, y
  cuál de los dos.
- **D3 · Catálogo de patrones (M14, 8 temas).** Propuesta: se queda en Fundamentos (M34 y
  M35), en Python y como catálogo neutral, porque el temario de Java ya está aprobado con 279
  temas y su M19 cubre los patrones «con Java moderno». Alternativa: mudarlo a Java o a Diseño de sistemas.
- **D4 · HTML, CSS y accesibilidad.** Propuesta: se quedan en Fundamentos (M19, 5 temas), porque ningún
  otro curso es su dueño y CS50 los incluye en su curso de entrada. Alternativa: abrir el curso de JavaScript con
  ellos.
- **D5 · Módulo 0 de Microservicios (11 temas).** Fundamentos pasa a ser el dueño de programa, servidor, API,
  lógica, Git, terminal, HTTP, JSON, YAML y variables de entorno. Propuesta: Microservicios los conserva como
  repaso corto con enlace (es el curso insignia y sus laboratorios ya están verificados). Alternativa: retirarlos
  de Microservicios.
- **D6 · DevOps M0 y M1 (14 temas).** Confirmar que Linux, shell y Git avanzado se mudan a Fundamentos y que
  DevOps empieza en cultura, servidores y canalizaciones.
- **D7 · Lenguaje del curso.** Propuesta: seguir con Python 3.14 más bash y SQL, que es lo que hoy usa el curso,
  y mostrar C solo para leerlo en los módulos de sistemas operativos. Alternativa: Java, por la prioridad de la
  academia; obligaría a reescribir los 86 temas que se conservan.
- **D8 · Versiones y contenedores.** Fijar en `docs/VERSIONES.md` las versiones de Git, bash, PostgreSQL y SQLite
  (hoy no están). Confirmar que desde M11 los laboratorios pueden pedir `docker compose up` antes de
  que el estudiante haga el curso de Docker (la misma decisión D7 del temario de Java).
- **D9 · Records de C# (M7 T5).** Confirmar que va a la rama `archivo`.
- **D10 · Sistemas distribuidos.** Propuesta: los 9 temas de M41 y M42 se
  quedan en Fundamentos como base de Microservicios y Diseño de sistemas, que ya los citan como prerrequisito.
  Alternativa: mudarlos a Diseño de sistemas.
- **D11 · Agentes de IA.** Propuesta: M36 (5 temas) se queda y crece; el temario de IA aplicada ya
  cuenta con que los M7 T6–T7 actuales sigan aquí.
- **D12 · Windows.** Propuesta: el curso se escribe y verifica en macOS y Linux, y Windows se cubre con WSL más
  una tabla de equivalencias de PowerShell (M1 T7). Alternativa: verificar también en PowerShell
  nativo, que duplica el trabajo de los módulos de terminal.
- **D13 · Algoritmos que quedan fuera.** Confirmar las exclusiones de la sección 2.3 o pedir el módulo «Algoritmos
  III» (5 temas más).
- **D14 · Temas de más de 45 min.** Los cinco temas del M6 actual tienen entre 2.676 y 3.629 palabras. Propuesta:
  se reparten entre M26, M31 y M27 sin perder contenido.
- **D15 · Proyecto guía.** Aprobar `rutaflow-bodega` o elegir otro dominio.
- **D16 · Renumeración.** El curso pasa de 16 a 46 módulos y todos cambian de número. El progreso de lectura
  guardado en el navegador se conserva solo si la Fase 5 migra las claves; hay que decidirlo antes de reescribir.

## 6. Fuentes consultadas

Consultadas el 2026-11-20. De cada una se tomó solo la lista de temas (hechos), nunca su texto. La columna
«Abrev.» es la que usa la tabla del temario.

### 6.1 Documentación y estándares oficiales

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| PG | [Pro Git, 2.ª ed. (git-scm.com)](https://git-scm.com/book/en/v2) | Capítulos 1–10 y apéndices A–C con sus secciones («c7.6» es la sección 7.6; «cA1» es el apéndice A) |
| MDN | [MDN · HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) | Títulos de las 19 guías, de la sección de seguridad y privacidad y de la referencia |
| RFC | [RFC 9110 · HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) | Índice: secciones 1–18 y su segundo nivel |
| PSQL | [Documentación de PostgreSQL («current»)](https://www.postgresql.org/docs/current/index.html) | Partes I–VIII y capítulos 1–70 («PSQL VI» es la parte de referencia) |
| BASH | [Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html) (edición 5.3) | Capítulos 1–10 y sus secciones |
| POSIX | [POSIX.1-2024 (Issue 8) · Shell Command Language](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html) | Secciones 2.1–2.9 del capítulo 2 (el resto llegó incompleto, ver 6.7) |
| OWASP | [OWASP Top 10:2025](https://owasp.org/Top10/2025/) | Las diez categorías A01–A10 |
| VER | `docs/VERSIONES.md` (repositorio) | Versiones fijadas de la academia |

### 6.2 Libros de referencia (índices)

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| CSAPP | Bryant y O'Hallaron, *Computer Systems: A Programmer's Perspective*, 3.ª ed. — [índice y prefacio](https://csapp.cs.cmu.edu/3e/pieces/preface3e.pdf) | Capítulos 1–12 y las secciones de los capítulos 1, 2 y 6–12 |
| TLAP | Spraul, *Think Like a Programmer* — [índice en No Starch](https://nostarch.com/thinklikeaprogrammer) | Capítulos 1–8 |
| GROK | Bhargava, *Grokking Algorithms*, 2.ª ed. — [índice en O'Reilly](https://www.oreilly.com/library/view/grokking-algorithms-second/9781633438538/) | Capítulos 1–13 y apéndices («cB» es el apéndice B) |
| ALG | Sedgewick y Wayne, *Algorithms*, 4.ª ed. — [sitio del libro](https://algs4.cs.princeton.edu/home/) | Capítulos 1–6 y sus secciones |
| KR | Kurose y Ross, *Computer Networking: A Top-Down Approach* (el sitio describe la 9.ª ed.) — [lecciones](https://gaia.cs.umass.edu/kurose_ross/lectures.php) y [portada](https://gaia.cs.umass.edu/kurose_ross/index.php) | Capítulos 1–8 (sin secciones, ver 6.7) |
| PP | Thomas y Hunt, *The Pragmatic Programmer*, edición del 20.º aniversario — [índice en Pragmatic Bookshelf](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/) | Los 9 capítulos y sus 53 temas («t19» es el tema 19, contado en el orden del índice) |
| DDIA | Kleppmann y Riccomini, *Designing Data-Intensive Applications*, 2.ª ed. — [índice en O'Reilly](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/) | Capítulos 1–14 |

### 6.3 Currículos de referencia

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| CS2023 | ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023* — [áreas de conocimiento](https://csed.acm.org/knowledge-areas/) y [área SDF (versión Gamma)](https://csed.acm.org/wp-content/uploads/2023/09/SDF-Version-Gamma.pdf) | Las 17 áreas con sus siglas y las 5 unidades de SDF con sus temas |
| CS50 | Harvard, [CS50x 2026](https://cs50.harvard.edu/x/) | Las semanas 0–10 («s7» es la semana 7) |
| CS50SQL | Harvard, [CS50's Introduction to Databases with SQL](https://cs50.harvard.edu/sql/) | Las semanas 0–6 |
| MS26 | MIT, [The Missing Semester of Your CS Education, edición 2026](https://missing.csail.mit.edu/) | Las 9 clases («MS26 5» es la clase 5) |
| MS20 | MIT, [The Missing Semester, edición 2020](https://missing.csail.mit.edu/2020/) | Las 11 clases |
| MS19 | MIT, The Missing Semester, temas especiales de 2019 (listados en la [portada](https://missing.csail.mit.edu/)) | Los 6 títulos |
| OSSU | [Open Source Society University · Computer Science](https://github.com/ossu/computer-science) | Secciones, cursos y temas de Intro CS, Core CS y Advanced CS |
| TYCS | [Teach Yourself Computer Science](https://teachyourselfcs.com/) | Las 9 materias con su libro y su curso |

### 6.4 Sílabos universitarios

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| MIT | MIT OpenCourseWare, [6.100L Introduction to CS and Programming using Python (otoño de 2022)](https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/pages/material-by-lecture/) | Títulos de las 26 clases («c15» es la clase 15) |
| 61B | UC Berkeley, [CS 61B Data Structures (primavera de 2025)](https://sp25.datastructur.es/) | Temas de las 40 clases |
| COS226 | Princeton, [COS 226 Algorithms and Data Structures (primavera de 2026)](https://www.cs.princeton.edu/courses/archive/spring26/cos226/lectures.php) | Temas de las 24 clases |
| UNAM | UNAM, Facultad de Ciencias, [Estructuras de Datos (clave 1222)](https://www.fciencias.unam.mx/sites/default/files/temario/1222.pdf) | Las 16 unidades (en números romanos) |
| ESPOL | ESPOL (Ecuador), [CCPG1006 Estructuras de Datos](https://www.fiec.espol.edu.ec/resources/syllabus/cienciascomputacionales/SPA-Syllabus-ESTRUCTURAS%20DE%20DATOS.pdf) | Los 7 capítulos |
| UTP | Universidad Tecnológica de Pereira (Colombia), [Algoritmia y Programación IM313](https://media2.utp.edu.co/programas/112/6285_Algoritmia%20y%20programacion%20IM313%20V2.pdf) | Las 6 unidades («u4» es la unidad 4) |

### 6.5 Cursos largos de YouTube y plataformas

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| YT-GIT | freeCodeCamp en español, curso de Git y GitHub desde cero de Estefania Cassingena Navone (más de 5 horas) — [artículo del curso](https://www.freecodecamp.org/espanol/news/aprende-git-y-github-curso-desde-cero/) | Los 7 bloques de temas |
| YT-SQL | freeCodeCamp en español, curso de SQL desde cero de Sergie Code — [artículo del curso](https://www.freecodecamp.org/espanol/news/aprende-sql-curso-desde-cero-en-espanol/) | La lista de temas (la página no dice la duración) |
| YT-NET | freeCodeCamp.org, curso de redes de computadores de Brian Ferrill (unas 9 horas) — [artículo del curso](https://www.freecodecamp.org/news/free-computer-networking-course/) | Los 6 bloques de temas |
| FCC-LNX | freeCodeCamp, [*Learn Linux for Beginners: From Basics to Advanced Techniques*](https://www.freecodecamp.org/news/learn-linux-for-beginners-book-basic-to-advanced/) | Las 8 partes y las secciones de la parte 8 («p8» es la parte 8) |
| — | freeCodeCamp.org, «Algorithms and Data Structures Tutorial – Full Course for Beginners» — [listado en Class Central](https://classcentral.com/classroom/freecodecamp-algorithms-and-data-structures-tutorial-full-course-for-beginners-57067) | Sus 3 capítulos; solo confirma el orden, por eso no se cita en las filas |

Los cursos en vídeo que se pudieron abrir terminan donde termina el tramo de Aplicación de este temario: Git
hasta el pull request, SQL hasta subconsultas y agrupación, redes como oficio de administración. Confirman el
orden de los dos primeros tramos, no el alcance de Integración y Experto, que sale de los libros, los sílabos y
la documentación oficial.

### 6.6 Rutas públicas y preguntas de entrevista

| Abrev. | Fuente | Qué se tomó |
|---|---|---|
| RM-CS | [roadmap.sh · Computer Science](https://roadmap.sh/computer-science) | Nombres de los 188 archivos de nodo de la ruta |
| RM-BE | [roadmap.sh · Backend](https://roadmap.sh/backend) | Nombres de los 156 archivos de nodo |
| RM-GIT | [roadmap.sh · Git and GitHub](https://roadmap.sh/git-github) | Nombres de los 155 archivos de nodo |
| RM-SQL | [roadmap.sh · SQL](https://roadmap.sh/sql) | Nombres de los 112 archivos de nodo |
| ENT | [roadmap.sh · preguntas de entrevista de backend](https://roadmap.sh/questions/backend) | Los 50 temas de pregunta por nivel (15 de principiante, 18 de intermedio y 17 de avanzado) |

Las cuatro páginas de ruta se abrieron, pero su contenido legible no trae los nodos. Los nombres de nodo se
tomaron del [repositorio público del proyecto](https://github.com/kamranahmedse/developer-roadmap) (carpeta
`content` de cada ruta, commit `e23da87` del 2026-11-19). Son nombres de archivo, así que un mismo nodo puede
contarse dos veces.

### 6.7 Fuentes que no se pudieron abrir o llegaron incompletas

| Fuente | Qué pasó | Cómo se cubrió |
|---|---|---|
| Páginas de roadmap.sh (las cuatro rutas) | Se abrieron sin los nodos, que se dibujan aparte | Nombres de nodo tomados del repositorio público (6.6) |
| *Structure and Interpretation of Computer Programs* | No se abrió su índice | La spec permite este libro o *Think Like a Programmer*; se usó el segundo. **Pendiente** si el dueño quiere contrastar también con SICP |
| *Grokking Algorithms* en manning.com | La página no trae el índice | Índice tomado de O'Reilly |
| Sitio de Kurose y Ross | Solo los títulos de los 8 capítulos, sin secciones | Las filas de redes citan capítulos enteros. **Pendiente:** contrastar las secciones antes de escribir M25 y M27 |
| Portada de CS:APP | No trae el índice | Índice tomado del PDF del prefacio |
| CS2023, página de áreas de conocimiento | Solo la lista de las 17 áreas | Unidades de SDF tomadas de su PDF. **Pendiente:** las unidades de AL, NC, OS, DM, SE, SEC y SF, que aquí se citan solo como área |
| POSIX, capítulo 2 | Contenido cortado tras la sección 2.9; los títulos de 2.10 y 2.13–2.15 solo se ven en enlaces y 2.11–2.12 no aparecen | Se citan 2.1–2.9 y 2.14; lo demás, por el manual de Bash |
| RFC 9110 y Bash Reference Manual | La lectura se cortó en los primeros 100.000 caracteres | Los índices quedaron completos; el cuerpo no se leyó |
| RFC de caché, HTTP/1.1, HTTP/2 y HTTP/3 | No se abrieron | Los temas de M28 citan MDN. **Pendiente** al escribirlos |
| Cursos de MoureDev de Git y GitHub y de SQL (YouTube, en español) | Las páginas de resumen encontradas no traen ni la lista de lecciones ni la duración | Se usaron los cursos en español de freeCodeCamp. **Pendiente:** revisar los capítulos de los vídeos a mano |
| Stanford CS106B | La portada no lista las clases | Se usaron Berkeley CS 61B y Princeton COS 226 |
| Curso de algoritmos de freeCodeCamp en Class Central | Solo 3 capítulos, sin duración | No se cita en las filas |
| Portada de OWASP (`owasp.org/Top10/`) | Redirige a la edición 2025 sin listar las categorías | Categorías tomadas de la página de la edición 2025 |

## Anexo A · Destino de los 105 temas actuales

Numeración de la columna «Tema actual»: la de hoy. Numeración de «Fundamentos objetivo»: la de la sección 2.

| Tema actual | Título | Palabras | Destino |
|---|---|---:|---|
| M0 T1 | Computador, sistema operativo, programa y proceso | 1.077 | Fundamentos objetivo: M0 T1, M0 T2 |
| M0 T2 | Del archivo fuente al programa en ejecución | 715 | Fundamentos objetivo: M0 T4, M23 T5, M43 T3 |
| M0 T3 | Archivos, carpetas y rutas sin perderse | 555 | Fundamentos objetivo: M0 T3 |
| M0 T4 | Cómo leer un comando antes de ejecutarlo | 497 | Fundamentos objetivo: M1 T1 |
| M0 T5 | Primer programa, primer error y primera evidencia | 589 | Fundamentos objetivo: M0 T6 |
| M0 T6 | VS Code, comandos y atajos comprobables | 519 | Fundamentos objetivo: M0 T5, M11 T1 |
| M1 T1 | Del problema al algoritmo y a los casos de prueba | 1.726 | Fundamentos objetivo: M2 T1, M13 T2 |
| M1 T2 | Variables, tipos, expresiones y cambios de estado | 1.384 | Fundamentos objetivo: M3 T1, M3 T2 |
| M1 T3 | Decisiones, repeticiones y trazado de ejecución | 1.303 | Fundamentos objetivo: M2 T4, M3 T3, M3 T4 |
| M1 T4 | Funciones y descomposición de problemas | 1.210 | Fundamentos objetivo: M3 T5 |
| M1 T5 | Cómo la computadora representa los datos — binario, texto y decimales | 838 | Fundamentos objetivo: M5 T1, M5 T3, M5 T4 |
| M1 T6 | Clases y objetos: atributos, métodos e `__init__` | 1.680 | Fundamentos objetivo: M4 T5 |
| M1 T7 | Herencia, composición y clases abstractas con `abc` | 1.874 | Fundamentos objetivo: M12 T1 |
| M2 T1 | Elegir estructuras según las operaciones | 1.300 | Fundamentos objetivo: M3 T6, M14 T1 |
| M2 T2 | Pilas, colas y abstracciones de comportamiento | 1.289 | Fundamentos objetivo: M14 T4 |
| M2 T3 | Búsqueda, precondiciones y demostración de corrección | 1.277 | Fundamentos objetivo: M12 T6, M15 T1, M40 T3 |
| M2 T4 | Complejidad, medición, ordenamiento y recursión | 1.403 | Fundamentos objetivo: M4 T4, M14 T7, M15 T5, M15 T7 |
| M2 T5 | Árboles y árboles binarios de búsqueda (BST) | 862 | Fundamentos objetivo: M37 T1 |
| M2 T6 | Tablas hash — búsqueda en tiempo constante | 696 | Fundamentos objetivo: M14 T5 |
| M2 T7 | Grafos y recorridos BFS/DFS | 761 | Fundamentos objetivo: M38 T1 |
| M2 T8 | Programación dinámica — resolver una vez, recordar el resultado | 990 | Fundamentos objetivo: M39 T2 |
| M3 T1 | De una URL al servidor: red, DNS, IP y puertos | 1.351 | Fundamentos objetivo: M8 T2, M8 T3, M25 T2 |
| M3 T2 | HTTP como contrato observable | 1.284 | Fundamentos objetivo: M8 T4, M8 T5, M8 T6, M18 T1, M28 T7 |
| M3 T3 | HTML semántico, formularios y el DOM | 1.300 | Fundamentos objetivo: M19 T1, M19 T2 |
| M3 T4 | CSS, layout responsive y accesibilidad verificable | 1.720 | Fundamentos objetivo: M19 T3, M19 T4 |
| M3 T5 | Proyecto integrador — sitio de seguimiento accesible | 628 | Deja de ser tema: pasa a ser el laboratorio del módulo «La web como plataforma» (el contenido se conserva) |
| M4 T1 | Del mundo real al modelo relacional | 1.507 | Fundamentos objetivo: M16 T1, M17 T1 |
| M4 T2 | SQL para definir, escribir, consultar y relacionar | 1.319 | Fundamentos objetivo: M16 T2, M16 T3, M16 T4, M16 T5, M16 T6 |
| M4 T3 | Índices, restricciones y planes de consulta | 1.397 | Fundamentos objetivo: M17 T5, M17 T6, M29 T4 |
| M4 T4 | Transacciones, concurrencia y elección SQL/NoSQL | 1.481 | Fundamentos objetivo: M29 T1, M29 T2, M30 T1 |
| M4 T5 | SQL avanzado: subconsultas, vistas, triggers y funciones de ventana | 1.153 | Fundamentos objetivo: M17 T2, M17 T3, M17 T4, M29 T5 |
| M4 T6 | Procedimientos almacenados, funciones y cursores con PL/pgSQL | 1.042 | Fundamentos objetivo: M29 T5 |
| M4 T7 | De SQL a Excel: reportes con tablas y fórmulas vivas | 1.042 | Fundamentos objetivo: M16 T7 |
| M5 T1 | Depurar con evidencia, no con cambios aleatorios | 1.314 | Fundamentos objetivo: M11 T2, M11 T3 |
| M5 T2 | Pruebas con propósito y niveles adecuados | 1.352 | Fundamentos objetivo: M13 T1, M13 T2, M13 T3, M13 T4, M13 T5, M13 T7 |
| M5 T3 | Git como historial de decisiones y colaboración | 1.286 | Fundamentos objetivo: M6 T1, M6 T3, M6 T4, M6 T7, M7 T1, M7 T2, M7 T3, M7 T5 |
| M5 T4 | Calidad estática, revisión e integración continua | 1.676 | Fundamentos objetivo: M12 T7, M20 T4, M32 T5, M32 T6 |
| M6 T1 | Activos, amenazas, riesgos y límites de confianza | 3.064 | Fundamentos objetivo: M26 T1, M26 T7 |
| M6 T2 | Identidad, contraseñas, sesiones y autorización | 2.676 | Fundamentos objetivo: M18 T4, M26 T2, M31 T6 |
| M6 T3 | Criptografía aplicada, TLS, claves y secretos | 2.943 | Fundamentos objetivo: M26 T3, M26 T6, M27 T2, M31 T6 |
| M6 T4 | Validación, vulnerabilidades web, privacidad y respuesta | 2.792 | Fundamentos objetivo: M26 T4, M26 T7, M29 T7, M31 T1, M31 T3 |
| M6 T5 | Ingeniería social, phishing y respuesta: analizar el correo, no solo mirarlo | 3.629 | Fundamentos objetivo: M26 T5 |
| M7 T1 | Requisitos, stakeholders y criterios verificables | 976 | Fundamentos objetivo: M33 T1 |
| M7 T2 | Arquitectura guiada por atributos de calidad | 895 | Fundamentos objetivo: M33 T2 |
| M7 T3 | Diseño modular, principios, patrones y refactoring | 1.136 | Fundamentos objetivo: M32 T7, M33 T3 |
| M7 T4 | Decisiones, documentación, deuda y evolución | 928 | Fundamentos objetivo: M33 T4 |
| M7 T5 | Records de C#: igualdad por valor no implica inmutabilidad profunda | 606 | Sale: rama `archivo` (la academia no tiene curso de C#). La idea —igualdad por valor no implica inmutabilidad profunda— se enlaza desde Java objetivo M9 T2. Decisión D9 |
| M7 T6 | Desarrollo guiado por especificación con agentes de IA | 1.198 | Fundamentos objetivo: M36 T1 |
| M7 T7 | Evaluar una skill de agente antes de usarla: validar, deduplicar y medir | 1.476 | Fundamentos objetivo: M36 T2 |
| M8 T1 | El sistema operativo como administrador y frontera | 974 | Fundamentos objetivo: M22 T1, M22 T2 |
| M8 T2 | Memoria y concurrencia sin magia | 1.091 | Fundamentos objetivo: M22 T5, M22 T6, M24 T1, M24 T2 |
| M8 T3 | Linux como entorno observable | 855 | Fundamentos objetivo: M23 T3 |
| M8 T4 | Contenedores: aislamiento reproducible | 1.108 | Fundamentos objetivo: M23 T7 |
| M8 T5 | Problemas clásicos de concurrencia: filósofos y lectores-escritores | 1.269 | Fundamentos objetivo: M24 T3, M24 T4 |
| M9 T1 | Lógica para especificar antes de programar | 1.148 | Fundamentos objetivo: M40 T1 |
| M9 T2 | Conjuntos, relaciones, funciones e inducción | 901 | Fundamentos objetivo: M40 T2, M40 T3 |
| M9 T3 | Conteo, grafos y estructuras conectadas | 994 | Fundamentos objetivo: M38 T1, M38 T2, M40 T4 |
| M9 T4 | Probabilidad y evidencia para decisiones técnicas | 1.720 | Fundamentos objetivo: M40 T5 |
| M10 T1 | La red convierte el resultado en una incertidumbre | 1.128 | Fundamentos objetivo: M41 T1 |
| M10 T2 | Replicación, consistencia y decisiones explícitas | 1.167 | Fundamentos objetivo: M41 T2, M41 T4 |
| M10 T3 | Mensajes que se procesan con efectos exactamente una vez | 1.262 | Fundamentos objetivo: M42 T1 |
| M10 T4 | Resiliencia y observabilidad orientadas a objetivos | 1.158 | Fundamentos objetivo: M42 T4 |
| M10 T5 | Tiempo, coordinación y acuerdo: Lamport, elección de líder y commit en dos fases | 1.520 | Fundamentos objetivo: M42 T2, M42 T3 |
| M10 T6 | Latencia y throughput: medir concurrencia sin confundirla con capacidad ilimitada | 736 | Fundamentos objetivo: M24 T7 |
| M10 T7 | Diseño de sistemas: de requisitos a estimación de capacidad y cuello de botella | 1.140 | Fundamentos objetivo: M42 T5 |
| M11 T1 | Sistemas, arquitectura y sistemas operativos | 996 | Fundamentos objetivo: M45 T1 |
| M11 T2 | Algoritmos, autómatas, lenguajes y compiladores | 1.004 | Fundamentos objetivo: M43 T1, M43 T3, M45 T2 |
| M11 T3 | Bases de datos, almacenes analíticos y minería de datos | 668 | Fundamentos objetivo: M30 T7, M45 T3 |
| M11 T4 | Inteligencia artificial, aprendizaje automático y visión | 994 | Fundamentos objetivo: M45 T4 |
| M11 T5 | Gráficos y cómputo científico | 959 | Fundamentos objetivo: M45 T5 |
| M11 T6 | Redes, seguridad, web e ingeniería profesional | 957 | Fundamentos objetivo: M45 T6 |
| M12 T1 | Matemáticas aplicadas: derivada, integral y modelos | 583 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T2 | Circuitos DC y AC: Kirchhoff, Thévenin y Norton | 605 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T3 | Electrónica analógica: diodos, transistores y amplificadores | 610 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T4 | Electrónica digital: lógica y máquinas de estados | 535 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T5 | Microcontroladores: GPIO, ADC, PWM e interrupciones | 586 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T6 | Comunicaciones: modulación y detección de errores | 542 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T7 | Señales y sistemas: muestreo, Fourier y convolución | 596 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T8 | DSP: filtros digitales y compresión | 582 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T9 | Instrumentación: calibración, DAQ e incertidumbre | 535 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T10 | Control automático: realimentación, PID y estabilidad | 574 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T11 | Potencia: conversión, eficiencia y disipación | 555 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T12 | PCB: esquemático, ERC, DRC y fabricación | 588 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T13 | Sistemas embebidos: RTOS, buses y firmware | 825 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T14 | Programación de bajo nivel: C, memoria y depuración | 541 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T15 | Electromagnetismo: Faraday y líneas de transmisión | 546 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T16 | Gestión profesional: requisitos, riesgos y evidencia | 556 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M12 T17 | PLC y control industrial: ciclo de scan e IEC 61131-3 | 1.419 | Sale: curso Control u optativo de IoT (propuesta de `docs/auditoria/PROPUESTAS-TEMARIO.md` §3). Decisión D2 |
| M13 T1 | Ordenamientos: insertion, merge y quick sort | 975 | Fundamentos objetivo: M15 T2, M15 T3, M15 T4 |
| M13 T2 | Algoritmos codiciosos y árbol de expansión mínima | 937 | Fundamentos objetivo: M38 T5, M39 T1 |
| M13 T3 | Caminos más cortos con Dijkstra | 868 | Fundamentos objetivo: M38 T3 |
| M13 T4 | Búsqueda en cadenas: de la fuerza bruta a KMP | 844 | Fundamentos objetivo: M39 T5 |
| M13 T5 | Problemas intratables: P, NP y heurísticas | 1.104 | Fundamentos objetivo: M39 T7 |
| M14 T1 | Decorator: agregar comportamiento sin heredar | 703 | Fundamentos objetivo: M34 T2 |
| M14 T2 | State: un objeto que cambia de comportamiento según su estado | 663 | Fundamentos objetivo: M34 T5 |
| M14 T3 | Template Method: un algoritmo fijo con pasos variables | 673 | Fundamentos objetivo: M34 T4 |
| M14 T4 | Chain of Responsibility: una cadena de validadores | 710 | Fundamentos objetivo: M35 T1 |
| M14 T5 | Mediator: coordinar objetos sin que se conozcan | 686 | Fundamentos objetivo: M35 T2 |
| M14 T6 | Memento: guardar y restaurar estado para deshacer | 624 | Fundamentos objetivo: M35 T3 |
| M14 T7 | Visitor: operaciones nuevas sin tocar las clases | 680 | Fundamentos objetivo: M35 T4 |
| M14 T8 | Flyweight: compartir estado para ahorrar memoria | 906 | Fundamentos objetivo: M34 T3 |
| M15 T1 | Nombres que revelan intención y funciones pequeñas | 959 | Fundamentos objetivo: M12 T2 |
| M15 T2 | Comentarios honestos y excepciones en lugar de códigos de error | 794 | Fundamentos objetivo: M12 T3 |
| M15 T3 | Objetos frente a estructuras de datos y la ley de Demeter | 754 | Fundamentos objetivo: M12 T4 |
| M15 T4 | Pruebas limpias: F.I.R.S.T. y un concepto por prueba | 910 | Fundamentos objetivo: M13 T6 |
