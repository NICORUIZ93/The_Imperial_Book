# Módulo 7: Identidad y acceso con IAM


## Aprende construyendo

### Tema 1: Principio de mínimo privilegio

#### Paso 1 · Objetivo y preparación
Al finalizar vas a escribir la política real que necesita el rol de `confirmar-entrega` (Módulo 5): ni más ni menos de lo que esa función hace. Prerrequisitos: Módulo 5 completo.
#### Paso 2 · Contexto y caso real
`confirmar-entrega` solo hace dos cosas: leer mensajes de `DeliveryCommands` y escribir en `ShipmentEvents`. No necesita borrar tablas, no necesita acceso a `PruebasEntrega`, no necesita nada de IAM ni de EC2 — cualquier permiso más allá de eso es exceso, no "por si acaso".
#### Paso 3 · Teoría, modelo mental y analogía
Mínimo privilegio es entregar solo la llave de la habitación necesaria: todo lo demás está denegado por defecto, no hay que "quitarlo" después.

**Conceptos clave:** mínimo privilegio, superficie de ataque, permisos por defecto denegados.

El principio de mínimo privilegio establece que cualquier identidad —una persona, una aplicación, un servicio— debe tener únicamente los permisos estrictamente necesarios para realizar su función, y ningún permiso adicional "por si acaso" o "por comodidad". En IAM, este principio se refuerza con un comportamiento por defecto importante: cualquier acción sobre cualquier recurso está denegada de forma implícita a menos que exista una política que la permita explícitamente. No existe un estado inicial de "todo permitido" que debas ir restringiendo; el punto de partida es "nada permitido", y vas concediendo permisos específicos según se necesitan.

Este enfoque reduce directamente lo que se conoce como superficie de ataque: si una credencial se ve comprometida —por una fuga accidental, un error de configuración, o un ataque exitoso—, el daño que un atacante puede causar con esa credencial está limitado exactamente a los permisos que esa identidad tenía concedidos, ni uno más. Una credencial con permisos administrativos completos comprometida es un incidente de seguridad potencialmente catastrófico; esa misma credencial, si solo tenía permiso de lectura sobre un bucket específico, limita el daño posible a esa acción concreta sobre ese recurso concreto.

Aplicar mínimo privilegio en la práctica no es una tarea de una sola vez: requiere revisar periódicamente qué permisos realmente se usan (muchos proveedores de nube, incluyendo AWS en su entorno real, ofrecen herramientas de análisis de acceso que muestran qué permisos concedidos nunca se han usado realmente), y retirar permisos que ya no son necesarios porque la función de esa identidad cambió con el tiempo. Es común, en la práctica real, que las políticas de una organización acumulen permisos "de más" con el tiempo, porque es más fácil conceder un permiso nuevo cuando surge una necesidad puntual que revisar y retirar permisos antiguos que dejaron de usarse.

Un error común al aplicar mal este principio es sobrecompensar en la dirección opuesta: hacer las políticas tan restrictivas que rompen funcionalidad legítima, generando fricción operativa que empuja a los equipos a conceder permisos más amplios de los necesarios "para que deje de fallar", exactamente el resultado contrario al buscado. El objetivo real no es "restringir al máximo posible" de forma ciega, sino conceder exactamente lo necesario, ni más ni menos, y eso requiere entender bien qué acciones concretas necesita cada identidad para cumplir su función.

**Analogía:** el mínimo privilegio es como dar llaves de un edificio: en vez de entregar una llave maestra que abre todas las puertas a cada empleado nuevo, le das solo las llaves de las puertas que realmente necesita para su trabajo diario. Si esa llave se pierde o se la roban, el acceso comprometido se limita a esas puertas específicas, no a todo el edificio.

**¿Por qué es importante?** La configuración excesivamente permisiva de permisos es, de forma consistente, una de las causas más citadas de incidentes de seguridad graves en la nube real, muchas veces no por un ataque sofisticado sino simplemente porque una credencial con permisos demasiado amplios terminó expuesta por accidente (en un repositorio público, en un log, en una configuración mal protegida). Aplicar mínimo privilegio de forma consistente es una de las defensas más efectivas y de menor coste de implementación contra ese tipo de incidentes.

**Diagrama:**

```
Sin mínimo privilegio:                  Con mínimo privilegio:
┌─────────────────────┐               ┌─────────────────────┐
│ Usuario con acceso      │               │ Usuario con acceso      │
│ TOTAL a todos los         │               │ SOLO a lo que necesita   │
│ servicios y recursos       │               │ para su función especifica│
└─────────────────────┘               └─────────────────────┘
Si se compromete:                       Si se compromete:
  daño potencial = TODO                    daño potencial = LIMITADO
```

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Separa los permisos de lectura de seguimiento y escritura de evidencias. Prueba una operación permitida y otra denegada; registra qué acciones requieren además validación en un entorno IAM real.

**Límites y decisión de uso:** Una prueba local permitida o denegada no demuestra la evaluación completa de IAM real. Revisa acciones, recursos y condiciones en el entorno objetivo; ampliar a comodines para hacer pasar el laboratorio elimina precisamente la restricción que necesitas comprobar.

#### Paso 4 · Demostración guiada
```bash
cat > politica-minima.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "dynamodb:PutItem", "Resource": "arn:aws:dynamodb:us-east-1:000000000000:table/ShipmentEvents" },
    { "Effect": "Allow", "Action": ["sqs:ReceiveMessage","sqs:DeleteMessage"], "Resource": "arn:aws:sqs:us-east-1:000000000000:delivery-commands" }
  ]
}
EOF
POLICY_ARN=$(aws iam create-policy --policy-name RutaFlowMinimoPrivilegio --policy-document file://politica-minima.json --query Policy.Arn --output text)
aws iam simulate-custom-policy --policy-input-list file://politica-minima.json --action-names dynamodb:PutItem --resource-arns arn:aws:dynamodb:us-east-1:000000000000:table/ShipmentEvents
```
Resultado esperado: el simulador devuelve `EvalDecision: "allowed"` solo para esa acción sobre esa tabla exacta — nada en la política menciona `PruebasEntrega`, `DeleteTable` ni ningún otro servicio.
#### Paso 5 · Práctica guiada
Pista: agregá un statement de más a `politica-minima.json` (`"Action": "dynamodb:*", "Resource": "*"`) y volvé a correr `simulate-custom-policy`, esta vez pidiendo `dynamodb:DeleteTable` sobre una tabla distinta (`arn:...table/ShipmentEvents` de otro ambiente, por ejemplo) — ese es el fallo deliberado: ahora el simulador responde `"allowed"` para borrar una tabla que `confirmar-entrega` nunca debería poder tocar. Quitá ese statement para corregirlo.
#### Paso 6 · Práctica independiente
Corré `simulate-custom-policy` pidiendo `s3:GetObject` sobre `arn:aws:s3:::pruebas-entrega/*` contra la política ya corregida, y confirmá que la respuesta es `implicitDeny` — documentá por qué esa denegación es correcta y esperada, no un bug.
#### Paso 7 · Cierre
Entregá la política mínima, el permiso excesivo del Paso 5 y su corrección, y la denegación esperada del Paso 6; explicá por qué "denegado por defecto" es más seguro que empezar permisivo e ir restringiendo. Siguiente paso: modelo de responsabilidad. Errores comunes: usar * y olvidar recursos. Fuente oficial: https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html.

### Tema 2: Modelo de responsabilidad compartida

#### Paso 1 · Objetivo y preparación
Al finalizar vas a comprobar, con un error real provocado a propósito, qué parte de la seguridad de `ShipmentEvents` depende de AWS/Floci y qué parte depende exclusivamente de RutaFlow. Prerrequisitos: Tema 1 de este módulo.
#### Paso 2 · Contexto y caso real
AWS (y Floci emulándolo) garantiza que DynamoDB en sí funciona de forma segura. Que la política de `confirmar-entrega` sea exactamente la mínima necesaria, y no más, es responsabilidad exclusiva de RutaFlow — nadie del lado del proveedor te va a avisar si te pasás de permisos.
#### Paso 3 · Teoría, modelo mental y analogía
Es como alquilar un edificio con portero: el edificio es responsable de la estructura y la entrada principal; tú eres responsable de cerrar con llave tu propia oficina.

**Conceptos clave:** responsabilidad del proveedor, responsabilidad del cliente, seguridad "de" la nube vs seguridad "en" la nube.

El modelo de responsabilidad compartida define, con una línea explícita, qué aspectos de seguridad son responsabilidad del proveedor de nube y cuáles son responsabilidad de quien usa esos servicios. El proveedor es responsable de la seguridad "de" la nube: la infraestructura física de los centros de datos, la virtualización subyacente, la disponibilidad del hardware, y la seguridad del software base de cada servicio gestionado. El cliente es responsable de la seguridad "en" la nube: cómo configura esos servicios, qué datos guarda en ellos, quién tiene acceso, y cómo gestiona sus propias credenciales.

Esta distinción explica por qué, aunque uses un servicio completamente gestionado como S3 o DynamoDB, sigues siendo responsable de configurar correctamente los permisos de acceso a tus propios buckets y tablas. El proveedor garantiza que el servicio S3 en sí mismo funciona de forma segura y confiable a nivel de infraestructura, pero no puede (ni debería) evitar que tú, como cliente, configures una política de bucket demasiado permisiva que exponga tus datos accidentalmente al público. Ese error de configuración es enteramente responsabilidad del cliente, no del proveedor.

La proporción exacta de responsabilidad varía según el tipo de servicio: en un servicio de infraestructura básica (como una máquina virtual sin gestionar), el cliente asume más responsabilidad (parcheo del sistema operativo, configuración de red, gestión de accesos); en un servicio completamente gestionado y serverless como Lambda o DynamoDB, el proveedor asume más responsabilidad operativa (parcheo del runtime, gestión de la infraestructura subyacente), pero el cliente sigue siendo enteramente responsable de la configuración de acceso (políticas IAM) y del contenido de los datos que procesa o almacena.

Entender este modelo evita dos malentendidos comunes: asumir que "está en la nube, entonces es seguro por defecto" (ignorando la parte de responsabilidad que corresponde al cliente), o, en el otro extremo, subestimar las garantías reales que el proveedor sí ofrece sobre la infraestructura subyacente. La gran mayoría de los incidentes de seguridad reportados en la nube real caen del lado de la responsabilidad del cliente: configuraciones incorrectas, permisos demasiado amplios, credenciales expuestas, no fallos de la infraestructura del proveedor en sí.

**Analogía:** el modelo de responsabilidad compartida es como alquilar un apartamento en un edificio con seguridad: el edificio (el proveedor) es responsable de que la estructura sea segura, de que el ascensor funcione, y de que haya un portero en la entrada principal. Tú, como inquilino (el cliente), eres responsable de cerrar con llave la puerta de tu propio apartamento, de no dejar la ventana abierta, y de decidir a quién le das una copia de tu llave. Si dejas tu puerta abierta y alguien entra, no es culpa del edificio ni de su sistema de seguridad general.

**¿Por qué es importante?** Entender exactamente dónde termina la responsabilidad del proveedor y empieza la tuya es fundamental para no operar con una falsa sensación de seguridad. La configuración de IAM, las políticas de bucket, y las decisiones de acceso que tú tomas son, en la inmensa mayoría de los incidentes reales de seguridad en la nube, el punto donde algo salió mal, no un fallo del proveedor.

**Diagrama:**

```
┌───────────────────────────────────────────────────┐
│  RESPONSABILIDAD DEL CLIENTE                          │
│  Configuración de IAM, políticas de bucket, datos,      │
│  gestión de credenciales, cifrado de aplicación           │
├───────────────────────────────────────────────────┤
│  RESPONSABILIDAD DEL PROVEEDOR                        │
│  Infraestructura física, virtualización, disponibilidad  │
│  del servicio, seguridad del software base                │
└───────────────────────────────────────────────────┘
```

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Construye una matriz de responsabilidades para las evidencias: proveedor, equipo y repartidor. Asigna quién configura acceso, retención y recuperación, y adjunta una comprobación operativa para cada responsabilidad del equipo.

#### Paso 4 · Demostración guiada
**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe el archivo que se muestra a continuación con el contenido de este tema.
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
cat > politica-excesiva.json <<'EOF'
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"dynamodb:*","Resource":"*"}]}
EOF
aws iam simulate-custom-policy --policy-input-list file://politica-excesiva.json \
  --action-names dynamodb:DeleteTable --resource-arns "arn:aws:dynamodb:us-east-1:000000000000:table/ShipmentEvents"
```
Resultado esperado: `EvalDecision: "allowed"` — AWS/Floci no impide que escribas esta política; el motor de evaluación hace exactamente lo que la política dice, sin juzgar si es una buena idea. Que sea una mala idea es 100% responsabilidad del cliente.
#### Paso 5 · Práctica guiada
Pista: ese `dynamodb:*`/`Resource: "*"` del Paso 4 ES el fallo deliberado — una política así, atada por error al rol real de `confirmar-entrega`, le daría a una función que solo debería escribir eventos la capacidad de borrar cualquier tabla DynamoDB de la cuenta. Corregilo reemplazándola por `politica-minima.json` del Tema 1 y repetí la simulación: ahora `EvalDecision` es `implicitDeny`.
#### Paso 6 · Práctica independiente
Listá, en una tabla de dos columnas, qué cubre Floci/AWS (que DynamoDB funcione, que los datos no se corrompan a nivel de infraestructura) frente a qué cubre RutaFlow (qué política se le asigna a cada rol, qué tablas son accesibles desde cuál función) — usando los dos resultados de `simulate-custom-policy` de este Tema como evidencia de cada lado.
#### Paso 7 · Cierre
Entregá los dos resultados del simulador (permitido con la política excesiva, denegado con la mínima) y la tabla de responsabilidades; explicá por qué ninguno de los dos resultados es un fallo de Floci/AWS. Siguiente paso: usuarios y roles. Errores comunes: asumir que el proveedor configura tu bucket. Fuente oficial: https://aws.amazon.com/compliance/shared-responsibility-model/.

### Tema 3: Usuarios, grupos y roles

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear el rol real que `confirmar-entrega` debería usar, en vez de un usuario con claves fijas. Prerrequisitos: Tema 1 de este módulo.
#### Paso 2 · Contexto y caso real
`confirmar-entrega` no es una persona que inicia sesión: es un servicio que necesita credenciales que expiren solas. Un usuario IAM con claves de acceso embebidas en el código sería exactamente el error que este Tema busca evitar.
#### Paso 3 · Teoría, modelo mental y analogía
Un usuario es una persona con llave fija en el bolsillo; un grupo es una copia de esa llave para varios miembros; un rol es la llave de un casillero de hotel, válida solo durante la estancia.

**Conceptos clave:** usuario IAM, grupo IAM, rol IAM, credenciales de larga duración vs temporales, asunción de rol.

Un usuario IAM representa una identidad individual y persistente dentro de tu cuenta, típicamente asociada a una persona real (aunque también se usa, con menos frecuencia recomendada, para aplicaciones). Un usuario tiene credenciales de larga duración: una contraseña para acceso a la consola, y/o un par de claves de acceso (access key ID y secret access key) para acceso programático, que permanecen válidas hasta que se rotan o revocan manualmente. Esta persistencia es, a la vez, su utilidad principal (una persona necesita poder autenticarse repetidamente a lo largo del tiempo) y su mayor riesgo (una credencial de larga duración filtrada sigue siendo válida hasta que alguien la revoque activamente).

Un grupo IAM es simplemente una colección de usuarios a los que se les puede asignar políticas de forma conjunta: en vez de adjuntar la misma política individualmente a diez usuarios distintos, adjuntas la política una vez al grupo, y añades esos diez usuarios como miembros del grupo. Esto simplifica enormemente la gestión a escala: si necesitas ajustar los permisos de todo un equipo, modificas la política del grupo una sola vez, en vez de repetir el cambio en cada usuario individual.

Un rol IAM es conceptualmente distinto de un usuario: no representa una identidad persistente con credenciales propias de larga duración, sino un conjunto de permisos que cualquier identidad autorizada —un usuario, un servicio de AWS como Lambda, o incluso una identidad externa a tu cuenta— puede "asumir" temporalmente, obteniendo credenciales de corta duración válidas solo por un periodo limitado (normalmente entre minutos y horas). Cuando una función Lambda se ejecuta, no usa las credenciales de larga duración de ningún usuario: asume el rol que le asignaste al desplegarla, obteniendo credenciales temporales generadas específicamente para esa ejecución, que expiran automáticamente después.

Esta diferencia —credenciales de larga duración (usuario) frente a credenciales temporales obtenidas al asumir un rol— es la razón central por la que, en la práctica moderna de seguridad en la nube, se prefiere fuertemente el uso de roles sobre la creación de usuarios con credenciales de larga duración para casi cualquier caso de uso de servicio a servicio (una Lambda accediendo a S3, un servicio accediendo a DynamoDB), reservando los usuarios IAM principalmente para personas que necesitan acceso interactivo persistente, y frecuentemente ni siquiera para eso en organizaciones que usan un proveedor de identidad federado en su lugar.

**Analogía:** un usuario IAM con sus credenciales de larga duración es como una llave de tu casa que llevas contigo permanentemente en el bolsillo: útil porque siempre la tienes, pero si la pierdes, sigue siendo válida hasta que cambies la cerradura. Un grupo es como hacer copias idénticas de esa llave para varios miembros de la familia que necesitan el mismo acceso. Un rol es como una llave de un casillero de hotel que se genera nueva y válida solo durante tu estancia, y que deja de funcionar automáticamente al hacer el check-out, sin que nadie tenga que ir físicamente a "recogerla" o desactivarla manualmente.

**¿Por qué es importante?** Elegir mal entre usuario y rol —típicamente, crear un usuario IAM con credenciales de larga duración y embeberlas directamente en el código de una aplicación o de una función Lambda, en vez de asignarle un rol— es uno de los errores de seguridad más comunes y más fácilmente evitables en arquitecturas cloud reales, precisamente porque expone credenciales permanentes en lugares (código fuente, variables de entorno, archivos de configuración) con mayor riesgo de filtración accidental que el mecanismo de asunción temporal de roles.

**Diagrama:**

```
Usuario IAM                    Grupo IAM                    Rol IAM
┌───────────────┐             ┌───────────────┐           ┌───────────────┐
│ Credenciales de   │             │ Colección de       │           │ Sin credenciales   │
│ larga duración      │             │ usuarios que          │           │ propias; se "asume"  │
│ (persona, o app     │             │ comparten políticas    │           │ y da credenciales     │
│  con menos           │             │                       │           │ TEMPORALES             │
│  recomendación)      │             │                       │           │ (Lambda, servicios)    │
└───────────────┘             └───────────────┘           └───────────────┘
```

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Define roles distintos para despliegue, consulta y procesamiento de entregas. Explica cómo se obtienen credenciales temporales y verifica que el consumidor no necesita las facultades administrativas del despliegue.

#### Paso 4 · Demostración guiada
```bash
cat > trust-lambda.json <<'EOF'
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}
EOF
ROLE_ARN=$(aws iam create-role --role-name RutaFlowConfirmarEntregaRole --assume-role-policy-document file://trust-lambda.json --query Role.Arn --output text)
aws iam attach-role-policy --role-name RutaFlowConfirmarEntregaRole --policy-arn "$POLICY_ARN"
aws lambda update-function-configuration --function-name confirmar-entrega --role "$ROLE_ARN"
```
Resultado esperado: `create-role` devuelve el rol con su `trust policy` restringida a `lambda.amazonaws.com` (ningún usuario humano puede asumirlo directamente); `update-function-configuration` confirma que `confirmar-entrega` ahora usa `RoleArn: $ROLE_ARN`, con la política mínima del Tema 1 adjunta, en vez de ningún usuario con claves fijas.
#### Paso 5 · Práctica guiada
Pista: creá un usuario IAM normal (`aws iam create-user --user-name usuario-de-prueba`) y probá `aws lambda update-function-configuration --function-name confirmar-entrega --role <Arn-del-usuario>` — ese es el fallo deliberado: `InvalidParameterValueException`, porque el campo `--role` de Lambda exige un rol que el servicio `lambda.amazonaws.com` pueda asumir, no el ARN de un usuario.
#### Paso 6 · Práctica independiente
Confirmá con `aws lambda get-function-configuration --function-name confirmar-entrega --query Role` que el rol asignado sigue siendo `RutaFlowConfirmarEntregaRole`, y documentá por escrito cuánto dura una credencial temporal obtenida al asumir ese rol frente a una clave de usuario IAM que nunca expira sola.
#### Paso 7 · Cierre
Entregá la creación del rol, su asignación a la función, y el error al intentar usar un usuario en su lugar; explicá por qué el `trust policy` restringido a `lambda.amazonaws.com` es parte de la seguridad, no un detalle de sintaxis. Siguiente paso: políticas. Errores comunes: claves largas en repositorio y no rotar. Fuente oficial: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html.

### Tema 4: Estructura de una política — acciones, recursos y condiciones

#### Paso 1 · Objetivo y preparación
Al finalizar podrás leer una policy desde cero. Prerrequisitos: AWS CLI y Node.js; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una policy traduce una regla de negocio en autorización evaluable.
#### Paso 3 · Teoría, modelo mental y analogía
Effect decide, Action describe operación, Resource delimita objeto y Condition añade contexto.

**Conceptos clave:** documento de política JSON, `Effect` (Allow/Deny), `Action`, `Resource`, `Condition`, ARN.

Una política IAM es un documento JSON que describe qué está permitido o denegado. Su estructura básica gira en torno a declaraciones (statements), cada una con al menos tres componentes: `Effect`, que es `Allow` o `Deny`; `Action`, que especifica qué operaciones concretas cubre esa declaración (por ejemplo, `s3:GetObject`, `dynamodb:PutItem`), usando el formato `servicio:Accion`; y `Resource`, que especifica sobre qué recursos concretos aplica, normalmente usando el ARN (Amazon Resource Name) exacto o un patrón con comodines (como `arn:aws:s3:::mi-bucket/*` para "cualquier objeto dentro de `mi-bucket`").

Un cuarto componente opcional, `Condition`, permite refinar aún más cuándo aplica una declaración, más allá de la acción y el recurso: por ejemplo, permitir una acción solo si la petición proviene de un rango de direcciones IP específico, solo durante ciertas horas del día, o solo si la petición incluye cifrado en tránsito. Las condiciones son lo que permite expresar reglas de negocio de seguridad más matizadas que un simple "permitir esta acción sobre este recurso", sin necesidad de mecanismos externos adicionales.

Cuando una petición llega a AWS, el motor de evaluación de políticas revisa todas las políticas aplicables a esa identidad (las adjuntas directamente al usuario, las de cualquier grupo del que sea miembro, y las del rol si aplica) y determina el resultado final siguiendo una regla explícita: si existe una declaración `Deny` explícita que aplica a esa petición, el resultado final es siempre denegado, sin importar cuántas declaraciones `Allow` existan; si no hay ningún `Deny` explícito pero tampoco ningún `Allow` que aplique, el resultado por defecto es denegado (recordando el comportamiento "denegado por defecto" del Tema 1); solo si existe al menos un `Allow` aplicable y ningún `Deny` aplicable, la acción se permite.

Esta jerarquía —`Deny` explícito siempre gana— es una herramienta de seguridad deliberada: permite establecer políticas de "barrera" a nivel de organización que ningún permiso más permisivo concedido después puede anular accidentalmente. Por ejemplo, una organización puede establecer una política que deniegue explícitamente cualquier acción fuera de una región geográfica específica, y esa restricción se mantiene sin importar qué otras políticas más permisivas se concedan individualmente a usuarios o roles específicos.

**Analogía:** una política IAM es como un contrato de acceso muy específico: "se permite (`Effect: Allow`) entrar a la sala de archivos (`Resource`) solo para consultar documentos (`Action: leer`), y solo en horario de oficina (`Condition`)". Si existe otro contrato distinto que dice explícitamente "prohibido el acceso a la sala de archivos después de las 6 PM" (`Deny` explícito), esa prohibición se respeta sin importar que el primer contrato pareciera permitirlo en términos generales de "horario de oficina" mal definido.

**¿Por qué es importante?** Saber leer y escribir correctamente la estructura de una política —especialmente entender que un `Deny` explícito siempre prevalece sobre cualquier `Allow`— es una habilidad indispensable para diagnosticar por qué una acción específica está siendo denegada cuando, a primera vista, parece que debería estar permitida por alguna política que sí la menciona.

**Diagrama:**

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mi-bucket/*"
    },
    {
      "Effect": "Deny",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mi-bucket/privado/*"
    }
  ]
}
   → Permite leer cualquier objeto de "mi-bucket",
     EXCEPTO los que estén bajo el prefijo "privado/"
     (el Deny explícito gana sobre el Allow general)
```

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Redacta una política para el prefijo de evidencias autorizado. Revisa acciones, recurso y condiciones con ejemplos concretos de claves aceptadas y rechazadas; evita ampliar recursos para ocultar un error de ARN.

#### Paso 4 · Demostración guiada
Crea `src/policy.json` desde una carpeta vacía.
```bash
mkdir ejemplo-policy
node --version
```

**Ejecuta el ejemplo** (con Floci corriendo en local, ejecuta el comando contra el emulador):

```bash
floci up
aws --endpoint-url http://localhost:4566 sts get-caller-identity
```
Confirma la respuesta del servicio emulado.

Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: cambia Allow por Deny para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Escribe una policy de lectura de un bucket.
#### Paso 7 · Cierre
Entrega JSON, salida, fallo y corrección; explica el resultado. Siguiente paso: auditoría. Errores comunes: Resource *, Deny inesperado y ARN mal formado. Fuente oficial: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html.

### Tema 5: Buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales

#### Paso 1 · Objetivo y preparación
Al finalizar vas a rotar de verdad las claves del `usuario-de-prueba` que creaste en el Tema 3, y a confirmar que la clave vieja queda inutilizable. Prerrequisitos: Tema 3 de este módulo.
#### Paso 2 · Contexto y caso real
`confirmar-entrega` usa un rol (Tema 3), así que nunca tiene una clave de larga duración que rotar — pero cualquier identidad humana real del equipo de RutaFlow (un desarrollador con acceso de consola) sí la tiene, y esa es la que hay que rotar periódicamente.
#### Paso 3 · Teoría, modelo mental y analogía
Rotar una credencial es cambiar la cerradura aunque no haya indicios de robo; el objetivo es que una clave filtrada y no detectada deje de servir pronto, no nunca.

**Conceptos clave:** rotación de credenciales, políticas administradas vs políticas en línea, auditoría de acceso, autenticación multifactor (MFA).

Además de preferir roles sobre usuarios para casos de servicio a servicio (Tema 3), y de aplicar mínimo privilegio en cada política (Tema 1), existen prácticas operativas adicionales que forman parte del estándar de la industria para gestionar IAM de forma segura y sostenible. La rotación periódica de credenciales de larga duración —cambiar las claves de acceso de un usuario cada cierto intervalo de tiempo, incluso si no hay indicio de que se hayan comprometido— reduce la ventana de exposición de cualquier credencial que sí se haya filtrado sin que nadie lo haya detectado todavía: cuanto más frecuente la rotación, menor el tiempo durante el cual una credencial filtrada sigue siendo válida y explotable.

Preferir políticas administradas (managed policies) sobre políticas en línea (inline policies) es otra práctica recomendada de mantenibilidad: una política administrada es un documento independiente y reutilizable que puede adjuntarse a múltiples usuarios, grupos o roles a la vez, y que se audita y versiona como una entidad propia, mientras que una política en línea está embebida directamente dentro de un usuario, grupo o rol específico, y solo aplica a esa entidad concreta, lo que dificulta mantener consistencia si necesitas el mismo conjunto de permisos en varias identidades distintas.

La autenticación multifactor (MFA) añade una capa adicional de verificación —normalmente un código temporal generado por una aplicación o dispositivo físico, además de la contraseña— para el acceso interactivo de usuarios, de forma que comprometer únicamente la contraseña de un usuario no sea suficiente para obtener acceso: el atacante necesitaría también el segundo factor, que típicamente vive en un dispositivo físico distinto y mucho más difícil de comprometer remotamente que una contraseña filtrada en una base de datos robada de otro servicio.

Finalmente, la auditoría periódica de acceso —revisar qué permisos existen, quién los tiene, y cuáles se usan realmente en la práctica— es lo que convierte el mínimo privilegio en una práctica sostenida en el tiempo, en vez de un estado inicial correcto que se degrada silenciosamente a medida que se conceden permisos nuevos sin retirar nunca los que dejaron de ser necesarios. Servicios de análisis de acceso (como IAM Access Analyzer en AWS real) automatizan buena parte de esta auditoría, señalando permisos concedidos que nunca se han usado, como candidatos claros para revisar y potencialmente retirar.

**Analogía:** estas buenas prácticas son como el mantenimiento periódico de la seguridad de un edificio, más allá de simplemente instalar buenas cerraduras el primer día: cambiar las cerraduras periódicamente aunque no haya indicios de robo (rotación de credenciales), tener un catálogo centralizado y reutilizable de "niveles de acceso" estándar en vez de definir permisos ad hoc para cada empleado nuevo (políticas administradas), exigir una tarjeta además de una llave para las áreas más sensibles (MFA), y hacer una ronda periódica revisando quién todavía tiene acceso a zonas que ya no necesita (auditoría de acceso).

**¿Por qué es importante?** Ninguna de estas prácticas por sí sola es suficiente, pero juntas forman una defensa en profundidad: incluso si una práctica falla en un caso concreto (una contraseña se filtra), las demás (MFA, rotación, mínimo privilegio) limitan el daño potencial de esa falla individual, en vez de depender de que un único mecanismo de seguridad nunca falle.

**Diagrama:**

```
┌──────────────────────────────────────────────────────┐
│           Defensa en profundidad de IAM                   │
├──────────────────────────────────────────────────────┤
│  Mínimo privilegio     → limita el daño si algo falla       │
│  Roles sobre usuarios   → credenciales temporales, no       │
│                            permanentes, para servicios        │
│  Rotación de credenciales → reduce ventana de exposición      │
│  MFA                    → una contraseña filtrada no basta    │
│  Auditoría periódica    → detecta permisos de más con tiempo  │
└──────────────────────────────────────────────────────┘
```

En el proyecto integrador RutaFlow, `ConfirmarEntregaFn` nunca necesita este ciclo de rotación:
su rol en `examples/rutaflow/cloud/template.yaml` (vía `DynamoDBWritePolicy`) usa credenciales
temporales emitidas y renovadas automáticamente por AWS, la razón de fondo por la que el Tema 3
recomienda roles sobre usuarios para cualquier identidad de servicio.

---

#### Paso 4 · Demostración guiada
```bash
OLD_KEY=$(aws iam create-access-key --user-name usuario-de-prueba --query 'AccessKey.AccessKeyId' --output text)
NEW_KEY=$(aws iam create-access-key --user-name usuario-de-prueba --query 'AccessKey.AccessKeyId' --output text)
aws iam update-access-key --user-name usuario-de-prueba --access-key-id "$OLD_KEY" --status Inactive
aws iam list-access-keys --user-name usuario-de-prueba
```
Resultado esperado: `list-access-keys` muestra ambas claves — `$OLD_KEY` con `Status: Inactive` y `$NEW_KEY` con `Status: Active` — el patrón real de rotación: la nueva ya funciona antes de desactivar la vieja, sin ventana de corte donde ninguna clave sirva.
#### Paso 5 · Práctica guiada
Pista: borrá del todo la clave vieja (`aws iam delete-access-key --user-name usuario-de-prueba --access-key-id "$OLD_KEY"`) y después probá `aws iam get-access-key-last-used --access-key-id "$OLD_KEY"` — ese es el fallo deliberado: `NoSuchEntity`, porque una clave borrada no deja rastro consultable, a diferencia de una simplemente inactiva.
#### Paso 6 · Práctica independiente
Confirmá con `aws iam list-access-keys --user-name usuario-de-prueba` que ahora solo aparece `$NEW_KEY`, y documentá por escrito cada cuánto tiempo correspondería repetir este ciclo completo para `usuario-de-prueba` si fuera una cuenta real de un desarrollador.
#### Paso 7 · Cierre
Entregá la creación de ambas claves, la desactivación de la vieja, el error `NoSuchEntity` del Paso 5 y la lista final con una sola clave activa; explicá por qué desactivar antes de borrar evita una ventana sin acceso válido. Siguiente paso: almacenamiento seguro. Errores comunes: compartir claves y no revisar CloudTrail. Fuente oficial: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html.

## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear un usuario con permisos mínimos (solo lectura sobre un bucket específico), organizarlo en un grupo, y verificar esos permisos con el simulador de políticas de IAM.

**Requisitos previos:** Floci corriendo con el servicio IAM activo, un bucket ya existente para probar los permisos (puedes reutilizar `mi-bucket` del Módulo 2, o crear uno nuevo).

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear el bucket de prueba (si no existe) | `aws s3 mb s3://bucket-solo-lectura` | Prepara un bucket específico para verificar permisos restringidos | `make_bucket: bucket-solo-lectura` |
| 2 | Crear un usuario IAM | `aws iam create-user --user-name usuario-lectura` | Crea la identidad de usuario a la que le vas a asignar permisos mínimos | Un JSON con `User` y su `Arn` |
| 3 | Crear un grupo IAM | `aws iam create-group --group-name grupo-solo-lectura` | Prepara un grupo para gestionar el permiso de forma reutilizable | Un JSON con `Group` y su `Arn` |
| 4 | Añadir el usuario al grupo | `aws iam add-user-to-group --user-name usuario-lectura --group-name grupo-solo-lectura` | El usuario hereda cualquier política que se adjunte al grupo | Sin salida (comando exitoso) |
| 5 | Escribir la política de mínimo privilegio | Crea un archivo `politica.json` con:<br>`{`<br>`  "Version": "2012-10-17",`<br>`  "Statement": [{`<br>`    "Effect": "Allow",`<br>`    "Action": "s3:GetObject",`<br>`    "Resource": "arn:aws:s3:::bucket-solo-lectura/*"`<br>`  }]`<br>`}` | Permite únicamente leer objetos (no listarlos, no escribirlos) de ese bucket específico | El archivo se guarda sin errores de sintaxis JSON |
| 6 | Crear la política administrada | `aws iam create-policy --policy-name PoliticaSoloLectura --policy-document file://politica.json` | Registra la política como una entidad reutilizable; guarda el `Arn` devuelto | Un JSON con `Policy` y su `Arn` |
| 7 | Adjuntar la política al grupo | `aws iam attach-group-policy --group-name grupo-solo-lectura --policy-arn <Arn-de-la-politica>` | El usuario, como miembro del grupo, hereda ahora este permiso | Sin salida (comando exitoso) |
| 8 | Verificar el permiso concedido con el simulador | `aws iam simulate-principal-policy --policy-source-arn <Arn-del-usuario> --action-names s3:GetObject --resource-arns arn:aws:s3:::bucket-solo-lectura/archivo.txt` | Simula si esa acción concreta sobre ese recurso concreto sería permitida, sin necesidad de ejecutar la acción real | Un JSON con `EvalDecision: "allowed"` |
| 9 | Verificar que una acción NO concedida es denegada | `aws iam simulate-principal-policy --policy-source-arn <Arn-del-usuario> --action-names s3:DeleteObject --resource-arns arn:aws:s3:::bucket-solo-lectura/archivo.txt` | Confirma que el mínimo privilegio funciona: esta acción nunca fue concedida | Un JSON con `EvalDecision: "implicitDeny"` |

**Comprobación visual:** abre Floci UI y revisa la sección IAM. Desde la versión 0.4.0 esta superficie está conectada (ya no es un placeholder genérico); deberías poder ver el grupo, el usuario y la política creados en este laboratorio. Si tu versión instalada es anterior, no esperes administración completa de usuarios y políticas desde la consola, y esa limitación debe ser deliberadamente visible, no oculta. En cualquier caso, para seguridad la evidencia autoritativa debe venir de `get-policy-version` y `simulate-principal-policy`, nunca solo de una pantalla.

**Verificación:** el laboratorio se considera exitoso si el paso 8 confirma `"allowed"` para `s3:GetObject`, y el paso 9 confirma `"implicitDeny"` (o `explicitDeny`) para `s3:DeleteObject`, demostrando que el usuario tiene exactamente lectura y ningún permiso de borrado. Registra la disponibilidad de IAM en Floci UI sin tratar un placeholder como un fallo.

**Errores comunes y soluciones**

- **El simulador devuelve `implicitDeny` incluso para `s3:GetObject`.** Verifica que el `Resource` en tu política coincide exactamente con el ARN que usaste en `simulate-principal-policy` (incluyendo el sufijo `/*` si tu política lo especifica así, y que el nombre del bucket coincida carácter por carácter).
- **`MalformedPolicyDocument` al crear la política.** El archivo `politica.json` tiene un error de sintaxis JSON (una coma de más, comillas mal cerradas). Valida el JSON con cualquier herramienta de validación antes de volver a intentarlo.
- **Confundir adjuntar una política al usuario directamente frente a adjuntarla al grupo.** Si adjuntas la política solo al grupo pero el usuario no es miembro de ese grupo (paso 4 olvidado), el usuario no hereda el permiso, y el simulador debería reflejar correctamente esa ausencia.
- **Olvidar que `simulate-principal-policy` no ejecuta la acción real.** Es una herramienta de verificación teórica basada en las políticas actuales; no sustituye una prueba funcional real si necesitas confirmar comportamiento observable, solo confirma qué decidiría el motor de evaluación de políticas para esa combinación específica de acción y recurso.

---
