# Java M0 — mapa de reconstrucción

**Estado:** diagnóstico curricular inicial más primer tema integrado. **Corte:** 2026-11-02. El Tema 0 está escrito en la aplicación y **alineado a JDK 27** (decisión del dueño: usar la versión más actual del mercado; se descartó la orientación inicial a JDK 21). Sus comandos macOS y el fallo deliberado de `PATH` se ejecutaron en Temurin 27.0.1; el tema quedó registrado como revisado en `docs/subtopic-depth-reviewed.json`. La secuencia definitiva de T1–T8 queda provisional hasta revisar prerrequisitos a lo largo del track Java.

## Criterios aplicados

Se tomó el contenido en `web/public/content/java/modulo-0.md`, no solo el manifiesto Angular. El recuento de subtemas cuenta filas etiquetadas en los mapas existentes; es un detector estructural, no una evaluación semántica completa. Cada nuevo tema deberá tener un único prerrequisito inmediato, entre 20 y 45 minutos —salvo instalación trivial—, título en infinitivo más objeto concreto, siete pasos completos, demo ejecutable con versión fijada y fallo deliberado diagnosticado. Los subtemas críticos requerirán explicación causal, ejemplo específico, evidencia observable, límite/error y práctica de transferencia según `AGENTS.md`.

## Trabajo ejecutado — 2026-11-02

Se añadió **M0 T0: Instalar Eclipse Temurin JDK 27 en macOS, Windows y Ubuntu** (15 minutos, excepción de instalación). Presenta los siete pasos, fija Temurin 27.0.1, explica JDK, versión/distribución, `PATH` y `JAVA_HOME`, incluye diagrama, comandos separados por plataforma (macOS con el cask genérico `temurin`, Ubuntu con `temurin-27-jdk`, Windows con el MSI 27.0.1), el archivo `~/java-lab/diagnostico-jdk.md`, salida esperada verificada y el fallo deliberado reproducible de `javac` fuera del `PATH`. M0 T1 declara M0 T0 como prerrequisito; los prerrequisitos de T2–T8 apuntan al tema inmediatamente anterior.

**Reconciliación de versión (2026-11-02):** la versión inicial de Manus fijó JDK 21 LTS, lo que contradecía el resto del track Java (cerrado en JDK 27 con evidencia ejecutada). Por decisión del dueño ("lo más actual del mercado") se corrigió todo M0 a **JDK 27**: instalación, prerrequisitos de T1–T8 y salidas esperadas. El contenido didáctico de compatibilidad de bytecode se reorientó a `major version 71` (Java 27) con `--release 25` (Java 25 LTS → 69) para enseñar compatibilidad hacia atrás.

**Verificación ejecutada (Temurin 27.0.1, macOS/JDK 27):** `java --version` → `openjdk 27.0.1.0.2`; `javac --version` → `javac 27.0.1.0.2`; `/usr/libexec/java_home -v 27` resuelve el JDK; `brew info --cask temurin` confirma que instala 27; el fallo deliberado de `PATH` (`javac: command not found`) se reprodujo; el bytecode del ejemplo `Saludo` muestra `major version: 71` y `--release 25` produce `69`. Los comandos de Windows y Ubuntu no se ejecutaron en este equipo (documentado). T0 registrado como revisado; trinquete `--max-pending 1143` en verde con 1149 temas totales.

## Inventario del módulo actual

| Orden actual | Título actual | Duración | Filas de subtemas | Prerrequisito registrado |
|---:|---|---:|---:|---|
| 0 | Instalar Eclipse Temurin JDK 27 en macOS, Windows y Ubuntu | 15 min | 3 conceptos críticos | Ninguno; tema de instalación |
| 1 | Del código fuente a la JVM | 35 min | 10 | M0 T0 |
| 2 | `public static void main` — qué significa cada palabra | 30 min | 9 | M0 T1 |
| 3 | JDK, JRE y JVM | 30 min | 8 | M0 T2 |
| 4 | Tipos primitivos vs referencias | 40 min | 7 | M0 T3 |
| 5 | Variables, conversiones y `String` | 45 min | 9 | M0 T4 |
| 6 | Operadores, precedencia y control de flujo | 45 min | 10 | M0 T5 |
| 7 | Arreglos, wrappers y paso de argumentos | 45 min | 8 | M0 T6 |
| 8 | Entrada, `java.time` y por qué evitar `Date`/`Calendar` | 50 min | 10 | M0 T7 |

## Hallazgos de dependencia y alcance

- El nuevo T0 empieza con la acción en infinitivo; los títulos heredados T1–T8 siguen pendientes de reescritura a título de acción.
- Los mapas de tema contienen entre 7 y 10 filas de subtemas. Cada tema supera el umbral de tres conceptos nuevos o críticos que activa una separación curricular. El tema 8, además, excede el máximo de 45 minutos.
- T1 sigue cargando demasiados objetivos y usa `main` sin que la explicación del contrato aparezca antes. La secuencia definitiva debe romper ese ciclo: instalar/distinguir el entorno, declarar el punto de entrada y después compilar y ejecutar.
- Se ajustaron los prerrequisitos visibles para formar la cadena M0 T0 → T1 → T2 → … → T8. Es una cadena editorial provisional; la dependencia técnica de cada tema debe confirmarse al dividir y reordenar el contenido.
- El tema 8 combina lectura de entrada, validación, tipos temporales, zonas, DST y migración de APIs mutables/deprecadas. Son objetivos y evidencias distintos; se separarán antes de redactar.
- Los conceptos de JIT pertenecen a una profundización de JVM; la decisión entre `javac` y build tools conecta mejor con el módulo 8; la comparación de excepciones de carga puede compartir una práctica diagnóstica solo si cada error mantiene explicación y transferencia propias. No se moverán hasta comprobar destinos, enlaces y progreso.

## Secuencia de trabajo propuesta (provisional)

1. Mantener T0 como instalación breve separada y reordenar la orientación curricular: distinguir JDK, JVM y runtime antes de depender de ellos.
2. Separar la declaración del punto de entrada de los detalles de argumentos y arreglos. Fijar explícitamente qué parte del contrato `main` se aprende aquí y qué parte requiere el futuro tema de arreglos.
3. Dividir el tema actual 1 en objetivos separados: compilar fuente a `.class`; inspeccionar bytecode/versión; configurar classpath y nombre binario; diagnosticar carga e incompatibilidad. Mover JIT a profundización y la elección de Maven/Gradle al módulo de build tools, sin duplicar ni perder su evidencia.
4. Mantener el orden de fundamentos de datos: tipos → variables/conversiones → operadores y control → arreglos, pero dividir los mapas que superan tres conceptos y comprobar las dependencias exactas de cada uno.
5. Separar entrada de consola, selección de tipos temporales, DST y migración desde `Date`/`Calendar` en sesiones independientes según resultados observables.
6. Conservar los IDs existentes T1–T8 y validar alias de fragmentos/progreso antes de reordenarlos; T0 es un tema añadido, no una renumeración. No borrar contenido en esta fase.

Esta lista no fija todavía títulos finales ni duraciones de los temas reconstruidos. El T0 ya está integrado como primer contenido; antes de declarar Java M0 completo se comprobarán las dependencias de Java M1–M3, el destino real de cada subtema, la ejecución de los ejemplos y la revisión humana.

## Fuentes técnicas verificadas para el bloque de compilación

- Oracle, [`javac` Java SE 27](https://docs.oracle.com/en/java/javase/27/docs/specs/man/javac.html): `--release`, `-d`, jerarquía de paquetes y classpath.
- Oracle, [JVMS Java SE 27, capítulo 4](https://docs.oracle.com/javase/specs/jvms/se27/html/jvms-4.html): formato `.class` y major version 71 de Java 27.
- Oracle, [lanzador `java` Java SE 27](https://docs.oracle.com/en/java/javase/27/docs/specs/man/java.html): arranque de JVM, clase principal y classpath.

Las fuentes respaldan el bloque técnico indicado, no la selección pedagógica completa del módulo. El escenario de RutaFlow se tratará como una simulación didáctica, no como un incidente real atribuido a una empresa.
