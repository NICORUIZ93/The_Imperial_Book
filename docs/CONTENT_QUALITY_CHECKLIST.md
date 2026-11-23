# Content Quality Checklist (obligatoria)

Esta checklist se aplica a **todos los cursos/tracks** y a **cada tema**. No marcar nada como revisado/hecho sin verificación ejecutada.

## 1) Formato tipo libro técnico (estilo "Java a fondo")

Mantener encabezado compatible: `### Tema N: ... · Nivel · min`.

Estructura por tema (orden flexible, pero con todos los elementos):
- **Apertura con problema/contexto real**: párrafo que motive el tema con un caso concreto y consecuencia de hacerlo mal.
- **Modelo mental y desarrollo conceptual en prosa**: explicar cómo funciona por dentro, no solo qué es. Definiciones claras, propósito, cuándo usar, cuándo no usar, alternativas, reglas/contrato/invariantes, trade-offs y riesgos. Cada concepto mencionado en el título/alcance debe quedar cubierto. **Las definiciones no tienen límite máximo**: deben ser tan extensas como haga falta para que el concepto quede claro; una frase escueta o circular no es suficiente. Explica mecanismo, por qué existe, qué implica y qué confusión común evita.
- **Diagrama cuando aporte**: no usar Mermaid. Usar herramientas aprobadas según `docs/VISUAL_DIAGRAM_GUIDE.md`: diagram-design (estático editorial), animdiagram/dashmotion (flujo animado con fallback estático), anatomy (anatomía de sistemas), manim_skill (algoritmo/matemática de alto valor). El visual debe explicar algo concreto; incluir breve lectura. No decorativo.
- **Contrato/API/configuración**: firmas, payloads, headers, esquemas, defaults, límites, compatibilidad o propiedades cuando aplique.
- **Ejemplo mínimo enfocado por concepto**: ejecutable, copy/paste runnable (ver sección 2). Presentar el código fuente para que el estudiante lo escriba (nombre de archivo + bloque de código), nunca con heredocs/`cat <<EOF`; separar comandos de compilación/ejecución.
- **Ejemplo realista/integrado**: caso cercano a producción que conecte varios conceptos del tema; puede apoyarse en el mínimo, pero no sustituye mínimos por concepto.
- **Recorrido del código**: explicar bloques relevantes, decisiones y trade-offs.
- **Ejecución y salida real**: comandos desde ruta clara; salida real observada cuando se ejecutó. Si no es factible ejecutar, incluir “Nota de verificación” honesta con razón concreta y setup completo, separando lo ejecutado de lo no ejecutado.
- **Errores frecuentes, edge cases y diagnóstico**: síntoma, causa probable, corrección, y cómo detectarlo (logs/métricas/tests) cuando aplique.
- **Observabilidad/seguridad/operación**: cuando el tema lo requiera (timeouts, métricas, secretos, despliegue, rollback, etc.).
- **Cierre/verificación**: checklist de comprobación y puente al siguiente tema.

Estilo:
- Prosa explicativa primero; código como soporte del razonamiento.
- Tono formal-neutro, didáctico, técnico.
- Sin andamiaje rígido de "Capa 1/Capa 2", "Caso guía" como plantilla mecánica, ni fichas/tablas como vehículo principal.
- Tablas solo como resumen compacto puntual cuando aporten valor real (p. ej. caracteres especiales, versiones). No usar tablas para definir todos los conceptos.
- No inventar APIs, salidas ni comportamientos.

## 2) Cobertura total de conceptos (crítico)

Si el título menciona varios conceptos (ej. `LAZY, EAGER y N+1`, `L1/L2/EntityGraph`, `pom.xml vs build.gradle.kts`), **cada concepto** debe tener su propio bloque explícito y debe incluir:
- Definición formal.
- Qué problema resuelve / para qué sirve.
- Contrato, reglas, defaults, trade-offs.
- Cuándo usarlo y cuándo no.
- **Ejemplo mínimo enfocado**: snippet o ejemplo corto que demuestre ese concepto (no vale un único ejemplo integrado donde el concepto solo aparece mencionado).
- Caso de uso real.
- Error común asociado (síntoma, causa, corrección).
- Verificación/evidencia (comando/salida real cuando sea ejecutable).

Además del tratamiento por concepto, el tema puede incluir un **ejemplo integrado desde cero** que combine los conceptos, con recorrido, ejecución real y verificación final.

No se permite explicar solo un concepto y mencionar los demás superficialmente. No se permite poner un solo bloque de código al final y asumir que cubre todos los conceptos del título.

## 3) Ejecutabilidad y contexto completo (crítico)

Nunca asumir proyecto existente, secuencia previa no explicada, datos, conexión, credenciales o infraestructura. **El código siempre se explica desde cero**: el estudiante debe poder crear el proyecto, archivo por archivo, sin adivinar.

Cuando aplique, incluir:
- **Prerequisitos**: runtime/SDK/JDK, versiones, herramientas, Docker, etc.
- **Bootstrap desde cero**: carpeta, comando de creación, estructura mínima.
- **Dependencias**: `pom.xml`, `build.gradle`, `package.json`, `pubspec.yaml`, Podfile, jars; versiones o nota de versión.
- **Configuración**: `application.properties/yml`, `.env`, `persistence.xml`, puertos, variables.
- **Datos/BD**: de dónde salen los datos; al menos opción local rápida (H2/SQLite/dev) y opción Docker/externa cuando sea relevante; credenciales/env; esquema/migraciones/seed.
- **Código desde cero, archivo por archivo**: indicar ruta/nombre de archivo, mostrar el código completo, y explicar qué hace cada bloque relevante justo en el punto donde aparece. No volcar código “mágico” sin recorrido.
- **Comandos**: desde qué ruta se ejecutan, en orden.
- **Salida real esperada**: y cómo interpretarla.
- **Nota de verificación**: si no se pudo ejecutar por dependencia externa, decirlo explícitamente y dar setup completo.

## 4) Calidad técnica y pedagógica

- Precisión técnica antes que analogía.
- Código idiomático y seguro; no enseñar malas prácticas sin marcarlas como “mal ejemplo”.
- Errores comunes reales, no genéricos.
- No copiar texto con copyright; reescribir con voz propia.
- Mantener consistencia con el temario/track y con el estándar del repo.

## 5) Verificación y flujo de trabajo

- No marcar hecho sin verificación ejecutada.
- Tras cambios de contenido: `python3 scripts/build_web_topic_index.py` y `./scripts/validate.sh`.
- Ejecutar compilación/ejecución de ejemplos cuando sea posible.
- No pisar trabajo concurrente; revisar `git status/diff` antes de commitear.
- Commits pequeños por módulo/lote, con mensaje claro; push tras verificar.
- No usar comandos destructivos sin confirmación explícita.

## 6) Hallazgos a erradicar (lecciones)

- Tablas usadas como sustituto de explicación.
- Temas multi-concepto que explican solo un concepto.
- Código que asume DB/proyecto/config existente.
- “Requiere X configurado” sin mostrar cómo configurarlo.
- Falta de ruta/comando/salida real.
- Dependencias externas mencionadas sin versión/instalación/comando.
- Ejemplos no ejecutables o sin contexto mínimo.
