# Módulo 10: Módulos (JPMS) y proyectos grandes

Cuando un proyecto crece, el classpath plano permite que cualquier clase acceda a casi cualquier otra. El Java Platform Module System (JPMS), introducido en Java 9, añade límites explícitos: qué paquetes exporta un módulo y qué módulos requiere. Este módulo muestra cuándo JPMS aporta valor y cómo migrar de forma incremental.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Declarar `module-info.java` con `requires` y `exports` |
| 2 | Evaluar migración incremental y cuándo JPMS vale la pena |
| 3 | Usar `opens` para reflexión controlada en frameworks |

## Aprende construyendo

### Tema 1: module-info.java y encapsulación fuerte · Intermedio · 40 min

**Caso guía**

`app` debe usar la API pública de `core`, no sus clases internas. Quieres fronteras verificadas por compilador/JVM.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **`module-info.java`** | Descriptor de módulo JPMS con `requires/exports/opens/...`. | Declarar dependencias y superficie pública. | Proyectos modularizados. | Olvidar exportar paquete necesario. |
| **Encapsulación fuerte** | Accesibilidad = visibilidad Java + legibilidad de módulo. | Impedir acceso a internos no exportados. | Arquitecturas grandes. | Creer que `public` siempre es accesible. |
| **`requires`** | Declara dependencia de otro módulo. | Legibilidad en compile/runtime. | Consumir API de otro módulo. | `module not found` por module-path. |
| **`exports`** | Expone un paquete para acceso normal. | Definir API pública. | Paquetes de contrato. | Exportar todo por comodidad. |

**Contrato / invariantes / reglas.** Un paquete público no exportado no es accesible desde otro módulo. Sin split packages. `--module-path` en compilación/ejecución. `requires transitive` reexporta legibilidad (usar con cuidado).

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-10/core/src/com/academia/core
mkdir -p ~/academia-java/modulo-10/app/src/com/academia/app
cd ~/academia-java/modulo-10
```

`core/src/module-info.java`:
```java
module com.academia.core { exports com.academia.core; }
```
`core/src/com/academia/core/Api.java`:
```java
package com.academia.core;
public class Api { public static String saludar() { return "hola desde core"; } }
```
`app/src/module-info.java`:
```java
module com.academia.app { requires com.academia.core; }
```
`app/src/com/academia/app/Main.java`:
```java
package com.academia.app;
import com.academia.core.Api;
public class Main { public static void main(String[] args){ System.out.println(Api.saludar()); } }
```

**Ejecución y salida real**

```bash
javac -d out/core core/src/module-info.java core/src/com/academia/core/Api.java
javac --module-path out -d out/app app/src/module-info.java app/src/com/academia/app/Main.java
java --module-path out -m com.academia.app/com.academia.app.Main
```

```text
hola desde core
```

**Errores comunes**: `package is not visible` (no exportado), `module not found` (module-path/requires). **Verificación**: intenta importar paquete no exportado y confirma error de compilación.


### Tema 2: Migración incremental y cuándo JPMS aporta valor · Intermedio · 35 min

**Caso guía**

Monolito con muchas dependencias: migrar todo a JPMS de golpe es riesgoso. Necesitas criterio y plan incremental.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Migración incremental** | Adopción gradual de módulos, no big-bang. | Reducir riesgo. | Bases grandes/legacy. | Modularizar todo a la vez. |
| **Módulo automático** | JAR no modular en module-path; exporta todo. | Puente temporal. | Dependencias no modularizadas. | Confiar en él como frontera fuerte. |
| **Unnamed module** | Contenido del classpath. | Compatibilidad legacy. | Transición. | Esperar `requires` hacia unnamed (no funciona). |
| **Cuándo JPMS aporta valor** | Cuando la encapsulación/arquitectura/ mantenimiento lo justifican. | Tomar decisión costo/beneficio. | Plataformas grandes, librerías internas. | Adoptar por moda. |

**Contrato / invariantes / reglas.** Módulos nombrados no pueden `requires` unnamed. Split packages prohibidos en module-path. Automáticos son frágiles ante nombre de JAR. Evalúa grafo de dependencias, soporte de libs y límites reales.

**Implementación desde cero (checklist + comando mixto)**

```text
¿Encapsulación fuerte necesaria? si/no
¿Dependencias controlables?      si/no
¿Librerías compatibles?          si/no
¿Beneficio > costo?              si/no
```

Comando mixto en transición:

```bash
java --module-path mods --class-path libs/* -m app/com.academia.app.Main
```

**Ejecución y salida real**

Artefacto esperado: plan de migración (alcance, orden, riesgos), no una salida única.

**Errores comunes**: split packages, big-bang, módulos automáticos permanentes. **Verificación**: clasifica componentes en modularizar/automático/classpath.


### Tema 3: opens para acceso reflexivo controlado de frameworks · Avanzado · 35 min

**Caso guía**

Jackson/Hibernate usan reflexión. En JPMS, reflexión profunda sobre paquetes no abiertos falla. Necesitas abrir solo lo necesario.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **`opens`** | Permite reflexión profunda en runtime sobre un paquete. | Frameworks que inspeccionan campos/constructores no públicos. | DTOs/entidades para Jackson/JPA. | `open module` completo (superficie grande). |
| **Acceso reflexivo controlado** | `opens ... to <module>` limita qué módulo puede reflejar. | Principio de mínimo privilegio. | Siempre que conozcas el framework. | Abrir a todos sin necesidad. |
| **`exports` vs `opens`** | `exports` = acceso normal compile/runtime; `opens` = reflexión profunda runtime. | Diferenciar API pública de acceso reflexivo. | Diseño de módulos. | Creer que exportar basta para reflexión profunda. |
| **`--add-opens`** | Flag runtime para abrir paquete. | Parche temporal. | Diagnóstico/migración. | Dejarlo como solución permanente. |

**Contrato / invariantes / reglas.** No abras paquetes internos innecesariamente. Prefiere `opens X to Y`. Frameworks modernos documentan requisitos. En Java 9+ la encapsulación fuerte puede lanzar `InaccessibleObjectException`.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-10-opens/src/com/academia/infra/dto
cd ~/academia-java/modulo-10-opens
```

`src/module-info.java`:

```java
module com.academia.infra {
    exports com.academia.infra.dto;
    opens com.academia.infra.dto to com.fasterxml.jackson.databind;
}
```

`src/com/academia/infra/dto/GuiaDto.java`:

```java
package com.academia.infra.dto;
public class GuiaDto { public String id; public GuiaDto() {} public GuiaDto(String id){ this.id=id; } }
```

**Ejecución y salida real (verificación de compilación del descriptor)**

```bash
javac -d out $(find src -name "*.java")
ls out/com/academia/infra/dto
```

```text
GuiaDto.class
```

> **Nota de verificación**: la comprobación completa de reflexión con Jackson requiere jars en module-path; el descriptor muestra la regla JPMS. Prueba quitando `opens` con un framework reflexivo para ver `InaccessibleObjectException`.

**Errores comunes**: usar `exports` en vez de `opens`, abrir todo el módulo, depender de `--add-opens`. **Verificación**: restringe `opens` al módulo framework específico.


JPMS no es obligatorio para todo proyecto, pero da herramientas reales para encapsulación y arquitectura en sistemas grandes. El siguiente módulo baja al runtime: memoria, GC, JIT y herramientas de diagnóstico de la JVM.
