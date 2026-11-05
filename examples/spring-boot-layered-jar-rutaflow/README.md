# Empaquetar RutaFlow en capas de contenedor

Proyecto mínimo Spring Boot 4.1.2 / Java 25 con `GET /ruta`. El plugin Maven
reempaca el JAR y agrega el índice de capas y `jarmode=tools`.

## Compilar e inspeccionar

Desde esta carpeta:

```bash
./scripts/verify-layers.sh
```

El script compila el JAR, imprime las cuatro capas y comprueba que existen
`dependencies/`, `spring-boot-loader/`, `snapshot-dependencies/` y `application/`
bajo `target/extracted/`. Luego construye la imagen desde esta carpeta con:

```bash
podman build -t rutaflow-capas:local .
podman run --rm -p 8080:8080 rutaflow-capas:local
```

En otra terminal, `curl -s http://localhost:8080/ruta` devuelve
`{"codigo":"RF-314","estado":"en camino"}`. Usa `docker` en lugar de `podman`
si ese es el motor instalado.

## Fallo para diagnosticar

En `Dockerfile`, elimina una de las cuatro instrucciones `COPY --from=builder` y
vuelve a construir. Si quitaste `application/`, el arranque debe fallar porque
falta el código de la app. Si quitaste `dependencies/`, pueden faltar librerías.
Restaura la instrucción y reconstruye.

El Dockerfile toma como entrada el artefacto que ya construiste; no incluye una
etapa Maven. La extracción y sus cuatro directorios se verifican sin daemon de
contenedores; para observar capas de imagen y responder HTTP sí se necesita
Podman o Docker activo.
