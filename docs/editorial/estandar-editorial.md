# Estándar editorial único — Plataforma de cursos

Aplica a todos los cursos y tracks existentes y futuros.

## Filosofía

1. **Intuición antes que rigor.** Primero por qué existe, después cómo funciona.
2. **Concreto antes que abstracto.** Ejemplo específico antes de generalización.
3. **Progresiva divulgación.** Intuición → mecánica → trade-offs → cuándo NO usar.
4. **Voz que habla al lector.** Activa, presente, español neutro; sin “simplemente/obviamente”.
5. **Cada sección responde una pregunta.**
6. **Nada se dice dos veces.** Se referencia.
7. **El lector nunca se pierde.** Término nuevo = definir o enlazar en la misma frase.
8. **Dos capas separadas:** Lectura (conceptos) y Construcción (código).

## Capa 1 — Lectura (siempre visible)

Por defecto sin código/comandos/outputs/config/rutas/versiones. Excepción: ≤3 líneas, con frase previa que explique qué demuestra.

Estructura obligatoria por tema:

1. `#### ► DE QUÉ TRATA` (2-3 líneas)
2. `#### ► LA IDEA EN UNA FRASE` (1 línea destacada)
3. `#### ► POR QUÉ EXISTE ESTO` (máx 5 líneas)
4. `#### ► LA ANALOGÍA` (máx 4 líneas + “Dónde se rompe la analogía”)
5. `#### ► CÓMO FUNCIONA` (diagrama flechas/palabras + tabla o 5-7 pasos)
6. `#### ► LO QUE PUEDE SALIR MAL` (tabla Síntoma/Causa/Arreglo, 3 filas)
7. `#### ► TRADE-OFFS` (tabla Opción/Cuándo usarla/Cuándo NO, 3-5 filas)
8. `#### ► CUÁNDO NO USAR ESTO` (máx 4 líneas)
9. `#### ► DE VUELTA A LA ANALOGÍA` (2 líneas)
10. `#### ► LO QUE DEBES RECORDAR` (3-4 bullets)
11. `#### ► PREGUNTAS PARA PENSAR` (3 preguntas sin respuesta)

Reglas: sin bloques de prosa >5 líneas seguidas; tablas 3-5 filas; diagramas con flechas/palabras; mismo dominio en el curso.

## Capa 2 — Construcción (colapsable)

Contenido: construcción guiada desde cero, código, comandos, outputs, verificación.

Reglas:
1. Propósito declarado: “archivo X → hace Y”.
2. Un archivo por bloque.
3. Outputs cortos: máximo 3 líneas.
4. Comandos con contexto: para qué + qué deberías ver.
5. Construcción guiada antes de código de referencia.
6. Código de referencia al final.
7. Verificación automática en repo/script, no pegada como lectura larga.

## Reglas transversales

- Cada decisión técnica relevante: ≥2 alternativas y trade-off.
- ≥3 ejercicios por curso donde la respuesta correcta sea “NO usar X”.
- Herramientas visuales gratuitas o de bajo costo.
- Cursos independientes entre sí.
- Tono motivador, cercano, sin condescendencia.
