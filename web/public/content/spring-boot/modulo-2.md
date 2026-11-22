# Módulo 2: REST APIs con Spring Web

Cada tema separa el contrato HTTP (DTOs) de la persistencia interna (entidades), automatiza la validación de entrada y centraliza el manejo de errores — las tres piezas que hacen que una API REST sea predecible para quien la consume.

**Referencia ejecutable al terminar los módulos 2 y 4–7:** en la raíz del repositorio, abre `README.md`. Incluye el estado final y pruebas; algunas clases incorporan cambios de módulos posteriores. Construye primero las prácticas de este módulo y usa la referencia para comparar y diagnosticar.

## Aprende construyendo


### Tema 1: Por qué DTOs en vez de entidades directamente · Intermedio · 35 min

**Caso guía**: exponer entidad JPA directamente filtra `ubicacionInterna` y acopla API al esquema de persistencia.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| DTO (Data Transfer Object) | Objeto de entrada/salida para la frontera HTTP. | Desacoplar API de persistencia. | Campos explícitos y mínimos. | Exponer entidad JPA. |
| Entidad JPA | Modelo persistente con identidad y mapeo. | Persistencia/BD. | No usar como contrato público por defecto. | Fugas de campos internos. |
| Mapeo entidad<->DTO | Conversión controlada entre capas. | Controlar contrato. | `from(entity)`/mapper dedicado. | Mapear manualmente en muchos lugares sin consistencia. |
| Contrato de API | Forma estable que consume el cliente. | Evolución segura. | Versionar/cambiar DTOs conscientemente. | Cambiar DB y romper clientes. |

**Implementación desde cero** (proyecto Boot web+data-jpa+h2)
```xml
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
<dependency><groupId>com.h2database</groupId><artifactId>h2</artifactId><scope>runtime</scope></dependency>
```
```java
@Entity @Table(name="tareas")
public class Tarea {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  private String titulo; private int prioridad;
  @Column(name="ubicacion_interna") private String ubicacionInterna;
  protected Tarea() {}
  public Tarea(String t,int p,String u){ titulo=t; prioridad=p; ubicacionInterna=u; }
  public Long getId(){return id;} public String getTitulo(){return titulo;} public int getPrioridad(){return prioridad;} public String getUbicacionInterna(){return ubicacionInterna;}
}
public record CrearTareaRequest(String titulo, int prioridad) {}
public record TareaDTO(Long id, String titulo, int prioridad) { static TareaDTO from(Tarea t){ return new TareaDTO(t.getId(), t.getTitulo(), t.getPrioridad()); } }
```

**Ejecución real**: `./mvnw spring-boot:run`, POST/GET a `/api/tareas`; respuesta contiene solo `id,titulo,prioridad`. **Verificación**: confirma que `ubicacionInterna` no aparece en JSON.

### Tema 2: Validación con Bean Validation y ResponseEntity · Intermedio · 35 min

**Caso guía**: rechazar `titulo` vacío o prioridad inválida antes de tocar negocio/BD.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Bean Validation (`jakarta.validation`) | Anotaciones declarativas de restricción. | Validar input en frontera. | `@Valid` en `@RequestBody`. | Validar tarde en servicio con ifs dispersos. |
| `@NotBlank`, `@Min` etc. | Restricciones estándar. | Contrato de entrada. | Mensajes claros. | Mensajes genéricos inútiles. |
| `ResponseEntity` | Respuesta HTTP con status/headers/body. | Control explícito de HTTP. | 201 al crear, 400 al validar mal. | Siempre 200. |
| 400 Bad Request | Error del cliente por input inválido. | Semántica HTTP correcta. | No devolver 500 por validación. | Enmascarar input inválido como error servidor. |

**Implementación desde cero**
```xml
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
```
```java
public record CrearTareaRequest(@NotBlank(message="Escribe un título.") String titulo, @Min(value=1,message="La prioridad mínima es 1.") int prioridad) {}
@PostMapping
public ResponseEntity<TareaDTO> crear(@Valid @RequestBody CrearTareaRequest request) {
  return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crear(request));
}
```
**Ejecución real**
```bash
curl -i -X POST http://localhost:8080/api/tareas -H 'Content-Type: application/json' -d '{"titulo":"Entregar paquete","prioridad":1}'
curl -i -X POST http://localhost:8080/api/tareas -H 'Content-Type: application/json' -d '{"titulo":"   ","prioridad":0}'
```
**Salida esperada**: 201 y 400. **Verificación**: body 400 incluye errores de campo.

### Tema 3: Manejo centralizado de errores con @ControllerAdvice · Intermedio · 40 min

**Caso guía**: mismas fallas deben responder con el mismo formato JSON.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `@ControllerAdvice` | Componente que intercepta excepciones de controllers. | Manejo de errores centralizado. | Un formato de error consistente. | try/catch duplicado en cada endpoint. |
| `@ExceptionHandler` | Método que maneja un tipo de excepción. | Mapear excepción->HTTP. | Mapear validación a 400, not found a 404. | Devolver stacktrace al cliente. |
| `ApiError`/Problem Details | Estructura de error estable. | Contrato de error. | Incluir código, mensaje, detalles. | Campos distintos por endpoint. |
| Excepciones de dominio | `TareaNoEncontradaException` etc. | Semántica clara. | Lanzar desde servicio, mapear en advice. | Usar excepciones genéricas para todo. |

**Implementación desde cero**
```java
public record ApiError(String codigo, String mensaje, java.util.List<String> detalles) {}
@RestControllerAdvice
public class ErroresApi {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> validacion(MethodArgumentNotValidException ex){
    var detalles = ex.getBindingResult().getFieldErrors().stream().map(e -> e.getField()+": "+e.getDefaultMessage()).toList();
    return ResponseEntity.badRequest().body(new ApiError("VALIDACION","Datos inválidos", detalles));
  }
  @ExceptionHandler(TareaNoEncontradaException.class)
  public ResponseEntity<ApiError> noEncontrada(TareaNoEncontradaException ex){
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError("TAREA_NO_ENCONTRADA", ex.getMessage(), List.of()));
  }
}
```
**Ejecución real**: GET inexistente → 404 con JSON `ApiError`; POST inválido → 400. **Verificación**: dos endpoints distintos producen el mismo shape de error.

### Tema 4: Lombok y MapStruct sin exponer datos internos · Intermedio · 35 min

**Caso guía**: reducir boilerplate sin romper encapsulación ni contrato.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Lombok | Generación de código en compilación (`@Getter`, `@Builder`, etc.). | Reducir boilerplate. | Usar con moderación en entidades/DTOs. | `@Data` en entidades JPA con equals/hashCode peligroso. |
| MapStruct | Generador de mappers compile-time. | Mapeo tipo-seguro y rápido. | Mapear campos explícitos; ignorar internos. | Mapear entidad entera por accidente. |
| Annotation processing | Procesamiento en compilación. | Generar código. | Configurar `annotationProcessorPaths` en Maven. | “No encuentra mapper impl”. |
| Frontera de datos | Lo que sale/entra de la API. | Seguridad/estabilidad. | DTO no incluye campos internos. | Agregar campo sensible por comodidad. |

**Implementación desde cero**
```xml
<dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><version>${lombok.version}</version><scope>provided</scope></dependency>
<dependency><groupId>org.mapstruct</groupId><artifactId>mapstruct</artifactId><version>${mapstruct.version}</version></dependency>
```
```java
@Mapper(componentModel="spring")
public interface TareaMapper {
  @Mapping(target="id", source="id")
  @Mapping(target="titulo", source="titulo")
  @Mapping(target="prioridad", source="prioridad")
  TareaDTO toDto(Tarea tarea);
}
```
**Ejecución real**: `./mvnw -q -DskipTests compile` genera implementación; respuesta API sigue sin `ubicacionInterna`. **Verificación**: inspecciona `target/generated-sources/annotations`.

### Tema 5: OpenAPI con springdoc: el contrato como prueba · Avanzado · 40 min

**Caso guía**: la documentación no debe mentir; debe reflejar rutas y respuestas reales.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| OpenAPI | Especificación de contrato HTTP machine-readable. | Documentación, clientes, pruebas. | Generar desde código o mantener en sync. | Doc manual desactualizada. |
| springdoc | Librería que expone OpenAPI desde Spring MVC. | `/v3/api-docs`, Swagger UI. | Añadir dependencia y anotar donde aporte. | Exponer UI en prod sin control. |
| Contrato como prueba | Test que verifica rutas/respuestas del spec. | Detectar drift. | Assert sobre paths/status/schemas clave. | Test solo de “200 en /v3/api-docs”. |
| Anotaciones OpenAPI | `@Operation`, `@ApiResponse`, `@Schema`. | Mejorar contrato. | Documentar errores y códigos. | Solo documentar happy path. |

**Implementación desde cero**
```xml
<dependency><groupId>org.springdoc</groupId><artifactId>springdoc-openapi-starter-webmvc-ui</artifactId><version>3.2.0</version></dependency>
```
Test de contrato:
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ContratoOpenApiTest {
  @Value("${local.server.port}") int puerto;
  @Test void publicaContrato() throws Exception {
    var res = HttpClient.newHttpClient().send(HttpRequest.newBuilder(URI.create("http://localhost:"+puerto+"/v3/api-docs")).GET().build(), HttpResponse.BodyHandlers.ofString());
    assertThat(res.statusCode()).isEqualTo(200);
    assertThat(res.body()).contains("/api/tareas").contains("\"400\"").contains("\"404\"").contains("ApiError");
  }
}
```
**Ejecución real**: `./mvnw -Dtest=ContratoOpenApiTest test` verde. **Verificación**: cambia código de respuesta y observa fallo de contrato.

### Tema 6: Paginación HTTP con validación y un límite de recursos explícito · Avanzado · 40 min

**Caso guía**: `GET /api/tareas?size=10000` no debe tumbar la BD.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Paginación | Dividir resultados en páginas (`page,size`). | Escalar lecturas. | Limitar `size` máximo. | `findAll()` sin límite. |
| `Pageable`/`Page` | Abstracción Spring Data para paginar. | Integración repositorio-HTTP. | Orden estable (`sort`). | Paginación sin orden determinista. |
| Validación de parámetros | Restringir page/size/sort aceptados. | Proteger recursos. | `@Max`, `@Min`, allowlist sort. | Aceptar cualquier `sort` de usuario. |
| Contrato de página | Respuesta con items,total,page,size,hasNext. | UX cliente. | DTO de página, no exponer `Page` interno a ciegas. | Cambiar forma de respuesta sin versionar. |

**Implementación desde cero**
```java
@GetMapping
public PageResponse<TareaDTO> listar(@RequestParam(defaultValue="0") @Min(0) int page,
                                     @RequestParam(defaultValue="20") @Min(1) @Max(100) int size) {
  Page<Tarea> p = repo.findAll(PageRequest.of(page,size,Sort.by("id").ascending()));
  return new PageResponse<>(p.map(TareaDTO::from).getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.hasNext());
}
```
**Ejecución real**: `curl "http://localhost:8080/api/tareas?page=0&size=2"` devuelve 2 items; `size=101` devuelve 400. **Verificación**: confirma SQL con LIMIT en logs.

### Tema 7: JSON con Jackson 3: `JsonMapper`, fechas y valores por defecto nuevos · Avanzado · 35 min

**Caso guía**: Spring Boot 4/Jackson 3 cambia defaults; tu contrato JSON debe ser explícito.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Jackson 3 `JsonMapper` | Mapper inmutable/builder para JSON. | Serializar/deserializar. | Usar `JsonMapper` (no viejo `ObjectMapper` APIs deprecadas). | Asumir defaults Jackson 2. |
| Fechas ISO-8601 | Formato textual estándar para fechas (`Instant`). | Interoperabilidad. | Usar `Instant`/ISO, no formatos locales ambiguos. | `"18/11/2026"` sin contrato. |
| `@JsonInclude`/null handling | Control de campos nulos en salida. | Contrato limpio. | Ser explícito donde importa. | Clientes rompen por nulos inesperados. |
| Contrato estricto | Rechazar propiedades desconocidas/invalidas cuando conviene. | Robustez. | `FAIL_ON_UNKNOWN_PROPERTIES` según caso. | Aceptar basura silenciosamente. |

**Implementación desde cero**
```java
record EventoTarea(long tareaId, String tipo, java.time.Instant ocurrido) {}
@Test void instantIso() {
  JsonMapper mapper = JsonMapper.builder().build();
  String json = mapper.writeValueAsString(new EventoTarea(7L,"CREADA", Instant.parse("2026-11-18T10:15:30Z")));
  assertTrue(json.contains("\"ocurrido\":\"2026-11-18T10:15:30Z\""));
}
```
**Ejecución real**: `./mvnw -Dtest=JacksonTresTest test`. **Verificación**: null en primitivo debe fallar según configuración/contrato; documenta default elegido.

### Tema 8: Versionado de API nativo de Spring Framework 7 · Avanzado · 40 min

**Caso guía**: cambiar respuesta sin romper clientes v1.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Versionado de API | Estrategia para evolucionar contratos. | Compatibilidad. | Elegir estrategia (header/path/media). | Cambiar contrato sin versión. |
| Versionado nativo Spring Framework 7 | Soporte en mapping por `version`. | Menos wiring manual. | Configurar propiedad `spring.mvc.apiversion.*`. | Mezclar estrategias sin claridad. |
| Default version | Versión usada si cliente no envía. | Compatibilidad gradual. | Definir default explícito. | Default implícito sorpresa. |
| Deprecación/evolución | Retirar versión vieja con aviso. | Operación sostenible. | Comunicar y medir uso. | Mantener versiones eternamente sin plan. |

**Implementación desde cero**
```properties
spring.mvc.apiversion.use.header=API-Version
spring.mvc.apiversion.default=1.0
```
```java
@GetMapping(path="/{id}/resumen", version="1.0")
public ResumenTareaV1 v1(@PathVariable Long id){ var t=servicio.buscar(id); return new ResumenTareaV1(t.id(), t.titulo()); }
@GetMapping(path="/{id}/resumen", version="2.0")
public ResumenTareaV2 v2(@PathVariable Long id){ var t=servicio.buscar(id); return new ResumenTareaV2(t.id(), t.titulo(), t.prioridad()); }
```
**Ejecución real**
```bash
curl -s http://localhost:8080/api/tareas/1/resumen
curl -s -H 'API-Version: 2.0' http://localhost:8080/api/tareas/1/resumen
```
**Salida esperada**: v1 sin prioridad por default; v2 con prioridad. **Verificación**: versión no soportada devuelve 400.

