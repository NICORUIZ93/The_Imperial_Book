# Referencia Spring Boot M0–M1

Java 25, Spring Boot 4.1.2 y Maven. Esta carpeta reúne las clases publicadas
para IoC, inyección, scopes, configuración y perfiles. Es un estado final para
comparar el trabajo del curso; no reemplaza escribir y cambiar sus archivos.

Desde esta carpeta:

```bash
./mvnw clean test
./mvnw spring-boot:run
```

La suite tiene cinco pruebas: servicio con doble manual, servicio con contexto,
recorrido MVC/configuración base, instancias prototype y perfil dev. MockMvc
no abre un puerto. Las dos pruebas de servicio reproducen las de M0; las otras
comprueban resultados del recorrido M0–M1.

Con la aplicación arrancada, abre otra terminal:

```bash
curl http://localhost:8080/envios/RF-42
curl http://localhost:8080/reporte/comparar
curl http://localhost:8080/perfil
```

Espera `En ruta: RF-42`, un ID directo estable con IDs nuevos al pedir prototypes,
y `banner=Base; entorno=compartido`. Detén con Ctrl+C. Arranca con perfil dev:

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev
```

Ahora `/perfil` devuelve `banner=Desarrollo; entorno=compartido`. No hay base de
datos ni seguridad; los nombres y estados son datos ficticios de aprendizaje.
Para los cambios de YAML a Properties y precedencia CLI, sigue los pasos de M1:
la suite final no ejecuta cada modificación manual ni sus fallos deliberados.
Este proyecto utiliza Maven; no incluye una variante Gradle verificada.
