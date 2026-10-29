# Huecos del track Spring Boot frente a la biblioteca externa


## Estado (2026-10-28)
Resuelto: **M2 T4** (Lombok y MapStruct), **M2 T5** (OpenAPI con springdoc) y **M20 T5** (`@Async` y ejecutores). ⚠️ **No ejecutado**: el entorno de verificación no tenía acceso a Maven Central. Ejecuta `./mvnw test` en cada ejemplo antes de publicar.

**Fecha:** 2026-10-28 · **Método:** outline del PDF cruzado con `spring-boot` + palabras clave.

## Libros cotejados
- **Spring_Boot_Backend_Arquitectura.pdf** (268 págs.): capas, CRUD, request mapping, códigos de respuesta, services, autowired, inicialización lazy, propiedades, consumo de APIs, Lombok, persistencia, JPA.
- **Microservicios_Arquitectura_SOFTWARE.pdf**: escaneado sin texto; **pendiente de OCR**.

## Veredicto
El track cubre todo lo conceptual del libro y mucho más. Faltan herramientas prácticas del día a día:

| Tema del libro | Sección | Estado en el track | Prioridad |
|---|---|---|---|
| **Lombok** (y sus riesgos con JPA: `@Data`, `equals/hashCode`) | 4.7 | Ausente (0) | **Alta**: está en casi todo proyecto empresarial |
| **Mapeo DTO ↔ entidad** (MapStruct o manual) | 3.x | Ausente (0); DTOs sí | **Alta** |
| **Documentación OpenAPI con springdoc** | (complementario) | 2 menciones, sin tema | Media |
| **Inicialización lazy** (`@Lazy`, `spring.main.lazy-initialization`) | 4.4 | Ausente | Baja |
| **`@Async` y ejecutores** | (complementario) | Ausente | Media |
| **Base path / context-path y versionado de API** | 3.8 | Ausente | Baja |

## Propuesta
1. Tema nuevo en M2: "Lombok y MapStruct sin romper JPA".
2. Tema nuevo en M2 o M12: "OpenAPI con springdoc como contrato".
3. Tema nuevo en M20: "`@Async`, ejecutores y límites de hilos".
