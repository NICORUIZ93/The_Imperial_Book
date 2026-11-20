# Formato educativo único (specs/021)

**Estado:** aprobado por el dueño el 2026-11-20. Es la regla de toda la academia; lo mide
`python3 scripts/validate_formato.py` y el avance está en [AVANCE-FORMATO.md](AVANCE-FORMATO.md). Lección de
ejemplo completa: [leccion-modelo/LECCION.md](leccion-modelo/LECCION.md).

## Curso

Archivo de portada del curso con, en este orden:

1. **Para quién es** y qué necesitas saber antes (con enlace a los cursos previos).
2. **Qué sabrás hacer** al terminar (5 a 8 resultados comprobables).
3. **Mapa del curso** (diagrama) con sus cuatro tramos: **Fundamentos → Aplicación → Integración → Experto**.
4. **Proyecto guía**: el sistema que crece módulo a módulo.
5. **Duración** total y por tramo; **versiones** fijadas; **cómo preparar el entorno**.
6. **Proyecto final** con rúbrica.

Al menos la mitad de los temas del curso son de Integración o Experto.

## Módulo

Cabecera: objetivo · prerrequisitos · duración · versiones · laboratorio (`examples/<curso>/modulo-N/`) ·
mapa del módulo (diagrama). De 3 a 7 temas. Cierre: resumen, autoevaluación y siguiente módulo.

## Tema

Encabezado: `### Tema N: Título · Nivel · NN min` (nivel: Básico, Intermedio, Avanzado o Experto; de 20 a
45 minutos). Debajo, siempre estas 12 secciones, con este nombre y en este orden:

| # | Sección (`####`) | Qué contiene | Regla comprobable |
|---|---|---|---|
| 1 | Ubicación y prerrequisitos | dónde va en la ruta, qué temas necesita (enlazados), versiones | enlaces a temas que existen y son anteriores |
| 2 | Objetivo | una frase con verbo observable: qué podrás hacer | empieza por «Al terminar podrás» |
| 3 | Por qué importa | el problema real que resuelve y qué pasa si lo ignoras | sin definiciones de diccionario |
| 4 | Analogía | una imagen cotidiana y dónde deja de servir | incluye «Dónde se rompe la analogía» |
| 5 | Diagrama | flujo, memoria, secuencia o arquitectura | bloque `mermaid` o figura + «Texto alternativo» |
| 6 | Explicación | tres subapartados: **Nivel 0** (lo mínimo), **Nivel intermedio** (uso real), **Nivel maestro** (por dentro, límites, rendimiento) | los tres subapartados presentes |
| 7 | Código ejecutable | ejemplo mínimo + ejemplo realista, archivo con nombre, versiones, comando y **salida real** | cada bloque con archivo, comando y «Salida» |
| 8 | Mini-laboratorio | pasos numerados sobre el proyecto guía, con criterio de éxito | termina en «Listo cuando…» |
| 9 | Verificación | cómo comprobar que funcionó (test o comando) | comando ejecutable |
| 10 | Error común y diagnóstico | el error real con su mensaje o síntoma, cómo se encuentra y cómo se corrige | «Síntoma», «Causa», «Arreglo» |
| 11 | Pregunta con respuesta modelo | una de comprensión y una de entrevista | «Respuesta modelo» |
| 12 | Cuándo usarlo y cuándo no | criterio, alternativas y costo | tabla o lista «Úsalo / No lo uses» |

Reglas transversales: todo código se ejecutó y su salida está pegada tal cual; ningún tema usa algo no
enseñado antes; los ejemplos pertenecen al proyecto guía del curso; un concepto que es de otro curso se
enlaza, no se vuelve a explicar.

## Laboratorio

`examples/<curso>/modulo-N/` con `README.md`, versiones fijadas (wrapper de Gradle o lockfile) y
`verificar.sh` que sigue ante fallos y termina en `RESULTADO: OK`. Se ejecuta en el Mac del dueño antes de
cerrar el módulo.

## Página

La app dibuja las 12 secciones con los mismos componentes en todos los cursos: ficha de tema con nivel y
minutos, bloque de código con nombre de archivo y botón de copiar, bloque «Salida», avisos (nota, cuidado,
error común), diagrama ampliable, índice del tema, progreso y navegación anterior/siguiente.

## Microservicios

Conserva su ficha de 14 puntos (pedida por el dueño en su prompt), que equivale a este formato: sus puntos
6, 7 y 8 (explicación nivel 0, intermedia y maestra) son la sección 6, y su punto 14 (anti-patrón) va
dentro de la sección 12. El validador acepta las dos formas.
