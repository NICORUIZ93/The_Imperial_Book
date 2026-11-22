# Módulo 0.3 · Introducción a Java y Node.js lado a lado

**Entorno de referencia (2026-05-22):** JDK 27.0.1.0.2, Node.js v24.18.0. Se ejecutan ejemplos mínimos en ambos runtimes.

Este módulo compara Java y Node.js con el mismo problema implementado dos veces. El objetivo no es elegir un ganador, sino entender el modelo de ejecución, tipado, errores y concurrencia de cada plataforma.

## Aprende construyendo

### Tema 1: Sintaxis y ejecución · Básico · 240 min

Caso guía: calcular el total de una tienda en Java y en Node.js.

#### Modelo de ejecución (JVM vs V8/Node)

**Definición formal.** Java compila código fuente a bytecode `.class` y la JVM lo ejecuta; Node.js ejecuta JavaScript sobre V8 con APIs del runtime Node.

**Para qué sirve.** Explica el flujo de trabajo, errores y empaquetado.

**Cuándo usarlo.** Elige según ecosistema, equipo y requisitos. Java destaca en tipado fuerte y tooling JVM; Node en I/O y ecosistema JS.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms2-exec && cd /tmp/ms2-exec
cat > Hola.java << 'JAVA'
public class Hola { public static void main(String[] args){ System.out.println("java"); } }
JAVA
cat > hola.mjs << 'JS'
console.log('node');
JS
javac Hola.java && java Hola
node hola.mjs
```

**Caso de uso real.** El mismo endpoint implementado en Spring Boot o Node.

**Error común.** Asumir que Java y JavaScript son el mismo lenguaje. Corrección: son runtimes y ecosistemas distintos.

**Verificación (JDK 27, Node 24.18.0, 2026-05-22).** Salida: `java` y `node`.

#### Tipado declarado vs dinámico

**Definición formal.** Java usa tipado estático declarado en compilación; JavaScript es dinámicamente tipado (los valores tienen tipo en runtime).

**Para qué sirve.** El tipado estático detecta clases de errores antes; el dinámico da rapidez, pero requiere más pruebas/contratos.

**Cuándo usarlo.** Java para contratos explícitos; en Node, usar TypeScript o validación runtime para compensar.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms2-types && cd /tmp/ms2-types
cat > Tipos.java << 'JAVA'
public class Tipos { public static void main(String[] args){ int x = 2; System.out.println(x+1); } }
JAVA
cat > tipos.mjs << 'JS'
let x = 2; x = '2'; console.log(x + 1);
JS
javac Tipos.java && java Tipos
node tipos.mjs
```

**Caso de uso real.** Validar payloads en API Node; Java los captura por tipo/modelo.

**Error común.** Confiar en coerción implícita JS. Corrección: validación explícita (`zod`, checks) o TypeScript.

**Verificación (2026-05-22).** Salida: `3` (Java) y `21` (JS concatenación).

#### Estructura mínima de programa

**Definición formal.** Java requiere clase y método `main` para entrada; Node ejecuta el script de arriba a abajo.

**Para qué sirve.** Saber dónde arranca la ejecución.

**Cuándo usarlo.** En Java, respetar firma `main`; en Node, usar `import.meta.main` para código ejecutable directo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms2-main && cd /tmp/ms2-main
cat > Main.java << 'JAVA'
public class Main { public static void main(String[] args){ System.out.println(args.length); } }
JAVA
cat > main.mjs << 'JS'
console.log(process.argv.slice(2).length);
JS
javac Main.java && java Main a b
node main.mjs a b
```

**Caso de uso real.** CLI con argumentos.

**Error común.** Cambiar firma de `main` en Java. Corrección: `public static void main(String[] args)`.

**Verificación (2026-05-22).** Salida: `2` y `2`.

### Tema 2: Tipos, errores y concurrencia · Intermedio · 240 min

Caso guía: manejar un error de input y una operación concurrente.

#### Manejo de errores

**Definición formal.** Java usa excepciones checked/unchecked con `try/catch/finally`; JS usa `try/catch` y rechazos de Promises.

**Para qué sirve.** Controlar fallos esperables y proteger invariantes.

**Cuándo usarlo.** Valida input y propaga errores con contexto. No tragues excepciones.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms2-err && cd /tmp/ms2-err
cat > Err.java << 'JAVA'
public class Err { static int div(int a,int b){ if(b==0) throw new IllegalArgumentException("b=0"); return a/b; }
  public static void main(String[] args){ try{ div(1,0); } catch(Exception e){ System.out.println("error"); } } }
JAVA
cat > err.mjs << 'JS'
function div(a,b){ if(b===0) throw new Error('b=0'); return a/b; }
try { div(1,0); } catch { console.log('error'); }
JS
javac Err.java && java Err
node err.mjs
```

**Caso de uso real.** Validación de request 400.

**Error común.** Devolver `null` o seguir ejecutando tras input inválido. Corrección: fallo explícito.

**Verificación (2026-05-22).** Salida: `error` y `error`.

#### Concurrencia: hilos vs event loop

**Definición formal.** Java usa hilos y el scheduler de la JVM; Node usa un event loop con I/O no bloqueante y callbacks/promesas (y worker threads cuando aplica).

**Para qué sirve.** Atender múltiples tareas eficientemente según el modelo.

**Cuándo usarlo.** Node destaca en I/O concurrente; Java en CPU-bound paralelo y ecosistema multihilo maduro. No bloquees el event loop.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms2-conc && cd /tmp/ms2-conc
cat > Conc.java << 'JAVA'
import java.util.concurrent.*;
public class Conc { public static void main(String[] args) throws Exception { ExecutorService ex=Executors.newSingleThreadExecutor(); System.out.println(ex.submit(() -> "ok").get()); ex.shutdown(); } }
JAVA
cat > conc.mjs << 'JS'
const r = await Promise.resolve('ok');
console.log(r);
JS
javac Conc.java && java Conc
node conc.mjs
```

**Caso de uso real.** Node: muchas requests I/O; Java: procesamiento paralelo CPU.

**Error común.** Hacer CPU pesada en event loop de Node. Corrección: worker thread, cola o servicio separado.

**Verificación (2026-05-22).** Salida: `ok` y `ok`.

#### Mismo contrato, distinta implementación

**Definición formal.** Un contrato funcional puede implementarse en distintos runtimes siempre que preserve entradas, salidas y errores observables.

**Para qué sirve.** Permite comparar plataformas y migrar con tests.

**Cuándo usarlo.** Al evaluar Java vs Node o al mantener dos implementaciones.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms2-contract && cd /tmp/ms2-contract
cat > Total.java << 'JAVA'
public class Total { static int total(int[] xs){ int s=0; for(int x:xs) s+=x; return s; } public static void main(String[] args){ System.out.println(total(new int[]{4500,12000,3500})); } }
JAVA
cat > total.mjs << 'JS'
const total = xs => xs.reduce((a,b)=>a+b,0);
console.log(total([4500,12000,3500]));
JS
javac Total.java && java Total
node total.mjs
```

**Caso de uso real.** Misma regla de negocio en dos servicios.

**Error común.** Comparar sintaxis e ignorar semántica. Corrección: usar tests de contrato.

**Verificación (2026-05-22).** Salida: `56000` y `56000`.

## Cierre del módulo

Java y Node.js resuelven los mismos problemas con modelos distintos: compilación/JVM/tipos estáticos vs V8/event loop/tipado dinámico. La elección se justifica por requisitos, equipo y operación, no por preferencia superficial.
