# Sustancia de las lecciones

Detección de defectos verificables: repetición, cola de texto pegada y
andamiaje genérico. **No mide aprendizaje ni calidad**; una lección sin
defectos detectados tampoco acredita haber sido comprendida.

| Métrica | Valor |
|---|---:|
| Temas analizados | 1100 |
| Temas con algún defecto | 273 |
| Módulos con apéndices heredados | 183/245 |

## Defectos por tipo

| Código | Temas |
|---|---:|
| `andamiaje-generico` | 99 |
| `bloque-repetido` | 172 |
| `tema-breve` | 2 |

## Apéndices heredados más frecuentes

| Sección | Módulos |
|---|---:|
| ## Construcción guiada del capítulo | 41 |
| ## Ruta de proyecto progresivo desde carpeta vacía | 12 |
| **Errores comunes y soluciones** | 181 |

## Temas con más defectos

| Track / módulo | Tema | Palabras | Cola tras cierre | Códigos |
|---|---|---:|---:|---|
| cloud / 23 | Tema 3: Creación de clústeres y conexión con clientes estándar | 837 | 497 | andamiaje-generico |
| ios / 9 | Tema 1: XCTest clásico y Swift Testing | 859 | 484 | bloque-repetido |
| ios / 11 | Tema 1: Certificados y provisioning profiles | 841 | 479 | bloque-repetido |
| react / 8 | Tema 1: Queries por rol, no por clase CSS | 909 | 479 | bloque-repetido |
| flutter / 13 | Tema 1: Una API Dart puede terminar en una frontera nativa | 846 | 477 | bloque-repetido |
| cloud / 33 | Tema 2: Kubernetes administrado, ECS y Service Mesh | 836 | 473 | andamiaje-generico |
| ios / 11 | Tema 2: Archivar, subir y TestFlight | 826 | 472 | bloque-repetido |
| react / 10 | Tema 3: Streaming con Suspense en el servidor | 819 | 471 | bloque-repetido |
| react / 2 | Tema 2: useRef — valores mutables sin re-render | 873 | 469 | bloque-repetido |
| java / 7 | Tema 4: Unnamed variables y patterns (_, Java 22) | 1049 | 468 | bloque-repetido |
| cloud / 13 | Tema 3: Migrations | 860 | 467 | andamiaje-generico |
| flutter / 14 | Tema 2: Google Maps y localización en tiempo real | 776 | 466 | andamiaje-generico |
| ios / 7 | Tema 3: Combine vs async/await | 835 | 466 | bloque-repetido |
| java / 11 | Tema 4: Foreign Function & Memory API (Java 22) | 882 | 462 | bloque-repetido |
| java / 8 | Tema 2: Ciclo de vida de build y scopes | 891 | 457 | bloque-repetido |
| java / 0 | Tema 6: Operadores, precedencia y control de flujo | 927 | 454 | bloque-repetido |
| cloud / 32 | Tema 2: Una landing zone convierte gobierno en una base repetible | 805 | 453 | andamiaje-generico |
| java / 9 | Tema 1: JUnit 5 — anotaciones y ciclo de vida | 802 | 452 | bloque-repetido |
| java / 8 | Tema 1: pom.xml vs build.gradle.kts | 809 | 451 | bloque-repetido |
| ios / 10 | Tema 1: Instruments | 803 | 449 | bloque-repetido |
| ios / 9 | Tema 2: Testing de código async | 780 | 445 | bloque-repetido |
| cloud / 16 | Tema 2: Choice state, Retry y Catch | 895 | 438 | andamiaje-generico |
| ios / 7 | Tema 1: Publishers y Subscribers | 726 | 420 | bloque-repetido |
| ios / 5 | Tema 2: Errores tipados | 822 | 419 | bloque-repetido |
| ios / 8 | Tema 3: Cuándo MVVM no alcanza | 812 | 415 | bloque-repetido |
| cloud / 32 | Tema 3: Disponibilidad y recuperación responden preguntas distintas | 803 | 414 | andamiaje-generico |
| foundations / 11 | Tema 3: Bases de datos, almacenes analíticos y minería de datos | 693 | 412 | andamiaje-generico |
| java / 4 | Tema 4: Stream Gatherers (Java 24) | 819 | 408 | bloque-repetido |
| ios / 6 | Tema 1: @Model y ModelContainer | 748 | 403 | bloque-repetido |
| cloud / 32 | Tema 4: Un backup solo existe operativamente después de restaurarlo | 761 | 401 | andamiaje-generico |
| ios / 8 | Tema 2: Capas del proyecto e inyección por inicializador | 748 | 400 | bloque-repetido |
| flutter / 14 | Tema 1: Diseño de pantallas y Riverpod | 687 | 385 | andamiaje-generico |
| cloud / 34 | Tema 3: AWS CLI y SDK, Azure CLI y SDK, GCP CLI y SDK | 758 | 382 | andamiaje-generico |
| devops / 15 | Tema 6: DevSecOps y métricas DORA | 762 | 336 | andamiaje-generico |
| flutter / 14 | Tema 6: Dio y notificaciones push | 642 | 328 | andamiaje-generico |
| devops / 15 | Tema 3: Service Mesh con Istio o Linkerd | 765 | 311 | andamiaje-generico |
| flutter / 14 | Tema 5: Almacenamiento local, imágenes y offline | 619 | 309 | andamiaje-generico |
| flutter / 14 | Tema 4: Animaciones de localización | 574 | 274 | andamiaje-generico |
| rutaflow / 7 | Tema 4: Continuidad, costes y proyecto final | 1280 | 274 | andamiaje-generico |
| devops / 15 | Tema 5: Ansible, inventarios, roles y Vault | 685 | 273 | andamiaje-generico |

## Cómo se corrige

1. Se reescribe el bloque dentro del tema; no se añade texto al final.
2. Se elimina la segunda aparición de una sección, no se renombra.
3. Se borra el apéndice de módulo o se integra en el tema que lo necesita.
4. `--strict` compara contra `docs/lesson-substance-baseline.json`: ningún
   tema nuevo puede nacer con estos defectos.

Huella del contenido: `69ec0cbe511f8b5787c85082c46b3fc7957f76534dd61c3d3b6e3733ef989704`
