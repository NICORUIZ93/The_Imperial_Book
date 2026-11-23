# Módulo 16: JPA e Hibernate

JPA es la especificación estándar de Java para mapear objetos a bases relacionales y administrar su ciclo de vida. Hibernate es la implementación más común. La promesa es productiva: trabajas con entidades y consultas orientadas al modelo, no con SQL manual en cada método. El costo real aparece cuando olvidas que debajo sigue habiendo SQL, transacciones, planes de ejecución, cardinalidades y locks.

Este módulo construye `tienda-aurora-jpa` con H2 para el día a día, Hibernate 7, consultas Criteria y Querydsl, `@Version`, EntityGraph, Flyway y una prueba contra PostgreSQL real con Testcontainers. El objetivo no es memorizar anotaciones, sino entender qué genera JPA y cómo detectar problemas como N+1 u optimistic locking.

## Visual del módulo

**Visual (diagram-design, estático; fuente `visuals/temas/java/modulo-16-jpa.html`; regeneración: editar el HTML/SVG en esa ruta):** [Mapa JPA: entidades, EntityManager, consultas, SQL real, N+1 y EntityGraph](/visuals/temas/java/modulo-16-jpa.html)

Lectura: JPA abstrae el mapeo, no el costo. El SQL generado y la estrategia de carga deben ser visibles.

## Proyecto desde cero

#### Prerrequisitos

```bash
java -version
gradle --version
docker version
```

La prueba de PostgreSQL usa Testcontainers; necesita un daemon Docker accesible. El resto del módulo funciona sin Docker.

#### Bootstrap

```bash
mkdir -p tienda-aurora-jpa/src/main/java/com/aurora/jpa/{dominio,repositorio,servicio}
mkdir -p tienda-aurora-jpa/src/main/resources/META-INF
mkdir -p tienda-aurora-jpa/src/main/resources/db/migration
mkdir -p tienda-aurora-jpa/src/test/java/com/aurora/jpa
cd tienda-aurora-jpa
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-11-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25, Hibernate 7.0.0.Final, H2 2.3.232, Jakarta Persistence 3.2.0, Querydsl 5.1.0 (clasificador `jakarta`), Flyway 12.4.0, Testcontainers 2.0.5, PostgreSQL driver 42.7.14 e imagen `postgres:16-alpine`.

#### Estructura final

```text
tienda-aurora-jpa/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    ├── main/java/com/aurora/jpa/
    │   ├── DemoN1.java
    │   ├── DemoSql.java
    │   ├── DemoSqlLog.java
    │   ├── SqlCapture.java
    │   ├── dominio/{Cliente,Direccion,Pedido,LineaPedido,Etiqueta,Pago,PagoTarjeta,PagoTransferencia}.java
    │   ├── repositorio/PedidoRepositorio.java
    │   └── servicio/PedidoServicio.java
    ├── main/resources/
    │   ├── META-INF/persistence.xml
    │   ├── db/migration/V1__aurora.sql
    │   └── simplelogger.properties
    └── test/java/com/aurora/jpa/
        ├── JpaAuroraTest.java
        └── JpaPostgresTest.java
```

Las clases `QPedido`, `QLineaPedido`, etc., se generan en `build/generated/sources/annotationProcessor/java/main` durante `compileJava`; no se escriben a mano.

## Build y configuración

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-jpa"
```

#### `build.gradle.kts`

La tarea `demoN1` apunta a `com.aurora.jpa.DemoN1`, que existe y muestra el SQL capturado. Querydsl necesita el procesador de anotaciones con el clasificador `jakarta`. Las dos supresiones de `-Xlint` son exclusivas de código generado y metadatos de dependencias; el código propio sigue compilando con `-Werror`.

```kotlin
plugins {
    java
    application
}

application {
    mainClass = "com.aurora.jpa.DemoSql"
}

group = "com.aurora"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.hibernate.orm:hibernate-core:7.0.0.Final")
    implementation("com.h2database:h2:2.3.232")
    implementation("jakarta.persistence:jakarta.persistence-api:3.2.0")
    implementation("org.slf4j:slf4j-simple:2.0.17")
    implementation("com.querydsl:querydsl-jpa:5.1.0:jakarta")
    annotationProcessor("com.querydsl:querydsl-apt:5.1.0:jakarta")
    annotationProcessor("jakarta.persistence:jakarta.persistence-api:3.2.0")

    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testImplementation("org.testcontainers:testcontainers:2.0.5")
    testImplementation("org.testcontainers:testcontainers-junit-jupiter:2.0.5")
    testImplementation("org.testcontainers:testcontainers-postgresql:2.0.5")
    testImplementation("org.postgresql:postgresql:42.7.14")
    testImplementation("org.flywaydb:flyway-core:12.4.0")
    testImplementation("org.flywaydb:flyway-database-postgresql:12.4.0")
}

tasks.test {
    useJUnitPlatform()
    systemProperty("org.jboss.logging.provider", "slf4j")
    testLogging {
        events("passed", "skipped", "failed")
    }
}

tasks.withType<JavaExec>().configureEach {
    systemProperty("org.jboss.logging.provider", "slf4j")
}

tasks.register<JavaExec>("demoN1") {
    group = "verification"
    description = "Muestra el SQL real del N+1 y su corrección con EntityGraph"
    classpath = sourceSets.main.get().runtimeClasspath
    mainClass = "com.aurora.jpa.DemoN1"
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Xlint:-processing", "-Xlint:-classfile", "-Xlint:-this-escape", "-Werror"))
}
```

#### `src/main/resources/META-INF/persistence.xml`

`auroraPU` usa H2 con `create-drop` para aprendizaje y tests. `auroraPostgresPU` usa `validate`: el esquema debe venir de Flyway, no de Hibernate. La URL se sobrescribe en el test con el puerto efímero de Testcontainers.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="https://jakarta.ee/xml/ns/persistence" version="3.0">
  <persistence-unit name="auroraPU">
    <provider>org.hibernate.jpa.HibernatePersistenceProvider</provider>
    <class>com.aurora.jpa.dominio.Cliente</class>
    <class>com.aurora.jpa.dominio.Direccion</class>
    <class>com.aurora.jpa.dominio.Pedido</class>
    <class>com.aurora.jpa.dominio.LineaPedido</class>
    <class>com.aurora.jpa.dominio.Pago</class>
    <class>com.aurora.jpa.dominio.PagoTarjeta</class>
    <class>com.aurora.jpa.dominio.PagoTransferencia</class>
    <class>com.aurora.jpa.dominio.Etiqueta</class>
    <exclude-unlisted-classes>true</exclude-unlisted-classes>
    <properties>
      <property name="jakarta.persistence.jdbc.driver" value="org.h2.Driver"/>
      <property name="jakarta.persistence.jdbc.url" value="jdbc:h2:mem:aurora;DB_CLOSE_DELAY=-1"/>
      <property name="jakarta.persistence.jdbc.user" value="sa"/>
      <property name="jakarta.persistence.jdbc.password" value=""/>
      <property name="hibernate.hbm2ddl.auto" value="create-drop"/>
      <property name="hibernate.show_sql" value="false"/>
      <property name="hibernate.format_sql" value="false"/>
    </properties>
  </persistence-unit>

  <persistence-unit name="auroraPostgresPU" transaction-type="RESOURCE_LOCAL">
    <provider>org.hibernate.jpa.HibernatePersistenceProvider</provider>
    <class>com.aurora.jpa.dominio.Cliente</class>
    <class>com.aurora.jpa.dominio.Direccion</class>
    <class>com.aurora.jpa.dominio.Pedido</class>
    <class>com.aurora.jpa.dominio.LineaPedido</class>
    <class>com.aurora.jpa.dominio.Pago</class>
    <class>com.aurora.jpa.dominio.PagoTarjeta</class>
    <class>com.aurora.jpa.dominio.PagoTransferencia</class>
    <class>com.aurora.jpa.dominio.Etiqueta</class>
    <exclude-unlisted-classes>true</exclude-unlisted-classes>
    <properties>
      <property name="jakarta.persistence.jdbc.driver" value="org.postgresql.Driver"/>
      <property name="jakarta.persistence.jdbc.url" value="jdbc:postgresql://localhost:5432/aurora"/>
      <property name="jakarta.persistence.jdbc.user" value="postgres"/>
      <property name="jakarta.persistence.jdbc.password" value="postgres"/>
      <property name="hibernate.hbm2ddl.auto" value="validate"/>
      <property name="hibernate.show_sql" value="false"/>
    </properties>
  </persistence-unit>
</persistence>
```

#### `src/main/resources/db/migration/V1__aurora.sql`

Migración Flyway aplicada antes de abrir el `EntityManagerFactory` de PostgreSQL. Si una columna no coincide con el mapeo, `validate` falla en arranque.

```sql
CREATE TABLE direcciones (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    ciudad VARCHAR(255) NOT NULL,
    linea1 VARCHAR(255) NOT NULL
);

CREATE TABLE clientes (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    direccion_id BIGINT NOT NULL UNIQUE REFERENCES direcciones (id)
);

CREATE TABLE etiquetas (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE pedidos (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    creado_en TIMESTAMP(6) NOT NULL,
    fecha DATE NOT NULL,
    version BIGINT NOT NULL,
    cliente_id BIGINT NOT NULL REFERENCES clientes (id)
);

CREATE TABLE lineas_pedido (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    cantidad INTEGER NOT NULL,
    sku VARCHAR(255) NOT NULL,
    pedido_id BIGINT NOT NULL REFERENCES pedidos (id)
);

CREATE TABLE pedido_etiqueta (
    pedido_id BIGINT NOT NULL REFERENCES pedidos (id),
    etiqueta_id BIGINT NOT NULL REFERENCES etiquetas (id),
    PRIMARY KEY (pedido_id, etiqueta_id)
);

CREATE TABLE pagos (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    tipo_pago VARCHAR(31) NOT NULL,
    monto NUMERIC(38,2) NOT NULL,
    ultimos4 VARCHAR(255),
    banco VARCHAR(255)
);
```

#### `src/main/resources/simplelogger.properties`

Mantiene las demos legibles: los eventos de arranque no tapan el SQL capturado ni los contadores.

```properties
org.slf4j.simpleLogger.defaultLogLevel=error
org.slf4j.simpleLogger.showDateTime=false
```

### Tema 1: Entidades y relaciones JPA · Avanzado · 45 min

Una entidad JPA es un objeto cuyo estado se puede persistir y recargar desde una tabla. No es cualquier POJO: necesita identidad (`@Id`), mapeo y un ciclo de vida administrado por el `EntityManager`. La identidad de entidad no es lo mismo que igualdad Java por todos los campos; en JPA la identidad suele girar alrededor de la clave primaria y del contexto de persistencia.

Las relaciones expresan cómo se conectan entidades: `@OneToOne`, `@ManyToOne`, `@OneToMany`, `@ManyToMany`. El mapeo correcto depende de la cardinalidad real del negocio y de quién es dueño de la relación. Un error común es modelar todo como `@ManyToMany` o usar entidades donde solo se necesita un valor.

#### `src/main/java/com/aurora/jpa/dominio/Direccion.java`

```java
package com.aurora.jpa.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "direcciones")
public class Direccion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String ciudad;
    @Column(nullable = false) private String linea1;
    protected Direccion() {}
    public Direccion(String ciudad, String linea1) { this.ciudad = ciudad; this.linea1 = linea1; }
    public Long getId() { return id; }
    public String getCiudad() { return ciudad; }
    public String getLinea1() { return linea1; }
}
```

#### `src/main/java/com/aurora/jpa/dominio/Cliente.java`

`Cliente` tiene una `Direccion` con `@OneToOne` LAZY y `CascadeType.ALL`. El lado dueño usa `@JoinColumn` con `unique=true`, lo que refleja que una dirección pertenece a un solo cliente en este modelo.

```java
package com.aurora.jpa.dominio;

import jakarta.persistence.*;

@Entity
@Table(name = "clientes")
public class Cliente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String nombre;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, optional = false)
    @JoinColumn(name = "direccion_id", nullable = false, unique = true)
    private Direccion direccion;

    protected Cliente() {}
    public Cliente(String email, String nombre, Direccion direccion) {
        this.email = email; this.nombre = nombre; this.direccion = direccion;
    }
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getNombre() { return nombre; }
    public Direccion getDireccion() { return direccion; }
}
```

### Tema 2: Relaciones uno a uno, muchos a muchos y herencia · Avanzado · 45 min

#### One-to-one

El `@OneToOne` entre `Cliente` y `Direccion` impone cardinalidad 1:1 con restricción única. El test `oneToOneYRestriccionUnica` intenta reutilizar la misma dirección para otro cliente y espera una excepción por la restricción de base de datos. Las anotaciones JPA declaran el mapeo; la base de datos debe reforzar invariantes.

#### Many-to-many

`Pedido` tiene etiquetas con `@ManyToMany`. Es apropiado cuando una etiqueta puede pertenecer a muchos pedidos y un pedido puede tener muchas etiquetas. Se usa `@JoinTable` para la tabla intermedia. Si la relación necesita atributos propios (fecha, rol, prioridad), suele ser mejor modelar una entidad intermedia explícita.

#### Herencia

`Pago` define una jerarquía con `SINGLE_TABLE`. `PagoTarjeta` y `PagoTransferencia` comparten tabla y se distinguen por `tipo_pago`. Es eficiente para lecturas polimórficas simples, pero concentra columnas de subclases en una sola tabla y permite columnas nullables según tipo.

#### `src/main/java/com/aurora/jpa/dominio/Pago.java`

```java
package com.aurora.jpa.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "pagos")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_pago")
public abstract class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private BigDecimal monto;

    protected Pago() {
    }

    protected Pago(BigDecimal monto) {
        this.monto = monto;
    }

    public Long getId() { return id; }
    public BigDecimal getMonto() { return monto; }
    public abstract String tipo();
}
```

#### `src/main/java/com/aurora/jpa/dominio/PagoTarjeta.java`

```java
package com.aurora.jpa.dominio;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.math.BigDecimal;

@Entity
@DiscriminatorValue("TARJETA")
public class PagoTarjeta extends Pago {

    private String ultimos4;

    protected PagoTarjeta() {
    }

    public PagoTarjeta(BigDecimal monto, String ultimos4) {
        super(monto);
        this.ultimos4 = ultimos4;
    }

    @Override
    public String tipo() { return "TARJETA"; }
    public String getUltimos4() { return ultimos4; }
}
```

#### `src/main/java/com/aurora/jpa/dominio/PagoTransferencia.java`

```java
package com.aurora.jpa.dominio;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.math.BigDecimal;

@Entity
@DiscriminatorValue("TRANSFERENCIA")
public class PagoTransferencia extends Pago {

    private String banco;

    protected PagoTransferencia() {
    }

    public PagoTransferencia(BigDecimal monto, String banco) {
        super(monto);
        this.banco = banco;
    }

    @Override
    public String tipo() { return "TRANSFERENCIA"; }
    public String getBanco() { return banco; }
}
```

### Tema 3: Ciclo de vida, EntityManager y consultas tipadas · Avanzado · 45 min

El `EntityManager` administra el contexto de persistencia. Una entidad puede estar en estado **transient** (nueva, no conocida), **managed** (administrada por el contexto), **detached** (ya no administrada) o **removed**. `persist` hace managed una entidad transient; `flush` sincroniza cambios pendientes con la BD; `clear` desasocia entidades; `find` recarga por id.

En `PedidoServicio.demoCicloVida()` se crea un cliente, se persiste, se hace `flush`, se obtiene id, se llama `clear` y luego `find`. Esto evidencia el paso transient → managed → BD → detached/recarga.

#### `src/main/java/com/aurora/jpa/dominio/LineaPedido.java`

```java
package com.aurora.jpa.dominio;

import jakarta.persistence.*;

@Entity
@Table(name = "lineas_pedido")
public class LineaPedido {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false) private Pedido pedido;
    @Column(nullable = false) private String sku;
    @Column(nullable = false) private int cantidad;
    protected LineaPedido() {}
    LineaPedido(Pedido pedido, String sku, int cantidad) { this.pedido = pedido; this.sku = sku; this.cantidad = cantidad; }
    public Long getId() { return id; }
    public String getSku() { return sku; }
    public int getCantidad() { return cantidad; }
}
```

#### `src/main/java/com/aurora/jpa/dominio/Etiqueta.java`

```java
package com.aurora.jpa.dominio;

import jakarta.persistence.*;
import java.util.Objects;

@Entity @Table(name = "etiquetas")
public class Etiqueta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String nombre;
    protected Etiqueta() {}
    public Etiqueta(String nombre) {
        this.nombre = Objects.requireNonNull(nombre, "nombre").trim();
        if (this.nombre.isEmpty()) throw new IllegalArgumentException("nombre vacío");
    }
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
}
```

#### `src/main/java/com/aurora/jpa/dominio/Pedido.java`

`Pedido` es el agregado principal: cliente (`ManyToOne` LAZY), líneas (`OneToMany` con cascade y orphanRemoval), etiquetas (`ManyToMany`), `@Version` para locking optimista y `@PrePersist` para timestamp. El timestamp usa `Clock.systemUTC()`; el test verifica el rango `[antes, después]` en vez de compararlo con una fecha literal, para no acoplar la prueba a un valor fijo del reloj.

```java
package com.aurora.jpa.dominio;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LineaPedido> lineas = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "pedido_etiqueta",
            joinColumns = @JoinColumn(name = "pedido_id"),
            inverseJoinColumns = @JoinColumn(name = "etiqueta_id"))
    private List<Etiqueta> etiquetas = new ArrayList<>();

    @Version
    private long version;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    protected Pedido() {
        // Requerido por JPA
    }

    public Pedido(LocalDate fecha, Cliente cliente) {
        this.fecha = Objects.requireNonNull(fecha, "fecha");
        this.cliente = Objects.requireNonNull(cliente, "cliente");
    }

    /**
     * Marca de auditoría derivada del reloj del sistema. No es una fecha fija de
     * fixture: el test verifica el rango [antes, después] para no acoplarse a un valor literal.
     */
    @PrePersist
    void antesDePersistir() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.now(Clock.systemUTC());
        }
    }

    public void agregarLinea(String sku, int cantidad) {
        String skuNormalizado = Objects.requireNonNull(sku, "sku").trim();
        if (skuNormalizado.isEmpty()) {
            throw new IllegalArgumentException("sku no puede estar vacío");
        }
        if (cantidad <= 0) {
            throw new IllegalArgumentException("cantidad debe ser > 0");
        }
        lineas.add(new LineaPedido(this, skuNormalizado, cantidad));
    }

    public void reprogramar(LocalDate nuevaFecha) {
        this.fecha = Objects.requireNonNull(nuevaFecha, "nuevaFecha");
    }

    public Long getId() { return id; }
    public LocalDate getFecha() { return fecha; }
    public Cliente getCliente() { return cliente; }
    public List<LineaPedido> getLineas() { return Collections.unmodifiableList(lineas); }
    public List<Etiqueta> getEtiquetas() { return Collections.unmodifiableList(etiquetas); }
    public void agregarEtiqueta(Etiqueta etiqueta) { etiquetas.add(Objects.requireNonNull(etiqueta, "etiqueta")); }
    public long getVersion() { return version; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
}
```

### Tema 4: Búsquedas dinámicas con Criteria y Querydsl · Avanzado · 45 min

JPQL es útil cuando la consulta es fija. Cuando los filtros son opcionales (fecha puede venir o no, SKU puede venir o no), concatenar strings JPQL es frágil. Criteria API construye la consulta de forma tipada y programática; Querydsl ofrece la misma idea con tipos generados por un procesador de anotaciones.

`PedidoRepositorio.buscarDinamico` agrega predicados solo cuando existen. `buscarDinamicoQuerydsl` expresa lo mismo con `QPedido` y `BooleanBuilder`. El test `querydslDinamica` comprueba que ambas devuelven el mismo pedido. Los tipos `Q*` se generan en `build/generated/sources/annotationProcessor/java/main/com/aurora/jpa/dominio` al compilar; no se versionan.

#### `src/main/java/com/aurora/jpa/repositorio/PedidoRepositorio.java`

```java
package com.aurora.jpa.repositorio;

import com.aurora.jpa.dominio.Pedido;
import com.aurora.jpa.dominio.QPedido;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQuery;
import jakarta.persistence.EntityGraph;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class PedidoRepositorio {

    private final EntityManager em;

    public PedidoRepositorio(EntityManager em) {
        this.em = Objects.requireNonNull(em, "em");
    }

    /** Consulta base: carga pedidos, pero cliente queda LAZY. */
    public List<Pedido> pedidosPorFecha(LocalDate fecha) {
        TypedQuery<Pedido> q = em.createQuery(
                "select p from Pedido p where p.fecha = :fecha order by p.id", Pedido.class);
        q.setParameter("fecha", fecha);
        return q.getResultList();
    }

    /** Corrección con join fetch: una sola consulta SQL. */
    public List<Pedido> pedidosConClienteJoinFetch(LocalDate fecha) {
        TypedQuery<Pedido> q = em.createQuery(
                "select distinct p from Pedido p join fetch p.cliente where p.fecha = :fecha order by p.id",
                Pedido.class);
        q.setParameter("fecha", fecha);
        return q.getResultList();
    }

    /** Corrección declarativa por caso de uso. */
    public List<Pedido> pedidosConClientePorFecha(LocalDate fecha) {
        EntityGraph<Pedido> graph = em.createEntityGraph(Pedido.class);
        graph.addAttributeNodes("cliente");
        TypedQuery<Pedido> q = em.createQuery(
                "select p from Pedido p where p.fecha = :fecha order by p.id", Pedido.class);
        q.setParameter("fecha", fecha);
        q.setHint("jakarta.persistence.fetchgraph", graph);
        return q.getResultList();
    }

    /** Filtros opcionales sin concatenar JPQL. */
    public List<Pedido> buscarDinamico(LocalDate fecha, String sku) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Pedido> cq = cb.createQuery(Pedido.class);
        Root<Pedido> root = cq.from(Pedido.class);
        cq.select(root).distinct(true);

        List<Predicate> predicates = new ArrayList<>();
        if (fecha != null) {
            predicates.add(cb.equal(root.get("fecha"), fecha));
        }
        if (sku != null && !sku.isBlank()) {
            predicates.add(cb.equal(root.join("lineas").get("sku"), sku.trim()));
        }
        cq.where(predicates.toArray(Predicate[]::new));
        cq.orderBy(cb.asc(root.get("id")));
        return em.createQuery(cq).getResultList();
    }

    /** Misma consulta dinámica con tipos generados por Querydsl. */
    public List<Pedido> buscarDinamicoQuerydsl(LocalDate fecha, String sku) {
        QPedido p = QPedido.pedido;
        BooleanBuilder filtros = new BooleanBuilder();
        if (fecha != null) {
            filtros.and(p.fecha.eq(fecha));
        }
        if (sku != null && !sku.isBlank()) {
            filtros.and(p.lineas.any().sku.eq(sku.trim()));
        }
        return new JPAQuery<>(em)
                .select(p).from(p)
                .where(filtros)
                .distinct()
                .orderBy(p.id.asc())
                .fetch();
    }
}
```

### Tema 5: FetchType.LAZY, EAGER y el problema N+1 · Avanzado · 45 min

`FetchType.LAZY` difiere la carga de una relación hasta que se accede. `EAGER` la carga antes. LAZY suele ser el default seguro porque evita traer grafos enormes sin querer. El problema de LAZY es que, si accedes a la relación dentro de un loop, puedes disparar una consulta por elemento: el clásico N+1.

`DemoSql` consulta pedidos por fecha y accede a `pedido.getCliente().getNombre()`. `DemoN1` usa `SqlCapture` (un `StatementInspector`) para mostrar cada SQL y `hibernate.generate_statistics` para contar sentencias preparadas. La salida real es `SQL_COUNT=4` sin grafo (1 consulta de pedidos + 3 de clientes) y `SQL_COUNT=1` con EntityGraph. `demoN1` es la tarea que muestra esa evidencia.

EAGER no es la solución automática al N+1: puede causar cargas masivas en otros casos de uso. La solución es elegir la estrategia de carga por caso de uso y observar el SQL real.

#### `src/main/java/com/aurora/jpa/DemoSql.java`

```java
package com.aurora.jpa;
import com.aurora.jpa.dominio.Pedido;
import com.aurora.jpa.repositorio.PedidoRepositorio;
import com.aurora.jpa.servicio.PedidoServicio;
import jakarta.persistence.Persistence;
import java.time.LocalDate;
import java.util.List;
public class DemoSql {
  public static void main(String[] args) {
    var emf = Persistence.createEntityManagerFactory("auroraPU");
    var svc = new PedidoServicio(emf);
    svc.seed();
    var stats = emf.unwrap(org.hibernate.SessionFactory.class).getStatistics();
    stats.setStatisticsEnabled(true);
    stats.clear();
    svc.query(em -> { List<Pedido> ps = new PedidoRepositorio(em).pedidosPorFecha(LocalDate.of(2026,11,20)); for (Pedido p: ps) p.getCliente().getNombre(); return null; });
    System.out.println("sinGraph="+stats.getPrepareStatementCount());
    stats.clear();
    svc.query(em -> { List<Pedido> ps = new PedidoRepositorio(em).pedidosConClientePorFecha(LocalDate.of(2026,11,20)); for (Pedido p: ps) p.getCliente().getNombre(); return null; });
    System.out.println("conGraph="+stats.getPrepareStatementCount());
    emf.close();
  }
}
```

#### `src/main/java/com/aurora/jpa/SqlCapture.java`

```java
package com.aurora.jpa;

import org.hibernate.resource.jdbc.spi.StatementInspector;

import java.io.Serial;
import java.util.ArrayList;
import java.util.List;

public class SqlCapture implements StatementInspector {
    @Serial
    private static final long serialVersionUID = 1L;
    static final List<String> SQL = new ArrayList<>();

    public static void clear() { SQL.clear(); }
    public static List<String> all() { return List.copyOf(SQL); }

    @Override
    public String inspect(String sql) {
        SQL.add(sql);
        return sql;
    }
}
```

#### `src/main/java/com/aurora/jpa/DemoN1.java`

```java
package com.aurora.jpa;

import com.aurora.jpa.dominio.Pedido;
import com.aurora.jpa.repositorio.PedidoRepositorio;
import com.aurora.jpa.servicio.PedidoServicio;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class DemoN1 {
    public static void main(String[] args) {
        Map<String, String> props = new HashMap<>();
        props.put("hibernate.session_factory.statement_inspector", "com.aurora.jpa.SqlCapture");
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("auroraPU", props);
        PedidoServicio servicio = new PedidoServicio(emf);
        servicio.seed();
        Statistics stats = emf.unwrap(SessionFactory.class).getStatistics();
        stats.setStatisticsEnabled(true);

        SqlCapture.clear();
        stats.clear();
        servicio.query(em -> {
            List<Pedido> pedidos = new PedidoRepositorio(em).pedidosPorFecha(LocalDate.of(2026, 11, 20));
            for (Pedido p : pedidos) {
                System.out.println("pedido=" + p.getId() + " cliente=" + p.getCliente().getNombre());
            }
            return null;
        });
        System.out.println("SQL_COUNT=" + stats.getPrepareStatementCount());
        for (String sql : SqlCapture.all()) {
            System.out.println("SQL: " + sql.replaceAll("\\s+", " ").trim());
        }

        System.out.println("---ENTITY_GRAPH---");
        SqlCapture.clear();
        stats.clear();
        servicio.query(em -> {
            List<Pedido> pedidos = new PedidoRepositorio(em).pedidosConClientePorFecha(LocalDate.of(2026, 11, 20));
            for (Pedido p : pedidos) {
                System.out.println("pedido=" + p.getId() + " cliente=" + p.getCliente().getNombre());
            }
            return null;
        });
        System.out.println("SQL_COUNT=" + stats.getPrepareStatementCount());
        for (String sql : SqlCapture.all()) {
            System.out.println("SQL: " + sql.replaceAll("\\s+", " ").trim());
        }
        emf.close();
    }
}
```

### Tema 6: EntityGraph y cachés de persistencia · Avanzado · 45 min

`EntityGraph` declara qué atributos cargar para una consulta específica. Es más expresivo que poner EAGER en todas partes porque el grafo se aplica por caso de uso. En `PedidoRepositorio.pedidosConClientePorFecha` se usa `jakarta.persistence.fetchgraph` y la salida de `demoN1` confirma una sola consulta SQL.

Las cachés en JPA tienen niveles. La caché de primer nivel es el propio `EntityManager`: dentro de un contexto, encontrar la misma entidad por id puede devolver la misma instancia administrada. La caché de segundo nivel es opcional y compartida entre contextos; puede mejorar lecturas, pero introduce invalidación, consistencia y complejidad operativa. No se debe activar por defecto sin medir y entender la semántica de consistencia.

### Tema 7: Concurrencia, transacciones y propagación · Avanzado · 45 min

Las transacciones delimitan una unidad de trabajo atómica. JPA opera normalmente dentro de transacciones; `flush` sincroniza con la BD, `commit` confirma. En concurrencia, dos usuarios pueden leer el mismo dato y actualizarlo. El locking optimista usa `@Version`: si otra transacción actualizó la fila, el `flush`/`commit` falla con `OptimisticLockException`.

`PedidoServicio.demoOptimista()` abre dos `EntityManager`, carga el mismo pedido, modifica fechas distintas, hace flush/commit del primero y espera que el segundo falle. El test lo verifica.

La propagación de transacciones (REQUIRED, REQUIRES_NEW, etc.) pertenece a Spring/JTA: define cómo se comporta un método transaccional cuando ya existe una transacción. Aquí se maneja transacción explícita con `EntityTransaction`; la base es la misma: límites claros y comportamiento ante fallos.

#### `src/main/java/com/aurora/jpa/servicio/PedidoServicio.java`

```java
package com.aurora.jpa.servicio;

import com.aurora.jpa.dominio.Cliente;
import com.aurora.jpa.dominio.Direccion;
import com.aurora.jpa.dominio.Etiqueta;
import com.aurora.jpa.dominio.PagoTarjeta;
import com.aurora.jpa.dominio.PagoTransferencia;
import com.aurora.jpa.dominio.Pedido;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.OptimisticLockException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;
import java.util.function.Consumer;
import java.util.function.Function;

public final class PedidoServicio {

    private final EntityManagerFactory emf;

    public PedidoServicio(EntityManagerFactory emf) {
        this.emf = Objects.requireNonNull(emf, "emf");
    }

    public void seed() {
        tx(em -> {
            Cliente ana = new Cliente("ana@aurora.test", "Ana", new Direccion("Lima", "Av. 1"));
            Cliente bruno = new Cliente("bruno@aurora.test", "Bruno", new Direccion("Cusco", "Av. 2"));
            Cliente carla = new Cliente("carla@aurora.test", "Carla", new Direccion("Arequipa", "Av. 3"));
            em.persist(ana);
            em.persist(bruno);
            em.persist(carla);

            Etiqueta urgente = new Etiqueta("urgente");
            Etiqueta web = new Etiqueta("web");
            em.persist(urgente);
            em.persist(web);

            Pedido p1 = new Pedido(LocalDate.of(2026, 11, 20), ana);
            p1.agregarLinea("CAF-100", 2);
            p1.agregarEtiqueta(urgente);
            p1.agregarEtiqueta(web);
            Pedido p2 = new Pedido(LocalDate.of(2026, 11, 20), bruno);
            p2.agregarLinea("MOL-200", 1);
            p2.agregarEtiqueta(web);
            Pedido p3 = new Pedido(LocalDate.of(2026, 11, 20), carla);
            p3.agregarLinea("FIL-300", 3);
            em.persist(p1);
            em.persist(p2);
            em.persist(p3);

            em.persist(new PagoTarjeta(new BigDecimal("39.90"), "4242"));
            em.persist(new PagoTransferencia(new BigDecimal("79.90"), "Banco Aurora"));
        });
    }

    public long contarPedidos() {
        return query(em -> em.createQuery("select count(p) from Pedido p", Long.class).getSingleResult());
    }

    /** Demuestra transient->managed->flush->clear->detached->find. */
    public boolean demoCicloVida() {
        return txRet(em -> {
            Cliente c = new Cliente("tmp@aurora.test", "Tmp", new Direccion("Piura", "Calle 1"));
            em.persist(c);
            em.flush(); // fuerza INSERT, transacción sigue activa
            Long id = Objects.requireNonNull(c.getId(), "id asignado tras flush/persist");
            em.clear(); // desasocia todas las entidades managed
            Cliente recargado = em.find(Cliente.class, id);
            return recargado != null && em.contains(c) == false;
        });
    }

    /**
     * Simula dos transacciones concurrentes sobre el mismo pedido.
     * La segunda debe fallar con OptimisticLockException por @Version.
     */
    public String demoOptimista() {
        Long id = txRet(em -> {
            Cliente c = new Cliente("lock@aurora.test", "Lock", new Direccion("Tacna", "Calle 9"));
            Pedido p = new Pedido(LocalDate.of(2026, 11, 21), c);
            p.agregarLinea("CAF-100", 1);
            em.persist(c);
            em.persist(p);
            em.flush();
            return p.getId();
        });

        EntityManager em1 = emf.createEntityManager();
        EntityManager em2 = emf.createEntityManager();
        EntityTransaction tx1 = em1.getTransaction();
        EntityTransaction tx2 = em2.getTransaction();
        try {
            tx1.begin();
            tx2.begin();

            Pedido a = em1.find(Pedido.class, id);
            Pedido b = em2.find(Pedido.class, id);
            a.reprogramar(LocalDate.of(2026, 11, 22));
            b.reprogramar(LocalDate.of(2026, 11, 23));

            em1.flush();
            tx1.commit();

            try {
                em2.flush();
                tx2.commit();
                return "ok";
            } catch (RuntimeException e) {
                if (tx2.isActive()) tx2.rollback();
                Throwable cause = e;
                while (cause != null) {
                    if (cause instanceof OptimisticLockException) {
                        return "OptimisticLockException";
                    }
                    cause = cause.getCause();
                }
                return e.getClass().getSimpleName();
            }
        } catch (RuntimeException e) {
            if (tx1.isActive()) tx1.rollback();
            if (tx2.isActive()) tx2.rollback();
            throw e;
        } finally {
            if (em1.isOpen()) em1.close();
            if (em2.isOpen()) em2.close();
        }
    }

    public void tx(Consumer<EntityManager> work) {
        txRet(em -> {
            work.accept(em);
            return null;
        });
    }

    public <T> T txRet(Function<EntityManager, T> work) {
        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();
            T result = work.apply(em);
            tx.commit();
            return result;
        } catch (RuntimeException e) {
            if (tx.isActive()) tx.rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public <T> T query(Function<EntityManager, T> work) {
        EntityManager em = emf.createEntityManager();
        try {
            return work.apply(em);
        } finally {
            em.close();
        }
    }
}
```

### Tema 8: Migraciones y pruebas JPA con Testcontainers · Avanzado · 50 min

H2 `create-drop` es cómodo para aprendizaje, pero no demuestra que el esquema y el mapeo funcionen en el motor de producción. La prueba `JpaPostgresTest` levanta `postgres:16-alpine` con Testcontainers, aplica `V1__aurora.sql` con Flyway, abre `auroraPostgresPU` con `hibernate.hbm2ddl.auto=validate`, siembra datos con `PedidoServicio` y ejecuta repositorios JPQL, EntityGraph y Querydsl contra PostgreSQL real.

**Por qué existe:** H2 puede aceptar SQL o inferir tipos distinto de PostgreSQL. Testcontainers da una instancia efímera y aislada por corrida; Flyway convierte el esquema en un artefacto versionado; `validate` falla rápido si entidad y migración divergen.

**Implicación práctica:** `@Container` gestiona el ciclo de vida del contenedor. La URL, usuario y contraseña se toman del contenedor y se pasan como overrides a `Persistence.createEntityManagerFactory`. La migración se ejecuta antes de abrir el `EntityManagerFactory`. Si Docker no está disponible, esta prueba no puede ejecutarse; el resto del módulo sí.

#### `src/test/java/com/aurora/jpa/JpaPostgresTest.java`

```java
package com.aurora.jpa;

import com.aurora.jpa.dominio.Pedido;
import com.aurora.jpa.repositorio.PedidoRepositorio;
import com.aurora.jpa.servicio.PedidoServicio;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Testcontainers
class JpaPostgresTest {

    @Container
    @SuppressWarnings("rawtypes")
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    private static EntityManagerFactory emf;
    private static int migraciones;

    @BeforeAll
    static void arrancar() throws Exception {
        Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .locations("classpath:db/migration")
                .load()
                .migrate();

        try (Connection c = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
             Statement st = c.createStatement();
             ResultSet rs = st.executeQuery("SELECT count(*) FROM flyway_schema_history WHERE success = true")) {
            rs.next();
            migraciones = rs.getInt(1);
        }

        emf = Persistence.createEntityManagerFactory("auroraPostgresPU", Map.of(
                "jakarta.persistence.jdbc.url", POSTGRES.getJdbcUrl(),
                "jakarta.persistence.jdbc.user", POSTGRES.getUsername(),
                "jakarta.persistence.jdbc.password", POSTGRES.getPassword(),
                "jakarta.persistence.jdbc.driver", "org.postgresql.Driver"));
    }

    @AfterAll
    static void cerrar() {
        if (emf != null) emf.close();
    }

    @Test
    void flywayYRepositorioConPostgresReal() {
        PedidoServicio servicio = new PedidoServicio(emf);
        servicio.seed();
        List<Pedido> pedidos = servicio.query(em -> new PedidoRepositorio(em)
                .pedidosPorFecha(LocalDate.of(2026, 11, 20)));
        List<Pedido> querydsl = servicio.query(em -> new PedidoRepositorio(em)
                .buscarDinamicoQuerydsl(LocalDate.of(2026, 11, 20), "CAF-100"));
        List<String> nombres = servicio.query(em -> new PedidoRepositorio(em)
                .pedidosConClientePorFecha(LocalDate.of(2026, 11, 20)).stream()
                .map(p -> p.getCliente().getNombre())
                .toList());

        System.out.println("POSTGRES_MIGRACIONES=" + migraciones);
        System.out.println("POSTGRES_PEDIDOS=" + pedidos.size());
        System.out.println("POSTGRES_QUERYDSL=" + querydsl.size());
        System.out.println("POSTGRES_CLIENTES=" + nombres);

        assertEquals(1, migraciones);
        assertEquals(3, pedidos.size());
        assertEquals(1, querydsl.size());
        assertTrue(nombres.contains("Ana"));
    }
}
```

## Pruebas

#### `src/test/java/com/aurora/jpa/JpaAuroraTest.java`

Verifica restricción 1:1, herencia SINGLE_TABLE, ciclo de vida y rango de `@PrePersist`, Criteria dinámica, Querydsl, N+1 vs EntityGraph con estadísticas de Hibernate y `OptimisticLockException`.

```java
package com.aurora.jpa;

import com.aurora.jpa.dominio.Cliente;
import com.aurora.jpa.dominio.Direccion;
import com.aurora.jpa.dominio.Pago;
import com.aurora.jpa.dominio.Pedido;
import com.aurora.jpa.repositorio.PedidoRepositorio;
import com.aurora.jpa.servicio.PedidoServicio;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JpaAuroraTest {

    static EntityManagerFactory emf;
    static PedidoServicio servicio;

    @BeforeAll
    static void setup() {
        emf = Persistence.createEntityManagerFactory("auroraPU");
        servicio = new PedidoServicio(emf);
        servicio.seed();
    }

    @AfterAll
    static void close() {
        if (emf != null) emf.close();
    }

    @Test
    void oneToOneYRestriccionUnica() {
        RuntimeException ex = assertThrows(RuntimeException.class, () -> servicio.tx(em -> {
            Direccion dir = em.find(Cliente.class, 1L).getDireccion();
            Cliente otro = new Cliente("otro@aurora.test", "Otro", dir);
            em.persist(otro);
            em.flush();
        }));
        assertNotNull(ex);
    }

    @Test
    void herenciaSingleTable() {
        Long pagos = servicio.query(em -> em.createQuery("select count(p) from Pago p", Long.class).getSingleResult());
        List<Pago> lista = servicio.query(em -> em.createQuery("select p from Pago p order by p.id", Pago.class).getResultList());
        assertEquals(2L, pagos);
        assertEquals("TARJETA", lista.get(0).tipo());
        assertEquals("TRANSFERENCIA", lista.get(1).tipo());
    }

    @Test
    void cicloVidaYCallback() {
        assertTrue(servicio.demoCicloVida());
        LocalDateTime antes = LocalDateTime.now(Clock.systemUTC());
        Long id = servicio.txRet(em -> {
            Cliente cliente = em.find(Cliente.class, 1L);
            Pedido pedido = new Pedido(LocalDate.of(2026, 11, 24), cliente);
            pedido.agregarLinea("AUD-001", 1);
            em.persist(pedido);
            return pedido.getId();
        });
        LocalDateTime despues = LocalDateTime.now(Clock.systemUTC());
        Pedido pedido = servicio.query(em -> em.find(Pedido.class, id));
        assertAll("callback de auditoría",
                () -> assertNotNull(pedido.getCreadoEn()),
                () -> assertFalse(pedido.getCreadoEn().isBefore(antes), "creadoEn no puede ser anterior al inicio"),
                () -> assertFalse(pedido.getCreadoEn().isAfter(despues), "creadoEn no puede ser posterior al fin"));
        assertTrue(servicio.contarPedidos() >= 3);
    }

    @Test
    void criteriaDinamica() {
        List<Pedido> pedidos = servicio.query(em -> new PedidoRepositorio(em)
                .buscarDinamico(LocalDate.of(2026, 11, 20), "CAF-100"));
        assertEquals(1, pedidos.size());
    }

    @Test
    void querydslDinamica() {
        List<Pedido> conCriteria = servicio.query(em -> new PedidoRepositorio(em)
                .buscarDinamico(LocalDate.of(2026, 11, 20), "CAF-100"));
        List<Pedido> conQuerydsl = servicio.query(em -> new PedidoRepositorio(em)
                .buscarDinamicoQuerydsl(LocalDate.of(2026, 11, 20), "CAF-100"));

        assertEquals(1, conCriteria.size());
        assertEquals(1, conQuerydsl.size());
        assertEquals(conCriteria.get(0).getId(), conQuerydsl.get(0).getId());
    }

    @Test
    void nPlusUnoYEntityGraph() {
        Statistics stats = emf.unwrap(SessionFactory.class).getStatistics();
        stats.setStatisticsEnabled(true);

        stats.clear();
        long sinGraph = servicio.query(em -> {
            PedidoRepositorio repo = new PedidoRepositorio(em);
            List<Pedido> pedidos = repo.pedidosPorFecha(LocalDate.of(2026, 11, 20));
            for (Pedido p : pedidos) {
                p.getCliente().getNombre();
            }
            return stats.getPrepareStatementCount();
        });

        stats.clear();
        long conGraph = servicio.query(em -> {
            PedidoRepositorio repo = new PedidoRepositorio(em);
            List<Pedido> pedidos = repo.pedidosConClientePorFecha(LocalDate.of(2026, 11, 20));
            for (Pedido p : pedidos) {
                p.getCliente().getNombre();
            }
            return stats.getPrepareStatementCount();
        });

        assertEquals(4L, sinGraph); // 1 lista + 3 clientes
        assertEquals(1L, conGraph);
    }

    @Test
    void optimisticLock() {
        String resultado = servicio.demoOptimista();
        assertEquals("OptimisticLockException", resultado);
    }
}
```

## Verificación real

Ejecutado nuevamente el 2026-11-23 en `/tmp/opencode/aurora-m16` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25, Docker Desktop 29.9.3 con imagen `postgres:16-alpine` disponible).

```bash
cd /tmp/opencode/aurora-m16
./gradlew test --rerun-tasks --console=plain
./gradlew -q demoN1
./gradlew -q run
```

Salida observada de `./gradlew test --rerun-tasks --console=plain` (resultados de tests):

```text
JpaPostgresTest > flywayYRepositorioConPostgresReal() PASSED
JpaAuroraTest > nPlusUnoYEntityGraph() PASSED
JpaAuroraTest > herenciaSingleTable() PASSED
JpaAuroraTest > cicloVidaYCallback() PASSED
JpaAuroraTest > criteriaDinamica() PASSED
JpaAuroraTest > oneToOneYRestriccionUnica() PASSED
JpaAuroraTest > optimisticLock() PASSED
JpaAuroraTest > querydslDinamica() PASSED
BUILD SUCCESSFUL in 9s
```

Datos impresos por `JpaPostgresTest` (recolectados del reporte XML de JUnit):

```text
POSTGRES_MIGRACIONES=1
POSTGRES_PEDIDOS=3
POSTGRES_QUERYDSL=1
POSTGRES_CLIENTES=[Ana, Bruno, Carla]
```

Salida observada de `./gradlew -q demoN1`:

```text
pedido=1 cliente=Ana
pedido=2 cliente=Bruno
pedido=3 cliente=Carla
SQL_COUNT=4
SQL: select p1_0.id,p1_0.cliente_id,p1_0.creado_en,p1_0.fecha,p1_0.version from pedidos p1_0 where p1_0.fecha=? order by p1_0.id
SQL: select c1_0.id,c1_0.direccion_id,c1_0.email,c1_0.nombre from clientes c1_0 where c1_0.id=?
SQL: select c1_0.id,c1_0.direccion_id,c1_0.email,c1_0.nombre from clientes c1_0 where c1_0.id=?
SQL: select c1_0.id,c1_0.direccion_id,c1_0.email,c1_0.nombre from clientes c1_0 where c1_0.id=?
---ENTITY_GRAPH---
pedido=1 cliente=Ana
pedido=2 cliente=Bruno
pedido=3 cliente=Carla
SQL_COUNT=1
SQL: select p1_0.id,p1_0.cliente_id,c1_0.id,c1_0.direccion_id,c1_0.email,c1_0.nombre,p1_0.creado_en,p1_0.fecha,p1_0.version from pedidos p1_0 join clientes c1_0 on c1_0.id=p1_0.cliente_id where p1_0.fecha=? order by p1_0.id
```

Salida observada de `./gradlew -q run`:

```text
sinGraph=4
conGraph=1
```

`create-drop` y H2 en memoria son para aprendizaje/tests. En producción corresponde usar migraciones versionadas, un datasource real y revisar SQL/planes con datos representativos; la prueba con PostgreSQL cubre esa última frontera en esta corrida.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| N+1 consultas | LAZY accedido en loop | `Statistics.getPrepareStatementCount()`, `demoN1` | `join fetch`/EntityGraph por caso de uso |
| `LazyInitializationException` | Acceso a relación fuera de sesión | Stack trace, revisar límites transaccionales | Cargar grafo dentro de la consulta o usar DTO |
| `OptimisticLockException` | Actualización concurrente sobre misma versión | Revisar `@Version` y flujo concurrente | Reintentar o resolver conflicto |
| Duplicados en join fetch | Join de colección multiplica filas | SQL + resultado | `distinct`, consultas separadas o EntityGraph |
| Schema inesperado | `hbm2ddl.auto` en entorno equivocado | Configuración de persistence | `validate` + Flyway en PostgreSQL |
| No aparece `QPedido` | Falta procesador de anotaciones | Revisar `build/generated/sources/...` | Declarar `querydsl-apt:5.1.0:jakarta` y la API Jakarta |
| Error de compilación por warnings de código generado | `-Werror` con Q-classes o metadatos de librerías | Mensaje `this-escape`/`classfile` | Suprimir solo esos lint en `build.gradle.kts` |
| Testcontainers no arranca | Docker no disponible | Log de Ryuk/daemon | Habilitar Docker; ejecutar el resto de tests sin esa prueba |
| Flyway falla en arranque | Migración no coincide con entidades | Error de `validate` | Ajustar `V1__aurora.sql` a los tipos mapeados |

## Cierre

JPA productivo exige que el mapeo, el SQL y el esquema sean observables. Separar la carga por caso de uso, medir con estadísticas y validar contra PostgreSQL efímero convierte sospechas en evidencia. El siguiente módulo baja un nivel: JDBC explícito, DAO y transacciones, con una comparación verificada frente a JPA.

## Checklist de cierre

- [ ] Distingo entidad managed/transient/detached/removed.
- [ ] Modelo relaciones con cardinalidad real y dueño claro.
- [ ] Uso LAZY por defecto y cargo explícitamente por caso de uso.
- [ ] Detecto N+1 con stats y SQL real (`demoN1`).
- [ ] Compongo filtros con Criteria y con Querydsl generando `Q*`.
- [ ] Entiendo `@Version` y locking optimista.
- [ ] Aplico Flyway y valido el esquema contra PostgreSQL con Testcontainers.
