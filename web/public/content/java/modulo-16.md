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

Usa el proyecto base del módulo (`~/academia-java/jpa-lab`) y la unidad de persistencia `academiaPU` definida en **Setup ejecutable del módulo**. Agrega las entidades/clases nuevas a `persistence.xml` si creas archivos adicionales.

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

Usa el proyecto base del módulo (`~/academia-java/jpa-lab`) y la unidad de persistencia `academiaPU` definida en **Setup ejecutable del módulo**. Agrega las entidades/clases nuevas a `persistence.xml` si creas archivos adicionales.

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

Usa el proyecto base del módulo (`~/academia-java/jpa-lab`) y la unidad de persistencia `academiaPU` definida en **Setup ejecutable del módulo**. Agrega las entidades/clases nuevas a `persistence.xml` si creas archivos adicionales.

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

Tienes 100 guías y cada guía tiene un remitente. En una pantalla de listado solo necesitas el número de guía; en otra pantalla necesitas guía + remitente. Si cargas mal la asociación, haces 101 consultas (N+1) o traes datos que no usas.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *estrategia de fetch* define cuándo se carga una asociación desde la base de datos. `FetchType.LAZY` difiere la carga hasta que se accede a la asociación (puede usar proxy/colección lazy). `FetchType.EAGER` indica al proveedor que cargue la asociación al cargar la entidad raíz (en la consulta inicial o inmediatamente después, según el proveedor y el caso). *N+1* es un antipatrón de acceso: 1 consulta para N raíces + N consultas adicionales para una asociación por cada raíz.

**Contrato / invariantes / reglas.** Los defaults JPA: `@ManyToOne` y `@OneToOne` son `EAGER` por defecto; `@OneToMany` y `@ManyToMany` son `LAZY` por defecto. Un default no es una recomendación: debes declarar el fetch según el caso de uso. `LAZY` no es gratis: fuera de contexto de persistencia puede lanzar `LazyInitializationException`; dentro de un bucle puede generar N+1. `EAGER` no elimina N+1 automáticamente y puede producir joins/cartesianas, sobrecarga y consultas inesperadas. La solución se elige por caso: `JOIN FETCH`, `EntityGraph`, DTO projection, batch fetching (`@BatchSize`/Hibernate) o consultas separadas. La evidencia es el SQL generado (`hibernate.show_sql=true`).

**Modelo mental.** `EAGER` es pedir la maleta y el contenido al mostrador, aunque solo quieras la etiqueta. `LAZY` es pedir solo la etiqueta y volver por el contenido cuando lo necesites; N+1 ocurre si vuelves al mostrador una vez por cada etiqueta.

**Implementación desde cero**

Usa el proyecto base del módulo (`~/academia-java/jpa-lab`) y la unidad de persistencia `academiaPU`. Asegura estas entidades en `persistence.xml` (`Remitente`, `Guia`). 

#### 1) LAZY: carga diferida

`Remitente` y `Guia` (si ya existen del Tema 2, reutilízalos; aquí importa la asociación):

```java
@ManyToOne(optional = false, fetch = FetchType.LAZY)
Remitente remitente;
```

Demo LAZY (`src/main/java/com/academia/jpa/DemoLazy.java`):

```java
package com.academia.jpa;

import jakarta.persistence.EntityManager;

public class DemoLazy {
    public static void main(String[] args) {
        Long guiaId = Jpa.tx(em -> {
            Remitente r = new Remitente("Ada");
            em.persist(r);
            em.persist(new Guia(r));
            em.flush();
            return em.createQuery("select g.id from Guia g", Long.class).getSingleResult();
        });

        // Carga LAZY: dentro de tx se puede inicializar
        String nombre = Jpa.tx(em -> {
            Guia g = em.find(Guia.class, guiaId);
            return g.remitente.nombre; // aquí puede disparar SELECT adicional
        });
        System.out.println(nombre);
        Jpa.close();
    }
}
```

**Uso de LAZY:** listados, APIs que devuelven solo campos raíz, asociaciones grandes o poco usadas. **Riesgo:** acceder fuera de tx => `LazyInitializationException`.

#### 2) EAGER: carga anticipada

Ejemplo de mapeo EAGER (úsalo solo para demostrar; no lo dejes global si no lo necesitas):

```java
@ManyToOne(optional = false, fetch = FetchType.EAGER)
Remitente remitente;
```

Demo EAGER (`src/main/java/com/academia/jpa/DemoEager.java`): con `hibernate.show_sql=true`, al hacer `em.find(Guia.class, id)` o una query de guías, observarás que el remitente se carga anticipadamente (join/select según proveedor). 

**Uso de EAGER:** asociación pequeña, casi siempre necesaria, bajo volumen controlado. **Riesgo:** sobre-fetching, N+1 en colecciones, joins inesperados.

#### 3) N+1: reproducción y corrección

Demo N+1 + solución (`src/main/java/com/academia/jpa/DemoN1.java`):

```java
package com.academia.jpa;

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

        // MAL: 1 query guías + N queries remitente (si accedes en bucle con LAZY)
        // List<Guia> guias = Jpa.tx(em -> em.createQuery("select g from Guia g", Guia.class).getResultList());
        // for (Guia g: guias) g.remitente.nombre; // N+1 fuera/según contexto

        // BIEN: join fetch carga asociación en una consulta
        int total = Jpa.tx(em -> {
            List<Guia> guias = em.createQuery(
                "select g from Guia g join fetch g.remitente", Guia.class).getResultList();
            int s = 0;
            for (Guia g : guias) s += g.remitente.nombre.length();
            return s;
        });
        System.out.println(total);
        Jpa.close();
    }
}
```

**Desglose del código**

- `LAZY` en `@ManyToOne`: el remitente se carga cuando accedes a `g.remitente`. Útil cuando no siempre lo necesitas.
- `EAGER` carga antes; conveniente solo si casi siempre lo usas y el costo es pequeño.
- N+1 aparece al iterar raíces y tocar una asociación lazy por elemento.
- `join fetch` resuelve N+1 en ese caso de uso; EntityGraph/DTO/batch son alternativas cuando `join fetch` no encaja.

**Tabla de decisión rápida**

| Caso | Recomendación | Cuidado |
|---|---|---|
| Asociación no siempre usada | `LAZY` + fetch por caso (`join fetch`/EntityGraph/DTO) | `LazyInitializationException` fuera de tx |
| Asociación pequeña siempre necesaria | Puede ser `EAGER` o fetch explícito | Sobre-fetching; EAGER en colecciones suele ser mala idea |
| Listado + detalle de asociación | `join fetch`/EntityGraph para esa query | Cartesian product en múltiples colecciones |
| Reporte/datos planos | DTO projection | Pierdes entidad managed |

**Ejecución y salida real**

Desde `~/academia-java/jpa-lab`:

```bash
mvn -q -DskipTests compile
mvn -q dependency:build-classpath -Dmdep.outputFile=cp.txt
java -cp "target/classes:$(cat cp.txt)" com.academia.jpa.DemoLazy
java -cp "target/classes:$(cat cp.txt)" com.academia.jpa.DemoN1
```

Salida esperada:

```text
Ada
6
```

Con `hibernate.show_sql=true`, `DemoN1` debe mostrar un `select ... join remitentes ...`, no 1+N selects.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| 1+N consultas | Acceso a asociación LAZY en bucle | `join fetch`, EntityGraph, batch size o DTO |
| `LazyInitializationException` | Acceso LAZY fuera de tx/sesión | Cargar dentro de tx, DTO o fetch explícito |
| Sobrecarga por EAGER | Mapeo EAGER global innecesario | Cambiar a LAZY y cargar por caso de uso |
| `MultipleBagFetchException` | Join fetch de varias bags | Usa `Set`, consultas separadas o DTO |

**Verificación rápida**

Activa `show_sql`, ejecuta una versión sin `join fetch` y otra con `join fetch`: compara el número de consultas.


### Tema 6: EntityGraph y cachés de persistencia · Avanzado · 40 min

**Caso guía**

En una pantalla listamos guías y solo mostramos el número; en otra mostramos guía + remitente. No quieres `EAGER` global. Además, un catálogo de estados se lee miles de veces: necesitas saber cuándo cachear y qué cache estás usando.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *EntityGraph* es un descriptor JPA de atributos que deben cargarse para una operación/consulta concreta. La *caché L1* (first-level cache) es el contexto de persistencia del `EntityManager`: guarda entidades managed durante su vida. La *caché L2* (second-level cache) es una caché opcional, compartida entre contextos, configurada en el proveedor/JPA; puede cachear entidades, colecciones o resultados de query según configuración.

**Contrato / invariantes / reglas.** L1 siempre existe en un `EntityManager`; no se desactiva. Repetir `find` del mismo id en el mismo contexto normalmente no pega otra consulta. L2 es opt-in: requiere proveedor, configuración, y normalmente marcar entidades (`@Cacheable`/anotaciones del proveedor) y definir región/TTL/invalidación. L2 mal invalidada da datos stale. EntityGraph no es caché: controla el plan de carga. `fetchgraph` trata los atributos no listados como LAZY para ese fetch (salvo id/versión según spec); `loadgraph` carga los listados y deja otros según su mapeo. No cachees todo: prioriza datos de alta lectura y baja escritura.

**Modelo mental.** L1 es tu libreta de trabajo del día (solo tu sesión). L2 es la pizarra compartida del equipo (útil, pero alguien debe borrarla cuando cambia la información). EntityGraph es la lista de compras para un viaje específico.

**Implementación desde cero**

Usa el proyecto base del módulo (`~/academia-java/jpa-lab`) y `academiaPU`.

#### A) EntityGraph — carga por caso de uso

Agrega en `Guia.java` (entidad del Tema 2):

```java
@NamedEntityGraph(
    name = "Guia.conRemitente",
    attributeNodes = @NamedAttributeNode("remitente")
)
```

`DemoEntityGraph.java`:

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
            Guia g = em.find(Guia.class, id, Map.of("jakarta.persistence.fetchgraph", graph));
            return g.remitente.nombre; // remitente ya cargado
        });
        System.out.println(nombre);
        Jpa.close();
    }
}
```

**Cuándo usar EntityGraph:** misma entidad, diferentes pantallas/casos de uso; quieres evitar EAGER global y duplicar JPQL.

#### B) Caché L1 — contexto de persistencia

`DemoL1.java`:

```java
package com.academia.jpa;

public class DemoL1 {
    public static void main(String[] args) {
        Long id = Jpa.tx(em -> {
            GuiaEntity g = new GuiaEntity("G-L1", "CREADA");
            em.persist(g); em.flush(); return g.getId();
        });

        Jpa.tx(em -> {
            GuiaEntity a = em.find(GuiaEntity.class, id); // SELECT
            GuiaEntity b = em.find(GuiaEntity.class, id); // debe venir de L1
            System.out.println(a == b); // misma instancia managed
        });
        Jpa.close();
    }
}
```

**Cuándo importa L1:** dentro de una transacción/request corto, evita lecturas repetidas y soporta dirty checking. **Límite:** no es compartida entre requests/`EntityManager`s.

#### C) Caché L2 — compartida (opt-in)

L2 no está habilitada por defecto en este lab. Configuración típica (Hibernate + Ehcache/JCache; dependencias y config adicionales):

```xml
<!-- pom.xml (adicional) -->
<dependency>
  <groupId>org.hibernate.orm</groupId>
  <artifactId>hibernate-jcache</artifactId>
  <version>${hibernate.version}</version>
</dependency>
<dependency>
  <groupId>org.ehcache</groupId>
  <artifactId>ehcache</artifactId>
  <version>3.10.8</version>
</dependency>
```

```xml
<!-- persistence.xml -->
<property name="hibernate.cache.use_second_level_cache" value="true"/>
<property name="hibernate.cache.region.factory_class" value="jcache"/>
<shared-cache-mode>ENABLE_SELECTIVE</shared-cache-mode>
```

```java
import jakarta.persistence.Cacheable;

@Entity
@Cacheable
@Table(name = "estado_catalogo")
public class EstadoCatalogo { ... }
```

**Cuándo usar L2:** catálogos estables, alta lectura, baja escritura, tolerancia a eventual consistency o invalidación bien controlada. **Cuándo NO:** datos altamente volátiles, multi-escritor sin estrategia clara, o si no puedes medir hit ratio/invalidation.

**Ejecución y salida real**

```bash
mvn -q -DskipTests compile
mvn -q dependency:build-classpath -Dmdep.outputFile=cp.txt
java -cp "target/classes:$(cat cp.txt)" com.academia.jpa.DemoEntityGraph
java -cp "target/classes:$(cat cp.txt)" com.academia.jpa.DemoL1
```

Salida esperada:

```text
Ada
true
```

Con `show_sql=true`, en `DemoL1` verás un solo SELECT para la segunda búsqueda del mismo id en el mismo contexto.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Datos stale | L2 sin invalidación/TTL | Configura invalidación; no cachees datos volátiles |
| `LazyInitializationException` resuelto con EAGER global | Mal remedio | Usa EntityGraph/DTO por caso |
| `true` no sale en L1 | Distinto `EntityManager` | L1 es por contexto; usa L2 solo si aplica |
| Cache sin beneficio | Baja hit ratio | Mide antes de activar; cachea catálogos hot |

**Verificación rápida**

Ejecuta `DemoL1` con `show_sql=true` y confirma que hay un solo SELECT para las dos `find` del mismo id en la misma transacción.


### Tema 7: Concurrencia, transacciones y propagación · Avanzado · 45 min

**Caso guía**

Dos usuarios actualizan la misma guía casi al mismo tiempo. Sin control, la última escritura puede pisar silenciosamente a la anterior. Además, un servicio llama a otro y no tienes claro si comparten transacción.

**Fundamento técnico y modelo mental**

**Definición formal.** Una *transacción* es una unidad de trabajo con propiedades ACID (en el grado provisto por la base/configuración). El *aislamiento* define qué anomalías de concurrencia se permiten. El *locking optimista* usa versión para detectar conflictos; el *pesimista* bloquea filas/recursos. La *propagación* define cómo participa un método en una transacción existente (Spring: `REQUIRED`, `REQUIRES_NEW`, etc.).

**Contrato / invariantes / reglas.** `@Version` habilita locking optimista; el commit falla con excepción de concurrencia si la versión cambió. El aislamiento más alto reduce anomalías pero aumenta contención. `REQUIRED` se une a la tx existente; `REQUIRES_NEW` suspende y crea otra. Una transacción debe ser lo más corta posible. Las excepciones y rollback rules determinan si se revierte.

**Modelo mental.** Optimista: “edita y al guardar comprobamos si alguien cambió el documento”. Pesimista: “bloquea el documento antes de editar”.

**Implementación desde cero**

Usa el proyecto base del módulo (`~/academia-java/jpa-lab`) y la unidad de persistencia `academiaPU` definida en **Setup ejecutable del módulo**. Agrega las entidades/clases nuevas a `persistence.xml` si creas archivos adicionales.

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

Usa el proyecto base del módulo (`~/academia-java/jpa-lab`) y la unidad de persistencia `academiaPU` definida en **Setup ejecutable del módulo**. Agrega las entidades/clases nuevas a `persistence.xml` si creas archivos adicionales.

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
