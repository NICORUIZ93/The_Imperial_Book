# Sustancia de las lecciones

Detección de señales que requieren inspección: repetición, cola de texto y
andamiaje genérico. **No mide aprendizaje ni calidad**; una lección sin
señales detectadas tampoco acredita corrección ni comprensión.

| Métrica | Valor |
|---|---:|
| Temas analizados | 1323 |
| Temas con alguna señal (requiere inspección) | 1 |
| Módulos con apéndices heredados | 170/291 |

## Señales por tipo

| Código | Temas |
|---|---:|
| `cola-tras-cierre` | 1 |

## Apéndices heredados más frecuentes

| Sección | Módulos |
|---|---:|
| ## Construcción guiada del capítulo | 39 |
| ## Ruta de proyecto progresivo desde carpeta vacía | 12 |
| **Errores comunes y soluciones** | 166 |

## Temas con más señales

| Track / módulo | Tema | Palabras | Cola tras cierre | Códigos |
|---|---|---:|---:|---|
| cloud / 0 | Tema 7: Metodología de estudio — teoría, laboratorio y evaluación en cada módulo | 727 | 575 | cola-tras-cierre |

## Cómo se corrige

1. Se inspecciona y reescribe el bloque dentro del tema; no se añade relleno al final.
2. Se diferencian las secciones repetidas con contenido específico; renombrar no acredita la reescritura.
3. Se revisa cada apéndice heredado antes de integrarlo donde sea pertinente.
4. `--strict` compara contra `docs/lesson-substance-baseline.json`: ningún
   tema nuevo puede nacer con estas señales sin revisión.

Huella del contenido: `7a3875a7355e075959c8173ea527dd16ea1124d47cef9a51a184577dad12a77a`
