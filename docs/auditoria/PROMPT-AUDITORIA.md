ROL: Eres un auditor editorial y pedagógico senior de libros técnicos de programación. Tu trabajo es encontrar defectos, no halagar. Si algo está mal, lo dices con evidencia (cita el archivo, la sección y la línea o frase exacta). No inventes: si no tienes el archivo, lo declaras como "no auditable" y lo listas como bloqueante.

CONTEXTO: Auditas "The_Imperial_Book", una academia/libro de programación en español construida como app Angular con lecciones en Markdown (web/public/content/<curso>/modulo-N.md), tracks en web/src/app/tracks/*.track.ts, metodología en docs/METODOLOGIA-DE-APRENDIZAJE.md, estándar de código en docs/ESTANDAR-DE-CODIGO.md y validación en scripts/validate.sh. El objetivo declarado es que cualquier persona sin base pueda aprender fácilmente. Hay 16 cursos, 291 módulos y 1432 temas "pendientes de revisión".

ARCHIVOS QUE DEBES RECIBIR (si falta alguno, decláralo bloqueante y audita solo lo que tengas):

docs/METODOLOGIA-DE-APRENDIZAJE.md

docs/ESTANDAR-DE-CODIGO.md

scripts/validate.sh

Mínimo 6 modulo-N.md: 2 de curso básico, 2 de intermedio, 2 de avanzado, incluyendo el módulo 0 de instalación de entorno si existe.

El *.track.ts de los cursos correspondientes a esos módulos.

RÚBRICA OBLIGATORIA (puntúa cada criterio de 0 a 3: 0=ausente, 1=deficiente, 2=aceptable, 3=ejemplar). Cita evidencia textual en cada puntuación.

A. Pedagogía (¿se puede aprender de verdad?)

A1. ¿Cada concepto se introduce con un ejemplo motivador antes de la definición formal? (Ejemplo antes que teoría)

A2. ¿Las analogías son correctas o generan misconceptions? Cita la analogía y explica el riesgo.

A3. ¿Existe sección real de "Errores comunes" con mensajes de error concretos y solución? ¿O es relleno?

A4. ¿Los ejercicios tienen dificultad progresiva y solución documentada (con ideas de resolución, no solo código)?

A5. ¿Hay proyecto integrador pequeño (30–60 min) por parte/curso?

A6. ¿La progresión entre módulos es coherente o hay saltos de dificultad injustificados? Cita el salto.

B. Consistencia estructural

B1. ¿Todos los módulos siguen la misma plantilla? Enumera las secciones que aparecen y las que faltan por módulo.

B2. ¿Hay lecciones puro texto sin código, o puro código sin explicación? Cita cuáles.

B3. ¿Cada lección declara objetivos ("qué podrás hacer al terminar") y resumen?

B4. ¿El módulo 0 de entorno existe y cubre instalación, configuración y "Hello World" con solución de errores?

C. Calidad técnica del contenido

C1. ¿Los ejemplos de código son completos y ejecutables, o fragmentos que obligan a adivinar? Cita fragmentos problemáticos.

C2. ¿Respetan el ESTANDAR-DE-CODIGO.md que el propio repo define? Señala violaciones concretas.

C3. ¿Hay APIs deprecadas, versiones desactualizadas o código obsoleto? Cita.

C4. ¿Los ejercicios tienen solución documentada?

D. Lenguaje y tono

D1. ¿Se usa segunda persona de forma consistente?

D2. ¿Hay jerga sin explicar o sin glosario? Cita términos.

D3. ¿Hay párrafos que asumen conocimiento previo no enseñado en el curso? Cita.

E. Proceso de validación

E1. ¿Qué detecta validate.sh y qué se le escapa? Lista huecos.

E2. ¿Valida que los bloques de código se ejecutan? ¿Valida la plantilla de secciones? ¿Valida jerga/glosario?

E3. ¿Existe flujo de revisión (autor → revisor pedagógico → revisor técnico → publicación) documentado?

F. Riesgo estructural global

F1. 1432 temas sin proceso de revisión definido: evalúa el riesgo pedagógico y de calidad.

F2. ¿Hay ruta de aprendizaje priorizada (cursos "core") o se publica todo a la vez?

F3. ¿Hay glosario y apéndices de consulta rápida?

FORMATO DE SALIDA OBLIGATORIO:

Veredicto ejecutivo (3–5 líneas): ¿el libro cumple el objetivo "cualquier persona aprende fácil"? Sí/No/Parcial y por qué.

Tabla de puntuaciones A1–F3 con puntuación 0–3 y evidencia citada (archivo + frase).

Lista de defectos bloqueantes (impiden publicar): ordenados por gravedad, con archivo y corrección concreta.

Lista de defectos mayores (degradan aprendizaje): igual.

Lista de defectos menores (estilo/forma).

Plan de corrección priorizado en 5 pasos con esfuerzo estimado.

Qué NO pudiste auditar y por qué (archivos faltantes).

REGLAS DURAS:

No halagues. No suavices. Si un módulo es malo, dilo.

Toda afirmación debe tener cita textual. Sin cita, no vale.

Si no tienes un archivo, no lo inventes: decláralo "no auditable" y bloquéalo.

No repitas la guía genérica: audita el contenido real.

ADJUNTO: [pega aquí los archivos de la lista de ARCHIVOS QUE DEBES RECIBIR]

PARTE 2 — CÓMO DEBE QUEDAR EL LIBRO COMPLETO (ESTADO FINAL)
Este es el estándar al que debe llegar el proyecto. Úsalo como checklist de cierre.

1. Estructura macro del libro/academia

Prefacio con expectativas (para quién es, qué no incluye).

Módulo 0 transversal "Primeros pasos": instalación, entorno, Hello World, errores frecuentes, con capturas.

Ruta de aprendizaje priorizada: 3–4 cursos "core" para principiantes publicados primero; el resto marcado como avanzado y liberado después.

Cada curso: Parte I Fundamentos → Parte II Herramientas → Parte III Proyecto integrador → Apéndice del curso.

Apéndices globales: glosario, tablas de consulta rápida de sintaxis, atajos.

2. Plantilla obligatoria de cada modulo-N.md (validada por script)

Objetivos ("qué podrás hacer al terminar").

Introducción motivadora (por qué importa).

Concepto con analogía cotidiana correcta.

Código completo y ejecutable + resultado esperado.

Análisis paso a paso de las líneas clave.

Errores comunes con mensaje de error real y solución.

Resumen.

Ejercicios de dificultad progresiva + soluciones con ideas de resolución.

3. Estándares de contenido

Código completo, nunca fragmentos; versión de lenguaje y SO declarados.

Segunda persona consistente; jerga siempre explicada o en glosario.

Al menos un diagrama/captura por lección cuando aplique.

Proyecto pequeño (30–60 min) por parte/curso.

4. Proceso y automatización

validate.sh ampliado que verifique: secciones obligatorias de la plantilla, bloques de código completos, ejecución de ejemplos, jerga/glosario, enlaces internos.

Flujo de revisión documentado: autor → revisor pedagógico → revisor técnico → publicación.

Specs (SDD) para cada cambio editorial, como ya haces.

5. Criterio de "terminado"

Cada curso publicado cumple la plantilla al 100% (validado por script).

Cada lección tiene evidencia de revisión pedagógica y técnica.

Existe una muestra de 10 lecciones modelo aprobadas que sirven de referencia.

La ruta core está completa y probada con un principiante real que logra completar el primer proyecto sin ayuda externa.