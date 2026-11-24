# Módulo 29: Transferencia de archivos gestionada con Transfer Family


## Aprende construyendo


### Tema 1: Qué resuelve Transfer Family · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a crear el servidor SFTP que un socio logístico externo usaría para depositar manifiestos sin tocar directamente el bucket de RutaFlow. Prerrequisitos: Módulo 2 completo.

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

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 30.1 — servidor, usuario y clave ssh.

</details>
