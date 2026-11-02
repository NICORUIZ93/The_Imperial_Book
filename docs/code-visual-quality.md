# Auditoría de código y visuales

Mide únicamente contenido dentro de cada tema. Las guías transversales no cuentan como código editorial ni como fuente oficial del tema.

Las fuentes se reconocen por host exacto en la prosa visible, no dentro del código. El reconocimiento no comprueba acceso, vigencia ni pertinencia. La revisión parcial del 2026-11-02 conserva los 378 temas originalmente sin reconocimiento y los resultados HTTP de 533 citas registradas en [el registro de fuentes por tema](./topic-source-review.json); todos mantienen revisión manual pendiente de pertinencia.

| Track | Temas | Código | Código comentado | Mermaid | Archify HTML | ASCII pendiente | Etiqueta engañosa | Ruta | Ejecución | Dominio oficial detectado |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| foundations | 100 | 100 | 94 | 71 | 6 | 0 | 0 | 99 | 100 | 100 |
| cloud | 156 | 156 | 124 | 80 | 4 | 18 | 0 | 150 | 156 | 156 |
| devops | 129 | 129 | 83 | 82 | 2 | 40 | 0 | 129 | 128 | 129 |
| javascript | 88 | 88 | 76 | 58 | 0 | 0 | 0 | 88 | 88 | 88 |
| node | 77 | 77 | 25 | 28 | 0 | 0 | 0 | 77 | 77 | 77 |
| angular | 71 | 71 | 69 | 30 | 0 | 20 | 0 | 71 | 70 | 71 |
| react | 58 | 58 | 42 | 37 | 0 | 9 | 0 | 58 | 58 | 58 |
| java | 98 | 98 | 55 | 40 | 3 | 0 | 0 | 98 | 98 | 98 |
| spring-boot | 91 | 91 | 77 | 55 | 4 | 17 | 0 | 91 | 91 | 91 |
| kotlin-multiplatform | 56 | 56 | 45 | 32 | 0 | 22 | 0 | 56 | 56 | 56 |
| android | 74 | 74 | 65 | 27 | 0 | 40 | 0 | 72 | 71 | 73 |
| ios | 56 | 56 | 40 | 34 | 0 | 16 | 0 | 55 | 56 | 56 |
| flutter | 63 | 63 | 50 | 53 | 0 | 14 | 0 | 63 | 63 | 63 |
| rutaflow | 29 | 29 | 27 | 26 | 0 | 0 | 0 | 28 | 27 | 29 |
| **Total** | **1146** | **1146** | **872** | **653** | **19** | **196** | **0** | **1135** | **1139** | **1145** |

## Regla editorial

Un bloque de código debe indicar archivo, explicar decisiones relevantes y poder ejecutarse. Un visual ASCII sigue siendo deuda hasta convertirse manualmente en Mermaid/SVG sin deformar la relación que representa. Un enlace Archify solo cuenta si el HTML local existe; el conteo no sustituye una revisión visual ni justifica diagramas decorativos.
