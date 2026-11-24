# Repositorios y herramientas de referencia

Revisados el 2026-11-24. Cada entrada dice para qué le sirve a The Imperial Book y con qué cuidado usarla.
Datos tomados de la página de GitHub de cada repo; no se auditó su código.

## Dónde quedó aplicado cada uno

| Repo | Aplicado en | Cómo |
|---|---|---|
| Dashmotion | Todos los cursos | `lesson-viewer.ts` anima las flechas de cada diagrama Mermaid de flujo y de estados (trazo que avanza + punto que recorre la conexión). Botón «Pausar/Animar»; sin animación si el sistema pide reducir movimiento. |
| Animdiagram | Cloud M6 y M18, Microservicios Spring M5, Microservicios Node M13 | Cuatro SVG animados en `web/public/content/figures/animados/` (variante clara `-light.svg` elegida según el tema). |
| Immich | Node.js M8 (Tema 4, BullMQ) y Flutter M20 (Tema 5, arquitectura) | Secciones «Caso real» con arquitectura, diagrama y ejercicio sobre el repo. |
| AppFlowy | Flutter M16 (Tema 3, Rust por ABI C) | «Caso real»: Flutter + núcleo Rust con eventos Protobuf. |
| Coolify | DevOps M18 (Tema 3, despliegue y rollback) | «Alternativa»: PaaS sobre el propio VPS, requisitos, instalación y riesgos. |
| Crawl4AI | Proceso de temarios (abajo) | Herramienta para recolectar índices y documentación oficial. |
| Animation-explainer | Sin aplicar | Solo referencia para futuros videos por escenas. |

## Cómo usar Crawl4AI para armar o revisar un temario

1. Instálalo en un entorno aparte: `pip install -U crawl4ai` y luego `crawl4ai-setup`.
2. Descarga en Markdown la tabla de contenidos oficial (documentación, sílabo, índice de un libro publicado por la editorial):
   `crwl https://docs.spring.io/spring-boot/reference/ -o markdown > fuentes/spring-boot-referencia.md`
3. Compara esos títulos con `web/src/app/tracks/<curso>.track.ts` y anota los temas que faltan.
4. Usa el material solo para decidir **qué** enseñar; las lecciones se escriben con palabras propias, nunca copiando texto de la fuente.
5. No guardes las descargas en el repo (son contenido de terceros): déjalas en una carpeta local ignorada.

## Visuales animados para las lecciones

### 1. Dashmotion — https://github.com/csthink/dashmotion
- **Qué es:** skill de Claude que convierte una descripción en español o un diagrama Mermaid en un diagrama animado (un solo HTML/SVG de pocos KB).
- **Modos:** Flujo (procesos, pipelines, máquinas de estado) y Arquitectura (componentes, fronteras, leyenda, rutas de petición).
- **Licencia:** MIT · ~180 estrellas · v2.2.4.
- **Uso en el proyecto:** piloto para reemplazar visuales pesados (~800 KB cada uno) y animar los bloques Mermaid que ya existen.
- **Límite:** solo acepta Mermaid `flowchart`/`graph` y `stateDiagram-v2`; no secuencia, clases, ER ni gantt.
- **Prioridad:** alta.

### 2. Animdiagram — https://github.com/praveenvijayan/animdiagram
- **Qué es:** skill que genera diagramas SVG animados en bucle (paquetes que viajan entre cajas) a partir de un `spec.json`.
- **Salida:** un `.svg` sin scripts ni fuentes externas; funciona dentro de `<img>` y Markdown, así que entra directo en `web/public/content/`.
- **Extras:** verificador (`check.py`), variante clara/oscura (`skin.py`), exportación opcional a MP4.
- **Licencia:** MIT · proyecto muy nuevo (pocos commits).
- **Uso en el proyecto:** flujos de mensajes en Microservicios, colas/eventos en Cloud con Floci.
- **Prioridad:** media.

### 3. Animation-explainer — https://github.com/AgentBuff/animation-explainer
- **Qué es:** skill que crea explicaciones animadas por escenas, con narración TTS y exportación a MP4.
- **Licencia:** MIT · muy inmaduro (pocos commits); narración por defecto en chino y README en chino.
- **Uso en el proyecto:** solo como inspiración para futuros videos de clase.
- **Prioridad:** baja.

## Despliegue, investigación y proyectos de estudio

### 4. Coolify — https://github.com/coollabsio/coolify
- **Qué es:** plataforma self-hosted para desplegar apps, bases de datos y servicios (alternativa a Heroku/Netlify/Vercel), sobre Docker con HTTPS automático.
- **Licencia:** Apache-2.0.
- **Uso en el proyecto:** publicar la academia en un VPS propio; caso real para el curso de DevOps/Docker.
- **Cuidado:** se instala con `curl | bash`; hacerlo en un servidor dedicado, no en el Mac.
- **Prioridad:** media (cuando se quiera publicar).

### 5. Crawl4AI — https://github.com/unclecode/crawl4AI
- **Qué es:** crawler que convierte sitios web en Markdown listo para IA; CLI, Docker y soporte MCP.
- **Licencia:** Apache-2.0 · versión v0.9.5 (oct-2026).
- **Uso en el proyecto:** recolectar temarios, sílabos y documentación oficial para armar y verificar los temarios de cada curso.
- **Cuidado:** solo para investigación; no copiar contenido de terceros dentro de las lecciones (copyright y términos de cada sitio).
- **Prioridad:** media.

### 6. AppFlowy — https://github.com/appflowy-io/appflowy
- **Qué es:** alternativa open source a Notion (Flutter + Rust).
- **Licencia:** AGPL-3.0.
- **Uso en el proyecto:** opcional para "Nicolás OS" si se quiere salir de Notion; la sincronización del curso está pensada para Notion. Su código sirve como ejemplo avanzado del curso de Flutter.
- **Prioridad:** baja.

### 7. Immich — https://github.com/immich-app/immich
- **Qué es:** gestión self-hosted de fotos y videos (Flutter móvil, NestJS backend, SvelteKit web).
- **Licencia:** AGPL-3.0.
- **Uso en el proyecto:** proyecto de referencia para estudiar arquitectura real (Flutter + Node/NestJS + Docker + búsqueda con IA). No es una herramienta para la academia.
- **Prioridad:** baja (referencia de estudio).

## Licencias: qué significa para el proyecto
- **MIT / Apache-2.0:** se pueden usar e integrar citando la licencia.
- **AGPL-3.0 (AppFlowy, Immich):** se pueden instalar y estudiar; no copiar su código dentro de este repo sin cumplir la AGPL.
