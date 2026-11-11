# Temporal con Spring Boot: pedidos con reintento y compensación

Laboratorio de Spring Boot 4.1.2, Java 25 y Temporal Spring Boot Starter 1.40.0.
El servidor usado por las pruebas es el `TestWorkflowEnvironment` en memoria.

## Ejecutar

Desde esta carpeta:

```bash
./mvnw test
```

La prueba de éxito hace que el cobro falle una vez y luego termine; la segunda
prueba lo hace fallar en sus tres intentos y comprueba que se libere primero el
repartidor y luego el inventario. Una tercera prueba hace fallar la notificación
tras cobrar y verifica el reembolso antes de liberar repartidor e inventario.
`ActivityRecorder` solo registra eventos para
la práctica; en una aplicación real, cada Activity llamaría a su servicio y
debería aceptar una clave idempotente.

`./mvnw spring-boot:run` requiere un Temporal Server disponible en `localhost:7233`.
El perfil normal no arranca un servidor Temporal por sí mismo.

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
