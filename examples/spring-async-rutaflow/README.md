# Ejecución asíncrona acotada · RutaFlow

Requiere JDK 25. Desde esta carpeta: `./mvnw -q clean test`.
Cuatro pruebas verifican cambio de hilo por proxy, auto-invocación síncrona,
propagación de error mediante Future y rechazo con dos tareas activas más una
en cola. Las barreras coordinan la prueba sin medir velocidad ni usar sleep.

La respuesta SMS es simulada. No hay proveedor, reintento, persistencia, HTTP,
propagación de identidad ni transacción. Cada contexto se cierra y libera tareas.
El retorno indica el hilo para enseñar el mecanismo; no acredita entrega SMS.

El rechazo se lanza al intentar encolar; un error de la tarea llega por Future.
Una cola en memoria no sobrevive a reinicios: para trabajo recuperable usa el
outbox de M20 T3. Dimensiona límites con mediciones del proveedor real.

Fuente: https://docs.spring.io/spring-framework/reference/integration/scheduling.html
