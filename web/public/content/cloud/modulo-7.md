# Módulo 7: Identidad y acceso con IAM


## Aprende construyendo


### Tema 1: Principio de mínimo privilegio · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a escribir la política real que necesita el rol de confirmar-entrega (Módulo 5): ni más ni menos de lo que esa función hace. Prerrequisitos: Módulo 5 completo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a escribir la política real que necesita el rol de confirmar-entrega (Módulo 5): ni más ni menos de lo que esa función hace.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en principio de mínimo privilegio como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que principio de mínimo privilegio resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Principio de mínimo privilegio se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Principio de mínimo privilegio | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses principio de mínimo privilegio por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: principio de mínimo privilegio funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Principio de mínimo privilegio existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve principio de mínimo privilegio en tu contexto?
2. ¿Cómo sabrías que principio de mínimo privilegio no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar principio de mínimo privilegio?

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

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a comprobar, con un error real provocado a propósito, qué parte de la seguridad de ShipmentEvents depende de AWS/Floci y qué parte depende exclusivamente de RutaFlow.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en modelo de responsabilidad compartida como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que modelo de responsabilidad compartida resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Modelo de responsabilidad compartida se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Modelo de responsabilidad compartida | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses modelo de responsabilidad compartida por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: modelo de responsabilidad compartida funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Modelo de responsabilidad compartida existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve modelo de responsabilidad compartida en tu contexto?
2. ¿Cómo sabrías que modelo de responsabilidad compartida no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar modelo de responsabilidad compartida?

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

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a crear el rol real que confirmar-entrega debería usar, en vez de un usuario con claves fijas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en usuarios, grupos y roles como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que usuarios, grupos y roles resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Usuarios, grupos y roles se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Usuarios, grupos y roles | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses usuarios, grupos y roles por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: usuarios, grupos y roles funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Usuarios, grupos y roles existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve usuarios, grupos y roles en tu contexto?
2. ¿Cómo sabrías que usuarios, grupos y roles no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar usuarios, grupos y roles?

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

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás leer una policy desde cero.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en estructura de una política — acciones, recursos y condiciones como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que estructura de una política — acciones, recursos y condiciones resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Estructura de una política — acciones, recursos y condiciones se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Estructura de una política — acciones, recursos y condiciones | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses estructura de una política — acciones, recursos y condiciones por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: estructura de una política — acciones, recursos y condiciones funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Estructura de una política — acciones, recursos y condiciones existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve estructura de una política — acciones, recursos y condiciones en tu contexto?
2. ¿Cómo sabrías que estructura de una política — acciones, recursos y condiciones no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar estructura de una política — acciones, recursos y condiciones?

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

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a rotar de verdad las claves del usuario-de-prueba que creaste en el Tema 3, y a confirmar que la clave vieja queda inutilizable.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales en tu contexto?
2. ¿Cómo sabrías que buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales?

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
