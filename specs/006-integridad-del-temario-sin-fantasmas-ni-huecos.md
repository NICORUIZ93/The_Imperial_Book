# 006 · Integridad del temario: cero temas fantasma y cero huecos

**Estado:** hecho
**Origen:** pedido del 2026-11-18: «todos los temas están mal, con spec driven revisa todos los temas y
no dejes huecos ni temas fantasmas».

## Definiciones (acordadas aquí para no reinterpretarlas en cada sesión)

- **Tema fantasma:** algo que la app presenta como tema sin que exista una lección real detrás.
  Medición de partida (2026-11-18):
  - El temario web (`/temario`) publicaba 74.412 entradas, y solo 1.331 eran lecciones:
    - 73.027 eran encabezados de índices de libros extraídos por OCR o de PDFs, como
      «Autor……… 6», «540», «Card» o rutas `C:\Users\…\Image 511.png`.
    - 54 eran temas anunciados por cursos externos sin lección propia.
  - 13 áreas («stacks propuestos») no tenían ninguna lección.
- **Hueco:** un tema que la ruta debería enseñar y no enseña, o un tema publicado al que le falta algo
  para seguirlo de verdad:
  - un comando que apunta a un proyecto que el curso nunca crea;
  - contenido viejo pegado después del cierre;
  - un título repetido dentro de la ruta;
  - un tema oficial de la tecnología sin tema propio.
- La lista de temas oficiales es `docs/official-topic-atlas.json`. Para cada tema oficial, la decisión
  vive en `docs/official-topic-coverage.json`:
  - qué tema real de la academia lo enseña, verificado al leerlo;
  - o `hueco`, y entonces se escribe el tema.

  La coincidencia por subcadena de specs/004 T3 queda reemplazada por este mapa. Esa coincidencia
  marcaba como faltantes temas que sí existen, por ejemplo «networking» en Android, que se enseña con
  Retrofit en el módulo 5.

## Criterios

- **I1** `hecho` — El temario web solo publica temas reales. Cada entrada de
  `web/public/content/curriculum-stacks/*.json` apunta a un fragmento existente de `topic-index.json`, y
  el catálogo solo lista áreas con ruta real.
  - Los candidatos de libros y cursos siguen en `docs/temario-maestro-unificado.json` como insumo
    editorial interno.
  Verificación: `python3 scripts/audit_topic_integrity.py --criterion I1`
- **I2** `hecho` — Índice, Markdown y temario coinciden 1:1:
  - mismos temas por ruta y módulo;
  - numeración `Tema 1..N` sin saltos;
  - ningún módulo sin temas.
  Verificación: `python3 scripts/audit_topic_integrity.py --criterion I2`
- **I3** `hecho` — Ningún título de tema se repite dentro de una ruta.
  Verificación: `python3 scripts/audit_topic_integrity.py --criterion I3`
- **I4** `hecho` — En los temas de siete pasos, «Paso 7 · Cierre» es lo último del tema. El
  contenido heredado que estaba pegado después del cierre se integra en el Paso 3, donde va la teoría y
  el modelo mental, sin perder texto ni código.
  Verificación: `python3 scripts/audit_topic_integrity.py --criterion I4`
- **I5** `hecho` — Todo comando de ejecución apunta a un proyecto que el curso enseña a crear. En
  iOS, el esquema `RutaFlowApp` que usan 46 temas se crea en el capítulo 0, paso a paso.
  Verificación: `python3 scripts/audit_topic_integrity.py --criterion I5`
- **I6** `hecho` — Cada tema del atlas oficial tiene una decisión en
  `docs/official-topic-coverage.json`, con fragmentos que existen en `topic-index.json`. No queda
  ningún tema con decisión `hueco`.
  Verificación: `python3 scripts/audit_topic_integrity.py --criterion I6`

## Fuera de alcance (con motivo)

- Las capturas reales que requieren SDK o cuentas siguen el estado de `specs/visual-aids-scope.json`.
- La revisión humana individual de cada tema no se declara: estas mediciones son estructurales.
