# Módulo 16: JPA de Spring Boot — Hibernate, Lazy vs Eager y N+1

## Aprende construyendo

Este módulo construye una API pequeña de pedidos y observa las consultas reales de Hibernate. Las anotaciones describen el modelo; cada operación debe elegir explícitamente qué datos necesita.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** guarda un cliente con dos pedidos y verifica en H2 quién escribe `cliente_id`; luego imprime las consultas al recorrer la colección.
- **Caso RutaFlow:** el listado de envíos es paginado y solo necesita id, referencia, estado y hora de creación. Devuelve una proyección DTO para esa vista y reserva el detalle con paradas para una consulta específica; compara SQL, filas duplicadas y latencia con un conjunto de datos más grande que una sola fila.

No arregles N+1 poniendo todas las asociaciones en `EAGER`: eso desplaza el costo y puede romper paginación. Registra la consulta y el plan elegido para cada endpoint.

### Tema 1: Relaciones, lado propietario y ciclo de vida

#### Paso 1 · Objetivo y preparación

Al finalizar podrás persistir `Cliente` y `Pedido` con Spring Data JPA y definir quién controla la clave foránea. Necesitas JDK 25+, Maven y PostgreSQL local o H2 para el test. Genera el proyecto con `web`, `data-jpa` y `h2`.
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
#### Paso 2 · Contexto y caso real

La API de entregas necesita consultar los pedidos de un cliente, pero el pedido debe conservar la referencia al cliente sin duplicar sus datos.

**¿Por qué es importante?** Una asociación coherente evita claves foráneas huérfanas y deja claro qué entidad controla el vínculo en la base de datos.

#### Paso 3 · Teoría y modelo mental

`@ManyToOne` suele ser el lado propietario porque contiene la clave foránea; `mappedBy` declara el lado inverso. Mantén ambos lados sincronizados mediante métodos del dominio. `CascadeType` expresa propagación del ciclo de vida; no lo actives por inercia: eliminar el cliente no necesariamente debe eliminar pedidos históricos.

JPA define el contrato y Hibernate lo implementa. `@Transactional` delimita el trabajo y permite que el contexto de persistencia gestione cambios; no hace que cada método de Java sea automáticamente atómico.
**Analogía:** el lado propietario es como el titular de un contrato de alquiler: su firma es la que vale ante el registro (la clave foránea). El lado inverso es el inquilino que tiene una copia para consultar. Las cascadas son la cláusula que decide si, al cancelar el contrato del titular, se cancelan también los servicios asociados.
#### Paso 4 · Demostración guiada
**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `src/main/java/academia/envios/Cliente.java` con el contenido de este tema.
```bash
curl -fsSL https://start.spring.io/starter.zip -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```

**Crea** el archivo `src/main/java/academia/envios/Cliente.java` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.


En `src/main/java/academia/envios/Cliente.java`:

```java
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
}
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


En `Pedido.java`, declara `@ManyToOne(fetch = FetchType.LAZY, optional = false)` y `@JoinColumn(name = "cliente_id", nullable = false)`. Crea un servicio con `@Transactional` que construya el cliente, agregue un pedido y guarde el agregado mediante `ClienteRepository`. Ejecuta `./mvnw test`.

**Resultado esperado:** el test persiste ambos registros y `pedido.cliente_id` referencia al cliente. **Fallo deliberado:** elimina la llamada `pedido.asignarCliente(this)`; revisa la clave foránea para descubrir que actualizar solo la colección inversa no basta.

#### Paso 5 · Práctica guiada

Agrega `LineaPedido` y un método de agregado que mantenga ambos lados. Prueba `CascadeType.PERSIST`, luego quítalo y explica qué operación explícita reemplaza la cascada. Intenta eliminar un cliente con pedidos y decide el comportamiento de integridad esperado.
**Pista:** quita `CascadeType.PERSIST` de `pedidos` en `Cliente` y vuelve a ejecutar el test que guarda cliente y pedido juntos; si falla porque el pedido no aparece en la base, la cascada era la que lo persistía automáticamente — ahora necesitas guardar `Pedido` explícitamente con su propio repositorio antes de guardar `Cliente`.
#### Paso 6 · Práctica independiente

Modela `Envio` y `Parada` para RutaFlow. Define propietario, nulabilidad, cascadas y regla de borrado. Escribe tests para inserción, actualización y borrado; usa migraciones Flyway en vez de `ddl-auto=update` para un esquema persistente.

#### Paso 7 · Cierre

Entrega entidades, migración y tests de integridad referencial como incremento del proyecto integrador de RutaFlow. **Cuándo no usarlo:** evita asociaciones bidireccionales si ningún caso de uso las necesita y no uses `CascadeType.REMOVE` sobre datos que deban conservar historial.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** actualizar solo la colección `pedidos` de `Cliente` sin llamar `pedido.asignarCliente(this)` (la fila de `pedido` queda con `cliente_id` nulo aunque la colección en memoria se vea correcta), y asumir que `CascadeType.PERSIST` también cubre el borrado — un `cliente.getPedidos().remove(pedido)` no elimina la fila sin `orphanRemoval = true` o un borrado explícito por repositorio.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
### Tema 2: LAZY, EAGER, N+1 y consultas de caso de uso

#### Paso 1 · Objetivo y preparación

Al finalizar podrás reproducir N+1, elegir una carga apropiada para una pantalla y verificar el plan mediante SQL medido. Continúa con las entidades del tema anterior.
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
#### Paso 2 · Contexto y caso real

Una pantalla lista veinte clientes y cuenta sus pedidos. Una consulta inicial más veinte consultas por asociación es N+1; una relación EAGER indiscriminada puede sustituirlo por joins enormes o selects secundarios.

**¿Por qué es importante?** La estrategia de carga afecta latencia, consumo de memoria y número de consultas; medirla antes de producción evita sorpresas que no aparecen con una sola fila de prueba.

#### Paso 3 · Teoría y modelo mental

`LAZY` pospone la lectura hasta acceder a la asociación; `EAGER` obliga al proveedor a entregar la asociación disponible, pero no garantiza un JOIN ni una única consulta. Defaults JPA: `ManyToOne` y `OneToOne` son EAGER; `OneToMany` y `ManyToMany` son LAZY. Configura explícitamente las relaciones y carga datos por caso de uso.

Hibernate puede representar asociaciones LAZY mediante proxies; acceder después de cerrar el contexto puede producir `LazyInitializationException`. No lo soluciones activando `Open Session in View` o haciendo todo EAGER: devuelve DTOs construidos dentro de una transacción con la consulta necesaria.
**Analogía:** `LAZY` es traer cada dato solo al pedirlo; `EAGER`, traerlo todo por adelantado. El N+1 es llamar al almacén una vez por la lista de pedidos y después una llamada extra por cada pedido para saber su cliente: veinte pedidos, veintiuna llamadas. La consulta por caso de uso es pedir exactamente lo que la pantalla muestra, en un solo viaje.
#### Paso 4 · Demostración guiada
**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `src/test/java/academia/envios/ConsultaClienteTest.java` con el contenido de este tema.
```bash
curl -fsSL https://start.spring.io/starter.zip -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```

**Crea** el archivo `src/test/java/academia/envios/ConsultaClienteTest.java` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.


En `src/test/java/academia/envios/ConsultaClienteTest.java`, persiste veinte clientes con uno o dos pedidos cada uno. Activa `hibernate.generate_statistics=true`. En el test, ejecuta `flush()`, `clear()` y `getStatistics().clear()` antes de contar:

```java
List<Cliente> clientes = repository.findAll();
clientes.forEach(cliente -> cliente.getPedidos().size());
long consultas = sessionFactory.getStatistics().getPrepareStatementCount();
System.out.println("Consultas SQL: " + consultas);
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


Ejecuta `./mvnw test -Dtest=ConsultaClienteTest`. **Resultado esperado:** observa la consulta raíz y consultas de colección adicionales; el total depende de caché, datos y versión, así que registra también esas condiciones. **Fallo deliberado:** omite `clear()` del contexto y explica cómo la caché de primer nivel hace engañosa una medición repetida.

#### Paso 5 · Práctica guiada

Agrega una consulta dedicada con `@EntityGraph(attributePaths = "pedidos")` o JPQL `left join fetch c.pedidos`. Repite la medición. Prueba paginación: un fetch join de colección duplica filas y puede impedir paginación SQL eficiente. Compara una proyección DTO y registra consulta, filas y memoria.
**Pista:** combina el `left join fetch c.pedidos` con un parámetro `Pageable` en el mismo método de repositorio y ejecuta el test de paginación; si Hibernate responde con una advertencia de tipo "firstResult/maxResults specified with collection fetch; applying in memory" o ves filas de cliente repetidas, esa es la señal de que el fetch join de colección no combina con paginación SQL.
#### Paso 6 · Práctica independiente

Implementa endpoint de resumen de cliente que solo devuelve nombre y número de pedidos, y endpoint de detalle que devuelve pedidos. No serialices entidades JPA directamente. Diseña pruebas que consulten ambos endpoints y midan cantidad de SQL sin fijar un número frágil si Hibernate puede emitir consultas equivalentes.

#### Paso 7 · Cierre

Entrega reproducción del N+1, versión optimizada, SQL registrado y decisión de carga para resumen/detalle del proyecto integrador de RutaFlow. **Cuándo no usarlo:** `EAGER` no es sinónimo de JOIN ni solución general; `JOIN FETCH` en colecciones grandes puede multiplicar filas.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** fijar en el test un número exacto de consultas SQL sin considerar que el caché de segundo nivel o una versión distinta de Hibernate puede cambiar el conteo, y combinar `@EntityGraph` sobre una colección con un `Pageable` esperando que la paginación siga resolviéndose en SQL en vez de en memoria.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).