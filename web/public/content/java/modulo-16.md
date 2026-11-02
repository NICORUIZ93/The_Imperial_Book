# Módulo 16: JPA, Hibernate y FetchType.LAZY vs EAGER

**Proyecto del módulo:** dos aplicaciones Maven creadas desde carpetas vacías para persistir pedidos y medir las consultas de Hibernate. Escribirás cada entidad, configuración y prueba; ningún ejercicio depende de ejemplos o archivos prefabricados.

## Aprende construyendo

La meta no es memorizar anotaciones: es decidir qué datos cargar para cada operación sin producir N+1, errores de sesión cerrada ni respuestas JSON cíclicas.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** dos clientes y sus pedidos en H2. Comprobarás la clave foránea, cargarás asociaciones dentro de una transacción y observarás el SQL.
- **Caso RutaFlow:** una pantalla paginada de envíos muestra referencia, estado y última parada. El listado necesita una proyección DTO y el detalle una consulta específica; serializar la entidad completa no es una estrategia de carga.

`EAGER` significa que la asociación debe estar disponible, no que Hibernate necesariamente use un único `JOIN`. La evidencia es el número de consultas y filas observado con datos suficientes, no solo una anotación.

### Tema 1: Entidades y relaciones JPA · Intermedio · 55 min

#### Aprende

**Prerrequisito:** JDK 27, Maven 3.9 o superior, clases, colecciones y SQL básico. Comprueba `java --version` y `mvn --version`.

**Al terminar podrás:** mapear `Cliente` y `Pedido`, mantener sincronizados los dos lados de una relación bidireccional y verificar con una prueba que la clave foránea se persiste correctamente.

JPA define el contrato de persistencia; Hibernate traduce entidades y operaciones a SQL. `@Entity` identifica una clase persistente, `@Id` su clave y las asociaciones describen referencias entre filas. En una relación bidireccional, `mappedBy` señala el lado inverso; el lado con `@JoinColumn` es propietario y escribe la clave foránea.

**¿Por qué es importante?** Porque modificar solo una colección Java puede dar una impresión falsa: si el lado propietario queda nulo, la base de datos no refleja la relación y puede rechazar la escritura.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| `@Entity`, `@Id`, `@GeneratedValue` | Prerrequisito | Tabla creada y clave generada |
| Lado propietario (`@JoinColumn`) vs inverso (`mappedBy`) | Núcleo | FK `cliente_id` escrita por `Pedido` |
| Sincronizar ambos lados en el agregado | Núcleo | `Cliente.agregar` fija colección y referencia |
| `CascadeType.PERSIST` no implica `REMOVE` | Límite | Borrado de cliente con pedidos falla por FK |
| `@Enumerated(EnumType.STRING)` | Variante | Estado persistido como texto, no ordinal |
| Unidireccional cuando solo navegas en un sentido | Decisión | Menos invariantes que mantener |
| No exponer setters generales | Error frecuente | Agregado sin camino a estado inconsistente |

Cada fila tiene su explicación individual a continuación.

**`@Entity`, `@Id`, `@GeneratedValue` (prerrequisito).** `@Entity` marca una clase como persistente y la asocia a una tabla; `@Id` designa la clave primaria; `@GeneratedValue` delega la generación del identificador a la base o al proveedor. Sin estos tres, Hibernate no sabe cómo mapear ni identificar filas.

**Lado propietario vs inverso (núcleo).** En una relación bidireccional, solo un lado escribe la clave foránea: el propietario, el que tiene `@JoinColumn`. El otro lado usa `mappedBy` y es un espejo de lectura. En este modelo `Pedido` es propietario (tiene `cliente_id`) y `Cliente.pedidos` es el inverso. Escribir solo el inverso no toca la FK.

**Sincronizar ambos lados en el agregado (núcleo).** Como la base solo ve el lado propietario, `Cliente.agregar` debe hacer dos cosas: añadir el pedido a la colección *y* llamar a `pedido.asignarCliente(this)`. Si olvidas lo segundo, la colección Java se ve poblada pero `Pedido.cliente` queda nulo y la inserción falla o deja la FK vacía.

**`CascadeType.PERSIST` no implica `REMOVE` (límite).** `cascade = PERSIST` propaga el `persist` del cliente a sus pedidos nuevos, pero no borra pedidos cuando borras el cliente. Intentar eliminar un cliente con pedidos sin una política explícita produce un error de clave foránea; el borrado en cascada es una decisión de ciclo de vida que se declara aparte (`REMOVE`, `orphanRemoval`) o se resuelve reasignando.

**`@Enumerated(EnumType.STRING)` (variante).** Un enum persistido sin anotar usa `ORDINAL` (su posición), así que reordenar o insertar valores corrompe datos existentes. `@Enumerated(EnumType.STRING)` guarda el nombre, que es estable frente a cambios en el orden del enum.

**Unidireccional cuando solo navegas en un sentido (decisión).** No toda relación necesita ser bidireccional. Si solo consultas los pedidos de un cliente y nunca el cliente desde un pedido fuera de la FK, una relación unidireccional elimina el invariante de mantener ambos lados sincronizados y reduce la superficie de error.

**No exponer setters generales (error frecuente).** Si `Pedido` tuviera `setCliente` público, cualquier código podría romper el agregado dejando colección y FK en desacuerdo. Mantener la mutación dentro de métodos del agregado (`agregar`, `asignarCliente` con visibilidad de paquete) impide estados inconsistentes por construcción.

**Analogía:** dos agendas pueden mostrar una amistad, pero solo una contiene el teléfono oficial. Cambiar la agenda inversa no actualiza el dato que se usa para contactar.

`CascadeType.PERSIST` propaga la persistencia desde cliente a pedidos; no implica `REMOVE`. Las cascadas de borrado necesitan una regla de ciclo de vida explícita. Tampoco toda asociación debe ser bidireccional: si solo navegas en una dirección, una relación unidireccional reduce invariantes.

**Cuándo no usarlo:** evita exponer setters generales, cascadas amplias y relaciones bidireccionales cuando el caso de uso no las requiere.

#### Practica

Crea una carpeta vacía y todos los archivos del proyecto:

```bash
mkdir ejemplo-jpa-relaciones
cd ejemplo-jpa-relaciones
mkdir -p src/main/java/academia/pedidos src/test/java/academia/pedidos src/test/resources
```

Escribe `pom.xml` con Spring Boot, JPA, H2 y pruebas; no uses un generador:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.5.7</version>
    <relativePath/>
  </parent>
  <groupId>academia</groupId><artifactId>jpa-relaciones</artifactId><version>1.0.0</version>
  <properties><java.version>27</java.version></properties>
  <dependencies>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
    <dependency><groupId>com.h2database</groupId><artifactId>h2</artifactId><scope>runtime</scope></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
  </dependencies>
</project>
```

Crea `src/main/java/academia/pedidos/PedidosApplication.java`:

```java
package academia.pedidos;

import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PedidosApplication {
    public static void main(String[] args) {
        // Las pruebas del laboratorio inician el contexto de persistencia.
    }
}
```

Crea `src/main/java/academia/pedidos/Cliente.java`:

```java
package academia.pedidos;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Cliente {
    @Id @GeneratedValue
    private Long id;
    private String nombre;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.PERSIST)
    private List<Pedido> pedidos = new ArrayList<>();

    protected Cliente() {}

    public Cliente(String nombre) { this.nombre = nombre; }

    public void agregar(Pedido pedido) {
        pedidos.add(pedido);
        pedido.asignarCliente(this);
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public List<Pedido> getPedidos() { return List.copyOf(pedidos); }
}
```

Crea `src/main/java/academia/pedidos/Pedido.java`:

```java
package academia.pedidos;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Pedido {
    @Id @GeneratedValue
    private Long id;
    private String referencia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    protected Pedido() {}

    public Pedido(String referencia) { this.referencia = referencia; }
    void asignarCliente(Cliente cliente) { this.cliente = cliente; }
    public Long getId() { return id; }
    public String getReferencia() { return referencia; }
}
```

Escribe `src/test/resources/application.properties`:

```properties
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

Crea `src/test/java/academia/pedidos/RelacionPedidosTest.java`:

```java
package academia.pedidos;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.jdbc.core.JdbcTemplate;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class RelacionPedidosTest {
    @Autowired EntityManager entityManager;
    @Autowired JdbcTemplate jdbc;

    @Test
    void guardaPropietarioYClaveForanea() {
        Cliente cliente = new Cliente("Logística Norte");
        cliente.agregar(new Pedido("PED-1"));
        cliente.agregar(new Pedido("PED-2"));

        entityManager.persist(cliente);
        entityManager.flush();
        Long clienteId = cliente.getId();
        entityManager.clear();

        Long total = jdbc.queryForObject(
            "select count(*) from pedido where cliente_id = ?", Long.class, clienteId);
        Cliente recuperado = entityManager.find(Cliente.class, clienteId);
        assertThat(total).isEqualTo(2);
        assertThat(recuperado.getPedidos()).hasSize(2);
    }
}
```

Ejecuta desde la raíz:

```bash
mvn clean test
```

**Resultado esperado:** una prueba en verde, `BUILD SUCCESS`, dos sentencias de inserción para pedidos y una consulta que confirma dos filas con el mismo `cliente_id`. El test consulta la columna física, no solamente la colección en memoria.

**Fallo deliberado:** elimina `pedido.asignarCliente(this);` de `Cliente.agregar` y ejecuta otra vez. La colección inversa recibe los pedidos, pero su propietario `Pedido.cliente` queda nulo; la persistencia falla por la asociación obligatoria o deja la clave sin asignar. **Corrección:** restaura la asignación dentro del método del agregado y repite la prueba.

#### Aplica

Agrega `EstadoPedido` como enum y persiste `estado` con `@Enumerated(EnumType.STRING)`. Añade una consulta que obtenga los pedidos por `cliente.id`. Después intenta borrar un cliente con pedidos sin `CascadeType.REMOVE`, conserva el error de clave foránea y decide si la regla debe bloquear, reasignar o borrar.

Como ejercicio independiente, modela `LineaPedido` en este mismo proyecto, con un método `Pedido.agregarLinea` que actualice ambos lados. Escribe otra prueba para la clave foránea y el total de líneas, sin setters públicos que permitan dejar el agregado inconsistente.

**Checklist de salida**

- [ ] El proyecto y sus cinco archivos principales se crearon manualmente desde una carpeta vacía.
- [ ] `Pedido` es el lado propietario mediante `@JoinColumn`.
- [ ] `Cliente.agregar` sincroniza colección y referencia propietaria.
- [ ] La prueba confirma dos claves foráneas físicas.
- [ ] El fallo sin `asignarCliente` se diagnostica y se corrige.
- [ ] Estado, borrado y líneas nuevas tienen reglas de persistencia explícitas.

**Proyecto integrador:** modela en el Módulo 13 la relación entre cliente y envío con un método de agregado equivalente y añade su prueba de clave foránea antes de implementar consultas de detalle.

**Errores comunes:** actualizar solo el lado inverso, convertir toda relación en bidireccional, añadir `REMOVE` sin una política de ciclo de vida y usar `@Enumerated` sin `EnumType.STRING`.

Fuentes oficiales revisadas el 2026-11-01: [Jakarta Persistence](https://jakarta.ee/specifications/persistence/), [Hibernate ORM](https://hibernate.org/orm/documentation/) y [Java SE 27 Documentation](https://docs.oracle.com/en/java/javase/27/).

### Tema 2: FetchType.LAZY, EAGER y el problema N+1 · Avanzado · 1 h

#### Aprende

**Prerrequisito:** JDK 27, Maven y comprensión del lado propietario JPA. Este tema no reutiliza archivos del tema anterior: volverás a escribir el modelo necesario en un proyecto nuevo.

**Al terminar podrás:** reproducir once consultas para diez clientes, reducirlas a una con `JOIN FETCH` y justificar una estrategia de carga por caso de uso sin confundir `EAGER` con un único join.

`LAZY` difiere la asociación hasta acceder a ella; `EAGER` exige disponibilidad al devolver la entidad, pero el proveedor puede usar consultas adicionales. En JPA, `@ManyToOne` y `@OneToOne` son EAGER por defecto; `@OneToMany` y `@ManyToMany` son LAZY. Declara la intención, especialmente `LAZY` en asociaciones to-one.

**¿Por qué es importante?** Porque una pantalla que consulta diez clientes y luego los pedidos de cada uno realiza 1+N viajes. Con más filas, el coste crece silenciosamente aunque cada consulta sea rápida.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Defaults de fetch (to-one EAGER, to-many LAZY) | Prerrequisito | `@ManyToOne` LAZY declarado explícito |
| El problema N+1 medido | Núcleo | 11 `prepareStatement` para 10 clientes |
| `JOIN FETCH` resuelve en una consulta | Núcleo | 1 `prepareStatement` + `distinct` |
| Medir con contexto limpio (`clear()`) | Diagnóstico | Sin `clear` el contador se falsea |
| `EAGER` ≠ un único join | Límite | SQL con consultas adicionales pese a EAGER |
| Paginar fetch de colección es en memoria | Límite | Advertencia `firstResult/maxResults` |
| Proyección DTO para listados | Decisión | `select new ClienteResumen(...)` |

Cada fila tiene su explicación individual a continuación.

**Defaults de fetch (prerrequisito).** JPA fija por defecto `EAGER` en `@ManyToOne`/`@OneToOne` y `LAZY` en `@OneToMany`/`@ManyToMany`. Esos defaults rara vez coinciden con lo que un caso de uso necesita, por eso se declara la intención explícitamente, sobre todo `LAZY` en asociaciones to-one que de otro modo se cargarían siempre.

**El problema N+1 medido (núcleo).** Cargar diez clientes con una consulta y luego acceder a `pedidos` de cada uno dispara una consulta por cliente: 1 + 10 = 11. La métrica `statistics.getPrepareStatementCount()` lo cuantifica. El síntoma es invisible con pocos datos y crece linealmente con las filas.

**`JOIN FETCH` resuelve en una consulta (núcleo).** `select distinct c from Cliente c left join fetch c.pedidos` trae clientes y pedidos en un solo viaje. El `distinct` elimina los clientes duplicados que el join produce al multiplicar filas por pedido. El contador baja de 11 a 1 para la misma vista.

**Medir con contexto limpio (diagnóstico).** La caché de primer nivel (el `EntityManager`) ya tiene las entidades tras el `flush` de preparación. Sin `entityManager.clear()`, acceder a `pedidos` no genera consultas nuevas y el contador miente. `clear()` antes de medir fuerza que los accesos vayan de verdad a la base.

**`EAGER` ≠ un único join (límite).** `EAGER` solo garantiza que la asociación esté disponible al devolver la entidad, no *cómo* se carga. Hibernate puede emitir consultas adicionales (SELECT secundarios) en vez de un join. Por eso la evidencia es el SQL y el conteo observados, no la anotación: poner `EAGER` no cura N+1 ni asegura un join.

**Paginar un fetch de colección es en memoria (límite).** Al hacer `JOIN FETCH` de una colección y pedir `setMaxResults(5)`, Hibernate avisa `firstResult/maxResults specified with collection fetch; applying in memory`: el join ya multiplicó las filas, así que la paginación se aplica tras traerlas todas, no en la base. Paginar listados exige otra estrategia (DTO o consulta de IDs + datos).

**Proyección DTO para listados (decisión).** Un listado resumido no necesita entidades completas ni sus colecciones. `select new academia.ClienteResumen(c.nombre, count(p))` agrupado trae exactamente los campos de la vista en una consulta paginable, sin N+1 ni filas duplicadas. La entidad completa se reserva para el detalle, donde `@EntityGraph` carga justo lo necesario.

**Analogía:** N+1 es pedir la lista de comensales y después caminar a la cocina una vez por cada plato; un pedido conjunto evita los viajes cuando realmente necesitas todos los platos.

El mapeo es un valor por defecto, no un plan universal. `JOIN FETCH`, `@EntityGraph` y proyecciones DTO responden a necesidades distintas. Un fetch de colección multiplica filas y no debe paginarse sin comprobar la advertencia de Hibernate; una lista resumida suele necesitar un DTO en vez de una entidad completa.

**Cuándo no usarlo:** `EAGER` global no cura `LazyInitializationException`; tampoco uses `JOIN FETCH` de varias colecciones sin medir el producto de filas.

#### Practica

Crea otro proyecto desde una carpeta vacía:

```bash
mkdir ejemplo-jpa-n-mas-uno
cd ejemplo-jpa-n-mas-uno
mkdir -p src/main/java/academia/pedidos src/test/java/academia/pedidos src/test/resources
```

Escribe `pom.xml` completo:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>3.5.7</version><relativePath/></parent>
  <groupId>academia</groupId><artifactId>jpa-consultas</artifactId><version>1.0.0</version>
  <properties><java.version>27</java.version></properties>
  <dependencies>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
    <dependency><groupId>com.h2database</groupId><artifactId>h2</artifactId><scope>runtime</scope></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
  </dependencies>
</project>
```

Crea `src/main/java/academia/pedidos/ConsultasApplication.java`:

```java
package academia.pedidos;

import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ConsultasApplication {
    public static void main(String[] args) {
        // El laboratorio se ejecuta mediante sus pruebas JPA.
    }
}
```

Crea `src/main/java/academia/pedidos/Cliente.java`:

```java
package academia.pedidos;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Cliente {
    @Id @GeneratedValue private Long id;
    private String nombre;

    @OneToMany(mappedBy = "cliente", fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    private List<Pedido> pedidos = new ArrayList<>();

    protected Cliente() {}
    public Cliente(String nombre) { this.nombre = nombre; }
    public void agregar(Pedido pedido) { pedidos.add(pedido); pedido.asignarCliente(this); }
    public List<Pedido> getPedidos() { return List.copyOf(pedidos); }
}
```

Crea `src/main/java/academia/pedidos/Pedido.java`:

```java
package academia.pedidos;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Pedido {
    @Id @GeneratedValue private Long id;
    private String referencia;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    protected Pedido() {}
    public Pedido(String referencia) { this.referencia = referencia; }
    void asignarCliente(Cliente cliente) { this.cliente = cliente; }
}
```

Escribe `src/test/resources/application.properties`:

```properties
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.generate_statistics=true
```

Crea `src/test/java/academia/pedidos/ConsultasPedidoTest.java`:

```java
package academia.pedidos;

import jakarta.persistence.EntityManager;
import java.util.List;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ConsultasPedidoTest {
    @Autowired EntityManager entityManager;
    private Statistics statistics;

    @BeforeEach
    void preparar() {
        for (int i = 1; i <= 10; i++) {
            Cliente cliente = new Cliente("Cliente " + i);
            cliente.agregar(new Pedido("PED-" + i + "-A"));
            cliente.agregar(new Pedido("PED-" + i + "-B"));
            entityManager.persist(cliente);
        }
        entityManager.flush();
        statistics = entityManager.getEntityManagerFactory()
            .unwrap(SessionFactory.class).getStatistics();
    }

    @Test
    void accesoLazyRevelaN_Mas_Uno() {
        entityManager.clear();
        statistics.clear();

        List<Cliente> clientes = entityManager.createQuery(
            "select c from Cliente c", Cliente.class).getResultList();
        clientes.forEach(cliente -> assertThat(cliente.getPedidos()).hasSize(2));

        assertThat(statistics.getPrepareStatementCount()).isEqualTo(11);
    }

    @Test
    void joinFetchCargaLaMismaVistaConUnaConsulta() {
        entityManager.clear();
        statistics.clear();

        List<Cliente> clientes = entityManager.createQuery(
            "select distinct c from Cliente c left join fetch c.pedidos", Cliente.class)
            .getResultList();
        clientes.forEach(cliente -> assertThat(cliente.getPedidos()).hasSize(2));

        assertThat(clientes).hasSize(10);
        assertThat(statistics.getPrepareStatementCount()).isEqualTo(1);
    }
}
```

Ejecuta las dos mediciones:

```bash
mvn clean test
```

**Resultado esperado:** dos pruebas en verde. La primera registra 1 consulta de clientes + 10 de colecciones = 11; la segunda registra 1 y conserva diez clientes gracias a `distinct`. Limpiar el contexto antes de medir evita que la caché de primer nivel oculte accesos a la base.

**Fallo deliberado:** elimina `entityManager.clear();` solo en `accesoLazyRevelaN_Mas_Uno` y ejecuta de nuevo. Las entidades y colecciones ya administradas reducen artificialmente las consultas adicionales; el contador ya no representa una solicitud nueva. **Corrección:** restaura `clear()` después de `flush()` y antes de `statistics.clear()`, y vuelve a obtener 11.

Cambia ahora la consulta optimizada por `JOIN FETCH` y añade `.setMaxResults(5)` en una copia del test. Hibernate puede advertir `firstResult/maxResults specified with collection fetch; applying in memory`: el join multiplicó filas antes de paginar. Retira esa paginación y restaura la medición base.

#### Aplica

Compara `LAZY` y `EAGER` cambiando temporalmente `Cliente.pedidos` a `FetchType.EAGER`; registra el SQL sin asumir que aparecerá un join y restaura `LAZY`. Implementa una tercera variante con una proyección `ClienteResumen(nombre, totalPedidos)` y una consulta `select new ... count(p)` agrupada. Como ejercicio independiente, construye un detalle con `@EntityGraph` y una lista paginada en dos consultas: primero IDs y después datos. Registra consultas, filas duplicadas y si cada variante permite paginación segura.

**Checklist de salida**

- [ ] El proyecto nuevo contiene diez clientes y veinte pedidos creados por el test.
- [ ] El contexto se limpia antes de cada medición.
- [ ] La variante LAZY demuestra once consultas.
- [ ] `JOIN FETCH` obtiene la misma vista con una consulta.
- [ ] El experimento sin `clear` se reconoce como medición inválida.
- [ ] DTO, `@EntityGraph` y paginación se eligen según el caso de uso.

**Proyecto integrador:** en el Módulo 13, usa un DTO para la lista de envíos y una consulta de detalle para envío con paradas; adjunta los conteos N+1 y optimizados antes de aceptar el cambio.

**Errores comunes:** activar EAGER como cura global, medir con la caché de primer nivel poblada, serializar entidades bidireccionales y paginar un fetch de colección en memoria sin advertirlo.

Fuentes oficiales revisadas el 2026-11-01: [Jakarta Persistence](https://jakarta.ee/specifications/persistence/), [Hibernate ORM: fetching](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#fetching) y [Java SE 27 Documentation](https://docs.oracle.com/en/java/javase/27/).

## Construcción guiada del capítulo

| Evidencia | Proyecto independiente | Orden y resultado |
|---|---|---|
| Integridad del agregado | `ejemplo-jpa-relaciones` | `mvn clean test`: dos pedidos comparten `cliente_id`; el fallo del lado propietario queda corregido |
| Costo de carga | `ejemplo-jpa-n-mas-uno` | `mvn clean test`: comparación 11 frente a 1 y advertencia de paginación comprendida |

Cierra el laboratorio con una decisión escrita para lista y detalle del Proyecto integrador. No presentes una anotación como prueba de rendimiento: conserva SQL, estadísticas y datos de entrada.
