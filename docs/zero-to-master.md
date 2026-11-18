# Cobertura de cero a master por ruta

> Generado por `scripts/build_zero_to_master_report.py` (specs/003). Medición estructural para planear lotes del prompt maestro v2; no acredita calidad pedagógica.

| Ruta | Módulos | Temas | Fund. | Aplic. | Integr. | Experto | Módulo Master | Con ayuda visual | Con proyecto | Niveles faltantes |
|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|---|
| android | 19 | 74 | 3 | 3 | 5 | 8 | sí | 67/74 | 74/74 | — |
| angular | 17 | 71 | 4 | 4 | 3 | 6 | sí | 68/71 | 71/71 | — |
| cloud | 35 | 156 | 3 | 5 | 10 | 17 | sí | 96/156 | 156/156 | — |
| control-1 | 23 | 70 | 6 | 5 | 8 | 4 | **no** | 11/70 | 5/70 | — |
| devops | 23 | 130 | 4 | 2 | 3 | 14 | sí | 123/130 | 130/130 | — |
| flutter | 23 | 109 | 3 | 3 | 2 | 15 | sí | 86/109 | 109/109 | — |
| foundations | 16 | 102 | 4 | 4 | 5 | 3 | **no** | 77/102 | 102/102 | — |
| ios | 15 | 56 | 3 | 3 | 3 | 6 | sí | 35/56 | 56/56 | — |
| java | 23 | 111 | 4 | 4 | 7 | 8 | sí | 19/111 | 111/111 | — |
| javascript | 15 | 88 | 5 | 4 | 2 | 4 | sí | 58/88 | 88/88 | — |
| kotlin-multiplatform | 14 | 56 | 2 | 2 | 3 | 7 | sí | 47/56 | 56/56 | — |
| microservices | 2 | 24 | 2 | 0 | 0 | 0 | **no** | 2/24 | 24/24 | Aplicación, Integración, Experto |
| node | 16 | 83 | 3 | 3 | 2 | 8 | sí | 36/83 | 83/83 | — |
| react | 15 | 58 | 3 | 3 | 3 | 6 | sí | 37/58 | 58/58 | — |
| rutaflow | 8 | 29 | 1 | 1 | 3 | 3 | **no** | 26/29 | 29/29 | — |
| spring-boot | 27 | 114 | 2 | 2 | 6 | 17 | sí | 44/114 | 114/114 | — |

## Cómo se usa

1. Elige la siguiente ruta según la prioridad de `MASTER-PROMPT.md`.
2. Abre una spec del lote con los temas que faltan para cerrar niveles y ayudas visuales.
3. Crea o reescribe los temas con el prompt maestro v2 y agrégalos a `specs/visual-aids-scope.json`.
4. Regenera este reporte: la columna de ayudas visuales debe subir y ningún nivel debe quedar vacío.
