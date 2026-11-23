# Módulo 2: API REST con Spring MVC

Una API REST no es solo “poner @RestController”. Es un contrato: recursos, métodos HTTP, códigos de estado, validación, errores consistentes, DTOs, paginación y documentación.

## Visual del módulo

No hay visual aprobado para M2 todavía. El único visual existente del track está en `web/public/visuals/temas/spring-boot/modulo-0-tema-1-ioc.html`; no se creó uno nuevo para M2.

## Proyecto verificado

Directorio: `/tmp/opencode/aurora-sb2`.

```text
/tmp/opencode/aurora-sb2/
├── pom.xml
├── mvnw
├── src/main/java/com/aurora/aurora_sb2/
│   ├── ApiExceptionHandler.java
│   ├── AuroraSb2Application.java
│   ├── DemoApiController.java
│   ├── GuiaRequest.java
│   └── GuiaResponse.java
└── src/test/java/com/aurora/aurora_sb2/
    ├── AuroraSb2ApplicationTests.java
    └── DemoApiTest.java
```

## Prerrequisitos y entorno observado

```bash
java -version
./mvnw -version
```

```text
openjdk version "27.0.1.0.2" 2026-10-21
OpenJDK Runtime Environment Temurin-27.0.1.0.2+1 (build 27.0.1.0.2+1)
OpenJDK 64-Bit Server VM Temurin-27.0.1.0.2+1 (build 27.0.1.0.2+1, mixed mode, sharing)
```

```text
Apache Maven 3.10.1 (3afd8084b5629f80b97750906a719879ed4cd283)
Maven home: /Users/nicolasruiz/.m2/wrapper/dists/apache-maven-3.10.1/987df3ef
Java version: 27.0.1.0.2, vendor: Eclipse Adoptium, runtime: /Users/nicolasruiz/Library/Java/JavaVirtualMachines/temurin-27.jdk/Contents/Home
Default locale: es_CO, platform encoding: UTF-8, time zone: America/Bogota
OS name: "mac os x", version: "27.2", arch: "aarch64", family: "mac"
```

El proyecto declara `java.version=25`, usa Spring Boot 4.2.0 y `spring-boot-starter-webmvc` + `spring-boot-starter-validation`.

## Bootstrap verificado desde start.spring.io

```bash
curl -fsSL -o /tmp/aurora-sb2.zip -G 'https://start.spring.io/starter.zip' \
  -d type=maven-project -d language=java -d javaVersion=25 -d bootVersion=4.2.0 \
  -d groupId=com.aurora -d artifactId=aurora-sb2 -d dependencies=web,validation
unzip -q /tmp/aurora-sb2.zip -d /tmp/opencode/aurora-sb2
cd /tmp/opencode/aurora-sb2
./mvnw test
```

## Aprende construyendo

### Tema 1: Por qué DTOs en vez de entidades directamente · Intermedio · 35 min

**Mecanismo.** Un DTO es un objeto de transporte. El controlador recibe DTO de entrada, el servicio transforma a modelo o comando, la persistencia usa entidad, y el controlador responde DTO de salida.

**Por qué existe.** Exponer la entidad mezcla contrato de API con diseño de persistencia.

**Implicaciones.** Hay que mantener mapeos explícitos o usar un mapper.

**Confusión común.** Pensar que un DTO elimina toda lógica de transformación.

#### `src/main/java/com/aurora/aurora_sb2/GuiaResponse.java`

```java
package com.aurora.aurora_sb2;

public record GuiaResponse(Long id, String destino) {
}
```

#### `src/main/java/com/aurora/aurora_sb2/GuiaRequest.java`

```java
package com.aurora.aurora_sb2;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GuiaRequest(
        @NotBlank(message = "destino es obligatorio")
        @Size(max = 100, message = "destino no puede exceder 100 caracteres")
        String destino
) {
}
```

#### Salida del endpoint

```bash
curl -s -i -H 'Content-Type: application/json' -d '{"destino":""}' http://localhost:8080/guias
```

```text
HTTP/1.1 400
{"code":"VALIDATION","message":" destino es obligatorio"}
```

### Tema 2: Validación con Bean Validation y ResponseEntity · Intermedio · 35 min

**Mecanismo.** Bean Validation declara restricciones con anotaciones. Spring MVC activa validación con `@Valid`; las fallas se convierten en `MethodArgumentNotValidException`.

**Por qué existe.** Centralizar reglas evita validaciones dispersas.

**Implicaciones.** El validador necesita `spring-boot-starter-validation`.

**Confusión común.** Pensar que `@Valid` no se aplica a records; los records admiten anotaciones.

#### `src/main/java/com/aurora/aurora_sb2/DemoApiController.java`

```java
package com.aurora.aurora_sb2;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@EnableSpringDataWebSupport
@RestController
public class DemoApiController {

    private final List<GuiaResponse> guias = new ArrayList<>();
    private final AtomicLong secuencial = new AtomicLong(1);

    @PostMapping("/guias")
    public ResponseEntity<GuiaResponse> crear(@Valid @RequestBody GuiaRequest request) {
        GuiaResponse response = new GuiaResponse(secuencial.getAndIncrement(), request.destino());
        guias.add(response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/guias")
    public ResponseEntity<List<GuiaResponse>> listar(Pageable pageable) {
        int size = Math.min(Math.max(pageable.getPageSize(), 1), 100);
        int from = Math.max(pageable.getPageNumber(), 0) * size;
        return ResponseEntity.ok(guias.subList(from, Math.min(from + size, guias.size())));
    }
}
```

### Tema 3: Manejo centralizado de errores con @ControllerAdvice · Intermedio · 40 min

**Mecanismo.** `@RestControllerAdvice` agrupa handlers para excepciones de controllers.

**Por qué existe.** Respuestas consistentes independientemente del controlador.

**Implicaciones.** El advice debe traducir a status y cuerpo controlados.

#### `src/main/java/com/aurora/aurora_sb2/ApiExceptionHandler.java`

```java
package com.aurora.aurora_sb2;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> manejo(MethodArgumentNotValidException ex) {
        String destino = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("entrada invalida");
        return ResponseEntity.badRequest().body(new ErrorBody("VALIDATION", destino));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorBody> manejo(ConstraintViolationException ex) {
        return ResponseEntity.badRequest().body(new ErrorBody("VALIDATION", String.join(",", ex.getConstraintViolations().stream().map(v -> v.getPropertyPath() + ": " + v.getMessage()).toList())));
    }

    public record ErrorBody(String code, String message) {
    }
}
```

### Tema 4: Lombok y MapStruct sin exponer datos internos · Intermedio · 35 min

**Mecanismo.** Lombok reduce boilerplate; MapStruct genera mappers.

**Por qué existe.** Reducir ruido sin ocultar contrato.

**Implicaciones.** En JPA se evita `@Data` ciego.

**Confusión común.** `@Data` en entidad expone setters y mutable state.

**Ejemplos.**

```java
@Getter @Setter @Builder
public class GuiaEntity {
    private Long id;
    private String destino;
}
```

```java
@Mapper(componentModel = "spring")
interface GuiaMapper {
    GuiaResponse toResponse(GuiaEntity entity);
}
```

Estos snippets son de intención y no se ejecutaron como parte del proyecto M2.

### Tema 5: OpenAPI con springdoc: el contrato como prueba · Avanzado · 40 min

**Mecanismo.** springdoc genera OpenAPI a partir de handlers.

**Por qué existe.** Documentar contrato sin leer implementación.

**Nota honesta.** No se añadió la dependencia en el proyecto ejecutado para M2; el smoke se hizo con la API HTTP y el error de validación. La generación OpenAPI queda como extensión pendiente de verificación.

### Tema 6: Paginación HTTP con validación y un límite de recursos explícito · Avanzado · 40 min

**Mecanismo.** `Pageable` con límite máximo.

**Código.**

```java
int size = Math.min(Math.max(pageable.getPageSize(), 1), 100);
int from = Math.max(pageable.getPageNumber(), 0) * size;
```

### Tema 7: JSON con Jackson 3: `JsonMapper`, fechas y valores por defecto nuevos · Avanzado · 35 min

**Mecanismo.** Jackson serializa JSON.

**Nota honesta.** Se documenta con versión Boot 4.2.0; no se amplió para fechas en este módulo.

### Tema 8: Versionado de API nativo de Spring Framework 7 · Avanzado · 40 min

**Mecanismo.** Versionado nativo en Spring Framework 7 / Spring Boot 4.

**Nota honesta.** Se dejó como nota porque el proyecto M2 no implementó versionado nativo; se usó path `/guias` sin versión.

## Verificación real

Ejecutado el 2026-11-23 desde `/tmp/opencode/aurora-sb2`.

```bash
cd /tmp/opencode/aurora-sb2
./mvnw test
./mvnw -q spring-boot:run
```

| Comando | Resultado |
|---|---|
| `./mvnw test` | `BUILD SUCCESS` tras corregir `@Valid` y soporte de `Pageable` |
| `curl ... -d '{"destino":""}'` | `HTTP/1.1 400`, body `{"code":"VALIDATION","message":" destino es obligatorio"}` |
| `GET /guias?page=0&size=2` | `HTTP/1.1 200` |

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `@Valid` no aplicaba validación | Falta `@Valid` en el parámetro | Revisar anotaciones del controller | Añadir `@Valid` |
| `No primary or single unique constructor found for interface Pageable` | Soporte Spring Data Web no habilitado | Revisar dependencia y configuración | Añadir `@EnableSpringDataWebSupport` o configurar resolver |
| Response 400 con body inesperado | Advice no manejaba la excepción | Revisar type de excepción | Añadir handler |

## Cierre

Una API REST profesional es contrato + validación + errores + seguridad + documentación.

## Checklist

- Uso DTOs, no entidades expuestas.
- Valido entrada con Bean Validation.
- Centralizo errores con `@RestControllerAdvice`.
- Pagino con límite máximo.
- Documento contrato y verifico versión antes de asumir features.
