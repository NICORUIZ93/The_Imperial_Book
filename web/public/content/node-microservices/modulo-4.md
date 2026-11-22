# Módulo 4 · Config y Service Discovery Node

**Entorno de referencia (2026-05-22):** Node.js v24.18.0. Se verifican estructura, dotenv/env, y discovery/config simulados. Consul/Config Server reales requieren infra; **Nota de verificación** honesta.

## Aprende construyendo

### Tema 1: Estructura de carpetas escalable · Intermedio · 90 min

#### Estructura por feature/capa

**Definición formal.** Organización de código por módulos/features o capas con límites claros.

**Para qué sirve.** Escalabilidad y mantenibilidad.

**Cuándo usarlo y cuándo no.** Úsalo al crecer; no sobre-estructures proyectos pequeños.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms21-struct/src/users /tmp/ms21-struct/src/orders && cd /tmp/ms21-struct && find src -type d | sort
```

**Caso de uso real.** `users/`, `orders/`, `shared/`.

**Error común.** Estructura por tipo técnico puro en apps grandes. Corrección: feature-first con límites.

**Verificación (2026-05-22).** Salida lista directorios `src`, `src/orders`, `src/users`.

### Tema 2: dotenv · Básico · 60 min

#### Variables de entorno y .env

**Definición formal.** `.env` carga pares clave-valor en desarrollo; en producción se prefieren variables reales del entorno/secret manager.

**Para qué sirve.** Config local conveniente.

**Cuándo usarlo y cuándo no.** Dev local; no commitear secretos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms21-env && cd /tmp/ms21-env
cat > .env << 'E'
PORT=3000
E
node -e "require('fs').readFileSync('.env','utf8').trim().split('\n').forEach(l=>{const [k,v]=l.split('='); process.env[k]=v}); console.log(process.env.PORT)"
```

**Caso de uso real.** dotenv en Node.

**Error común.** Commitear `.env`. Corrección: `.gitignore` y ejemplo `.env.example`.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `3000`. **Nota:** paquete `dotenv` simplifica esto; aquí se verifica el principio.

### Tema 3: Service Discovery con Consul · Intermedio · 90 min

#### Discovery

**Definición formal.** Consul provee registro y descubrimiento de servicios con health checks.

**Para qué sirve.** Ubicar instancias dinámicas.

**Cuándo usarlo y cuándo no.** Entornos dinámicos.

**Ejemplo mínimo enfocado (ejecutable, registro simulado).**

```bash
node -e "const reg={}; reg['svc']=['127.0.0.1:3001']; console.log(reg.svc[0])"
```

**Caso de uso real.** Consul agent registra servicio.

**Error común.** No health check. Corrección: checks HTTP/TCP.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `127.0.0.1:3001`. **Nota:** Consul real requiere agente/server.

### Tema 4: Configuración centralizada · Intermedio · 90 min

#### Config centralizada

**Definición formal.** Configuración gestionada en un servicio/repositorio central y consumida por apps.

**Para qué sirve.** Consistencia y auditoría.

**Cuándo usarlo y cuándo no.** Flotas de servicios; secretos con cuidado.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const central={featureX:true}; console.log(central.featureX)"
```

**Caso de uso real.** Spring Cloud Config, Consul KV.

**Error común.** Cambiar config sin versionar/auditar. Corrección: Git + audit.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`.

## Cierre del módulo

La configuración y el discovery son infraestructura operativa: deben ser versionados, seguros y observables.
