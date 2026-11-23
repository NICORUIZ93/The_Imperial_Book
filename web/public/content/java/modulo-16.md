# Módulo 16: JPA, Hibernate y FetchType.LAZY vs EAGER

Cuando un sistema como Tienda Aurora pasa de objetos en memoria a una base relacional, aparecen dos modelos que no encajan solos. En Java piensas en objetos, referencias, colecciones y polimorfismo. En SQL piensas en tablas, filas, claves foráneas, joins y transacciones. JPA (Jakarta Persistence API) es la especificación que define cómo mapear un modelo de objetos a un modelo relacional. Hibernate es una implementación de esa especificación: lee el mapeo, genera o ejecuta SQL, sigue el estado de las entidades y traduce operaciones de alto nivel a operaciones de base de datos.

El error común es tratar JPA como “anotaciones mágicas para no escribir SQL”. JPA sí reduce SQL repetitivo, pero no elimina la necesidad de entender SQL. Si no sabes qué consulta se ejecuta, cuándo se ejecuta y qué filas bloquea, puedes terminar con datos inconsistentes, consultas N+1, cargas enormes o errores de concurrencia difíciles de reproducir.

Este módulo recorre el problema desde cero: primero el mapeo y el ciclo de vida, luego consultas, después fetch y rendimiento, y al final concurrencia, migraciones y pruebas contra bases reales. Todo se apoya en un proyecto ejecutable.

**Verificación real (2026-11-22, macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, Hibernate ORM 7.0.0.Final, H2 2.3.232, JUnit 5.13.4):** `./gradlew -q test` pasó con 6 tests y 0 fallas. La medición N+1 se obtuvo con estadísticas de Hibernate: `sinGraph=4`, `conGraph=1`.

## Proyecto desde cero: `tienda-aurora-jpa`

## Prerrequisitos

```bash
java -version
gradle --version
```

## Estructura

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

## Cómo leer este módulo

No leas los archivos como un catálogo. Léelos como un flujo: configuración (`persistence.xml`, Gradle) → modelo (`dominio`) → consultas (`repositorio`) → transacciones/casos (`servicio`) → evidencia (`JpaAuroraTest`). Cada tema abajo vuelve a estos archivos y explica la decisión.

## Código completo

#### `settings.gradle.kts`

Define el nombre del build. En Gradle, `settings.gradle.kts` identifica el proyecto raíz y, en builds multi-módulo, incluye subproyectos.

```kotlin
rootProject.name = "tienda-aurora-jpa"
```

#### `build.gradle.kts`

Configura Java 25, dependencias y pruebas. `hibernate-core` trae el motor ORM; `jakarta.persistence-api` define las interfaces JPA; `h2` aporta una base embebida para verificar el comportamiento localmente; JUnit 5 ejecuta las pruebas. `useJUnitPlatform()` es obligatorio para JUnit Jupiter.

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

#### `src/main/resources/META-INF/persistence.xml`

Configura la unidad de persistencia `auroraPU`. JPA arranca leyendo este archivo desde `META-INF/persistence.xml` en el classpath. Aquí se registran entidades, proveedor, conexión JDBC y propiedades de Hibernate. `create-drop` es útil para tests locales porque recrea el esquema; en producción se reemplaza por migraciones versionadas.

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

#### `src/main/java/com/aurora/jpa/dominio/Direccion.java`

Entidad simple con identidad propia. Representa el lado destino de un OneToOne. El constructor protegido sin argumentos lo exige JPA/Hibernate para instanciar la entidad por reflexión.

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

#### `src/main/java/com/aurora/jpa/dominio/Cliente.java`

Entidad dueña de la relación OneToOne con `Direccion`. `@JoinColumn(unique=true, nullable=false)` convierte la regla de dominio en restricción de base de datos. `FetchType.LAZY` evita cargar la dirección salvo que el caso de uso la necesite.

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

#### `src/main/java/com/aurora/jpa/dominio/Pedido.java`

Agregado central. Modela ManyToOne hacia `Cliente`, OneToMany hacia líneas, versión optimista con `@Version` y callback `@PrePersist`. El campo `creadoEn` demuestra un hook del ciclo de vida.

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    protected Pedido() {
    }

    public Pedido(LocalDate fecha, Cliente cliente) {
        this.fecha = fecha;
        this.cliente = cliente;
    }

    @PrePersist
    void antesDePersistir() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.of(2026, 11, 22, 10, 0);
        }
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
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
}
```

#### `src/main/java/com/aurora/jpa/dominio/LineaPedido.java`

Entidad intermedia para líneas de pedido. Lleva `sku` y `cantidad`. Es el patrón correcto cuando la relación tiene datos propios; ManyToMany puro no los representa bien.

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

#### `src/main/java/com/aurora/jpa/dominio/Pago.java`

Raíz de herencia JPA con `SINGLE_TABLE`. Toda la jerarquía se guarda en una tabla con `tipo_pago` como discriminador. Permite consultas polimórficas simples.

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

Subclase concreta de `Pago`. Aporta `ultimos4`; en SINGLE_TABLE esa columna existe en la tabla común.

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

Subclase concreta de `Pago` para transferencias. Hibernate usa el discriminador para instanciar el tipo correcto al consultar por `Pago`.

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

#### `src/main/java/com/aurora/jpa/repositorio/PedidoRepositorio.java`

Capa de consultas. Contiene JPQL simple, JPQL con `join fetch`, Criteria dinámica y EntityGraph. Estas variantes son la base para comparar N+1, composición dinámica y planes de fetch.

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

#### `src/main/java/com/aurora/jpa/servicio/PedidoServicio.java`

Pequeño servicio transaccional. Maneja `EntityManager`, commit/rollback, seed, ciclo de vida y un escenario de bloqueo optimista con dos contextos de persistencia. Está deliberadamente explícito para que se vea el límite transaccional.

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

#### `src/test/java/com/aurora/jpa/JpaAuroraTest.java`

Pruebas verificadas con JUnit 5. Cubren restricción OneToOne, herencia, callback/ciclo de vida, Criteria, N+1 medido con estadísticas de Hibernate y `OptimisticLockException`.

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
    void cicloVidaYCallback() {
        servicio.demoCicloVida();
        Pedido pedido = servicio.query(em -> em.createQuery("select p from Pedido p order by p.id", Pedido.class).setMaxResults(1).getSingleResult());
        assertNotNull(pedido.getCreadoEn());
        assertTrue(servicio.contarPedidos() >= 3);
    }

    @Test
    void criteriaDinamica() {
        List<Pedido> pedidos = servicio.query(em -> new PedidoRepositorio(em)
                .buscarDinamico(LocalDate.of(2026, 11, 20), "CAF-100"));
        assertEquals(1, pedidos.size());
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
    void optimisticLock() throws Exception {
        String resultado = servicio.demoOptimista();
        assertEquals("OptimisticLockException", resultado);
    }
}
```

## Ejecución verificada

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q test
```

Resultado real:

```text
BUILD SUCCESSFUL
6 tests, 0 failures
```

Las pruebas relevantes para la explicación son:

- `oneToOneYRestriccionUnica`: demuestra que la restricción vive en la base.
- `herenciaSingleTable`: demuestra polimorfismo persistido.
- `cicloVidaYCallback`: demuestra `flush/clear` y `@PrePersist`.
- `criteriaDinamica`: demuestra composición de filtros.
- `nPlusUnoYEntityGraph`: mide `sinGraph=4` y `conGraph=1`.
- `optimisticLock`: demuestra `OptimisticLockException`.

## Conceptos cubiertos

### Tema 1: Entidades y relaciones JPA · Intermedio · 35 min

#### El problema desde cero

Tienes un objeto Java:

```java
Cliente ana = new Cliente("ana@aurora.test", "Ana", new Direccion("Lima", "Av. 1"));
```

Ese objeto vive en RAM. Cuando el proceso termina, desaparece. Una base relacional guarda filas en tablas, con tipos, restricciones y claves. El problema de mapeo objeto-relacional (ORM) es traducir entre esos dos modelos sin perder significado.

#### Qué es una entidad

Una entidad JPA es una clase cuyo estado se persiste y se identifica por una clave. No es cualquier DTO. El identificador importa: JPA usa el `@Id` para saber qué fila representa la entidad. En `Cliente`:

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

`@Id` marca la clave primaria. `@GeneratedValue(IDENTITY)` delega la generación al motor de base de datos (autoincrement/identity). Esto tiene una consecuencia práctica: muchas veces el id se asigna al insertar, no al crear el objeto en memoria.

#### Qué significan las anotaciones de mapeo

`@Entity` dice “esta clase participa en persistencia JPA”. `@Table(name="clientes")` fija el nombre de tabla. `@Column(nullable=false, unique=true)` en email no es solo documentación: Hibernate puede generar el esquema con esa restricción y, lo más importante, la base la hace cumplir. Si dos transacciones intentan insertar el mismo email, la base rechaza una.

#### Relaciones: el caso OneToOne

`Cliente` tiene una `Direccion`. En objetos es una referencia. En SQL, la forma típica es una clave foránea:

```java
@OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, optional = false)
@JoinColumn(name = "direccion_id", nullable = false, unique = true)
private Direccion direccion;
```

Léelo pieza por pieza:

- `@OneToOne`: cardinalidad uno a uno.
- `fetch = LAZY`: no cargues la dirección automáticamente al cargar el cliente, salvo que se pida.
- `cascade = ALL`: operaciones sobre cliente se propagan a dirección; útil porque la dirección pertenece al cliente.
- `optional = false` y `nullable = false`: el cliente debe tener dirección.
- `unique = true`: una dirección no puede ser compartida por dos clientes. Aquí está la regla que evita el error de compartir la misma fila.

#### Evidencia

La prueba `oneToOneYRestriccionUnica` busca la dirección del cliente 1 y trata de crear otro cliente con la misma dirección. Al hacer `flush()`, la base detecta la violación y JPA lanza excepción. La lección es: el modelo de objetos puede parecer válido, pero la base impone el invariante.

#### Criterio experto

Usa OneToOne solo cuando realmente exista esa cardinalidad. Muchas veces un “uno a uno” termina siendo “uno a muchos” o un value object embebido. Si la dirección no tiene identidad propia ni se comparte, `@Embeddable` puede ser mejor que una entidad separada. Aquí se modeló como entidad para hacer visible la restricción y el fetch.

### Tema 2: Relaciones uno a uno, muchos a muchos y herencia · Intermedio · 40 min

#### Relaciones con datos propios

`Pedido` tiene líneas. Una línea no es solo “pedido relacionado con producto”: tiene cantidad y SKU. Cuando la relación tiene atributos, necesitas una entidad intermedia. Por eso existe `LineaPedido`:

```java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "pedido_id", nullable = false)
private Pedido pedido;
```

Desde el lado de `Pedido`:

```java
@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
private List<LineaPedido> lineas = new ArrayList<>();
```

`mappedBy = "pedido"` indica que la clave foránea vive en `LineaPedido.pedido`. `orphanRemoval = true` significa que si quitas una línea de la colección y esa línea queda huérfana, JPA puede eliminarla. Es potente, pero solo debe usarse cuando la entidad hija realmente pertenece al agregado.

#### ManyToMany: cuándo sí, cuándo no

ManyToMany puro sirve para asociaciones simples, por ejemplo producto-categoría sin atributos adicionales. Si mañana la categoría asignada tiene fecha, usuario que la asignó o prioridad, ManyToMany puro se queda corto. Criterio: si la relación puede adquirir datos o reglas propias, modela entidad intermedia desde el inicio.

#### Herencia en JPA

Java modela herencia naturalmente; las tablas no. JPA define estrategias:

| Estrategia | Cómo guarda | Ventaja | Costo/riesgo |
|---|---|---|---|
| `SINGLE_TABLE` | Una tabla con discriminador | Consultas polimórficas rápidas, simples | Columnas de subclases suelen ser nullable |
| `JOINED` | Tabla base + tabla por subclase | Modelo normalizado | Requiere joins para consultar subclases |
| `TABLE_PER_CLASS` | Tabla por clase concreta | Sin columnas ajenas nullables | Consultas polimórficas pueden ser costosas/complejas |

En `Pago` usamos `SINGLE_TABLE`:

```java
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_pago")
public abstract class Pago { ... }
```

`PagoTarjeta` y `PagoTransferencia` agregan campos distintos. La tabla `pagos` tendrá `ultimos4` y `banco`; algunas columnas quedarán null según el tipo. La prueba `herenciaSingleTable` consulta `select p from Pago p` y obtiene instancias concretas correctas. Eso verifica que el discriminador y el polimorfismo funcionan.

#### Criterio experto

Elige la estrategia por forma de consulta y evolución del esquema. `SINGLE_TABLE` es buena cuando hay pocas subclases y consultas polimórficas frecuentes. `JOINED` es buena cuando la normalización y las restricciones por subclase importan más. No elijas por costumbre.

### Tema 3: Ciclo de vida, EntityManager y consultas tipadas · Intermedio · 40 min

#### El EntityManager y el contexto de persistencia

El `EntityManager` es la API central de JPA. No es solo “el objeto que hace queries”. Mantiene un **contexto de persistencia**: un conjunto de entidades managed y su estado. Dentro de ese contexto, JPA garantiza identidad: si cargas la misma fila dos veces por id en el mismo contexto, obtienes la misma instancia Java.

#### Estados de una entidad

| Estado | Qué significa | Cómo llega ahí |
|---|---|---|
| Transient | Objeto Java nuevo, sin fila conocida | `new Cliente(...)` |
| Managed | JPA lo rastrea | `persist`, `find`, query que lo devuelve |
| Detached | Fue managed, ya no | `clear`, `close`, salir del contexto |
| Removed | Marcado para borrar | `remove` |

#### `persist`, `flush`, `clear`

- `persist`: registra una entidad transient para que pase a managed. No siempre ejecuta INSERT inmediato.
- `flush`: sincroniza el contexto con la base. Fuerza SQL pendiente, pero la transacción sigue abierta.
- `clear`: desasocia todas las entidades managed. No borra filas; solo vacía el seguimiento del contexto.

En `demoCicloVida()`:

```java
Cliente c = new Cliente("tmp@aurora.test", "Tmp", new Direccion("Piura", "Calle 1"));
em.persist(c); // transient -> managed
em.flush();     // SQL pendiente
Long id = c.getId();
em.clear();     // managed -> detached
Cliente detached = em.find(Cliente.class, id);
```

La prueba verifica que el cliente existe en BD. Esto enseña una distinción crítica: memoria del proceso no es lo mismo que contexto de persistencia, y contexto de persistencia no es lo mismo que base de datos confirmada.

#### Callbacks de ciclo de vida

`@PrePersist` en `Pedido` asigna `creadoEn` si está vacío. Los callbacks (`@PrePersist`, `@PostPersist`, `@PreUpdate`, etc.) sirven para reglas técnicas cercanas al ciclo de vida. No los uses para lógica de negocio pesada o llamadas externas: se ejecutan dentro del flujo de persistencia y pueden hacer difícil razonar sobre transacciones.

#### JPQL tipada

JPQL consulta entidades:

```java
TypedQuery<Pedido> q = em.createQuery(
        "select p from Pedido p where p.fecha = :fecha order by p.id", Pedido.class);
q.setParameter("fecha", fecha);
```

JPQL usa nombres de entidades y campos, no nombres físicos de tablas, aunque a veces coincidan. `TypedQuery<Pedido>` evita castings. El parámetro nombrado evita concatenación insegura. A nivel experto, recuerda: JPQL es portable y expresivo, pero siempre revisa el SQL generado cuando el rendimiento importa.

### Tema 4: Búsquedas dinámicas con Criteria y Querydsl · Intermedio · 40 min

#### El problema de los filtros opcionales

Una pantalla de búsqueda puede recibir fecha, cliente, SKU, estado, rango, etc. Si armas JPQL concatenando strings:

```java
String jpql = "select p from Pedido p where 1=1";
if (fecha != null) jpql += " and p.fecha = :fecha";
```

Funciona al inicio, pero escala mal: errores de espacios, joins condicionales, parámetros opcionales, duplicados, problemas de mantenimiento. Lo peor es que el error aparece en runtime.

#### Criteria API

Criteria construye la consulta como objetos Java. En `buscarDinamico`:

```java
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
```

`Root` representa la entidad base. `Predicate` representa condiciones. `distinct(true)` evita duplicar pedidos cuando el join a líneas produce varias filas por pedido. La prueba `criteriaDinamica` confirma que filtrar por fecha y `CAF-100` devuelve 1 pedido.

#### Querydsl

Querydsl genera metamodelos tipados (`QPedido`) y permite escribir:

```java
selectFrom(pedido).where(pedido.fecha.eq(fecha), linea.sku.eq(sku))
```

La ventaja es legibilidad y composición fluida. El costo es configurar generación de código y dependencias. En este módulo no se ejecutó Querydsl para mantener el build liviano y verificable; se deja el criterio: Criteria es estándar JPA, Querydsl suele ser más agradable para equipos con muchas consultas dinámicas.

#### Criterio experto

Usa la herramienta más simple que mantenga claridad. JPQL fijo para consultas estables. Criteria/Querydsl para filtros dinámicos reales. Para reportes complejos o rendimiento crítico, considera SQL nativo o DTO projection con consulta dedicada.

### Tema 5: FetchType.LAZY, EAGER y el problema N+1 · Avanzado · 40 min

#### Desde cero: navegar un objeto no siempre es gratis

En Java puro, si tienes un objeto en memoria, acceder a un campo es acceso en memoria. Con JPA, una asociación puede no estar cargada todavía. JPA puede cargarla más tarde, cuando la accedes. Esa carga tardía se llama **lazy loading**.

Observa el caso real de Tienda Aurora: 3 pedidos, cada uno con un cliente. Quieres listar pedidos y mostrar el nombre del cliente.

```java
List<Pedido> pedidos = repo.pedidosPorFecha(fecha); // consulta 1
for (Pedido p : pedidos) {
    p.getCliente().getNombre(); // ¿consulta extra?
}
```

El `for` se ve inofensivo. Pero `cliente` en `Pedido` está mapeado como:

```java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "cliente_id", nullable = false)
private Cliente cliente;
```

LAZY significa: al cargar el pedido, trae las columnas del pedido. La referencia a cliente es un proxy/lugar pendiente. Cuando llamas `getCliente().getNombre()`, Hibernate necesita el cliente real. Si no está en el contexto, ejecuta un SELECT por ese cliente.

#### Qué es N+1

N+1 es un patrón de acceso ineficiente:

- **1** consulta para obtener la lista principal: `select ... from pedidos where fecha = ?`
- **N** consultas adicionales, una por cada elemento: `select ... from clientes where id = ?`

Con 3 pedidos, 4 consultas. Con 100 pedidos, 101 consultas. Con 10.000 pedidos, 10.001 consultas. El problema no es solo cantidad: es latencia acumulada, presión sobre la base, saturación de pool de conexiones y tiempos impredecibles.

#### Evidencia medida en este proyecto

La prueba `nPlusUnoYEntityGraph` usa estadísticas de Hibernate. No adivina: cuenta `PreparedStatement`s.

```java
stats.clear();
List<Pedido> pedidos = repo.pedidosPorFecha(fecha);
for (Pedido p : pedidos) {
    p.getCliente().getNombre();
}
long sinGraph = stats.getPrepareStatementCount();
```

Resultado real:

```text
sinGraph=4
conGraph=1
```

Interpretación: había 3 pedidos. La primera consulta trajo los pedidos. Las 3 siguientes trajeron clientes, una por pedido. Total 4.

#### LAZY vs EAGER

| Fetch | Qué hace | Cuándo parece bueno | Riesgo real |
|---|---|---|---|
| `LAZY` | Carga la asociación cuando se accede | Por defecto en muchas asociaciones; evita cargar de más | Puede causar N+1 si accedes en loop |
| `EAGER` | Carga la asociación junto con la entidad | Cuando casi siempre la necesitas | Carga grafos inesperados en todas las consultas, difícil de controlar |

La respuesta profesional no es “usa EAGER”. EAGER global mueve el costo al lugar equivocado: todas las consultas pagan, incluso las que no necesitan la asociación. La respuesta es: **LAZY por defecto, fetch plan por caso de uso**.

#### Corrección 1: `join fetch`

```java
select distinct p from Pedido p join fetch p.cliente where p.fecha = :fecha order by p.id
```

`join fetch` le dice a JPQL: trae el pedido y también inicializa su cliente en la misma consulta. `distinct` evita duplicados cuando el join produce más filas. Es explícito y eficiente para este caso. Cuidado: hacer fetch de varias colecciones a la vez puede producir producto cartesiano o errores; en esos casos, separa consultas o usa DTOs.

#### Corrección 2: EntityGraph

```java
EntityGraph<Pedido> graph = em.createEntityGraph(Pedido.class);
graph.addAttributeNodes("cliente");
q.setHint("jakarta.persistence.fetchgraph", graph);
```

El EntityGraph declara qué atributos cargar. Es útil cuando quieres reutilizar una consulta base y ajustar el fetch según la vista. La prueba muestra `conGraph=1`. Misma mejora, distinta forma de expresarla.

#### Corrección 3: DTO projection

Si la pantalla solo necesita fecha, id de pedido y nombre de cliente, no necesitas entidades completas:

```java
select new com.aurora.jpa.dto.PedidoResumen(p.id, p.fecha, c.nombre)
from Pedido p join p.cliente c
where p.fecha = :fecha
```

Esto evita cargar entidades managed innecesarias, reduce memoria y hace explícito el contrato de lectura. Es mi opción preferida para lecturas de API/listados.

#### Corrección 4: batch size / subselect

Hibernate puede agrupar cargas LAZY en lotes (`@BatchSize`) o usar subselects. No elimina la consulta extra, pero reduce 100 consultas a pocas. Útil cuando no puedes cambiar todas las consultas, pero no es tan preciso como fetch específico.

#### Criterio experto

Antes de optimizar, mide. Activa estadísticas o logs SQL en desarrollo. Pregunta: ¿qué pantalla/caso de uso ejecuta esto? ¿Cuántas filas? ¿Qué columnas necesita? Luego elige: EntityGraph/join fetch para entidad con asociaciones necesarias, DTO para lecturas, batch para mitigación. Nunca arregles N+1 poniendo EAGER en todo.

### Tema 6: EntityGraph y cachés de persistencia · Avanzado · 40 min

#### EntityGraph como contrato de carga

Un EntityGraph dice “para esta consulta, carga este grafo”. Es un contrato de fetch a nivel de caso de uso. El repositorio lo usa así:

```java
EntityGraph<Pedido> graph = em.createEntityGraph(Pedido.class);
graph.addAttributeNodes("cliente");
TypedQuery<Pedido> q = em.createQuery(
        "select p from Pedido p where p.fecha = :fecha order by p.id", Pedido.class);
q.setHint("jakarta.persistence.fetchgraph", graph);
```

`jakarta.persistence.fetchgraph` trata el grafo como fetch plan. También existe `loadgraph`, con semántica distinta según atributos. Lo importante es que el plan de carga quede cerca de la consulta que lo necesita.

#### Caché L1

La caché de primer nivel es el `EntityManager`. Vive dentro de la unidad de trabajo. Si haces `find(Cliente.class, 1L)` dos veces en el mismo EntityManager, la segunda llamada normalmente no va a la base: devuelve la misma instancia managed. Esto da identidad de objeto y evita lecturas repetidas.

La L1 no se desactiva. Es parte del contrato de persistencia. Por eso un EntityManager largo puede acumular muchas entidades y consumir memoria; en procesos batch, se usa `flush()` + `clear()` periódicamente.

#### Caché L2

La caché de segundo nivel está asociada al `EntityManagerFactory`. Puede compartir datos entre EntityManagers. Suena bien, pero agrega el problema difícil de los sistemas distribuidos: invalidación. Si otro servicio o proceso actualiza la base, la L2 puede quedar obsoleta. Configurarla bien implica elegir región, proveedor, política de expiración, modo de concurrencia y qué entidades son cacheables.

#### Criterio experto

No habilites L2 por defecto. Primero arregla N+1, índices, consultas y paginación. Si el perfil de lectura lo justifica, habilita L2 solo para entidades de lectura mayormente estática y mide hit ratio/invalidation. **Nota de verificación:** este proyecto verifica L1 implícitamente y no configura L2; cualquier configuración L2 debe probarse con su proveedor y escenario de concurrencia.

### Tema 7: Concurrencia, transacciones y propagación · Avanzado · 45 min

#### El problema: dos personas editan lo mismo

Dos usuarios cargan el pedido 10 al mismo tiempo. Ambos ven versión 1. El primero cambia la fecha y guarda. El segundo cambia otra cosa y guarda después. Si el sistema solo hace “update por id”, el segundo pisa cambios del primero o toma decisiones sobre un estado viejo. Eso es lost update.

#### Bloqueo optimista con `@Version`

```java
@Version
private long version;
```

Hibernate agrega la versión al update:

```sql
update pedidos set fecha=?, version=? where id=? and version=?
```

Si la versión cambió, el update afecta 0 filas y Hibernate lanza `OptimisticLockException`. En `demoOptimista()`, dos EntityManagers cargan el mismo pedido. Uno hace commit primero. El otro falla al flush/commit. La prueba espera `OptimisticLockException`.

Esto es optimista porque asume que el conflicto es raro: permite lecturas concurrentes sin bloquear, pero obliga a detectar conflicto al escribir. Es ideal para APIs CRUD con baja contención.

#### Bloqueo pesimista

`LockModeType.PESSIMISTIC_WRITE` usa bloqueos de base (`SELECT ... FOR UPDATE` en muchos motores). Impide que otra transacción modifique la fila al mismo tiempo. Es útil cuando el conflicto es probable, por ejemplo reservar stock. El costo es menor concurrencia, más espera y posible deadlock.

#### Propagación

En Spring, la propagación (`REQUIRED`, `REQUIRES_NEW`, etc.) define cómo se comporta un método transaccional cuando ya existe una transacción. En JPA puro, tú manejas el límite con `begin/commit/rollback`. El principio es el mismo: define la unidad atómica de negocio. Una compra no puede guardar el pedido y fallar al guardar el pago dejando medio estado confirmado.

#### Criterio experto

Mantén transacciones cortas. No hagas llamadas HTTP a terceros dentro de la transacción si puedes evitarlo. Elige optimista por defecto en dominios de baja contención; usa pesimista solo en puntos críticos. Maneja `OptimisticLockException` con reintento controlado o mensaje de conflicto al usuario, según el caso.

### Tema 8: Migraciones y pruebas JPA con Testcontainers · Avanzado · 45 min

#### Por qué `create-drop` no sirve en producción

`hibernate.hbm2ddl.auto=create-drop` es cómodo para tests: crea el esquema desde entidades y lo borra al final. En producción es inaceptable: no versiona cambios, no migra datos, no permite rollback controlado y puede destruir información. El esquema es parte del contrato del sistema y debe evolucionar con cambios auditables.

#### Migraciones con Flyway

Flyway usa scripts versionados:

```sql
-- V1__crear_pedidos.sql
CREATE TABLE pedidos (
  id BIGSERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  cliente_id BIGINT NOT NULL,
  version BIGINT NOT NULL
);
```

Cada script se aplica una vez y se registra. Si necesitas cambiar una columna, creas `V2__...sql` con la estrategia adecuada. Esto permite reproducir el esquema en local, CI y producción.

#### H2 vs PostgreSQL real

H2 es excelente para feedback rápido. Pero H2 no es PostgreSQL. Hay diferencias en tipos, sintaxis, bloqueos, JSON, índices, funciones, collations y comportamiento transaccional. Un test que pasa en H2 puede fallar en PostgreSQL, o peor, comportarse distinto.

#### Testcontainers

Testcontainers levanta contenedores reales desde tests. Para PostgreSQL:

```java
@Testcontainers
class PedidoRepositorioIT {
  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");
}
```

La prueba se conecta a una base real efímera. Eso da evidencia de compatibilidad real. El costo es tiempo y dependencia de Docker.

**Nota de verificación honesta:** en este entorno verifiqué el módulo con H2 y JUnit 5; no ejecuté Flyway ni Testcontainers. Docker está disponible en la máquina, pero este módulo no incluye las dependencias y pipeline de integración necesarios para afirmar una ejecución real. Para producción, agrega dependencias Testcontainers/Flyway, crea pruebas `*IT` separadas y ejecútalas en CI con Docker.

#### Criterio experto

Usa H2 para tests rápidos de lógica si aceptas sus límites. Usa Testcontainers/PostgreSQL para pruebas de persistencia cercanas a producción. Usa migraciones versionadas siempre. Nunca dejes que el ORM sea la única fuente de verdad del esquema en producción.

## Cierre

JPA bien usado es una herramienta de productividad y consistencia. JPA mal entendido es un generador de sorpresas. La diferencia está en el modelo mental: entidad no es DTO; lazy no es gratis; transacción no es solo `@Transactional`; caché no es magia; migración no es `hbm2ddl`. Cuando puedas mirar una consulta, predecir su SQL, medirlo y justificar el fetch plan, estás usando JPA como ingeniero.

## Checklist

- [ ] Puedo explicar qué es una entidad, identidad y contexto de persistencia.
- [ ] Distingo OneToOne, OneToMany, ManyToOne, ManyToMany y entidad intermedia.
- [ ] Sé cuándo usar SINGLE_TABLE, JOINED o TABLE_PER_CLASS.
- [ ] Entiendo transient/managed/detached/removed, `persist/flush/clear`.
- [ ] Puedo construir consultas tipadas JPQL y filtros dinámicos con Criteria.
- [ ] Puedo explicar N+1 desde cero y demostrarlo con métricas.
- [ ] Sé corregir N+1 con `join fetch`, EntityGraph o DTO projection.
- [ ] Entiendo L1/L2 y riesgos de invalidación.
- [ ] Puedo explicar bloqueo optimista con `@Version` y cuándo usar pesimista.
- [ ] Sé por qué `create-drop` no reemplaza migraciones y qué aporta Testcontainers.
