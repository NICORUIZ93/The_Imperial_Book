# Módulo 1: Spring Boot CLI y estructura de proyecto

Este módulo cubre cómo arrancar un proyecto Spring Boot con base reproducible: generador, starters, configuración, perfiles y estructura por capas. La meta es que el proyecto sea entendible antes de crecer.

**Entorno de referencia (2026-05-22):** JDK 27 instalado; Maven 3.10.0; Gradle 9.8.2. Ejemplos Spring Boot verificados conceptualmente con Spring Boot 3.5.x/Java 21 en `/tmp` cuando se requiere arranque. Los comandos CLI indicados son verificables con el tooling instalado.

## Aprende construyendo

### Tema 1: Spring Initializr y starters · Básico · 30 min

Caso guía: crear un servicio web sin armar dependencias a mano.

#### Spring Initializr

**Definición formal.** Initializr es un generador de proyectos Spring Boot (web, IDE, CLI) que produce un esqueleto con build, metadata y dependencias iniciales.

**Para qué sirve.** Bootstrap consistente y reproducible.

**Cuándo usarlo.** Al iniciar un servicio nuevo o un PoC. Fija versión de Boot, Java y build tool.

**Ejemplo mínimo enfocado (ejecutable/verificable).**

```bash
curl -fsSL -G 'https://start.spring.io/starter.zip' \
  -d type=maven-project -d language=java -d javaVersion=21 -d bootVersion=3.5.0 \
  -d groupId=com.example -d artifactId=demo -d dependencies=web -o /tmp/demo.zip
unzip -l /tmp/demo.zip | head
```

**Caso de uso real.** Crear base estándar para un microservicio.

**Error común.** Aceptar defaults sin revisar Java/Boot. Corrección: fijar versiones explícitas.

**Verificación.** **Nota:** requiere red a start.spring.io; el ZIP generado es la evidencia. En entorno offline, usar Initializr del IDE o plantilla interna.

#### Starters

**Definición formal.** Un starter es una dependencia que agrupa otras dependencias compatibles para una capacidad (web, test, data-jpa, etc.).

**Para qué sirve.** Reducir configuración manual y conflictos de versiones.

**Cuándo usarlo.** Agrega el starter por capacidad requerida.

**Ejemplo mínimo enfocado (verificable).**

```bash
# tras generar proyecto
./mvnw dependency:tree | grep spring-boot-starter-web
```

**Caso de uso real.** `spring-boot-starter-web` para REST.

**Error común.** Agregar dependencias individuales contradictorias. Corrección: empezar por starter y revisar árbol.

**Verificación.** **Nota:** requiere proyecto Maven generado; `dependency:tree` muestra transitivas.

### Tema 2: application.yml vs application.properties · Básico · 30 min

Caso guía: configurar puerto y valor propio.

#### `application.properties`

**Definición formal.** Archivo de configuración plano key=value leído por Spring Boot.

**Para qué sirve.** Configuración simple y directa.

**Cuándo usarlo.** Claves pocas o configuración plana. Evita duplicar claves.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/sb1-props && cd /tmp/sb1-props
cat > application.properties << 'P'
academia.banner=Hola
P
grep academia.banner application.properties
```

**Caso de uso real.** Configurar puerto, nombre de app, logging.

**Error común.** Clave duplicada con valores distintos. Corrección: mantener una fuente clara.

**Verificación (2026-05-22).** Salida: `academia.banner=Hola`.

#### `application.yml`

**Definición formal.** Archivo YAML jerárquico de configuración.

**Para qué sirve.** Estructura legible para configuración anidada.

**Cuándo usarlo.** Configuración jerárquica. Cuidado con indentación por espacios.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/sb1-yml && cd /tmp/sb1-yml
cat > application.yml << 'Y'
academia:
  banner: Hola
server:
  port: 8080
Y
python3 -c "import yaml; print(yaml.safe_load(open('application.yml'))['academia']['banner'])"
```

**Caso de uso real.** Configurar datasources, security, profiles.

**Error común.** Tabs/indentación inválida. Síntoma: parse error al arrancar. Corrección: espacios y YAML válido.

**Verificación (2026-05-22).** Salida: `Hola` (parseo YAML local).

#### Precedencia y `@Value` / `@ConfigurationProperties`

**Definición formal.** Spring Boot resuelve propiedades por orden de precedencia (args, env, archivos, defaults); `@Value` inyecta una clave; `@ConfigurationProperties` enlaza un grupo tipado.

**Para qué sirve.** Predecir el valor efectivo y evitar strings dispersos.

**Cuándo usarlo.** `@ConfigurationProperties` para grupos; `@Value` para casos puntuales.

**Ejemplo mínimo enfocado (ejecutable, Java puro simulación).**

```bash
mkdir -p /tmp/sb1-prev && cd /tmp/sb1-prev
cat > DemoPrev.java << 'JAVA'
import java.util.*;
public class DemoPrev { public static void main(String[] args){ Properties base=new Properties(); base.setProperty("banner","Base"); Properties override=new Properties(base); override.setProperty("banner","Arg"); System.out.println(override.getProperty("banner")); } }
JAVA
javac DemoPrev.java && java DemoPrev
```

**Caso de uso real.** Override por variable de entorno en Kubernetes.

**Error común.** Cambiar YAML pero un arg/env lo sobreescribe. Corrección: inspeccionar `Environment`/actuator env.

**Verificación (JDK 27, 2026-05-22).** Salida: `Arg`.

### Tema 3: Perfiles y estructura por capas · Intermedio · 35 min

Caso guía: misma app, distinta config por entorno.

#### Perfiles Spring

**Definición formal.** Un perfil es un nombre que activa un grupo de configuración/beans para un entorno (`dev`, `test`, `prod`).

**Para qué sirve.** Variar configuración sin cambiar código.

**Cuándo usarlo.** Por entorno. Activa por `spring.profiles.active`, env var o arg.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/sb1-prof && cd /tmp/sb1-prof
cat > application.yml << 'Y'
academia: {banner: Base, entorno: compartido}
Y
cat > application-dev.yml << 'Y'
academia: {banner: Desarrollo}
Y
python3 -c "import yaml; b=yaml.safe_load(open('application.yml')); d=yaml.safe_load(open('application-dev.yml')); b['academia'].update(d['academia']); print(b['academia']['banner']+','+b['academia']['entorno'])"
```

**Caso de uso real.** Dev usa H2, prod usa PostgreSQL.

**Error común.** Lógica `if (prod)` dispersa. Corrección: perfiles/configuración externa.

**Verificación (2026-05-22).** Salida: `Desarrollo,compartido`.

#### Estructura por capas

**Definición formal.** Organización donde Controller maneja HTTP, Service negocio, Repository acceso a datos; dependencias fluyen hacia abajo.

**Para qué sirve.** Separación de responsabilidades y testabilidad.

**Cuándo usarlo.** Apps CRUD/servicios típicos. Ajusta si usas hexagonal/modulith.

**Ejemplo mínimo enfocado (ejecutable, Java puro).**

```bash
mkdir -p /tmp/sb1-layers && cd /tmp/sb1-layers
cat > DemoLayers.java << 'JAVA'
class Repo { String byId(String id){ return "En ruta:"+id; } }
class Service { private final Repo repo; Service(Repo r){repo=r;} String consultar(String id){ return repo.byId(id); } }
class Controller { private final Service svc; Controller(Service s){svc=s;} String get(String id){ return svc.consultar(id); } }
public class DemoLayers { public static void main(String[] args){ System.out.println(new Controller(new Service(new Repo())).get("RF1")); } }
JAVA
javac DemoLayers.java && java DemoLayers
```

**Caso de uso real.** Endpoint REST que consulta servicio y repositorio.

**Error común.** Controller accediendo a DB directo. Corrección: mover lógica a service/repo.

**Verificación (JDK 27, 2026-05-22).** Salida: `En ruta:RF1`.

## Cierre del módulo

Un proyecto Spring Boot sano empieza con versiones fijadas, starters adecuados, configuración predecible y capas claras. Antes de agregar frameworks, confirma que puedes construir, ejecutar, cambiar perfil y explicar de dónde sale cada propiedad.
