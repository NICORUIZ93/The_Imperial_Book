# Huecos del track Java frente a la biblioteca externa


## Estado (2026-10-28)
Resuelto con el nuevo **Módulo 19 «Java del día a día»**: reflexión y anotaciones, regex, BigDecimal, assertions, ServiceLoader, proxies dinámicos e i18n (7 temas, ejemplos ejecutados con JDK 21). Pendiente: serialización binaria (baja prioridad).

**Fecha:** 2026-10-28
**Método:** se extrajeron las tablas de contenido (outline de los PDF, sin copiar
páginas) de los libros de referencia del disco externo
(`/Volumes/Nicolas/03_Libros_Biblioteca/Programacion/Java/`) y se cruzaron con los
~60 temas actuales del track `java`. No sustituye revisión humana ni lectura completa.

## Libros cotejados
- **Core Java Volume I — Fundamentals, 12th ed.** (Horstmann) — 12 capítulos.
- **Core Java Volume II — Advanced Features, 13th ed.** (Horstmann) — 13 capítulos.
- **Java a fondo, 5ª ed.** (Sznajdleder) — 11 capítulos, en español.

## Veredicto general
El track Java ya es **moderno y amplio**: cubre virtual threads, records, sealed,
pattern matching, structured concurrency, scoped values, JFR y Foreign Function &
Memory API — temas que incluso las últimas ediciones de Core Java tratan como punta.
No está "vacío". Pero los tres libros coinciden en **temas tratados como capítulo propio
que en el track solo aparecen de refilón o faltan**.

## Huecos reales (coinciden en 2+ libros) — candidatos a tema nuevo

| Tema del libro | Dónde está en los libros | Estado en el track | Prioridad |
|---|---|---|---|
| **Reflexión e introspección** (Class, Method, Field, anotaciones en runtime) | Core Java I §5.9; Java a fondo cap. 6 | Solo de refilón en JPMS `opens` (M10) | **Alta** — es la base de los frameworks (Spring, Jackson, JUnit) |
| **Expresiones regulares** (`Pattern`, `Matcher`, grupos) | Core Java II §2.7 | Ausente | **Alta** — herramienta diaria |
| **Assertions** (`assert`, `-ea`, diseño por contrato) | Core Java I §7.4 | Ausente (logging sí está en M15) | Media |
| **BigInteger / BigDecimal** y aritmética exacta | Core Java I §3.9 | Ausente (crítico para dinero) | **Alta** — el track tiene contabilidad en RutaFlow |
| **ServiceLoader y arquitectura de plugins** | Core Java I §6.4 | Ausente | Media |
| **Dynamic proxies** (`java.lang.reflect.Proxy`) | Core Java I §6.5 | Ausente | Media (avanzado) |
| **Internacionalización** (Locale, formato número/fecha, collation, ResourceBundle) | Core Java II cap. 7 | `java.time` está en M0, pero i18n no | Media |
| **Serialización binaria nativa** y sus riesgos de seguridad | Core Java II §2.3; Java a fondo cap. 8 | Jackson JSON sí (M6); la binaria nativa solo en M14 T3 | Baja (ya cubierto en parte) |

## Deliberadamente fuera de alcance (no son huecos)
- **Swing / AWT / GUI** (Core Java I caps. 10-11, Core Java II caps. 10-12): el track es
  backend moderno; la UI se cubre en los tracks Angular/React/Flutter. Correcto omitirlo.
- **JNI clásico** (Core Java II cap. 13): sustituido por la FFM API, que el track ya trata (M11 T4).
- **XML processing** (Core Java II cap. 3): nicho; JSON (Jackson) ya cubre el caso moderno.
- **Networking con sockets crudos** (Java a fondo cap. 9): el track usa `HttpClient` (M18),
  que es el nivel correcto para backend actual.

## Propuesta de incorporación (si se aprueba)
Agrupar los huecos de prioridad alta/media en **un módulo nuevo "Java avanzado del día a día"**
o repartirlos en módulos existentes:
1. **Reflexión e introspección** → nuevo tema en M10 (JPMS/proyectos grandes) o módulo propio.
2. **Expresiones regulares** → nuevo tema en M0 o M2 (manejo de texto/datos).
3. **BigDecimal y aritmética exacta** → nuevo tema en M0 (tipos) — justificado por la contabilidad de RutaFlow.
4. **Assertions y diseño por contrato** → nuevo tema en M3 (excepciones) o M9 (testing).
5. **ServiceLoader / plugins** y **dynamic proxies** → temas en M10 o módulo de patrones (M12).
6. **Internacionalización** → tema en M6 (I/O) o módulo propio si se amplía.

Cada tema nuevo seguiría la plantilla de 7 pasos y pasaría las auditorías existentes.
