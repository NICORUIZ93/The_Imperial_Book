# Módulo 0.4 · Git, terminal, HTTP, JSON, YAML, variables de entorno

**Entorno de referencia (2026-05-22):** git 2.x, bash/zsh, curl, Node.js v24.18.0. Ejemplos ejecutables con herramientas locales; no se usan servicios externos.

Este módulo cubre herramientas transversales de todo microservicio: versionado, terminal, protocolo HTTP, formatos JSON/YAML y configuración por variables de entorno.

## Aprende construyendo

### Tema 1: Git · Básico · 120 min

Caso guía: guardar historia de cambios, trabajar en rama y volver atrás con seguridad.

#### Repositorio y commit

**Definición formal.** Un repositorio Git almacena historial de snapshots (commits) y metadatos; un commit es un objeto inmutable que referencia un árbol de archivos y metadatos (autor, fecha, mensaje, padres).

**Para qué sirve.** Trazabilidad, colaboración y reversión.

**Cuándo usarlo.** En todo proyecto de código/configuración. No guardes secretos ni artefactos generados.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
rm -rf /tmp/ms3-git && mkdir -p /tmp/ms3-git && cd /tmp/ms3-git
git init -q -b main
git config user.name test && git config user.email t@t
echo hola > a.txt
git add a.txt && git commit -q -m init
git log --oneline | wc -l | tr -d ' '
```

**Caso de uso real.** Historial de cambios de API.

**Error común.** Commits enormes sin mensaje útil. Corrección: commits pequeños con intención clara.

**Verificación (2026-05-22).** Salida: `1`.

#### Staging, rama y merge

**Definición formal.** Staging (index) selecciona cambios para el próximo commit; una rama es una referencia móvil a commits; merge integra historias.

**Para qué sirve.** Aislar trabajo y controlar qué entra en cada snapshot.

**Cuándo usarlo.** Rama por feature/fix; merge tras revisión.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/ms3-git
git checkout -q -b feat
echo v2 > a.txt
git commit -qam change
git checkout -q main
git merge -q feat
cat a.txt
```

**Caso de uso real.** Desarrollar endpoint sin romper `main`.

**Error común.** Editar directo en main sin revisión. Corrección: rama + PR/revisión.

**Verificación (2026-05-22).** Salida: `v2`.

### Tema 2: Terminal · Básico · 120 min

Caso guía: navegar, inspeccionar archivos y encadenar comandos.

#### Shell, comando y exit code

**Definición formal.** La shell interpreta comandos; cada comando es un proceso con stdin/stdout/stderr y código de salida.

**Para qué sirve.** Operar, automatizar y diagnosticar.

**Cuándo usarlo.** Siempre en desarrollo/ops. Evita comandos destructivos sin verificar ruta.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms3-sh && cd /tmp/ms3-sh
echo hi > f.txt
wc -c < f.txt | tr -d ' '
false || echo fallback
```

**Caso de uso real.** Scripts de build/deploy.

**Error común.** Ignorar exit code. Corrección: `set -euo pipefail` en scripts bash.

**Verificación (2026-05-22).** Salida: `3` y `fallback`.

#### Pipes y redirección

**Definición formal.** Pipe (`|`) conecta stdout de un proceso a stdin de otro; redirección (`>`, `>>`, `2>`) envía salida a archivos/streams.

**Para qué sirve.** Componer herramientas pequeñas.

**Cuándo usarlo.** Procesar texto/logs/datos. No parses HTML complejo con pipes frágiles.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/ms3-sh
printf "a\nb\na\n" | sort | uniq -c | awk '{print $1,$2}'
```

**Caso de uso real.** Contar errores en logs.

**Error común.** Sobrescribir archivo con `>` por accidente. Corrección: verificar destino; usar `>>` solo cuando corresponda.

**Verificación (2026-05-22).** Salida: `2 a` y `1 b`.

### Tema 3: HTTP · Básico · 120 min

Caso guía: pedir y crear recursos con semántica HTTP.

#### Request/Response HTTP

**Definición formal.** HTTP es un protocolo de aplicación request-response; un request tiene método, URI, headers y body opcional; una response tiene status, headers y body.

**Para qué sirve.** Comunicación estándar entre clientes y servicios.

**Cuándo usarlo.** APIs web/microservicios. No uses GET para mutar estado.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms3-http && cd /tmp/ms3-http
cat > server.mjs << 'JS'
import http from 'node:http';
const s=http.createServer((req,res)=>{ if(req.url==='/ok'){res.writeHead(200,{'Content-Type':'text/plain'});res.end('OK');} else {res.writeHead(404);res.end();}});
s.listen(0,'127.0.0.1', async ()=>{ const b=`http://127.0.0.1:${s.address().port}`; const r=await fetch(b+'/ok'); console.log(r.status, await r.text()); s.close(); });
JS
node server.mjs
```

**Caso de uso real.** Endpoint de health.

**Error común.** Ignorar códigos de estado. Corrección: manejar 2xx/4xx/5xx explícitamente.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `200 OK`.

#### Idempotencia y métodos

**Definición formal.** Un método idempotente produce el mismo efecto final al repetirse (GET, PUT, DELETE según semántica); POST normalmente no es idempotente.

**Para qué sirve.** Diseñar retries seguros.

**Cuándo usarlo.** GET para lectura, POST para creación, PUT para reemplazo idempotente.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms3-idem && cd /tmp/ms3-idem
cat > idem.mjs << 'JS'
const store = new Map();
function put(id, val){ store.set(id,val); return store.get(id); }
console.log(put('a',1)); console.log(put('a',1));
JS
node idem.mjs
```

**Caso de uso real.** Reintentar PUT con mismo recurso.

**Error común.** Reintentar POST de pago sin idempotency key. Corrección: idempotency key.

**Verificación (2026-05-22).** Salida: `1`, `1`.

### Tema 4: JSON · Básico · 120 min

Caso guía: enviar y validar mensajes entre servicios.

#### JSON

**Definición formal.** JSON (JavaScript Object Notation) es un formato textual para datos estructurados (objetos, arrays, strings, números, booleanos, null).

**Para qué sirve.** Intercambio de datos legible y ampliamente soportado.

**Cuándo usarlo.** APIs HTTP, config simple, mensajes. No para comentarios o tipos binarios complejos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms3-json && cd /tmp/ms3-json
cat > j.mjs << 'JS'
const obj = {id:1, ok:true, tags:['a']};
const s = JSON.stringify(obj);
console.log(s);
console.log(JSON.parse(s).tags[0]);
JS
node j.mjs
```

**Caso de uso real.** Body de request/response.

**Error común.** Asumir JSON válido sin validar. Corrección: parse + validación de esquema.

**Verificación (2026-05-22).** Salida: `{"id":1,"ok":true,"tags":["a"]}` y `a`.

#### Validación y contrato

**Definición formal.** Validar JSON es comprobar sintaxis y esquema/tipos antes de usarlo.

**Para qué sirve.** Evita errores y vulnerabilidades por input malformado.

**Cuándo usarlo.** En todo borde de entrada.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/ms3-json
cat > v.mjs << 'JS'
function parseUser(s){ const o=JSON.parse(s); if(typeof o.id!=='number') throw new Error('bad'); return o; }
try { parseUser('{"id":"x"}'); } catch { console.log('400'); }
console.log(parseUser('{"id":1}').id);
JS
node v.mjs
```

**Caso de uso real.** Rechazar payload inválido con 400.

**Error común.** Confiar en `any`/objeto sin validar. Corrección: esquema/validación.

**Verificación (2026-05-22).** Salida: `400`, `1`.

### Tema 5: YAML · Básico · 120 min

Caso guía: configurar servicios con archivos YAML.

#### YAML

**Definición formal.** YAML es un formato de serialización legible por humanos basado en indentación y estructuras clave/valor, listas y mapas.

**Para qué sirve.** Configuración de Docker Compose, Kubernetes, CI, Spring.

**Cuándo usarlo.** Config declarativa. Cuidado con indentación y tipos implícitos.

**Ejemplo mínimo enfocado (ejecutable con Python disponible).**

```bash
mkdir -p /tmp/ms3-yaml && cd /tmp/ms3-yaml
cat > app.yaml << 'Y'
service:
  port: 8080
  enabled: true
Y
python3 - <<'PY'
import yaml
obj=yaml.safe_load(open('app.yaml'))
print(obj['service']['port'], obj['service']['enabled'])
PY
```

**Caso de uso real.** `docker-compose.yml`, `application.yml`.

**Error común.** Tabs o indentación incorrecta. Corrección: espacios consistentes y validador YAML.

**Verificación (2026-05-22).** Salida: `8080 True`.

#### YAML seguro

**Definición formal.** Parsear YAML de forma segura significa deshabilitar construcciones peligrosas/inesperadas y validar esquema.

**Para qué sirve.** Evita ejecución/interpretación inesperada y errores de config.

**Cuándo usarlo.** Siempre al leer YAML de terceros o config.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
python3 - <<'PY'
import yaml
print(yaml.safe_load('a: 1\nb: true')['a'])
PY
```

**Caso de uso real.** Leer config CI.

**Error común.** Usar loader inseguro. Corrección: `safe_load`.

**Verificación (2026-05-22).** Salida: `1`.

### Tema 6: Variables de entorno · Básico · 120 min

Caso guía: configurar puerto/secreto por entorno sin hardcodear.

#### Variable de entorno

**Definición formal.** Variable clave/valor proporcionada al proceso por el entorno de ejecución.

**Para qué sirve.** Configurar por despliegue (dev/test/prod) sin cambiar código.

**Cuándo usarlo.** Puertos, URLs, flags, secretos (vía secret manager). No hardcodees secretos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
PORT=3001 NAME=demo node -e "console.log(process.env.PORT, process.env.NAME)"
```

**Caso de uso real.** `DATABASE_URL`, `PORT`.

**Error común.** Falta de valor por defecto o validación. Corrección: validar config al arranque (fail-fast).

**Verificación (2026-05-22).** Salida: `3001 demo`.

#### Configuración y secretos

**Definición formal.** Configuración es cualquier parámetro externo; secreto es config sensible que requiere protección (no loguear, no commitear, rotar).

**Para qué sirve.** Separar código y entorno; reducir riesgo.

**Cuándo usarlo.** Siempre. Usa `.env` solo para dev local, nunca commiteado.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms3-env && cd /tmp/ms3-env
cat > env.mjs << 'JS'
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port)) throw new Error('PORT inválido');
console.log(port);
JS
PORT=abc node env.mjs 2>&1 | grep "PORT inválido" || true
```

**Caso de uso real.** Validar PORT al arranque.

**Error común.** Commitear `.env` con secretos. Corrección: `.gitignore`, secret manager, rotación.

**Verificación (2026-05-22).** La salida contiene `Error: PORT inválido`.

## Cierre del módulo

Git, terminal, HTTP, JSON, YAML y variables de entorno son la base operativa diaria. Domínalos con comandos pequeños y verificables antes de agregar complejidad de microservicios.
