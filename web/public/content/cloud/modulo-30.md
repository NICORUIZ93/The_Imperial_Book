# Módulo 30: Transferencia de archivos gestionada con Transfer Family


## Aprende construyendo

### Tema 1: Qué resuelve Transfer Family

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear el servidor SFTP que un socio logístico externo usaría para depositar manifiestos sin tocar directamente el bucket de RutaFlow. Prerrequisitos: Módulo 2 completo.
#### Paso 2 · Contexto y caso real
Un proveedor logístico externo de RutaFlow solo sabe hablar SFTP (su sistema heredado no cambia pronto) — pero RutaFlow quiere que esos manifiestos terminen en S3, no en un disco de un servidor que alguien tiene que mantener.
#### Paso 3 · Teoría, modelo mental y analogía
Transfer Family es un traductor simultáneo: el socio sigue hablando SFTP como siempre, mientras del otro lado todo aterriza en S3 sin que nadie cambie sus hábitos.

**Conceptos clave:** SFTP/FTP gestionado, sin servidores propios, integración con almacenamiento en la nube.

Muchas industrias —finanzas, salud, logística— todavía dependen de transferencia de archivos por SFTP o FTP como método de intercambio de datos con socios externos, por razones de compatibilidad con sistemas heredados que no van a cambiar pronto. Operar un servidor SFTP propio significa gestionar parches de seguridad, escalado, alta disponibilidad y almacenamiento — trabajo operativo que no aporta valor de negocio directo. AWS Transfer Family resuelve esto ofreciendo un servidor SFTP/FTP completamente gestionado que, en vez de guardar archivos en un disco tradicional, los conecta directamente con almacenamiento en la nube como S3 o EFS: tus socios externos siguen usando las mismas herramientas SFTP de siempre, sin saber ni que les importa que el backend real sea un bucket S3.

Esto es exactamente el tipo de servicio "puente entre lo legado y lo moderno" que aparece una y otra vez en arquitecturas empresariales reales: mantener compatibilidad con protocolos antiguos mientras internamente adoptas infraestructura moderna.

**Analogía:** Transfer Family es como un traductor simultáneo en una reunión internacional: los participantes que solo hablan el idioma antiguo (SFTP) siguen comunicándose exactamente como siempre lo han hecho, mientras que del otro lado de la sala todo se procesa en el idioma moderno (S3) sin que nadie tenga que cambiar sus hábitos.

**¿Por qué es importante?** Reconocer cuándo un problema es "necesito modernizar internamente sin romper compatibilidad externa" —el caso de uso central de Transfer Family— es una habilidad de diseño valiosa en cualquier empresa con sistemas heredados, que son la mayoría de las empresas grandes reales.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-30/tema-1-por-que-transfer-family.sh — ejecutar con: bash tema-1-por-que-transfer-family.sh
aws s3 mb s3://demo-intercambio-socios
aws transfer create-server --protocols SFTP --endpoint-type PUBLIC \
  --query 'ServerId' --output text
```

`--protocols` es la bandera que indica qué protocolo de transferencia acepta el servidor (SFTP, el más común); `--endpoint-type` es la bandera que define si el servidor es alcanzable públicamente (`PUBLIC`) o solo dentro de tu VPC.

**Resultado esperado:** el bucket se crea normalmente; el servidor Transfer Family devuelve un `ServerId` con formato `s-...` — la pieza que, en AWS real, conectaría SFTP tradicional con ese mismo bucket sin que el socio externo sepa que el backend es S3.

**Modifica esto:** describe el servidor con `describe-server` y localiza el campo que indica el tipo de endpoint (`PUBLIC`); investiga en la documentación de AWS qué otra opción existe (`VPC`) y para qué caso de uso.

**Cuándo no usarlo:** no adoptes Transfer Family si puedes migrar a tus socios externos a una API moderna (S3 con presigned URLs, por ejemplo); resérvalo específicamente para cuando el otro lado exige SFTP por restricciones que no controlas.

**Cómo crece tu proyecto:** este servidor es el puente que usaría un socio logístico externo del proyecto para subir manifiestos de carga por SFTP tradicional, aterrizando directo en S3.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Diseña la recepción de manifiestos de un comercio por transferencia administrada. Separa alta del servidor, autenticación y llegada efectiva del archivo; identifica qué fases soporta el laboratorio disponible.

#### Paso 4 · Demostración guiada
```bash
aws s3 mb s3://demo-intercambio-socios
aws transfer create-server --protocols SFTP --endpoint-type PUBLIC --query 'ServerId' --output text
```
Resultado esperado: el bucket se crea normalmente; el servidor devuelve un `ServerId` con formato `s-...` — la pieza que, en AWS real, conectaría el SFTP tradicional del socio con ese mismo bucket, sin que el socio sepa que el backend es S3.
#### Paso 5 · Práctica guiada
Pista: intentá crear un usuario sobre este servidor sin pasarle ningún `--role` de IAM — ese es el fallo deliberado: `create-user` rechaza la llamada, porque Transfer Family necesita saber con qué permisos ese usuario va a poder leer o escribir en el bucket subyacente; sin rol, no hay forma de resolver ese acceso.
#### Paso 6 · Práctica independiente
Documentá qué directorio de inicio, qué rol IAM de mínimo privilegio (Módulo 7) y qué política de retención le darías al socio logístico — pista: su rol no debería poder leer ni escribir fuera de su propio prefijo dentro de `demo-intercambio-socios`.
#### Paso 7 · Cierre
Entregá el servidor y el bucket creados del Paso 4, el error de usuario sin rol del Paso 5, y el diseño de aislamiento del Paso 6; explicá por qué Transfer Family es la herramienta correcta aquí y no, por ejemplo, URLs pre-firmadas de S3 directamente. Siguiente paso: servidor. Errores comunes: compartir claves y rutas sin aislamiento. Fuente oficial: https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html.

### Tema 2: Ciclo de vida del servidor y modelo de usuarios

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear el usuario `socio-logistico` sobre `demo-transfer` y a confirmar que no podés borrar un servidor todavía activo. Prerrequisitos: Tema 1 de este módulo.
#### Paso 2 · Contexto y caso real
RutaFlow necesita que el servidor quede en un estado observable (`ONLINE`/`OFFLINE`) y que `socio-logistico` tenga su propio directorio aislado, no un acceso genérico a todo el bucket.
#### Paso 3 · Teoría, modelo mental y analogía
`ONLINE` significa puerta abierta; un usuario define quién puede entrar y a qué carpeta exacta, el mismo aislamiento por usuario de cualquier servidor FTP tradicional.

**Conceptos clave:** `CreateServer`, estado `ONLINE`/`OFFLINE`, `CreateUser`, directorio de inicio.

Crear un servidor de transferencia (`CreateServer`) requiere especificar los protocolos soportados (SFTP es el más común) y el tipo de endpoint. El servidor nace y se puede detener (`StopServer`) o iniciar (`StartServer`) explícitamente, transicionando entre `ONLINE` y `OFFLINE` — un servidor debe estar `OFFLINE` antes de poder eliminarlo, la misma protección contra eliminación accidental de un recurso en uso que ya viste con grupos objetivo de ELB y bóvedas de Backup.

Un usuario (`CreateUser`) se asocia siempre a un servidor específico, con un rol IAM que determina qué permisos tiene sobre el almacenamiento subyacente, y un directorio de inicio que define qué carpeta ve ese usuario al conectarse — el mismo concepto de aislamiento por usuario que tendría cualquier servidor FTP tradicional, solo que aquí ese directorio típicamente mapea a un prefijo dentro de un bucket S3.

**Analogía:** el ciclo de vida `ONLINE`/`OFFLINE` de un servidor Transfer Family es como el horario de atención de una oficina de correos: puedes cerrarla temporalmente para mantenimiento sin desmantelar el edificio completo, y solo la desmantelas (`DeleteServer`) cuando ya está cerrada y vacía.

**¿Por qué es importante?** Practicar la gestión del ciclo de vida completo —crear, detener, reiniciar, eliminar en el orden correcto— es exactamente el tipo de operación que necesitarás automatizar con infraestructura como código en un despliegue real.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-30/tema-2-ciclo-de-vida.sh — ejecutar con: bash tema-2-ciclo-de-vida.sh
# Etiqueta el servidor: Transfer Family no tiene un campo "nombre", así que
# la etiqueta Name es lo que te permite volver a encontrarlo en otro tema.
SERVER_ID=$(aws transfer create-server --protocols SFTP --endpoint-type PUBLIC \
  --tags Key=Name,Value=demo-transfer --query 'ServerId' --output text)
aws transfer create-user --server-id "$SERVER_ID" --user-name socio-logistico \
  --role arn:aws:iam::000000000000:role/transfer-role --home-directory /uploads
aws transfer stop-server --server-id "$SERVER_ID"
aws transfer describe-server --server-id "$SERVER_ID" --query 'Server.State'
```

`--server-id` es la bandera que identifica a qué servidor pertenece el usuario (un mismo comando de `create-user` no tiene sentido sin especificar el servidor); `--role` es la bandera con el rol IAM que define los permisos del usuario sobre el almacenamiento; `--home-directory` es la bandera que fija la carpeta que ese usuario ve al conectarse.

**Resultado esperado:** el usuario `socio-logistico` queda creado con su directorio de inicio; tras `stop-server`, `describe-server` reporta el estado `OFFLINE`.

**Modifica esto:** intenta eliminar el servidor mientras sigue `ONLINE` (antes de detenerlo) y confirma que `delete-server` lo rechaza — el mismo patrón de protección que ya viste con bóvedas de Backup y grupos objetivo de ELB.

**Cuándo no usarlo:** no reutilices el mismo usuario para socios externos distintos; cada socio debe tener su propio usuario con su propio directorio de inicio aislado.

**Cómo crece tu proyecto:** `socio-logistico` es el usuario que representaría a un proveedor externo con acceso limitado únicamente a la carpeta de manifiestos del proyecto.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Crea un usuario de transferencia limitado al prefijo del comercio de prueba. Inspecciona su configuración y verifica que eliminar al usuario no se confunde con borrar las evidencias almacenadas.

#### Paso 4 · Demostración guiada
```bash
SERVER_ID=$(aws transfer create-server --protocols SFTP --endpoint-type PUBLIC \
  --tags Key=Name,Value=demo-transfer --query 'ServerId' --output text)
aws transfer create-user --server-id "$SERVER_ID" --user-name socio-logistico \
  --role arn:aws:iam::000000000000:role/transfer-role --home-directory /uploads
aws transfer stop-server --server-id "$SERVER_ID"
aws transfer describe-server --server-id "$SERVER_ID" --query 'Server.State'
```
Resultado esperado: `socio-logistico` queda creado con su directorio `/uploads`; tras `stop-server`, `describe-server` reporta `OFFLINE`.
#### Paso 5 · Práctica guiada
Pista: intentá `aws transfer delete-server --server-id "$SERVER_ID"` ANTES de haber corrido `stop-server` (mientras el servidor sigue `ONLINE`) — ese es el fallo deliberado: la llamada se rechaza, el mismo patrón de protección contra eliminación accidental que ya viste con bóvedas de Backup y grupos objetivo de ELB.
#### Paso 6 · Práctica independiente
Agregá un segundo usuario (`otro-socio`) con un `--home-directory` distinto sobre el mismo servidor, y confirmá con `describe-user` que cada uno ve solo su propia carpeta — nunca reutilices el mismo usuario para dos socios externos distintos.
#### Paso 7 · Cierre
Entregá el usuario y el estado `OFFLINE` del Paso 4, el borrado rechazado del Paso 5, y los dos usuarios aislados del Paso 6; explicá por qué un servidor debe estar `OFFLINE` antes de poder eliminarse. Siguiente paso: claves. Errores comunes: usuario sin home y estado no esperado. Fuente oficial: https://docs.aws.amazon.com/transfer/latest/userguide/create-server.html.

### Tema 3: Claves públicas SSH y autenticación de usuarios

#### Paso 1 · Objetivo y preparación
Al finalizar vas a importar la clave pública real de `socio-logistico` (Tema 2), para que se autentique sin contraseña. Prerrequisitos: Tema 2 de este módulo.
#### Paso 2 · Contexto y caso real
RutaFlow no quiere gestionar ni rotar contraseñas compartidas con el socio externo — la práctica estándar de SFTP gestionado es autenticación por clave pública, nunca por contraseña.
#### Paso 3 · Teoría, modelo mental y analogía
La clave pública es la cerradura que instalás; la clave privada se queda siempre con el usuario, nunca viaja ni se comparte.

**Conceptos clave:** `ImportSshPublicKey`, autenticación por clave, sin validación criptográfica en Floci.

Cada usuario de un servidor Transfer Family se autentica mediante clave pública SSH, no contraseña —la práctica de seguridad estándar para acceso SFTP—: importas la clave pública del usuario con `ImportSshPublicKey`, y a partir de ahí, cualquier cliente que posea la clave privada correspondiente podría (en AWS real) conectarse como ese usuario. Un detalle importante para tu práctica en Floci: los cuerpos de las claves SSH se almacenan y devuelven tal cual, sin ninguna validación criptográfica real de que sean claves válidas — puedes practicar el flujo completo de gestión de claves sin necesidad de generar pares de claves genuinos si solo te interesa validar la lógica de tu infraestructura como código.

Este modelo de autenticación por clave —sin contraseñas que gestionar, rotar o filtrar accidentalmente— es el mismo principio de seguridad que ya reforzaste con IMDS en EC2 y autenticación IAM en ElastiCache: preferir credenciales criptográficas verificables sobre secretos compartidos memorizables.

**Analogía:** una clave SSH importada es como entregarle a alguien una llave física troquelada específicamente para su cerradura, en vez de un código numérico que tendría que memorizar y que podría compartir accidentalmente con alguien más por teléfono.

**¿Por qué es importante?** Que Floci no valide criptográficamente las claves te permite enfocar tu práctica en la lógica de gestión de usuarios y permisos —lo que realmente vas a automatizar con IaC— sin la fricción de generar pares de claves reales solo para probar tu script de aprovisionamiento.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-30/tema-3-clave-ssh.sh — ejecutar con: bash tema-3-clave-ssh.sh
# Si tienes varios servidores, filtra por la etiqueta Name=demo-transfer
# con `list-tags-for-resource`; aquí asumimos uno solo para simplificar.
SERVER_ID=$(aws transfer list-servers --query 'Servers[0].ServerId' --output text)
ssh-keygen -t rsa -f /tmp/clave-socio -N "" -q
aws transfer import-ssh-public-key --server-id "$SERVER_ID" --user-name socio-logistico \
  --ssh-public-key-body "$(cat /tmp/clave-socio.pub)"
aws transfer describe-user --server-id "$SERVER_ID" --user-name socio-logistico --query 'User.SshPublicKeys'
```

`--ssh-public-key-body` es la bandera que recibe el contenido de la clave pública en sí (el texto que empieza con `ssh-rsa ...`), no una ruta de archivo — por eso el comando usa `$(cat ...)` para inyectar el contenido directamente.

**Resultado esperado:** `describe-user` muestra la clave pública recién importada asociada a `socio-logistico`, lista para que —en AWS real— cualquiera con la clave privada correspondiente pueda autenticarse.

**Modifica esto:** importa una segunda "clave" con contenido inventado (texto arbitrario, no una clave SSH real) y confirma que Floci la acepta igual — recuerda que no valida criptográficamente el contenido.

**Cuándo no usarlo:** no asumas, por lo anterior, que un texto arbitrario funcionaría como clave contra un Transfer Family real; ahí sí se valida criptográficamente, y esto es exclusivamente una facilidad de práctica en Floci.

**Cómo crece tu proyecto:** esta clave es la que el socio logístico usaría para autenticarse sin contraseña al subir manifiestos al servidor del proyecto.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Asocia una clave pública al usuario del comercio y conserva la privada fuera del repositorio. Documenta una rotación y prueba qué clave deja de aceptarse en un entorno con plano de datos disponible.

#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir el archivo del ejemplo dentro.
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
SERVER_ID=$(aws transfer list-servers --query 'Servers[0].ServerId' --output text)
ssh-keygen -t rsa -f /tmp/clave-socio -N "" -q
aws transfer import-ssh-public-key --server-id "$SERVER_ID" --user-name socio-logistico \
  --ssh-public-key-body "$(cat /tmp/clave-socio.pub)"
aws transfer describe-user --server-id "$SERVER_ID" --user-name socio-logistico --query 'User.SshPublicKeys'
```
Resultado esperado: `describe-user` muestra la clave pública recién importada asociada a `socio-logistico` — en AWS real, cualquiera con la clave privada correspondiente (`/tmp/clave-socio`, que nunca se sube a ningún lado) podría autenticarse como ese usuario.
#### Paso 5 · Práctica guiada
Pista: importá una segunda "clave" con contenido inventado (`--ssh-public-key-body "esto-no-es-una-clave-ssh-real"`) — ese es el fallo deliberado que advierte este Tema: Floci la acepta igual, sin validación criptográfica real, a diferencia de un Transfer Family real donde esa misma llamada sí se validaría contra el formato de clave esperado.
#### Paso 6 · Práctica independiente
Documentá, para `socio-logistico`, cada cuánto correspondería rotar su clave SSH, y qué comando usarías para revocar el acceso de inmediato si esa clave se filtrara (pista: eliminar la clave pública importada, no la cuenta del usuario entera).
#### Paso 7 · Cierre
Entregá la clave importada del Paso 4, la clave inválida aceptada sin validar del Paso 5, y el plan de rotación/revocación del Paso 6; explicá por qué Floci no necesita validar criptográficamente para que practiques la lógica de gestión de usuarios. Siguiente paso: límites del emulador. Errores comunes: compartir privada y asumir validación local completa. Fuente oficial: https://docs.aws.amazon.com/transfer/latest/userguide/requirements-roles.html.

### Tema 4: Los límites de la Fase 1 — plano de gestión completo, plano de datos pendiente

#### Paso 1 · Objetivo y preparación
Al finalizar vas a confirmar en vivo, intentando una conexión SFTP real contra `demo-transfer`, dónde termina el plano de gestión y dónde falta el plano de datos. Prerrequisitos: Temas 1-3 de este módulo.
#### Paso 2 · Contexto y caso real
Antes de prometerle al socio logístico externo que ya puede subir manifiestos por SFTP, alguien del equipo de RutaFlow tiene que saber con certeza si eso ya funciona de punta a punta o solo está configurado.
#### Paso 3 · Teoría, modelo mental y analogía
El plano de gestión configura la oficina completa (servidores, usuarios, claves); el plano de datos es el que efectivamente transporta los paquetes — y en Fase 1, solo el primero está terminado.

**Conceptos clave:** Fase 1, plano de gestión vs plano de datos, transferencia real no emulada.

Como con ELB v2, CloudFront y Route53 en el Módulo 22, Transfer Family en Floci es una implementación de Fase 1: el plano de gestión —crear servidores, usuarios, claves, etiquetas— está completo y es fielmente consultable vía SDK, CLI o Terraform, pero la conectividad SFTP real del plano de datos —efectivamente subir o descargar un archivo por el protocolo SFTP— todavía no está implementada. Puedes validar que tu infraestructura como código crea correctamente el servidor y los usuarios con los permisos esperados, pero no puedes usar un cliente SFTP real para conectarte y transferir un archivo contra Floci todavía.

Reconocer explícitamente esta frontera —qué es plano de gestión emulado vs qué es plano de datos pendiente— es una habilidad que ya has practicado varias veces en este track avanzado: no todos los servicios de Floci tienen el mismo nivel de fidelidad, y usar cada uno sabiendo exactamente qué esperar de él es más valioso que asumir que "todo funciona igual".

**Analogía:** practicar con Transfer Family en su estado actual es como ensayar la coreografía completa de una obra de teatro sin la escenografía final instalada todavía: los movimientos, las entradas y salidas, el guion — todo eso lo puedes ensayar perfectamente; falta el telón de fondo físico para la función completa.

**¿Por qué es importante?** Saber distinguir qué partes de un servicio emulado son completamente confiables para practicar y cuáles requieren validación adicional contra el servicio real antes de producción es, en sí mismo, una competencia profesional importante — la misma que aplicas al leer la documentación de cualquier herramienta nueva que adoptas en un equipo real.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-30/tema-4-limites-fase-1.sh — ejecutar con: bash tema-4-limites-fase-1.sh
SERVER_ID=$(aws transfer list-servers --query 'Servers[0].ServerId' --output text)
aws transfer describe-server --server-id "$SERVER_ID" --query 'Server.{Estado:State,Protocolos:Protocols}'
sftp -i /tmp/clave-socio socio-logistico@localhost 2>&1 | head -3 || true
```

**Resultado esperado:** `describe-server` confirma el plano de gestión completo (estado, protocolos); el intento real de `sftp` falla o no responde — confirmando en vivo que el plano de datos de Fase 1 todavía no está implementado, exactamente como dice la explicación de arriba.

**Modifica esto:** escribe en un README de tu proyecto qué validarías contra AWS real antes de confiar en este flujo para producción (la conectividad SFTP efectiva), separado de lo que ya validaste aquí (la gestión completa de servidores y usuarios).

**Cuándo no usarlo:** no reportes este módulo como "probado end-to-end" en una demo; sé explícito con tu equipo sobre qué parte es plano de gestión verificado y qué parte sigue pendiente de Fase 2.

**Cómo crece tu proyecto:** documentar esta frontera es lo que le permite al equipo decidir con criterio cuándo necesita probar contra AWS real antes de prometer esta integración a un socio externo.

---

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Marca la transferencia de un manifiesto como pendiente si solo está implementado el plano de gestión. La evidencia debe distinguir un servidor registrado de una conexión SFTP que realmente entrega bytes.

#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir el archivo del ejemplo dentro.
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
SERVER_ID=$(aws transfer list-servers --query 'Servers[0].ServerId' --output text)
aws transfer describe-server --server-id "$SERVER_ID" --query 'Server.{Estado:State,Protocolos:Protocols}'
```
Resultado esperado: `describe-server` confirma el plano de gestión completo (estado, protocolos soportados) — todo lo que configuraste en los Temas 1-3 es real y consultable.
#### Paso 5 · Práctica guiada
Pista: probá conectarte de verdad con un cliente SFTP (`sftp -i /tmp/clave-socio socio-logistico@localhost`) — ese es el fallo deliberado que confirma el límite real: la conexión falla o no responde, porque la transferencia efectiva de archivos por SFTP (el plano de datos) todavía no está implementada en Floci, aunque toda la configuración alrededor sí lo esté.
#### Paso 6 · Práctica independiente
Escribí en un README qué validarías contra AWS real antes de confiar en este flujo para producción (la conectividad SFTP efectiva), separado explícitamente de lo que ya quedó probado acá (la gestión completa de servidores, usuarios y claves).
#### Paso 7 · Cierre
Entregá el plano de gestión confirmado del Paso 4, el intento real de SFTP fallido del Paso 5, y el README con la frontera documentada del Paso 6; explicá por qué reportar este módulo como "probado end-to-end" en una demo sería engañoso para el equipo. Siguiente paso: integración. Errores comunes: afirmar transferencia real por ver API verde. Fuente oficial: https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html.

## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear un servidor Transfer Family, controlar su ciclo de vida, crear un usuario e importarle una clave pública SSH, y confirmar el aislamiento correcto de todo el flujo de gestión.

**Requisitos previos:** ninguno adicional a Floci corriendo; puedes generar una clave SSH de prueba con `ssh-keygen -t rsa -f /tmp/clave-prueba` si no tienes una a mano.

### Laboratorio 30.1 — Servidor, usuario y clave SSH

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea el servidor | `aws transfer create-server --protocols SFTP --endpoint-type PUBLIC` | Registra un servidor SFTP gestionado | Un `ServerId` con formato `s-...` |
| 2 | Confirma el estado inicial | `aws transfer describe-server --server-id <server-id>` | Verifica el estado del servidor recién creado | Estado `ONLINE` u `OFFLINE` según configuración |
| 3 | Crea un usuario | `aws transfer create-user --server-id <server-id> --user-name alice --role arn:aws:iam::000000000000:role/transfer-role --home-directory /uploads` | Asocia un usuario al servidor con su directorio de inicio | Confirmación del usuario `alice` |
| 4 | Importa su clave pública SSH | `aws transfer import-ssh-public-key --server-id <server-id> --user-name alice --ssh-public-key-body "$(cat /tmp/clave-prueba.pub)"` | Habilita autenticación por clave para ese usuario | Confirmación de la clave importada |
| 5 | Detén y reinicia el servidor | `aws transfer stop-server --server-id <server-id>` luego `aws transfer start-server --server-id <server-id>` | Practica el ciclo de vida completo | El estado transiciona `ONLINE → OFFLINE → ONLINE` |

**Verificación:** el laboratorio se considera exitoso si `describe-user` muestra a `alice` con la clave SSH importada correctamente asociada, y si `describe-server` confirma que el servidor transicionó correctamente de `ONLINE` a `OFFLINE` y de vuelta a `ONLINE` tras los comandos `stop-server` y `start-server`.

**Errores comunes y soluciones**

- **`delete-server` falla inesperadamente.** El servidor debe estar en estado `OFFLINE` antes de poder eliminarse; detén el servidor primero con `stop-server`.
- **Intentas conectarte con un cliente SFTP real y no funciona.** Comportamiento esperado en la Fase 1 actual: solo el plano de gestión está implementado, no la conectividad SFTP real — revisa el Tema 4.
- **`create-user` falla sin un rol IAM válido.** Aunque Floci no valida el rol contra un servicio real de forma estricta, sigue siendo buena práctica usar un ARN de rol bien formado del Módulo 7 para que tu infraestructura como código sea consistente con lo que necesitarías contra AWS real.

---
