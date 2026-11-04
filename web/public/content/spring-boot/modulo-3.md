# Módulo 3: Persistencia con Spring Data JPA

Este módulo continúa el backend `academia-spring` creado en los módulos 1 y 2. Ejecuta los ejemplos con la base H2 de pruebas; el test comprueba datos reales, no repositorios simulados.

## Aprende construyendo

### Tema 1: Entidades y repositorios derivados

Al terminar, podrás probar que una entidad se guarda y se recupera, escribir un método de búsqueda a partir de propiedades reales y reconocer cuándo una consulta JPQL queda más clara. El tema usa `Tarea(titulo, prioridad, ubicacionInterna)` que ya existe en `academia-spring`.

**¿Por qué es importante?** Una consulta mal nombrada puede impedir que el servicio arranque; probar con datos reales permite localizar el error antes de conectar la API con otros servicios.

Prerrequisitos: Temas 1–6 del módulo 2. En particular, existe `TareaRepository extends JpaRepository<Tarea, Long>`, H2 está configurado y el proyecto incluye `spring-boot-starter-data-jpa-test`.

```mermaid
flowchart LR
  A["Tarea en Java"] -->|saveAndFlush| B[("H2 de prueba")]
  B -->|findById / consulta| C["Resultado comprobado por el test"]
```

#### Subtema 3.1 · Guardar y recuperar una entidad · 8 min

**Contexto:** Antes de filtrar una lista, comprueba el viaje más pequeño: Java guarda una tarea, la base asigna su ID y luego el repositorio la busca. Así separas un problema de persistencia de un problema de consulta.

**Hazlo tú:** En `academia-spring`, crea `src/test/java/com/example/demo/TareaRepositoryTest.java`:

```java
package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TareaRepositoryTest {
    @Autowired TareaRepository tareas;

    @Test
    void guardaYRecuperaLaTarea() {
        Tarea guardada = tareas.saveAndFlush(
            new Tarea("Revisar paquete", 2, "BODEGA-A")
        );

        Tarea leida = tareas.findById(guardada.getId()).orElseThrow();

        assertThat(leida.getTitulo()).isEqualTo("Revisar paquete");
        assertThat(leida.getPrioridad()).isEqualTo(2);
    }
}
```

Desde la raíz del proyecto, ejecuta:

```bash
./mvnw -q -Dtest=TareaRepositoryTest test
```

**Salida esperada:** el comando termina con código 0 y Maven informa `BUILD SUCCESS`. El test obliga a escribir y leer en H2; `saveAndFlush` envía el cambio antes de buscarlo.

**Fallo deliberado y diagnóstico:** cambia `isEqualTo(2)` por `isEqualTo(9)` y repite el comando. El test falla con una comparación esperada 9 frente a actual 2. Eso indica que la lectura sí ocurrió y que el valor esperado del test es incorrecto. Restáuralo a 2.

**Entiende:** `@DataJpaTest` (en Boot 4 se importa desde `org.springframework.boot.data.jpa.test.autoconfigure`) prepara las piezas de persistencia y una base de prueba; no arranca toda la API. `JpaRepository` ya aporta `saveAndFlush` y `findById`. El ID se genera al guardar, por eso se consulta con `guardada.getId()`. La [guía oficial de pruebas de Spring Boot](https://docs.spring.io/spring-boot/4.1/reference/testing/spring-boot-applications.html) confirma que este slice busca entidades, configura repositorios JPA y usa una base embebida disponible.

**Cierra:** conserva el test verde. Puedes mostrar el ID generado y los dos valores leídos; eso es evidencia de ida y vuelta, no solo de que el proyecto compila.

#### Subtema 3.2 · Filtrar con el nombre del método · 10 min

**Contexto:** La API ya guarda `prioridad`. El listado necesita devolver tareas cuya prioridad sea al menos el mínimo recibido, sin escribir una consulta para una comparación sencilla.

**Hazlo tú:** En `src/main/java/com/example/demo/TareaRepository.java`, agrega el método señalado:

```java
package com.example.demo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TareaRepository extends JpaRepository<Tarea, Long> {
    List<Tarea> findByPrioridadGreaterThanEqual(int minimo);
}
```

En `src/test/java/com/example/demo/TareaRepositoryTest.java`, conserva el test de guardado e imports del subtema anterior. Añade este método antes de la llave final de la clase:

```java
@Test
void filtraPrioridadMinimaIncluyendoElLimite() {
    tareas.save(new Tarea("Sobre", 1, "A"));
    tareas.save(new Tarea("Caja", 2, "B"));
    tareas.save(new Tarea("Pallet", 3, "C"));
    tareas.flush();

    var resultado = tareas.findByPrioridadGreaterThanEqual(2);

    assertThat(resultado).extracting(Tarea::getTitulo)
        .containsExactlyInAnyOrder("Caja", "Pallet");
}
```

Ejecuta desde la raíz del proyecto:

```bash
./mvnw -q -Dtest=TareaRepositoryTest test
```

**Salida esperada:** `BUILD SUCCESS`; aparecen Caja y Pallet, pero no Sobre. El sufijo `GreaterThanEqual` incluye el valor límite 2.

**Fallo deliberado y diagnóstico:** cambia `findByPrioridadGreaterThanEqual` a `findByPrioridGreaterThanEqual` en la interfaz y cambia igual la llamada en el test para que el código compile. Al arrancar, Spring muestra `PropertyReferenceException` porque no encuentra `priorid` en `Tarea` y sugiere `prioridad`. La consulta se valida desde el nombre de propiedad; restaura ambas apariciones y ejecuta otra vez.

**Entiende:** Spring Data separa `findBy` del nombre de la propiedad y del operador. La forma de la consulta se lee así:

```text
findBy | Prioridad | GreaterThanEqual
buscar | campo    | mayor o igual
```

El nombre debe corresponder al atributo Java (`prioridad`), no al nombre de columna ni al nombre que llega en JSON. La lista se escribe con `List<Tarea>` porque el filtro puede devolver varias filas.

**Cierra:** entrega el test verde y señala cuál resultado prueba que el límite es inclusivo. La referencia oficial lista los operadores y explica cómo Spring Data interpreta nombres de métodos: [Spring Data JPA — Query methods](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html).

#### Subtema 3.3 · Escribir JPQL cuando ayuda a leer · 10 min

**Contexto:** El nombre derivado anterior es corto y claro. Cuando la consulta requiere una condición expresada con más detalle, puedes escribir JPQL; JPQL usa nombres de entidades y atributos Java, no nombres directos de tablas y columnas.

**Hazlo tú:** En `src/main/java/com/example/demo/TareaRepository.java`, declara ambos caminos para comparar sus resultados:

```java
package com.example.demo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TareaRepository extends JpaRepository<Tarea, Long> {
    List<Tarea> findByPrioridadGreaterThanEqual(int minimo);

    @Query("select t from Tarea t where t.prioridad >= :minimo")
    List<Tarea> buscarPrioridadMinima(@Param("minimo") int minimo);
}
```

Dentro de `TareaRepositoryTest`, añade este método antes de la última llave:

```java
@Test
void jpqlYMetodoDerivadoDevuelvenLasMismasTareas() {
    tareas.save(new Tarea("Sobre", 1, "A"));
    tareas.save(new Tarea("Caja", 2, "B"));
    tareas.save(new Tarea("Pallet", 3, "C"));
    tareas.flush();

    var derivado = tareas.findByPrioridadGreaterThanEqual(2);
    var jpql = tareas.buscarPrioridadMinima(2);

    assertThat(jpql).extracting(Tarea::getTitulo)
        .containsExactlyInAnyOrderElementsOf(
            derivado.stream().map(Tarea::getTitulo).toList()
        );
}
```

Ejecuta desde la raíz del proyecto:

```bash
./mvnw -q -Dtest=TareaRepositoryTest test
```

**Salida esperada:** `BUILD SUCCESS`; las dos consultas encuentran las mismas tareas. Si agregas este método al test existente, conserva los imports de la prueba anterior.

**Fallo deliberado y diagnóstico:** escribe `t.priorid` en la cadena de `@Query` y ejecuta el test. Spring no reconoce ese atributo JPQL y el contexto falla al crear el repositorio con `QueryCreationException: Query validation failed`. El nombre válido es `prioridad`, como en la propiedad Java. Corrígelo y vuelve a ejecutar.

**Entiende:** JPQL consulta entidades (`Tarea t`) y sus propiedades (`t.prioridad`); el proveedor JPA lo traduce a SQL para la base configurada. `@Param` conecta el marcador `:minimo` con el argumento Java. Prefiere un método derivado cuando se entiende de un vistazo; usa `@Query` cuando el nombre se vuelve difícil de leer o necesitas expresar una forma que la convención no cubre. Ninguno da control total del SQL físico: JPQL y SQL son lenguajes distintos.

**Cierra:** conserva las dos pruebas y explica con un ejemplo cuándo elegirías cada versión. Para pasar a una relación entre entidades, revisa el siguiente tema sobre N+1. Referencia oficial: [Spring Data JPA — declarar consultas](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html).

La entidad y el repositorio de esta práctica continúan en el proyecto integrador del track. La estructura atómica describe actividades verificables; no certifica por sí sola dominio profesional.

### Tema 2: El problema N+1 y su corrección

#### Paso 1 · Objetivo y preparación

Al finalizar podrás reproducir el problema N+1 con una relación `@OneToMany`, medir el número real de queries ejecutadas, y corregirlo con `JOIN FETCH`.

**Conocimiento previo:** Tema 1 de este módulo (entidades y repositorios).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Iterar sobre una lista de usuarios accediendo a las tareas de cada uno, con una relación cargada perezosamente, dispara una query SQL separada por cada usuario individual — un problema de rendimiento que empeora directamente con el tamaño de los datos y puede pasar desapercibido en desarrollo con pocos registros de prueba.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** carga perezosa (`lazy`), una query adicional por cada elemento de una colección, `JOIN FETCH`.

`@OneToMany(mappedBy = "usuario") private List<Tarea> tareas;` mapea una relación uno-a-muchos, con carga perezosa por defecto: la lista de tareas de un usuario no se carga desde la base de datos hasta que efectivamente se accede a ella (`u.getTareas().size()`). Esto se vuelve problemático al iterar sobre una colección de usuarios: por cada usuario, Hibernate ejecuta una query SQL separada para cargar sus tareas, resultando en N queries adicionales más la query original que cargó la lista de usuarios — de ahí "N+1". `@Query("SELECT u FROM Usuario u JOIN FETCH u.tareas") List<Usuario> buscarConTareas();` corrige esto indicándole a Hibernate que cargue usuarios y tareas relacionadas en una única query con `JOIN` real.

**Analogía:** el problema N+1 es como enviar un mensajero por separado a buscar cada ingrediente de una receta, uno a la vez, en vez de un único mensajero que trae todos los ingredientes en un solo viaje coordinado (`JOIN FETCH`); cada viaje individual tiene un costo fijo que se multiplica innecesariamente.

**Diagrama:**

```mermaid
flowchart LR
  A[findAll de N usuarios] --> B["por cada usuario: u.getTareas() dispara 1 query"]
  B --> C["N+1 queries totales"]
  D["JOIN FETCH u.tareas"] --> E["1 sola query con JOIN"]
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-spring` (o créalo desde una carpeta vacía con `mkdir -p academia-spring` si es tu primera vez) y crea `src/main/java/com/academia/tarea/Usuario.java` con la relación, habilitando además el contador de queries real vía el logger de Hibernate:

```bash
mkdir -p academia-spring/src/main/java/com/academia/tarea
cd academia-spring
```

```java
// src/main/java/com/academia/tarea/Usuario.java
package com.academia.tarea;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Usuario {
    @Id
    @GeneratedValue
    private Long id;
    private String nombre;

    @OneToMany(mappedBy = "usuario")
    private List<Tarea> tareas = new ArrayList<>();

    protected Usuario() {}

    public Usuario(String nombre) { this.nombre = nombre; }

    public Long getId() { return id; }
    public List<Tarea> getTareas() { return tareas; }
}
```

```bash
cat >> src/main/resources/application.properties <<'EOF'
spring.jpa.properties.hibernate.generate_statistics=true
logging.level.org.hibernate.stat=DEBUG
EOF
```

**Explicación línea por línea:** `@OneToMany(mappedBy = "usuario")` declara la relación uno-a-muchos con carga perezosa (comportamiento por defecto de `@OneToMany`); `hibernate.generate_statistics=true` activa las estadísticas reales de Hibernate, que reportan el número exacto de queries ejecutadas por sesión — la forma real de medir N+1, no una estimación.

Escribe un test real que provoca N+1 deliberadamente, leyendo el conteo real de queries desde `SessionFactory.getStatistics()`:

```java
// src/test/java/com/academia/tarea/NMasUnoTest.java
package com.academia.tarea;

import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class NMasUnoTest {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private SessionFactory sessionFactory;

    @Test
    void iterarSobreUsuariosAccediendoATareasDisparaNMasUnoQueries() {
        for (int i = 0; i < 3; i++) usuarioRepository.save(new Usuario("usuario-" + i));

        Statistics stats = sessionFactory.getStatistics();
        stats.clear();

        for (Usuario u : usuarioRepository.findAll()) {
            u.getTareas().size(); // dispara una query lazy POR CADA usuario
        }

        // 1 query para findAll() + 3 queries lazy (una por usuario) = 4
        assertThat(stats.getQueryExecutionCount()).isEqualTo(4L);
    }
}
```

```bash
mvn test -Dtest=NMasUnoTest         # Maven
./gradlew test --tests NMasUnoTest  # Gradle (equivalente)
```

**Resultado esperado:** el test pasa: `stats.getQueryExecutionCount()` reporta exactamente `4` queries (1 de `findAll()` + 3 de acceso perezoso, una por usuario) — la medición real del problema N+1, no una suposición.

**Fallo deliberado:** cambia el conteo esperado a `assertThat(stats.getQueryExecutionCount()).isEqualTo(1L)` (asumiendo, incorrectamente, que `findAll()` ya trae todo) y ejecuta de nuevo. El test FALLA con `expected: 1L but was: 4L` — diagnostica confirmando con evidencia real, no intuición, que la carga perezosa efectivamente dispara las queries adicionales al iterar. Revierte la aserción a `4L`, luego corrige el método con `JOIN FETCH` en `UsuarioRepository` (`@Query("SELECT u FROM Usuario u JOIN FETCH u.tareas") List<Usuario> buscarConTareas();`) y confirma que, usando ese método en vez de `findAll()`, `stats.getQueryExecutionCount()` baja a `1L`.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un cuarto usuario y confirma que el conteo de queries sube a `5` (1 + 4) antes de la corrección, y permanece en `1` después de aplicar `JOIN FETCH`.
2. Prueba `@EntityGraph(attributePaths = "tareas")` sobre `findAll()` como alternativa declarativa a `JOIN FETCH` y confirma con `Statistics` que también reduce el conteo a `1`.
3. Provoca N+1 con una segunda relación (agrega `@OneToMany` de `Usuario` a una nueva entidad `Comentario`) y confirma que iterar sobre ambas relaciones multiplica el número de queries adicionales.
4. Escribe de memoria (sin mirar) una entidad con `@OneToMany` y un test que mida el número real de queries con `Statistics` antes y después de `JOIN FETCH`.

**Pista:** `stats.clear()` antes de la sección que quieres medir es imprescindible; sin eso, el conteo incluye queries de configuración previas y el número deja de ser interpretable.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para cargar usuarios y tareas en una única query:

```java
@Query("SELECT u FROM Usuario u ____ u.tareas")
List<Usuario> buscarConTareas();
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un test que mida con `Statistics.getQueryExecutionCount()` la diferencia entre iterar con carga perezosa y usar `JOIN FETCH`. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya reproduces el problema N+1 y lo mides con estadísticas reales de Hibernate, en vez de asumir su presencia o ausencia. El siguiente tema aborda cómo versionar cambios de esquema sin depender de la generación automática de Hibernate. **Evidencia:** entrega el resultado del conteo de queries antes (`4`) y después (`1`) de aplicar `JOIN FETCH`, medido con `Statistics` real. Fuente oficial: [Hibernate — Fetching strategies](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#fetching).

**Errores comunes:** no notar el problema N+1 hasta que aparece en producción con datasets grandes, por no haberlo medido durante el desarrollo; usar `EAGER` indiscriminadamente en todas las relaciones como "solución" genérica, lo que puede cargar datos innecesarios incluso cuando no se necesitan.

**Cuándo no usarlo:** para una relación que casi nunca se accede junto con la entidad principal, forzar `JOIN FETCH` en todas las consultas cargaría datos innecesarios la mayoría del tiempo; resérvalo para los accesos donde realmente se sabe que la relación se usará.

Detectar y corregir N+1 es una revisión obligatoria antes de dar por completo el proyecto integrador de este track (microservicio productivo, Módulo 12).

### Tema 3: Migraciones con Flyway

#### Paso 1 · Objetivo y preparación

Al finalizar podrás versionar un cambio de esquema con una migración de Flyway, y explicar por qué `hibernate.ddl-auto=update` es riesgoso en producción.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un cambio de esquema aplicado automáticamente por Hibernate (`ddl-auto=update`) no queda registrado en ningún historial versionado ni revisable en un pull request; una migración de Flyway sí, y se aplica de forma idéntica y predecible en cada entorno.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** esquema versionado y revisable, riesgo de `ddl-auto` en producción, migraciones aplicadas en orden secuencial.

`hibernate.ddl-auto=update` permite que Hibernate genere y actualice automáticamente el esquema basándose en las entidades declaradas, cómodo en desarrollo temprano pero riesgoso en producción: Hibernate podría inferir un cambio distinto al pretendido, sin quedar registrado en ningún historial revisable antes de aplicarse. `V1__crear_tabla_tareas.sql` (una migración de Flyway, nombrada según su convención de versión secuencial) declara explícitamente en SQL puro el cambio de esquema, versionado en el repositorio, revisable en un pull request, y aplicado de forma idéntica en cada entorno — Flyway registra qué migraciones ya se aplicaron en cada base de datos, aplicando únicamente las nuevas pendientes, en orden.

**Analogía:** `ddl-auto=update` es como dejar que un asistente reorganice el mobiliario de una casa según sus propias inferencias, sin un plano ni revisión previa; Flyway es seguir un plano de renovación explícito, versionado y revisado antes de ejecutarse, aplicado exactamente igual en cada casa idéntica.

**Diagrama:**

```
┌── V1__crear_tabla_tareas.sql ──┐
│  aplicada primero                │
└──────────┬─────────────────┘
           │ V2__agregar_columna_prioridad.sql
           ▼
┌── esquema actual, versionado y revisable ──┐
│  Flyway registra qué migraciones ya corrieron │
└──────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-spring` (o créalo desde una carpeta vacía con `mkdir -p academia-spring` si es tu primera vez), agrega la dependencia `flyway-core` y crea la migración inicial en `src/main/resources/db/migration/`:

```bash
mkdir -p academia-spring/src/main/resources/db/migration
cd academia-spring
```

```sql
-- src/main/resources/db/migration/V1__crear_tabla_tarea.sql
CREATE TABLE tarea (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    completada BOOLEAN NOT NULL DEFAULT false
);
```

```bash
# desactiva ddl-auto: el esquema ahora lo gestiona exclusivamente Flyway
cat >> src/main/resources/application.properties <<'EOF'
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
EOF
mvn test          # Maven
./gradlew test    # Gradle (equivalente)
```

**Explicación línea por línea:** `V1__crear_tabla_tarea.sql` (prefijo `V1`, número de versión secuencial, seguido de `__` y una descripción) declara el esquema inicial en SQL real; `spring.jpa.hibernate.ddl-auto=validate` le indica a Hibernate que NO genere ni modifique el esquema, solo que valide que las entidades coincidan con lo que Flyway ya creó — si no coinciden, la aplicación falla al arrancar en vez de aplicar un cambio silencioso no revisado.

Confirma con un test real que la migración se aplicó y el esquema coincide con la entidad `Tarea`, guardando y leyendo una fila real:

```java
// src/test/java/com/academia/tarea/MigracionFlywayTest.java
package com.academia.tarea;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class MigracionFlywayTest {

    @Autowired
    private TareaRepository tareaRepository;

    @Test
    void elEsquemaCreadoPorFlywayAceptaGuardarYLeerUnaTarea() {
        Tarea guardada = tareaRepository.save(new Tarea("Comprar leche"));

        Tarea leida = tareaRepository.findById(guardada.getId()).orElseThrow();

        assertThat(leida.getTitulo()).isEqualTo("Comprar leche");
    }
}
```

```bash
mvn test -Dtest=MigracionFlywayTest # Maven
./gradlew test --tests MigracionFlywayTest # Gradle (equivalente)
```

**Resultado esperado:** `BUILD SUCCESS`, confirmando que Flyway aplicó `V1__crear_tabla_tarea.sql` antes de que el contexto de Spring arrancara, que `ddl-auto=validate` confirmó que la entidad `Tarea` coincide con ese esquema, y que guardar y leer una fila real funciona correctamente.

**Fallo deliberado:** agrega manualmente un campo nuevo a la entidad `Tarea` (por ejemplo, `private String descripcion;`) SIN crear ninguna migración `V2` que agregue la columna correspondiente, y ejecuta `mvn test` de nuevo. La aplicación falla al arrancar con `SchemaManagementException: Schema-validation: missing column [descripcion] in table [tarea]` — diagnostica confirmando exactamente el propósito de `ddl-auto=validate`: en vez de que Hibernate silenciosamente agregara la columna faltante (el riesgo de `ddl-auto=update`), la aplicación se niega a arrancar hasta que exista una migración explícita y revisable que agregue esa columna. Revierte el campo agregado, o crea `V2__agregar_columna_descripcion.sql` con `ALTER TABLE tarea ADD COLUMN descripcion VARCHAR(500);` para resolverlo correctamente.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega `V2__agregar_indice_completada.sql` con `CREATE INDEX idx_tarea_completada ON tarea(completada);` y confirma que `mvn test` sigue en verde tras aplicar ambas migraciones en secuencia.
2. Intenta nombrar una migración fuera de secuencia (`V1__otra_migracion.sql`, reutilizando la versión `1` ya aplicada) y observa el error real que produce Flyway ante una versión duplicada.
3. Agrega una migración que renombre una columna (`ALTER TABLE tarea RENAME COLUMN titulo TO nombre;`) y actualiza la entidad correspondientemente, confirmando que el test de lectura/escritura sigue pasando con el nuevo nombre.
4. Escribe de memoria (sin mirar) una migración `V1` que cree una tabla de dos columnas, y un test que confirme que Flyway la aplicó correctamente.

**Pista:** el prefijo de versión (`V1`, `V2`, ...) debe ser único y estrictamente creciente; Flyway rechaza aplicar una migración con una versión ya registrada como aplicada.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para que Hibernate solo valide el esquema, sin modificarlo:

```properties
spring.jpa.hibernate.ddl-auto=____
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, una migración `V1` que cree una tabla con al menos dos columnas, y explica en una frase por qué `ddl-auto=validate` es preferible a `update` en producción. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya versionas cambios de esquema con migraciones explícitas y revisables de Flyway, en vez de depender de la inferencia automática de Hibernate. Esto cierra el módulo de persistencia; el siguiente módulo aborda cómo exponer y proteger estos datos a través de una API REST completa. **Evidencia:** entrega el resultado de `MigracionFlywayTest` en verde, y el mensaje de error real que produce un campo de entidad sin su migración correspondiente. Fuente oficial: [Flyway — Migrations](https://documentation.red-gate.com/flyway/flyway-cli-and-api/concepts/migrations).

**Errores comunes:** confiar en `ddl-auto=update` en un entorno de producción, arriesgando cambios de esquema no versionados ni revisables; editar tablas manualmente en vez de a través de una migración versionada, perdiendo el historial y la reproducibilidad entre entornos.

**Cuándo no usarlo:** para un prototipo local descartable sin ningún dato que preservar entre reinicios, `ddl-auto=create-drop` sin Flyway es más simple y suficiente; reserva las migraciones versionadas para cualquier entorno compartido o con datos que deban persistir.

---

Las migraciones con Flyway que escribas aquí versionan el esquema del proyecto integrador de este track (microservicio productivo, Módulo 12).

## Laboratorio práctico

**Objetivo del laboratorio:** construir una API con persistencia real, medir y corregir un problema N+1, y versionar el esquema con Flyway.

**Requisitos previos:** Módulos 0-2 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Definir `Tarea` con `@Entity` y su repositorio | Ver Tema 1 | Método derivado `findByCompletadaFalse` |
| 2 | Comparar con el equivalente en `@Query` | Ver Tema 1 | Discute cuándo cada enfoque es apropiado |
| 3 | Modelar `@OneToMany` y provocar N+1 | Ver Tema 2 | Cuenta las queries ejecutadas con `Statistics` |
| 4 | Corregir con `JOIN FETCH` o `@EntityGraph` | Ver Tema 2 | Mide la diferencia real en queries |
| 5 | Configurar Flyway con una migración versionada | Ver Tema 3 | En vez de `ddl-auto=update` |

**Verificación:** el laboratorio se considera exitoso si la corrección del problema N+1 reduce el número de queries medido con `Statistics` de N+1 a una única query, y si el esquema de la base de datos se gestiona completamente mediante migraciones versionadas de Flyway, con `ddl-auto=validate` confirmando la coincidencia.

**Errores comunes y soluciones**

- **Confiar en `ddl-auto=update` en un entorno de producción.** Usa migraciones versionadas con Flyway.
- **No notar el problema N+1 hasta que aparece en producción con datos reales.** Mide el número de queries con `Statistics` durante el desarrollo, con datasets representativos.
- **Sobreusar `@Query` para casos que un método derivado simple resolvería.** Usa métodos derivados para consultas simples y directas.

---
