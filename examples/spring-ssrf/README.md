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
