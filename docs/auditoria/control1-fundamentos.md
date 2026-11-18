# Auditoría editorial y pedagógica: Control 1 y Fundamentos

- **Fecha:** 2026-11-18
- **Auditor:** independiente (no autor). Rúbrica y reglas de `docs/auditoria/PROMPT-AUDITORIA.md`.
- **Alcance:** `web/public/content/control-1/modulo-0…22.md` (70 temas), `web/public/content/foundations/modulo-0…15.md` (103 temas), `web/src/app/tracks/control-1.track.ts`, `web/src/app/tracks/foundations.track.ts`, `examples/control-1-tanque/`, `docs/METODOLOGIA-DE-APRENDIZAJE.md`, `docs/ESTANDAR-DE-CODIGO.md`, `scripts/validate.sh`, `docs/auditoria/plantilla-mecanica.json`.

## Método (qué se hizo de verdad)

1. Listé los temas de los 39 módulos (`grep '^### Tema'`) y leí completos: Control 1 módulos 0, 1 y 9, y los temas 2–3 del 6, 1 del 20, el 21 y el 22; Fundamentos módulos 0 y 1 y los temas 1 del 2, 1 del 3, 5–7 del 7, 2, 10 y las ampliaciones del 12. En el resto ojeé encabezados, enunciados y resultados de cada ejemplo.
2. **Control 1:** extraje y ejecuté los 69 bloques `python` (SymPy 1.14.0, SciPy 1.18.1). Los 69 terminan sin error y su salida coincide con el «Resultado esperado» del texto. Esos scripts solo comprueban un ejemplo por tema, así que verifiqué aparte, con SymPy, NumPy, SciPy y python-control, **más de 60 resultados de los ejemplos** de los módulos 1 a 22, al menos uno por módulo (scripts en `/tmp/aud/verif1.py` y `/tmp/aud/verif2.py`, fuera del repo). Ejecuté también el laboratorio `examples/control-1-tanque/simular.py`.
3. **Fundamentos:** ejecuté en `/tmp` los 145 bloques `python`: 112 terminan bien, 4 piden `input()` y 33 fallan solos. La mayoría de los 33 son fragmentos que se añaden a un archivo anterior o que leen archivos creados en otro paso. Revisé a mano los fallos de los módulos 1, 4, 5, 8 y 9.
4. Ejecuté `./scripts/validate.sh` (termina en `validate.sh: ok`) y `python3 scripts/audit_plantilla.py`.

### Sobre la medición mecánica (`plantilla-mecanica.json`)

- **Control 1 sale peor de lo que es.** Según el JSON, 0 de 70 temas cumplen, y faltan «objetivos 69/70» y «análisis 64/70». Hay tres causas en el script:
  - los objetivos están a nivel de módulo («**Al terminar podrás:**», `control-1/modulo-1.md:5`) y el script solo mira dentro de cada `### Tema`;
  - el análisis paso a paso existe, como un «**¿Por qué?**» en cada paso de cada ejemplo (`modulo-1.md:42`), pero el regex no lo reconoce;
  - las prácticas con solución se titulan «Práctica para resolver sola o solo» (`modulo-4.md:265`), y el regex `ejercicio|práctica (guiada|independiente)|reto` no las encuentra.

  Lo que sí falta de verdad: el resumen (0 de 23 módulos), la analogía (solo aparece como tema técnico en `modulo-8.md`, Tema 5) y los errores comunes en 7 módulos (9, 10, 13, 19, 20, 21 y 22).
- **Fundamentos sale mejor de lo que es.** «analogía 103/103» incluye 16 temas con **dos analogías superpuestas** (ver A2). «resumen 102/103» se cumple con la palabra «Cierre», pero ese paso es una lista de entregables, no un resumen (`foundations/modulo-1.md:176`, «Entregá el algoritmo en pseudocódigo…»).

---

## Veredicto ejecutivo

**Parcial (Control 1) y No (Fundamentos).**

**Control 1** es matemáticamente sólido: de más de 60 resultados verificados, solo uno es falso (`modulo-14.md:89-99`, Ejemplo 5), y los ejemplos traen un «¿Por qué?» en cada paso. Aun así:
- numera los capítulos con un desfase de +1 respecto a los módulos en 70 referencias;
- tiene ejemplos de relleno generados por plantilla, sin resultado real;
- 6 módulos no traen práctica con solución;
- está escrito para el parcial de una persona concreta («Qué faltó en el Parcial 1», `modulo-0.md:134`).

**Fundamentos no cumple su promesa** de «Empieza desde cero absoluto» (`foundations.track.ts:5`):
- el primer tema del módulo 0 dura «90 min» y explica memoria virtual y PID antes del «Hola, mundo»;
- el primer tema del módulo 1 usa funciones, diccionarios, `enumerate` y `raise` tres temas antes de enseñarlos;
- el primer proyecto exige commits de Git (que se enseña en el módulo 5) y manejo de excepciones nunca explicado;
- el texto mezcla voseo y tuteo;
- remite a un `merged.pdf` y a «la página 65 del PDF» que el estudiante no tiene.

---

## Tabla de puntuaciones A1–F3

Escala: 0 = ausente, 1 = deficiente, 2 = aceptable, 3 = ejemplar. «C1» = Control 1 y «F» = Fundamentos.

| Criterio | C1 | Evidencia Control 1 | F | Evidencia Fundamentos |
|---|---|---|---|---|
| A1 Ejemplo antes que teoría | 1 | La propia guía dice «**Idea clave y teoría.** Primero la idea en palabras simples, después la fórmula» (`modulo-0.md:62`). La regla de Mason arranca con la fórmula «\[T = \frac{Y}{R} = \frac{1}{\Delta}\sum_k P_k\,\Delta_k\]» (`modulo-6.md:239`), sin ejemplo motivador. | 2 | El Paso 2 «Contexto y caso real» va antes de la teoría: «necesita… contestar una pregunta simple: de todas las tareas guardadas, ¿cuántas están pendientes?» (`modulo-1.md:14`). Excepción: el Tema 1 del módulo 0 abre con una tabla de 11 conceptos (`modulo-0.md:78-90`) antes de ejecutar nada. |
| A2 Analogías correctas | 1 | Casi no hay. El ejemplo de la ducha (`modulo-18.md:66`, «Ajustas el agua de la ducha. ¿Qué haces como P, como I y como D?») es correcto pero aislado. | 2 | Hay buenas analogías con límite explícito («**Analogía con límite:** el programa es una partitura guardada…», `modulo-0.md:98`). Pero en el mismo tema aparecen dos analogías que se contradicen: «un valor es una casa y una variable es una dirección postal» (`modulo-1.md:188`) frente a «una variable es una etiqueta reutilizable sobre una caja» (`modulo-1.md:216`). La de la caja es justo la idea equivocada que la primera corrige. |
| A3 Errores comunes reales | 1 | Son listas de tres viñetas sin diagnóstico: «Olvidar que \(j^2 = -1\) al multiplicar…» (`modulo-1.md:554`). Faltan en los módulos 9, 10, 13, 19, 20, 21 y 22. | 2 | Hay fallos deliberados con mensaje real: «Python lanza `ZeroDivisionError: division by zero`» (`modulo-1.md:149`) y «Python produce `TypeError`» (`modulo-0.md:140`). En el módulo 12 los errores son plantilla: «Integra este resultado en el registro del sensor…», repetido en 17 temas. |
| A4 Ejercicios progresivos con solución | 2 | Los ejemplos se etiquetan *Básico → Intermedio → Nivel parcial* y cada paso trae su «¿Por qué?». Pero los bloques «Más ejemplos» solo dan el número: «1. \(|G(j10)| \approx 0{,}707,\ \angle G \approx -45^\circ\)» (`modulo-20.md:40`). Sin práctica con solución: módulos 9, 10, 13, 17, 19 y 20. | 1 | 54 de 103 temas no tienen ejercicio con solución (medición mecánica, comprobada en los módulos 0, 6 y 7). La «Práctica independiente» nunca trae solución (`modulo-0.md:150`). |
| A5 Proyecto integrador de 30–60 min | 1 | `examples/control-1-tanque` existe y funciona (P: «altura_final=1.308 m», PI: «altura_final=1.500 m»). Pero se ejecuta «desde la raíz del repositorio» (`modulo-5.md:148`), que el estudiante no tiene: el módulo 0 le hizo crear `academia-labs/control-1` (`modulo-0.md:72`). Además la instrucción de `modulo-11.md:597` es técnicamente incorrecta (ver errores verificados). | 1 | Los proyectos son especificaciones de unas 20 líneas, sin solución, sin tiempo estimado y sin salida esperada. El Proyecto 1 pide «crea un commit después de cada etapa» (`modulo-1.md:678`), pero Git se enseña en `modulo-5.md:361`. El proyecto integrador cambia de identidad: «futuro gestor de tareas» (`modulo-0.md:28`), «RutaFlow» (`modulo-0.md:74`), «gestor de inventario» (`modulo-2.md:988`). |
| A6 Progresión coherente | 1 | El Tema 1 del módulo 1 pasa a forma polar (`modulo-1.md:36`) antes del Tema 4, «Forma polar…» (`modulo-1.md:679`). Las etapas no son monótonas: «Integración módulos 8…» antes de «Experto módulos 9–10» y de «Aplicación… 11–12» (`modulo-0.md:17-20`). | 1 | El Tema 1 del módulo 1 ya usa `def`, `dict`, `enumerate(…, start=1)` y `raise ValueError` (`modulo-1.md:118-136`), mientras que las funciones llegan en el Tema 4 (`modulo-1.md:445`). El curso de entrada incluye C# con .NET 10 (`modulo-7.md:477`), consenso distribuido (`modulo-10.md:531`) y PLC IEC 61131-3 (`modulo-12.md:902`). |
| B1 Misma plantilla | 1 | La estructura propia (¿Por qué?, Fuentes, Ejemplos, Verificación, Practica, Límite) se repite, pero 20 temas abren «Más ejemplos resueltos» sin ningún ejemplo previo (p. ej. `modulo-1.md:32`, `modulo-20.md:32`). Resumen: 0 de 70 temas. | 1 | Hay dos plantillas superpuestas: Pasos 1–7 más el bloque heredado «Conceptos clave / Analogía / ¿Por qué es importante? / Casos de uso / Diagrama» (`modulo-1.md:32-60`). Solo 6 de 103 temas cumplen los 8 elementos. |
| B2 Texto puro o código puro | 2 | Cada tema trae un script, pero algunos no verifican nada: `print("planta:", "horno con aire y paredes")` (salida de `modulo-5.md:301`). | 2 | El código siempre viene explicado. El tema 1 del módulo 11 es mayormente un mapa de texto. |
| B3 Objetivos y resumen por lección | 1 | Hay objetivos por módulo («Al terminar podrás:», `modulo-1.md:5`), ninguno por tema, y ningún resumen. | 2 | «Al finalizar podrás…» en 103 de 103 temas. El «Cierre» es una lista de entregables, no un resumen. |
| B4 Módulo 0 de entorno | 2 | Prepara el venv y diagnostica el error: «Si ves `ModuleNotFoundError`, confirma que ejecutaste el Python de `.venv`» (`modulo-0.md:95`). No explica cómo instalar Python. | 2 | Cubre VS Code, Python, la comprobación de versión, «Hola, mundo» y los errores. Pero «se verificó `Python 3.9.6` en macOS… no se ejecutaron en esos sistemas» [PowerShell y Linux] (`modulo-0.md:26`). Además «Registro de ejecución: pendiente de ejecutar» (`modulo-0.md:168`) y sobra una sección «## Ampliación de la página 50 del PDF» (`modulo-0.md:415`). |
| C1 Código completo y ejecutable | 3 | Los 69 de 69 bloques se ejecutaron y coinciden con el resultado esperado. | 2 | 112 de 145 bloques se ejecutaron bien. La solución de `modulo-1.md:261-262` no es Python válido: `if 1 <= cantidad <= 1000:` seguido solo de `# válida` da `IndentationError`. `latencias = medir(…)` (`modulo-9.md:420`) usa una función que no está definida. |
| C2 Cumple ESTANDAR-DE-CODIGO | 2 | Cada tema sobrescribe el mismo `verificacion.py` («guarda cada nuevo contenido en `verificacion.py`», `modulo-0.md:93`), así que no queda «Código alcanzado» del que habla la metodología. | 2 | Se contradice con su propia regla: «para dinero usa enteros (centavos) o `Decimal`, nunca `float`» (`modulo-1.md:607`), pero el ejemplo central es `return subtotal * 0.90` (`modulo-1.md:465`) con `float(input("Subtotal: "))` (`modulo-1.md:470`). |
| C3 APIs o versiones obsoletas | 2 | `pip install sympy scipy matplotlib` sin fijar versiones (`modulo-0.md:89`). | 2 | El entorno de referencia es «Python 3.9.6» (`modulo-1.md:3`), una línea que llegó al fin de soporte en octubre de 2025. |
| C4 Soluciones documentadas | 1 | Las soluciones son el resultado final sin ideas («\(\dfrac{3}{5s+1}\): \(K=3\), \(\tau=5\)», `modulo-4.md:271`). Faltan en 6 módulos. | 1 | Ver A4. En `modulo-8.md:339` la solución dice literalmente «[SOLUCIÓN PLEGADA]» y está visible, no plegada. |
| D1 Segunda persona consistente | 3 | Tuteo consistente («Halla», «Calcula»). La búsqueda de voseo no encontró casos. | 1 | Mezcla voseo y tuteo en 14 módulos: «si no definís el algoritmo» (`modulo-1.md:14`) y «Corregilo agregando» (`modulo-1.md:149`) junto a «crea `src/pendientes.py`» (`modulo-1.md:112`). |
| D2 Jerga sin explicar o glosario | 1 | No hay glosario. «ganancia DC \(G(0)\)» (`modulo-4.md:207`) aparece sin definir, y los decibeles se usan en `modulo-1.md:707` («\(10{,}97\,\text{dB}\)») aunque se enseñan en el módulo 20. | 1 | No hay glosario. «acceder por posición… es O(1)… tabla hash… colisiones» (`modulo-2.md:16`) llega antes del tema de complejidad (`modulo-2.md:465`). En el módulo 0, para principiantes absolutos: «Memoria virtual y aislamiento», «CPU lógica», «hilo» (`modulo-0.md:80-92`). |
| D3 Conocimiento previo no enseñado | 1 | Da por sabidas las series de Taylor (`modulo-1.md:230`), y venv y `source` sin explicar qué son (`modulo-0.md:87-88`). | 1 | El Tema 1 del módulo 1 da por sabidas las funciones y las excepciones. El Tema 1 del módulo 0 da por sabido `cd ..`: «ejecuta… desde su carpeta superior» (`modulo-0.md:146`), que se enseña en `modulo-0.md:276`. |
| E1 Qué detecta validate.sh | 1 | Solo comprueba paridad, índice, catálogo, laboratorios y specs. Pasó en verde con el error de `control-1/modulo-14.md:97-99` y con las figuras que faltan en el módulo 12 de Fundamentos. | 1 | Igual. |
| E2 Ejecuta código, plantilla, glosario | 0 | `validate.sh` no ejecuta bloques ni valida la plantilla (`audit_plantilla.py` no está en él) ni la jerga. | 0 | Igual. |
| E3 Flujo de revisión documentado | 0 | No existe. specs/013 dice «**P5** `pendiente` — La plantilla de tema de la Parte 2 queda en la metodología y un script la valida». | 0 | «la presencia de comandos y resultados esperados no se contabiliza como ejecución» (`modulo-0.md:168`), y no hay ningún revisor asignado. |
| F1 Riesgo de temas sin revisión | 1 | La exactitud es alta (más de 60 resultados verificados, 1 falso), pero el error llegó al texto con «Lazo cerrado estable: no» escrito en el propio ejemplo. | 0 | Hay contenido dependiente de capturas no publicadas («el dibujo ampliado», `modulo-12.md:966`). |
| F2 Ruta priorizada (core) | 1 | Es un curso para un examen: «Plan de dos semanas» (`modulo-0.md:143`). | 1 | Todo se publica junto. El módulo 12 (24 h, 17 temas) aparece etiquetado como «Aplicación» después de los módulos «Experto» (`foundations.track.ts:252`). |
| F3 Glosario o apéndices | 1 | Solo el formulario de `modulo-22.md`, que es útil. | 0 | No hay glosario ni tabla de consulta. |

---

## Tabla por módulo

Nota de 0 a 3, global por módulo.

### Control 1 (70 temas)

| Módulo | Temas | Nota | Defecto principal (cita) | Corrección concreta |
|---|---|---|---|---|
| 0 | 1 | 1 | Desfase de numeración: «Los capítulos 10, 11, 20 y 21 (linealización, espacio de estados, compensadores y Bode)» (`:103`); son los módulos 9, 10, 19 y 20. La tabla «El temario» (`:109-132`) y el plan (`:145-159`) usan la misma numeración desplazada. | Renumerar a «módulo N» en todo el curso (70 referencias «capítulo N»). |
| 1 | 4 | 2 | Etiquetas pegadas: «- Suma y restaReal con real» y «- MultiplicaciónDistribuye» (`:189-204`). Referencia rota: «Verifica con el Ejemplo 7: \(\sqrt{13-4} = 3\)» (`:511`); es el Ejemplo 2. Variables mal escritas: «\(\frac{10}{j_{2} + 2}\)» (`:699`, también en `:715-779`). | Restaurar `**Suma y resta:**`, corregir la referencia al Ejemplo 2 y sustituir `j_{2}` por `2j`. Mover los ejemplos de forma polar del Tema 1 al Tema 4. |
| 2 | 4 | 2 | Tema 2 sin ejemplo guiado: abre directamente con «Más ejemplos resueltos» (`:202`). | Añadir un ejemplo guiado antes y quitar el rótulo «Más». |
| 3 | 4 | 2 | Resultados en forma cruda de SymPy: «\(y(t) = \frac{\left(10 e^{3 t} - 10\right) e^{- 4 t}}{3}\)» (`:136`) y «\(2(s+3) + -5\)» (`:599`). | Escribir \(\tfrac{10}{3}(e^{-t}-e^{-4t})\) y \(2(s+3)-5\). |
| 4 | 1 | 1 | Un solo tema para todo el módulo, cuando la metodología pide 3–6 subtemas. «ganancia DC» sin definir (`:207`). | Dividir en ED → G(s), condiciones iniciales y ganancia DC/polos/ceros. Definir «ganancia DC = G(0)». |
| 5 | 3 | 2 | Etiquetas pegadas: «- Lazo abiertoLa acción no depende de la salida» (`:21`). El script del Tema 2 imprime cadenas fijas, sin verificar nada (`:301`). | Restaurar el formato. Sustituir el script por uno que calcule E = R − Y. |
| 6 | 4 | 1 | Contradicción: «Dos bloques en serie con realimentación de cada uno… se tocan porque comparten el nodo X» (`:166-176`) frente a «\(G_1\) con realimentación \(H_1\), seguido de \(G_2\)… No se tocan» (`:291-297`). Además, «la fórmula de capítulo 6» (`:249`). | Dibujar los dos grafos y nombrarlos distinto: «H₂ realimenta a X» frente a «lazos locales independientes». |
| 7 | 3 | 2 | Los enunciados de «Más ejemplos» dependen del título: «**Enunciado.** Halla \(V_o(s)/V_i(s)\)» (`:248`). | Repetir los datos del circuito en el enunciado y añadir un dibujo. |
| 8 | 5 | 2 | Resultados vacíos: «**Resultado.** Por eso sus ecuaciones tienen la misma forma y se resuelven igual.» (`:541`, `:551`, `:561`). | Dar el equivalente concreto (M ↔ L ↔ J, etc.) en cada resultado. |
| 9 | 1 | 1 | Un solo tema sin errores comunes ni práctica con solución. Notación sin simplificar: «\(f(x) \approx 0 + -1\,\delta x\)» (`:103`). Fuente que no corresponde: «Espacio de estados» para linealización (`:16`). | Añadir errores (p. ej. linealizar fuera del equilibrio) y práctica plegada. Escribir \(-\delta x\). |
| 10 | 2 | 1 | Sin errores comunes ni práctica con solución. «la misma de capítulo 5» (`:183`). | Añadir una práctica con solución y renumerar. |
| 11 | 4 | 2 | Instrucción de laboratorio incorrecta: «Identifica \(K\) y \(\tau\)… usando dos filas… antes del cambio de referencia en \(t=5\) s, y compáralo con el \(G(s)=2/(4s+1)\)» (`:597`). | Ver «Errores verificados» n.º 2. |
| 12 | 5 | 2 | Tema 2 sin números: «**Resultado.** Si la curva del simulador coincide, entendiste…» (`:216-272`, cinco veces). | Dar \(M_p\) y \(t_s\) de cada caso (p. ej. ζ = 0,1 y ωn = 2 dan 72,9 % y 20 s). |
| 13 | 3 | 1 | Sin errores comunes y sin práctica con solución (0 `<details>`). | Añadir 4 ejercicios plegados con razonamiento. |
| 14 | 2 | 1 | **Error matemático:** «2. Lazo cerrado estable: no… **Resultado.** \(e_{ss} = … = \frac{1}{4}\)» (`:97-99`). | Ver «Errores verificados» n.º 1. |
| 15 | 4 | 2 | Resultado escrito con plantilla: «0 raíz(ces) en el semiplano derecho» (`:217`). | Redactar en singular o plural según el caso. |
| 16 | 3 | 2 | Desfase: «(capítulo 13)» y «capítulo 2» (`:146`, `:176`). | Renumerar. |
| 17 | 3 | 1 | Sin práctica con solución (0 `<details>`). Los números verificados son correctos. | Añadir una práctica plegada del lugar de las raíces. |
| 18 | 5 | 2 | Relleno: «**Resultado.** PI, justificado por la ventaja que aporta y la desventaja que se evita.» (`:458-488`) y «\(e_{ss} = 0\) = 0» (`:182`, `:202`). | Escribir la ventaja y la desventaja concretas y quitar el «= 0» duplicado. |
| 19 | 3 | 1 | Sin errores comunes ni práctica. «\(\dfrac{s + 0{,}1}{s + 0{,}013}\): el error ante rampa baja 8 veces» (`:212`): con 0,013 la mejora es ×7,7. | Usar 0,0125 y añadir práctica. |
| 20 | 4 | 1 | Bode asintótico sin asíntotas: «**Resultado.** Esa es la forma que se suma con los demás factores…» (`:290-340`, seis veces). | Dar la pendiente, la frecuencia de quiebre y la fase de cada factor. |
| 21 | 1 | 1 | Referencia inexistente: «Usa la tabla 10.4 completa» (`:86`). El contenido es el examen real de una persona («Confírmalo con el profesor», `:98`). | Sustituir por un enlace a `modulo-18.md`, Tema 4. Separar el material personal del curso publicable. |
| 22 | 1 | 2 | Resultados correctos (verificados). Falta el error ante parábola en el formulario. | Añadir \(1/K_a\) (tipo 2) al formulario. |

### Fundamentos (103 temas)

| Módulo | Temas | Nota | Defecto principal (cita) | Corrección concreta |
|---|---|---|---|---|
| 0 | 6 | 1 | «### Tema 1: Computador, sistema operativo, programa y proceso · Básico · 90 min» (`:66`): incumple los 20–45 min de la metodología y explica PID, memoria virtual y `platform` antes del «Hola, mundo» (`:170`). Sobra «## Ampliación de la página 50 del PDF» (`:415`). | Poner el Tema 2 primero, partir el Tema 1 en dos temas de 30 min sin memoria virtual ni hilos, y borrar las referencias al PDF. |
| 1 | 5 | 1 | El Tema 1 usa `def`, `dict`, `enumerate`, `raise` y f-strings (`:118-136`). El Proyecto 1 pide «crea un commit después de cada etapa» (`:678`) y «captura solo excepciones esperadas» (`:693`), y `try:` no aparece en todo el módulo. | Reordenar: variables → decisiones → funciones → algoritmo. Quitar Git del Proyecto 1 y enseñar `try/except` antes. Publicar la solución del proyecto. |
| 2 | 8 | 2 | Jerga anticipada: «O(1)… tabla hash… colisiones» (`:16`), antes del Tema 4 (complejidad). Tema 1: «Prerrequisitos: Python instalado» (`:10`). | Mover la notación O al Tema 4, o definirla en una línea. Declarar el módulo 1 como prerrequisito. |
| 3 | 5 | 2 | Dos proyectos solapados: «### Proyecto 3: sitio profesional accesible» (`:636`) y «### Tema 5: Proyecto integrador — sitio de seguimiento accesible» (`:663`). | Fusionarlos en un único proyecto con solución. |
| 4 | 7 | 2 | Fragmento que no se ejecuta: `cursor.execute(...)` sin `cursor` (`:234`). PL/pgSQL y Excel dentro de un curso de entrada (`:756`, `:897`). | Marcarlo como fragmento o completar la conexión. Mover PL/pgSQL a un curso de bases de datos. |
| 5 | 4 | 2 | `logger.info(...)` sin definir `logger` (`:66`). Git llega aquí aunque el Proyecto 1 ya lo exigía. | Añadir `import logging; logger = logging.getLogger(__name__)`. |
| 6 | 5 | 1 | 1688 líneas en 5 temas (≈340 líneas por tema) frente a los 20–45 min de la metodología. 0 de 5 temas con ejercicio con solución. | Partir en 10–12 temas y añadir soluciones plegadas. |
| 7 | 7 | 1 | Tema de C# en un curso Python: «Instala el SDK .NET 10» (`:477`). Remite a material ajeno: «La captura de referencia propone records» (`:479`) y «Compara… con un record Java del módulo 7 de Java» (`:529`). | Retirar el Tema 5 a un curso de C# y quitar las referencias cruzadas. |
| 8 | 5 | 1 | Solución sin plegar y contradictoria: «Necesitas garantizar 512MB para BD» frente a «[SOLUCIÓN PLEGADA] > `limits: memory: 256M`…» (`:331-339`). `domain.py` se usa aquí (`:323`, `:90`), pero se crea en el módulo 9. | Usar `<details>` reales, alinear las cifras y crear `domain.py` antes. |
| 9 | 4 | 1 | Error conceptual: «Intervalo de confianza = rango donde crees que está el verdadero p95… SLI debe ser "p95 < 200ms por mes"» (`:410`). | Ver «Errores verificados» n.º 6. |
| 10 | 7 | 1 | «### Proyecto 10» (`:669`) aparece entre el Tema 5 y el Tema 6 (`:700`). El nivel (Lamport, 2PC) no corresponde a un curso de entrada. | Llevar el proyecto al final y mover los temas 5–7 a un curso de sistemas distribuidos. |
| 11 | 6 | 2 | Mapa de especializaciones de «18 h» sin análisis paso a paso (5 de 6 temas sin él, según la medición). | Reducirlo a una guía de 2–3 h o marcarlo como opcional. |
| 12 | 17 | 0 | Contenido que depende de un PDF ausente: «Capítulo de introducción aplicada a las 16 áreas de la página 4… de `merged.pdf`» (`:3`). «## Ampliación: ejercicio de Thévenin de la página 67» y «cuatro diodos de la página 65» (`:956`, `:964`) se resuelven sin publicar el circuito. Además, «**Próximamente:** netlist real de `ngspice`» (`:1015`). | Publicar los esquemas como SVG o retirar las ampliaciones, y quitar «Próximamente». Mover el módulo a un curso de electrónica. |
| 13 | 5 | 2 | 3 de 5 temas sin ejercicio con solución (medición). El código se ejecutó correctamente. | Añadir soluciones plegadas. |
| 14 | 8 | 2 | Jerga externa sin explicar: «el error de la copia superficial aparece también en Redux, NgRx y cualquier estado inmutable» (`:576`). 6 de 8 temas sin solución. | Explicar o quitar Redux y NgRx, y añadir soluciones. |
| 15 | 4 | 2 | 3 de 4 temas sin solución. El código se ejecutó correctamente. | Añadir soluciones plegadas. |

---

## Defectos bloqueantes (impiden publicar)

1. **`control-1/modulo-14.md:89-99`. El texto da un número que él mismo invalida.** «2. Lazo cerrado estable: no. … **Resultado.** \(e_{ss} = \lim_{s\to0} sE(s) = \frac{1}{4}\)».
   - **Corrección:** cambiar el resultado a «No se puede aplicar el teorema del valor final: el lazo cerrado \(s^3+5s^2+20\) es inestable (le falta el término en \(s\)); el error crece sin límite».
2. **`foundations/modulo-12.md:3, 164, 956-1015`. Ejercicios que dependen de figuras que el estudiante no ve.**
   - Citas: «Se leyó el dibujo ampliado: referencia inferior izquierda 0 V…» y «En la página 65 del PDF identifica primero polaridades».
   - El resultado no se puede auditar ni seguir.
   - **Corrección:** publicar cada esquema como SVG junto al ejercicio, o retirar las secciones «Ampliación».
3. **`foundations/modulo-1.md:678, 693`. El primer proyecto exige lo que el curso aún no enseñó.**
   - Cita: «crea un commit después de cada etapa». Git llega en `modulo-5.md:361`.
   - Cita: «captura solo excepciones esperadas». `try/except` no aparece en el módulo 1.
   - El módulo 0 dice «Git se usará más adelante; no hace falta» (`modulo-0.md:11`).
   - **Corrección:** quitar los commits o adelantar un tema mínimo de Git; añadir un tema de `try/except`; publicar una solución de referencia del proyecto con su tabla de 8 casos.
4. **`foundations/modulo-1.md:112-136`. La primera demostración del curso usa construcciones no enseñadas.**
   - Usa `def`, `dict`, `enumerate(tareas, start=1)` y `raise ValueError`, que se presentan en los temas 2–4.
   - **Corrección:** reescribir el Tema 1 con solo `print`, variables y una lista literal, o mover el Tema 1 detrás del Tema 4.
5. **`foundations/modulo-0.md:66-168`. La puerta de entrada rompe la metodología.**
   - El Tema 1 dura «90 min» y trata «Memoria virtual y aislamiento», PID, `sys.executable` y códigos de salida antes de ejecutar el primer «Hola, mundo» (Tema 2, `:170`).
   - Pide «Crea una carpeta `fundamentos-entorno`» (`:112`) sin enseñar `mkdir`, que llega en `:188`.
   - **Corrección:** el Tema 2 pasa a ser el primero; el Tema 1 se reduce a 30 min sin memoria virtual ni planificación.
6. **`foundations/modulo-0.md:415-420` y `modulo-7.md:479`. Material de autoría filtrado.**
   - Citas: «## Ampliación de la página 50 del PDF», «La captura del PDF mezcla atajos…», «La captura de referencia propone records».
   - **Corrección:** borrar toda referencia a PDF o capturas no publicadas.
7. **`foundations/modulo-0.md:26`. La ruta de principiantes no está probada en Windows.**
   - Cita: «se verificó `Python 3.9.6` en macOS… Las instrucciones para PowerShell y Linux… no se ejecutaron en esos sistemas».
   - **Corrección:** ejecutar el módulo 0 y el Proyecto 1 en Windows 11 y Ubuntu, con un Python vigente, y registrar la salida.

## Defectos mayores (degradan el aprendizaje)

1. **Control 1, todo el curso: numeración de capítulos desplazada en +1.** Hay 70 apariciones de «capítulo N» (p. ej. `modulo-14.md:221` «verifica estabilidad (capítulo 16)», que corresponde al módulo 15). El propio texto lo delata: «en el capítulo 9 (módulo 8)» (`modulo-11.md:597`).
   - **Corrección:** reemplazar por «módulo N−1» con un script y añadir una comprobación en `validate.sh`.
2. **`control-1/modulo-11.md:597`. Instrucción del laboratorio imposible y engañosa** (ver «Errores verificados» n.º 2).
3. **Control 1: el laboratorio se ejecuta «desde la raíz del repositorio»** (`modulo-5.md:148`, `modulo-14.md:355`), pero el estudiante trabaja en `academia-labs/control-1` (`modulo-0.md:72`).
   - **Corrección:** indicar cómo copiar `simular.py` a `academia-labs/control-1`, o incluir el código completo en el módulo 5.
4. **Control 1: ejemplos de relleno sin resultado.**
   - `modulo-20.md:290-340`: «Esa es la forma que se suma con los demás factores».
   - `modulo-12.md:216-272`: «Si la curva del simulador coincide».
   - `modulo-8.md:541-561`: «Por eso sus ecuaciones tienen la misma forma».
   - `modulo-18.md:42-62` y `:458-488`: «justificado por la ventaja que aporta y la desventaja que se evita».
   - **Corrección:** sustituir cada uno por el resultado concreto o borrarlo.
5. **`control-1/modulo-6.md:166-176` frente a `:291-309`. La misma descripción lleva a conclusiones opuestas** sobre si los lazos se tocan.
   - **Corrección:** añadir un dibujo de cada grafo y distinguir los nombres.
6. **Control 1: sin práctica con solución** en los módulos 9, 10, 13, 17, 19 y 20, y **sin errores comunes** en los módulos 9, 10, 13, 19, 20, 21 y 22.
7. **Control 1: 20 temas abren «Más ejemplos resueltos» sin ejemplo previo** (lista completa: `modulo-1.md:32`, `2.md:202`, `5.md:28`, `6.md:132`, `8.md:162`, `8.md:529`, `11.md:29`, `12.md:200`, `12.md:323`, `13.md:185`, `14.md:29`, `15.md:33`, `16.md:31`, `17.md:34`, `18.md:30`, `18.md:150`, `19.md:270`, `20.md:32`, `20.md:122`, `20.md:278`).
   - Esos ejemplos son de plantilla, sin el desarrollo paso a paso que promete «Cada ejemplo indica qué se hace en cada paso y por qué».
8. **Fundamentos: voseo y tuteo mezclados en 14 módulos** (p. ej. `modulo-1.md:14` «definís», `:149` «Corregilo», `:112` «crea»).
   - **Corrección:** unificar en tuteo, que es lo que usan el módulo 0 y Control 1.
9. **Fundamentos: el proyecto integrador no tiene identidad única.** Aparecen «gestor de tareas» (`modulo-0.md:28`, `modulo-1.md:14`), «calculadora de presupuesto» (`modulo-1.md:674`), «inventario» (`modulo-2.md:988`, `modulo-4.md:1018`) y «RutaFlow» (`modulo-0.md:74`, `modulo-13.md:561`).
   - **Corrección:** elegir uno y declarar en cada módulo qué incremento añade.
10. **Fundamentos: alcance impropio de un curso de entrada.** C# .NET 10 (`modulo-7.md:473`), skills de agentes de IA (`modulo-7.md:666`), Lamport y 2PC (`modulo-10.md:531`), PLC y electromagnetismo (`modulo-12.md:797`, `:902`).
    - **Corrección:** mover estos temas a cursos avanzados y dejar un núcleo de 8–10 módulos.
11. **Fundamentos: dos analogías por tema en 16 temas**, a veces contradictorias (`modulo-1.md:188` frente a `:216`).
    - **Corrección:** conservar una sola analogía, con su límite.
12. **`foundations/modulo-8.md:339`. Solución visible marcada como «[SOLUCIÓN PLEGADA]»** y con cifras que no coinciden con el enunciado (512 MB frente a 256M).
13. **`foundations/modulo-1.md:465-470` frente a `:607`. El ejemplo contradice la regla del propio módulo:** maneja dinero con `float`.
14. **`control-1/modulo-21.md:86`, `modulo-0.md:134-141`. Contenido personal:** el diagnóstico del Parcial 1 de una persona y «Confírmalo con el profesor» (`modulo-21.md:98`).
    - **Corrección:** separarlo en notas privadas, o redactarlo como parcial modelo genérico.

## Defectos menores

- `control-1/modulo-1.md:594`: «\(\Delta = b^2-4c = 4--12=16\)» → `4-(-12)`.
- `control-1/modulo-3.md:599`: «\(2(s+3) + -5\)» → `2(s+3) - 5`.
- `control-1/modulo-9.md:103`: «\(0 + -1\,\delta x\)» → `-\delta x`.
- `control-1/modulo-18.md:182, 202`: «\(e_{ss} = 0\) = 0» → borrar el «= 0» duplicado.
- `control-1/modulo-15.md:217`: «0 raíz(ces)» → concordar el plural.
- `control-1/modulo-0.md:99` (y cada «#### Practica»): «Practica» sin tilde y la frase siguiente empieza en minúscula («añade…»).
- `control-1/modulo-9.md:16`: la fuente enlazada es «Espacio de estados» para un tema de linealización.
- `control-1/track` m(1)…m(3): lista un subtema «Práctica» que no existe como tema.
- `foundations/modulo-0.md:205-209`: el comando de PowerShell va en un bloque etiquetado `bash`.
- `foundations/modulo-1.md:30`: «No intentes casos límite sin pseudocódigo primero» no tiene sentido como regla de «Cuándo NO usar».
- `foundations/modulo-1.md:243, 254`: `int(input("1e10"))` usa "1e10" como texto de la pregunta, no como valor introducido.
- `foundations/modulo-7.md:440-447`: los encabezados del ADR («### Contexto», «### Decisión», «### Consecuencias») van al nivel de tema y rompen la jerarquía.

---

## Errores técnicos y matemáticos verificados

| # | Afirmación (archivo:línea) | Por qué es falsa | Cálculo o fuente |
|---|---|---|---|
| 1 | «Lazo cerrado estable: no. … \(e_{ss} = \frac{1}{4}\)» (`control-1/modulo-14.md:97-99`) | El teorema del valor final solo vale con lazo cerrado estable, como reconoce el propio paso 2. | `np.roots([1,5,0,20])` → \(-5{,}63\) y \(0{,}315\pm1{,}858j\): hay dos raíces en el semiplano derecho, así que el error diverge. |
| 2 | «Identifica \(K\) y \(\tau\)… usando dos filas… de `altura_m` antes del cambio de referencia en \(t=5\) s, y compáralo con el \(G(s)=2/(4s+1)\)» (`control-1/modulo-11.md:597`) | Antes de \(t=5\) s la altura es constante (1,0 m), así que no hay transitorio que identificar. Después, el CSV muestra el **lazo cerrado con P**, no la planta. | Con P: \(2\dot h = 0{,}5 + 0{,}8(1{,}5-h) - 0{,}5h\) → \(\tau_{cl} = 2/1{,}3 = 1{,}54\) s y \(h_\infty = 1{,}3077\). No da \(\tau = 4\) s. Ejecución: «P: altura_final=1.308 m». |
| 3 | «la regla "multiplica magnitudes y suma ángulos" en polar exige que ambos ángulos estén en el mismo rango… hay que normalizar… antes de sumar» (`control-1/modulo-1.md:431`) | \(e^{j\varphi}\) es periódica en \(2\pi\): la suma de ángulos es correcta para cualquier representante. Solo conviene normalizar el **resultado**, no hace falta hacerlo antes. | \(e^{j(\varphi_1+2\pi k)} e^{j\varphi_2} = e^{j(\varphi_1+\varphi_2)}\). |
| 4 | «"3,14" vs "3.14": Distinto en Python (es error). Locales usan coma, pero `int()` espera punto.» (`foundations/modulo-1.md:265`) | `int()` también rechaza "3.14": no acepta separador decimal. Quien acepta el punto es `float()`. | Python 3.14: `int("3.14")` → `ValueError` y `float("3.14")` → `3.14`. |
| 5 | Solución «Ruta segura»: `if 1 <= cantidad <= 1000:` seguido solo de `# válida` (`foundations/modulo-1.md:261-262`) | No es Python válido: un bloque no puede contener solo un comentario. Además `int(float(x))` trunca 3,7 a 3 sin avisar. | Ejecutado: `IndentationError: expected an indented block after 'if' statement on line 2`. |
| 6 | «Intervalo de confianza = rango donde crees que está el verdadero p95… Necesitas >300 muestras… SLI debe ser "p95 < 200ms por mes"» (`foundations/modulo-9.md:410`) | (a) Un intervalo de confianza frecuentista no es un rango de creencia; el mismo módulo lo contradice en `:418`: «comunica incertidumbre del procedimiento». (b) «>300 muestras» no tiene fuente. (c) «p95 < 200 ms por mes» es un **SLO**; el SLI es la medida (el p95 observado). | Google SRE Book, capítulo «Service Level Objectives» (definiciones de SLI y SLO). |
| 7 | «Pruebas con 100 pasan, pero 99.99 falla al guardar precisión decimal» (`foundations/modulo-1.md:69`) | Con la regla `subtotal >= 100`, el valor 99.99 se clasifica bien (sin descuento). La propia solución reconoce que «`99.99 * 0.90` imprime exactamente `89.991`». | `99.99 >= 100` → `False`; `99.99*0.90` → `89.991`. |
| 8 | «\(\dfrac{s + 0{,}1}{s + 0{,}013}\): el error ante rampa baja 8 veces» (`control-1/modulo-19.md:212`) | Por redondeo: \(0{,}1/0{,}013 = 7{,}69\). | Lo correcto es \(\beta = 8\) → polo en 0,0125. |

**Resultados verificados como correctos** (muestra): `control-1/modulo-2.md:258`, `:506` y `:626`; `modulo-3.md:485`, `:627` y `:788`; `modulo-4.md:184`; `modulo-7.md:98`, `:140` y `:422`; `modulo-8.md:59`, `:230`, `:305` y `:431`; `modulo-9.md:51`; `modulo-10.md:245`; `modulo-11.md:245`, `:499` y `:566`; `modulo-12.md:636`, `:707-743` y `:847-927`; `modulo-13.md:33` (aproximado 35,1 % y exacto 33,2 %) y `:191-374`; `modulo-14.md:45-115` (salvo el Ejemplo 5) y `:281-323`; `modulo-15.md:166-618`; `modulo-16.md:47-500`; `modulo-17.md:50-496`; `modulo-18.md:311`, `:351-379`, `:559`, `:585` y `:611-674`; `modulo-19.md:61-105`, `:166` y `:286-369`; `modulo-20.md:44-84`, `:428` y `:484-526`; `modulo-1.md:707-787`; `modulo-21.md:56-140` y `modulo-22.md`, Puntos 4–6.

---

## Plan de corrección priorizado

1. **Corregir los 8 errores verificados y los 7 bloqueantes** (2–3 días). Empezar por `modulo-14.md:99`, el PDF del módulo 12 de Fundamentos y el Proyecto 1.
2. **Renumerar Control 1 a «módulo N»** con un script de sustitución y añadir a `validate.sh` una comprobación de que cada «módulo N» citado existe y su título coincide (medio día).
3. **Reescribir la entrada de Fundamentos:** módulo 0 (Tema 2 primero, Tema 1 de 30 min), Tema 1 del módulo 1 sin construcciones no enseñadas, Proyecto 1 sin Git y con solución, tuteo unificado. Después, probarlo con un principiante real en Windows (4–5 días).
4. **Ampliar `validate.sh`** (2 días):
   - ejecutar los bloques `python` de cada curso en un entorno aislado y comparar con el «Resultado esperado»;
   - integrar `audit_plantilla.py`, con los regex corregidos para «¿Por qué?» y «Práctica para resolver»;
   - rechazar «PDF», «captura», «Próximamente», «[SOLUCIÓN PLEGADA]» y «capítulo N».
5. **Rellenar los huecos de plantilla:** resumen y práctica con solución en los 6 módulos de Control 1 que no la tienen; quitar el relleno de los módulos 8, 12, 18 y 20; dejar una sola analogía por tema en Fundamentos; mover los temas avanzados (C#, 2PC, PLC, electrónica) fuera del curso de entrada (1,5–2 semanas).

## Qué no pude auditar y por qué

- **Circuitos de `foundations/modulo-12.md:956-1015`** (Thévenin y diodos): el esquema no está en el repo, solo hay referencias a «merged.pdf, página 65/67». No auditable y bloqueante.
- **Ejecución en Windows y PowerShell:** auditado solo en Linux (Python 3.14 de la imagen). El propio texto admite que no se probó.
- **Comandos interactivos y externos:** Docker (`foundations/modulo-8.md`), .NET 10 (`modulo-7.md:477`), PostgreSQL y PL/pgSQL (`modulo-4.md:756`), `curl` y DevTools (`modulo-3.md`), `hypothesis` (`modulo-9.md`, la dependencia no estaba instalada) y los bloques con `input()` (4). Los revisé por lectura, sin ejecutarlos.
- **Figuras interactivas** (`content/figures/control-1-segundo-orden/figure.html` y `visuals/temas/...`): comprobé que existen, pero no las abrí en un navegador.
- **Lectura completa:** leí completos 10 módulos y la muestra de temas listada en «Método». En el resto se revisaron encabezados, enunciados y resultados, no cada párrafo.
- **Prueba con principiante real (Parte 2, §5):** fuera del alcance de un auditor documental.
