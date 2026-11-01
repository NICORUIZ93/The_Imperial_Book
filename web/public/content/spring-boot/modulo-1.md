# Módulo 1: Spring Boot CLI y estructura de proyecto

Cada tema declara nivel, duración y una verificación reproducible. La configuración base y el perfil se comprueban con la aplicación Spring Boot real, arrancando con y sin el perfil activo y comparando los valores efectivos.

## Aprende construyendo

### Tema 1: Spring Initializr y starters · Básico · 20 min

**Prerrequisito:** Módulo 0 (contenedor de Spring, `@Service`).

**Al terminar podrás:** elegir starters con criterio y comprobar que evitan el "dependency hell" de resolver manualmente versiones compatibles.

#### Aprende

**¿Por qué es importante?** Un servicio de entregas que necesita exponer HTTP, persistir en PostgreSQL y validar entradas no debería requerir que el equipo investigue manualmente qué versiones de Tomcat, Hibernate y Jackson son compatibles entre sí para la versión de Spring Boot elegida.

**Conceptos clave:** starter, dependencias preconfiguradas, generación de estructura base.

[start.spring.io](https://start.spring.io) genera la estructura base de un proyecto a partir de starters seleccionados (`web`, `data-jpa`, `security`, `postgresql`). Cada starter es un conjunto curado de dependencias preconfiguradas que trabajan juntas de forma coherente: `spring-boot-starter-web` trae lo necesario para exponer APIs HTTP; `spring-boot-starter-data-jpa` trae Hibernate y la infraestructura de Spring Data para persistencia. Esta curación es el valor añadido frente a agregar dependencias sueltas: Spring Boot gestiona internamente qué versiones son compatibles para una versión dada mediante su BOM, eliminando la matriz manual de compatibilidad (el "dependency hell").

**Analogía:** un starter es un kit de herramientas preensamblado para un propósito específico, donde todo lo incluido ya está verificado para trabajar junto, en vez de comprar cada herramienta por separado y comprobar manualmente su compatibilidad.

**Diagrama:** [Cómo Initializr genera un proyecto con starters](../../visuals/temas/spring-boot/modulo-1-tema-1-initializr-starters.html)

#### Practica

**Demo paso a paso.** Desde una carpeta vacía, genera el proyecto real con el starter `web`:

```bash
# descarga y arranca con Maven el proyecto generado por Spring Initializr
mkdir ejemplo-spring-m1
cd ejemplo-spring-m1
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip
unzip app.zip
./mvnw spring-boot:run
```

1. Crea `src/main/java/com/example/demo/SaludController.java` exponiendo `GET /health`:

```java
package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SaludController {
    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
```

**Explicación línea por línea:** `dependencies=web` en la URL de Initializr selecciona el starter `spring-boot-starter-web`, que trae Tomcat embebido, Jackson y Spring MVC ya autoconfigurados; `@RestController` marca la clase como manejador de peticiones HTTP que serializa directamente los valores de retorno; `@GetMapping("/health")` mapea `GET /health` a este método.

2. Guarda el archivo, reinicia la aplicación y confirma la respuesta:

```bash
curl http://localhost:8080/health
```

**Resultado esperado:** la respuesta HTTP es `200 OK` con cuerpo `OK`, confirmando que el starter `web` autoconfiguró un servidor HTTP funcional sin configuración manual de Tomcat, Jackson ni Spring MVC.

**Fallo deliberado:** genera un segundo proyecto sin el starter `web` (`-d dependencies=`) e intenta agregar el mismo `SaludController`. La compilación falla porque `org.springframework.web.bind.annotation.RestController` no existe en el classpath. Diagnostica confirmando que sin el starter correspondiente ni siquiera las anotaciones básicas de esa capacidad están disponibles, mucho antes de llegar a un error en tiempo de ejecución.

**Ejercicios.**

1. Agrega el starter `validation` a un proyecto existente y confirma que `@NotBlank`/`@NotNull` quedan disponibles.
2. Genera un proyecto con `data-jpa` sin `postgresql` (ni ningún driver) y observa el error real al arrancar.
3. Compara el `pom.xml` generado con y sin `security`, identificando qué dependencias nuevas aparecen.
4. Escribe de memoria los starters mínimos para una API HTTP que persiste en una base relacional.

**Pista:** antes de agregar una dependencia suelta, verifica si existe un starter que ya la incluya con versiones compatibles.

**Completa el código:** rellena el espacio para que el controlador responda a peticiones HTTP:

```java
@____
public class SaludController {
    @GetMapping("/health")
    public String health() { return "OK"; }
}
```

**Reto de memoria:** cierra este documento y escribe un controlador REST mínimo con un endpoint `GET` y los starters necesarios para que compile y arranque.

#### Aplica

**Reto abierto.** Genera un proyecto `entregas-api` con los starters mínimos para exponer HTTP, validar entradas y persistir en PostgreSQL. Justifica cada starter, elimina los que no uses y demuestra con `./mvnw dependency:tree` qué aporta cada uno. Después intenta arrancar sin el driver de base de datos y documenta el error exacto.

**Checklist de salida.**

- [ ] El proyecto arranca y `GET /health` responde `OK`.
- [ ] `pom.xml` contiene solo starters justificados en el README.
- [ ] La comprobación `./mvnw dependency:tree` identifica Tomcat, Jackson y Spring MVC.
- [ ] Reprodujiste y diagnosticaste el fallo por falta de un starter.
- [ ] El proyecto se regenera con el mismo comando desde una carpeta limpia.

**Si falla.** Si `curl` devuelve "connection refused", la aplicación no arrancó: lee la primera línea `Caused by:`. Si falla la compilación por una anotación ausente, compara el `pom.xml` con el proyecto de referencia y agrega el starter, no la dependencia suelta.

**Siguiente paso:** el Tema 2 compara los dos formatos de configuración externa.

**Errores comunes:** agregar dependencias sueltas en vez del starter correspondiente, arriesgando incompatibilidades; incluir starters que el proyecto no necesita, aumentando el arranque y la superficie de configuración.

**Límites y decisión de uso:** para una librería que no es una aplicación ejecutable, los starters de Spring Boot no aplican; usa dependencias de Spring Framework según lo que la librería necesite exponer.

**Fuente oficial:** [Spring Initializr](https://docs.spring.io/initializr/docs/current/reference/html/).

**Transferencia al proyecto integrador:** genera el microservicio productivo con `web`, `data-jpa`, `validation` y `postgresql` desde el principio, y conserva el `pom.xml` como evidencia de versiones resueltas.

### Tema 2: application.yml vs application.properties · Básico · 20 min

**Prerrequisito:** Tema 1 de este módulo.

**Al terminar podrás:** elegir entre YAML y properties y confirmar con la aplicación real que ambos formatos son funcionalmente equivalentes.

#### Aprende

**¿Por qué es importante?** Una configuración con varios niveles de anidación (`spring.datasource.url`, `spring.datasource.username`, `spring.jpa.hibernate.ddl-auto`) se vuelve visualmente repetitiva en `.properties` (el prefijo `spring.` se repite en cada línea), mientras que en `.yml` se agrupa jerárquicamente una sola vez, sin que ninguna de las dos formas cambie qué configuración es posible expresar.

**Conceptos clave:** configuración tipada, indentación jerárquica, equivalencia funcional.

`application.properties` expresa configuración como pares clave-valor planos con notación de puntos (`spring.datasource.url=jdbc:postgresql://localhost:5432/app`); `application.yml` expresa la misma configuración con indentación jerárquica (`spring: datasource: url: ...`), agrupando visualmente las claves relacionadas bajo su nodo padre. Ambos formatos son válidos y Spring Boot los soporta indistintamente (incluso se pueden mezclar en el mismo proyecto, aunque no es recomendable por claridad); la elección es una cuestión de legibilidad, sin diferencia funcional real.

**Analogía:** `application.properties` es una lista plana de instrucciones con prefijos repetidos; `application.yml` es un índice jerárquico con subcategorías anidadas, generalmente más fácil de navegar cuanto más profunda es la jerarquía.

**Diagrama:**

```text
┌── application.properties (plano) ──────────┐
│  spring.datasource.url=...                    │
│  spring.datasource.username=...                │
└──────────────────────────────────────┘
┌── application.yml (jerárquico) ────────────┐
│  spring:                                      │
│    datasource:                                │
│      url: ...                                 │
│      username: ...                            │
└──────────────────────────────────────┘
```

#### Practica

**Demo paso a paso.** Desde una carpeta vacía (o continuando en `ejemplo-spring-m1`), crea `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/app
    username: app_user
server:
  port: 8080
```

1. Guarda el archivo (Spring Boot detecta `application.yml` al arrancar, sin configuración adicional) y confirma que el puerto se aplica:

```bash
# arranca el proyecto Java con Maven usando la configuración de application.yml
cd ejemplo-spring-m1
./mvnw spring-boot:run
```

**Explicación línea por línea:** la indentación de dos espacios bajo `spring:` y luego bajo `datasource:` expresa la misma jerarquía que `spring.datasource.url=...` en formato plano; `server: port: 8080` selecciona el puerto en el que Tomcat escucha.

**Resultado esperado:** la aplicación arranca escuchando en el puerto `8080` (el valor configurado), confirmando que Spring Boot lee y aplica la configuración anidada sin diferencia de comportamiento frente al formato plano.

**Fallo deliberado:** desalinea la indentación de `url` (quítale un espacio respecto a `datasource:`) y vuelve a arrancar. YAML es sensible a la indentación exacta: el parser interpreta la línea como perteneciente a otro nivel y produce un error de parseo o una propiedad en la ubicación equivocada. Diagnostica confirmando que la legibilidad del YAML tiene como costo esa sensibilidad que `.properties` no tiene.

2. Para confirmarlo sin ambigüedad, crea `src/main/resources/application.properties` con la forma plana equivalente:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/app
spring.datasource.username=app_user
server.port=8080
```

3. Arranca con este archivo en vez de `application.yml` (mantén solo uno presente) y repite la comprobación:

```bash
# arranca el proyecto Java con Maven usando application.properties en vez de application.yml
cd ejemplo-spring-m1
./mvnw spring-boot:run
```

**Resultado esperado:** la aplicación arranca exactamente igual, escuchando en `8080` y con la misma URL de datasource, confirmando que `spring.datasource.url` (plano) y `spring: datasource: url:` (anidado) son la misma clave interpretada por el mismo mecanismo.

**Ejercicios.**

1. Agrega una tercera clave anidada (`spring.jpa.hibernate.ddl-auto`) en ambos formatos y confirma que producen la misma clave aplanada.
2. Desalinea deliberadamente una indentación en YAML y documenta el error de parseo exacto.
3. Escribe la misma configuración de tres niveles en ambos formatos y cuenta caracteres.
4. Escribe de memoria una configuración anidada de dos niveles en YAML y su equivalente plano.

**Pista:** si te equivocas con la indentación en YAML, el error no siempre es obvio; cuenta los espacios exactos en vez de asumir que "se ve bien".

**Completa el código:** rellena el espacio para expresar `server.port` en YAML:

```yaml
____:
  port: 8080
```

**Reto de memoria:** cierra este documento y escribe la misma configuración de base de datos en ambos formatos, verificando que representan las mismas claves.

#### Aplica

**Reto abierto.** Migra la configuración de un proyecto existente de `.properties` a `.yml` sin cambiar el comportamiento. Demuestra la equivalencia arrancando con cada formato y comparando el puerto efectivo y la URL del datasource. Después introduce un error de indentación y explica cómo lo detectarías en un pipeline.

**Checklist de salida.**

- [ ] Ambos formatos producen el mismo puerto y la misma URL efectiva.
- [ ] Solo uno de los dos archivos está presente en cada prueba.
- [ ] La configuración anidada de tres niveles se lee sin ambigüedad.
- [ ] El error de indentación está reproducido y explicado.
- [ ] El README indica qué formato eligió el equipo y por qué.

**Si falla.** Si el puerto no cambia, verifica que el archivo esté en `src/main/resources` y que no haya otro archivo con mayor prioridad. Si el YAML no parsea, revisa espacios, tabulaciones y que las claves tengan dos puntos seguidos de espacio.

**Siguiente paso:** el Tema 3 usa perfiles para variar esta configuración por entorno.

**Errores comunes:** mezclar `.properties` y `.yml` sin necesidad, generando confusión sobre prioridades; desalinear la indentación y no notarlo hasta que la configuración no se aplica.

**Límites y decisión de uso:** para una sola clave sin anidación, la diferencia entre formatos es irrelevante; cualquiera es igual de simple.

**Fuente oficial:** [Spring Boot — Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config).

**Transferencia al proyecto integrador:** la configuración por perfil del microservicio productivo separará entornos con este mismo mecanismo.

### Tema 3: Perfiles y estructura por capas · Intermedio · 30 min

**Prerrequisito:** Tema 2 de este módulo.

**Al terminar podrás:** externalizar configuración por perfil y organizar el código en capas `controller`/`service`/`repository` con responsabilidades delimitadas.

#### Aprende

**¿Por qué es importante?** Desplegar exactamente el mismo artefacto compilado en desarrollo y producción, variando solo la URL de la base de datos y el nivel de logs, evita que el artefacto probado sea sutilmente distinto al desplegado.

**Conceptos clave:** perfil (`application-{perfil}.yml`), sobreescritura parcial, estructura por capas.

Un perfil (`application-dev.yml`, `application-prod.yml`) sobreescribe únicamente los valores que declara, manteniendo intacto el resto de la configuración base de `application.yml`; `java -jar app.jar --spring.profiles.active=dev` activa el perfil al arrancar, sin recompilar para cada entorno. La estructura por capas (`controller/` traduciendo HTTP hacia/desde DTOs, `service/` con la lógica de negocio sin conocimiento de HTTP, `repository/` con el acceso a datos) establece responsabilidades delimitadas: el controller no debería contener lógica de negocio y el service no debería conocer códigos de estado HTTP.

**Analogía:** los perfiles son conjuntos de ajustes preconfigurados para el mismo dispositivo, seleccionables según el contexto sin reconfigurar cada ajuste; la estructura por capas es una cadena de producción donde cada estación tiene una responsabilidad delimitada y no necesita conocer los detalles internos de las demás.

**Diagrama:**

```text
┌ application.yml (base) ───────────────────────────────┐
│  server.port: 8080                                   │
│  spring.datasource.url: .../app                      │
└──────────────────────────┬───────────────────────────┘
                           │ + application-dev.yml
                           ▼
┌ configuración final (perfil dev activo) ──────────────┐
│  server.port: 8080  (heredado)                       │
│  spring.datasource.url: .../app_dev  (sobreescrito)  │
└──────────────────────────────────────────────────────┘
```

#### Practica

**Demo paso a paso.** Desde una carpeta vacía (o continuando en `ejemplo-spring-m1`), parte de la configuración base en `src/main/resources/application.yml`:

```yaml
server:
  port: 8080
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/app
```

y añade `src/main/resources/application-dev.yml`, que declara solo lo que cambia:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/app_dev
```

1. Arranca la aplicación activando explícitamente el perfil `dev`:

```bash
# empaqueta y ejecuta el jar Java con el perfil dev activado
cd ejemplo-spring-m1
./mvnw clean package -DskipTests
java -jar target/*.jar --spring.profiles.active=dev
```

**Explicación línea por línea:** `application-dev.yml` solo declara `spring.datasource.url`, sobreescribiendo ÚNICAMENTE esa clave; `server.port` (definido en `application.yml` base) permanece sin cambios porque el perfil no lo menciona; `--spring.profiles.active=dev` indica qué archivo de perfil cargar además de la base.

**Resultado esperado:** los logs de arranque muestran `The following 1 profile is active: "dev"` y la aplicación se conecta a `app_dev` (no a `app`, el valor base), confirmando que el perfil sobreescribió solo la clave que declaró.

**Fallo deliberado:** arranca sin `--spring.profiles.active=dev`. La aplicación usa `spring.datasource.url` del `application.yml` BASE (apuntando a `app`, no a `app_dev`). Diagnostica confirmando que un perfil nunca se activa automáticamente; olvidar la bandera es el error más común al desplegar en el entorno equivocado.

2. Para ver la configuración final ya fusionada, agrega el starter `actuator`, expón el endpoint `env` en `application.yml` (`management.endpoints.web.exposure.include: env`) y consulta el entorno efectivo con la aplicación corriendo:

```bash
# consulta las propiedades efectivas después de fusionar base + perfil dev
curl -s http://localhost:8080/actuator/env/spring.datasource.url | grep -o '"value":"[^"]*"'
curl -s http://localhost:8080/actuator/env/server.port | grep -o '"value":[0-9]*'
```

**Resultado esperado:** `spring.datasource.url` reporta el valor del perfil (`.../app_dev`), mientras `server.port` reporta `8080`, el valor heredado sin cambios. El endpoint `/actuator/env` expone la configuración fusionada sin inferencias.

**Ejercicios.**

1. Agrega un perfil `test` que sobreescriba únicamente el puerto y confirma con `/actuator/env` qué claves cambian.
2. Declara la misma clave en la base y en el perfil, arranca con el perfil activo y confirma cuál gana.
3. Organiza un endpoint existente en las tres capas (`controller`/`service`/`repository`) y documenta la responsabilidad de cada una.
4. Escribe de memoria un `application-test.yml` que sobreescriba únicamente una clave base.

**Pista:** antes de desplegar, verifica con el log `The following N profile(s) are active` con qué perfil arrancó la aplicación, en vez de asumirlo.

**Completa el código:** rellena el espacio para activar el perfil `dev`:

```bash
java -jar app.jar --spring.____=dev
```

**Reto de memoria:** cierra este documento y escribe una configuración base y un perfil que sobreescriba una sola clave, y traza la configuración final.

#### Aplica

**Reto abierto.** Diseña tres perfiles (`dev`, `test`, `prod`) para una API de entregas. Cada perfil debe cambiar solo lo que le corresponde y el artefacto compilado debe ser el mismo. Demuestra con `/actuator/env` la configuración efectiva de cada perfil y documenta qué valor gana cuando una clave aparece en dos niveles.

**Checklist de salida.**

- [ ] El mismo jar arranca con los tres perfiles sin recompilar.
- [ ] Cada perfil declara únicamente sus diferencias.
- [ ] `/actuator/env` confirma los valores efectivos de al menos dos claves.
- [ ] El log de arranque identifica el perfil activo en cada corrida.
- [ ] Las capas `controller`, `service` y `repository` existen y el controller no contiene reglas de negocio.
- [ ] Un despliegue sin perfil produce el comportamiento base documentado.

**Si falla.** Si el perfil no se aplica, revisa el nombre del archivo (`application-dev.yml`) y la bandera (`--spring.profiles.active=dev`). Si `/actuator/env` no responde, el endpoint no está expuesto. Si el controller acumula lógica, mueve la decisión al service y deja en el controller solo la traducción HTTP.

**Siguiente paso:** el Módulo 2 profundiza en la capa web y el manejo de peticiones HTTP.

**Errores comunes:** olvidar activar el perfil correcto al desplegar; poner lógica de negocio en el controller, mezclando responsabilidades entre capas.

**Límites y decisión de uso:** para una aplicación que siempre corre en un único entorno fijo, mantener múltiples perfiles agrega complejidad sin beneficio; un único `application.yml` basta.

**Fuente oficial:** [Spring Boot — Profiles](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.profiles).

**Transferencia al proyecto integrador:** la estructura por capas de este tema organiza el microservicio productivo.

## Laboratorio práctico

**Objetivo del laboratorio:** generar un proyecto Spring Boot con perfiles dev/prod y estructura por capas.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Generar el proyecto con Spring Initializr | web, data-jpa, postgresql | Verifica las dependencias generadas |
| 2 | Convertir a `application.yml` | Ver Tema 2 | Compara la legibilidad |
| 3 | Crear `application-dev.yml`/`application-prod.yml` | Ver Tema 3 | Arranca con `--spring.profiles.active=dev` |
| 4 | Organizar en paquetes por capa | Ver Tema 3 | `controller/`, `service/`, `repository/`, `dto/` |
| 5 | Verificar el perfil activo | `/actuator/env` | Si está habilitado |

**Verificación:** el laboratorio se considera exitoso si el proyecto arranca con cada perfil aplicando su configuración específica y si la estructura por capas separa controller/service/repository sin lógica de negocio filtrada en el controller.

**Errores comunes y soluciones**

- **Hardcodear valores de configuración distintos por entorno en el código.** Usa perfiles para externalizar esa configuración.
- **Poner lógica de negocio en el controller.** El controller solo traduce HTTP hacia/desde DTOs y delega la lógica al service.
- **Mezclar `.properties` y `.yml` sin necesidad.** Elige un formato y sé consistente en todo el proyecto.

## Proyecto de cierre del módulo

**Objetivo:** entregar un proyecto ejecutable y reproducible que demuestre configuración externa, perfiles y separación por capas con evidencia observable.

**Entregables.**

1. Proyecto `pipeline-entregas` con `web`, `validation`, `actuator` y `data-jpa`, generado desde Initializr.
2. `application.yml` base y perfiles `dev`, `test` y `prod` con diferencias mínimas documentadas.
3. Paquetes `controller`, `service`, `repository` y `dto`, con un endpoint que atraviese las cuatro capas.
4. Endpoint `GET /configuracion` que devuelva el perfil activo y dos valores efectivos sin exponer secretos.
5. `README.md` con el comando de arranque por perfil y la salida esperada.
6. Registro de los dos fallos provocados (starter ausente y perfil no activado) con su diagnóstico.

**Rúbrica (100 puntos).**

| Criterio | Puntos |
|---|---:|
| Arranque reproducible con el mismo jar y tres perfiles | 20 |
| Configuración base y perfiles con diferencias mínimas y justificadas | 20 |
| Separación real por capas, sin lógica de negocio en el controller | 20 |
| Evidencia de configuración efectiva (`/actuator/env` o endpoint propio) | 15 |
| Fallos reproducidos y diagnosticados por escrito | 15 |
| README con comandos, versiones y criterios de aceptación | 10 |

**Criterio de aceptación:** si un perfil requiere recompilar o el endpoint no permite ver la configuración efectiva, el proyecto no se cierra aunque la rúbrica sume 100.
