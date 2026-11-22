# Coherencia material del código de cada tema

> Generado por `scripts/audit_code_coherence.py` sobre `topic-index.json` (1608 temas en 16 cursos).
> Mide si el código de un tema se sostiene solo: rutas que se usan sin haberse creado nunca,
> la carpeta que crean los comandos frente a donde vive el código, bloques sin archivo declarado
> y punteros a laboratorios inexistentes. **No** comprueba que el código compile ni que la salida
> escrita sea real: eso lo hacen `validate_lesson_labs.py`, `audit_topic_citations.py` y los
> `verificar.sh` ejecutados en la Mac del dueño.
> De las seis, C4 es la más blanda: un bloque sin nombre de archivo puede ser un fragmento
> ilustrativo. C1, C2, C5 y C6 son las que cita literalmente el prompt maestro y las que hay
> que bajar. La lista de trabajo está en el CSV, con la ruta concreta de cada incidencia.

Temas sin ninguna incidencia: **1289/1608** (80 %).

| Comprobación | Qué significa | Temas con incidencia | Incidencias |
|---|---|---:|---:|
| C1 | ruta usada que ningún tema del curso crea y que no existe en el repo | 52/1608 | 80 |
| C2 | la carpeta que crean los comandos no es donde vive el código | 17/1608 | 17 |
| C3 | estructura de archivos dibujada que el tema no crea | 1/1608 | 4 |
| C4 | bloque de código largo sin declarar su archivo | 265/1608 | 366 |
| C5 | retirado (specs/027) | 0/1608 | 0 |
| C6 | retirado (specs/027) | 0/1608 | 0 |

## Por curso

| Curso | Temas | C1 | C2 | C3 | C4 | C5 | C6 | Sin incidencia |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 83 | 0 | 0 | 0 | 1 | 0 | 0 | 82/83 |
| angular | 78 | 4 | 0 | 0 | 31 | 0 | 0 | 48/78 |
| cloud | 168 | 3 | 0 | 0 | 10 | 0 | 0 | 158/168 |
| control-1 | 105 | 0 | 0 | 0 | 0 | 0 | 0 | 105/105 |
| devops | 139 | 9 | 1 | 0 | 5 | 0 | 0 | 128/139 |
| flutter | 119 | 1 | 2 | 0 | 3 | 0 | 0 | 114/119 |
| foundations | 88 | 2 | 0 | 0 | 36 | 0 | 0 | 64/88 |
| ios | 69 | 7 | 0 | 4 | 63 | 0 | 0 | 34/69 |
| java | 120 | 1 | 2 | 0 | 7 | 0 | 0 | 111/120 |
| javascript | 92 | 14 | 9 | 0 | 16 | 0 | 0 | 61/92 |
| kotlin-multiplatform | 66 | 1 | 0 | 0 | 7 | 0 | 0 | 58/66 |
| microservices | 187 | 35 | 1 | 0 | 52 | 0 | 0 | 130/187 |
| node | 78 | 0 | 1 | 0 | 13 | 0 | 0 | 65/78 |
| react | 64 | 0 | 1 | 0 | 67 | 0 | 0 | 17/64 |
| rutaflow | 29 | 0 | 0 | 0 | 10 | 0 | 0 | 22/29 |
| spring-boot | 123 | 3 | 0 | 0 | 45 | 0 | 0 | 92/123 |

## Cómo se usa

`docs/auditoria/coherencia-codigo.csv` tiene una fila por tema con las rutas concretas.
Cada incidencia es literal: se comprueba abriendo el capítulo en la línea indicada.
Un tema con las cinco columnas en `0` no da contexto por hecho en su código.
