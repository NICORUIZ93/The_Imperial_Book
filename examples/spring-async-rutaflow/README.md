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

## Alternativa Gradle

Desde esta misma carpeta, con JDK 25:

```bash
./gradlew clean classes test
```

Usa las mismas fuentes y pruebas del laboratorio. Consulta la [guía del curso](../../docs/SPRING-BOOT-GRADLE.md)
para perfiles, filtros de tests, procesadores y tareas especiales. Los resultados
JUnit de Gradle están en `build/test-results/`; una compilación sin tests no
acredita el escenario de integración. Los scripts que llaman a `mvnw` siguen
usando Maven y su carpeta `target/`.
