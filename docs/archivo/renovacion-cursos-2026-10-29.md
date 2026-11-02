# Renovación de cursos y experiencia de estudio

## Cambios entregados

Se renovaron catálogo y lector con una identidad azul, navegación por áreas, búsqueda que consulta títulos reales de temas, requisitos y evidencia por curso, tarjetas de contenido, tipografía sin titulares condensados forzados, texto sin justificación, controles móviles y navegación lateral de lectura. El proyecto de la ruta es plegable para llegar antes a la lección. Se retiró la preparación genérica duplicada de la interfaz: las instrucciones concretas permanecen en el Markdown de cada curso. El capítulo anterior se identifica como orden de lectura, sin inventar una dependencia conceptual obligatoria.

Se añadieron 14 laboratorios, uno por ruta, con código completo, preparación, comando, resultado esperado, fallo, práctica independiente y límites. Están trazados en `examples/professional-bridges/manifest.json`: HTML/CSS, formularios accesibles, cursor y límites, rollback, restauración, compatibilidad de contratos, borradores Angular, carreras React, timeouts Java, cancelación Swift, tiempo determinista Kotlin, restauración Android/Flutter y paginación Spring.

Se repararon la demostración inicial de ExecutorService y la de React Query: archivos completos, dependencias, proveedor, datos locales y comandos verificables. Se corrigieron cuatro comandos genéricos incorrectos de Fundamentos: Git, HMAC, HTML y un artefacto de diseño. Los metadatos e índices incorporan los temas nuevos sin cambiar IDs históricos ni el esquema de progreso.

## Cobertura de revisión

- Revisión estructural de los 1.076 temas, 241 módulos y 14 cursos: `course-depth-review.md` / `.json`. Cada tema tiene un registro. Las alertas requieren lectura editorial; no son errores confirmados ni temas ausentes por sí mismas. La ausencia de alertas tampoco prueba calidad.
- Prioridades específicas de secuencia y evidencia para los 14 cursos, junto con requisitos observables visibles en la interfaz. Se consultaron documentación primaria de MDN, Angular, React, Java, Node, Spring, Android, Flutter y Kotlin, además de AWS Well-Architected y Google SRE. Las páginas de Apple y algunos enlaces Kotlin tienen limitaciones de extracción; no se presentan como revisión completa de esos catálogos.
- El PDF suministrado conserva sus 69 destinos trazados; se comprobó su identidad con `validate_merged_pdf.py` y se reprodujeron los 17 modelos que valida ese control. Sus instrucciones internas no se ejecutan como órdenes del usuario.
- Navegador: barrido estructural de las 241 páginas y 1.076 temas, sin incidencias detectadas por ese barrido (`browser-course-review.json`). Esto comprueba carga, cantidad de temas, estados de error y geometría de diagramas; no ejecuta todos los ejercicios.
- Chrome: 42 pruebas E2E correctas, escritorio y móvil, con cierre 0. Incluyen filtros, búsqueda real, teclado, navegación, persistencia, descarga y restauración.
- Unitarias Angular: 14 correctas. Pruebas Python: 15 casos, cuatro omitidos por herramientas PostgreSQL.
- Ejemplos nuevos: 13 laboratorios con comprobación técnica delimitada; Android queda pendiente. Véase `examples/professional-bridges/verification.json`. Swift fue consola, Kotlin solo JVM y Flutter usó el canal preinstalado de desarrollo; no se acreditan simuladores, todos los destinos KMP ni versiones estables no probadas.
- El build pasa con advertencia del bundle inicial de 617,23 kB frente al aviso de 600 kB. No se aumentó el presupuesto para esconderla.

## Trabajo pendiente

La revisión pedagógica con personas principiantes sigue pendiente. El nuevo registro de profundidad identifica dudas que los marcadores anteriores no detectaban: clases solicitadas sin implementación visible, scripts de test cuya configuración debe comprobarse, fragmentos y demostraciones breves. No se presenta la presencia de siete pasos como cierre de esa deuda.

Los siguientes lotes deben completar esas demostraciones, ejecutar ejemplos históricos por riesgo y contrastar aprendizaje real. Android requiere compilación y pruebas de recreación/proceso en dispositivo. Los laboratorios cloud/DevOps locales no sustituyen ensayos de recuperación y despliegue reales. No se declara que todos los cursos estén completos de cero a profesional por haber añadido estos laboratorios.
