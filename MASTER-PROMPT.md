# MASTER PROMPT — THE IMPERIAL BOOK · RECONSTRUCCIÓN COMPLETA

> **Nota de versión vigente (2026-11-02).** Este prompt se escribió fijando "Java 21 LTS /
> Spring Boot 3.4.1". El repositorio ya está adelantado al estado **más actual del mercado**,
> que es el estándar vigente y **prevalece** sobre las versiones citadas en el cuerpo del prompt:
>
> - **Java: JDK 27** (release más reciente, 2026-09-15; Temurin 27.0.1). La LTS vigente es Java 25.
> - **Spring Boot: 4.1** (4.1.1) sobre Spring Framework 7.
> - Node, Angular, Flutter, etc.: usar la versión estable más reciente documentada en
>   `docs/official-sources.json`.
>
> Donde el currículo de abajo diga "Java 21 LTS, Spring Boot 3.4.1", léase "JDK 27, Spring Boot 4.1".
> Las demás pautas (7 pasos, preservación, nombres, niveles, proyectos, validación) se aplican tal cual.
> Decisiones posteriores amplían el alcance. Prioridad vigente: **Java → Spring Boot →
> Microservicios → Docker/Kubernetes → Flutter**. También quedan aprobados como cursos separados
> Build (Maven/Gradle) y JDBC/Bases de datos.

> **Versión 2 (2026-11-18, specs/003).** Cifras vigentes: **16 rutas · 291 módulos · 1326 temas**
> (fuente: `web/public/content/topic-index.json`). Novedades: trabajo guiado por especificación (SDD),
> explicación fácil para principiantes, ayudas visuales, capturas reales y ayudas de código
> obligatorias (specs/002), mapa de cobertura **de cero a master** por ruta y procedimiento para
> convertir capturas de pantalla en temas validados.

Un solo archivo. Todas las reglas. Todos los cursos. Todos los temas.

Uso: este documento es el prompt que un agente (Manus, Claude Code, Cursor, Kiro) ejecuta para
reescribir la academia completa de cero a experto, sin perder ningún tema.

---

## PARTE 0 · CÓMO TRABAJAR: ESPECIFICACIÓN PRIMERO (SDD)

Ningún agente escribe ni corrige contenido sin una especificación. Orden obligatorio de cada lote:

1. Lee `specs/README.md`, `specs/004-programa-cursos-de-cero-a-master.md` y la spec de la ruta en
   `specs/tracks/<ruta>.md` (criterios T1–T7 y temas reales pendientes). Si un criterio ya está `hecho`, no lo repitas.
2. Abre o amplía una spec `specs/NNN-<lote>.md` con criterios numerados y su `Verificación:` ejecutable
   (qué temas se crean o reescriben, en qué ruta y módulo, y con qué evidencia).
3. Implementa solo contra los criterios `pendiente` de esa spec.
4. Ejecuta `./scripts/validate.sh` y `python3 scripts/validate_specs.py --run`.
5. Si la revisión descubre un caso nuevo, primero agrégalo a la spec y después cambia el contenido.

Entradas de cada lote: la medición `docs/zero-to-master.md`, el inventario `docs/temario-maestro-unificado.json`
y las capturas registradas en `docs/capture-intake.json`.

---

## PARTE 1 · METODOLOGÍA EDITORIAL

### 1.1 Las 12 pautas innegociables

**PAUTA 1 — Nombres de temas.** Fórmula: `[Verbo en infinitivo] + [objeto concreto] + (opcional: [resultado observable])`.
- ✅ "Implementar autenticación JWT con refresh tokens"
- ✅ "Diagnosticar N+1 en Hibernate con EntityGraph"
- ❌ "JPA, Hibernate y FetchType.LAZY vs EAGER" (no es acción)
- ❌ "Java del día a día" (vago) · ❌ "Proyecto integrador" (¿qué se construye?)

**PAUTA 2 — Tamaño.** 20-45 min por tema (80% de los temas). <20 min solo prerrequisitos triviales. >45 min prohibido: dividir en 2 temas.

**PAUTA 3 — Estructura de 7 pasos obligatoria.**
| Paso | Contenido mínimo | Extensión |
|---|---|---|
| 1 · Objetivo y preparación | Qué podrás hacer + prerrequisito exacto (M<N> T<M>) | 30-60 palabras |
| 2 · Contexto y caso real | Situación concreta de industria (escenario, costo de no saberlo) | 80-150 palabras |
| 3 · Teoría, modelo mental y analogía | Explicación fácil (PAUTA 13) + 3-5 conceptos en negrita + 1 analogía + 1 ayuda visual (PAUTA 14) | 150-400 palabras |
| 4 · Demostración guiada desde cero | Código completo con ayuda de código (PAUTA 16) + comando + captura real (PAUTA 15) + salida esperada + fallo deliberado con diagnóstico | 100-300 palabras + código |
| 5 · Práctica guiada | 3-5 ejercicios numerados con pistas | 100-200 palabras |
| 6 · Práctica independiente | 1 reto sin pistas, resoluble con lo del tema | 50-100 palabras |
| 7 · Cierre | Checklist 4-6 ítems verificables + prerrequisito del siguiente | 50-80 palabras |

**PAUTA 4 — Orden dentro de un módulo.** Por dependencia técnica real, no por orden histórico.

**PAUTA 5 — Orden dentro de un track.** 4 niveles: N1 Básico (0-20 min, 3-5 módulos), N2 Intermedio (20-45, 4-6), N3 Avanzado (45-90, 4-6), N4 Experto (90+, 2-4), Capstone al final. Máximo 30% en N1, mínimo 1 tema en N4.

**PAUTA 6 — Prerrequisitos.** Formato: `**Prerrequisito:** M<N> T<M> (<tema específico>)`. Nunca "Módulo 0" a secas.

**Regla de nombres comprensibles.** `M<N> T<M>` es únicamente una referencia interna secundaria.
La interfaz y la prosa deben mostrar primero el nombre real del módulo y del tema: por ejemplo,
`tema «Propagar un deadline absoluto entre servicios HTTP» del módulo «Antes de distribuir:
proceso, red y falacias» (referencia interna M0 T3)`. Nunca obligues al estudiante a recordar qué
significa un código para saber de dónde viene o qué debe estudiar después.

**PAUTA 7 — Ejemplos de código.** Completo (sin `// ...`), ejecutable con versión fijada (**JDK 27, Spring Boot 4.1**), con salida esperada exacta, comentado por bloques, con fallo deliberado específico.

**PAUTA 8 — Fallos deliberados.** `**Fallo deliberado:** [acción] → **Error esperado:** [mensaje exacto] → **Diagnóstico:** [por qué + qué enseña]`.

**PAUTA 9 — Ejercicios de práctica guiada.** 5 tipos con dificultad creciente: Reproducción, Variación, Diagnóstico, Integración, Diseño.

**PAUTA 10 — Proyectos de cierre de módulo.** Cada módulo termina con 1 proyecto de 2-4h que integre el 80% de sus temas, con requisitos verificables y rúbrica 100 pts.

**PAUTA 11 — Checklists de cierre.** Paso 7 con 4-6 ítems verificables. "Si fallas 2+ → vuelve a Practica." + prerrequisito del siguiente.

**PAUTA 12 — Anti-patrones prohibidos.** Tema cajón de sastre → separar por verbo. Módulo de 2 temas → expandir. "Proyecto integrador" genérico → proyecto concreto con rúbrica. Código sin ubicación → "Crea src/.../Clase.java". Sin salida esperada → "curl → 200 OK con {...}". Sin versión → fijar JDK 27 / Spring Boot 4.1.

**PAUTA 13 — Explicación fácil.** Escribe para alguien que nunca vio el tema:
- una idea por oración y oraciones de máximo 25 palabras; voz activa y segunda persona («creas», «ejecutas»);
- define cada término nuevo la primera vez que aparece, sin usar otro término todavía no enseñado;
- empieza por el **para qué** y un ejemplo cotidiano antes del mecanismo; después el detalle técnico;
- una analogía que se rompe donde el concepto real es distinto, y di dónde se rompe;
- «Explícalo con tus palabras»: termina la teoría con una pregunta que la persona pueda responder en una frase;
- prohibido: «simplemente», «obviamente», «es fácil», párrafos de más de 5 líneas y listas sin explicación.

**PAUTA 14 — Ayudas visuales.** Cada tema tiene al menos un diagrama Mermaid o figura que muestre el
modelo mental (flujo, arquitectura, estados, datos o tiempo), con título, lectura paso a paso y texto
alternativo. Para conceptos con pasos o estados, prefiere secuencias o máquinas de estado a cajas sueltas.
Una ilustración decorativa no cuenta.

**PAUTA 15 — Capturas reales.** Cada demostración ejecutable lleva una captura generada al ejecutarla:
terminal con `scripts/render_terminal_capture.py`, interfaz con Playwright. La captura va en
`web/public/content/figures/<ruta>/`, se enlaza como `![texto alternativo](content/figures/<ruta>/<archivo>)`
y siempre se acompaña del **Resultado esperado** escrito. Nunca se dibuja ni se edita una salida a mano.
Si el entorno no puede ejecutar la demo, la captura queda `pendiente` con motivo en `specs/visual-aids-scope.json`.

**PAUTA 16 — Ayudas de código.** Antes de cada bloque, el nombre exacto del archivo (por ejemplo: Archivo `src/main/java/App.java`:).
Dentro, comentarios solo en las líneas que no se explican solas. Después, **Explicación por bloques** o
**línea por línea**. Ejemplos mínimos primero y completos donde se piden ejecutar; nunca `// ...`.
Señala con un comentario la línea que provoca el fallo deliberado y la que lo corrige.

**PAUTA 17 — De cero a master.** Cada ruta cubre los cuatro niveles (Fundamentos → Aplicación →
Integración → Experto) y cierra con un módulo **Master** que reúne los temas avanzados que una persona
profesional usa en producción. Para declarar la ruta completa:
- contrasta su temario con al menos dos referencias: la ruta oficial o certificación del proveedor
  (`docs/official-sources.json`), una ruta profesional reconocida y el inventario de libros y cursos del
  temario maestro; todo tema importante que falte entra como candidato con decisión registrada;
- ningún nivel queda vacío en `docs/zero-to-master.md` y cada tema avanzado tiene sus prerrequisitos enseñados antes;
- el módulo Master tiene sus temas pedidos en `docs/requested-master-topics.json` y visibles en el contenido.

### 1.2 Regla de preservación
Ningún tema se elimina. Al fusionar módulos, los temas se mueven al destino. Verificación por track: N original → M final, **M ≥ N**. Si M < N: fallar.

### 1.3 Formato de capstone
Cada track termina con capstone de 6 fases que integre el 80% de los temas, con rúbrica 100 pts
(20 requisito más difícil + 20 segundo + 15 testing + 15 observabilidad + 10 documentación +
10 ADR/C4 + 10 CI en verde).

---

## PARTE 2 · CURRÍCULO COMPLETO — 16 RUTAS PUBLICADAS + CURSOS APROBADOS

El currículo incluye los 14 tracks originales (Fundamentos, JavaScript, Java, Node, Angular,
React, Spring Boot, Cloud, DevOps, KMP, Android, iOS, Flutter y RutaFlow), Microservicios como
track separado y Control 1 (sistemas de control, universidad). Docker/Kubernetes, Build y JDBC/Bases de datos se publicarán módulo a módulo con
la misma puerta. El objetivo de ~1800 temas se recalcula conservando los originales. Recordatorio de
versiones: donde diga "Java 21 / Spring Boot 3.4.1", aplicar **JDK 27 / Spring Boot 4.1**.

Prioridad vigente: **Java → Spring Boot → Microservicios → Docker/Kubernetes → Flutter**, luego
Build, JDBC y el resto.

El detalle por track (niveles, duraciones, prerrequisitos y lista de temas) se mantiene en el
temario de referencia y en los planes por curso:
- `docs/TEMARIO-REFERENCIA-SPRING-PROFESIONAL.md` (Spring/Spring Boot, baseline profesional)
- `docs/MATRIZ-CURRICULAR.md`, `docs/INVENTARIO-CURSOS-TEMAS-SUBTEMAS.md`
- `docs/PLAN-CURSO-*.md` (cursos separados: Microservicios, Docker/Kubernetes, Maven/Gradle, JDBC)

---

## PARTE 3 · INSTRUCCIONES DE EJECUCIÓN

### 3.1 Expandir cada tema al formato de 7 pasos
Para cada tema: encabezado `### Tema N: [Título infinitivo] · [Nivel] · [Duración]`, prerrequisito
exacto, "Al terminar podrás", y los 7 pasos (Objetivo/Contexto/Teoría+analogía+diagrama/Demo con
código+salida+fallo/Práctica guiada 5 ejercicios/Práctica independiente/Cierre con checklist).
Además, por la puerta de calidad de `AGENTS.md`: **Mapa de subtemas críticos** con explicación
individual por fila, y evidencia ejecutada en la versión fijada (JDK 27 / Spring Boot 4.1).

### 3.1.1 Convertir capturas de pantalla en temas

Cuando la persona guarde capturas (publicaciones, anuncios de cursos, rutas de aprendizaje):

1. Lee cada imagen completa y transcribe solo los temas técnicos; anota lo que la imagen no dice
   (por ejemplo, un paso que falta en la numeración) en lugar de inventarlo.
2. Para cada tema busca su ubicación en `web/public/content/topic-index.json` y decide:
   `cubierto` (ya existe), `agregado` (se crea en este lote con el estándar de specs/002),
   `candidato` (hueco real o temario no verificable) o `fuera-de-alcance` (no técnico).
3. Registra la captura y cada decisión en `docs/capture-intake.json`; los cursos o rutas validados van a
   `docs/course-curriculum-inventory.json` y se regenera el temario con `build_unified_curriculum.py`.
4. Verifica con `python3 scripts/validate_capture_intake.py`. Un anuncio sin temario público nunca se
   convierte en temas inventados: queda como candidato con motivo.

### 3.2 Orden de ejecución por track
Prioridad del dueño: Java → Spring Boot → Microservicios → Docker/Kubernetes → Flutter → Build →
JDBC → (Fundamentos, JavaScript, Node, Angular, React, Cloud, DevOps, KMP, Android, iOS, RutaFlow).
Para cada track: inventario N → reordenar por
dependencia → expandir cada tema (§3.1) → proyecto por módulo → capstone → verificar M ≥ N →
regenerar reportes → `validate.sh` en verde.

### 3.3 Puerta estricta antes de publicar un tema

Un tema no entra al índice web si incumple: explicación fácil (PAUTA 13); ayuda visual (PAUTA 14);
captura real o captura `pendiente` con motivo (PAUTA 15); ayuda de código (PAUTA 16); registro en
`specs/visual-aids-scope.json`; título con verbo; duración de 20–45 minutos;
prerrequisito exacto; siete pasos completos; mapa exhaustivo de subtemas críticos; código completo
con archivo, versión, comando, salida y fallo/error/diagnóstico exactos; cinco prácticas guiadas;
reto independiente; checklist de 4–6 ítems; y proyecto de módulo con rúbrica antes de cerrar el
módulo. Los detectores automáticos pueden rechazar o priorizar, pero no aprobar profundidad humana.

---

## PARTE 4 · VALIDACIÓN Y ENTREGABLES

### 4.1 Criterios por track
Todos los temas con 7 pasos; 0 "Paso 1" vacíos; prerrequisito explícito M<N> T<M>; fallo
deliberado + diagnóstico; checklist 4-6 ítems; máximo 30% en N1; mínimo 1 en N4; proyecto por
módulo con rúbrica; capstone del track; preservación M ≥ N.

### 4.2 Criterios globales
16 rutas publicadas actualmente, más cursos separados aprobados; `./scripts/validate.sh` verde;
`python3 scripts/validate_specs.py --run` verde; `docs/zero-to-master.md` sin niveles vacíos en las
rutas del lote;
`python3 scripts/validate_learning_priorities.py` verde;
README con cifras reales; 0 temas perdidos; capstones por track (menos Fundamentos y RutaFlow).

### 4.3 Regla de verificación y honestidad (AGENTS.md)
Mantener separados: revisión estructural, ejecución de ejemplos, pruebas de navegador y revisión
pedagógica humana. Reportar cobertura y pendientes sin presentar la detección de marcadores como
formación completa. Todo tema nuevo entra con revisión humana de profundidad registrada en
`docs/subtopic-depth-reviewed.json`; la deuda pendiente nunca aumenta (trinquete).

---

Fin del MASTER-PROMPT v2. Guía única para reescribir The Imperial Book de cero a master, con
explicaciones fáciles, práctica real, ayudas visuales, capturas reales y ayudas de código, con las
versiones más actuales del mercado y sin perder ningún tema.
