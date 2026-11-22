# Coherencia material del código de cada tema

> Generado por `scripts/audit_code_coherence.py` sobre `topic-index.json` (1421 temas en 16 cursos).
> Mide si el código de un tema se sostiene solo: rutas que se usan sin haberse creado nunca,
> la carpeta que crean los comandos frente a donde vive el código, bloques sin archivo declarado
> y punteros a laboratorios inexistentes. **No** comprueba que el código compile ni que la salida
> escrita sea real: eso lo hacen `validate_lesson_labs.py`, `audit_topic_citations.py` y los
> `verificar.sh` ejecutados en la Mac del dueño.
> De las seis, C4 es la más blanda: un bloque sin nombre de archivo puede ser un fragmento
> ilustrativo. C1, C2, C5 y C6 son las que cita literalmente el prompt maestro y las que hay
> que bajar. La lista de trabajo está en el CSV, con la ruta concreta de cada incidencia.

Temas sin ninguna incidencia: **741/1421** (52 %).

| Comprobación | Qué significa | Temas con incidencia | Incidencias |
|---|---|---:|---:|
| C1 | ruta usada que ningún tema del curso crea y que no existe en el repo | 368/1421 | 477 |
| C2 | la carpeta que crean los comandos no es donde vive el código | 29/1421 | 29 |
| C3 | estructura de archivos dibujada que el tema no crea | 4/1421 | 15 |
| C4 | bloque de código largo sin declarar su archivo | 584/1421 | 848 |
| C5 | retirado (specs/027) | 0/1421 | 0 |
| C6 | retirado (specs/027) | 0/1421 | 0 |

## Por curso

| Curso | Temas | C1 | C2 | C3 | C4 | C5 | C6 | Sin incidencia |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 83 | 4 | 1 | 0 | 3 | 0 | 0 | 78/83 |
| angular | 78 | 7 | 0 | 1 | 38 | 0 | 0 | 44/78 |
| cloud | 168 | 18 | 0 | 0 | 28 | 0 | 0 | 144/168 |
| control-1 | 105 | 18 | 0 | 0 | 22 | 0 | 0 | 84/105 |
| devops | 139 | 57 | 5 | 2 | 34 | 0 | 0 | 88/139 |
| flutter | 119 | 7 | 2 | 0 | 14 | 0 | 0 | 107/119 |
| foundations | 88 | 69 | 0 | 0 | 103 | 0 | 0 | 5/88 |
| ios | 69 | 9 | 3 | 10 | 88 | 0 | 0 | 14/69 |
| java | 120 | 103 | 2 | 0 | 118 | 0 | 0 | 39/120 |
| javascript | 92 | 78 | 14 | 2 | 66 | 0 | 0 | 10/92 |
| kotlin-multiplatform | 66 | 1 | 0 | 0 | 13 | 0 | 0 | 54/66 |
| microservices | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 |
| node | 78 | 80 | 1 | 0 | 120 | 0 | 0 | 2/78 |
| react | 64 | 3 | 1 | 0 | 66 | 0 | 0 | 15/64 |
| rutaflow | 29 | 10 | 0 | 0 | 15 | 0 | 0 | 11/29 |
| spring-boot | 123 | 13 | 0 | 0 | 120 | 0 | 0 | 46/123 |

## Cómo se usa

`docs/auditoria/coherencia-codigo.csv` tiene una fila por tema con las rutas concretas.
Cada incidencia es literal: se comprueba abriendo el capítulo en la línea indicada.
Un tema con las cinco columnas en `0` no da contexto por hecho en su código.
