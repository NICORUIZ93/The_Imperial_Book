# Experiencia de estudio: contrato editorial y de interfaz

Este contrato guía la mejora progresiva de The Imperial Book. No certifica el estado actual de
las lecciones: el contenido real sigue siendo el Markdown en
`web/public/content/<ruta>/modulo-N.md`, y cada cambio debe verificarse en el lector Angular.

## Principios de aprendizaje

- Empezar por una situación concreta, explicar por qué importa y definir un resultado observable.
- Construir un modelo mental preciso antes de introducir una API o una lista de términos.
- Conectar explicación, código, ejecución y evidencia: indicar qué archivo crear, dónde, qué
  comando ejecutar y qué salida o comportamiento observar.
- Introducir un fallo deliberado que el estudiante pueda reproducir, diagnosticar y corregir.
- Pasar de una práctica guiada a una variación independiente y explicar cómo comprobarla.
- Cerrar con límites, evidencia obtenida y una conexión explícita con el siguiente tema o proyecto.
- Usar el caso de RutaFlow cuando ayude a dar continuidad; no forzar su aparición en toda idea.

La secuencia es una guía narrativa, no una plantilla de siete encabezados. Cada tema debe conservar
su explicación específica, sus decisiones técnicas y sus ejemplos; no reemplazarla por un formato
genérico, una imagen, una lista de objetivos ni un marcador de auditoría. Los prerrequisitos han de
estar disponibles o identificarse con claridad. Una marca de progreso solo registra una acción del
lector y nunca se presenta como prueba de dominio.

## Contrato de cada tema

Antes de migrar un tema, una persona debe poder responder desde su contenido:

1. ¿Qué problema concreto resuelve y qué podrá hacer el estudiante al terminar?
2. ¿Qué conceptos explican el mecanismo y cuáles son sus límites o alternativas?
3. ¿Qué archivo se crea, en qué ruta y con qué contenido mínimo funcional?
4. ¿Qué comando lo ejecuta y qué resultado observable se espera?
5. ¿Qué error intencional se puede provocar, qué evidencia lo diagnostica y cómo se corrige?
6. ¿Qué práctica guiada conduce a una variación independiente verificable?
7. ¿Qué evidencia conviene conservar y cómo prepara el tema siguiente?

No todos los temas requieren la misma extensión ni las mismas herramientas. La profundidad se
mide por la explicación, las decisiones y la verificación específicas, no por contar encabezados,
bloques de código o palabras clave.

## Contrato del lector

- Mantener una jerarquía clara entre ruta, módulo, tema, explicación, ejemplo y práctica.
- Hacer visibles el tema anterior/siguiente y el retorno a la ruta sin depender del color.
- Conservar navegación por teclado, foco perceptible, etiquetas accesibles y objetivos táctiles
  cómodos, especialmente en móvil.
- Respetar `prefers-reduced-motion` y ofrecer interacción manual cuando una figura use movimiento.
- Mantener el contenido legible en una columna; diagramas y código pueden desplazarse de forma
  local sin crear desbordamiento horizontal en la página.
- Preservar el progreso local existente y sus claves de almacenamiento. El progreso es una ayuda
  de navegación, no una calificación.
- Exponer errores de carga y fallos de renderizado de forma explícita; no presentar contenido
  ausente como si se hubiera cargado.

## Prototipo y límites de alcance

Validar primero los seis contextos enumerados en
[`ACADEMIA-PROTOTIPO-6-CONTEXTOS.md`](./ACADEMIA-PROTOTIPO-6-CONTEXTOS.md). No iniciar una
migración masiva hasta revisar esos contextos en navegador, teclado y móvil, ejecutar los ejemplos
representativos y ajustar el contrato a los hallazgos. Después, migrar por lotes pequeños y
reversibles, conservando rutas, anclas, metadatos y progreso.

Los informes deben separar: temas listados, explicación y práctica detectadas estructuralmente,
ejemplos realmente ejecutados, páginas comprobadas en navegador y temas revisados por una persona.
Una auditoría automatizada o un pre-read de IA no equivale a una revisión pedagógica humana ni a
una certificación.
