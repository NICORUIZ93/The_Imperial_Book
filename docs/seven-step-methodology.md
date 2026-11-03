# Auditoría de metodología universal por tema

Un tema completo hace visibles los siete pasos y sus apoyos profesionales según 16 marcadores heurísticos. Este reporte detecta el formato legacy; otros formatos no se consideran incompletos por no usar encabezados de siete pasos. El resultado no demuestra calidad, aprendizaje ni ejecución de los ejemplos; la auditoría de criterios editoriales es independiente y usa otra rúbrica.

La academia combina el formato legacy de siete pasos con Aprende/Practica/Aplica y estructuras narrativas. Este detector busca los marcadores del primer formato; una ausencia indica que no se detectaron esos marcadores, no que el tema carezca de explicación o práctica. La migración se registra en [migration-status.json](./migration-status.json).

| Track | Temas | objective | prerequisites | context | theoryAnalogy | guidedDemo | codeExplanation | execution | expectedResult | deliberateFailure | guidedPractice | independentPractice | closure | commonErrors | resources | standaloneExample | Completos |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 74 | 73 | 74 | 73 | 73 | 73 | 74 | 74 | 74 | 74 | 72 | 73 | 72 | 73 | 74 | 74 | 72 |
| angular | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 |
| cloud | 156 | 156 | 156 | 156 | 156 | 156 | 156 | 156 | 156 | 156 | 156 | 156 | 156 | 156 | 156 | 156 | 156 |
| devops | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 |
| flutter | 63 | 63 | 63 | 63 | 63 | 63 | 63 | 63 | 63 | 63 | 63 | 63 | 63 | 63 | 63 | 63 | 63 |
| foundations | 100 | 99 | 100 | 99 | 99 | 99 | 100 | 100 | 100 | 99 | 98 | 99 | 98 | 99 | 99 | 99 | 95 |
| ios | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 |
| java | 109 | 37 | 109 | 37 | 37 | 37 | 109 | 109 | 108 | 109 | 29 | 36 | 36 | 89 | 100 | 83 | 29 |
| javascript | 88 | 87 | 88 | 87 | 87 | 87 | 88 | 88 | 88 | 88 | 87 | 87 | 87 | 88 | 88 | 88 | 87 |
| kotlin-multiplatform | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 |
| node | 77 | 0 | 77 | 0 | 0 | 0 | 77 | 77 | 77 | 77 | 0 | 0 | 0 | 67 | 77 | 74 | 0 |
| react | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 |
| rutaflow | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 |
| spring-boot | 96 | 0 | 96 | 0 | 0 | 0 | 96 | 94 | 96 | 96 | 0 | 0 | 0 | 96 | 96 | 93 | 0 |
| **Total** | **1162** | **914** | **1162** | **914** | **914** | **914** | **1162** | **1160** | **1161** | **1161** | **904** | **913** | **911** | **1130** | **1152** | **1129** | **901** |

## Interpretación

- **Demostración** exige código comentado, archivo concreto, ejecución y salida observable.
- **Fallo deliberado** exige provocar un error y explicar su diagnóstico; mencionar errores no basta.
- **Ejemplo independiente** exige iniciar el tema en una carpeta vacía o proyecto nuevo; ninguna lección depende de un proyecto acumulativo.
- Un marcador ausente es una señal para revisar el tema en el formato que realmente utiliza; no prueba por sí solo que falte aprendizaje o práctica.
- Cada campo es una detección textual de marcadores; una revisión humana sigue siendo necesaria para confirmar que el paso enseña realmente el concepto.
