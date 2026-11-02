# Prompt maestro para transformar el temario en formación desde cero hasta nivel profesional y experto

Usa este prompt con un stack, módulo o conjunto de temas del `temario-maestro-unificado.json`. No publiques automáticamente la respuesta: trátala como borrador editorial que debe contrastarse con documentación primaria, ejecutarse y revisarse.

```text
Actúa como arquitecto curricular, docente técnico, desarrollador senior, revisor de accesibilidad y editor de Academia Floci.

OBJETIVO
Transforma el temario proporcionado en una ruta verificable desde cero absoluto hasta desempeño profesional y especialización avanzada. No reduzcas el contenido a definiciones, resúmenes, cuestionarios o fragmentos aislados. Enseña a construir, ejecutar, observar, diagnosticar, modificar, explicar y transferir lo aprendido a un proyecto real.

ENTRADAS
- Stack: {{STACK}}
- Temario actual: {{TEMAS_ACTUALES}}
- Temas candidatos extraídos de libros: {{TEMAS_LIBROS}}
- Fuentes bibliográficas y páginas: {{FUENTES_LIBROS}}
- Documentación primaria vigente: {{FUENTES_PRIMARIAS}}
- Perfil inicial: persona sin experiencia previa.
- Resultado profesional esperado: {{DESEMPENO_FINAL}}
- Proyecto integrador: {{PROYECTO}}
- Restricciones técnicas: {{VERSIONES_SISTEMAS_HERRAMIENTAS}}

REGLAS DE EVIDENCIA
1. Conserva todos los temas actuales. No elimines un tema nuevo sólo porque su título se parece a otro.
2. Fusiona dos temas únicamente cuando compartan concepto, alcance, prerrequisitos y evidencia de aprendizaje. Registra títulos alternativos y fuentes.
3. Distingue: listado, explicado, practicable, ejecutado y revisado humanamente.
4. Un título encontrado en un libro no acredita cobertura educativa.
5. Contrasta APIs, versiones y comportamientos con documentación primaria vigente.
6. Conserva libro, idioma, capítulo y página como trazabilidad; no copies extensamente contenido protegido.
7. Declara cualquier ejemplo, comando, plataforma o fuente que no haya podido verificarse.
8. No inventes resultados, referencias, pruebas ejecutadas ni experiencia profesional.

FASE 1 — UNIFICACIÓN Y DEPURACIÓN
Para cada entrada produce:
- identificador estable;
- título canónico en español;
- títulos alternativos en español e inglés;
- stack y módulo propuestos;
- estado: actual, actual respaldado por libros, candidato de libros o pendiente de OCR;
- fuentes y páginas;
- concepto central;
- alcance incluido y excluido;
- prerrequisitos reales;
- temas que dependen de él;
- nivel de profundidad requerido;
- motivo para conservar, fusionar, dividir o reubicar.

Detecta títulos que mezclan varios conocimientos. Divídelos cuando exijan prácticas o evidencias diferentes. Une sólo duplicados semánticos seguros. Entrega una tabla de decisiones y otra lista de casos ambiguos para revisión humana.

FASE 2 — SECUENCIA CURRICULAR
Ordena los temas mediante dependencias conceptuales, no por orden alfabético ni por el orden accidental de un libro. Organiza cuatro niveles:

1. Fundamentos: vocabulario, entorno, acciones mínimas y modelos mentales.
2. Aplicación: resolución guiada de problemas delimitados.
3. Integración profesional: componentes que colaboran, pruebas, seguridad, datos, operación y mantenimiento.
4. Profundización experta: internals, rendimiento, arquitectura, límites, fallos complejos y decisiones con trade-offs.

Para cada módulo declara:
- pregunta conductora;
- resultado observable;
- prerrequisitos;
- temas en orden;
- evidencia final;
- incremento del proyecto;
- errores y concepciones equivocadas esperables;
- criterio para avanzar.

Evita saltos de dificultad. Si una explicación necesita un término todavía no enseñado, añade el prerrequisito antes o reemplaza el término por una demostración concreta.

FASE 3 — DISEÑO INVERSO
Para cada tema define primero qué desempeño demostrará comprensión. Después diseña la práctica que produce esa evidencia y, al final, la explicación necesaria para realizarla.

El objetivo debe usar acciones observables: crear, ejecutar, predecir, comparar, depurar, medir, justificar, diseñar o mantener. Evita “conocer”, “entender” o “aprender” sin una acción comprobable.

FASE 4 — CONTRATO OBLIGATORIO DE CADA TEMA
Cada tema debe contener, en este orden:

1. Qué construirás y por qué importa.
2. Resultado observable y criterio de éxito.
3. Prerrequisitos y diagnóstico inicial no calificable.
4. Vocabulario nuevo, definido sin circularidad.
5. Modelo mental: mecanismo real y límites de la analogía.
6. Preparación del entorno por sistema operativo y versiones verificadas.
7. Árbol de carpetas y ruta exacta de cada archivo.
8. Ejemplo mínimo completo, ejecutable y explicado por partes.
9. Directorio desde el que se ejecuta cada comando.
10. Comando exacto y significado de sus argumentos.
11. Salida esperada, estado observable o captura verificable.
12. Explicación causal: por qué ocurrió ese resultado.
13. Caso real progresivo conectado al proyecto integrador.
14. Práctica guiada con predicción antes de ejecutar y pistas graduales.
15. Error provocado de forma segura.
16. Diagnóstico: síntoma, hipótesis, prueba, causa y corrección.
17. Ejercicio independiente que cambie el contexto y no permita copiar.
18. Casos límite, seguridad, accesibilidad, rendimiento y mantenimiento pertinentes.
19. Decisiones profesionales: cuándo usarlo, cuándo evitarlo y alternativas.
20. Evidencia de comprensión producida por el estudiante.
21. Explicación propia solicitada una pregunta a la vez.
22. Criterio concreto para avanzar y enlace al siguiente tema.
23. Incremento guardable del proyecto y forma de restaurarlo.

FASE 5 — PROGRESIÓN DE EJEMPLOS
Usa esta escalera:
- demostración mínima;
- modificación de una variable;
- combinación de dos conceptos;
- caso real delimitado;
- fallo diagnosticado;
- solución independiente;
- integración en el proyecto;
- decisión profesional con restricciones;
- investigación o extensión experta.

No presentes una solución grande antes de que la persona pueda explicar sus partes. Todo código debe estar completo en el punto donde se solicita ejecutarlo. No uses “código omitido”, “configura lo necesario” ni “haz lo mismo”.

FASE 6 — ERRORES Y FEEDBACK
Incluye al menos tres fallos relevantes por tema cuando sean naturales:
- error de sintaxis o configuración;
- error de lógica o contrato;
- error de integración, seguridad, rendimiento o entorno.

Para cada fallo muestra mensaje o síntoma realista, cómo reproducirlo, qué evidencia recoger, una hipótesis incorrecta frecuente, diagnóstico correcto, corrección y prevención. No reveles inmediatamente la solución del ejercicio independiente; ofrece pistas graduadas.

FASE 7 — PROYECTO INTEGRADOR
El proyecto crece por incrementos pequeños y ejecutables. Cada incremento especifica:
- archivos modificados;
- contrato de entrada y salida;
- comportamiento nuevo;
- prueba automatizada o comprobación manual reproducible;
- decisión técnica;
- riesgos y límites;
- commit sugerido;
- forma de volver al último estado funcional.

Incluye requisitos de producción pertinentes: seguridad, accesibilidad, privacidad, observabilidad, pruebas, rendimiento, documentación, despliegue y mantenimiento.

FASE 8 — VISUALES Y ACCESIBILIDAD
Añade un diagrama sólo si aclara arquitectura, flujo, estados, datos, dependencias, memoria, tiempo o ejecución. Cada visual debe tener título, leyenda, lectura paso a paso y alternativa textual equivalente. Si tiene movimiento, ofrece pausa, avance manual, reinicio y respeto por prefers-reduced-motion. No uses ilustraciones decorativas como sustituto de una explicación.

FASE 9 — EVALUACIÓN SIN GAMIFICACIÓN
No generes cuestionarios automáticos, puntos, insignias ni marcas de finalización como prueba de dominio. Usa evidencia auténtica:
- programa o artefacto ejecutado;
- pruebas que pasan y fallan por razones explicables;
- diagnóstico documentado;
- comparación de alternativas;
- revisión de código;
- explicación causal;
- cambio de requisitos resuelto;
- demostración del proyecto.

Define una rúbrica con criterios observables para exactitud, razonamiento, diagnóstico, calidad, seguridad y comunicación. Una marca de lectura nunca equivale a competencia.

FASE 10 — CONTROL DE CALIDAD
Antes de aceptar un tema comprueba:
- explicación con modelo mental, límites y decisiones;
- ejemplo específico y ejecutable;
- ubicación exacta de archivos;
- preparación y comando reproducibles;
- salida verificable y caso de fallo;
- práctica con predicción, modificación y feedback;
- integración real con el proyecto;
- lenguaje accesible para principiantes;
- contraste con documentación primaria;
- versiones y fecha de revisión;
- accesibilidad de texto, teclado y movimiento;
- ausencia de afirmaciones o pruebas inventadas.

Un tema no es practicable si falta ejemplo, ubicación, ejecución o práctica. Marca la deuda explícitamente; no la rellenes con texto genérico.

FORMATO DE SALIDA
A. Resumen de cobertura y límites.
B. Tabla completa de unificación, fusiones y casos ambiguos.
C. Grafo de prerrequisitos expresado como lista de dependencias.
D. Ruta organizada por niveles y módulos.
E. Especificación de cada módulo.
F. Desarrollo completo de cada tema usando el contrato obligatorio.
G. Proyecto integrador por incrementos.
H. Rúbricas y evidencias.
I. Matriz de fuentes primarias y bibliográficas.
J. Registro separado de verificaciones: estructura, ejecución, navegador y revisión humana.
K. Deuda editorial, libros pendientes de OCR y cuestiones sin comprobar.

Trabaja módulo por módulo. No resumas los temas restantes ni prometas desarrollarlos después. Si el volumen excede una entrega, termina el módulo actual, conserva un manifiesto de cobertura exacto y continúa desde el siguiente identificador sin repetir ni omitir entradas.
```

## Aplicación editorial

El prompt debe ejecutarse por módulos manejables, no sobre decenas de miles de entradas en una sola respuesta. La fuente canónica de cobertura será el JSON unificado; cada ejecución debe devolver los identificadores tratados, fusionados, divididos y pendientes. La publicación en `web/public/content/<track>/modulo-N.md` sólo procede después de revisión técnica, ejecución proporcional al riesgo y validación del repositorio.
