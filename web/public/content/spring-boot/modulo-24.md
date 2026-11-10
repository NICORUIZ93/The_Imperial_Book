# Módulo 24: Spring GraphQL: contrato, datos anidados y cambios

## Aprende construyendo

El laboratorio fija Java 25 y Spring Boot 4.1.2. Todas las pruebas pasan por el schema y los resolvers reales con ExecutionGraphQlServiceTester. Los datos están en memoria y no hay autenticación; es un laboratorio local, no un backend listo para publicar. HTTP y WebSocket se verifican por separado del servicio GraphQL.

### Tema 1: schema-first con tipos y consultas

**Meta:** consultar una entrega declarada en el schema y observar el rechazo de un campo inexistente.

**¿Por qué es importante?** El cliente elige campos del contrato público, sin acceso libre a la base del servidor.

**Prerrequisitos:** M2, DTOs, JSON y HTTP. Duración: 30–40 min.

**Preparación:** JDK 25 y el repositorio. Desde su raíz copia `examples/spring-graphql-rutaflow` a una carpeta nueva, entra y ejecuta el wrapper incluido:

```bash
cp -R examples/spring-graphql-rutaflow practica-m24-t1
cd practica-m24-t1
./mvnw -q test
```

**Analogía:** el schema es un menú: elegir un plato permitido no concede acceso a la cocina. Los permisos siguen siendo responsabilidad del servidor.

#### Subtema 24.1.1 · Lee el contrato antes del resolver · 10 min

**Contexto:** Query declara entrega(id) y su retorno puede ser null.

**Hazlo tú:** Abre `src/main/resources/graphql/schema.graphqls` y `src/main/java/academia/rutaflow/graphql/EntregaController.java`. Sigue Query.entrega hasta @QueryMapping.

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#consultaValidaYRechazaCampoInexistente test
```

**Resultado esperado:** ENV-1 tiene estado CREADA; el test también comprueba un campo inválido.

**Fallo deliberado:** Quita estado del tipo Entrega en el schema y repite.

**Diagnóstico:** la consulta ya no cumple el contrato; GraphQL rechaza el campo. Restaura el schema.

**Entiende:** Schema-first fija tipos y operaciones; el resolver devuelve un objeto que aporta los datos. Que un campo exista no demuestra autorización de lectura.

**Cierra:** Guarda consulta, campo elegido y respuesta del test.

#### Subtema 24.1.2 · Solicita un campo que no existe · 10 min

**Contexto:** El motor valida la operación antes de resolver datos.

**Hazlo tú:** Abre `src/test/java/academia/rutaflow/graphql/EntregaGraphqlTest.java` y localiza la consulta con secreto. Revisa que la prueba exige errores.

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#consultaValidaYRechazaCampoInexistente test
```

**Resultado esperado:** El campo secreto provoca un error de validación; no se añade al DTO por petición del cliente.

**Fallo deliberado:** Cambia la consulta inválida para pedir id, dejando la aserción de error.

**Diagnóstico:** la consulta ahora es válida y la expectativa de errores falla; restaura secreto para conservar el caso negativo.

**Entiende:** Un error GraphQL no se deduce solo del status HTTP. Examina data y errors según el transporte que ejecutes.

**Cierra:** Distingue un error de schema de una entrega inexistente.

#### Subtema 24.1.3 · Define el contrato de ausencia · 10 min

**Contexto:** Un ID desconocido puede devolver null porque entrega no lleva !.

**Hazlo tú:** Lee `idAusenteEsNullYEstadoInvalidoEsError` en `src/test/java/academia/rutaflow/graphql/EntregaGraphqlTest.java` y consulta NO-EXISTE.

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#idAusenteEsNullYEstadoInvalidoEsError test
```

**Resultado esperado:** entrega es null; la misma prueba distingue una mutación con estado inválido.

**Fallo deliberado:** Cambia el retorno de entrega a Entrega! en el schema sin cambiar el comportamiento para ID ausente.

**Diagnóstico:** la ausencia pasa a violar no-null y produce errores; restaura el contrato nullable o diseña un error deliberado con nuevas pruebas.

**Entiende:** Nullabilidad describe qué puede faltar; no reemplaza reglas de negocio ni es una política de seguridad.

**Cierra:** Guarda la decisión de null para ausencia y anota cuándo elegirías un error explícito.

**Práctica independiente:** Añade una entrega ficticia y una prueba que consulte solo su id. Después modifica un campo interno y comprueba que no aparece si no forma parte del schema.

**Hito del tema:** conserva el resultado ejecutado, el fallo diagnosticado y restaurado, una explicación propia del mecanismo y tu ejercicio independiente. En el proyecto integrador RutaFlow aplica la decisión solo cuando puedas justificar su alcance. La suite del laboratorio no acredita un despliegue productivo ni la resolución de tu ejercicio.

**Fuente primaria:** [Spring GraphQL: controladores anotados](https://docs.spring.io/spring-graphql/reference/controllers.html)

### Tema 2: data fetchers, relaciones y problema N+1

**Meta:** resolver conductores de dos entregas mediante una sola invocación batch observada.

**¿Por qué es importante?** Un resolver por fila puede multiplicar llamadas al origen aunque la consulta del cliente parezca pequeña.

**Prerrequisitos:** M24 T1 y colecciones Java. Duración: 30–40 min.

**Preparación:** JDK 25 y el repositorio. Desde su raíz copia `examples/spring-graphql-rutaflow` a una carpeta nueva, entra y ejecuta el wrapper incluido:

```bash
cp -R examples/spring-graphql-rutaflow practica-m24-t2
cd practica-m24-t2
./mvnw -q test
```

**Analogía:** reunir dos solicitudes al mismo mostrador evita dos viajes; sigue siendo necesario medir el coste real del mostrador.

#### Subtema 24.2.1 · Pide datos anidados · 10 min

**Contexto:** Cada Entrega declara conductor, que se resuelve por separado de id y estado.

**Hazlo tú:** Abre `src/main/java/academia/rutaflow/graphql/EntregaController.java` y sigue el método conductores anotado @BatchMapping(typeName="Entrega", field="conductor").

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#batchResuelveDosEntregasEnUnaInvocacion test
```

**Resultado esperado:** Dos entregas reciben conductor Ana y el contador consultasEnLote queda en 1.

**Fallo deliberado:** Cambia field a conductorEquivocado.

**Diagnóstico:** el mapping ya no coincide con el schema; la consulta no obtiene el conductor no-null esperado. Restaura conductor.

**Entiende:** El resolver batch recibe una lista de padres y devuelve un Map que vincula cada padre con su resultado. Aquí el origen es memoria, no SQL.

**Cierra:** Conserva los dos nombres y el conteo de una invocación.

#### Subtema 24.2.2 · Relaciona cada resultado con su padre · 10 min

**Contexto:** El batch necesita una asociación correcta, no solo una lista de conductores.

**Hazlo tú:** En `src/main/java/academia/rutaflow/graphql/EntregaController.java`, localiza resultado.put(e, new Conductor(...)). Relaciónalo con el record Entrega.

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#batchResuelveDosEntregasEnUnaInvocacion test
```

**Resultado esperado:** Cada padre del resultado recibe el conductor definido por el adaptador de demostración.

**Fallo deliberado:** Devuelve un Map vacío desde conductores.

**Diagnóstico:** conductor es obligatorio en el schema; faltan valores y la consulta produce errores. Restaura el mapa.

**Entiende:** El contrato no demuestra por sí solo que el conductor pertenece a la empresa o que la asignación es vigente. Un repositorio real debe aplicar esas restricciones.

**Cierra:** Dibuja dos padres y las claves que enlazan sus resultados.

#### Subtema 24.2.3 · Mide la frontera correcta · 10 min

**Contexto:** Una invocación del batch no equivale automáticamente a una consulta SQL.

**Hazlo tú:** Abre `src/test/java/academia/rutaflow/graphql/EntregaGraphqlTest.java` y `src/main/java/academia/rutaflow/graphql/EntregaController.java`, ubica lotes.incrementAndGet y la aserción de contador.

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#batchResuelveDosEntregasEnUnaInvocacion test
```

**Resultado esperado:** El contador observa la invocación Java, sin base de datos ni medición de latencia.

**Fallo deliberado:** Incrementa el contador dentro del bucle en lugar de una vez por lote.

**Diagnóstico:** la expectativa cambia de 1 a 2 aunque el mapping siga siendo batch; restaura el contador para medir invocaciones.

**Entiende:** Para medir N+1 SQL necesitas un repositorio y un contador de consultas del motor/proveedor. Limita también profundidad, tamaño y autorización de la consulta GraphQL.

**Cierra:** Escribe qué mide el test y qué experimento falta para afirmar una reducción SQL.

**Práctica independiente:** Asigna dos conductores distintos en memoria, conserva el batch y demuestra la correspondencia de cada entrega. Después diseña el test SQL que necesitarías antes de publicar una cifra de rendimiento.

**Hito del tema:** conserva el resultado ejecutado, el fallo diagnosticado y restaurado, una explicación propia del mecanismo y tu ejercicio independiente. En el proyecto integrador RutaFlow aplica la decisión solo cuando puedas justificar su alcance. La suite del laboratorio no acredita un despliegue productivo ni la resolución de tu ejercicio.

**Fuente primaria:** [Spring GraphQL: BatchMapping](https://docs.spring.io/spring-graphql/reference/controllers.html#controllers.batch-mapping)


**Aplicación y decisión:** Límite de la demostración N+1: el contador mide llamadas al método batch, no consultas SQL ni tiempo ahorrado. Mantén autorización por empresa y mide el repositorio real antes de convertir ese conteo en una recomendación de rendimiento.

### Tema 3: mutations y subscriptions

**Meta:** cambiar un estado permitido y recibir el cambio a través de una suscripción local.

**¿Por qué es importante?** Actualizar datos y avisar de cambios tienen garantías distintas; una señal en memoria puede perderse.

**Prerrequisitos:** M24 T1, Flux y pruebas Reactor. Duración: 30–40 min.

**Preparación:** JDK 25 y el repositorio. Desde su raíz copia `examples/spring-graphql-rutaflow` a una carpeta nueva, entra y ejecuta el wrapper incluido:

```bash
cp -R examples/spring-graphql-rutaflow practica-m24-t3
cd practica-m24-t3
./mvnw -q test
```

**Analogía:** la mutación cambia la pizarra y la suscripción escucha el aviso; quien llega después puede no haber oído lo anterior.

#### Subtema 24.3.1 · Valida la transición · 10 min

**Contexto:** cambiarEstado permite EN_RUTA y rechaza otros valores en el laboratorio.

**Hazlo tú:** Abre `src/main/java/academia/rutaflow/graphql/EntregaController.java` y localiza @MutationMapping, la validación y el guardado en datos.

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#idAusenteEsNullYEstadoInvalidoEsError test
```

**Resultado esperado:** INVENTADO provoca un error y no se trata como un estado permitido.

**Fallo deliberado:** Elimina la comprobación de EN_RUTA.

**Diagnóstico:** el valor inventado se acepta y la aserción que exige errores falla; restaura la regla.

**Entiende:** Es una regla mínima didáctica; una máquina de estados real debe comprobar estado previo, autorización y concurrencia.

**Cierra:** Guarda el caso rechazado y explica dónde deben vivir reglas del dominio real.

#### Subtema 24.3.2 · Suscríbete antes de producir el cambio · 10 min

**Contexto:** El test registra el consumidor antes de invocar la mutación.

**Hazlo tú:** Abre `src/test/java/academia/rutaflow/graphql/EntregaGraphqlTest.java` y sigue StepVerifier.create, then, assertNext y thenCancel.

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#mutacionEmiteCambioALaSuscripcionLocal test
```

**Resultado esperado:** La mutación devuelve EN_RUTA y el flujo recibe un elemento con ese estado; el test cancela y termina.

**Fallo deliberado:** Omite cambios.tryEmitNext(nueva) en el controller.

**Diagnóstico:** la mutación puede pasar pero el flujo no recibe el evento y vence el límite de cinco segundos; restaura emisión.

**Entiende:** El timeout es una protección de la prueba. No demuestra entrega WebSocket, persistencia ni recuperación de un evento perdido.

**Cierra:** Conserva resultado de mutación y evento observado por separado.

#### Subtema 24.3.3 · Declara límites del transporte y la emisión · 10 min

**Contexto:** ExecutionGraphQlServiceTester ejecuta el servicio sin cliente de red.

**Hazlo tú:** Abre `pom.xml`, `src/main/java/academia/rutaflow/graphql/EntregaController.java` y `src/test/java/academia/rutaflow/graphql/EntregaGraphqlTest.java`. Identifica el Sinks en memoria y la ausencia de cliente WebSocket.

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#mutacionEmiteCambioALaSuscripcionLocal test
```

**Resultado esperado:** La evidencia corresponde a una suscripción local del servicio GraphQL.

**Fallo deliberado:** Escribe que este test verificó reconexión WebSocket tras reinicio.

**Diagnóstico:** no se abrió ese transporte ni se reinició el proceso; corrige la conclusión y diseña otro experimento.

**Entiende:** tryEmitNext devuelve un resultado de emisión; ignorarlo no garantiza recepción del cliente. Este laboratorio no asegura backpressure bajo carga ni replay.

**Cierra:** Documenta qué ocurriría si no hay suscriptores o si falla la emisión antes de integrar notificaciones reales.

**Práctica independiente:** Añade comprobación del resultado de emisión y una prueba del comportamiento elegido ante falta de suscriptores. Define por separado qué historial se recupera después de una reconexión; no lo prometas con un Sink local.

**Hito del tema:** conserva el resultado ejecutado, el fallo diagnosticado y restaurado, una explicación propia del mecanismo y tu ejercicio independiente. En el proyecto integrador RutaFlow aplica la decisión solo cuando puedas justificar su alcance. La suite del laboratorio no acredita un despliegue productivo ni la resolución de tu ejercicio.

**Fuente primaria:** [Spring GraphQL: subscriptions y controladores](https://docs.spring.io/spring-graphql/reference/controllers.html)

### Tema 4: pruebas GraphQL con GraphQlTester

**Meta:** conservar casos positivos y negativos del contrato y distinguir ejecución directa de HTTP.

**¿Por qué es importante?** Un test del servicio no detecta por sí solo una URL HTTP incorrecta, CORS o negociación WebSocket.

**Prerrequisitos:** M6 y M24 T1–T3. Duración: 30–40 min.

**Preparación:** JDK 25 y el repositorio. Desde su raíz copia `examples/spring-graphql-rutaflow` a una carpeta nueva, entra y ejecuta el wrapper incluido:

```bash
cp -R examples/spring-graphql-rutaflow practica-m24-t4
cd practica-m24-t4
./mvnw -q test
```

**Analogía:** el mismo pedido puede probarse en la cocina o entregarse por mensajero; el ensayo de cocina no verifica el trayecto.

#### Subtema 24.4.1 · Ejecuta la matriz del servicio · 10 min

**Contexto:** La clase contiene consulta, campo inválido, batch, cambio, suscripción y ausencia.

**Hazlo tú:** Abre `src/test/java/academia/rutaflow/graphql/EntregaGraphqlTest.java` y registra qué assert protege cada comportamiento.

```bash
./mvnw -q clean test
```

**Resultado esperado:** Cuatro métodos correctos con múltiples aserciones; no son cuatro transportes probados.

**Fallo deliberado:** Quita un campo consultado del schema y ejecuta toda la clase.

**Diagnóstico:** falla el contrato antes o durante resolución según el campo; restaura y conserva la suite verde.

**Entiende:** ExecutionGraphQlServiceTester evita variabilidad de red para aislar schema y resolvers. Los límites de ese aislamiento deben constar en el informe.

**Cierra:** Guarda los cuatro nombres de test y la garantía de cada uno.

#### Subtema 24.4.2 · Comprueba HTTP como otra capa · 10 min

**Contexto:** El starter webmvc expone /graphql cuando la app arranca.

**Hazlo tú:** Desde esta carpeta ejecuta `./mvnw spring-boot:run`; en otra terminal envía el comando siguiente. Revisa `src/main/resources/graphql/schema.graphqls`.

```bash
curl -s http://localhost:8080/graphql -H 'Content-Type: application/json' -d '{"query":"{ entrega(id: \"ENV-1\") { id estado } }"}'
```

**Resultado esperado:** El JSON HTTP contiene data.entrega.id y estado CREADA en una instancia recién iniciada. Detén la aplicación con Ctrl+C al terminar.

**Fallo deliberado:** Solicita /graphql-equivocado en lugar de /graphql.

**Diagnóstico:** la ruta HTTP no existe aunque la suite de servicio pueda pasar; restaura la URL.

**Entiende:** La prueba HTTP añade servidor, ruta y serialización de transporte. No se añaden automáticamente autenticación, TLS o prueba de navegador.

**Cierra:** Conserva URL, petición y cuerpo recibido; diferencia errores HTTP de la lista errors GraphQL.

#### Subtema 24.4.3 · Cierra con errores y alcance explícitos · 10 min

**Contexto:** Un backend local sin seguridad no debe confundirse con la API productiva del proyecto.

**Hazlo tú:** Abre `README.md` del laboratorio y crea `docs/evidencia-graphql.md` con columnas servicio, HTTP, WebSocket, autorización y durabilidad.

```bash
./mvnw -q test
```

**Resultado esperado:** Puedes marcar servicio cuando la suite pasa y HTTP solo si ejecutaste la petición; las otras columnas quedan sin acreditar hasta sus pruebas específicas.

**Fallo deliberado:** Marca WebSocket como probado basándote únicamente en el test de servicio.

**Diagnóstico:** el tester utilizado no negocia WebSocket; corrige el alcance y anota el cliente y escenario que faltan.

**Entiende:** El siguiente incremento productivo requiere autorización por recurso, validación, límites de consulta, persistencia y política de errores. No se implementan por completar este tema.

**Cierra:** Entrega tu matriz con evidencia concreta y pendientes, sin confundir porcentaje editorial con cobertura de producción.

**Práctica independiente:** Añade un test negativo de permiso en el servicio de dominio antes de incorporar autenticación HTTP. Luego diseña una prueba con HttpGraphQlTester o WebSocketGraphQlTester y conserva su ejecución separada.

**Hito del tema:** conserva el resultado ejecutado, el fallo diagnosticado y restaurado, una explicación propia del mecanismo y tu ejercicio independiente. En el proyecto integrador RutaFlow aplica la decisión solo cuando puedas justificar su alcance. La suite del laboratorio no acredita un despliegue productivo ni la resolución de tu ejercicio.

**Fuente primaria:** [Spring GraphQL: tipos de tester y transportes](https://docs.spring.io/spring-graphql/reference/testing.html)

