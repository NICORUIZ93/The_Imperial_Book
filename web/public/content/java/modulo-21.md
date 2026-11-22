# Módulo 21: APIs públicas, compatibilidad y evolución

Una librería no solo debe compilar hoy: debe no romper a los clientes ya compilados mañana. Este módulo trata la superficie pública de una API Java como un contrato: qué se expone, qué compatibilidad se promete, cómo evolucionar sin romper y cómo verificarlo.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Identificar la superficie pública real de una API |
| 2 | Distinguir compatibilidad de fuente y binaria |
| 3 | Evolucionar APIs con `default`, deprecación y retiro planificado |
| 4 | Entender borrado de genéricos y métodos puente en APIs públicas |
| 5 | Verificar compatibilidad en build/CI |

## Aprende construyendo

### Tema 1: Qué es la superficie pública de una API · Básico · 40 min

**Caso guía**: expones una librería; cualquier cambio público puede romper consumidores.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Superficie pública de API | Tipos, métodos, campos, constructores y contratos accesibles a consumidores. | Definir qué se puede usar/depender. | Documentar y versionar. | Cambiar firma pública sin versionado. |
| Contrato público | Comportamiento esperado, no solo firma. | Estabilidad para clientes. | Mantener semántica. | Cambiar semántica manteniendo firma. |
| Encapsulación | Ocultar detalles internos. | Evolucionar sin romper. | `private/package` por defecto. | Hacer `public` “por si acaso”. |
| SemVer/compatibilidad | Convención de versionado según impacto. | Comunicar riesgo. | Major para breaking. | Breaking en minor/patch. |

**Implementación desde cero** (`mkdir -p ~/academia-java/modulo-21 && cd ~/academia-java/modulo-21`)
```java
// api/PrecioService.java
public class PrecioService { public int total(int base, int iva){ return base + iva; } }
```
**Ejecución/uso**: consumidores compilan contra `total(int,int)`. **Verificación**: cambia firma a `total(long,long)` y observa error de compilación en cliente.

### Tema 2: Compatibilidad binaria frente a compatibilidad de fuente · Intermedio · 45 min

**Caso guía**: recompilar cliente funciona, pero JAR viejo falla en runtime (o viceversa).

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Compatibilidad de fuente | Código cliente compila sin cambios. | Evolución suave. | Probar compilación cliente. | Asumir que basta. |
| Compatibilidad binaria | Bytecode cliente ya compilado sigue funcionando. | Evitar romper despliegues. | Revisar cambios de firma/campos/métodos. | Romper binario en patch. |
| Ejemplos de ruptura | Borrar método, cambiar tipo retorno incompatible, cambiar campo a incompatible. | Evaluar cambios. | Usar herramientas (japicmp). | Cambiar API “pequeña” sin chequear. |
| Descriptor JVM | Firma a nivel bytecode. | Entender binario. | `javap -s` para inspeccionar. | Mirar solo código fuente. |

**Implementación desde cero**
```bash
cat > Lib.java <<'JAVA'
public class Lib { public static int suma(int a,int b){ return a+b; } }
JAVA
cat > Cliente.java <<'JAVA'
public class Cliente { public static void main(String[] args){ System.out.println(Lib.suma(1,2)); } }
JAVA
javac Lib.java Cliente.java && java Cliente
```
**Salida real**: `3`. **Verificación**: cambia `suma` a `suma(long,long)`, recompila solo Lib y ejecuta Cliente viejo: falla por incompatibilidad binaria.

### Tema 3: Evolucionar sin romper: default methods, deprecación y retirada · Intermedio · 45 min

**Caso guía**: necesitas agregar método a interfaz publicada.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `default method` | Implementación por defecto en interfaz. | Evolucionar interfaces sin romper implementadores. | Debe ser comportamiento sensato. | Default con semántica sorprendente. |
| `@Deprecated` | Marca API obsoleta. | Migración gradual. | Incluir `since`, `forRemoval`, alternativa Javadoc. | Deprecar sin camino. |
| Retirada (forRemoval) | Eliminación planificada. | Limpiar deuda. | Dar ventana y versión major. | Quitar sin aviso. |
| Evolución compatible | Añadir overload, nuevo método default, nuevo tipo. | Crecer API. | Documentar y testear. | Cambiar comportamiento existente. |

**Implementación desde cero**
```java
interface Notificador { void enviar(String msg); default void enviarUrgente(String msg){ enviar("[URGENTE] "+msg); } }
class Email implements Notificador { public void enviar(String msg){ System.out.println(msg); } }
public class DemoDefault { public static void main(String[] args){ new Email().enviarUrgente("hola"); } }
```
**Ejecución real**: `[URGENTE] hola`.

### Tema 4: Genéricos, borrado y métodos puente en la superficie pública · Avanzado · 45 min

**Caso guía**: API pública usa genéricos; cliente ve comportamiento extraño por erasure.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Genéricos | Tipos parametrizados en compile time. | Seguridad de tipos. | Diseñar API clara. | APIs genéricas excesivamente complejas. |
| Borrado (type erasure) | Genéricos se borran a runtime en la JVM. | Compatibilidad con bytecode viejo. | No depender de `List<String>.class`. | `instanceof List<String>`. |
| Métodos puente (bridge) | Métodos sintéticos que el compilador genera para preservar polimorfismo. | Compatibilidad binaria con genéricos. | Entender al depurar `javap`. | Sorpresa por métodos extra en reflexión. |
| Superficie pública + genéricos | Firma genérica afecta fuente/binario. | Evolución API. | Evitar cambios incompatibles en parámetros genéricos. | Cambiar `List` a `Collection` sin evaluar. |

**Implementación desde cero**
```java
class Caja<T> { private T v; public void set(T v){ this.v=v; } public T get(){ return v; } }
public class DemoErasure { public static void main(String[] args){ Caja<String> c=new Caja<>(); c.set("ok"); System.out.println(c.get()); System.out.println(c.getClass()==new Caja<Integer>().getClass()); } }
```
**Ejecución real**: `ok`, `true`. **Verificación**: `javap -c -private Caja` para observar firmas borradas/bridge cuando aplique.

### Tema 5: Verificar la compatibilidad en el build · Avanzado · 45 min

**Caso guía**: prevenir breaking changes antes de publicar.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Verificación en build | Checks automáticos de compatibilidad API. | Evitar regresiones. | Integrar en CI. | Revisar API a ojo. |
| `japicmp`/Revapi | Herramientas para comparar jars. | Detectar binario/fuente break. | Ejecutar contra baseline. | Sin baseline versionada. |
| Baseline | Versión publicada anterior como referencia. | Comparación objetiva. | Guardar artefacto/version. | Comparar contra build local no release. |
| Política de versión | Reglas de cuándo subir major/minor/patch. | Gobernanza. | Documentar en CONTRIBUTING. | Versionado ad-hoc. |

**Implementación desde cero** (verificación conceptual/práctica)
```bash
# con jars viejo y nuevo
# japicmp --old lib-1.0.0.jar --new lib-1.1.0.jar
```
**Nota de verificación**: requiere tool/jars; el concepto clave es automatizar comparación. **Verificación mínima**: compilar cliente viejo contra jar nuevo y ejecutar binario viejo con jar nuevo.


## Cierre del módulo

Diseñar APIs públicas es diseñar promesas. Distinguir fuente/binario, evolucionar con `default` y deprecación, entender borrado y automatizar verificación convierte la compatibilidad en una práctica de ingeniería, no en suerte.
