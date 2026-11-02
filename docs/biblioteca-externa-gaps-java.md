# Huecos del track Java frente a la biblioteca externa

## Estado (2026-11-01) — cruce actualizado con outlines reales

Se extrajeron las tablas de contenido reales (outline/bookmarks de los PDF con
PyMuPDF, sin copiar páginas) de los libros de referencia del disco externo
(`/Volumes/Nicolas/03_Libros_Biblioteca/Programacion/Java/`) y se cruzaron con
los 23 módulos / 96 temas actuales del track `java`. Reemplaza el cruce parcial
de 2026-10-28. No sustituye revisión humana ni lectura completa.

## Libros cotejados
- **Core Java Volume I — Fundamentals, 12th ed.** (Horstmann) — 12 capítulos.
- **Core Java Volume II — Advanced Features, 13th ed.** (Horstmann) — 13 capítulos.
- **Java a fondo, 5ª ed.** (Sznajdleder) — 11 capítulos, en español.

## Veredicto general
El track Java ya es **moderno y amplio**: cubre virtual threads, records, sealed,
pattern matching, structured concurrency, scoped values, Stream Gatherers, FFM y
JFR — temas que Core Java trata como punta. No está "vacío". Los tres libros, sin
embargo, coinciden en **capítulos propios ausentes o apenas mencionados** en el
track.

## Huecos reales (coinciden en 2+ libros) — candidatos a tema nuevo

| Tema del libro | Dónde en los libros | Estado en el track | Prioridad |
|---|---|---|---|
| **I/O de red: sockets TCP y UDP, servidor propio** | Java a fondo cap. 9; Core Java II §4.1-4.2 | Solo `HttpClient` (M18); sin sockets ni servidor | **Alta** |
| **Seguridad defensiva: hashing, firmas, cifrado, class loaders** | Core Java II §9 | M18 T2 toca tokens; falta `MessageDigest`/firmas/cifrado | **Alta** |
| **`ResultSet` scrollable/updatable, RowSet, metadata JDBC** | Core Java II §5.6-5.8 | M17 cubre JDBC/DAO/tx; falta lo anterior | Media |
| **Memory-mapped files y file locking** | Core Java II §2.5-2.6 | M6 cubre NIO.2 Path/Files; falta mmap y locking | Media |
| **Enum avanzado: cuerpos por constante, `EnumMap`/`EnumSet`** | Core Java I §5.7 | M22 T4 cubre enum de dominio; falta lo anterior | Media |
| **`Collections`: algoritmos, vistas inmutables/sincronizadas** | Core Java I §9.5-9.6 | M2 cubre colecciones; faltan `Collections.*` y vistas | Media |
| **Clases internas/anidadas no estáticas, locales y anónimas** | Core Java I §6.3 | M22 T5 toca `this$0`; falta el uso de inner/local/anónimas | Media |
| **JShell (REPL)** | Core Java I §2.4 | Ausente | Baja |
| **Scripting / Compiler API (`javax.tools`)** | Core Java II §8 | Ausente | Baja |
| **`java.util.logging` nativo y niveles** | Core Java I §7.5 | M15 usa SLF4J/Logback; el JUL nativo no se trata | Baja |

## Ya resueltos (confirmados en el track, no son huecos)
- Reflexión/anotaciones runtime → M19 T1.
- Regex (`Pattern`/`Matcher`) → M19 T2.
- BigDecimal / dinero exacto → M19 T3 y M0 T5.
- Assertions → M19 T4.
- ServiceLoader → M19 T5.
- Dynamic proxies → M19 T6.
- Internacionalización → M19 T7.
- Serialización JSON (Jackson) + binaria/riesgos → M6 T2 y M14 T3.
- Date & Time API → M0 T8.
- FFM (reemplaza JNI clásico) → M11 T4.

## Deliberadamente fuera de alcance (no son huecos)
- **Swing / AWT / Graphics** (Core Java I caps. 10-11, Core Java II caps. 10-12):
  el track es backend; la UI se cubre en Angular/React/Flutter.
- **XML processing** (Core Java II cap. 3): nicho; JSON (Jackson) cubre el caso moderno.
- **JNI clásico** (Core Java II cap. 13): sustituido por la FFM API (M11 T4).

## Propuesta de incorporación (prioridad alta)

1. **Red a bajo nivel (sockets TCP/UDP y servidor propio)** → tema nuevo en M18
   (HTTP/backend) o módulo propio. Justificado por el tracking en tiempo real de
   RutaFlow: entender sockets bajo el `HttpClient`.
2. **Seguridad defensiva (hashing, firmas, cifrado, class loaders)** → tema nuevo
   en M18. Encaja con el enfoque defensivo y autorizado del repositorio.

Prioridad media → temas dentro de módulos existentes (enum avanzado en M22, JDBC
avanzado en M17, mmap/locking en M6, algoritmos/vistas de `Collections` en M2,
inner classes en M22/M1). Prioridad baja → JShell, Compiler API, `java.util.logging`.

## Método
Los outlines identifican **candidatos** por cobertura temática; no prueban que el
track enseñe mal lo que sí tiene. Cada tema nuevo debe entrar con la puerta de
calidad completa (mapa de subtemas, explicación individual, evidencia ejecutada) y
revisión humana, sin aumentar la deuda del trinquete `audit_subtopic_depth`.
