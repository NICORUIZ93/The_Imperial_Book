# Solución de problemas

Comprobaciones para los fallos más frecuentes al preparar el entorno de la academia.
Cada entrada describe el síntoma, la causa probable y una verificación concreta; no
sustituye la documentación de cada herramienta.

## El puerto 8080 está ocupado

**Síntoma:** `docker compose up -d` falla porque StackPort no puede publicar el puerto
8080.

**Verificación:**

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

**Solución:** cambia solo el puerto del host y conserva el del contenedor:

```bash
STACKPORT_PORT=8081 docker compose up -d
```

Si una aplicación de ejemplo consume StackPort, configura también
`STACKPORT_URL=http://localhost:8081`. El detalle de puertos está en el
[README](../README.md#levantar-floci).

## Floci no arranca

**Síntoma:** `floci start` termina con error o el endpoint local no responde.

**Verificación, en orden:**

```bash
docker info
floci doctor
curl --fail --show-error http://localhost:4566/_localstack/health
```

Comprueba que el daemon de Docker está activo y que ningún otro proceso ocupa el
puerto 4566. No ejecutes dos emuladores a la vez: Floci y LocalStack compiten por el
mismo puerto. Si el problema persiste, consulta las versiones fijadas, el hash del
instalador y el plan alternativo en [la guía de Floci](floci.md).

## `npm ci` falla en `web/`

**Síntoma:** la instalación se detiene por versión de Node, permisos o un lockfile
desincronizado.

**Verificación:**

```bash
node -v
npm -v
cd web
npm ci
```

La integración continua usa Node.js 24. No ejecutes `npm ci` con `sudo`: si hay
errores de permisos, corrige la propiedad del directorio o usa un gestor de versiones
de Node. Si el mensaje indica que `package-lock.json` no coincide con
`package.json`, actualiza el lock con `npm install`, revisa el diff y vuelve a
ejecutar `npm ci`.

## Las pruebas E2E no encuentran navegador o se quedan colgadas

**Síntoma:** Playwright informa que falta un navegador, o la suite termina las pruebas
pero no cierra el proceso.

**Instalación del navegador:**

```bash
cd web
npx playwright install chromium
```

En Linux, CI añade las dependencias del sistema con `npx playwright install --with-deps chromium`.
Para usar el Chrome instalado en lugar del binario de Playwright:

```bash
PLAYWRIGHT_CHANNEL=chrome npm run e2e
```

Si el proceso queda inactivo después de ejecutar las pruebas, el servidor automático
no cerró. Inicia el servidor en otra terminal y reutilízalo:

```bash
cd web
npx ng serve --host 127.0.0.1 --port 4201
PLAYWRIGHT_CHANNEL=chrome npx playwright test --reporter=line
```

Detén el servidor cuando termines. La configuración de Playwright reutiliza el
servidor existente en `http://127.0.0.1:4201`.

## Las credenciales locales son rechazadas

**Síntoma:** AWS CLI o un SDK devuelve un error de credenciales al apuntar a Floci.

**Verificación:**

```bash
aws configure set region us-east-1
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws s3 ls --endpoint-url=http://localhost:4566
```

`test` y `000000000000` son valores ficticios del emulador local; no son credenciales
de una cuenta cloud. Comprueba también que el endpoint sea `http://localhost:4566` y
que no estés enviando claves reales al entorno local. Para SDKs, define
`AWS_ENDPOINT_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y
`AWS_DEFAULT_REGION` en el proceso que ejecuta el ejemplo.

## La validación del repositorio falla

Ejecuta `./scripts/validate.sh` desde la raíz y lee la primera línea de error: cada
auditor indica qué reporte quedó desactualizado. Los reportes se regeneran con los
scripts de `scripts/` y el mapa del repositorio debe generarse al final:

```bash
python3 scripts/build_repo_graph.py
./scripts/validate.sh
```

El estado de las capas y sus límites se resume en [la revisión integral](full-review.md).
