# Auditoría de metodología universal por tema

Un tema completo hace visibles los siete pasos y sus apoyos profesionales según 16 marcadores heurísticos. Este reporte detecta el formato legacy; otros formatos no se consideran incompletos por no usar encabezados de siete pasos. El resultado no demuestra calidad, aprendizaje ni ejecución de los ejemplos; la auditoría de criterios editoriales es independiente y usa otra rúbrica.

La academia combina el formato legacy de siete pasos con Aprende/Practica/Aplica y estructuras narrativas. Este detector busca los marcadores del primer formato; una ausencia indica que no se detectaron esos marcadores, no que el tema carezca de explicación o práctica. La migración se registra en [migration-status.json](./migration-status.json).

| Track | Temas | objective | prerequisites | context | theoryAnalogy | guidedDemo | codeExplanation | execution | expectedResult | deliberateFailure | guidedPractice | independentPractice | closure | commonErrors | resources | standaloneExample | Completos |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 74 | 73 | 74 | 73 | 73 | 73 | 74 | 74 | 74 | 74 | 72 | 73 | 72 | 73 | 74 | 74 | 72 |
| angular | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 |
| cloud | 156 | 153 | 153 | 156 | 156 | 156 | 156 | 156 | 153 | 153 | 154 | 156 | 154 | 153 | 153 | 153 | 153 |
| control-1 | 70 | 0 | 0 | 0 | 0 | 0 | 70 | 70 | 70 | 0 | 0 | 0 | 0 | 17 | 70 | 0 | 0 |
| devops | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 | 129 |
| flutter | 106 | 105 | 106 | 105 | 105 | 105 | 106 | 106 | 106 | 106 | 105 | 105 | 104 | 105 | 106 | 105 | 104 |
| foundations | 100 | 99 | 100 | 99 | 99 | 99 | 100 | 100 | 100 | 99 | 98 | 99 | 98 | 99 | 99 | 99 | 95 |
| ios | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 |
| java | 111 | 23 | 43 | 23 | 13 | 13 | 111 | 50 | 111 | 111 | 11 | 13 | 14 | 23 | 53 | 21 | 9 |
| javascript | 88 | 87 | 88 | 87 | 87 | 87 | 88 | 88 | 88 | 88 | 87 | 87 | 87 | 88 | 88 | 88 | 87 |
| kotlin-multiplatform | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 |
| microservices | 14 | 6 | 10 | 7 | 7 | 7 | 14 | 11 | 13 | 14 | 7 | 7 | 7 | 6 | 6 | 8 | 6 |
| node | 83 | 10 | 83 | 10 | 10 | 10 | 83 | 83 | 83 | 83 | 10 | 10 | 10 | 72 | 83 | 78 | 10 |
| react | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 |
| rutaflow | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 |
| spring-boot | 113 | 0 | 39 | 0 | 0 | 0 | 113 | 109 | 113 | 113 | 0 | 0 | 0 | 5 | 35 | 5 | 0 |
| **Total** | **1314** | **955** | **1095** | **959** | **949** | **949** | **1314** | **1246** | **1310** | **1240** | **943** | **949** | **945** | **1040** | **1166** | **1030** | **935** |

## Interpretación

- **Demostración** exige código comentado, archivo concreto, ejecución y salida observable.
- **Fallo deliberado** exige provocar un error y explicar su diagnóstico; mencionar errores no basta.
- **Ejemplo independiente** exige iniciar el tema en una carpeta vacía o proyecto nuevo; ninguna lección depende de un proyecto acumulativo.
- Un marcador ausente es una señal para revisar el tema en el formato que realmente utiliza; no prueba por sí solo que falte aprendizaje o práctica.
- Cada campo es una detección textual de marcadores; una revisión humana sigue siendo necesaria para confirmar que el paso enseña realmente el concepto.
