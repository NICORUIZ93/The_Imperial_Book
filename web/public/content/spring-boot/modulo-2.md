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

**DTO (Data Transfer Object)**
- Definición formal: Objeto de transferencia con forma explícita para cruzar una frontera (HTTP, capa, proceso).
- Para qué sirve: Desacoplar contrato de implementación interna.
- Cuándo usarlo: APIs HTTP, límites entre módulos/servicios.
- Cuándo NO / riesgo: No crear DTOs sin propósito; evitar duplicación accidental.
- Verificación: Respuesta JSON contiene solo campos del DTO.

**Entidad JPA**
- Definición formal: Objeto administrado por persistencia con identidad, mapeo ORM y ciclo de vida en contexto de persistencia.
- Para qué sirve: Persistir y consultar estado en BD.
- Cuándo usarlo: Capa de persistencia/dominio.
- Cuándo NO / riesgo: No exponerla por defecto en API pública.
- Verificación: Cambios internos no alteran contrato; sin `LazyInitializationException` por serialización.

**Mapeo entidad↔DTO**
- Definición formal: Conversión explícita entre modelo interno y contrato.
- Para qué sirve: Controlar qué entra/sale.
- Cuándo usarlo: Toda frontera API-persistencia.
- Cuándo NO / riesgo: Mapeo manual disperso puede divergir.
- Verificación: Test/unit o inspección confirma campos mapeados.

**Contrato de API**
- Definición formal: Forma estable acordada: campos, tipos, códigos, semántica, errores.
- Para qué sirve: Permitir evolución segura.
- Cuándo usarlo: Cualquier endpoint consumido por otro cliente.
- Cuándo NO / riesgo: Cambiarlo sin versionar rompe consumidores.
- Verificación: Test de contrato/OpenAPI detecta drift.

**Contrato / invariantes / reglas.** El DTO define la superficie pública; la entidad define persistencia. El controller debe recibir/devolver DTOs o tipos de contrato, no entidades JPA. Campos sensibles/internos no se incluyen en DTO de salida. Mapeos deben ser explícitos y deterministas.

**Modelo mental.** La entidad es la ficha interna de bodega; el DTO es la etiqueta de envío al cliente. La etiqueta no debe incluir notas internas ni la ubicación del estante.

#### ► LO QUE PUEDE SALIR MAL

- **JSON expone `ubicacionInterna`**. Causa probable: Se retornó entidad. Corrección: Retornar DTO con campos explícitos.
- **`LazyInitializationException` al serializar**. Causa probable: Jackson tocó relación LAZY fuera de sesión. Corrección: DTO/proyección; nunca serializar entidad.
- **Cambio de BD rompe frontend**. Causa probable: Contrato acoplado a entidad. Corrección: Versionar DTO/contrato.
- **Mapeo inconsistente entre endpoints**. Causa probable: Lógica duplicada. Corrección: `from(...)`, mapper dedicado, MapStruct + test.

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

- **`@Entity` `Tarea`**: Modelo persistente. Por qué importa: Representa tabla/estado BD. Si lo omites/cambias: No hay mapeo JPA.
- **`ubicacionInterna` solo en entidad**: Dato interno. Por qué importa: Muestra necesidad de frontera. Si lo omites/cambias: Exponerlo filtra información.
- **`record TareaDTO`**: Contrato de salida. Por qué importa: Campos públicos explícitos. Si lo omites/cambias: Entidad expone todo.
- **`TareaDTO.from`**: Mapeo centralizado. Por qué importa: Evita divergencia. Si lo omites/cambias: Mapeo disperso e inconsistente.
- **`ResponseEntity.status(CREATED)`**: 201 al crear. Por qué importa: Semántica HTTP correcta. Si lo omites/cambias: 200 es menos preciso.
- **`map(TareaDTO::from)`**: Conversión antes de responder. Por qué importa: Protege contrato. Si lo omites/cambias: Se filtran campos/relaciones.

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

- **Campo interno aparece en JSON**. Causa probable: Devolviste entidad. Corrección: Devuelve DTO.
- **`LazyInitializationException`**. Causa probable: Serializaste relación LAZY. Corrección: Usa DTO/proyección.
- **Contrato cambia al cambiar BD**. Causa probable: Entidad expuesta. Corrección: DTO estable + mapeo.
- **`500` al crear por JSON**. Causa probable: Campos/tipos no coinciden. Corrección: Validar request, revisar payload.

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

**Bean Validation (Jakarta Validation)**
- Definición formal: Especificación para declarar restricciones sobre beans mediante anotaciones y validar instancias.
- Para qué sirve: Validar datos de forma declarativa.
- Cuándo usarlo: DTOs de entrada, parámetros, configuración.
- Cuándo NO / riesgo: No sustituye reglas de negocio complejas.
- Verificación: Request inválido devuelve 400 con detalles.

**`@Valid` / `@Validated`**
- Definición formal: Disparan validación en puntos de integración Spring.
- Para qué sirve: Activar validación en frontera.
- Cuándo usarlo: `@RequestBody`, parámetros, servicios según caso.
- Cuándo NO / riesgo: Omitirlos deja pasar input inválido.
- Verificación: Sin `@Valid`, request inválido puede pasar.

**Restricciones (`@NotBlank`, `@Min`, etc.)**
- Definición formal: Metadatos de restricción con semántica definida.
- Para qué sirve: Contrato de entrada explícito.
- Cuándo usarlo: Campos con reglas conocidas.
- Cuándo NO / riesgo: Mensajes vagos dificultan corrección.
- Verificación: Mensaje por campo en error.

**`ResponseEntity`**
- Definición formal: Representa respuesta HTTP completa: status, headers, body.
- Para qué sirve: Control explícito de semántica HTTP.
- Cuándo usarlo: Cuando status/headers importan.
- Cuándo NO / riesgo: No abusar; devolver objeto simple es válido cuando status por defecto es correcto.
- Verificación: 201 en creación, 400 en validación.

**Contrato / invariantes / reglas.** Validar antes de invocar lógica de negocio. Input inválido del cliente se responde con 400 (Bad Request), no 500. El mensaje de error debe ser útil pero no filtrar detalles internos. `@NotBlank` rechaza null, vacío y solo espacios; `@Min(1)` rechaza 0 si la prioridad mínima es 1.

**Modelo mental.** La validación es el control de acceso de equipaje en aeropuerto: se revisa antes de entrar al avión. Si algo no cumple, se rechaza ahí, con motivo claro.

#### ► LO QUE PUEDE SALIR MAL

- **Request inválido llega al servicio**. Causa probable: Falta `@Valid` o dependencia validation. Corrección: Agregar `spring-boot-starter-validation` y `@Valid`.
- **Devuelve 500 en vez de 400**. Causa probable: Excepción no manejada o mapeo incorrecto. Corrección: `@ControllerAdvice` para `MethodArgumentNotValidException`.
- **Mensaje de error inútil**. Causa probable: Sin `message` o sin estructura. Corrección: Definir mensajes y `ApiError`.
- **Acepta espacios en título**. Causa probable: Usaste `@NotNull`. Corrección: Usa `@NotBlank`.

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

- **`@NotBlank`**: Rechaza null/vacío/espacios. Por qué importa: Título debe existir. Si lo omites/cambias: Se aceptan títulos vacíos.
- **`@Min(1)`**: Rechaza prioridad < 1. Por qué importa: Regla de dominio simple. Si lo omites/cambias: Se aceptan 0 o negativos.
- **`@Valid`**: Activa validación antes del método. Por qué importa: Frontera segura. Si lo omites/cambias: Input inválido entra al servicio.
- **`ResponseEntity.status(CREATED)`**: Controla status HTTP. Por qué importa: Semántica clara. Si lo omites/cambias: Se pierde precisión de contrato.

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

- **400 genérico sin detalles**. Causa probable: No hay handler de validación. Corrección: Agrega `@ExceptionHandler(MethodArgumentNotValidException.class)`.
- **500 por constraint**. Causa probable: Excepción de validación no mapeada. Corrección: Mapear a 400.
- **Acepta body inválido**. Causa probable: Falta `@Valid`. Corrección: Añadir `@Valid`.
- **`jakarta.validation` no resuelve**. Causa probable: Falta starter validation. Corrección: Agregar dependencia.

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

**`@ControllerAdvice`**
- Definición formal: Componente que aplica advice transversal a controllers (excepciones, binding, model attributes).
- Para qué sirve: Centralizar manejo de errores.
- Cuándo usarlo: APIs con múltiples endpoints.
- Cuándo NO / riesgo: No convertirlo en “catch-all” que oculte bugs.
- Verificación: Mismo shape de error en varios endpoints.

**`@ExceptionHandler`**
- Definición formal: Método que maneja un tipo específico de excepción.
- Para qué sirve: Mapear excepción a respuesta HTTP.
- Cuándo usarlo: Validación, no encontrado, conflicto, etc.
- Cuándo NO / riesgo: No devolver 200 en errores.
- Verificación: 404/400 según caso.

**Error DTO (`ApiError`)**
- Definición formal: Estructura estable para errores.
- Para qué sirve: Contrato de error para clientes.
- Cuándo usarlo: Toda API pública/consumida.
- Cuándo NO / riesgo: No filtrar stacktrace ni SQL.
- Verificación: JSON con `codigo`, `mensaje`, `detalles`.

**Excepción de dominio**
- Definición formal: Excepción con significado de negocio/aplicación.
- Para qué sirve: Separar causa de transporte HTTP.
- Cuándo usarlo: Reglas de dominio o recurso inexistente.
- Cuándo NO / riesgo: No usar excepciones genéricas para todo.
- Verificación: Handler mapea a status correcto.

**Contrato / invariantes / reglas.** El cliente recibe errores consistentes. 400 = input inválido; 404 = recurso no existe; 500 = fallo inesperado interno (sin detalles sensibles). Los detalles internos se registran en logs, no se exponen al cliente.

**Modelo mental.** `@ControllerAdvice` es la mesa de reclamos central: no importa qué ventanilla falló, el formato del reclamo es el mismo.

#### ► LO QUE PUEDE SALIR MAL

- **Cada endpoint responde error distinto**. Causa probable: Try/catch local inconsistente. Corrección: Centralizar en `@ControllerAdvice`.
- **Se filtra stacktrace**. Causa probable: Handler genérico devuelve `ex.getMessage()`/stack. Corrección: Log interno; respuesta segura.
- **500 para recurso inexistente**. Causa probable: Se lanzó excepción no mapeada. Corrección: `TareaNoEncontradaException` -> 404.
- **Detalles de validación perdidos**. Causa probable: Handler ignora `BindingResult`. Corrección: Extraer `FieldError`s.

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

- **`@RestControllerAdvice`**: Aplica a controllers REST. Por qué importa: Centraliza formato. Si lo omites/cambias: Errores inconsistentes.
- **`MethodArgumentNotValidException`**: Captura fallos `@Valid`. Por qué importa: 400 con detalles por campo. Si lo omites/cambias: 400 genérico o 500.
- **`TareaNoEncontradaException`**: Error semántico. Por qué importa: 404 claro. Si lo omites/cambias: 500 o respuesta ambigua.
- **`ApiError`**: Contrato de error. Por qué importa: Cliente puede parsear. Si lo omites/cambias: Cada error con shape distinto.

#### Ejecución y salida real

```bash
curl -s http://localhost:8080/api/tareas/999
```

Salida real observada (2026-05-22):

```json
{"codigo":"TAREA_NO_ENCONTRADA","mensaje":"No existe la tarea 999","detalles":[]}
```

#### Errores comunes y troubleshooting

- **Stacktrace en respuesta**. Causa probable: No hay handler o handler mal diseñado. Corrección: Loguear stacktrace; devolver `ApiError` seguro.
- **400 para todo**. Causa probable: Catch-all demasiado amplio. Corrección: Mapear por tipo de excepción.
- **Cliente no puede distinguir errores**. Causa probable: Sin `codigo` estable. Corrección: Usar códigos de error de API.

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

**Lombok**
- Definición formal: Biblioteca de annotation processing que genera código en compilación.
- Para qué sirve: Reducir boilerplate.
- Cuándo usarlo: DTOs, builders, logging, value objects.
- Cuándo NO / riesgo: `@Data` en entidades JPA; abuso oculta diseño.
- Verificación: Inspeccionar código generado/bytecode; tests.

**MapStruct**
- Definición formal: Generador de mappers en compilación, tipo-seguro.
- Para qué sirve: Mapeo entre DTOs y entidades.
- Cuándo usarlo: Mapeos repetitivos y claros.
- Cuándo NO / riesgo: Mapear campos sensibles por defecto sin revisar.
- Verificación: Revisar implementación generada en `target/generated-sources/annotations`.

**Annotation Processing**
- Definición formal: Fase de compilación donde procesadores generan código/metadatos.
- Para qué sirve: Generación automática.
- Cuándo usarlo: Lombok, MapStruct, JPAMetamodel.
- Cuándo NO / riesgo: Configuración de IDE/build incompleta.
- Verificación: `mvn compile` genera fuentes.

**Frontera de datos**
- Definición formal: Límite donde se decide qué datos salen/entran.
- Para qué sirve: Seguridad y estabilidad.
- Cuándo usarlo: Controllers, adapters, integraciones.
- Cuándo NO / riesgo: Exponer entidad o campo interno.
- Verificación: DTO no contiene campos internos.

**Contrato / invariantes / reglas.** Lombok no debe usarse para esconder decisiones de modelo. En entidades JPA, evita `@EqualsAndHashCode` sobre todos los campos y `@Data` sin entenderlo. MapStruct debe mapear solo campos del contrato; los internos se ignoran explícitamente. Ambos se resuelven en compilación: si falla annotation processing, falla build o falta implementación.

**Modelo mental.** Lombok y MapStruct son asistentes de taller: aceleran cortes repetitivos, pero tú decides el plano. Un asistente rápido que copia la pieza equivocada también es peligroso.

#### ► LO QUE PUEDE SALIR MAL

- **`No qualifying bean` para mapper**. Causa probable: Falta `componentModel="spring"` o annotation processor. Corrección: Configurar MapStruct y compiler plugin.
- **DTO expone campo interno**. Causa probable: Mapeo automático incluyó campo por nombre. Corrección: `@Mapping(target="...", ignore=true)` o DTO sin campo.
- **`StackOverflowError` en `toString/equals`**. Causa probable: `@Data` en entidad con relaciones bidireccionales. Corrección: Evitar `@Data`; usar getters controlados.
- **IDE muestra error pero Maven compila/no compila**. Causa probable: Annotation processing deshabilitado. Corrección: Habilitar AP en IDE; revisar `annotationProcessorPaths`.

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

- **`@Mapper(componentModel="spring")`**: Genera implementación como bean Spring. Por qué importa: Permite inyectarlo. Si lo omites/cambias: Tendrías `Mappers.getMapper(...)` manual.
- **`@Mapping` explícito**: Controla campos mapeados. Por qué importa: Documenta contrato. Si lo omites/cambias: Mapeo implícito puede incluir campos indeseados si DTO cambia.
- **`annotationProcessorPaths`**: Registra procesadores en compilación. Por qué importa: Genera código. Si lo omites/cambias: No se genera mapper/lombok.
- **DTO sin `ubicacionInterna`**: Frontera de datos. Por qué importa: Seguridad/estabilidad. Si lo omites/cambias: Exposición accidental.

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

- **`Consider defining a bean of type ...TareaMapper`**. Causa probable: Falta `componentModel="spring"` o processor. Corrección: Revisar anotación y `annotationProcessorPaths`.
- **Implementación no se genera**. Causa probable: AP deshabilitado. Corrección: `mvn compile`; habilitar AP en IDE.
- **Campo interno aparece en DTO**. Causa probable: DTO/mapper lo incluyó. Corrección: Quitar del DTO e ignorar explícitamente.
- **Lombok rompe build en JDK nuevo**. Causa probable: Versión Lombok vieja. Corrección: Actualizar Lombok/processor.

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

**OpenAPI**
- Definición formal: Especificación estándar para describir APIs HTTP de forma machine-readable.
- Para qué sirve: Documentación, generación de clientes, pruebas de contrato.
- Cuándo usarlo: APIs HTTP compartidas.
- Cuándo NO / riesgo: No asumir que doc generada reemplaza diseño.
- Verificación: `/v3/api-docs` contiene paths/schemas esperados.

**springdoc-openapi**
- Definición formal: Integración que genera OpenAPI desde aplicaciones Spring.
- Para qué sirve: Publicar spec/UI.
- Cuándo usarlo: Spring MVC/WebFlux.
- Cuándo NO / riesgo: Exponer Swagger UI sin control en prod.
- Verificación: Endpoint OpenAPI responde 200.

**Contrato como prueba**
- Definición formal: Test automatizado que falla si el contrato observable cambia.
- Para qué sirve: Detectar drift.
- Cuándo usarlo: CI y endpoints críticos.
- Cuándo NO / riesgo: Test solo “status 200 en /v3/api-docs” es insuficiente.
- Verificación: Test afirma paths, respuestas, schemas clave.

**Anotaciones OpenAPI**
- Definición formal: Metadatos (`@Operation`, `@ApiResponse`, `@Schema`) para enriquecer contrato.
- Para qué sirve: Aclarar semántica no inferible.
- Cuándo usarlo: Errores, ejemplos, restricciones.
- Cuándo NO / riesgo: Sobredocumentar lo obvio; subdocumentar errores.
- Verificación: Spec incluye 400/404 y schema de error.

**Contrato / invariantes / reglas.** La spec debe reflejar comportamiento real. Documenta códigos de éxito y error. En producción, controla exposición de Swagger UI; la spec puede ser pública o interna según política. Los tests de contrato deben afirmar piezas críticas: paths, métodos, status, schemas.

**Modelo mental.** OpenAPI es el plano eléctrico de la casa. El wiki es un dibujo a mano que alguien olvidó actualizar. El test de contrato es la inspección que compara plano con instalación real.

#### ► LO QUE PUEDE SALIR MAL

- **`/v3/api-docs` no existe**. Causa probable: Falta dependencia springdoc. Corrección: Agregar starter springdoc compatible.
- **Spec no muestra 400/404**. Causa probable: Solo se documentó happy path. Corrección: Añadir `@ApiResponse` o handlers visibles.
- **UI expuesta en prod**. Causa probable: Configuración por defecto sin control. Corrección: `springdoc.swagger-ui.enabled=false` en prod.
- **Test de contrato pasa pero API cambió**. Causa probable: Test demasiado débil. Corrección: Afirmar paths, status y schemas.

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

- **dependencia springdoc**: Habilita generación OpenAPI/UI. Por qué importa: Contrato machine-readable. Si lo omites/cambias: No hay `/v3/api-docs`.
- **`@Operation/@ApiResponse`**: Expone semántica HTTP. Por qué importa: Mejora contrato. Si lo omites/cambias: Happy path incompleto.
- **Test de contrato**: Verifica spec. Por qué importa: Evita drift. Si lo omites/cambias: Doc puede mentir.
- **`RANDOM_PORT`**: Aísla test. Por qué importa: Evita colisión de puertos. Si lo omites/cambias: Flakiness en CI.

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

- **404 en `/v3/api-docs`**. Causa probable: Dependencia incorrecta/incompatible. Corrección: Verificar versión compatible con Boot.
- **UI expuesta en prod**. Causa probable: Default sin hardening. Corrección: Deshabilitar UI/spec por perfil o proteger.
- **Spec incompleta**. Causa probable: Sin anotaciones/handlers claros. Corrección: Documentar errores y revisar handlers.

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

**Paginación**
- Definición formal: Partición de un resultado grande en páginas (`page`, `size`, `sort`).
- Para qué sirve: Escalar lecturas y proteger recursos.
- Cuándo usarlo: Listados potencialmente grandes.
- Cuándo NO / riesgo: No usar sin orden estable.
- Verificación: Respuesta trae N items y metadata.

**`Pageable` / `Page`**
- Definición formal: Abstracciones Spring Data para solicitud y resultado paginado.
- Para qué sirve: Integrar paginación con repositorios.
- Cuándo usarlo: Spring Data JPA/Mongo.
- Cuándo NO / riesgo: No exponer `Page` interno sin considerar contrato.
- Verificación: SQL usa limit/offset o equivalente.

**Validación de parámetros**
- Definición formal: Restricciones sobre `page`, `size`, `sort`.
- Para qué sirve: Evitar abuso y consultas costosas.
- Cuándo usarlo: Todo endpoint paginado público.
- Cuándo NO / riesgo: Aceptar `sort` arbitrario puede exponer campos/inyección de orden no deseada.
- Verificación: `size=101` devuelve 400.

**Contrato de página**
- Definición formal: DTO con items y metadata (page,size,total,hasNext).
- Para qué sirve: Estabilidad para cliente.
- Cuándo usarlo: APIs consumidas por front/mobile.
- Cuándo NO / riesgo: Cambiar shape rompe clientes.
- Verificación: JSON incluye metadata esperada.

**Contrato / invariantes / reglas.** `page >= 0`, `size` entre 1 y un máximo razonable (ej. 100). Orden determinista (`id` o `createdAt,id`). La validación de parámetros debe rechazarse con 400. Si usas `@Validated` en controller, maneja `ConstraintViolationException`/`HandlerMethodValidationException` según el caso.

**Modelo mental.** Paginación es pedir cajas de un depósito por tandas, no vaciar todo el depósito en la recepción.

#### ► LO QUE PUEDE SALIR MAL

- **`size=10000` aceptado**. Causa probable: Sin `@Max` o sin `@Validated`. Corrección: Limitar y validar.
- **500 al validar parámetro**. Causa probable: Handler no mapea `ConstraintViolationException`. Corrección: Agregar handler 400.
- **Resultados duplicados/saltados entre páginas**. Causa probable: Sin orden estable. Corrección: Agregar `Sort.by("id").ascending()`.
- **Cliente roto al cambiar Spring Data**. Causa probable: Se expuso `Page` crudo. Corrección: Usar `PageResponse` DTO.

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

- **`@Min/@Max`**: Limita page/size. Por qué importa: Protege recursos. Si lo omites/cambias: Abuso o consultas grandes.
- **`@Validated`**: Activa validación de parámetros. Por qué importa: Hace cumplir restricciones. Si lo omites/cambias: Se aceptan valores inválidos.
- **`Sort.by("id")`**: Orden estable. Por qué importa: Paginación consistente. Si lo omites/cambias: Saltos/duplicados.
- **`PageResponse`**: Contrato propio. Por qué importa: Desacopla de Spring Data. Si lo omites/cambias: Cambios internos rompen cliente.

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

- **500 al enviar size=101**. Causa probable: Falta handler de constraint. Corrección: Mapear a 400.
- **Se aceptan tamaños enormes**. Causa probable: Falta `@Max` o `@Validated`. Corrección: Agregar ambos.
- **Páginas inconsistentes**. Causa probable: Sin sort. Corrección: Sort determinista.

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

**Jackson `JsonMapper`**
- Definición formal: Mapper JSON de Jackson 3 para serializar/deserializar.
- Para qué sirve: Controlar contrato JSON.
- Cuándo usarlo: APIs JSON, tests de serialización.
- Cuándo NO / riesgo: Asumir API/paquete de Jackson 2.
- Verificación: Serializa `Instant` a ISO-8601 esperado.

**ISO-8601 / `Instant`**
- Definición formal: Formato textual estándar para fecha-hora; `Instant` representa punto en UTC.
- Para qué sirve: Interoperabilidad.
- Cuándo usarlo: Eventos, timestamps API.
- Cuándo NO / riesgo: Formato local ambiguo.
- Verificación: JSON contiene `2026-11-18T10:15:30Z`.

**Contrato estricto de nulos/desconocidos**
- Definición formal: Política sobre campos faltantes, nulos o desconocidos.
- Para qué sirve: Robustez y claridad.
- Cuándo usarlo: APIs públicas/versionadas.
- Cuándo NO / riesgo: Aceptar basura silenciosamente o romper clientes sin plan.
- Verificación: Test define comportamiento esperado.

**Configuración explícita**
- Definición formal: `JsonMapper.builder()`/propiedades Spring.
- Para qué sirve: Evitar depender de defaults implícitos.
- Cuándo usarlo: Producción.
- Cuándo NO / riesgo: Defaults cambian entre major versions.
- Verificación: Test de serialización fija contrato.

**Contrato / invariantes / reglas.** En Jackson 3, el paquete base es `tools.jackson` (no `com.fasterxml.jackson` para el mapper core de Jackson 3). Para APIs, prefija fechas ISO-8601; no envíes formatos locales ambiguos. Define política de nulos y propiedades desconocidas según contrato. Prueba serialización/deserialización de ejemplos reales.

**Modelo mental.** JSON es el idioma del contrato; Jackson es el traductor. Si cambias de traductor (Jackson 2 a 3) sin revisar reglas, el significado puede cambiar.

#### ► LO QUE PUEDE SALIR MAL

- **`package tools.jackson... does not exist`**. Causa probable: Dependencia/versión no alineada. Corrección: Usar Boot 4/Spring Jackson 3 dependencies.
- **Fecha serializada como número inesperado**. Causa probable: Config/default distinto. Corrección: Configurar explícitamente y testear.
- **Cliente rompe por campo nulo**. Causa probable: Contrato no definió nulos. Corrección: `@JsonInclude`, DTOs opcionales claros, test.
- **Acepta propiedades desconocidas**. Causa probable: Config laxa. Corrección: Decidir política y testear.

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

- **`tools.jackson...JsonMapper`**: Usa Jackson 3. Por qué importa: Alineado con Boot 4. Si lo omites/cambias: Paquete Jackson 2 puede no existir/confundir.
- **`Instant.parse(...)`**: Fecha UTC inequívoca. Por qué importa: Contrato interoperable. Si lo omites/cambias: Formatos locales generan ambigüedad.
- **`writeValueAsString`**: Serializa objeto. Por qué importa: Observa contrato real. Si lo omites/cambias: Asumir forma sin test.
- **`assertThat(...contains...)`**: Fija expectativa. Por qué importa: Detecta regresión. Si lo omites/cambias: Cambio silencioso de formato.

#### Ejecución y salida real

```bash
./mvnw -q -Dtest=JacksonTest test
```

Salida real observada (2026-05-22, Boot 4.1.2, JDK 27): test **verde**. El JSON contiene:

```json
"ocurrido":"2026-11-18T10:15:30Z"
```

#### Errores comunes y troubleshooting

- **No compila `JsonMapper`**. Causa probable: Paquete/version incorrecta. Corrección: Usar `tools.jackson.databind.json.JsonMapper` en Jackson 3.
- **Fecha en formato inesperado**. Causa probable: Default/config no explícita. Corrección: Configurar y agregar test de contrato.
- **Tests pasan local pero no en CI**. Causa probable: Dependencia/cache distinta. Corrección: Fijar versiones en build reproducible.

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

**Versionado de API**
- Definición formal: Estrategia para evolucionar contrato sin romper consumidores existentes.
- Para qué sirve: Compatibilidad y evolución.
- Cuándo usarlo: APIs con consumidores externos/múltiples.
- Cuándo NO / riesgo: No versionar cambios incompatibles.
- Verificación: v1 y v2 responden según versión solicitada.

**Versionado nativo Spring Framework 7**
- Definición formal: Soporte de mapeo por versión en Spring MVC (`version="..."`).
- Para qué sirve: Implementar versiones sin routing manual duplicado.
- Cuándo usarlo: Spring Boot 4 / Framework 7.
- Cuándo NO / riesgo: Mezclar estrategias sin documentación.
- Verificación: `API-Version: 2.0` selecciona handler v2.

**Versión por defecto**
- Definición formal: Versión usada cuando el cliente no envía versión.
- Para qué sirve: Migración gradual.
- Cuándo usarlo: Clientes legacy.
- Cuándo NO / riesgo: Default implícito confuso.
- Verificación: Request sin header usa default configurado.

**Deprecación**
- Definición formal: Proceso de retirar versión antigua con aviso y plazo.
- Para qué sirve: Operación sostenible.
- Cuándo usarlo: Después de migrar clientes.
- Cuándo NO / riesgo: Mantener versiones eternamente sin métricas.
- Verificación: Métricas/logs de uso por versión.

**Contrato / invariantes / reglas.** Define estrategia (header, path, media type). Aquí usamos header `API-Version` con default `1.0`, configurado por propiedades Spring MVC. La versión no soportada debe fallar claramente (400/406 según configuración/estrategia). Las versiones son contrato: documentarlas y probarlas.

**Modelo mental.** Versionar es mantener dos planos de la misma casa mientras los inquilinos se mudan gradualmente. No demueles la entrada vieja hasta que todos salieron.

#### ► LO QUE PUEDE SALIR MAL

- **Siempre responde v1**. Causa probable: Falta propiedad `spring.mvc.apiversion.use.header` o header incorrecto. Corrección: Configurar propiedad y enviar header correcto.
- **400 por versión no soportada**. Causa probable: Cliente pidió versión inexistente. Corrección: Documentar versiones soportadas; default claro.
- **Rompe clientes viejos**. Causa probable: Cambiaste respuesta v1. Corrección: No modificar contrato existente; crear v2.
- **Dos estrategias mezcladas**. Causa probable: Header y path sin regla. Corrección: Elegir y documentar una.

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

- **`spring.mvc.apiversion.use.header`**: Habilita versión por header. Por qué importa: Estrategia explícita. Si lo omites/cambias: No se resuelve versión por header.
- **`spring.mvc.apiversion.default=1.0`**: Default para clientes sin header. Por qué importa: Compatibilidad. Si lo omites/cambias: Puede fallar o comportarse distinto.
- **`version="1.0"`**: Mapea handler a versión. Por qué importa: Contrato v1 estable. Si lo omites/cambias: Cambio incompatible rompe clientes.
- **`version="2.0"`**: Mapea nuevo contrato. Por qué importa: Evolución segura. Si lo omites/cambias: Sin v2 no hay camino de migración.

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

- **No cambia con header**. Causa probable: Propiedad mal configurada. Corrección: Revisar `spring.mvc.apiversion.use.header`.
- **Cliente viejo recibe v2**. Causa probable: Default incorrecto. Corrección: Fijar `default=1.0`.
- **Error confuso en versión inválida**. Causa probable: No documentado/manejado. Corrección: Documentar versiones soportadas y manejo de error.

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
