# Módulo 4: Persistencia con Spring Data JPA

Este módulo cubre mapeo ORM, repositorios Spring Data, N+1, DTO projections, migraciones y elección relacional vs documental. JPA/Hibernate simplifica, pero hay que entender SQL, carga y transacciones.

**Entorno de referencia (2026-05-22):** JDK 27, Maven 3.10.0. Verificación de conceptos JPA con Hibernate 7.0.0.Final/H2 2.3.232 en `/tmp` ya realizada en módulos Java; ejemplos Spring Data requieren contexto Boot.

## Aprende construyendo

### Tema 1: Entidades y repositorios derivados · Intermedio · 30 min

Caso guía: persistir y consultar envíos sin escribir SQL repetitivo.

#### Entidad JPA

**Definición formal.** Clase anotada con `@Entity` mapeada a tabla relacional; instancia representa fila/objeto persistente administrado por EntityManager.

**Para qué sirve.** Modelar persistencia orientada a objetos.

**Cuándo usarlo.** Cuando el modelo relacional y el dominio se benefician de ORM. No para consultas analíticas complejas donde SQL directo sea más claro.

**Ejemplo mínimo enfocado (JPA).**

```java
@Entity
class Envio {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
  @Column(nullable=false, unique=true) String codigo;
}
```

**Caso de uso real.** CRUD de envíos.

**Error común.** Entidad sin constructor no-arg o con equals/hashCode mal definido. Corrección: seguir reglas JPA.

**Verificación.** **Nota:** requiere JPA provider/BD; verificado con Hibernate+H2 en M16 Java.

#### Repositorio derivado Spring Data

**Definición formal.** Interfaz que extiende `JpaRepository`/`CrudRepository` donde Spring Data genera implementación a partir de firma/nombre del método.

**Para qué sirve.** Eliminar boilerplate CRUD.

**Cuándo usarlo.** Consultas simples y CRUD. Para SQL complejo, usar `@Query` o JDBC.

**Ejemplo mínimo enfocado (Spring Data).**

```java
interface EnvioRepository extends JpaRepository<Envio, Long> {
  Optional<Envio> findByCodigo(String codigo);
}
```

**Caso de uso real.** Buscar por código.

**Error común.** Nombres de método ambiguos o consultas derivadas gigantes. Corrección: `@Query` explícita o Specification.

**Verificación.** **Nota:** requiere contexto Spring Data JPA.

### Tema 2: El problema N+1 y su corrección · Intermedio · 35 min

Caso guía: listar envíos y sus ítems genera 1 query de envíos + N queries de ítems.

#### N+1

**Definición formal.** Patrón ineficiente donde se ejecuta una consulta para la lista principal y N consultas adicionales para cargar relaciones por elemento.

**Para qué sirve.** Identificarlo evita degradación de rendimiento.

**Cuándo aparece.** Relaciones LAZY accedidas en bucle.

**Ejemplo mínimo enfocado (conceptual).**

```java
List<Envio> envios = repo.findAll(); // 1
envios.forEach(e -> e.getItems().size()); // N
```

**Caso de uso real.** Lista de pedidos con items en API.

**Error común.** Dejar LAZY por defecto y tocar relación en serialización. Corrección: fetch join, EntityGraph o DTO projection.

**Verificación.** **Nota:** se verifica con logs SQL/Hibernate statistics.

#### `fetch join` / EntityGraph

**Definición formal.** Mecanismos para cargar relación en la misma consulta (`join fetch` JPQL o `@EntityGraph`).

**Para qué sirve.** Reducir N+1.

**Cuándo usarlo.** Cuando necesitas relación en la misma carga. Cuidado con cartesian product en múltiples colecciones.

**Ejemplo mínimo enfocado (JPQL).**

```java
@Query("select e from Envio e join fetch e.items where e.estado=:estado")
List<Envio> porEstado(@Param("estado") Estado estado);
```

**Caso de uso real.** Detalle de pedido con líneas.

**Error común.** Fetch join de múltiples bags. Corrección: dividir consultas o usar DTO.

**Verificación.** **Nota:** requiere BD y logs SQL.

### Tema 3: Más allá del N+1: el límite de LAZY y páginas DTO · Intermedio · 40 min

Caso guía: necesitas listas paginadas sin cargar grafo de entidades completo.

#### LAZY loading

**Definición formal.** Estrategia donde la relación se carga al accederla, no al cargar la entidad raíz.

**Para qué sirve.** Evitar cargar datos innecesarios.

**Cuándo usarlo.** Por defecto en relaciones to-many; cuidado fuera de transacción (`LazyInitializationException`).

**Ejemplo mínimo enfocado (conceptual).**

```java
@ManyToOne(fetch = FetchType.LAZY) Cliente cliente;
```

**Caso de uso real.** No cargar cliente al listar códigos de envío.

**Error común.** Acceder a LAZY fuera de sesión. Corrección: DTO projection, fetch apropiado o transacción.

**Verificación.** **Nota:** observable por excepción o logs SQL.

#### DTO projection

**Definición formal.** Consulta que retorna solo campos necesarios en un DTO/interface projection, no la entidad completa.

**Para qué sirve.** Rendimiento y contrato claro para lectura.

**Cuándo usarlo.** Listados/reportes/API read models.

**Ejemplo mínimo enfocado (Spring Data).**

```java
record EnvioResumen(Long id, String codigo) {}
@Query("select new com.example.EnvioResumen(e.id,e.codigo) from Envio e")
Page<EnvioResumen> resumir(Pageable p);
```

**Caso de uso real.** Tabla paginada en UI.

**Error común.** Devolver entidad completa para listado. Corrección: projection DTO.

**Verificación.** **Nota:** requiere Spring Data JPA.

### Tema 4: Migraciones con Flyway · Intermedio · 30 min

Caso guía: evolucionar esquema de BD sin cambios manuales ad hoc.

#### Flyway

**Definición formal.** Herramienta de migración de BD que aplica scripts versionados en orden y registra historial.

**Para qué sirve.** Evolución reproducible del esquema.

**Cuándo usarlo.** Todo proyecto con BD relacional compartida/producción.

**Ejemplo mínimo enfocado (archivo).**

```sql
-- V1__crear_envio.sql
create table envio (id bigint primary key, codigo varchar(50) not null);
```

**Caso de uso real.** Agregar columna en release.

**Error común.** Editar migración ya aplicada. Corrección: crear nueva migración.

**Verificación.** **Nota:** requiere app con Flyway y BD; evidencia en tabla `flyway_schema_history`.

### Tema 5: Spring Data MongoDB: documentos, consultas derivadas y cuándo elegir un modelo de documentos · Intermedio · 45 min

Caso guía: almacenar eventos con estructura flexible.

#### Documento MongoDB / Spring Data MongoDB

**Definición formal.** Documento es una estructura tipo JSON/BSON almacenada en colección; Spring Data MongoDB mapea objetos Java a documentos.

**Para qué sirve.** Modelo flexible y consultas por documento.

**Cuándo usarlo.** Datos con estructura variable, agregados autocontenidos, alta escala de lectura/escritura específica. No por defecto si necesitas joins complejos/ACID multi-documento fuerte como núcleo.

**Ejemplo mínimo enfocado (Spring Data).**

```java
@Document("envios")
class EnvioDoc { @Id String id; String codigo; List<String> eventos; }
interface EnvioDocRepo extends MongoRepository<EnvioDoc,String> { Optional<EnvioDoc> findByCodigo(String c); }
```

**Caso de uso real.** Historial de eventos embebido.

**Error común.** Modelar como relacional con muchos documentos referenciados. Corrección: evaluar agregados y patrones de acceso.

**Verificación.** **Nota:** requiere MongoDB/Testcontainers; evidencia con test de integración.

## Cierre del módulo

JPA acelera, pero no reemplaza el entendimiento de SQL, carga y transacciones. Usa repositorios derivados para lo simple, DTO projections para lecturas, migraciones para esquema y elige documento/relacional por patrón de acceso.
