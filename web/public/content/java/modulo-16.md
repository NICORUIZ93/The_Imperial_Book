# Módulo 16: JPA e Hibernate

JPA (Jakarta Persistence API) define el contrato de mapeo objeto-relacional en Java; Hibernate es una implementación popular. Este módulo cubre entidades, relaciones, ciclo de vida, consultas, N+1, cachés, transacciones y migraciones con enfoque práctico y formal.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Modelar entidades JPA con identidad y restricciones básicas |
| 2 | Elegir relaciones y estrategias de herencia con criterio |
| 3 | Entender el ciclo de vida de entidades y consultas tipadas |
| 4 | Construir consultas dinámicas con Criteria/Querydsl |
| 5 | Diagnosticar y corregir el problema N+1 |
| 6 | Usar EntityGraph y cachés con conocimiento de invalidación |
| 7 | Aplicar transacciones y aislamiento con criterio |
| 8 | Evolucionar esquema con migraciones y pruebas reproducibles |

## Aprende construyendo

### Tema 1: Entidades y relaciones JPA · Intermedio · 35 min

**Caso guía**

Quieres persistir guías de envío en una base relacional sin escribir SQL manual para cada CRUD. Necesitas mapear clases Java a tablas manteniendo identidad y restricciones.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *entidad JPA* es un objeto de dominio cuya identidad se mapea a una fila de tabla mediante metadatos (`@Entity`, `@Id`, `@Table`, `@Column`). El *EntityManager* administra el contexto de persistencia y el mapeo entre estado de objetos y filas.

**Contrato / invariantes / reglas.** La entidad debe tener identificador (`@Id`) y, para uso JPA general, constructor sin args accesible por el proveedor. La identidad de persistencia (`id`) no debe confundirse con igualdad Java arbitraria; `equals/hashCode` debe diseñarse con cuidado (identificador de negocio estable o estrategia documentada). Las anotaciones definen contrato de mapeo: tipos, nulabilidad, longitud, unicidad. El proveedor genera SQL según dialecto, pero el modelo relacional sigue existiendo.

**Modelo mental.** La entidad es una ficha con número de serie: el objeto vive en memoria, la fila vive en la base, JPA mantiene la correspondencia.

**Implementación desde cero**

> **Nota:** requiere dependencias JPA/Hibernate (`jakarta.persistence-api` + proveedor como Hibernate) y base de datos configurada; no compila standalone sin ellas.

```java
import jakarta.persistence.*;

@Entity
@Table(name = "guias")
public class GuiaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String numero;

    @Column(nullable = false, length = 60)
    private String estado;

    protected GuiaEntity() { } // JPA

    public GuiaEntity(String numero, String estado) {
        this.numero = numero;
        this.estado = estado;
    }

    public Long getId() { return id; }
    public String getNumero() { return numero; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
```

**Desglose del código**

- `@Entity` marca la clase persistible; `@Table` define el nombre de tabla.
- `@Id` + `@GeneratedValue` definen identidad gestionada por la base.
- `@Column` declara restricciones de esquema.
- Constructor protegido sin args requerido por JPA/Hibernate.

**Ejecución y salida real**

> **Nota:** requiere JPA/Hibernate y una base configurada (H2/PostgreSQL). Verifica con una prueba de integración o arranque Spring/Jakarta.

Comportamiento esperado: al persistir, Hibernate genera `INSERT` y asigna `id`.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `No default constructor` | Falta constructor sin args | Agrega constructor protegido/vacío |
| Duplicados inesperados en colección | `equals/hashCode` mal definido | Define identidad con criterio estable |
| Schema no coincide | Mapeo/DDL mal configurado | Revisa `@Column`, migraciones y dialecto |

**Verificación rápida**

Persiste una entidad en H2 en memoria y confirma que el `id` generado no es null.

### Tema 2: Relaciones uno a uno, muchos a muchos y herencia · Intermedio · 40 min

**Caso guía**

Una guía tiene remitente, pasa por varios eventos y puede clasificarse por tipo. Necesitas modelar relaciones sin crear un esquema imposible de consultar.

**Fundamento técnico y modelo mental**

**Definición formal.** Las relaciones JPA mapean asociaciones entre entidades: `@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`. La herencia ORM mapea jerarquías de clases a tablas (`SINGLE_TABLE`, `JOINED`, `TABLE_PER_CLASS`).

**Contrato / invariantes / reglas.** Toda relación bidireccional tiene un lado dueño (`mappedBy` en el inverso). `@ManyToOne` es frecuentemente el lado dueño y el más natural en SQL. `@ManyToMany` crea tabla intermedia; en dominios complejos suele preferirse entidad intermedia explícita. Las cascadas (`CascadeType`) propagan operaciones; usarlas sin criterio puede borrar/modificar datos inesperadamente. La estrategia de herencia afecta consultas, joins y normalización: no hay opción universal.

**Modelo mental.** Las relaciones son llaves y tablas intermedias; JPA te deja verlas como objetos, pero el costo real lo paga la base.

**Implementación desde cero**

> **Nota:** requiere dependencias JPA/Hibernate (`jakarta.persistence-api` + proveedor como Hibernate) y base de datos configurada; no compila standalone sin ellas.

```java
import jakarta.persistence.*;
import java.util.*;

@Entity
class Remitente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String nombre;
}

@Entity
class Guia {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    Remitente remitente;

    @OneToMany(mappedBy = "guia", cascade = CascadeType.ALL, orphanRemoval = true)
    List<EventoGuia> eventos = new ArrayList<>();
}

@Entity
class EventoGuia {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    Guia guia;

    String tipo;
}
```

**Desglose del código**

- `Guia -> Remitente` es `ManyToOne`: muchas guías para un remitente.
- `Guia -> EventoGuia` es `OneToMany` bidireccional; `mappedBy` indica lado inverso.
- `orphanRemoval=true` elimina hijos huérfanos de la colección.
- `LAZY` evita cargar relaciones innecesariamente por defecto.

**Ejecución y salida real**

> **Nota:** requiere proveedor JPA. Verifica generando DDL en H2 o con migraciones.

Salida esperada: tablas `guia`, `remitente`, `evento_guia` con FKs adecuadas.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| FK null o relación no persiste | No seteaste el lado dueño | Establece el lado dueño antes de persistir |
| Borrados inesperados | Cascade/orphanRemoval mal usado | Usa cascadas solo donde el ciclo de vida lo justifique |
| `ManyToMany` inmanejable | Relación con atributos propios | Modela entidad intermedia |

**Verificación rápida**

Persiste una guía con eventos y confirma que la FK `guia_id` en eventos se asigna.

### Tema 3: Ciclo de vida, EntityManager y consultas tipadas · Intermedio · 40 min

**Caso guía**

Cargas una entidad, modificas un campo y, sin llamar explícitamente `update`, la base se actualiza al hacer commit. Parece magia; en realidad es el contexto de persistencia.

**Fundamento técnico y modelo mental**

**Definición formal.** El *contexto de persistencia* es el conjunto de entidades gestionadas por un `EntityManager`. Los estados típicos son: *new/transient*, *managed*, *detached*, *removed*. *Dirty checking* es el mecanismo por el cual el proveedor detecta cambios en entidades managed y genera SQL al flush/commit.

**Contrato / invariantes / reglas.** Una entidad managed se sincroniza en flush/commit. `persist` hace managed una entidad nueva; `merge` copia estado a una instancia managed; `remove` marca para borrado; `detach/clear/close` sacan del contexto. Fuera de transacción, la semántica depende del entorno (contenedor vs aplicación). JPQL opera sobre entidades/atributos, no sobre tablas; SQL nativo opera sobre el esquema físico.

**Modelo mental.** El EntityManager es una libreta de seguimiento: todo lo que está “en la libreta” se compara al final y se escribe si cambió.

**Implementación desde cero**

> **Nota:** requiere dependencias JPA/Hibernate (`jakarta.persistence-api` + proveedor como Hibernate) y base de datos configurada; no compila standalone sin ellas.

```java
import jakarta.persistence.*;

public class GuiaRepo {
    private final EntityManager em;
    public GuiaRepo(EntityManager em) { this.em = em; }

    public GuiaEntity crear(String numero) {
        GuiaEntity g = new GuiaEntity(numero, "CREADA");
        em.persist(g); // managed
        return g;
    }

    public void cambiarEstado(Long id, String estado) {
        GuiaEntity g = em.find(GuiaEntity.class, id); // managed
        g.setEstado(estado); // dirty checking al commit
    }

    public java.util.List<GuiaEntity> porEstado(String estado) {
        return em.createQuery(
            "select g from GuiaEntity g where g.estado = :estado", GuiaEntity.class)
            .setParameter("estado", estado)
            .getResultList();
    }
}
```

**Desglose del código**

- `persist` registra la entidad nueva en el contexto.
- `find` devuelve una entidad managed; modificarla dispara dirty checking.
- JPQL usa el nombre de entidad/campos Java, no el de tabla/columna física directamente.
- `TypedQuery` evita casts inseguros.

**Ejecución y salida real**

> **Nota:** requiere transacción JPA activa. En Spring, normalmente `@Transactional`.

Salida esperada: tras commit, el `UPDATE` se ejecuta sin llamar método explícito de update.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Cambios no se guardan | Entidad detached o sin transacción | Verifica contexto y `@Transactional`/commit |
| `LazyInitializationException` | Accediste relación lazy fuera de sesión | Carga con fetch join/EntityGraph o dentro de tx |
| JPQL falla por nombre de tabla | Usaste tabla en vez de entidad | Usa nombre de entidad y campos Java |

**Verificación rápida**

Dentro de una transacción, modifica una entidad managed y confirma el `UPDATE` en logs SQL.

### Tema 4: Búsquedas dinámicas con Criteria y Querydsl · Intermedio · 40 min

**Caso guía**

La pantalla de búsqueda permite filtrar por estado, ciudad y fecha opcionalmente. Concatenar strings JPQL es frágil e inseguro.

**Fundamento técnico y modelo mental**

**Definición formal.** La *Criteria API* es una API tipada de JPA para construir consultas programáticamente. *Querydsl* es una librería externa que genera tipos Q para consultas type-safe y fluidas. Ambas evitan concatenación de strings para consultas dinámicas.

**Contrato / invariantes / reglas.** Los parámetros deben bindearse, no concatenarse, para evitar inyección y errores de escape. Las consultas dinámicas deben construir predicados solo para filtros presentes. La tipificación reduce errores en compilación, pero no elimina el costo SQL: medir plan/tiempo sigue siendo necesario. Querydsl requiere generación de código en build.

**Modelo mental.** En vez de armar SQL con cinta adhesiva (strings), armas una consulta con piezas tipadas que encajan.

**Implementación desde cero**

> **Nota:** requiere dependencias JPA/Hibernate (`jakarta.persistence-api` + proveedor como Hibernate) y base de datos configurada; no compila standalone sin ellas.

Ejemplo Criteria API:

```java
import jakarta.persistence.*;
import jakarta.persistence.criteria.*;
import java.util.*;

public class GuiaBusqueda {
    private final EntityManager em;
    public GuiaBusqueda(EntityManager em) { this.em = em; }

    public List<GuiaEntity> buscar(String estado, String numero) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<GuiaEntity> cq = cb.createQuery(GuiaEntity.class);
        Root<GuiaEntity> root = cq.from(GuiaEntity.class);

        List<Predicate> preds = new ArrayList<>();
        if (estado != null && !estado.isBlank()) preds.add(cb.equal(root.get("estado"), estado));
        if (numero != null && !numero.isBlank()) preds.add(cb.equal(root.get("numero"), numero));

        cq.select(root).where(preds.toArray(Predicate[]::new));
        return em.createQuery(cq).getResultList();
    }
}
```

**Desglose del código**

- `CriteriaBuilder` crea predicados y expresiones.
- La lista de predicados solo incluye filtros presentes.
- `setParameter`/binding implícito en Criteria evita concatenación insegura.
- Para proyectos grandes, Querydsl o Specifications (Spring Data) pueden mejorar legibilidad.

**Ejecución y salida real**

> **Nota:** requiere JPA provider. Resultado esperado: consulta con `WHERE` dinámico según filtros no nulos.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Inyección/errores por concatenar JPQL | Construcción por string | Usa Criteria/Querydsl/params |
| Consulta lenta | Filtros sin índice o join innecesario | Revisa SQL generado y plan de ejecución |
| Metamodelo/Tipos Q faltan | Build sin generación | Configura annotation processor de Querydsl/JPA metamodel |

**Verificación rápida**

Prueba la búsqueda con `estado=null` y con `estado="CREADA"`; el SQL generado debe cambiar.

### Tema 5: FetchType.LAZY, EAGER y el problema N+1 · Avanzado · 40 min

**Caso guía**

Listas 100 guías y, por cada una, accedes a su remitente. El log muestra 1 consulta inicial + 100 consultas adicionales. Eso es N+1.

**Fundamento técnico y modelo mental**

**Definición formal.** *N+1* es un patrón de acceso ineficiente donde se ejecuta una consulta para obtener N registros y luego una consulta adicional por cada registro para cargar una asociación. `LAZY` difiere la carga; `EAGER` la carga anticipada. Ninguno elimina N+1 por sí solo si el acceso se hace por elemento.

**Contrato / invariantes / reglas.** `LAZY` es preferible por defecto en asociaciones `@OneToMany`/`@ManyToMany` y a menudo en `@ManyToOne`. `EAGER` puede causar sobrecarga y joins/cartesianas inesperadas. Las soluciones típicas son `JOIN FETCH`, EntityGraph, DTO projection o batch fetching, según caso. La decisión debe basarse en el caso de uso y en el SQL observado.

**Modelo mental.** N+1 es ir al almacén 101 veces cuando podías traer la caja grande una vez.

**Implementación desde cero**

> **Nota:** requiere dependencias JPA/Hibernate (`jakarta.persistence-api` + proveedor como Hibernate) y base de datos configurada; no compila standalone sin ellas.

```java
import jakarta.persistence.*;
import java.util.List;

public class GuiaQueries {
    private final EntityManager em;
    public GuiaQueries(EntityManager em) { this.em = em; }

    public List<Guia> todasConRemitente() {
        return em.createQuery(
            "select g from Guia g join fetch g.remitente", Guia.class)
            .getResultList();
    }
}
```

**Desglose del código**

- `join fetch` carga la asociación en la misma consulta.
- Úsalo cuando el caso de uso realmente necesita la asociación.
- Para colecciones múltiples, cuidado con productos cartesianos; considera EntityGraph o consultas separadas.
- Activa logs SQL para verificar el comportamiento real.

**Ejecución y salida real**

> **Nota:** requiere JPA/Hibernate con logging SQL. Esperado: una consulta con join en lugar de 1+N.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| 1+N consultas | Carga lazy por iteración | Usa `join fetch`, EntityGraph o batch size |
| `MultipleBagFetchException` | Fetch join de varias bags | Usa `Set`, consultas separadas o DTOs |
| Sobrecarga por EAGER global | Mapeo mal elegido | Pon LAZY y carga por caso de uso |

**Verificación rápida**

Activa `hibernate.show_sql` y compara cantidad de consultas antes/después de `join fetch`.

### Tema 6: EntityGraph y cachés de persistencia · Avanzado · 40 min

**Caso guía**

Algunas pantallas necesitan `Guia` con `remitente` y otras no. No quieres duplicar queries por todas partes ni activar EAGER global. Además, lees catálogos repetidamente.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *EntityGraph* declara un grafo de atributos a cargar para una consulta específica. La caché de primer nivel (L1) es el contexto de persistencia; la caché de segundo nivel (L2) es opcional y compartida por EntityManagerFactory/SessionFactory, según configuración.

**Contrato / invariantes / reglas.** L1 es obligatoria y no se desactiva: vive dentro del contexto. L2 cachea entidades/datos entre contextos; requiere proveedor/configuración y estrategia de invalidación. Cachear sin estrategia de invalidación produce datos stale. EntityGraph controla carga por caso de uso, evitando EAGER global. No toda entidad debe ir a L2; prioriza lectura frecuente, baja volatilidad.

**Modelo mental.** EntityGraph es la lista de “qué traer en este viaje”; L2 es una despensa compartida que ahorra viajes, pero puede tener comida vencida si no la actualizas.

**Implementación desde cero**

> **Nota:** requiere dependencias JPA/Hibernate (`jakarta.persistence-api` + proveedor como Hibernate) y base de datos configurada; no compila standalone sin ellas.

```java
import jakarta.persistence.*;
import java.util.*;

@Entity
@NamedEntityGraph(
    name = "Guia.conRemitente",
    attributeNodes = @NamedAttributeNode("remitente")
)
class GuiaConGraph {
    @Id @GeneratedValue Long id;
    @ManyToOne(fetch = FetchType.LAZY) Remitente remitente;
}
```

Uso:

```java
EntityGraph<?> graph = em.getEntityGraph("Guia.conRemitente");
Map<String, Object> hints = Map.of("jakarta.persistence.fetchgraph", graph);
GuiaConGraph guia = em.find(GuiaConGraph.class, 1L, hints);
```

**Desglose del código**

- `@NamedEntityGraph` declara qué asociación cargar.
- `fetchgraph` carga lo indicado; atributos lazy no incluidos quedan fuera (según semántica/spec y proveedor).
- L2 se configura aparte (ehcache, infinispan, etc.) y no debe asumirse activa.
- La cache debe evaluarse por patrón de lectura/escritura.

**Ejecución y salida real**

> **Nota:** requiere JPA provider. Verifica SQL generado y métricas de cache si L2 está habilitada.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Datos stale | Cache L2 sin invalidación adecuada | Configura TTL/invalidación o no cachees esa entidad |
| EntityGraph ignora expectativas | Confusión fetchgraph/loadgraph | Revisa semántica y SQL generado |
| Complejidad innecesaria | Cachear todo | Cachea solo hot data estable |

**Verificación rápida**

Compara consultas con y sin EntityGraph en logs SQL.

### Tema 7: Concurrencia, transacciones y propagación · Avanzado · 45 min

**Caso guía**

Dos usuarios actualizan la misma guía casi al mismo tiempo. Sin control, la última escritura puede pisar silenciosamente a la anterior. Además, un servicio llama a otro y no tienes claro si comparten transacción.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *transacción* es una unidad de trabajo con propiedades ACID (en el grado provisto por la base/configuración). El *aislamiento* define qué anomalías de concurrencia se permiten. El *locking optimista* usa versión para detectar conflictos; el *pesimista* bloquea filas/recursos. La *propagación* define cómo participa un método en una transacción existente (Spring: `REQUIRED`, `REQUIRES_NEW`, etc.).

**Contrato / invariantes / reglas.** `@Version` habilita locking optimista; el commit falla con excepción de concurrencia si la versión cambió. El aislamiento más alto reduce anomalías pero aumenta contención. `REQUIRED` se une a la tx existente; `REQUIRES_NEW` suspende y crea otra. Una transacción debe ser lo más corta posible. Las excepciones y rollback rules determinan si se revierte.

**Modelo mental.** Optimista: “edita y al guardar comprobamos si alguien cambió el documento”. Pesimista: “bloquea el documento antes de editar”.

**Implementación desde cero**

> **Nota:** requiere dependencias JPA/Hibernate (`jakarta.persistence-api` + proveedor como Hibernate) y base de datos configurada; no compila standalone sin ellas.

```java
import jakarta.persistence.*;

@Entity
class GuiaVersionada {
    @Id @GeneratedValue Long id;
    @Column(nullable = false) String estado;
    @Version Long version;

    protected GuiaVersionada() {}
    GuiaVersionada(String estado) { this.estado = estado; }
    void setEstado(String estado) { this.estado = estado; }
}
```

Servicio (Spring, conceptual):

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class GuiaService {
    private final jakarta.persistence.EntityManager em;
    GuiaService(jakarta.persistence.EntityManager em) { this.em = em; }

    @Transactional
    public void cambiarEstado(Long id, String estado) {
        GuiaVersionada g = em.find(GuiaVersionada.class, id);
        g.setEstado(estado); // si version cambió, falla al commit
    }
}
```

**Desglose del código**

- `@Version` agrega control optimista; Hibernate lo incluye en el `WHERE` del update.
- `@Transactional` delimita la unidad de trabajo.
- En conflicto, se espera `OptimisticLockException` (o wrapper de Spring).
- Elegir propagación/aislamiento depende del caso de negocio.

**Ejecución y salida real**

> **Nota:** requiere Spring/JPA. En conflicto concurrente, el segundo commit debe fallar con excepción de locking optimista.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Lost update | Sin versionado/bloqueo | Usa `@Version` o lock apropiado |
| Deadlocks | Transacciones largas y orden inconsistente | Acorta tx y ordena accesos |
| Rollback inesperado | Regla de excepción mal entendida | Revisa rollback rules de `@Transactional` |

**Verificación rápida**

Simula dos transacciones que leen la misma versión y actualizan; la segunda debe fallar al commit.

### Tema 8: Migraciones y pruebas JPA con Testcontainers · Avanzado · 45 min

**Caso guía**

Cambias una entidad y la app funciona localmente, pero en otro entorno el esquema es distinto. Necesitas evolucionar la base con migraciones versionadas y probar contra una base real efímera.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *migración de esquema* es un cambio versionado y reproducible sobre el esquema de base de datos (Flyway/Liquibase). Las *pruebas de integración JPA* validan el mapeo, consultas y transacciones contra un motor real. Testcontainers provee contenedores efímeros para estas pruebas.

**Contrato / invariantes / reglas.** El esquema en producción debe ser resultado de migraciones, no de `hibernate.ddl-auto=create` en runtime. Las migraciones son inmutables una vez aplicadas; cambios posteriores requieren nueva migración. Las pruebas deben ejecutarse contra un motor compatible con producción cuando el comportamiento SQL importe. El orden de migraciones y el baseline deben estar controlados.

**Modelo mental.** Las migraciones son el historial git del esquema: cada cambio tiene versión y no se reescribe en producción.

**Implementación desde cero**

Migración Flyway (`V1__crear_guias.sql`):

```sql
CREATE TABLE guias (
  id BIGSERIAL PRIMARY KEY,
  numero VARCHAR(40) NOT NULL UNIQUE,
  estado VARCHAR(60) NOT NULL
);
```

Test conceptual con Testcontainers:

```java
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import static org.junit.jupiter.api.Assertions.*;

class GuiaMigrationTest {
    @Test
    void arrancaConMigraciones() {
        try (var pg = new PostgreSQLContainer<>("postgres:16-alpine")) {
            pg.start();
            assertTrue(pg.isRunning());
            // configurar datasource, ejecutar Flyway, probar repositorio JPA
        }
    }
}
```

**Desglose del código**

- La migración SQL define el esquema esperado.
- Flyway la ejecuta al iniciar, en orden de versión.
- Testcontainers levanta PostgreSQL real para la prueba.
- No uses `ddl-auto=update` como estrategia de producción.

**Ejecución y salida real**

> **Nota:** requiere Flyway/Testcontainers/Docker. Salida esperada: migración aplicada y test verde.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Esquema difiere entre entornos | Migraciones manuales/no versionadas | Usa Flyway/Liquibase y prohíbe DDL manual |
| Test pasa en H2 y falla en Postgres | Diferencias de dialecto/SQL | Prueba contra el motor real con Testcontainers |
| Migración editada tras aplicar | Rompe checksum/historial | Crea una nueva migración correctiva |

**Verificación rápida**

Ejecuta las migraciones sobre una base vacía y confirma que la app arranca y el test de repositorio pasa.

## Cierre del módulo

JPA te da productividad, pero el modelo relacional y transaccional sigue mandando. Si entiendes identidad, contexto de persistencia, N+1, cachés, transacciones y migraciones, puedes usar Hibernate con criterio en vez de por intuición. El siguiente módulo lleva estas bases a Spring Boot.
