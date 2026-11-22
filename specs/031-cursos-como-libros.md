# Spec 031 - Cursos como libros técnicos

**Estado:** aprobado por el dueño (2026-11-22)  
**Reemplaza en calidad a:** la ejecución esqueleto de fichas C2 hecha bajo Spec 028. Spec 028 sigue vigente como alcance/matriz; Spec 031 define la forma didáctica obligatoria.

## Problema

Las fichas C2 generadas como esqueletos de 15 headings cumplen forma pero no enseñan: explicaciones genéricas, código de 1-3 líneas, construcción no reproducible, sin modelo mental ni salidas reales. Esto viola Spec 028 y el objetivo de aprendizaje.

## Decisión

Cada curso se escribe como un **libro técnico**. Cada tema/lección es un **capítulo**. La referencia de estilo didáctico es “Java a fondo” (Sznajdleder): problema real, progresión simple→compleja, código completo, explicación por bloque/línea, errores, ejercicios/verificación, resumen.

No se copia texto de libros con copyright. Se replica estructura pedagógica.

## Estructura por curso (libro)

```text
docs/cursos/<curso>/
  README.md                 # portada del libro: audiencia, prerequisitos, mapa, proyecto guía, entorno
  fichas/                   # capítulos
  labs/                     # laboratorios ejecutables
  assets/                   # diagramas/figuras
  apendices/                # glosario, cheatsheet, troubleshooting (cuando aplique)
```

Portada del libro obligatoria:
- Para quién es / qué necesita saber.
- Qué sabrás hacer al terminar (resultados medibles).
- Mapa de módulos/partes (Mermaid).
- Proyecto guía que crece por capítulos.
- Versiones, instalación, verificación del entorno.
- Convenciones del libro.

## Estructura por capítulo (tema)

Mantiene los 15 puntos de Spec 028, con contenido de libro. Ningún heading puede quedar como stub.

1. **Ubicación** - curso, módulo, lección, tiempo, versiones.
2. **Prerrequisitos** - conocimientos/comandos/capítulos previos.
3. **Objetivo de aprendizaje** - “Al terminar podrás…” verbo Bloom medible.
4. **Problema real / por qué importa** - dolor real, qué pasa si se ignora.
5. **Analogía y modelo mental** - analogía concreta, texto alternativo, dónde se rompe.
6. **Diagrama técnico** - Mermaid o figura + texto alternativo.
7. **Conceptos fundamentales** - qué es, cómo funciona por dentro, cuándo usar, cuándo NO usar, trade-offs. Sustantivo.
8. **Construcción desde cero** - pasos numerados: crear archivo, escribir bloque, explicar por qué, ejecutar, salida real.
9. **Código de referencia completo** - archivos completos ejecutables en lab; capítulo muestra código relevante completo.
10. **Explicación línea por línea / por bloque** - intención, efecto, qué pasa si falta/cambia.
11. **Laboratorio reproducible** - comandos exactos, salida esperada, cleanup.
12. **Verificación automática** - `verify.sh`/test, qué valida, pass/fail.
13. **Modificación guiada** - cambio, hipótesis, comando, resultado observado.
14. **Error común y diagnóstico** - síntoma, mensaje real, causa, diagnóstico, fix.
15. **Cierre** - anti-patrón, pregunta entrevista + respuesta modelo, resumen, puente siguiente capítulo.

## Gates de calidad

Un capítulo solo está “hecho” si:
- [ ] No contiene stubs: `PENDIENTE`, `Crear lab base`, `Configurar mecanismo`, etc.
- [ ] Tiene código completo ejecutable en `labs/<id>/`.
- [ ] `./verify.sh` pasa en esta máquina.
- [ ] Construcción desde cero tiene comandos y salidas reales.
- [ ] Explicación línea/bloque cubre decisiones, no solo sintaxis.
- [ ] Error común es reproducible o basado en mensaje real.
- [ ] Diagramas tienen texto alternativo.
- [ ] Ficha tiene profundidad suficiente para enseñar sin adivinar.

## Plan de ejecución

1. **Contención**: parar esqueletos; revertir fichas C2 dañadas a estado HEAD bueno; conservar labs útiles.
2. **Piloto**: C2 M09-L01 Spring Security filter chain como capítulo libro aprobado por dueño.
3. **Escalado C2**: por módulos, lotes pequeños, verify + revisión.
4. **C1 y C3**: mismo formato libro, tras validar flujo.
5. **Validadores**: endurecer `validate_course_design.py` para detectar stubs/profundidad mínima.

## Fuera de alcance

- Copiar texto de libros.
- Marcar 100% sin evidencia ejecutada.
- Generación masiva sin revisión.
