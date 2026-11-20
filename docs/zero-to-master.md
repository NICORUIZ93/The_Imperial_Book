# Cobertura de cero a master por ruta

> Generado por `scripts/build_zero_to_master_report.py` (specs/003). Medición estructural para planear lotes del prompt maestro v2; no acredita calidad pedagógica.

| Ruta | Módulos | Temas | Fund. | Aplic. | Integr. | Experto | Módulo Master | Con ayuda visual | Con proyecto | Niveles faltantes |
|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|---|
| android | 19 | 83 | 3 | 3 | 5 | 8 | sí | 76/83 | 83/83 | — |
| angular | 17 | 78 | 4 | 4 | 3 | 6 | sí | 75/78 | 78/78 | — |
| cloud | 35 | 168 | 3 | 5 | 10 | 17 | sí | 108/168 | 168/168 | — |
| control-1 | 29 | 88 | 6 | 6 | 16 | 1 | **no** | 11/88 | 5/88 | — |
| devops | 23 | 139 | 4 | 2 | 3 | 14 | sí | 132/139 | 139/139 | — |
| flutter | 23 | 119 | 3 | 3 | 2 | 15 | sí | 96/119 | 119/119 | — |
| foundations | 16 | 105 | 4 | 4 | 5 | 3 | **no** | 78/105 | 103/105 | — |
| ios | 15 | 69 | 3 | 3 | 3 | 6 | sí | 48/69 | 69/69 | — |
| java | 23 | 120 | 4 | 4 | 7 | 8 | sí | 25/120 | 117/120 | — |
| javascript | 15 | 92 | 5 | 4 | 2 | 4 | sí | 62/92 | 92/92 | — |
| kotlin-multiplatform | 14 | 66 | 2 | 2 | 3 | 7 | sí | 57/66 | 66/66 | — |
| microservices | 37 | 187 | 0 | 0 | 0 | 0 | **no** | 2/187 | 24/187 | Fundamentos, Aplicación, Integración, Experto |
| node | 14 | 78 | 3 | 3 | 2 | 6 | **no** | 33/78 | 78/78 | — |
| react | 15 | 64 | 3 | 3 | 3 | 6 | sí | 43/64 | 64/64 | — |
| rutaflow | 8 | 29 | 1 | 1 | 3 | 3 | **no** | 26/29 | 29/29 | — |
| spring-boot | 21 | 123 | 2 | 3 | 4 | 12 | sí | 51/123 | 121/123 | — |

## Capítulos Master pedidos sin capítulo detrás

`docs/requested-master-topics.json` registra estos capítulos, pero el contenido no existe; la columna «Módulo Master» de la tabla ya no los cuenta:

- `node`: capítulo 14 declarado en el registro, el curso termina en el capítulo 13.

## Cómo se usa

1. Elige la siguiente ruta según la prioridad de `MASTER-PROMPT.md`.
2. Abre una spec del lote con los temas que faltan para cerrar niveles y ayudas visuales.
3. Crea o reescribe los temas con el prompt maestro v2 y agrégalos a `specs/visual-aids-scope.json`.
4. Regenera este reporte: la columna de ayudas visuales debe subir y ningún nivel debe quedar vacío.
