# Auditoría de los 12 ítems del prompt maestro (sección 4)

> Generado por `scripts/audit_master_prompt_items.py` sobre `topic-index.json` (1608 temas en 16 cursos).
> Medición estructural: comprueba que el punto **existe y tiene cuerpo**, no que esté bien
> escrito. La rúbrica de la sección 6 (exactitud, claridad, profundidad) es de revisión humana
> y este informe no la sustituye.

| Punto | Qué exige la sección 4 | Temas que lo tienen | % |
|---|---|---:|---:|
| P1 | Encabezado con nivel y duración + prerrequisitos | 350/1608 | 22 % |
| P2 | Objetivo verificable | 1314/1608 | 82 % |
| P3 | Por qué importa, con caso real | 1421/1608 | 88 % |
| P4 | Explicación sencilla y precisa + analogía con su límite | 1281/1608 | 80 % |
| P5 | Ayuda visual propia (diagrama o imagen) | 939/1608 | 58 % |
| P6 | Ejemplo ejecutable con nombre de archivo | 1605/1608 | 100 % |
| P7 | Explicación por bloques del código | 1214/1608 | 75 % |
| P8 | Captura real con resultado en texto | 28/1608 | 2 % |
| P9 | Fallo deliberado: error exacto y diagnóstico | 1543/1608 | 96 % |
| P10 | Ejercicios en tres niveles con solución | 1098/1608 | 68 % |
| P11 | Checklist de salida y siguiente paso | 1288/1608 | 80 % |
| P12 | Aporte al proyecto integrador y fuentes con fecha | 75/1608 | 5 % |

## Por curso

| Curso | Temas | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | P11 | P12 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 83 | 1/83 | 82/83 | 83/83 | 82/83 | 36/83 | 83/83 | 82/83 | 0/83 | 83/83 | 82/83 | 78/83 | 2/83 |
| angular | 78 | 2/78 | 76/78 | 78/78 | 78/78 | 36/78 | 78/78 | 77/78 | 0/78 | 78/78 | 76/78 | 78/78 | 4/78 |
| cloud | 168 | 0/168 | 168/168 | 168/168 | 150/168 | 86/168 | 168/168 | 168/168 | 8/168 | 163/168 | 167/168 | 167/168 | 1/168 |
| control-1 | 88 | 0/88 | 0/88 | 88/88 | 18/88 | 15/88 | 86/88 | 0/88 | 0/88 | 34/88 | 0/88 | 70/88 | 3/88 |
| devops | 139 | 0/139 | 139/139 | 139/139 | 132/139 | 92/139 | 139/139 | 139/139 | 1/139 | 138/139 | 138/139 | 134/139 | 8/139 |
| flutter | 119 | 109/119 | 118/119 | 119/119 | 78/119 | 95/119 | 119/119 | 118/119 | 0/119 | 119/119 | 118/119 | 118/119 | 1/119 |
| foundations | 105 | 3/105 | 102/105 | 105/105 | 102/105 | 74/105 | 104/105 | 102/105 | 3/105 | 104/105 | 101/105 | 86/105 | 21/105 |
| ios | 69 | 57/69 | 69/69 | 69/69 | 63/69 | 47/69 | 69/69 | 69/69 | 0/69 | 69/69 | 69/69 | 69/69 | 0/69 |
| java | 120 | 23/120 | 39/120 | 120/120 | 45/120 | 24/120 | 120/120 | 8/120 | 6/120 | 120/120 | 14/120 | 40/120 | 6/120 |
| javascript | 92 | 26/92 | 91/92 | 92/92 | 87/92 | 62/92 | 92/92 | 91/92 | 3/92 | 91/92 | 90/92 | 86/92 | 7/92 |
| kotlin-multiplatform | 66 | 0/66 | 66/66 | 66/66 | 60/66 | 42/66 | 66/66 | 66/66 | 0/66 | 66/66 | 66/66 | 66/66 | 1/66 |
| microservices | 187 | 0/187 | 187/187 | 0/187 | 187/187 | 187/187 | 187/187 | 187/187 | 0/187 | 185/187 | 19/187 | 185/187 | 0/187 |
| node | 78 | 38/78 | 71/78 | 78/78 | 78/78 | 29/78 | 78/78 | 7/78 | 7/78 | 78/78 | 60/78 | 7/78 | 8/78 |
| react | 64 | 56/64 | 61/64 | 64/64 | 58/64 | 42/64 | 64/64 | 63/64 | 0/64 | 64/64 | 61/64 | 64/64 | 4/64 |
| rutaflow | 29 | 0/29 | 29/29 | 29/29 | 29/29 | 26/29 | 29/29 | 29/29 | 0/29 | 29/29 | 29/29 | 29/29 | 1/29 |
| spring-boot | 123 | 35/123 | 16/123 | 123/123 | 34/123 | 46/123 | 123/123 | 8/123 | 0/123 | 122/123 | 8/123 | 11/123 | 8/123 |

## Cómo se usa

`docs/auditoria/prompt-maestro-items.csv` tiene una fila por tema con la columna
`faltan`: ese es el trabajo pendiente, ordenable por curso y módulo. Un tema con
`faltan` vacío ya pasa los doce puntos estructurales.
