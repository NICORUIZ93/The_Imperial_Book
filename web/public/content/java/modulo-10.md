# Módulo 10: Módulos (JPMS) y proyectos grandes

Cuando un proyecto crece, el classpath plano permite que cualquier clase acceda a casi cualquier otra. El Java Platform Module System (JPMS), introducido en Java 9, añade límites explícitos: qué paquetes exporta un módulo y qué módulos requiere. Este módulo muestra cuándo JPMS aporta valor y cómo migrar de forma incremental.

**Entorno de referencia verificado (2026-05-22):** JDK 27.

## Aprende construyendo

### Tema 1: module-info.java y encapsulación fuerte · Intermedio · 40 min

`app` debe usar la API pública de `core`, no sus clases internas. Quieres fronteras verificadas por compilador/JVM.

#### `module-info.java`

**Definición formal.** Descriptor de módulo JPMS que declara nombre del módulo y directivas como `requires`, `exports`, `opens`, `provides`, `uses`.

**Para qué sirve.** Hace explícitas dependencias y superficie pública.

**Cuándo usarlo.** Proyectos/librerías donde la encapsulación fuerte aporta valor.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m10-t1/src/com.academia.core /tmp/java-m10-t1/src/com.academia.app
cd /tmp/java-m10-t1
```

`src/com.academia.core/module-info.java`:

```java
module com.academia.core { exports com.academia.core.api; }
```

`src/com.academia.core/com/academia/core/api/Api.java`:

```java
package com.academia.core.api;
public class Api { public static String hola(){ return "ok"; } }
```

`src/com.academia.app/module-info.java`:

```java
module com.academia.app { requires com.academia.core; }
```

`src/com.academia.app/com/academia/app/Main.java`:

```java
package com.academia.app;
import com.academia.core.api.Api;
public class Main { public static void main(String[] args){ System.out.println(Api.hola()); } }
```

**Caso de uso real.** Librería interna con API pública y paquetes internos.

**Error común.** Olvidar `exports`. Síntoma: `package is not visible`. Corrección: exportar solo el paquete público.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac -d out/core src/com.academia.core/module-info.java src/com.academia.core/com/academia/core/api/Api.java
javac --module-path out/core -d out/app src/com.academia.app/module-info.java src/com.academia.app/com/academia/app/Main.java
java --module-path out/core:out/app -m com.academia.app/com.academia.app.Main
```

```text
ok
```

#### Encapsulación fuerte

**Definición formal.** En JPMS, la accesibilidad depende de visibilidad Java (`public/protected/etc.`) y legibilidad/exportación del módulo.

**Para qué sirve.** Impide acceso a internos no exportados, incluso si son `public`.

**Cuándo usarlo.** Cuando necesitas fronteras arquitectónicas reales.

**Ejemplo mínimo enfocado (ejecutable como verificación negativa).** Si `Api` estuviera en paquete no exportado, la compilación de `app` fallaría con “package is not visible”.

**Caso de uso real.** Evitar que consumidores dependan de `impl`.

**Error común.** Creer que `public` siempre es accesible. Corrección: entender exportación de paquete.

**Verificación.** Cambiar paquete a no exportado y observar error de compilación.

#### `requires` y `exports`

**Definición formal.** `requires` declara dependencia de otro módulo; `exports` expone un paquete para acceso normal.

**Para qué sirve.** Modelar dependencias y API pública.

**Cuándo usarlo.** `requires` para consumir; `exports` para exponer contrato. Usa `requires transitive` con cuidado.

**Ejemplo mínimo enfocado (ejecutable).** Ver ejemplo integrado: `app requires core`; `core exports api`.

**Caso de uso real.** `app` depende de `domain-api`.

**Error común.** `module not found`. Corrección: revisar `--module-path` y nombres de módulo.

**Verificación.** Compilación/ejecución exitosa del ejemplo integrado.

### Tema 2: Migración incremental y cuándo JPMS aporta valor · Intermedio · 35 min

Migrar todo un monolito a JPMS de golpe es riesgoso. Necesitas criterio y plan incremental.

#### Migración incremental

**Definición formal.** Adopción gradual de módulos, empezando por bordes/librerías estables, sin big-bang.

**Para qué sirve.** Reduce riesgo y permite aprender el impacto real.

**Cuándo usarlo.** Bases grandes/legacy con dependencias mixtas.

**Ejemplo mínimo enfocado (ejecutable como checklist).**

```text
1. Inventariar dependencias y split packages.
2. Modularizar componentes con fronteras claras.
3. Usar automatic modules temporalmente.
4. Eliminar classpath mixto gradualmente.
```

**Caso de uso real.** Plataforma interna con varios JARs propios.

**Error común.** Big-bang. Síntoma: bloqueo por dependencias no modularizadas. Corrección: incremental.

**Verificación.** Plan con orden y riesgo por componente.

#### Módulo automático y unnamed module

**Definición formal.** Un automatic module es un JAR no modular en module-path; exporta paquetes. El unnamed module es el contenido del classpath.

**Para qué sirve.** Puente de compatibilidad en migración.

**Cuándo usarlo.** Solo como transición. No confíes en fronteras fuertes.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
java --module-path mods --class-path libs/* -m app/com.academia.app.Main
```

**Caso de uso real.** Dependencia de terceros aún no modularizada.

**Error común.** Esperar `requires` hacia unnamed module. Corrección: mover dependencia a module-path o modularizar.

**Verificación.** Documentar qué dependencias quedan en classpath y plan para sacarlas.

#### Cuándo JPMS aporta valor

**Definición formal.** Decisión costo/beneficio basada en tamaño, fronteras, dependencias y necesidad de encapsulación fuerte.

**Para qué sirve.** Evitar adoptar por moda.

**Cuándo usarlo.** Plataformas grandes, librerías internas, límites arquitectónicos fuertes.

**Ejemplo mínimo enfocado (ejecutable como evaluación).**

```text
¿Encapsulación fuerte necesaria? si/no
¿Dependencias controlables? si/no
¿Beneficio > costo? si/no
```

**Caso de uso real.** Librería base usada por muchos equipos.

**Error común.** Adoptar JPMS sin soporte de dependencias clave. Corrección: evaluar grafo primero.

**Verificación.** Decisión documentada con razones.

### Tema 3: opens para acceso reflexivo controlado de frameworks · Avanzado · 35 min

Jackson/Hibernate usan reflexión. En JPMS, reflexión profunda sobre paquetes no abiertos falla.

#### `opens`

**Definición formal.** Directiva JPMS que permite reflexión profunda en runtime sobre un paquete, opcionalmente a módulos específicos.

**Para qué sirve.** Permitir que frameworks accedan a campos/constructores no públicos cuando es necesario.

**Cuándo usarlo.** DTOs/entidades usados por frameworks reflexivos.

**Ejemplo mínimo enfocado (ejecutable compilación).**

```bash
mkdir -p /tmp/java-m10-t3/src/com.academia.infra/com/academia/infra/dto
cd /tmp/java-m10-t3
```

`src/com.academia.infra/module-info.java`:

```java
module com.academia.infra {
    exports com.academia.infra.dto;
    opens com.academia.infra.dto to com.fasterxml.jackson.databind;
}
```

`src/com.academia.infra/com/academia/infra/dto/GuiaDto.java`:

```java
package com.academia.infra.dto;
public class GuiaDto { public String id; public GuiaDto() {} public GuiaDto(String id){ this.id=id; } }
```

**Caso de uso real.** Entidades JPA o DTOs Jackson.

**Error común.** `open module` completo. Corrección: `opens paquete to modulo`.

**Verificación (JDK 27, 2026-05-22).**

```bash
javac -d out $(find src -name "*.java")
ls out/com/academia/infra/dto
```

```text
GuiaDto.class
```

#### `exports` vs `opens`

**Definición formal.** `exports` permite acceso normal compile/runtime; `opens` permite reflexión profunda runtime.

**Para qué sirve.** Separar API pública de acceso reflexivo.

**Cuándo usarlo.** Exporta lo que es API; abre solo lo que un framework necesita reflejar.

**Ejemplo mínimo enfocado (ejecutable).** El descriptor anterior exporta y abre el mismo paquete a Jackson; si solo exportas, reflexión profunda puede fallar.

**Caso de uso real.** DTO exportado para código y abierto a Jackson.

**Error común.** Creer que `exports` basta para reflexión profunda. Corrección: agregar `opens` específico.

**Verificación.** Compilación del descriptor OK; en runtime con framework reflexivo, la ausencia de `opens` produce `InaccessibleObjectException`.

#### `--add-opens`

**Definición formal.** Flag JVM para abrir un paquete en runtime a otro módulo.

**Para qué sirve.** Parche temporal en migración/diagnóstico.

**Cuándo usarlo.** Solo transitorio. No como solución permanente.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
java --add-opens com.academia.infra/com.academia.infra.dto=com.fasterxml.jackson.databind -jar app.jar
```

**Caso de uso real.** Desbloquear ejecución mientras se corrige `module-info`.

**Error común.** Dejar flags en scripts productivos para siempre. Corrección: corregir descriptor.

**Verificación.** El comando arranca con la apertura solicitada; documentar eliminación futura.

## Cierre del módulo

JPMS da encapsulación fuerte y dependencias explícitas. Úsalo cuando el beneficio arquitectónico supere el costo de migración, migra incrementalmente y abre reflexión solo donde sea necesario.
