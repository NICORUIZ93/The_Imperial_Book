# Módulo 0: Linux y shell scripting para DevOps


## Antes de comenzar: construye un laboratorio seguro

DevOps trabaja intensamente con Linux, incluso si tu computador usa Windows o macOS. Necesitas Git, VS Code, Docker y una shell compatible. Practicaremos en local para no generar costos ni modificar servidores reales.


### Windows

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar windows.

</details>

### macOS

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar macos.

</details>

### Linux (Ubuntu/Debian)

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    E0["Fundamentos<br/>módulos 0–3"]
    E1["Aplicación<br/>módulos 4–5"]
    E2["Integración<br/>módulos 6–8"]
    E3["Experto<br/>módulos 9–22"]
    E0 --> E1
    E1 --> E2
    E2 --> E3
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
git --version
docker --version
docker compose version
docker run --rm hello-world
```

```mermaid
flowchart LR
    E0["Fundamentos<br/>módulos 0–3"]
    E1["Aplicación<br/>módulos 4–5"]
    E2["Integración<br/>módulos 6–8"]
    E3["Experto<br/>módulos 9–22"]
    E0 --> E1
    E1 --> E2
    E2 --> E3
```

</details>

### Tema 1: Sistema de archivos y permisos (chmod/chown) · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás leer la notación de permisos de Linux (rwxr-xr--), cambiarla con chmod en notación simbólica y octal, y transferir propiedad con chown, aplicando el principio de mínimo privilegio a archivos reales.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    P["-rwxr-xr-- 1 nicolas devops script.sh"]
    P --> T["Tipo de archivo: - (archivo regular, d = directorio)"]
    P --> O["Propietario: rwx (lectura+escritura+ejecución)"]
    P --> G["Grupo: r-x (lectura + ejecución)"]
    P --> OT["Otros: r-- (solo lectura)"]
    C["chmod 754 script.sh"]
    C --> C1["7 = rwx (dueño)"]
    C --> C2["5 = r-x (grupo)"]
    C --> C3["4 = r-- (otros)"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```bash
mkdir -p academia-devops/src/modulo0/permisos && cd academia-devops/src/modulo0/permisos
```

Crea el archivo `script.sh`:

```bash
#!/bin/bash
echo "hola desde script.sh"
```

```bash
docker run --rm -v "$(pwd)":/work -w /work alpine sh -c \
  'ls -l script.sh; chmod 600 script.sh; ls -l script.sh; chmod 754 script.sh; ls -l script.sh'
```

```bash
docker run --rm -v "$(pwd)":/work -w /work alpine sh -c \
  'chmod 600 script.sh; ls -l script.sh; ./script.sh; echo "codigo de salida: $?"'
```

</details>

### Tema 2: Procesos, señales y jobs en segundo plano · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás identificar el PID de un proceso, enviarle señales (SIGTERM vs SIGKILL) y lanzarlo en segundo plano, entendiendo por qué un servicio bien diseñado debe responder a SIGTERM con un apagado ordenado.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    K1["kill &lt;pid&gt;"] --> S1["SIGTERM"] --> R1["el proceso puede capturarla y cerrar ordenadamente"]
    K2["kill -9 &lt;pid&gt;"] --> S2["SIGKILL"] --> R2["el kernel termina el proceso, sin oportunidad de limpieza"]
    K3["comando &"] --> R3["proceso lanzado en segundo plano, terminal libre"]
    K4["jobs"] --> R4["lista procesos en segundo plano de esta sesión"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    K1["kill &lt;pid&gt;"] --> S1["SIGTERM"] --> R1["el proceso puede capturarla y cerrar ordenadamente"]
    K2["kill -9 &lt;pid&gt;"] --> S2["SIGKILL"] --> R2["el kernel termina el proceso, sin oportunidad de limpieza"]
    K3["comando &"] --> R3["proceso lanzado en segundo plano, terminal libre"]
    K4["jobs"] --> R4["lista procesos en segundo plano de esta sesión"]
```

```bash
mkdir -p academia-devops/src/modulo0/procesos && cd academia-devops/src/modulo0/procesos
```

Crea el archivo `tarea-larga.sh`:

```bash
#!/bin/bash
trap 'echo "recibi SIGTERM, cerrando ordenadamente"; exit 0' TERM
echo "trabajando... PID: $$"
sleep 300
```

```bash
chmod +x tarea-larga.sh
```

```bash
docker run --rm -v "$(pwd)":/work -w /work alpine sh -c './tarea-larga.sh & sleep 1; kill -TERM $!; wait'
```

</details>

### Tema 3: Pipes, redirección y filtros (grep, awk, sed) · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás encadenar grep, awk y sed con pipes para filtrar, extraer y transformar texto de logs, y redirigir su resultado a archivos sin sobrescribir accidentalmente datos existentes.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    A["cat app.log"] -->|lee el archivo completo| B["grep &quot;ERROR&quot;"]
    B -->|filtra líneas con &quot;ERROR&quot;| C["awk '{print $1}'"]
    C -->|extrae 1ra columna| D["sort"]
    D -->|ordena| E["uniq -c"]
    E -->|cuenta ocurrencias únicas| F["resultado"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    A["cat app.log"] -->|lee el archivo completo| B["grep &quot;ERROR&quot;"]
    B -->|filtra líneas con &quot;ERROR&quot;| C["awk '{print $1}'"]
    C -->|extrae 1ra columna| D["sort"]
    D -->|ordena| E["uniq -c"]
    E -->|cuenta ocurrencias únicas| F["resultado"]
```

```bash
mkdir -p academia-devops/src/modulo0/filtros && cd academia-devops/src/modulo0/filtros
```

Crea el archivo `app.log`:

```text
2026-01-01T10:00:00 INFO inicio
2026-01-01T10:00:05 ERROR conexion
2026-01-01T10:00:06 ERROR timeout
2026-01-01T10:00:10 INFO reintento
2026-01-01T10:00:11 ERROR timeout
```

```bash
docker run --rm -v "$(pwd)":/work -w /work alpine sh -c \
  "grep ERROR app.log | awk '{print \$3}' | sort | uniq -c"
```

</details>

### Tema 4: Variables de entorno y scripts bash robustos (set -euo pipefail) · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás escribir scripts bash que usan variables de entorno con valores por defecto seguros y que se detienen inmediatamente ante errores, variables no definidas o fallos ocultos dentro de un pipe.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    S["#!/bin/bash<br/>set -euo pipefail"]
    S --> E["e: el script se detiene en el primer comando que falle"]
    S --> U["u: falla si usas una variable no definida"]
    S --> P["pipefail: un pipe falla si CUALQUIER comando de la cadena falla"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    S["#!/bin/bash<br/>set -euo pipefail"]
    S --> E["e: el script se detiene en el primer comando que falle"]
    S --> U["u: falla si usas una variable no definida"]
    S --> P["pipefail: un pipe falla si CUALQUIER comando de la cadena falla"]
```

```bash
mkdir -p academia-devops/src/modulo0/robusto && cd academia-devops/src/modulo0/robusto
```

Crea el archivo `preparar.sh`:

```bash
#!/bin/bash
set -euo pipefail
ENTORNO="${ENTORNO:-desarrollo}"
echo "Entorno: $ENTORNO"
mkdir -p salida
echo "preparando..." | tee -a salida/log.txt >/dev/null
```

```bash
chmod +x preparar.sh
```

```bash
docker run --rm -v "$(pwd)":/work -w /work bash:5 sh -c './preparar.sh && ./preparar.sh && echo "AMBAS EJECUCIONES OK"'
```

</details>

### Tema 5: Cron y tareas programadas · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás escribir expresiones cron para tareas periódicas y diagnosticar por qué un script que funciona manualmente falla bajo cron por su entorno mínimo.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    C["*/5 * * * * /ruta/script.sh"]
    C --> M["minuto (0-59, */5 = cada 5 minutos)"]
    C --> H["hora (0-23)"]
    C --> D["día del mes (1-31)"]
    C --> MO["mes (1-12)"]
    C --> W["día de la semana (0-6, 0=domingo)"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    C["*/5 * * * * /ruta/script.sh"]
    C --> M["minuto (0-59, */5 = cada 5 minutos)"]
    C --> H["hora (0-23)"]
    C --> D["día del mes (1-31)"]
    C --> MO["mes (1-12)"]
    C --> W["día de la semana (0-6, 0=domingo)"]
```

```bash
mkdir -p academia-devops/src/modulo0/cron && cd academia-devops/src/modulo0/cron
```

Crea el archivo `tarea.sh`:

```bash
#!/bin/bash
set -euo pipefail
echo "$(date -u +%FT%TZ) tarea ejecutada" >> /work/tarea.log
```

```bash
chmod +x tarea.sh
echo "*/1 * * * * /work/tarea.sh" > mi-crontab
```

```bash
docker run --rm -v "$(pwd)":/work -w /work alpine sh -c \
  "crontab /work/mi-crontab && crond -f -l 2 & sleep 65; cat /work/tarea.log; kill %1"
```

</details>

### Tema 6: Hardening básico — SSH sin contraseña, firewalls, SELinux/AppArmor · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás generar un par de claves SSH, deshabilitar autenticación por contraseña, configurar reglas básicas de ufw y explicar qué aporta el control de acceso obligatorio de AppArmor/SELinux más allá de los permisos tradicionales.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    L1["Capa 1: Autenticación SSH por clave pública"] --> L2["Capa 2: Firewall (ufw/iptables)"] --> L3["Capa 3: SELinux / AppArmor"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    L1["Capa 1: Autenticación SSH por clave pública"] --> L2["Capa 2: Firewall (ufw/iptables)"] --> L3["Capa 3: SELinux / AppArmor"]
```

```bash
mkdir -p academia-devops/src/modulo0/hardening && cd academia-devops/src/modulo0/hardening
ssh-keygen -t ed25519 -f clave_demo -N "" -C "demo-academia-devops"
```

```bash
docker run --rm -v "$(pwd)":/work -w /work alpine sh -c \
  "apk add --no-cache openssh >/dev/null 2>&1; mkdir -p /root/.ssh; cat /work/clave_demo.pub > /root/.ssh/authorized_keys; chmod 600 /root/.ssh/authorized_keys; wc -l < /root/.ssh/authorized_keys"
```

</details>

### Tema 7: Redes — modelo OSI, TCP/IP, DNS y balanceadores de carga · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás explicar en qué capa opera una herramienta de red concreta, resolver un nombre DNS manualmente y distinguir un balanceador de capa 4 de uno de capa 7.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    Cliente --> DNS["DNS (ejemplo.com → 203.0.113.10)"] --> LB["Balanceador de carga"]
    LB --> I1["Instancia 1"]
    LB --> I2["Instancia 2"]
    LB --> I3["Instancia 3"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    Cliente --> DNS["DNS (ejemplo.com → 203.0.113.10)"] --> LB["Balanceador de carga"]
    LB --> I1["Instancia 1"]
    LB --> I2["Instancia 2"]
    LB --> I3["Instancia 3"]
```

```bash
mkdir -p academia-devops/src/modulo0/redes && cd academia-devops/src/modulo0/redes
```

```bash
docker run --rm alpine sh -c \
  "apk add --no-cache bind-tools >/dev/null 2>&1; nslookup example.com; nc -vz example.com 443"
```

</details>

### Tema 8: Cultura DevOps y el ciclo Plan→Code→Build→Test→Release→Deploy→Operate→Monitor · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás explicar el ciclo Plan→Code→Build→Test→Release→Deploy→Operate→Monitor como un flujo continuo, no lineal, y documentarlo para tu propio proyecto.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    Plan --> Code --> Build --> Test --> Release --> Deploy --> Operate --> Monitor --> Plan
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    Plan --> Code --> Build --> Test --> Release --> Deploy --> Operate --> Monitor --> Plan
```

```bash
mkdir -p academia-devops/src/modulo0/cultura && cd academia-devops/src/modulo0/cultura
```

Crea el archivo `ciclo.md`:

```markdown
# Ciclo DevOps del proyecto
- Plan: priorizamos incidentes reportados en Monitor.
- Code -> Build -> Test -> Release -> Deploy -> Operate -> Monitor.
```

```bash
docker run --rm -v "$(pwd)":/work -w /work alpine sh -c "cat /work/ciclo.md; wc -l /work/ciclo.md"
```

</details>

### Tema 9: NGINX y proxies desde cero · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás levantar NGINX como proxy inverso delante de un backend real, conservar cabeceras como X-Forwarded-For, y diagnosticar un 502 Bad Gateway cuando el backend cae.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  C[Cliente :8080] --> E[NGINX edge]
  E -->|/api/health se convierte en /health| B[backend:3000]
  E --> A[access log JSON]
  B -. no publica puerto al host .- E
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir -p academia-devops/src/modulo0/nginx-demo/{nginx,backend}
cd academia-devops/src/modulo0/nginx-demo
touch compose.yaml nginx/default.conf backend/server.js
```

```text
academia-devops/src/modulo0/nginx-demo/
├── compose.yaml
├── nginx/default.conf
└── backend/server.js
```

```js
const http = require('node:http'); // servidor HTTP nativo, sin dependencias externas
const instance = process.env.INSTANCE_NAME ?? 'unknown';

http.createServer((request, response) => {
  if (request.url !== '/health') {
    response.writeHead(404).end('not found');
    return;
  }
  response.writeHead(200, {'content-type': 'application/json'});
  response.end(JSON.stringify({
    status: 'ok',
    instance,
    requestId: request.headers['x-request-id'] ?? null
  }));
}).listen(3000, '0.0.0.0');
```

```nginx
upstream demo_api {
    server backend:3000 max_fails=3 fail_timeout=10s;
    keepalive 16;
}

log_format demo_json escape=json
  '{"time":"$time_iso8601","request_id":"$request_id",'
  '"status":$status,"method":"$request_method","uri":"$uri",'
  '"upstream":"$upstream_addr","upstream_time":"$upstream_response_time"}';

server {
    listen 80;
    access_log /var/log/nginx/access.log demo_json;

    location /api/ {
        proxy_pass http://demo_api/;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Request-ID $request_id;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 2s;
        proxy_read_timeout 5s;
    }
}
```

```yaml
services:
  backend:
    image: node:24-alpine
    working_dir: /app
    command: ["node", "server.js"]
    environment:
      INSTANCE_NAME: backend-a
    volumes:
      - ./backend:/app:ro
    expose: ["3000"]

  edge:
    image: nginx:1.30-alpine
    ports: ["8080:80"]
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on: [backend]
```

```mermaid
flowchart LR
  C[Cliente :8080] --> E[NGINX edge]
  E -->|/api/health se convierte en /health| B[backend:3000]
  E --> A[access log JSON]
  B -. no publica puerto al host .- E
```

</details>

### Tema 10: Usuarios, grupos, permisos compartidos y sudo con mínimo privilegio · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás crear usuarios y grupos, compartir una carpeta entre un equipo con permisos de grupo y el bit setgid, comprobar quién puede leer qué y conceder sudo solo para un comando concreto. Prerrequisitos: Temas 1 y 6 de este módulo (permisos y hardening).

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    A[ana] --> G[grupo despacho]
    G --> D["/srv/rutaflow/manifiestos 2770"]
    B[beto] -. sin grupo .-> D
    A --> S[sudo: solo systemctl restart despacho]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    A[ana] --> G[grupo despacho]
    G --> D["/srv/rutaflow/manifiestos 2770"]
    B[beto] -. sin grupo .-> D
    A --> S[sudo: solo systemctl restart despacho]
```

```bash
mkdir usuarios-linux && cd usuarios-linux
```

```bash
#!/usr/bin/env bash
# Ejecutar como root dentro de un contenedor Ubuntu desechable
set -euo pipefail

groupadd despacho                                  # grupo del equipo de despacho
useradd --create-home --shell /bin/bash --groups despacho ana
useradd --create-home --shell /bin/bash beto       # beto NO pertenece a despacho

mkdir -p /srv/rutaflow/manifiestos
echo "BO-004512;Chapinero" > /srv/rutaflow/manifiestos/hoy.csv
chown -R root:despacho /srv/rutaflow/manifiestos
chmod 2770 /srv/rutaflow/manifiestos              # setgid: lo nuevo hereda el grupo despacho
chmod 640 /srv/rutaflow/manifiestos/hoy.csv

echo "--- identidades"
id ana
id beto
echo "--- permisos"
ls -ld /srv/rutaflow/manifiestos
ls -l /srv/rutaflow/manifiestos

echo "--- ana lee y crea archivos"
sudo -u ana cat /srv/rutaflow/manifiestos/hoy.csv
sudo -u ana touch /srv/rutaflow/manifiestos/manana.csv
ls -l /srv/rutaflow/manifiestos/manana.csv | awk '{print $3, $4, $9}'

echo "--- beto intenta leer"
sudo -u beto cat /srv/rutaflow/manifiestos/hoy.csv || echo "beto fue rechazado (código $?)"

echo "--- sudo limitado: ana puede reiniciar solo el servicio de despacho"
echo 'ana ALL=(root) NOPASSWD: /usr/bin/systemctl restart despacho.service' > /etc/sudoers.d/despacho
chmod 440 /etc/sudoers.d/despacho
visudo -cf /etc/sudoers.d/despacho
sudo -l -U ana | tail -1
```

```bash
docker run --rm -v "$(pwd)":/work -w /work ubuntu:24.04 bash -c \
  "apt-get update -qq && apt-get install -y -qq sudo >/dev/null && bash usuarios.sh"
```

```text
--- identidades
uid=1001(ana) gid=1002(ana) groups=1002(ana),1001(despacho)
uid=1002(beto) gid=1003(beto) groups=1003(beto)
--- permisos
drwxrws--- 2 root despacho 4096 Oct 28 21:51 /srv/rutaflow/manifiestos
total 4
-rw-r----- 1 root despacho 20 Oct 28 21:51 hoy.csv
--- ana lee y crea archivos
BO-004512;Chapinero
ana despacho /srv/rutaflow/manifiestos/manana.csv
--- beto intenta leer
cat: /srv/rutaflow/manifiestos/hoy.csv: Permission denied
beto fue rechazado (código 1)
--- sudo limitado: ana puede reiniciar solo el servicio de despacho
/etc/sudoers.d/despacho: parsed OK
    (root) NOPASSWD: /usr/bin/systemctl restart despacho.service
```

</details>

### Tema 11: systemd: servicios, timers y logs con journalctl · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás escribir una unidad de servicio y un timer de systemd, validarlos sin arrancarlos, calcular sus próximas ejecuciones y operar el servicio con systemctl y journalctl. Prerrequisitos: Temas 2, 5 y 10 de este módulo (procesos, cron y usuarios).

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    T[reporte-despacho.timer] -- 06:30 --> S[reporte-despacho.service]
    S -- User=ana --> P[reporte-despacho.sh]
    P -- stdout --> J[(journal)]
    J --> Q[journalctl -u reporte-despacho]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    T[reporte-despacho.timer] -- 06:30 --> S[reporte-despacho.service]
    S -- User=ana --> P[reporte-despacho.sh]
    P -- stdout --> J[(journal)]
    J --> Q[journalctl -u reporte-despacho]
```

```bash
mkdir systemd-despacho && cd systemd-despacho
```

```bash
#!/usr/bin/env bash
set -euo pipefail
# Escribe a stdout: systemd lo envía al journal, sin archivos de log propios
echo "Reporte de despacho generado: $(date --iso-8601=seconds)"
echo "Entregas pendientes: $(wc -l < /srv/rutaflow/pendientes.csv)"
```

```ini
[Unit]
Description=Genera el reporte diario de despacho de RutaFlow
After=network-online.target

[Service]
Type=oneshot
User=ana
ExecStart=/usr/local/bin/reporte-despacho.sh
# Endurecimiento: el servicio no puede escribir en /home ni ganar privilegios
ProtectHome=true
NoNewPrivileges=true
```

```ini
[Unit]
Description=Ejecuta el reporte de despacho de lunes a sábado a las 6:30

[Timer]
OnCalendar=Mon..Sat *-*-* 06:30:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
#!/usr/bin/env bash
set -uo pipefail
install -m 755 reporte-despacho.sh /usr/local/bin/reporte-despacho.sh
cp reporte-despacho.service reporte-despacho.timer /etc/systemd/system/

echo "--- verificación de las unidades"
systemd-analyze verify /etc/systemd/system/reporte-despacho.service /etc/systemd/system/reporte-despacho.timer \
  && echo "unidades válidas"

echo "--- próximas ejecuciones del timer"
systemd-analyze calendar --iterations=3 --base-time='2026-10-30 12:00' 'Mon..Sat *-*-* 06:30:00' | grep -E 'Original|Normalized|Next|Iter'
```

</details>
