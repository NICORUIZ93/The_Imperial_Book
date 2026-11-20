# 1 · Portada visual del curso

# Microservicios de Cero a Maestro
## Spring Boot y Node.js por Separado

*28–32 semanas · 37 módulos · 187 fichas · de nunca haber programado a defender una arquitectura ante un comité.*

> **Descripción de la portada (para ilustrar y como texto alternativo):** un mapa de metro sobre fondo blanco
> roto. Cuatro líneas de colores salen de una misma estación, «Hola Mundo», a la izquierda: la línea azul
> (Fase 0) es corta y recta; de ella nacen dos líneas paralelas, la verde (Fase 1 · Spring Boot) y la naranja
> (Fase 2 · Node.js), que avanzan sin cruzarse, cada una con 11–12 estaciones redondas; ambas desembocan en la
> línea violeta (Fase 3 · Maestro), que termina en una estación grande con forma de mesa redonda: «Comité de
> Arquitectura». El título va arriba a la izquierda en Atkinson Hyperlegible Next negrita, color tinta.
> **Texto alternativo corto:** «Mapa de metro con cuatro líneas: fundamentos, Spring Boot, Node.js y nivel
> maestro, que termina en el Comité de Arquitectura».

## Paleta

La paleta parte de los colores de **Okabe-Ito**, pensados para que los distingan personas con daltonismo
(fuente: Okabe & Ito, *Color Universal Design*, https://jfly.uni-koeln.de/color/). Cada fase tiene un color
**de relleno** (gráficos, bordes, íconos) y un color **de texto** oscurecido para cumplir contraste AA sobre
fondo claro, más una variante clara para modo oscuro.

| Rol | Relleno | Texto sobre claro | Texto sobre oscuro | Uso |
|---|---|---|---|---|
| Fase 0 · Fundamentos | `#0072B2` azul | `#005A8C` | `#7DD3FC` | línea de metro, chips de la fase 0 |
| Fase 1 · Spring Boot | `#009E73` verde azulado | `#00704F` | `#5EEAD4` | fichas y diagramas de Spring |
| Fase 2 · Node.js | `#E69F00` naranja | `#8A5A00` | `#FCD34D` | fichas y diagramas de Node |
| Fase 3 · Maestro | `#CC79A7` púrpura rojizo | `#9E3F78` | `#F9A8D4` | arquitectura avanzada |
| Error / anti-patrón | `#D55E00` bermellón | `#A13F00` | `#FDBA74` | sección 12 y 14 de cada ficha |
| Tinta (texto principal) | — | `#111827` | `#F8FAFC` | cuerpo de texto |
| Texto secundario | — | `#4B5563` | `#CBD5E1` | pies de figura, metadatos |
| Fondo claro / superficie | `#FFFFFF` / `#F8FAFC` | — | — | página / tarjetas |
| Fondo oscuro | `#0F172A` | — | — | modo oscuro |

### Contraste comprobado (WCAG 2.2)

Calculado con la fórmula de luminancia relativa de WCAG 2.2 (https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio)
el 2026-11-19 con un script de Python (los valores están redondeados a dos decimales). Umbrales: **4.5:1**
para texto normal (1.4.3 AA), **3:1** para texto grande y componentes gráficos (1.4.3 y 1.4.11 AA), **7:1**
para AAA.

| Pareja | Contraste | Resultado |
|---|---|---|
| `#111827` tinta sobre `#FFFFFF` | 17.74:1 | AAA |
| `#4B5563` secundario sobre `#FFFFFF` | 7.56:1 | AAA |
| `#4B5563` secundario sobre `#F8FAFC` | 7.22:1 | AAA |
| `#005A8C` texto Fase 0 sobre `#FFFFFF` | 7.39:1 | AAA |
| `#00704F` texto Fase 1 sobre `#FFFFFF` | 6.12:1 | AA |
| `#8A5A00` texto Fase 2 sobre `#FFFFFF` | 5.93:1 | AA |
| `#9E3F78` texto Fase 3 sobre `#FFFFFF` | 6.11:1 | AA |
| `#A13F00` texto de error sobre `#FFFFFF` | 6.51:1 | AA |
| Los cinco textos anteriores sobre `#F8FAFC` | entre 5.66:1 y 7.06:1 | AA |
| `#F8FAFC` tinta clara sobre `#0F172A` | 17.06:1 | AAA |
| `#7DD3FC` / `#5EEAD4` / `#FCD34D` / `#F9A8D4` / `#FDBA74` sobre `#0F172A` | 10.71 / 12.07 / 12.38 / 9.84 / 10.59 | AAA |
| Relleno `#0072B2` sobre `#FFFFFF` (gráfico) | 5.19:1 | cumple 3:1 |
| Relleno `#009E73` sobre `#FFFFFF` (gráfico) | 3.42:1 | cumple 3:1 |
| Relleno `#CC79A7` sobre `#FFFFFF` (gráfico) | 3.06:1 | cumple 3:1 |
| Relleno `#E69F00` sobre `#FFFFFF` (gráfico) | 2.25:1 | **no cumple**: úsalo siempre con borde `#8A5A00` o con texto `#111827` encima (7.88:1) |
| Relleno `#D55E00` sobre `#FFFFFF` (gráfico) | 3.87:1 | cumple 3:1 |

**Reglas de uso**

- Los rellenos de la paleta **nunca** llevan texto blanco encima: usa tinta `#111827`. Sobre verde (5.19:1),
  naranja (7.88:1), púrpura (5.80:1) y bermellón (4.59:1) vale para texto normal; sobre el azul `#0072B2`
  (3.42:1) solo para texto grande (≥ 24 px o 18.66 px en negrita).
- El color nunca es la única pista: cada fase lleva además su número («F1») y su ícono.
- En diagramas Mermaid usa `classDef` con el relleno y `stroke` del color de texto; ver la plantilla en
  [02-mapa.md](02-mapa.md).

## Tipografía

Todas son gratuitas, con licencia **SIL Open Font License 1.1** (comprobado en el registro npm de Fontsource
el 2026-11-19).

| Uso | Fuente | Por qué | Fuente oficial |
|---|---|---|---|
| Títulos y texto | **Atkinson Hyperlegible Next** (400, 700) | diseñada por el Braille Institute para baja visión: distingue `I`, `l`, `1` y `0`/`O` | https://fontsource.org/fonts/atkinson-hyperlegible-next |
| Código, comandos y salidas | **JetBrains Mono** (400, 700) | monoespaciada con ligaduras desactivables y caracteres claros | https://fontsource.org/fonts/jetbrains-mono |
| Alternativa para lectores con dislexia | **Lexend** | espaciado amplio; se ofrece como opción, no por defecto | https://fontsource.org/fonts/lexend |

Escala: cuerpo 18 px (1.125 rem) con interlineado 1.6; títulos 1.25 · 1.5 · 2 · 2.5 rem; código 16 px;
longitud de línea máxima 75 caracteres.

## Estilo gráfico

| Elemento | Regla |
|---|---|
| **Analogías visuales (punto 4)** | ilustración plana, trazo de 2 px, dos o tres colores de la fase sobre fondo claro; objetos cotidianos (cocina, oficina de correos, aeropuerto) en lugar de metáforas abstractas. |
| **Diagramas técnicos (punto 5)** | Mermaid (MIT, gratuito, se renderiza en GitHub y en la web del curso) para flujo, secuencia y estados; Excalidraw (MIT) para bocetos a mano alzada. Siempre con «**Texto alternativo:**» debajo. |
| **Íconos** | Lucide (ISC), trazo 2 px, 24 px; nombres en [05-glosario.md](05-glosario.md). |
| **Capturas de terminal** | generadas como SVG con `python3 scripts/render_terminal_capture.py` a partir de la salida real, nunca retocadas. |
| **Nivel 0 / Maestro** | el nivel 0 usa la analogía como imagen principal; el nivel maestro usa diagramas C4 y tablas de trade-offs. |
| **Errores y anti-patrones** | marco bermellón `#D55E00` y el ícono `triangle-alert`; el arreglo, marco de la fase y el ícono `circle-check`. |
| **Mapa del curso** | metáfora de metro (ver [02-mapa.md](02-mapa.md)). |

Herramientas de diseño gratuitas: Mermaid Live Editor (https://mermaid.live), Excalidraw
(https://excalidraw.com), Lucide (https://lucide.dev) y un comprobador de contraste como el de WebAIM
(https://webaim.org/resources/contrastchecker/).
