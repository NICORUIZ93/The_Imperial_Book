# Guía de redacción — 1 página (Estándar editorial de la plataforma)

> Aplica a todos los cursos y tracks: Java, Spring Boot, Node.js, Microservicios, Fundamentos, Práctica guiada, Integración, Diagnóstico profesional y futuros.  
> **Regla madre:** intuición antes que rigor, concreto antes que abstracto, y el lector nunca se pierde.

## Las 10 reglas editoriales

1. **Intuición antes que rigor.** Empieza por el problema real y el “por qué existe”. La mecánica, la sintaxis y los trade-offs van después.
2. **Concreto antes que abstracto.** Usa un ejemplo específico antes de nombrar la generalización. El mismo dominio debe sostener el tema completo.
3. **Una pregunta por sección.** Cada encabezado responde una pregunta. Si una sección no responde nada nuevo, se corta o se fusiona.
4. **Voz activa, cercana y precisa.** Escribe “Vas a construir…”, “Notarás que…”. Evita voz pasiva corporativa, condescendencia y muletillas: “simplemente”, “obviamente”, “como todos saben”.
5. **Progresiva divulgación.** Orden fijo: intuición → mecánica → trade-offs → cuándo NO usarlo. Cada capa asume solo lo anterior; lo ya explicado se referencia, no se repite.
6. **Definir o enlazar al instante.** Todo término nuevo se define en la misma frase o se enlaza a un tema previo. El lector no debe salir a “adivinar”.
7. **Capa 1 = lectura; Capa 2 = construcción.** En Capa 1 no hay comandos, rutas, outputs ni configuraciones por defecto; solo si un fragmento ≤3 líneas aclara más que prosa y lleva una frase que explique qué demuestra. Código completo, comandos y verificación van en Capa 2 colapsable.
8. **Capa 2 es guiada y verificable.** Cada bloque de código declara “archivo X → hace Y”. Un archivo por bloque, outputs cortos (≤3 líneas), comandos con contexto (“para qué / qué deberías ver”), construcción guiada antes de código de referencia, y verificación automática en repo.
9. **Decisiones con trade-off y límite.** Toda decisión técnica relevante incluye al menos 2 alternativas y cuándo NO usar cada una. Cada curso incluye ≥3 ejercicios cuya respuesta correcta sea “NO usar X”.
10. **Consistencia transversal.** Español neutro, sin prosa en bloques >5 líneas, tablas con 3-5 filas, diagramas con flechas/palabras. Los cursos son independientes, las herramientas visuales son gratuitas o de bajo costo, y el tono es motivador sin condescendencia.

## Checklist rápido antes de publicar

- [ ] Capa 1 completa: de qué trata, idea en una frase, por qué existe, analogía, cómo funciona, lo que puede salir mal, trade-offs, cuándo no usar, vuelta a analogía, recordar, 3 preguntas.
- [ ] Ningún término nuevo quedó sin definir/enlazar.
- [ ] Capa 2: cada bloque tiene propósito, un archivo, output corto, contexto de comando, verificación automática.
- [ ] Hay ≥2 alternativas con trade-off y ≥3 ejercicios “NO usar X” en el curso.
- [ ] Sin duplicación, sin relleno, sin voz pasiva corporativa.
