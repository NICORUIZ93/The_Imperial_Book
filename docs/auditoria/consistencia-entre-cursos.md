# Auditoría de consistencia entre cursos

Medida el 2026-11-21 sobre **1608 temas · 324 capítulos · 16 tracks** (el universo del índice publicado).

- Medidor: [`scripts/audit_consistencia_entre_cursos.py`](../scripts/audit_consistencia_entre_cursos.py)
- Datos por tema: [`consistencia-entre-cursos.csv`](consistencia-entre-cursos.csv) · [`consistencia-entre-cursos.json`](consistencia-entre-cursos.json) (1608 filas)
- Reproducir: `python3 scripts/audit_consistencia_entre_cursos.py --csv docs/auditoria/consistencia-entre-cursos.csv --json docs/auditoria/consistencia-entre-cursos.json`

Este documento no opina: cada columna es un marcador buscado sobre el archivo. La queja auditada es la del
encargo — *«las explicaciones cambian de un curso al otro, se usan metodologías y formas visuales diferentes,
se suponen temas, los ejemplos no van de cero a experto»* — y tiene cuatro medidores: **metodología** (F),
**ayudas visuales** (A/D), **orden imagen→código** (O), **prerrequisito declarado** (P) y **puntero que
resuelve** (R).

## 1. Tabla medida

curso                  temas met.                mayoritaria  anal  diag       antes sin-alt prereq p-forma  amb  orf desf
android                   83    2                7 pasos 98% 100 %  96 %  100 % (47)    96 %   13 %    46 %    0    0    0
angular                   78    2                7 pasos 97% 100 %  94 %   97 % (77)    94 %   12 %    32 %    0    0    0
cloud                    168    1               7 pasos 100% 100 %  70 %  100 % (38)    70 %    8 %   100 %    1    0    0
control-1                 88    4             ejercicios 71%   1 %  30 %   24 % (86)    30 %    0 %    13 %    0    0    0
devops                   139    1               7 pasos 100% 100 %  94 %  100 % (48)    94 %    6 %    39 %    0    0    0
flutter                  119    2                7 pasos 99%  99 %  81 % 100 % (102)    81 %    9 %   100 %    0    0    0
foundations              105    3                7 pasos 97%  98 %  76 %  98 % (104)    75 %    7 %   100 %    0    0    0
ios                       69    1               7 pasos 100% 100 %  76 %   98 % (63)    76 %   18 %   100 %    0    0    0
java                     120    3             subtemas 4 67%  24 %  25 %  27 % (114)    25 %   24 %    55 %    0    0    0
javascript                92    2                7 pasos 98% 100 %  67 %  100 % (92)    67 %   28 %    44 %    0    0    0
kotlin-multiplatform      66    1               7 pasos 100% 100 %  92 %  100 % (64)    92 %   15 %    56 %    0    0    0
microservices            187    1                 ficha 100% 100 % 100 % 100 % (185)     0 %  100 %   100 %  569    0   36
node                      78    1 Aprende/Practica/Aplica 100%  97 %  48 %   94 % (77)    48 %  100 %   100 %    0    0    0
react                     64    2                7 pasos 95% 100 %  79 %   95 % (64)    79 %   14 %   100 %    0    0    0
rutaflow                  29    1               7 pasos 100% 100 %  96 %  100 % (28)    96 %    0 %    34 %    0    0    0
spring-boot              123    4           subtemas N.M 53%  18 %  52 %   50 % (94)    52 %   30 %    57 %    0    0    0
```

`met.`t.` = número de metodologías distintas que aparecen en el curso · `antes` = % de los temas **que tienen
código de programa** cuya ayuda visual aparece antes (el paréntesis es ese denominador) · `amb` = menciones
«Módulo N» ambiguas · `orf` = menciones que no llevan a ningún capítulo · `desf` = archivos cuyo número de
ruta difiere del número que se lee en el título.

## 2. Hallazgos

**H1 — Ocho metodologías conviviendo, y nueve cursos mezclan dentro de sí.**
Reparto exacto de los 1608 temas: `7 pasos` 1038 · `ficha` 187 · `subtemas 4` 154 ·
`Aprende/Practica/Aplica` 90 (78 de Node + 12 fuera de Node, ver H3) · `subtemas N.M` 66 · `ejercicios` 63 ·
`ejemplos resueltos` 4 · `ninguna` 6. Un estudiante que salta de Cloud a Java encuentra secciones con otros
nombres y otro orden, y eso es exactamente la queja.

**H2 — La mezcla más grave está *dentro del mismo capítulo*, no entre cursos.**
21 archivos tienen dos estructuras a la vez. Los peores casos:

| archivo | mezcla |
|---|---|
| `spring-boot/modulo-20.md` | subtemas N.M 6 + subtemas 4 3 |
| `spring-boot/modulo-2.md` | subtemas 4 6 + subtemas N.M 2 |
| `spring-boot/modulo-0.md` | subtemas 4 3 + 7 pasos 1 + subtemas N.M 2 (tres formas en un capítulo) |
| `java/modulo-20.md` | 7 pasos 12 + subtemas 4 1 |
| `control-1/modulo-1.md` | ejercicios 3 + ejemplos resueltos 1 |

**H3 — `Aprende/Practica/Aplica` se fugó de Node.** Es la plantilla de los 78 temas de Node, pero aparecen
12 temas más en otros cursos con esa misma triada: 10 en Java y 2 en Spring Boot. Evidencia:
[`web/public/content/java/modulo-2.md:156`](../web/public/content/java/modulo-2.md#L156) abre
«Tema 2: El contrato de equals y hashCode» y [`:161`](../web/public/content/java/modulo-2.md#L161) lleva
`#### Aprende`; [`web/public/content/spring-boot/modulo-9.md:142`](../web/public/content/spring-boot/modulo-9.md#L142) igual.
Mientras tanto el propio Java usa `subtemas 4` en 81 temas y `7 pasos` en 29: tres estructuras en un curso.

**H4 — Solo un curso pasa la puerta del formato único.** `python3 scripts/validate_formato.py --check` hoy:
**187 de 1608 (11 %)** con las 12 secciones nombradas y en orden; los otros 15 cursos están al 0 % y les
faltan siempre las mismas tres: «Ubicación y prerrequisitos», «Objetivo», «Por qué importa».

**H5 — El texto alternativo de los diagramas es el hueco más grande y más barato de describir.**
1183 temas tienen diagrama; **995 (84 %) no declaran «Texto alternativo»**. La cadena aparece en 37
archivos, todos de microservices, y en un solo tema de foundations. Es decir: la ayuda visual existe casi
siempre y es invisible para un lector de pantalla casi siempre.

**H6 — La analogía etiquetada no es universal.** 1325/1608 (82 %) la tienen; el déficit se concentra en
control-1 (1 %), spring-boot (18 %) y java (24 %). En Java y Spring Boot no es que falte la imagen: es que
no está *nombrada*, así que el estudiante no la reconoce como recurso.

**H7 — «Se suponen temas» medido como sección de prerrequisito.** 453/1608 (28 %) la llevan etiquetada.
Node y microservicios al 100 %; control-1 y rutaflow al 0 %. En cambio la mención suelta (`p-forma`) llega
al 100 % en cloud, flutter, foundations, ios, react y node, pero solo al 13 % en control-1: ahí el
problema no es de redacción sino de que no hay contrato de entrada.

**H8 — La regla «primero la imagen, luego el código» se incumple justo donde más código hay.**
Sobre 1283 temas con código de programa, 1076 (83 %) ponen antes una ayuda visual. Java: 27 % de 114 temas;
control-1: 24 % de 86; spring-boot: 50 % de 94. Cloud, flutter, foundations y javascript abren siempre con
imagen o analogía.

**H9 — Los punteros entre capítulos resuelven; el único riesgo es la doble numeración de microservicios.**
`orf = 0` en los 16 cursos: no hay ninguna cita «Módulo N» que lleve a un capítulo inexistente. Lo que sí
existe son **569 menciones ambiguas en microservices + 36 archivos con desfase**: la barra lateral muestra
la etiqueta del título, la ruta muestra el id. [`web/public/content/microservices/modulo-26.md:85`](../web/public/content/microservices/modulo-26.md#L85)
lo documenta sin querer — `# Módulo 22 (modulo-26) · Mensajería y patrones de datos` — y el mismo archivo
usa los dos sistemas: cita el prerequisito por etiqueta
([`:22`](../web/public/content/microservices/modulo-26.md#L22), «Módulo 18») y el laboratorio por id
([`:157`](../web/public/content/microservices/modulo-26.md#L157), `examples/microservicios/modulo-26/f135-…`).
Para el estudiante que navega por la barra lateral resuelve; para quien busca el archivo o revisa enlaces, no.

**H10 — Seis temas sin ninguna metodología; tres de ellos son un problema real y tres no.**

| tema | diagnóstico |
|---|---|
| [`android/modulo-14.md:10`](../web/public/content/android/modulo-14.md#L10) | estructura suelta («Por qué una captura visual no basta», «Monta el composable…») mientras sus cinco hermanos del mismo capítulo son `Paso 1…7` |
| [`foundations/modulo-0.md:172`](../web/public/content/foundations/modulo-0.md#L172) | igual: 4 secciones propias frente a `Paso 1…7` en los temas 1, 3, 4, 5 y 6 |
| [`javascript/modulo-8.md:8`](../web/public/content/javascript/modulo-8.md#L8) | igual frente a `Paso 1…7` en los temas 2–7 |
| `control-1/modulo-0.md` · «Cómo está armado cada capítulo» | documento meta del curso: género distinto, legítimo |
| `control-1/modulo-21.md` · «Parcial 1 resuelto paso a paso» | examen resuelto: género distinto, legítimo |
| `control-1/modulo-22.md` · «Simulacro con solución» | examen: género distinto, legítimo |

## 3. Limpieza ya ejecutada (lote 1)

32 encabezados `#### Subtema X.k` (placeholder sin resolver) renumerados al número del Tema contenedor en
`web/public/content/spring-boot/modulo-0.md`, `modulo-2.md`, `modulo-3.md`, `modulo-5.md`, `modulo-6.md` y
`modulo-9.md`. Ejemplo verificado:
[`spring-boot/modulo-0.md:758`](../web/public/content/spring-boot/modulo-0.md#L758) dice ahora
`#### Subtema 5.1 · Construye un proxy a mano con java.lang.reflect.Proxy · 10 min`, bajo su `### Tema 5`.

Pruebas, no intenciones: `git diff --numstat` = 32 inserciones y 32 borrados exactos (sustitución pura, sin
contenido añadido ni perdido); `grep -rl 'Subtema X' web/public/content/` no devuelve ningún archivo; y el
chequeo estructural tema↔subtema pasa en los 24 capítulos de spring-boot.

## 4. Retracciones de esta misma auditoría

Cuatro cifras que dio una versión anterior del medidor eran falsas y ya no salen. Quedan aquí porque son el
registro de por qué el detector está corregido y no aflojado:

1. **«15 citas colgantes a módulos inexistentes» — no existen.** El patrón atrapaba cualquier palabra de
   track en las 24 líneas anteriores al número, así que «una API HTTP en Node con rutas y errores
   (Módulo 14)» se atribuía al curso Node, que no llega a 14. Comprobadas a mano una a una, todas resuelven:
   [`react/modulo-0.md:106`](../web/public/content/react/modulo-0.md#L106) «RutaFlow (Módulo 12)» apunta al
   capítulo integrador del propio React; [`cloud/modulo-32.md:192`](../web/public/content/cloud/modulo-32.md#L192)
   `rutaflow-facturacion (Módulo 13)` es un servicio y apunta al RDS del propio Cloud;
   [`android/modulo-17.md:101`](../web/public/content/android/modulo-17.md#L101) «paging del módulo 16» es
   Android 16 (17 menciones de paging). Ahora `orf = 0` en todo el corpus.
2. **«analogía 0 % en los 16 cursos» — falso** por la trampa NFC/NFD: los patrones con acentos escritos en
   el script no casaban con el corpus. El medidor pliega el texto y usa patrones ASCII; la cifra real es 82 %.
3. **«1240 punteros ambiguos» — inflado 2×.** Contaba la auto-ubicación correcta («Módulo 22, Lección 3 de 7»
   dentro del módulo que se titula 22). Excluida: 569.
4. **«0 archivos con desfase» — falso**, por el mismo acento literal. Real: 36 de 37 en microservices.

## 5. Deuda ordenada por costo

Cada lote dice qué columna de la tabla mueve y qué puerta lo verifica. Costos en sesiones de trabajo
continuo sobre un curso.

| lote | qué hace | temas tocados | costo | puerta que lo mide |
|---|---|---|---|---|
| **L0 (decisión tuya, no trabajo)** | decidir la doble numeración de microservices: renombrar los 36 `modulo-N.md` a su etiqueta (rompe 569 menciones y las rutas `examples/microservicios/modulo-N`) o dejarlo y añadir una línea «(modulo-N)» en cada H1 | 187 | 0 sesiones / 3 si se renombra | `audit_consistencia_entre_cursos.py`: `desf`, `amb` |
| **L1** | los 3 temas sueltos (Android 14/1, Foundations 0/2, JavaScript 8/1) migrados a `Paso 1…7`, que es lo que ya usan sus hermanos de capítulo | 3 | 1 sesión | columna `ninguna` → 0 |
| **L2** | «Texto alternativo» en cada diagrama que no lo declara, empezando por el curso que más temas tiene (cloud 118, devops 132, flutter 97) | 995 | 6–8 sesiones | `sin-alt` y `scripts/audit_visual_aids.py` |
| **L3** | sección de prerrequisito etiquetada donde hoy no la hay, con el criterio de «qué archivo debe existir ya» | 1155 | 8 sesiones | `prereq` |
| **L4** | analogía nombrada en los tres cursos que no la etiquetan (control-1, spring-boot, java) | 283 | 3 sesiones | `anal` |
| **L5** | mover la ayuda visual delante del primer bloque de código (java 83 temas, spring-boot 47, control-1 65) | 207 | 4 sesiones | `antes` |
| **L6** | unificar la metodología por curso: 21 capítulos con dos formas y los 12 temas con `Aprende/Practica/Aplica` fuera de Node | ≈140 | 6 sesiones | `met.` → 1 por curso |
| **L7** | formato único de las 12 secciones (`specs/021`) en los 15 cursos que están al 0 % | 1421 | el trabajo de fondo del proyecto | `validate_formato.py --check` (hoy 11 %) |

El orden recomendado es L1 → L2 → L4 → L5 → L3 → L6 → L7: primero lo que se paga en minutos por tema y
después lo que exige reescribir. L7 no se puede comprimir; es la diferencia entre «un libro digital con 16
cursos» y «16 libros distintos encuadernados igual».

## 6. Qué NO encontró esta auditoría

- No hay temas fantasma por puntero roto (H9) ni rutas de laboratorio inexistentes: las 0 citas huérfanas.
- Los marcadores `TODO`, `XXX`, `<título>` y «pega aquí» que aparecen en el corpus son contenido legítimo
  (cadenas dentro de ejemplos), no restos de plantilla.
- Esta auditoría mide *presencia de señas*, no calidad de la explicación. Que un tema tenga `Paso 4 ·
  Demostración guiada` no prueba que construya desde cero: eso lo mide
  [`scripts/audit_master_prompt_items.py`](../scripts/audit_master_prompt_items.py) y su deuda está en
  [`prompt-maestro-items.md`](prompt-maestro-items.md).
