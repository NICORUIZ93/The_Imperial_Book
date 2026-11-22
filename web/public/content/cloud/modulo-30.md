# Módulo 30: Transferencia de archivos gestionada con Transfer Family


## Aprende construyendo


### Tema 1: Qué resuelve Transfer Family · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a crear el servidor SFTP que un socio logístico externo usaría para depositar manifiestos sin tocar directamente el bucket de RutaFlow. Prerrequisitos: Módulo 2 completo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a crear el servidor SFTP que un socio logístico externo usaría para depositar manifiestos sin tocar directamente el bucket de RutaFlow.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en qué resuelve transfer family como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que qué resuelve transfer family resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Qué resuelve Transfer Family se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Qué resuelve Transfer Family | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses qué resuelve transfer family por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: qué resuelve transfer family funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Qué resuelve Transfer Family existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve qué resuelve transfer family en tu contexto?
2. ¿Cómo sabrías que qué resuelve transfer family no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar qué resuelve transfer family?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-30/tema-1-por-que-transfer-family.sh — ejecutar con: bash tema-1-por-que-transfer-family.sh
aws s3 mb s3://demo-intercambio-socios
aws transfer create-server --protocols SFTP --endpoint-type PUBLIC \
  --query 'ServerId' --output text
```

```bash
aws s3 mb s3://demo-intercambio-socios
aws transfer create-server --protocols SFTP --endpoint-type PUBLIC --query 'ServerId' --output text
```

</details>

### Tema 2: Ciclo de vida del servidor y modelo de usuarios · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a crear el usuario socio-logistico sobre demo-transfer y a confirmar que no podés borrar un servidor todavía activo. Prerrequisitos: Tema 1 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a crear el usuario socio-logistico sobre demo-transfer y a confirmar que no podés borrar un servidor todavía activo.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en ciclo de vida del servidor y modelo de usuarios como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que ciclo de vida del servidor y modelo de usuarios resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Ciclo de vida del servidor y modelo de usuarios se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Ciclo de vida del servidor y modelo de usuarios | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses ciclo de vida del servidor y modelo de usuarios por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: ciclo de vida del servidor y modelo de usuarios funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Ciclo de vida del servidor y modelo de usuarios existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve ciclo de vida del servidor y modelo de usuarios en tu contexto?
2. ¿Cómo sabrías que ciclo de vida del servidor y modelo de usuarios no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar ciclo de vida del servidor y modelo de usuarios?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
SERVER_ID=$(aws transfer create-server --protocols SFTP --endpoint-type PUBLIC \
  --tags Key=Name,Value=demo-transfer --query 'ServerId' --output text)
aws transfer create-user --server-id "$SERVER_ID" --user-name socio-logistico \
  --role arn:aws:iam::000000000000:role/transfer-role --home-directory /uploads
aws transfer stop-server --server-id "$SERVER_ID"
aws transfer describe-server --server-id "$SERVER_ID" --query 'Server.State'
```

</details>

### Tema 3: Claves públicas SSH y autenticación de usuarios · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a importar la clave pública real de socio-logistico (Tema 2), para que se autentique sin contraseña. Prerrequisitos: Tema 2 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a importar la clave pública real de socio-logistico (Tema 2), para que se autentique sin contraseña.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en claves públicas ssh y autenticación de usuarios como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que claves públicas ssh y autenticación de usuarios resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Claves públicas SSH y autenticación de usuarios se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Claves públicas SSH y autenticación de usuarios | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses claves públicas ssh y autenticación de usuarios por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: claves públicas ssh y autenticación de usuarios funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Claves públicas SSH y autenticación de usuarios existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve claves públicas ssh y autenticación de usuarios en tu contexto?
2. ¿Cómo sabrías que claves públicas ssh y autenticación de usuarios no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar claves públicas ssh y autenticación de usuarios?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

</details>

### Tema 4: Los límites de la Fase 1 — plano de gestión completo, plano de datos pendiente · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a confirmar en vivo, intentando una conexión SFTP real contra demo-transfer, dónde termina el plano de gestión y dónde falta el plano de datos. Prerrequisitos: Temas 1-3 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a confirmar en vivo, intentando una conexión SFTP real contra demo-transfer, dónde termina el plano de gestión y dónde falta el plano de datos.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en los límites de la fase 1 — plano de gestión completo, plano de datos pendiente como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que los límites de la fase 1 — plano de gestión completo, plano de datos pendiente resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Los límites de la Fase 1 — plano de gestión completo, plano de datos pendiente se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Los límites de la Fase 1 — plano de gestión completo, plano de datos pendiente | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses los límites de la fase 1 — plano de gestión completo, plano de datos pendiente por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: los límites de la fase 1 — plano de gestión completo, plano de datos pendiente funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Los límites de la Fase 1 — plano de gestión completo, plano de datos pendiente existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve los límites de la fase 1 — plano de gestión completo, plano de datos pendiente en tu contexto?
2. ¿Cómo sabrías que los límites de la fase 1 — plano de gestión completo, plano de datos pendiente no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar los límites de la fase 1 — plano de gestión completo, plano de datos pendiente?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-30/tema-4-limites-fase-1.sh — ejecutar con: bash tema-4-limites-fase-1.sh
SERVER_ID=$(aws transfer list-servers --query 'Servers[0].ServerId' --output text)
aws transfer describe-server --server-id "$SERVER_ID" --query 'Server.{Estado:State,Protocolos:Protocols}'
sftp -i /tmp/clave-socio socio-logistico@localhost 2>&1 | head -3 || true
```

```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
SERVER_ID=$(aws transfer list-servers --query 'Servers[0].ServerId' --output text)
aws transfer describe-server --server-id "$SERVER_ID" --query 'Server.{Estado:State,Protocolos:Protocols}'
```

</details>

### Laboratorio 30.1 — Servidor, usuario y clave SSH

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por laboratorio 30.1 — servidor, usuario y clave ssh con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender laboratorio 30.1 — servidor, usuario y clave ssh te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en laboratorio 30.1 — servidor, usuario y clave ssh como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que laboratorio 30.1 — servidor, usuario y clave ssh resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Laboratorio 30.1 — Servidor, usuario y clave SSH se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Laboratorio 30.1 — Servidor, usuario y clave SSH | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses laboratorio 30.1 — servidor, usuario y clave ssh por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: laboratorio 30.1 — servidor, usuario y clave ssh funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Laboratorio 30.1 — Servidor, usuario y clave SSH existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve laboratorio 30.1 — servidor, usuario y clave ssh en tu contexto?
2. ¿Cómo sabrías que laboratorio 30.1 — servidor, usuario y clave ssh no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar laboratorio 30.1 — servidor, usuario y clave ssh?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 30.1 — servidor, usuario y clave ssh.

</details>
