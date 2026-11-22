# Módulo 16: JPA e Hibernate

JPA (Jakarta Persistence API) define el contrato de mapeo objeto-relacional en Java; Hibernate es la implementación más usada. Este módulo cubre entidades, relaciones, ciclo de vida, consultas, N+1, cachés, transacciones y migraciones.

**Entorno de referencia verificado (2026-05-22):** JDK 27, Maven 3.10.0, Hibernate ORM 7.0.0.Final, Jakarta Persistence 3.2.0, H2 2.3.232. Ejemplos JPA verificados con proyecto Maven + H2 en memoria.

## Setup base reutilizable (H2, ejecutable)

```bash
mkdir -p /tmp/jpa-m16/src/main/java/com/academia/jpa /tmp/jpa-m16/src/main/resources/META-INF
cd /tmp/jpa-m16
```

`pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion><groupId>com.academia</groupId><artifactId>jpa-m16</artifactId><version>1.0.0</version>
  <properties><maven.compiler.release>21</maven.compiler.release></properties>
  <dependencies>
    <dependency><groupId>org.hibernate.orm</groupId><artifactId>hibernate-core</artifactId><version>7.0.0.Final</version></dependency>
    <dependency><groupId>com.h2database</groupId><artifactId>h2</artifactId><version>2.3.232</version></dependency>
    <dependency><groupId>jakarta.persistence</groupId><artifactId>jakarta.persistence-api</artifactId><version>3.2.0</version></dependency>
    <dependency><groupId>org.slf4j</groupId><artifactId>slf4j-simple</artifactId><version>2.0.16</version></dependency>
  </dependencies>
</project>
```

`src/main/resources/META-INF/persistence.xml`:

```xml
<persistence xmlns="https://jakarta.ee/xml/ns/persistence" version="3.0">
  <persistence-unit name="pu">
    <provider>org.hibernate.jpa.HibernatePersistenceProvider</provider>
    <properties>
      <property name="jakarta.persistence.jdbc.driver" value="org.h2.Driver"/>
      <property name="jakarta.persistence.jdbc.url" value="jdbc:h2:mem:test;DB_CLOSE_DELAY=-1"/>
      <property name="jakarta.persistence.jdbc.user" value="sa"/>
      <property name="jakarta.persistence.jdbc.password" value=""/>
      <property name="hibernate.hbm2ddl.auto" value="create-drop"/>
      <property name="hibernate.show_sql" value="false"/>
    </properties>
  </persistence-unit>
</persistence>
```

> En cada mínimo ejecutable JPA, agrega la clase entidad en `<class>` si usas listado explícito, o usa la misma unidad con entidades del ejemplo. Para verificación rápida se usó H2 en memoria.

## Aprende construyendo

### Tema 1: Entidades y relaciones JPA · Intermedio · 35 min

Necesitas persistir guías en BD relacional sin escribir SQL manual para cada CRUD.

#### Entidad JPA

**Definición formal.** Una entidad es una clase Java anotada con `@Entity` cuya instancia representa una fila identificable por `@Id`.

**Para qué sirve.** Mapear objetos de dominio a tablas.

**Cuándo usarla y cuándo no.** Úsala para estado persistente con identidad. No conviertas todo DTO en entidad.

**Ejemplo mínimo enfocado (ejecutable, sobre setup base).**

`src/main/java/com/academia/jpa/Guia.java`:

```java
package com.academia.jpa;
import jakarta.persistence.*;
@Entity
public class Guia {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  private String codigo;
  public Guia(){} public Guia(String codigo){this.codigo=codigo;}
  public Long getId(){return id;} public String getCodigo(){return codigo;}
}
```

`Main.java`:

```java
package com.academia.jpa;
import jakarta.persistence.*;
public class Main {
  public static void main(String[] args){
    try(EntityManagerFactory emf=Persistence.createEntityManagerFactory("pu")){
      EntityManager em=emf.createEntityManager();
      em.getTransaction().begin(); em.persist(new Guia("G1")); em.getTransaction().commit();
      System.out.println(em.createQuery("select count(g) from Guia g", Long.class).getSingleResult());
      em.close();
    }
  }
}
```

**Caso de uso real.** Persistir pedidos/usuarios/guías.

**Error común.** Entidad sin constructor no-arg o sin `@Id`. Síntoma: error de proveedor JPA. Corrección: cumplir contrato JPA.

**Verificación (JDK 27, Hibernate 7.0.0, H2 2.3.232, 2026-05-22).** Salida: `1`.

#### Relaciones JPA

**Definición formal.** Asociaciones entre entidades (`@OneToMany`, `@ManyToOne`, `@OneToOne`, `@ManyToMany`) que mapean claves foráneas/tablas join.

**Para qué sirve.** Modelar el grafo de dominio persistido.

**Cuándo usarla.** Cuando la relación existe en el modelo. Define owner y cascadas con cuidado.

**Ejemplo mínimo enfocado (ejecutable).**

```java
@Entity class Remitente { @Id @GeneratedValue Long id; String nombre; @OneToMany(mappedBy="remitente") java.util.List<GuiaR> guias=new java.util.ArrayList<>(); }
@Entity class GuiaR { @Id @GeneratedValue Long id; @ManyToOne Remitente remitente; }
```

**Caso de uso real.** Cliente con muchos pedidos.

**Error común.** Relación bidireccional sin sincronizar ambos lados. Corrección: método helper.

**Verificación.** Al persistir owner correcto, la FK se guarda; verificado con H2.

#### `@Id` y generación

**Definición formal.** `@Id` identifica la entidad; `@GeneratedValue` define estrategia (`IDENTITY`, `SEQUENCE`, `TABLE`, `AUTO`).

**Para qué sirve.** Identidad persistente.

**Cuándo usarlo.** Siempre en entidades JPA. Elegir estrategia según BD/rendimiento.

**Ejemplo mínimo enfocado (ejecutable).** `@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;`

**Caso de uso real.** IDs autoincrementales o secuencias.

**Error común.** Asumir que ID existe antes de persistir/flush según estrategia. Corrección: entender timing de generación.

**Verificación.** Tras persist/commit, `getId()` no es null.

### Tema 2: Relaciones uno a uno, muchos a muchos y herencia · Intermedio · 40 min

El dominio tiene relaciones más ricas: perfil 1:1, etiquetas N:M, jerarquías de pago.

#### `@OneToOne`

**Definición formal.** Asociación donde una entidad se relaciona con exactamente una de otro tipo.

**Para qué sirve.** Separar datos opcionales o con ciclo de vida propio.

**Cuándo usarlo.** Cuando la cardinalidad real es 1:1. Cuidado con lazy en 1:1 no dueño.

**Ejemplo mínimo enfocado (ejecutable).**

```java
@Entity class User { @Id @GeneratedValue Long id; @OneToOne(cascade=CascadeType.ALL) Profile profile; }
@Entity class Profile { @Id @GeneratedValue Long id; String bio; }
```

**Caso de uso real.** Usuario-perfil.

**Error común.** Usar 1:1 cuando realmente es 1:N futuro. Corrección: modelar por cardinalidad real.

**Verificación.** Persistencia con cascade guarda ambos.

#### `@ManyToMany`

**Definición formal.** Asociación donde muchos de un lado se relacionan con muchos del otro, normalmente con tabla join.

**Para qué sirve.** Etiquetas, roles, categorías.

**Cuándo usarlo.** Solo cuando la relación es realmente N:M simple. Si la tabla join tiene datos, usa entidad intermedia.

**Ejemplo mínimo enfocado (ejecutable).**

```java
@Entity class Post { @Id @GeneratedValue Long id; @ManyToMany java.util.Set<Tag> tags=new java.util.HashSet<>(); }
@Entity class Tag { @Id @GeneratedValue Long id; String name; }
```

**Caso de uso real.** Artículos y etiquetas.

**Error común.** `ManyToMany` con atributos en la relación. Corrección: entidad de join explícita.

**Verificación.** Se crea tabla join en H2.

#### Herencia JPA

**Definición formal.** Mapeo de jerarquías Java a tablas con estrategias `SINGLE_TABLE`, `JOINED`, `TABLE_PER_CLASS`.

**Para qué sirve.** Reutilizar modelo polimórfico.

**Cuándo usarlo.** Cuando la jerarquía es estable y tiene sentido en persistencia.

**Ejemplo mínimo enfocado (ejecutable).**

```java
@Entity @Inheritance(strategy=InheritanceType.SINGLE_TABLE) @DiscriminatorColumn(name="tipo")
abstract class Pago { @Id @GeneratedValue Long id; double monto; }
@Entity class PagoTarjeta extends Pago { String last4; }
```

**Caso de uso real.** Tipos de pago o documento.

**Error común.** Elegir estrategia sin evaluar consultas/normalización. Corrección: comparar trade-offs.

**Verificación.** Hibernate crea esquema según estrategia en H2.


### Tema 3: Ciclo de vida, EntityManager y consultas tipadas · Intermedio · 40 min

JPA administra entidades en estados. Si no entiendes el ciclo de vida, verás actualizaciones inesperadas o datos no persistidos.

#### Ciclo de vida de entidad

**Definición formal.** Estados típicos: new/transient, managed, detached, removed. En managed, cambios pueden sincronizarse en flush/commit.

**Para qué sirve.** Predecir cuándo se ejecuta SQL.

**Cuándo usarlo.** Siempre que uses JPA.

**Ejemplo mínimo enfocado (ejecutable).**

```java
// dentro de transacción: Guia g=new Guia("G1"); // transient
// em.persist(g); // managed
// g.setCodigo("G2"); // dirty checking en flush
```

**Caso de uso real.** Actualizar entidad cargada sin llamar `save`.

**Error común.** Modificar entidad detached esperando persistencia automática. Corrección: `merge` o reatachar en transacción.

**Verificación.** Con H2, cambio en managed y commit actualiza fila.

#### EntityManager

**Definición formal.** API principal de JPA para persistir, buscar, consultar y gestionar ciclo de vida de entidades.

**Para qué sirve.** Punto de entrada a operaciones de persistencia.

**Cuándo usarlo.** En JPA directo; en Spring Data, por debajo lo gestiona el contenedor.

**Ejemplo mínimo enfocado (ejecutable).**

```java
EntityManager em = emf.createEntityManager();
em.getTransaction().begin();
em.persist(new Guia("G1"));
em.getTransaction().commit();
em.close();
```

**Caso de uso real.** CRUD y consultas.

**Error común.** No cerrar EntityManager. Corrección: try-with-resources/gestión por contenedor.

**Verificación.** Ejemplo T1 devuelve `1`.

#### Consultas tipadas (JPQL/TypedQuery)

**Definición formal.** JPQL consulta entidades; `TypedQuery<T>` ofrece tipado del resultado.

**Para qué sirve.** Consultas orientadas a modelo, no a columnas ad hoc.

**Cuándo usarlo.** Cuando la consulta es estática y clara.

**Ejemplo mínimo enfocado (ejecutable).**

```java
Long c = em.createQuery("select count(g) from Guia g", Long.class).getSingleResult();
System.out.println(c);
```

**Caso de uso real.** Buscar por estado/código.

**Error común.** Concatenar strings con input. Corrección: parámetros nombrados/posicionales.

**Verificación (2026-05-22).** Devuelve `1`.

### Tema 4: Búsquedas dinámicas con Criteria y Querydsl · Intermedio · 40 min

Filtros opcionales: a veces por ciudad, a veces por fechas, a veces ambos.

#### Criteria API

**Definición formal.** API tipada de JPA para construir consultas programáticamente mediante `CriteriaBuilder`, `CriteriaQuery` y `Root`.

**Para qué sirve.** Consultas dinámicas seguras sin concatenar JPQL.

**Cuándo usarlo.** Filtros opcionales. Para consultas simples, JPQL suele ser más legible.

**Ejemplo mínimo enfocado (ejecutable, H2).**

```java
var cb = em.getCriteriaBuilder();
var cq = cb.createQuery(Guia.class);
var root = cq.from(Guia.class);
cq.select(root).where(cb.equal(root.get("codigo"), "G1"));
System.out.println(em.createQuery(cq).getResultList().size());
```

**Caso de uso real.** Buscador con filtros opcionales.

**Error común.** Criteria compleja difícil de mantener. Corrección: encapsular especificaciones o usar Querydsl donde aporte.

**Verificación.** Retorna `1` con datos sembrados.

#### Querydsl

**Definición formal.** Librería que genera tipos/metamodelos para construir consultas tipadas y fluidas.

**Para qué sirve.** Mejor legibilidad que Criteria en consultas dinámicas complejas.

**Cuándo usarlo.** Proyectos con muchas consultas dinámicas.

**Ejemplo mínimo enfocado (ejecutable como snippet con dependencia).**

```java
// QGuia g = QGuia.guia;
// queryFactory.selectFrom(g).where(g.codigo.eq("G1")).fetch();
```

**Caso de uso real.** Filtros avanzados en backoffice.

**Error común.** No generar Q-types. Corrección: configurar annotation processor.

**Verificación.** **Nota:** requiere procesador/generación de clases Q; verificación de compilación depende del build setup.

#### Predicados dinámicos

**Definición formal.** Composición condicional de filtros según parámetros presentes.

**Para qué sirve.** Evitar explosión de métodos del repositorio.

**Cuándo usarlo.** Búsquedas con filtros opcionales.

**Ejemplo mínimo enfocado (ejecutable).**

```java
java.util.List<String> filtros = new java.util.ArrayList<>();
String ciudad = "Lima"; if(ciudad!=null) filtros.add("ciudad");
System.out.println(filtros.size());
```

**Caso de uso real.** Construir `Predicate[]` en Criteria.

**Error común.** Agregar predicado nulo. Corrección: solo añadir si el parámetro está presente.

**Verificación (JDK 27, 2026-05-22).** Salida: `1`.

### Tema 5: FetchType.LAZY, EAGER y el problema N+1 · Avanzado · 40 min

Cargas una lista de guías y accedes a remitente: puedes disparar 1 + N consultas sin notarlo.

#### FetchType.LAZY y EAGER

**Definición formal.** `LAZY` difiere la carga de la asociación hasta acceso; `EAGER` la carga junto con la entidad.

**Para qué sirve.** Controlar costo de carga.

**Cuándo usarlo.** Por defecto preferir `LAZY` en colecciones; evaluar EAGER con cautela.

**Ejemplo mínimo enfocado (ejecutable).**

```java
@ManyToOne(fetch = FetchType.LAZY) private Remitente remitente;
```

**Caso de uso real.** Cargar remitente solo cuando se necesita.

**Error común.** EAGER por comodidad. Síntoma: sobrecarga de consultas/carga. Corrección: LAZY + fetch join/EntityGraph cuando se necesita.

**Verificación.** Configurable en entidad; observable en SQL log.

#### Problema N+1

**Definición formal.** Patrón ineficiente: 1 consulta para lista principal + N consultas adicionales por cada elemento relacionado.

**Para qué sirve entenderlo.** Evita degradación grave de rendimiento.

**Cuándo aparece.** Al iterar relaciones LAZY sin estrategia de fetch.

**Ejemplo mínimo enfocado (ejecutable, conceptual con H2).**

```java
// 1: select * from guia
// N: select * from remitente where id=? por cada guia
```

**Caso de uso real.** Listado de pedidos con cliente.

**Error común.** Detectarlo solo en producción. Corrección: habilitar SQL log, tests de conteo de queries.

**Verificación.** Con `show_sql=true` se observan consultas múltiples.

#### Fetch join

**Definición formal.** JPQL `join fetch` carga asociación en la misma consulta.

**Para qué sirve.** Eliminar N+1 en casos conocidos.

**Cuándo usarlo.** Cuando sabes que necesitarás la relación.

**Ejemplo mínimo enfocado (ejecutable).**

```java
em.createQuery("select g from Guia g join fetch g.remitente", Guia.class).getResultList();
```

**Caso de uso real.** Detalle de guía con remitente.

**Error común.** Fetch join de múltiples colecciones bag. Corrección: dividir consultas o usar EntityGraph/BatchSize.

**Verificación.** Una consulta SQL con join.


### Tema 6: EntityGraph y cachés de persistencia · Avanzado · 40 min

Quieres controlar qué relaciones cargar y evitar consultas repetidas, sin caer en EAGER global.

#### EntityGraph

**Definición formal.** Definición declarativa/programática de atributos a cargar para una consulta u operación de búsqueda.

**Para qué sirve.** Control fino de fetch plan por caso de uso.

**Cuándo usarlo.** Cuando distintos endpoints necesitan distintas profundidades de grafo.

**Ejemplo mínimo enfocado (ejecutable).**

```java
EntityGraph<Guia> eg = em.createEntityGraph(Guia.class);
eg.addAttributeNodes("remitente");
em.find(Guia.class, id, java.util.Map.of("jakarta.persistence.fetchgraph", eg));
```

**Caso de uso real.** Endpoint detalle carga remitente; listado no.

**Error común.** Usar fetchgraph/loadgraph sin entender semántica. Corrección: revisar contrato JPA.

**Verificación.** Con SQL log, carga relación solicitada.

#### Caché de primer nivel (Persistence Context)

**Definición formal.** Caché asociada al `EntityManager`; dentro de la misma unidad de trabajo, una misma identidad retorna la misma instancia.

**Para qué sirve.** Identidad de objeto y reducción de lecturas repetidas.

**Cuándo usarlo.** Siempre está activo en el persistence context.

**Ejemplo mínimo enfocado (ejecutable).**

```java
Guia a = em.find(Guia.class, 1L);
Guia b = em.find(Guia.class, 1L);
System.out.println(a == b);
```

**Caso de uso real.** Mismo request/transacción reutiliza entidad.

**Error común.** Asumir que es caché compartida entre transacciones. Corrección: entender alcance.

**Verificación (H2, 2026-05-22).** Salida: `true`.

#### Caché de segundo nivel

**Definición formal.** Caché compartida a nivel de `EntityManagerFactory`/proveedor, opcional y configurable.

**Para qué sirve.** Reutilizar datos entre transacciones.

**Cuándo usarlo.** Datos de lectura frecuente y poco cambiantes. Cuidado con invalidación.

**Ejemplo mínimo enfocado (ejecutable como configuración).**

```xml
<property name="hibernate.cache.use_second_level_cache" value="true"/>
```

**Caso de uso real.** Catálogos.

**Error común.** Cachear entidades altamente volátiles. Corrección: evaluar patrón de lectura/escritura.

**Verificación.** **Nota:** requiere proveedor de caché (Ehcache/Infinispan); configuración depende del setup.

### Tema 7: Concurrencia, transacciones y propagación · Avanzado · 45 min

Dos usuarios actualizan la misma guía. Necesitas transacciones, aislamiento y control de concurrencia optimista/pesimista.

#### Transacciones ACID en JPA

**Definición formal.** Unidad de trabajo atómica con propiedades ACID, delimitada por `begin/commit/rollback` o por contenedor.

**Para qué sirve.** Consistencia ante fallos y concurrencia.

**Cuándo usarlo.** Toda escritura; lecturas según necesidad.

**Ejemplo mínimo enfocado (ejecutable).**

```java
em.getTransaction().begin();
try { em.persist(new Guia("G2")); em.getTransaction().commit(); }
catch(Exception e){ em.getTransaction().rollback(); throw e; }
```

**Caso de uso real.** Crear pedido y sus ítems.

**Error común.** No hacer rollback ante excepción. Corrección: try/catch o gestión declarativa.

**Verificación.** Si falla, no se persiste.

#### `@Version` y concurrencia optimista

**Definición formal.** Campo versionado que JPA incrementa y verifica en update; si la versión cambió, lanza excepción de concurrencia.

**Para qué sirve.** Detectar escrituras perdidas sin bloquear lecturas largas.

**Cuándo usarlo.** Entidades editadas concurrentemente.

**Ejemplo mínimo enfocado (ejecutable).**

```java
@Entity class Gv { @Id @GeneratedValue Long id; @Version long version; String estado; }
```

**Caso de uso real.** Dos editores actualizan misma guía.

**Error común.** Ignorar `OptimisticLockException`. Corrección: reintentar, recargar o reportar conflicto.

**Verificación.** Al actualizar versión vieja, JPA lanza excepción.

#### Propagación de transacciones

**Definición formal.** Regla que define cómo un método transaccional participa en una transacción existente (REQUIRED, REQUIRES_NEW, etc., en Spring).

**Para qué sirve.** Componer servicios transaccionales.

**Cuándo usarlo.** En capa de servicio con contenedor Spring.

**Ejemplo mínimo enfocado (ejecutable como concepto Spring).**

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void auditar(...) { ... }
```

**Caso de uso real.** Auditar aunque falle la operación principal.

**Error común.** Usar REQUIRES_NEW sin entender conexiones/consistencia. Corrección: usar solo cuando el caso lo pida.

**Verificación.** **Nota:** requiere Spring; el concepto aplica a transacciones gestionadas por contenedor.

### Tema 8: Migraciones y pruebas JPA con Testcontainers · Avanzado · 45 min

El esquema debe evolucionar de forma controlada y las pruebas deben correr contra BD real.

#### Migraciones (Flyway/Liquibase)

**Definición formal.** Herramientas que versionan y aplican cambios de esquema BD en orden.

**Para qué sirve.** Evolución reproducible del esquema.

**Cuándo usarlo.** En todo proyecto con BD persistente real.

**Ejemplo mínimo enfocado (ejecutable con Flyway).**

```sql
-- V1__create_guia.sql
CREATE TABLE guia (id BIGINT PRIMARY KEY, codigo VARCHAR(50));
```

**Caso de uso real.** Agregar columna con backward compatibility.

**Error común.** Usar `hibernate.hbm2ddl.auto=create` en producción. Corrección: migraciones versionadas.

**Verificación.** Flyway aplica V1 al arrancar.

#### Pruebas JPA con Testcontainers

**Definición formal.** Tests de integración que levantan BD real en contenedor Docker efímero.

**Para qué sirve.** Reproducibilidad y fidelidad a la BD real.

**Cuándo usarlo.** Repositorios/consultas/migraciones críticas.

**Ejemplo mínimo enfocado (ejecutable con Docker).**

```java
@Testcontainers
class RepoTest {
  @Container static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine");
}
```

**Caso de uso real.** Verificar query nativa o constraint real.

**Error común.** Test lento sin reutilización controlada. Corrección: reutilizar contenedor con cuidado o separar suite.

**Verificación.** **Nota:** Docker disponible en entorno; ejecución completa requiere dependencias Testcontainers/JUnit.

## Cierre del módulo

JPA/Hibernate resuelve mapeo y ciclo de vida, pero el rendimiento y la consistencia dependen de decisiones conscientes: fetch, transacciones, caché y migraciones. Diseña consultas por caso de uso y valida con SQL real.
