# Laboratorio · Módulo 0.4 · Git, terminal, HTTP, JSON, YAML, variables de entorno

Lección: `web/public/content/microservices/modulo-3.md` (fichas F008–F013).

## Requisitos

- Git 2.4x o posterior (mínimo 2.28), bash 3.2+ (el de macOS sirve), `curl`.
- Node.js 26.13.1 LTS y npm (para instalar `yaml` 2.9.1, única dependencia).
- JDK 25 LTS para la parte Java de variables de entorno.

## Contenido

| Carpeta | Ficha | Qué hay | Test |
|---|---|---|---|
| `git/` | Git | `practica.sh`: init, add, commit, rama y merge | `git/test-git.sh` |
| `terminal/` | Terminal | `contar-errores.sh` y el log `datos/app.log` | `terminal/test-terminal.sh` |
| `http/` | HTTP | `servidor-http.js`: 200, 201, 400, 404, 405, 415 y cabeceras | `http/servidor-http.test.js` |
| `json/` | JSON | `json.js`: parse, stringify y errores de sintaxis | `json/json.test.js` |
| `yaml/` | YAML | `config.yaml` y `leer-config.js` (librería `yaml` 2.9.1) | `yaml/leer-config.test.js` |
| `env/` | Variables de entorno | `config.js` (Node, `--env-file`), `Config.java` y `.env.example` con valores falsos | `env/config.test.js`, `env/ConfigTest.java` |

## Ejecutar

```bash
./git/practica.sh /tmp/mi-primer-repo
./terminal/contar-errores.sh terminal/datos/app.log
node http/servidor-http.js              # en otra terminal: curl -i http://localhost:3002/saludo
node json/json.js
npm install && (cd yaml && node leer-config.js)
(cd env && node --env-file=.env.example config.js && java Config.java)
```

## Verificar

```bash
./verificar.sh
```

Resultado esperado: Git 4 `✔`, terminal 4 `✔`, Node 20 tests `✔`, Java 3 `✔` y
`RESULTADO: OK · Módulo 0.4 (Git, terminal, HTTP, JSON, YAML, entorno) verificado`.

No usa infraestructura, así que no tiene `docker-compose.yml`.
