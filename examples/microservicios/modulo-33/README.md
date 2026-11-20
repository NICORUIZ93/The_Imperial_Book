# Laboratorio · Módulo 29 · Team Topologies y organización (modulo-33)

Lección: [`web/public/content/microservices/modulo-33.md`](../../../web/public/content/microservices/modulo-33.md) ·
fichas F169–F172 · Fase 3 (Experto).

**Versiones:** Node.js 26.13.1 LTS · Git 2.x (el de tu sistema). Sin dependencias de npm: `package.json` y
`package-lock.json` existen para que `npm ci` funcione igual que en los demás módulos. **Sin infraestructura:** no hay
`docker-compose.yml`; `./verificar.sh --compose` se acepta y ejecuta lo mismo.

```bash
cd examples/microservicios/modulo-33
npm ci
./verificar.sh            # tests, demos y errores comunes de las 4 fichas → «RESULTADO: OK»
```

Si falta `git`, `verificar.sh` omite la parte de F169 que lee un historial real y lo avisa (en macOS se instala con
`xcode-select --install`).

| Carpeta | Ficha | Qué hay |
|---|---|---|
| `f169-conway/` | F169 Ley de Conway | `repo.js` (crea un repositorio Git temporal con 6 funcionalidades), `conway.js` (dueños al estilo CODEOWNERS y equipos por commit), `demo.js`, `conway.test.js`, `error-comun.js` (cambiar solo el organigrama) |
| `f170-topologias/` | F170 Stream-aligned, Platform, Enabling teams | `topologia.js` (revisión de tipos e interacciones y simulación de espera por tickets frente a autoservicio), `ejemplo.js`, `demo.js`, `topologia.test.js`, `error-comun.js` («plataforma» que atiende tickets) |
| `f171-carga-cognitiva/` | F171 Carga cognitiva | `carga.js` (carga intrínseca, extrínseca y germana con umbrales y encuesta 1–5; propuesta de división), `demo.js`, `carga.test.js`, `error-comun.js` (medir por número de servicios) |
| `f172-dimensionamiento/` | F172 Dimensionamiento de equipos | `tamano.js` (canales n·(n−1)/2, tamaño 5–9, división en equipos y límite de agrupación), `demo.js`, `tamano.test.js`, `error-comun.js` (meter más gente al mismo equipo) |

**Verificado en el entorno de autoría** (Node 26.13.1, Git 2.43.0, bash 5.2): `./verificar.sh` y
`./verificar.sh --compose` → `RESULTADO: OK`. Pendiente en el Mac: repetirlo con bash 3.2 y el Git de Xcode (ver
`verificacion/microservicios/pendiente.md`).
