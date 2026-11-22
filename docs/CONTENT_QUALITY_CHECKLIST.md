# Content Quality Checklist (obligatoria)

Esta checklist se aplica a **todos los cursos/tracks** y a **cada tema**. No marcar nada como revisado/hecho sin verificación ejecutada.

## 1) Formato D+formal (por tema)

Mantener encabezado compatible: `### Tema N: ... · Nivel · min`.

Secciones requeridas:
- **Caso guía / Para qué sirve / Contexto**: problema real, por qué importa.
- **Fundamento técnico y modelo mental**:
  - **Definición formal**: todos los términos/conceptos del tema.
  - **Contrato / invariantes / reglas**: precondiciones, postcondiciones, defaults, límites, seguridad, edge cases.
  - **Modelo mental**: analogía precisa, sin sacrificar corrección.
- **Implementación desde cero**: código completo, ejecutable/verificable.
- **Desglose del código**: qué hace cada parte importante.
- **Ejecución y salida real**: comando exacto, ruta, salida esperada/observada.
- **Errores comunes y cómo resolverlos**: tabla síntoma/causa/solución.
- **Verificación rápida**: prueba mínima que confirma el comportamiento.

## 2) Cobertura total de conceptos (crítico)

Si el título menciona varios conceptos (ej. `LAZY, EAGER y N+1`, `L1/L2/EntityGraph`, `pom.xml vs build.gradle.kts`), **cada concepto** debe incluir:
- Definición formal.
- Qué problema resuelve / para qué sirve.
- Contrato, reglas, defaults, trade-offs.
- Cuándo usarlo y cuándo no.
- Ejemplo mínimo o demo.
- Caso de uso real.
- Error común asociado.
- Verificación/evidencia.

Agregar **tabla comparativa** cuando ayude: concepto | cuándo usar | cuándo evitar | riesgo | alternativa.

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

- Temas multi-concepto que explican solo uno (ej. LAZY/EAGER/N+1).
- Código que asume DB/proyecto/config existente.
- “Requiere X configurado” sin mostrar cómo configurarlo.
- Falta de ruta/comando/salida real.
- Dependencias externas mencionadas sin versión/instalación/comando.
- Ejemplos no ejecutables o sin contexto mínimo.
