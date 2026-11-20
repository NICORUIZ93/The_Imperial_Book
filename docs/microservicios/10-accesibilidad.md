# 10 · Guía de accesibilidad

> Entregable 10 del prompt del dueño. Objetivo: que el curso cumpla **WCAG 2.2 nivel AA**
> (https://www.w3.org/TR/WCAG22/) en la web, en los diagramas, en el código y en los laboratorios. Esta guía
> es para quien escribe fichas y para quien estudia: la segunda parte te dice cómo adaptar el curso a ti.

## Parte 1 · Reglas para autores

### Texto e idioma

| Regla | Criterio WCAG | Cómo se comprueba |
|---|---|---|
| Español neutro con tuteo, frases cortas (una idea por frase, ≤ 25 palabras cuando se pueda). | 3.1.5 Nivel de lectura (AAA, buena práctica) | lectura en voz alta del nivel 0 |
| Cada término técnico se define la primera vez o enlaza al [glosario](05-glosario.md). | 3.1.3 Palabras inusuales (AAA, buena práctica) | revisión de la ficha |
| Los fragmentos en inglés (nombres de API, mensajes de error) van en `código`, para que el lector de pantalla no los pronuncie como español. | 3.1.2 Idioma de las partes (AA) | revisión |
| Los títulos siguen la jerarquía sin saltos: `#` módulo, `###` ficha, `####` punto. | 1.3.1 Información y relaciones (A) | `scripts/validate_fichas.py` comprueba los `####` |
| Los enlaces dicen adónde llevan («guía de versiones»), nunca «aquí». | 2.4.4 Propósito de los enlaces (A) | `grep -n "\[aquí\]"` sin resultados |

### Color y contraste

| Regla | Criterio WCAG |
|---|---|
| Texto normal con contraste ≥ 4.5:1 y texto grande ≥ 3:1; usa los colores «texto» de la [paleta](01-portada.md), ya comprobados. | 1.4.3 Contraste mínimo (AA) |
| Bordes, íconos y elementos de diagramas con contraste ≥ 3:1 con el fondo; el naranja `#E69F00` necesita borde `#8A5A00`. | 1.4.11 Contraste no textual (AA) |
| El color nunca es la única pista: «correcto/incorrecto» lleva palabra e ícono (`circle-check`, `triangle-alert`); las fases llevan su número. | 1.4.1 Uso del color (A) |
| La paleta usa colores de Okabe-Ito, distinguibles con protanopia, deuteranopia y tritanopia. | buena práctica |

### Diagramas e imágenes

1. **Todo diagrama lleva «Texto alternativo:»** justo debajo (el validador lo exige en el punto 5). Debe contar
   lo mismo que el diagrama: elementos, orden y relaciones, no solo «diagrama de arquitectura».
2. Estructura recomendada del texto alternativo: *tipo de diagrama + dirección de lectura + elementos en orden
   + la conclusión que debe sacar el lector*. Ejemplo: «Diagrama de secuencia de arriba abajo: el cliente llama
   al gateway; el gateway valida el token con Keycloak y reenvía a reservas; reservas responde 201. Conclusión:
   el servicio nunca ve la contraseña».
3. Las **analogías visuales** (punto 4) se describen con detalle suficiente para dibujarlas; esa descripción
   sirve también como alternativa textual.
4. Mermaid: máximo unos 15 nodos por diagrama; si hay más, divide en dos. Etiquetas en texto, no solo
   flechas de colores.
5. Imágenes decorativas (separadores, fondos): `alt=""`. Íconos junto a texto: `aria-hidden="true"`.

Criterios: 1.1.1 Contenido no textual (A), 1.4.5 Imágenes de texto (AA).

### Código, terminal y salidas

- El código va siempre como **texto** en bloques con lenguaje (```java, ```bash), nunca como captura: se
  puede copiar, ampliar y leer con lector de pantalla.
- Las capturas de terminal se generan como **SVG con texto real** (`scripts/render_terminal_capture.py`) y van
  acompañadas del bloque de texto con la misma salida bajo «Output esperado».
- Los comandos de un laboratorio van **uno por línea** y numerados; nada de cadenas largas con `&&` en los
  pasos para principiantes.
- Los mensajes de error se copian literalmente; el diagnóstico se explica en texto, no con flechas sobre una
  imagen.
- Fuentes monoespaciadas que distinguen `0/O` y `1/l/I` (JetBrains Mono).

### Vídeo, animación y audio

| Regla | Criterio WCAG |
|---|---|
| Vídeos con subtítulos en español revisados a mano (no solo automáticos). | 1.2.2 Subtítulos grabados (A) |
| Si un vídeo muestra algo que no se dice (un comando en pantalla), añade audiodescripción o transcripción con esos pasos. | 1.2.3 y 1.2.5 Audiodescripción (A/AA) |
| Transcripción descargable de cada vídeo. | 1.2.3 Alternativa para medios (A) |
| Animaciones de más de 5 s con botón de pausa; nada que destelle más de 3 veces por segundo. | 2.2.2 Pausar, detener, ocultar (A) · 2.3.1 Umbral de tres destellos (A) |
| Respeta `prefers-reduced-motion`: sin la animación, el diagrama estático cuenta lo mismo. | 2.3.3 Animación por interacciones (AAA, buena práctica) |

### Web del curso (Angular)

| Regla | Criterio WCAG |
|---|---|
| Todo se usa con teclado; el foco se ve siempre y no queda tapado por cabeceras fijas. | 2.1.1 Teclado (A) · 2.4.7 Foco visible (AA) · 2.4.11 Foco no oculto (AA) |
| Zonas táctiles de al menos 24 × 24 px (botones de copiar código, casillas de progreso). | 2.5.8 Tamaño del objetivo, mínimo (AA) |
| El contenido se adapta a 320 px de ancho sin scroll horizontal, salvo bloques de código y tablas, que se desplazan dentro de su caja. | 1.4.10 Reflujo (AA) |
| El texto aguanta interlineado 1.5 y espaciado aumentado sin cortarse. | 1.4.12 Espaciado del texto (AA) |
| `lang="es"` en la página. | 3.1.1 Idioma de la página (A) |
| El botón «Copiar» anuncia «Código copiado» con `aria-live="polite"`. | 4.1.3 Mensajes de estado (AA) |
| El progreso guardado en `localStorage` también se muestra como texto («12 de 187 fichas»). | 1.3.1 |

### Laboratorios

- Cada laboratorio indica **requisitos de hardware** y una alternativa más ligera (por ejemplo, un solo broker
  en lugar de tres) para equipos con poca memoria.
- Los pasos que abren una interfaz web (Grafana, Kibana, consola de Keycloak) tienen además su equivalente por
  API o CLI (`curl`), para quien usa lector de pantalla y prefiere la terminal.
- Tiempo estimado por laboratorio y por ficha: permite planificar a quien estudia con pausas frecuentes.

## Parte 2 · Para estudiantes: adapta el curso a ti

| Si… | Prueba esto |
|---|---|
| usas lector de pantalla (NVDA, JAWS, VoiceOver, Orca) | navega por encabezados: cada ficha tiene sus 14 puntos como `####`; salta directo a «9. CÓDIGO EJECUTABLE» o «10. MINI-LABORATORIO». Lee los diagramas por su «Texto alternativo». |
| tienes baja visión | amplía al 200 % (el contenido se reorganiza); activa el modo oscuro, cuyos colores superan 9.8:1. En la terminal, sube el tamaño de fuente del emulador, no el zoom del sistema. |
| tienes daltonismo | la paleta es Okabe-Ito; además, cada estado se dice con palabras. |
| tienes dislexia | cambia la fuente a Lexend (ver [01-portada.md](01-portada.md)), lee primero el nivel 0 y la analogía y deja el nivel maestro para un segundo paso. |
| usas solo teclado | todos los laboratorios son de terminal; las interfaces web tienen alternativa por `curl`. |
| tienes TDAH o te cansas pronto | cada ficha se divide en bloques de 20–30 minutos (analogía + nivel 0 · código + laboratorio · verificación + entrevista); usa el [diario de aprendizaje](07-plantillas.md) para retomar donde lo dejaste. |
| tienes un equipo con poca memoria | usa la alternativa ligera que indica cada laboratorio (por ejemplo, un solo broker) o la nube por sesiones (ver [09-costos.md](09-costos.md)). |

## Lista de comprobación por ficha

- [ ] Encabezados `####` en orden, del 1 al 14.
- [ ] Diagrama con «Texto alternativo:» que cuenta las relaciones y la conclusión.
- [ ] Ningún significado depende solo del color.
- [ ] Código y salidas como texto, no como imagen.
- [ ] Términos nuevos definidos o enlazados al glosario.
- [ ] Enlaces con texto descriptivo.
- [ ] Laboratorio con alternativa por CLI a cualquier interfaz web.
