# Módulo 22: Balanceo de carga, CDN y DNS — ELB, CloudFront, Route53 y ACM


## Aprende construyendo

### Tema 1: ELB v2 — balanceadores, grupos objetivo y reglas

#### Paso 1 · Objetivo y preparación
Al finalizar vas a declarar `demo-alb` para repartir tráfico entre los nodos de reparto de `demo-asg` (Módulo 21). Prerrequisitos: Módulo 21 completo.
#### Paso 2 · Contexto y caso real
La API de seguimiento de RutaFlow necesita repartir solicitudes entre varios nodos de reparto y dejar de enviarles tráfico si alguno deja de responder — sin que nadie tenga que decidir a mano a cuál instancia le toca cada petición.
#### Paso 3 · Teoría, modelo mental y analogía
Un ALB es una central que escucha, decide según reglas (ruta, host) y envía al grupo objetivo correspondiente, retirando de la rotación cualquier objetivo que falle el healthcheck.
#### Paso 4 · Demostración guiada
```bash
LB_ARN=$(aws elbv2 create-load-balancer --name demo-alb --type application --scheme internet-facing \
  --query 'LoadBalancers[0].LoadBalancerArn' --output text)
TG_ARN=$(aws elbv2 create-target-group --name demo-objetivos --protocol HTTP --port 80 --target-type instance \
  --query 'TargetGroups[0].TargetGroupArn' --output text)
LISTENER_ARN=$(aws elbv2 create-listener --load-balancer-arn "$LB_ARN" --protocol HTTP --port 80 \
  --default-actions Type=forward,TargetGroupArn="$TG_ARN" --query 'Listeners[0].ListenerArn' --output text)
```

**Ejecuta el ejemplo** (con Floci corriendo en local, ejecuta el comando contra el emulador):

```bash
floci up
aws --endpoint-url http://localhost:4566 sts get-caller-identity
```
Confirma la respuesta del servicio emulado.

Resultado esperado: los tres comandos devuelven sus ARN respectivos — `demo-alb` ya existe con un listener HTTP y un grupo objetivo `demo-objetivos`, listo para recibir instancias reales del Módulo 21.
#### Paso 5 · Práctica guiada
Pista: registrá un target con un ID de instancia que nunca lanzaste (`aws elbv2 register-targets --target-group-arn "$TG_ARN" --targets Id=i-00000000falso`) — ese es el fallo deliberado: el registro se acepta sin error inmediato, pero `describe-target-health` nunca va a reportar esa instancia como saludable porque simplemente no existe.
#### Paso 6 · Práctica independiente
Agregá una regla de enrutamiento por ruta (`aws elbv2 create-rule --listener-arn "$LISTENER_ARN" --priority 10 --conditions Field=path-pattern,Values='/api/*' --actions Type=forward,TargetGroupArn="$TG_ARN"`) y confirmá con `describe-rules` que la regla por defecto automática sigue existiendo junto a la nueva.
#### Paso 7 · Cierre y evidencia
Entregá `demo-alb` con su listener y grupo objetivo, el target inválido del Paso 5, y la regla de ruta del Paso 6; explicá qué parte de este flujo es idéntica a como lo harías con Terraform contra un ALB real. Siguiente paso: certificados. Errores comunes: healthcheck superficial y reglas solapadas. Fuente oficial: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html.
**Conceptos clave:** Application Load Balancer (ALB), grupo objetivo (target group), listener, regla de enrutamiento, Fase 1 vs Fase 2.

Elastic Load Balancing v2 gestiona balanceadores de carga de aplicaciones (ALB) y de red (NLB) a través de una API de plano de gestión completa: puedes crear balanceadores, grupos objetivo, listeners y reglas de enrutamiento por ruta o por host, exactamente como en AWS real, y todos esos recursos se almacenan y se devuelven correctamente vía SDK, CLI o Terraform. Lo que Floci todavía no hace —está planeado como Fase 2— es abrir puertos de escucha TCP reales que reenvíen tráfico HTTP de verdad a los objetivos registrados; por ahora, `DescribeTargetHealth` siempre devuelve el estado `initial`, y no hay tráfico real fluyendo a través del balanceador.

Esto significa que en este módulo vas a practicar el ciclo de vida completo del plano de control —crear el balanceador, el grupo objetivo, registrar objetivos, crear listeners con reglas de enrutamiento por ruta (`/api/*` hacia un grupo, el resto hacia otro)— que es exactamente la misma superficie de API que usarías con Terraform o el SDK contra un ALB real, aunque el tráfico HTTP en sí no se enruta todavía dentro de Floci. Cada `CreateListener` crea automáticamente una regla por defecto inmutable, y las prioridades de reglas se validan de forma atómica para evitar conflictos.

**Analogía:** el ALB en Floci en este momento es como el plano arquitectónico completo de un edificio de oficinas con los ascensores, pasillos y señalización ya diseñados y aprobados, pero donde todavía no se ha instalado la electricidad que los haría funcionar de verdad: la estructura de decisiones (a dónde va cada solicitud) ya está correctamente definida y es consultable.

**¿Por qué es importante?** Practicar el plano de control de ELB v2 te prepara para el mismo flujo de trabajo con Terraform/CDK que usarías contra AWS real: definir grupos objetivo, listeners y reglas es idéntico: solo cambia que en Floci el tráfico real todavía no atraviesa el balanceador.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-22/tema-1-alb.sh — ejecutar con: bash tema-1-alb.sh
LB_ARN=$(aws elbv2 create-load-balancer --name demo-alb --type application --scheme internet-facing \
  --query 'LoadBalancers[0].LoadBalancerArn' --output text)
TG_ARN=$(aws elbv2 create-target-group --name demo-objetivos --protocol HTTP --port 80 --target-type instance \
  --query 'TargetGroups[0].TargetGroupArn' --output text)
LISTENER_ARN=$(aws elbv2 create-listener --load-balancer-arn "$LB_ARN" --protocol HTTP --port 80 \
  --default-actions Type=forward,TargetGroupArn="$TG_ARN" --query 'Listeners[0].ListenerArn' --output text)
aws elbv2 create-rule --listener-arn "$LISTENER_ARN" --priority 10 \
  --conditions Field=path-pattern,Values='/api/*' --actions Type=forward,TargetGroupArn="$TG_ARN"
```

`--scheme internet-facing` hace que el balanceador tenga una IP pública (la alternativa, `internal`, solo es alcanzable dentro de tu red privada); `--target-type instance` dice que el grupo objetivo apunta a instancias EC2 (existen otros tipos, como `ip` o `lambda`). `--load-balancer-arn` y `--listener-arn` identifican, respectivamente, a qué balanceador y a qué listener referirte en cada comando siguiente. `--default-actions` (con `Type=forward,TargetGroupArn=...`) define qué hacer con el tráfico que no matchea ninguna regla específica — reenviarlo al grupo objetivo indicado. Al crear una regla, `--priority` decide el orden de evaluación cuando hay varias reglas (menor número, mayor prioridad), `--conditions` es el criterio que debe cumplir la petición (acá, que la ruta empiece con `/api/`), y `--actions` es qué hacer si se cumple esa condición. En resumen: `--target-type` es la bandera que fija a qué tipo de recurso apunta el grupo objetivo, `--load-balancer-arn` y `--listener-arn` son las banderas que identifican el balanceador y el listener, `--default-actions` es la bandera que define la acción por defecto del listener, y `--priority` es la bandera que fija el orden de evaluación de la regla.

**Resultado esperado:** cada comando devuelve su ARN (`LoadBalancerArn`, `TargetGroupArn`, `ListenerArn`, `RuleArn`); `aws elbv2 describe-target-health --target-group-arn $TG_ARN` siempre devuelve estado `initial` — recuerda que Floci aún no enruta tráfico real (Fase 2 pendiente).

**Modifica esto:** registra una instancia real del Módulo 21 con `register-targets` y confirma con `describe-target-groups` que aparece asociada, aunque su salud siga `initial`.

**Cuándo no usarlo:** no uses `describe-target-health` de Floci para validar que tu aplicación responde de verdad; eso solo lo confirmas contra un ALB real o probando la instancia directamente.

**Cómo crece tu proyecto:** este ALB es el punto de entrada que balanceará tráfico hacia los nodos de reparto en cuanto tengas más de una instancia activa.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Enruta seguimiento y operaciones a grupos objetivo distintos. Retira una instancia del grupo de prueba y confirma mediante peticiones que el tráfico se dirige únicamente a destinos saludables.

### Tema 2: ACM — certificados TLS con criptografía real

#### Paso 1 · Objetivo y preparación
Al finalizar vas a emitir el certificado TLS que `demo-alb` (Tema 1) va a necesitar para su listener HTTPS. Prerrequisitos: Tema 1 de este módulo.
#### Paso 2 · Contexto y caso real
El tráfico de los clientes y conductores de RutaFlow hacia la API de seguimiento debe cifrarse con TLS, y ese certificado debe renovarse sin que nadie tenga que acordarse de hacerlo a mano cada año.
#### Paso 3 · Teoría, modelo mental y analogía
Un certificado ACM es una matrícula criptográfica real con fecha y autoridad verificable, aunque en Floci se emita al instante en vez de esperar la validación real de DNS.
#### Paso 4 · Demostración guiada
```bash
CERT_ARN=$(aws acm request-certificate --domain-name api.demo.example.com --validation-method DNS \
  --query 'CertificateArn' --output text)
aws acm describe-certificate --certificate-arn "$CERT_ARN" --query 'Certificate.Status' --output text
```
Resultado esperado: `describe-certificate` devuelve `ISSUED` de inmediato, con una cadena X.509 real detrás (verificable con `openssl x509 -noout -text`), aunque la validación DNS real nunca ocurrió — Floci no esperó nada, a diferencia de AWS real.
#### Paso 5 · Práctica guiada
Pista: documentá qué pasaría contra AWS real si pidieras un certificado para un dominio que no controlás y nunca agregaras el registro DNS de validación — ese es el fallo deliberado que Floci no puede reproducir: el certificado se quedaría en `PENDING_VALIDATION` indefinidamente, nunca en `ISSUED`, porque ahí sí hay una comprobación real detrás.
#### Paso 6 · Práctica independiente
Documentá, para `api.demo.example.com`, cuándo ACM intentaría renovar automáticamente este certificado en AWS real (pista: unos 60 días antes de expirar, siempre que el registro DNS de validación siga existiendo) y qué rompería esa renovación automática si alguien borrara ese registro de Route53 por error.
#### Paso 7 · Cierre y evidencia
Entregá el certificado emitido del Paso 4, el escenario de validación pendiente del Paso 5, y la renovación documentada del Paso 6; explicá por qué la emisión instantánea de Floci es útil para practicar pero no para medir tiempos reales. Siguiente paso: caché. Errores comunes: certificados vencidos y claves expuestas. Fuente oficial: https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html.
**Conceptos clave:** emisión automática, criptografía real (RSA/EC), tipos `AMAZON_ISSUED` vs `PRIVATE`.

A diferencia de ELB, ACM en Floci sí es completamente funcional de extremo a extremo: cuando solicitas un certificado con `RequestCertificate`, Floci lo emite inmediatamente con estado `ISSUED` —sin esperar validación real de DNS o correo—, pero genera claves criptográficas reales (RSA de 2048 a 4096 bits, o curvas elípticas P-256/P-384/P-521) y una estructura X.509 válida de verdad, no un certificado de mentira. Puedes recuperar el certificado y su cadena en formato PEM con `GetCertificate`, y si lo solicitaste como tipo `PRIVATE` (indicando una autoridad certificadora), incluso exportarlo junto a su clave privada.

Esta combinación —emisión instantánea, pero con criptografía verdadera— es exactamente lo que necesitas para probar localmente flujos que dependen de tener un certificado TLS válido (por ejemplo, para el listener HTTPS de un ALB, o para la Cosmos DB Java SDK que exige TLS), sin la latencia ni la complejidad de un proceso de validación real que en AWS puede tardar minutos u horas.

**Analogía:** ACM en Floci es como un notario de práctica en una escuela de derecho: emite documentos con formato y firma perfectamente válidos técnicamente, de forma instantánea, sin el proceso de verificación de identidad completo que exigiría un notario real.

**¿Por qué es importante?** Tener certificados reales pero de emisión instantánea te permite practicar arquitecturas HTTPS-first (la única forma correcta de construir en la nube hoy) sin fricción, algo que sería mucho más lento de ensayar contra AWS real cada vez.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-22/tema-2-acm.sh — ejecutar con: bash tema-2-acm.sh
CERT_ARN=$(aws acm request-certificate --domain-name api.demo.example.com --validation-method DNS \
  --query 'CertificateArn' --output text)
aws acm describe-certificate --certificate-arn "$CERT_ARN" --query 'Certificate.Status' --output text
aws acm get-certificate --certificate-arn "$CERT_ARN"
```

`--domain-name` es el dominio para el que pedís el certificado; `--validation-method DNS` elige cómo vas a demostrarle a la autoridad certificadora que sos dueño de ese dominio (agregando un registro DNS específico, la alternativa a validar por correo); `--certificate-arn` identifica el certificado ya emitido en los comandos siguientes. En resumen: `--certificate-arn` es la bandera que fija a qué certificado te referís.

**Resultado esperado:** `describe-certificate` devuelve `ISSUED` de inmediato; `get-certificate` devuelve un PEM real con una cadena X.509 válida — puedes verificarlo pasando el `Certificate` devuelto a `openssl x509 -noout -text`.

**Modifica esto:** repite la solicitud con `--certificate-authority-arn <arn>` (tipo `PRIVATE`) y confirma que ahora sí puedes exportar la clave privada con `export-certificate`, algo que un certificado `AMAZON_ISSUED` no permite.

**Cuándo no usarlo:** no confíes en la emisión instantánea como comportamiento realista de tiempos; en AWS real la validación DNS puede tardar minutos, y tu automatización debe esperar el evento correspondiente, no asumir éxito inmediato.

**Cómo crece tu proyecto:** este certificado es el que adjuntarás al listener HTTPS del ALB para servir su API de seguimiento por TLS.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Configura el certificado del endpoint de laboratorio y verifica nombre, cadena y vencimiento con un cliente TLS. Un certificado válido para otro nombre debe producir un error verificable, no una excepción desactivada.

### Tema 3: CloudFront — distribución de contenido y control de acceso al origen

#### Paso 1 · Objetivo y preparación
Al finalizar vas a distribuir las fotos de entrega de `pruebas-entrega` (Módulo 2) por CDN, en vez de servirlas directamente desde S3. Prerrequisitos: Módulo 2 completo.
#### Paso 2 · Contexto y caso real
Las fotos de `pruebas-entrega` deben llegar rápido al cliente sin que el bucket de origen quede expuesto públicamente — exactamente el problema que resuelve una distribución con control de acceso al origen.
#### Paso 3 · Teoría, modelo mental y analogía
CloudFront es una red de sucursales: la caché evita que cada petición tenga que viajar hasta el almacén central (el bucket S3 de origen).
#### Paso 4 · Demostración guiada
```bash
DIST_ID=$(aws cloudfront create-distribution --distribution-config \
  '{"CallerReference":"pruebas-entrega-1","Enabled":true,"Origins":{"Quantity":1,"Items":[{"Id":"origen-pruebas-entrega","DomainName":"pruebas-entrega.s3.amazonaws.com","S3OriginConfig":{"OriginAccessIdentity":""}}]},"DefaultCacheBehavior":{"TargetOriginId":"origen-pruebas-entrega","ViewerProtocolPolicy":"redirect-to-https","CachePolicyId":"658327ea-f89d-4fab-a63d-7e88639e58f6"}}' \
  --query 'Distribution.Id' --output text)
```

**Ejecuta el ejemplo** (con Floci corriendo en local, ejecuta el comando contra el emulador):

```bash
floci up
aws --endpoint-url http://localhost:4566 sts get-caller-identity
```
Confirma la respuesta del servicio emulado.

Resultado esperado: la distribución pasa a `Deployed` de inmediato con un `DomainName` tipo `{id}.cloudfront.net` — ese dominio, no la URL directa de S3, es el que debería recibir el cliente del pedido para ver su foto de entrega.
#### Paso 5 · Práctica guiada
Pista: intentá borrar esta distribución directamente con `aws cloudfront delete-distribution --id "$DIST_ID" --if-match <etag>` sin deshabilitarla antes — ese es el fallo deliberado: `DistributionNotDisabled`, porque CloudFront exige desactivar explícitamente una distribución (`update-distribution` con `Enabled=false`) antes de permitir borrarla.
#### Paso 6 · Práctica independiente
Creá una invalidación sobre `/envio-4471/*` (`aws cloudfront create-invalidation --distribution-id "$DIST_ID" --invalidation-batch '{"Paths":{"Quantity":1,"Items":["/envio-4471/*"]},"CallerReference":"inv-1"}'`) y confirmá que se marca `Completed` de inmediato, simulando el caso real de "el conductor volvió a subir la foto, hay que forzar que ya no se sirva la versión cacheada vieja".
#### Paso 7 · Cierre y evidencia
Entregá la distribución creada sobre `pruebas-entrega`, el error de borrado sin deshabilitar del Paso 5, y la invalidación del Paso 6; explicá por qué nunca deberías cachear sin control de acceso al origen una foto de entrega que podría ser sensible. Siguiente paso: DNS. Errores comunes: cachear datos privados y olvidar invalidación. Fuente oficial: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html.
**Conceptos clave:** distribución, política de caché, invalidación, control de acceso de origen (OAC).

**Dominio propio en AWS real:** además del registro DNS, `fotos.demo.example.com` debe añadirse como nombre alternativo de la distribución y quedar cubierto por su certificado TLS. Este laboratorio crea una distribución básica y no configura esos dos requisitos; Floci tampoco entrega el contenido. Fuente oficial: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html.

CloudFront en Floci emula el plano de gestión completo: puedes crear una distribución apuntando a un origen (por ejemplo, un bucket S3), definir políticas de caché con sus TTLs mínimo/por defecto/máximo, configurar políticas de encabezados de respuesta, crear invalidaciones de caché, y proteger el acceso al origen con Control de Acceso de Origen (OAC) o la identidad heredada (OAI). Todas las distribuciones pasan inmediatamente al estado `Deployed` —sin la demora de propagación global que existe en AWS real—, y las invalidaciones se marcan como `Completed` de inmediato. Lo que no está emulado es la entrega real de contenido: no hay una red de distribución sirviendo tus archivos desde ubicaciones cercanas al usuario, esto es una implementación de plano de gestión únicamente.

Un detalle de comportamiento importante: todas las operaciones de mutación (`PUT`, `DELETE`) exigen un encabezado `If-Match` con el `ETag` actual de la distribución — si no lo incluyes o es incorrecto, la petición falla con `InvalidIfMatchVersion`. Este patrón de actualización optimista (leer el ETag, luego escribir con ese ETag) es el mismo que usan muchas APIs REST maduras para evitar que dos actualizaciones concurrentes se pisen entre sí.

**Analogía:** una distribución CloudFront en Floci es como el contrato firmado con una empresa de mensajería para que distribuya tus paquetes desde bodegas cercanas a cada cliente: el contrato (la configuración) es completamente real y consultable, pero en este momento el laboratorio no simula los camiones moviéndose de verdad.

**¿Por qué es importante?** Practicar la configuración de políticas de caché, orígenes y control de acceso es la parte que más se diseña con cuidado en una arquitectura CDN real; el volumen de tráfico que efectivamente sirve CloudFront es una preocupación operativa distinta que se valida contra AWS real.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-22/tema-3-cloudfront.sh — ejecutar con: bash tema-3-cloudfront.sh
DIST_ID=$(aws cloudfront create-distribution --distribution-config \
  '{"CallerReference":"demo-1","Enabled":true,"Origins":{"Quantity":1,"Items":[{"Id":"origen-s3","DomainName":"curso-cloud-local.s3.amazonaws.com","S3OriginConfig":{"OriginAccessIdentity":""}}]},"DefaultCacheBehavior":{"TargetOriginId":"origen-s3","ViewerProtocolPolicy":"redirect-to-https","CachePolicyId":"658327ea-f89d-4fab-a63d-7e88639e58f6"}}' \
  --query 'Distribution.Id' --output text)
aws cloudfront create-invalidation --distribution-id "$DIST_ID" \
  --invalidation-batch '{"Paths":{"Quantity":1,"Items":["/*"]},"CallerReference":"inv-1"}'
```

`--distribution-config` es el JSON completo que describe la distribución (de dónde sirve el contenido, cómo cachearlo); `--distribution-id` (usado en la invalidación y en modificaciones posteriores) identifica cuál distribución afectar; `--invalidation-batch` lista qué rutas de caché forzar a refrescar (acá, `/*`, es decir todo). En resumen: `--distribution-id` es la bandera que identifica la distribución afectada, e `--invalidation-batch` es la bandera que fija las rutas a invalidar.

**Resultado esperado:** `create-distribution` devuelve estado `Deployed` de inmediato y un `DomainName` tipo `{id}.cloudfront.net`; la invalidación se marca `Completed` sin esperar propagación real.

**Modifica esto:** intenta borrar la distribución directamente con `aws cloudfront delete-distribution --id $DIST_ID --if-match <etag>` sin deshabilitarla antes, y observa el error `DistributionNotDisabled` — corrígelo llamando primero a `update-distribution` con `Enabled=false`.

**Cuándo no usarlo:** no midas aquí latencia de entrega de contenido ni comportamiento de caché de borde real; Floci solo emula el plano de gestión, no la red de distribución física.

**Cómo crece tu proyecto:** esta distribución serviría los assets estáticos del panel de seguimiento, reusando el mismo origen S3 de módulos anteriores.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Distribuye solo recursos públicos del seguimiento mediante el borde. Comprueba que una evidencia privada no se vuelve accesible al reutilizar la misma política de caché o de origen.

### Tema 4: Route53 — zonas alojadas y registros de recursos

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear la zona DNS de `demo.example.com` y apuntar `fotos.demo.example.com` hacia la distribución CloudFront del Tema 3. Prerrequisitos: Tema 3 de este módulo.
#### Paso 2 · Contexto y caso real
El cliente de RutaFlow necesita llegar a `fotos.demo.example.com` sin que le importe si el `DomainName` real de CloudFront cambia alguna vez — ese nivel de indirección es exactamente lo que resuelve una zona DNS propia.
#### Paso 3 · Teoría, modelo mental y analogía
DNS es una agenda jerárquica que traduce un nombre legible a un destino real, y una zona alojada es la página de esa agenda que le corresponde a tu dominio.
#### Paso 4 · Demostración guiada
```bash
ZONE_ID=$(aws route53 create-hosted-zone --name demo.example.com --caller-reference "$(date +%s)" \
  --query 'HostedZone.Id' --output text)
aws route53 change-resource-record-sets --hosted-zone-id "$ZONE_ID" --change-batch \
  '{"Changes":[{"Action":"CREATE","ResourceRecordSet":{"Name":"fotos.demo.example.com.","Type":"CNAME","TTL":300,"ResourceRecords":[{"Value":"d111111abcdef8.cloudfront.net"}]}}]}'
```
Resultado esperado: la zona nace con registros `SOA`/`NS` automáticos, y el `CNAME` nuevo queda `INSYNC` de inmediato, apuntando `fotos.demo.example.com` hacia la distribución del Tema 3.
#### Paso 5 · Práctica guiada
Pista: intentá borrar el registro `SOA` del vértice de la zona (`Action: DELETE` sobre ese registro) — ese es el fallo deliberado: Route53 lo rechaza, porque esos registros los gestiona el propio servicio automáticamente, no son tuyos para borrar.
#### Paso 6 · Práctica independiente
Agregá un health check HTTP sobre el destino real, y documentá qué TTL elegirías para el `CNAME` si tuvieras que cambiar de distribución CloudFront con frecuencia durante pruebas (pista: un TTL bajo acelera la propagación de cambios futuros, a costa de más consultas DNS).
#### Paso 7 · Cierre y evidencia
Entregá la zona y el `CNAME` creados, el intento de borrar el `SOA` del Paso 5, y la decisión de TTL del Paso 6; explicá por qué Floci no puede confirmar que `fotos.demo.example.com` resuelva de verdad desde tu navegador. Siguiente paso: TLS. Errores comunes: TTL excesivo y healthcheck ausente. Fuente oficial: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html.
**Conceptos clave:** zona alojada, registro SOA/NS, `ChangeResourceRecordSets`, comprobación de estado (health check).

Route53 en Floci emula el plano de gestión de DNS: puedes crear una zona alojada, que automáticamente recibe registros SOA y NS en el vértice —no eliminables—, y luego añadir, actualizar o eliminar registros de recursos (A, CNAME, MX, etc.) con `ChangeResourceRecordSets`, validando todos los cambios de forma atómica antes de aplicar cualquiera. Cada cambio devuelve inmediatamente el estado `INSYNC` (sin la propagación asíncrona real de Route53), y puedes crear comprobaciones de estado HTTP/HTTPS que Route53 usaría en producción para enrutamiento basado en salud. Lo que no está emulado es la resolución DNS real: si intentas resolver un dominio que configuraste aquí desde tu navegador, no funcionará — esto es, otra vez, plano de gestión únicamente.

Un detalle útil para depurar: los IDs de zona alojada se devuelven con el prefijo `/hostedzone/` en las respuestas XML crudas, pero el AWS SDK lo elimina automáticamente del lado del cliente, así que normalmente solo verás el ID limpio (por ejemplo `Z1PA6795UKMFR9`).

**Analogía:** una zona alojada en Route53 es como el directorio interno de un edificio de oficinas: dice exactamente en qué piso y oficina está cada empresa (registro), y ese directorio es cien por ciento preciso y consultable, pero no es el sistema de señalización física que efectivamente guía a un visitante hasta la puerta — la resolución DNS real.

**¿Por qué es importante?** El plano de gestión de DNS es donde se cometen la mayoría de los errores de configuración reales (registros mal apuntados, TTLs incorrectos, zonas huérfanas); practicarlo aquí sin miedo a romper resolución de producción es exactamente el tipo de práctica segura que justifica un emulador local.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-22/tema-4-route53.sh — ejecutar con: bash tema-4-route53.sh
ZONE_ID=$(aws route53 create-hosted-zone --name demo.example.com --caller-reference "$(date +%s)" \
  --query 'HostedZone.Id' --output text)
aws route53 change-resource-record-sets --hosted-zone-id "$ZONE_ID" --change-batch \
  '{"Changes":[{"Action":"CREATE","ResourceRecordSet":{"Name":"fotos.demo.example.com.","Type":"CNAME","TTL":300,"ResourceRecords":[{"Value":"d111111abcdef8.cloudfront.net"}]}}]}'
aws route53 list-resource-record-sets --hosted-zone-id "$ZONE_ID"
```

`--caller-reference` es un valor único que evita que, si reenviás la misma petición por error (por ejemplo, tras un timeout de red), Route53 cree la zona duplicada — de ahí que el ejemplo use la hora actual (`$(date +%s)`), siempre distinta. `--hosted-zone-id` identifica en qué zona aplicar cambios; `--change-batch` es el JSON con la lista de cambios a aplicar (acá, crear un registro CNAME para un subdominio; un CNAME no puede ocupar el vértice de la zona).

**Resultado esperado:** la zona nace con registros `SOA` y `NS` automáticos en el vértice; el cambio del `CNAME` devuelve estado `INSYNC` de inmediato; `list-resource-record-sets` muestra los tres registros juntos.

**Modifica esto:** intenta borrar el registro `SOA` del vértice con `Action: DELETE` y confirma que Route53 lo rechaza — esos registros los gestiona el servicio automáticamente, no tú.

**Cuándo no usarlo:** no resuelvas el dominio desde tu navegador esperando que funcione; Floci guarda y valida la configuración, pero no ejecuta resolución DNS real.

**Cómo crece tu proyecto:** la zona raíz `demo.example.com` contiene nombres separados: `fotos.demo.example.com` apunta a CloudFront y `api.demo.example.com` al ALB. Un CNAME no puede ocupar el vértice de la zona.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Crea la zona alojada del seguimiento y publica los subdominios de sus servicios como registros separados. Intenta borrar el `SOA` del vértice y conserva el rechazo como prueba de que ese registro lo gestiona el servicio, no tú.

### Tema 5: Cómo se integran los cuatro servicios en una arquitectura de borde real

#### Paso 1 · Objetivo y preparación
Al finalizar vas a encadenar los cuatro servicios de este módulo: `demo-alb` (Tema 1) con el certificado de `api.demo.example.com` (Tema 2), y el `CNAME` de Route53 apuntando al balanceador mientras `fotos.demo.example.com` sigue apuntando a CloudFront. Prerrequisitos: Temas 1-4 de este módulo.
#### Paso 2 · Contexto y caso real
La API de seguimiento de RutaFlow (servida por `demo-alb`, no por archivos estáticos) debe cifrar su tráfico y ser alcanzable por `api.demo.example.com` — un recorrido distinto al de las fotos estáticas, disponibles en `fotos.demo.example.com` por CloudFront.
#### Paso 3 · Teoría, modelo mental y analogía
ACM es la identidad criptográfica; el ALB es la recepción que termina esa conexión TLS; Route53 es el directorio que le dice al cliente a qué recepción ir.
#### Paso 4 · Demostración guiada
```bash
aws elbv2 add-listener-certificates --listener-arn "$LISTENER_ARN" --certificates CertificateArn="$CERT_ARN"
aws route53 change-resource-record-sets --hosted-zone-id "$ZONE_ID" --change-batch \
  '{"Changes":[{"Action":"UPSERT","ResourceRecordSet":{"Name":"api.demo.example.com.","Type":"CNAME","TTL":300,"ResourceRecords":[{"Value":"demo-alb-123456.us-east-1.elb.amazonaws.com"}]}}]}'
```
Resultado esperado: el listener de `demo-alb` ahora tiene adjunto el certificado de `api.demo.example.com` del Tema 2; `api.demo.example.com` queda apuntando al nombre DNS del balanceador — la cadena completa (Route53 → ALB → certificado ACM) queda declarada de punta a punta.
#### Paso 5 · Práctica guiada
Pista: apuntá el `CNAME` de `api.demo.example.com` al `DomainName` de la distribución CloudFront del Tema 3 en vez de al del ALB — ese es el fallo deliberado: técnicamente el registro se crea sin error, pero la API de seguimiento (que vive en el ALB, no en CloudFront) deja de ser alcanzable por ese nombre, un error de "apunté bien el DNS pero al servicio equivocado".
#### Paso 6 · Práctica independiente
Corregí el `CNAME` de vuelta al nombre del ALB, y documentá qué pasaría si el certificado adjunto al listener fuera para un dominio distinto a `api.demo.example.com` (pista: el navegador mostraría una advertencia de certificado no coincidente, aunque la conexión TLS en sí se establezca).
#### Paso 7 · Cierre y evidencia
Entregá la cadena completa declarada en el Paso 4, el `CNAME` apuntado al destino equivocado del Paso 5, y la corrección más la reflexión sobre dominios no coincidentes del Paso 6; explicá por qué las fotos (CloudFront) y la API (ALB) de RutaFlow necesitan cadenas DNS separadas aunque comparten el mismo dominio base. Siguiente paso: observabilidad. Errores comunes: terminación en lugar incorrecto y mixed content. Fuente oficial: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-update-certificates.html.
**Conceptos clave:** cadena ACM → listener ALB → Route53, dos nombres DNS para dos servicios, terminación TLS.

**Diagrama interactivo:** [Dos rutas de borde: fotos por CloudFront y API por ALB](/visuals/temas/cloud/modulo-22-tema-5-edge-routes.html)

En una arquitectura AWS real, estos cuatro servicios casi nunca se usan de forma aislada: el flujo típico es solicitar un certificado con ACM para tu dominio, adjuntarlo a un listener HTTPS de un ALB (o a una distribución CloudFront) para terminación TLS, y finalmente crear un registro DNS que apunte cada nombre al punto de entrada correcto. El resultado es que Route53 dirige `fotos.demo.example.com` a CloudFront y `api.demo.example.com` al ALB. Para que el nombre propio de fotos funcione, también debe estar configurado como nombre alternativo en CloudFront y cubierto por un certificado válido; el Tema 3 no hace esa configuración. CloudFront distribuye los archivos de S3 y el ALB enruta la API hacia las instancias EC2 o contenedores reales del Módulo 21.

Reconocer esta cadena de dependencias —certificado, punto de entrada de tráfico, resolución de nombre— es más importante que memorizar los comandos de cada servicio por separado: es el patrón que vas a ver una y otra vez en cualquier arquitectura web en la nube, sea en AWS, Azure o GCP.

**Analogía:** ACM es la credencial de identidad verificada de tu negocio, el ALB o CloudFront es la puerta de entrada física con esa credencial exhibida, y Route53 es la dirección postal que le dice a los clientes hacia dónde caminar para llegar a esa puerta.

**¿Por qué es importante?** Diseñar pensando en esta cadena completa —no solo en un servicio aislado— es lo que separa a alguien que sabe usar comandos de AWS de alguien que sabe diseñar arquitecturas de borde coherentes y seguras.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-22/tema-5-cadena-completa.sh — ejecutar con: bash tema-5-cadena-completa.sh
# Cada ARN se recupera por nombre: este bloque no depende de variables de
# los Temas 1, 2 y 4 — puedes correrlo en una terminal nueva.
LB_ARN=$(aws elbv2 describe-load-balancers --names demo-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text)
LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn "$LB_ARN" --query 'Listeners[0].ListenerArn' --output text)
CERT_ARN=$(aws acm list-certificates --query "CertificateSummaryList[?DomainName=='api.demo.example.com'].CertificateArn | [0]" --output text)
ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name demo.example.com --query 'HostedZones[0].Id' --output text)

aws acm describe-certificate --certificate-arn "$CERT_ARN" --query 'Certificate.Status'
aws elbv2 modify-listener --listener-arn "$LISTENER_ARN" --protocol HTTPS --port 443 \
  --certificates CertificateArn="$CERT_ARN"
aws route53 list-resource-record-sets --hosted-zone-id "$ZONE_ID" --query "ResourceRecordSets[?Type=='CNAME']"
```

`--names` filtra `describe-load-balancers` por nombre (en vez de traer todos los balanceadores de la cuenta); `--dns-name` filtra `list-hosted-zones-by-name` de la misma forma, por el dominio exacto que buscás; `--certificates` en `modify-listener` es la lista de certificados a adjuntar al listener HTTPS (acá, el ARN que acabás de recuperar de ACM). En resumen: `--names` es la bandera que filtra por nombre, y `--dns-name` es la bandera que filtra por dominio exacto.

**Resultado esperado:** el certificado `api.demo.example.com` sigue `ISSUED`; el listener queda en `HTTPS`/443 con ese certificado adjunto; Route53 conserva los dos registros: `api.demo.example.com` al ALB y `fotos.demo.example.com` a CloudFront.

**Modifica esto:** cambia temporalmente el `CNAME` de `api.demo.example.com` para que apunte al `DomainName` de CloudFront, y confirma que `list-resource-record-sets` refleja el destino equivocado; no cambies el registro de fotos.

**Cuándo no usarlo:** no repliques esta cadena completa por cada microservicio de un sistema grande; en arquitecturas reales normalmente compartes un ALB/CloudFront y un certificado wildcard entre varios servicios para reducir piezas a coordinar.

**Cómo crece tu proyecto:** esta es exactamente la cadena (certificado → punto de entrada → DNS) que El proyecto necesita para exponer su API de seguimiento de forma segura al cierre del track.

---

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Dibuja el recorrido DNS, TLS, distribución y balanceador del seguimiento. Provoca un fallo en una capa y conserva la prueba que lo distingue de un error de aplicación.

## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear un Application Load Balancer con un grupo objetivo y una regla de enrutamiento por ruta, y luego solicitar un certificado ACM, crear una distribución CloudFront con origen S3 y publicar una zona Route53 con un registro apuntando a ella.

**Requisitos previos:** un bucket S3 existente (puedes reutilizar `curso-cloud-local` de módulos anteriores) y al menos una instancia EC2 del Módulo 21 si quieres registrar un objetivo real en el grupo objetivo.

### Laboratorio 22.1 — Application Load Balancer con enrutamiento por ruta

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea el balanceador | `aws elbv2 create-load-balancer --name mi-alb --type application --scheme internet-facing` | Registra un ALB en estado `provisioning`, que pasa a `active` de inmediato | Un `LoadBalancerArn` en la respuesta |
| 2 | Crea el grupo objetivo | `aws elbv2 create-target-group --name mis-objetivos --protocol HTTP --port 80 --target-type instance` | Define dónde se enviaría el tráfico | Un `TargetGroupArn` |
| 3 | Registra un objetivo | `aws elbv2 register-targets --target-group-arn <tg-arn> --targets Id=<instance-id>,Port=8080` | Asocia una instancia EC2 real del Módulo 21 al grupo | Sin salida (éxito silencioso) |
| 4 | Crea el listener | `aws elbv2 create-listener --load-balancer-arn <lb-arn> --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=<tg-arn>` | Crea automáticamente una regla por defecto inmutable | Un `ListenerArn` |
| 5 | Añade una regla por ruta | `aws elbv2 create-rule --listener-arn <listener-arn> --priority 10 --conditions Field=path-pattern,Values='/api/*' --actions Type=forward,TargetGroupArn=<tg-arn>` | Enruta específicamente el tráfico bajo `/api/*` | Un `RuleArn` |

### Laboratorio 22.2 — Certificado, distribución CDN y zona DNS

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Solicita un certificado | `aws acm request-certificate --domain-name miapp.example.com --validation-method DNS` | Emite un certificado real con estado `ISSUED` de inmediato | Un `CertificateArn` |
| 2 | Crea una distribución con origen S3 | `aws cloudfront create-distribution --distribution-config '{"CallerReference":"ref-1","Enabled":true,"Origins":{"Quantity":1,"Items":[{"Id":"origen-s3","DomainName":"curso-cloud-local.s3.amazonaws.com","S3OriginConfig":{"OriginAccessIdentity":""}}]},"DefaultCacheBehavior":{"TargetOriginId":"origen-s3","ViewerProtocolPolicy":"redirect-to-https","CachePolicyId":"658327ea-f89d-4fab-a63d-7e88639e58f6"}}'` | Crea la distribución en estado `Deployed` de inmediato | Un `Id` de 14 caracteres y un `DomainName` tipo `{id}.cloudfront.net` |
| 3 | Crea la zona alojada | `aws route53 create-hosted-zone --name miapp.example.com --caller-reference "$(date +%s)"` | Crea la zona con registros SOA/NS automáticos | Un `Id` de zona (formato `Z...`) |
| 4 | Añade un CNAME de subdominio hacia CloudFront | `aws route53 change-resource-record-sets --hosted-zone-id <zone-id> --change-batch '{"Changes":[{"Action":"CREATE","ResourceRecordSet":{"Name":"fotos.miapp.example.com.","Type":"CNAME","TTL":300,"ResourceRecords":[{"Value":"<distribution-domain>"}]}}]}'` | Conecta el nombre de las fotos con la distribución CDN; el vértice de la zona no admite un CNAME | Estado `INSYNC` inmediato |
| 5 | Verifica el registro | `aws route53 list-resource-record-sets --hosted-zone-id <zone-id>` | Confirma que el registro quedó guardado | `fotos.miapp.example.com` apunta a tu distribución |

**Verificación:** el laboratorio se considera exitoso si `describe-load-balancers` muestra tu ALB `active` con un listener y una regla por ruta `/api/*`, `acm describe-certificate` muestra el certificado en estado `ISSUED` con claves criptográficas reales, `cloudfront get-distribution` devuelve tu distribución en estado `Deployed`, y `route53 list-resource-record-sets` muestra el CNAME de `fotos.miapp.example.com` apuntando al dominio de CloudFront.

**Errores comunes y soluciones**

- **`CreateListener` falla con conflicto de prioridad.** Cada regla necesita una prioridad única dentro del mismo listener; revisa con `describe-rules` qué prioridades ya están en uso antes de crear una nueva.
- **`DeleteDistribution` falla con `DistributionNotDisabled`.** CloudFront exige que `Enabled` sea `false` antes de poder eliminar la distribución; llama primero a `update-distribution` con el `ETag` correcto para deshabilitarla.
- **`ChangeResourceRecordSets` falla al intentar borrar el registro SOA o NS del vértice.** Esos registros los gestiona Route53 automáticamente y no se pueden eliminar; solo puedes añadir, modificar o quitar registros adicionales.
- **`RequestCertificate` con `CertificateAuthorityArn` falla al exportar.** Solo los certificados de tipo `PRIVATE` se pueden exportar con `ExportCertificate`; los `AMAZON_ISSUED` no admiten exportación de clave privada, igual que en AWS real.

---
