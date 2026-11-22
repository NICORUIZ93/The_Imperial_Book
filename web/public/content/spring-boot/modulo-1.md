# Módulo 1: Spring Boot CLI y estructura de proyecto

Cada tema se practica por separado con su propia repetición progresiva y su propio reto de memoria. La fusión de configuración base + perfil se verifica con la aplicación Spring Boot real, arrancando con y sin el perfil activo y comparando los valores efectivos.

**Referencia al cerrar M0–M1:** `README.md` reúne las clases finales y cinco pruebas. Úsala para comparar después de escribir tus archivos; no equivale a haber ejecutado cada cambio y fallo del recorrido.

## Alternativa comprobable con Gradle

Elige Maven o Gradle para una misma sesión. Ambos ejecutan las mismas clases y
pruebas; sus archivos de build tienen sintaxis diferente. En las instrucciones
que siguen, `pom.xml` y `mvnw` son la ruta original Maven. Si eliges Gradle, abre
`build.gradle` del laboratorio y usa las equivalencias de esta sección.

Desde la raíz del repositorio:

```bash
./gradlew --version
./gradlew clean classes test
./gradlew bootRun --args='--spring.profiles.active=dev'
```

En Windows PowerShell usa `.\gradlew.bat`. Java debe ser 25; el Wrapper descarga
Gradle 9.8.2. El test genera su informe en `build/reports/tests/test/`. En otra
terminal consulta `curl http://localhost:8080/perfil`: debes recibir
`banner=Desarrollo; entorno=compartido`. Detén el proceso con Ctrl+C antes de
cambiar de práctica.

**Fallo y diagnóstico:** si escribes `--spring.profiles.active=deev`, aparece el
banner base: no existe `application-deev.yml`. Corrige a `dev` y repite la petición.
Conserva ambas respuestas y explica qué archivo cambió el valor.

| Cuando el tema indica Maven | En la alternativa Gradle |
|---|---|
| `./mvnw test` | `./gradlew test` |
| `./mvnw clean test` | `./gradlew clean classes test` |
| `./mvnw -Dtest=ServicioEnviosTest test` | `./gradlew test --tests '*ServicioEnviosTest'` |
| `./mvnw spring-boot:run` | `./gradlew bootRun` |
| argumento de perfil Maven | `./gradlew bootRun --args='--spring.profiles.active=dev'` |
| agregar una dependencia XML al POM | agregar sus coordenadas a `dependencies` en `build.gradle` |

`implementation` añade código principal; `testImplementation` añade bibliotecas
de tests. `platform(...)` importa versiones del BOM, no todas sus dependencias.
Lombok/MapStruct requieren además `annotationProcessor`. gRPC, contratos y AOT
necesitan tareas específicas ya declaradas en sus laboratorios: consulta
`docs/SPRING-BOOT-GRADLE.md`. No conviertas un plugin Maven en una dependencia
normal ni esperes archivos de Gradle dentro de `target/`.

**Fuentes:** [plugin Gradle de Boot](https://docs.spring.io/spring-boot/gradle-plugin/getting-started.html),
[compatibilidad Java/Gradle](https://docs.gradle.org/current/userguide/compatibility.html).

## Aprende construyendo


### Tema 1: Spring Initializr y starters · Básico · 30 min

**Caso guía**: necesitas crear un servicio web Spring Boot sin armar dependencias a mano y entender qué trae cada starter.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Spring Initializr | Generador de proyectos (start.spring.io, IDE, CLI). | Bootstrap consistente. | Fijar Boot, Java, build tool, metadata. | Aceptar defaults sin revisar Java/Boot. |
| Starter | Dependencia “paraguas” que trae un conjunto curado. | Arranque rápido y compatible. | Agregar starter por capacidad. | Agregar dependencias individuales contradictorias. |
| BOM/parent | `spring-boot-starter-parent` o BOM administra versiones. | Compatibilidad entre dependencias. | Dejar que Boot gestione versiones. | Fijar versiones manuales sin necesidad. |
| Dependencias transitivas | Dependencias traídas indirectamente por un starter. | Entender el classpath. | Inspeccionar con `dependency:tree`/`dependencies`. | “No sé por qué está Jackson”. |

**Implementación desde cero (Maven)**
```bash
mkdir ejemplo-spring-m1 && cd ejemplo-spring-m1
curl -fsSL -G 'https://start.spring.io/starter.zip' \
  -d type=maven-project -d language=java -d javaVersion=25 -d bootVersion=4.1.2 \
  -d groupId=com.example -d artifactId=demo -d name=demo -d packageName=com.example.demo \
  -d dependencies=web -o app.zip
unzip app.zip
./mvnw test
```
Equivalente Gradle: `type=gradle-project` y `./gradlew test`.

`SaludController.java`
```java
package com.example.demo;
import org.springframework.web.bind.annotation.*;
@RestController
public class SaludController { @GetMapping("/health") public String health(){ return "OK"; } }
```

**Ejecución y salida real**
```bash
./mvnw spring-boot:run
curl -i http://localhost:8080/health
```
Salida esperada: `HTTP/1.1 200` y cuerpo `OK`.

**Verificación**: `./mvnw dependency:tree | grep spring-boot-starter-web` muestra el starter; cambia a Gradle y confirma `./gradlew dependencies --configuration runtimeClasspath`.

### Tema 2: application.yml vs application.properties · Básico · 30 min

**Caso guía**: configurar puerto y un valor propio; entender precedencia entre formatos y overrides.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `application.properties` | Configuración key=value plana. | Simple y directa. | Una clave por línea. | Duplicar claves accidentalmente. |
| `application.yml` | Configuración jerárquica YAML. | Estructura legible. | Cuidar indentación espacios. | Tabs/indentación inválida. |
| Precedencia de config | Spring Boot resuelve propiedades por orden de fuentes. | Predecir valor efectivo. | Args CLI/env vars ganan sobre archivos empaquetados. | “Cambié YAML pero no toma”. |
| `@Value` / `@ConfigurationProperties` | Inyección de propiedades. | Usar config en código. | `@ConfigurationProperties` para grupos. | `@Value` por todos lados sin validación. |

**Implementación desde cero**

`application.yml`
```yaml
academia:
  banner: "En camino"
server:
  port: 8080
```
`ConfigController.java`
```java
package com.example.demo;
import org.springframework.beans.factory.annotation.Value; import org.springframework.web.bind.annotation.*;
@RestController
public class ConfigController {
  private final String banner;
  public ConfigController(@Value("${academia.banner:sin-configurar}") String banner){ this.banner=banner; }
  @GetMapping("/banner") public String mostrar(){ return banner; }
}
```

**Ejecución y salida real**
```bash
./mvnw spring-boot:run
curl http://localhost:8080/banner
# override por argumento
./mvnw spring-boot:run -Dspring-boot.run.arguments=--academia.banner=Prueba
curl http://localhost:8080/banner
```
Salida esperada: `En camino` y luego `Prueba`.

**Verificación**: si conviven `.properties` y `.yml` en misma ubicación, verifica la precedencia documentada para tu versión; evita tener ambos para la misma clave.

### Tema 3: Perfiles y estructura por capas · Intermedio · 35 min

**Caso guía**: mismo código, distinta config por entorno, y separación controller-service-repository.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Perfil Spring (`spring.profiles.active`) | Grupo de config/beans activo para un entorno. | dev/test/prod. | Activar por env/arg, no hardcode. | Lógica `if(prod)` dispersa. |
| `application-{profile}.yml` | Archivo de config específico de perfil. | Sobrescribir valores base. | Mantener base mínima común. | Duplicar toda la config en cada perfil. |
| Estructura por capas | Controller (HTTP) → Service (negocio) → Repository (datos). | Separación de responsabilidades. | Dependencias hacia abajo. | Controller accediendo a DB directo. |
| Paquetes por rol/feature | Organización de código. | Mantenibilidad. | Consistencia en el equipo. | Paquetes caóticos sin frontera. |

**Implementación desde cero**

`application.yml`
```yaml
academia:
  banner: "Base"
  entorno: "compartido"
```
`application-dev.yml`
```yaml
academia:
  banner: "Desarrollo"
```
`PerfilController.java`
```java
package com.example.demo;
import org.springframework.beans.factory.annotation.Value; import org.springframework.web.bind.annotation.*;
@RestController
public class PerfilController {
  private final String banner, entorno;
  public PerfilController(@Value("${academia.banner}") String banner, @Value("${academia.entorno}") String entorno){ this.banner=banner; this.entorno=entorno; }
  @GetMapping("/perfil") public String mostrar(){ return "banner="+banner+"; entorno="+entorno; }
}
```
Capas:
```java
package com.example.demo.repository;
import org.springframework.stereotype.Repository;
@Repository public class EstadoRepository { public String buscar(String c){ return "En ruta: "+c; } }
```
```java
package com.example.demo.service;
import com.example.demo.repository.EstadoRepository; import org.springframework.stereotype.Service;
@Service public class EstadoService { private final EstadoRepository repo; public EstadoService(EstadoRepository repo){this.repo=repo;} public String consultar(String c){ return repo.buscar(c);} }
```

**Ejecución y salida real**
```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev
curl http://localhost:8080/perfil
```
Salida esperada: `banner=Desarrollo; entorno=compartido`.

**Verificación**: corre sin perfil y confirma `banner=Base`; prueba `SPRING_PROFILES_ACTIVE=dev`.

