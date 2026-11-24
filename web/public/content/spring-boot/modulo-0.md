# Módulo 0: Fundamentos de Spring: IoC, DI y AOP

Spring Framework es un contenedor que crea objetos, resuelve sus dependencias, ejecuta callbacks de ciclo de vida y los envuelve en proxies antes de entregarlos. Spring Boot añade autoconfiguración y arranque, pero no cambia esa regla: el bean que recibes por inyección puede no ser la instancia que escribiste. La implicación práctica es que entender el contenedor permite explicar por qué una dependencia falta al arrancar, por qué un `@Aspect` se aplica (o no) y por qué una propiedad calculada aparece con un valor inesperado. La confusión habitual es tratar las anotaciones como etiquetas mágicas y no como declaraciones que el contenedor interpreta en un orden concreto.

## Visual del módulo

**Visual (diagram-design, estático; fuente `web/public/visuals/temas/spring-boot/modulo-0-tema-1-ioc.html`; regeneración: editar el HTML/SVG en esa ruta):** [Spring crea y conecta los beans](/visuals/temas/spring-boot/modulo-0-tema-1-ioc.html)

Lectura: el código declara dependencias y el contenedor decide cuándo instanciar, inyectar, envolver y destruir.

## Proyecto verificado

Directorio: `/tmp/opencode/aurora-sb0/aurora-sb0`. El código se ejecutó completo en ese directorio; las salidas transcritas son las de esa corrida, no valores esperados calculados a mano.

```text
/tmp/opencode/aurora-sb0/aurora-sb0/
├── pom.xml
├── mvnw
├── src/main/java/com/aurora/sb0/
│   ├── AuroraSb0Application.java
│   ├── DemoRunner.java
│   ├── aop/          AutoinvocacionSpring.java, OperacionAutoinvocada.java, ProxyJdkDemo.java
│   ├── ciclo/        CicloVidaAuditoria.java, CicloVidaEnvios.java
│   ├── config/       AuditoriaAspect.java, BeanPostProcessorDemo.java, PropiedadesSpEL.java, ScopedServicio.java
│   ├── dominio/      Envio.java, EnvioDigital.java, EnvioDomicilio.java
│   ├── moderno/      ModernJavaDemo.java
│   └── servicio/     CampoInyectado.java, ConsumidorNotificaciones.java, Notificador.java,
│                     NotificadorEmail.java, NotificadorSms.java, RepoEnvios.java,
│                     RepoMem.java, ServicioEnvios.java
├── src/main/resources/application.properties
└── src/test/java/com/aurora/sb0/
    ├── AopTest.java, AuroraSb0ApplicationTests.java, CicloVidaTest.java
    └── ContextoTest.java, JavaModernoTest.java, ServicioEnviosSinContenedorTest.java
```

Tres correcciones fueron necesarias y quedan documentadas con evidencia más adelante: el POM generado por Initializr usa `4.2.0.RELEASE` pero Maven Central publica `4.2.0`; en Boot 4 el starter de AOP se llama `spring-boot-starter-aspectj`, no `spring-boot-starter-aop`; y el orquestador de demos no debe cerrar el contexto dentro de `@SpringBootTest`, así que `main` lo cierra después de ejecutar las demos.

## Prerrequisitos y entorno observado

```bash
java -version
./mvnw -version
```

```text
openjdk version "27.0.1.0.2" 2026-10-21
OpenJDK Runtime Environment Temurin-27.0.1.0.2+1 (build 27.0.1.0.2+1)
OpenJDK 64-Bit Server VM Temurin-27.0.1.0.2+1 (build 27.0.1.0.2+1, mixed mode, sharing)
```

```text
Apache Maven 3.10.1 (3afd8084b5629f80b97750906a719879ed4cd283)
Maven home: /Users/nicolasruiz/.m2/wrapper/dists/apache-maven-3.10.1/987df3ef
Java version: 27.0.1.0.2, vendor: Eclipse Adoptium, runtime: /Users/nicolasruiz/Library/Java/JavaVirtualMachines/temurin-27.jdk/Contents/Home
Default locale: es_CO, platform encoding: UTF-8, time zone: America/Bogota
OS name: "mac os x", version: "27.2", arch: "aarch64", family: "mac"
```

El proyecto compila con `java.version=25` y se ejecuta sobre JDK 27.0.1.0.2. El bytecode verificado es Java 25:

```text
$ javap -verbose target/classes/com/aurora/sb0/AuroraSb0Application.class | grep 'major version'
  major version: 69
```

## Bootstrap verificado desde start.spring.io

```bash
curl -sS 'https://start.spring.io/metadata/client' | jq -r '.bootVersion | "default=\(.default)", (.values[] | select(.id=="4.2.0.RELEASE") | "id=\(.id) name=\(.name)")'
curl -sS 'https://start.spring.io/pom.xml?type=maven-project&bootVersion=4.2.0.RELEASE&javaVersion=25&groupId=com.aurora&artifactId=aurora-sb0&name=aurora-sb0&packageName=com.aurora.sb0' -o /tmp/opencode/aurora-sb0/aurora-sb0/target/pom-initializr.xml
```

```text
default=4.2.0.RELEASE
id=4.2.0.RELEASE name=4.2.0
```

El POM descargado declara `<version>4.2.0.RELEASE</version>` en el parent, pero ese artifact no está en Central:

```text
central 4.2.0.RELEASE -> 404
central 4.2.0 -> 200
```

Además, Initializr no acepta `aop` ni `test` como ids de dependencia (`400`) y el BOM de Boot 4.2.0 gestiona `spring-boot-starter-aspectj`:

```text
initializr dependencies=aop -> 400
initializr dependencies=test -> 400
        <artifactId>spring-boot-starter-aspectj-test</artifactId>
        <artifactId>spring-boot-starter-aspectj</artifactId>
```

### Tema 1: Inversión de control y el contenedor de Spring · Básico · 30 min

**Mecanismo.** `RepoMem` implementa `RepoEnvios` y se registra con `@Component`; `ServicioEnvios` recibe esa interfaz por constructor y se registra con `@Service`. `SpringApplication.run` construye un `ConfigurableApplicationContext`, que crea los beans, resuelve el constructor, aplica `BeanPostProcessor` y aspects, y expone el resultado por tipo. `main` pide el bean con `getBean(ServicioEnvios.class)`, ejecuta las demos y cierra el contexto.

**Por qué existe.** Si `ServicioEnvios` hiciera `new RepoMem()`, cada prueba tendría que aceptar esa implementación concreta. Al declarar la dependencia como parámetro, el mismo código sirve para la implementación real y para un doble. El contenedor asume la responsabilidad de composición y de ciclo de vida.

**Implicaciones.** El bean inyectado es un singleton por defecto y, cuando hay AOP, es un proxy. Por eso `servicio == context.getBean(ServicioEnvios.class)` es `true`, pero `servicio.getClass()` no es la clase fuente directa. El contenedor también falla rápido: si no hay un `RepoEnvios`, el arranque se detiene.

**Confusión común.** Pensar que `@Service` crea el objeto por sí solo. La anotación solo marca un candidato; la instancia, el orden de inicialización y la envoltura con proxy los decide el contexto.

#### `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>4.2.0</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.aurora</groupId>
	<artifactId>aurora-sb0</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>aurora-sb0</name>
	<description>Spring Boot IoC demo</description>
	<url/>
	<licenses>
		<license/>
	</licenses>
	<developers>
		<developer/>
	</developers>
	<scm>
		<connection/>
		<developerConnection/>
		<tag/>
		<url/>
	</scm>
	<properties>
		<java.version>25</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-aspectj</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
```

#### `src/main/resources/application.properties`

```properties
spring.application.name=aurora-sb0
spring.threads.virtual.enabled=true
app.nombre=aurora
app.entorno=verificacion
```

#### `src/main/java/com/aurora/sb0/AuroraSb0Application.java`

```java
package com.aurora.sb0;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class AuroraSb0Application {

	public static void main(String[] args) {
		ConfigurableApplicationContext context = SpringApplication.run(AuroraSb0Application.class, args);
		context.getBean(DemoRunner.class).ejecutar();
		context.close();
	}

}
```

#### `src/main/java/com/aurora/sb0/servicio/RepoEnvios.java`

```java
package com.aurora.sb0.servicio;

public interface RepoEnvios {
    String estado(String codigo);
}
```

#### `src/main/java/com/aurora/sb0/servicio/RepoMem.java`

```java
package com.aurora.sb0.servicio;

import org.springframework.stereotype.Component;

@Component
public class RepoMem implements RepoEnvios {
    @Override
    public String estado(String codigo) {
        return "ok:" + codigo;
    }
}
```

#### `src/main/java/com/aurora/sb0/servicio/ServicioEnvios.java`

```java
package com.aurora.sb0.servicio;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ServicioEnvios {
    private final RepoEnvios repo;
    private final String etiqueta;

    public ServicioEnvios(RepoEnvios repo, @Value("#{'${app.nombre}' + '-' + '${app.entorno}'}") String etiqueta) {
        this.repo = repo;
        this.etiqueta = etiqueta;
    }

    public String consultar(String codigo) {
        return repo.estado(codigo);
    }

    public String etiqueta() {
        return etiqueta;
    }

    @PostConstruct
    void inicializar() {
        System.out.println("INIT ServicioEnvios etiqueta=" + etiqueta);
    }

    @PreDestroy
    void destruir() {
        System.out.println("DESTROY ServicioEnvios");
    }
}
```

#### `src/main/java/com/aurora/sb0/DemoRunner.java`

Este orquestador se muestra completo aquí porque es el punto de entrada de todas las demos; algunas clases que referencia se definen en temas posteriores.

```java
package com.aurora.sb0;

import com.aurora.sb0.aop.OperacionAutoinvocada;
import com.aurora.sb0.aop.ProxyJdkDemo;
import com.aurora.sb0.config.PropiedadesSpEL;
import com.aurora.sb0.config.ScopedServicio;
import com.aurora.sb0.dominio.EnvioDigital;
import com.aurora.sb0.dominio.EnvioDomicilio;
import com.aurora.sb0.moderno.ModernJavaDemo;
import com.aurora.sb0.servicio.CampoInyectado;
import com.aurora.sb0.servicio.ConsumidorNotificaciones;
import com.aurora.sb0.servicio.ServicioEnvios;
import org.springframework.aop.support.AopUtils;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class DemoRunner {
    private final ServicioEnvios servicio;
    private final CampoInyectado campo;
    private final ConsumidorNotificaciones notificaciones;
    private final PropiedadesSpEL propiedades;
    private final ScopedServicio prototypeA;
    private final ScopedServicio prototypeB;
    private final OperacionAutoinvocada autoinvocacion;
    private final ModernJavaDemo moderno;
    private final ConfigurableApplicationContext context;

    public DemoRunner(ServicioEnvios servicio, CampoInyectado campo,
                      ConsumidorNotificaciones notificaciones, PropiedadesSpEL propiedades,
                      ScopedServicio prototypeA, ScopedServicio prototypeB,
                      OperacionAutoinvocada autoinvocacion, ModernJavaDemo moderno,
                      ConfigurableApplicationContext context) {
        this.servicio = servicio;
        this.campo = campo;
        this.notificaciones = notificaciones;
        this.propiedades = propiedades;
        this.prototypeA = prototypeA;
        this.prototypeB = prototypeB;
        this.autoinvocacion = autoinvocacion;
        this.moderno = moderno;
        this.context = context;
    }

    public void ejecutar() {
        System.out.println("consultar=" + servicio.consultar("A1"));
        System.out.println("campo=" + campo.estado("A1"));
        System.out.println("spel=" + servicio.etiqueta());
        System.out.println("propiedades=" + propiedades.resumen());
        System.out.println(notificaciones.resumen());
        System.out.println("singleton=" + (servicio == context.getBean(ServicioEnvios.class)));
        System.out.println("prototype=" + (prototypeA != prototypeB));
        System.out.println("aopProxy=" + AopUtils.isAopProxy(servicio));
        System.out.println("aopJdk=" + AopUtils.isJdkDynamicProxy(servicio));
        System.out.println(ProxyJdkDemo.ejecutar());
        System.out.println("spring.externa=" + autoinvocacion.externa());
        System.out.println("spring.interna=" + autoinvocacion.interna());
        System.out.println("pattern=" + moderno.describir(new EnvioDomicilio("E1", "Madrid")));
        System.out.println("pattern=" + moderno.describir(new EnvioDigital("E2", "ana@example.com")));
        System.out.println(moderno.contextoYThread());
        System.out.println(moderno.sinReenlace());
    }
}
```

#### `src/test/java/com/aurora/sb0/AuroraSb0ApplicationTests.java`

```java
package com.aurora.sb0;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AuroraSb0ApplicationTests {

	@Test
	void contextLoads() {
	}

}
```

Salida observada del arranque, filtrada a las líneas de este tema:

```text
INIT ServicioEnvios etiqueta=aurora-verificacion
BPP detectado: servicioEnvios
consultar=ok:A1 [AOP 42us]
spel=aurora-verificacion
singleton=true
```

El sufijo `[AOP 42us]` no lo produce `RepoMem`: lo añade el aspecto del Tema 5. Esa es la prueba de que el bean entregado por el contenedor ya estaba envuelto. `42us` es la medición real de esa ejecución; cambiará en otras corridas.

### Tema 2: Inyección por constructor vs por campo · Intermedio · 30 min

**Mecanismo.** `ServicioEnvios` declara `repo` como `final` y lo recibe en el constructor; `CampoInyectado` declara `@Autowired private RepoEnvios repo`. En el primer caso puedes llamar `new ServicioEnvios(new RepoMem(), "sin-contexto")`; en el segundo, `new CampoInyectado()` deja el campo en `null` y cualquier llamada falla.

**Por qué existe.** La inyección por constructor hace obligatorias las dependencias en la firma. Si falta una, el compilador o el contenedor lo detectan antes de que el objeto se use. La inyección por campo permite construir un objeto incompleto y oculta el problema hasta el primer acceso.

**Implicaciones.** Una dependencia `final` comunica inmutabilidad y hace innecesaria la reflexión en tests unitarios. La inyección por campo obliga a reflexión, a un setter o a un contenedor para poner el valor; por eso el test de abajo documenta el fallo real en lugar de simularlo.

**Confusión común.** Creer que `@Autowired` en un campo es “más corto” sin costo. El ahorro de líneas se paga con un objeto que no es válido hasta que Spring interviene.

**Regla práctica.** Usa inyección por constructor por defecto: hace la dependencia obligatoria en la firma, permite `final` y el objeto es válido en el instante en que `new` termina de ejecutarse, sin necesitar un contenedor ni reflexión para probarlo.

#### `src/main/java/com/aurora/sb0/servicio/CampoInyectado.java`

```java
package com.aurora.sb0.servicio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CampoInyectado {
    @Autowired
    private RepoEnvios repo;

    public String estado(String codigo) {
        return repo.estado(codigo);
    }
}
```

#### `src/test/java/com/aurora/sb0/ServicioEnviosSinContenedorTest.java`

```java
package com.aurora.sb0;

import com.aurora.sb0.servicio.CampoInyectado;
import com.aurora.sb0.servicio.RepoMem;
import com.aurora.sb0.servicio.ServicioEnvios;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ServicioEnviosSinContenedorTest {

    @Test
    void servicioSeConstruyeSinSpring() {
        ServicioEnvios servicio = new ServicioEnvios(new RepoMem(), "sin-contexto");

        assertEquals("ok:A1", servicio.consultar("A1"));
        assertEquals("sin-contexto", servicio.etiqueta());
    }

    @Test
    void campoInyectadoNoSirveSinContenedor() {
        CampoInyectado campo = new CampoInyectado();

        assertThrows(NullPointerException.class, () -> campo.estado("A1"));
    }
}
```

Salida observada al ejecutar solo esa clase:

```text
$ ./mvnw -Dtest=ServicioEnviosSinContenedorTest test
[INFO] Running com.aurora.sb0.ServicioEnviosSinContenedorTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.017 s -- in com.aurora.sb0.ServicioEnviosSinContenedorTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### Tema 3: Estereotipos, autoconfiguración y scopes · Intermedio · 35 min

**Mecanismo.** `@Component`, `@Service` y `@Repository` son estereotipos: todos registran un bean y comunican un rol distinto. El scope decide cuántas instancias existen. `ScopedServicio` usa `@Scope("prototype")`, mientras que `ServicioEnvios` conserva el singleton por defecto. La autoconfiguración activa `AopAutoConfiguration` y, al encontrar `spring.threads.virtual.enabled=true`, elige beans de ejecución con virtual threads.

**Por qué existe.** Los estereotipos dan vocabulario al diseño sin cambiar el mecanismo de registro. Los scopes evitan que estado mutable de una petición se comparta entre todas. La autoconfiguración evita escribir manualmente infraestructura que el classpath ya hace necesaria.

**Implicaciones.** En la corrida, `singleton=true` y `prototype=true`: dos inyecciones de `ScopedServicio` son objetos distintos, y dos búsquedas de `ServicioEnvios` devuelven el mismo proxy. Spring no ejecuta `@PreDestroy` en beans prototype: el contenedor entrega la instancia y deja de gestionarla. Por eso la salida de apagado no muestra `DESTROY ScopedServicio prototype`, aunque el método exista.

**Confusión común.** Añadir `@PreDestroy` a un prototype y esperar limpieza automática. Para liberar recursos de un prototype hay que hacerlo en el código que lo crea o cambiar el modelo de propiedad.

#### `src/main/java/com/aurora/sb0/config/ScopedServicio.java`

```java
package com.aurora.sb0.config;

import jakarta.annotation.PreDestroy;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("prototype")
public class ScopedServicio {
    @PreDestroy
    void destruir() {
        System.out.println("DESTROY ScopedServicio prototype");
    }
}
```

#### `src/test/java/com/aurora/sb0/ContextoTest.java`

```java
package com.aurora.sb0;

import com.aurora.sb0.config.PropiedadesSpEL;
import com.aurora.sb0.config.ScopedServicio;
import com.aurora.sb0.servicio.ConsumidorNotificaciones;
import com.aurora.sb0.servicio.ServicioEnvios;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ConfigurableApplicationContext;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class ContextoTest {
    @Autowired ServicioEnvios servicio;
    @Autowired ConfigurableApplicationContext context;
    @Autowired ScopedServicio prototypeA;
    @Autowired ScopedServicio prototypeB;
    @Autowired ConsumidorNotificaciones notificaciones;
    @Autowired PropiedadesSpEL propiedades;

    @Test
    void contextoResuelveBeanAplicaSpELYScope() {
        assertTrue(servicio.consultar("A1").matches("ok:A1 \\[AOP \\d+us\\]"));
        assertEquals("aurora-verificacion", servicio.etiqueta());
        assertEquals("placeholder=aurora spel=AURORA-verificacion", propiedades.resumen());
        assertEquals("primary=EMAIL qualifier=SMS", notificaciones.resumen());
        assertSame(servicio, context.getBean(ServicioEnvios.class));
        assertNotSame(prototypeA, prototypeB);
        assertEquals("prototype", context.getBeanFactory().getBeanDefinition("scopedServicio").getScope());
    }
}
```

Salida observada de scopes:

```text
singleton=true
prototype=true
```

Salida observada con `--debug`, filtrada al reporte de condiciones:

```text
   AopAutoConfiguration matched:
      - @ConditionalOnBooleanProperty (spring.aop.auto=true) matched (OnPropertyCondition)

   AopAutoConfiguration.AspectJAutoProxyingConfiguration matched:
      - @ConditionalOnClass found required class 'org.aspectj.weaver.Advice' (OnClassCondition)

   TaskExecutorConfigurations.SimpleAsyncTaskExecutorBuilderConfiguration#simpleAsyncTaskExecutorBuilderVirtualThreads matched:
      - @ConditionalOnMissingBean (types: org.springframework.boot.task.SimpleAsyncTaskExecutorBuilder; SearchStrategy: all) did not find any beans (OnBeanCondition)
      - @ConditionalOnThreading found VIRTUAL (OnThreadingCondition)

   TaskExecutorConfigurations.TaskExecutorConfiguration#applicationTaskExecutorVirtualThreads matched:
      - @ConditionalOnThreading found VIRTUAL (OnThreadingCondition)
```

La autoconfiguración selecciona proxy CGLIB porque `spring.aop.proxy-target-class=true` es el valor por defecto; por eso en el Tema 5 `aopJdk=false`.

### Tema 4: Ciclo de vida de los beans y apagado ordenado · Intermedio · 45 min

**Mecanismo.** `CicloVidaEnvios` y `CicloVidaAuditoria` implementan `SmartLifecycle` con fases 10 y 20. El contenedor instancia los beans y ejecuta `@PostConstruct`; después llama a `start()` en orden de fase ascendente. Al cerrar, llama a `stop()` en orden descendente y, por último, a `@PreDestroy`.

**Por qué existe.** Un cliente, un pool o un scheduler necesita abrir recursos después de que se inyectaron sus dependencias y cerrarlos antes de que el proceso termine. Separar `start`/`stop` de la destrucción permite detener el trabajo activo antes de liberar memoria o conexiones.

**Implicaciones.** La salida real muestra `START phase=10` antes que `START phase=20`, y `STOP phase=20` antes que `STOP phase=10`. Ese orden inverso es el apagado ordenado: el componente con fase mayor se detiene primero. `@PreDestroy` llega después de todos los `stop`, no antes.

**Confusión común.** Abrir recursos en el constructor y cerrarlos en `stop()`. El constructor no tiene acciones propias del ciclo de vida garantizadas después de la inyección; para eso están `@PostConstruct` y `SmartLifecycle.start()`.

#### `src/main/java/com/aurora/sb0/ciclo/CicloVidaEnvios.java`

```java
package com.aurora.sb0.ciclo;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.context.SmartLifecycle;
import org.springframework.stereotype.Component;

@Component
public class CicloVidaEnvios implements SmartLifecycle {
    private volatile boolean running;

    @PostConstruct
    void inicializar() {
        System.out.println("INIT @PostConstruct CicloVidaEnvios");
    }

    @Override
    public void start() {
        running = true;
        System.out.println("START phase=10 CicloVidaEnvios");
    }

    @Override
    public void stop() {
        running = false;
        System.out.println("STOP phase=10 CicloVidaEnvios");
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    @Override
    public int getPhase() {
        return 10;
    }

    @PreDestroy
    void destruir() {
        System.out.println("DESTROY @PreDestroy CicloVidaEnvios");
    }
}
```

#### `src/main/java/com/aurora/sb0/ciclo/CicloVidaAuditoria.java`

```java
package com.aurora.sb0.ciclo;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.context.SmartLifecycle;
import org.springframework.stereotype.Component;

@Component
public class CicloVidaAuditoria implements SmartLifecycle {
    private volatile boolean running;

    @PostConstruct
    void inicializar() {
        System.out.println("INIT @PostConstruct CicloVidaAuditoria");
    }

    @Override
    public void start() {
        running = true;
        System.out.println("START phase=20 CicloVidaAuditoria");
    }

    @Override
    public void stop() {
        running = false;
        System.out.println("STOP phase=20 CicloVidaAuditoria");
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    @Override
    public int getPhase() {
        return 20;
    }

    @PreDestroy
    void destruir() {
        System.out.println("DESTROY @PreDestroy CicloVidaAuditoria");
    }
}
```

#### `src/test/java/com/aurora/sb0/CicloVidaTest.java`

```java
package com.aurora.sb0;

import com.aurora.sb0.ciclo.CicloVidaAuditoria;
import com.aurora.sb0.ciclo.CicloVidaEnvios;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.SmartLifecycle;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class CicloVidaTest {
    @Autowired CicloVidaEnvios envios;
    @Autowired CicloVidaAuditoria auditoria;

    @Test
    void beansSmartLifecycleEstanActivosConFasesDistintas() {
        assertInstanceOf(SmartLifecycle.class, envios);
        assertInstanceOf(SmartLifecycle.class, auditoria);
        assertTrue(envios.isRunning());
        assertTrue(auditoria.isRunning());
        assertEquals(10, envios.getPhase());
        assertEquals(20, auditoria.getPhase());
    }
}
```

Salida observada en el arranque:

```text
INIT ServicioEnvios etiqueta=aurora-verificacion
BPP detectado: servicioEnvios
INIT @PostConstruct CicloVidaAuditoria
INIT @PostConstruct CicloVidaEnvios
START phase=10 CicloVidaEnvios
START phase=20 CicloVidaAuditoria
```

Salida observada al cerrar el contexto:

```text
STOP phase=20 CicloVidaAuditoria
STOP phase=10 CicloVidaEnvios
DESTROY @PreDestroy CicloVidaEnvios
DESTROY @PreDestroy CicloVidaAuditoria
DESTROY ServicioEnvios
```

### Tema 5: Proxies y AOP: @Aspect, @Around y BeanPostProcessor · Intermedio · 45 min

**Mecanismo.** `AuditoriaAspect` define dos `@Around`. El primero mide `ServicioEnvios.consultar` con `System.nanoTime()` y devuelve el resultado con el tiempo en microsegundos. El segundo añade `[AOP]` a `AutoinvocacionSpring.interna`. `BeanPostProcessorDemo` observa el bean `servicioEnvios` después de su inicialización. `AopUtils.isAopProxy` confirma que el objeto inyectado es un proxy.

**Por qué existe.** Medir o auditar cada método a mano mezcla la lógica de negocio con la observabilidad. Un aspecto concentra esa preocupación en un componente y el contenedor decide dónde aplicarlo.

**Implicaciones.** `externa()` llama a `interna()` con `this`, dentro del target, sin pasar por el proxy: por eso devuelve `externa->interna`, sin `[AOP]`. La llamada directa `autoinvocacion.interna()` sí pasa por el proxy y devuelve `interna [AOP]`. `aopJdk=false` indica que el proxy es CGLIB, coherente con la condición `proxy-target-class=true` vista en el Tema 3.

**Confusión común.** Esperar que un aspecto intercepte una llamada interna. Spring AOP es proxy-based: solo ve llamadas que entran por la referencia envuelta. Separar el método a otro bean o usar weaving son salidas habituales.

#### `src/main/java/com/aurora/sb0/config/AuditoriaAspect.java`

```java
package com.aurora.sb0.config;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditoriaAspect {

    @Around("execution(* com.aurora.sb0.servicio.ServicioEnvios.consultar(..))")
    public Object medirConsulta(ProceedingJoinPoint joinPoint) throws Throwable {
        long inicio = System.nanoTime();
        Object resultado = joinPoint.proceed();
        long microsegundos = (System.nanoTime() - inicio) / 1_000L;
        return resultado + " [AOP " + microsegundos + "us]";
    }

    @Around("execution(* com.aurora.sb0.aop.AutoinvocacionSpring.interna(..))")
    public Object marcarInterna(ProceedingJoinPoint joinPoint) throws Throwable {
        return joinPoint.proceed() + " [AOP]";
    }
}
```

#### `src/main/java/com/aurora/sb0/config/BeanPostProcessorDemo.java`

```java
package com.aurora.sb0.config;

import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;

@Component
public class BeanPostProcessorDemo implements BeanPostProcessor {
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        if (beanName.equals("servicioEnvios")) {
            System.out.println("BPP detectado: " + beanName);
        }
        return bean;
    }
}
```

#### `src/main/java/com/aurora/sb0/aop/ProxyJdkDemo.java`

```java
package com.aurora.sb0.aop;

import java.lang.reflect.Proxy;

public final class ProxyJdkDemo {

    public interface Operaciones {
        String externa();
        String interna();
    }

    public static final class OperacionesReales implements Operaciones {
        @Override
        public String externa() {
            return "externa->" + interna();
        }

        @Override
        public String interna() {
            return "interna";
        }
    }

    private ProxyJdkDemo() {
    }

    public static String ejecutar() {
        Operaciones real = new OperacionesReales();
        Operaciones proxy = (Operaciones) Proxy.newProxyInstance(
                Operaciones.class.getClassLoader(),
                new Class<?>[]{Operaciones.class},
                (p, m, args) -> {
                    if (m.getName().equals("interna")) {
                        System.out.println("AOP JDK: interna");
                    }
                    return m.invoke(real, args);
                });
        return "jdk.externa=" + proxy.externa() + " jdk.interna=" + proxy.interna();
    }
}
```

#### `src/main/java/com/aurora/sb0/aop/OperacionAutoinvocada.java`

```java
package com.aurora.sb0.aop;

public interface OperacionAutoinvocada {
    String externa();
    String interna();
}
```

#### `src/main/java/com/aurora/sb0/aop/AutoinvocacionSpring.java`

```java
package com.aurora.sb0.aop;

import org.springframework.stereotype.Component;

@Component
public class AutoinvocacionSpring implements OperacionAutoinvocada {

    @Override
    public String externa() {
        return "externa->" + interna();
    }

    @Override
    public String interna() {
        return "interna";
    }
}
```

#### `src/test/java/com/aurora/sb0/AopTest.java`

```java
package com.aurora.sb0;

import com.aurora.sb0.aop.OperacionAutoinvocada;
import com.aurora.sb0.servicio.ServicioEnvios;
import org.junit.jupiter.api.Test;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class AopTest {
    @Autowired ServicioEnvios servicio;
    @Autowired OperacionAutoinvocada autoinvocacion;

    @Test
    void servicioEsProxyYAutoinvocacionNoPasaPorElAspecto() {
        assertTrue(AopUtils.isAopProxy(servicio));
        assertEquals("externa->interna", autoinvocacion.externa());
        assertEquals("interna [AOP]", autoinvocacion.interna());
    }
}
```

Salida observada:

```text
BPP detectado: servicioEnvios
consultar=ok:A1 [AOP 42us]
aopProxy=true
aopJdk=false
AOP JDK: interna
jdk.externa=externa->interna jdk.interna=interna
spring.externa=externa->interna
spring.interna=interna [AOP]
```

Salida observada con `--debug` que explica el tipo de proxy:

```text
   AopAutoConfiguration.AspectJAutoProxyingConfiguration.CglibAutoProxyConfiguration matched:
      - @ConditionalOnBooleanProperty (spring.aop.proxy-target-class=true) matched (OnPropertyCondition)

   AopAutoConfiguration.AspectJAutoProxyingConfiguration.JdkDynamicAutoProxyConfiguration:
      Did not match:
         - @ConditionalOnBooleanProperty (spring.aop.proxy-target-class=false) did not find property 'spring.aop.proxy-target-class' (OnPropertyCondition)
```

### Tema 6: Varias implementaciones (@Primary, @Qualifier) y expresiones SpEL · Intermedio · 40 min

**Mecanismo.** `NotificadorEmail` y `NotificadorSms` implementan `Notificador`. El primero lleva `@Primary`, así que gana cuando no hay calificador. `NotificadorSms` se registra como `"sms"` y se selecciona con `@Qualifier("sms")`. `PropiedadesSpEL` recibe un valor con `${...}` y otro calculado con `#{...}`.

**Por qué existe.** Cuando hay dos candidatos del mismo tipo, el contenedor no adivina: `@Primary` fija el preferido y `@Qualifier` nombra la excepción. SpEL permite derivar un valor de configuración sin crear una clase de conversión para cada caso.

**Implicaciones.** `${app.nombre}` sustituye texto por el valor de configuración; `#{'${app.nombre}'.toUpperCase() + '-' + '${app.entorno}'}` evalúa una expresión después de resolver los placeholders. La salida real es `placeholder=aurora spel=AURORA-verificacion`. `ServicioEnvios` usa la misma idea con concatenación simple para producir `aurora-verificacion`.

**Confusión común.** Escribir reglas de negocio dentro de `#{...}`. La expresión no es fácil de testear ni de observar; conviene dejarla en cálculos de configuración pequeños.

#### `src/main/java/com/aurora/sb0/servicio/Notificador.java`

```java
package com.aurora.sb0.servicio;

public interface Notificador {
    String canal();
}
```

#### `src/main/java/com/aurora/sb0/servicio/NotificadorEmail.java`

```java
package com.aurora.sb0.servicio;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class NotificadorEmail implements Notificador {
    @Override public String canal() { return "EMAIL"; }
}
```

#### `src/main/java/com/aurora/sb0/servicio/NotificadorSms.java`

```java
package com.aurora.sb0.servicio;

import org.springframework.stereotype.Component;

@Component("sms")
public class NotificadorSms implements Notificador {
    @Override public String canal() { return "SMS"; }
}
```

#### `src/main/java/com/aurora/sb0/servicio/ConsumidorNotificaciones.java`

```java
package com.aurora.sb0.servicio;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class ConsumidorNotificaciones {
    private final Notificador principal;
    private final Notificador calificado;

    public ConsumidorNotificaciones(Notificador principal, @Qualifier("sms") Notificador calificado) {
        this.principal = principal;
        this.calificado = calificado;
    }

    public String resumen() {
        return "primary=" + principal.canal() + " qualifier=" + calificado.canal();
    }
}
```

#### `src/main/java/com/aurora/sb0/config/PropiedadesSpEL.java`

```java
package com.aurora.sb0.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PropiedadesSpEL {
    private final String nombre;
    private final String calculada;

    public PropiedadesSpEL(@Value("${app.nombre}") String nombre,
                           @Value("#{'${app.nombre}'.toUpperCase() + '-' + '${app.entorno}'}") String calculada) {
        this.nombre = nombre;
        this.calculada = calculada;
    }

    public String resumen() {
        return "placeholder=" + nombre + " spel=" + calculada;
    }
}
```

Salida observada:

```text
spel=aurora-verificacion
propiedades=placeholder=aurora spel=AURORA-verificacion
primary=EMAIL qualifier=SMS
```

### Tema 7: Java moderno para Spring Boot: virtual threads, scoped values, pattern matching y AOT/arranque · Intermedio · 60 min

**Mecanismo.** `ModernJavaDemo` usa un `switch` exhaustivo sobre la interfaz sellada `Envio`, `Thread.ofVirtual()` para crear un hilo ligero y `ScopedValue.where(...).run(...)` para ligar `req-1` durante una ejecución. El proyecto activa además `spring.threads.virtual.enabled=true`, y el procesamiento AOT de Spring generó 107 archivos bajo `target/spring-aot`.

**Por qué existe.** Un servicio Spring con I/O bloqueante puede usar virtual threads sin reescribirlo a reactivo. Los scoped values intentan reemplazar `ThreadLocal` con un contexto con ámbito y sin mutabilidad compartida. El pattern matching elimina casts en ramas de dominio. AOT precalcula metadatos para reducir el trabajo de arranque.

**Implicaciones.** En este runtime, `Thread.ofVirtual()` devuelve `virtual=true`. El valor ligado se leyó correctamente en el hilo principal, pero un hijo virtual creado con `Thread.ofVirtual().start()` **no heredó** la ligadura: la primera corrida falló con `NoSuchElementException: ScopedValue not bound`. El código final reenlaza explícitamente el valor dentro del hijo. AOT sí se ejecutó y generó fuentes, clases y recursos; no se produjo una imagen nativa porque `native-image` no está instalado.

**Confusión común.** Suponer que AOT es “compilar a binario nativo”. Aquí se verificó `spring-boot:process-aot`, no GraalVM Native Image. También es habitual creer que un virtual thread hereda todo el contexto; la evidencia de abajo muestra lo contrario en este entorno.

#### `src/main/java/com/aurora/sb0/dominio/Envio.java`

```java
package com.aurora.sb0.dominio;

public sealed interface Envio permits EnvioDomicilio, EnvioDigital {
    String id();
}
```

#### `src/main/java/com/aurora/sb0/dominio/EnvioDomicilio.java`

```java
package com.aurora.sb0.dominio;

public record EnvioDomicilio(String id, String ciudad) implements Envio {}
```

#### `src/main/java/com/aurora/sb0/dominio/EnvioDigital.java`

```java
package com.aurora.sb0.dominio;

public record EnvioDigital(String id, String email) implements Envio {}
```

#### `src/main/java/com/aurora/sb0/moderno/ModernJavaDemo.java`

```java
package com.aurora.sb0.moderno;

import com.aurora.sb0.dominio.Envio;
import com.aurora.sb0.dominio.EnvioDigital;
import com.aurora.sb0.dominio.EnvioDomicilio;
import org.springframework.stereotype.Component;

import java.util.NoSuchElementException;

@Component
public class ModernJavaDemo {
    private static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

    public String describir(Envio envio) {
        return switch (envio) {
            case EnvioDomicilio d -> "domicilio:" + d.ciudad();
            case EnvioDigital d -> "digital:" + d.email();
        };
    }

    public String contextoYThread() {
        StringBuilder salida = new StringBuilder();
        ScopedValue.where(REQUEST_ID, "req-1").run(() -> {
            salida.append("scoped=").append(REQUEST_ID.get());
            String padre = REQUEST_ID.get();
            Thread hijo = Thread.ofVirtual().start(() ->
                    ScopedValue.where(REQUEST_ID, padre).run(() ->
                            salida.append(" hijo=").append(REQUEST_ID.get())
                                    .append(" virtual=").append(Thread.currentThread().isVirtual())));
            esperar(hijo);
        });
        return salida.toString();
    }

    public String sinReenlace() {
        StringBuilder salida = new StringBuilder();
        ScopedValue.where(REQUEST_ID, "req-2").run(() -> {
            Thread hijo = Thread.ofVirtual().start(() -> {
                try {
                    salida.append(REQUEST_ID.get());
                } catch (NoSuchElementException e) {
                    salida.append("NoSuchElementException");
                }
            });
            esperar(hijo);
        });
        return "sinReenlace=" + salida;
    }

    private static void esperar(Thread hijo) {
        try {
            hijo.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }
}
```

#### `src/test/java/com/aurora/sb0/JavaModernoTest.java`

```java
package com.aurora.sb0;

import com.aurora.sb0.dominio.EnvioDigital;
import com.aurora.sb0.dominio.EnvioDomicilio;
import com.aurora.sb0.moderno.ModernJavaDemo;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JavaModernoTest {
    private final ModernJavaDemo demo = new ModernJavaDemo();

    @Test
    void patternMatchingDistingueSubtiposSellados() {
        assertEquals("domicilio:Madrid", demo.describir(new EnvioDomicilio("E1", "Madrid")));
        assertEquals("digital:ana@example.com", demo.describir(new EnvioDigital("E2", "ana@example.com")));
    }

    @Test
    void scopedValueReenlazadoEnHijoVirtual() {
        assertEquals("scoped=req-1 hijo=req-1 virtual=true", demo.contextoYThread());
    }

    @Test
    void scopedValueSinReenlaceNoEstaLigadoEnElHijo() {
        assertEquals("sinReenlace=NoSuchElementException", demo.sinReenlace());
    }
}
```

Salida observada en la ejecución:

```text
pattern=domicilio:Madrid
pattern=digital:ana@example.com
scoped=req-1 hijo=req-1 virtual=true
sinReenlace=NoSuchElementException
```

Salida observada del primer intento, antes de reenlazar el valor en el hijo:

```text
Exception in thread "" java.util.NoSuchElementException: ScopedValue not bound
	at java.base/java.lang.ScopedValue.slowGet(ScopedValue.java:577)
	at java.base/java.lang.ScopedValue.get(ScopedValue.java:570)
	at com.aurora.sb0.moderno.ModernJavaDemo.lambda$contextoYThread$1(ModernJavaDemo.java:24)
org.opentest4j.AssertionFailedError: expected: <scoped=req-1 hijo=req-1 virtual=true> but was: <scoped=req-1 hijo=>
```

Salida observada de AOT y de su límite:

```text
$ ./mvnw -q -DskipTests spring-boot:process-aot
EXIT=0
$ for d in sources classes resources; do printf '%s=' "$d"; find "target/spring-aot/main/$d" -type f 2>/dev/null | wc -l; done
sources=      46
classes=      59
resources=       2
$ command -v native-image || echo 'native-image: no disponible'
native-image: no disponible
```

No se ejecutó GraalVM Native Image ni se compiló un ejecutable nativo: el entorno no tiene `native-image` ni `jaotc`. Tampoco se midió una ganancia de arranque atribuible a AOT; solo se verificó que la generación de sources/classes/resources ocurre y termina con exit 0.

## Verificación real

Ejecutado el 2026-11-23 desde `/tmp/opencode/aurora-sb0/aurora-sb0` (macOS arm64, JDK 27.0.1.0.2, wrapper Maven 3.10.1, Spring Boot 4.2.0, target Java 25).

| Comando (desde `/tmp/opencode/aurora-sb0/aurora-sb0`) | Resultado observado |
|---|---|
| `java -version` | `openjdk version "27.0.1.0.2"`, Temurin 27.0.1.0.2+1 |
| `./mvnw -version` | `Apache Maven 3.10.1`, Java 27.0.1.0.2 |
| `./mvnw -q test` | exit 0 |
| Lectura de `target/surefire-reports/TEST-*.xml` | 6 suites, 9 tests, 0 failures, 0 errors, 0 skipped |
| `./mvnw -Dtest=ServicioEnviosSinContenedorTest test` | `Tests run: 2, Failures: 0, Errors: 0, Skipped: 0`, `BUILD SUCCESS` |
| `./mvnw -q -DskipTests package` | exit 0; genera `target/aurora-sb0-0.0.1-SNAPSHOT.jar` |
| `java -jar target/aurora-sb0-0.0.1-SNAPSHOT.jar` | exit 0; demos de los 7 temas y apagado con fases 20 → 10 |
| `java -jar target/aurora-sb0-0.0.1-SNAPSHOT.jar --debug` | `AopAutoConfiguration matched`, `CglibAutoProxyConfiguration matched`, `applicationTaskExecutorVirtualThreads matched` |
| `./mvnw -q -DskipTests spring-boot:process-aot` | exit 0; 46 sources, 59 clases y 2 recursos generados |
| `javap -verbose target/classes/com/aurora/sb0/AuroraSb0Application.class \| grep 'major version'` | `major version: 69` (Java 25) |
| `command -v native-image` | no disponible; no se produjo imagen nativa |

`./mvnw -q test` termina con exit 0 y no imprime un resumen de tests porque Maven está en modo `-q`. El resumen agregado leído de los XML generados es:

```text
<testsuite xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report.xsd" version="3.0.2" name="com.aurora.sb0.AopTest" time="0.005" tests="1" errors="0" skipped="0" failures="0" flakes="0">
<testsuite xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report.xsd" version="3.0.2" name="com.aurora.sb0.AuroraSb0ApplicationTests" time="0.706" tests="1" errors="0" skipped="0" failures="0" flakes="0">
<testsuite xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report.xsd" version="3.0.2" name="com.aurora.sb0.CicloVidaTest" time="0.006" tests="1" errors="0" skipped="0" failures="0" flakes="0">
<testsuite xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report.xsd" version="3.0.2" name="com.aurora.sb0.ContextoTest" time="0.005" tests="1" errors="0" skipped="0" failures="0" flakes="0">
<testsuite xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report.xsd" version="3.0.2" name="com.aurora.sb0.JavaModernoTest" time="0.005" tests="3" errors="0" skipped="0" failures="0" flakes="0">
<testsuite xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report.xsd" version="3.0.2" name="com.aurora.sb0.ServicioEnviosSinContenedorTest" time="0.003" tests="2" errors="0" skipped="0" failures="0" flakes="0">
```

Salida literal del JAR filtrada con `grep -E 'Starting|INIT |BPP |START |STOP |DESTROY |^(consultar|campo|spel|propiedades|primary=|singleton=|prototype=|aopProxy=|aopJdk=|AOP JDK:|jdk\.|spring\.|pattern=|scoped=|sinReenlace=)'`:

```text
2026-11-23T03:35:24.165-05:00  INFO 43223 --- [aurora-sb0] [           main] com.aurora.sb0.AuroraSb0Application      : Starting AuroraSb0Application v0.0.1-SNAPSHOT using Java 27.0.1.0.2 with PID 43223 (/private/tmp/opencode/aurora-sb0/aurora-sb0/target/aurora-sb0-0.0.1-SNAPSHOT.jar started by nicolasruiz in /private/tmp/opencode/aurora-sb0/aurora-sb0)
INIT ServicioEnvios etiqueta=aurora-verificacion
BPP detectado: servicioEnvios
INIT @PostConstruct CicloVidaAuditoria
INIT @PostConstruct CicloVidaEnvios
START phase=10 CicloVidaEnvios
START phase=20 CicloVidaAuditoria
consultar=ok:A1 [AOP 42us]
campo=ok:A1
spel=aurora-verificacion
propiedades=placeholder=aurora spel=AURORA-verificacion
primary=EMAIL qualifier=SMS
singleton=true
prototype=true
aopProxy=true
aopJdk=false
AOP JDK: interna
jdk.externa=externa->interna jdk.interna=interna
spring.externa=externa->interna
spring.interna=interna [AOP]
pattern=domicilio:Madrid
pattern=digital:ana@example.com
scoped=req-1 hijo=req-1 virtual=true
sinReenlace=NoSuchElementException
STOP phase=20 CicloVidaAuditoria
STOP phase=10 CicloVidaEnvios
DESTROY @PreDestroy CicloVidaEnvios
DESTROY @PreDestroy CicloVidaAuditoria
DESTROY ServicioEnvios
```

La línea `Starting ...` incluye PID, hora y ruta reales de esa corrida; son datos de ejecución, no valores fijos.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `Non-resolvable parent POM ... 4.2.0.RELEASE (absent)` | Initializr devuelve un id de versión que Central no publica | `curl -sS .../maven-metadata.xml` muestra `4.2.0`, no `4.2.0.RELEASE` | Usar `<version>4.2.0</version>` en el parent |
| `'dependencies.dependency.version' for spring-boot-starter-aop is missing` | Boot 4 ya no gestiona ese artifactId | `grep '<artifactId>spring-boot-starter-' spring-boot-dependencies-4.2.0.pom` | Cambiar a `spring-boot-starter-aspectj` |
| `Initializr 400: Unknown dependency 'aop'` | El id no existe en el metadata del servicio | `curl .../metadata/client | jq '.dependencies.values[]...'` | Añadir la dependencia editando el POM |
| `LifecycleProcessor not initialized` en `@SpringBootTest` | Un `CommandLineRunner` cerró el contexto durante el test | El stack trace apunta a `DefaultContextCache.restartContextIfNecessary` | No cerrar el contexto desde un runner de tests; llamar `close()` desde `main` |
| `NoUniqueBeanDefinitionException` para `Notificador` | Dos implementaciones sin desambiguación | Revisar candidatos por tipo | `@Primary` para el favorito, `@Qualifier("sms")` para la excepción |
| `@Around` no se aplica | La llamada es interna (`this.interna()`) | Comparar `spring.externa` y `spring.interna` en la salida | Llamar por el proxy, extraer otro bean o usar weaving |
| `aopJdk=false` aunque el bean implementa una interfaz | Proxy CGLIB por defecto | `--debug` muestra `proxy-target-class=true` | Configurar el tipo de proxy solo si la aplicación lo necesita |
| `ScopedValue not bound` en un hijo virtual | El hijo no heredó la ligadura del padre | Excepción real en la primera corrida | Reenlazar con `ScopedValue.where(...)` dentro del hijo |
| Falta `DESTROY ScopedServicio prototype` | Spring no gestiona destrucción de prototypes | Revisar la salida de apagado | Cerrar el recurso en el código que posee la instancia |
| Esperar un binario nativo tras `process-aot` | AOT no es Native Image | `command -v native-image` falla en este entorno | Verificar solo la generación AOT y documentar el límite |

## Cierre

El contenedor decide composición, scopes, callbacks y proxies; por eso el modelo mental correcto empieza por el ciclo de vida del bean y no por la lista de anotaciones. Constructor injection facilita probar sin contenedor, `@PostConstruct`/`SmartLifecycle`/`@PreDestroy` ordenan arranque y apagado, `@Aspect` solo intercepta lo que pasa por el proxy, y `@Primary`/`@Qualifier`/SpEL resuelven casos concretos de selección y configuración. Java moderno aporta herramientas reales, pero sus límites —como la ligadura de `ScopedValue` en hijos o la ausencia de `native-image`— se establecen con evidencia, no con suposiciones.

## Checklist

- Creé el proyecto desde start.spring.io y ajusté el POM a lo que Maven Central realmente publica.
- Conecté un `@Service` con su repositorio por constructor y lo probé sin Spring.
- Verifiqué singleton frente a prototype y observé que el prototype no recibe `@PreDestroy`.
- Ordené `@PostConstruct`, `start`, `stop` y `@PreDestroy` con fases 10 y 20.
- Medí `ServicioEnvios` con `@Around` y comprobé `AopUtils.isAopProxy`.
- Reproduje la autoinvocación con un proxy JDK y con Spring.
- Resolví dos implementaciones con `@Primary` y `@Qualifier` y comparé `${...}` con `#{...}`.
- Ejecuté virtual threads, pattern matching, scoped values y el procesamiento AOT, y documenté lo que no se pudo verificar.
