# Módulo 21: APIs públicas, compatibilidad y evolución

Una librería no solo debe compilar hoy: debe no romper a los clientes ya compilados mañana. Este módulo trata la superficie pública de una API Java como un contrato: qué se expone, qué compatibilidad se promete, cómo evolucionar sin romper y cómo verificarlo.

**Entorno de referencia verificado (2026-05-22):** JDK 27.

## Aprende construyendo

### Tema 1: Qué es la superficie pública de una API · Básico · 40 min

Expones una librería; cualquier cambio público puede romper consumidores.

#### Superficie pública de API

**Definición formal.** Conjunto de tipos, constructores, métodos, campos y constantes accesibles por consumidores fuera del módulo/paquete de implementación.

**Para qué sirve.** Define el contrato estable que otros pueden usar.

**Cuándo usarla y cuándo no.** Diseña con intención; por defecto mantiene detalles `private` o package-private.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j21-t1 && cd /tmp/j21-t1
cat > PrecioService.java << 'JAVA'
public class PrecioService { public int total(int base, int iva){ return base + iva; } }
JAVA
cat > Cliente.java << 'JAVA'
public class Cliente { public static void main(String[] args){ System.out.println(new PrecioService().total(100,21)); } }
JAVA
javac PrecioService.java Cliente.java && java Cliente
```

**Caso de uso real.** SDK interno usado por varios equipos.

**Error común.** Hacer `public` “por si acaso”. Síntoma: no puedes cambiar nada sin romper. Corrección: exponer lo mínimo.

**Verificación (JDK 27, 2026-05-22).** Salida: `121`.

#### Contrato público y semántica

**Definición formal.** El contrato público incluye firma y comportamiento esperado/documentado.

**Para qué sirve.** Los clientes dependen de semántica, no solo de compilación.

**Cuándo cuidarlo.** En cada release.

**Ejemplo mínimo enfocado (ejecutable).**

```java
// total(base,iva) debe devolver suma; cambiar a multiplicación rompe contrato aunque compile.
```

**Caso de uso real.** Método que pasa de devolver null a lanzar excepción.

**Error común.** Cambiar semántica manteniendo firma. Corrección: documentar, versionar y comunicar breaking behavior.

**Verificación.** **Nota:** la verificación es contractual/tests de compatibilidad; compila no implica compatible.

### Tema 2: Compatibilidad binaria frente a compatibilidad de fuente · Intermedio · 45 min

Recompilar cliente funciona, pero JAR viejo falla en runtime, o viceversa.

#### Compatibilidad de fuente

**Definición formal.** El código fuente del cliente compila sin cambios contra la nueva versión.

**Para qué sirve.** Reduce fricción de upgrade.

**Cuándo evaluarla.** En cambios de API.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j21-t2 && cd /tmp/j21-t2
cat > Lib.java << 'JAVA'
public class Lib { public static int suma(int a,int b){ return a+b; } }
JAVA
cat > Cliente.java << 'JAVA'
public class Cliente { public static void main(String[] args){ System.out.println(Lib.suma(1,2)); } }
JAVA
javac Lib.java Cliente.java && java Cliente
```

**Caso de uso real.** Actualizar dependencia y recompilar app.

**Error común.** Asumir que compilar basta. Corrección: también probar compatibilidad binaria.

**Verificación (2026-05-22).** Salida: `3`.

#### Compatibilidad binaria

**Definición formal.** Bytecode del cliente compilado contra versión antigua sigue ejecutando con la nueva versión sin recompilar.

**Para qué sirve.** Protege despliegues y ecosistemas de librerías.

**Cuándo evaluarla.** Siempre en librerías publicadas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j21-t2
cp Cliente.class Cliente.old.class
cat > Lib.java << 'JAVA'
public class Lib { public static int suma(long a,long b){ return (int)(a+b); } }
JAVA
javac Lib.java
java Cliente || true
```

**Caso de uso real.** App desplegada con jar viejo del cliente y librería nueva.

**Error común.** Cambiar tipo primitivo en firma pública. Síntoma: `NoSuchMethodError`. Corrección: agregar overload, no reemplazar en minor/patch.

**Verificación (2026-05-22).** Tras cambiar firma y recompilar solo `Lib`, ejecutar `Cliente` viejo produce `NoSuchMethodError`.

### Tema 3: Evolucionar sin romper: default methods, deprecación y retirada · Intermedio · 45 min

Necesitas agregar método a interfaz publicada.

#### `default method`

**Definición formal.** Método con implementación en una interfaz, introducido para evolucionar interfaces sin romper implementadores existentes.

**Para qué sirve.** Agregar capacidad con compatibilidad.

**Cuándo usarlo.** Cuando hay comportamiento por defecto razonable.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j21-t3 && cd /tmp/j21-t3
cat > DemoDefault.java << 'JAVA'
interface Notificador { void enviar(String msg); default void enviarUrgente(String msg){ enviar("[URGENTE] "+msg); } }
class Email implements Notificador { public void enviar(String msg){ System.out.println(msg); } }
public class DemoDefault { public static void main(String[] args){ new Email().enviarUrgente("hola"); } }
JAVA
javac DemoDefault.java && java DemoDefault
```

**Caso de uso real.** Agregar método nuevo a API pública de interfaz.

**Error común.** Default con semántica sorprendente o costosa. Corrección: mantener contrato claro y simple.

**Verificación (2026-05-22).** Salida: `[URGENTE] hola`.

#### Deprecación y retirada

**Definición formal.** `@Deprecated` marca una API como obsoleta; `forRemoval` indica retiro planificado.

**Para qué sirve.** Migración gradual.

**Cuándo usarlo.** Cuando hay alternativa mejor y plan de retiro.

**Ejemplo mínimo enfocado (ejecutable).**

```java
/** @deprecated Usar {@link #totalV2(int,int)}. */
@Deprecated(since="1.2", forRemoval=true)
public int total(int a,int b){ return totalV2(a,b); }
public int totalV2(int a,int b){ return a+b; }
```

**Caso de uso real.** Retirar método inseguro.

**Error común.** Deprecar sin alternativa ni timeline. Corrección: Javadoc con reemplazo, `since`, `forRemoval`.

**Verificación.** Compila y genera warning de deprecación al usar.

### Tema 4: Genéricos, borrado y métodos puente en la superficie pública · Avanzado · 45 min

La API pública usa genéricos; el bytecode tiene borrado y a veces métodos puente.

#### Genéricos y type erasure

**Definición formal.** Los genéricos aportan seguridad de tipos en compilación; en JVM, el borrado elimina argumentos de tipo en runtime en la mayoría de los casos.

**Para qué sirve.** APIs expresivas sin romper compatibilidad binaria histórica.

**Cuándo considerarlo.** Al diseñar APIs públicas y al usar reflexión.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/j21-t4 && cd /tmp/j21-t4
cat > DemoErasure.java << 'JAVA'
class Caja<T> { private T v; public void set(T v){ this.v=v; } public T get(){ return v; } }
public class DemoErasure { public static void main(String[] args){ Caja<String> c=new Caja<>(); c.set("ok"); System.out.println(c.get()); System.out.println(c.getClass()==new Caja<Integer>().getClass()); } }
JAVA
javac DemoErasure.java && java DemoErasure
```

**Caso de uso real.** No se puede hacer `instanceof List<String>`.

**Error común.** Asumir que el tipo genérico existe en runtime. Corrección: usar tokens de tipo o diseño explícito.

**Verificación (2026-05-22).** Salida: `ok`, `true`.

#### Métodos puente (bridge)

**Definición formal.** Métodos sintéticos que el compilador genera para preservar polimorfismo y compatibilidad binaria al usar genéricos/covarianza.

**Para qué sirve.** Garantiza que la invocación virtual funcione tras el borrado.

**Cuándo observarlo.** Al depurar reflexión o `javap`.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
cd /tmp/j21-t4
cat > DemoBridge.java << 'JAVA'
class Base<T> { T get(T v){ return v; } }
class Str extends Base<String> { @Override String get(String v){ return v+"!"; } }
public class DemoBridge { public static void main(String[] args){ System.out.println(new Str().get("ok")); } }
JAVA
javac DemoBridge.java && java DemoBridge
javap -private Str | grep bridge || true
```

**Caso de uso real.** Override genérico genera bridge.

**Error común.** Sorprenderse por método extra en reflexión. Corrección: filtrar `isBridge()`.

**Verificación (2026-05-22).** Salida: `ok!`; `javap` puede mostrar `bridge` según compilador.

### Tema 5: Verificar la compatibilidad en el build · Avanzado · 45 min

Prevenir breaking changes antes de publicar.

#### Verificación de compatibilidad en CI

**Definición formal.** Automatización que compara API nueva contra baseline publicada para detectar rupturas de fuente/binario.

**Para qué sirve.** Convierte compatibilidad en gate repetible.

**Cuándo usarlo.** Librerías/APIs publicadas.

**Ejemplo mínimo enfocado (ejecutable como proceso).**

```bash
# comparar baseline y nueva versión con japicmp/revapi en CI
# japicmp --old lib-1.0.0.jar --new lib-1.1.0.jar --errorOnBinaryIncompatibility
```

**Caso de uso real.** Fallar PR que elimina método público.

**Error común.** Revisar a ojo. Corrección: herramienta + baseline en CI.

**Verificación.** **Nota de verificación:** requiere jars baseline/nuevo y herramienta instalada; el gate es el comando de CI.

#### Baseline y política de versión

**Definición formal.** Baseline es la versión publicada de referencia; la política de versión define qué cambios requieren major/minor/patch.

**Para qué sirve.** Gobernanza y expectativas claras.

**Cuándo usarlo.** Desde la primera versión pública.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
echo "breaking public API -> major" > /tmp/version-policy.txt
cat /tmp/version-policy.txt
```

**Caso de uso real.** SemVer para librería interna.

**Error común.** Breaking change en patch. Corrección: política explícita y check automático.

**Verificación (2026-05-22).** Archivo de política creado; el control real es organizacional + CI.

## Cierre del módulo

Diseñar APIs públicas es diseñar promesas. Distinguir fuente/binario, evolucionar con default/deprecación, entender borrado/bridges y automatizar verificación convierte la compatibilidad en ingeniería, no en suerte.
