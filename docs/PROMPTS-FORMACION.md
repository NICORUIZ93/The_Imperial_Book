# Prompts de formación profesional a partir de merged.pdf

Las páginas 1, 21, 54 y 55 contienen instrucciones dentro del documento. Se adaptan al objetivo del usuario, sin convertir una captura en autoridad ni copiar literalmente los textos. La página 49 contiene una afirmación sobre “Shadow Study” sin metodología ni fuente comprobable: no se presenta como método validado.

El lector ofrece cuatro prompts para **cada tema**, con su título, ruta y texto real como referencia. Se despliegan en «Prompts para estudiar y practicar este tema». Son editables y se copian con un botón; no envían contenido a servicios externos automáticamente. El texto se limita a 12.000 caracteres y cualquier recorte queda declarado. La implementación vive en `web/src/app/learning-prompts.ts`.

## Tutor paso a paso (página 1)

Explica qué es y para qué sirve en una frase. Usa una analogía sencilla indicando dónde deja de funcionar. Divide el mecanismo en pasos pequeños. Construye un ejemplo mínimo y un caso real con archivo, comando, explicación y salida. Expón tres errores concretos, diagnóstico y corrección. Pregunta una cosa por vez y espera respuesta. Si falla, ofrece otra explicación antes de mostrar solución. Cierra con una tarea que pueda hacerse hoy y evidencia para avanzar.

El tono será accesible para una persona principiante y mantendrá precisión profesional. Una analogía facilita entrada; luego hay que enseñar sintaxis, contratos, dependencias y límites reales.

## Ruta de 30 pasos (página 21)

Genera exactamente 30 pasos, agrupados en fundamentos, aplicación, integración y decisiones profesionales. Cada paso declara prerrequisito, objetivo medible, ejemplo básico, caso real, práctica y evidencia. No se promete nivel experto por completar una lista ni en un número fijo de días.

## Revisión profesional (página 55)

Escribe con claridad, párrafos breves y vocabulario concreto. Conserva hechos, unidades, código y referencias. Define términos en su primera aparición; señala lo que falta comprobar. No introduce faltas intencionales, biografías o anécdotas inventadas para disimular autoría. La redacción natural debe hacer el tema comprensible, no rebajar su exactitud.

## Informe con evidencia (adaptación de página 54)

Define pregunta, alcance, método, fuentes primarias consultadas, ejemplo reproducible, resultados observados, límites y conclusiones. Empieza pequeño y amplía solo con evidencia. El prompt de la captura pedía simular meses de trabajo y añadir errores: esas partes no sirven al objetivo de formación y se sustituyen por registro honesto de trabajo, fuentes y pruebas. No se inventan referencias ni una tesis supuestamente realizada durante meses.

## Criterio profesional aplicado a todas las rutas

Un tema debe enseñar definición y mecanismo, partir de un ejemplo básico y llegar a un problema real; indicar prerrequisitos, archivo, ejecución, salida, errores, práctica independiente, decisión de uso y evidencia. El contrato editorial y las auditorías se conservan como controles separados. Los prompts y preguntas no generan una calificación, ni marcan progreso, ni subsanan contenido ausente.

Antes de aceptar una ampliación, compara la afirmación con documentación primaria, ejecuta su ejemplo cuando el entorno lo permita y registra lo que no se pudo comprobar. No contabilices un título o una referencia como dominio de la materia.
