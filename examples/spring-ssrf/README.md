# Cliente HTTP con control SSRF · Spring Boot 4.1.2

Desde esta carpeta, ejecuta:

```bash
./mvnw test
```

Los tres tests verifican que el cliente rechaza direcciones locales e IP de
metadata antes de conectarse, que no sigue redirecciones a otra dirección y
que un servidor local efímero responde cuando el filtro se configura para
permitirlo solo como control de prueba.

`SafeClient.externalOnly()` configura timeout de conexión y lectura,
deshabilita redirecciones y usa `InetAddressFilter.externalAddresses()`. Este
filtro protege peticiones salientes desde el proceso Spring; no sustituye una
allowlist de nombres de host, la validación de DNS ni reglas de salida de red.

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
