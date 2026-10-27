# Contrato editorial de The Imperial Book

Este contrato adapta patrones pedagógicos observados en los libros técnicos de la biblioteca local: progresión por capítulos, mapa conceptual, ejemplo acumulativo, síntesis, fallo diagnosticable y práctica aplicada. No autoriza copiar texto, diagramas ni ejercicios de los libros.

## Unidad mínima: un tema explicado y practicable

Cada `### Tema` debe responder, en orden, estas preguntas:

1. **Qué construirás:** un resultado concreto, no “conocer” una tecnología.
2. **Por qué importa:** problema que resuelve y decisión que habilita.
3. **Qué necesitas:** conceptos y herramientas previamente aprendidos.
4. **Dónde trabajarás:** árbol breve, ruta exacta y responsabilidad del archivo.
5. **Qué escribirás:** código específico, ejecutable y explicado por bloques.
6. **Cómo lo ejecutarás:** preparación y comando reproducible por plataforma cuando cambie.
7. **Qué observarás:** salida, estado visual o prueba verificable.
8. **Cómo puede fallar:** error deliberado, causa y procedimiento de diagnóstico.
9. **Qué modificarás:** cambio que exige predecir y razonar, no volver a copiar.
10. **Cómo crece RutaFlow:** incremento pequeño conectado al proyecto del track.
11. **Cuándo no usarlo:** límites, alternativas y diferencias con producción.
12. **Qué evidencia entregarás:** archivo, prueba, salida o captura técnica necesaria para avanzar.

## Progresión de libro

Los capítulos avanzan por cuatro niveles y no deben saltarse dependencias:

| Nivel | Pregunta dominante | Evidencia |
|---|---|---|
| Fundamentos | ¿Qué es y cómo funciona? | Ejemplo mínimo explicado |
| Aplicación | ¿Cómo lo uso correctamente? | Funcionalidad ejecutable |
| Integración | ¿Cómo colabora con otras piezas? | Incremento RutaFlow probado |
| Experto | ¿Cómo decido, opero y recupero? | Medición, fallo y runbook |

## Código y recursos visuales

- Un bloque de código debe indicar archivo, lenguaje, propósito y forma de ejecución.
- Los comentarios explican decisiones o riesgos; no traducen cada línea a español.
- Mermaid se reserva para arquitectura, secuencia, estados, datos o dependencias.
- Un diagrama Archify puede enlazarse como HTML interactivo desde `web/public/visuals/`; su tema debe conservar la explicación en Markdown y el enlace local debe apuntar a un artefacto existente.
- Las tablas se usan para comparar dimensiones repetidas.
- Una imagen decorativa no cuenta como evidencia pedagógica.

## Regla de aceptación

Un tema no está terminado porque aparezca en el índice. Debe cumplir simultáneamente explicación, código, ubicación, ejecución, resultado, práctica, conexión con el proyecto, modelo mental y límites. La puntuación `rubricScore` es descriptiva: no compensa criterios ausentes. Las plantillas genéricas y las demostraciones clonadas no se aceptan. Los informes generados permanecen como deuda hasta que el Markdown editorial específico cumpla el contrato.

La auditoría automatizada detecta presencia editorial; no ejecuta todos los ejemplos ni acredita aprendizaje. Las pruebas de producto, la metodología de siete pasos y la revisión de código y visuales se informan por separado. CI exige los nueve criterios mediante `audit_topic_learning_quality.py --check --require-practicable`.

## Aplicación de los prompts de merged.pdf

El lector incluye tutoría, plan de 30 pasos, revisión profesional e informe con evidencia para todos los temas. Consulta [PROMPTS-FORMACION.md](PROMPTS-FORMACION.md). Toda ampliación conecta un ejemplo básico con un caso real, mantiene precisión y separa resultados ejecutados de salidas previstas. Las ayudas globales no se cuentan como contenido específico ni elevan puntuaciones editoriales.
