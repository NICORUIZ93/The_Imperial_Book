# Registro de revisión pedagógica humana

Este registro separa la **pre-lectura asistida por agente** de la **firma de una
persona revisora**. Ninguna fila con «firma humana pendiente» cuenta como tema
revisado; el estado global sigue en 0/1100 temas con revisión humana firmada.

## Método

- Muestra: un tema por track (14 temas), el primero del módulo 0.
- La pre-lectura comprueba estructura de siete pasos, profundidad en palabras,
  presencia de fuente oficial y de diagrama, y coherencia del archivo indicado.
- No se ejecutaron los ejemplos en esta pre-lectura; la ejecución de ejemplos es
  una evidencia distinta y no se infiere de la lectura.
- Una persona debe leer el tema, ejecutar al menos el comando principal y firmar
  el resultado antes de cambiar el estado a «revisado».

## Registro

| Fecha | Track | Módulo | Tema | Revisor | Resultado | Evidencia | Acción |
|---|---|---|---|---|---|---|---|
| 2026-10-31 | android | 0 | Tema 1: Estructura de un proyecto Android Studio | Pre-lectura IA (firma humana pendiente) | Estructura completa; 1122 palabras; fuente oficial presente; 1 diagrama Mermaid | web/public/content/android/modulo-0.md:26; 7 pasos; developer.android.com | Firma humana pendiente; no se ejecutó el proyecto Android |
| 2026-10-31 | angular | 0 | Tema 1: El CLI ya no genera NgModules | Pre-lectura IA (firma humana pendiente) | Estructura completa; 1407 palabras; fuente oficial presente; 1 diagrama Mermaid | web/public/content/angular/modulo-0.md:41; 7 pasos; angular.dev | Firma humana pendiente; no se ejecutó el CLI |
| 2026-10-31 | cloud | 0 | Tema 1: Fundamentos absolutos — qué es una terminal, un comando y un sistema operativo | Pre-lectura IA (firma humana pendiente) | Estructura completa; 800 palabras; fuente oficial presente; 1 diagrama Mermaid | web/public/content/cloud/modulo-0.md:29; 7 pasos; docs.docker.com | Firma humana pendiente; no se ejecutaron los comandos |
| 2026-10-31 | devops | 0 | Tema 1: Sistema de archivos y permisos (chmod/chown) | Pre-lectura IA (firma humana pendiente) | Estructura completa; 1006 palabras; fuente oficial presente; 1 diagrama Mermaid | web/public/content/devops/modulo-0.md:33; 7 pasos; gnu.org coreutils | Firma humana pendiente; no se ejecutaron los comandos |
| 2026-10-31 | flutter | 0 | Tema 1: Sound null safety | Pre-lectura IA (firma humana pendiente) | Estructura completa; 1102 palabras; fuente oficial presente; 1 diagrama Mermaid | web/public/content/flutter/modulo-0.md:27; 7 pasos; docs.flutter.dev | Firma humana pendiente; no se ejecutó el proyecto Flutter |
| 2026-10-31 | foundations | 0 | Tema 1: Del hardware al programa en ejecución | Pre-lectura IA (firma humana pendiente) | Estructura completa; 752 palabras; fuente oficial presente; sin diagrama Mermaid | web/public/content/foundations/modulo-0.md:30; 7 pasos; docs.python.org | Firma humana; decidir si el tema requiere diagrama antes de firmar |
| 2026-10-31 | ios | 0 | Tema 1: Optionals y unwrapping seguro | Pre-lectura IA (firma humana pendiente) | Estructura completa; 1137 palabras; fuente oficial presente; 1 diagrama Mermaid | web/public/content/ios/modulo-0.md:24; 7 pasos; docs.swift.org | Firma humana pendiente; no se ejecutó en Xcode |
| 2026-10-31 | java | 0 | Tema 1: Del código fuente a la JVM | Pre-lectura IA (firma humana pendiente) | Estructura completa; 996 palabras; fuente oficial presente; sin diagrama Mermaid | web/public/content/java/modulo-0.md:30; 7 pasos; docs.oracle.com | Firma humana; decidir si el tema requiere diagrama antes de firmar |
| 2026-10-31 | javascript | 0 | Tema 1: Variables — `const`, `let` y `var` | Pre-lectura IA (firma humana pendiente) | Estructura completa; 618 palabras; fuente oficial presente; 1 diagrama Mermaid | web/public/content/javascript/modulo-0.md:36; 7 pasos; MDN | Firma humana pendiente; profundidad básica-adecuada |
| 2026-10-31 | kotlin-multiplatform | 0 | Tema 1: Null safety real | Pre-lectura IA (firma humana pendiente) | Estructura completa; 1115 palabras; fuente oficial presente; 1 diagrama Mermaid | web/public/content/kotlin-multiplatform/modulo-0.md:28; 7 pasos; kotlinlang.org | Firma humana pendiente; no se ejecutó el proyecto KMP |
| 2026-10-31 | node | 0 | Tema 1: Node no es "JavaScript en el servidor" sin más | Pre-lectura IA (firma humana pendiente) | Estructura completa; 1392 palabras; fuente oficial presente; 1 diagrama Mermaid | web/public/content/node/modulo-0.md:25; 7 pasos; nodejs.org | Firma humana pendiente; no se ejecutó Node |
| 2026-10-31 | react | 0 | Tema 1: JSX es azúcar sintáctica sobre createElement | Pre-lectura IA (firma humana pendiente) | Estructura completa; 1012 palabras; fuentes oficiales presentes; 1 diagrama Mermaid | web/public/content/react/modulo-0.md:29; 7 pasos; react.dev y vite.dev | Firma humana pendiente; `http://localhost:5173` es URL de ejecución, no fuente |
| 2026-10-31 | rutaflow | 0 | Tema 1: El proceso logístico como sistema | Pre-lectura IA (firma humana pendiente) | Estructura completa; 972 palabras; fuente oficial presente; 1 diagrama Mermaid | web/public/content/rutaflow/modulo-0.md:24; 7 pasos; martinfowler.com | Firma humana pendiente; no se ejecutó el dominio |
| 2026-10-31 | spring-boot | 0 | Tema 1: Inversión de control y el contenedor de Spring | Pre-lectura IA (firma humana pendiente) | Estructura completa; 1121 palabras; fuentes oficiales presentes; sin diagrama Mermaid | web/public/content/spring-boot/modulo-0.md:29; 7 pasos; start.spring.io y docs.spring.io | Firma humana; decidir si el tema requiere diagrama antes de firmar |

## Estado global

- Temas con revisión humana firmada: **0/1100**.
- Temas con pre-lectura registrada: **14/1100**.
- La pre-lectura no acredita ejecución, comprensión ni calidad pedagógica.
- Siguiente paso: una persona revisora confirma o corrige cada fila, ejecuta el
  comando principal y cambia «Pre-lectura IA (firma humana pendiente)» por su
  nombre y el veredicto.
