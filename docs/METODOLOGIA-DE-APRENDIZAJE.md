# Metodología Aprende construyendo

The Imperial Book utiliza una metodología propia de enseñanza práctica. Toma como referencia patrones públicos presentes en cursos técnicos claros y orientados a proyectos: anunciar los temas, explicar en partes pequeñas, demostrar, dejar una tarea antes de enseñar la solución, conservar el código alcanzado y cerrar con repaso.

No reproduce clases, guiones, ejercicios ni materiales de terceros, y no implica afiliación con ningún instructor o plataforma.

## Estructura de tema y subtema

Un tema es una sesión de **20–45 minutos**. Si introduce más de tres conceptos nuevos, se separa en temas distintos. Cada tema tiene **3–6 subtemas de 5–15 minutos** y cierra con cuatro evidencias verificables.

Cada subtema usa cuatro pasos, en este orden:

1. **Contexto:** qué problema del proyecto resuelve y qué hace falta saber antes.
2. **Hazlo tú:** en los primeros dos minutos se ejecuta o modifica algo. Incluye ruta exacta, código completo o archivo del laboratorio, comando, salida esperada y un fallo deliberado con su diagnóstico.
3. **Entiende:** explica con palabras sencillas qué pasó, por qué funciona y un límite importante.
4. **Cierra:** registra la evidencia producida y qué cambio queda listo para el siguiente subtema.

Los cuatro pasos describen cada subtema, no cuatro secciones largas de teoría. La prueba, salida o artefacto es la evidencia; leer o marcar el tema no demuestra comprensión.

### Hito al final de cada tema

Usa una lista de cuatro comprobaciones observables, por ejemplo: ejecuté el código, vi la salida, provoqué y diagnostiqué el fallo, y expliqué la decisión con una limitación. No se añaden puntos, insignias ni cuestionarios generados.

### Ruta del proyecto

Cada track mantiene un proyecto que evoluciona. El ejemplo aislado enseña una acción; el subtema la incorpora al proyecto; el hito deja una salida reproducible. No se crea una aplicación nueva por tema si el proyecto existente puede avanzar.

## Tamaño de las experiencias

Un capítulo combina conceptos pequeños con un incremento manejable. Los proyectos extensos se dividen en hitos que entregan valor por sí solos. Esto evita que una sola aplicación concentre demasiadas horas sin puntos claros de cierre.

Cada track utiliza tres escalas:

- **Ejemplo corto:** demuestra un mecanismo aislado en pocos minutos.
- **Tarea:** obliga a transferir el mecanismo sin seguir exactamente los mismos pasos.
- **Proyecto acumulativo:** integra lo aprendido con arquitectura, pruebas, seguridad y operación.

## Regla para mostrar soluciones

La solución se consulta después de un intento verificable. Antes de abrirla, la persona escribe su predicción, el error encontrado o la decisión que tomó. Después compara, explica la diferencia y vuelve a implementar sin copiar línea por línea.

## Evidencia de aprendizaje

Ver una explicación no equivale a dominarla. Cada capítulo termina con cinco tipos posibles de evidencia:

- artefacto funcional;
- prueba automatizada o comprobación manual reproducible;
- explicación del mecanismo;
- decisión con alternativas y límites;
- commit etiquetado y README actualizado.

La rúbrica común exige implementación y verificación. En niveles avanzados también exige justificar trade-offs, medir comportamiento y preparar recuperación frente a fallos.

## Aplicación en el lector

El lector presenta permanentemente la secuencia **Objetivo → Explicación → Demostración → Tarea → Repaso**. Las introducciones de sección explican qué hacer, el laboratorio muestra el resultado esperado, las soluciones se mantienen plegadas y los modos de estudio permiten concentrarse en aprender, practicar o repasar.

## Mantenimiento tecnológico

Las rutas que dependen de tecnologías con versiones se revisan contra fuentes primarias. El registro [`official-sources.json`](official-sources.json) guarda la línea estable o LTS de referencia, las notas de versiones, la guía de migración, la fecha de revisión y los términos incorporados al contenido.

La automatización mensual ejecuta la validación completa. Una revisión con más de 120 días falla deliberadamente para obligar a evaluar novedades, vulnerabilidades, retiros y cambios incompatibles. Una versión nueva no se incorpora por existir: primero se clasifica como estable, LTS, Current, preview o experimental y se añade una práctica de migración o compatibilidad con evidencia.

## Calidad del código en toda la academia

Clean Code y SOLID se evalúan transversalmente mediante el [estándar de código](ESTANDAR-DE-CODIGO.md). Todo ejemplo debe mostrar intención, cohesión, dependencias y errores explícitos, además de una verificación reproducible. SOLID se utiliza cuando resuelve una necesidad real; no se premian interfaces, capas o patrones añadidos únicamente para nombrar el principio.
