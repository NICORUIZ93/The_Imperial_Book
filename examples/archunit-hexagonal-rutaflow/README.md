# Arquitectura hexagonal verificada con ArchUnit

Ejemplo mínimo con Java 25 y ArchUnit 1.5.1. El dominio declara el puerto
`DeliveryRepository`, el caso de uso depende del puerto y el adaptador de
infraestructura lo implementa. Las reglas inspeccionan bytecode compilado,
prohíben que domain o application dependan de infrastructure y comprueban el
sufijo `Repository` del adaptador.

```bash
./mvnw -q test
```

Para demostrar la regla, declara temporalmente un método que devuelva
`InMemoryDeliveryRepository` en `domain/Delivery.java` y ejecuta:

```bash
./mvnw -q -Dtest=HexagonalArchitectureTest#dominioNoDependeDeDetallesDeInfraestructura test
```

ArchUnit debe señalar la dependencia `Delivery -> InMemoryDeliveryRepository`.
Quita el método/import y corre de nuevo la suite.

Este laboratorio verifica dos fronteras de paquetes y una convención de nombre
en una aplicación pequeña;
no prueba una API, persistencia externa, composición de Spring ni el rendimiento
de una arquitectura. Las reglas solo cubren las clases incluidas en el import.

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
