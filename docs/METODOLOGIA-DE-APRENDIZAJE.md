# Metodología Aprende construyendo

The Imperial Book utiliza una metodología propia de enseñanza práctica. Toma como referencia patrones públicos presentes en cursos técnicos claros y orientados a proyectos: anunciar los temas, explicar en partes pequeñas, demostrar, dejar una tarea antes de enseñar la solución, conservar el código alcanzado y cerrar con repaso.

No reproduce clases, guiones, ejercicios ni materiales de terceros, y no implica afiliación con ningún instructor o plataforma.

## Ciclo de cada capítulo

1. **Objetivo visible.** La persona conoce el resultado que podrá demostrar y los temas concretos de la sección.
2. **Explicación breve.** Cada concepto responde qué es, cómo funciona, por qué importa y cuándo se utiliza.
3. **Demostración ejecutable.** El código se predice, ejecuta, modifica y relaciona con una salida observable.
4. **Construcción acumulativa.** El proyecto del track avanza en una rama por módulo; no se reemplaza por ejemplos desechables.
5. **Tarea sin solución visible.** La persona intenta primero. Las soluciones permanecen plegadas y sirven para comparar razonamiento, no para copiar.
6. **Punto de control.** Pruebas, comandos, capturas o mediciones demuestran que el incremento funciona.
7. **Código alcanzado.** Un commit y una etiqueta por módulo permiten volver al estado correcto y comparar cambios.
8. **Repaso activo.** La persona explica con sus palabras, responde preguntas y registra qué necesita reforzar.

## Tamaño de las experiencias

Un capítulo combina conceptos pequeños con un incremento manejable. Los proyectos extensos se dividen en hitos que entregan valor por sí solos. Esto evita que una sola aplicación concentre demasiadas horas sin puntos claros de cierre.

Cada track utiliza tres escalas:

- **Ejemplo corto:** demuestra un mecanismo aislado en pocos minutos.
- **Tarea:** obliga a transferir el mecanismo sin seguir exactamente los mismos pasos.
- **Proyecto acumulativo:** integra lo aprendido con arquitectura, pruebas, seguridad y operación.

## Regla para mostrar soluciones

La solución se consulta después de un intento verificable. Antes de abrirla, la persona escribe su predicción, el error encontrado o la decisión que tomó. Después compara, explica la diferencia y vuelve a implementar sin copiar línea por línea.

## Aplicación en el lector

El lector agrupa el capítulo en temas y, al pie de cada uno, muestra el avance **Tema N de M**, la marca explícita de tema leído y —cuando el autor escribió esa sección— el enlace a la práctica del capítulo. Las soluciones se mantienen plegadas y el último tema continúa hacia el capítulo siguiente. Esa secuencia está implementada. Los **modos de estudio «aprender / practicar / repasar» no existen en la aplicación**: se registran como deuda porque requieren práctica verificable por tema y hoy solo 11 de 252 módulos la tienen.

## Mantenimiento tecnológico

Las rutas que dependen de tecnologías con versiones se revisan contra fuentes primarias. El registro [`official-sources.json`](official-sources.json) guarda la línea estable o LTS de referencia, las notas de versiones, la guía de migración, la fecha de revisión y los términos incorporados al contenido.

La automatización mensual ejecuta la validación completa. Una revisión con más de 120 días falla deliberadamente para obligar a evaluar novedades, vulnerabilidades, retiros y cambios incompatibles. Una versión nueva no se incorpora por existir: primero se clasifica como estable, LTS, Current, preview o experimental y se añade una práctica de migración o compatibilidad verificable.

## Calidad del código en toda la academia

Clean Code y SOLID se evalúan transversalmente mediante el [estándar de código](ESTANDAR-DE-CODIGO.md). Todo ejemplo debe mostrar intención, cohesión, dependencias y errores explícitos, además de una verificación reproducible. SOLID se utiliza cuando resuelve una necesidad real; no se premian interfaces, capas o patrones añadidos únicamente para nombrar el principio.
