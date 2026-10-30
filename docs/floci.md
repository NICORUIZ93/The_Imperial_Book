# Floci: instalación, versiones y contingencia

## Versiones y endpoint del currículo

- **Emulador AWS del Compose del repositorio:** Floci `2.2.0`, imagen fijada por
  etiqueta y digest en [docker-compose.yml](../docker-compose.yml). Es la versión
  mínima reproducible del Compose actual, no una declaración de soporte mínimo
  del fabricante.
- **Floci CLI:** la versión `0.4.0` era la release estable más reciente observada
  el 2026-10-30. La documentación del curso usa comandos como `floci start` y
  `floci doctor`, pero no se ha probado una versión mínima compatible distinta;
  esa compatibilidad queda como **revisión manual pendiente**.
- **Endpoint AWS local:** `http://localhost:4566`.

El panel oficial Floci UI es un proyecto aparte y usa el mismo endpoint local.
No ejecutes dos emuladores en el puerto `4566` al mismo tiempo.

## Descarga y revisión del instalador

El mantenedor publica el instalador en `https://floci.io/install.sh`. Su
contenido puede cambiar; el siguiente SHA-256 identifica la copia observada el
2026-10-30 y no es una firma digital:

**SHA-256 del instalador descargado (corte 2026-10-30):**
`d2564a85bf07d389691987807e58d32a9904105e07dd20ede3ffb7bce9de056d`

Descarga a un archivo, verifica el hash, inspecciona el contenido y solo después
ejecútalo. Si el digest no coincide, no lo ejecutes: confirma si el mantenedor
publicó una nueva versión y actualiza este registro mediante revisión.

```bash
curl --fail --location --show-error --output floci-install.sh https://floci.io/install.sh
printf '%s  %s\n' 'd2564a85bf07d389691987807e58d32a9904105e07dd20ede3ffb7bce9de056d' floci-install.sh | shasum -a 256 -c -
less floci-install.sh
sh floci-install.sh
floci --version
floci start
curl --fail --show-error http://localhost:4566/_localstack/health
```

En Linux con GNU Coreutils, `sha256sum -c` puede sustituir a `shasum -a 256 -c`.
El instalador oficial también descarga el binario de una release de GitHub y,
cuando `sha256sum` está disponible, verifica su entrada en `sha256sums.txt`.

La raíz del repositorio contiene además un [install.sh](../install.sh) separado;
no es la copia que se ha medido arriba ni debe confundirse con ella. Consulta
README para su alcance.

## Plan B: LocalStack para pruebas AWS locales

Si Floci no puede iniciarse, se puede probar temporalmente una parte del
currículo AWS con esta imagen por versión y digest:

```yaml
services:
  localstack:
    image: localstack/localstack:4.7.0@sha256:12253acd9676770e9bd31cbfcf17c5ca6fd7fb5c0c62f3c46dd701f20304260c
    ports:
      - "4566:4566"
```

El digest es el manifiesto multi-arquitectura publicado por Docker Hub para
`localstack/localstack:4.7.0`, consultado el 2026-10-30. Antes de actualizarlo,
verifica el digest publicado por el registro y las notas de versión oficiales.
No combines este servicio con `aws-local` de Floci: ambos intentan enlazar el
puerto `4566`. El cambio de emulador no cubre Azure/GCP ni garantiza paridad con
AWS real. LocalStack puede requerir un Auth Token y sus funciones disponibles
dependen del plan; consulta sus instrucciones vigentes antes de usarlo.

Fuentes primarias consultadas:

- [Instalador oficial Floci](https://floci.io/install.sh)
- [Releases de Floci CLI](https://github.com/floci-io/floci-cli/releases)
- [Tag e imagen LocalStack 4.7.0 en Docker Hub](https://hub.docker.com/layers/localstack/localstack/4.7.0/images/sha256-12253acd9676770e9bd31cbfcf17c5ca6fd7fb5c0c62f3c46dd701f20304260c)
- [Instalación oficial LocalStack](https://docs.localstack.cloud/aws/getting-started/installation/)
