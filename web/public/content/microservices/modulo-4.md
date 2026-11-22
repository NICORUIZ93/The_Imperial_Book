# Módulo 0.5 · Primer Hola Mundo en Java y Node.js + Docker básico

**Entorno de referencia (2026-05-22):** JDK 27.0.1.0.2, Node.js v24.18.0, Docker 29.9.3. Ejemplos Java/Node ejecutados localmente; Docker verificado con comandos locales cuando el daemon está disponible.

Este módulo cierra los fundamentos: compilar/ejecutar Java, ejecutar Node.js, y empaquetar procesos en contenedores Docker con Dockerfile y Compose.

## Aprende construyendo

### Tema 1: Primer Hola Mundo en Java · Básico · 180 min

Caso guía: desde un archivo `.java` compilarlo, ejecutarlo y exponerlo como HTTP mínimo.

#### Compilación y ejecución Java

**Definición formal.** El JDK compila código fuente `.java` a bytecode `.class` (`javac`) y la JVM lo ejecuta (`java`). Desde Java 11+ se puede ejecutar un archivo fuente simple directamente con `java Archivo.java`.

**Para qué sirve.** Entender el ciclo fuente→bytecode→ejecución y diagnosticar errores de compilación/runtime.

**Cuándo usarlo.** `java Archivo.java` para ejemplos rápidos; `javac` + `java` para proyectos/paquetes.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms4-java && cd /tmp/ms4-java
cat > HolaMundo.java << 'JAVA'
public class HolaMundo {
    public static void main(String[] args) {
        System.out.println("Hola Mundo desde Java " + Runtime.version().feature());
    }
}
JAVA
javac HolaMundo.java
java HolaMundo
```

**Caso de uso real.** Build de microservicio Java antes de empaquetar en imagen.

**Error común.** Nombre de clase pública no coincide con archivo. Síntoma: `class HolaMundo is public, should be declared in a file named HolaMundo.java`. Corrección: alinear nombre.

**Verificación (JDK 27, 2026-05-22).** Salida: `Hola Mundo desde Java 27`.

#### Clase `main` y punto de entrada

**Definición formal.** El punto de entrada estándar de una aplicación Java es `public static void main(String[] args)`.

**Para qué sirve.** Define dónde inicia la JVM la ejecución.

**Cuándo usarlo.** Siempre en apps Java ejecutables; frameworks como Spring Boot invocan el `main` que arranca el contexto.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/ms4-java
cat > Args.java << 'JAVA'
public class Args { public static void main(String[] args){ System.out.println(args.length); } }
JAVA
javac Args.java && java Args a b c
```

**Caso de uso real.** CLI Java con argumentos.

**Error común.** Firma incorrecta (`Main` sin `static`/`String[]`). Corrección: usar firma exacta.

**Verificación (2026-05-22).** Salida: `3`.

#### Java HTTP mínimo con JDK

**Definición formal.** `com.sun.net.httpserver.HttpServer` (incluido en el JDK) permite exponer endpoints HTTP simples sin framework.

**Para qué sirve.** Entender request/response antes de Spring Boot.

**Cuándo usarlo.** Demos, tests, herramientas internas. En producción usar framework robusto (Spring Boot) salvo casos muy simples.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms4-jhttp && cd /tmp/ms4-jhttp
cat > HolaServidor.java << 'JAVA'
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
public class HolaServidor {
  public static void main(String[] args) throws Exception {
    HttpServer s = HttpServer.create(new InetSocketAddress(0), 0);
    s.createContext("/hola", ex -> { byte[] b="Hola Java".getBytes(); ex.sendResponseHeaders(200,b.length); ex.getResponseBody().write(b); ex.close(); });
    s.start();
    System.out.println(s.getAddress().getPort());
    s.stop(0);
  }
}
JAVA
javac HolaServidor.java && java HolaServidor
```

**Caso de uso real.** Smoke test HTTP en entorno sin dependencias.

**Error común.** No cerrar exchange/body; fuga de recursos. Corrección: `ex.close()` o try-with-resources.

**Verificación (2026-05-22).** Salida: un puerto numérico (ej. `53211`), evidenciando arranque correcto.

### Tema 2: Primer Hola Mundo en Node.js · Básico · 180 min

Caso guía: ejecutar script Node, crear servidor HTTP y configurar scripts npm.

#### Ejecución Node y módulos ES

**Definición formal.** Node.js ejecuta JavaScript en servidor sobre V8. Con `"type":"module"` o extensión `.mjs`, usa módulos ES (`import`/`export`).

**Para qué sirve.** Scripts, CLIs, APIs y tooling.

**Cuándo usarlo.** Usar ESM en proyectos nuevos; CommonJS solo por compatibilidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms4-node && cd /tmp/ms4-node
cat > hola.mjs << 'JS'
console.log(`Hola Mundo desde Node.js ${process.versions.node.split('.')[0]}`);
JS
node hola.mjs
```

**Caso de uso real.** Script de arranque de servicio.

**Error común.** Mezclar `require` y ESM sin configuración. Corrección: elegir un sistema de módulos.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `Hola Mundo desde Node.js 24`.

#### package.json y scripts

**Definición formal.** `package.json` describe el paquete (nombre, versión, tipo, scripts, dependencias). `npm run <script>` ejecuta comandos definidos.

**Para qué sirve.** Estandarizar comandos de inicio/test/build.

**Cuándo usarlo.** En todo proyecto Node. Evita comandos ad hoc no documentados.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms4-pkg && cd /tmp/ms4-pkg
cat > package.json << 'JSON'
{ "name":"hola-node","private":true,"type":"module","scripts":{"start":"node hola.mjs"} }
JSON
cat > hola.mjs << 'JS'
console.log('start-ok');
JS
npm run -s start
```

**Caso de uso real.** `npm start`, `npm test` en CI.

**Error común.** Script depende de binario global no instalado. Corrección: declarar dependencia en `devDependencies`/`dependencies`.

**Verificación (2026-05-22).** Salida: `start-ok`.

#### HTTP mínimo en Node

**Definición formal.** `node:http` crea servidores HTTP sin dependencias externas.

**Para qué sirve.** Base para entender frameworks como Express/Fastify.

**Cuándo usarlo.** Aprendizaje, utilidades pequeñas; en producción considerar framework con routing/validación/observabilidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms4-nhttp && cd /tmp/ms4-nhttp
cat > server.mjs << 'JS'
import http from 'node:http';
const s=http.createServer((req,res)=>{ if(req.url==='/hola'){res.writeHead(200,{'Content-Type':'text/plain'});res.end('Hola Node\n');} else {res.writeHead(404);res.end('No\n');}});
s.listen(0,'127.0.0.1', async ()=>{ const b=`http://127.0.0.1:${s.address().port}`; console.log((await fetch(b+'/hola')).status); s.close(); });
JS
node server.mjs
```

**Caso de uso real.** Health endpoint, mock server.

**Error común.** No manejar cierre/SIGTERM en contenedor. Corrección: `process.on('SIGTERM', ...)` y `server.close()`.

**Verificación (2026-05-22).** Salida: `200`.

### Tema 3: Docker básico · Intermedio · 240 min

Caso guía: empaquetar un proceso y ejecutarlo de forma reproducible.

#### Imagen, contenedor y Dockerfile

**Definición formal.** Una imagen Docker es un paquete inmutable por capas; un contenedor es una instancia en ejecución de una imagen; un Dockerfile es la receta declarativa para construir la imagen.

**Para qué sirve.** Reproducibilidad, aislamiento de runtime, despliegue consistente.

**Cuándo usarlo.** Servicios, jobs, entornos reproducibles. No uses contenedores como VM con estado mutable persistido dentro.

**Ejemplo mínimo enfocado (ejecutable con Docker daemon).**

```bash
mkdir -p /tmp/ms4-docker && cd /tmp/ms4-docker
cat > Dockerfile << 'DOCKER'
FROM node:24-alpine
WORKDIR /app
COPY app.mjs .
CMD ["node","app.mjs"]
DOCKER
cat > app.mjs << 'JS'
console.log('hola-docker');
JS
docker build -t ms4-hola:1 . >/dev/null
docker run --rm ms4-hola:1
```

**Caso de uso real.** Empaquetar microservicio para Kubernetes.

**Error común.** Imagen grande por copiar contexto innecesario. Corrección: `.dockerignore`, multi-stage build.

**Verificación (Docker 29.9.3, 2026-05-22, requiere daemon).** Salida esperada: `hola-docker`. **Nota:** si el daemon no está disponible, la verificación local no puede ejecutarse; el Dockerfile es sintácticamente válido.

#### Puertos, variables y logs

**Definición formal.** `-p host:container` publica puertos; `-e KEY=VAL` inyecta variables; `docker logs` muestra stdout/stderr del contenedor.

**Para qué sirve.** Configurar y observar contenedores.

**Cuándo usarlo.** Siempre inyectar config por env; logs a stdout/stderr.

**Ejemplo mínimo enfocado (ejecutable con Docker daemon).**

```bash
cd /tmp/ms4-docker
cat > env.mjs << 'JS'
console.log(process.env.SALUDO || 'hola');
JS
cat > Dockerfile.env << 'DOCKER'
FROM node:24-alpine
WORKDIR /app
COPY env.mjs .
CMD ["node","env.mjs"]
DOCKER
docker build -f Dockerfile.env -t ms4-env:1 . >/dev/null
docker run --rm -e SALUDO=hey ms4-env:1
```

**Caso de uso real.** Configurar `PORT`, `DATABASE_URL`.

**Error común.** Hardcodear localhost/puertos internos. Corrección: config por env y redes Docker.

**Verificación (requiere Docker daemon).** Salida esperada: `hey`.

#### Docker Compose

**Definición formal.** Docker Compose declara múltiples servicios, redes y volúmenes en YAML y los orquesta con `docker compose up`.

**Para qué sirve.** Levantar stack local (app + db + broker) reproduciblemente.

**Cuándo usarlo.** Desarrollo local/integración. No sustituye orquestación de producción como Kubernetes.

**Ejemplo mínimo enfocado (ejecutable con Docker daemon).**

```bash
mkdir -p /tmp/ms4-compose && cd /tmp/ms4-compose
cat > compose.yml << 'Y'
services:
  app:
    image: node:24-alpine
    command: ["node","-e","console.log('compose-ok')"]
Y
docker compose -f compose.yml run --rm app
```

**Caso de uso real.** Levantar API + Postgres + Redis localmente.

**Error común.** Asumir orden listo solo por `depends_on`. Corrección: healthchecks/wait de readiness.

**Verificación (requiere Docker daemon).** Salida esperada: `compose-ok`.

## Cierre del módulo

Java y Node.js comparten la idea de punto de entrada, ejecución y HTTP; Docker empaqueta esa ejecución para hacerla reproducible. Estos fundamentos son el piso de todos los módulos de microservicios.
