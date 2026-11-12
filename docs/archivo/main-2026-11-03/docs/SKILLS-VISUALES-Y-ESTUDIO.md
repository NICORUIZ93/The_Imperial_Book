# Skills para visuales y estudio desde cero

Selección del 14 de octubre de 2026, a partir del catálogo oficial `openai/skills`,
el directorio Skills.sh y la inspección de repositorios originales. Se instala
una selección pequeña en el entorno personal de Codex, con revisiones fijadas;
no se descargan catálogos completos ni se añaden librerías a Angular por instalar
una skill. El manifiesto `skills-visual-learning.json` registra fuentes, revisiones
y existencia de los archivos instalados.

## Selección y uso

| Skill | Fuente original | Aplicación en la academia |
|---|---|---|
| archify | [tt-a1i/archify](https://github.com/tt-a1i/archify) | Componentes, llamadas, flujos de datos, estados y recorrido del estudiante en HTML/SVG interactivo |
| manimce-best-practices | [adithya-s-k/manim_skill](https://github.com/adithya-s-k/manim_skill) | Animaciones explicadas de algoritmos, ecuaciones, circuitos y señales |
| svg-animation | [iart-ai/web-animation-skills](https://github.com/iart-ai/web-animation-skills) | Diagramas y trazas con movimiento dentro de la web Angular |
| accessible-animation | [iart-ai/web-animation-skills](https://github.com/iart-ai/web-animation-skills) | Pausa, alternativa estática, movimiento reducido y revisión de ambos modos |
| webapp-testing | [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main/skills/webapp-testing) | Recorrido real, botones, búsquedas, errores, navegación y progreso |
| web-design-reviewer | [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main/skills/web-design-reviewer) | Legibilidad, desbordes, responsive, teclado y revisión visual |
| scope-and-sequence-designer | [education-agent-skills](https://github.com/garethmanning/education-agent-skills) | Orden de cursos, dependencias y saltos de dificultad |
| backwards-design-unit-planner | [education-agent-skills](https://github.com/garethmanning/education-agent-skills) | Objetivo → evidencia de comprensión → actividades que preparan esa evidencia |
| competency-unpacker | [education-agent-skills](https://github.com/garethmanning/education-agent-skills) | Objetivos observables, conocimientos previos, errores y criterios de éxito |

`imagegen` y `visualize` ya están disponibles en la sesión: el primero sirve para
ilustraciones raster; el segundo para visualizaciones en conversación. No se
instalan duplicados. Los gráficos científicos exportables se producen con
herramientas de plotting; las cifras, etiquetas y relaciones técnicas se conservan
en código o SVG, para poder revisarlas.

Archify valida sus propios diagramas; no reemplaza Playwright ni valida toda la
academia. Tampoco genera gráficas numéricas como especialidad principal. Manim
produce video a partir de código y requiere su runtime y dependencias: instalar
su skill no resuelve automáticamente Cairo, Pango o FFmpeg. Las 74 escenas
existentes conservan su estado de verificación en `examples/manim/README.md`.

## Recorrido que debe comprobarse

| Momento | Pregunta de una persona principiante | Evidencia necesaria |
|---|---|---|
| Llegada | ¿Qué puedo aprender y dónde empiezo? | Entrada clara a Fundamentos, sin exigir elegir una tecnología desconocida |
| Primera sesión | ¿Qué es un archivo, una carpeta y la terminal? | Lección inicial con acciones guiadas y vocabulario definido |
| Preparación | ¿Qué instalo en mi sistema y cómo sé que funciona? | Instrucciones por sistema, versión comprobada y diagnóstico de instalación |
| Concepto | ¿Qué es esto y para qué sirve? | Una frase, analogía con límites y mecanismo real |
| Ejemplo mínimo | ¿Qué archivo creo y qué escribo? | Ruta, contenido completo, dependencias y comentarios que explican decisiones |
| Ejecución | ¿Dónde escribo el comando y qué debería ver? | Directorio de trabajo, comando, salida y condiciones del entorno |
| Visual | ¿Qué representa cada flecha, estado o variable? | Leyenda, secuencia explicada y versión accesible sin animación |
| Práctica guiada | ¿Cómo empiezo a resolverlo? | Pistas graduales con un cambio específico y predicción previa |
| Práctica independiente | ¿Puedo resolver otro caso sin copiar? | Problema nuevo, entradas y resultado o invariantes verificables |
| Diagnóstico | ¿Qué hago si falla? | Error reproducible, hipótesis, comprobación y corrección |
| Comprensión | ¿Puedo explicar por qué funcionó? | Preguntas una por una, evidencia ejecutada y explicación propia |
| Continuidad | ¿Cuál es el siguiente paso y qué debo saber antes? | Dependencias conceptuales y navegación que conserva el progreso |
| Proyecto | ¿Cómo se aplica a un producto real? | Incrementos, contratos, pruebas, decisiones y límites de producción |
| Cierre | ¿Qué aprendí y dónde está mi trabajo? | Archivos del estudiante, evidencia y copia restaurable del progreso |

Para alguien con cero experiencia, no uses conceptos desconocidos para explicar
otros conceptos desconocidos. Primero demuestra una acción pequeña, luego nombra
su mecanismo, después aumenta la dificultad. Las especialidades reutilizan
conocimientos demostrados en Fundamentos; completar toda la biblioteca no exige
aprender primero PLC para poder comenzar Java, aunque ambos pertenezcan al track
base. El grafo generado de orden editorial es una ayuda: la revisión curricular
debe distinguir orden de lectura de dependencia conceptual obligatoria.

## Cómo usar las skills en una revisión

1. Lee catálogo, rutas, preparación del módulo 0 y contrato del proyecto del track.
2. Usa las tres skills pedagógicas para alinear conocimientos previos, objetivo,
   ejemplo, ejercicio y evidencia con los prompts del PDF.
3. Revisa todo el Markdown con las auditorías existentes y conserva su backlog;
   selecciona ejemplos por riesgo para ejecución real. Registra alcance exacto.
4. Diseña el visual solo si responde una pregunta que texto o tabla no resuelven
   mejor. Para Archify conserva candidato, relaciones y recibo de validación.
5. Prueba la web en navegador, incluyendo fallos, teclado, móvil, cambio de tema,
   movimiento reducido, avance, backup y restauración.
6. Captura y revisa el resultado. Si un comando o ejercicio no pudo ejecutarse,
   queda pendiente; una skill instalada no lo convierte en prueba realizada.

## Límites y estado inicial

El proyecto tiene 14 tracks, 245 módulos y 1100 temas. La auditoría existente de
siete pasos detecta los marcadores completos en 1100 temas. Esa medición es
estructural y no acredita comprensión ni revisión técnica completa. El índice,
el build y pruebas de navegación de la integración previa están documentados en
`merged-pdf-review.md`; no se reinterpretan como ejecución de todos los cursos.

Las comprobaciones automáticas no sustituyen una prueba de uso con personas
principiantes. Una skill puede ayudar a detectar barreras y proponer correcciones,
pero no garantiza que cualquier persona aprenderá ni que no quede ningún defecto.

## Primera integración verificable

El catálogo ofrece un acceso directo a Fundamentos 0, explica cómo trabajar un tema y enlaza un [mapa Archify del recorrido recomendado](../web/public/visuals/recorrido-estudio.html). Su [candidato reproducible](../examples/archify/recorrido-estudio.workflow.json) y [registro de verificación](../examples/archify/verification.json) quedan en el proyecto. Se comprobaron esquema, composición, entrega y navegador; además se inspeccionaron capturas en claro/oscuro a 1440×900 y 2048×1320. Es una guía de estudio: no prueba que todos los ejercicios ya estén completos.

Las nueve skills quedaron instaladas con sus archivos de apoyo; el manifiesto identifica la revisión exacta. Estarán disponibles para su selección automática a partir del siguiente turno. Los prompts, el contrato editorial y `AGENTS.md` conectan su uso con el trabajo de la academia.
