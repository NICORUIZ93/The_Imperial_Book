# Biblioteca externa: índice de huecos por track

**Fecha:** 2026-10-28
**Fuente:** `/Volumes/Nicolas/03_Libros_Biblioteca` (Programación, Bases de datos, IA) y la carpeta de Drive compartida.
**Método:** se extrajo solo la tabla de contenidos de cada PDF (sin copiar páginas) con `scripts/extract_pdf_toc.py` y se cruzó con los temas de `web/public/content/<track>/*.md` y con búsqueda de palabras clave. No reemplaza la lectura humana.

## Estado por track

| Track | Informe | Libros | Resultado |
|---|---|---|---|
| java | [gaps-java](biblioteca-externa-gaps-java.md) | Core Java I/II, Java a fondo | 8 huecos (reflexión, regex, BigDecimal…) |
| foundations | [gaps-foundations](biblioteca-externa-gaps-foundations.md) | Baase, Shvets, SQL básico | **Huecos grandes**: algoritmos clásicos, 8 patrones GoF, SQL avanzado |
| android | [gaps-android](biblioteca-externa-gaps-android.md) | Android 11, Android Things | Faltan los componentes del sistema (Intents, Receivers, Services, localización) |
| spring-boot | [gaps-spring-boot](biblioteca-externa-gaps-spring-boot.md) | Spring Boot backend | Lombok, MapStruct, springdoc, `@Async` |
| flutter | [gaps-flutter](biblioteca-externa-gaps-flutter.md) | Ingeniería de Flutter | Flavors, lints, DI, shaders |
| devops | [gaps-devops](biblioteca-externa-gaps-devops.md) | Linux admin, Petersen, Docker x2 | Administración Linux clásica (systemd, usuarios, LVM) |
| node | [gaps-node](biblioteca-externa-gaps-node.md) | Node.js | Publicar paquetes npm, ESM/CJS, TDD, CWE/CVE |
| javascript | [gaps-javascript](biblioteca-externa-gaps-javascript.md) | Eloquent JavaScript (es) | Desestructuración, Symbol/iterables, canvas |
| angular | [gaps-angular](biblioteca-externa-gaps-angular.md) | El gran libro de Angular | Pipes puros/impuros, Angular Material |
| react, ios, kotlin-multiplatform, cloud, rutaflow | — | Sin libros específicos legibles en el disco | Sin cotejo |
| **sin track** | [tracks-nuevos](biblioteca-externa-gaps-tracks-nuevos.md) | Python (10), BD (5), Seguridad (4), IA (11) | Candidatos a tracks nuevos |

## Estado de avance (2026-10-28)
Todos los huecos de temas del top 10 están redactados en el contenido (ver la sección "Estado" de cada informe). Quedan abiertos: los **tracks nuevos** (Python, Bases de datos, Seguridad, IA), el **OCR** de los libros escaneados y la **verificación local** de los temas de Spring Boot, Flutter y Android, que no se pudieron ejecutar.

## Top 10 de huecos por impacto
1. ✅ **Algoritmos clásicos**: resuelto con Foundations, Módulo 13.
2. ✅ **Patrones GoF que faltan**: Decorator, State, Template Method, Chain of Responsibility, Mediator, Memento, Visitor y Flyweight. *Foundations.*
3. **Track de Python.** Es la colección más grande de la biblioteca y la academia no tiene track de Python.
4. ✅ **Componentes del sistema Android** (Intents implícitos, Foreground Service con localización, Broadcast Receivers). *Android.*
5. ✅ **Reflexión e introspección en Java.** *Java.*
6. ✅ **SQL avanzado**: subconsultas, vistas, procedimientos almacenados y triggers. *Foundations.*
7. ✅ **Lombok y MapStruct.** *Spring Boot.*
8. ✅ **Administración Linux**: systemd, journalctl, usuarios y firewall. *DevOps.*
9. ✅ **Publicar paquetes npm (públicos y privados).** *Node.*
10. ✅ **Flavors/entornos y lints en Flutter.** *Flutter.*

## Siguiente paso
Elegir qué huecos se redactan. Cada tema nuevo debe seguir `docs/PLANTILLA-LECCION.md` (7 pasos) y pasar `scripts/validate.sh` y las auditorías.
