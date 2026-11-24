# Módulo 6: Identidad y acceso con IAM


## Aprende construyendo


### Tema 1: Principio de mínimo privilegio · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a escribir la política real que necesita el rol de confirmar-entrega (Módulo 5): ni más ni menos de lo que esa función hace. Prerrequisitos: Módulo 5 completo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

Crea el archivo `politica-minima.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "dynamodb:PutItem", "Resource": "arn:aws:dynamodb:us-east-1:000000000000:table/ShipmentEvents" },
    { "Effect": "Allow", "Action": ["sqs:ReceiveMessage","sqs:DeleteMessage"], "Resource": "arn:aws:sqs:us-east-1:000000000000:delivery-commands" }
  ]
}
```

```bash
POLICY_ARN=$(aws iam create-policy --policy-name RutaFlowMinimoPrivilegio --policy-document file://politica-minima.json --query Policy.Arn --output text)
aws iam simulate-custom-policy --policy-input-list file://politica-minima.json --action-names dynamodb:PutItem --resource-arns arn:aws:dynamodb:us-east-1:000000000000:table/ShipmentEvents
```

</details>

### Tema 2: Modelo de responsabilidad compartida · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a comprobar, con un error real provocado a propósito, qué parte de la seguridad de ShipmentEvents depende de AWS/Floci y qué parte depende exclusivamente de RutaFlow. Prerrequisitos: Tema 1 de este módulo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
mkdir ejemplo && cd ejemplo && floci start
```

Crea el archivo `politica-excesiva.json`:

```json
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"dynamodb:*","Resource":"*"}]}
```

```bash
aws iam simulate-custom-policy --policy-input-list file://politica-excesiva.json \
  --action-names dynamodb:DeleteTable --resource-arns "arn:aws:dynamodb:us-east-1:000000000000:table/ShipmentEvents"
```

</details>

### Tema 3: Usuarios, grupos y roles · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a crear el rol real que confirmar-entrega debería usar, en vez de un usuario con claves fijas. Prerrequisitos: Tema 1 de este módulo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

Crea el archivo `trust-lambda.json`:

```json
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}
```

```bash
ROLE_ARN=$(aws iam create-role --role-name RutaFlowConfirmarEntregaRole --assume-role-policy-document file://trust-lambda.json --query Role.Arn --output text)
aws iam attach-role-policy --role-name RutaFlowConfirmarEntregaRole --policy-arn "$POLICY_ARN"
aws lambda update-function-configuration --function-name confirmar-entrega --role "$ROLE_ARN"
```

</details>

### Tema 4: Estructura de una política — acciones, recursos y condiciones · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás leer una policy desde cero. Prerrequisitos: AWS CLI y Node.js; verifica node --version.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
mkdir -p ejemplo-policy/src && cd ejemplo-policy
```

Crea el archivo `src/policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {"Effect": "Allow", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::mi-bucket/*"},
    {"Effect": "Deny", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::mi-bucket/privado/*"}
  ]
}
```

```bash
for objeto in publico/guia.pdf privado/nomina.pdf; do
  aws iam simulate-custom-policy --policy-input-list file://src/policy.json \
    --action-names s3:GetObject --resource-arns "arn:aws:s3:::mi-bucket/$objeto" \
    --query 'EvaluationResults[0].ResourceSpecificResults[0].[EvalResourceName,EvalResourceDecision]' --output text
done
```

</details>

### Tema 5: Buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a rotar de verdad las claves del usuario-de-prueba que creaste en el Tema 3, y a confirmar que la clave vieja queda inutilizable. Prerrequisitos: Tema 3 de este módulo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
OLD_KEY=$(aws iam create-access-key --user-name usuario-de-prueba --query 'AccessKey.AccessKeyId' --output text)
NEW_KEY=$(aws iam create-access-key --user-name usuario-de-prueba --query 'AccessKey.AccessKeyId' --output text)
aws iam update-access-key --user-name usuario-de-prueba --access-key-id "$OLD_KEY" --status Inactive
aws iam list-access-keys --user-name usuario-de-prueba
```

</details>
