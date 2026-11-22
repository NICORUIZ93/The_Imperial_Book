# Módulo 2: REST APIs con Spring Web

Este módulo construye APIs HTTP con Spring MVC: contratos DTO, validación, manejo de errores, mapeo, documentación, paginación, JSON y versionado. Cada concepto se explica con contrato y verificación; los ejemplos Spring Boot completos se marcan como verificables en proyecto Boot, y los conceptos puros se verifican con Java cuando aplica.

**Entorno de referencia (2026-05-22):** JDK 27, Maven 3.10.0. Ejemplos Boot verificados en `/tmp` con Spring Boot 3.5.x/Java 21 cuando se indica; APIs Spring Web/Validation/Jackson modernas.

## Aprende construyendo

### Tema 1: Por qué DTOs en vez de entidades directamente · Intermedio · 35 min

Caso guía: exponer una entidad JPA directamente filtra campos internos o acopla API a persistencia.

#### DTO (Data Transfer Object)

**Definición formal.** DTO es un objeto de transporte que representa datos de entrada/salida de un contrato, separado del modelo de persistencia/dominio interno.

**Para qué sirve.** Controla el contrato HTTP, evita sobreexposición y desacopla API de BD.

**Cuándo usarlo.** En entradas/salidas HTTP. No expongas entidades JPA directamente en APIs públicas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/sb2-dto && cd /tmp/sb2-dto
cat > DemoDto.java << 'JAVA'
class UserEntity { long id; String email; String passwordHash; UserEntity(long i,String e,String p){id=i;email=e;passwordHash=p;} }
record UserResponse(long id, String email) { static UserResponse from(UserEntity e){ return new UserResponse(e.id,e.email); } }
public class DemoDto { public static void main(String[] args){ System.out.println(UserResponse.from(new UserEntity(1,"a@b.com","hash")).email()); } }
JAVA
javac DemoDto.java && java DemoDto
```

**Caso de uso real.** Ocultar `passwordHash`, campos internos o relaciones lazy.

**Error común.** Retornar entidad JPA y disparar lazy loading/filtrar datos sensibles. Corrección: mapear a DTO explícito.

**Verificación (JDK 27, 2026-05-22).** Salida: `a@b.com`.

#### Mapeo entidad-DTO

**Definición formal.** Transformación explícita entre modelo interno y contrato externo.

**Para qué sirve.** Centraliza conversión y evita fugas.

**Cuándo usarlo.** En capa de servicio/controlador/mapper dedicado.

**Ejemplo mínimo enfocado (ejecutable).** Ver `UserResponse.from(...)` anterior.

**Caso de uso real.** MapStruct o mappers manuales.

**Error común.** Mapeo duplicado inconsistente. Corrección: mapper único y tests.

**Verificación (JDK 27, 2026-05-22).** Observada por ejecución anterior.

### Tema 2: Validación con Bean Validation y ResponseEntity · Intermedio · 35 min

Caso guía: rechazar input inválido antes de tocar la lógica de negocio.

#### Bean Validation

**Definición formal.** Estándar Jakarta Bean Validation (anotaciones como `@NotBlank`, `@Email`, `@Min`) para declarar restricciones sobre campos/params.

**Para qué sirve.** Validar entrada de forma declarativa y consistente.

**Cuándo usarlo.** En DTOs de entrada con `@Valid`/`@Validated`.

**Ejemplo mínimo enfocado (ejecutable con Jakarta Validation en proyecto; concepto Java puro).**

```java
record CrearEnvioRequest(@NotBlank String codigo, @Min(1) int kg) {}
```

**Caso de uso real.** Rechazar request sin `codigo`.

**Error común.** Validar solo en frontend. Corrección: validar en servidor siempre.

**Verificación.** **Nota:** requiere dependencia `spring-boot-starter-validation`/provider Hibernate Validator; evidencia: 400 con detalles.

#### `ResponseEntity`

**Definición formal.** Tipo Spring que representa respuesta HTTP completa: status, headers y body.

**Para qué sirve.** Control explícito de códigos HTTP.

**Cuándo usarlo.** Cuando necesitas status/headers específicos. Para casos simples, retornar body o `@ResponseStatus`.

**Ejemplo mínimo enfocado (Spring).**

```java
@PostMapping("/envios")
ResponseEntity<Void> crear(@Valid @RequestBody CrearEnvioRequest req){
  return ResponseEntity.status(201).build();
}
```

**Caso de uso real.** 201 Created con Location.

**Error común.** Retornar 200 para creación. Corrección: usar semántica HTTP correcta.

**Verificación.** **Nota:** requiere app Boot; evidencia con `curl -i`.

### Tema 3: Manejo centralizado de errores con @ControllerAdvice · Intermedio · 40 min

Caso guía: errores consistentes para todos los endpoints.

#### `@ControllerAdvice` / `@ExceptionHandler`

**Definición formal.** Mecanismo Spring MVC para manejar excepciones transversalmente en controllers y producir respuestas consistentes.

**Para qué sirve.** Centralizar manejo de errores y formato de respuesta.

**Cuándo usarlo.** Cuando múltiples endpoints comparten política de error.

**Ejemplo mínimo enfocado (Spring).**

```java
@RestControllerAdvice
class ApiErrors {
  @ExceptionHandler(IllegalArgumentException.class)
  ResponseEntity<Map<String,String>> bad(IllegalArgumentException e){
    return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
  }
}
```

**Caso de uso real.** 404 para recurso no encontrado, 400 para validación.

**Error común.** Exponer stack traces/mensajes internos. Corrección: mensajes seguros y log interno.

**Verificación.** **Nota:** requiere app Boot; `curl` debe mostrar JSON de error y status esperado.

#### Problem Details / contrato de error

**Definición formal.** Formato estructurado de error (por ejemplo RFC 9457/ProblemDetail en Spring) con campos estables.

**Para qué sirve.** Clientes pueden manejar errores programáticamente.

**Cuándo usarlo.** APIs públicas o entre servicios.

**Ejemplo mínimo enfocado (ejecutable, Java puro).**

```bash
mkdir -p /tmp/sb2-err && cd /tmp/sb2-err
cat > DemoErr.java << 'JAVA'
public class DemoErr { public static void main(String[] args){ System.out.println("{\"type\":\"bad\",\"status\":400}"); } }
JAVA
javac DemoErr.java && java DemoErr
```

**Caso de uso real.** `ProblemDetail` con `type`, `title`, `status`, `detail`.

**Error común.** Cada endpoint devuelve formato distinto. Corrección: contrato central.

**Verificación (JDK 27, 2026-05-22).** Salida: `{"type":"bad","status":400}`.

### Tema 4: Lombok y MapStruct sin exponer datos internos · Intermedio · 35 min

Caso guía: reducir boilerplate sin perder claridad del contrato.

#### Lombok

**Definición formal.** Librería que genera código en compilación mediante anotaciones (`@Getter`, `@Builder`, `@RequiredArgsConstructor`, etc.).

**Para qué sirve.** Reducir boilerplate.

**Cuándo usarlo.** Con criterio, en DTOs/clases simples. Evita `@Data` ciego en entidades JPA.

**Ejemplo mínimo enfocado (conceptual).**

```java
@Value // inmutable
public class UserResponse { Long id; String email; }
```

**Caso de uso real.** DTO inmutable.

**Error común.** `@Data` en entidad JPA genera `equals/hashCode/toString` peligrosos. Corrección: usar anotaciones específicas y cuidado con relaciones.

**Verificación.** **Nota:** requiere procesador de anotaciones configurado; evidencia en bytecode generado.

#### MapStruct

**Definición formal.** Generador de mappers en compilación que crea implementaciones de mapeo tipo-safe.

**Para qué sirve.** Mapeos rápidos, explícitos y verificables en compilación.

**Cuándo usarlo.** Mapeos DTO-entidad repetitivos.

**Ejemplo mínimo enfocado (conceptual).**

```java
@Mapper(componentModel = "spring")
interface UserMapper { UserResponse toResponse(UserEntity e); }
```

**Caso de uso real.** Mapeo de listas de DTOs.

**Error común.** Confiar en mapeo mágico sin revisar campos sensibles. Corrección: tests de mapper y revisiones.

**Verificación.** **Nota:** requiere annotation processor; evidencia: clase `UserMapperImpl` generada.

### Tema 5: OpenAPI con springdoc: el contrato como prueba · Avanzado · 40 min

Caso guía: documentar y validar contrato HTTP.

#### OpenAPI/springdoc

**Definición formal.** OpenAPI es especificación de contrato HTTP; springdoc genera documentación OpenAPI desde controladores Spring.

**Para qué sirve.** Contrato visible, clientes generados, pruebas de contrato.

**Cuándo usarlo.** APIs públicas o entre equipos.

**Ejemplo mínimo enfocado (configuración).**

```xml
<dependency><groupId>org.springdoc</groupId><artifactId>springdoc-openapi-starter-webmvc-ui</artifactId><version>...</version></dependency>
```

**Caso de uso real.** Exponer `/v3/api-docs` y Swagger UI.

**Error común.** Documentación desactualizada por manual. Corrección: generar desde código y validar en CI.

**Verificación.** **Nota:** requiere app Boot con dependencia; evidencia: endpoint OpenAPI responde JSON.

### Tema 6: Paginación HTTP con validación y un límite de recursos explícito · Avanzado · 40 min

Caso guía: listar recursos sin devolver millones de filas.

#### Paginación

**Definición formal.** Técnica de dividir resultados en páginas con parámetros como `page`, `size`, `sort`.

**Para qué sirve.** Limitar carga y latencia.

**Cuándo usarlo.** Endpoints de listado. Siempre impón límite máximo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/sb2-page && cd /tmp/sb2-page
cat > DemoPage.java << 'JAVA'
import java.util.*; import java.util.stream.*;
public class DemoPage { public static void main(String[] args){ var data=IntStream.range(0,10).boxed().toList(); int page=1,size=3; int from=page*size; System.out.println(data.subList(from, Math.min(from+size,data.size()))); } }
JAVA
javac DemoPage.java && java DemoPage
```

**Caso de uso real.** `GET /envios?page=0&size=20`.

**Error común.** Permitir `size=100000`. Corrección: max size y validación.

**Verificación (JDK 27, 2026-05-22).** Salida: `[3, 4, 5]`.

### Tema 7: JSON con Jackson 3: `JsonMapper`, fechas y valores por defecto nuevos · Avanzado · 35 min

Caso guía: serializar fechas y controlar JSON.

#### Jackson `JsonMapper`/`ObjectMapper`

**Definición formal.** Componentes de Jackson para serializar/deserializar JSON a objetos Java.

**Para qué sirve.** Contrato JSON estable.

**Cuándo usarlo.** Configurar formatos de fecha, nulls, naming, módulos.

**Ejemplo mínimo enfocado (ejecutable con Java puro JSON simple por dependencia ausente; se muestra contrato).**

```java
record Evento(String id, Instant at) {}
// configurar ObjectMapper con JavaTimeModule y formato ISO-8601
```

**Caso de uso real.** Fechas ISO-8601 en APIs.

**Error común.** Fechas como timestamps ambiguos. Corrección: ISO-8601 explícito.

**Verificación.** **Nota:** requiere Jackson en classpath; evidencia con test de serialización.

### Tema 8: Versionado de API nativo de Spring Framework 7 · Avanzado · 40 min

Caso guía: evolucionar contrato sin romper clientes.

#### Versionado de API

**Definición formal.** Estrategia para exponer versiones de contrato (path, header, query, media type) manteniendo compatibilidad.

**Para qué sirve.** Evolución controlada.

**Cuándo usarlo.** Cuando cambia contrato público incompatiblemente.

**Ejemplo mínimo enfocado (conceptual).**

```java
@GetMapping(value="/envios/{id}", version="1.0")
EnvioV1 getV1(...) { ... }
```

**Caso de uso real.** v1 y v2 conviviendo durante migración.

**Error común.** Romper v1 sin periodo de deprecación. Corrección: versionar, deprecar, medir uso, retirar.

**Verificación.** **Nota:** depende de soporte de versionado en versión de Spring usada; validar con docs/version de framework del proyecto.

## Cierre del módulo

Una API REST robusta no es solo un controller: es contrato DTO, validación, errores consistentes, documentación, paginación segura y evolución versionada.
