# Módulo 16: JPA, Hibernate y FetchType.LAZY vs EAGER

Persistir datos parece fácil hasta que el modelo de objetos y el modelo relacional dejan de coincidir. En memoria, un `Pedido` tiene un `Cliente` como objeto. En SQL, `pedidos` tiene una columna `cliente_id`. En memoria, navegar `pedido.getCliente().getNombre()` es acceder a un campo. En SQL, eso puede significar otra consulta. JPA existe para traducir entre esos dos mundos. Hibernate es una implementación de JPA: toma tus entidades y anotaciones, genera SQL, administra identidad, caché y transacciones.

El problema real de Tienda Aurora no es “guardar un pedido”. Es guardar un modelo correcto y leerlo sin sorpresas. Si mapeas mal una relación, la base acepta duplicados que el dominio no quería. Si cargas asociaciones con EAGER por comodidad, terminas trayendo medio grafo en cada consulta. Si usas LAZY sin plan de fetch, aparece el problema N+1: una consulta para la lista y N consultas más para cada asociación. Si dos usuarios editan el mismo pedido, necesitas una estrategia de concurrencia.

Este módulo construye `tienda-aurora-jpa`, un proyecto verificado con Gradle, Hibernate ORM 7, H2 y JUnit 5. H2 se usa para poder ejecutar pruebas reales en este entorno. PostgreSQL, Flyway y Testcontainers son la dirección correcta para entornos cercanos a producción; se explican y se dejan con nota de verificación honesta porque no se ejecutaron aquí.

**Verificación real (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.9.1, Hibernate ORM 7.0.0.Final, H2 2.3.232, JUnit 5.13.4, macOS arm64. `./gradlew -q test` pasó con 6 tests, 0 fallas. El N+1 se midió con estadísticas de Hibernate: `sinGraph=4`, `conGraph=1`.

## Proyecto desde cero: tienda-aurora-jpa

### Prerrequisitos

```bash
java -version
gradle --version
```

### Estructura

```text
tienda-aurora-jpa/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    ├── main/
    │   ├── java/com/aurora/jpa/
    │   │   ├── dominio/
    │   │   │   ├── Cliente.java
    │   │   │   ├── Direccion.java
    │   │   │   ├── LineaPedido.java
    │   │   │   ├── Pago.java
    │   │   │   ├── PagoTarjeta.java
    │   │   │   ├── PagoTransferencia.java
    │   │   │   └── Pedido.java
    │   │   ├── repositorio/
    │   │   │   └── PedidoRepositorio.java
    │   │   └── servicio/
    │   │       └── PedidoServicio.java
    │   └── resources/META-INF/
    │       └── persistence.xml
    └── test/java/com/aurora/jpa/
        └── JpaAuroraTest.java
```

## Código completo, archivo por archivo

Antes de mirar clases, ubica las piezas: `persistence.xml` configura la unidad JPA; las entidades describen el mapa objeto-relacional; el repositorio contiene consultas; el servicio controla transacciones y casos de prueba; el test verifica comportamiento observable.

### `settings.gradle.kts`

El nombre del proyecto.

```kotlin
rootProject.name = "tienda-aurora-jpa"
```

### `build.gradle.kts`

Build Gradle con Java 25, Hibernate ORM 7, H2, API JPA Jakarta y JUnit 5. H2 permite ejecutar pruebas reales en este entorno. Flyway/Testcontainers/PostgreSQL se documentan como verificación de infraestructura, no se fingen.

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

    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Xlint:-processing", "-Werror"))
}
```

### `src/main/resources/META-INF/persistence.xml`

`persistence.xml` define la unidad de persistencia `auroraPU`. Aquí se registran entidades, el driver JDBC, la URL de H2 y propiedades de Hibernate. `hibernate.hbm2ddl.auto=create-drop` crea el esquema al iniciar y lo borra al cerrar; es útil para pruebas locales, peligroso en producción.

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

### `src/main/java/com/aurora/jpa/dominio/Direccion.java`

Entidad hija de un OneToOne. Tiene identidad propia (`id`) y datos simples. JPA necesita un constructor sin argumentos; se declara `protected` para no invitar a crear entidades incompletas desde cualquier lugar.

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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ciudad;

    @Column(nullable = false)
    private String linea1;

    protected Direccion() {
    }

    public Direccion(String ciudad, String linea1) {
        this.ciudad = ciudad;
        this.linea1 = linea1;
    }

    public Long getId() { return id; }
    public String getCiudad() { return ciudad; }
    public String getLinea1() { return linea1; }
}
```

### `src/main/java/com/aurora/jpa/dominio/Cliente.java`

`Cliente` posee una `Direccion` por `@OneToOne`. La clave está en `@JoinColumn(unique=true, nullable=false)`: la restricción no vive solo en Java, vive en la base. `FetchType.LAZY` evita cargar la dirección cada vez que se carga un cliente.

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "clientes")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String nombre;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, optional = false)
    @JoinColumn(name = "direccion_id", nullable = false, unique = true)
    private Direccion direccion;

    protected Cliente() {
    }

    public Cliente(String email, String nombre, Direccion direccion) {
        this.email = email;
        this.nombre = nombre;
        this.direccion = direccion;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getNombre() { return nombre; }
    public Direccion getDireccion() { return direccion; }
}
```

### `src/main/java/com/aurora/jpa/dominio/Pedido.java`

`Pedido` es el centro del caso N+1. Tiene `@ManyToOne(fetch=LAZY)` hacia `Cliente`, `@OneToMany` hacia `LineaPedido` y `@Version` para bloqueo optimista. `LAZY` en ManyToOne significa: trae el pedido; si alguien pide el cliente, ya veremos.

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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

    @Version
    private long version;

    protected Pedido() {
    }

    public Pedido(LocalDate fecha, Cliente cliente) {
        this.fecha = fecha;
        this.cliente = cliente;
    }

    public void agregarLinea(String sku, int cantidad) {
        LineaPedido linea = new LineaPedido(this, sku, cantidad);
        lineas.add(linea);
    }

    public Long getId() { return id; }
    public LocalDate getFecha() { return fecha; }
    public Cliente getCliente() { return cliente; }
    public List<LineaPedido> getLineas() { return lineas; }
    public long getVersion() { return version; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
}
```

### `src/main/java/com/aurora/jpa/dominio/LineaPedido.java`

Entidad intermedia. Modela una línea del pedido con SKU y cantidad. Si la relación pedido-producto necesitara precio histórico, descuento o cantidad, ManyToMany simple no alcanza; una entidad intermedia sí.

```java
package com.aurora.jpa.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "lineas_pedido")
public class LineaPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Column(nullable = false)
    private String sku;

    @Column(nullable = false)
    private int cantidad;

    protected LineaPedido() {
    }

    LineaPedido(Pedido pedido, String sku, int cantidad) {
        this.pedido = pedido;
        this.sku = sku;
        this.cantidad = cantidad;
    }

    public Long getId() { return id; }
    public String getSku() { return sku; }
    public int getCantidad() { return cantidad; }
}
```

### `src/main/java/com/aurora/jpa/dominio/Pago.java`

Raíz de una jerarquía de herencia JPA. `SINGLE_TABLE` guarda todas las subclases en `pagos` con una columna discriminadora `tipo_pago`. Es simple y rápida para consultas polimórficas.

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

### `src/main/java/com/aurora/jpa/dominio/PagoTarjeta.java`

Subclase de `Pago`. Solo agrega `ultimos4`. En SINGLE_TABLE, esa columna queda en la misma tabla y será null para otras subclases.

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

### `src/main/java/com/aurora/jpa/dominio/PagoTransferencia.java`

Subclase de `Pago` para transferencias. El discriminador `TRANSFERENCIA` permite que Hibernate materialice la clase correcta al leer.

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

### `src/main/java/com/aurora/jpa/repositorio/PedidoRepositorio.java`

Repositorio de consultas. Tiene tres formas de leer pedidos: JPQL simple, JPQL con `join fetch`, Criteria dinámica y EntityGraph. La diferencia entre la consulta simple y las que hacen fetch es el corazón del N+1.

```java
package com.aurora.jpa.repositorio;

import com.aurora.jpa.dominio.Pedido;
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

public final class PedidoRepositorio {

    private final EntityManager em;

    public PedidoRepositorio(EntityManager em) {
        this.em = em;
    }

    public List<Pedido> pedidosPorFecha(LocalDate fecha) {
        TypedQuery<Pedido> q = em.createQuery(
                "select p from Pedido p where p.fecha = :fecha order by p.id", Pedido.class);
        q.setParameter("fecha", fecha);
        return q.getResultList();
    }

    public List<Pedido> pedidosConClienteJoinFetch(LocalDate fecha) {
        TypedQuery<Pedido> q = em.createQuery(
                "select distinct p from Pedido p join fetch p.cliente where p.fecha = :fecha order by p.id",
                Pedido.class);
        q.setParameter("fecha", fecha);
        return q.getResultList();
    }

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
            predicates.add(cb.equal(root.join("lineas").get("sku"), sku));
        }
        cq.where(predicates.toArray(Predicate[]::new));
        cq.orderBy(cb.asc(root.get("id")));
        return em.createQuery(cq).getResultList();
    }

    public List<Pedido> pedidosConClientePorFecha(LocalDate fecha) {
        EntityGraph<Pedido> graph = em.createEntityGraph(Pedido.class);
        graph.addAttributeNodes("cliente");
        TypedQuery<Pedido> q = em.createQuery(
                "select p from Pedido p where p.fecha = :fecha order by p.id", Pedido.class);
        q.setParameter("fecha", fecha);
        q.setHint("jakarta.persistence.fetchgraph", graph);
        return q.getResultList();
    }
}
```

### `src/main/java/com/aurora/jpa/servicio/PedidoServicio.java`

Servicio transaccional mínimo con `EntityManager`. Expone helpers `tx/query`, un seed, una demo de ciclo de vida y una demo de conflicto optimista con dos EntityManagers. La intención didáctica es ver transacciones y estado de entidades sin esconderlos detrás de magia.

```java
package com.aurora.jpa.servicio;

import com.aurora.jpa.dominio.Cliente;
import com.aurora.jpa.dominio.Direccion;
import com.aurora.jpa.dominio.PagoTarjeta;
import com.aurora.jpa.dominio.PagoTransferencia;
import com.aurora.jpa.dominio.Pedido;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.OptimisticLockException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.function.Consumer;
import java.util.function.Function;

public final class PedidoServicio {

    private final EntityManagerFactory emf;

    public PedidoServicio(EntityManagerFactory emf) {
        this.emf = emf;
    }

    public void seed() {
        tx(em -> {
            Cliente ana = new Cliente("ana@aurora.test", "Ana", new Direccion("Lima", "Av. 1"));
            Cliente bruno = new Cliente("bruno@aurora.test", "Bruno", new Direccion("Cusco", "Av. 2"));
            Cliente carla = new Cliente("carla@aurora.test", "Carla", new Direccion("Arequipa", "Av. 3"));
            em.persist(ana);
            em.persist(bruno);
            em.persist(carla);

            Pedido p1 = new Pedido(LocalDate.of(2026, 11, 20), ana);
            p1.agregarLinea("CAF-100", 2);
            Pedido p2 = new Pedido(LocalDate.of(2026, 11, 20), bruno);
            p2.agregarLinea("MOL-200", 1);
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

    public void demoCicloVida() {
        tx(em -> {
            Cliente c = new Cliente("tmp@aurora.test", "Tmp", new Direccion("Piura", "Calle 1"));
            em.persist(c); // transient -> managed
            em.flush();     // fuerza SQL pero sigue managed
            Long id = c.getId();
            em.clear();     // managed -> detached
            Cliente detached = em.find(Cliente.class, id);
            System.out.println("managedAfterClear=" + (detached != null));
        });
    }

    public String demoOptimista() throws Exception {
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
        em1.getTransaction().begin();
        em2.getTransaction().begin();
        Pedido a = em1.find(Pedido.class, id);
        Pedido b = em2.find(Pedido.class, id);
        a.setFecha(LocalDate.of(2026, 11, 22));
        b.setFecha(LocalDate.of(2026, 11, 23));
        em1.flush();
        em1.getTransaction().commit();
        em1.close();
        try {
            em2.flush();
            em2.getTransaction().commit();
            em2.close();
            return "ok";
        } catch (RuntimeException e) {
            if (em2.getTransaction().isActive()) em2.getTransaction().rollback();
            em2.close();
            Throwable cause = e;
            while (cause != null) {
                if (cause instanceof OptimisticLockException) return "OptimisticLockException";
                cause = cause.getCause();
            }
            return e.getClass().getSimpleName();
        }
    }

    public void tx(Consumer<EntityManager> work) {
        EntityManager em = emf.createEntityManager();
        try {
            em.getTransaction().begin();
            work.accept(em);
            em.getTransaction().commit();
        } catch (RuntimeException e) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public <T> T txRet(Function<EntityManager, T> work) {
        EntityManager em = emf.createEntityManager();
        try {
            em.getTransaction().begin();
            T result = work.apply(em);
            em.getTransaction().commit();
            return result;
        } catch (RuntimeException e) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
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

### `src/test/java/com/aurora/jpa/JpaAuroraTest.java`

Pruebas verificadas. No solo prueban “que no explota”: miden consultas preparadas para N+1, prueban restricción única, herencia, Criteria, ciclo de vida y `OptimisticLockException`.

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

import java.time.LocalDate;
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
    void nPlusUnoYEntityGraph() {
        Statistics stats = emf.unwrap(SessionFactory.class).getStatistics();
        stats.setStatisticsEnabled(true);

        stats.clear();
        servicio.query(em -> {
            PedidoRepositorio repo = new PedidoRepositorio(em);
            List<Pedido> pedidos = repo.pedidosPorFecha(LocalDate.of(2026, 11, 20));
            for (Pedido p : pedidos) {
                p.getCliente().getNombre();
            }
            return pedidos.size();
        });
        long sinGraph = stats.getPrepareStatementCount();

        stats.clear();
        servicio.query(em -> {
            PedidoRepositorio repo = new PedidoRepositorio(em);
            List<Pedido> pedidos = repo.pedidosConClientePorFecha(LocalDate.of(2026, 11, 20));
            for (Pedido p : pedidos) {
                p.getCliente().getNombre();
            }
            return pedidos.size();
        });
        long conGraph = stats.getPrepareStatementCount();

        assertEquals(4L, sinGraph); // 1 lista + 3 clientes
        assertEquals(1L, conGraph);
    }

    @Test
    void criteriaDinamica() {
        List<Pedido> pedidos = servicio.query(em -> new PedidoRepositorio(em)
                .buscarDinamico(LocalDate.of(2026, 11, 20), "CAF-100"));
        assertEquals(1, pedidos.size());
    }

    @Test
    void optimisticLock() throws Exception {
        String resultado = servicio.demoOptimista();
        assertEquals("OptimisticLockException", resultado);
    }

    @Test
    void cicloVida() {
        servicio.demoCicloVida();
        assertTrue(servicio.contarPedidos() >= 3);
    }
}
```

## Ejecutar

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q test
```

Resultado real:

```text
BUILD SUCCESSFUL (6 tests, 0 failures)
```

## Conceptos cubiertos

### Tema 1: Entidades y relaciones JPA · Intermedio · 35 min

Una entidad JPA es una clase Java que representa una fila o concepto persistente con identidad. La identidad es importante: dos objetos Java pueden tener los mismos datos y ser distintos objetos en memoria, pero una entidad se identifica por su `@Id`. En `Cliente`, el `id` es generado por la base (`GenerationType.IDENTITY`). Eso significa que la base asigna el valor al insertar; Hibernate lo obtiene después de la inserción.

El mapeo más simple es campo a columna: `@Column(nullable=false, unique=true)` sobre `email` no es decoración. Le dice a JPA/Hibernate que el esquema debe reflejar esa restricción y, además, comunica la intención del dominio. Si el email debe ser único, la base tiene que defender esa regla, no solo la UI.

La relación OneToOne entre `Cliente` y `Direccion` es un buen primer caso porque obliga a decidir dueño de la relación. En este modelo, `Cliente` tiene la clave foránea `direccion_id`. `@JoinColumn(name="direccion_id", unique=true, nullable=false)` hace que cada cliente apunte a una dirección, y que esa dirección no pueda ser reutilizada por otro cliente. La prueba `oneToOneYRestriccionUnica` intenta persistir otro cliente con la misma dirección y espera una excepción. Esa excepción es la señal correcta: la restricción del dominio quedó en la base.

También aparece `cascade = CascadeType.ALL`. Cascade significa “propaga operaciones de persistencia”. Si persistes un cliente nuevo con una dirección nueva, el cascade evita tener que persistir la dirección a mano. Es útil, pero peligroso si se usa sin pensar: un cascade mal puesto puede borrar o persistir grafos inesperados. Regla práctica: cascadear desde el agregado dueño hacia hijos que realmente le pertenecen.

### Tema 2: Relaciones uno a uno, muchos a muchos y herencia · Intermedio · 40 min

Las relaciones en JPA se leen en dos direcciones: el objeto Java y la tabla SQL. OneToOne significa una fila asociada a una fila. ManyToOne significa muchas filas apuntando a una. OneToMany es la vista inversa. ManyToMany parece conveniente, pero solo cuando la relación es pura asociación sin datos propios. En Tienda Aurora, una línea de pedido tiene SKU y cantidad: eso ya no es una asociación desnuda, es un concepto. Por eso `LineaPedido` es una entidad propia.

La decisión entre ManyToMany y entidad intermedia es una decisión de modelo, no de anotación. Si mañana necesitas precio unitario al momento de compra, descuento por línea o estado de preparación, la entidad intermedia ya tiene lugar para eso. Con ManyToMany puro, terminas rompiendo el modelo.

La herencia es otro punto donde objeto y relacional chocan. Java tiene herencia natural; SQL no. JPA ofrece estrategias:

- `SINGLE_TABLE`: una tabla para toda la jerarquía, con columna discriminadora. Rápida para consultas polimórficas, pero deja columnas de subclases anulables.
- `JOINED`: una tabla base y una por subclase, unidas por join. Más normalizada, pero las consultas polimórficas hacen joins.
- `TABLE_PER_CLASS`: tabla por clase concreta. Evita nulls de otras subclases, pero las consultas polimórficas pueden ser más costosas.

En `Pago`, SINGLE_TABLE es razonable porque hay pocas subclases y queremos consultar pagos sin joins. La prueba `herenciaSingleTable` crea un `PagoTarjeta` y un `PagoTransferencia`, consulta por la base `Pago` y verifica que Hibernate materializa las subclases correctas. Eso es polimorfismo persistido.

### Tema 3: Ciclo de vida, EntityManager y consultas tipadas · Intermedio · 40 min

JPA no es “SQL con anotaciones”; es un contexto de persistencia. El `EntityManager` mantiene entidades *managed*: objetos cuya identidad y cambios conoce. El ciclo de vida típico es:

- **Transient**: objeto nuevo, Java lo conoce, JPA no. No tiene fila asociada.
- **Managed**: el EntityManager lo sigue. Si cambias un campo dentro de una transacción, JPA puede detectarlo y sincronizarlo.
- **Detached**: fue managed, pero el contexto se cerró o se hizo `clear()`. Sigue teniendo datos, pero JPA ya no lo rastrea.
- **Removed**: marcado para borrado al sincronizar.

`persist()` mueve transient a managed. `flush()` empuja cambios pendientes al SQL antes del commit; no termina la transacción. `clear()` desasocia todo el contexto. En `demoCicloVida()`, se persiste un cliente, se hace flush, se guarda el id, se hace clear y se vuelve a buscar con `find`. El resultado prueba que el dato está en BD, no solo en el mapa del EntityManager. Este detalle evita un error común: creer que `clear()` borra de la base. No borra; desasocia.

Las consultas JPQL tipadas operan sobre entidades, no sobre tablas. `select p from Pedido p where p.fecha = :fecha` habla de la entidad `Pedido` y su campo `fecha`. Hibernate traduce eso a SQL. El tipo `Pedido.class` en `createQuery` hace que el resultado sea tipado, no un `List<Object[]>` ambiguo. Y el parámetro nombrado evita concatenar strings, que sería frágil e inseguro.

### Tema 4: Búsquedas dinámicas con Criteria y Querydsl · Intermedio · 40 min

Las consultas estáticas son fáciles con JPQL. El problema aparece cuando los filtros son opcionales: fecha sí/no, SKU sí/no, cliente sí/no. Concatenar JPQL a mano produce código difícil de leer y fácil de romper: espacios faltantes, `where` duplicado, parámetros mal puestos. Criteria API construye la consulta como árbol de objetos.

En `buscarDinamico`, el `CriteriaBuilder` crea predicados. Si hay fecha, agrega igualdad por fecha. Si hay SKU, hace join con líneas y compara SKU. `distinct(true)` evita duplicados cuando el join a líneas multiplica filas. El resultado se verifica en `criteriaDinamica`. La ventaja es seguridad de composición; el costo es verbosidad.

Querydsl ataca el mismo problema con una API más fluida, generando clases Q (`QPedido`, `QLineaPedido`). Se ve más cerca del dominio y menos cerca del árbol Criteria. No lo ejecuté en este build para no agregar generación de código y dependencias extra no verificadas; la decisión importante es el criterio: usa JPQL para consultas fijas, Criteria/Querydsl cuando la composición dinámica sea real.

### Tema 5: FetchType.LAZY, EAGER y el problema N+1 · Avanzado · 40 min

Este es el problema que más confunde al entrar a JPA porque el código Java se ve inocente. Mira esta línea:

```java
for (Pedido p : pedidos) {
    p.getCliente().getNombre();
}
```

En Java puro, eso es acceder a un objeto en memoria. En JPA, depende. Si el cliente ya fue cargado, solo es memoria. Si `Pedido.cliente` es LAZY y no fue inicializado, Hibernate necesita ir a la base a buscar ese cliente. Si lo haces dentro de un loop sobre 100 pedidos, puede ejecutar 100 consultas adicionales. Ese es el N+1.

La forma de pensarlo es: **1** consulta trae la lista principal, **N** consultas traen una asociación por cada elemento. No es un bug del ORM; es una consecuencia de pedir datos tarde, uno por uno. LAZY no es malo. LAZY es honesto: “no lo traje todavía”. El error es no tener plan de fetch para el caso de uso.

`FetchType.EAGER` hace lo contrario: carga la asociación al cargar la entidad principal. Suena tentador, pero es una decisión global. Si marcas `cliente` como EAGER, cada vez que cargues un pedido por cualquier motivo, vendrá el cliente. Eso puede encadenar cargas, generar joins grandes y volver lenta una pantalla que solo quería el id y la fecha. Por eso en entidades JPA se recomienda LAZY por defecto en asociaciones y fetch explícito por consulta.

En el proyecto, `PedidoRepositorio.pedidosPorFecha` solo carga pedidos:

```java
select p from Pedido p where p.fecha = :fecha order by p.id
```

Si luego tocas `p.getCliente().getNombre()`, Hibernate emite una consulta por cliente. La prueba `nPlusUnoYEntityGraph` lo mide con estadísticas de Hibernate, no por intuición. Resultado real:

```text
sinGraph=4
conGraph=1
```

`sinGraph=4` significa 1 consulta para los 3 pedidos y 3 consultas más, una por cliente. `conGraph=1` significa que una sola consulta trajo pedidos y clientes necesarios. Ese número es la evidencia.

Hay varias formas de corregir N+1, y elegir bien importa:

- **`join fetch` JPQL**: `select distinct p from Pedido p join fetch p.cliente ...`. Simple y explícito. Bueno cuando sabes exactamente qué traer. Cuidado con colecciones múltiples en el mismo query: puede multiplicar filas.
- **EntityGraph**: declaras atributos a cargar. Útil cuando quieres reutilizar la consulta base y cambiar el plan de carga. Es más declarativo.
- **DTO projection**: consultas solo las columnas necesarias y las mapeas a un DTO. Es la opción más eficiente para lecturas de pantalla, porque no carga entidades completas ni contexto de persistencia innecesario.
- **Batch fetching/subselect**: no elimina N+1, lo reduce a menos consultas. Puede ser útil cuando no puedes cambiar la consulta principal.

La corrección no es “siempre usar EAGER”. La corrección es: define el caso de uso, mide las consultas, y trae exactamente lo que ese caso necesita.

### Tema 6: EntityGraph y cachés de persistencia · Avanzado · 40 min

Un EntityGraph es un plan de carga. Le dice a JPA: “para esta consulta, incluye estos atributos”. En `pedidosConClientePorFecha` se crea un grafo y se agrega `cliente`:

```java
EntityGraph<Pedido> graph = em.createEntityGraph(Pedido.class);
graph.addAttributeNodes("cliente");
q.setHint("jakarta.persistence.fetchgraph", graph);
```

La ventaja sobre EAGER global es el alcance. EAGER cambia todas las lecturas de la entidad. EntityGraph cambia esta lectura. Eso respeta que una pantalla de listado necesita cliente, pero otra pantalla puede necesitar solo ids y fechas.

Las cachés JPA también se confunden mucho. La caché L1 es el contexto de persistencia del `EntityManager`. Si dentro del mismo EntityManager pides la misma entidad por id dos veces, la segunda normalmente vuelve desde L1. Es obligatoria y local a la unidad de trabajo. La caché L2 vive en el `EntityManagerFactory` y puede ser compartida entre contextos. Puede ahorrar lecturas, pero introduce invalidación: si otro proceso cambia la base, la L2 puede servir datos viejos si no está bien configurada. La L2 no es un “activar y listo”; requiere elegir proveedor, política, TTL, invalidación y medir hit ratio.

**Nota de verificación:** L1 se observa por comportamiento normal del EntityManager; L2 no se configuró en este proyecto para no introducir infraestructura no verificada. Si habilitas L2, prueba invalidación, concurrencia y consistencia con tu carga real.

### Tema 7: Concurrencia, transacciones y propagación · Avanzado · 45 min

Una transacción es un límite de consistencia. En JPA, normalmente abres transacción, haces trabajo, commit. Si algo falla, rollback. El problema aparece cuando dos transacciones leen el mismo dato y luego ambas intentan escribir. Sin control, la última escritura puede pisar a la anterior (lost update).

El bloqueo optimista asume que los conflictos son poco frecuentes. Se implementa con `@Version`. Hibernate incluye la versión en el `WHERE` del update; si la versión ya cambió, no actualiza ninguna fila y lanza `OptimisticLockException`. En `demoOptimista()`, dos EntityManagers cargan el mismo pedido. El primero cambia fecha, hace flush y commit. El segundo intenta flush con la versión vieja y falla. La prueba espera `OptimisticLockException`. Eso es bueno: el sistema detectó el conflicto en vez de callar una pérdida de datos.

El bloqueo pesimista es la otra estrategia: `LockModeType.PESSIMISTIC_WRITE` pide a la base bloquear la fila. Es útil cuando el conflicto es probable o el costo de reintentar es alto. Su costo es menor concurrencia y riesgo de deadlocks. No hay una opción moralmente correcta; hay trade-offs.

Propagación es un concepto más visible en Spring (`REQUIRED`, `REQUIRES_NEW`, etc.). En JPA puro, lo que ves es el límite transaccional que tú abres y cierras. Aun así, la idea es la misma: una operación de negocio debe definir si participa en una transacción existente o necesita una nueva. La regla profesional es mantener transacciones cortas, hacer trabajo externo (HTTP, colas, archivos) fuera del límite transaccional cuando sea posible, y definir claramente qué pasa ante fallo.

### Tema 8: Migraciones y pruebas JPA con Testcontainers · Avanzado · 45 min

Generar el esquema con `hbm2ddl.auto=create-drop` es cómodo en desarrollo local, pero no es una estrategia de migración. Una migración es un cambio versionado, reproducible y auditable. Si agregas una columna no nula a una tabla con datos, necesitas una estrategia: valor por defecto, backfill, despliegue en fases. `hbm2ddl` no te da ese control.

Flyway y Liquibase resuelven esto con scripts versionados. Un ejemplo Flyway:

```sql
-- V1__crear_clientes_y_pedidos.sql
CREATE TABLE clientes (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL
);
```

El punto no es la sintaxis SQL, sino el contrato: cada cambio de esquema viaja con el código, se aplica en orden y se prueba en CI.

Testcontainers levanta una base real en contenedor para tests. La diferencia con H2 es importante: H2 es rápido y práctico, pero no es PostgreSQL. Tipos, bloqueos, índices, JSONB, CTEs, collation y detalles de aislamiento pueden comportarse distinto. Un test de integración real se ve así:

```java
@Testcontainers
class PedidoRepositorioIT {
  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");
}
```

**Nota de verificación honesta:** en este entorno no ejecuté Flyway ni Testcontainers. El proyecto verificado usa H2 + JUnit 5 y pasó. Para llevarlo a nivel producción/CI, agrega `org.flywaydb:flyway-core`, `org.testcontainers:junit-jupiter` y `org.testcontainers:postgresql`, ejecuta migraciones antes de los tests y corre la suite contra PostgreSQL efímero. No reporto salidas inventadas de ese lab.

## Cierre

JPA es una capa de traducción con estado. Te ahorra SQL repetitivo, pero te cobra si no entiendes qué está haciendo. El profesional no memoriza anotaciones: entiende identidad, ciclo de vida, fetch plan, SQL generado, concurrencia y migraciones. Si puedes explicar por qué una consulta dispara 4 statements y cómo bajarla a 1 con evidencia, ya estás pensando en JPA a nivel de ingeniería, no de receta.

## Checklist

- Distingo entidad transient/managed/detached/removed y sé qué hace `flush`/`clear`.
- Modelo relaciones por el dominio: OneToOne real, entidad intermedia cuando hay atributos, herencia con estrategia consciente.
- Sé explicar N+1 desde cero y corregirlo con join fetch, EntityGraph o DTO projection según el caso.
- No uso EAGER por defecto; defino fetch plan por caso de uso.
- Sé cuándo usar bloqueo optimista (`@Version`) y cuándo pesimista.
- Trato el esquema con migraciones versionadas y uso Testcontainers para pruebas cercanas a producción.
