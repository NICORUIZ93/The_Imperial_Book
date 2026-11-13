# Módulo 10: Módulos (JPMS) y proyectos grandes


## Aprende construyendo

### Tema 1: module-info.java y encapsulación fuerte

**¿Por qué es importante?** JPMS permite expresar dependencias y qué paquetes ofrece un componente; una clase pública no se vuelve API pública del módulo automáticamente.

#### Subtema 1.1: Declara un módulo pequeño · 10 min

**1. Contexto**

El sistema de rutas necesita publicar su clase de búsqueda y mantener el resto interno.

**2. Hazlo tú**

Crea `src/academia.rutas/module-info.java` con `module academia.rutas { exports academia.rutas.api; }`; crea `src/academia.rutas/academia/rutas/api/Buscar.java` con `package academia.rutas.api; public class Buscar { public static String estado() { return "EN_RUTA"; } }`; crea `src/academia.rutas/academia/rutas/Interno.java` con `package academia.rutas; public class Interno {}`. Compila con `javac -d out --module-source-path src $(find src -name '*.java')`.

**Resultado esperado:** `out/academia.rutas/module-info.class` existe y Maven no es necesario para compilar este ejemplo.

**Fallo deliberado:** exporta el paquete equivocado `academia.rutas`. **Diagnóstico:** el API vive en `academia.rutas.api`; corrige el nombre completo del paquete.

**3. Entiende**

`exports` hace accesibles los tipos públicos del paquete a otros módulos; no publica todos los paquetes del módulo.

**4. Cierra**

Lista qué paquete quedó exportado y cuál sigue interno.

#### Subtema 1.2: Ejecuta una aplicación modular · 10 min

**1. Contexto**

La aplicación debe arrancar desde el module path y llamar al API exportado.

**2. Hazlo tú**

Crea `src/academia.rutas/academia/rutas/app/Main.java` con `package academia.rutas.app; import academia.rutas.api.Buscar; public class Main { public static void main(String[] args) { System.out.println(Buscar.estado()); } }`; agrega `exports academia.rutas.app;` al `module-info.java` si lo necesita otro módulo. Compila con el comando `javac` del Subtema 1.1 y ejecuta `java --module-path out -m academia.rutas/academia.rutas.app.Main`.

**Resultado esperado:** el programa imprime `EN_RUTA` desde el módulo nombrado.

**Fallo deliberado:** quita `exports academia.rutas.api`. **Diagnóstico:** `Main` no puede acceder al tipo; el paquete que usa otro componente debe formar parte del API exportado.

**3. Entiende**

El module path localiza módulos nombrados; `-m` selecciona el módulo y clase principal.

**4. Cierra**

Guarda el comando completo que inicia la aplicación.

#### Subtema 1.3: Distingue public de exported · 10 min

**1. Contexto**

Una clase puede ser `public` en Java y continuar oculta para consumidores de otros módulos.

**2. Hazlo tú**

Crea `src/cliente/cliente/module-info.java` con `module cliente { requires academia.rutas; }` y `src/cliente/cliente/cliente/Main.java` que importe `academia.rutas.Interno`. Compila juntos ambos módulos con `javac -d out --module-source-path src $(find src -name '*.java')`.

**Resultado esperado:** el compilador rechaza el acceso a `Interno`, cuyo paquete no está exportado.

**Fallo deliberado:** añade `exports academia.rutas` al módulo productor solo para hacer pasar al cliente. **Diagnóstico:** publica la API mínima necesaria; evita exportar paquetes internos por comodidad.

**3. Entiende**

`public` controla acceso del lenguaje; `exports` controla acceso entre módulos nombrados.

**4. Cierra**

Conserva el diagnóstico del compilador y enumera el API que sí publicarías. Fuente: [sistema de módulos Java](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html).

#### Fragmento real

```java
// src/academia.rutas/module-info.java
module academia.rutas {
    exports academia.rutas.api;
}
```

Ejecuta:

```bash
javac -d out --module-source-path src $(find src -name '*.java')
java --module-path out -m academia.rutas/academia.rutas.app.Main
```

**Conexión con el proyecto integrador:** si el motor de asignación de entregas crece lo suficiente para separarse en componentes (reglas de negocio vs. adaptadores de entrada/salida), `module-info.java` es la forma de que el compilador, no solo la convención, impida que un adaptador use una clase interna del dominio.

**Límite:** JPMS solo controla accesibilidad entre módulos nombrados en tiempo de compilación/ejecución; no reemplaza pruebas de arquitectura (ArchUnit) ni detecta ciclos de diseño que no se expresen como `requires` circulares.

#### Practica

Modifica `module-info.java` para exportar `academia.rutas` (el paquete interno) en vez de `academia.rutas.api` y vuelve a compilar; confirma que `Main` deja de compilar aunque `Buscar` siga siendo `public`.

### Tema 2: Migración incremental y cuándo JPMS aporta valor

**¿Por qué es importante?** un módulo explícito mejora límites, pero migrar una aplicación sin mapa de dependencias puede romper builds y librerías.

#### Subtema 2.1: Inspecciona un JAR antes de modularizar · 10 min

**1. Contexto**

El equipo no sabe si una dependencia antigua ya incluye un descriptor de módulo.

**2. Hazlo tú**

Usa un JAR de prueba llamado `lib/validador.jar`. Ejecuta `jar --describe-module --file lib/validador.jar` y `jar tf lib/validador.jar | head`. Registra si el JAR tiene descriptor explícito o nombre automático derivado del archivo.

**Resultado esperado:** identificas el nombre que usaría `requires` antes de escribir el descriptor cliente.

**Fallo deliberado:** inventa el nombre de módulo a partir del artifactId sin inspeccionarlo. **Diagnóstico:** usa el resultado de `jar --describe-module` o la documentación del JAR; los nombres pueden no coincidir.

**3. Entiende**

Un JAR puede ser modular explícito o convertirse en módulo automático en el module path; eso no garantiza que su nombre o API sean adecuados.

**4. Cierra**

Guarda el resultado del comando y la coordenada/archivo inspeccionado.

#### Subtema 2.2: Migra un consumidor por etapas · 10 min

**1. Contexto**

Quieres agregar un descriptor a un componente pequeño antes de convertir todo un monolito.

**2. Hazlo tú**

Crea `src/academia.rutas/module-info.java` con `module academia.rutas { exports academia.rutas.api; }` y una clase `src/academia.rutas/academia/rutas/api/Buscar.java`. Compila y ejecuta como módulo usando `javac -d out --module-source-path src $(find src -name '*.java')` y `java --module-path out -m academia.rutas/academia.rutas.api.Buscar` después de agregarle `main`.

**Resultado esperado:** el módulo nuevo corre aislado antes de migrar el resto del sistema.

**Fallo deliberado:** intenta compilar un consumidor nombrado que usa un paquete no exportado. **Diagnóstico:** conserva el error como señal para revisar la frontera del API.

**3. Entiende**

Migrar una porción vertical pequeña permite conocer qué paquetes, servicios y dependencias quedan implicados.

**4. Cierra**

Dibuja una flecha desde cliente a `academia.rutas` y anota el API que cruza el límite.

#### Subtema 2.3: Decide si JPMS resuelve un problema real · 10 min

**1. Contexto**

Un script de una sola clase no necesariamente necesita fronteras entre módulos.

**2. Hazlo tú**

En `src/Decision.java` escribe un programa que imprime `hola`, compílalo con `javac -d out src/Decision.java` y ejecútalo con `java -cp out Decision`. Luego enumera dependencias y paquetes que querrías proteger si el programa se convierte en una aplicación multi-componente.

**Resultado esperado:** tienes un caso de contraste: classpath suficiente hoy, módulos justificables al existir límites reales.

**Fallo deliberado:** agrega `module-info.java` sin definir dependencias ni paquetes API. **Diagnóstico:** elimina configuración sin beneficio observable; usa JPMS cuando aporte encapsulación o resolución explícita.

**3. Entiende**

JPMS aporta límites de lectura y publicación y detección de dependencias ausentes; exige que librerías y herramientas encajen con el module path.

**4. Cierra**

Escribe una condición concreta que haría valiosa la migración en tu proyecto.

**Comprobación de migración:** antes de convertir otro componente, registra sus `requires`, `exports` y `opens`. `requires java.sql` declara una dependencia; `exports academia.api` publica el contrato; `opens academia.modelo` permite reflexión donde se necesita. Migra una porción pequeña y compila su consumidor. No uses `opens` global como arreglo rápido: oculta qué librería necesita acceso y debilita el encapsulamiento. Fuente primaria: https://openjdk.org/jeps/261.

#### Fragmento real

```bash
jar --describe-module --file lib/validador.jar
jar tf lib/validador.jar | head
javac -d out --module-source-path src $(find src -name '*.java')
```

**Conexión con el proyecto integrador:** antes de modularizar el proyecto integrador, inspecciona con este mismo comando las dependencias que ya usas (Jackson, JDBC) para saber si llegan como módulo automático o explícito antes de escribir un solo `requires`.

**Límite:** migrar incrementalmente reduce el riesgo de romper todo el build a la vez, pero no elimina el trabajo de mapear cada dependencia; un proyecto con muchas librerías sin descriptor de módulo puede necesitar módulos automáticos como paso intermedio, no la migración completa de una vez.

#### Practica

Modifica el programa de una sola clase del Subtema 2.3 para que dependa de un paquete que no exportaste y confirma el error de compilación antes de decidir si vale la pena modularizarlo.

### Tema 3: opens para acceso reflexivo controlado de frameworks

**¿Por qué es importante?** algunas librerías leen o escriben campos privados mediante reflexión; `opens` puede habilitar ese acceso de forma limitada.

#### Subtema 3.1: Distingue exports de opens · 10 min

**1. Contexto**

El paquete `academia.rutas.modelo` debe tener clases públicas disponibles para el cliente y campos internos legibles por un mapper.

**2. Hazlo tú**

En `src/academia.rutas/module-info.java` declara `exports academia.rutas.api;` y `opens academia.rutas.modelo;`. Crea `src/academia.rutas/academia/rutas/modelo/Envio.java` con un campo privado `estado`, un constructor y un getter. Compila con `javac -d out --module-source-path src $(find src -name '*.java')`.

**Resultado esperado:** el descriptor compila y distingue API accesible de paquete abierto a reflexión.

**Fallo deliberado:** reemplaza `opens academia.rutas.modelo` por `exports academia.rutas.modelo` esperando que ambos permitan exactamente lo mismo. **Diagnóstico:** exporta tipos públicos; abre reflexión profunda cuando la librería realmente lo requiere.

**3. Entiende**

`exports` permite acceso normal a tipos públicos; `opens` permite reflexión profunda en tiempo de ejecución, sujeto a los límites del módulo.

**4. Cierra**

Anota qué framework necesita reflexión y sobre qué paquete.

#### Subtema 3.2: Limita la apertura a un consumidor · 10 min

**1. Contexto**

Solo Jackson necesita leer el modelo; abrirlo a cualquier módulo amplía el acceso sin necesidad.

**2. Hazlo tú**

En `src/academia.rutas/module-info.java` reemplaza la apertura general por `opens academia.rutas.modelo to com.fasterxml.jackson.databind;`. Compila el módulo y revisa el nombre del módulo de Jackson con `jar --describe-module --file lib/jackson-databind.jar`.

**Resultado esperado:** el descriptor expresa qué módulo consumidor puede hacer reflexión profunda.

**Fallo deliberado:** usa `opens academia.rutas.modelo to jackson;` sin confirmar el nombre real. **Diagnóstico:** el nombre debe corresponder al módulo resuelto; consulta el descriptor del JAR.

**3. Entiende**

Una apertura cualificada reduce el conjunto de consumidores autorizados. El nombre exacto depende de la versión y forma del JAR instalado.

**4. Cierra**

Guarda el nombre leído con `jar --describe-module` junto al descriptor.

#### Subtema 3.3: Diagnostica una reflexión bloqueada · 10 min

**1. Contexto**

El mapeador informa que no puede acceder a un campo privado cuando el paquete no se abrió.

**2. Hazlo tú**

Crea `probe/src/Probe.java` con `public class Probe { public static void main(String[] args) throws Exception { var tipo = Class.forName("academia.rutas.modelo.Envio"); var envio = tipo.getConstructor().newInstance(); var estado = tipo.getDeclaredField("estado"); estado.setAccessible(true); estado.set(envio, "EN_RUTA"); System.out.println(estado.get(envio)); } }`. En `src/academia.rutas/module-info.java` deja `opens academia.rutas.modelo;` y crea `src/academia.rutas/academia/rutas/modelo/Envio.java` con constructor público sin argumentos y campo privado `estado`. Compila el módulo con `javac -d out --module-source-path src $(find src -name '*.java')`, compila el probe con `javac -d probe/out probe/src/Probe.java` y ejecútalo con `java --module-path out --add-modules academia.rutas -cp probe/out Probe`.

**Resultado esperado:** la prueba con apertura permitida funciona; sin ella, el acceso profundo queda bloqueado.

**Fallo deliberado:** elimina `opens academia.rutas.modelo;` y ejecuta de nuevo el probe. **Diagnóstico:** `setAccessible(true)` falla porque el módulo no abre ese paquete; restáuralo y evita abrir paquetes ajenos al modelo.

**3. Entiende**

Usa `opens` cuando el framework lo necesita para reflexión profunda. No es un sustituto general de un API accesible ni conviene abrir todo el módulo.

**4. Cierra**

Guarda la excepción y el descriptor mínimo. Fuente: [documentación oficial de `java`](https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html).

#### Fragmento real

```java
// module-info.java
opens academia.rutas.modelo to com.fasterxml.jackson.databind;
```

Ejecuta:

```bash
javac -d out --module-source-path src $(find src -name '*.java')
```

**Conexión con el proyecto integrador:** si tu proyecto integrador usa Jackson para serializar las entidades del dominio y luego lo modularizas con JPMS, necesitarás exactamente esta declaración `opens` cualificada o Jackson no podrá leer los campos privados por reflexión.

**Límite:** `opens` (incluso cualificado) habilita reflexión profunda, que puede romper invariantes del dominio si otra librería además del framework esperado la usa; abre el paquete al consumidor exacto, no a `opens academia.rutas.modelo;` sin calificar, salvo que de verdad lo necesites.

#### Practica

Modifica la apertura general `opens academia.rutas.modelo;` del Subtema 3.1 por la versión calificada `to com.fasterxml.jackson.databind` y confirma con `jar --describe-module` que el nombre del módulo de Jackson coincide exactamente.

---


## Construcción guiada del capítulo

**Objetivo del laboratorio:** dividir un proyecto en al menos dos módulos JPMS con dependencias explícitas.

**Requisitos previos:** Módulos 0-9 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear módulos `core` y `app` con sus `module-info.java` | Ver Tema 1 | Declara la identidad de cada módulo |
| 2 | Declarar `exports` en `core` para un paquete específico | Ver Tema 1 | Verifica que un paquete no exportado es inaccesible |
| 3 | Declarar `requires` en `app` hacia `core` | Ver Tema 1 | Dependencia explícita entre módulos |
| 4 | Documentar la migración incremental de un proyecto legacy | Ver Tema 2 | Módulos "hoja" primero |

**Verificación:** el laboratorio se considera exitoso si un paquete de `core` no exportado explícitamente resulta inaccesible desde `app`, incluso si sus clases son `public`, y si `app` compila correctamente su dependencia declarada hacia `core`.

**Errores comunes y soluciones**

- **Exportar todos los paquetes de un módulo sin necesidad.** Exporta únicamente los paquetes que realmente forman parte de la API pública del módulo.
- **Aplicar JPMS a un proyecto pequeño sin necesidad real.** Evalúa primero si el beneficio de límites arquitectónicos verificados justifica la ceremonia adicional.
- **Intentar migrar todo el proyecto a JPMS de una sola vez.** Migra incrementalmente comenzando por los módulos "hoja".
- **`InaccessibleObjectException` en tiempo de ejecución con un framework (Jackson, Hibernate, Spring) aunque el proyecto compile bien.** Al paquete le falta una declaración `opens` (además de `exports`): la reflexión que usan estos frameworks internamente necesita ese permiso adicional, independiente del acceso normal de compilación.

---
