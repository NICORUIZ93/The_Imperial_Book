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

Un solo archivo. Todas las reglas. Todos los cursos. Todos los temas.

Uso: este documento es el prompt que un agente (Manus, Claude Code, Cursor, Kiro) ejecuta para
reescribir la academia completa de cero a experto, sin perder ningún tema.

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
| 3 · Teoría, modelo mental y analogía | 3-5 conceptos en negrita + 1 analogía + 1 diagrama | 150-400 palabras |
| 4 · Demostración guiada desde cero | Código completo + comando + salida esperada + fallo deliberado con diagnóstico | 100-300 palabras + código |
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

### 1.2 Regla de preservación
Ningún tema se elimina. Al fusionar módulos, los temas se mueven al destino. Verificación por track: N original → M final, **M ≥ N**. Si M < N: fallar.

### 1.3 Formato de capstone
Cada track termina con capstone de 6 fases que integre el 80% de los temas, con rúbrica 100 pts
(20 requisito más difícil + 20 segundo + 15 testing + 15 observabilidad + 10 documentación +
10 ADR/C4 + 10 CI en verde).

---

## PARTE 2 · CURRÍCULO COMPLETO — 15 TRACKS PUBLICADOS + CURSOS APROBADOS

El currículo incluye los 14 tracks originales (Fundamentos, JavaScript, Java, Node, Angular,
React, Spring Boot, Cloud, DevOps, KMP, Android, iOS, Flutter y RutaFlow) más Microservicios como
track separado. Docker/Kubernetes, Build y JDBC/Bases de datos se publicarán módulo a módulo con
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

### 3.2 Orden de ejecución por track
Prioridad del dueño: Java → Spring Boot → Microservicios → Docker/Kubernetes → Flutter → Build →
JDBC → (Fundamentos, JavaScript, Node, Angular, React, Cloud, DevOps, KMP, Android, iOS, RutaFlow).
Para cada track: inventario N → reordenar por
dependencia → expandir cada tema (§3.1) → proyecto por módulo → capstone → verificar M ≥ N →
regenerar reportes → `validate.sh` en verde.

### 3.3 Puerta estricta antes de publicar un tema

Un tema no entra al índice web si incumple: título con verbo; duración de 20–45 minutos;
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
15 tracks publicados actualmente, más cursos separados aprobados; `./scripts/validate.sh` verde;
`python3 scripts/validate_learning_priorities.py` verde;
README con cifras reales; 0 temas perdidos; capstones por track (menos Fundamentos y RutaFlow).

### 4.3 Regla de verificación y honestidad (AGENTS.md)
Mantener separados: revisión estructural, ejecución de ejemplos, pruebas de navegador y revisión
pedagógica humana. Reportar cobertura y pendientes sin presentar la detección de marcadores como
formación completa. Todo tema nuevo entra con revisión humana de profundidad registrada en
`docs/subtopic-depth-reviewed.json`; la deuda pendiente nunca aumenta (trinquete).

---

Fin del MASTER-PROMPT. Guía única para reescribir The Imperial Book de cero a experto con las
versiones más actuales del mercado y sin perder ningún tema.
