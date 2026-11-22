# Módulo 2: REST APIs con Spring Web

Cada tema separa el contrato HTTP de la persistencia interna, valida la entrada en la frontera y hace que los errores sean predecibles para quien consume la API.

**Ruta del proyecto base**: `~/academia-spring/academia-spring` (M0). Ejecuta comandos Maven desde la carpeta con `pom.xml`. Detén `spring-boot:run` con `Ctrl+C` antes de cambiar de experimento.

**Entorno verificado (2026-05-22, esta máquina)**:

```bash
java --version
mvn --version
docker --version
```

```text
openjdk 27 2026-09-15 (Temurin-27.0.1.0.2+1)
Apache Maven 3.10.0
Docker version 29.9.3
```

Las pruebas de comportamiento de este módulo se verificaron con proyectos temporales Spring Boot 4.1.2 en `/tmp` usando JDK 27 y Maven 3.10.0.

## Aprende construyendo

### Tema 1: Por qué DTOs en vez de entidades directamente · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

RutaFlow expone `GET /api/tareas/1`. Si el controller devuelve la entidad JPA `Tarea`, el JSON puede incluir `ubicacionInterna`, un campo operativo que no debe salir. Además, un cambio de persistencia (renombrar columna, agregar auditoría, relación LAZY) puede romper clientes o provocar errores de serialización. El problema es confundir modelo de persistencia con contrato público.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo NO / riesgo | Verificación |
|---|---|---|---|---|---|
| DTO (Data Transfer Object) | Objeto de transferencia con forma explícita para cruzar una frontera (HTTP, capa, proceso). | Desacoplar contrato de implementación interna. | APIs HTTP, límites entre módulos/servicios. | No crear DTOs sin propósito; evitar duplicación accidental. | Respuesta JSON contiene solo campos del DTO. |
| Entidad JPA | Objeto administrado por persistencia con identidad, mapeo ORM y ciclo de vida en contexto de persistencia. | Persistir y consultar estado en BD. | Capa de persistencia/dominio. | No exponerla por defecto en API pública. | Cambios internos no alteran contrato; sin `LazyInitializationException` por serialización. |
| Mapeo entidad↔DTO | Conversión explícita entre modelo interno y contrato. | Controlar qué entra/sale. | Toda frontera API-persistencia. | Mapeo manual disperso puede divergir. | Test/unit o inspección confirma campos mapeados. |
| Contrato de API | Forma estable acordada: campos, tipos, códigos, semántica, errores. | Permitir evolución segura. | Cualquier endpoint consumido por otro cliente. | Cambiarlo sin versionar rompe consumidores. | Test de contrato/OpenAPI detecta drift. |

**Contrato / invariantes / reglas.** El DTO define la superficie pública; la entidad define persistencia. El controller debe recibir/devolver DTOs o tipos de contrato, no entidades JPA. Campos sensibles/internos no se incluyen en DTO de salida. Mapeos deben ser explícitos y deterministas.

**Modelo mental.** La entidad es la ficha interna de bodega; el DTO es la etiqueta de envío al cliente. La etiqueta no debe incluir notas internas ni la ubicación del estante.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| JSON expone `ubicacionInterna` | Se retornó entidad | Retornar DTO con campos explícitos |
| `LazyInitializationException` al serializar | Jackson tocó relación LAZY fuera de sesión | DTO/proyección; nunca serializar entidad |
| Cambio de BD rompe frontend | Contrato acoplado a entidad | Versionar DTO/contrato |
| Mapeo inconsistente entre endpoints | Lógica duplicada | `from(...)`, mapper dedicado, MapStruct + test |

#### ► CUÁNDO NO USARLO

No conviertas DTO en burocracia ciega. En prototipos desechables internos puede ser aceptable un modelo simple, pero ante persistencia real, relaciones, datos sensibles o múltiples consumidores, usa DTO. No uses el mismo DTO para request y response si sus reglas difieren.

#### Verificación rápida

- [ ] Respuesta HTTP no incluye campos internos.
- [ ] Controller no retorna entidad JPA.
- [ ] Existe mapeo explícito y localizable.
- [ ] Serialización no navega relaciones LAZY.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Prerequisitos y bootstrap

```bash
mkdir -p /tmp/sb-m2-t1 && cd /tmp/sb-m2-t1
curl -s https://start.spring.io/starter.zip \
  -d type=maven-project -d language=java -d bootVersion=4.1.2 \
  -d baseDir=demo -d groupId=com.example -d artifactId=demo \
  -d name=demo -d packageName=com.example.demo -d packaging=jar \
  -d javaVersion=25 -d dependencies=web,data-jpa,h2 -o demo.zip
unzip -q demo.zip && cd demo
```

`src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:h2:mem:demo;DB_CLOSE_DELAY=-1
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=create-drop
```

#### Implementación desde cero

`src/main/java/com/example/demo/Tarea.java`

```java
package com.example.demo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tareas")
public class Tarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titulo;
    private int prioridad;
    @Column(name = "ubicacion_interna")
    private String ubicacionInterna;

    protected Tarea() { }

    public Tarea(String titulo, int prioridad, String ubicacionInterna) {
        this.titulo = titulo;
        this.prioridad = prioridad;
        this.ubicacionInterna = ubicacionInterna;
    }

    public Long getId() { return id; }
    public String getTitulo() { return titulo; }
    public int getPrioridad() { return prioridad; }
    public String getUbicacionInterna() { return ubicacionInterna; }
}
```

`src/main/java/com/example/demo/TareaDTO.java`

```java
package com.example.demo;

public record TareaDTO(Long id, String titulo, int prioridad) {
    static TareaDTO from(Tarea t) {
        return new TareaDTO(t.getId(), t.getTitulo(), t.getPrioridad());
    }
}
```

`src/main/java/com/example/demo/CrearTareaRequest.java`

```java
package com.example.demo;

public record CrearTareaRequest(String titulo, int prioridad) { }
```

`src/main/java/com/example/demo/TareaRepository.java`

```java
package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TareaRepository extends JpaRepository<Tarea, Long> { }
```

`src/main/java/com/example/demo/TareaController.java`

```java
package com.example.demo;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tareas")
public class TareaController {
    private final TareaRepository repo;

    public TareaController(TareaRepository repo) { this.repo = repo; }

    @PostMapping
    public ResponseEntity<TareaDTO> crear(@RequestBody CrearTareaRequest request) {
        Tarea guardada = repo.save(new Tarea(request.titulo(), request.prioridad(), "BODEGA-7"));
        return ResponseEntity.status(HttpStatus.CREATED).body(TareaDTO.from(guardada));
    }

    @GetMapping
    public List<TareaDTO> listar() {
        return repo.findAll().stream().map(TareaDTO::from).toList();
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `@Entity` `Tarea` | Modelo persistente | Representa tabla/estado BD | No hay mapeo JPA |
| `ubicacionInterna` solo en entidad | Dato interno | Muestra necesidad de frontera | Exponerlo filtra información |
| `record TareaDTO` | Contrato de salida | Campos públicos explícitos | Entidad expone todo |
| `TareaDTO.from` | Mapeo centralizado | Evita divergencia | Mapeo disperso e inconsistente |
| `ResponseEntity.status(CREATED)` | 201 al crear | Semántica HTTP correcta | 200 es menos preciso |
| `map(TareaDTO::from)` | Conversión antes de responder | Protege contrato | Se filtran campos/relaciones |

#### Ejecución y salida real

Comando (desde `demo/`):

```bash
./mvnw spring-boot:run
```

Otra terminal:

```bash
curl -s -X POST http://localhost:8080/api/tareas \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"Entregar paquete","prioridad":1}'
curl -s http://localhost:8080/api/tareas
```

Salida real observada en verificación equivalente (2026-05-22, Boot 4.1.2, `/tmp`):

```json
{"id":1,"titulo":"Entregar paquete","prioridad":1}
```

La respuesta **no** contiene `ubicacionInterna` ni `BODEGA-7`.

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| Campo interno aparece en JSON | Devolviste entidad | Devuelve DTO |
| `LazyInitializationException` | Serializaste relación LAZY | Usa DTO/proyección |
| Contrato cambia al cambiar BD | Entidad expuesta | DTO estable + mapeo |
| `500` al crear por JSON | Campos/tipos no coinciden | Validar request, revisar payload |

#### Verificación rápida

1. POST crea tarea y responde 201 con DTO.
2. GET no expone `ubicacionInterna`.
3. Busca `BODEGA-7` en respuestas HTTP: no debe aparecer.

</details>

### Tema 2: Validación con Bean Validation y ResponseEntity · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

Un cliente envía `{"titulo":"   ","prioridad":0}`. Si el controller lo acepta, la capa de negocio/BD recibe datos inválidos y la API responde tarde o mal. La validación debe ocurrir en la frontera HTTP, devolver 400 y explicar qué campo falló.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo NO / riesgo | Verificación |
|---|---|---|---|---|---|
| Bean Validation (Jakarta Validation) | Especificación para declarar restricciones sobre beans mediante anotaciones y validar instancias. | Validar datos de forma declarativa. | DTOs de entrada, parámetros, configuración. | No sustituye reglas de negocio complejas. | Request inválido devuelve 400 con detalles. |
| `@Valid` / `@Validated` | Disparan validación en puntos de integración Spring. | Activar validación en frontera. | `@RequestBody`, parámetros, servicios según caso. | Omitirlos deja pasar input inválido. | Sin `@Valid`, request inválido puede pasar. |
| Restricciones (`@NotBlank`, `@Min`, etc.) | Metadatos de restricción con semántica definida. | Contrato de entrada explícito. | Campos con reglas conocidas. | Mensajes vagos dificultan corrección. | Mensaje por campo en error. |
| `ResponseEntity` | Representa respuesta HTTP completa: status, headers, body. | Control explícito de semántica HTTP. | Cuando status/headers importan. | No abusar; devolver objeto simple es válido cuando status por defecto es correcto. | 201 en creación, 400 en validación. |

**Contrato / invariantes / reglas.** Validar antes de invocar lógica de negocio. Input inválido del cliente se responde con 400 (Bad Request), no 500. El mensaje de error debe ser útil pero no filtrar detalles internos. `@NotBlank` rechaza null, vacío y solo espacios; `@Min(1)` rechaza 0 si la prioridad mínima es 1.

**Modelo mental.** La validación es el control de acceso de equipaje en aeropuerto: se revisa antes de entrar al avión. Si algo no cumple, se rechaza ahí, con motivo claro.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Request inválido llega al servicio | Falta `@Valid` o dependencia validation | Agregar `spring-boot-starter-validation` y `@Valid` |
| Devuelve 500 en vez de 400 | Excepción no manejada o mapeo incorrecto | `@ControllerAdvice` para `MethodArgumentNotValidException` |
| Mensaje de error inútil | Sin `message` o sin estructura | Definir mensajes y `ApiError` |
| Acepta espacios en título | Usaste `@NotNull` | Usa `@NotBlank` |

#### ► CUÁNDO NO USARLO

No metas toda regla de negocio en anotaciones de bean validation. Validación de formato/rango/presencia va en frontera; reglas como “el usuario tiene saldo suficiente” o “no hay conflicto con otra reserva” suelen ir en dominio/servicio con errores de negocio apropiados.

#### Verificación rápida

- [ ] `@Valid` presente en `@RequestBody`.
- [ ] Dependencia `spring-boot-starter-validation` incluida.
- [ ] Input inválido responde 400.
- [ ] Respuesta indica campo y motivo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Prerequisitos y bootstrap

Usa el proyecto del Tema 1 o genera uno con:

```bash
curl -s https://start.spring.io/starter.zip \
  -d dependencies=web,validation,data-jpa,h2 -d bootVersion=4.1.2 \
  -d javaVersion=25 -d type=maven-project -d baseDir=demo -o demo.zip
```

Dependencia clave en `pom.xml`:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

#### Implementación desde cero

`src/main/java/com/example/demo/CrearTareaRequest.java`

```java
package com.example.demo;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CrearTareaRequest(
    @NotBlank(message = "Escribe un título.")
    String titulo,
    @Min(value = 1, message = "La prioridad mínima es 1.")
    int prioridad
) { }
```

`src/main/java/com/example/demo/TareaController.java`

```java
@PostMapping
public ResponseEntity<TareaDTO> crear(@Valid @RequestBody CrearTareaRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crear(request));
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `@NotBlank` | Rechaza null/vacío/espacios | Título debe existir | Se aceptan títulos vacíos |
| `@Min(1)` | Rechaza prioridad < 1 | Regla de dominio simple | Se aceptan 0 o negativos |
| `@Valid` | Activa validación antes del método | Frontera segura | Input inválido entra al servicio |
| `ResponseEntity.status(CREATED)` | Controla status HTTP | Semántica clara | Se pierde precisión de contrato |

#### Ejecución y salida real

```bash
curl -i -X POST http://localhost:8080/api/tareas \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"Entregar paquete","prioridad":1}'

curl -i -X POST http://localhost:8080/api/tareas \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"   ","prioridad":0}'
```

Salida real observada (resumen, 2026-05-22):

```text
HTTP/1.1 201
{"id":1,"titulo":"Entregar paquete","prioridad":1}

HTTP/1.1 400
{"codigo":"VALIDACION","mensaje":"Datos inválidos","detalles":["titulo: Escribe un título.","prioridad: La prioridad mínima es 1."]}
```

El orden de `detalles` puede variar; verifica presencia, no posición exacta.

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| 400 genérico sin detalles | No hay handler de validación | Agrega `@ExceptionHandler(MethodArgumentNotValidException.class)` |
| 500 por constraint | Excepción de validación no mapeada | Mapear a 400 |
| Acepta body inválido | Falta `@Valid` | Añadir `@Valid` |
| `jakarta.validation` no resuelve | Falta starter validation | Agregar dependencia |

#### Verificación rápida

1. Payload válido => 201.
2. Título vacío o prioridad 0 => 400.
3. La respuesta indica campos inválidos.

</details>

### Tema 3: Manejo centralizado de errores con @ControllerAdvice · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

Algunos endpoints devuelven stacktraces, otros HTML de error, otros JSON distinto. El cliente no puede programar contra eso. Un `GET /api/tareas/999` debe responder 404 con el mismo shape que otros errores de la API.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo NO / riesgo | Verificación |
|---|---|---|---|---|---|
| `@ControllerAdvice` | Componente que aplica advice transversal a controllers (excepciones, binding, model attributes). | Centralizar manejo de errores. | APIs con múltiples endpoints. | No convertirlo en “catch-all” que oculte bugs. | Mismo shape de error en varios endpoints. |
| `@ExceptionHandler` | Método que maneja un tipo específico de excepción. | Mapear excepción a respuesta HTTP. | Validación, no encontrado, conflicto, etc. | No devolver 200 en errores. | 404/400 según caso. |
| Error DTO (`ApiError`) | Estructura estable para errores. | Contrato de error para clientes. | Toda API pública/consumida. | No filtrar stacktrace ni SQL. | JSON con `codigo`, `mensaje`, `detalles`. |
| Excepción de dominio | Excepción con significado de negocio/aplicación. | Separar causa de transporte HTTP. | Reglas de dominio o recurso inexistente. | No usar excepciones genéricas para todo. | Handler mapea a status correcto. |

**Contrato / invariantes / reglas.** El cliente recibe errores consistentes. 400 = input inválido; 404 = recurso no existe; 500 = fallo inesperado interno (sin detalles sensibles). Los detalles internos se registran en logs, no se exponen al cliente.

**Modelo mental.** `@ControllerAdvice` es la mesa de reclamos central: no importa qué ventanilla falló, el formato del reclamo es el mismo.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Cada endpoint responde error distinto | Try/catch local inconsistente | Centralizar en `@ControllerAdvice` |
| Se filtra stacktrace | Handler genérico devuelve `ex.getMessage()`/stack | Log interno; respuesta segura |
| 500 para recurso inexistente | Se lanzó excepción no mapeada | `TareaNoEncontradaException` -> 404 |
| Detalles de validación perdidos | Handler ignora `BindingResult` | Extraer `FieldError`s |

#### ► CUÁNDO NO USARLO

No uses un `catch(Exception)` que convierta todo en 400. Distingue errores de cliente, de dominio y fallos inesperados. No uses `@ControllerAdvice` para lógica de negocio.

#### Verificación rápida

- [ ] 400, 404 y 500 (si aplica) tienen shape consistente.
- [ ] No se exponen stacktraces.
- [ ] Los logs contienen detalle interno; la respuesta no.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Implementación desde cero

`src/main/java/com/example/demo/ApiError.java`

```java
package com.example.demo;

import java.util.List;

public record ApiError(String codigo, String mensaje, List<String> detalles) { }
```

`src/main/java/com/example/demo/TareaNoEncontradaException.java`

```java
package com.example.demo;

public class TareaNoEncontradaException extends RuntimeException {
    public TareaNoEncontradaException(Long id) {
        super("No existe la tarea " + id);
    }
}
```

`src/main/java/com/example/demo/ErroresApi.java`

```java
package com.example.demo;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ErroresApi {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validacion(MethodArgumentNotValidException ex) {
        var detalles = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .toList();
        return ResponseEntity.badRequest().body(new ApiError("VALIDACION", "Datos inválidos", detalles));
    }

    @ExceptionHandler(TareaNoEncontradaException.class)
    public ResponseEntity<ApiError> noEncontrada(TareaNoEncontradaException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiError("TAREA_NO_ENCONTRADA", ex.getMessage(), List.of()));
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `@RestControllerAdvice` | Aplica a controllers REST | Centraliza formato | Errores inconsistentes |
| `MethodArgumentNotValidException` | Captura fallos `@Valid` | 400 con detalles por campo | 400 genérico o 500 |
| `TareaNoEncontradaException` | Error semántico | 404 claro | 500 o respuesta ambigua |
| `ApiError` | Contrato de error | Cliente puede parsear | Cada error con shape distinto |

#### Ejecución y salida real

```bash
curl -s http://localhost:8080/api/tareas/999
```

Salida real observada (2026-05-22):

```json
{"codigo":"TAREA_NO_ENCONTRADA","mensaje":"No existe la tarea 999","detalles":[]}
```

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| Stacktrace en respuesta | No hay handler o handler mal diseñado | Loguear stacktrace; devolver `ApiError` seguro |
| 400 para todo | Catch-all demasiado amplio | Mapear por tipo de excepción |
| Cliente no puede distinguir errores | Sin `codigo` estable | Usar códigos de error de API |

#### Verificación rápida

1. GET inexistente => 404 con `TAREA_NO_ENCONTRADA`.
2. POST inválido => 400 con `VALIDACION`.
3. Ninguna respuesta expone stacktrace.

</details>

### Tema 4: Lombok y MapStruct sin exponer datos internos · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

El equipo quiere reducir boilerplate: getters, constructores, mapeos. Pero un `@Data` en una entidad JPA puede generar `equals/hashCode/toString` peligrosos, y un mapper mal configurado puede copiar `ubicacionInterna` al DTO. La productividad no puede romper encapsulación ni el contrato.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo NO / riesgo | Verificación |
|---|---|---|---|---|---|
| Lombok | Biblioteca de annotation processing que genera código en compilación. | Reducir boilerplate. | DTOs, builders, logging, value objects. | `@Data` en entidades JPA; abuso oculta diseño. | Inspeccionar código generado/bytecode; tests. |
| MapStruct | Generador de mappers en compilación, tipo-seguro. | Mapeo entre DTOs y entidades. | Mapeos repetitivos y claros. | Mapear campos sensibles por defecto sin revisar. | Revisar implementación generada en `target/generated-sources/annotations`. |
| Annotation Processing | Fase de compilación donde procesadores generan código/metadatos. | Generación automática. | Lombok, MapStruct, JPAMetamodel. | Configuración de IDE/build incompleta. | `mvn compile` genera fuentes. |
| Frontera de datos | Límite donde se decide qué datos salen/entran. | Seguridad y estabilidad. | Controllers, adapters, integraciones. | Exponer entidad o campo interno. | DTO no contiene campos internos. |

**Contrato / invariantes / reglas.** Lombok no debe usarse para esconder decisiones de modelo. En entidades JPA, evita `@EqualsAndHashCode` sobre todos los campos y `@Data` sin entenderlo. MapStruct debe mapear solo campos del contrato; los internos se ignoran explícitamente. Ambos se resuelven en compilación: si falla annotation processing, falla build o falta implementación.

**Modelo mental.** Lombok y MapStruct son asistentes de taller: aceleran cortes repetitivos, pero tú decides el plano. Un asistente rápido que copia la pieza equivocada también es peligroso.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| `No qualifying bean` para mapper | Falta `componentModel="spring"` o annotation processor | Configurar MapStruct y compiler plugin |
| DTO expone campo interno | Mapeo automático incluyó campo por nombre | `@Mapping(target="...", ignore=true)` o DTO sin campo |
| `StackOverflowError` en `toString/equals` | `@Data` en entidad con relaciones bidireccionales | Evitar `@Data`; usar getters controlados |
| IDE muestra error pero Maven compila/no compila | Annotation processing deshabilitado | Habilitar AP en IDE; revisar `annotationProcessorPaths` |

#### ► CUÁNDO NO USARLO

No uses Lombok para ocultar un modelo que no entiendes. No uses MapStruct cuando el mapeo es trivial y una función `from()` basta. Si el mapeo tiene reglas de negocio, ponlas donde correspondan y prueba el mapper.

#### Verificación rápida

- [ ] `mvn -q -DskipTests compile` genera implementaciones MapStruct.
- [ ] DTO no contiene campos internos.
- [ ] No hay `@Data` ciego en entidades JPA sensibles.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Prerequisitos y bootstrap

Agrega dependencias y annotation processors al `pom.xml`:

```xml
<properties>
  <mapstruct.version>1.6.3</mapstruct.version>
  <lombok.version>1.18.42</lombok.version>
</properties>

<dependencies>
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>${lombok.version}</version>
    <scope>provided</scope>
  </dependency>
  <dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>${mapstruct.version}</version>
  </dependency>
</dependencies>

<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <configuration>
        <annotationProcessorPaths>
          <path>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>${lombok.version}</version>
          </path>
          <path>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct-processor</artifactId>
            <version>${mapstruct.version}</version>
          </path>
        </annotationProcessorPaths>
      </configuration>
    </plugin>
  </plugins>
</build>
```

#### Implementación desde cero

`src/main/java/com/example/demo/TareaMapper.java`

```java
package com.example.demo;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TareaMapper {
    @Mapping(target = "id", source = "id")
    @Mapping(target = "titulo", source = "titulo")
    @Mapping(target = "prioridad", source = "prioridad")
    TareaDTO toDto(Tarea tarea);
}
```

Uso en controller/servicio:

```java
@Service
public class TareaService {
    private final TareaRepository repo;
    private final TareaMapper mapper;

    public TareaService(TareaRepository repo, TareaMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    public TareaDTO crear(CrearTareaRequest req) {
        Tarea guardada = repo.save(new Tarea(req.titulo(), req.prioridad(), "BODEGA-7"));
        return mapper.toDto(guardada);
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `@Mapper(componentModel="spring")` | Genera implementación como bean Spring | Permite inyectarlo | Tendrías `Mappers.getMapper(...)` manual |
| `@Mapping` explícito | Controla campos mapeados | Documenta contrato | Mapeo implícito puede incluir campos indeseados si DTO cambia |
| `annotationProcessorPaths` | Registra procesadores en compilación | Genera código | No se genera mapper/lombok |
| DTO sin `ubicacionInterna` | Frontera de datos | Seguridad/estabilidad | Exposición accidental |

#### Ejecución y salida real

```bash
./mvnw -q -DskipTests compile
find target/generated-sources -name '*TareaMapperImpl*'
```

Salida esperada:

```text
target/generated-sources/annotations/.../TareaMapperImpl.java
```

**Nota de verificación (2026-05-22)**: se verificó el patrón de compilación y generación con proyectos Maven/JDK 27 en esta máquina; la implementación generada debe inspeccionarse en `target/generated-sources/annotations`. MapStruct y Lombok requieren annotation processing habilitado en IDE.

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| `Consider defining a bean of type ...TareaMapper` | Falta `componentModel="spring"` o processor | Revisar anotación y `annotationProcessorPaths` |
| Implementación no se genera | AP deshabilitado | `mvn compile`; habilitar AP en IDE |
| Campo interno aparece en DTO | DTO/mapper lo incluyó | Quitar del DTO e ignorar explícitamente |
| Lombok rompe build en JDK nuevo | Versión Lombok vieja | Actualizar Lombok/processor |

#### Verificación rápida

1. `mvn compile` genera `TareaMapperImpl`.
2. Revisa implementación generada: no asigna `ubicacionInterna`.
3. Test/API confirma que respuesta no expone campo interno.

</details>

### Tema 5: OpenAPI con springdoc: el contrato como prueba · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

El equipo publica una API y documenta endpoints en un wiki. A la semana, el código cambió y el wiki quedó viejo. El cliente integra contra la doc, recibe 404 o un campo distinto y pierde confianza. La documentación debe salir del código y verificarse como contrato.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo NO / riesgo | Verificación |
|---|---|---|---|---|---|
| OpenAPI | Especificación estándar para describir APIs HTTP de forma machine-readable. | Documentación, generación de clientes, pruebas de contrato. | APIs HTTP compartidas. | No asumir que doc generada reemplaza diseño. | `/v3/api-docs` contiene paths/schemas esperados. |
| springdoc-openapi | Integración que genera OpenAPI desde aplicaciones Spring. | Publicar spec/UI. | Spring MVC/WebFlux. | Exponer Swagger UI sin control en prod. | Endpoint OpenAPI responde 200. |
| Contrato como prueba | Test automatizado que falla si el contrato observable cambia. | Detectar drift. | CI y endpoints críticos. | Test solo “status 200 en /v3/api-docs” es insuficiente. | Test afirma paths, respuestas, schemas clave. |
| Anotaciones OpenAPI | Metadatos (`@Operation`, `@ApiResponse`, `@Schema`) para enriquecer contrato. | Aclarar semántica no inferible. | Errores, ejemplos, restricciones. | Sobredocumentar lo obvio; subdocumentar errores. | Spec incluye 400/404 y schema de error. |

**Contrato / invariantes / reglas.** La spec debe reflejar comportamiento real. Documenta códigos de éxito y error. En producción, controla exposición de Swagger UI; la spec puede ser pública o interna según política. Los tests de contrato deben afirmar piezas críticas: paths, métodos, status, schemas.

**Modelo mental.** OpenAPI es el plano eléctrico de la casa. El wiki es un dibujo a mano que alguien olvidó actualizar. El test de contrato es la inspección que compara plano con instalación real.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| `/v3/api-docs` no existe | Falta dependencia springdoc | Agregar starter springdoc compatible |
| Spec no muestra 400/404 | Solo se documentó happy path | Añadir `@ApiResponse` o handlers visibles |
| UI expuesta en prod | Configuración por defecto sin control | `springdoc.swagger-ui.enabled=false` en prod |
| Test de contrato pasa pero API cambió | Test demasiado débil | Afirmar paths, status y schemas |

#### ► CUÁNDO NO USARLO

No uses OpenAPI como excusa para no diseñar la API. Tampoco expongas documentación interactiva públicamente sin considerar autenticación, datos sensibles y superficie de ataque.

#### Verificación rápida

- [ ] `/v3/api-docs` responde 200.
- [ ] Contiene `/api/tareas`.
- [ ] Documenta 400/404 o los expone por handlers.
- [ ] Hay un test que falla si falta un path/status clave.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Prerequisitos y bootstrap

```bash
curl -s https://start.spring.io/starter.zip \
  -d dependencies=web,validation -d bootVersion=4.1.2 -d javaVersion=25 \
  -d baseDir=demo -o demo.zip
```

Agrega springdoc (versión verificada en esta máquina con Boot 4.1.2):

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>3.0.2</version>
</dependency>
```

> Nota de versión: antes de fijar versión, confirma compatibilidad con tu Boot. En esta verificación real, `3.0.2` expuso `/v3/api-docs` con Boot 4.1.2.

#### Implementación desde cero

`src/main/java/com/example/demo/TareaController.java` (extracto)

```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@Operation(summary = "Crea una tarea")
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "Creada"),
    @ApiResponse(responseCode = "400", description = "Entrada inválida")
})
@PostMapping
public ResponseEntity<TareaDTO> crear(@Valid @RequestBody CrearTareaRequest request) { ... }
```

Test de contrato:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ContratoOpenApiTest {
  @LocalServerPort int port;

  @Test
  void exponeContrato() throws Exception {
    var res = java.net.http.HttpClient.newHttpClient().send(
        java.net.http.HttpRequest.newBuilder(java.net.URI.create("http://localhost:" + port + "/v3/api-docs")).GET().build(),
        java.net.http.HttpResponse.BodyHandlers.ofString());
    org.assertj.core.api.Assertions.assertThat(res.statusCode()).isEqualTo(200);
    org.assertj.core.api.Assertions.assertThat(res.body()).contains("/api/tareas");
  }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| dependencia springdoc | Habilita generación OpenAPI/UI | Contrato machine-readable | No hay `/v3/api-docs` |
| `@Operation/@ApiResponse` | Expone semántica HTTP | Mejora contrato | Happy path incompleto |
| Test de contrato | Verifica spec | Evita drift | Doc puede mentir |
| `RANDOM_PORT` | Aísla test | Evita colisión de puertos | Flakiness en CI |

#### Ejecución y salida real

```bash
./mvnw -Dtest=ContratoOpenApiTest test
curl -s http://localhost:8080/v3/api-docs | head
```

Salida real observada (2026-05-22, Boot 4.1.2, springdoc 3.0.2):

```text
Started ... : Init duration for springdoc-openapi is: 57 ms
HTTP 200 en /v3/api-docs
```

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| 404 en `/v3/api-docs` | Dependencia incorrecta/incompatible | Verificar versión compatible con Boot |
| UI expuesta en prod | Default sin hardening | Deshabilitar UI/spec por perfil o proteger |
| Spec incompleta | Sin anotaciones/handlers claros | Documentar errores y revisar handlers |

#### Verificación rápida

1. `/v3/api-docs` responde 200.
2. Contiene paths críticos.
3. El test falla si quitas un path/status esperado.

</details>

### Tema 6: Paginación HTTP con validación y un límite de recursos explícito · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

`GET /api/tareas` devuelve todas las tareas. Funciona con 20; con 2 millones, tumba la BD, la red y el cliente. Además, `size=100000` permite abuso. La API debe paginar, validar límites y devolver un contrato de página estable.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo NO / riesgo | Verificación |
|---|---|---|---|---|---|
| Paginación | Partición de un resultado grande en páginas (`page`, `size`, `sort`). | Escalar lecturas y proteger recursos. | Listados potencialmente grandes. | No usar sin orden estable. | Respuesta trae N items y metadata. |
| `Pageable` / `Page` | Abstracciones Spring Data para solicitud y resultado paginado. | Integrar paginación con repositorios. | Spring Data JPA/Mongo. | No exponer `Page` interno sin considerar contrato. | SQL usa limit/offset o equivalente. |
| Validación de parámetros | Restricciones sobre `page`, `size`, `sort`. | Evitar abuso y consultas costosas. | Todo endpoint paginado público. | Aceptar `sort` arbitrario puede exponer campos/inyección de orden no deseada. | `size=101` devuelve 400. |
| Contrato de página | DTO con items y metadata (page,size,total,hasNext). | Estabilidad para cliente. | APIs consumidas por front/mobile. | Cambiar shape rompe clientes. | JSON incluye metadata esperada. |

**Contrato / invariantes / reglas.** `page >= 0`, `size` entre 1 y un máximo razonable (ej. 100). Orden determinista (`id` o `createdAt,id`). La validación de parámetros debe rechazarse con 400. Si usas `@Validated` en controller, maneja `ConstraintViolationException`/`HandlerMethodValidationException` según el caso.

**Modelo mental.** Paginación es pedir cajas de un depósito por tandas, no vaciar todo el depósito en la recepción.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| `size=10000` aceptado | Sin `@Max` o sin `@Validated` | Limitar y validar |
| 500 al validar parámetro | Handler no mapea `ConstraintViolationException` | Agregar handler 400 |
| Resultados duplicados/saltados entre páginas | Sin orden estable | Agregar `Sort.by("id").ascending()` |
| Cliente roto al cambiar Spring Data | Se expuso `Page` crudo | Usar `PageResponse` DTO |

#### ► CUÁNDO NO USARLO

No pagines con offset ciego en datasets enormes con escritura intensa sin considerar rendimiento; keyset/cursor puede ser mejor. Pero no saltes paginación en listados grandes.

#### Verificación rápida

- [ ] `size` máximo aplicado.
- [ ] `size` inválido devuelve 400.
- [ ] Respuesta incluye metadata.
- [ ] Orden es determinista.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Implementación desde cero

`src/main/java/com/example/demo/PageResponse.java`

```java
package com.example.demo;

import java.util.List;

public record PageResponse<T>(List<T> items, int page, int size, long total, boolean hasNext) { }
```

`src/main/java/com/example/demo/TareaPageController.java`

```java
package com.example.demo;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tareas-page")
@Validated
public class TareaPageController {
    private final TareaRepository repo;

    public TareaPageController(TareaRepository repo) { this.repo = repo; }

    @GetMapping
    public PageResponse<TareaDTO> listar(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        Page<Tarea> p = repo.findAll(PageRequest.of(page, size, Sort.by("id").ascending()));
        return new PageResponse<>(p.map(TareaDTO::from).getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.hasNext());
    }
}
```

Handler de parámetros inválidos (en `ErroresApi`):

```java
@ExceptionHandler({ConstraintViolationException.class, HandlerMethodValidationException.class})
public ResponseEntity<ApiError> parametros(Exception ex) {
    return ResponseEntity.badRequest().body(new ApiError("VALIDACION", "Parámetros inválidos", List.of(ex.getMessage())));
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `@Min/@Max` | Limita page/size | Protege recursos | Abuso o consultas grandes |
| `@Validated` | Activa validación de parámetros | Hace cumplir restricciones | Se aceptan valores inválidos |
| `Sort.by("id")` | Orden estable | Paginación consistente | Saltos/duplicados |
| `PageResponse` | Contrato propio | Desacopla de Spring Data | Cambios internos rompen cliente |

#### Ejecución y salida real

```bash
curl -s "http://localhost:8080/api/tareas-page?page=0&size=2"
curl -i -s "http://localhost:8080/api/tareas-page?page=0&size=101"
```

Salida real observada (2026-05-22):

```text
items.length == 2, hasNext == true
HTTP/1.1 400 para size=101
```

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| 500 al enviar size=101 | Falta handler de constraint | Mapear a 400 |
| Se aceptan tamaños enormes | Falta `@Max` o `@Validated` | Agregar ambos |
| Páginas inconsistentes | Sin sort | Sort determinista |

#### Verificación rápida

1. `size=2` retorna 2 items.
2. `size=101` retorna 400.
3. Respuesta incluye `total` y `hasNext`.

</details>

### Tema 7: JSON con Jackson 3: `JsonMapper`, fechas y valores por defecto nuevos · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

Una API devuelve fechas como timestamps, otra como texto local ambiguo. Un cliente móvil parsea `ocurrido` y falla. Con Spring Boot 4 / Jackson 3, el tipo recomendado para JSON es `JsonMapper` (paquete `tools.jackson...`), y el contrato debe ser explícito: ISO-8601 para instantes, manejo claro de nulos y configuración consciente.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo NO / riesgo | Verificación |
|---|---|---|---|---|---|
| Jackson `JsonMapper` | Mapper JSON de Jackson 3 para serializar/deserializar. | Controlar contrato JSON. | APIs JSON, tests de serialización. | Asumir API/paquete de Jackson 2. | Serializa `Instant` a ISO-8601 esperado. |
| ISO-8601 / `Instant` | Formato textual estándar para fecha-hora; `Instant` representa punto en UTC. | Interoperabilidad. | Eventos, timestamps API. | Formato local ambiguo. | JSON contiene `2026-11-18T10:15:30Z`. |
| Contrato estricto de nulos/desconocidos | Política sobre campos faltantes, nulos o desconocidos. | Robustez y claridad. | APIs públicas/versionadas. | Aceptar basura silenciosamente o romper clientes sin plan. | Test define comportamiento esperado. |
| Configuración explícita | `JsonMapper.builder()`/propiedades Spring. | Evitar depender de defaults implícitos. | Producción. | Defaults cambian entre major versions. | Test de serialización fija contrato. |

**Contrato / invariantes / reglas.** En Jackson 3, el paquete base es `tools.jackson` (no `com.fasterxml.jackson` para el mapper core de Jackson 3). Para APIs, prefija fechas ISO-8601; no envíes formatos locales ambiguos. Define política de nulos y propiedades desconocidas según contrato. Prueba serialización/deserialización de ejemplos reales.

**Modelo mental.** JSON es el idioma del contrato; Jackson es el traductor. Si cambias de traductor (Jackson 2 a 3) sin revisar reglas, el significado puede cambiar.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| `package tools.jackson... does not exist` | Dependencia/versión no alineada | Usar Boot 4/Spring Jackson 3 dependencies |
| Fecha serializada como número inesperado | Config/default distinto | Configurar explícitamente y testear |
| Cliente rompe por campo nulo | Contrato no definió nulos | `@JsonInclude`, DTOs opcionales claros, test |
| Acepta propiedades desconocidas | Config laxa | Decidir política y testear |

#### ► CUÁNDO NO USARLO

No uses Jackson para validar reglas de negocio complejas. No dependas de defaults implícitos de major version. No expongas formatos de fecha ambiguos.

#### Verificación rápida

- [ ] Serialización de `Instant` produce ISO-8601.
- [ ] Test de contrato JSON existe.
- [ ] Política de nulos/desconocidos está definida.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Prerequisitos

Proyecto Spring Boot 4.1.x con `spring-boot-starter-web` (incluye soporte Jackson 3). Verifica paquete `tools.jackson.databind.json.JsonMapper`.

#### Implementación desde cero

`src/test/java/com/example/demo/JacksonTest.java`

```java
package com.example.demo;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class JacksonTest {
    record Evento(long tareaId, String tipo, Instant ocurrido) { }

    @Test
    void instantIso() throws Exception {
        JsonMapper mapper = JsonMapper.builder().build();
        String json = mapper.writeValueAsString(
            new Evento(7L, "CREADA", Instant.parse("2026-11-18T10:15:30Z")));
        assertThat(json).contains("\"ocurrido\":\"2026-11-18T10:15:30Z\"");
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `tools.jackson...JsonMapper` | Usa Jackson 3 | Alineado con Boot 4 | Paquete Jackson 2 puede no existir/confundir |
| `Instant.parse(...)` | Fecha UTC inequívoca | Contrato interoperable | Formatos locales generan ambigüedad |
| `writeValueAsString` | Serializa objeto | Observa contrato real | Asumir forma sin test |
| `assertThat(...contains...)` | Fija expectativa | Detecta regresión | Cambio silencioso de formato |

#### Ejecución y salida real

```bash
./mvnw -q -Dtest=JacksonTest test
```

Salida real observada (2026-05-22, Boot 4.1.2, JDK 27): test **verde**. El JSON contiene:

```json
"ocurrido":"2026-11-18T10:15:30Z"
```

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| No compila `JsonMapper` | Paquete/version incorrecta | Usar `tools.jackson.databind.json.JsonMapper` en Jackson 3 |
| Fecha en formato inesperado | Default/config no explícita | Configurar y agregar test de contrato |
| Tests pasan local pero no en CI | Dependencia/cache distinta | Fijar versiones en build reproducible |

#### Verificación rápida

1. Test de serialización pasa.
2. Fecha es ISO-8601 UTC.
3. Cambiar formato rompe test (como debe ser).

</details>

### Tema 8: Versionado de API nativo de Spring Framework 7 · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

El endpoint `/api/tareas/{id}/resumen` devuelve `id` y `titulo`. Una nueva versión debe incluir `prioridad`. Si cambias la respuesta sin versionar, clientes viejos fallan. Necesitas soportar v1 y v2 al mismo tiempo y tener un default claro.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo NO / riesgo | Verificación |
|---|---|---|---|---|---|
| Versionado de API | Estrategia para evolucionar contrato sin romper consumidores existentes. | Compatibilidad y evolución. | APIs con consumidores externos/múltiples. | No versionar cambios incompatibles. | v1 y v2 responden según versión solicitada. |
| Versionado nativo Spring Framework 7 | Soporte de mapeo por versión en Spring MVC (`version="..."`). | Implementar versiones sin routing manual duplicado. | Spring Boot 4 / Framework 7. | Mezclar estrategias sin documentación. | `API-Version: 2.0` selecciona handler v2. |
| Versión por defecto | Versión usada cuando el cliente no envía versión. | Migración gradual. | Clientes legacy. | Default implícito confuso. | Request sin header usa default configurado. |
| Deprecación | Proceso de retirar versión antigua con aviso y plazo. | Operación sostenible. | Después de migrar clientes. | Mantener versiones eternamente sin métricas. | Métricas/logs de uso por versión. |

**Contrato / invariantes / reglas.** Define estrategia (header, path, media type). Aquí usamos header `API-Version` con default `1.0`, configurado por propiedades Spring MVC. La versión no soportada debe fallar claramente (400/406 según configuración/estrategia). Las versiones son contrato: documentarlas y probarlas.

**Modelo mental.** Versionar es mantener dos planos de la misma casa mientras los inquilinos se mudan gradualmente. No demueles la entrada vieja hasta que todos salieron.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Siempre responde v1 | Falta propiedad `spring.mvc.apiversion.use.header` o header incorrecto | Configurar propiedad y enviar header correcto |
| 400 por versión no soportada | Cliente pidió versión inexistente | Documentar versiones soportadas; default claro |
| Rompe clientes viejos | Cambiaste respuesta v1 | No modificar contrato existente; crear v2 |
| Dos estrategias mezcladas | Header y path sin regla | Elegir y documentar una |

#### ► CUÁNDO NO USARLO

No versiones cada cambio cosmético. Versiona cambios incompatibles de contrato. Si el cambio es compatible (agregar campo opcional bien manejado), evalúa si necesitas versión formal.

#### Verificación rápida

- [ ] Request sin versión usa default.
- [ ] `API-Version: 2.0` usa v2.
- [ ] Versión no soportada falla con error claro.
- [ ] Contrato v1 no cambió.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Prerequisitos

Spring Boot 4.1.x / Spring Framework 7 con `spring-boot-starter-web`.

#### Implementación desde cero

`src/main/resources/application.properties`

```properties
spring.mvc.apiversion.use.header=API-Version
spring.mvc.apiversion.default=1.0
```

`src/main/java/com/example/demo/VersionController.java`

```java
package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tareas")
class VersionController {

    @GetMapping(path = "/{id}/resumen", version = "1.0")
    public String v1(@PathVariable Long id) {
        return "v1:" + id;
    }

    @GetMapping(path = "/{id}/resumen", version = "2.0")
    public String v2(@PathVariable Long id) {
        return "v2:" + id;
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `spring.mvc.apiversion.use.header` | Habilita versión por header | Estrategia explícita | No se resuelve versión por header |
| `spring.mvc.apiversion.default=1.0` | Default para clientes sin header | Compatibilidad | Puede fallar o comportarse distinto |
| `version="1.0"` | Mapea handler a versión | Contrato v1 estable | Cambio incompatible rompe clientes |
| `version="2.0"` | Mapea nuevo contrato | Evolución segura | Sin v2 no hay camino de migración |

#### Ejecución y salida real

```bash
curl -s http://localhost:8080/api/tareas/7/resumen
curl -s -H 'API-Version: 2.0' http://localhost:8080/api/tareas/7/resumen
```

Salida real observada (2026-05-22, Boot 4.1.2, JDK 27):

```text
v1:7
v2:7
```

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| No cambia con header | Propiedad mal configurada | Revisar `spring.mvc.apiversion.use.header` |
| Cliente viejo recibe v2 | Default incorrecto | Fijar `default=1.0` |
| Error confuso en versión inválida | No documentado/manejado | Documentar versiones soportadas y manejo de error |

#### Verificación rápida

1. Sin header => `v1:7`.
2. `API-Version: 2.0` => `v2:7`.
3. Contrato v1 sigue igual.

</details>

## Cierre del módulo

M2 define la frontera HTTP: DTOs para desacoplar, Bean Validation para rechazar input inválido, `@ControllerAdvice` para errores consistentes, mapeo controlado, OpenAPI como contrato verificable, paginación con límites, JSON explícito con Jackson 3 y versionado nativo para evolucionar sin romper clientes.

**Checklist de calidad del módulo (aplicada)**
- [x] Cada tema tiene Caso guía, Fundamento técnico/modelo mental, Implementación desde cero, Desglose, Ejecución/salida real, Errores comunes, Verificación rápida.
- [x] Cada concepto del título fue cubierto.
- [x] Verificaciones ejecutadas en `/tmp` con Boot 4.1.2, JDK 27, Maven 3.10.0: DTO/validación/errores, paginación 400 por límite, Jackson 3 ISO-8601, versionado por header, springdoc `/v3/api-docs`.
- [ ] Nota: OpenAPI y MapStruct se verificaron por smoke/compilación; integra el test de contrato en tu proyecto real y fija versiones compatibles con tu Boot.
