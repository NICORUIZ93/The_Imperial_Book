# Módulo 16: JPA e Hibernate

JPA (Jakarta Persistence API) define el contrato de mapeo objeto-relacional en Java; Hibernate es la implementación más usada. Este módulo cubre entidades, relaciones, ciclo de vida, consultas, N+1, cachés, transacciones y migraciones con enfoque práctico y formal.

## Setup ejecutable del módulo (base para todos los temas)

Los fragmentos JPA no se ejecutan “sueltos”: necesitan dependencias, configuración de persistencia y una base de datos. Usa este proyecto base una sola vez y reutilízalo en todos los temas.

### 1) Crear proyecto (desde carpeta vacía)

```bash
mkdir -p ~/academia-java/jpa-lab
cd ~/academia-java/jpa-lab
```

Crea `pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.academia</groupId>
  <artifactId>jpa-lab</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <properties>
    <maven.compiler.release>21</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <hibernate.version>7.0.0.Final</hibernate.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.hibernate.orm</groupId>
      <artifactId>hibernate-core</artifactId>
      <version>${hibernate.version}</version>
    </dependency>
    <dependency>
      <groupId>com.h2database</groupId>
      <artifactId>h2</artifactId>
      <version>2.3.232</version>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>jakarta.persistence</groupId>
      <artifactId>jakarta.persistence-api</artifactId>
      <version>3.2.0</version>
    </dependency>
    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-simple</artifactId>
      <version>2.0.16</version>
      <scope>runtime</scope>
    </dependency>
  </dependencies>
</project>
```

> **Nota de versiones:** se usó Hibernate ORM 7.x / JPA 3.2 como referencia estable al momento de escribir. Si usas otra versión, ajusta la dependencia pero mantén la compatibilidad JPA/Hibernate.

### 2) Configuración JPA (H2 local, sin Docker)

Crea `src/main/resources/META-INF/persistence.xml`:

```xml
<persistence xmlns="https://jakarta.ee/xml/ns/persistence" version="3.0">
  <persistence-unit name="academiaPU">
    <provider>org.hibernate.jpa.HibernatePersistenceProvider</provider>
    <class>com.academia.jpa.GuiaEntity</class>
    <class>com.academia.jpa.Remitente</class>
    <class>com.academia.jpa.Guia</class>
    <class>com.academia.jpa.EventoGuia</class>
    <class>com.academia.jpa.GuiaVersionada</class>
    <properties>
      <property name="jakarta.persistence.jdbc.driver" value="org.h2.Driver"/>
      <property name="jakarta.persistence.jdbc.url" value="jdbc:h2:mem:academia;DB_CLOSE_DELAY=-1"/>
      <property name="jakarta.persistence.jdbc.user" value="sa"/>
      <property name="jakarta.persistence.jdbc.password" value=""/>
      <property name="hibernate.hbm2ddl.auto" value="create-drop"/>
      <property name="hibernate.dialect" value="org.hibernate.dialect.H2Dialect"/>
      <property name="hibernate.show_sql" value="true"/>
      <property name="hibernate.format_sql" value="true"/>
    </properties>
  </persistence-unit>
</persistence>
```

### 3) Opción Docker/PostgreSQL (cuando quieras entorno real)

Levanta PostgreSQL:

```bash
docker run --name academia-pg -e POSTGRES_PASSWORD=academia -e POSTGRES_USER=academia -e POSTGRES_DB=academia -p 5432:5432 -d postgres:16-alpine
```

Cambia en `persistence.xml`:

```xml
<property name="jakarta.persistence.jdbc.driver" value="org.postgresql.Driver"/>
<property name="jakarta.persistence.jdbc.url" value="jdbc:postgresql://localhost:5432/academia"/>
<property name="jakarta.persistence.jdbc.user" value="academia"/>
<property name="jakarta.persistence.jdbc.password" value="academia"/>
<property name="hibernate.dialect" value="org.hibernate.dialect.PostgreSQLDialect"/>
```

Y agrega dependencia:

```xml
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <version>42.7.4</version>
  <scope>runtime</scope>
</dependency>
```

### 4) Clase utilitaria para ejecutar ejemplos

Crea `src/main/java/com/academia/jpa/Jpa.java`:

```java
package com.academia.jpa;

import jakarta.persistence.*;

public final class Jpa {
    private static final EntityManagerFactory EMF =
        Persistence.createEntityManagerFactory("academiaPU");

    private Jpa() {}

    public static <T> T tx(java.util.function.Function<EntityManager, T> work) {
        EntityManager em = EMF.createEntityManager();
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

    public static void close() { EMF.close(); }
}
```

### 5) Comando de ejecución

```bash
mvn -q -DskipTests compile exec:java -Dexec.mainClass=com.academia.jpa.Demo
```

Si no tienes `exec-maven-plugin` configurado, usa:

```bash
mvn -q -DskipTests package
java -cp "target/classes:$(mvn -q dependency:build-classpath -Dmdep.outputFile=/dev/stdout)" com.academia.jpa.Demo
```

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

Archivo: `src/main/java/com/academia/jpa/GuiaEntity.java`

```java
package com.academia.jpa;

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

Demo: `src/main/java/com/academia/jpa/Demo.java`

```java
package com.academia.jpa;

public class Demo {
    public static void main(String[] args) {
        Long id = Jpa.tx(em -> {
            GuiaEntity g = new GuiaEntity("G-1", "CREADA");
            em.persist(g);
            em.flush(); // fuerza INSERT para obtener id
            return g.getId();
        });
        System.out.println(id != null);
        Jpa.close();
    }
}
```

**Desglose del código**

- `@Entity` marca la clase persistible; `@Table` define el nombre de tabla.
- `@Id` + `@GeneratedValue` definen identidad gestionada por la base.
- `@Column` declara restricciones de esquema.
- Constructor protegido sin args requerido por JPA/Hibernate.
- `Jpa.tx` abre transacción, hace commit/rollback y cierra el `EntityManager`.

**Ejecución y salida real**

Desde `~/academia-java/jpa-lab`:

```bash
mvn -q -DskipTests compile
mvn -q dependency:build-classpath -Dmdep.outputFile=cp.txt
java -cp "target/classes:$(cat cp.txt)" com.academia.jpa.Demo
```

Salida esperada:

```text
true
```

En logs SQL verás un `insert into guias ...` (por `hibernate.show_sql=true`).

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `No default constructor` | Falta constructor sin args | Agrega constructor protegido/vacío |
| `No Persistence provider` | Falta Hibernate/persistence.xml mal ubicado | Verifica `META-INF/persistence.xml` en classpath |
| Tabla no aparece | `hbm2ddl.auto` o dialecto mal | Revisa propiedades y logs SQL |

**Verificación rápida**

Cambia `hibernate.show_sql` a `true` y confirma el `INSERT`. Luego ejecuta de nuevo con H2; el id debe ser no nulo.

### Tema 2: Relaciones uno a uno, muchos a muchos y herencia · Intermedio · 40 min

**Caso guía**

Una guía tiene remitente, pasa por varios eventos y puede clasificarse por tipo. Necesitas modelar relaciones sin crear un esquema imposible de consultar.

**Fundamento técnico y modelo mental**

**Definición formal.** Las relaciones JPA mapean asociaciones entre entidades: `@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`. La herencia ORM mapea jerarquías de clases a tablas (`SINGLE_TABLE`, `JOINED`, `TABLE_PER_CLASS`).

**Contrato / invariantes / reglas.** Toda relación bidireccional tiene un lado dueño (`mappedBy` en el inverso). `@ManyToOne` es frecuentemente el lado dueño y el más natural en SQL. `@ManyToMany` crea tabla intermedia; en dominios complejos suele preferirse entidad intermedia explícita. Las cascadas (`CascadeType`) propagan operaciones; usarlas sin criterio puede borrar/modificar datos inesperadamente. La estrategia de herencia afecta consultas, joins y normalización: no hay opción universal.

**Modelo mental.** Las relaciones son llaves y tablas intermedias; JPA te deja verlas como objetos, pero el costo real lo paga la base.

**Implementación desde cero**

Archivos en `src/main/java/com/academia/jpa/`:

```java
package com.academia.jpa;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "remitentes")
class Remitente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @Column(nullable = false)
    String nombre;
    protected Remitente() {}
    Remitente(String nombre) { this.nombre = nombre; }
}

@Entity
@Table(name = "guias_rel")
class Guia {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    Remitente remitente;

    @OneToMany(mappedBy = "guia", cascade = CascadeType.ALL, orphanRemoval = true)
    List<EventoGuia> eventos = new ArrayList<>();

    protected Guia() {}
    Guia(Remitente remitente) { this.remitente = remitente; }
    void addEvento(String tipo) {
        EventoGuia e = new EventoGuia();
        e.guia = this;
        e.tipo = tipo;
        eventos.add(e);
    }
}

@Entity
@Table(name = "eventos_guia")
class EventoGuia {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    Guia guia;

    @Column(nullable = false)
    String tipo;
}
```

Demo:

```java
package com.academia.jpa;

public class DemoRelaciones {
    public static void main(String[] args) {
        Integer eventos = Jpa.tx(em -> {
            Remitente r = new Remitente("Ada");
            em.persist(r);
            Guia g = new Guia(r);
            g.addEvento("CREADA");
            g.addEvento("EN_RUTA");
            em.persist(g);
            em.flush();
            return g.eventos.size();
        });
        System.out.println(eventos);
        Jpa.close();
    }
}
```

**Desglose del código**

- `Guia -> Remitente` es `ManyToOne`: muchas guías para un remitente.
- `Guia -> EventoGuia` es `OneToMany` bidireccional; `mappedBy` indica lado inverso.
- `addEvento` setea ambos lados de la relación en memoria.
- `orphanRemoval=true` elimina hijos huérfanos de la colección.

**Ejecución y salida real**

```bash
mvn -q -DskipTests compile
mvn -q dependency:build-classpath -Dmdep.outputFile=cp.txt
java -cp "target/classes:$(cat cp.txt)" com.academia.jpa.DemoRelaciones
```

Salida esperada:

```text
2
```

Logs SQL mostrarán inserts en `remitentes`, `guias_rel` y `eventos_guia`.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| FK null o relación no persiste | No seteaste el lado dueño | Establece `evento.guia = this` antes de persistir |
| Borrados inesperados | Cascade/orphanRemoval mal usado | Usa cascadas solo donde el ciclo de vida lo justifique |
| `LazyInitializationException` fuera de tx | Accediste relación lazy tras cerrar EM | Carga dentro de tx o usa DTO/fetch join |

**Verificación rápida**

Consulta con H2 console o SQL: `SELECT COUNT(*) FROM eventos_guia;` debe devolver `2`.

### Tema 3: Ciclo de vida, EntityManager y consultas tipadas · Intermedio · 40 min

**Caso guía**

Cargas una entidad, modificas un campo y, sin llamar explícitamente `update`, la base se actualiza al hacer commit. Parece magia; en realidad es el contexto de persistencia.

**Fundamento técnico y modelo mental**

**Definición formal.** El *contexto de persistencia* es el conjunto de entidades gestionadas por un `EntityManager`. Los estados típicos son: *new/transient*, *managed*, *detached*, *removed*. *Dirty checking* es el mecanismo por el cual el proveedor detecta cambios en entidades managed y genera SQL al flush/commit.

**Contrato / invariantes / reglas.** Una entidad managed se sincroniza en flush/commit. `persist` hace managed una entidad nueva; `merge` copia estado a una instancia managed; `remove` marca para borrado; `detach/clear/close` sacan del contexto. Fuera de transacción, la semántica depende del entorno (contenedor vs aplicación). JPQL opera sobre entidades/atributos, no sobre tablas; SQL nativo opera sobre el esquema físico.

**Modelo mental.** El EntityManager es una libreta de seguimiento: todo lo que está “en la libreta” se compara al final y se escribe si cambió.

**Implementación desde cero**

Archivo: `src/main/java/com/academia/jpa/DemoCicloVida.java`

```java
package com.academia.jpa;

import jakarta.persistence.*;
import java.util.List;

public class DemoCicloVida {
    public static void main(String[] args) {
        Long id = Jpa.tx(em -> {
            GuiaEntity g = new GuiaEntity("G-100", "CREADA");
            em.persist(g);
            return g.getId();
        });

        Jpa.tx(em -> {
            GuiaEntity g = em.find(GuiaEntity.class, id); // managed
            g.setEstado("EN_RUTA"); // dirty checking al commit
            return null;
        });

        String estado = Jpa.tx(em -> {
            List<GuiaEntity> res = em.createQuery(
                "select g from GuiaEntity g where g.estado = :estado", GuiaEntity.class)
                .setParameter("estado", "EN_RUTA")
                .getResultList();
            return res.isEmpty() ? "NONE" : res.get(0).getEstado();
        });

        System.out.println(estado);
        Jpa.close();
    }
}
```

**Desglose del código**

- Primer tx: `persist` => entidad managed, INSERT al commit/flush.
- Segundo tx: `find` devuelve managed; cambiar setter no requiere `update()`.
- Tercer tx: JPQL usa nombre de entidad `GuiaEntity`, no tabla.
- Cada `Jpa.tx` delimita transacción y contexto.

**Ejecución y salida real**

```bash
mvn -q -DskipTests compile
mvn -q dependency:build-classpath -Dmdep.outputFile=cp.txt
java -cp "target/classes:$(cat cp.txt)" com.academia.jpa.DemoCicloVida
```

Salida esperada:

```text
EN_RUTA
```

En logs SQL verás `insert`, `update`, `select`.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Cambios no se guardan | Entidad detached o sin transacción | Asegura tx activa y entidad managed |
| `LazyInitializationException` | Accediste relación lazy fuera de sesión | Carga dentro de tx o con fetch join/EntityGraph |
| JPQL falla por nombre de tabla | Usaste tabla en vez de entidad | Usa nombre de entidad y campos Java |

**Verificación rápida**

Activa `hibernate.show_sql=true` y confirma que el cambio de estado genera `update guias set estado=? where id=?`.

### Tema 4: Búsquedas dinámicas con Criteria y Querydsl · Intermedio · 40 min

**Caso guía**

La pantalla de búsqueda permite filtrar por estado, ciudad y fecha opcionalmente. Concatenar strings JPQL es frágil e inseguro.

**Fundamento técnico y modelo mental**

**Definición formal.** La *Criteria API* es una API tipada de JPA para construir consultas programáticamente. *Querydsl* es una librería externa que genera tipos Q para consultas type-safe y fluidas. Ambas evitan concatenación de strings para consultas dinámicas.

**Contrato / invariantes / reglas.** Los parámetros deben bindearse, no concatenarse, para evitar inyección y errores de escape. Las consultas dinámicas deben construir predicados solo para filtros presentes. La tipificación reduce errores en compilación, pero no elimina el costo SQL: medir plan/tiempo sigue siendo necesario. Querydsl requiere generación de código en build.

**Modelo mental.** En vez de armar SQL con cinta adhesiva (strings), armas una consulta con piezas tipadas que encajan.

**Implementación desde cero**

Archivo: `src/main/java/com/academia/jpa/DemoCriteria.java`

```java
package com.academia.jpa;

import jakarta.persistence.*;
import jakarta.persistence.criteria.*;
import java.util.*;

public class DemoCriteria {
    static List<GuiaEntity> buscar(EntityManager em, String estado, String numero) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<GuiaEntity> cq = cb.createQuery(GuiaEntity.class);
        Root<GuiaEntity> root = cq.from(GuiaEntity.class);

        List<Predicate> preds = new ArrayList<>();
        if (estado != null && !estado.isBlank()) preds.add(cb.equal(root.get("estado"), estado));
        if (numero != null && !numero.isBlank()) preds.add(cb.equal(root.get("numero"), numero));

        cq.select(root).where(preds.toArray(Predicate[]::new));
        return em.createQuery(cq).getResultList();
    }

    public static void main(String[] args) {
        Jpa.tx(em -> { em.persist(new GuiaEntity("G-1","CREADA")); em.persist(new GuiaEntity("G-2","ENVIADA")); return null; });
        int c1 = Jpa.tx(em -> buscar(em, "CREADA", null).size());
        int c2 = Jpa.tx(em -> buscar(em, null, "G-2").size());
        System.out.println(c1 + "," + c2);
        Jpa.close();
    }
}
```

**Desglose del código**

- `CriteriaBuilder` crea predicados y expresiones.
- La lista de predicados solo incluye filtros presentes.
- Criteria enlaza parámetros internamente, evitando concatenación insegura.
- El mismo método soporta combinaciones dinámicas de filtros.

**Ejecución y salida real**

```bash
mvn -q -DskipTests compile
mvn -q dependency:build-classpath -Dmdep.outputFile=cp.txt
java -cp "target/classes:$(cat cp.txt)" com.academia.jpa.DemoCriteria
```

Salida esperada:

```text
1,1
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Inyección/errores por concatenar JPQL | Construcción por string | Usa Criteria/Querydsl/params |
| Consulta lenta | Filtros sin índice o join innecesario | Revisa SQL generado y plan de ejecución |
| Metamodelo/Tipos Q faltan | Build sin generación | Configura annotation processor de Querydsl/JPA metamodel |

**Verificación rápida**

Activa `hibernate.show_sql=true` y compara el `WHERE` generado cuando pasas solo `estado` vs solo `numero`.

### Tema 5: FetchType.LAZY, EAGER y el problema N+1 · Avanzado · 40 min

**Caso guía**

Listas 100 guías y, por cada una, accedes a su remitente. El log muestra 1 consulta inicial + 100 consultas adicionales. Eso es N+1.

**Fundamento técnico y modelo mental**

**Definición formal.** *N+1* es un patrón de acceso ineficiente donde se ejecuta una consulta para obtener N registros y luego una consulta adicional por cada registro para cargar una asociación. `LAZY` difiere la carga; `EAGER` la carga anticipada. Ninguno elimina N+1 por sí solo si el acceso se hace por elemento.

**Contrato / invariantes / reglas.** `LAZY` es preferible por defecto en asociaciones `@OneToMany`/`@ManyToMany` y a menudo en `@ManyToOne`. `EAGER` puede causar sobrecarga y joins/cartesianas inesperadas. Las soluciones típicas son `JOIN FETCH`, EntityGraph, DTO projection o batch fetching, según caso. La decisión debe basarse en el caso de uso y en el SQL observado.

**Modelo mental.** N+1 es ir al almacén 101 veces cuando podías traer la caja grande una vez.

**Implementación desde cero**

Archivo: `src/main/java/com/academia/jpa/DemoN1.java`

```java
package com.academia.jpa;

import jakarta.persistence.*;
import java.util.List;

public class DemoN1 {
    public static void main(String[] args) {
        Jpa.tx(em -> {
            for (int i = 1; i <= 3; i++) {
                Remitente r = new Remitente("R" + i);
                em.persist(r);
                em.persist(new Guia(r));
            }
            return null;
        });

        int total = Jpa.tx(em -> {
            List<Guia> guias = em.createQuery(
                "select g from Guia g join fetch g.remitente", Guia.class).getResultList();
            int s = 0;
            for (Guia g : guias) s += g.remitente.nombre.length(); // ya cargado
            return s;
        });
        System.out.println(total);
        Jpa.close();
    }
}
```

**Desglose del código**

- `join fetch` carga la asociación en la misma consulta.
- El acceso a `remitente.nombre` no dispara consultas adicionales si ya fue fetched.
- Usa `hibernate.show_sql=true` para evidenciar 1 consulta con join.
- Para colecciones múltiples, evalúa cartesianas y alternativas (EntityGraph/DTO).

**Ejecución y salida real**

```bash
mvn -q -DskipTests compile
mvn -q dependency:build-classpath -Dmdep.outputFile=cp.txt
java -cp "target/classes:$(cat cp.txt)" com.academia.jpa.DemoN1
```

Salida esperada:

```text
6
```

(SQL log debe mostrar un `select ... join remitentes ...`, no 1+N).

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| 1+N consultas | Carga lazy por iteración | Usa `join fetch`, EntityGraph o batch size |
| `MultipleBagFetchException` | Fetch join de varias bags | Usa `Set`, consultas separadas o DTOs |
| Sobrecarga por EAGER global | Mapeo mal elegido | Pon LAZY y carga por caso de uso |

**Verificación rápida**

Compara logs con y sin `join fetch`: sin fetch verás selects extra por remitente.

### Tema 6: EntityGraph y cachés de persistencia · Avanzado · 40 min

**Caso guía**

Algunas pantallas necesitan `Guia` con `remitente` y otras no. No quieres duplicar queries por todas partes ni activar EAGER global. Además, lees catálogos repetidamente.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *EntityGraph* declara un grafo de atributos a cargar para una consulta específica. La caché de primer nivel (L1) es el contexto de persistencia; la caché de segundo nivel (L2) es opcional y compartida por EntityManagerFactory/SessionFactory, según configuración.

**Contrato / invariantes / reglas.** L1 es obligatoria y no se desactiva: vive dentro del contexto. L2 cachea entidades/datos entre contextos; requiere proveedor/configuración y estrategia de invalidación. Cachear sin estrategia de invalidación produce datos stale. EntityGraph controla carga por caso de uso, evitando EAGER global. No toda entidad debe ir a L2; prioriza lectura frecuente, baja volatilidad.

**Modelo mental.** EntityGraph es la lista de “qué traer en este viaje”; L2 es una despensa compartida que ahorra viajes, pero puede tener comida vencida si no la actualizas.

**Implementación desde cero**

Agrega en `Guia` (o una entidad equivalente):

```java
@NamedEntityGraph(name = "Guia.conRemitente", attributeNodes = @NamedAttributeNode("remitente"))
```

Demo: `src/main/java/com/academia/jpa/DemoEntityGraph.java`

```java
package com.academia.jpa;

import jakarta.persistence.*;
import java.util.Map;

public class DemoEntityGraph {
    public static void main(String[] args) {
        Long id = Jpa.tx(em -> {
            Remitente r = new Remitente("Ada");
            em.persist(r);
            Guia g = new Guia(r);
            em.persist(g);
            em.flush();
            return g.id;
        });

        String nombre = Jpa.tx(em -> {
            EntityGraph<?> graph = em.getEntityGraph("Guia.conRemitente");
            Map<String, Object> hints = Map.of("jakarta.persistence.fetchgraph", graph);
            Guia g = em.find(Guia.class, id, hints);
            return g.remitente.nombre;
        });
        System.out.println(nombre);
        Jpa.close();
    }
}
```

**Desglose del código**

- `@NamedEntityGraph` declara qué asociación cargar.
- `fetchgraph` carga lo indicado para ese caso de uso.
- L1 evita relectura dentro del mismo `EntityManager`; L2 es configuración adicional (no habilitada por defecto aquí).
- Para habilitar L2 se requiere proveedor de cache y `@Cacheable`/configuración.

**Ejecución y salida real**

```bash
mvn -q -DskipTests compile
mvn -q dependency:build-classpath -Dmdep.outputFile=cp.txt
java -cp "target/classes:$(cat cp.txt)" com.academia.jpa.DemoEntityGraph
```

Salida esperada:

```text
Ada
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Datos stale | Cache L2 sin invalidación adecuada | Configura TTL/invalidación o no cachees esa entidad |
| EntityGraph ignora expectativas | Confusión fetchgraph/loadgraph | Revisa semántica y SQL generado |
| Complejidad innecesaria | Cachear todo | Cachea solo hot data estable |

**Verificación rápida**

Compara SQL con y sin hint de EntityGraph en `find`/query.

### Tema 7: Concurrencia, transacciones y propagación · Avanzado · 45 min

**Caso guía**

Dos usuarios actualizan la misma guía casi al mismo tiempo. Sin control, la última escritura puede pisar silenciosamente a la anterior. Además, un servicio llama a otro y no tienes claro si comparten transacción.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *transacción* es una unidad de trabajo con propiedades ACID (en el grado provisto por la base/configuración). El *aislamiento* define qué anomalías de concurrencia se permiten. El *locking optimista* usa versión para detectar conflictos; el *pesimista* bloquea filas/recursos. La *propagación* define cómo participa un método en una transacción existente (Spring: `REQUIRED`, `REQUIRES_NEW`, etc.).

**Contrato / invariantes / reglas.** `@Version` habilita locking optimista; el commit falla con excepción de concurrencia si la versión cambió. El aislamiento más alto reduce anomalías pero aumenta contención. `REQUIRED` se une a la tx existente; `REQUIRES_NEW` suspende y crea otra. Una transacción debe ser lo más corta posible. Las excepciones y rollback rules determinan si se revierte.

**Modelo mental.** Optimista: “edita y al guardar comprobamos si alguien cambió el documento”. Pesimista: “bloquea el documento antes de editar”.

**Implementación desde cero**

Archivo: `src/main/java/com/academia/jpa/GuiaVersionada.java`

```java
package com.academia.jpa;

import jakarta.persistence.*;

@Entity
@Table(name = "guias_versionadas")
public class GuiaVersionada {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @Column(nullable = false)
    String estado;
    @Version
    Long version;

    protected GuiaVersionada() {}
    public GuiaVersionada(String estado) { this.estado = estado; }
    public Long getId() { return id; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
```

Demo de conflicto:

```java
package com.academia.jpa;

import jakarta.persistence.*;

public class DemoLockOptimista {
    public static void main(String[] args) {
        Long id = Jpa.tx(em -> { GuiaVersionada g = new GuiaVersionada("CREADA"); em.persist(g); em.flush(); return g.getId(); });

        EntityManagerFactory emf = Persistence.createEntityManagerFactory("academiaPU");
        EntityManager em1 = emf.createEntityManager();
        EntityManager em2 = emf.createEntityManager();
        em1.getTransaction().begin();
        em2.getTransaction().begin();
        GuiaVersionada g1 = em1.find(GuiaVersionada.class, id);
        GuiaVersionada g2 = em2.find(GuiaVersionada.class, id);
        g1.setEstado("EN_RUTA");
        g2.setEstado("CANCELADA");
        em1.getTransaction().commit(); // ok
        try {
            em2.getTransaction().commit(); // debe fallar
            System.out.println("sin conflicto");
        } catch (RuntimeException e) {
            System.out.println("conflicto");
        } finally {
            if (em2.getTransaction().isActive()) em2.getTransaction().rollback();
            em1.close(); em2.close(); emf.close();
        }
    }
}
```

**Desglose del código**

- `@Version` agrega control optimista; Hibernate lo incluye en el `WHERE` del update.
- Dos transacciones leen la misma versión; la segunda en commitear falla.
- `OptimisticLockException`/`RollbackException` es la señal de conflicto.
- Propagación (`REQUIRED`, `REQUIRES_NEW`) es concepto de Spring; en JPA puro controlas transacciones manualmente o con contenedor.

**Ejecución y salida real**

```bash
mvn -q -DskipTests compile
mvn -q dependency:build-classpath -Dmdep.outputFile=cp.txt
java -cp "target/classes:$(cat cp.txt)" com.academia.jpa.DemoLockOptimista
```

Salida esperada:

```text
conflicto
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Lost update | Sin versionado/bloqueo | Usa `@Version` o lock apropiado |
| Deadlocks | Transacciones largas y orden inconsistente | Acorta tx y ordena accesos |
| Rollback inesperado | Regla de excepción mal entendida | Revisa rollback rules de `@Transactional` |

**Verificación rápida**

Ejecuta el demo dos veces: siempre debe mostrar `conflicto` para el segundo commit.

### Tema 8: Migraciones y pruebas JPA con Testcontainers · Avanzado · 45 min

**Caso guía**

Cambias una entidad y la app funciona localmente, pero en otro entorno el esquema es distinto. Necesitas evolucionar la base con migraciones versionadas y probar contra una base real efímera.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *migración de esquema* es un cambio versionado y reproducible sobre el esquema de base de datos (Flyway/Liquibase). Las *pruebas de integración JPA* validan el mapeo, consultas y transacciones contra un motor real. Testcontainers provee contenedores efímeros para estas pruebas.

**Contrato / invariantes / reglas.** El esquema en producción debe ser resultado de migraciones, no de `hibernate.ddl-auto=create` en runtime. Las migraciones son inmutables una vez aplicadas; cambios posteriores requieren nueva migración. Las pruebas deben ejecutarse contra un motor compatible con producción cuando el comportamiento SQL importe. El orden de migraciones y el baseline deben estar controlados.

**Modelo mental.** Las migraciones son el historial git del esquema: cada cambio tiene versión y no se reescribe en producción.

**Implementación desde cero**

Estructura adicional:

```text
src/main/resources/db/migration/V1__crear_guias.sql
src/test/java/com/academia/jpa/GuiaMigrationIT.java
```

`V1__crear_guias.sql`:

```sql
CREATE TABLE guias (
  id BIGSERIAL PRIMARY KEY,
  numero VARCHAR(40) NOT NULL UNIQUE,
  estado VARCHAR(60) NOT NULL
);
```

Dependencias Maven (test):

```xml
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-core</artifactId>
  <version>10.20.1</version>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>postgresql</artifactId>
  <version>1.20.3</version>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.junit.jupiter</groupId>
  <artifactId>junit-jupiter</artifactId>
  <version>5.11.3</version>
  <scope>test</scope>
</dependency>
```

Test (requiere Docker en ejecución):

```java
package com.academia.jpa;

import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import static org.junit.jupiter.api.Assertions.*;

class GuiaMigrationIT {
    @Test
    void arrancaConPostgres() {
        try (PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine")) {
            pg.start();
            assertTrue(pg.isRunning());
            assertTrue(pg.getJdbcUrl().startsWith("jdbc:postgresql:"));
        }
    }
}
```

**Desglose del código**

- La migración SQL define el esquema esperado.
- Flyway la ejecuta al iniciar, en orden de versión.
- Testcontainers levanta PostgreSQL real efímero; requiere Docker.
- Para producción, cambia `hibernate.hbm2ddl.auto` a `validate` o `none`.

**Ejecución y salida real**

```bash
# requiere Docker activo
mvn -q -Dtest=GuiaMigrationIT test
```

Salida esperada:

```text
BUILD SUCCESS
```

Si Docker no está activo, el test fallará con error de conexión a Docker; eso es una señal de prerrequisito, no un falso verde.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Esquema difiere entre entornos | Migraciones manuales/no versionadas | Usa Flyway/Liquibase y prohíbe DDL manual |
| Test pasa en H2 y falla en Postgres | Diferencias de dialecto/SQL | Prueba contra el motor real con Testcontainers |
| Migración editada tras aplicar | Rompe checksum/historial | Crea una nueva migración correctiva |

**Verificación rápida**

Con Docker activo, ejecuta el test de integración. Luego revisa que el contenedor se detiene al terminar la prueba.

## Cierre del módulo

JPA te da productividad, pero el modelo relacional y transaccional sigue mandando. Si entiendes setup, identidad, contexto de persistencia, N+1, cachés, transacciones y migraciones, puedes usar Hibernate con criterio y depurar lo que ocurre debajo. El siguiente módulo lleva estas bases a Spring Boot.
