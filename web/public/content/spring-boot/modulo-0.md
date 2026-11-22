# Módulo 0: Fundamentos de Spring: IoC, DI y AOP

Este módulo introduce el modelo mental de Spring: el contenedor crea y conecta objetos, la inyección de dependencias expresa contratos explícitos, y AOP/proxies separan preocupaciones transversales. Cada concepto se presenta con un mínimo ejecutable o verificable, y cuando una verificación requiere infraestructura completa se indica nota honesta.

**Entorno de referencia (2026-05-22):** JDK 27 local para ejemplos Java puros; ejemplos Spring Boot verificados con Spring Boot 3.5.x / Java 21 en `/tmp` mediante Maven cuando se indica. Las APIs mostradas son estables en Spring Framework 6.x/Spring Boot 3.x.

## Aprende construyendo

### Tema 1: Inversión de control y el contenedor de Spring · Básico · 30 min

Caso guía: `ServicioEnvios` necesita consultar un repositorio. Si lo instancia con `new`, el servicio queda acoplado a una implementación concreta y es difícil probarlo.

#### Inversión de control (IoC)

**Definición formal.** IoC es un principio donde el control de creación, composición y ciclo de vida de objetos se delega a un framework/contenedor, no al código de negocio.

**Para qué sirve.** Desacopla la construcción del uso y facilita pruebas/cambios de implementación.

**Cuándo usarlo y cuándo no.** Úsalo en aplicaciones con dependencias y configuración. No lo confundas con “usar anotaciones”; la anotación es metadata, IoC es el principio.

**Ejemplo mínimo enfocado (ejecutable, Java puro).**

```bash
mkdir -p /tmp/sb0-ioc && cd /tmp/sb0-ioc
cat > DemoIoc.java << 'JAVA'
interface Repo { String estado(String c); }
class RepoMem implements Repo { public String estado(String c){ return "ok:"+c; } }
class Servicio { private final Repo repo; Servicio(Repo repo){ this.repo=repo; } String consultar(String c){ return repo.estado(c); } }
public class DemoIoc { public static void main(String[] args){ System.out.println(new Servicio(new RepoMem()).consultar("A1")); } }
JAVA
javac DemoIoc.java && java DemoIoc
```

**Caso de uso real.** Cambiar repositorio en memoria por JDBC sin modificar la lógica del servicio.

**Error común.** Instanciar dependencias con `new` dentro del servicio. Síntoma: difícil mockear. Corrección: recibir dependencia por constructor.

**Verificación (JDK 27, 2026-05-22).** Salida: `ok:A1`.

#### Contenedor IoC / `ApplicationContext`

**Definición formal.** `ApplicationContext` es el contenedor Spring que crea, configura, conecta y gestiona beans y su ciclo de vida.

**Para qué sirve.** Punto central de composición y resolución de dependencias.

**Cuándo usarlo.** Toda app Spring Boot. No instancies beans administrados con `new` fuera del contenedor.

**Ejemplo mínimo enfocado (ejecutable con Spring Boot).**

```java
// en @SpringBootTest o contexto de arranque
String estado = context.getBean(ServicioEnvios.class).consultar("RF-42");
assertEquals("En ruta: RF-42", estado);
```

**Caso de uso real.** Arrancar app y obtener controllers/servicios cableados.

**Error común.** Bean fuera del component scan. Síntoma: `NoSuchBeanDefinitionException`. Corrección: ubicar en paquete base o declarar configuración.

**Verificación.** **Nota de verificación:** requiere contexto Spring Boot; se verifica en test de integración/arranque (`spring-boot-starter-test`).

#### Bean

**Definición formal.** Bean es un objeto cuyo ciclo de vida es administrado por el contenedor Spring.

**Para qué sirve.** Permite wiring, scopes, proxies y callbacks administrados.

**Cuándo usarlo.** Servicios, repositorios, controllers, infraestructura. No registres todo como bean sin criterio.

**Ejemplo mínimo enfocado (ejecutable, Java puro simulando registro).**

```bash
mkdir -p /tmp/sb0-bean && cd /tmp/sb0-bean
cat > DemoBean.java << 'JAVA'
import java.util.*;
class Container { private final Map<Class<?>,Object> beans=new HashMap<>(); <T> void reg(Class<T> t,T o){beans.put(t,o);} <T> T get(Class<T> t){return t.cast(beans.get(t));} }
class Servicio { String hi(){ return "hola"; } }
public class DemoBean { public static void main(String[] args){ Container c=new Container(); c.reg(Servicio.class,new Servicio()); System.out.println(c.get(Servicio.class).hi()); } }
JAVA
javac DemoBean.java && java DemoBean
```

**Caso de uso real.** `@Service` registrado por component scan.

**Error común.** Crear el bean con `new` y esperar que tenga dependencias inyectadas. Corrección: obtenerlo del contexto o dejar que Spring lo cree.

**Verificación (JDK 27, 2026-05-22).** Salida: `hola`.

#### Inyección de dependencias (DI)

**Definición formal.** DI es el patrón por el cual las dependencias de un objeto son provistas externamente, en vez de ser creadas por el propio objeto.

**Para qué sirve.** Testabilidad y bajo acoplamiento.

**Cuándo usarlo.** Dependencias entre componentes. Evita Service Locator oculto.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/sb0-di && cd /tmp/sb0-di
cat > DemoDi.java << 'JAVA'
interface Repo { String get(); }
class Servicio { private final Repo repo; Servicio(Repo repo){ this.repo=repo; } String run(){ return repo.get(); } }
public class DemoDi { public static void main(String[] args){ System.out.println(new Servicio(() -> "mock").run()); } }
JAVA
javac DemoDi.java && java DemoDi
```

**Caso de uso real.** Pasar un mock en test unitario.

**Error común.** Usar `ApplicationContext.getBean` en todo el código (Service Locator). Corrección: inyección explícita por constructor.

**Verificación (JDK 27, 2026-05-22).** Salida: `mock`.

### Tema 2: Inyección por constructor vs por campo · Intermedio · 30 min

Caso guía: quieres probar `ServicioEnvios` sin levantar Spring.

#### Inyección por constructor

**Definición formal.** Las dependencias requeridas se reciben como parámetros del constructor.

**Para qué sirve.** Inmutabilidad, contrato explícito, tests simples.

**Cuándo usarla.** Por defecto en código nuevo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/sb0-ctor && cd /tmp/sb0-ctor
cat > DemoCtor.java << 'JAVA'
interface Repo { String s(String c); }
class Servicio { private final Repo repo; Servicio(Repo repo){ this.repo=repo; } String consultar(String c){ return repo.s(c); } }
public class DemoCtor { public static void main(String[] args){ System.out.println(new Servicio(c->"Preparando: "+c).consultar("RF-42")); } }
JAVA
javac DemoCtor.java && java DemoCtor
```

**Caso de uso real.** Unit test sin `@SpringBootTest`.

**Error común.** Constructor con demasiadas dependencias. Síntoma: difícil entender clase. Corrección: refactorizar responsabilidades.

**Verificación (JDK 27, 2026-05-22).** Salida: `Preparando: RF-42`.

#### Inyección por campo

**Definición formal.** El contenedor asigna una dependencia directamente a un campo (usualmente por reflexión), por ejemplo con `@Autowired`.

**Para qué sirve.** Conveniencia en código legacy/ejemplos; no recomendado en nuevo diseño.

**Cuándo evitarla.** Cuando necesites inmutabilidad y testabilidad simple.

**Ejemplo mínimo enfocado (ejecutable, simulando limitación).**

```java
@Service
class ServicioCampo { @Autowired Repo repo; String consultar(String c){ return repo.s(c); } }
// en test puro: repo queda null si no usas Spring/reflexión.
```

**Caso de uso real.** Código legacy.

**Error común.** `NullPointerException` en unit test porque nadie inyectó el campo. Corrección: constructor injection.

**Verificación.** **Nota de verificación:** observable al instanciar con `new` sin contexto Spring; el campo `@Autowired` no se inicializa.

### Tema 3: Estereotipos, autoconfiguración y scopes · Intermedio · 35 min

Caso guía: distinguir roles y entender `singleton` vs `prototype`.

#### Estereotipos Spring

**Definición formal.** `@Component`, `@Service`, `@Repository`, `@Controller/@RestController` son estereotipos; especializan semántica y participación en component scan.

**Para qué sirve.** Expresar rol y habilitar detección automática.

**Cuándo usarlo.** Usa el estereotipo que corresponda al rol. No uses `@Component` para todo.

**Ejemplo mínimo enfocado (ejecutable).**

```java
@Repository class RepoMem implements RepoEnvios { ... }
@Service class ServicioEnvios { ... }
@RestController class EnviosController { ... }
```

**Caso de uso real.** Separar capa web, servicio y persistencia.

**Error común.** `@Service` con lógica de acceso a datos o SQL en controller. Corrección: respetar responsabilidades.

**Verificación.** **Nota:** requiere app Spring Boot arrancada; se verifica por escaneo y endpoints.

#### Autoconfiguración

**Definición formal.** Mecanismo de Spring Boot que configura beans condicionalmente según classpath, propiedades y beans existentes.

**Para qué sirve.** Convención sobre configuración.

**Cuándo usarlo.** Siempre en Boot; inspecciona condiciones al depurar.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
./mvnw spring-boot:run --debug  # muestra condition evaluation report
```

**Caso de uso real.** Agregar `spring-boot-starter-web` y obtener Tomcat/MVC configurado.

**Error común.** Creer que “Spring hace magia”. Corrección: revisar auto-configuration report y propiedades.

**Verificación.** **Nota:** requiere ejecución de app Boot; el reporte es evidencia observable.

#### Scopes `singleton` y `prototype`

**Definición formal.** `singleton` (default) crea una instancia por contexto; `prototype` crea una nueva por solicitud al contenedor.

**Para qué sirve.** Controlar ciclo de vida y estado.

**Cuándo usarlo.** Singleton para servicios stateless; prototype para objetos stateful cortos, accedidos vía `ObjectProvider`.

**Ejemplo mínimo enfocado (ejecutable, Java puro simulación).**

```bash
mkdir -p /tmp/sb0-scope && cd /tmp/sb0-scope
cat > DemoScope.java << 'JAVA'
import java.util.function.*; class P { static int n; int id=++n; }
public class DemoScope { public static void main(String[] args){ P singleton=new P(); Supplier<P> proto=P::new; System.out.println(singleton.id==singleton.id); System.out.println(proto.get().id!=proto.get().id); } }
JAVA
javac DemoScope.java && java DemoScope
```

**Caso de uso real.** Servicio singleton, builder/objeto de reporte prototype.

**Error común.** Inyectar prototype en singleton y esperar una instancia nueva por llamada. Corrección: `ObjectProvider`.

**Verificación (JDK 27, 2026-05-22).** Salida: `true`, `true`.

### Tema 4: Ciclo de vida de los beans y apagado ordenado · Intermedio · 45 min

Caso guía: en shutdown, dejar de aceptar trabajo y drenar pendientes.

#### Ciclo de vida y callbacks

**Definición formal.** Spring crea el bean, inyecta dependencias, ejecuta callbacks de inicialización y, al cerrar contexto, callbacks de destrucción.

**Para qué sirve.** Inicializar/liberar recursos controladamente.

**Cuándo usarlo.** Para validación ligera o liberación. Evita trabajo pesado en `@PostConstruct`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/sb0-life && cd /tmp/sb0-life
cat > DemoLife.java << 'JAVA'
class B implements AutoCloseable { B(){ System.out.println("init"); } public void close(){ System.out.println("close"); } }
public class DemoLife { public static void main(String[] args){ try(B b=new B()){ System.out.println("use"); } } }
JAVA
javac DemoLife.java && java DemoLife
```

**Caso de uso real.** Abrir pool al iniciar, cerrarlo al apagar.

**Error común.** Bloquear arranque con I/O largo en init. Corrección: diferir o validar con timeout.

**Verificación (JDK 27, 2026-05-22).** Salida: `init`, `use`, `close`.

#### Graceful shutdown

**Definición formal.** Configuración donde el servidor deja de aceptar nuevas solicitudes y espera a que las activas terminen dentro de un timeout.

**Para qué sirve.** Evitar cortar requests en despliegues.

**Cuándo usarlo.** Producción/Kubernetes. Configura timeout menor al `terminationGracePeriodSeconds`.

**Ejemplo mínimo enfocado (configuración).**

```properties
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=20s
```

**Caso de uso real.** Rolling deploy sin errores 502 por corte abrupto.

**Error común.** Timeout de app mayor que el del orquestador. Corrección: alinear tiempos.

**Verificación.** **Nota:** requiere app Boot en ejecución y señal SIGTERM; evidencia en logs `Graceful shutdown complete`.

### Tema 5: Proxies y AOP: `@Aspect`, `@Around` y `BeanPostProcessor` · Intermedio · 45 min

Caso guía: medir tiempo de métodos de servicio sin ensuciar lógica.

#### AOP y proxy

**Definición formal.** AOP separa concerns transversales; en Spring, se implementa comúnmente con proxies que interceptan llamadas a beans.

**Para qué sirve.** Logging, métricas, transacciones, seguridad.

**Cuándo usarlo.** Cross-cutting concerns claros. No ocultes lógica de negocio.

**Ejemplo mínimo enfocado (ejecutable, Java puro proxy de interfaz).**

```bash
mkdir -p /tmp/sb0-proxy && cd /tmp/sb0-proxy
cat > DemoProxy.java << 'JAVA'
import java.lang.reflect.*;
interface Svc { String run(); }
class Impl implements Svc { public String run(){ return "ok"; } }
public class DemoProxy { public static void main(String[] args){ Svc s=(Svc)Proxy.newProxyInstance(Svc.class.getClassLoader(), new Class[]{Svc.class}, (p,m,a)->{ System.out.println("before"); Object r=m.invoke(new Impl(),a); System.out.println("after"); return r; }); System.out.println(s.run()); } }
JAVA
javac DemoProxy.java && java DemoProxy
```

**Caso de uso real.** `@Transactional`, `@Timed`, aspectos custom.

**Error común.** Self-invocation: `this.metodo()` no pasa por proxy. Corrección: separar bean o usar self-injection consciente.

**Verificación (JDK 27, 2026-05-22).** Salida: `before`, `after`, `ok`.

#### `@Aspect` / `@Around`

**Definición formal.** `@Aspect` declara un aspecto; `@Around` define advice que envuelve el join point y puede decidir si llamar `proceed()`.

**Para qué sirve.** Medir, auditar, envolver ejecución.

**Cuándo usarlo.** Cuando el concern es transversal. Siempre maneja excepciones y llama `proceed()` si corresponde.

**Ejemplo mínimo enfocado (Spring).**

```java
@Aspect @Component
class MedicionAspect {
  @Around("execution(* com.example.demo.ServicioEnvios.*(..))")
  Object medir(ProceedingJoinPoint p) throws Throwable { long t=System.nanoTime(); try { return p.proceed(); } finally { System.out.println((System.nanoTime()-t)/1000); } }
}
```

**Caso de uso real.** Métricas de latencia por servicio.

**Error común.** Olvidar `proceed()` o tragar la excepción. Corrección: siempre `proceed()` y rethrow/log según política.

**Verificación.** **Nota:** requiere contexto Spring AOP (`spring-boot-starter-aop`); evidencia en logs/tiempos.

### Tema 6: Varias implementaciones (`@Primary`, `@Qualifier`) y expresiones SpEL · Intermedio · 40 min

Caso guía: dos tarifadores implementan la misma interfaz.

#### `@Primary` y `@Qualifier`

**Definición formal.** `@Primary` marca el bean preferido ante ambigüedad; `@Qualifier` selecciona explícitamente un candidato por calificador/nombre.

**Para qué sirve.** Resolver múltiples implementaciones del mismo contrato.

**Cuándo usarlo.** `@Primary` para default claro; `@Qualifier` para selección explícita.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/sb0-qual && cd /tmp/sb0-qual
cat > DemoQual.java << 'JAVA'
interface T { int v(); }
class A implements T { public int v(){ return 1; } }
class B implements T { public int v(){ return 2; } }
class S { private final T t; S(T t){ this.t=t; } int v(){ return t.v(); } }
public class DemoQual { public static void main(String[] args){ System.out.println(new S(new B()).v()); } }
JAVA
javac DemoQual.java && java DemoQual
```

**Caso de uso real.** `TarifaUrbana` default, `TarifaExpress` seleccionada por qualifier.

**Error común.** Dos beans sin desambiguar. Síntoma: `NoUniqueBeanDefinitionException`. Corrección: `@Primary`, `@Qualifier` o configuración explícita.

**Verificación (JDK 27, 2026-05-22).** Salida: `2`.

#### SpEL

**Definición formal.** Spring Expression Language es un lenguaje de expresiones evaluadas en tiempo de ejecución en anotaciones/configuración Spring (`#{...}`).

**Para qué sirve.** Calcular/injectar valores dinámicos simples.

**Cuándo usarlo.** Expresiones pequeñas y legibles. Evita lógica compleja oculta en SpEL.

**Ejemplo mínimo enfocado (Spring).**

```java
@Value("#{${app.impuesto:19} / 100.0}")
private double impuesto;
```

**Caso de uso real.** Derivar un porcentaje desde propiedad configurable.

**Error común.** SpEL compleja difícil de testear. Corrección: mover lógica a código Java y testearlo.

**Verificación.** **Nota:** requiere contexto Spring con resolución de propiedades; evidencia al inyectar el valor.

## Cierre del módulo

Spring se entiende mejor como contenedor de contratos y ciclos de vida: IoC/DI hacen explícitas las dependencias, los scopes y callbacks controlan vida útil, y AOP/proxies extraen concerns transversales. Antes de usar “magia”, confirma qué bean creó Spring, qué proxy lo envuelve y cómo se resuelve la ambigüedad.
