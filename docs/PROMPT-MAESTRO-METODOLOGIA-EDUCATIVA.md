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
1. Conserva todos los temas actuales. Conserva además cada candidato nuevo en el inventario y registra su decisión; conservarlo en el inventario no obliga a publicarlo como lección.
2. Fusiona dos temas únicamente cuando compartan concepto, alcance, prerrequisitos y evidencia de aprendizaje. Registra títulos alternativos y fuentes.
3. Distingue: listado, explicado, practicable, ejecutado y revisado humanamente.
4. Un título encontrado en un libro no acredita cobertura educativa.
5. Contrasta APIs, versiones y comportamientos con documentación primaria vigente.
6. Conserva libro, idioma, capítulo y página como trazabilidad; no copies extensamente contenido protegido.
7. Declara cualquier ejemplo, comando, plataforma o fuente que no haya podido verificarse.
8. No inventes resultados, referencias, pruebas ejecutadas ni experiencia profesional.
9. La meta es máxima cobertura útil, no el mayor contador posible de títulos. No conviertas números de página, encabezados editoriales, nombres de autores, fragmentos rotos del OCR ni entradas de índice en temas.
10. No copies párrafos, ejercicios ni soluciones de los libros. Extrae conceptos, secuencias y tipos de práctica; crea explicaciones y actividades originales y cita la fuente.

FASE 0 — REANUDACIÓN Y CONTROL DE COBERTURA
Antes de modificar contenido:
- lee el manifiesto de la ejecución anterior;
- registra commit base, fecha, stack, módulos y rango de identificadores;
- comprueba qué archivos tienen cambios locales y no los sobrescribas;
- carga los temas actuales desde los Markdown reales y no desde una cifra histórica;
- carga candidatos desde el inventario unificado conservando fuente y página;
- declara qué verificaciones están disponibles en el entorno;
- asigna un identificador estable a cada candidato antes de decidir sobre él.

Trabaja en lotes que puedan revisarse y validarse completos. Un lote termina por frontera conceptual o de módulo, no por límite arbitrario de tokens. Al cerrar el lote entrega un manifiesto con identificadores recibidos, publicados, fusionados, divididos, rechazados, ambiguos y pendientes. La siguiente ejecución comienza exactamente en el primer identificador pendiente.

CLASIFICACIÓN PREVIA OBLIGATORIA
Antes de secuenciar, clasifica cada entrada como una de estas opciones:
- `tema-curricular`: merece objetivo y evidencia propios;
- `subtema`: pertenece dentro de otro tema, pero debe conservar trazabilidad;
- `titulo-alternativo`: otro nombre para el mismo concepto;
- `duplicado-seguro`: equivalencia demostrada, con destino registrado;
- `proyecto-o-practica`: actividad, no concepto independiente;
- `referencia-editorial`: prefacio, índice, bibliografía, apéndice o metadato;
- `fragmento-defectuoso`: texto roto, número, OCR incompleto o encabezado sin sentido;
- `obsoleto-o-historico`: útil para contexto o migración, no como ruta principal;
- `fuera-de-alcance`: pertenece a otro stack o producto;
- `ambiguo`: requiere lectura de página o decisión humana.

Ninguna entrada desaparece: incluso las descartadas conservan identificador, fuente, página, clasificación y motivo. Sólo `tema-curricular`, `subtema` y `proyecto-o-practica` avanzan al diseño educativo.

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
- clasificación previa y nivel de confianza;
- identificador del destino cuando se fusione o reubique;
- riesgo de obsolescencia y versión tecnológica aplicable.

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

No uses el orden alfabético, el número de página ni el orden de extracción como secuencia pedagógica. Cuando dos temas puedan estudiarse en paralelo, decláralo; no inventes una dependencia lineal.

FASE 3 — DISEÑO INVERSO
Para cada tema define primero qué desempeño demostrará comprensión. Después diseña la práctica que produce esa evidencia y, al final, la explicación necesaria para realizarla.

El objetivo debe usar acciones observables: crear, ejecutar, predecir, comparar, depurar, medir, justificar, diseñar o mantener. Evita “conocer”, “entender” o “aprender” sin una acción comprobable.

Para cada objetivo entrega la correspondencia explícita `objetivo → evidencia → práctica → explicación`. Si la práctica no produce la evidencia o la explicación no prepara la práctica, rediseña la unidad antes de redactarla.

FASE 3.1 — MAPA OBLIGATORIO DE SUBTEMAS
Antes de escribir cada tema, descompónlo mediante documentación primaria, fuentes bibliográficas revisadas, código real y fallos profesionales. No uses sólo el título como alcance.

Clasifica cada subtema como:
- `prerrequisito`: debe dominarse antes y se enlaza a su lección;
- `nucleo`: mecanismo indispensable del tema;
- `variante`: sintaxis, API o implementación que cambia su aplicación;
- `limite-decision`: cuándo funciona, cuándo no y qué alternativa existe;
- `diagnostico`: error, síntoma, causa y corrección propios;
- `profundizacion`: internals, rendimiento o arquitectura avanzada.

Para cada subtema registra:
- nombre canónico y términos equivalentes;
- por qué es necesario;
- profundidad objetivo: reconocer, aplicar, depurar, decidir o diseñar;
- explicación causal que necesita;
- ejemplo o parte exacta del ejemplo que lo demuestra;
- salida o evidencia observable;
- error o límite propio;
- práctica de transferencia;
- fuente primaria y fuente bibliográfica, si existe;
- destino: dentro del tema, tema separado, módulo posterior o fuera de alcance con motivo.

Regla crítica: una mención, una viñeta, una tabla de nombres o una aparición dentro de código no cuenta como subtema explicado. Todo subtema necesario para usar, depurar o decidir profesionalmente debe alcanzar al menos `aplicar` y tener evidencia. Si dos subtemas necesitan objetivos, ejemplos o fallos diferentes, divídelos en temas separados. Evita tanto la omisión como la lección enciclopédica.

Nivel mínimo universal: aplica a cada tema el mismo grado de análisis usado en este ejemplo normativo: «Crear antes de las interfaces funcionales un tema completo de lambdas que cubra sintaxis, SAM, target typing, captura, `this`, referencias a métodos, sobrecargas ambiguas, excepciones checked y especializaciones primitivas».

El ejemplo fija la **profundidad y la secuenciación**, no una lista universal. Para cada tecnología descubre su desglose correcto mediante documentación primaria, libros pertinentes, errores frecuentes y dependencias conceptuales. Si un tema avanzado usa una base que todavía no fue enseñada con ese nivel, crea o mueve primero el tema de base. No escondas el prerrequisito en una introducción breve del tema avanzado.

Para aprobar, cada tema debe poder resumirse en una instrucción igualmente precisa: «Crear antes de [dependencia] un tema completo de [concepto] que cubra [mapa concreto y suficiente de subtemas]». «Explicar a fondo» sin enumerar el mapa editorial no es suficiente.

**Puerta obligatoria:** un tema no se entrega por tener el mapa. Cada fila crítica
debe apuntar a una explicación individual, evidencia, fallo o límite y práctica de
transferencia dentro del contenido real. Registra la revisión humana antes de
declararlo cerrado. Un lote no puede aumentar el número de pendientes.

Antes de aprobar el mapa pregunta: “¿Qué necesitaría saber una persona para usar esto sin copiar, diagnosticar cuando falla y elegirlo frente a una alternativa?”. Todo concepto requerido por la respuesta debe aparecer en el mapa.

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

El orden puede agruparse visualmente como `Aprende`, `Practica` y `Aplica`, pero ningún grupo puede ocultar los elementos obligatorios. No agregues colas genéricas repetidas para satisfacer detectores. Cada explicación, error y ejercicio debe depender del concepto específico del tema.

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

La interfaz puede conservar progreso de lectura y archivos alcanzados, pero debe rotularlos como progreso, no como certificación, dominio o aprobación.

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
- mapa explícito de subtemas críticos y destino de cada uno;
- ningún subtema crítico reducido a mención o código sin explicación;
- evidencia localizable para aplicar, diagnosticar y decidir cada subtema crítico.

Un tema no es practicable si falta ejemplo, ubicación, ejecución o práctica. Marca la deuda explícitamente; no la rellenes con texto genérico.

Aplica cuatro verificaciones separadas y no intercambiables:
1. `estructura`: están presentes los componentes editoriales exigidos;
2. `ejecución`: comandos, ejemplos y fallos fueron ejecutados en un entorno declarado;
3. `navegador`: navegación, teclado, responsive, persistencia y errores fueron probados;
4. `revisión-humana`: una persona comprobó claridad, precisión, dificultad y transferencia.

Una validación estructural exitosa no permite marcar como realizadas las otras tres.

CONDICIONES DE RECHAZO O PAUSA
No publiques el lote cuando:
- la fuente o versión decisiva no se pudo comprobar;
- el ejemplo depende de código omitido o archivos inexistentes;
- el comando no indica directorio o preparación;
- el resultado esperado no es observable;
- la práctica sólo repite el ejemplo;
- el tema introduce prerrequisitos no enseñados;
- la explicación fue generada como plantilla intercambiable;
- un cambio local de otra tarea se solapa y no puede preservarse con seguridad.

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
L. Manifiesto de continuidad del lote con commit base, archivos modificados, identificadores tratados, verificaciones ejecutadas y primer identificador pendiente.
M. Matriz de cobertura de subtemas: tema, subtema, criticidad, profundidad, evidencia, fuente, estado y deuda.

Trabaja módulo por módulo. No resumas los temas restantes ni prometas desarrollarlos después. Si el volumen excede una entrega, termina el módulo actual, conserva un manifiesto de cobertura exacto y continúa desde el siguiente identificador sin repetir ni omitir entradas.
```

## Aplicación editorial

El prompt debe ejecutarse por módulos manejables, no sobre decenas de miles de entradas en una sola respuesta. El JSON unificado es la fuente canónica del inventario, mientras que los Markdown reales son la fuente canónica de lo publicado. Cada ejecución debe devolver los identificadores tratados, fusionados, divididos, descartados con motivo y pendientes. La publicación en `web/public/content/<track>/modulo-N.md` sólo procede después de revisión técnica, ejecución proporcional al riesgo y validación del repositorio.
