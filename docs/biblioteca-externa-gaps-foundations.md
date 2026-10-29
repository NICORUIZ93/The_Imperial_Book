# Huecos del track Foundations frente a la biblioteca externa


## Estado (2026-10-28)
Resueltos los tres huecos: **Módulo 13** (algoritmos clásicos), **Módulo 14** (Decorator, State, Template Method, Chain of Responsibility, Mediator, Memento, Visitor, Flyweight) y **Módulo 4, Tema 5** (subconsultas, vistas, triggers y funciones de ventana). Todos los ejemplos se ejecutaron.

**Fecha:** 2026-10-28 · **Método:** outlines de los PDF cruzados con `foundations`. Para patrones se buscó en **todos** los tracks.

## Libros cotejados
- **Introducción al análisis y diseño de algoritmos (Baase y Van Gelder, 3a ed.)**: 14 capítulos.
- **Sumérgete en los patrones de diseño (Shvets)**: POO, principios, SOLID y los 22 patrones GoF.
- **BasesDatos_SQL_Basico_Tutorial_Basico.pdf**: 29 capítulos de SQL.
- **Programacion_Clean_Code_Manual_Avanzado.pdf**: escaneado; **pendiente de OCR**.

## Hueco 1: algoritmos clásicos (prioridad alta) — ✅ resuelto
**Estado (2026-10-28):** cubierto por el nuevo `foundations/modulo-13.md` ("Algoritmos clásicos", 5 temas con ejemplos Python ejecutados y salidas verificadas).

El M2 enseña estructuras y complejidad, pero **ningún tema de la academia** cubre:

| Tema (Baase) | Capítulo | Menciones en toda la academia |
|---|---|---|
| Algoritmos de ordenamiento concretos (quicksort, mergesort, heapsort) | 4 | 0 |
| Algoritmos codiciosos y árbol de expansión mínima (Prim, Kruskal) | 8 | 0 |
| Caminos más cortos (Dijkstra, Floyd-Warshall, Bellman-Ford) | 8-9 | Dijkstra 1 |
| Búsqueda en cadenas (KMP, Boyer-Moore, Rabin-Karp) | 11 | 0 |
| NP-completitud y problemas intratables | 13 | 0 |
| Heap / cola de prioridad | 6 | 1 |

## Hueco 2: catálogo GoF incompleto (prioridad alta)
De los 22 patrones de Shvets, **8 no aparecen en ningún track**: Flyweight, Memento, Visitor, Mediator, Chain of Responsibility, Template Method, State y **Decorator** (este último es base de middlewares y anotaciones). Composite y Abstract Factory aparecen solo una vez.

## Hueco 3: SQL avanzado (prioridad media)
M4 cubre modelado, SQL básico, índices y transacciones. Faltan:
- **Subconsultas** (en SELECT, FROM, WHERE y UPDATE) y **vistas**.
- **Procedimientos almacenados y funciones** (0 menciones en toda la academia).
- **Triggers** (solo menciones sueltas).
- **Funciones de ventana** (no están en el libro, pero son el siguiente paso natural).

## Propuesta
1. Módulo nuevo **"Algoritmos clásicos"**: ordenamientos, greedy/MST, caminos más cortos, búsqueda en cadenas e introducción a NP.
2. Módulo nuevo **"Catálogo de patrones de diseño"** siguiendo el orden de Shvets (creacionales, estructurales, de comportamiento), con un tema por cada patrón que falta. Este libro es también la referencia del Frente 2 (diseño).
3. Tema nuevo en M4: "Subconsultas, vistas, procedimientos almacenados y triggers".
