# Scheduling · revisión de pedidos RutaFlow

Laboratorio Spring Boot 4.1.2. Registra una tarea `fixedDelay` configurable y la
conecta con un servicio separado. El test inspecciona el registro de Spring y
llama el método de forma directa, sin esperar al scheduler.

```bash
./mvnw -q clean test
```

La prueba confirma una tarea programada y una llamada al servicio. El retardo de
una hora del perfil de test evita que el reloj real ejecute la tarea durante la
prueba. El test no mide puntualidad de cron ni coordinación entre réplicas.

- `application.yml`: delay de cinco minutos y delay inicial.
- `PedidosScheduler`: método que recibe el disparo y delega.
- `RevisionPedidos`: servicio de negocio demostrativo.
- `PedidosSchedulerTest`: evidencia de registro y delegación.

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
