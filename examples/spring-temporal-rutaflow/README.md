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
