# Auditoría de código y visuales

Mide únicamente contenido dentro de cada tema. Las guías transversales no cuentan como código editorial ni como fuente oficial del tema.

Las fuentes se reconocen por host exacto en la prosa visible, no dentro del código. El reconocimiento no comprueba acceso, vigencia ni pertinencia. La revisión parcial del 2026-10-31 conserva los 378 temas originalmente sin reconocimiento y los resultados HTTP de 175 citas registradas en [el registro de fuentes por tema](./topic-source-review.json); todos mantienen revisión manual pendiente de pertinencia.

| Track | Temas | Código | Código comentado | Mermaid | Archify HTML | ASCII pendiente | Etiqueta engañosa | Ruta | Ejecución | Dominio oficial detectado |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| foundations | 99 | 99 | 93 | 70 | 6 | 0 | 0 | 98 | 99 | 61 |
| cloud | 156 | 156 | 124 | 80 | 4 | 18 | 0 | 156 | 156 | 147 |
| devops | 113 | 113 | 67 | 66 | 1 | 40 | 0 | 113 | 112 | 61 |
| javascript | 88 | 88 | 76 | 58 | 0 | 0 | 0 | 88 | 88 | 77 |
| node | 77 | 77 | 43 | 24 | 0 | 12 | 0 | 77 | 77 | 57 |
| angular | 71 | 71 | 69 | 30 | 0 | 20 | 0 | 71 | 70 | 60 |
| react | 58 | 58 | 42 | 37 | 0 | 9 | 0 | 58 | 58 | 39 |
| java | 85 | 85 | 58 | 25 | 3 | 0 | 0 | 85 | 85 | 76 |
| spring-boot | 91 | 91 | 77 | 48 | 4 | 20 | 0 | 91 | 91 | 67 |
| kotlin-multiplatform | 56 | 56 | 45 | 32 | 0 | 22 | 0 | 56 | 56 | 44 |
| android | 58 | 58 | 53 | 15 | 0 | 40 | 0 | 57 | 57 | 55 |
| ios | 56 | 56 | 38 | 30 | 0 | 16 | 0 | 56 | 56 | 56 |
| flutter | 63 | 63 | 48 | 51 | 0 | 14 | 0 | 63 | 63 | 55 |
| rutaflow | 29 | 29 | 27 | 26 | 0 | 0 | 0 | 28 | 27 | 14 |
| **Total** | **1100** | **1100** | **860** | **592** | **18** | **211** | **0** | **1097** | **1095** | **869** |

## Regla editorial

Un bloque de código debe indicar archivo, explicar decisiones relevantes y poder ejecutarse. Un visual ASCII sigue siendo deuda hasta convertirse manualmente en Mermaid/SVG sin deformar la relación que representa. Un enlace Archify solo cuenta si el HTML local existe; el conteo no sustituye una revisión visual ni justifica diagramas decorativos.
