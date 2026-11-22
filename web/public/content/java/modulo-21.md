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

**Caso guía**

Publicas una librería `envios-core`. Otro equipo la usa desde su propio paquete. Un método “parece” usable, pero devuelve un tipo package-private: compila mal para el cliente. Necesitas distinguir superficie pública de implementación interna.

**Fundamento técnico y modelo mental**

**Definición formal.** La *superficie pública* (API pública) de un módulo/librería es el conjunto de tipos y miembros accesibles a clientes externos bajo las reglas de acceso de Java (`public`, `protected` según herencia, y reglas de módulos). Todo lo no expuesto es detalle de implementación, aunque exista en el JAR.

**Contrato / invariantes / reglas.** `public` no significa “diseñado para ser estable”; pero todo `public` accesible puede ser usado por clientes y, por tanto, genera expectativa de compatibilidad. Los tipos package-private o `private` reducen la superficie comprometida. La firma pública incluye nombre, parámetros, tipo de retorno, excepciones checked declaradas, tipos genéricos expuestos y comportamiento observable. Exponer tipos internos en firmas públicas contamina la API.

**Modelo mental.** La API pública es la fachada del edificio: los clientes pueden usar las puertas marcadas; los pasillos internos pueden cambiar si la fachada se mantiene.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-21 && cd ~/academia-java/modulo-21
```

Crea `DemoApi.java`:
```java
final class Guia {
    private final String codigo;
    private final double pesoKg;

    Guia(String codigo, double pesoKg) {
        if (codigo == null || codigo.isBlank()) throw new IllegalArgumentException("codigo");
        if (pesoKg <= 0) throw new IllegalArgumentException("peso");
        this.codigo = codigo;
        this.pesoKg = pesoKg;
    }

    String codigo() { return codigo; }
    double pesoKg() { return pesoKg; }
}

interface Cotizador {
    int cotizar(Guia guia);
}

class CotizadorSimple implements Cotizador {
    public int cotizar(Guia guia) { return (int) Math.ceil(guia.pesoKg() * 1000); }
}

public class DemoApi {
    public static void main(String[] args) {
        Cotizador c = new CotizadorSimple();
        System.out.println(c.cotizar(new Guia("G-1", 2.5)));
    }
}
```

**Desglose del código**

- `Guia` expone constructores y métodos accesibles: son contrato.
- `Cotizador` es contrato público; `CotizadorSimple` puede ser implementación interna.
- No exponer tipos internos en firmas reduce acoplamiento.
- La estabilidad se promete sobre la superficie pública, no sobre clases internas.

**Ejecución y salida real**

```bash
javac DemoApi.java
java DemoApi
```

```text
2500
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Cliente no puede compilar contra tipo devuelto | Tipo no público en firma | Expón un tipo público o cambia firma |
| Cambias clase interna y rompes clientes | Era usada por reflexión/acceso indebido | Documenta y reduce superficie pública |
| API demasiado grande | Todo `public` por defecto | Minimiza visibilidad; “publicar es prometer” |

**Verificación rápida**

Revisa qué tipos/métodos usaría un cliente fuera del paquete: esa es tu superficie comprometida.

### Tema 2: Compatibilidad binaria frente a compatibilidad de fuente · Intermedio · 45 min

**Caso guía**

Actualizas una librería. El cliente recompila bien, pero un JAR antiguo desplegado falla con `NoSuchMethodError`. O al revés: recompilar falla, pero binarios viejos siguen funcionando. Son tipos de compatibilidad distintos.

**Fundamento técnico y modelo mental**

**Definición formal.** *Compatibilidad de fuente* (source compatibility) significa que el código cliente compila contra la nueva versión. *Compatibilidad binaria* (binary compatibility) significa que código cliente ya compilado contra una versión anterior enlaza y ejecuta correctamente con la nueva versión, según reglas de la JVM/Java Language Specification.

**Contrato / invariantes / reglas.** Agregar un método sobrecargado puede ser source-compatible pero afectar resolución. Eliminar o cambiar firma de un método usado puede romper binario (`NoSuchMethodError`). Agregar método abstracto a interfaz rompe implementadores existentes (`AbstractMethodError`/error de compilación al recompilar). Cambiar tipo de retorno de forma incompatible rompe binario/fuente según caso. Las constantes `static final` primitivas/String pueden ser inlined en compilación cliente.

**Modelo mental.** Compatibilidad de fuente es que el plano nuevo sirva para redibujar; compatibilidad binaria es que el edificio ya construido siga encajando con la pieza nueva.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-21 && cd ~/academia-java/modulo-21
```

Crea `DemoCompat.java`:
```java
// v1
class CalculadoraV1 {
    public int sumar(int a, int b) { return a + b; }
}

// v2 compatible en fuente/binario para este caso: agrega sobrecarga
class CalculadoraV2 {
    public int sumar(int a, int b) { return a + b; }
    public int sumar(int a, int b, int c) { return a + b + c; }
}

public class DemoCompat {
    public static void main(String[] args) {
        CalculadoraV2 c = new CalculadoraV2();
        System.out.println(c.sumar(1, 2));
        System.out.println(c.sumar(1, 2, 3));
    }
}
```

Ejemplo de ruptura binaria conceptual: si un cliente compilado llama `sumar(int,int)` y en la nueva versión lo renombras a `sumarDos(int,int)`, el cliente viejo falla con `NoSuchMethodError`.

**Desglose del código**

- Agregar sobrecarga suele ser compatible.
- Eliminar/renombrar método usado rompe binario.
- Verifica con cliente compilado contra versión vieja ejecutado sobre versión nueva.
- `javap -v` ayuda a inspeccionar firmas/constantes.

**Ejecución y salida real**

```bash
javac DemoCompat.java
java DemoCompat
```

```text
3
6
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `NoSuchMethodError` en prod | Cambiaste firma/eliminaste método | Mantén firma vieja; agrega nueva y depreca |
| `AbstractMethodError` | Agregaste método abstracto a interfaz publicada | Usa `default` o nueva interfaz |
| Compila pero falla en runtime | Probaste solo recompilando | Prueba binarios viejos contra JAR nuevo |

**Verificación rápida**

Compila un cliente contra una versión, modifica la librería de forma incompatible, reemplaza el JAR y ejecuta el cliente sin recompilar.

### Tema 3: Evolucionar sin romper: default methods, deprecación y retirada · Intermedio · 45 min

**Caso guía**

Tu interfaz `Notificador` ya fue implementada por clientes. Necesitas agregar `enviarUrgente`. Si agregas un método abstracto, rompes implementadores. Necesitas una evolución compatible.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *default method* es un método de interfaz con implementación por defecto, introducido para evolución compatible de interfaces. La *deprecación* (`@Deprecated`) marca un elemento como no recomendado, usualmente indicando alternativa y plan de retiro. El *retiro* es la eliminación real en una versión mayor/planificada.

**Contrato / invariantes / reglas.** `default` permite agregar comportamiento sin romper implementadores existentes, pero la implementación por defecto debe ser semánticamente razonable. Deprecar no elimina: comunica. `forRemoval=true` y `since` documentan intención. Retirar requiere ciclo de migración, notas de versión y, idealmente, herramientas de detección. No deprecies sin alternativa.

**Modelo mental.** Evolucionar una API es cambiar una carretera en uso: primero pones señalización (deprecación), luego abres desvío (default/nueva API), y solo al final cierras el tramo viejo (retiro).

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-21 && cd ~/academia-java/modulo-21
```

Crea `Notificador.java`:
```java
interface Notificador {
    void enviar(String mensaje);

    @Deprecated(since = "2.0", forRemoval = true)
    default void enviarUrgente(String mensaje) {
        enviar("[URGENTE] " + mensaje);
    }

    default void enviarPrioridad(String mensaje, int prioridad) {
        String prefijo = prioridad >= 5 ? "[URGENTE] " : "";
        enviar(prefijo + mensaje);
    }
}

class EmailNotificador implements Notificador {
    public void enviar(String mensaje) { System.out.println("email:" + mensaje); }
}

public class DemoEvolucion {
    public static void main(String[] args) {
        Notificador n = new EmailNotificador();
        n.enviarPrioridad("Falla", 5);
    }
}
```

**Desglose del código**

- `enviarPrioridad` es la nueva API.
- `enviarUrgente` queda deprecada con alternativa.
- Implementadores antiguos siguen compilando porque la interfaz mantiene compatibilidad.
- El retiro real se hace en versión mayor, tras periodo de migración.

**Ejecución y salida real**

```bash
javac DemoEvolucion.java
java DemoEvolucion
```

```text
email:[URGENTE] Falla
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Rompes implementadores | Agregaste método abstracto | Usa `default` o versión mayor planificada |
| Deprecación inútil | No indicas alternativa | Documenta reemplazo y `since/forRemoval` |
| Retiro prematuro | Sin ventana de migración | Mantén ciclo de deprecación y comunicación |

**Verificación rápida**

Compila un implementador viejo contra la interfaz con `default` agregado: debe seguir compilando.

### Tema 4: Genéricos, borrado y métodos puente en la superficie pública · Avanzado · 45 min

**Caso guía**

Publicas una interfaz genérica `Repositorio<T>`. Un cliente implementa `Repositorio<Guia>` y el compilador genera métodos puente. Cambias la firma genérica de forma incompatible y aparecen errores sutiles en runtime.

**Fundamento técnico y modelo mental**

**Definición formal.** El *borrado de tipos* (type erasure) es la implementación de genéricos en Java donde la información de tipo genérico se elimina en bytecode (en su forma parametrizada) y se insertan casts/métodos puente según sea necesario. Un *método puente* (bridge method) es un método sintético generado por el compilador para preservar polimorfismo y compatibilidad de firmas tras el borrado.

**Contrato / invariantes / reglas.** Dos métodos no pueden diferir solo por parámetros genéricos si borran a la misma firma. Cambiar genéricos en API pública puede romper source o binary compatibility. `javap -c -private` permite ver bridge methods. Las APIs públicas deben ser cuidadosas con tipos raw, wildcards y retornos genéricos porque el borrado afecta el contrato en bytecode.

**Modelo mental.** Los genéricos son etiquetas de seguridad en compilación; en runtime, muchas etiquetas se borran y el compilador deja puentes invisibles para que el tráfico siga pasando.

**Implementación desde cero**

Desde una carpeta vacía:

```bash
mkdir -p ~/academia-java/modulo-21 && cd ~/academia-java/modulo-21
```

Crea `Repositorio.java`:
```java
interface Repositorio<T> {
    void guardar(T valor);
}

class RepoGuia implements Repositorio<String> {
    public void guardar(String valor) {
        System.out.println("guardar:" + valor);
    }
}

public class DemoBridge {
    public static void main(String[] args) {
        Repositorio<String> repo = new RepoGuia();
        repo.guardar("G-1");
    }
}
```

Inspección:

```bash
javac DemoBridge.java
javap -private RepoGuia
```

**Desglose del código**

- `Repositorio<String>` da tipo seguro en compilación.
- En bytecode, el método puente permite que la implementación cumpla la firma borrada.
- `javap` muestra métodos sintéticos/bridge cuando aplica.
- Cambios de genéricos en APIs públicas deben evaluarse como cambios de contrato.

**Ejecución y salida real**

```bash
javac DemoBridge.java
java DemoBridge
```

```text
guardar:G-1
```

`javap -private RepoGuia` puede mostrar un método bridge sintético dependiendo del caso exacto.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Error “same erasure” | Dos métodos colisionan tras borrado | Cambia nombres o diseño de API |
| `ClassCastException` en runtime | Uso de raw types o API inconsistente | Evita raw types en API pública |
| Ruptura sutil al cambiar genéricos | Cambio de firma borrada | Verifica binario y usa herramientas de compatibilidad |

**Verificación rápida**

Ejecuta `javap -private -v RepoGuia` y busca métodos `bridge`/`synthetic`.

### Tema 5: Verificar la compatibilidad en el build · Avanzado · 45 min

**Caso guía**

El equipo cambia la librería y todo compila en el repo. Pero un cliente externo compilado contra v1 falla en producción. Necesitas una verificación de compatibilidad en CI.

**Fundamento técnico y modelo mental**

**Definición formal.** La *verificación de compatibilidad API/binaria* es el proceso automatizado de comparar una versión base y una nueva para detectar cambios incompatibles. Herramientas como japicmp, Revapi o checks de Maven/Gradle pueden integrarse en el build.

**Contrato / invariantes / reglas.** El baseline debe ser una versión publicada real. La verificación debe distinguir cambios binarios y de fuente cuando la herramienta lo soporte. No toda ruptura detectada es un error si la versión mayor lo permite; la política semántica de versiones define la respuesta. La verificación automatizada no reemplaza pruebas de integración de clientes reales.

**Modelo mental.** Es un control de calidad de piezas: antes de enviar la nueva pieza, la comparas con el molde anterior.

**Implementación desde cero**

Flujo conceptual con `japicmp` (herramienta externa):

```bash
# comparar v1.jar (baseline) contra v2.jar (nuevo)
java -jar japicmp.jar --old v1.jar --new v2.jar --only-modified --markdown report.md
```

Política mínima de CI:

```text
[ ] compilar librería nueva
[ ] ejecutar tests
[ ] comparar contra baseline publicado
[ ] fallar CI si hay ruptura incompatible sin bump mayor
[ ] publicar notas de migración si hay deprecaciones/retiros
```

**Desglose del código**

- El baseline es la versión anterior publicada.
- La comparación detecta métodos/clases eliminadas o firmas incompatibles.
- El resultado debe conectarse a la política de versionado.
- La prueba con cliente real sigue siendo valiosa.

**Ejecución y salida real**

> **Nota:** `japicmp`/Revapi son herramientas externas. El flujo se verifica en CI o local con el JAR de la herramienta.

Salida esperada: reporte sin cambios incompatibles, o fallo de build si los hay.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| CI verde pero cliente rompe | No comparaste binarios | Agrega japicmp/Revapi y prueba cliente congelado |
| Ruptura aceptada sin bump | Política de versión ausente | Define SemVer/política de compatibilidad |
| Baseline incorrecto | Comparaste contra build local | Usa artefacto publicado |

**Verificación rápida**

Guarda un cliente compilado contra v1, cambia v2 de forma incompatible y verifica que la herramienta lo reporta.

## Cierre del módulo

Diseñar APIs públicas es diseñar promesas. Distinguir fuente/binario, evolucionar con `default` y deprecación, entender borrado y automatizar verificación convierte la compatibilidad en una práctica de ingeniería, no en suerte.
