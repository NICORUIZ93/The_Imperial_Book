# Temario propuesto · IA aplicada al desarrollo

**Estado:** propuesta para aprobación del dueño. No hay lecciones escritas.
**Fecha de revisión de fuentes:** 2026-11-18.
**Identificador de ruta previsto:** `ai-dev`.

## 1. Público y prerrequisitos

Este curso es para desarrolladores backend que necesitan dos cosas:
- **Construir** funciones con modelos de lenguaje dentro de un producto: llamadas a la API, salida estructurada,
  herramientas, RAG, MCP y agentes, con pruebas y seguridad.
- **Trabajar** con agentes de código en su propio repositorio sin perder control de calidad.

El curso es independiente del proveedor. Los ejemplos usan Spring AI para poder cambiar de proveedor. El primer
contacto con cada API es una llamada HTTP directa, para ver el protocolo sin abstracciones.

| Prerrequisito | Módulos | Para qué |
|---|---|---|
| Java | M0–M5 y M9 (pruebas) | Cliente HTTP, concurrencia y pruebas |
| Spring Boot | M0–M6 | La API de RutaFlow que se amplía |
| Docker | M7 (Compose) | PostgreSQL con pgvector y modelos locales |
| Fundamentos | M6 (seguridad y privacidad) y M7 T6–T7 (desarrollo guiado por especificación con agentes; evaluar una skill) | M7 de este curso parte de ahí |

## 2. Resultado final medible

1. Un asistente de operaciones de RutaFlow dentro de la API Spring Boot. Responde con citas sobre el manual de
   operación (RAG con pgvector) y consulta envíos con herramientas tipadas. Antes de toda acción con efectos pide
   confirmación humana.
2. Un servidor MCP de RutaFlow (especificación 2026-07-28, transporte Streamable HTTP, con autorización) que un
   cliente MCP usa para consultar envíos.
3. Un conjunto de evaluación de al menos 30 casos que corre en CI. Falla si la calidad baja del umbral acordado
   y reporta costo y latencia por caso.
4. Un informe de seguridad que reproduce y mitiga cuatro riesgos del OWASP Top 10 para aplicaciones LLM 2025:
   inyección de prompt indirecta, agencia excesiva, fuga de datos personales y consumo sin límite.
5. Un flujo de trabajo con agente de código documentado en el repositorio: instrucciones del proyecto, permisos,
   revisión de cambios y evidencia de pruebas en un PR real.
6. La misma función ejecutada con un modelo local por Docker Model Runner, comparada en calidad, latencia y costo.

## 3. Versiones y APIs de referencia

| Pieza | Versión o estado | Fuente y fecha |
|---|---|---|
| Java / Spring Boot | JDK 25 LTS · Spring Boot 4.1.x | `docs/VERSIONES.md` |
| Spring AI | 2.0.x. La 2.0.0 actualizó a Spring Boot 4.1.0 y al SDK Java de MCP 2.0.0; la documentación marca 2.0.2 como estable | [Spring AI releases](https://github.com/spring-projects/spring-ai/releases); [referencia](https://docs.spring.io/spring-ai/reference/) |
| Especificación MCP | 2026-07-28 (la anterior es 2025-11-25) | [especificación](https://modelcontextprotocol.io/specification/); [cambios](https://modelcontextprotocol.io/specification/2026-07-28/changelog) |
| Anthropic | Messages API, uso de herramientas (`tool_use` y `tool_result`, `strict: true`), Models API para listar modelos activos | [modelos](https://platform.claude.com/docs/en/models/overview); [uso de herramientas](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) |
| OpenAI | Responses API, recomendada para proyectos nuevos; Chat Completions sigue soportada | [guía de migración](https://developers.openai.com/api/docs/guides/migrate-to-responses) |
| Google Gemini | Interactions API, interfaz por defecto desde junio de 2026; `generateContent` pasa a ser heredada | [Gemini API](https://ai.google.dev/gemini-api/docs) |
| Docker Model Runner | API compatible con OpenAI y con Ollama; modelos empaquetados como artefactos OCI | [Model Runner](https://docs.docker.com/ai/model-runner/) |
| OWASP | Top 10 for LLM Applications 2025 | [genai.owasp.org](https://genai.owasp.org/llm-top-10/) |

**Regla del curso para nombres de modelos.** Ninguna lección fija el nombre de un modelo en el texto. El código
lo lee de la configuración, y M0 T4 enseña a listar los modelos activos con la Models API de cada proveedor. Así
el curso no envejece cada vez que un proveedor publica modelos nuevos.

**Cambios de MCP 2026-07-28 que el curso enseña** (todos citados del changelog oficial):
- El protocolo es sin estado: desaparece el handshake `initialize`.
- Los servidores deben implementar `server/discover`.
- Se elimina la sesión `Mcp-Session-Id`.
- Los mensajes servidor→cliente siguen el patrón de solicitudes multi-ronda.
- Tasks pasa a ser una extensión.
- Roots, Sampling y Logging quedan deprecados.
- Para registrar clientes se prefieren los Client ID Metadata Documents.

## 4. Qué se incorpora desde otros cursos

El reparto aprobado (specs/016) no mueve módulos a este curso. Estos temas existentes se enlazan, y su destino se
decide aquí, para aprobación:

| Origen | Contenido | Propuesta |
|---|---|---|
| Fundamentos M7 T6 | Desarrollo guiado por especificación con agentes de IA | Se queda en Fundamentos como introducción. M7 T2 de este curso parte de ahí |
| Fundamentos M7 T7 | Evaluar una skill de agente antes de usarla | Se queda. Este curso remite a él en M7 T1 |
| Cloud M20 T1 | Bedrock Runtime | Se queda en Cloud: es un servicio AWS. La auditoría (C16) pide usar Converse |
| JavaScript M14 «Web3 y machine learning en navegador» | Web3 y machine learning en el navegador | La parte de Web3 pasa al curso Blockchain. La parte de ML se queda en JavaScript |

## 5. Módulos

### M0 · Cómo funciona un modelo de lenguaje, para quien programa
**Objetivo:** predecir el comportamiento, el costo y los límites de un modelo antes de integrarlo.
**Origen:** nuevo.
- T1 · Tokens, ventana de contexto y costo por petición · 40 min
- T2 · Muestreo y no determinismo: la misma petición cambia · 35 min
- T3 · Alucinación y fecha de corte: qué no puede saber el modelo · 35 min
- T4 · Elegir el modelo por tarea con datos: Models API, latencia y precio · 35 min

**Hito RutaFlow:** tabla de costo estimado del asistente por cada mil consultas.
**Duración:** 2 h 25 min

### M1 · Primera integración desde Spring Boot
**Objetivo:** llamar a un modelo desde la API de RutaFlow con control de errores.
**Origen:** nuevo.
- T1 · Llamada directa a la API con `java.net.http.HttpClient`: petición y respuesta · 40 min
- T2 · La misma llamada con `ChatClient` de Spring AI, y cambio de proveedor por configuración · 40 min
- T3 · Instrucciones de sistema verificables, no adjetivos · 35 min
- T4 · Respuesta en streaming hasta el cliente HTTP · 40 min
- T5 · Errores, límites de tasa y reintentos con espera · 35 min

**Hito RutaFlow:** el endpoint `/asistente` responde y sobrevive a un 429 simulado.
**Duración:** 3 h 10 min

### M2 · Salida estructurada y herramientas
**Objetivo:** obtener datos tipados y permitir que el modelo consulte RutaFlow de forma segura.
**Origen:** nuevo.
- T1 · Salida estructurada con JSON Schema y validación en Java · 40 min
- T2 · Ciclo de herramientas: `tool_use`, ejecución y `tool_result` · 45 min
- T3 · Herramientas de RutaFlow: consultar un envío y cotizar · 45 min
- T4 · Validar argumentos (`strict`), y acciones con efectos que exigen confirmación humana · 40 min

**Hito RutaFlow:** el asistente consulta un envío real. Un intento de cancelarlo queda en espera de confirmación.
**Duración:** 2 h 50 min

### M3 · RAG: responder con documentos propios
**Objetivo:** responder con citas verificables sobre el manual de operación.
**Origen:** nuevo.
- T1 · Embeddings y similitud: qué mide la distancia · 40 min
- T2 · PostgreSQL con pgvector desde Spring AI: indexar el manual · 45 min
- T3 · Fragmentación y metadatos: cómo cambian lo que se recupera · 40 min
- T4 · Recuperar y generar con citas obligatorias · 45 min
- T5 · Medir la recuperación con precision@k sobre preguntas conocidas · 40 min

**Hito RutaFlow:** respuestas con citas al manual, y precision@k medida.
**Duración:** 3 h 30 min

### M4 · Evaluación y pruebas
**Objetivo:** saber si un cambio de prompt o de modelo mejora o empeora.
**Origen:** nuevo.
- T1 · Conjunto de evaluación: casos, criterio y umbral · 40 min
- T2 · Evaluadores automáticos y modelo como juez: cuándo se puede confiar · 40 min
- T3 · Pruebas de regresión en CI con respuestas grabadas · 40 min
- T4 · Costo y latencia por caso como parte de la evaluación · 35 min

**Hito RutaFlow:** el pipeline falla al empeorar un prompt a propósito.
**Duración:** 2 h 35 min

### M5 · Model Context Protocol
**Objetivo:** exponer capacidades de RutaFlow a cualquier cliente MCP.
**Origen:** nuevo.
- T1 · Host, cliente y servidor; JSON-RPC y capacidades · 35 min
- T2 · Servidor MCP en Spring Boot con herramientas de RutaFlow (Streamable HTTP) · 45 min
- T3 · Recursos y prompts del servidor · 40 min
- T4 · Especificación 2026-07-28: sin estado, `server/discover` y qué queda deprecado · 40 min
- T5 · Autorización del servidor MCP con OAuth · 45 min

**Hito RutaFlow:** un cliente MCP consulta envíos con token. Sin token, el servidor responde 401.
**Duración:** 3 h 25 min

### M6 · Agentes
**Objetivo:** construir un bucle de agente acotado y observable.
**Origen:** nuevo.
- T1 · Bucle de agente: planificar, actuar y observar · 40 min
- T2 · Presupuestos de pasos, tiempo y costo · 40 min
- T3 · Humano en el bucle: aprobación de acciones · 40 min
- T4 · Trazas del agente con OpenTelemetry · 40 min

**Hito RutaFlow:** un agente reasigna envíos atrasados con aprobación, y deja su traza completa.
**Duración:** 2 h 40 min

### M7 · Desarrollo asistido por agentes de código
**Objetivo:** usar un agente de código en el repositorio sin bajar la calidad.
**Origen:** nuevo; parte de Fundamentos M7 T6–T7.
- T1 · Instrucciones del proyecto (`CLAUDE.md` o `AGENTS.md`) y permisos del agente · 40 min
- T2 · De especificación a PR con un agente: criterios verificables primero · 40 min
- T3 · Revisar código generado: diff, pruebas y seguridad · 40 min
- T4 · Revisión automatizada en CI · 35 min
- T5 · Conectar herramientas al agente por MCP, con mínimo privilegio · 35 min

**Hito RutaFlow:** un PR producido con agente, con la especificación, las pruebas y la revisión como evidencia.
**Duración:** 3 h 10 min

### M8 · Seguridad de aplicaciones con modelos
**Objetivo:** reproducir y mitigar los riesgos principales del OWASP Top 10 para LLM 2025.
**Origen:** nuevo.
- T1 · LLM01 Prompt Injection: directa e indirecta desde documentos del RAG · 45 min
- T2 · LLM05 Improper Output Handling y LLM06 Excessive Agency · 40 min
- T3 · LLM02 Sensitive Information Disclosure y la Ley 1581 de 2012 · 40 min
- T4 · LLM10 Unbounded Consumption: cuotas y cortes de costo · 35 min

**Hito RutaFlow:** informe con cuatro ataques reproducidos y sus mitigaciones probadas.
**Duración:** 2 h 40 min

### M9 · Modelos locales y operación
**Objetivo:** decidir entre API y modelo local con datos, y operar en producción.
**Origen:** nuevo; usa Docker Model Runner (fuera del curso Docker a propósito).
- T1 · Docker Model Runner: el modelo como artefacto OCI y su API compatible con OpenAI · 40 min
- T2 · Local frente a API: privacidad, costo y calidad medidos con la evaluación de M4 · 35 min
- T3 · Caché de prompts, presupuesto y observabilidad en producción · 40 min

**Hito RutaFlow:** comparación local frente a API con el mismo conjunto de evaluación.
**Duración:** 1 h 55 min

### M10 · Proyecto integrador
**Objetivo:** reunir las seis evidencias del apartado 2.
- T1 · Hito 1: asistente con RAG y herramientas (M1–M3) · 45 min
- T2 · Hito 2: evaluación en CI y comparación de modelos (M4 y M9) · 45 min
- T3 · Hito 3: servidor MCP con autorización y agente con aprobación (M5 y M6) · 45 min
- T4 · Hito 4: informe de seguridad y PR con agente (M7 y M8) · 45 min

Trabajo autónomo del proyecto: 8 h.
**Duración:** 3 h de temas + 8 h de proyecto.

## 6. Proyecto integrador sobre RutaFlow

Se amplía la API Spring Boot de RutaFlow con un módulo `asistente`, PostgreSQL con pgvector (en el mismo
Compose del curso Docker) y un servidor MCP. Las llamadas a proveedores se simulan en las pruebas con
respuestas grabadas. Las llamadas reales son opcionales y van con presupuesto. La rúbrica son las seis
evidencias del apartado 2.

## 7. Horas estimadas

Fórmula: suma de las duraciones de los temas más las horas de proyecto. Total: **31 h 20 min de temas + 8 h de proyecto = 39 h 20 min (≈ 39 h)**.

## 8. Cobertura frente a documentación oficial

No hay una certificación neutral de referencia. La cobertura se mide frente a la documentación de proveedores y
estándares:

| Fuente | Capacidades | Dónde |
|---|---|---|
| Anthropic: [modelos](https://platform.claude.com/docs/en/models/overview), [uso de herramientas](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) | Models API, herramientas del cliente y del servidor, `strict`, streaming y caché de prompts | M0 T4, M1, M2 y M9 T3 |
| OpenAI: [Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses) | API recomendada para proyectos nuevos | M1 T2 (cambio de proveedor) |
| Google: [Gemini API](https://ai.google.dev/gemini-api/docs) | Interactions API, function calling, salida estructurada y embeddings | M1 T2, M2 y M3 T1 |
| [Spring AI 2.0](https://docs.spring.io/spring-ai/reference/) | ChatClient, Structured Output, Tool Calling, MCP Boot Starters, PGvector, RAG, Evaluation y Observability | M1–M6 |
| [MCP 2026-07-28](https://modelcontextprotocol.io/specification/) | Arquitectura, herramientas, recursos y prompts, transporte, autorización y deprecaciones | M5 y M7 T5 |
| [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/) | LLM01, LLM02, LLM05, LLM06 y LLM10 con práctica. Los otros cinco (LLM03, LLM04, LLM07, LLM08 y LLM09) se explican en M8 sin laboratorio | M8 |
| [Claude Code](https://code.claude.com/docs/en/overview) | `CLAUDE.md`/`AGENTS.md`, hooks, skills, MCP, subagentes y GitHub Actions | M7. Se enseña el patrón; la herramienta concreta es un ejemplo |
| [Docker Model Runner](https://docs.docker.com/ai/model-runner/) | Modelos OCI y API compatible con OpenAI | M9 T1 |

## 9. Fuera de alcance, con motivo

- Entrenar o ajustar (fine-tuning) modelos: no es desarrollo de aplicaciones y exige otra base matemática.
- Bedrock y otros servicios gestionados por nube: se quedan en el curso Cloud.

## 10. Pendientes de verificar antes de escribir

- La versión exacta de Spring AI que se fija: el proyecto muestra 2.0.2 y GitHub marca 2.0.1 como la última. Se
  resuelve con Maven Central al escribir M1.
- Si los starters MCP de Spring AI 2.0 ya implementan la revisión 2026-07-28 o la 2025-11-25. M5 T4 depende de
  esto. Si no la implementan, el tema enseña la diferencia y la versión que habla el SDK.
- Los requisitos de Docker Model Runner en el Mac del dueño: Docker Desktop 4.40 o posterior en macOS, según la
  documentación.

## Fuentes consultadas (2026-11-18)

- https://modelcontextprotocol.io/specification/
- https://modelcontextprotocol.io/specification/2026-07-28/changelog
- https://github.com/spring-projects/spring-ai/releases
- https://docs.spring.io/spring-ai/reference/
- https://spring.io/projects/spring-ai
- https://platform.claude.com/docs/en/models/overview
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
- https://developers.openai.com/api/docs/guides/migrate-to-responses
- https://ai.google.dev/gemini-api/docs
- https://genai.owasp.org/llm-top-10/
- https://code.claude.com/docs/en/overview
- https://docs.docker.com/ai/model-runner/
