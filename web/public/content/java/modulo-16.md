# Módulo 16: JPA, Hibernate y FetchType.LAZY vs EAGER

## Aprende construyendo

En este módulo vas a persistir un modelo pequeño de pedidos y medir las consultas que Hibernate ejecuta. La meta no es memorizar anotaciones: es decidir qué datos cargar para cada operación sin producir N+1, errores de sesión cerrada ni respuestas JSON cíclicas.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** dos clientes y tres pedidos en H2. Comprueba la clave foránea, carga los pedidos dentro de una transacción y compara el SQL de `LAZY` y `EAGER`.
- **Caso RutaFlow:** una pantalla paginada de envíos muestra referencia, estado y última parada. No serialices la entidad completa: crea una proyección DTO para el listado, una consulta de detalle con `@EntityGraph` y mide ambas con datos suficientes para que aparezca N+1.

La progresión importa: `EAGER` significa que la asociación debe estar disponible, no que Hibernate necesariamente use un `JOIN`. La evidencia del caso real es una prueba de integración con el número de filas y consultas observado, no solo una anotación en la entidad.

### Tema 1: Entidades y relaciones JPA

**Por qué importa:** el mapeo conecta objetos con filas; el lado propietario escribe la clave foránea.

#### Subtema 1.1: Guarda una relación de cliente y pedido · 10 min

**1. Contexto**

Un pedido debe conservar el ID de su cliente incluso después de cerrar el contexto Java.

**2. Hazlo tú**

Abre **examples/java-jpa-lab/src/main/java/academia/pedidos/Cliente.java** y **Pedido.java**. Ejecuta:

~~~bash
cd examples/java-jpa-lab
./mvnw -q -Dtest=PedidoJpaLabTest#guardaLosDosLadosYConsultaPorClienteConJpql test
~~~

**Resultado esperado:** la consulta ordena RT-101 y RT-102; la fila de pedido conserva cliente_id.

**Fallo deliberado:** comenta pedido.asignarCliente(this). **Diagnóstico:** Pedido tiene @JoinColumn y es dueño de la relación; sincroniza ambos lados del objeto.

**3. Entiende**

JPA define el contrato; Hibernate lo implementa. mappedBy indica el lado inverso.

**4. Cierra**

Guarda el test verde y el fallo.

#### Subtema 1.2: Protege la referencia obligatoria · 10 min

**1. Contexto**

Un pedido sin referencia no se debe guardar.

**2. Hazlo tú**

En **examples/java-jpa-lab/src/main/java/academia/pedidos/Pedido.java** agrega la validación de referencia y la restricción de columna requerida. Añade un caso válido y otro vacío en **src/test/java/academia/pedidos/PedidoJpaLabTest.java** y ejecuta ./mvnw -q test desde examples/java-jpa-lab.

**Resultado esperado:** la referencia vacía se rechaza y el pedido válido se persiste.

**Fallo deliberado:** valida solo en el controlador. **Diagnóstico:** una tarea o un test podría omitirlo; protege el modelo y la base.

**3. Entiende**

Validación de objeto y restricción SQL protegen partes distintas del flujo.

**4. Cierra**

Registra qué capa rechazó cada caso.

#### Subtema 1.3: Elige la cascada según historial · 10 min

**1. Contexto**

Al guardar cliente y pedidos nuevos, quieres persistir el agregado; al borrarlo, quizá debas conservar historial.

**2. Hazlo tú**

En **Cliente.java** cambia temporalmente CascadeType.PERSIST por CascadeType.ALL. Añade un test de borrado en **PedidoJpaLabTest.java** y ejecuta ./mvnw -q test.

**Resultado esperado:** el test revela cuáles operaciones se propagan al pedido.

**Fallo deliberado:** añade REMOVE solo para silenciar una excepción. **Diagnóstico:** decide si el historial debe borrarse, bloquear la operación o reasignarse.

**3. Entiende**

CascadeType propaga operaciones JPA; no equivale a ON DELETE de la base.

**4. Cierra**

Guarda el test y la política elegida. Fuente: [Jakarta Persistence](https://jakarta.ee/specifications/persistence/).

### Tema 2: FetchType.LAZY, EAGER y el problema N+1

**Por qué importa:** cada pedido puede disparar una consulta adicional al cargar su cliente.

#### Subtema 2.1: Accede a una relación lazy en su contexto · 10 min

**1. Contexto**

La pantalla necesita el nombre del cliente al presentar un pedido.

**2. Hazlo tú**

En **Pedido.java** conserva @ManyToOne(fetch = FetchType.LAZY). En **PedidoJpaLabTest.java** limpia el contexto con entityManager.clear() y lee pedido.getCliente().getNombre() dentro del test. Ejecuta ./mvnw -q test.

**Resultado esperado:** Hibernate carga la asociación mientras la transacción está activa.

**Fallo deliberado:** mueve el acceso después del cierre de sesión. **Diagnóstico:** consulta dentro de la transacción o devuelve un DTO con los campos necesarios.

**3. Entiende**

LAZY aplaza la carga; no mantiene viva una sesión cerrada.

**4. Cierra**

Conserva la prueba dentro y fuera del contexto.

#### Subtema 2.2: Cuenta las consultas N+1 · 10 min

**1. Contexto**

Un listado carga N pedidos y luego consulta cada cliente por separado.

**2. Hazlo tú**

En **examples/java-jpa-lab/src/test/java/academia/pedidos/PedidoJpaLabTest.java**, ejecuta `./mvnw -q -Dtest=PedidoJpaLabTest#comparaNMasUnoConCargaPorEntityGraph test` desde examples/java-jpa-lab y observa Hibernate Statistics.

**Resultado esperado:** N+1 produce más sentencias que la lectura con EntityGraph.

**Fallo deliberado:** prueba con un único pedido. **Diagnóstico:** usa varias filas representativas para hacer visible el crecimiento de consultas.

**3. Entiende**

N+1 combina una consulta inicial con consultas repetidas por resultado relacionado.

**4. Cierra**

Guarda el contador de ambos caminos.

#### Subtema 2.3: Elige datos para cada pantalla · 10 min

**1. Contexto**

El listado necesita referencia y estado; el detalle muestra también el cliente.

**2. Hazlo tú**

Compara findAll y findAllWithClienteByOrderByReferenciaAsc en **PedidoRepository.java**. Añade una proyección para listado y ejecuta ./mvnw -q test.

**Resultado esperado:** cada operación carga los campos que muestra.

**Fallo deliberado:** cambia todo a EAGER. **Diagnóstico:** EAGER no garantiza JOIN; vuelve a contar sentencias y usa un fetch plan por caso.

**3. Entiende**

La consulta y su fetch plan se eligen según la operación, no para toda la aplicación.

**4. Cierra**

Anota campos de listado y de detalle.

### Tema 3: Relaciones uno a uno, muchos a muchos y herencia

**Por qué importa:** cardinalidad y herencia cambian claves, restricciones y consultas.

#### Subtema 3.1: Impide dos perfiles para el mismo cliente · 10 min

**1. Contexto**

Un cliente tiene como máximo un perfil de entrega.

**2. Hazlo tú**

Crea **examples/java-jpa-lab/src/main/java/academia/pedidos/PerfilEntrega.java** con @OneToOne y una clave cliente_id con restricción única. Agrega test de unicidad en **PedidoJpaLabTest.java** y ejecuta ./mvnw -q test.

**Resultado esperado:** la base rechaza el segundo perfil para el mismo cliente.

**Fallo deliberado:** quita la unicidad. **Diagnóstico:** la anotación Java no reemplaza la restricción del esquema.

**3. Entiende**

Uno-a-uno necesita una clave foránea y garantía única.

**4. Cierra**

Guarda el test que intenta duplicar el perfil.

#### Subtema 3.2: Modela una línea como entidad · 10 min

**1. Contexto**

Una línea de pedido guarda producto, cantidad y precio acordado.

**2. Hazlo tú**

Crea **LineaPedido.java** con asociaciones ManyToOne a Pedido y Producto, además de cantidad y precioUnitario. Añade una prueba con dos líneas a un pedido y ejecuta ./mvnw -q test.

**Resultado esperado:** cantidad y precio se guardan en la relación entre pedido y producto.

**Fallo deliberado:** usa ManyToMany directo y busca dónde guardar cantidad. **Diagnóstico:** convierte la relación en entidad de asociación con sus propios datos.

**3. Entiende**

ManyToMany simple sirve si la tabla intermedia no tiene información de negocio.

**4. Cierra**

Guarda el pedido y sus dos líneas.

#### Subtema 3.3: Inspecciona una estrategia de herencia · 10 min

**1. Contexto**

Envío nacional e internacional comparten referencia, pero tienen datos específicos.

**2. Hazlo tú**

Crea **src/main/java/academia/pedidos/Envio.java** y dos subclases; prueba SINGLE_TABLE con discriminador y consulta las filas en un test JPA. Ejecuta `./mvnw -q test`.

**Resultado esperado:** ambas variantes se leen desde la tabla común y el discriminador distingue su tipo.

**Fallo deliberado:** elige la estrategia antes de revisar consultas y columnas. **Diagnóstico:** compara SINGLE_TABLE, JOINED y TABLE_PER_CLASS con el esquema que necesita el caso.

**3. Entiende**

Cada estrategia intercambia joins, columnas nulas y costo de consultas.

**4. Cierra**

Guarda la consulta y el criterio de elección. Fuente: [Jakarta Persistence](https://jakarta.ee/specifications/persistence/).

### Tema 4: Ciclo de vida, EntityManager y consultas tipadas

**Por qué importa:** el estado administrado determina si JPA detecta un cambio.

#### Subtema 4.1: Separa flush de clear · 10 min

**1. Contexto**

Quieres comprobar datos escritos en la base, no un objeto todavía guardado en memoria.

**2. Hazlo tú**

En **PedidoJpaLabTest.java** guarda un cliente, llama flush(), luego clear() y vuelve a buscarlo. Ejecuta `./mvnw -q -Dtest=PedidoJpaLabTest#guardaLosDosLadosYConsultaPorClienteConJpql test`.

**Resultado esperado:** find reconstruye las entidades a partir de la base de prueba.

**Fallo deliberado:** asume que persist() ya ejecutó SQL. **Diagnóstico:** JPA puede diferir escrituras; flush sincroniza el contexto.

**3. Entiende**

persist administra, flush sincroniza, clear separa las instancias del contexto.

**4. Cierra**

Anota el estado del objeto después de cada llamada.

#### Subtema 4.2: Consulta entidades con JPQL · 10 min

**1. Contexto**

Operaciones lista pedidos por cliente en orden de referencia.

**2. Hazlo tú**

En **PedidoRepository.java** revisa listarPorCliente y la consulta select p from Pedido p where p.cliente.id = :clienteId order by p.referencia. Ejecuta `./mvnw -q -Dtest=PedidoJpaLabTest#guardaLosDosLadosYConsultaPorClienteConJpql test`.

**Resultado esperado:** devuelve RT-101 y RT-102 en ese orden.

**Fallo deliberado:** usa el nombre SQL de la tabla dentro de JPQL. **Diagnóstico:** JPQL consulta entidades y atributos Java.

**3. Entiende**

Hibernate traduce JPQL al SQL correspondiente al dialecto de base.

**4. Cierra**

Guarda la consulta y el resultado.

#### Subtema 4.3: Reconoce una entidad separada · 10 min

**1. Contexto**

Editar un objeto desconectado no actualiza automáticamente su fila.

**2. Hazlo tú**

En **Pedido.java** agrega un método de dominio cambiarReferencia(String valor). En **PedidoJpaLabTest.java** persiste un pedido, llama entityManager.clear(), cambia la referencia del objeto separado con ese método y vuelve a consultar. Ejecuta ./mvnw -q test.

**Resultado esperado:** la base conserva el dato anterior porque esa instancia ya no está administrada.

**Fallo deliberado:** espera que cualquier objeto Java modificado se guarde. **Diagnóstico:** modifica una entidad administrada dentro de una transacción o evalúa merge con su semántica.

**3. Entiende**

Los estados son nuevo, administrado, separado y eliminado.

**4. Cierra**

Anota en qué estado está cada referencia. Fuente: [EntityManager y Jakarta Persistence](https://jakarta.ee/specifications/persistence/).

### Tema 5: Búsquedas dinámicas con Criteria y Querydsl

**Por qué importa:** filtros combinables requieren consultas seguras y mantenibles.

#### Subtema 5.1: Busca por prefijo con Criteria · 10 min

**1. Contexto**

Operaciones quiere encontrar guías cuya referencia comience con RT-.

**2. Hazlo tú**

Abre **examples/java-jpa-lab/src/main/java/academia/pedidos/BusquedaPedido.java** y ejecuta `./mvnw -q -Dtest=PedidoJpaLabTest#entityGraphCargaClienteYCriteriaBuscaPorPrefijo test` desde examples/java-jpa-lab.

**Resultado esperado:** el resultado incluye RT-201 y excluye OT-202.

**Fallo deliberado:** concatena entrada en una cadena JPQL. **Diagnóstico:** usa parámetros ligados o Criteria para separar el valor.

**3. Entiende**

Criteria construye predicados desde la API; es verboso, pero facilita condiciones combinables.

**4. Cierra**

Guarda la salida para prefijo RT- y OT-.

#### Subtema 5.2: Combina filtros opcionales · 10 min

**1. Contexto**

La pantalla permite combinar prefijo y estado; ambos filtros pueden faltar.

**2. Hazlo tú**

En **BusquedaPedido.java** agrega dos filtros opcionales y reúne en una lista solo los Predicate presentes. Añade tests sin filtros y con ambos; ejecuta ./mvnw -q test.

**Resultado esperado:** cada combinación devuelve solo las filas correspondientes.

**Fallo deliberado:** trata una cadena vacía como todas las condiciones. **Diagnóstico:** omite el predicado si ese filtro no se solicitó.

**3. Entiende**

Consulta SQL generada y plan de ejecución cuando el filtro deja de ser pequeño.

**4. Cierra**

Guarda dos combinaciones y su resultado.

#### Subtema 5.3: Prueba Querydsl con Jakarta · 10 min

**1. Contexto**

El equipo quiere consultas legibles con campos revisados por compilador.

**2. Hazlo tú**

En **examples/java-jpa-lab/pom.xml** agrega Querydsl JPA para Jakarta y su procesador, según la guía oficial. Genera Q-types, escribe la consulta de prefijo equivalente a Criteria y ejecuta ./mvnw -q test.

**Resultado esperado:** ambas consultas producen las mismas referencias.

**Fallo deliberado:** copia artefactos antiguos que importan javax.persistence. **Diagnóstico:** elige la variante Jakarta y revisa imports generados.

**3. Entiende**

Querydsl agrega generación de código; úsalo si compensa su costo de configuración.

**4. Cierra**

Registra versión, imports y resultados comparados. Fuente: [Querydsl](https://querydsl.com/).

### Tema 6: EntityGraph y cachés de persistencia

**Por qué importa:** el fetch plan selecciona asociaciones por operación; caché requiere medir y controlar consistencia.

#### Subtema 6.1: Carga detalle con EntityGraph · 10 min

**1. Contexto**

La vista de pedido necesita mostrar el nombre del cliente.

**2. Hazlo tú**

En **examples/java-jpa-lab/src/main/java/academia/pedidos/PedidoRepository.java** revisa @EntityGraph(attributePaths = "cliente"). Ejecuta `./mvnw -q -Dtest=PedidoJpaLabTest#entityGraphCargaClienteYCriteriaBuscaPorPrefijo test` y `./mvnw -q -Dtest=PedidoJpaLabTest#comparaNMasUnoConCargaPorEntityGraph test` desde examples/java-jpa-lab.

**Resultado esperado:** aparece el cliente y la ruta de detalle reduce consultas observadas.

**Fallo deliberado:** serializa la entidad completa. **Diagnóstico:** expón DTO para evitar ciclos y controlar datos cargados.

**3. Entiende**

EntityGraph expresa asociaciones requeridas; el SQL concreto depende del proveedor.

**4. Cierra**

Guarda consultas y contador antes/después.

#### Subtema 6.2: Observa el caché de primer nivel · 10 min

**1. Contexto**

Dos búsquedas del mismo ID ocurren dentro del mismo EntityManager.

**2. Hazlo tú**

En **PedidoJpaLabTest.java** llama dos veces find para el mismo pedido, compara identidad, llama clear() y busca de nuevo. Ejecuta ./mvnw -q test.

**Resultado esperado:** dentro del mismo contexto se reutiliza instancia; después de clear se carga otra.

**Fallo deliberado:** llamarlo caché distribuido. **Diagnóstico:** el primer nivel vive en el EntityManager y no coordina procesos.

**3. Entiende**

El contexto conserva una identidad por entidad e ID durante la unidad de trabajo.

**4. Cierra**

Guarda la comparación antes y después de clear().

#### Subtema 6.3: Mide antes de activar caché de segundo nivel · 10 min

**1. Contexto**

El catálogo puede leerse muchas veces, pero una tarifa mutable puede quedar obsoleta.

**2. Hazlo tú**

En **examples/java-jpa-lab/pom.xml** habilita un proveedor de caché compatible con la versión fijada de Spring/Hibernate; marca solo el catálogo como cacheable y compara lecturas desde dos EntityManager. Ejecuta ./mvnw -q test.

**Resultado esperado:** la medición indica si se evita SQL bajo esa configuración.

**Fallo deliberado:** asume que la anotación habilita una caché compartida. **Diagnóstico:** comprueba proveedor, estrategia, invalidación y estadísticas.

**3. Entiende**

Caché de segundo nivel es opcional y necesita política de consistencia.

**4. Cierra**

Guarda medición y decisión.

### Tema 7: Concurrencia, transacciones y propagación

**Por qué importa:** dos operadores pueden cambiar el mismo envío; el sistema debe detectar conflicto y decidir rollback.

#### Subtema 7.1: Detecta una actualización perdida · 10 min

**1. Contexto**

Dos transacciones cargan el mismo pedido y guardan cambios.

**2. Hazlo tú**

En **examples/java-jpa-lab/src/main/java/academia/pedidos/Pedido.java** revisa @Version; crea un test que cargue dos instancias, guarde la primera y después la segunda. Ejecuta ./mvnw -q test.

**Resultado esperado:** la segunda escritura detecta una versión obsoleta.

**Fallo deliberado:** quita @Version. **Diagnóstico:** el cambio puede sobrescribirse sin aviso; restaura control optimista.

**3. Entiende**

La versión se compara al confirmar y detecta conflicto sin mantener lock durante toda la edición.

**4. Cierra**

Guarda versión inicial y conflicto.

#### Subtema 7.2: Revierte un agregado completo · 10 min

**1. Contexto**

Cabecera y líneas del pedido deben persistir juntas.

**2. Hazlo tú**

Crea **CrearPedido.java** con un método @Transactional que guarde cabecera y líneas. Añade test que lance error entre ambas y ejecuta ./mvnw -q test.

**Resultado esperado:** al fallar, ninguna parte queda confirmada.

**Fallo deliberado:** captura el error y devuelve éxito. **Diagnóstico:** la transacción puede confirmar; propaga el error o marca rollback.

**3. Entiende**

El límite transaccional define qué operaciones forman una unidad.

**4. Cierra**

Cuenta filas en caso exitoso y fallido.

#### Subtema 7.3: Compara lock optimista y pesimista · 10 min

**1. Contexto**

Inventario con alta contención puede necesitar bloquear una fila mientras se reserva.

**2. Hazlo tú**

Crea **InventarioRepository.java** con consulta @Lock(LockModeType.PESSIMISTIC_WRITE) dentro de transacción. Compara resultado con @Version y ejecuta ./mvnw -q test.

**Resultado esperado:** puedes explicar si se detecta conflicto al guardar o se espera por lock.

**Fallo deliberado:** bloquea toda consulta. **Diagnóstico:** un lock prolongado reduce concurrencia y puede causar esperas; úsalo solo si el caso y el motor lo justifican.

**3. Entiende**

Optimista valida al confirmar; pesimista bloquea durante operación.

**4. Cierra**

Guarda prueba y decisión. Fuente: [Jakarta Persistence](https://jakarta.ee/specifications/persistence/).

### Tema 8: Migraciones y pruebas JPA con Testcontainers

**Por qué importa:** el esquema de producción debe cambiar con migraciones rastreables y pruebas del motor real.

#### Subtema 8.1: Versiona un cambio de esquema · 10 min

**1. Contexto**

Añadir estado al pedido no debería depender de Hibernate recreando la tabla al iniciar.

**2. Hazlo tú**

Crea V1__crear_tablas.sql y V2__agregar_estado_pedido.sql bajo **examples/java-jpa-lab/src/main/resources/db/migration/**. Configura Flyway en **examples/java-jpa-lab/pom.xml** y ejecuta `./mvnw -q test` desde examples/java-jpa-lab.

**Resultado esperado:** se aplican migraciones en orden y el log informa las versiones.

**Fallo deliberado:** edita V1 tras aplicarla. **Diagnóstico:** Flyway detecta checksum distinto; agrega V3 correctiva.

**3. Entiende**

Migraciones versionadas hacen el cambio revisable; ddl-auto no sustituye historial del esquema productivo.

**4. Cierra**

Guarda el log y secuencia de migraciones.

#### Subtema 8.2: Ejecuta integración contra PostgreSQL · 10 min

**1. Contexto**

H2 puede aceptar SQL que el motor de producción interpreta distinto.

**2. Hazlo tú**

En **examples/java-jpa-lab/pom.xml** fija Flyway mediante el BOM de Spring Boot 4.1.2, agrega org.flywaydb:flyway-database-postgresql, org.postgresql:postgresql:42.7.14 y org.testcontainers:testcontainers-junit-jupiter:2.0.5 y testcontainers-postgresql:2.0.5 en scope test. Crea **src/test/java/academia/pedidos/PedidoPostgresTest.java** con @Testcontainers y PostgreSQLContainer<>("postgres:17.11-alpine3.24"). Ejecuta ./mvnw -q -Dtest=PedidoPostgresTest test con Docker activo.

**Resultado esperado:** migraciones y repositorio corren contra PostgreSQL desechable.

**Fallo deliberado:** usa postgres:latest. **Diagnóstico:** fija imagen/version para impedir cambios silenciosos del motor.

**3. Entiende**

H2 sirve para práctica rápida; Testcontainers comprueba compatibilidad con un motor real.

**4. Cierra**

Guarda imagen, salida de migración y resultado. Fuente: [Testcontainers PostgreSQL](https://java.testcontainers.org/modules/databases/postgres/).

#### Subtema 8.3: Comprueba rollback fuera del contexto viejo · 10 min

**1. Contexto**

Un fallo en una línea no debe dejar la cabecera del pedido a medias.

**2. Hazlo tú**

En **PedidoPostgresTest.java**, fuerza una excepción tras guardar cabecera y antes de completar líneas; abre una transacción nueva para consultar y ejecuta ./mvnw -q -Dtest=PedidoPostgresTest test.

**Resultado esperado:** PostgreSQL confirma que la transacción revirtió el agregado.

**Fallo deliberado:** consulta con el mismo EntityManager que retiene la entidad. **Diagnóstico:** limpia el contexto o lee en otra transacción para ver lo que quedó almacenado.

**3. Entiende**

La prueba del motor real verifica SQL y rollback del proveedor, no solo objetos en memoria.

**4. Cierra**

Guarda migración, error y consulta de comprobación.

---
