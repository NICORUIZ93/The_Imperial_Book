# Auditoría de los 12 ítems del prompt maestro (sección 4)

> Generado por `scripts/audit_master_prompt_items.py` sobre `topic-index.json` (1421 temas en 16 cursos).
> Medición estructural: comprueba que el punto **existe y tiene cuerpo**, no que esté bien
> escrito. La rúbrica de la sección 6 (exactitud, claridad, profundidad) es de revisión humana
> y este informe no la sustituye.

| Punto | Qué exige la sección 4 | Temas que lo tienen | % |
|---|---|---:|---:|
| P1 | Encabezado con nivel y duración + prerrequisitos | 537/1421 | 38 % |
| P2 | Objetivo verificable | 39/1421 | 3 % |
| P3 | Por qué importa, con caso real | 92/1421 | 6 % |
| P4 | Explicación sencilla y precisa + analogía con su límite | 1421/1421 | 100 % |
| P5 | Ayuda visual propia (diagrama o imagen) | 761/1421 | 54 % |
| P6 | Ejemplo ejecutable con nombre de archivo | 1324/1421 | 93 % |
| P7 | Explicación por bloques del código | 1/1421 | 0 % |
| P8 | Captura real con resultado en texto | 0/1421 | 0 % |
| P9 | Fallo deliberado: error exacto y diagnóstico | 1421/1421 | 100 % |
| P10 | Ejercicios en tres niveles con solución | 0/1421 | 0 % |
| P11 | Checklist de salida y siguiente paso | 91/1421 | 6 % |
| P12 | Aporte al proyecto integrador y fuentes con fecha | 0/1421 | 0 % |

## Por curso

| Curso | Temas | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | P11 | P12 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 83 | 22/83 | 6/83 | 5/83 | 83/83 | 36/83 | 79/83 | 0/83 | 0/83 | 83/83 | 0/83 | 2/83 | 0/83 |
| angular | 78 | 4/78 | 12/78 | 1/78 | 78/78 | 36/78 | 71/78 | 0/78 | 0/78 | 78/78 | 0/78 | 0/78 | 0/78 |
| cloud | 168 | 150/168 | 2/168 | 29/168 | 168/168 | 86/168 | 142/168 | 0/168 | 0/168 | 168/168 | 0/168 | 14/168 | 0/168 |
| control-1 | 105 | 17/105 | 0/105 | 0/105 | 105/105 | 15/105 | 103/105 | 0/105 | 0/105 | 105/105 | 0/105 | 68/105 | 0/105 |
| devops | 139 | 20/139 | 1/139 | 1/139 | 139/139 | 92/139 | 134/139 | 0/139 | 0/139 | 139/139 | 0/139 | 0/139 | 0/139 |
| flutter | 119 | 108/119 | 2/119 | 15/119 | 119/119 | 95/119 | 110/119 | 0/119 | 0/119 | 119/119 | 0/119 | 1/119 | 0/119 |
| foundations | 88 | 63/88 | 0/88 | 2/88 | 88/88 | 82/88 | 84/88 | 0/88 | 0/88 | 88/88 | 0/88 | 1/88 | 0/88 |
| ios | 69 | 57/69 | 5/69 | 22/69 | 69/69 | 47/69 | 63/69 | 0/69 | 0/69 | 69/69 | 0/69 | 1/69 | 0/69 |
| java | 120 | 4/120 | 0/120 | 0/120 | 120/120 | 24/120 | 115/120 | 0/120 | 0/120 | 120/120 | 0/120 | 1/120 | 0/120 |
| javascript | 92 | 3/92 | 0/92 | 7/92 | 92/92 | 62/92 | 91/92 | 0/92 | 0/92 | 92/92 | 0/92 | 1/92 | 0/92 |
| kotlin-multiplatform | 66 | 25/66 | 2/66 | 6/66 | 66/66 | 42/66 | 62/66 | 1/66 | 0/66 | 66/66 | 0/66 | 0/66 | 0/66 |
| microservices | 0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 |
| node | 78 | 2/78 | 0/78 | 0/78 | 78/78 | 29/78 | 78/78 | 0/78 | 0/78 | 78/78 | 0/78 | 0/78 | 0/78 |
| react | 64 | 55/64 | 7/64 | 4/64 | 64/64 | 42/64 | 61/64 | 0/64 | 0/64 | 64/64 | 0/64 | 1/64 | 0/64 |
| rutaflow | 29 | 5/29 | 0/29 | 0/29 | 29/29 | 26/29 | 29/29 | 0/29 | 0/29 | 29/29 | 0/29 | 1/29 | 0/29 |
| spring-boot | 123 | 2/123 | 2/123 | 0/123 | 123/123 | 47/123 | 102/123 | 0/123 | 0/123 | 123/123 | 0/123 | 0/123 | 0/123 |

## Cómo se usa

`docs/auditoria/prompt-maestro-items.csv` tiene una fila por tema con la columna
`faltan`: ese es el trabajo pendiente, ordenable por curso y módulo. Un tema con
`faltan` vacío ya pasa los doce puntos estructurales.
