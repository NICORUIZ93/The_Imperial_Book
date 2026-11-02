# Módulo 16: JPA de Spring Boot — Hibernate, Lazy vs Eager y N+1

## Aprende construyendo

Este módulo construye una API pequeña de pedidos y observa las consultas reales de Hibernate. Las anotaciones describen el modelo; cada operación debe elegir explícitamente qué datos necesita.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** guarda un cliente con dos pedidos y verifica en H2 quién escribe `cliente_id`; luego imprime las consultas al recorrer la colección.
- **Caso RutaFlow:** el listado de envíos es paginado y solo necesita id, referencia, estado y hora de creación. Devuelve una proyección DTO para esa vista y reserva el detalle con paradas para una consulta específica; compara SQL, filas duplicadas y latencia con un conjunto de datos más grande que una sola fila.

No arregles N+1 poniendo todas las asociaciones en `EAGER`: eso desplaza el costo y puede romper paginación. Registra la consulta y el plan elegido para cada endpoint.

### Tema 1: Relaciones, lado propietario y ciclo de vida · Avanzado · 1 h 50 min

**Prerrequisito:** tema anterior de este módulo, JDK 27+, Maven y PostgreSQL local o H2.

**Al terminar podrás:** persistir `Cliente` y `Pedido` con Spring Data JPA y definir quién controla la clave foránea.

#### Aprende

La API de entregas necesita consultar los pedidos de un cliente, pero el pedido debe conservar la referencia al cliente sin duplicar sus datos.

**¿Por qué es importante?** Una asociación coherente evita claves foráneas huérfanas y deja claro qué entidad controla el vínculo en la base de datos.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| `@Transactional` y contexto de persistencia | Prerrequisito | El servicio anotado con `@Transactional` construye el cliente, agrega el pedido y guarda el agregado por repositorio |
| Lado propietario vs `mappedBy` | Núcleo | `@OneToMany(mappedBy = "cliente", ...)` en `Cliente` y `@ManyToOne` con `@JoinColumn(name = "cliente_id")` en `Pedido` |
| Sincronización de ambos lados del dominio | Núcleo | `agregar` llama a `pedido.asignarCliente(this)` tras `pedidos.add(pedido)` |
| `CascadeType.PERSIST` | Variante | Guardar `Cliente` persiste también sus `Pedido`; al quitarlo el test exige guardar `Pedido` por su repositorio |
| Colección inversa no basta | Error frecuente | El fallo deliberado deja `pedido.cliente_id` nulo al suprimir `asignarCliente` |
| Borrado y `orphanRemoval` | Límite | `cliente.getPedidos().remove(pedido)` no borra la fila sin `orphanRemoval = true` o borrado explícito |
| Regla de integridad al eliminar cliente | Decisión | Eliminar un cliente no borra pedidos históricos salvo decisión explícita vía `CascadeType.REMOVE` |
| Esquema persistente con Flyway | Decisión | El bloque Aplica usa migraciones Flyway en vez de `ddl-auto=update` |

Cada fila tiene su explicación individual a continuación.

**`@Transactional` y contexto de persistencia (prerrequisito).** El servicio de este tema usa `@Transactional` para delimitar el trabajo y permitir que el contexto de persistencia gestione los cambios al construir el cliente, agregar un pedido y guardar el agregado por `ClienteRepository`. El texto advierte que esta anotación no convierte cada método Java en atómico: solo abre la unidad de trabajo dentro de la cual Hibernate implementa el contrato JPA. Sin esa transacción el contexto no coordina la escritura coherente de ambas entidades.

**Lado propietario vs `mappedBy` (núcleo).** `@ManyToOne` es el lado propietario porque contiene la clave foránea, mientras `mappedBy = "cliente"` en la colección de `Cliente` declara el lado inverso que no manda sobre la base. En el código, `Pedido` lleva `@JoinColumn(name = "cliente_id")` y por eso es quien escribe esa columna. Confundir qué lado controla el vínculo es lo que produce filas con `cliente_id` nulo aunque la colección en memoria parezca correcta.

**Sincronización de ambos lados del dominio (núcleo).** El método `agregar` añade el pedido a la colección y acto seguido invoca `pedido.asignarCliente(this)` para fijar el lado propietario. El mecanismo importa porque solo la referencia del lado `@ManyToOne` persiste la clave foránea; mantener ambos lados en código evita estados incoherentes entre memoria y base. El tema lo verifica comprobando que la fila de `pedido` guarda `cliente_id`.

**`CascadeType.PERSIST` (variante).** Esta cascada propaga la operación de guardado del cliente a sus pedidos, de modo que guardar el agregado persiste ambos registros. La pista del tema muestra la variante contraria: al quitar `CascadeType.PERSIST` el test falla porque el pedido ya no se guarda automáticamente, y entonces hay que persistir `Pedido` explícitamente con su propio repositorio antes de guardar `Cliente`. La decisión de activarla no debe tomarse por inercia.

**Colección inversa no basta (error frecuente).** El fallo deliberado consiste en eliminar la llamada `pedido.asignarCliente(this)`: al actualizar solo la colección inversa, la clave foránea `pedido.cliente_id` queda nula. Esto demuestra que modificar el lado `mappedBy` en memoria no escribe la columna, porque ese lado no es el propietario. Es el error más repetido al modelar asociaciones bidireccionales.

**Borrado y `orphanRemoval` (límite).** El tema aclara que `cliente.getPedidos().remove(pedido)` no elimina la fila correspondiente sin `orphanRemoval = true` o un borrado explícito por repositorio. El límite es que `CascadeType.PERSIST` cubre el guardado pero no el borrado, así que asumir que la cascada de persistencia también elimina es incorrecto. Reconocer este límite evita filas huérfanas que sobreviven a la operación de la colección.

**Regla de integridad al eliminar cliente (decisión).** Eliminar un cliente no debe borrar sus pedidos históricos salvo que se decida explícitamente activar `CascadeType.REMOVE` o `orphanRemoval`. La decisión es de diseño del dominio: el ejemplo pide intentar borrar un cliente con pedidos y definir el comportamiento de integridad esperado. Activar el borrado en cascada sobre datos que deben conservar historial es justamente lo que el tema desaconseja.

**Esquema persistente con Flyway (decisión).** Para RutaFlow el bloque Aplica indica usar migraciones Flyway en lugar de `ddl-auto=update` cuando el esquema debe persistir. La decisión separa la evolución controlada del esquema de la generación automática implícita de Hibernate, que no deja rastro versionado. Así el cambio de estructura queda explícito y reproducible frente a producción.

`@ManyToOne` suele ser el lado propietario porque contiene la clave foránea; `mappedBy` declara el lado inverso. Mantén ambos lados sincronizados mediante métodos del dominio. `CascadeType` expresa propagación del ciclo de vida; no lo actives por inercia: eliminar el cliente no necesariamente debe eliminar pedidos históricos.

JPA define el contrato y Hibernate lo implementa. `@Transactional` delimita el trabajo y permite que el contexto de persistencia gestione cambios; no hace que cada método de Java sea automáticamente atómico.

**Analogía:** el lado propietario es como el titular de un contrato de alquiler: su firma es la que vale ante el registro (la clave foránea). El lado inverso es el inquilino que tiene una copia para consultar. Las cascadas son la cláusula que decide si, al cancelar el contrato del titular, se cancelan también los servicios asociados.

#### Practica

Genera el proyecto con `web`, `data-jpa` y `h2`.

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

Agrega `LineaPedido` y un método de agregado que mantenga ambos lados. Prueba `CascadeType.PERSIST`, luego quítalo y explica qué operación explícita reemplaza la cascada. Intenta eliminar un cliente con pedidos y decide el comportamiento de integridad esperado.

**Pista:** quita `CascadeType.PERSIST` de `pedidos` en `Cliente` y vuelve a ejecutar el test que guarda cliente y pedido juntos; si falla porque el pedido no aparece en la base, la cascada era la que lo persistía automáticamente — ahora necesitas guardar `Pedido` explícitamente con su propio repositorio antes de guardar `Cliente`.

#### Aplica

Modela `Envio` y `Parada` para RutaFlow. Define propietario, nulabilidad, cascadas y regla de borrado. Escribe tests para inserción, actualización y borrado; usa migraciones Flyway en vez de `ddl-auto=update` para un esquema persistente.

**Checklist de salida.**

- [ ] `Pedido` declara `@ManyToOne(fetch = FetchType.LAZY, optional = false)` y `@JoinColumn(name = "cliente_id", nullable = false)`.
- [ ] `Cliente.agregar` sincroniza ambos lados y la fila de `pedido` guarda `cliente_id`.
- [ ] Quitar `CascadeType.PERSIST` obliga a persistir `Pedido` con su propio repositorio.
- [ ] Eliminar un cliente no borra pedidos históricos salvo que se decida explícitamente.
- [ ] El esquema persistente usa Flyway, no `ddl-auto=update`.

**Si falla.** Si la fila de `pedido` queda con `cliente_id` nulo, actualizaste solo la colección inversa: llama a `pedido.asignarCliente(this)` dentro de `agregar`. Si quitar `CascadeType.PERSIST` impide guardar ambos registros, persiste `Pedido` con su repositorio antes de guardar `Cliente`. Si borrar el cliente elimina pedidos históricos, revisa `CascadeType.REMOVE` y `orphanRemoval`.

Entrega entidades, migración y tests de integridad referencial como incremento del proyecto integrador de RutaFlow. **Cuándo no usarlo:** evita asociaciones bidireccionales si ningún caso de uso las necesita y no uses `CascadeType.REMOVE` sobre datos que deban conservar historial.

Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.

**Errores comunes:** actualizar solo la colección `pedidos` de `Cliente` sin llamar `pedido.asignarCliente(this)` (la fila de `pedido` queda con `cliente_id` nulo aunque la colección en memoria se vea correcta), y asumir que `CascadeType.PERSIST` también cubre el borrado — un `cliente.getPedidos().remove(pedido)` no elimina la fila sin `orphanRemoval = true` o un borrado explícito por repositorio.

**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).

### Tema 2: LAZY, EAGER, N+1 y consultas de caso de uso · Avanzado · 1 h 40 min

**Prerrequisito:** Tema 1 de este módulo; continúa con sus entidades.

**Al terminar podrás:** reproducir N+1, elegir una carga apropiada para una pantalla y verificar el plan mediante SQL medido.

#### Aprende

Una pantalla lista veinte clientes y cuenta sus pedidos. Una consulta inicial más veinte consultas por asociación es N+1; una relación EAGER indiscriminada puede sustituirlo por joins enormes o selects secundarios.

**¿Por qué es importante?** La estrategia de carga afecta latencia, consumo de memoria y número de consultas; medirla antes de producción evita sorpresas que no aparecen con una sola fila de prueba.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Defaults JPA de fetch | Prerrequisito | `ManyToOne`/`OneToOne` son EAGER y `OneToMany`/`ManyToMany` son LAZY |
| Reproducción del N+1 | Núcleo | `findAll()` más `getPedidos().size()` por cliente genera una consulta raíz y veinte de colección |
| Medición con estadísticas | Núcleo | `hibernate.generate_statistics=true` y `getPrepareStatementCount()` cuentan las consultas reales |
| `flush()`, `clear()` y caché de primer nivel | Diagnóstico | Omitir `clear()` deja un conteo de 1 porque la caché oculta el problema |
| `@EntityGraph` / `left join fetch` | Variante | La consulta dedicada reduce el conteo respecto al N+1 |
| Fetch join de colección con paginación | Límite | El aviso «firstResult/maxResults specified with collection fetch» y filas de cliente repetidas |
| Proyección DTO por caso de uso | Decisión | Los endpoints de resumen y detalle devuelven DTOs, no entidades JPA |
| `LazyInitializationException` | Error frecuente | Acceder a un proxy LAZY tras cerrar el contexto lanza la excepción |

Cada fila tiene su explicación individual a continuación.

**Defaults JPA de fetch (prerrequisito).** El tema recuerda que `ManyToOne` y `OneToOne` son EAGER por defecto, mientras `OneToMany` y `ManyToMany` son LAZY. Conocer estos valores por omisión es condición para razonar el comportamiento observado, porque la carga que no se configura explícitamente la decide este default. Por eso el texto insiste en configurar las relaciones y cargar datos por caso de uso en vez de confiar en el implícito.

**Reproducción del N+1 (núcleo).** El `findAll()` devuelve los clientes con una consulta raíz y, al recorrer `cliente.getPedidos().size()` por cada uno, dispara una consulta adicional por asociación: veinte pedidos, veintiuna llamadas según la analogía. Este es el mecanismo central del tema, que el test mide con el contador de sentencias. Reconocer el patrón es el paso previo a corregirlo con una consulta específica.

**Medición con estadísticas (núcleo).** Activar `hibernate.generate_statistics=true` y leer `getStatistics().getPrepareStatementCount()` convierte el problema en un número observable de consultas reales. El tema advierte que el total depende de caché, datos y versión, por lo que pide registrar también esas condiciones. Medir antes de producción es lo que evita la sorpresa que una sola fila de prueba oculta.

**`flush()`, `clear()` y caché de primer nivel (diagnóstico).** El test ejecuta `flush()`, `clear()` y `getStatistics().clear()` antes de contar para que la medición no quede falseada. El fallo deliberado consiste en omitir `clear()`: entonces la caché de primer nivel sirve las entidades ya cargadas y el conteo baja a 1, ocultando el N+1. Este es el diagnóstico clave cuando una medición repetida parece demasiado buena.

**`@EntityGraph` / `left join fetch` (variante).** La corrección propuesta usa `@EntityGraph(attributePaths = "pedidos")` o JPQL `left join fetch c.pedidos` para traer la asociación en una consulta dedicada y repetir la medición. Es la variante optimizada frente al N+1: reduce el conteo sin recurrir a EAGER indiscriminado. El tema pide comprobar la reducción sin fijar una cifra exacta que resulte frágil.

**Fetch join de colección con paginación (límite).** Combinar un `left join fetch c.pedidos` con `Pageable` provoca el aviso «firstResult/maxResults specified with collection fetch; applying in memory» o filas de cliente repetidas. El límite es que un fetch join de colección duplica filas y no combina con paginación SQL eficiente, por lo que la paginación se resuelve en memoria. La salida correcta es sustituirlo por una consulta específica para esa vista.

**Proyección DTO por caso de uso (decisión).** El tema decide no serializar entidades JPA directamente y devolver DTOs: un endpoint de resumen con nombre y número de pedidos, y otro de detalle con los pedidos. La decisión alinea cada consulta con lo que la pantalla muestra, en un solo viaje, y mantiene el control transaccional de la carga. Así se evita arrastrar la asociación completa cuando la vista no la necesita.

**`LazyInitializationException` (error frecuente).** Hibernate representa asociaciones LAZY con proxies, y acceder a ellas tras cerrar el contexto de persistencia produce `LazyInitializationException`. El tema advierte explícitamente que no se resuelve activando Open Session in View ni haciendo todo EAGER, sino construyendo DTOs dentro de una transacción con la consulta necesaria. Confundir la solución con esos atajos es el error frecuente que el tema previene.

`LAZY` pospone la lectura hasta acceder a la asociación; `EAGER` obliga al proveedor a entregar la asociación disponible, pero no garantiza un JOIN ni una única consulta. Defaults JPA: `ManyToOne` y `OneToOne` son EAGER; `OneToMany` y `ManyToMany` son LAZY. Configura explícitamente las relaciones y carga datos por caso de uso.

Hibernate puede representar asociaciones LAZY mediante proxies; acceder después de cerrar el contexto puede producir `LazyInitializationException`. No lo soluciones activando `Open Session in View` o haciendo todo EAGER: devuelve DTOs construidos dentro de una transacción con la consulta necesaria.

**Analogía:** `LAZY` es traer cada dato solo al pedirlo; `EAGER`, traerlo todo por adelantado. El N+1 es llamar al almacén una vez por la lista de pedidos y después una llamada extra por cada pedido para saber su cliente: veinte pedidos, veintiuna llamadas. La consulta por caso de uso es pedir exactamente lo que la pantalla muestra, en un solo viaje.

#### Practica

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

Agrega una consulta dedicada con `@EntityGraph(attributePaths = "pedidos")` o JPQL `left join fetch c.pedidos`. Repite la medición. Prueba paginación: un fetch join de colección duplica filas y puede impedir paginación SQL eficiente. Compara una proyección DTO y registra consulta, filas y memoria.

**Pista:** combina el `left join fetch c.pedidos` con un parámetro `Pageable` en el mismo método de repositorio y ejecuta el test de paginación; si Hibernate responde con una advertencia de tipo "firstResult/maxResults specified with collection fetch; applying in memory" o ves filas de cliente repetidas, esa es la señal de que el fetch join de colección no combina con paginación SQL.

#### Aplica

Implementa endpoint de resumen de cliente que solo devuelve nombre y número de pedidos, y endpoint de detalle que devuelve pedidos. No serialices entidades JPA directamente. Diseña pruebas que consulten ambos endpoints y midan cantidad de SQL sin fijar un número frágil si Hibernate puede emitir consultas equivalentes.

**Checklist de salida.**

- [ ] `hibernate.generate_statistics=true` y `getPrepareStatementCount()` miden las consultas reales.
- [ ] `flush()`, `clear()` y `getStatistics().clear()` preceden la medición.
- [ ] La consulta raíz más una consulta por cliente reproduce N+1.
- [ ] `@EntityGraph` o `left join fetch` reduce el conteo sin fijar un número frágil.
- [ ] Un fetch join de colección con `Pageable` avisa de paginación en memoria y se sustituye por una consulta específica.
- [ ] Los endpoints devuelven DTOs, no entidades JPA.

**Si falla.** Si el conteo es 1, la caché de primer nivel ocultó el problema: falta `clear()` antes de medir. Si Hibernate avisa «firstResult/maxResults specified with collection fetch», no combines un fetch join de colección con `Pageable`. Si el número cambia entre ejecuciones, no fijes una cifra exacta en la aserción.

Entrega reproducción del N+1, versión optimizada, SQL registrado y decisión de carga para resumen/detalle del proyecto integrador de RutaFlow. **Cuándo no usarlo:** `EAGER` no es sinónimo de JOIN ni solución general; `JOIN FETCH` en colecciones grandes puede multiplicar filas.

Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.

**Errores comunes:** fijar en el test un número exacto de consultas SQL sin considerar que el caché de segundo nivel o una versión distinta de Hibernate puede cambiar el conteo, y combinar `@EntityGraph` sobre una colección con un `Pageable` esperando que la paginación siga resolviéndose en SQL en vez de en memoria.

**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
