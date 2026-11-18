# Auditoría de metodología universal por tema

Un tema completo hace visibles los siete pasos y sus apoyos profesionales según 16 marcadores heurísticos. Este reporte detecta el formato legacy; otros formatos no se consideran incompletos por no usar encabezados de siete pasos. El resultado no demuestra calidad, aprendizaje ni ejecución de los ejemplos; la auditoría de criterios editoriales es independiente y usa otra rúbrica.

La academia combina el formato legacy de siete pasos con Aprende/Practica/Aplica y estructuras narrativas. Este detector busca los marcadores del primer formato; una ausencia indica que no se detectaron esos marcadores, no que el tema carezca de explicación o práctica. La migración se registra en [migration-status.json](./migration-status.json).

| Track | Temas | objective | prerequisites | context | theoryAnalogy | guidedDemo | codeExplanation | execution | expectedResult | deliberateFailure | guidedPractice | independentPractice | closure | commonErrors | resources | standaloneExample | Completos |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 83 | 82 | 83 | 82 | 82 | 76 | 83 | 83 | 83 | 83 | 81 | 82 | 81 | 82 | 83 | 76 | 74 |
| angular | 78 | 78 | 78 | 78 | 78 | 75 | 78 | 78 | 78 | 78 | 78 | 78 | 78 | 78 | 78 | 74 | 74 |
| cloud | 168 | 165 | 165 | 168 | 168 | 164 | 168 | 168 | 167 | 165 | 166 | 168 | 166 | 165 | 165 | 154 | 154 |
| control-1 | 70 | 0 | 0 | 0 | 0 | 0 | 70 | 70 | 70 | 0 | 0 | 0 | 0 | 17 | 70 | 0 | 0 |
| devops | 139 | 139 | 139 | 139 | 139 | 137 | 139 | 138 | 139 | 139 | 139 | 139 | 139 | 139 | 139 | 131 | 131 |
| flutter | 119 | 118 | 119 | 118 | 118 | 112 | 119 | 119 | 119 | 119 | 118 | 118 | 117 | 118 | 119 | 112 | 109 |
| foundations | 103 | 102 | 103 | 102 | 102 | 102 | 103 | 103 | 103 | 102 | 101 | 102 | 101 | 102 | 102 | 101 | 97 |
| ios | 69 | 69 | 69 | 69 | 69 | 67 | 69 | 69 | 69 | 69 | 69 | 69 | 69 | 69 | 69 | 68 | 67 |
| java | 117 | 29 | 52 | 29 | 19 | 14 | 117 | 116 | 117 | 117 | 17 | 19 | 20 | 29 | 59 | 22 | 9 |
| javascript | 92 | 91 | 92 | 91 | 91 | 89 | 92 | 92 | 92 | 92 | 91 | 91 | 91 | 92 | 92 | 88 | 87 |
| kotlin-multiplatform | 66 | 66 | 66 | 66 | 66 | 62 | 66 | 66 | 66 | 66 | 66 | 66 | 66 | 66 | 66 | 60 | 60 |
| microservices | 24 | 23 | 24 | 24 | 24 | 20 | 24 | 24 | 23 | 24 | 14 | 24 | 23 | 13 | 12 | 22 | 11 |
| node | 90 | 10 | 90 | 10 | 10 | 10 | 90 | 90 | 90 | 90 | 10 | 10 | 10 | 79 | 90 | 78 | 10 |
| react | 64 | 64 | 64 | 64 | 64 | 61 | 64 | 64 | 64 | 64 | 64 | 64 | 64 | 64 | 64 | 59 | 59 |
| rutaflow | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 |
| spring-boot | 121 | 8 | 47 | 8 | 8 | 1 | 121 | 117 | 121 | 121 | 8 | 8 | 8 | 13 | 43 | 13 | 1 |
| **Total** | **1432** | **1073** | **1220** | **1077** | **1067** | **1019** | **1432** | **1426** | **1430** | **1358** | **1051** | **1067** | **1062** | **1155** | **1280** | **1087** | **972** |

## Interpretación

- **Demostración** exige código comentado, archivo concreto, ejecución y salida observable.
- **Fallo deliberado** exige provocar un error y explicar su diagnóstico; mencionar errores no basta.
- **Ejemplo independiente** exige iniciar el tema en una carpeta vacía o proyecto nuevo; ninguna lección depende de un proyecto acumulativo.
- Un marcador ausente es una señal para revisar el tema en el formato que realmente utiliza; no prueba por sí solo que falte aprendizaje o práctica.
- Cada campo es una detección textual de marcadores; una revisión humana sigue siendo necesaria para confirmar que el paso enseña realmente el concepto.
