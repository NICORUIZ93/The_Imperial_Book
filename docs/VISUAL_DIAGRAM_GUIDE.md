# Guía visual y de diagramas para cursos

Esta guía define **qué herramientas usar, cuándo y con qué estándar** para explicar temas en Academia Floci. Aplica a todos los cursos/tracks. Un diagrama o animación solo se incluye si explica algo concreto; si no aporta, se elimina.

## Principios obligatorios (todos los formatos)

- **Propósito claro**: cada visual responde “¿qué debe entender el estudiante?”.
- **Cero decoración**: sin sombras, gradientes gratuitos, iconografía irrelevante o “Mermaid slop”.
- **Densidad baja**: preferir 4-6 elementos clave; dividir si hay más carga.
- **Un acento**: resaltar solo el concepto crítico (riesgo, cambio, flujo principal, cuello de botella).
- **Etiquetas legibles**: nombres concretos, no cajas genéricas como “Service A”.
- **Lectura en texto**: antes o después del visual, explicar qué mirar y qué conclusión sacar.
- **Estático primero**: el contenido debe entenderse sin animación; la animación solo refuerza.
- **Accesibilidad/reduced motion**: si hay animación, respetar movimiento reducido y ofrecer estado estático equivalente.

## Herramientas y cuándo usarlas

| Herramienta | Mejor para | Formato | Usar en cursos cuando | Evitar cuando |
|---|---|---|---|---|
| **Mermaid embebido** | Diagramas rápidos en Markdown: flujo, secuencia, estado, ER, arquitectura simple | ```mermaid``` en `.md` | El concepto cabe en diagrama estático y debe vivir dentro del módulo | El diagrama es complejo, requiere branding fino o animación narrativa |
| **diagram-design** (https://github.com/cathrynlavery/diagram-design) | Diagramas editoriales estáticos de alta calidad; 52 tipos; HTML+SVG autocontenido | HTML+SVG | Necesitas diagrama publicable/preciso (arquitectura, comparación, timeline, trade-off) | Basta Mermaid simple; o no hay capacidad de revisar/guardar el asset |
| **animdiagram** (https://github.com/praveenvijayan/animdiagram) | Explicadores SVG en loop: paquetes, flujos, estados, señales | SVG con CSS keyframes | Quieres mostrar movimiento repetible (request, retry, pipeline, event flow) en asset ligero | La animación no agrega comprensión; plataforma no soporta SVG animado |
| **dashmotion** (https://github.com/csthink/dashmotion) | Diagramas técnicos animados desde texto/Mermaid; flujos y arquitectura con request journeys | HTML/SVG autocontenido | Necesitas mostrar recorrido de ejecución/request en arquitectura o flujo | El mismo punto se entiende con Mermaid estático |
| **anatomy** (https://github.com/wheresryan22/anatomy) | Ilustraciones isométricas de máquinas/sistemas, SVG/WebGL/3D | HTML/SVG/WebGL | Concepto se beneficia de “anatomía” física/metáfora mecánica (CPU, runtime, IO, DB internals) | Es caro de producir/revisar y no mejora la comprensión |
| **manim_skill** (https://github.com/adithya-s-k/manim_skill) | Animaciones tipo 3Blue1Brown para matemáticas/algoritmos/procesos | Video (MP4) via Manim | Explicar algoritmo, complejidad, transformación matemática o proceso con evolución temporal | El tema no necesita video; faltan deps (ffmpeg/LaTeX) o no hay pipeline de assets |

## Selección por tipo de concepto

- **Arquitectura/capas/dependencias**: Mermaid `flowchart`/`graph`; subir a diagram-design si es clave o complejo.
- **Secuencia/request lifecycle/retry**: Mermaid `sequenceDiagram`; animdiagram/dashmotion si el movimiento aclara el recorrido.
- **Estado/ciclo de vida**: Mermaid `stateDiagram-v2`; animdiagram solo si la transición temporal es el aprendizaje.
- **Modelo de datos**: Mermaid `erDiagram` o tabla; estático.
- **Algoritmo/estructura de datos**: Mermaid simple + trazas; manim_skill para videos de alto valor; animdiagram para loops simples.
- **Internals/JVM/DB/IO/máquinas**: Mermaid para mapa mental; anatomy solo en temas ancla donde la metáfora física aporte.

## Regla de implementación en módulos

1. **Default**: Mermaid embebido en el `.md`, con texto explicativo alrededor.
2. **Upgrade estático**: diagram-design cuando Mermaid no alcanza claridad/calidad editorial.
3. **Upgrade animado**: animdiagram/dashmotion cuando el movimiento explica causalidad/tiempo/recorrido.
4. **High-end**: anatomy/manim_skill solo para temas seleccionados de alto impacto, con fuente/script reproducible y fallback estático.
5. **Todo asset externo** debe quedar referenciado en el módulo (ruta, qué explica, cómo regenerarlo si aplica).

## Checklist de revisión visual

- [ ] El visual tiene una pregunta/conclusión concreta.
- [ ] El tipo de diagrama coincide con el concepto.
- [ ] Se entiende en blanco y negro/estático.
- [ ] Tiene leyenda/lectura breve en prosa.
- [ ] No duplica texto; lo complementa.
- [ ] No introduce claims no verificados.
- [ ] Si es animado, no parpadea agresivo y respeta reduced motion.
