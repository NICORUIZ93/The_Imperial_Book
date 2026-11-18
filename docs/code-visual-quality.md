# Auditoría de código y visuales

Mide únicamente contenido dentro de cada tema. Las guías transversales no cuentan como código editorial ni como fuente oficial del tema.

Las fuentes se reconocen por host exacto en la prosa visible, no dentro del código. El reconocimiento no comprueba acceso, vigencia ni pertinencia. La revisión parcial del 2026-11-18 conserva los 366 temas originalmente sin reconocimiento y los resultados HTTP de 501 citas registradas en [el registro de fuentes por tema](./topic-source-review.json); todos mantienen revisión manual pendiente de pertinencia.

| Track | Temas | Código | Código comentado | Mermaid | Archify HTML | ASCII pendiente | Etiqueta engañosa | Ruta | Ejecución | Dominio oficial detectado |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| foundations | 102 | 102 | 96 | 73 | 6 | 0 | 0 | 101 | 102 | 102 |
| cloud | 168 | 168 | 144 | 86 | 4 | 18 | 0 | 161 | 168 | 166 |
| devops | 138 | 138 | 97 | 91 | 2 | 40 | 0 | 138 | 137 | 137 |
| javascript | 92 | 92 | 80 | 62 | 0 | 0 | 0 | 92 | 92 | 92 |
| node | 90 | 90 | 41 | 39 | 0 | 0 | 0 | 90 | 90 | 87 |
| angular | 78 | 78 | 76 | 37 | 0 | 20 | 0 | 78 | 74 | 78 |
| react | 64 | 64 | 53 | 43 | 0 | 9 | 0 | 64 | 64 | 64 |
| java | 117 | 117 | 61 | 24 | 1 | 0 | 0 | 117 | 117 | 112 |
| spring-boot | 121 | 121 | 48 | 44 | 1 | 0 | 0 | 121 | 121 | 120 |
| microservices | 24 | 24 | 6 | 1 | 0 | 0 | 0 | 24 | 23 | 24 |
| kotlin-multiplatform | 66 | 66 | 59 | 42 | 0 | 22 | 0 | 66 | 64 | 65 |
| android | 83 | 83 | 74 | 36 | 0 | 40 | 0 | 81 | 80 | 81 |
| ios | 69 | 69 | 55 | 47 | 0 | 16 | 0 | 68 | 69 | 68 |
| flutter | 119 | 119 | 80 | 95 | 0 | 14 | 0 | 116 | 114 | 112 |
| rutaflow | 29 | 29 | 27 | 26 | 0 | 0 | 0 | 28 | 27 | 29 |
| **Total** | **1360** | **1360** | **997** | **746** | **14** | **179** | **0** | **1345** | **1342** | **1337** |

## Regla editorial

Un bloque de código debe indicar archivo, explicar decisiones relevantes y poder ejecutarse. Un visual ASCII sigue siendo deuda hasta convertirse manualmente en Mermaid/SVG sin deformar la relación que representa. Un enlace Archify solo cuenta si el HTML local existe; el conteo no sustituye una revisión visual ni justifica diagramas decorativos.
