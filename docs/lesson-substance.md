# Sustancia de las lecciones

Detección de defectos verificables: repetición, cola de texto pegada y
andamiaje genérico. **No mide aprendizaje ni calidad**; una lección sin
defectos detectados tampoco acredita haber sido comprendida.

| Métrica | Valor |
|---|---:|
| Temas analizados | 1100 |
| Temas con algún defecto | 0 |
| Módulos con apéndices heredados | 183/245 |

## Defectos por tipo

| Código | Temas |
|---|---:|

## Apéndices heredados más frecuentes

| Sección | Módulos |
|---|---:|
| ## Construcción guiada del capítulo | 41 |
| ## Ruta de proyecto progresivo desde carpeta vacía | 12 |
| **Errores comunes y soluciones** | 181 |

## Temas con más defectos

| Track / módulo | Tema | Palabras | Cola tras cierre | Códigos |
|---|---|---:|---:|---|

## Cómo se corrige

1. Se reescribe el bloque dentro del tema; no se añade texto al final.
2. Se elimina la segunda aparición de una sección, no se renombra.
3. Se borra el apéndice de módulo o se integra en el tema que lo necesita.
4. `--strict` compara contra `docs/lesson-substance-baseline.json`: ningún
   tema nuevo puede nacer con estos defectos.

Huella del contenido: `a3f9a63a54145339ac6458f281c53656438ff95f92a763d727d0821e62f161b6`
