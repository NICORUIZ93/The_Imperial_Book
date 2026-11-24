# Módulo 18: Autenticación de usuarios con Cognito


## Aprende construyendo


### Tema 1: Por qué no construir tu propio sistema de autenticación · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a registrar un conductor real de RutaFlow en Cognito, en vez de inventar un sistema de login propio para la app del conductor. Prerrequisitos: Módulo 6 completo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a registrar un conductor real de RutaFlow en Cognito, en vez de inventar un sistema de login propio para la app del conductor.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en por qué no construir tu propio sistema de autenticación como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    U["Conductor"] -->|sign-up + password| CP["Cognito User Pool\n(hashing, verificación, códigos)"]
    CP -->|UserConfirmed:false + UserSub| U
    U -->|confirm-sign-up con código| CP
    CP -->|usuario confirmado, listo para initiate-auth| U
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Por qué no construir tu propio sistema de autenticación se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Por qué no construir tu propio sistema de autenticación | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses por qué no construir tu propio sistema de autenticación por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: por qué no construir tu propio sistema de autenticación funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Por qué no construir tu propio sistema de autenticación existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve por qué no construir tu propio sistema de autenticación en tu contexto?
2. ¿Cómo sabrías que por qué no construir tu propio sistema de autenticación no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar por qué no construir tu propio sistema de autenticación?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
aws cognito-idp create-user-pool --pool-name MiApp --auto-verified-attributes email
aws cognito-idp sign-up --client-id <client-id> --username alice@ejemplo.com --password "Segura123!" --user-attributes Name=email,Value=alice@ejemplo.com
```

```bash
aws cognito-idp create-user-pool --pool-name MiApp --auto-verified-attributes email
aws cognito-idp create-user-pool-client --user-pool-id <pool-id> --client-name web-client --no-generate-secret
```

```mermaid
flowchart LR
    U["Conductor"] -->|sign-up + password| CP["Cognito User Pool\n(hashing, verificación, códigos)"]
    CP -->|UserConfirmed:false + UserSub| U
    U -->|confirm-sign-up con código| CP
    CP -->|usuario confirmado, listo para initiate-auth| U
```

```bash
POOL_ID=$(aws cognito-idp create-user-pool --pool-name RutaFlowConductores --auto-verified-attributes email --query UserPool.Id --output text)
CLIENT_ID=$(aws cognito-idp create-user-pool-client --user-pool-id "$POOL_ID" --client-name app-conductor --no-generate-secret --query UserPoolClient.ClientId --output text)
aws cognito-idp sign-up --client-id "$CLIENT_ID" --username conductor-c891@rutaflow.com --password "Segura123!" \
  --user-attributes Name=email,Value=conductor-c891@rutaflow.com
```

</details>

### Tema 2: Access Token, ID Token y Refresh Token · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a loguear al conductor del Tema 1 y a distinguir cuál de los tres tokens que recibís debería usarse para llamar POST /entregas. Prerrequisitos: Tema 1 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a loguear al conductor del Tema 1 y a distinguir cuál de los tres tokens que recibís debería usarse para llamar POST /entregas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en access token, id token y refresh token como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    A["Access Token"] --> A1["autoriza acceso a APIs (permisos, scopes)"]
    B["ID Token"] --> B1["identidad del usuario (sub, email, grupos)"]
    C["Refresh Token"] --> C1["renueva Access/ID Token sin reingresar credenciales"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Access Token, ID Token y Refresh Token se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Access Token, ID Token y Refresh Token | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses access token, id token y refresh token por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: access token, id token y refresh token funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Access Token, ID Token y Refresh Token existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve access token, id token y refresh token en tu contexto?
2. ¿Cómo sabrías que access token, id token y refresh token no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar access token, id token y refresh token?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
aws cognito-idp initiate-auth --client-id <client-id> --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=alice@ejemplo.com,PASSWORD="Segura123!"
```

```mermaid
flowchart LR
    A["Access Token"] --> A1["autoriza acceso a APIs (permisos, scopes)"]
    B["ID Token"] --> B1["identidad del usuario (sub, email, grupos)"]
    C["Refresh Token"] --> C1["renueva Access/ID Token sin reingresar credenciales"]
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
aws cognito-idp initiate-auth --client-id "$CLIENT_ID" --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters USERNAME=conductor-c891@rutaflow.com,PASSWORD="Segura123!" \
  --query 'AuthenticationResult.{Access:AccessToken,Id:IdToken,Refresh:RefreshToken}'
```

</details>

### Tema 3: OAuth 2.0 y PKCE · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

![Flujo OAuth 2.0 con PKCE: la app genera verifier y challenge, el usuario se autentica y la app cambia código más verifier por tokens](content/figures/animados/oauth2-pkce.svg)

*Figura animada. El código de autorización solo sirve junto al verifier que nunca salió de la app.*

#### ► DE QUÉ TRATA
Al finalizar vas a armar el flujo OAuth 2.0 con PKCE que la app móvil del conductor necesita, porque esa app no puede guardar ningún secreto de cliente de forma segura. Prerrequisitos: Temas 1-2 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a armar el flujo OAuth 2.0 con PKCE que la app móvil del conductor necesita, porque esa app no puede guardar ningún secreto de cliente de forma segura.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en oauth 2.0 y pkce como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant Cliente
    participant Servidor
    Note over Cliente: genera verificador aleatorio → deriva un challenge
    Cliente->>Servidor: inicia flujo de autorización con el challenge
    Servidor->>Cliente: emite código de autorización
    Cliente->>Servidor: presenta el código + el verificador ORIGINAL
    Servidor->>Cliente: valida y emite el token
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| OAuth 2.0 y PKCE se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar OAuth 2.0 y PKCE | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses oauth 2.0 y pkce por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: oauth 2.0 y pkce funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- OAuth 2.0 y PKCE existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve oauth 2.0 y pkce en tu contexto?
2. ¿Cómo sabrías que oauth 2.0 y pkce no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar oauth 2.0 y pkce?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
sequenceDiagram
    participant Cliente
    participant Servidor
    Note over Cliente: genera verificador aleatorio → deriva un challenge
    Cliente->>Servidor: inicia flujo de autorización con el challenge
    Servidor->>Cliente: emite código de autorización
    Cliente->>Servidor: presenta el código + el verificador ORIGINAL
    Servidor->>Cliente: valida y emite el token
```

```bash
aws cognito-idp describe-user-pool-client --user-pool-id "$POOL_ID" --client-id "$CLIENT_ID" \
  --query 'UserPoolClient.AllowedOAuthFlows'
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
CODE_VERIFIER=$(openssl rand -base64 48 | tr '+/' '-_' | tr -d '=')
CODE_CHALLENGE=$(printf '%s' "$CODE_VERIFIER" | openssl dgst -sha256 -binary | base64 | tr '+/' '-_' | tr -d '=')
echo "verifier: ${#CODE_VERIFIER} caracteres, challenge: ${#CODE_CHALLENGE} caracteres"
echo "Abre en el navegador: http://localhost:4566/oauth2/authorize?client_id=$CLIENT_ID&response_type=code&code_challenge=$CODE_CHALLENGE&code_challenge_method=S256&redirect_uri=rutaflow://callback"
```

</details>
