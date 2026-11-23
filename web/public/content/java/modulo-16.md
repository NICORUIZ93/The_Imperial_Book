# Módulo 16: JPA, Hibernate y FetchType.LAZY vs EAGER


## Visual del módulo

**Herramienta (diagram-design, estático):** [Modulo 16 — mapa visual](/visuals/temas/java/modulo-16-jpa.html)

Lectura: JPA mapea objetos, pero el contexto de persistencia y el SQL real determinan corrección y costo.


En Tienda Aurora, un pedido no es solo una fila. Es un objeto con cliente, líneas, pago, estado y reglas. En la base de datos, ese mismo pedido se reparte en tablas con claves foráneas, columnas, joins y restricciones. El conflicto entre estos dos modelos se llama **impedance mismatch objeto-relacional**: objetos tienen identidad, referencias, colecciones y herencia; las tablas tienen filas, claves primarias, claves foráneas y joins.

JPA (Jakarta Persistence) es la especificación que define cómo describir ese mapeo en Java. Hibernate es la implementación que ejecuta el trabajo real: genera SQL, decide cuándo cargar asociaciones, rastrea cambios, administra caché de primer nivel y traduce excepciones/operaciones a la semántica de persistencia.

La parte difícil no es poner anotaciones. La parte difícil es saber **qué SQL se ejecutó, cuándo, por qué, con qué transacción y con qué costo**. Este módulo va desde el modelo mental básico hasta criterios de producción.

**Verificación real (2026-11-22, macOS arm64):** JDK 27.0.1.0.2, Gradle 9.9.1, Hibernate ORM 7.0.0.Final, H2 2.3.232, JUnit 5.13.4. `./gradlew -q test` pasó con **6 tests, 0 fallas**. La demo `./gradlew -q demoN1` capturó SQL real: `SQL_COUNT=4` sin plan de fetch y `SQL_COUNT=1` con `EntityGraph`.

## Proyecto desde cero: `tienda-aurora-jpa`

## Prerrequisitos

```bash
java -version
gradle --version
```

## Bootstrap con Spring Initializr

Cuando el proyecto usa el ecosistema Spring, el punto de partida estándar es [Spring Initializr](https://start.spring.io/). No es "magia": es un generador de esqueleto Gradle/Maven con dependencias y versiones compatibles.

Para este módulo, la configuración base en Initializr sería:

| Campo | Valor | Por qué |
|---|---|---|
| Project | Gradle - Kotlin | Mismo DSL que el resto del track; build declarativo y reproducible |
| Language | Java | Módulo del track Java |
| Spring Boot | 3.5.x (estable disponible) | Línea estable con soporte de Jakarta Persistence |
| Group | `com.aurora` | Namespace del dominio Tienda Aurora |
| Artifact / Name | `tienda-aurora-jpa` | Identidad del proyecto |
| Packaging | Jar | Servicio/librería ejecutable; no necesitamos WAR |
| Java | 25 | Toolchain del curso |

Dependencias a seleccionar en Initializr:

| Dependencia | Qué aporta | Por qué en este módulo |
|---|---|---|
| **Spring Data JPA** | `spring-boot-starter-data-jpa`: Hibernate, Spring Data, transacciones, auto-config de `EntityManagerFactory` | Es la ruta productiva en Spring; la incluimos como referencia de arranque |
| **H2 Database** | Driver embebido en memoria | Verificación local rápida y reproducible |
| **PostgreSQL Driver** | Driver JDBC para PostgreSQL | Destino real de producción; se usa con Testcontainers/Flyway |
| **Validation** | Bean Validation (Jakarta Validation) | Útil para reglas en borde; en JPA las restricciones también deben existir en BD |

Initializr genera `build.gradle.kts`, `settings.gradle.kts`, wrapper Gradle, `application.properties` y la clase `@SpringBootApplication`. En una app Spring Boot típica, configurarías `spring.datasource.*` y `spring.jpa.*` en `application.yml/properties`.

**Decisión de este módulo (verificada):** para enseñar el modelo mental real de JPA, el proyecto ejecutable usa **JPA API directa + Hibernate + H2** (`EntityManager`, `persistence.xml`, transacciones explícitas). Así ves el persistence context, `flush/clear`, SQL y locks sin que Spring los oculte. La misma configuración conceptual se mapea a Spring Boot/Data JPA; cuando uses Initializr con Spring Data JPA, Spring auto-configura el `EntityManagerFactory`, gestiona transacciones con `@Transactional` y expone repositorios. La diferencia es de capa de abstracción, no de motor JPA.

## Estructura

```text
tienda-aurora-jpa/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    ├── main/
    │   ├── java/com/aurora/jpa/
    │   │   ├── DemoN1.java
    │   │   ├── SqlCapture.java
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

Lee el proyecto en este orden: `persistence.xml` y build → entidades → repositorio → servicio → pruebas/demo. Después entra a los temas. Los temas no repiten el código como ficha; lo usan para explicar decisiones, SQL generado, estado de entidades y trade-offs.

## Construye el proyecto desde cero

La meta aquí no es copiar un zip; es entender cada archivo que hace falta para que JPA/Hibernate arranque, ejecute SQL real y puedas verificar comportamiento.

### 1. Crea la carpeta y el wrapper Gradle

```bash
mkdir -p tienda-aurora-jpa
cd tienda-aurora-jpa
gradle wrapper --gradle-version 9.9.1
```

Esto crea la base del proyecto y fija la versión de Gradle. Fijar versión evita que “en mi máquina compila con otra Gradle”.

### 2. Declara el proyecto

**Archivo:** `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-jpa"
```

### 3. Configura el build

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

tasks.register<JavaExec>("demoN1") {
    classpath = sourceSets.main.get().runtimeClasspath
    mainClass = "com.aurora.jpa.DemoN1"
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Xlint:-processing", "-Werror"))
}
```

Qué importa aquí:

- `java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }`: compila con Java 25.
- `hibernate-core`: implementación JPA.
- `jakarta.persistence-api`: contratos JPA (`EntityManager`, anotaciones).
- `h2`: BD embebida para pruebas locales verificables.
- `-Werror`: no dejamos warnings escondidos.
- tarea `demoN1`: ejecuta la demo donde capturamos SQL real del N+1.

### 4. Crea la unidad de persistencia

Crea la carpeta de recursos JPA:

```bash
mkdir -p src/main/resources/META-INF
```

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

Puntos clave:

- `persistence-unit name="auroraPU"`: nombre que usa `Persistence.createEntityManagerFactory("auroraPU")`.
- Lista de `<class>`: entidades registradas explícitamente.
- `hbm2ddl.auto=create-drop`: cómodo para aprendizaje/pruebas locales; **no** es estrategia de producción.
- H2 en memoria: reproducible, sin instalar servidor.

### 5. Crea el modelo de dominio

Crea los paquetes:

```bash
mkdir -p src/main/java/com/aurora/jpa/dominio
mkdir -p src/main/java/com/aurora/jpa/repositorio
mkdir -p src/main/java/com/aurora/jpa/servicio
mkdir -p src/test/java/com/aurora/jpa
```

#### 5.1 Dirección (entidad simple)

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

`@Entity` + `@Id` la vuelven persistente. El constructor protegido vacío lo necesita JPA.

#### 5.2 Cliente con OneToOne real

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

La regla importante es `@JoinColumn(... unique = true, nullable = false)`: no solo dice “uno a uno” en Java, lo impone en la BD.

#### 5.3 Pedido como agregado

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

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

    @PrePersist
    void antesDePersistir() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.of(2026, 11, 22, 10, 0);
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
    public long getVersion() { return version; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
}
```

Qué observar:

- `@ManyToOne(fetch = LAZY)`: el cliente no se carga por defecto.
- `@OneToMany(... orphanRemoval = true)`: las líneas pertenecen al pedido.
- `@Version`: base del lock optimista.
- `@PrePersist`: hook de ciclo de vida.
- Validaciones en métodos (`agregarLinea`, `reprogramar`): el dominio protege invariantes antes de persistir.

#### 5.4 Línea de pedido

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

Es entidad intermedia porque la línea tiene datos propios (`sku`, `cantidad`).

#### 5.5 Herencia de pagos

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

`SINGLE_TABLE` guarda toda la jerarquía en `pagos` con `tipo_pago`. La consulta polimórfica es simple; el costo es columnas nullables por subclase.

### 6. Crea el repositorio con consultas reales

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
}
```

Este archivo es el laboratorio del tema N+1:

- `pedidosPorFecha`: solo carga pedidos; dispara N+1 si luego accedes a cliente.
- `pedidosConClienteJoinFetch`: corrige con JPQL `join fetch`.
- `pedidosConClientePorFecha`: corrige con `EntityGraph`.
- `buscarDinamico`: compone filtros opcionales con Criteria.

### 7. Crea el servicio transaccional

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

Aquí se ve la mecánica que Spring suele ocultar: abrir transacción, ejecutar, commit/rollback, cerrar `EntityManager`. `demoOptimista()` usa dos EntityManagers para simular dos transacciones concurrentes.

### 8. Captura SQL real para no adivinar

**Archivo:** `src/main/java/com/aurora/jpa/SqlCapture.java`

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

**Archivo:** `src/main/java/com/aurora/jpa/DemoN1.java`

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

`StatementInspector` intercepta SQL antes de ejecutarlo. Es evidencia: no suponemos N+1, lo contamos.

### 9. Escribe las pruebas

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
    void cicloVidaYCallback() {
        assertTrue(servicio.demoCicloVida());
        Pedido pedido = servicio.query(em -> em.createQuery("select p from Pedido p order by p.id", Pedido.class)
                .setMaxResults(1).getSingleResult());
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

Las pruebas verifican comportamiento observable: restricción de BD, herencia, ciclo de vida, Criteria, N+1 medido y `OptimisticLockException`.

## Ejecución verificada

Desde la raíz `tienda-aurora-jpa/`:

```bash
gradle wrapper --gradle-version 9.9.1
./gradlew -q test
./gradlew -q demoN1
```

Qué verifica cada comando:

- `./gradlew -q test`: corre las 6 pruebas JUnit 5.
- `./gradlew -q demoN1`: ejecuta la demo con `StatementInspector` y muestra SQL real del caso N+1.

Resultado real de tests:

```text
BUILD SUCCESSFUL
6 tests, 0 failures
```

Salida real relevante de `demoN1` (logs INFO de Hibernate omitidos para legibilidad; el SQL y conteos son reales):

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

## Conceptos cubiertos

### Tema 1: Entidades y relaciones JPA · Intermedio · 35 min

#### 1. Desde cero: objeto en memoria vs fila en base

En Java, este objeto existe mientras haya una referencia en memoria:

```java
Cliente ana = new Cliente("ana@aurora.test", "Ana", new Direccion("Lima", "Av. 1"));
```

Si el proceso termina, `ana` desaparece. Una base relacional guarda estado durable en tablas. Para guardar `ana`, necesitas decidir: ¿qué tabla? ¿qué columna es la clave primaria? ¿el email puede repetirse? ¿la dirección va en otra tabla? ¿cómo se relacionan?

JPA responde con metadatos de mapeo. Hibernate lee esos metadatos y los convierte en comportamiento.

#### 2. Qué hace cada anotación en el modelo real

En `Cliente`:

```java
@Entity
@Table(name = "clientes")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;
}
```

- `@Entity`: la clase tiene identidad persistente y participa en el contexto de persistencia.
- `@Table`: nombre físico. Si no lo pones, JPA usa un nombre por defecto; en equipos grandes conviene ser explícito.
- `@Id`: identidad de la entidad. JPA la usa en el mapa de identidad (first-level cache) para saber si dos referencias representan la misma fila.
- `@GeneratedValue(IDENTITY)`: la BD genera el id. Consecuencia: el id normalmente aparece al insertar; no asumas que existe antes de `persist/flush` según la estrategia.
- `@Column(nullable=false, unique=true)`: no es comentario. Es contrato de esquema. La prueba `oneToOneYRestriccionUnica` demuestra el mismo principio con otra restricción: si el dominio prohíbe compartir dirección, la BD debe rechazarlo.

#### 3. OneToOne bien modelado: dueño, FK y restricción real

```java
@OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, optional = false)
@JoinColumn(name = "direccion_id", nullable = false, unique = true)
private Direccion direccion;
```

Hay tres decisiones aquí:

1. **Dueño de la relación**: `Cliente` tiene `@JoinColumn`, por lo tanto la FK `direccion_id` vive en `clientes`. El lado dueño controla la FK.
2. **Cardinalidad real**: `unique=true` en la FK impide que dos clientes apunten a la misma dirección. Sin esto, el modelo Java se vería "uno a uno", pero la base permitiría muchos a uno.
3. **Fetch**: `LAZY` evita cargar dirección cuando solo necesitas email/nombre. En OneToOne LAZY hay matices de implementación/proxy; el criterio sigue siendo: no cargues por defecto lo que no necesitas.

#### 4. Evidencia y error típico

La prueba hace esto:

```java
Direccion dir = em.find(Cliente.class, 1L).getDireccion();
Cliente otro = new Cliente("otro@aurora.test", "Otro", dir);
em.persist(otro);
em.flush();
```

`flush()` obliga a Hibernate a sincronizar el INSERT pendiente. La BD responde con violación de unicidad. Eso es correcto: el invariante se defendió en la capa más difícil de burlar.

**Error típico:** modelar solo con objetos y olvidar la restricción física. El bug aparece meses después como datos corruptos.

**Criterio experto:** si la dirección no tiene identidad propia y nunca se comparte, considera `@Embeddable`. Usa entidad separada cuando la dirección tenga ciclo de vida, identidad, o relaciones propias.

#### 5. Con Spring Initializr

Si creas el proyecto en [Spring Initializr](https://start.spring.io/) con **Spring Data JPA**, estas mismas anotaciones JPA siguen vigentes: `@Entity`, `@Id`, `@OneToOne`, `@JoinColumn` son Jakarta Persistence, no Spring. Spring Boot auto-configura Hibernate como proveedor y escanea entidades; tú sigues siendo responsable del modelo.

### Tema 2: Relaciones uno a uno, muchos a muchos y herencia · Intermedio · 40 min

#### 1. La pregunta que define el mapeo

No empieces por la anotación. Empieza por la pregunta de dominio: **¿la relación tiene datos propios? ¿quién es dueño? ¿qué debe pasar al borrar? ¿cómo se va a consultar?**

#### 2. OneToMany/ManyToOne con entidad intermedia

`Pedido` tiene líneas. Una línea tiene SKU y cantidad. Eso ya es un dato propio de la relación pedido-producto/SKU en ese pedido.

```java
@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
private List<LineaPedido> lineas = new ArrayList<>();
```

```java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "pedido_id", nullable = false)
private Pedido pedido;
```

- `mappedBy="pedido"`: el dueño es `LineaPedido.pedido`; ahí está la FK.
- `cascade=ALL`: persistir pedido persiste sus líneas. Tiene sentido porque la línea no vive fuera del pedido.
- `orphanRemoval=true`: si quitas la línea de la colección, se elimina. Úsalo solo para composición real; no para relaciones compartidas.

#### 3. Cuándo ManyToMany es correcto

ManyToMany puro sirve cuando solo existe la asociación. Ejemplo clásico: producto-categoría sin metadatos. Si mañana necesitas "quién asignó la categoría" o "desde cuándo", ya no es puro: migra a entidad intermedia. Criterio experto: si hay duda razonable de que la relación ganará atributos, prefiere entidad intermedia desde el inicio.

#### 4. Herencia: el problema objeto-relacional

Java tiene herencia. SQL no tiene una forma única de representarla. JPA ofrece tres estrategias:

| Estrategia | SQL resultante | Bueno para | Costo |
|---|---|---|---|
| `SINGLE_TABLE` | Una tabla con todas las columnas + discriminador | Consultas polimórficas rápidas, jerarquías simples | Columnas nullable por subclase, tabla más ancha |
| `JOINED` | Tabla base + tabla por subclase, joins | Normalización, restricciones por subclase | Inserts/lecturas polimórficas con joins |
| `TABLE_PER_CLASS` | Tabla independiente por concreta | Clases concretas aisladas | Polimorfismo con UNION, más complejo |

En `Pago`:

```java
@Entity
@Table(name = "pagos")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_pago")
public abstract class Pago { ... }
```

La prueba `herenciaSingleTable` persiste un `PagoTarjeta` y un `PagoTransferencia`, luego consulta por la base `Pago`. Hibernate materializa las subclases correctas porque el discriminador le dice qué tipo concreto instanciar.

#### 5. Criterio experto

No elijas por "la que vi en un tutorial". Elige por patrón de acceso: si consultas mucho por la base polimórfica y la jerarquía es estable, `SINGLE_TABLE` suele rendir bien. Si necesitas integridad fuerte por subclase, `JOINED`. Si el polimorfismo es raro y las concretas se consultan por separado, evalúa `TABLE_PER_CLASS`. Mide con datos reales.

#### 6. Con Spring Initializr

En un proyecto generado desde [Spring Initializr](https://start.spring.io/) con **Spring Data JPA**, las estrategias de herencia se declaran igual (`@Inheritance`, `@DiscriminatorColumn`). Spring Data puede exponer repositorios polimórficos (`JpaRepository<Pago, Long>`) y consultas derivadas; el SQL generado lo decide Hibernate según la estrategia elegida.

### Tema 3: Ciclo de vida, EntityManager y consultas tipadas · Intermedio · 40 min

#### 1. El EntityManager no es un DAO mágico

El `EntityManager` es el punto de entrada al **persistence context**. El persistence context es un mapa de identidad + unidad de seguimiento de cambios. Mientras una entidad está *managed*, Hibernate sabe qué id tiene, qué estado tenía al cargarse y qué cambios se hicieron.

#### 2. Estados con consecuencias reales

| Estado | ¿JPA lo rastrea? | ¿Tiene fila? | ¿Qué pasa si lo modificas? |
|---|---:|---:|---|
| Transient | No | No | Nada en BD |
| Managed | Sí | Sí/pendiente | Dirty checking puede generar UPDATE en flush/commit |
| Detached | No | Sí | Cambios no se sincronizan salvo merge |
| Removed | Sí (marcado) | Sí hasta flush | Se genera DELETE |

#### 3. `persist`, `flush`, `clear`: no significan lo mismo

```java
Cliente c = new Cliente("tmp@aurora.test", "Tmp", new Direccion("Piura", "Calle 1"));
em.persist(c);   // transient -> managed
em.flush();      // SQL INSERT enviado a BD (transacción sigue abierta)
Long id = c.getId();
em.clear();      // todas las entidades managed -> detached
Cliente detached = em.find(Cliente.class, id); // SELECT, nueva instancia managed
```

- `persist`: registra la entidad en el contexto. Puede diferir el INSERT hasta flush, según estrategia/id.
- `flush`: empuja cambios pendientes al SQL. No hace commit. Si la transacción hace rollback, el flush no "salva" los datos.
- `clear`: vacía el contexto. Útil en tests o batch para liberar memoria. No borra en BD.

El test `cicloVidaYCallback` usa este flujo para demostrar que el dato persiste tras clear/find.

#### 4. Dirty checking y write-behind

Cuando una entidad está managed, no necesitas llamar `update()`. Cambias el campo y, en flush/commit, Hibernate compara el estado actual con el snapshot inicial y genera SQL solo si cambió algo. Esto se llama **dirty checking**. El **write-behind** es la capacidad de posponer SQL hasta el momento necesario. Es eficiente, pero también explica por qué un bug puede "explotar" lejos de donde modificaste el objeto.

#### 5. Callback `@PrePersist`

En `Pedido`:

```java
@PrePersist
void antesDePersistir() {
    if (creadoEn == null) {
        creadoEn = LocalDateTime.of(2026, 11, 22, 10, 0);
    }
}
```

Se ejecuta antes de persistir. Sirve para metadatos técnicos simples. **No** lo uses para lógica de negocio compleja, I/O, llamadas remotas o decisiones que deberían estar en el servicio. El callback corre dentro del flujo de persistencia; hacerlo pesado vuelve el modelo impredecible.

#### 6. JPQL tipada

```java
TypedQuery<Pedido> q = em.createQuery(
        "select p from Pedido p where p.fecha = :fecha order by p.id", Pedido.class);
q.setParameter("fecha", fecha);
```

JPQL opera sobre entidades/campos. Hibernate lo traduce a SQL según el dialecto. Usa parámetros, no concatenación. La consulta tipada evita castings y hace el contrato explícito. Aun así, JPQL no te protege de N+1: puedes traer pedidos correctamente y disparar N consultas después al navegar relaciones LAZY.

#### 7. Equivalente en Spring Boot / Spring Initializr

Si arrancas desde [Spring Initializr](https://start.spring.io/) con **Spring Data JPA**, Spring Boot auto-configura `DataSource`, `EntityManagerFactory`, `EntityManager` y el manejo de transacciones. En vez de crear `EntityManagerFactory` manualmente, inyectas un repositorio o `EntityManager`. La consulta anterior suele expresarse como:

```java
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByFechaOrderById(LocalDate fecha);
}
```

Es más corto, pero ejecuta el mismo concepto JPA por debajo. Por eso este módulo primero muestra el `EntityManager` directo: cuando depures N+1, flush o locks, necesitas saber qué capa está haciendo qué.

### Tema 4: Búsquedas dinámicas con Criteria y Querydsl · Intermedio · 40 min

#### 1. Por qué la concatenación de strings se rompe

Un filtro de pantalla real llega así: fecha opcional, SKU opcional, cliente opcional, estado opcional. Con strings, el código termina con `if` por todos lados, errores de espacios, `where 1=1`, y joins condicionales frágiles. El problema no es que "no funcione"; es que es difícil de revisar y fácil de romper.

#### 2. Criteria API: composición segura, verbose

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

`distinct(true)` importa porque el join con `lineas` puede multiplicar filas del pedido. Sin `distinct`, la misma entidad puede aparecer repetida en el resultado.

La prueba `criteriaDinamica` filtra por fecha y SKU `CAF-100` y obtiene 1 pedido. Eso verifica la composición.

#### 3. SQL mental vs Criteria

La consulta anterior equivale conceptualmente a:

```sql
select distinct p.*
from pedidos p
join lineas_pedido l on l.pedido_id = p.id
where p.fecha = ?
  and l.sku = ?
order by p.id;
```

Criteria no es "mejor SQL"; es una forma programática de construir consultas cuando la forma depende de la entrada.

#### 4. Querydsl y cuándo elegirlo

Querydsl genera un metamodelo tipado y permite una API más fluida. Es más legible en consultas dinámicas complejas. Su costo: configuración de apt/generación y una dependencia más. 

**Criterio:** JPQL para consultas fijas. Criteria si quieres quedarte en JPA estándar. Querydsl si el equipo tiene muchas consultas dinámicas y valora legibilidad. Para reportes pesados, SQL nativo o proyecciones dedicadas pueden ser mejores que forzar todo a entidades.

#### 5. En Spring Initializr / Spring Data

Con [Spring Initializr](https://start.spring.io/) puedes agregar **Spring Data JPA** y, si lo necesitas, soporte de Querydsl vía dependencias de tu build. Spring Data ofrece `JpaSpecificationExecutor` para Criteria reusable:

```java
public interface PedidoRepository extends JpaRepository<Pedido, Long>, JpaSpecificationExecutor<Pedido> {}

// uso
repo.findAll((root, query, cb) -> cb.equal(root.get("fecha"), fecha));
```

La ventaja es integrar Criteria al ecosistema Spring; la desventaja es otra capa de abstracción. Sigue siendo Criteria JPA debajo.

**Nota de verificación:** Querydsl y `JpaSpecificationExecutor` no se ejecutaron en este build; la implementación verificada usa Criteria API directa con `EntityManager`.

### Tema 5: FetchType.LAZY, EAGER y el problema N+1 · Avanzado · 40 min

#### 1. El problema real: el bucle inocente

En Tienda Aurora, la pantalla de despacho lista pedidos de una fecha y muestra el nombre del cliente. En Java, el código parece inofensivo:

```java
List<Pedido> pedidos = repo.pedidosPorFecha(LocalDate.of(2026, 11, 20));
for (Pedido p : pedidos) {
    System.out.println(p.getId() + " - " + p.getCliente().getNombre());
}
```

La pregunta clave es: **¿cuántas consultas SQL ejecuta esto?** No la responde el código Java por sí solo. La responde el plan de fetch de JPA/Hibernate.

#### 2. Qué significa LAZY y qué significa EAGER

En `Pedido` la asociación al cliente está declarada así:

```java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "cliente_id", nullable = false)
private Cliente cliente;
```

| FetchType | Cuándo carga la asociación | Qué SQL esperas | Riesgo |
|---|---|---|---|
| `LAZY` | Cuando accedes a la asociación (si el EntityManager sigue abierto) | 1 SQL para pedidos; SQL extra al acceder a cliente | N+1 si iteras |
| `EAGER` | Al cargar la entidad principal | Join/select inmediato | Cargas innecesarias en todos los casos de uso, grafos grandes, rendimiento impredecible |

`LAZY` no significa “nunca carga”. Significa “no cargues ahora; carga cuando se necesite”. Hibernate suele implementar esto con un proxy. Si el contexto de persistencia está cerrado y accedes al proxy, obtienes `LazyInitializationException`.

`EAGER` no significa “más rápido”. Significa “siempre carga”, incluso cuando la pantalla solo necesitaba `pedido.getId()` y `pedido.getFecha()`.

#### 3. Qué es N+1

N+1 es un patrón de consultas:

- **1** consulta para obtener N pedidos.
- **N** consultas adicionales, una por cada pedido, cuando accedes a `getCliente()`.

Con 3 pedidos: 4 consultas. Con 1.000 pedidos: 1.001 consultas. La degradación no es lineal en experiencia de usuario; la latencia de red/BD y la contención del pool la hacen mucho peor.

#### 4. Evidencia real con SQL capturado

La demo `DemoN1` usa un `StatementInspector` (`SqlCapture`) y `SessionFactory.getStatistics()`. Se ejecutó con `./gradlew -q demoN1` sobre `/tmp/opencode/aurora-m16`.

```java
SqlCapture.clear();
stats.clear();
servicio.query(em -> {
    List<Pedido> pedidos = new PedidoRepositorio(em)
            .pedidosPorFecha(LocalDate.of(2026, 11, 20)); // 1 query
    for (Pedido p : pedidos) {
        System.out.println("pedido=" + p.getId() + " cliente=" + p.getCliente().getNombre()); // N queries
    }
    return null;
});
System.out.println("SQL_COUNT=" + stats.getPrepareStatementCount());
```

Salida real:

```text
pedido=1 cliente=Ana
pedido=2 cliente=Bruno
pedido=3 cliente=Carla
SQL_COUNT=4
SQL: select p1_0.id,p1_0.cliente_id,p1_0.creado_en,p1_0.fecha,p1_0.version from pedidos p1_0 where p1_0.fecha=? order by p1_0.id
SQL: select c1_0.id,c1_0.direccion_id,c1_0.email,c1_0.nombre from clientes c1_0 where c1_0.id=?
SQL: select c1_0.id,c1_0.direccion_id,c1_0.email,c1_0.nombre from clientes c1_0 where c1_0.id=?
SQL: select c1_0.id,c1_0.direccion_id,c1_0.email,c1_0.nombre from clientes c1_0 where c1_0.id=?
```

Lectura técnica: la primera consulta trae solo columnas de `pedidos`. Como `cliente` es LAZY, Hibernate no hizo join. Al acceder al nombre del cliente, cada proxy dispara su propio SELECT por id.

#### 5. Corrección A: `join fetch` JPQL

```java
public List<Pedido> pedidosConClienteJoinFetch(LocalDate fecha) {
    TypedQuery<Pedido> q = em.createQuery(
            "select distinct p from Pedido p join fetch p.cliente where p.fecha = :fecha order by p.id",
            Pedido.class);
    q.setParameter("fecha", fecha);
    return q.getResultList();
}
```

`join fetch` le dice a Hibernate: “resuelve esta asociación en la misma consulta”. `distinct` evita duplicados cuando el join multiplica filas. Es bueno cuando la relación es obligatoria y la consulta es específica.

#### 6. Corrección B: EntityGraph

```java
EntityGraph<Pedido> graph = em.createEntityGraph(Pedido.class);
graph.addAttributeNodes("cliente");
TypedQuery<Pedido> q = em.createQuery(
        "select p from Pedido p where p.fecha = :fecha order by p.id", Pedido.class);
q.setHint("jakarta.persistence.fetchgraph", graph);
```

Salida real de la misma demo con EntityGraph:

```text
---ENTITY_GRAPH---
pedido=1 cliente=Ana
pedido=2 cliente=Bruno
pedido=3 cliente=Carla
SQL_COUNT=1
SQL: select p1_0.id,p1_0.cliente_id,c1_0.id,c1_0.direccion_id,c1_0.email,c1_0.nombre,p1_0.creado_en,p1_0.fecha,p1_0.version from pedidos p1_0 join clientes c1_0 on c1_0.id=p1_0.cliente_id where p1_0.fecha=? order by p1_0.id
```

`SQL_COUNT=1` prueba que el plan de fetch trajo cliente en el mismo viaje.

#### 7. Corrección C: DTO projection

Si la pantalla solo necesita columnas, no cargues entidades:

```java
public record PedidoListaDto(Long id, LocalDate fecha, String cliente) {}

select new com.aurora.api.PedidoListaDto(p.id, p.fecha, c.nombre)
from Pedido p join p.cliente c
where p.fecha = :fecha
order by p.id
```

Es la opción más limpia para lecturas. No hay proxies, no hay dirty checking, no hay grafo managed innecesario.

#### 8. Qué NO hacer

- **No pongas EAGER global** para “arreglar” N+1. Mueves el problema a todas las consultas.
- **No abras la sesión en la vista** como parche. Solo oculta el límite transaccional.
- **No asumas**: mide con estadísticas/log SQL.
- **No hagas fetch de múltiples colecciones** a ciegas; puedes crear producto cartesiano.

#### 9. Con Spring Initializr / Spring Data JPA

En [Spring Initializr](https://start.spring.io/), agrega **Spring Data JPA** y podrás expresar el fetch plan en el repositorio:

```java
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @EntityGraph(attributePaths = "cliente")
    List<Pedido> findByFechaOrderById(LocalDate fecha);

    @Query("select distinct p from Pedido p join fetch p.cliente where p.fecha = :fecha order by p.id")
    List<Pedido> conCliente(@Param("fecha") LocalDate fecha);
}
```

Spring Data genera la infraestructura; Hibernate sigue ejecutando el mismo mecanismo JPA. La evidencia de N+1 se diagnostica igual: SQL logs, `hibernate.generate_statistics`, o un inspector.

#### 10. Criterio experto

Usa `LAZY` por defecto en asociaciones. Para cada caso de uso de lectura, elige explícitamente: `join fetch`/EntityGraph si vas a modificar entidades, DTO si solo lees. Verifica con conteo de SQL antes de dar por bueno el cambio. En producción, vigila p95/p99 y consultas lentas; un N+1 que pasa en dev con 3 filas explota con 3.000.

### Tema 6: EntityGraph y cachés de persistencia · Avanzado · 40 min

#### 1. EntityGraph: fetch por caso de uso

EntityGraph separa **qué datos son la entidad** de **qué datos necesita esta consulta**. Eso evita contaminar el mapeo con decisiones de una pantalla específica.

En el repo:

```java
EntityGraph<Pedido> graph = em.createEntityGraph(Pedido.class);
graph.addAttributeNodes("cliente");
q.setHint("jakarta.persistence.fetchgraph", graph);
```

`fetchgraph` indica que los atributos del grafo se tratan como eagerly fetched para esa consulta; el resto se comporta según reglas del grafo/fetch. `loadgraph` tiene semántica diferente (los atributos del grafo se cargan eager, otros pueden seguir su mapeo). La diferencia importa en modelos complejos.

#### 2. Caché L1 (first-level cache)

L1 vive en el `EntityManager`. Es obligatoria. Garantiza identidad: dentro del mismo contexto, la misma fila mapeada a la misma entidad produce la misma instancia.

Implicaciones:

- Bueno: evita lecturas repetidas y permite dirty checking.
- Cuidado: un contexto largo acumula entidades. En batch, usa `flush()` + `clear()` cada N elementos.
- Cuidado: L1 no es caché compartida entre usuarios/request; es por contexto.

#### 3. Caché L2 (second-level cache)

L2 es opcional y vive en el `EntityManagerFactory`/proveedor. Puede cachear entidades, colecciones o resultados de query, según configuración. El problema real es la invalidación y la consistencia.

Preguntas antes de habilitar L2:

- ¿La entidad se lee mucho más de lo que se escribe?
- ¿Tolero datos ligeramente viejos?
- ¿Qué pasa en cluster/múltiples instancias?
- ¿Cómo invalido o expiro?
- ¿El hit ratio justifica la complejidad?

**Nota de verificación:** L1 se verificó implícitamente por comportamiento JPA. No configuré L2 en este build porque introduciría proveedor/configuración no verificada. No aceptes "activé L2" sin métricas de hit/miss e invalidación.

#### 4. Criterio experto

Primero arregla el modelo de consultas: N+1, índices, paginación, DTOs, proyecciones. L2 es una optimización después de medir, no un parche para consultas mal diseñadas.

#### 5. Con Spring Initializr

Si usas [Spring Initializr](https://start.spring.io/) con **Spring Data JPA**, los `@EntityGraph` se declaran en interfaces de repositorio, como vimos en el Tema 5. Para L2, normalmente se agrega un proveedor como Ehcache/JCache y se configura con propiedades `spring.jpa.properties.hibernate.cache.*`; es configuración, no cambio de modelo. Habilítalo solo con métricas.

### Tema 7: Concurrencia, transacciones y propagación · Avanzado · 45 min

#### 1. El bug que no se ve en local

Dos operadores abren el mismo pedido. Ambos leen estado con versión 1. El operador A cambia fecha y guarda. El operador B, con datos viejos, guarda después. Si el sistema hace `UPDATE ... WHERE id=?` sin control, el último gana y puede pisar el cambio de A. Ese es **lost update**.

#### 2. Bloqueo optimista con `@Version`

```java
@Version
private long version;
```

Hibernate incluye la versión en el UPDATE. Conceptualmente:

```sql
update pedidos
set fecha=?, ..., version = version + 1
where id=? and version=?
```

Si otra transacción ya incrementó la versión, el WHERE no coincide, se actualizan 0 filas y Hibernate lanza `OptimisticLockException`.

En `PedidoServicio.demoOptimista()` se usan dos EntityManagers distintos, simulando dos transacciones concurrentes. El primero hace flush/commit. El segundo falla al hacer flush. La prueba `optimisticLock` verifica el tipo de excepción.

#### 3. Optimista vs pesimista

| Estrategia | Cómo funciona | Úsala cuando | Costo |
|---|---|---|---|
| Optimista (`@Version`) | Detecta conflicto al escribir | Baja contención, lecturas frecuentes | Reintento/conflicto en usuario |
| Pesimista (`PESSIMISTIC_WRITE`) | Bloquea fila en BD | Alta contención, operación crítica | Esperas, menor throughput, deadlocks |

No hay bala de plata. Stock crítico puede requerir pesimista; editar perfil de usuario suele ir bien con optimista.

#### 4. Transacciones y propagación

En JPA puro controlas transacciones con `begin/commit/rollback`. En Spring, `@Transactional` agrega propagación:

- `REQUIRED`: usa la existente o crea una.
- `REQUIRES_NEW`: suspende la actual y crea otra.
- `MANDATORY`, `SUPPORTS`, etc., para casos específicos.

La propagación no es decoración. Define límites atómicos. Un error común es poner `@Transactional` en todos lados sin pensar en el límite de negocio ni en llamadas remotas dentro de la transacción.

#### 5. Arranque con Spring Initializr

En [Spring Initializr](https://start.spring.io/), la dependencia **Spring Data JPA** trae la base para transacciones declarativas con Spring. Un servicio típico se vería así:

```java
@Service
public class PedidoService {
    @Transactional
    public void confirmar(Long id) {
        Pedido pedido = repo.findById(id).orElseThrow();
        pedido.confirmar();
        // dirty checking: no hace falta save() si la entidad está managed
    }
}
```

Spring abre la transacción, enlaza el EntityManager al hilo, hace commit/rollback y maneja propagación. Útil en producción; peligroso si lo usas sin entender el persistence context. Por eso este módulo verifica primero la forma explícita con `EntityManager`.

#### 5. Criterio experto

Mantén la transacción corta: leer/validar/escribir lo necesario, commit. Haz HTTP, colas, S3 o correos fuera de la transacción cuando sea posible. Captura `OptimisticLockException` donde tenga sentido de negocio: reintentar, mostrar conflicto o fusionar cambios. Nunca ignores la excepción.

### Tema 8: Migraciones y pruebas JPA con Testcontainers · Avanzado · 45 min

#### 1. `hbm2ddl` es para aprender, no para producción

En `persistence.xml` usamos:

```xml
<property name="hibernate.hbm2ddl.auto" value="create-drop"/>
```

Esto crea tablas al iniciar y las borra al cerrar. Es perfecto para una prueba local reproducible. Es peligroso en producción: no versiona, no migra datos existentes, no respeta ventanas de despliegue y puede causar pérdida de datos.

#### 2. Migraciones: el esquema como código

Flyway/Liquibase versionan cambios:

```sql
-- V1__crear_clientes_pedidos.sql
CREATE TABLE clientes (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  direccion_id BIGINT NOT NULL UNIQUE
);
```

Una migración responsable responde: ¿es compatible con la versión anterior de la app? ¿necesita backfill? ¿puedo desplegar en dos fases? ¿puedo revertir? Hibernate genera mapeos; las migraciones gobiernan la evolución real.

#### 3. H2 no es PostgreSQL

H2 es rápido y cómodo. Pero no es tu base de producción. Diferencias típicas: tipos, comportamiento de locks, JSONB, funciones, índices parciales, collations, `RETURNING`, ventanas, aislamiento y errores específicos. Un test verde en H2 no garantiza verde en PostgreSQL.

#### 4. Testcontainers: evidencia contra infraestructura real

Desde [Spring Initializr](https://start.spring.io/) puedes agregar **PostgreSQL Driver**, **Testcontainers**, y en proyectos Spring Boot también **Spring Boot Testcontainers** para auto-conectar contenedores en tests. Las dependencias típicas son:

```kotlin
testImplementation("org.springframework.boot:spring-boot-testcontainers")
testImplementation("org.testcontainers:junit-jupiter")
testImplementation("org.testcontainers:postgresql")
```

Un test de integración real se ve así:

```java
@Testcontainers
@DataJpaTest
class PedidoRepositorioIT {
  @Container
  @ServiceConnection
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

  @Autowired PedidoRepository repo;

  @Test
  void guardaYPersiste() { ... }
}
```

`@ServiceConnection` (Spring Boot 3.1+) configura el datasource desde el contenedor. `@DataJpaTest` carga el slice JPA. Con esto pruebas el repositorio contra PostgreSQL real, no contra H2.

**Nota de verificación honesta:** no ejecuté Flyway ni Testcontainers en este módulo. La suite verificada usa H2/JUnit 5 y pasó. Docker está disponible en el entorno, pero agregar Testcontainers/Flyway requiere dependencias, configuración y tests de integración separados; no voy a reportar una ejecución que no hice. El siguiente paso de producción es crear `*IT` con Testcontainers y ejecutar migraciones Flyway antes de los tests.

#### 5. Criterio experto

Pirámide práctica: unit tests rápidos, tests JPA con H2 para feedback, tests de integración con Testcontainers/PostgreSQL para contrato real, migraciones versionadas en CI/CD. No hay una sola herramienta; hay capas de confianza.

## Verificación real (actualización 2026-05-23)

Reejecutado el 2026-05-23 en `/tmp/opencode/aurora-m16` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25):

```bash
./gradlew -q test
./gradlew -q run
```

- `test`: 0 fallas.
- `run`: Hibernate/H2 inicializa y el grafo produce `sinGraph=4`, `conGraph=1` (se observan logs INFO/WARN de Hibernate/H2 esperados en entorno de demo).

## Cierre

JPA te da productividad cuando entiendes el costo que abstrae. El mapa mental experto es: **identidad** (¿qué es la misma entidad?), **estado** (¿managed o detached?), **fetch** (¿qué SQL y cuándo?), **transacción** (¿qué unidad atómica?), **concurrencia** (¿quién gana ante conflicto?) y **esquema** (¿cómo evoluciona sin romper datos?). Si puedes responder esas seis preguntas ante un bug, ya no estás usando JPA por intuición.

## Checklist

- [ ] Puedo explicar la diferencia entre objeto Java, entidad managed y fila SQL.
- [ ] Sé qué anotación crea una restricción real en BD y cuál solo describe el mapeo.
- [ ] Distingo dueño de relación, `mappedBy`, cascade y `orphanRemoval`.
- [ ] Elijo herencia JPA por patrón de consulta, no por costumbre.
- [ ] Entiendo transient/managed/detached/removed, dirty checking, `flush` y `clear`.
- [ ] Puedo construir JPQL tipada y Criteria dinámica sin concatenar strings.
- [ ] Puedo demostrar N+1 con SQL real y corregirlo con `join fetch`, EntityGraph o DTO.
- [ ] Sé cuándo NO usar EAGER global ni L2 sin métricas.
- [ ] Puedo explicar `@Version`, `OptimisticLockException` y trade-off con lock pesimista.
- [ ] Trato el esquema con migraciones y valido persistencia real con Testcontainers.
