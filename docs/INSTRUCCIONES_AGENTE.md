# Instrucciones para migrar un módulo a la plantilla académica

Estas instrucciones son para cualquier agente o IA que continúe el trabajo. Léelas completas antes de empezar.

## Qué debes entregar

Un archivo `web/public/content/<curso>/modulo-<N>.md` donde **cada** `### Tema …` cumple la plantilla de
[`PLANTILLA_CURSO.md`](PLANTILLA_CURSO.md) y pasa `python3 scripts/audit_template.py --detalle <curso>`.

## Antes de escribir

1. Lee `docs/PLANTILLA_CURSO.md` completo.
2. Lee los temas de referencia ya migrados: `web/public/content/foundations/modulo-1.md`, Temas 1, 2 y 3. Ese es el
   nivel mínimo: mismo formato, misma profundidad, mismo tono.
3. Lee el módulo que vas a migrar completo y la definición del curso en `web/src/app/tracks/<curso>.track.ts`
   (o `course-data.ts` para `cloud`): los temas, ejercicios y entregables declarados ahí deben quedar cubiertos.

## Reglas obligatorias

- **Español** neutro, segunda persona, frases de máximo 25 palabras.
- **Cada término técnico nuevo** del tema va en `**Conceptos clave:**` y tiene su ficha con los 5 puntos:
  `**Definición técnica:**`, `**En palabras sencillas:**`, `**Dónde se rompe la comparación:**`, `**Ejemplo:**`,
  `**Error típico:**`. Escribe la ficha como en el tema modelo (párrafo con el término en negrita y lista debajo).
  Si un término ya tiene ficha en un tema anterior del mismo módulo, no lo pongas en Conceptos clave: enlázalo.
- **Los 12 bloques en orden:** `#### Objetivos`, `**Conceptos clave:**`, `#### El problema`,
  `#### Glosario del tema`, `#### ► CÓMO FUNCIONA` (con un diagrama Mermaid propio), `#### Problema resuelto N.M`
  con `**Razonamiento:**`, recuadros (`> **Error común.**` obligatorio; `> **Buena práctica.**`,
  `> **Prevenir errores.**` cuando aplique), `#### Checkpoint N.M` con `Respuesta:`, y en la Capa 2:
  `#### Paso N · Título`, `#### Resumen`, tres `#### Ejercicio verificable N` (básico, intermedio, reto) con
  `Respuesta esperada:`, y `#### En el trabajo`.
- Conserva las capas: Capa 1 (`<details open>` … «Capa 1 — Lectura») y Capa 2 (`<details>` … «Capa 2 — Construcción»).
- **Mantén exacto el título** de cada `### Tema N: Título`; solo puedes cambiar la duración. No cambies el número de temas
  ni su orden.
- **Todo el código es completo y ejecutable**, va seguido de su salida en un bloque `text`, y la salida **es real**:
  ejecútalo antes de pegarla. Si el lenguaje no se puede ejecutar en tu entorno (Swift, Kotlin, Android, iOS), escribe
  código correcto y conservador, y en lugar de inventar la salida describe lo que se observa («la pantalla muestra…»)
  sin presentarlo como salida capturada.
- Las referencias a líneas («Línea 7») deben coincidir con el código mostrado.
- Los mensajes de error en los recuadros deben ser los **literales** que produce la herramienta.
- **Conserva** el código verificable que ya tenía el tema: reúsalo y explícalo. Borra fragmentos sueltos sin
  contexto, hojas con `_________`, restos como `> ````, diagramas duplicados y cualquier frase genérica que sirva
  igual para cualquier tema.
- Secciones que no son temas (introducción del módulo, laboratorio integrador): consérvalas, límpialas de relleno
  y de notas internas.
- Nada de rutas internas (`/tmp/opencode`), notas para el equipo ni menciones a herramientas de IA.
- No copies texto de libros: usa sus métodos, nunca sus frases ni ejemplos.

## Cómo trabajar sin pisar a otros

- Edita **solo** el archivo de tu módulo.
- No ejecutes `scripts/build_web_topic_index.py`, no hagas `git add`, `commit` ni `push`: eso lo hace quien coordina.
- Puedes ejecutar `python3 scripts/audit_template.py --detalle <curso>` (solo lee).
- Escribe y edita con scripts de Python que lean y escriban el archivo; nunca reconstruyas el archivo copiando su
  contenido desde una salida de herramienta (puede venir cortada).

## Al terminar

Informa: temas migrados, resultado del validador para tu módulo, qué código ejecutaste y con qué versión, y cualquier
salida que no pudiste verificar.

## Notas por curso

### Java
- El curso ya tiene prosa de calidad con el estilo «Mecanismo / Por qué existe / Implicación / Regla práctica» y
  salidas reales capturadas en el Mac del usuario (JDK 27 con toolchain Java 25, Gradle 9.9). **Consérvala**: reubícala
  dentro de los bloques de la plantilla (Cómo funciona, Problema resuelto, recuadros) en lugar de reescribirla.
- Las salidas que ya están en el módulo son reales: no las cambies salvo que el código cambie.
- Para código nuevo: el contenedor tiene JDK 21, Gradle y Maven. Si necesitas Java 25, intenta descargar Temurin 25
  desde `github.com/adoptium/temurin25-binaries/releases`; si no se puede, usa JDK 21 para lo que no dependa de Java 25
  y no inventes salidas de funciones exclusivas de Java 25.
- Build tool del curso: **Gradle** (Kotlin DSL). Maven solo donde el tema lo compara.
- Declara al inicio del módulo con qué entorno se capturaron las salidas nuevas, sin borrar la línea del entorno original.
