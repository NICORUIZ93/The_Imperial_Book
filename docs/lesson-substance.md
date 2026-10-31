# Sustancia de las lecciones

Detección de defectos verificables: repetición, cola de texto pegada y
andamiaje genérico. **No mide aprendizaje ni calidad**; una lección sin
defectos detectados tampoco acredita haber sido comprendida.

| Métrica | Valor |
|---|---:|
| Temas analizados | 1100 |
| Temas con algún defecto | 2 |
| Módulos con apéndices heredados | 183/245 |

## Defectos por tipo

| Código | Temas |
|---|---:|
| `tema-breve` | 2 |

## Apéndices heredados más frecuentes

| Sección | Módulos |
|---|---:|
| ## Construcción guiada del capítulo | 41 |
| ## Ruta de proyecto progresivo desde carpeta vacía | 12 |
| **Errores comunes y soluciones** | 181 |

## Temas con más defectos

| Track / módulo | Tema | Palabras | Cola tras cierre | Códigos |
|---|---|---:|---:|---|
| javascript / 0 | Tema 4: Template literals y mensajes seguros | 431 | 160 | tema-breve |
| javascript / 0 | Tema 3: Conversión, coerción e igualdad | 428 | 146 | tema-breve |

## Cómo se corrige

1. Se reescribe el bloque dentro del tema; no se añade texto al final.
2. Se elimina la segunda aparición de una sección, no se renombra.
3. Se borra el apéndice de módulo o se integra en el tema que lo necesita.
4. `--strict` compara contra `docs/lesson-substance-baseline.json`: ningún
   tema nuevo puede nacer con estos defectos.

Huella del contenido: `e53b41c11b24aa2d1dc4a7518f55c9892e845585d4d86f677bcc5a256b863687`
