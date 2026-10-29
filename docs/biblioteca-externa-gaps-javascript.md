# Huecos del track JavaScript frente a la biblioteca externa


## Estado (2026-10-28)
Resuelto: **M1 T6** (desestructuración) y **M3 T5** (Symbol e iterables). Canvas queda como opcional. Ejemplos ejecutados con Node 22.

**Fecha:** 2026-10-28 · **Método:** outline del PDF cruzado con los temas de `javascript` + búsqueda de palabras clave.

## Libro cotejado
- **libro de programación javascrip.pdf** (traducción de *Eloquent JavaScript*, 445 págs.).

## Veredicto
Track muy completo (llega a WASM, Temporal, Service Workers). Huecos detectados:

| Tema del libro | Sección | Estado en el track | Prioridad |
|---|---|---|---|
| **Desestructuración** de objetos y arrays (incluye defaults y renombrado) | Estructuras de datos | Solo aparece en ejemplos (2 archivos), sin tema propio | **Alta**: sintaxis de uso diario |
| **Symbol y protocolo de iteración** (`Symbol.iterator`, objetos iterables propios) | La vida secreta de los objetos | De refilón (2-3 menciones); generadores sí existen | Media |
| **Canvas 2D** (dibujo, animación) | Proyecto / dibujo en canvas | Ausente | Baja |
| **Proyectos guiados largos** (robot, juego de plataforma, editor de píxeles) | Capítulos de proyecto | El track usa proyecto integrador SPA | Baja (metodología, ver Frente 2) |

## Propuesta
1. Tema nuevo en M1 o M4: "Desestructuración, valores por defecto y rest en patrones".
2. Tema nuevo en M3: "Symbol e iterables propios".
3. Canvas solo si se quiere un tema opcional de gráficos.
