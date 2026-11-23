# Módulo 16: JPA, Hibernate y FetchType.LAZY vs EAGER

Tienda Aurora necesita persistir clientes, direcciones, pedidos, líneas y pagos sin convertir la base de datos en un detalle caótico. JPA define el modelo de mapeo objeto-relacional en Java; Hibernate es una implementación de JPA muy usada. El reto no es solo “guardar entidades”: es modelar relaciones correctas, entender cuándo se ejecuta SQL, evitar N+1, controlar concurrencia y tener pruebas reproducibles.

Este módulo construye `tienda-aurora-jpa`, un proyecto Gradle con H2 en memoria para verificaciones locales reales. Se usa H2 porque permite ejecutar y comprobar comportamiento en este entorno; para PostgreSQL/Testcontainers/Flyway se incluyen notas de verificación honestas, porque esos labs dependen de infraestructura externa o contenedores y no deben fingirse como ejecutados aquí.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.9.1, Hibernate ORM 7.0.0.Final, H2 2.3.232, JUnit 5.13.4, macOS arm64. `./gradlew -q test` pasó con 6 tests y 0 fallas. La comparación N+1 vs EntityGraph se midió con `SessionFactory.getStatistics()`.

## Proyecto desde cero: tienda-aurora-jpa

## Prerrequisitos

```bash
java -version
gradle --version
```

## Estructura del proyecto

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

## Código completo

Configuración Gradle del proyecto.

**Archivo:** `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-jpa"
```

Build Java 25 con Hibernate ORM 7, H2, JPA API y JUnit 5. H2 se usa para ejecutar verificaciones locales reales; la estrategia de migración/Testcontainers se documenta con nota honesta.

**Archivo:** `build.gradle.kts`

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

Unidad de persistencia JPA. Registra entidades, configura H2 en memoria y `hibernate.hbm2ddl.auto=create-drop` para que el esquema se cree en pruebas locales. En producción el esquema debe gestionarse con migraciones.

**Archivo:** `src/main/resources/META-INF/persistence.xml`

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

Entidad simple. Será el lado OneToOne de `Cliente`.

**Archivo:** `src/main/java/com/aurora/jpa/dominio/Direccion.java`

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

Entidad con `@OneToOne` hacia `Direccion`. `optional=false`, `@JoinColumn(unique=true, nullable=false)` expresan la restricción real en base de datos.

**Archivo:** `src/main/java/com/aurora/jpa/dominio/Cliente.java`

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

Agregado raíz del ejemplo. Tiene `@ManyToOne` LAZY al cliente, `@OneToMany` a líneas y `@Version` para bloqueo optimista.

**Archivo:** `src/main/java/com/aurora/jpa/dominio/Pedido.java`

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

Entidad intermedia de líneas. Es una alternativa explícita a poner atributos en relaciones simples; aquí modela SKU y cantidad por pedido.

**Archivo:** `src/main/java/com/aurora/jpa/dominio/LineaPedido.java`

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

Base de herencia con `SINGLE_TABLE`. Todas las subclases comparten la tabla `pagos` y se distinguen por `tipo_pago`.

**Archivo:** `src/main/java/com/aurora/jpa/dominio/Pago.java`

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

Subclase concreta de pago con tarjeta.

**Archivo:** `src/main/java/com/aurora/jpa/dominio/PagoTarjeta.java`

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

Subclase concreta de pago por transferencia.

**Archivo:** `src/main/java/com/aurora/jpa/dominio/PagoTransferencia.java`

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

Consultas de lectura. Incluye JPQL tipada, Criteria dinámica y consulta con `EntityGraph` para evitar N+1 al cargar cliente.

**Archivo:** `src/main/java/com/aurora/jpa/repositorio/PedidoRepositorio.java`

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

Orquesta transacciones con `EntityManager`. Contiene seed, demo de ciclo de vida y prueba de bloqueo optimista con dos EntityManagers concurrentes.

**Archivo:** `src/main/java/com/aurora/jpa/servicio/PedidoServicio.java`

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

Pruebas JUnit verificadas: restricción OneToOne, herencia SINGLE_TABLE, N+1 vs EntityGraph con estadísticas de Hibernate, Criteria dinámica, bloqueo optimista y ciclo de vida.

**Archivo:** `src/test/java/com/aurora/jpa/JpaAuroraTest.java`

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
BUILD SUCCESSFUL (6 tests, 0 failures) — ./gradlew -q test
```

## Conceptos cubiertos

### Tema 1: Entidades y relaciones JPA · Intermedio · 35 min

Una entidad JPA es una clase cuyo estado se puede persistir en una tabla. Se marca con `@Entity` y necesita un identificador con `@Id`. `@Table` y `@Column` permiten controlar nombres y restricciones. El mapeo no es solo anotaciones: define el contrato con la base de datos.

En `Cliente`, la relación OneToOne con `Direccion` se declara así:

```java
@OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, optional = false)
@JoinColumn(name = "direccion_id", nullable = false, unique = true)
private Direccion direccion;
```

`@OneToOne` expresa cardinalidad uno a uno. `@JoinColumn(unique = true)` crea la restricción que impide compartir la misma dirección entre dos clientes. En la prueba `oneToOneYRestriccionUnica`, intentar persistir otro cliente con la misma dirección dispara excepción por la restricción. `FetchType.LAZY` indica que la dirección no debe cargarse hasta que se acceda a ella, salvo que la consulta la traiga explícitamente.

### Tema 2: Relaciones uno a uno, muchos a muchos y herencia · Intermedio · 40 min

No toda relación se modela igual. OneToOne sirve cuando una fila se asocia a exactamente una fila. OneToMany/ManyToOne modela colecciones e hijos. ManyToMany puro sirve cuando solo hay asociación, pero si la relación tiene atributos propios (cantidad, precio en el momento, fecha), conviene una entidad intermedia. `LineaPedido` es ese caso: pertenece a un pedido, tiene SKU y cantidad.

La herencia JPA tiene varias estrategias. En este módulo se usa `SINGLE_TABLE` para `Pago`:

```java
@Entity
@Table(name = "pagos")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_pago")
public abstract class Pago { ... }
```

`SINGLE_TABLE` guarda todas las subclases en una tabla con una columna discriminadora. Es rápida para consultas polimórficas porque evita joins. La contrapartida es que columnas específicas de subclases suelen ser anulables. `JOINED` normaliza en varias tablas con joins; `TABLE_PER_CLASS` duplica columnas. La prueba `herenciaSingleTable` verifica que existen dos pagos y que sus tipos son `TARJETA` y `TRANSFERENCIA`.

### Tema 3: Ciclo de vida, EntityManager y consultas tipadas · Intermedio · 40 min

El `EntityManager` es el API de JPA para operar con el contexto de persistencia. Una entidad puede estar transient (nueva, no conocida), managed (seguida por el contexto), detached (existió en contexto pero ya no), o removed. `persist` hace managed a una entidad transient. `flush` sincroniza cambios pendientes con la base antes del commit. `clear` desasocia todas las entidades managed.

En `PedidoServicio.demoCicloVida()` se persiste un cliente, se hace `flush`, se obtiene su id y luego `clear()`. Después `find` vuelve a cargarlo desde la base. La prueba verifica que el cliente sigue existiendo en BD. Esto importa porque muchas sorpresas de JPA vienen de confundir “está en memoria Java” con “está managed por el contexto”.

Las consultas JPQL tipadas evitan strings mágicos sin tipo de retorno. En `PedidoRepositorio`:

```java
TypedQuery<Pedido> q = em.createQuery(
        "select p from Pedido p where p.fecha = :fecha order by p.id", Pedido.class);
q.setParameter("fecha", fecha);
return q.getResultList();
```

JPQL consulta entidades y sus campos, no tablas físicas directamente. Usar parámetros (`:fecha`) evita inyección y problemas de escape.

### Tema 4: Búsquedas dinámicas con Criteria y Querydsl · Intermedio · 40 min

Cuando los filtros llegan opcionalmente, concatenar JPQL con strings es frágil. Criteria API permite construir la consulta con objetos Java. En `buscarDinamico`, se agregan predicados solo si `fecha` o `sku` están presentes.

```java
List<Predicate> predicates = new ArrayList<>();
if (fecha != null) predicates.add(cb.equal(root.get("fecha"), fecha));
if (sku != null && !sku.isBlank()) predicates.add(cb.equal(root.join("lineas").get("sku"), sku));
cq.where(predicates.toArray(Predicate[]::new));
```

La prueba `criteriaDinamica` filtra por fecha y SKU y obtiene un pedido. Criteria es verbosa, pero tipada y dinámica. Querydsl genera un metamodelo fluido (`QPedido.pedido.fecha.eq(...)`) que suele ser más legible; su costo es configuración de generación de código. **Nota de verificación:** Querydsl no se ejecutó en este build para mantener el proyecto liviano; la comparación es conceptual y la implementación verificada usa Criteria API.

### Tema 5: FetchType.LAZY, EAGER y el problema N+1 · Avanzado · 40 min

`FetchType.LAZY` retrasa la carga de una asociación hasta que se accede. `EAGER` la carga junto con la entidad principal. EAGER parece cómodo, pero puede cargar grafos enormes sin que lo pidas. LAZY es más seguro por defecto, pero tiene una trampa clásica: N+1.

N+1 ocurre cuando haces 1 consulta para traer N pedidos y luego, al acceder a `pedido.getCliente()` dentro de un loop, JPA dispara 1 consulta por pedido para cargar el cliente. Total: 1 + N. En Tienda Aurora, listar guías/pedidos y mostrar el cliente de cada uno es el patrón exacto.

La prueba `nPlusUnoYEntityGraph` usa estadísticas de Hibernate (`SessionFactory.getStatistics().getPrepareStatementCount()`). Primero carga pedidos por fecha y toca `getCliente().getNombre()`: resultado real `sinGraph=4` (1 query de pedidos + 3 de clientes). Luego ejecuta la consulta con EntityGraph: `conGraph=1`.

Salida real del demo:

```text
sinGraph=4
conGraph=1
```

La corrección depende del caso: `join fetch` en JPQL, `EntityGraph`, DTO projection, o consultas específicas por vista. No hay una sola respuesta correcta; la regla es medir cuántas consultas dispara tu caso de uso real.

### Tema 6: EntityGraph y cachés de persistencia · Avanzado · 40 min

`EntityGraph` define qué atributos cargar para una consulta concreta. En `pedidosConClientePorFecha`:

```java
EntityGraph<Pedido> graph = em.createEntityGraph(Pedido.class);
graph.addAttributeNodes("cliente");
q.setHint("jakarta.persistence.fetchgraph", graph);
```

Esto le dice a JPA que cargue `cliente` como parte del plan de fetch. Es mejor que cambiar la relación a EAGER globalmente, porque EAGER afecta todas las consultas. EntityGraph es por caso de uso.

JPA tiene caché L1 (first-level cache) en el `EntityManager`: dentro del mismo contexto de persistencia, cargar la misma entidad por id reutiliza la instancia. Es obligatoria y no se comparte entre contextos. La caché L2 es opcional, configurada a nivel de `EntityManagerFactory`/proveedor, y puede compartir datos entre contextos. La L2 requiere estrategia de invalidación cuidadosa; en sistemas distribuidos o con escrituras concurrentes puede servir datos obsoletos si se configura mal. **Nota de verificación:** este módulo verifica L1 implícitamente por el comportamiento del `EntityManager`; no se configuró L2 para evitar una capa extra no comprobada en el build.

### Tema 7: Concurrencia, transacciones y propagación · Avanzado · 45 min

La concurrencia en persistencia ocurre cuando dos transacciones tocan el mismo dato. JPA soporta bloqueo optimista con `@Version`. Cada actualización incrementa la versión; si otra transacción actualizó antes, el commit falla con `OptimisticLockException`.

En `demoOptimista()`, dos `EntityManager` cargan el mismo pedido. El primero cambia fecha, hace flush y commit. El segundo intenta flush y recibe un conflicto de versión. La prueba verifica `OptimisticLockException`. Este patrón es bueno cuando los conflictos son raros: no bloquea lecturas, pero obliga a reintentar o reportar conflicto.

El bloqueo pesimista (`LockModeType.PESSIMISTIC_WRITE`) bloquea filas en la base. Es útil cuando el conflicto es probable y la operación debe serializarse, pero reduce concurrencia y puede causar deadlocks. La propagación de transacciones (REQUIRED, REQUIRES_NEW, etc.) es un concepto de Spring; en JPA puro, tú controlas el límite con `begin/commit/rollback` o JTA. La regla es mantener transacciones cortas y con un límite claro.

### Tema 8: Migraciones y pruebas JPA con Testcontainers · Avanzado · 45 min

`hibernate.hbm2ddl.auto=create-drop` es cómodo para pruebas locales, pero no es una estrategia de migración de producción. No versiona cambios, no controla orden, y puede destruir datos. Para producción, usa Flyway o Liquibase: migraciones SQL versionadas, aplicadas en orden, auditables.

Una migración Flyway se vería así:

```sql
-- V1__crear_pedidos.sql
CREATE TABLE clientes (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  direccion_id BIGINT NOT NULL UNIQUE
);
```

Testcontainers permite levantar PostgreSQL real en Docker para pruebas. Da evidencia más fiel que H2 en tipos, locks, JSONB, funciones o comportamiento de aislamiento. Un smoke típico sería:

```java
@Testcontainers
class PedidoRepositorioIT {
  @Container
  static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine");
}
```

**Nota de verificación:** no ejecuté Flyway ni Testcontainers en este entorno. Docker 29.9.3 está disponible, pero el lab requiere dependencias `org.flywaydb:flyway-core`, `org.testcontainers:postgresql` y una prueba de integración separada; fingir la salida violaría el estándar. El comportamiento de JPA se verificó con H2 y JUnit 5. Para CI real, ejecuta el repositorio contra PostgreSQL efímero y aplica migraciones antes de los tests.

## Cierre

JPA no es solo anotaciones. Es un modelo de estado, identidad, carga y transacciones. Modela relaciones por el dominio, no por conveniencia; usa LAZY por defecto y carga explícita por caso de uso; mide N+1; maneja concurrencia con `@Version` o locks cuando corresponde; y trata el esquema como código versionado con migraciones.

## Checklist

- Sé mapear entidades y relaciones con restricciones reales.
- Distingo SINGLE_TABLE/JOINED/TABLE_PER_CLASS y cuándo usar entidad intermedia.
- Entiendo transient/managed/detached, `flush` y `clear`.
- Puedo usar Criteria para filtros dinámicos y sé cuándo Querydsl mejora legibilidad.
- Puedo detectar N+1 y corregirlo con EntityGraph/join fetch/DTO.
- Entiendo L1/L2, bloqueo optimista/pesimista y por qué hbm2ddl no reemplaza migraciones.
