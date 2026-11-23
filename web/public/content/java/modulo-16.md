# Módulo 16: JPA e Hibernate

JPA es la especificación estándar de Java para mapear objetos a bases relacionales y administrar su ciclo de vida. Hibernate es la implementación más común. La promesa es productiva: trabajas con entidades y consultas orientadas al modelo, no con SQL manual en cada método. El costo real aparece cuando olvidas que debajo sigue habiendo SQL, transacciones, planes de ejecución, cardinalidades y locks.

Este módulo construye `tienda-aurora-jpa`, un proyecto pequeño con H2 en memoria, Hibernate 7 y JUnit 5. El objetivo no es memorizar anotaciones, sino entender qué genera JPA, cómo se comporta el contexto de persistencia y cómo detectar problemas como N+1 u optimistic locking.

## Visual del módulo

**Visual (diagram-design, estático; fuente `visuals/temas/java/modulo-16-jpa.html`; regeneración: editar el HTML/SVG en esa ruta):** [Mapa JPA: entidades, EntityManager, consultas, SQL real, N+1 y EntityGraph](/visuals/temas/java/modulo-16-jpa.html)

Lectura: JPA abstrae el mapeo, no el costo. El SQL generado y la estrategia de carga deben ser visibles.

## Proyecto desde cero

#### Prerrequisitos

```bash
java -version
gradle --version
```

#### Bootstrap

```bash
mkdir -p tienda-aurora-jpa/src/main/java/com/aurora/jpa/{dominio,repositorio,servicio}
mkdir -p tienda-aurora-jpa/src/main/resources/META-INF
mkdir -p tienda-aurora-jpa/src/test/java/com/aurora/jpa
cd tienda-aurora-jpa
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-05-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, Hibernate 7.0.0.Final, H2 2.3.232, Jakarta Persistence 3.2.0.

#### Estructura final

```text
tienda-aurora-jpa/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    ├── main/java/com/aurora/jpa/
    │   ├── DemoSql.java
    │   ├── dominio/{Cliente,Direccion,Pedido,LineaPedido,Etiqueta,Pago,PagoTarjeta,PagoTransferencia}.java
    │   ├── repositorio/PedidoRepositorio.java
    │   └── servicio/PedidoServicio.java
    ├── main/resources/META-INF/persistence.xml
    └── test/java/com/aurora/jpa/JpaAuroraTest.java
```

## Build y configuración

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-jpa"
```

#### `build.gradle.kts`

```kotlin
plugins { java; application }

application { mainClass = "com.aurora.jpa.DemoSql" }
group = "com.aurora"; version = "1.0.0"
java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
repositories { mavenCentral() }

dependencies {
    implementation("org.hibernate.orm:hibernate-core:7.0.0.Final")
    implementation("com.h2database:h2:2.3.232")
    implementation("jakarta.persistence:jakarta.persistence-api:3.2.0")
    implementation("org.slf4j:slf4j-simple:2.0.17")
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test { useJUnitPlatform() }
tasks.register<JavaExec>("demoN1") {
    classpath = sourceSets.main.get().runtimeClasspath
    mainClass = "com.aurora.jpa.DemoN1"
}
tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Xlint:-processing", "-Werror"))
}
```

#### `src/main/resources/META-INF/persistence.xml`

Define la unidad de persistencia `auroraPU`, las clases entidad, la conexión H2 y el modo `create-drop` para demo/tests. `create-drop` es cómodo para aprendizaje; no es estrategia de migración de producción.

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
</persistence>
```

### Tema 1: Entidades y relaciones JPA · Avanzado · 45 min

Una entidad JPA es un objeto cuyo estado se puede persistir y recargar desde una tabla. No es cualquier POJO: necesita identidad (`@Id`), mapeo y un ciclo de vida administrado por el `EntityManager`. La identidad de entidad no es lo mismo que igualdad Java por todos los campos; en JPA la identidad suele girar alrededor de la clave primaria y el contexto de persistencia.

Las relaciones expresan cómo se conectan entidades: `@OneToOne`, `@ManyToOne`, `@OneToMany`, `@ManyToMany`. El mapeo correcto depende de la cardinalidad real del negocio y de quién es dueño de la relación. Un error común es modelar todo como `@ManyToMany` o usar entidades donde solo se necesita un valor.

#### `Direccion.java`

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

#### `Cliente.java`

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

El `@OneToOne` entre `Cliente` y `Direccion` impone cardinalidad 1:1 con restricción única. El test `oneToOneYRestriccionUnica` intenta reutilizar la misma dirección para otro cliente y espera una excepción por la restricción de base de datos. Esto muestra una idea importante: las anotaciones JPA declaran el mapeo, pero la base de datos debe reforzar invariantes.

#### Many-to-many

`Pedido` tiene etiquetas con `@ManyToMany`. Es apropiado cuando una etiqueta puede pertenecer a muchos pedidos y un pedido puede tener muchas etiquetas. Se usa `@JoinTable` para la tabla intermedia. El costo de `ManyToMany` es que la tabla de unión y las consultas pueden volverse complejas; si la relación necesita atributos propios (fecha, rol, prioridad), suele ser mejor modelar una entidad intermedia explícita.

#### Herencia

`Pago` define una jerarquía con `SINGLE_TABLE`. `PagoTarjeta` y `PagoTransferencia` comparten tabla y se distinguen por `tipo_pago`. Es eficiente para lecturas polimórficas simples, pero concentra columnas de subclases en una sola tabla y permite columnas nullables según tipo. Otras estrategias (`JOINED`, `TABLE_PER_CLASS`) tienen trade-offs distintos.

```java
@Entity @Table(name = "pagos")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_pago")
public abstract class Pago {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private BigDecimal monto;
    protected Pago() {}
    protected Pago(BigDecimal monto) { this.monto = monto; }
    public Long getId() { return id; }
    public BigDecimal getMonto() { return monto; }
    public abstract String tipo();
}
```

`PagoTarjeta` y `PagoTransferencia` extienden `Pago` con `@DiscriminatorValue`.

### Tema 3: Ciclo de vida, EntityManager y consultas tipadas · Avanzado · 45 min

El `EntityManager` administra el contexto de persistencia. Una entidad puede estar en estado **transient** (nueva, no conocida), **managed** (administrada por el contexto), **detached** (ya no administrada) o **removed**. `persist` hace managed una entidad transient; `flush` sincroniza cambios pendientes con la BD; `clear` desasocia entidades; `find` recarga por id.

En `PedidoServicio.demoCicloVida()` se crea un cliente, se persiste, se hace `flush`, se obtiene id, se llama `clear` y luego `find`. Esto evidencia el paso transient → managed → BD → detached/recarga.

#### `LineaPedido.java`

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

#### `Etiqueta.java`

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

#### `Pedido.java`

`Pedido` es el agregado principal: tiene cliente (`ManyToOne` LAZY), líneas (`OneToMany` con cascade y orphanRemoval), etiquetas (`ManyToMany`), `@Version` para locking optimista y `@PrePersist` para timestamp.

```java
package com.aurora.jpa.dominio;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name = "pedidos")
public class Pedido {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private LocalDate fecha;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false) private Cliente cliente;
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LineaPedido> lineas = new ArrayList<>();
    @ManyToMany
    @JoinTable(name = "pedido_etiqueta",
            joinColumns = @JoinColumn(name = "pedido_id"),
            inverseJoinColumns = @JoinColumn(name = "etiqueta_id"))
    private List<Etiqueta> etiquetas = new ArrayList<>();
    @Version private long version;
    @Column(name = "creado_en", nullable = false, updatable = false) private LocalDateTime creadoEn;

    protected Pedido() {}
    public Pedido(LocalDate fecha, Cliente cliente) {
        this.fecha = Objects.requireNonNull(fecha, "fecha");
        this.cliente = Objects.requireNonNull(cliente, "cliente");
    }
    @PrePersist void antesDePersistir() {
        if (creadoEn == null) creadoEn = LocalDateTime.of(2026, 11, 22, 10, 0);
    }
    public void agregarLinea(String sku, int cantidad) {
        String skuNormalizado = Objects.requireNonNull(sku, "sku").trim();
        if (skuNormalizado.isEmpty()) throw new IllegalArgumentException("sku no puede estar vacío");
        if (cantidad <= 0) throw new IllegalArgumentException("cantidad debe ser > 0");
        lineas.add(new LineaPedido(this, skuNormalizado, cantidad));
    }
    public void agregarEtiqueta(Etiqueta etiqueta) { etiquetas.add(Objects.requireNonNull(etiqueta, "etiqueta")); }
    public void reprogramar(LocalDate nuevaFecha) { this.fecha = Objects.requireNonNull(nuevaFecha, "nuevaFecha"); }
    public Long getId() { return id; }
    public LocalDate getFecha() { return fecha; }
    public Cliente getCliente() { return cliente; }
    public List<LineaPedido> getLineas() { return Collections.unmodifiableList(lineas); }
    public List<Etiqueta> getEtiquetas() { return Collections.unmodifiableList(etiquetas); }
    public long getVersion() { return version; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
}
```

### Tema 4: Búsquedas dinámicas con Criteria y Querydsl · Avanzado · 45 min

JPQL es útil cuando la consulta es fija. Cuando los filtros son opcionales (fecha puede venir o no, SKU puede venir o no), concatenar strings JPQL es frágil y propenso a errores o inyección si se hace mal. Criteria API construye la consulta de forma tipada y programática.

`PedidoRepositorio.buscarDinamico` agrega predicados solo cuando existen. El test `criteriaDinamica` busca pedidos por fecha y SKU y espera un resultado. Querydsl ofrece una experiencia similar con tipos generados; en este proyecto se muestra Criteria porque es parte estándar de JPA. El punto conceptual es el mismo: consultas dinámicas deben construirse con estructura, no con concatenación ad hoc.

```java
public List<Pedido> buscarDinamico(LocalDate fecha, String sku) {
    CriteriaBuilder cb = em.getCriteriaBuilder();
    CriteriaQuery<Pedido> cq = cb.createQuery(Pedido.class);
    Root<Pedido> root = cq.from(Pedido.class);
    cq.select(root).distinct(true);
    List<Predicate> predicates = new ArrayList<>();
    if (fecha != null) predicates.add(cb.equal(root.get("fecha"), fecha));
    if (sku != null && !sku.isBlank()) predicates.add(cb.equal(root.join("lineas").get("sku"), sku.trim()));
    cq.where(predicates.toArray(Predicate[]::new));
    cq.orderBy(cb.asc(root.get("id")));
    return em.createQuery(cq).getResultList();
}
```

### Tema 5: FetchType.LAZY, EAGER y el problema N+1 · Avanzado · 45 min

`FetchType.LAZY` difiere la carga de una relación hasta que se accede. `EAGER` la carga antes. LAZY suele ser el default seguro porque evita traer grafos enormes sin querer. El problema de LAZY es que, si accedes a la relación dentro de un loop, puedes disparar una consulta por elemento: el clásico N+1.

En `DemoSql`, se consultan pedidos por fecha y luego se accede a `pedido.getCliente().getNombre()`. Sin grafo, Hibernate emite 1 consulta para pedidos y 3 para clientes: `sinGraph=4`. Con EntityGraph, trae cliente en la misma consulta: `conGraph=1`.

EAGER no es la solución automática al N+1: puede causar cargas masivas en otros casos de uso. La solución es elegir la estrategia de carga por caso de uso y observar el SQL real.

### Tema 6: EntityGraph y cachés de persistencia · Avanzado · 45 min

`EntityGraph` declara qué atributos cargar para una consulta específica. Es más expresivo que poner EAGER en todas partes porque el grafo se aplica por caso de uso. En `PedidoRepositorio.pedidosConClientePorFecha` se usa `jakarta.persistence.fetchgraph`.

Las cachés en JPA tienen niveles. La caché de primer nivel es el propio `EntityManager`: dentro de una transacción/contexto, encontrar la misma entidad por id puede devolver la misma instancia administrada. La caché de segundo nivel es opcional y compartida entre contextos; puede mejorar lecturas, pero introduce invalidación, consistencia y complejidad operativa. No se debe activar por defecto sin medir y entender la semántica de consistencia.

### Tema 7: Concurrencia, transacciones y propagación · Avanzado · 45 min

Las transacciones delimitan una unidad de trabajo atómica. JPA opera normalmente dentro de transacciones; `flush` sincroniza con la BD, `commit` confirma. En concurrencia, dos usuarios pueden leer el mismo dato y actualizarlo. El locking optimista usa `@Version`: si otra transacción actualizó la fila, el commit/fllush falla con `OptimisticLockException`.

`PedidoServicio.demoOptimista()` abre dos `EntityManager`, carga el mismo pedido, modifica fechas distintas, hace flush/commit del primero y espera que el segundo falle. El test lo verifica.

La propagación de transacciones (REQUIRED, REQUIRES_NEW, etc.) es un concepto clave en Spring/JTA: define cómo se comporta un método transaccional cuando ya existe una transacción. En este módulo JPA puro se maneja transacción explícita con `EntityTransaction`; el concepto de propagación se retoma con Spring, pero la base es la misma: límites transaccionales claros y comportamiento ante fallos.

#### `PedidoRepositorio.java`

```java
package com.aurora.jpa.repositorio;

import com.aurora.jpa.dominio.Pedido;
import jakarta.persistence.*;
import jakarta.persistence.criteria.*;
import java.time.LocalDate;
import java.util.*;

public final class PedidoRepositorio {
    private final EntityManager em;
    public PedidoRepositorio(EntityManager em) { this.em = Objects.requireNonNull(em, "em"); }

    public List<Pedido> pedidosPorFecha(LocalDate fecha) {
        TypedQuery<Pedido> q = em.createQuery("select p from Pedido p where p.fecha = :fecha order by p.id", Pedido.class);
        q.setParameter("fecha", fecha);
        return q.getResultList();
    }

    public List<Pedido> pedidosConClienteJoinFetch(LocalDate fecha) {
        TypedQuery<Pedido> q = em.createQuery(
                "select distinct p from Pedido p join fetch p.cliente where p.fecha = :fecha order by p.id", Pedido.class);
        q.setParameter("fecha", fecha);
        return q.getResultList();
    }

    public List<Pedido> pedidosConClientePorFecha(LocalDate fecha) {
        EntityGraph<Pedido> graph = em.createEntityGraph(Pedido.class);
        graph.addAttributeNodes("cliente");
        TypedQuery<Pedido> q = em.createQuery("select p from Pedido p where p.fecha = :fecha order by p.id", Pedido.class);
        q.setParameter("fecha", fecha);
        q.setHint("jakarta.persistence.fetchgraph", graph);
        return q.getResultList();
    }

    public List<Pedido> buscarDinamico(LocalDate fecha, String sku) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Pedido> cq = cb.createQuery(Pedido.class);
        Root<Pedido> root = cq.from(Pedido.class);
        cq.select(root).distinct(true);
        List<Predicate> predicates = new ArrayList<>();
        if (fecha != null) predicates.add(cb.equal(root.get("fecha"), fecha));
        if (sku != null && !sku.isBlank()) predicates.add(cb.equal(root.join("lineas").get("sku"), sku.trim()));
        cq.where(predicates.toArray(Predicate[]::new));
        cq.orderBy(cb.asc(root.get("id")));
        return em.createQuery(cq).getResultList();
    }
}
```

#### `PedidoServicio.java` (extracto de responsabilidad)

`PedidoServicio` encapsula `EntityManagerFactory`, transacciones, seed, y demos de ciclo de vida/locking. En producción este rol suele dividirse entre repositorios y servicios transaccionales; aquí se mantiene compacto para ver el ciclo completo.

## Pruebas

`JpaAuroraTest` verifica restricción 1:1, herencia SINGLE_TABLE, ciclo de vida/`@PrePersist`, Criteria dinámica, N+1 vs EntityGraph con estadísticas de Hibernate, y `OptimisticLockException`.

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m16` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, Hibernate 7.0.0.Final, H2 2.3.232).

```bash
./gradlew -q test
./gradlew -q run
```

Resultados observados:

- `test`: 0 fallas (6 pruebas JUnit 5).
- `run`: `sinGraph=4`, `conGraph=1`. Hibernate emite logs INFO de arranque/H2/schema; son esperados en demo con `create-drop`.

**Nota honesta:** `create-drop` y H2 en memoria son para aprendizaje/tests. En producción usa migraciones (Flyway/Liquibase), configuración de datasource real, y revisa SQL/planes con datos representativos.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| N+1 consultas | LAZY accedido en loop | `hibernate.generate_statistics`, SQL log | `join fetch`/EntityGraph por caso de uso |
| `LazyInitializationException` | Acceso a relación fuera de sesión | Stack trace, revisar límites transaccionales | Cargar grafo necesario o DTO en consulta |
| `OptimisticLockException` | Actualización concurrente sobre misma versión | Revisar `@Version` y flujo concurrente | Reintentar, merge o resolver conflicto |
| Duplicados en join fetch | Join collection multiplica filas | SQL + resultado | `distinct`, o consultas separadas/EntityGraph |
| Schema inesperado | `hbm2ddl.auto` en entorno equivocado | Configuración de persistence | Migraciones controladas en producción |

## Checklist de cierre

- [ ] Distingo entidad managed/transient/detached/removed.
- [ ] Modelo relaciones con cardinalidad real y dueño claro.
- [ ] Uso LAZY por defecto y cargo explícitamente por caso de uso.
- [ ] Detecto N+1 con stats/logs SQL.
- [ ] Entiendo `@Version` y locking optimista.
- [ ] Sé que H2/create-drop son para demo, no producción.
