# Guía visual y de diagramas para cursos

Esta guía define **qué herramientas usar, cuándo y con qué estándar** para explicar temas en Academia Floci. Aplica a todos los cursos/tracks. Un diagrama o animación solo se incluye si explica algo concreto; si no aporta, se elimina.

## Principios obligatorios

- **Propósito claro**: cada visual responde “¿qué debe entender el estudiante?”.
- **Cero decoración**: sin sombras, gradientes gratuitos, iconografía irrelevante, ruido visual.
- **Densidad baja**: 4-6 elementos clave; dividir si hay más carga.
- **Un acento**: resaltar solo el concepto crítico (riesgo, cambio, flujo principal, cuello de botella).
- **Etiquetas legibles**: nombres concretos, no cajas genéricas.
- **Lectura en texto**: antes o después del visual, explicar qué mirar y qué conclusión sacar.
- **Estático primero**: el contenido debe entenderse sin animación; la animación solo refuerza.
- **Accesibilidad/reduced motion**: si hay animación, respetar movimiento reducido y ofrecer estado estático equivalente/fallback.
- **No Mermaid**: no usar bloques ` ```mermaid ``` ` en contenido de cursos.

## Herramientas aprobadas

| Herramienta | Mejor para | Formato | Usar cuando | Evitar cuando |
|---|---|---|---|---|
| **diagram-design** (https://github.com/cathrynlavery/diagram-design) | Diagramas editoriales estáticos de alta calidad; HTML+SVG autocontenido | HTML+SVG | Arquitectura, comparación, timeline, trade-off, flujos complejos que necesitan claridad editorial | Un diagrama simple puede resolverse con tabla/SVG pequeño ya existente |
| **animdiagram** (https://github.com/praveenvijayan/animdiagram) | Explicadores SVG en loop: paquetes, flujos, estados, señales | SVG con CSS keyframes | Request/retry/pipeline/event flow donde el loop aclara el concepto | La animación no agrega comprensión; no hay fallback estático |
| **dashmotion** (https://github.com/csthink/dashmotion) | Diagramas técnicos animados, recorridos de request/ejecución | HTML/SVG autocontenido | Arquitectura o flujo donde el recorrido temporal es el aprendizaje | Basta un diagrama estático |
| **anatomy** (https://github.com/wheresryan22/anatomy) | Ilustraciones isométricas/anatomía de máquinas y sistemas | HTML/SVG/WebGL | Internals: JVM, DB, runtime, IO, componentes físicos/metáfora mecánica | Es caro de producir/revisar y no mejora comprensión |
| **manim_skill** (https://github.com/adithya-s-k/manim_skill) | Animaciones 3Blue1Brown para matemática/algoritmos/procesos | Video MP4 (Manim) | Algoritmos, complejidad, transformación matemática, evolución temporal de alto valor | No hay deps/pipeline o un asset ligero basta |

## Selección por tipo de concepto

- **Arquitectura/capas/dependencias**: diagram-design (estático). dashmotion solo si el recorrido es esencial.
- **Secuencia/request lifecycle/retry**: diagram-design estático o animdiagram/dashmotion si el movimiento aclara.
- **Estado/ciclo de vida**: diagram-design; animdiagram solo si transición temporal es clave.
- **Modelo de datos**: tabla o diagrama estático (diagram-design/SVG).
- **Algoritmo/estructura de datos**: trazas/tablas; animdiagram para loops simples; manim_skill para alto valor.
- **Internals/JVM/DB/IO/máquinas**: anatomy en temas ancla; diagram-design como alternativa estática.

## Regla de implementación en módulos

1. **Default estático**: diagrama estático claro (SVG/HTML asset generado con herramientas aprobadas) o tabla/estructura textual cuando sea suficiente. No Mermaid.
2. **Animación útil**: animdiagram/dashmotion cuando el movimiento explica causalidad/tiempo/recorrido; incluir fallback estático/reduced motion.
3. **High-end selectivo**: anatomy/manim_skill solo para temas ancla, con fuente reproducible, dependencia documentada y fallback estático.
4. **Todo asset externo**: ruta en repo, qué explica, herramienta usada, y cómo regenerarlo.

## Checklist de revisión visual

- [ ] Tiene pregunta/conclusión concreta.
- [ ] Tipo de visual coincide con el concepto.
- [ ] Se entiende en estático.
- [ ] Tiene lectura breve en prosa.
- [ ] No duplica texto; lo complementa.
- [ ] No introduce claims no verificados.
- [ ] Si es animado, respeta reduced motion y tiene fallback.
- [ ] No usa Mermaid.
