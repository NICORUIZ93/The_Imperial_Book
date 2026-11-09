# Módulo 16: JPA de Spring Boot — Hibernate, Lazy vs Eager y N+1

## Aprende construyendo

Este módulo construye una API pequeña de pedidos y observa las consultas reales de Hibernate. Las anotaciones describen el modelo; cada operación debe elegir explícitamente qué datos necesita.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** guarda un cliente con dos pedidos y verifica en H2 quién escribe `cliente_id`; luego imprime las consultas al recorrer la colección.
- **Caso RutaFlow:** el listado de envíos es paginado y solo necesita id, referencia, estado y hora de creación. Devuelve una proyección DTO para esa vista y reserva el detalle con paradas para una consulta específica; compara SQL, filas duplicadas y latencia con un conjunto de datos más grande que una sola fila.

No arregles N+1 poniendo todas las asociaciones en `EAGER`: eso desplaza el costo y puede romper paginación. Registra la consulta y el plan elegido para cada endpoint.

### Tema 1: Relaciones, lado propietario y ciclo de vida

**Meta:** guardar un cliente con pedidos y demostrar con SQL qué objeto escribe la clave foránea, qué propaga `PERSIST` y por qué el borrado necesita una decisión aparte. No hace falta instalar PostgreSQL: el laboratorio usa H2 en memoria.

**¿Por qué es importante?** Si la relación se ve bien en Java pero la FK no se escribe, las consultas y las reglas de borrado fallan justo cuando los datos salen de la memoria. Ver la columna concreta conecta el modelo de objetos con lo que protege la base.

**Evidencia final:** los tests muestran `pedido.cliente_id`, prueban guardar el agregado y exhiben el rechazo al borrar el cliente con historial. JPA controla la relación; Hibernate ejecuta ese contrato.

#### Subtema 16.1 · Sigue la clave foránea · 8 min

**Contexto:** Un pedido debe apuntar a un cliente. En la tabla `pedido`, la columna `cliente_id` guarda ese enlace; la lista `Cliente.pedidos` por sí sola no escribe la columna.

**Hazlo tú:** Abre `examples/java-jpa-lab/src/main/java/academia/pedidos/Pedido.java`. La asociación propietaria está aquí:

```java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "cliente_id", nullable = false)
private Cliente cliente;
```

Abre `Cliente.java`: `mappedBy = "cliente"` apunta al campo de arriba. Ejecuta el test existente desde la raíz:

```bash
cd examples/java-jpa-lab
./mvnw -Dtest=PedidoJpaLabTest#guardaLosDosLadosYConsultaPorClienteConJpql test
```

**Resultado esperado:** verde; el test consulta `cliente_id` directamente y confirma que coincide con el ID del cliente.

**Fallo deliberado.** En `Cliente.agregar`, comenta `pedido.asignarCliente(this);` y repite el comando. El test debe fallar: la lista Java contiene el pedido, pero falta el vínculo que JPA escribe en la fila. **Diagnóstico:** revisa la columna `cliente_id` y el error de restricción que devuelve el test.

**Entiende:** `@ManyToOne` es el lado propietario porque tiene la columna. `mappedBy` significa “esta lista refleja la relación definida por `Pedido.cliente`”. Vuelve a poner la llamada y ejecuta el test para dejarlo verde.

**Cierra:** Señala el archivo y la línea que controla la FK `cliente_id`.

#### Subtema 16.2 · Mantén los dos lados sincronizados · 8 min

**Contexto:** En memoria quieres recorrer cliente → pedidos y pedido → cliente. Si actualizas solo una dirección, el programa puede parecer correcto hasta guardar.

**Hazlo tú:** En `Cliente.agregar`, observa las dos líneas del método:

```java
pedidos.add(pedido);           // permite recorrer desde Cliente
pedido.asignarCliente(this);   // establece el lado propietario
```

Abre `examples/java-jpa-lab/src/test/java/academia/pedidos/PedidoJpaLabTest.java`. El test `guardaLosDosLadosYConsultaPorClienteConJpql` crea un cliente, agrega dos pedidos y ejecuta `persist(cliente)`. Corre:

```bash
./mvnw -Dtest=PedidoJpaLabTest#guardaLosDosLadosYConsultaPorClienteConJpql test
```

**Resultado esperado:** dos filas de pedido y ambas con la FK del cliente; después de `clear()`, JPQL las recupera en orden.

**Fallo deliberado.** Comenta cualquiera de las dos líneas de `agregar` y mira qué expectativa falla. **Diagnóstico:** si falta el `add`, la colección queda vacía; si falta `asignarCliente`, no se guarda la FK. Restaura la línea antes de seguir.

**Entiende:** `clear()` vacía la memoria de trabajo de JPA. Por eso el test vuelve a leer desde H2 y no confunde los objetos que ya tenía en memoria con lo que realmente quedó guardado.

**Cierra:** Explica por qué un método `agregar` reduce el riesgo frente a modificar la lista y el pedido por separado.

#### Subtema 16.3 · Decide qué significa guardar y borrar · 10 min

**Contexto:** Crear un cliente y sus pedidos juntos es cómodo; borrar el cliente no debería borrar automáticamente un historial comercial.

**Hazlo tú:** En `Cliente.java`, encuentra:

```java
@OneToMany(mappedBy = "cliente", cascade = CascadeType.PERSIST)
```

`PERSIST` propaga el alta. No incluye `REMOVE`. Corre la prueba que guarda el agregado y comprueba que el test `persistirClientePropagaPersistenciaPeroNoBorrado` espera un error al borrar el cliente que aún tiene un pedido:

```bash
./mvnw -Dtest=PedidoJpaLabTest#persistirClientePropagaPersistenciaPeroNoBorrado test
```

**Resultado esperado:** verde porque el test espera que Hibernate rechace el borrado mientras el pedido todavía apunta al cliente (`TransientPropertyValueException`). No interpreta `PERSIST` como permiso para borrar al hijo.

**Fallo deliberado.** Cambia `cascade = CascadeType.PERSIST` por `cascade = CascadeType.ALL` y repite. El test debe fallar porque ahora también se propaga el borrado. Restaura `PERSIST`. **Diagnóstico:** el test ya no recibe la excepción esperada porque `ALL` también elimina al pedido.

**Entiende:** Una cascada es una regla explícita sobre operaciones del ciclo de vida. No activa todas las operaciones mágicamente: `PERSIST` guarda; `REMOVE` borra; `orphanRemoval` borra un hijo al quitarlo de la relación. Para pedidos históricos, elige borrado lógico o conserva el cliente; no añadas `ALL` por comodidad.

**Cierra:** Anota qué política usaría RutaFlow para un envío ya entregado y qué evidencia conservaría.

#### Subtema 16.4 · Verifica y transfiere la decisión · 10 min

**Contexto:** Una asociación solo está entendida si puedes cambiarla con seguridad y explicar qué protege la base de datos.

**Hazlo tú:** Ejecuta toda la suite del laboratorio:

```bash
./mvnw test
```

Después abre `examples/java-jpa-lab/src/test/java/academia/pedidos/PedidoJpaLabTest.java` y sigue `flush()`, la consulta SQL nativa de `cliente_id` y `clear()`.

**Resultado esperado:** pasan las pruebas de relación, cascada, búsqueda y carga. La FK consultada coincide con el cliente guardado; Hibernate rechaza borrar al cliente mientras el pedido conserva esa referencia.

**Fallo deliberado.** Cambia temporalmente `name = "cliente_id"` por `name = "cliente"` en `@JoinColumn` y corre el primer test. La consulta SQL directa debe fallar porque el laboratorio comprueba la columna `cliente_id`. **Diagnóstico:** busca el error de columna inexistente. Restaura el nombre y confirma que pasa.

**Entiende:** `nullable = false` expresa la regla en el mapeo; el esquema generado aplica la restricción en H2. En un proyecto persistente, una migración Flyway debe expresar y versionar esa misma regla. El laboratorio no demuestra el comportamiento de PostgreSQL ni de una política de borrado distinta.

**Cierra:** En el **proyecto integrador de RutaFlow**, registra en una nota breve: lado propietario, FK, operación que se propaga, regla de borrado y test que protege cada decisión. En el tema siguiente medirás cómo cargar asociaciones sin consultas inesperadas.

**Fuente primaria:** [Jakarta Persistence 3.2 API: `@OneToMany`](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/onetomany) documenta `mappedBy`, cascadas y `orphanRemoval`; [la especificación](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2) define las reglas de propiedad de la relación.
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
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/test/java/academia/envios/ConsultaClienteTest.java` dentro.
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

#### Paso 7 · Cierre y evidencia

Entrega reproducción del N+1, versión optimizada, SQL registrado y decisión de carga para resumen/detalle del proyecto integrador de RutaFlow. **Cuándo no usarlo:** `EAGER` no es sinónimo de JOIN ni solución general; `JOIN FETCH` en colecciones grandes puede multiplicar filas. **Evidencia:** tests y comparación reproducible. Referencia: [Jakarta Persistence](https://jakarta.ee/specifications/persistence/).
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** fijar en el test un número exacto de consultas SQL sin considerar que el caché de segundo nivel o una versión distinta de Hibernate puede cambiar el conteo, y combinar `@EntityGraph` sobre una colección con un `Pageable` esperando que la paginación siga resolviéndose en SQL en vez de en memoria.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
**Evidencia de aprendizaje:** entrega el conteo de consultas SQL antes y después de agregar `@EntityGraph` o `left join fetch`, la advertencia de Hibernate al paginar sobre una colección, y la explicación de por qué elegiste proyección DTO o fetch join para el endpoint de resumen/detalle.
