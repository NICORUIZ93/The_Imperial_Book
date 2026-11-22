# Content Quality Checklist (obligatoria)

Esta checklist se aplica a **todos los cursos/tracks** y a **cada tema**. No marcar nada como revisado/hecho sin verificación ejecutada.

## 1) Formato tipo libro técnico (estilo "Java a fondo")

Mantener encabezado compatible: `### Tema N: ... · Nivel · min`.

Estructura por tema (orden flexible, pero con todos los elementos):
- **Apertura con problema/contexto real**: párrafo que motive el tema con un caso concreto.
- **Desarrollo conceptual en prosa**: explicar conceptos en texto corrido, con definiciones claras, propósito, cuándo usar, cuándo no usar, reglas/contrato/invariantes y riesgos. Cada concepto mencionado en el título/alcance debe quedar cubierto.
- **Ejemplo desde cero**: prerrequisitos, dependencias/versiones, bootstrap/carpeta cuando aplique, código completo.
- **Recorrido del código**: explicar líneas o bloques relevantes y su intención.
- **Ejecución y salida real**: comandos desde ruta clara; salida real observada cuando se ejecutó. Si no es factible ejecutar, incluir “Nota de verificación” honesta con razón concreta y setup completo.
- **Errores frecuentes y diagnóstico**: síntoma, causa probable y corrección, en prosa o lista breve.
- **Cierre/verificación**: comprobación observable del comportamiento.

Estilo:
- Prosa explicativa primero; código como soporte del razonamiento.
- Tono formal-neutro, didáctico, técnico.
- Sin andamiaje rígido de "Capa 1/Capa 2", "Caso guía" como plantilla mecánica, ni fichas/tablas como vehículo principal.
- Tablas solo como resumen compacto puntual cuando aporten valor real (p. ej. caracteres especiales, versiones). No usar tablas para definir todos los conceptos.
- No inventar APIs, salidas ni comportamientos.

## 2) Cobertura total de conceptos (crítico)

Si el título menciona varios conceptos (ej. `LAZY, EAGER y N+1`, `L1/L2/EntityGraph`, `pom.xml vs build.gradle.kts`), **cada concepto** debe incluir, en prosa o de forma explícita:
- Definición formal.
- Qué problema resuelve / para qué sirve.
- Contrato, reglas, defaults, trade-offs.
- Cuándo usarlo y cuándo no.
- Ejemplo mínimo o demo.
- Caso de uso real.
- Error común asociado.
- Verificación/evidencia.

No se permite explicar solo un concepto y mencionar los demás superficialmente.

## 3) Ejecutabilidad y contexto completo (crítico)

Nunca asumir proyecto existente, secuencia previa no explicada, datos, conexión, credenciales o infraestructura.

Cuando aplique, incluir:
- **Prerequisitos**: runtime/SDK/JDK, versiones, herramientas, Docker, etc.
- **Bootstrap desde cero**: carpeta, comando de creación, estructura mínima.
- **Dependencias**: `pom.xml`, `build.gradle`, `package.json`, `pubspec.yaml`, Podfile, jars; versiones o nota de versión.
- **Configuración**: `application.properties/yml`, `.env`, `persistence.xml`, puertos, variables.
- **Datos/BD**: de dónde salen los datos; al menos opción local rápida (H2/SQLite/dev) y opción Docker/externa cuando sea relevante; credenciales/env; esquema/migraciones/seed.
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
