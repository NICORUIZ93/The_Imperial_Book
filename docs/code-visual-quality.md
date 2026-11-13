# Auditoría de código y visuales

Mide únicamente contenido dentro de cada tema. Las guías transversales no cuentan como código editorial ni como fuente oficial del tema.

Las fuentes se reconocen por host exacto en la prosa visible, no dentro del código. El reconocimiento no comprueba acceso, vigencia ni pertinencia. La revisión parcial del 2026-11-13 conserva los 366 temas originalmente sin reconocimiento y los resultados HTTP de 503 citas registradas en [el registro de fuentes por tema](./topic-source-review.json); todos mantienen revisión manual pendiente de pertinencia.

| Track | Temas | Código | Código comentado | Mermaid | Archify HTML | ASCII pendiente | Etiqueta engañosa | Ruta | Ejecución | Dominio oficial detectado |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| foundations | 100 | 100 | 94 | 71 | 6 | 0 | 0 | 99 | 100 | 100 |
| cloud | 156 | 156 | 118 | 74 | 4 | 18 | 0 | 150 | 156 | 154 |
| devops | 129 | 129 | 83 | 82 | 2 | 40 | 0 | 129 | 128 | 129 |
| javascript | 88 | 88 | 76 | 58 | 0 | 0 | 0 | 88 | 88 | 88 |
| node | 83 | 83 | 30 | 32 | 0 | 0 | 0 | 83 | 83 | 80 |
| angular | 71 | 71 | 69 | 30 | 0 | 20 | 0 | 71 | 70 | 71 |
| react | 58 | 58 | 42 | 37 | 0 | 9 | 0 | 58 | 58 | 58 |
| java | 111 | 97 | 43 | 18 | 1 | 0 | 0 | 111 | 111 | 106 |
| spring-boot | 113 | 113 | 40 | 36 | 1 | 0 | 0 | 113 | 113 | 112 |
| microservices | 23 | 23 | 5 | 0 | 0 | 0 | 0 | 23 | 22 | 23 |
| kotlin-multiplatform | 56 | 56 | 45 | 32 | 0 | 22 | 0 | 56 | 56 | 56 |
| android | 74 | 74 | 65 | 27 | 0 | 40 | 0 | 72 | 71 | 73 |
| ios | 56 | 56 | 40 | 34 | 0 | 16 | 0 | 55 | 56 | 56 |
| flutter | 106 | 106 | 61 | 82 | 0 | 14 | 0 | 103 | 103 | 99 |
| rutaflow | 29 | 29 | 27 | 26 | 0 | 0 | 0 | 28 | 27 | 29 |
| **Total** | **1253** | **1239** | **838** | **639** | **14** | **179** | **0** | **1239** | **1242** | **1234** |

## Regla editorial

Un bloque de código debe indicar archivo, explicar decisiones relevantes y poder ejecutarse. Un visual ASCII sigue siendo deuda hasta convertirse manualmente en Mermaid/SVG sin deformar la relación que representa. Un enlace Archify solo cuenta si el HTML local existe; el conteo no sustituye una revisión visual ni justifica diagramas decorativos.
