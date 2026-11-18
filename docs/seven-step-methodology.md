# Auditoría de metodología universal por tema

Un tema completo hace visibles los siete pasos y sus apoyos profesionales según 16 marcadores heurísticos. Este reporte detecta el formato legacy; otros formatos no se consideran incompletos por no usar encabezados de siete pasos. El resultado no demuestra calidad, aprendizaje ni ejecución de los ejemplos; la auditoría de criterios editoriales es independiente y usa otra rúbrica.

La academia combina el formato legacy de siete pasos con Aprende/Practica/Aplica y estructuras narrativas. Este detector busca los marcadores del primer formato; una ausencia indica que no se detectaron esos marcadores, no que el tema carezca de explicación o práctica. La migración se registra en [migration-status.json](./migration-status.json).

| Track | Temas | objective | prerequisites | context | theoryAnalogy | guidedDemo | codeExplanation | execution | expectedResult | deliberateFailure | guidedPractice | independentPractice | closure | commonErrors | resources | standaloneExample | Completos |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 74 | 73 | 74 | 73 | 73 | 73 | 74 | 74 | 74 | 74 | 72 | 73 | 72 | 73 | 74 | 74 | 72 |
| angular | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 | 71 |
| cloud | 156 | 153 | 153 | 156 | 156 | 156 | 156 | 156 | 155 | 153 | 154 | 156 | 154 | 153 | 153 | 153 | 153 |
| control-1 | 70 | 0 | 0 | 0 | 0 | 0 | 70 | 70 | 70 | 0 | 0 | 0 | 0 | 17 | 70 | 0 | 0 |
| devops | 130 | 130 | 130 | 130 | 130 | 130 | 130 | 130 | 130 | 130 | 130 | 130 | 130 | 130 | 130 | 130 | 130 |
| flutter | 109 | 108 | 109 | 108 | 108 | 106 | 109 | 109 | 109 | 109 | 108 | 108 | 107 | 108 | 109 | 105 | 104 |
| foundations | 102 | 101 | 102 | 101 | 101 | 101 | 102 | 102 | 102 | 101 | 100 | 101 | 100 | 101 | 101 | 101 | 97 |
| ios | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 |
| java | 111 | 23 | 46 | 23 | 13 | 13 | 111 | 110 | 111 | 111 | 11 | 13 | 14 | 23 | 53 | 21 | 9 |
| javascript | 88 | 87 | 88 | 87 | 87 | 87 | 88 | 88 | 88 | 88 | 87 | 87 | 87 | 88 | 88 | 88 | 87 |
| kotlin-multiplatform | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 | 56 |
| microservices | 24 | 23 | 24 | 24 | 24 | 20 | 24 | 24 | 23 | 24 | 14 | 24 | 23 | 13 | 12 | 22 | 11 |
| node | 83 | 10 | 83 | 10 | 10 | 10 | 83 | 83 | 83 | 83 | 10 | 10 | 10 | 72 | 83 | 78 | 10 |
| react | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 | 58 |
| rutaflow | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 | 29 |
| spring-boot | 114 | 1 | 40 | 1 | 1 | 0 | 114 | 110 | 114 | 114 | 1 | 1 | 1 | 6 | 36 | 6 | 0 |
| **Total** | **1331** | **979** | **1119** | **983** | **973** | **966** | **1331** | **1326** | **1329** | **1257** | **957** | **973** | **968** | **1054** | **1179** | **1048** | **943** |

## Interpretación

- **Demostración** exige código comentado, archivo concreto, ejecución y salida observable.
- **Fallo deliberado** exige provocar un error y explicar su diagnóstico; mencionar errores no basta.
- **Ejemplo independiente** exige iniciar el tema en una carpeta vacía o proyecto nuevo; ninguna lección depende de un proyecto acumulativo.
- Un marcador ausente es una señal para revisar el tema en el formato que realmente utiliza; no prueba por sí solo que falte aprendizaje o práctica.
- Cada campo es una detección textual de marcadores; una revisión humana sigue siendo necesaria para confirmar que el paso enseña realmente el concepto.
