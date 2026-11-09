# Spring Security y Keycloak · RutaFlow

API Spring Boot 4.1.2 que valida JWT de un realm Keycloak y decide acceso por
rol y por propietario del pedido. El realm local está incluido en
`keycloak/rutaflow-realm.json`; no necesitas conectarte a un realm de otra
persona.

## Pruebas automáticas

Desde esta carpeta:

```bash
./mvnw -q clean test
```

Las cinco pruebas levantan la API en HTTP local y comprueban: sin token → 401;
token sin rol → 403; token con rol de escritura → 200; acceso solo al pedido
cuyo dueño coincide con el `sub` del JWT; y preflight CORS desde el origen
local permitido frente a otro origen. En estas pruebas,
`MockJwtConfiguration` sustituye el decodificador para representar a Ana y
Luis. **Estas pruebas no validan firma, expiración ni conexión con Keycloak.**

## Levantar el realm local de Keycloak

Se requiere Docker Compose o Podman Compose. Desde esta carpeta, usa el motor instalado:

```bash
docker compose up -d
docker compose logs -f keycloak
```

Con Podman, sustituye `docker compose` por `podman compose` en los comandos de este recorrido. Si el registro de imágenes no está disponible, el contenedor no podrá descargar Keycloak; las pruebas con `MockJwtConfiguration` no sustituyen esta verificación real.

Espera a que el servicio esté listo y comprueba su documento OIDC:

```bash
curl -fsS http://localhost:8081/realms/rutaflow/.well-known/openid-configuration
```

El archivo importado crea el realm `rutaflow`, el cliente local `rutaflow-cli`,
Ana con el rol `location:write` y Luis sin ese rol. Ambos usan la clave local
`ruta-demo`. Son cuentas y claves solo para desarrollo; no las reutilices fuera
de esta máquina.

## Obtener tokens y llamar a la API

Abre una segunda terminal en esta carpeta y obtén el token de Ana:

```bash
ANA_TOKEN=$(curl -fsS -X POST http://localhost:8081/realms/rutaflow/protocol/openid-connect/token \
  -d grant_type=password -d client_id=rutaflow-cli -d username=ana -d password=ruta-demo \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["access_token"])')
```

Arranca la API. Extrae `sub` del token solo para configurar el dueño del registro
de demostración; la API sigue verificando la firma con las claves publicadas por
Keycloak:

```bash
ANA_SUB=$(python3 -c 'import base64,json,sys; p=sys.argv[1].split(".")[1]; p += "="*((4-len(p)%4)%4); print(json.loads(base64.urlsafe_b64decode(p))["sub"])' "$ANA_TOKEN")
RUTAFLOW_PEDIDO_P_ANA_OWNER="$ANA_SUB" ./mvnw spring-boot:run
```

En una tercera terminal, consulta sin token, con el rol y el pedido ajeno:

```bash
curl -i http://localhost:8080/api/pedidos/p-ana
curl -i -X POST http://localhost:8080/api/ubicaciones/1 -H "Authorization: Bearer $ANA_TOKEN"
curl -i http://localhost:8080/api/pedidos/p-luis -H "Authorization: Bearer $ANA_TOKEN"
```

Resultados esperados: `401`, `200` y `403`. El primer `curl` no lleva
autorización; el segundo presenta un JWT firmado por el realm y el rol correcto;
el tercero presenta un token válido, pero el pedido pertenece a otro `sub`.

Luis tiene un token válido, pero carece del rol de escritura:

```bash
LUIS_TOKEN=$(curl -fsS -X POST http://localhost:8081/realms/rutaflow/protocol/openid-connect/token \
  -d grant_type=password -d client_id=rutaflow-cli -d username=luis -d password=ruta-demo \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["access_token"])')
curl -i -X POST http://localhost:8080/api/ubicaciones/1 -H "Authorization: Bearer $LUIS_TOKEN"
```

Esperas `403`. Para apagar Keycloak, ejecuta `docker compose down` o `podman compose down`, según el motor que usaste.

## Qué revisar en el código

- `src/main/resources/application.yml`: `issuer-uri` apunta al issuer del realm.
- `ApiSecurity.java`: requiere `ROLE_location:write` en las escrituras y
  convierte los roles del claim Keycloak `realm_access.roles` a autoridades.
- `PedidoOwnership.java`: compara el `sub` autenticado con el dueño del pedido.
- `ApiSecurityTest.java` y `MockJwtConfiguration.java`: pruebas locales con un
  decoder simulado; para verificar firma e issuer reales, sigue el recorrido de
  Keycloak de arriba.

Keycloak incluye realm roles bajo `realm_access.roles` por defecto. Las cuentas
de desarrollo usan el password grant para simplificar `curl`; una aplicación
con usuarios debe elegir un flujo interactivo adecuado y no solicitar la
contraseña del usuario directamente.
