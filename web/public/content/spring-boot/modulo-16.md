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

**Fallo deliberado:** En `Cliente.agregar`, comenta `pedido.asignarCliente(this);` y repite el comando. El test debe fallar: la lista Java contiene el pedido, pero falta el vínculo que JPA escribe en la fila. **Diagnóstico:** revisa la columna `cliente_id` y el error de restricción que devuelve el test.

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

**Fallo deliberado:** Comenta cualquiera de las dos líneas de `agregar` y mira qué expectativa falla. **Diagnóstico:** si falta el `add`, la colección queda vacía; si falta `asignarCliente`, no se guarda la FK. Restaura la línea antes de seguir.

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

**Fallo deliberado:** Cambia `cascade = CascadeType.PERSIST` por `cascade = CascadeType.ALL` y repite. El test debe fallar porque ahora también se propaga el borrado. Restaura `PERSIST`. **Diagnóstico:** el test ya no recibe la excepción esperada porque `ALL` también elimina al pedido.

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

**Fallo deliberado:** Cambia temporalmente `name = "cliente_id"` por `name = "cliente"` en `@JoinColumn` y corre el primer test. La consulta SQL directa debe fallar porque el laboratorio comprueba la columna `cliente_id`. **Diagnóstico:** busca el error de columna inexistente. Restaura el nombre y confirma que pasa.

**Entiende:** `nullable = false` expresa la regla en el mapeo; el esquema generado aplica la restricción en H2. En un proyecto persistente, una migración Flyway debe expresar y versionar esa misma regla. El laboratorio no demuestra el comportamiento de PostgreSQL ni de una política de borrado distinta.

**Cierra:** En el **proyecto integrador de RutaFlow**, registra en una nota breve: lado propietario, FK, operación que se propaga, regla de borrado y test que protege cada decisión. En el tema siguiente medirás cómo cargar asociaciones sin consultas inesperadas.

**Fuente primaria:** [Jakarta Persistence 3.2 API: `@OneToMany`](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/OneToMany.html) documenta `mappedBy`, cascadas y `orphanRemoval`; [la especificación](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2) define las reglas de propiedad de la relación.
### Tema 2: LAZY, EAGER, N+1 y consultas de caso de uso

**Meta:** medir qué pasa cuando una lista toca una asociación, reducir consultas sin cambiar el resultado y escoger una forma de carga según la pantalla.

**¿Por qué es importante?** Una página puede verse correcta con tres filas y volverse lenta con miles. Cada consulta adicional viaja a la base; traer entidades completas también consume memoria y puede duplicar filas.

**Evidencia final:** comparación medida entre carga normal y `@EntityGraph`, reproducción del límite de `LAZY` al cerrar el contexto, y una página de resumen que selecciona solo dos campos.

#### Subtema 16.5 · Cuenta las consultas que dispara la lista · 8 min

**Contexto:** `Pedido.cliente` es `LAZY`. Eso evita traer cada cliente sin pedirlo; si luego recorres todos los pedidos y lees su cliente, Hibernate puede hacer una consulta adicional por cliente.

**Hazlo tú:** Desde `examples/java-jpa-lab`, abre `src/test/java/academia/pedidos/PedidoJpaLabTest.java` y ejecuta:

```bash
./mvnw -Dtest=PedidoJpaLabTest#comparaNMasUnoConCargaPorEntityGraph test
```

El test inserta tres pedidos de tres clientes y cuenta sentencias con Hibernate Statistics:

```java
pedidos.findAll().forEach(pedido -> pedido.getCliente().getNombre());
long consultas = statistics.getPrepareStatementCount();
System.out.println("Consultas: " + consultas);
```

**Resultado esperado:** con la versión fijada en este laboratorio, se observa `N+1=4`: una consulta de pedidos y tres consultas de cliente. El número cambia con cantidad de clientes distintos, caché y proveedor.

**Fallo deliberado:** Comenta el acceso a `getNombre()` y corre el test. La comparación pierde la diferencia porque ya no se toca la asociación. **Diagnóstico:** el conteo vuelve a reflejar solo la consulta inicial. Restaura la línea.

**Entiende:** N+1 significa una consulta inicial más consultas provocadas al recorrer resultados. Si varios pedidos apuntan al mismo cliente, el contexto de persistencia puede reutilizarlo; cuenta asociaciones distintas y registra la configuración.

**Cierra:** Explica por qué mirar solo el SQL de `findAll()` no mostró el costo completo.

#### Subtema 16.6 · Pide el cliente que esta pantalla necesita · 8 min

**Contexto:** El listado de pedidos sí muestra el nombre del cliente. La consulta debe declararlo; activar `EAGER` en toda la entidad cambia otros casos de uso también.

**Hazlo tú:** En `src/main/java/academia/pedidos/PedidoRepository.java`, compara el método normal con esta consulta declarada:

```java
@EntityGraph(attributePaths = "cliente")
List<Pedido> findAllWithClienteByOrderByReferenciaAsc();
```

El test mide la misma lectura usando ese método y vuelve a leer el nombre:

```java
pedidos.findAllWithClienteByOrderByReferenciaAsc()
    .forEach(pedido -> pedido.getCliente().getNombre());
```

Repite el comando del subtema anterior.

**Resultado esperado:** en este laboratorio se observa `@EntityGraph=1`; la prueba exige que la estrategia reduzca las consultas frente a N+1. La anotación describe los datos necesarios para esta consulta, no el plan SQL exacto en todos los proveedores.

**Fallo deliberado:** Cambia temporalmente `attributePaths = "cliente"` por `attributePaths = "clientes"`. El test debe fallar al resolver una ruta que no existe. **Diagnóstico:** Spring Data indica que no encuentra el atributo `clientes` en `Pedido`. Restaura `cliente`.

**Entiende:** `@EntityGraph` permite declarar el grafo que este método requiere. JPA describe el resultado de carga; Hibernate elige cómo obtenerlo. Verifica SQL en tu versión cuando rendimiento y paginación importan.

**Cierra:** Escribe qué pantalla necesita el cliente y qué pantalla no debería cargarlo.

#### Subtema 16.7 · Reconoce el límite de LAZY y EAGER · 8 min

**Contexto:** Una relación `LAZY` puede consultarse mientras el contexto de persistencia sigue abierto. Si entregas una entidad con una asociación sin cargar y cierras ese contexto, ya no hay sesión que pueda buscarla.

**Hazlo tú:** Abre `examples/java-jpa-lab/src/test/java/academia/pedidos/PedidoJpaLabTest.java`. Ejecuta la prueba que escribe en un contexto, vuelve a leer en otro y cierra el segundo antes de tocar el cliente:

```bash
./mvnw -Dtest=PedidoJpaLabTest#accederRelacionLazyDespuesDeSepararLaEntidadFallaConDiagnosticoClaro test
```

**Resultado esperado:** el test espera `LazyInitializationException` al leer `pedido.getCliente().getNombre()` después de cerrar el EntityManager.

**Fallo deliberado:** Mueve la lectura de `getNombre()` antes de `lectura.close()`. La prueba deja de recibir la excepción; devuelve el acceso a después del cierre. **Diagnóstico:** el proxy sí pudo cargar la asociación mientras el EntityManager seguía abierto.

**Entiende:** JPA define `EAGER` como requisito de carga inmediata y `LAZY` como sugerencia que el proveedor puede cumplir. `ManyToOne` es EAGER por defecto; en este modelo se pidió LAZY. No soluciones el error cargando todo EAGER: crea una consulta o DTO para el caso de uso y construye la respuesta dentro de la transacción.

**Cierra:** Di en qué línea termina la sesión y qué dato debe salir ya preparado para la respuesta HTTP.

#### Subtema 16.8 · Pagina una vista pequeña con DTO · 10 min

**Contexto:** El resumen de pedidos solo presenta referencia y nombre. Cargar entidades completas y sus relaciones trae datos que la fila no muestra.

**Hazlo tú:** El laboratorio contiene `PedidoResumen`, un `record` con esos dos campos, y este método en `PedidoRepository`:

```java
@Query("select new academia.pedidos.PedidoResumen(p.referencia, p.cliente.nombre) "
    + "from Pedido p order by p.referencia")
Page<PedidoResumen> listarResumenes(Pageable pageable);
```

Ejecuta la prueba que solicita dos elementos de una página de tres:

```bash
./mvnw -Dtest=PedidoJpaLabTest#paginaResumenConSoloLasColumnasQueNecesitaLaLista test
```

**Resultado esperado:** la página contiene dos pares referencia/nombre, declara tres resultados totales y señala que hay otra página. Hibernate emite la consulta de datos y una consulta de conteo.

**Fallo deliberado:** Cambia `p.cliente.nombre` por `p.cliente.apellido` en el JPQL. La consulta falla porque `Cliente` no tiene ese atributo. **Diagnóstico:** Hibernate no puede resolver `apellido` en `Cliente`. Restaura `nombre`.

**Entiende:** Un DTO devuelve solo lo que consume la pantalla. `Page` también suele requerir contar resultados; si ese conteo pesa, evalúa `Slice` o una estrategia específica. Una página DTO evita paginar una colección cargada con `JOIN FETCH` y reduce columnas, pero mide el plan con datos representativos.

**Cierra:** En el proyecto integrador de RutaFlow, define una consulta resumida paginada y otra de detalle. Adjunta SQL, tamaño de página y campos elegidos. No presentes los conteos de H2 como una medición de producción.

**Fuentes primarias:** [Jakarta Persistence 3.2: `@ManyToOne` y estrategias de carga](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/ManyToOne.html); [Spring Data JPA: proyecciones](https://docs.spring.io/spring-data/jpa/reference/repositories/projections.html).
