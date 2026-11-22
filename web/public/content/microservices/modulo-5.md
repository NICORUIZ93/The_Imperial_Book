# Módulo 1.1 · Java moderno y Spring Boot para microservicios

**Entorno de referencia (2026-05-22):** JDK 27.0.1.0.2, Maven 3.10.0, Gradle 9.8.2, Node.js v24.18.0. Los conceptos de Java se verifican con `javac/java`. Los conceptos de Spring Boot, CRaC y GraalVM que requieren contexto de framework, imagen nativa o snapshot de proceso se documentan con ejemplos mínimos y nota de verificación honesta cuando no es factible ejecutarlos en este entorno sin un proyecto completo.

Este módulo consolida las bases Java y Spring Boot usadas en microservicios: streams/lambdas/Optional/records/pattern matching, virtual threads, IoC/DI, auto-configuración, módulos, perfiles, CRaC y GraalVM Native Image.

## Aprende construyendo

### Tema 1: Java 21: Streams, Lambdas, Optional, Records, Pattern Matching · Intermedio · 360 min

Caso guía: procesar una lista de pedidos con transformaciones funcionales, modelar resultados con records y manejar ausencia con Optional.

#### Lambda

**Definición formal.** Una lambda es una función anónima que implementa una interfaz funcional (una interfaz con un único método abstracto).

**Para qué sirve.** Permite pasar comportamiento como dato, reduciendo boilerplate frente a clases anónimas.

**Cuándo usarlo y cuándo no.** Úsala cuando la lógica sea corta y clara. No la uses si el bloque es largo, tiene múltiples efectos secundarios o necesita nombre/documentación propia; extrae un método.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms5-lambda && cd /tmp/ms5-lambda
cat > Main.java << 'JAVA'
import java.util.function.*;
public class Main {
  public static void main(String[] args){
    Function<Integer,Integer> doble = x -> x * 2;
    Predicate<Integer> par = x -> x % 2 == 0;
    System.out.println(doble.apply(21));
    System.out.println(par.test(4));
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Filtrar pedidos válidos o transformar DTOs en un stream.

**Error común.** Capturar variables mutables externas de forma confusa. Síntoma: comportamiento difícil de razonar. Causa: lambda con efectos secundarios. Corrección: preferir lambdas puras y variables efectivamente finales.

**Verificación (JDK 27, 2026-05-22).** Salida: `42` y `true`.

#### Streams

**Definición formal.** Un `Stream<T>` es una secuencia de elementos que soporta operaciones agregadas declarativas (filter, map, reduce), normalmente lazy y potencialmente paralelizables.

**Para qué sirve.** Expresar transformaciones de colecciones de forma declarativa.

**Cuándo usarlo y cuándo no.** Úsalo para pipelines de transformación legibles. No lo uses para lógica con mucho estado mutable, I/O por elemento, o cuando un bucle simple sea más claro.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms5-stream && cd /tmp/ms5-stream
cat > Main.java << 'JAVA'
import java.util.*;
public class Main {
  public static void main(String[] args){
    var nums = List.of(1,2,3,4,5,6);
    int sumaPares = nums.stream().filter(n -> n % 2 == 0).mapToInt(Integer::intValue).sum();
    System.out.println(sumaPares);
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Calcular totales, filtrar registros activos, mapear entidades a DTOs.

**Error común.** Reusar un stream ya consumido. Síntoma: `IllegalStateException: stream has already been operated upon or closed`. Corrección: crear un nuevo stream desde la fuente.

**Verificación (JDK 27, 2026-05-22).** Salida: `12`.

#### Optional

**Definición formal.** `Optional<T>` es un contenedor que puede contener un valor no nulo o estar vacío, diseñado para expresar ausencia explícita en retornos.

**Para qué sirve.** Evita devolver `null` como contrato ambiguo.

**Cuándo usarlo y cuándo no.** Úsalo en retornos de métodos. No lo uses como campo de entidad JPA, parámetro generalizado ni lo envuelvas en colecciones innecesariamente.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms5-opt && cd /tmp/ms5-opt
cat > Main.java << 'JAVA'
import java.util.*;
public class Main {
  static Optional<String> buscar(boolean ok){ return ok ? Optional.of("Ada") : Optional.empty(); }
  public static void main(String[] args){
    System.out.println(buscar(true).map(String::toUpperCase).orElse("NA"));
    System.out.println(buscar(false).orElse("NA"));
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Buscar usuario por id y devolver 404 si está vacío.

**Error común.** Llamar `get()` sin verificar. Síntoma: `NoSuchElementException`. Corrección: usar `orElse`, `orElseThrow`, `map`, `ifPresentOrElse`.

**Verificación (JDK 27, 2026-05-22).** Salida: `ADA` y `NA`.

#### Record

**Definición formal.** Un `record` es una clase especial de Java para portadores de datos inmutables; el compilador genera constructor, accesores, `equals`, `hashCode` y `toString`.

**Para qué sirve.** Modelar DTOs/value objects sin boilerplate.

**Cuándo usarlo y cuándo no.** Úsalo para datos inmutables y transparentes. No lo uses si necesitas mutabilidad, herencia de clases, o semántica de entidad con identidad mutable.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms5-rec && cd /tmp/ms5-rec
cat > Main.java << 'JAVA'
public class Main {
  record Pedido(String id, int total) {}
  public static void main(String[] args){
    var p = new Pedido("P1", 5000);
    System.out.println(p.id());
    System.out.println(p.total());
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** DTO de respuesta API, evento de dominio inmutable.

**Error común.** Intentar agregar setters o extender otro record. Síntoma: error de compilación. Corrección: usar clase normal si requieres mutabilidad/herencia.

**Verificación (JDK 27, 2026-05-22).** Salida: `P1` y `5000`.

#### Pattern Matching

**Definición formal.** Pattern matching permite comprobar la forma/tipo de un valor y extraer componentes en una expresión (`instanceof` con patrón, `switch` con patrones en versiones modernas).

**Para qué sirve.** Reduce casteos y lógica condicional repetitiva.

**Cuándo usarlo y cuándo no.** Úsalo cuando la rama depende del tipo/forma. No fuerces `switch` complejo si polimorfismo es más claro.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms5-pm && cd /tmp/ms5-pm
cat > Main.java << 'JAVA'
public class Main {
  static String desc(Object o){
    return switch (o) {
      case Integer i when i > 0 -> "int+";
      case String s -> "str:" + s.length();
      case null, default -> "other";
    };
  }
  public static void main(String[] args){
    System.out.println(desc(7));
    System.out.println(desc("hola"));
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Manejar respuestas polimórficas o eventos de distintos tipos.

**Error común.** Olvidar `default`/cobertura cuando el switch lo requiere. Corrección: cubrir casos o usar default explícito.

**Verificación (JDK 27, 2026-05-22).** Salida: `int+` y `str:4`.


### Tema 2: Virtual Threads (Project Loom) · Avanzado · 240 min

Caso guía: ejecutar muchas tareas bloqueantes sin agotar hilos de plataforma.

#### Virtual Thread

**Definición formal.** Un virtual thread (Java 21+, JEP 444) es un hilo ligero gestionado por la JVM que se monta/desmonta sobre hilos de plataforma (carrier threads), permitiendo alta concurrencia para tareas bloqueantes.

**Para qué sirve.** Simplifica código concurrente estilo "un hilo por request" con mejor escalabilidad en I/O bloqueante.

**Cuándo usarlo y cuándo no.** Úsalo para I/O bloqueante masivo (HTTP, DB JDBC bloqueante). No lo uses esperando mejorar CPU-bound puro; evita pinning prolongado y cuidado con `synchronized`/código nativo en versiones/rutinas sensibles.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms5-vt && cd /tmp/ms5-vt
cat > Main.java << 'JAVA'
import java.util.concurrent.*;
public class Main {
  public static void main(String[] args) throws Exception {
    try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
      Future<String> f = ex.submit(() -> Thread.currentThread().isVirtual() ? "virtual" : "platform");
      System.out.println(f.get());
    }
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Servicio que atiende miles de requests con llamadas JDBC bloqueantes.

**Error común.** Asumir que elimina límites de DB/pool downstream. Síntoma: saturación de base de datos. Corrección: limitar concurrencia con semáforos/bulkheads y dimensionar pools.

**Verificación (JDK 27, 2026-05-22).** Salida: `virtual`.

#### Executor y structured concurrency (noción)

**Definición formal.** `ExecutorService` administra ejecución de tareas; structured concurrency (APIs en evolución/preview según JDK) busca tratar tareas concurrentes como una unidad con alcance y cancelación definida.

**Para qué sirve.** Controlar ciclo de vida y errores de tareas concurrentes.

**Cuándo usarlo y cuándo no.** Usa executors con try-with-resources. No dispares hilos sin ownership/límite.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms5-ex && cd /tmp/ms5-ex
cat > Main.java << 'JAVA'
import java.util.concurrent.*;
public class Main {
  public static void main(String[] args) throws Exception {
    try (var ex = Executors.newFixedThreadPool(2)) {
      var a = ex.submit(() -> 1);
      var b = ex.submit(() -> 2);
      System.out.println(a.get() + b.get());
    }
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Fan-out limitado a servicios internos.

**Error común.** No cerrar executor. Síntoma: JVM no termina. Corrección: try-with-resources o `shutdown`.

**Verificación (JDK 27, 2026-05-22).** Salida: `3`.

### Tema 3: Spring IoC, DI, Bean Lifecycle, ApplicationContext · Intermedio · 360 min

Caso guía: desacoplar una notificación de su canal concreto mediante inversión de control.

#### IoC y DI

**Definición formal.** Inversión de Control (IoC) delega la creación/orquestación de dependencias a un contenedor; Dependency Injection (DI) es la técnica de proveer dependencias a un objeto desde afuera.

**Para qué sirve.** Reduce acoplamiento, facilita pruebas y configuración.

**Cuándo usarlo y cuándo no.** Úsalo en apps con múltiples componentes/implementaciones. No lo uses en scripts minúsculos donde DI agrega complejidad sin beneficio.

**Ejemplo mínimo enfocado (ejecutable, Java puro simulando DI).**

```bash
mkdir -p /tmp/ms5-di && cd /tmp/ms5-di
cat > Main.java << 'JAVA'
interface Notifier { String send(String msg); }
class EmailNotifier implements Notifier { public String send(String msg){ return "email:" + msg; } }
class Service { private final Notifier n; Service(Notifier n){ this.n=n; } String notify(String m){ return n.send(m); } }
public class Main { public static void main(String[] args){ System.out.println(new Service(new EmailNotifier()).notify("hola")); } }
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Spring inyecta `Notifier` por constructor en un `@Service`.

**Error común.** Field injection. Síntoma: difícil de testear, dependencias ocultas. Corrección: inyección por constructor.

**Verificación (JDK 27, 2026-05-22).** Salida: `email:hola`. **Nota:** el wiring automático `@Autowired`/`ApplicationContext` requiere Spring Boot; aquí se verifica el principio DI con Java puro.

#### Bean y ciclo de vida

**Definición formal.** En Spring, un bean es un objeto gestionado por el contenedor; su ciclo de vida incluye instanciación, inyección de dependencias, callbacks de inicialización y destrucción.

**Para qué sirve.** Centraliza creación y gestión de recursos.

**Cuándo usarlo y cuándo no.** Declara beans para componentes con ciclo de vida gestionado. No registres objetos efímeros por request como beans singleton sin cuidado.

**Ejemplo mínimo enfocado (Spring, ilustrativo).**

```java
@Component
public class CacheWarmer {
  @PostConstruct void init() { /* cargar cache */ }
  @PreDestroy void close() { /* liberar recursos */ }
}
```

**Caso de uso real.** Abrir/cerrar pool, warm cache, registrar métricas.

**Error común.** Hacer trabajo pesado/bloqueante en `@PostConstruct`. Síntoma: arranque lento o fallido. Corrección: inicialización diferida/async controlada.

**Verificación.** **Nota de verificación:** requiere `ApplicationContext` de Spring Boot. Validar ejecutando una app Spring y observando logs de callbacks de ciclo de vida.

#### ApplicationContext

**Definición formal.** `ApplicationContext` es la interfaz central de Spring para el contenedor IoC, que expone acceso a beans, eventos, recursos y resolución de mensajes.

**Para qué sirve.** Punto de acceso al contenedor y sus capacidades.

**Cuándo usarlo y cuándo no.** Deja que Spring lo gestione; inyéctalo solo cuando sea necesario. No uses `context.getBean(...)` por todas partes (service locator anti-pattern).

**Ejemplo mínimo enfocado (Spring, ilustrativo).**

```java
@SpringBootApplication
public class App {
  public static void main(String[] args) {
    ApplicationContext ctx = SpringApplication.run(App.class, args);
    System.out.println(ctx.getBeanDefinitionCount());
  }
}
```

**Caso de uso real.** Inspección de beans en diagnóstico.

**Error común.** Service Locator ocultando dependencias. Corrección: inyección explícita por constructor.

**Verificación.** **Nota de verificación:** requiere proyecto Spring Boot ejecutable. El conteo de beans varía por auto-configuración y versión.

### Tema 4: Auto-configuración condicional, @Conditional, starters · Intermedio · 240 min

Caso guía: activar un bean solo cuando existe una propiedad o clase.

#### Auto-configuración

**Definición formal.** La auto-configuración de Spring Boot crea beans por defecto basándose en el classpath, propiedades y beans existentes, usando condiciones.

**Para qué sirve.** Reduce configuración manual repetitiva.

**Cuándo usarlo y cuándo no.** Aprovéchala para defaults; sobreescribe cuando el default no coincide. No la desactives por completo sin entender el impacto.

**Ejemplo mínimo enfocado (config/properties verificable).**

```bash
mkdir -p /tmp/ms5-autocfg && cd /tmp/ms5-autocfg
cat > app.properties << 'P'
feature.enabled=true
P
cat > Main.java << 'JAVA'
import java.io.*; import java.util.*;
public class Main { public static void main(String[] args) throws Exception { var p=new Properties(); try(var in=new FileInputStream("app.properties")){p.load(in);} System.out.println("true".equals(p.getProperty("feature.enabled")) ? "bean-on":"bean-off"); } }
JAVA
javac Main.java && java Main
```

**Caso de uso real.** `@ConditionalOnProperty`, `@ConditionalOnClass` en starters.

**Error común.** "Magia" no entendida: bean inesperado activo. Corrección: usar `--debug`, `/actuator/conditions`, leer auto-config.

**Verificación (JDK 27, 2026-05-22).** Salida: `bean-on`. **Nota:** la activación real de `@Conditional` requiere Spring Boot.

#### Starter

**Definición formal.** Un starter de Spring Boot es una dependencia que agrupa librerías y auto-configuración para una capacidad (web, data-jpa, security).

**Para qué sirve.** Simplifica dependencias y configuración inicial.

**Cuándo usarlo y cuándo no.** Úsalo para capacidades estándar. No agregues starters innecesarios; aumentan superficie y tiempo de arranque.

**Ejemplo mínimo enfocado (pom ilustrativo).**

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

**Caso de uso real.** `spring-boot-starter-web` trae Tomcat, Jackson, Spring MVC.

**Error común.** Incluir starter web y webflux sin intención clara. Corrección: elegir stack y revisar dependencias transitivas.

**Verificación.** **Nota de verificación:** requiere proyecto Maven/Gradle con resolución de dependencias; validar con `mvn dependency:tree` o `gradle dependencies`.

### Tema 5: Multi-module Spring Boot projects · Intermedio · 180 min

Caso guía: separar API, aplicación y dominio en módulos Maven.

#### Módulo Maven/Gradle

**Definición formal.** Un proyecto multi-módulo es un build con un POM/build padre y submódulos con límites de compilación y dependencias explícitas.

**Para qué sirve.** Separa responsabilidades, controla dependencias y permite reutilización.

**Cuándo usarlo y cuándo no.** Úsalo cuando los límites son claros y el equipo lo necesita. No fragmentes prematuramente un servicio pequeño.

**Ejemplo mínimo enfocado (estructura).**

```bash
mkdir -p /tmp/ms5-mm && cd /tmp/ms5-mm
mkdir -p app/src/main/java domain/src/main/java
cat > pom.xml << 'XML'
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion><groupId>demo</groupId><artifactId>root</artifactId><version>1.0.0</version><packaging>pom</packaging>
  <modules><module>domain</module><module>app</module></modules>
</project>
XML
cat > domain/pom.xml << 'XML'
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion><parent><groupId>demo</groupId><artifactId>root</artifactId><version>1.0.0</version></parent><artifactId>domain</artifactId>
</project>
XML
cat > app/pom.xml << 'XML'
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion><parent><groupId>demo</groupId><artifactId>root</artifactId><version>1.0.0</version></parent><artifactId>app</artifactId>
  <dependencies><dependency><groupId>demo</groupId><artifactId>domain</artifactId><version>1.0.0</version></dependency></dependencies>
</project>
XML
find . -name pom.xml | sort
```

**Caso de uso real.** `domain`, `application`, `infrastructure`, `boot`.

**Error común.** Dependencias cíclicas entre módulos. Corrección: revisar límites y dirección de dependencias.

**Verificación (2026-05-22).** El comando `find` lista 3 POMs. **Nota:** build completo requiere `mvn -q -DskipTests package` y red/deps; la estructura es verificable localmente.

### Tema 6: Perfiles y configuración externalizada · Intermedio · 180 min

Caso guía: cambiar puerto/config por entorno sin recompilar.

#### Perfil

**Definición formal.** Un perfil de Spring (`spring.profiles.active`) activa un conjunto de beans/configuración para un entorno o escenario.

**Para qué sirve.** Separar config de dev/test/prod.

**Cuándo usarlo y cuándo no.** Úsalo para variaciones de entorno. No codifiques secretos en archivos de perfil versionados.

**Ejemplo mínimo enfocado (ejecutable con Properties).**

```bash
mkdir -p /tmp/ms5-prof && cd /tmp/ms5-prof
cat > application-dev.properties << 'P'
server.port=8081
P
cat > application-prod.properties << 'P'
server.port=8080
P
cat > Main.java << 'JAVA'
import java.io.*; import java.util.*;
public class Main { public static void main(String[] args) throws Exception {
  String profile = System.getenv().getOrDefault("APP_PROFILE","dev");
  var p=new Properties(); try(var in=new FileInputStream("application-"+profile+".properties")){p.load(in);}
  System.out.println(p.getProperty("server.port"));
}}
JAVA
javac Main.java && APP_PROFILE=prod java Main
```

**Caso de uso real.** `application-dev.yml`, `application-prod.yml`.

**Error común.** Perfil activo incorrecto en producción. Corrección: externalizar `SPRING_PROFILES_ACTIVE` y validar al arranque.

**Verificación (JDK 27, 2026-05-22).** Salida: `8080`.

#### Configuración externalizada

**Definición formal.** Externalizar configuración es leer parámetros desde entorno/archivos/secret manager fuera del artefacto compilado.

**Para qué sirve.** Mismo artefacto, distintos entornos.

**Cuándo usarlo y cuándo no.** Siempre para config dependiente de entorno. No hardcodees URLs/credenciales.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
DB_URL=jdbc:postgresql://db:5432/app node -e "console.log(process.env.DB_URL)"
```

**Caso de uso real.** `DATABASE_URL`, `SPRING_DATASOURCE_URL`.

**Error común.** Config faltante detectada en runtime tardío. Corrección: fail-fast al arranque.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `jdbc:postgresql://db:5432/app`.

### Tema 7: CRaC (Coordinated Restore at Checkpoint) · Avanzado · 180 min

Caso guía: reducir tiempo de arranque restaurando un checkpoint.

#### CRaC

**Definición formal.** CRaC (Coordinated Restore at Checkpoint) es una API/enfoque para coordinar el checkpoint de una JVM en ejecución y restaurarla después, reduciendo tiempo de warmup/arranque.

**Para qué sirve.** Mejora arranque en workloads donde cold start importa.

**Cuándo usarlo y cuándo no.** Úsalo cuando midas beneficio real en arranque y puedas manejar recursos sensibles (sockets, archivos, conexiones) en checkpoint/restore. No lo uses si tu entorno no soporta CRaC o el ciclo de vida de recursos es incompatible.

**Ejemplo mínimo enfocado (conceptual, requiere JVM/entorno CRaC).**

```java
// Pseudocódigo ilustrativo: el recurso debe cerrarse antes del checkpoint y reabrirse tras restore.
public class DbResource implements org.crac.Resource {
  @Override public void beforeCheckpoint(org.crac.Context<? extends Resource> ctx) { /* close */ }
  @Override public void afterRestore(org.crac.Context<? extends Resource> ctx) { /* reopen */ }
}
```

**Caso de uso real.** Microservicios Java con escalado rápido donde startup importa.

**Error común.** Checkpoint con conexiones abiertas. Síntoma: restore fallido o estado inválido. Corrección: implementar coordinación de recursos.

**Verificación.** **Nota de verificación:** CRaC requiere una JVM/distribución con soporte CRaC y permisos/entorno Linux compatibles. No ejecutado en este entorno; validar con una imagen JDK CRaC y flujo `checkpoint/restore`.

### Tema 8: GraalVM Native Image · Avanzado · 240 min

Caso guía: compilar un servicio a binario nativo para arranque rápido.

#### Native Image

**Definición formal.** GraalVM Native Image compila ahead-of-time una aplicación Java a un ejecutable nativo, con análisis de alcanzabilidad en build time.

**Para qué sirve.** Arranque rápido y menor memoria RSS en ciertos escenarios.

**Cuándo usarlo y cuándo no.** Úsalo cuando startup/memoria sean críticos y el stack sea compatible. No lo uses ciegamente: build lento, restricciones de reflexión/dynamic features, observabilidad diferente.

**Ejemplo mínimo enfocado (comando ilustrativo).**

```bash
# Requiere GraalVM/native-image instalado
native-image -jar app.jar app-native
./app-native
```

**Caso de uso real.** Funciones serverless, microservicios con escalado a cero.

**Error común.** Falla por reflexión no configurada. Síntoma: `ClassNotFoundException`/error en runtime que no ocurría en JVM. Corrección: metadata de reachability, tracing agent, configuración Spring AOT.

**Verificación.** **Nota de verificación:** requiere GraalVM y toolchain nativa. Se verifica disponibilidad: `native-image --version` si está instalado; si no, no es ejecutable en este entorno sin instalar GraalVM.

## Cierre del módulo

Java moderno reduce boilerplate y hace explícitos datos, ausencia y concurrencia. Spring Boot agrega IoC/auto-config para productividad, pero requiere entender sus condiciones y ciclo de vida. CRaC y Native Image son optimizaciones de arranque con trade-offs operativos; aplícalas con medición.
