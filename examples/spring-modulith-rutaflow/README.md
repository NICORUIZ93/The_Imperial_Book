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
