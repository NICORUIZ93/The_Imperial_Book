# Módulo 16: JPA, Hibernate y FetchType.LAZY vs EAGER

## Aprende construyendo

En este módulo vas a persistir un modelo pequeño de pedidos y medir las consultas que Hibernate ejecuta. La meta no es memorizar anotaciones: es decidir qué datos cargar para cada operación sin producir N+1, errores de sesión cerrada ni respuestas JSON cíclicas.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** dos clientes y tres pedidos en H2. Comprueba la clave foránea, carga los pedidos dentro de una transacción y compara el SQL de `LAZY` y `EAGER`.
- **Caso RutaFlow:** una pantalla paginada de envíos muestra referencia, estado y última parada. No serialices la entidad completa: crea una proyección DTO para el listado, una consulta de detalle con `@EntityGraph` y mide ambas con datos suficientes para que aparezca N+1.

La progresión importa: `EAGER` significa que la asociación debe estar disponible, no que Hibernate necesariamente use un `JOIN`. La evidencia del caso real es una prueba de integración con el número de filas y consultas observado, no solo una anotación en la entidad.

### Tema 1: Entidades y relaciones JPA

#### Paso 1 · Objetivo y preparación

Al finalizar podrás mapear `Cliente` y `Pedido` como entidades, crear una relación bidireccional y guardar el agregado con una transacción. Necesitas JDK 25 o superior y Maven; genera un proyecto desde Spring Initializr con `data-jpa` y `h2`.

#### Paso 2 · Contexto y caso real

Un sistema de reparto recibe pedidos y necesita consultarlos por cliente. Guardar el pedido como una fila desconectada pierde la relación; guardar el cliente completo dentro de cada pedido duplica datos y vuelve difícil actualizarlos.

#### Paso 3 · Teoría y modelo mental

JPA define el contrato de persistencia; Hibernate es una implementación que traduce entidades y operaciones a SQL. `@Entity` identifica una clase persistente, `@Id` su clave y las asociaciones describen referencias entre filas. En una relación bidireccional, `mappedBy` marca el lado inverso: el lado que declara `@JoinColumn` es el propietario que escribe la clave foránea.

Piensa en el lado propietario como la ficha que conserva la dirección oficial de la relación. Cambiar solo la colección inversa en memoria no garantiza que la base de datos cambie.

#### Paso 4 · Demostración guiada

Crea estos archivos en `src/main/java/academia/pedidos/`. El resto de la aplicación Spring Boot se genera con Initializr.

```java
// Cliente.java
package academia.pedidos;

import jakarta.persistence.*;
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

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```


```java
// Pedido.java
package academia.pedidos;

import jakarta.persistence.*;

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

Un test `@DataJpaTest` debe crear un `Cliente`, llamar dos veces a `agregar(new Pedido(...))`, guardarlo con `EntityManager.persist(cliente)` y confirmar que se recuperan dos pedidos. Ejecuta `./mvnw test`.

**Resultado esperado:** el test termina en verde y la fila de `pedido` contiene `cliente_id`. **Fallo deliberado:** quita `pedido.asignarCliente(this)` y vuelve a probar. La asociación propietaria queda sin cliente; diagnostica inspeccionando la clave foránea, no solo la colección Java.

#### Paso 5 · Práctica guiada

1. Agrega `EstadoPedido` como enum persistido con `@Enumerated(EnumType.STRING)`.
2. Escribe un método de repositorio que busque los pedidos de un cliente.
3. Prueba borrar un cliente con pedidos sin `CascadeType.REMOVE`; decide y documenta la regla de negocio antes de añadir cascada.

#### Paso 6 · Práctica independiente

Modela `Pedido` y `LineaPedido` con una asociación uno-a-muchos. Agrega una línea mediante un método del agregado que actualice ambos lados. Escribe un test que compruebe la clave foránea y el total de líneas. No expongas setters públicos que permitan dejar el agregado inconsistente.

#### Paso 7 · Cierre y evidencia

Entrega las dos entidades, el test de persistencia y la consulta SQL observada como incremento del proyecto integrador de RutaFlow: modela el vínculo entre cliente y envío; como siguiente paso mide el costo real de cargar asociaciones con LAZY y EAGER. Errores comunes: convertir toda asociación en bidireccional sin necesidad, configurar cascadas amplias sin una regla de ciclo de vida definida, y actualizar solo la colección en memoria sin asignar también el lado propietario de la relación. Fuentes oficiales: https://jakarta.ee/specifications/persistence/ y https://docs.oracle.com/en/java/javase/25/.
**¿Por qué es importante?** Porque una relación persistida correctamente mantiene la integridad referencial aunque la aplicación se reinicie, y el lado propietario (el que declara `@JoinColumn`) es el único que garantiza que la base de datos refleje el cambio, no solo la colección Java en memoria.
**Evidencia de aprendizaje:** entrega el test de persistencia en verde, la fila con `cliente_id` poblado, y el fallo reproducido al omitir `asignarCliente` en el lado propietario.
**Conceptos clave:** `@Entity`, `@Id`, relación bidireccional, `mappedBy`, lado propietario frente a lado inverso.

**Cuándo no usarlo:** no conviertas toda asociación en bidireccional ni configures cascadas amplias sin una regla de ciclo de vida.

### Tema 2: FetchType.LAZY, EAGER y el problema N+1

#### Paso 1 · Objetivo y preparación

Al finalizar podrás elegir una estrategia de carga por caso de uso y demostrar el costo en número de consultas. Continúa con `Cliente` y `Pedido` del tema anterior; habilita `spring.jpa.show-sql=true` solo para este laboratorio.

#### Paso 2 · Contexto y caso real

La pantalla de clientes muestra diez clientes y el número de pedidos de cada uno. Una consulta para los clientes más diez consultas para pedidos es N+1: funciona con pocos datos y degrada al aumentar el lote.

#### Paso 3 · Teoría y modelo mental

`LAZY` difiere la carga hasta acceder a la asociación; `EAGER` exige que esté disponible al devolver la entidad, pero **no garantiza un único JOIN**. El proveedor puede emitir consultas adicionales. En JPA, `@ManyToOne` y `@OneToOne` son EAGER por defecto; `@OneToMany` y `@ManyToMany` son LAZY. Declara la intención explícitamente, especialmente `LAZY` en relaciones to-one.

La estrategia de mapeo es el valor por defecto, no un plan de consulta universal. Para cada pantalla o operación usa una consulta específica: `JOIN FETCH`, `@EntityGraph` o una proyección a DTO. El modelo mental: no pidas que el almacén abra cada caja por separado; especifica de antemano las cajas necesarias para esta operación.

#### Paso 4 · Demostración guiada

En `src/test/java/academia/pedidos/ConsultasPedidoTest.java`, persiste diez clientes con pedidos. Limpia el contexto antes de medir para evitar que la caché de primer nivel oculte consultas:

```java
entityManager.flush();
entityManager.clear();
statistics.clear();

List<Cliente> clientes = entityManager.createQuery(
    "select c from Cliente c", Cliente.class
).getResultList();
clientes.forEach(c -> c.getPedidos().size());

System.out.println("Consultas: " + statistics.getPrepareStatementCount());
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```


Activa `hibernate.generate_statistics=true` en la configuración de test y obtiene `Statistics` desde `SessionFactory`. Ejecuta `./mvnw test -Dtest=ConsultasPedidoTest`.

**Resultado esperado:** el primer recorrido suele revelar una consulta de clientes y consultas adicionales por asociación. Los números exactos dependen de la versión y del caché; compara con el mismo conjunto de datos y contexto limpio. **Fallo deliberado:** elimina `entityManager.clear()`; explica por qué una sesión ya poblada puede hacer que el contador parezca mejor de lo que es.

#### Paso 5 · Práctica guiada

Reemplaza la consulta por:

```java
select distinct c from Cliente c
left join fetch c.pedidos
```

Mide otra vez. Luego intenta paginar esa consulta con una colección fetch-join: Hibernate puede advertir o paginar en memoria porque un join de colección multiplica las filas. Para una pantalla paginada, prueba cargar primero IDs paginados y luego los datos necesarios, o usa `@EntityGraph` con una estrategia evaluada.

#### Paso 6 · Práctica independiente

Implementa tres variantes: consulta base + acceso a relaciones, `JOIN FETCH` y proyección DTO. Registra el conteo de SQL, el número de filas duplicadas y si permite paginación segura. Responde: ¿cuándo es útil LAZY? ¿Cuándo se justifica EAGER? ¿Qué alternativa evita serializar accidentalmente la entidad completa?

#### Paso 7 · Cierre y evidencia

Entrega test, conteos comparables y decisión por caso de uso para el proyecto integrador de RutaFlow: la vista de detalle de un envío puede necesitar paradas, mientras que una lista resumida no; con esto cerrás el módulo. Errores comunes: usar EAGER global como "cura" para `LazyInitializationException` en vez de resolver cada caso de uso, usar `JOIN FETCH` sobre una colección sin considerar que multiplica filas, y paginar una consulta con fetch-join de colección sin verificar que Hibernate pagina correctamente. Fuentes oficiales: https://jakarta.ee/specifications/persistence/ y https://docs.oracle.com/en/java/javase/25/.
**¿Por qué es importante?** Porque elegir la estrategia de carga según cada operación evita convertir un endpoint aparentemente simple en cientos de viajes a la base de datos (N+1), sin caer en el extremo opuesto de cargar siempre todo con EAGER.
**Evidencia de aprendizaje:** entrega el test que reproduce N+1 con el conteo de consultas, y el test con la consulta optimizada (`JOIN FETCH` o proyección DTO) mostrando el conteo reducido.
**Conceptos clave:** `FetchType.LAZY`/`EAGER`, problema N+1, `JOIN FETCH`, `@EntityGraph`, proyección DTO.

**Cuándo no usarlo:** EAGER global no es una cura para `LazyInitializationException`; `JOIN FETCH` sin considerar cardinalidad puede multiplicar filas y memoria.
