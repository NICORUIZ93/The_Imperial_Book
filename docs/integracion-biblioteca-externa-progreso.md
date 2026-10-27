# Integración de biblioteca externa y capturas — progreso

**Propósito de este documento:** registrar el avance de una tarea multi-sesión (puede continuar desde otra máquina) que consiste en:
1. Revisar las 71 imágenes de `~/Downloads` — **REVISIÓN VISUAL COMPLETA**; verificación técnica e integración parcial, con pendientes explícitos.
2. Revisar, libro por libro, la biblioteca técnica del disco externo `/Volumes/Nicolas/03_Libros_Biblioteca/` e integrar hallazgos relevantes al contenido de las lecciones — **EN PROGRESO**.

**Importante para retomar en otra máquina:** la biblioteca vive en un disco externo llamado **"Nicolas"**, montado en `/Volumes/Nicolas/`. Sin ese disco conectado, las rutas de esta sección no son accesibles — solo este documento (que sí vive en el repo) y los cambios ya aplicados a las lecciones.

---

## Fase 1 — Capturas: revisión visual completa, integración parcial

Revisión individual repetida el 2026-10-13: **71/71 archivos**, incluidos dos HEIC y duplicados. El registro anterior contenía errores de identificación y afirmaciones sin verificar; queda sustituido por el [informe completo, archivo por archivo](biblioteca/revision-imagenes-20261013.md) y el [manifiesto con SHA-256](biblioteca/imagenes.json).

Correcciones principales: IMG_1323 es Keycloak, IMG_0779 es un prompt pedagógico e IMG_1129 muestra Core Java. Se recuperaron recursos omitidos y se contrastaron errores de Maven, Docker, Java y VS Code con fuentes oficiales. Las versiones promocionales y capacidades de herramientas siguen pendientes de contraste. Strategy, Singleton y Observer continúan integrados en Java 12; además se agregaron laboratorios originales para JPA LAZY/EAGER, N+1, JDBC/transacciones, HTTP/seguridad, Spring Batch, scheduling, eventos, correo y caché. Los libros Core Java y Spring Boot del disco externo siguen pendientes de revisión capítulo por capítulo; estas lecciones no se presentan como cobertura completa de esos libros.

---

## Fase 2 — Biblioteca externa `/Volumes/Nicolas/03_Libros_Biblioteca/` (EN PROGRESO)

### Cómo retomar
1. Conectar el disco externo "Nicolas".
2. Verificar que monta en `/Volumes/Nicolas/` (`ls /Volumes/`).
3. Continuar la tabla de abajo en orden, marcando cada libro como 🔄 En progreso → ✅ Completo (o ⏭️ Descartado con motivo).
4. Cada hallazgo accionable se registra en la sección "Hallazgos por integrar" al final de este documento, con el archivo de lección exacto a modificar.
5. Tras cada sesión de trabajo, hacer commit de este documento actualizado (aunque los PDFs del disco externo no se puedan ni deban commitear al repo).

### Catálogo inicial de la sesión anterior

**La lista autoritativa de archivos es [la cola de 69 PDFs](biblioteca/cola.md).** La tabla histórica siguiente es parcial y contiene nombres abreviados; usa las rutas reales del catálogo JSON para abrir archivos. Total comprobado: 32.984 páginas. Una versión comprimida y otra original de Core Java I pueden ser el mismo contenido aunque sus huellas difieran.

**Carpeta: `Programacion/Arquitectura_Patrones_CleanCode/`**
| Libro | Track destino | Estado |
|---|---|---|
| Sumergete en los patrones de diseno - Alexander Shvets.pdf | Java (Clean Code/Patrones) | 🔄 Parcial: Singleton, Observer, Strategy, principios de diseño, Factory Method, Abstract Factory y Builder revisados por texto. Ver `biblioteca/shvets-patrones.md` |
| Programacion_Clean_Code_Manual_Avanzado.pdf | Todos (estándar de código) | 🔄 Portada e índice; capítulos pendientes. Ver `biblioteca/clean-code.md` |
| Introduccion al analisis y diseno de algoritmos - Baase Van Gelder 3ed.pdf | Foundations (algoritmos) | ⬜ Pendiente |

**Carpeta: `Programacion/Java/`**
| Libro | Track destino | Estado |
|---|---|---|
| Core Java Volume I - Fundamentals - 12th Edition.pdf | Java (Fundamentos) | ⬜ Pendiente |
| Core Java Volume II - Advanced Features - 13th Edition.pdf | Java (Avanzado) | ⬜ Pendiente |
| Sznajdleder - Java a fondo 5ed.pdf | Java (Fundamentos, en español) | ⬜ Pendiente |
| Java - Programacion, algoritmos y ejercicios resueltos.pdf | Java (práctica) | ⬜ Pendiente |
| 00165_diseño-en-java-los-23-modelos-de-diseño.pdf | Java (Patrones GoF) | ⬜ Pendiente |
| Programacion_Java_17_Guia_Intermedio.pdf | Java (versión moderna) | ⬜ Pendiente |
| Programacion_Java_Fondo_Edicion_8_Libro_Avanzado.pdf | Java (avanzado) | ⬜ Pendiente |
| java_el_cambio_es_la_unica_constante_2025.pdf | Java (actualidad 2025) | ⬜ Pendiente |

**Carpeta: `Programacion/Web_Frontend_Backend/`**
| Libro | Track destino | Estado |
|---|---|---|
| Spring_Boot_Backend_Arquitectura.pdf | Spring Boot | ⬜ Pendiente |
| Microservicios_Arquitectura_SOFTWARE.pdf | Spring Boot/DevOps | ⬜ Pendiente |
| Programacion_Angular_Framework_Libro_Avanzado.pdf | Angular | ⬜ Pendiente |
| NodeJS/Node.js.pdf | Node | ⬜ Pendiente |
| TypeScript - Curso practico - Carlos Serrano.pdf | React/Node (TypeScript) | ⬜ Pendiente |
| Ingenieria_de_Flutter.pdf | Flutter | ⬜ Pendiente |
| libro de programación javascrip.pdf | JavaScript | ⬜ Pendiente |
| Ruby_on_Rails_Framework.pdf | (sin track directo) | ⏭️ Baja prioridad |

**Carpeta: `Programacion/Mobile_IoT/`**
| Libro | Track destino | Estado |
|---|---|---|
| Programacion_Android_11_Movil_Guia_Intermedio.pdf | Android | ⬜ Pendiente |
| Programacion_Android_Things_IoT_Tutorial_Avanzado.pdf | Android (IoT) | ⬜ Pendiente |
| LIBRO BÁSICO DE ARDUINO.pdf | (sin track directo) | ⏭️ Baja prioridad |

**Carpeta: `Programacion/Docker/`**
| Libro | Track destino | Estado |
|---|---|---|
| Docker - Guia practica - Dogram Code.pdf | DevOps | ⬜ Pendiente |
| Programacion_Docker_Contenedores_Tutorial_Basico.pdf | DevOps | ⬜ Pendiente |

**Carpeta: `Programacion/Sistemas_Linux_DevOps/`**
| Libro | Track destino | Estado |
|---|---|---|
| Linux_manual_de_referencia_(6a.ed)_Petersen.pdf | DevOps (Linux) | ⬜ Pendiente |
| Programacion_Linux_Administracion_Tutorial_Avanzado.pdf | DevOps | ⬜ Pendiente |
| Sistemas Operativos Distribuidos Tanenbaum 1a Ed.pdf | Foundations (sistemas distribuidos) | ⬜ Pendiente |
| Programacion_Kali_Linux_Seguridad_Curso_Profesional.pdf | DevOps/Seguridad | ⏭️ Baja prioridad |

**Carpeta: `Programacion/Seguridad_Hacking/`**
| Libro | Track destino | Estado |
|---|---|---|
| Programacion_Hacking_Etico_Seguridad_Guia_Avanzado.pdf | DevOps/Spring Boot (seguridad transversal) | ⬜ Pendiente |
| El_Libro_Blanco_del_Hacker.pdf | (sin track directo) | ⏭️ Baja prioridad |
| Hacking Dispositivos IOS.pdf | iOS (seguridad) | ⏭️ Baja prioridad |

**Carpeta: `Programacion/Datos_IA_Machine_Learning/`** — sin track directo en The Imperial Book hoy (no hay track de IA/ML) → ⏭️ Descartado por ahora.

**Carpeta: `Programacion/Python/`, `R_Matlab_Estadistica/`, `CPP_C_Ensamblador/`, `Otros_Lenguajes/`** — sin track directo (The Imperial Book no tiene tracks de Python/C++/R) → ⏭️ Descartado por ahora, salvo que se use para enriquecer Foundations con ejemplos de algoritmos.

**Carpeta: `Bases_Datos/`** (relevante a Cloud/Spring Boot vía SQL)
| Libro | Track destino | Estado |
|---|---|---|
| BasesDatos_SQL_Basico_Tutorial_Basico.pdf | Foundations (SQL) | ⬜ Pendiente |
| BasesDatos_Oracle_SQL_Guia_Intermedio.pdf | Spring Boot/Cloud (SQL avanzado) | ⬜ Pendiente |
| BasesDatos_NoSQL_Introduccion_Manual_Basico.pdf | Cloud (DynamoDB y NoSQL en general) | ⬜ Pendiente |
| BasesDatos_Oracle_Forms_Reports_Manual_Avanzado.pdf | (sin track directo) | ⏭️ Baja prioridad |
| BasesDatos_SQL_Excel_Integracion_Guia_Intermedio.pdf | (sin track directo) | ⏭️ Baja prioridad |

**Carpeta: `Inteligencia_Artificial/`** — sin track directo en The Imperial Book hoy → ⏭️ Descartado por ahora.

**Carpeta: `Matematicas/Matematicas_Discretas/`**
| Libro | Track destino | Estado |
|---|---|---|
| Matematicas_Discretas_Combinatoria_Guia_Intermedio.pdf | Foundations (matemáticas/algoritmos) | ⬜ Pendiente |

### Orden de prioridad sugerido (por impacto directo en tracks existentes)
1. Sumergete en los patrones de diseño - Shvets (ya tenemos 3 patrones de las fotos; este libro puede dar más para completar el catálogo GoF)
2. Core Java Volume I y II (Horstmann) — fundamento del track Java
3. Spring_Boot_Backend_Arquitectura.pdf + Microservicios_Arquitectura_SOFTWARE.pdf
4. Programacion_Angular_Framework_Libro_Avanzado.pdf
5. Node.js.pdf + TypeScript - Curso practico
6. Ingenieria_de_Flutter.pdf
7. Programacion_Android_11_Movil_Guia_Intermedio.pdf
8. Docker (ambos) + Linux_manual_de_referencia
9. Introduccion al analisis y diseno de algoritmos - Baase (Foundations)
10. BasesDatos_SQL_Basico + Oracle_SQL (Foundations/Cloud)
11. Matematicas_Discretas_Combinatoria (Foundations)
12. Resto de libros de baja prioridad (sin track directo hoy)

---

## Hallazgos por integrar (se completa a medida que se revisan libros)

Ver [revisión de Shvets](biblioteca/shvets-patrones.md): capítulos, páginas, destinos y ejecuciones registradas. El resto de libros conserva su estado pendiente.

---

## Continuidad entre máquinas — actualización 2026-10-13

- Inventario verificable: [biblioteca/catalogo.json](biblioteca/catalogo.json), rutas relativas, SHA-256 y número de páginas. Catalogado no significa leído.
- Laboratorio integrado: `web/public/content/java/modulo-12.md`; código en `examples/java/patrones-rutaflow/`.
- Registro de lectura: [biblioteca/shvets-patrones.md](biblioteca/shvets-patrones.md).
- Revisión visual actualizada: 71/71 imágenes abiertas individualmente; ver el informe de imágenes. No equivale a integración completa.
- No declarar completada la biblioteca ni la plataforma a partir de un inventario o de validadores estructurales.

Para regenerar el inventario desde otra máquina, monta la biblioteca donde corresponda y usa esa ruta como `--root`:

```sh
python3 -m venv /tmp/floci-library-venv
/tmp/floci-library-venv/bin/pip install pymupdf
/tmp/floci-library-venv/bin/python scripts/catalog_external_library.py --root /ruta/a/03_Libros_Biblioteca
```

El catálogo no contiene libros ni extracción de páginas. Conserva las notas de lectura separadas para que regenerarlo no borre el avance. Una misma huella SHA-256 identifica copias idénticas; títulos iguales no bastan.

## Siguiente acción concreta

Continuar Shvets con Prototype y los patrones estructurales, confirmar sus páginas desde el índice PDF y contrastar con Java 12 antes de integrar. Abstract Factory (PDF 96–111) y Builder (PDF 112–132) se inspeccionaron por extracción textual y se reflejaron en Java 12; véase el registro para límites de esta revisión. Después continuar el orden libro por libro, con alcance de lectura explícito para cada fuente. La ausencia de un track dedicado no descarta automáticamente un libro: revisar primero su posible aporte a Foundations.

## Verificación del primer incremento

Tres programas Java ejecutados en modo normal (código 0) y con fallo deliberado (código 1); mensajes cotejados. El inventario es técnico: no equivale a lectura de los 69 libros. Los controles del repositorio no certifican por sí solos profundidad pedagógica.

## Recuperar este incremento en otra PC

Rama de continuidad: `codex/biblioteca-continuidad-20261013`. Con el repositorio clonado y el árbol de trabajo limpio:

```sh
git fetch origin
git switch --track origin/codex/biblioteca-continuidad-20261013
```

Si la rama ya existe localmente, usa `git switch codex/biblioteca-continuidad-20261013`. Abre este documento y `docs/biblioteca/cola.md`, conecta el disco y ajusta `--root`. Los PDFs permanecen en el disco externo. Esta rama contiene únicamente el incremento de biblioteca y Java; los cambios locales anteriores de interfaz y Flutter siguen en el área de trabajo original.

Validación: `./scripts/validate.sh` completada con código 0 tanto en el área original como en una copia aislada basada en `cbdf1ac`. El conteo estructural de metodología informa 478/935 temas completos; no se declara la academia al 100 %.
