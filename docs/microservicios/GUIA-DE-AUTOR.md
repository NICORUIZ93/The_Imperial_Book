# Guía de autor · Microservicios de Cero a Maestro (specs/018)

Lee primero el prompt del dueño ([../temarios/PROMPT-MICROSERVICIOS-CERO-A-MAESTRO.md](../temarios/PROMPT-MICROSERVICIOS-CERO-A-MAESTRO.md)):
manda sobre esta guía. Esta guía solo fija cómo se aplica en el repositorio.

## Dónde va cada cosa

| Qué | Dónde |
|---|---|
| Lección del módulo | `web/public/content/microservices/modulo-N.md` (N según `docs/temarios/microservicios-inventario.json`) |
| Metadata del módulo para el track | `docs/microservicios/track/modulo-N.json` (campos en `scripts/build_microservices_track.py`) |
| Laboratorio del módulo | `examples/microservicios/modulo-N/` con `README.md`, `verificar.sh` y, si usa infraestructura, `docker-compose.yml` |
| Versiones | `docs/microservicios/08-herramientas-y-versiones.md` (la estable más reciente, verificada) |
| Lo que no se pudo ejecutar aquí | `verificacion/microservicios/pendiente.md` (una línea por bloque, con archivo:línea) |

## Forma de la lección

```markdown
# Módulo 14 · APIs REST con Express y NestJS

Duración, dificultad, dependencias y fase (párrafo corto), y el mapa visual del módulo (Mermaid con texto alternativo).

### Express: routing, middleware, error handling

#### 1. UBICACIÓN
#### 2. PRERREQUISITOS
#### 3. OBJETIVO DE APRENDIZAJE
#### 4. ANALOGÍA VISUAL
#### 5. DIAGRAMA TÉCNICO
#### 6. EXPLICACIÓN NIVEL 0
#### 7. EXPLICACIÓN INTERMEDIA
#### 8. EXPLICACIÓN MAESTRA
#### 9. CÓDIGO EJECUTABLE
#### 10. MINI-LABORATORIO
#### 11. VERIFICACIÓN
#### 12. ERROR COMÚN
#### 13. PREGUNTA DE ENTREVISTA
#### 14. ANTI-PATRÓN RELACIONADO
```

- El título `### …` contiene el texto exacto del tema del inventario.
- **4. Analogía visual:** describe la imagen del mundo real lo bastante bien para dibujarla; va antes que cualquier código.
- **5. Diagrama técnico:** bloque ```mermaid + una línea «**Texto alternativo:** …».
- **6–8:** nivel 0 para quien nunca programó; intermedio con la mecánica; maestro con trade-offs, al menos 2
  alternativas y cuándo NO usarlo. Nunca remitas a la documentación como única explicación.
- **9. Código ejecutable:** completo y autónomo (imports, `build.gradle.kts` —Gradle con Kotlin DSL, wrapper y catálogo de versiones; Maven solo como nota de
  equivalencia— o `package.json` mínimos, configuración),
  comentado, con las versiones exactas. Debe correr tal cual; pega la salida real.
- **10. Mini-laboratorio:** pasos numerados con comandos exactos, «**Output esperado:**» con el texto real y la
  captura descrita. Si usa Kafka, Redis, PostgreSQL u otra infraestructura, arranca con Docker Compose del
  laboratorio del módulo.
- **11. Verificación:** un test que el estudiante ejecuta (JUnit, Jest/Vitest, `node --test`, curl con
  aserción…) y la pregunta de comprobación.
- **12. Error común:** síntoma, cómo se ve (mensaje real), diagnóstico y arreglo.
- **13. Pregunta de entrevista:** con «**Respuesta modelo:**».
- **14. Anti-patrón:** qué evitar y cómo se ve en código o en un diagrama.
- **Seguridad (Módulos 9, 20 y 27):** cada ficha trae «**Antes (vulnerable)**» y «**Después (seguro)**» con código de ambos.
- **Resiliencia (Módulos 8 y 19):** cada ficha trae «**Simulación del fallo**» con el script (Toxiproxy u otro) y el comportamiento observado.
- Al menos 3 ejercicios de todo el curso tienen la marca «**Respuesta correcta: no usar microservicios**»
  (Módulos 5, 30 y 31 llevan uno cada uno).
- Español neutro con tuteo, tono cercano, sin condescendencia. Fase 1 usa Spring Boot y Fase 2 Node.js:
  por separado, cada fase completa por sí misma.

## Exactitud

Nada se escribe sin ejecutarlo o comprobarlo en la fuente oficial (con URL). En este entorno hay Java 21
(`apt-get install openjdk-25-jdk` o la versión más reciente disponible), Node, Python, PostgreSQL local y un
daemon Docker sin acceso a registros (`dockerd > /tmp/dockerd.log 2>&1 &`, imagen local `ubuntu:24.04`);
Maven Central está bloqueado. Lo que no puedas ejecutar aquí queda completo y anotado en
`verificacion/microservicios/pendiente.md` para verificarlo en el Mac del dueño. No inventes salidas.

## Al terminar

```bash
python3 scripts/build_microservices_track.py
python3 scripts/build_web_topic_index.py && python3 scripts/build_curriculum_catalog.py
python3 scripts/validate_fichas.py --resumen     # tus módulos deben salir con ✔
find examples/microservicios -name pom.xml -exec python3 -c "import xml.dom.minidom,sys;xml.dom.minidom.parse(sys.argv[1])" {} \;   # Maven rechaza «--» dentro de comentarios XML
./scripts/validate.sh && (cd web && npm test -- --watch=false)
```

No hagas commit.
