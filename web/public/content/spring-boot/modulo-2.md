# Módulo 2: REST APIs con Spring Web

Una API REST no es solo un conjunto de endpoints que devuelven JSON. Es un contrato: define qué datos acepta, qué datos expone, cómo comunica errores y cómo evoluciona sin romper a sus consumidores. En este módulo construimos esa frontera con cuidado. Cada tema parte de un problema concreto y muestra la decisión técnica que lo resuelve, con código desde cero y verificación observable.

**Ruta base de práctica.** Cuando un ejemplo reutiliza el proyecto del módulo anterior, se asume la ruta `~/academia-spring/academia-spring` creada en M0. Para experimentos aislados, cada tema indica cómo crear un proyecto temporal. Los comandos Maven se ejecutan desde la carpeta que contiene `pom.xml`. Antes de cambiar de experimento, detén `spring-boot:run` con `Ctrl+C`.

**Entorno verificado en esta máquina (2026-05-22):**

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

Las pruebas de comportamiento de este módulo se verificaron con proyectos temporales Spring Boot 4.1.2 en `/tmp`, usando JDK 27 y Maven 3.10.0.

## Aprende construyendo

### Tema 1: Por qué DTOs en vez de entidades directamente · Intermedio · 35 min

Supongamos que RutaFlow expone `GET /api/tareas/1`. La implementación más rápida sería devolver directamente la entidad JPA `Tarea`. El problema aparece cuando esa entidad contiene `ubicacionInterna`, un dato operativo que no debe salir de la API, o cuando una relación LAZY intenta serializarse fuera de la sesión de persistencia. Lo que parecía una comodidad se convierte en una fuga de datos, en un acoplamiento innecesario o en un error en tiempo de ejecución.

#### El contrato de la API y el modelo de persistencia

Una entidad JPA es un objeto de persistencia. Su función es representar el estado que se guarda y se consulta en la base de datos, con identidad, mapeo de columnas y ciclo de vida administrado por el contexto de persistencia. Ese modelo responde a necesidades internas: tablas, relaciones, estrategias de carga, auditoría, columnas técnicas.

Un DTO (Data Transfer Object) cumple otra función. Es un objeto diseñado para cruzar una frontera: una respuesta HTTP, una petición, un mensaje o el límite entre módulos. Su forma es explícita y forma parte del contrato. Si el contrato dice que una tarea expone `id`, `titulo` y `prioridad`, eso es lo que debe salir, aunque internamente la entidad tenga más campos.

El mapeo entre entidad y DTO es la traducción entre ambos mundos. Puede hacerse con un método `from(...)`, con un mapper dedicado o con una biblioteca como MapStruct. Lo importante no es la herramienta, sino la regla: la decisión de qué datos salen debe ser visible y controlada. Cuando el controller devuelve la entidad directamente, esa decisión queda implícita y suele ser peligrosa.

También conviene separar DTOs de entrada y de salida cuando sus reglas son distintas. Un `CrearTareaRequest` puede recibir `titulo` y `prioridad`, pero no `id` ni `ubicacionInterna`. La respuesta puede incluir el `id` generado, pero nunca el campo interno. Forzar un mismo objeto para ambos casos suele producir contratos confusos.

#### Ejemplo desde cero

Creamos un proyecto temporal con Spring Initializr:

```bash
mkdir -p /tmp/sb-m2-t1 && cd /tmp/sb-m2-t1
curl -s https://start.spring.io/starter.zip \
  -d type=maven-project -d language=java -d bootVersion=4.1.2 \
  -d baseDir=demo -d groupId=com.example -d artifactId=demo \
  -d name=demo -d packageName=com.example.demo -d packaging=jar \
  -d javaVersion=25 -d dependencies=web,data-jpa,h2 -o demo.zip
unzip -q demo.zip && cd demo
```

Configuramos una base en memoria en `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:h2:mem:demo;DB_CLOSE_DELAY=-1
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=create-drop
```

La entidad contiene un campo interno que no debe exponerse:

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

El DTO de salida define el contrato público. El DTO de entrada define lo que el cliente puede enviar:

```java
package com.example.demo;

public record TareaDTO(Long id, String titulo, int prioridad) {
    static TareaDTO from(Tarea t) {
        return new TareaDTO(t.getId(), t.getTitulo(), t.getPrioridad());
    }
}
```

```java
package com.example.demo;

public record CrearTareaRequest(String titulo, int prioridad) { }
```

El repositorio y el controller usan DTOs en la frontera HTTP:

```java
package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TareaRepository extends JpaRepository<Tarea, Long> { }
```

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

#### Recorrido del código

La entidad `Tarea` tiene cuatro campos, pero el DTO de salida solo expone tres. El campo `ubicacionInterna` existe en la persistencia y puede ser necesario para la operación interna del sistema, pero no forma parte del contrato HTTP. El método `TareaDTO.from(...)` centraliza la conversión y deja explícita la decisión: solo se copian `id`, `titulo` y `prioridad`.

El controller recibe `CrearTareaRequest`, no la entidad. Esto evita que el cliente envíe campos que no debería controlar, como `id` o datos internos. Al crear, el servicio o controller asigna `BODEGA-7` como dato interno; al responder, devuelve un DTO. El cliente nunca ve ese valor.

El endpoint de creación responde con `ResponseEntity.status(HttpStatus.CREATED)`. El código 201 comunica que se creó un recurso. Aunque devolver 200 no rompe la funcionalidad básica, 201 expresa mejor la semántica HTTP.

#### Ejecución y salida real

Desde la carpeta `demo/`:

```bash
./mvnw spring-boot:run
```

En otra terminal:

```bash
curl -s -X POST http://localhost:8080/api/tareas \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"Entregar paquete","prioridad":1}'
curl -s http://localhost:8080/api/tareas
```

Salida real observada en una verificación equivalente con Spring Boot 4.1.2 (2026-05-22, `/tmp`):

```json
{"id":1,"titulo":"Entregar paquete","prioridad":1}
```

La respuesta no incluye `ubicacionInterna` ni el valor `BODEGA-7`. Esa ausencia es la verificación importante: el contrato público quedó separado del modelo interno.

#### Errores frecuentes

Si el JSON expone `ubicacionInterna`, la causa más probable es que el controller devolvió la entidad JPA o que el DTO incluye el campo por error. La corrección es devolver un DTO de salida con campos explícitos y revisar el mapeo.

Si aparece `LazyInitializationException` al serializar una respuesta, suele ocurrir porque Jackson intentó recorrer una relación LAZY después de cerrar la sesión de persistencia. Devolver entidades en la API hace fácil caer en este problema. La corrección es mapear a DTOs o proyecciones que contengan solo los datos necesarios.

Si un cambio de base de datos rompe a los clientes, el contrato estaba acoplado a la persistencia. El DTO actúa como amortiguador: permite cambiar la entidad o la tabla sin cambiar, necesariamente, la forma del JSON.

#### Verificación

La verificación mínima es crear una tarea, listar tareas y confirmar que la respuesta contiene solo `id`, `titulo` y `prioridad`. Puede agregarse una inspección rápida con `curl` y `grep` para asegurar que `BODEGA-7` no aparece en ninguna respuesta HTTP.


### Tema 2: Validación con Bean Validation y ResponseEntity · Intermedio · 35 min

Un cliente envía `{"titulo":"   ","prioridad":0}`. Si el controller acepta ese payload, la capa de negocio o la base de datos recibe datos inválidos y el sistema falla tarde, mal o de forma silenciosa. La validación de entrada debe ocurrir en la frontera HTTP: antes de invocar la lógica de negocio, con una respuesta clara y con el código de estado adecuado.

#### Validar en la frontera

Bean Validation, hoy bajo el espacio de nombres Jakarta Validation, permite declarar restricciones sobre los campos de un objeto mediante anotaciones. `@NotBlank` indica que una cadena no puede ser `null`, vacía ni contener solo espacios. `@Min(1)` indica que un valor numérico debe ser al menos 1. Estas anotaciones no reemplazan todas las reglas de negocio, pero sí expresan con claridad las reglas de forma y rango que se pueden evaluar al recibir la petición.

La anotación `@Valid` es la que activa la validación en un parámetro del controller. Sin `@Valid`, las anotaciones de restricción existen, pero no se ejecutan en ese punto. También es necesario tener en el classpath una implementación de Bean Validation; en Spring Boot, la forma habitual es agregar `spring-boot-starter-validation`.

Cuando una restricción falla, Spring puede lanzar `MethodArgumentNotValidException`. Si no se maneja, la respuesta puede ser genérica o inconsistente. Por eso conviene capturarla y devolver un cuerpo de error estable. El código de estado correcto para una entrada inválida del cliente es 400 Bad Request. No es un error 500: el servidor no falló inesperadamente; recibió datos que no cumplen el contrato.

`ResponseEntity` permite controlar el estado HTTP, las cabeceras y el cuerpo de la respuesta. Es útil cuando el estado importa, como devolver 201 al crear o 400 al validar. No es obligatorio en todos los casos; un método puede devolver directamente un DTO cuando el estado por defecto es suficiente. La regla es usarlo cuando hace explícita la semántica HTTP.

#### Ejemplo desde cero

Se puede partir del proyecto del Tema 1 o generar uno nuevo con:

```bash
curl -s https://start.spring.io/starter.zip \
  -d dependencies=web,validation,data-jpa,h2 -d bootVersion=4.1.2 \
  -d javaVersion=25 -d type=maven-project -d baseDir=demo -o demo.zip
```

En `pom.xml`, la dependencia clave es:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

El request declara sus reglas:

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

El controller activa la validación con `@Valid`:

```java
@PostMapping
public ResponseEntity<TareaDTO> crear(@Valid @RequestBody CrearTareaRequest request) {
    Tarea guardada = repo.save(new Tarea(request.titulo(), request.prioridad(), "BODEGA-7"));
    return ResponseEntity.status(HttpStatus.CREATED).body(TareaDTO.from(guardada));
}
```

Para devolver un error consistente, conviene definir un DTO de error y un handler:

```java
package com.example.demo;

import java.util.List;

public record ApiError(String codigo, String mensaje, List<String> detalles) { }
```

```java
package com.example.demo;

import java.util.List;
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
        return ResponseEntity.badRequest()
            .body(new ApiError("VALIDACION", "Datos inválidos", detalles));
    }
}
```

#### Recorrido del código

`@NotBlank` es más estricto que `@NotNull`. `@NotNull` solo rechaza la ausencia del valor; un título vacío o compuesto por espacios pasaría. `@NotBlank` cubre esos casos, que en la práctica suelen ser datos inválidos.

`@Min(1)` declara una regla de rango. El valor 0 queda rechazado antes de llegar a la lógica de persistencia. El mensaje asociado a cada anotación se vuelve parte del feedback al cliente. No debe ser críptico ni técnico en exceso: tiene que ayudar a corregir la petición.

En el controller, `@Valid` va antes de `@RequestBody`. Esa posición indica que el cuerpo deserializado debe validarse antes de entrar al método. Si la validación falla, Spring lanza la excepción y el método no se ejecuta.

El `@RestControllerAdvice` centraliza el manejo del error. Recorre los `FieldError` y construye una lista de detalles con el nombre del campo y su mensaje. El resultado es un 400 con un cuerpo estable. El orden de los detalles puede variar, por lo que las pruebas deben verificar presencia de campos, no posición exacta.

#### Ejecución y salida real

```bash
curl -i -X POST http://localhost:8080/api/tareas \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"Entregar paquete","prioridad":1}'

curl -i -X POST http://localhost:8080/api/tareas \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"   ","prioridad":0}'
```

Salida real observada (resumen, Spring Boot 4.1.2, 2026-05-22):

```text
HTTP/1.1 201
{"id":1,"titulo":"Entregar paquete","prioridad":1}

HTTP/1.1 400
{"codigo":"VALIDACION","mensaje":"Datos inválidos","detalles":["titulo: Escribe un título.","prioridad: La prioridad mínima es 1."]}
```

#### Errores frecuentes

Si el request inválido llega al servicio, falta `@Valid` o falta la dependencia de validación. La corrección es agregar `spring-boot-starter-validation` y anotar el parámetro.

Si la validación devuelve 500, la excepción no fue mapeada correctamente. `MethodArgumentNotValidException` debe transformarse en 400.

Si el mensaje de error es inútil, el cliente no sabe qué corregir. Los detalles deben mencionar el campo y la regla incumplida, sin exponer información interna del servidor.

#### Verificación

Un payload válido debe devolver 201. Un payload con título vacío o prioridad 0 debe devolver 400. El cuerpo del error debe indicar los campos inválidos. Esta verificación puede automatizarse con MockMvc o con llamadas HTTP reales.


### Tema 3: Manejo centralizado de errores con @ControllerAdvice · Intermedio · 40 min

En una API pequeña, es tentador capturar excepciones dentro de cada controller. El resultado, casi siempre, es una colección de respuestas inconsistentes: un endpoint devuelve HTML de error, otro devuelve un mensaje suelto, otro expone un stacktrace. Para el cliente, eso significa que no puede programar contra un contrato predecible. El manejo de errores debe ser tan consistente como el manejo de respuestas exitosas.

#### Una mesa central para los errores

`@ControllerAdvice` permite definir lógica transversal para controllers. En una API REST, se suele usar su variante `@RestControllerAdvice`, que combina `@ControllerAdvice` con `@ResponseBody`. Dentro de ese componente, los métodos anotados con `@ExceptionHandler` indican cómo transformar una excepción específica en una respuesta HTTP.

La idea central es separar la causa del error de su representación HTTP. El servicio o el repositorio pueden lanzar `TareaNoEncontradaException` cuando no existe un recurso. Esa excepción expresa un hecho del dominio o de la aplicación. El controller advice decide que ese hecho se traduce a 404 Not Found con un cuerpo `ApiError`.

Un DTO de error, como `ApiError`, define el contrato de error. Su estructura debe ser estable: por ejemplo, un código, un mensaje y una lista de detalles. Los clientes pueden depender de ese formato para mostrar mensajes, tomar decisiones o registrar fallos. Lo que no debe incluir es información sensible: stacktraces, SQL, nombres internos de clases de infraestructura o rutas del servidor.

También es importante distinguir tipos de error. Una entrada inválida del cliente es 400. Un recurso inexistente es 404. Un conflicto de negocio puede ser 409. Un fallo inesperado es 500, y en ese caso la respuesta al cliente debe ser genérica mientras el detalle real se registra en logs. Un `catch (Exception)` que convierte todo en 400 oculta errores reales y confunde al cliente.

#### Ejemplo desde cero

Definimos el contrato de error:

```java
package com.example.demo;

import java.util.List;

public record ApiError(String codigo, String mensaje, List<String> detalles) { }
```

Definimos una excepción de aplicación:

```java
package com.example.demo;

public class TareaNoEncontradaException extends RuntimeException {
    public TareaNoEncontradaException(Long id) {
        super("No existe la tarea " + id);
    }
}
```

El controller lanza la excepción cuando corresponde:

```java
@GetMapping("/{id}")
public TareaDTO obtener(@PathVariable Long id) {
    Tarea tarea = repo.findById(id)
        .orElseThrow(() -> new TareaNoEncontradaException(id));
    return TareaDTO.from(tarea);
}
```

El advice centraliza el mapeo:

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
        return ResponseEntity.badRequest()
            .body(new ApiError("VALIDACION", "Datos inválidos", detalles));
    }

    @ExceptionHandler(TareaNoEncontradaException.class)
    public ResponseEntity<ApiError> noEncontrada(TareaNoEncontradaException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiError("TAREA_NO_ENCONTRADA", ex.getMessage(), List.of()));
    }
}
```

#### Recorrido del código

`TareaNoEncontradaException` contiene el id faltante en su mensaje. Esa información es útil para el cliente y no revela detalles internos peligrosos. El controller no construye la respuesta 404; solo expresa el hecho de que el recurso no existe.

En `ErroresApi`, cada `@ExceptionHandler` se encarga de un tipo de error. El handler de validación transforma errores de campo en 400. El handler de no encontrado transforma la excepción de aplicación en 404. Ambos devuelven el mismo tipo de cuerpo, `ApiError`. Esa consistencia es el objetivo principal.

Si más adelante se agrega un handler genérico para `Exception`, debe responder 500 con un mensaje seguro y registrar el detalle interno en logs. No debe devolver `ex.getMessage()` ciegamente ni el stacktrace al cliente.

#### Ejecución y salida real

```bash
curl -s http://localhost:8080/api/tareas/999
```

Salida real observada (Spring Boot 4.1.2, 2026-05-22):

```json
{"codigo":"TAREA_NO_ENCONTRADA","mensaje":"No existe la tarea 999","detalles":[]}
```

La petición inválida del tema anterior produce:

```json
{"codigo":"VALIDACION","mensaje":"Datos inválidos","detalles":["titulo: Escribe un título.","prioridad: La prioridad mínima es 1."]}
```

Los dos errores tienen estados distintos, pero comparten forma. Eso permite que el cliente implemente un único parser de errores.

#### Errores frecuentes

Si cada endpoint responde con un formato diferente, el manejo de errores está disperso. La corrección es mover la traducción de excepciones a `@RestControllerAdvice`.

Si la respuesta incluye un stacktrace, se está exponiendo información interna. El stacktrace pertenece a los logs del servidor; el cliente solo necesita un contrato de error seguro.

Si todo se responde como 400, se está perdiendo la semántica HTTP. Un recurso inexistente no es una petición mal formada; es un 404.

#### Verificación

Hay que verificar al menos tres casos: entrada inválida devuelve 400 con código `VALIDACION`; recurso inexistente devuelve 404 con código `TAREA_NO_ENCONTRADA`; ninguna respuesta expone stacktrace. Estas comprobaciones pueden automatizarse con tests de MockMvc.


### Tema 4: Lombok y MapStruct sin exponer datos internos · Intermedio · 35 min

A medida que crece una API, aparecen tareas repetitivas: constructores, getters, builders, conversiones entre entidades y DTOs. Lombok y MapStruct existen para reducir ese trabajo mecánico. El beneficio es real, pero no es gratuito: ambos funcionan por generación de código en compilación y pueden ocultar decisiones importantes si se usan sin criterio.

#### Generación de código en compilación

Lombok es un procesador de anotaciones que genera código durante la compilación. Anotaciones como `@Getter`, `@Builder` o `@RequiredArgsConstructor` evitan escribir métodos repetitivos. Su ventaja es reducir ruido. Su riesgo es que el código “visible” ya no es todo el código que existe. Por eso conviene usar Lombok con moderación y entender qué genera.

En entidades JPA, el uso de `@Data` suele ser una mala idea. `@Data` combina getters, setters, `toString`, `equals` y `hashCode`. En entidades con relaciones bidireccionales, `toString` o `equals` pueden recorrer la relación y provocar ciclos, `StackOverflowError` o cargas inesperadas. Además, la identidad de una entidad JPA no siempre debe basarse en todos sus campos. En entidades, es preferible ser explícito.

MapStruct es otro procesador de anotaciones, pero con un objetivo distinto: generar mappers tipo-seguro entre objetos. Se define una interfaz con métodos como `toDto` o `toEntity`, y MapStruct genera la implementación en compilación. El resultado se puede inspeccionar en `target/generated-sources/annotations`, lo que hace que el mapeo sea transparente.

La regla de seguridad es la misma que en el Tema 1: el contrato de salida decide qué campos se exponen. Si el DTO no tiene `ubicacionInterna`, MapStruct no debe copiarlo. Si en algún caso el DTO y la entidad comparten nombres de campos sensibles que no deben viajar, hay que ignorarlos explícitamente con `@Mapping(target = "...", ignore = true)`.

#### Ejemplo desde cero

En `pom.xml` se agregan dependencias y procesadores:

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

El mapper declara la conversión:

```java
package com.example.demo;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TareaMapper {
    TareaDTO toDto(Tarea tarea);
}
```

El servicio inyecta el mapper generado por Spring:

```java
package com.example.demo;

import org.springframework.stereotype.Service;

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

#### Recorrido del código

`componentModel = "spring"` indica a MapStruct que genere una implementación anotada como componente Spring. Esto permite inyectarla en servicios o controllers. Sin esta configuración, habría que obtener el mapper manualmente con `Mappers.getMapper(...)`, lo que no suele ser deseable en una aplicación Spring.

Los `annotationProcessorPaths` del `maven-compiler-plugin` son esenciales. Lombok y MapStruct no hacen magia en tiempo de ejecución; generan código durante la compilación. Si el procesador no está configurado, el mapper no se genera o el IDE muestra errores engañosos.

El DTO de salida sigue siendo la barrera. Aunque la entidad tenga `ubicacionInterna`, `TareaDTO` no define ese campo. La implementación generada solo puede mapear lo que el contrato permite. Aun así, conviene inspeccionar el código generado cuando el mapeo es sensible.

#### Ejecución y verificación

```bash
./mvnw -q -DskipTests compile
find target/generated-sources -name '*TareaMapperImpl*'
```

Salida esperada:

```text
target/generated-sources/annotations/.../TareaMapperImpl.java
```

**Nota de verificación (2026-05-22).** Se verificó el patrón de compilación y generación con proyectos Maven y JDK 27 en esta máquina. La implementación generada debe inspeccionarse en `target/generated-sources/annotations`. Si el IDE marca errores pero Maven compila, el problema suele estar en la configuración de annotation processing del IDE.

#### Errores frecuentes

Si Spring no encuentra el bean `TareaMapper`, falta `componentModel = "spring"` o falta el processor en la compilación. Hay que revisar ambas cosas.

Si el mapper copia un campo que no debería salir, el problema está en el contrato o en la configuración del mapeo. La corrección es quitar el campo del DTO y, si hace falta, ignorarlo explícitamente.

Si una entidad JPA usa `@Data` y aparecen errores raros en `toString`, `equals` o cargas LAZY, el problema es la generación indiscriminada de métodos. En entidades, es preferible definir solo lo necesario.

#### Verificación

La verificación mínima es compilar, confirmar que existe `TareaMapperImpl` y revisar que no asigna `ubicacionInterna`. Después, una prueba de API debe confirmar que la respuesta JSON no expone el campo interno.


### Tema 5: OpenAPI con springdoc: el contrato como prueba · Avanzado · 40 min

Una API puede tener código correcto y, aun así, ser difícil de consumir si su contrato no está claro. El problema se agrava cuando la documentación vive en un wiki o en un documento separado: el código cambia, la documentación no, y el cliente integra contra una descripción falsa. OpenAPI permite describir la API en un formato legible por máquinas, y springdoc puede generar esa descripción a partir de una aplicación Spring.

#### La especificación como artefacto verificable

OpenAPI es una especificación para describir APIs HTTP. Define rutas, métodos, parámetros, cuerpos, respuestas, esquemas y códigos de estado. Su valor no es solo documental. Una especificación OpenAPI puede usarse para generar clientes, validar contratos, crear documentación interactiva y detectar cambios incompatibles.

springdoc-openapi integra esta especificación con Spring MVC. Al agregar la dependencia adecuada, la aplicación expone endpoints como `/v3/api-docs` y, si se incluye la UI, Swagger UI. Lo importante es entender que la especificación generada debe reflejar el comportamiento real. Si el endpoint devuelve 400 ante una entrada inválida pero la spec solo documenta 200, el contrato está incompleto.

Las anotaciones como `@Operation` y `@ApiResponse` sirven para agregar semántica que no siempre puede inferirse del código. No hace falta anotar cada detalle obvio, pero sí conviene documentar respuestas de error, códigos de estado relevantes y significados de negocio. El objetivo es que el contrato sea útil, no ruidoso.

Un contrato también se puede probar. Un test que solo verifica que `/v3/api-docs` devuelve 200 es débil: la spec podría existir y aun así omitir rutas o respuestas importantes. Una prueba de contrato más útil afirma que la especificación contiene las rutas esperadas, los métodos, los códigos de estado y los esquemas clave.

#### Ejemplo desde cero

Se crea un proyecto con web y validación:

```bash
curl -s https://start.spring.io/starter.zip \
  -d dependencies=web,validation -d bootVersion=4.1.2 -d javaVersion=25 \
  -d baseDir=demo -o demo.zip
```

Se agrega springdoc. En la verificación realizada con Spring Boot 4.1.2, la versión 3.0.2 expuso correctamente `/v3/api-docs`:

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>3.0.2</version>
</dependency>
```

La compatibilidad entre springdoc y Spring Boot cambia con el tiempo. Antes de fijar una versión en un proyecto real, conviene confirmar la matriz de compatibilidad de la versión de Boot que se esté usando.

El controller puede declarar respuestas relevantes:

```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
class TareaController {

    @Operation(summary = "Crea una tarea")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Creada"),
        @ApiResponse(responseCode = "400", description = "Entrada inválida")
    })
    @PostMapping("/api/tareas")
    public ResponseEntity<TareaDTO> crear(@Valid @RequestBody CrearTareaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new TareaDTO(1L, request.titulo(), request.prioridad()));
    }
}
```

Un test de contrato puede verificar que la spec se expone y contiene la ruta:

```java
import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ContratoOpenApiTest {

    @LocalServerPort
    int port;

    @Test
    void exponeContrato() throws Exception {
        var response = HttpClient.newHttpClient().send(
            HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/v3/api-docs"))
                .GET().build(),
            HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("/api/tareas");
    }
}
```

#### Recorrido del código

La dependencia de springdoc agrega la infraestructura que inspecciona los controllers Spring y construye la especificación OpenAPI. La anotación `@Operation` describe el propósito de la operación. `@ApiResponses` declara códigos de estado que el cliente debe esperar. Esto es especialmente útil para los errores, porque muchos clientes generan código o lógica a partir del contrato.

El test usa `@SpringBootTest` con un puerto aleatorio. Eso evita colisiones en CI o en máquinas donde el puerto 8080 ya está ocupado. La aserción comprueba el estado 200 y la presencia de `/api/tareas`. En un proyecto real conviene reforzarla con más afirmaciones: existencia del método POST, presencia del esquema `CrearTareaRequest`, respuesta 400 documentada.

#### Ejecución y salida real

```bash
./mvnw -Dtest=ContratoOpenApiTest test
curl -s http://localhost:8080/v3/api-docs | head
```

Salida real observada (Spring Boot 4.1.2, springdoc 3.0.2, 2026-05-22):

```text
Started ... : Init duration for springdoc-openapi is: 57 ms
HTTP 200 en /v3/api-docs
```

La respuesta JSON incluye la ruta `/api/tareas`.

#### Errores frecuentes

Si `/v3/api-docs` responde 404, la causa habitual es una dependencia faltante o incompatible con la versión de Spring Boot. La corrección es revisar la dependencia y su compatibilidad.

Si la especificación existe pero no documenta errores, el contrato está contando solo el camino feliz. Hay que agregar `@ApiResponse` o asegurarse de que los handlers y esquemas de error sean visibles.

Si Swagger UI se expone sin control en producción, se abre una superficie de información innecesaria. En entornos sensibles se puede deshabilitar, proteger con autenticación o exponer solo en perfiles internos.

#### Verificación

La verificación mínima es obtener 200 desde `/v3/api-docs` y confirmar que contiene la ruta crítica. La verificación recomendable es un test que falle cuando falta una ruta o un código de estado esperado.


### Tema 6: Paginación HTTP con validación y un límite de recursos explícito · Avanzado · 40 min

Un endpoint que devuelve todas las tareas funciona bien cuando hay veinte registros. Cuando hay dos millones, el problema deja de ser funcional y pasa a ser de capacidad: la base de datos hace más trabajo del necesario, la red transporta una respuesta enorme y el cliente intenta procesar demasiados datos. La paginación no es una optimización opcional en listados grandes; es parte del contrato.

#### Paginar, validar y fijar un límite

Paginar significa dividir un conjunto grande de resultados en páginas. En HTTP, una forma común es aceptar parámetros como `page` y `size`. Spring Data expone abstracciones como `Pageable` y `Page` para expresar esa solicitud y su resultado. `Pageable` describe qué página se quiere, con qué tamaño y con qué orden. `Page` contiene los datos y metadatos como el total de elementos o la existencia de una página siguiente.

Pero aceptar paginación no basta. Si el cliente puede pedir `size=100000`, el endpoint sigue siendo vulnerable. Por eso el parámetro `size` debe tener un máximo explícito. También `page` debe ser no negativo. Estas restricciones se pueden declarar con Bean Validation, por ejemplo `@Min(0)` y `@Max(100)`, y se activan en el controller con `@Validated`.

El orden es otro detalle importante. Una paginación sin orden estable puede devolver resultados duplicados o saltar elementos entre páginas cuando los datos cambian. Usar `Sort.by("id").ascending()` o un criterio estable equivalente evita ese comportamiento.

Finalmente, conviene decidir qué contrato devolver. Exponer directamente el `Page` de Spring Data puede acoplar al cliente con detalles internos de la implementación. Un DTO como `PageResponse<T>` permite controlar la forma exacta: items, número de página, tamaño, total y si hay siguiente página.

#### Ejemplo desde cero

Se define un DTO de página:

```java
package com.example.demo;

import java.util.List;

public record PageResponse<T>(List<T> items, int page, int size, long total, boolean hasNext) { }
```

El controller valida parámetros y devuelve el DTO:

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

Para que los parámetros inválidos devuelvan 400, el advice debe manejar las excepciones de validación de parámetros. Dependiendo de la configuración y del tipo de validación, pueden aparecer `ConstraintViolationException` o `HandlerMethodValidationException`:

```java
@ExceptionHandler({jakarta.validation.ConstraintViolationException.class,
        org.springframework.web.method.annotation.HandlerMethodValidationException.class})
public ResponseEntity<ApiError> parametros(Exception ex) {
    return ResponseEntity.badRequest()
        .body(new ApiError("VALIDACION", "Parámetros inválidos", java.util.List.of(ex.getMessage())));
}
```

#### Recorrido del código

La anotación `@Validated` en la clase activa la validación de parámetros del método. Sin ella, `@Min` y `@Max` en los `@RequestParam` no se aplican como se espera. Este detalle es fácil de pasar por alto porque el código compila igual.

`PageRequest.of(page, size, Sort.by("id").ascending())` construye la solicitud de página con un orden determinista. El repositorio devuelve un `Page<Tarea>`. Luego se transforma el contenido a DTOs y se arma un `PageResponse`. El cliente recibe datos y metadatos, pero no depende de la estructura interna de Spring Data.

El límite `@Max(100)` es una decisión de protección. El valor exacto depende del caso, pero debe existir un máximo razonable. Aceptar tamaños arbitrarios equivale a dejar que el cliente decida cuánto trabajo debe hacer el servidor.

#### Ejecución y salida real

```bash
curl -s "http://localhost:8080/api/tareas-page?page=0&size=2"
curl -i -s "http://localhost:8080/api/tareas-page?page=0&size=101"
```

Salida real observada (Spring Boot 4.1.2, 2026-05-22):

```text
items.length == 2, hasNext == true
HTTP/1.1 400 para size=101
```

El primer caso confirma que la página respeta el tamaño solicitado. El segundo confirma que el límite protege el endpoint.

#### Errores frecuentes

Si `size=10000` es aceptado, falta el límite o falta `@Validated`. La corrección es declarar el máximo y activar la validación.

Si un parámetro inválido devuelve 500, el manejador de excepciones no está cubriendo el tipo lanzado. Hay que mapear las excepciones de validación de parámetros a 400.

Si los resultados se repiten o se saltan entre páginas, falta un orden estable. La paginación por offset necesita un criterio determinista.

#### Verificación

La verificación mínima es pedir `size=2` y comprobar que llegan dos elementos con metadatos. Luego pedir `size=101` y comprobar que responde 400. También conviene revisar que el JSON incluye `page`, `size`, `total` y `hasNext`.


### Tema 7: JSON con Jackson 3: `JsonMapper`, fechas y valores por defecto nuevos · Avanzado · 35 min

Una API REST suele hablar JSON. Ese detalle parece obvio, pero es una fuente frecuente de incompatibilidades: fechas en formatos ambiguos, campos nulos interpretados de formas distintas, o cambios de comportamiento al migrar de versión. Con Spring Boot 4, el ecosistema de Jackson 3 introduce cambios importantes, entre ellos el paquete `tools.jackson` para el mapper JSON. El contrato JSON debe ser explícito y probado.

#### El contrato JSON no debe depender de la intuición

Jackson es la biblioteca que Spring usa habitualmente para serializar objetos Java a JSON y deserializar JSON a objetos Java. En Jackson 3, el tipo recomendado para JSON es `JsonMapper`, ubicado en `tools.jackson.databind.json.JsonMapper`. Este cambio de paquete respecto a Jackson 2 es relevante: si el código o la configuración asumen el paquete antiguo, pueden aparecer errores de compilación o configuraciones que no aplican.

Las fechas son un caso crítico. Un `Instant` representa un punto en el tiempo en UTC. Serializarlo como `2026-11-18T10:15:30Z` en ISO-8601 es claro e interoperable. En cambio, usar timestamps numéricos sin contexto o formatos locales ambiguos obliga al cliente a adivinar zona horaria y semántica. Para APIs, la claridad gana.

También hay que definir la política frente a valores nulos y propiedades desconocidas. ¿Un campo ausente significa lo mismo que `null`? ¿El cliente puede enviar campos extra? ¿El servidor debe ignorarlos o rechazarlos? No hay una única respuesta universal, pero sí una regla: la política debe ser consciente y coherente con el contrato. Los tests de serialización y deserialización son la forma práctica de fijar esa política.

#### Ejemplo desde cero

En un proyecto Spring Boot 4.1.x con `spring-boot-starter-web`, Jackson 3 ya está disponible. La prueba más simple consiste en serializar un record con un `Instant`:

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

#### Recorrido del código

El import `tools.jackson.databind.json.JsonMapper` es la señal de que se está usando Jackson 3. En Jackson 2, el mapper estaba en `com.fasterxml.jackson.databind.ObjectMapper`. La diferencia no es cosmética: confundirla causa errores de dependencia o configuraciones que no se aplican al mapper correcto.

El record `Evento` define un contrato simple: un identificador, un tipo y un instante. `Instant.parse("2026-11-18T10:15:30Z")` crea un valor inequívoco en UTC. La aserción verifica que el JSON contiene la representación ISO-8601 esperada.

Este test es pequeño, pero cumple una función importante: fija el contrato. Si una actualización futura cambia la forma de serializar fechas, el test fallará. Ese fallo es útil: obliga a decidir si el cambio de formato es aceptable y si los clientes deben adaptarse.

#### Ejecución y salida real

```bash
./mvnw -q -Dtest=JacksonTest test
```

Salida real observada (Spring Boot 4.1.2, JDK 27, 2026-05-22): el test pasó. El JSON serializado contiene:

```json
"ocurrido":"2026-11-18T10:15:30Z"
```

#### Errores frecuentes

Si el compilador no encuentra `tools.jackson.databind.json.JsonMapper`, la dependencia o la versión no están alineadas con Jackson 3. En Spring Boot 4, la configuración por defecto debería resolverlo; en proyectos personalizados, hay que revisar el árbol de dependencias.

Si una fecha aparece como número, arreglo u otro formato inesperado, la configuración de serialización no es la que se cree. La corrección no es “aceptar cualquier cosa”, sino definir el formato y probarlo.

Si un cliente rompe por campos nulos o desconocidos, el problema no es solo técnico: falta una política de contrato. Esa política debe documentarse y cubrirse con tests.

#### Verificación

La verificación mínima es un test de serialización que afirme la forma ISO-8601. En APIs reales, conviene agregar tests de deserialización, casos con campos nulos y casos con propiedades desconocidas según la política elegida.


### Tema 8: Versionado de API nativo de Spring Framework 7 · Avanzado · 40 min

El endpoint `/api/tareas/{id}/resumen` devuelve `id` y `titulo`. Después de un tiempo, el negocio necesita incluir `prioridad`. Cambiar la respuesta directamente parece simple, pero puede romper clientes que esperan la forma anterior. Cuando una API tiene consumidores externos, móviles, integraciones o frontend desplegado por separado, evolucionar el contrato requiere una estrategia.

#### Versionar es gestionar compatibilidad

Versionar una API significa introducir una forma explícita de evolucionar el contrato sin romper a todos los consumidores al mismo tiempo. No todos los cambios necesitan versión nueva. Agregar un campo opcional que los clientes existentes pueden ignorar a veces es compatible. Cambiar el significado de un campo, eliminarlo, renombrarlo o modificar la estructura de forma incompatible sí exige más cuidado.

Spring Framework 7 incorpora soporte nativo de versionado en Spring MVC. Esto permite mapear handlers a versiones específicas usando el atributo `version` en las anotaciones de mapeo, y configurar cómo se resuelve la versión solicitada: por cabecera, por parámetro, por media type u otra estrategia soportada. En Spring Boot 4, esa configuración se expone mediante propiedades.

En este ejemplo usamos la cabecera `API-Version`. La propiedad `spring.mvc.apiversion.use.header=API-Version` indica qué cabecera leer. La propiedad `spring.mvc.apiversion.default=1.0` define qué versión se usa cuando el cliente no envía la cabecera. Tener un default explícito es importante para la migración: los clientes antiguos pueden seguir funcionando mientras adoptan la nueva versión.

La versión no soportada debe producir un error claro. No debe caer silenciosamente en una versión cualquiera. También conviene documentar las versiones disponibles y su política de deprecación: cuánto tiempo se mantendrá v1, cómo se avisará y qué métricas indican que ya no se usa.

#### Ejemplo desde cero

En `src/main/resources/application.properties`:

```properties
spring.mvc.apiversion.use.header=API-Version
spring.mvc.apiversion.default=1.0
```

El controller define dos versiones del mismo endpoint:

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

#### Recorrido del código

Los dos métodos apuntan al mismo path, pero declaran versiones distintas. Spring MVC usa la configuración de versionado para seleccionar el handler adecuado. El cliente que no envía cabecera recibe la versión por defecto, `1.0`. El cliente que envía `API-Version: 2.0` recibe la versión nueva.

En un caso real, `v1` y `v2` devolverían DTOs distintos o la misma ruta con un contrato diferente. Aquí se devuelve un string simple para hacer visible el mecanismo sin mezclarlo con persistencia. Lo importante es observar que la selección ocurre antes de la lógica de negocio y que el contrato viejo no desaparece.

El default `1.0` es una decisión de compatibilidad. Si se cambiara el default a `2.0` sin preparar a los clientes, la migración se volvería una ruptura. Versionar bien no es solo agregar `version="2.0"`; es gestionar el ciclo de vida de ambas versiones.

#### Ejecución y salida real

```bash
curl -s http://localhost:8080/api/tareas/7/resumen
curl -s -H 'API-Version: 2.0' http://localhost:8080/api/tareas/7/resumen
```

Salida real observada (Spring Boot 4.1.2, JDK 27, 2026-05-22):

```text
v1:7
v2:7
```

La primera respuesta confirma el default. La segunda confirma que la cabecera selecciona la versión nueva.

#### Errores frecuentes

Si la cabecera no cambia la respuesta, la propiedad `spring.mvc.apiversion.use.header` no está configurada o la cabecera enviada no coincide. La corrección es revisar la configuración y el nombre exacto de la cabecera.

Si un cliente viejo recibe la respuesta nueva, el default cambió o el contrato v1 fue modificado. La versión vieja debe seguir comportándose como antes hasta que termine su periodo de soporte.

Si se mezclan estrategias de versionado sin una regla clara, los clientes no sabrán cómo pedir una versión. Es mejor elegir una estrategia, documentarla y probarla.

#### Verificación

La verificación mínima es probar tres casos: sin cabecera devuelve v1, con `API-Version: 2.0` devuelve v2, y una versión no soportada produce un error claro según la política configurada. También conviene documentar qué versiones están activas y cuándo se retirará la anterior.

## Cierre del módulo

Este módulo recorrió la frontera HTTP de una aplicación Spring Boot. Primero separó el contrato de la persistencia con DTOs, después protegió la entrada con Bean Validation, centralizó errores con `@RestControllerAdvice`, controló el mapeo con Lombok y MapStruct, documentó el contrato con OpenAPI, limitó listados con paginación validada, fijó el comportamiento JSON con Jackson 3 y mostró cómo evolucionar un endpoint con versionado nativo. La idea transversal es la misma en todos los temas: el contrato externo debe ser explícito, estable y verificable.
