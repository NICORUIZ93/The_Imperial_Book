# Cancelar sin borrar: CRUD Spring Boot

Laboratorio pequeño del Módulo 14. Crea un envío, lo recupera y cancela cambiando su estado; no necesita Docker.

## Requisitos y ejecución

- JDK 25
- Internet la primera vez para descargar Maven y dependencias

Desde esta carpeta ejecuta:

```bash
./mvnw test
```

Las pruebas levantan Spring Boot, H2 en memoria y MockMvc. Comprueban POST 201 con `Location`, GET del DTO, DELETE 200 con estado `CANCELADO`, permanencia de la fila y repetición de la cancelación.

El esquema H2 `create-drop` es solo para el laboratorio. No demuestra compatibilidad con MySQL ni configura seguridad para producción.
