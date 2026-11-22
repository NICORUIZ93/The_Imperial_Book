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

**Caso guía**: persistir guías en BD relacional sin CRUD SQL manual.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Entidad JPA | Clase mapeada a tabla (`@Entity`, `@Id`). | Representar fila como objeto. | Constructor no-args accesible; `@Id`. | Olvidar constructor vacío. |
| Relaciones JPA (básicas) | Asociaciones entre entidades (`@ManyToOne`, etc.). | Modelar FK como objetos. | Lado dueño controla FK. | No setear lado dueño. |
| `EntityManager`/persistencia | API que gestiona contexto de persistencia. | persist/find/query/flush. | Usar dentro de transacción. | Operar sin tx. |
| Mapeo/contrato de esquema | `@Table`, `@Column`, tipos, nulabilidad. | Alinear objeto-relacional. | Restricciones explícitas. | Asumir que JPA “adivina” todo. |

**Setup base**: usa `~/academia-java/jpa-lab` del setup del módulo (pom, persistence.xml, Jpa helper).

`GuiaEntity.java`:
```java
package com.academia.jpa;
import jakarta.persistence.*;
@Entity @Table(name="guias")
public class GuiaEntity {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(nullable=false, unique=true, length=40) private String numero;
  @Column(nullable=false, length=60) private String estado;
  protected GuiaEntity() {}
  public GuiaEntity(String numero,String estado){ this.numero=numero; this.estado=estado; }
  public Long getId(){ return id; } public String getNumero(){ return numero; } public String getEstado(){ return estado; }
}
```
`Demo.java`:
```java
package com.academia.jpa;
public class Demo { public static void main(String[] args){ Long id=Jpa.tx(em->{ var g=new GuiaEntity("G-1","CREADA"); em.persist(g); em.flush(); return g.getId(); }); System.out.println(id!=null); Jpa.close(); } }
```
**Ejecución real** (desde jpa-lab): `mvn -q -DskipTests compile && mvn -q dependency:build-classpath -Dmdep.outputFile=cp.txt && java -cp "target/classes:$(cat cp.txt)" com.academia.jpa.Demo` → `true`. **Verificación**: SQL insert en logs.

### Tema 2: Relaciones uno a uno, muchos a muchos y herencia · Intermedio · 40 min

**Caso guía**: guía con remitente, eventos e jerarquía de tipos.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `@OneToOne` | 1 fila asociada a 1 fila. | Datos opcionales/particionados. | Definir dueño/FK. | Ciclos y cascadas mal usadas. |
| `@ManyToMany` | Relación N:M con tabla intermedia. | Tags, roles simples. | En dominio complejo usar entidad intermedia. | Dificultad para agregar atributos a relación. |
| Herencia (`SINGLE_TABLE/JOINED/TABLE_PER_CLASS`) | Mapea jerarquía OO a tablas. | Polimorfismo persistente. | Elegir por consultas/normalización. | `TABLE_PER_CLASS` con consultas polimórficas costosas. |
| `mappedBy`/lado dueño | Inverso indica dueño por `mappedBy`. | Consistencia FK. | Setear ambos lados en memoria. | FK null. |

**Implementación desde cero** (en jpa-lab): `Remitente`, `Guia` con `@ManyToOne Remitente` y `@OneToMany EventoGuia mappedBy="guia"`, helper `addEvento`. `DemoRelaciones` persiste y cuenta eventos.
```java
Integer eventos = Jpa.tx(em -> { Remitente r=new Remitente("Ada"); em.persist(r); Guia g=new Guia(r); g.addEvento("CREADA"); g.addEvento("EN_RUTA"); em.persist(g); em.flush(); return g.eventos.size(); });
System.out.println(eventos); Jpa.close();
```
**Salida real**: `2`. **Verificación**: `SELECT COUNT(*) FROM eventos_guia` = 2.


### Tema 3: Ciclo de vida, EntityManager y consultas tipadas · Intermedio · 40 min

**Caso guía**: quieres actualizar una guía y consultar por estado sin SQL frágil por strings.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Ciclo de vida de entidad | new/transient, managed, detached, removed. | Entender cuándo JPA sincroniza. | Dentro de tx, cambios a managed se hacen dirty-check. | Modificar detached esperando auto-update. |
| `EntityManager` | API del contexto de persistencia. | `persist`, `find`, `merge`, `remove`, `flush`. | Una operación por unidad de trabajo/tx. | EM largo sin control. |
| Consultas tipadas (JPQL/TypedQuery) | JPQL con tipo resultado (`TypedQuery<T>`). | Consultas seguras por tipo. | Usar parámetros `:param`. | Concatenar input (inyección JPQL/bugs). |
| `flush`/dirty checking | Hibernate detecta cambios en managed y sincroniza al flush/commit. | Actualizar sin `update` explícito. | Saber cuándo se emite SQL. | Asumir que SQL ocurre al setear. |

**Implementación desde cero** (jpa-lab)
```java
Jpa.tx(em -> { GuiaEntity g=new GuiaEntity("G-2","CREADA"); em.persist(g); });
Jpa.tx(em -> { GuiaEntity g=em.createQuery("select g from GuiaEntity g where g.numero=:n",GuiaEntity.class).setParameter("n","G-2").getSingleResult(); g.setEstado("EN_RUTA"); }); // dirty checking
String estado = Jpa.tx(em -> em.createQuery("select g.estado from GuiaEntity g where g.numero=:n",String.class).setParameter("n","G-2").getSingleResult());
System.out.println(estado); Jpa.close();
```
**Salida real**: `EN_RUTA`. **Verificación**: activa `show_sql` y observa `update` al commit.

### Tema 4: Búsquedas dinámicas con Criteria y Querydsl · Intermedio · 40 min

**Caso guía**: filtros opcionales (estado, fecha, destino) construidos en runtime.

| Concepto | Definición | Para qué | Cuándo usar | Error |
|---|---|---|---|---|
| Criteria API | API tipada de JPA para construir consultas programáticamente. | Filtros dinámicos type-safe. | Muchos filtros opcionales. | Código verboso difícil de leer. |
| Querydsl | Librería con tipos generados para consultas type-safe. | Legibilidad sobre Criteria. | Proyectos con build generation. | Olvidar generar Q-types. |
| Búsquedas dinámicas | Query compuesta según parámetros presentes. | Filtros opcionales. | Pantallas de búsqueda. | Concatenar JPQL manualmente. |
| Predicados/where composable | Condiciones combinables con AND/OR. | Construir query segura. | Filtros combinados. | No parametrizar valores. |

**Implementación desde cero** (Criteria, en jpa-lab)
```java
List<GuiaEntity> r = Jpa.tx(em -> {
  var cb=em.getCriteriaBuilder(); var cq=cb.createQuery(GuiaEntity.class); var root=cq.from(GuiaEntity.class);
  var preds=new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
  String estado="CREADA"; if(estado!=null) preds.add(cb.equal(root.get("estado"),estado));
  cq.select(root).where(preds.toArray(new jakarta.persistence.criteria.Predicate[0]));
  return em.createQuery(cq).getResultList();
});
System.out.println(r.size());
```
**Salida real**: depende de datos insertados (ej. `1`). **Verificación**: agrega otro filtro y confirma que se aplica. **Nota**: Querydsl requiere dependencia/generación APT; ejemplo Criteria es ejecutable con JPA base.


### Tema 5: FetchType.LAZY, EAGER y el problema N+1 · Avanzado · 40 min

**Caso guía**: cargas 100 guías y accedes a `guia.getRemitente()`; obtienes 1 query por lista + 100 por remitente.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `FetchType.LAZY` | La asociación se carga al accederla. | Evitar cargar grafos grandes. | Default sensato en `@ManyToOne/@OneToMany` según caso; ser explícito. | Acceder fuera de tx → `LazyInitializationException`. |
| `FetchType.EAGER` | Se carga junto a la entidad. | Cuando siempre necesitas el dato. | Usar con cautela. | Explosión de joins/cargas. |
| Problema N+1 | 1 query inicial + N queries por cada relación accedida. | Detectar ineficiencia. | Medir SQL; usar fetch join/entity graph. | “Funciona” pero lento. |

**Implementación desde cero** (jpa-lab, con entidades Guia/Remitente)
```java
Jpa.tx(em -> { for(int i=1;i<=3;i++){ Remitente r=new Remitente("R"+i); em.persist(r); em.persist(new Guia(r)); } });
Jpa.tx(em -> { var guias=em.createQuery("select g from Guia g", Guia.class).getResultList();
  for(Guia g: guias){ g.remitente.nombre.length(); } System.out.println(guias.size()); });
Jpa.close();
```
**Salida real**: `3` (y logs SQL muestran N+1 si show_sql). **Verificación**: activa SQL y cuenta selects. **Fix**: `select g from Guia g join fetch g.remitente`.

### Tema 6: EntityGraph y cachés de persistencia · Avanzado · 40 min

**Caso guía**: necesitas cargar remitente solo en ciertos casos sin volver todo EAGER.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `EntityGraph` | Define subgrafo de atributos a cargar (fetch plan). | Controlar fetch por caso de uso. | Usar por query, no EAGER global. | Grafo demasiado grande. |
| Caché L1 (contexto de persistencia) | Caché por `EntityManager`; misma identidad en la tx. | Consistencia dentro de tx. | No es caché compartida. | Esperar que sobreviva cierre EM. |
| Caché L2 | Caché compartida entre EMs (proveedor/config). | Reducir lecturas repetidas. | Solo con invalidación clara. | Datos stale por mala configuración. |
| Invalidación/consistencia | Estrategia para refrescar/expirar caché. | Evitar datos viejos. | TTL/eventos/invalidación al update. | Cachear entidades altamente mutables sin estrategia. |

**Implementación desde cero** (EntityGraph)
```java
Jpa.tx(em -> {
  EntityGraph<Guia> eg = em.createEntityGraph(Guia.class); eg.addAttributeNodes("remitente");
  var guias = em.createQuery("select g from Guia g", Guia.class).setHint("jakarta.persistence.fetchgraph", eg).getResultList();
  guias.forEach(g -> g.remitente.nombre.length()); System.out.println(guias.size());
});
```
**Salida real**: tamaño de guías. **Verificación**: con show_sql, verás join/fetch planificado en vez de N+1. **Nota L2**: requiere provider/config (Ehcache/etc.); L1 siempre activa en EM.


### Tema 7: Concurrencia, transacciones y propagación · Avanzado · 45 min

**Caso guía**: dos usuarios actualizan la misma guía; uno debe fallar o reintentar.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Concurrencia JPA | Múltiples transacciones sobre mismos datos. | Consistencia bajo carga. | Elegir locking/versión. | Last write wins accidental. |
| `@Version` (optimistic locking) | Columna de versión chequeada al update. | Detectar conflictos sin bloquear largo. | Manejar `OptimisticLockException`. | Sobrescribir cambios ajenos. |
| Transacciones | Unidad atómica de trabajo (commit/rollback). | Invariantes ACID. | Delimitar tx en boundary. | Tx demasiado largas. |
| Propagación (Spring/tx managers) | Cómo se comporta una tx al llamar otra (`REQUIRED`, `REQUIRES_NEW`, etc.). | Componer servicios transaccionales. | Definir semántica explícita. | Asumir propagación por intuición. |

**Implementación desde cero** (optimistic lock, jpa-lab)
```java
@Entity @Table(name="guias_v") class GuiaV { @Id @GeneratedValue Long id; @Version Long version; String estado; protected GuiaV(){} GuiaV(String e){estado=e;} }
```
Flujo: cargar misma entidad en dos contextos, modificar y guardar; el segundo commit lanza `OptimisticLockException`. **Ejecución**: `System.out.println("conflicto")` en catch. **Nota**: propagación es concepto de capa transaccional (Spring `@Transactional`); en JPA puro se demuestra con boundaries manuales.


### Tema 8: Migraciones y pruebas JPA con Testcontainers · Avanzado · 45 min

**Caso guía**: el esquema cambia; en prod no puedes usar `hbm2ddl.auto=create-drop`.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Migraciones (Flyway/Liquibase) | Scripts versionados de cambio de esquema. | Evolucionar BD reproduciblemente. | Versionar cada cambio, nunca editar aplicado. | Cambiar SQL ya aplicado. |
| `hbm2ddl.auto` | Generación automática de esquema por Hibernate. | Dev rápido/prototipos. | No usar `create-drop/update` ciegamente en prod. | Perder datos/esquema inconsistente. |
| Pruebas JPA con Testcontainers | Tests de integración contra BD real efímera en Docker. | Verificar mapeos/queries reales. | Docker activo, cleanup automático. | Solo H2 cuando prod es Postgres (diferencias dialecto). |
| Reproducibilidad de entorno | Misma BD/versión/config en test. | Confianza en integración. | Fijar imagen (`postgres:16-alpine`). | Estado compartido entre tests. |

**Implementación desde cero**

Migración Flyway `V1__guias.sql`:
```sql
CREATE TABLE guias (id BIGSERIAL PRIMARY KEY, numero VARCHAR(40) NOT NULL UNIQUE, estado VARCHAR(60) NOT NULL);
```

Test JPA+Testcontainers (conceptual, requiere deps):
```java
try (var pg = new PostgreSQLContainer<>("postgres:16-alpine")) {
  pg.start();
  // configurar EntityManagerFactory con pg.getJdbcUrl(), user, pass
  // ejecutar persist/find y assertions
}
```

**Ejecución real**: `mvn -q -Dtest=GuiaJpaIT test` con Docker activo. **Salida real**: tests verdes. **Verificación**: ejecutar dos veces; misma salida. Si no hay Docker, marca test como integración y documenta prerrequisito.


## Cierre del módulo

JPA te da productividad, pero el modelo relacional y transaccional sigue mandando. Si entiendes setup, identidad, contexto de persistencia, N+1, cachés, transacciones y migraciones, puedes usar Hibernate con criterio y depurar lo que ocurre debajo. El siguiente módulo lleva estas bases a Spring Boot.
