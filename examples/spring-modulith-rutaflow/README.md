# Verificar fronteras con Spring Modulith

Laboratorio con Spring Boot 4.1.2, Java 25 y Spring Modulith 2.1.1. El registro
JDBC de publicaciones usa H2 en memoria durante las pruebas.

## Ejecutar

Desde esta carpeta:

```bash
./mvnw test
```

Las pruebas verifican dependencias entre paquetes, publicación de `PedidoCreado`
y entrega del evento al módulo Notificaciones. `DocumentacionModularTest` también
genera archivos PlantUML y AsciiDoc en `target/spring-modulith-docs/`; esto no
equivale a renderizar o revisar visualmente los diagramas. H2 no conserva datos al reiniciar;
no se prueba recuperación de una publicación pendiente tras reiniciar el proceso,
un broker ni procesos separados. `PedidoInterno` existe para demostrar una clase
que no debe importarse desde otro módulo. Para ejecutar la app fuera de pruebas,
configura una base de datos relacional para el registro de eventos.

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
