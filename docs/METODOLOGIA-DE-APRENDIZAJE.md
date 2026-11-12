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

## Profundidad de los subtemas

Este nivel es universal. El tema profundo de lambdas sirve como patrón de
granularidad: antes de una API que dependa de un concepto, la persona estudia el
concepto mediante todos sus mecanismos y decisiones esenciales. Cada tema recibe
un mapa propio; no se replica mecánicamente la lista de lambdas en otros dominios.

Cada tema comienza con un mapa de subtemas, no con la redacción. El mapa distingue:

- prerrequisitos que deben enseñarse antes;
- mecanismo central sin el cual el tema no se comprende;
- variantes de sintaxis, API o arquitectura que cambian su uso;
- límites y decisiones profesionales;
- errores diagnosticables;
- extensiones avanzadas que pueden quedar para otro módulo.

Un subtema crítico no queda cubierto por mencionarlo. Debe responder qué cambia,
por qué cambia, cómo observarlo, cómo falla y qué debe resolver el estudiante sin
copiar. Puede reutilizar el proyecto del tema, pero necesita una evidencia propia y
localizable dentro de ese proyecto. Si un título agrupa subtemas con objetivos o
fallos diferentes, se divide en varios temas y se conectan sus prerrequisitos.

Ejemplo: «lambdas» no se reduce a `x -> x + 1`. Incluye interfaz funcional y método
SAM, tipo objetivo e inferencia, formas de sintaxis, captura efectivamente final,
alcance de `this`, referencias a métodos, resolución de sobrecargas, excepciones y
especializaciones primitivas. Cada parte crítica debe explicarse y practicarse.

## Regla para mostrar soluciones

La solución se consulta después de un intento verificable. Antes de abrirla, la persona escribe su predicción, el error encontrado o la decisión que tomó. Después compara, explica la diferencia y vuelve a implementar sin copiar línea por línea.

## Aplicación en el lector

El lector agrupa el capítulo en temas y, al pie de cada uno, muestra el avance **Tema N de M**, la marca explícita de tema leído y —cuando el autor escribió esa sección— el enlace a la práctica del capítulo. Las soluciones se mantienen plegadas y el último tema continúa hacia el capítulo siguiente. Esa secuencia está implementada. Los **modos de estudio «aprender / practicar / repasar» no existen en la aplicación**: se registran como deuda porque requieren práctica verificable por tema y hoy solo 11 de 252 módulos la tienen.

## Mantenimiento tecnológico

Las rutas que dependen de tecnologías con versiones se revisan contra fuentes primarias. El registro [`official-sources.json`](official-sources.json) guarda la línea estable o LTS de referencia, las notas de versiones, la guía de migración, la fecha de revisión y los términos incorporados al contenido.

La automatización mensual ejecuta la validación completa. Una revisión con más de 120 días falla deliberadamente para obligar a evaluar novedades, vulnerabilidades, retiros y cambios incompatibles. Una versión nueva no se incorpora por existir: primero se clasifica como estable, LTS, Current, preview o experimental y se añade una práctica de migración o compatibilidad verificable.

## Calidad del código en toda la academia

Clean Code y SOLID se evalúan transversalmente mediante el [estándar de código](ESTANDAR-DE-CODIGO.md). Todo ejemplo debe mostrar intención, cohesión, dependencias y errores explícitos, además de una verificación reproducible. SOLID se utiliza cuando resuelve una necesidad real; no se premian interfaces, capas o patrones añadidos únicamente para nombrar el principio.

## Ciclo de capítulo anterior (referencia)

Los capítulos que aún no migran a los cuatro pasos por subtema conservan este ciclo; sirve también para leer el material archivado en `docs/archivo/`:

1. **Objetivo visible.** La persona conoce el resultado que podrá demostrar y los temas concretos de la sección.
2. **Explicación breve.** Cada concepto responde qué es, cómo funciona, por qué importa y cuándo se utiliza.
3. **Demostración ejecutable.** El código se predice, ejecuta, modifica y relaciona con una salida observable.
4. **Construcción acumulativa.** El proyecto del track avanza en una rama por módulo; no se reemplaza por ejemplos desechables.
5. **Tarea sin solución visible.** La persona intenta primero. Las soluciones permanecen plegadas y sirven para comparar razonamiento, no para copiar.
6. **Punto de control.** Pruebas, comandos, capturas o mediciones demuestran que el incremento funciona.
7. **Código alcanzado.** Un commit y una etiqueta por módulo permiten volver al estado correcto y comparar cambios.
8. **Repaso activo.** La persona explica con sus palabras, responde preguntas y registra qué necesita reforzar.
