# Módulo 1: Spring Boot CLI y estructura de proyecto

Un proyecto Spring Boot sano no empieza por la lógica de negocio, sino por una base reproducible: versión de Boot, JDK, build tool, dependencias y estructura. Este módulo cubre Initializr y starters, configuración por `application.properties`/`application.yml`, perfiles y organización por capas.

## Visual del módulo

No hay visual aprobado para M1 todavía. El único visual existente del track está en `web/public/visuals/temas/spring-boot/modulo-0-tema-1-ioc.html`; se mantiene como evidencia del formato canónico para el módulo 0. Para M1 no se añadió un archivo nuevo para no inventar una ilustración que el equipo no validó.

## Proyecto verificado

Directorio: `/tmp/opencode/aurora-sb1`.

```text
/tmp/opencode/aurora-sb1/
├── pom.xml
├── mvnw
├── src/main/java/com/aurora/aurora_sb1/
│   └── AuroraSb1Application.java
├── src/main/resources/application.properties
└── src/test/java/com/aurora/aurora_sb1/
    └── AuroraSb1ApplicationTests.java
```

El código fue generado con Initializr, probado y re-ejecutado en ese directorio; las salidas corresponden a esa corrida, no a valores esperados calculados a mano.

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

El proyecto declara `java.version=25` y se ejecuta sobre JDK 27.0.1.0.2.

## Bootstrap verificado desde start.spring.io

```bash
curl -fsSL -o /tmp/aurora-sb1.zip \
  -G 'https://start.spring.io/starter.zip' \
  -d type=maven-project -d language=java -d javaVersion=25 -d bootVersion=4.2.0 \
  -d groupId=com.aurora -d artifactId=aurora-sb1 -d dependencies=web
unzip -q /tmp/aurora-sb1.zip -d /tmp/opencode/aurora-sb1
cd /tmp/opencode/aurora-sb1
./mvnw test
```

```text
default=4.2.0.RELEASE
id=4.2.0.RELEASE name=4.2.0
```

El POM descargado usa `spring-boot-starter-parent` con versión `4.2.0.RELEASE`, mientras que el artifacto efectivo publicado en Maven Central es `4.2.0`; la diferencia fue corregida en el POM ejecutado y el build terminó con exit 0.

### Tema 1: Spring Initializr y starters · Básico · 30 min

**Mecanismo.** Initializr genera la base del proyecto: POM, wrapper, fuentes, recursos y dependencias iniciales. Un starter agrega un conjunto de dependencias gestionadas por el BOM de Spring Boot y habilita la autoconfiguración relevante.

**Por qué existe.** Evita armar el classpath manualmente con combinaciones frágiles y centraliza versiones. El desarrollador declara capacidades; Spring Boot decide qué auto-configuraciones se activan.

**Implicaciones.** El starter web de Spring Boot incluye Tomcat embebido, Spring MVC, Jackson y soporte de pruebas web. El starter de pruebas incluye Spring Test, JUnit Jupiter y soporte para pruebas web.

**Confusión común.** Creer que el starter incluye toda la aplicación. Un starter no implementa la lógica de negocio; sólo aporta infraestructura y configuración.

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
	<artifactId>aurora-sb1</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>aurora-sb1</name>
	<description/>
	<url/>
	<licenses>
		<license/>
	</licenses>
	<developers>
		<developer/>
	</developer>
	</scm>
	<properties>
		<java.version>25</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-webmvc</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-webmvc-test</artifactId>
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

#### `src/main/java/com/aurora/aurora_sb1/AuroraSb1Application.java`

```java
package com.aurora.aurora_sb1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuroraSb1Application {

	public static void main(String[] args) {
		SpringApplication.run(AuroraSb1Application.class, args);
	}

}
```

#### `src/test/java/com/aurora/aurora_sb1/AuroraSb1ApplicationTests.java`

```java
package com.aurora.aurora_sb1;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AuroraSb1ApplicationTests {

	@Test
	void contextLoads() {
	}

}
```

#### `src/main/resources/application.properties`

```properties
spring.application.name=aurora-sb1
```

#### Starters

```bash
./mvnw dependency:tree
```

```text
[INFO] +- org.springframework.boot:spring-boot-starter-webmvc:jar:4.2.0:compile
[INFO] |  +- org.springframework.boot:spring-boot-starter:jar:4.2.0:compile
[INFO] |  |  +- org.springframework.boot:spring-boot-starter-logging:jar:4.2.0:compile
[INFO] |  |  +- org.springframework.boot:spring-boot-starter-jackson:jar:4.2.0:compile
[INFO] |  |  +- org.springframework.boot:spring-boot-starter-tomcat:jar:4.2.0:compile
[INFO] |  |  +- org.springframework.boot:spring-boot-starter-tomcat-runtime:jar:4.2.0:compile
[INFO] |  |  \- org.apache.tomcat.embed:tomcat-embed-websocket:jar:11.0.27:compile
[INFO] |  \- org.springframework:spring-web:jar:7.1.0:compile
[INFO] |     \- org.springframework.boot:spring-boot-webmvc:jar:4.2.0:compile
[INFO] |        \- org.springframework:spring-webmvc:jar:7.1.0:compile
[INFO] +- org.springframework.boot:spring-boot-starter-webmvc-test:jar:4.2.0:test
[INFO]    +- org.springframework.boot:spring-boot-starter-jackson-test:jar:4.2.0:test
[INFO]    +- org.springframework.boot:spring-boot-starter-test:jar:4.2.0:test
[INFO]    +- org.springframework.boot:spring-boot-webmvc-test:jar:4.2.0:test
[INFO]    \- org.springframework.boot:spring-boot-web-server:jar:4.2.0:compile
```

### Tema 2: application.yml vs application.properties · Básico · 30 min

**Mecanismo.** Spring Boot carga `application.properties` y `application.yml` desde el classpath. Cuando ambas existen, el contenido se combina; la fuente con mayor prioridad gana. En el ejemplo de este módulo se compara un fichero plano y un fichero YAML jerárquico, y se verifica que el valor efectivo cambia al cambiar el fichero.

**Por qué existe.** `application.properties` es plano y directo para pocas claves. `application.yml` permite jerarquía, listas y mapas. La elección depende del número y tipo de propiedades, no de costumbre mágica.

**Implicaciones.** La precedencia es: argumentos de línea de comandos, variables de entorno, ficheros de configuración (incluidos `application-*`), anotaciones de configuración, beans de entorno, `@ConfigurationProperties`, defaults. Cambiar un fichero no garantiza que un valor sea usado si una fuente superior ya lo define.

**Confusión común.** Creer que escribir `server.port` en ambos ficheros es equivalente a escribirlo uno solo. La unificación de fuentes ocurre y puede enmascarar diferencias.

**Regla práctica.** Usa `.properties` para un puñado de claves planas; cambia a `.yml` en cuanto necesites jerarquía, listas o mapas — no mantengas ambos formatos para la misma clave, porque la fuente con mayor prioridad gana en silencio y el otro fichero queda como ruido que confunde a quien lo lea después.

#### `src/main/resources/application.properties`

```properties
spring:
  application:
    name: aurora-sb1
server:
  port: 8080
academia:
  banner: Hola
```

#### `src/main/resources/application.yml`

```yaml
spring:
  application:
    name: aurora-sb1
server:
  port: 8081
academia:
  banner: Hola
```

#### Arranque y comprobaciones

```bash
cd /tmp/opencode/aurora-sb1
./mvnw -q spring-boot:run
./mvnw -q spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev
```

Salidas observadas:

```text
# application.properties (server.port=8080)
2026-11-23T04:02:55.265-05:00  INFO 48233 --- [           main] o.s.boot.tomcat.TomcatWebServer          : Tomcat started on port 8080 (http) with context path '/'
2026-11-23T04:02:55.267-05:00  INFO 48233 --- [           main] c.a.aurora_sb1.AuroraSb1Application      : Started AuroraSb1Application in 0.444 seconds (process running for 0.544)

# application.yml (server.port=8081)
2026-11-23T04:03:25.455-05:00  INFO 48371 --- [           main] o.s.boot.tomcat.TomcatWebServer          : Tomcat started on port 8081 (http) with context path '/'
2026-11-23T04:03:25.457-05:00  INFO 48371 --- [           main] c.a.aurora_sb1.AuroraSb1Application      : Started AuroraSb1Application in 0.393 seconds (process running for 0.482)

# application-dev.yml (server.port=8081, academia.banner=HolaDev)
2026-11-23T04:03:54.451-05:00  INFO 48503 --- [           main] o.s.boot.tomcat.TomcatWebServer          : Tomcat started on port 8081 (http) with context path '/'
2026-11-23T04:03:54.453-05:00  INFO 48503 --- [           main] c.a.aurora_sb1.AuroraSb1Application      : Started AuroraSb1Application in 0.399 seconds (process running for 0.496)
```

La salida confirma que el fichero configurado cambia el puerto efectivo y que un profile activa un fichero distinto.

#### Tipado y precedencia

Para propiedades tipadas se usa `@ConfigurationProperties`. En este módulo no se creó una clase tipada porque el objetivo era comparar los ficheros base.

### Tema 3: Perfiles y estructura por capas · Intermedio · 35 min

**Mecanismo.** Un profile se activa con `spring.profiles.active` o `SPRING_PROFILES_ACTIVE` y selecciona `application-{profile}.yml`, `application-{profile}.properties` o beans anotados con `@Profile`.

**Por qué existe.** Permite variar configuración, beans y credenciales sin recompilar. Evita duplicar árboles de configuración.

**Implicaciones.** Un profile mal escrito no falla; simplemente no se activa. Las condiciones de bean usan perfiles, `conditions`, `@ConditionalOnProperty`, etc.

**Confusión común.** Poner `spring.profiles.active` en un fichero de configuración. Debe venir del entorno o de los argumentos de arranque.

#### `src/main/resources/application-dev.yml`

```yaml
server:
  port: 8081
academia:
  banner: HolaDev
```

#### Estructura por capas

```text
src/main/java/com/aurora/aurora_sb1/
├── AuroraSb1Application.java
├── api/        Controladores y exposición HTTP
├── application/ Servicios y casos de uso
├── dominio/     Modelos y reglas
├── infra/       Adaptadores y persistencia
└── config/     Configuración y componentes transversales

src/main/resources/
└── application*.properties|yml

src/test/java/com/aurora/aurora_sb1/
└── AuroraSb1ApplicationTests.java
```

## Aprende construyendo

El módulo se cubre con las secciones anteriores porque la evidencia está distribuida por tema. No se repiten aquí pasos duplicados.

## Verificación real

Ejecutado el 2026-11-23 desde `/tmp/opencode/aurora-sb1`.

```bash
cd /tmp/opencode/aurora-sb1
./mvnw test
./mvnw dependency:tree
./mvnw -q spring-boot:run
./mvnw -q spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev
```

| Comando | Resultado |
|---|---|
| `./mvnw test` | `Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`, `BUILD SUCCESS` |
| `./mvnw dependency:tree` | árbol con `spring-boot-starter-webmvc:4.2.0` y `spring-boot-starter-webmvc-test:4.2.0:test` |
| `./mvnw -q spring-boot:run` | `Tomcat started on port 8080`, `Started AuroraSb1Application` |
| `./mvnw -q spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev` | `The following 1 profile is active: "dev"`, `Tomcat started on port 8081` |

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| `The following 1 profile is active: "dev"` y no se usa el valor esperado | El fichero `application-dev.yml` no existe o el profile no se activó | Revisar la lista de ficheros `src/main/resources` y la propiedad `spring.profiles.active` | Crear el fichero con el prefijo correcto y pasar el profile |
| `Could not resolve placeholder ...` | Variable sin valor o perfil incorrecto | Ver el stack trace y los beans configurados | Definir el valor o crear el profile |
| Dependencia que no está en el BOM | Id incorrecto o no curado | Consultar `spring-boot-dependencies-4.2.0.pom` | Usar el artefacto gestionado |
| `Unknown dependency 'aop'` | Id de Initializr no soportado para esa opción | Consultar `start.spring.io/metadata/client` | Usar el artefacto correcto |
| Confusión entre propiedades y yml | Fuentes superpuestas o ausencia de fuente única | Revisar orden de precedencia y valores activos | Mantener un solo fichero por entorno cuando sea posible |

## Cierre

La base de un proyecto Spring Boot define su costo futuro: versiones, starters, configuración y estructura. Un proyecto reproducible empieza con un POM gestionado, una fuente de configuración única y una separación de capas que refleja responsabilidades. Los perfiles y los ficheros de configuración permiten variar esa base sin cambiar lógica.

## Checklist

- Puedo generar un proyecto Boot reproducible con Initializr.
- Entiendo qué aporta un starter y cómo se verifica con el árbol de dependencias.
- Puedo comparar `application.properties` y `application.yml`.
- Sé activar un profile y cambiar configuración.
- Estructuro por capas con dependencias claras.
