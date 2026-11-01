# Prototipo editorial: seis contextos

El prototipo comprueba que el mismo contrato de estudio funciona en experiencias distintas antes
de ampliar la migración. Los módulos aquí listados son candidatos representativos; aparecer en
esta lista no significa que su contenido, ejemplo o interfaz ya hayan sido reescritos o validados.

| Contexto | Módulo candidato | Qué debe probar |
|---|---|---|
| Principiante | `foundations/modulo-0.md` | Primera explicación técnica, preparación del entorno y primer resultado comprobable. |
| Intermedio | `javascript/modulo-8.md` | Aplicación de conceptos previos y diagnóstico de una variación real. |
| Avanzado | `java/modulo-22.md` | Decisiones de arquitectura, límites y evidencia de comportamiento. |
| Lectura extensa | `node/modulo-12.md` | Orientación, división legible y continuidad sin perder el contexto del capítulo. |
| Móvil y accesibilidad | `android/modulo-14.md` | Lectura, navegación por teclado, controles táctiles y ausencia de desbordamiento. |
| Backend y arquitectura | `spring-boot/modulo-22.md` | Flujo completo entre modelo, persistencia, ejecución, fallo y verificación. |

## Puerta de validación

Antes de ampliar el cambio, para cada candidato hay que registrar por separado:

- revisión estructural del Markdown y compatibilidad con los metadatos del curso;
- resultado real de ejecutar el ejemplo y observar el resultado esperado;
- navegación y renderizado de la página en escritorio y móvil;
- revisión con teclado y preferencias de movimiento reducido cuando corresponda;
- revisión pedagógica humana, distinta de los indicadores automáticos.

Conservar los identificadores, URLs y anclas que usan el lector y el progreso existente. No
introducir cuestionarios generados, puntos, insignias ni mensajes que equiparen «marcado como
leído» con aprendizaje acreditado.

## Estado

El corte del 1 de noviembre de 2026 comprobó en Chrome 111/111 páginas de los seis tracks
seleccionados: 0 errores y 0 advertencias de renderizado, navegación, controles de progreso o
enlaces detectados por el barrido. Esto es una comprobación estructural de navegador, no una
revisión visual completa.

Se ejecutaron los ejemplos de `foundations/modulo-0.md`, `java/modulo-22.md`,
`node/modulo-12.md` y `spring-boot/modulo-22.md`: 4/6. Quedan por ejecutar el ejemplo DOM de
`javascript/modulo-8.md` en el proyecto con Vite y la prueba instrumentada de
`android/modulo-14.md` en un proyecto Compose con dispositivo o emulador.

La revisión pedagógica humana firmada sigue en 0/6. Tampoco se completó para los seis candidatos
una revisión manual de teclado, preferencias de movimiento reducido y tamaños de pantalla.
El prototipo aún no autoriza la migración por rutas; los pendientes deben cerrarse y registrarse
antes de ampliar el cambio.
