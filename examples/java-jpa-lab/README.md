# Laboratorio JPA de Java M16

Proyecto pequeño para ejecutar las primeras prácticas del módulo con Spring Boot 4.1.2, Java 25 y H2 en memoria. El wrapper descarga Maven para este proyecto; no hace falta instalar Maven globalmente.

Desde la raíz del repositorio:

```bash
cd examples/java-jpa-lab
./mvnw test
```

Los siete tests del laboratorio muestran:

- `guardaLosDosLadosYConsultaPorClienteConJpql`: guarda cliente y pedidos, consulta directamente `pedido.cliente_id`, vacía el contexto y comprueba la consulta JPQL.
- `persistirClientePropagaPersistenciaPeroNoBorrado`: comprueba que `CascadeType.PERSIST` guarda el agregado y que Hibernate rechaza borrar el cliente mientras los pedidos conservan esa referencia. No se presenta el fallo del proveedor como una prueba directa de PostgreSQL.
- `entityGraphCargaClienteYCriteriaBuscaPorPrefijo`: carga el cliente con `@EntityGraph` y busca pedidos con Criteria API.
- `comparaNMasUnoConCargaPorEntityGraph`: mide consultas con Hibernate Statistics; compara N+1 con una carga de una sola consulta.

En esta práctica H2 es desechable: al cerrar el proceso, los datos desaparecen. El ejemplo no certifica comportamiento de PostgreSQL, caché de segundo nivel, Querydsl, bloqueo entre transacciones ni Testcontainers. Esos temas requieren sus propias configuraciones y pruebas.
