# Módulo 0: Fundamentos de programación y entorno Java

Este módulo establece el ciclo completo: entorno, compilación, ejecución, tipos, texto, control de flujo, arreglos y métodos. Cada tema se construye desde cero, con comandos reproducibles y verificación observable.

**Entorno de referencia verificado (2026-05-22, esta máquina)**:

```bash
java -version
javac -version
```

```text
openjdk version "27.0.1.0.2" 2026-09-15
OpenJDK Runtime Environment Temurin-27.0.1.0.2+1 (build 27+13-7460)
OpenJDK 64-Bit Server VM Temurin-27.0.1.0.2+1 (build 27+13-7460, mixed mode, sharing)
javac 27.0.1.0.2
```

## Prerrequisitos

- Terminal (PowerShell, bash o zsh).
- Permisos para instalar software.
- Editor de texto plano (VS Code, IntelliJ, Neovim, etc.).
- Espacio para crear carpetas de práctica.

## Aprende construyendo

### Tema 1: Qué es programar y qué problema resuelve Java · Básico · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

Tienes que calcular el precio final de un producto con IVA. La regla es simple: precio base + impuesto. El caso obliga a lo esencial: entrada, proceso, salida y verificación.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo no / riesgo | Verificación |
|---|---|---|---|---|---|
| Programa | Especificación finita y ejecutable de un cómputo: transforma entrada/estado en salida según reglas del lenguaje y runtime. | Automatizar reglas repetibles. | Cuando la regla es clara y repetible. | No automatices reglas ambiguas sin definirlas. | Cambias entrada y la salida cambia coherentemente. |
| Programar | Diseñar, codificar, compilar/ejecutar y verificar esa especificación. | Convertir una necesidad en comportamiento observable. | Siempre que implementes software. | No es solo “escribir código”; sin verificación es adivinanza. | Compila, ejecuta y pasa caso esperado. |
| Java (lenguaje/plataforma) | Lenguaje orientado a objetos, tipado estático, compilado a bytecode ejecutado por JVM. | Construir software portable, mantenible y con ecosistema amplio. | Backend, Android, herramientas, enterprise. | No es la mejor opción para todo script rápido o todo sistema de bajo nivel. | `javac` genera `.class`, `java` lo ejecuta. |
| Punto de entrada `main` | Método `public static void main(String[] args)` que la JVM invoca al iniciar. | Definir dónde comienza la ejecución. | Apps standalone Java. | Firma incorrecta: JVM no lo reconoce. | `java Clase` ejecuta el método. |

**Contrato / invariantes / reglas.** El archivo `.java` con clase pública `C` debe llamarse `C.java`. `javac` valida sintaxis/tipos; si falla, no hay `.class` nuevo válido. `main` debe tener la firma exacta. La salida observable debe coincidir con la regla.

**Modelo mental.** Un programa es una receta verificable: ingredientes (entrada), pasos (proceso), plato (salida), control de calidad (compilación/prueba).

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa | Arreglo |
|---|---|---|
| `class ... is public, should be declared in a file named ...` | Nombre de archivo/clase no coincide | Renombrar para que coincidan |
| `Could not find or load main class` | Ejecutaste en carpeta equivocada o con `.class` | `cd` a la carpeta y usa `java PrecioFinal` |
| Salida no cambia | Ejecutaste `.class` viejo | Recompila con `javac` |

#### Verificación rápida

- [ ] `javac` genera `.class`.
- [ ] `java PrecioFinal` imprime 121.0 para base 100.0 e IVA 0.21.
- [ ] Cambiar base a 200.0 produce 242.0.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Implementación desde cero

```bash
mkdir -p /tmp/java-m0-t1 && cd /tmp/java-m0-t1
```

`PrecioFinal.java`

```java
public class PrecioFinal {
    public static void main(String[] args) {
        double precioBase = 100.0;
        double iva = 0.21;
        double precioFinal = precioBase + (precioBase * iva);

        System.out.println("Precio base: " + precioBase);
        System.out.println("IVA: " + iva);
        System.out.println("Precio final: " + precioFinal);
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `public class PrecioFinal` | Define la clase pública | Java organiza código en clases | Nombre distinto al archivo falla al compilar |
| `main(String[] args)` | Punto de entrada | JVM lo invoca | Sin firma correcta no ejecuta |
| `double precioBase/iva` | Variables decimales | Representan valores del cálculo | Tipo incorrecto puede perder precisión o no compilar |
| `precioBase + (precioBase * iva)` | Regla de negocio | Calcula precio final | Quitar paréntesis aquí no cambia por precedencia, pero en otras expresiones sí |
| `System.out.println` | Salida estándar | Permite observar resultado | Sin salida no verificas |

#### Ejecución y salida real

Comandos:

```bash
javac PrecioFinal.java
java PrecioFinal
```

Salida real observada (2026-05-22, JDK 27):

```text
Precio base: 100.0
IVA: 0.21
Precio final: 121.0
```

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| No compila por nombre | Archivo/clase no coinciden | Mismo nombre exacto |
| `NumberFormatException` inexistente aquí | No aplica; no hay parsing | Si agregas `args`, valida/parsa |
| Resultado incorrecto | Fórmula mal escrita | Verifica con caso manual |

#### Verificación rápida

1. Cambia `precioBase` a 200.0.
2. `javac PrecioFinal.java && java PrecioFinal`.
3. Espera `Precio final: 242.0`.

</details>

### Tema 2: JDK, JRE, JVM y bytecode (WORA) · Básico · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

Compilas `HolaJVM.java`, obtienes `HolaJVM.class` y lo ejecutas. ¿Por qué no ejecutas el `.java` directo? ¿Por qué el `.class` puede correr en otra máquina? La respuesta separa fallos de código, compilación y entorno.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo/tenerlo en cuenta | Cuándo no / riesgo | Verificación |
|---|---|---|---|---|---|
| JDK | Kit de desarrollo: `javac`, herramientas, docs/libs y runtime para desarrollar/ejecutar. | Compilar y desarrollar Java. | Siempre que programes Java. | Instalar solo JRE y esperar `javac`. | `javac -version` funciona. |
| JRE/Runtime | Entorno para ejecutar Java; históricamente sin toolchain completa de desarrollo. | Ejecutar apps compiladas. | Despliegue/runtime-only. | Confundir con JDK. | `java -version` funciona, `javac` puede faltar. |
| JVM | Máquina virtual que carga, verifica y ejecuta bytecode (intérprete/JIT). | Ejecutar `.class` en plataforma host. | Al ejecutar Java; al diagnosticar rendimiento/memoria. | “Es portable” sin considerar versión de JVM. | `java HolaJVM` ejecuta. |
| Bytecode | Formato intermedio `.class` generado por `javac`. | Separar compilación de ejecución; portabilidad. | Inspección con `javap`, compatibilidad. | Tratarlo como código fuente. | `javap -c` muestra instrucciones. |
| WORA | “Write Once, Run Anywhere”: mismo bytecode en JVM compatible. | Portabilidad. | Código con APIs estándar y sin supuestos de plataforma. | Rutas, encoding, librerías nativas, versión JVM rompen portabilidad. | Ejecutar mismo `.class` en otra JVM compatible. |

**Contrato / invariantes / reglas.** `javac` genera bytecode; `java` recibe nombre de clase, no archivo `.class`. Un `.class` compilado para Java N puede fallar en JVM más vieja (`UnsupportedClassFileError`). WORA es condicional: depende de JVM compatible y comportamiento portable.

**Modelo mental.** `.java` es el guion, bytecode es la partitura intermedia, JVM es el músico que la interpreta en cada escenario.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa | Arreglo |
|---|---|---|
| `javac: command not found` | JDK ausente/PATH | Instalar JDK y configurar PATH |
| `UnsupportedClassFileError` | Versión bytecode > JVM | Alinear JDK/JVM o `--release` |
| Funciona local, falla en servidor | WORA asumido sin validar entorno | Verificar versión JVM, OS, encoding, paths |

#### Verificación rápida

- [ ] Existe `.class` tras compilar.
- [ ] `javap -c` muestra bytecode.
- [ ] `java` ejecuta por nombre de clase.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Implementación desde cero

```bash
mkdir -p /tmp/java-m0-t2 && cd /tmp/java-m0-t2
```

`HolaJVM.java`

```java
public class HolaJVM {
    public static void main(String[] args) {
        System.out.println("Hola desde la JVM");
        System.out.println("Java version: " + System.getProperty("java.version"));
        System.out.println("OS: " + System.getProperty("os.name"));
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `javac HolaJVM.java` | Compila a bytecode | Crea `.class` | No hay artefacto ejecutable por JVM |
| `java HolaJVM` | Inicia JVM y carga clase | Ejecuta `main` | Usar `HolaJVM.class` es error |
| `System.getProperty` | Lee propiedades del runtime | Muestra dependencia de entorno | WORA se malinterpreta como “entorno idéntico” |
| `javap -c` | Desensambla bytecode | Evidencia del formato intermedio | Pierdes visibilidad del artefacto |

#### Ejecución y salida real

```bash
javac HolaJVM.java
java HolaJVM
javap -c HolaJVM | head -5
```

Salida real observada (2026-05-22, JDK 27):

```text
Hola desde la JVM
Java version: 27.0.1.0.2
OS: Mac OS X
Compiled from "HolaJVM.java"
public class HolaJVM {
  public HolaJVM();
    Code:
         0: aload_0
```

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| `Could not find or load main class HolaJVM.class` | Pasaste archivo | Usa `java HolaJVM` |
| `UnsupportedClassFileError` | Compilaste con JDK nuevo y ejecutas JVM vieja | Alinea versiones |
| `javap` no encontrado | PATH/JDK incompleto | Revisa instalación JDK |

#### Verificación rápida

1. Confirma que `HolaJVM.class` existe.
2. Ejecuta `java HolaJVM`.
3. Ejecuta `javap -c HolaJVM | head`.

</details>

### Tema 3: Instalar JDK y verificar entorno · Básico · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

Vas a compilar tu primer programa, pero `javac` no aparece, o `java` y `javac` apuntan a versiones distintas. Antes de depurar código, necesitas demostrar que el entorno está correctamente instalado.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo no / riesgo | Verificación |
|---|---|---|---|---|---|
| Instalar JDK | Instalar binarios y bibliotecas del Java Development Kit en el sistema. | Tener compilador y runtime. | Antes de compilar/ejecutar localmente. | Instalar solo runtime y carecer de `javac`. | `javac -version` responde. |
| JDK/JRE/runtime | JDK incluye herramientas de desarrollo; JRE/runtime se orienta a ejecución. Distribuciones modernas suelen usar JDK completo. | Elegir paquete correcto. | Instalación, CI, despliegue. | Confundir “tengo Java” con “tengo JDK”. | Verificar ambos comandos. |
| `JAVA_HOME` | Variable de entorno que apunta a la raíz del JDK activo. | Maven/Gradle/IDEs localizan JDK. | Builds y múltiples JDKs. | Apuntar a bin o a JRE viejo. | `echo $JAVA_HOME` y contiene `bin/javac`. |
| `PATH` | Lista de directorios donde el shell busca ejecutables. | Invocar `java/javac` sin ruta absoluta. | Toda terminal. | PATH apunta a otro Java. | `which java`/`where.exe java`. |
| Verificar entorno | Confirmar versión, ruta y coherencia de herramientas. | Evitar falsos bugs. | Tras instalar/cambiar JDK. | Solo probar `java`. | `java -version`, `javac -version`, prueba de compilación. |

**Contrato / invariantes / reglas.** `java` y `javac` deben ser coherentes en versión mayor para evitar incompatibilidades. `JAVA_HOME` apunta a la raíz del JDK. Una terminal abierta puede no ver cambios recientes en variables de entorno.

**Modelo mental.** El JDK es la caja de herramientas; `PATH` es el atajo; `JAVA_HOME` es la dirección que otras herramientas usan para encontrar la caja.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa | Arreglo |
|---|---|---|
| `javac` no reconocido | JDK no instalado o PATH mal | Instalar JDK, ajustar PATH, abrir nueva terminal |
| `java` y `javac` versiones distintas | Múltiples instalaciones | Alinear `JAVA_HOME` y PATH |
| Maven/Gradle usa JDK equivocado | `JAVA_HOME` incorrecto | Apuntar a raíz del JDK correcto |

#### Verificación rápida

- [ ] `java -version` responde.
- [ ] `javac -version` responde.
- [ ] Prueba de compilación produce `JDK OK`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Implementación desde cero

Diagnóstico:

```bash
java -version
javac -version
```

macOS:

```bash
/usr/libexec/java_home
echo "$JAVA_HOME"
which java
which javac
```

Linux:

```bash
echo "$JAVA_HOME"
which java
which javac
readlink -f "$(which java)"
```

Windows PowerShell:

```powershell
echo $env:JAVA_HOME
where.exe java
where.exe javac
```

Prueba mínima `EntornoOk.java`:

```java
public class EntornoOk {
    public static void main(String[] args) {
        System.out.println("JDK OK");
        System.out.println(System.getProperty("java.version"));
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `java -version` | Verifica runtime | Confirma ejecución | Puedes tener `javac` pero runtime equivocado |
| `javac -version` | Verifica compilador | Confirma desarrollo | Sin él no compilas |
| `JAVA_HOME` | Ruta base JDK | La usan herramientas | Builds fallan o usan otro JDK |
| `EntornoOk` | Compila+ejecuta | Prueba ciclo real | Solo ver versiones no prueba compilación |

#### Ejecución y salida real

Salida real observada (2026-05-22):

```text
openjdk version "27.0.1.0.2" 2026-09-15
OpenJDK Runtime Environment Temurin-27.0.1.0.2+1 (build 27+13-7460)
OpenJDK 64-Bit Server VM Temurin-27.0.1.0.2+1 (build 27+13-7460, mixed mode, sharing)
javac 27.0.1.0.2
```

Prueba de compilación:

```bash
javac EntornoOk.java
java EntornoOk
```

```text
JDK OK
27.0.1.0.2
```

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| `javac` no reconocido | JDK no instalado/PATH | Instalar JDK, abrir terminal nueva |
| Versiones distintas | Múltiples JDKs | Alinear PATH/JAVA_HOME |
| `UnsupportedClassFileError` | Compilaste con JDK más nuevo | Alinear runtime o `--release` |

#### Verificación rápida

1. `javac -version` y `java -version` responden.
2. `javac EntornoOk.java && java EntornoOk` imprime `JDK OK`.

</details>

### Tema 4: Primer programa desde cero, sin IDE · Básico · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

Quieres un CLI que salude por nombre. Si falta el nombre, debe mostrar uso correcto. El caso cubre ciclo completo: archivo, clase, `main`, compilación, ejecución y argumentos.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo no / riesgo | Verificación |
|---|---|---|---|---|---|
| Primer programa | Unidad mínima `.java` compilable a `.class` con `main`. | Validar ciclo completo. | Inicio o entorno nuevo. | Saltar a framework sin entender base. | Compila y ejecuta. |
| Desde cero/sin IDE | Crear/compilar/ejecutar manualmente con editor + JDK. | Entender lo que automatiza el IDE. | Aprendizaje, CI, servidores. | No significa sin JDK. | `javac` y `java` en terminal. |
| `main` | `public static void main(String[] args)`. | Punto de entrada JVM. | Apps standalone. | Firma incorrecta. | `java SaludoArgs` ejecuta. |
| Argumentos CLI | `args` recibe parámetros de invocación. | Parametrizar sin recompilar. | CLIs/scripts. | Acceder `args[0]` sin validar. | Con y sin argumento produce salidas esperadas. |
| Validación de entrada | Comprobar precondiciones antes de usar datos. | Evitar excepciones y comportamiento ambiguo. | Toda entrada externa. | Confiar ciegamente en input. | Sin args imprime uso, no stacktrace. |

**Contrato / invariantes / reglas.** `args` puede estar vacío. Validar antes de indexar. `return` en `main` termina el programa. Nombre de clase pública = nombre de archivo.

**Modelo mental.** `main` es la puerta; `args` son notas que deja quien ejecuta el comando. Si no hay nota, el programa responde con instrucciones.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa | Arreglo |
|---|---|---|
| `ArrayIndexOutOfBoundsException` | `args[0]` sin validar | Revisar `args.length` |
| `Could not find or load main class` | Carpeta/nombre incorrecto | Ejecutar desde carpeta del `.class` |
| No cambia salida | No recompilaste | `javac` antes de `java` |

#### Verificación rápida

- [ ] Sin args: muestra uso.
- [ ] Con arg: muestra saludo.
- [ ] No lanza excepción por falta de args.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Implementación desde cero

```bash
mkdir -p /tmp/java-m0-t4 && cd /tmp/java-m0-t4
```

`SaludoArgs.java`

```java
public class SaludoArgs {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Uso: java SaludoArgs <nombre>");
            return;
        }
        String nombre = args[0];
        System.out.println("Hola, " + nombre);
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `args.length == 0` | Valida entrada | Evita acceso inválido | `args[0]` puede lanzar excepción |
| `return;` | Sale temprano | Corta flujo inválido | Seguiría ejecutando código que asume args |
| `args[0]` | Toma primer argumento | Parametriza ejecución | Ignorar args vuelve el programa rígido |
| `javac/java` manual | Compila y ejecuta | Hace visible el ciclo | IDE oculta el proceso |

#### Ejecución y salida real

```bash
javac SaludoArgs.java
java SaludoArgs
java SaludoArgs Ada
```

Salida real observada (2026-05-22):

```text
Uso: java SaludoArgs <nombre>
Hola, Ada
```

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| Excepción por índice | Sin validación | `if (args.length == 0)` |
| Clase no encontrada | Nombre/carpeta mal | Verificar `ls` y nombre de clase |
| Argumento con espacios | Shell separa tokens | Usar comillas: `"Ada Lovelace"` |

#### Verificación rápida

1. `java SaludoArgs` => uso.
2. `java SaludoArgs Ada` => `Hola, Ada`.
3. `java SaludoArgs "Ada Lovelace"` => observa `args[0]` (ejercicio: soportar todos los args).

</details>

### Tema 5: Tipos primitivos, variables y conversiones · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

Representas edad, población, precio, inicial y estado activo. Luego conviertes `double` a `int` y ves qué se pierde. Un error de tipo puede compilar y aun así producir un dato incorrecto.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo no / riesgo | Verificación |
|---|---|---|---|---|---|
| Primitivos | 8 tipos valor: `byte,short,int,long,float,double,char,boolean`. | Valores simples con semántica/tamaño definidos. | Contadores, flags, caracteres. | `float/double` para dinero; overflow. | Salida coincide con tipo esperado. |
| Variables | Nombre tipado con alcance y valor compatible. | Nombrar y reutilizar datos. | Siempre. | Nombres ambiguos, tipo inadecuado. | Compilador valida tipos. |
| Widening | Conversión implícita a tipo más amplio compatible. | Combinar tipos sin cast. | `int`->`long`->`double` en rangos seguros. | `int` grande a `float` puede perder precisión. | Asignación compila. |
| Narrowing/cast | Conversión explícita a tipo más estrecho. | Forzar adaptación consciente. | Cuando aceptas pérdida/regla. | Trunca decimales o desborda. | `19.99` -> `19`. |
| Overflow/literales | Enteros desbordan sin excepción; `L` para long literal. | Entender límites numéricos. | IDs, timestamps, acumuladores. | `2147483648` sin `L`. | `Math.addExact` lanza excepción. |

**Contrato / invariantes / reglas.** Java es tipado estático. Widening implícito; narrowing requiere cast. `int` 32-bit signed, `long` 64-bit signed, `double` IEEE 754 64-bit. Overflow de `int` no lanza excepción por defecto.

**Modelo mental.** Tipos son moldes. De molde chico a grande normalmente cabe; de grande a chico puede recortarse.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa | Arreglo |
|---|---|---|
| `integer number too large` | Literal int fuera de rango sin `L` | Usar `long` y `L` |
| `possible lossy conversion` | Narrowing sin cast | Cast explícito solo si aceptas pérdida |
| Resultado negativo raro | Overflow entero | `long` o `Math.*Exact` |

#### Verificación rápida

- [ ] `8000000000L` compila.
- [ ] Cast de `19.99` a `int` da `19`.
- [ ] `Math.addExact` detecta overflow.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Implementación desde cero

`TiposYConversiones.java`

```java
public class TiposYConversiones {
    public static void main(String[] args) {
        byte edad = 30;
        long poblacion = 8_000_000_000L;
        double precio = 19.99;
        char inicial = 'J';
        boolean activo = true;
        double desdeInt = edad;          // widening
        int precioEntero = (int) precio; // narrowing
        System.out.println(edad);
        System.out.println(poblacion);
        System.out.println(precio);
        System.out.println(inicial);
        System.out.println(activo);
        System.out.println(desdeInt);
        System.out.println(precioEntero);
    }
}
```

`Desbordamiento.java`

```java
public class Desbordamiento {
    public static void main(String[] args) {
        int maximo = Integer.MAX_VALUE;
        System.out.println(maximo);
        System.out.println(maximo + 1);
        try {
            System.out.println(Math.addExact(maximo, 1));
        } catch (ArithmeticException e) {
            System.out.println("overflow detectado");
        }
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `8_000_000_000L` | Literal long | Excede `int` | No compila sin `L` |
| `double desdeInt = edad` | Widening | Conversión segura | No necesita cast |
| `(int) precio` | Narrowing | Hace explícita la pérdida | Sin cast no compila |
| `Math.addExact` | Detecta overflow | Hace visible el error | Overflow silencioso da dato corrupto |

#### Ejecución y salida real

```bash
javac TiposYConversiones.java Desbordamiento.java
java TiposYConversiones
java Desbordamiento
```

Salida real observada (2026-05-22):

```text
30
8000000000
19.99
J
true
30.0
19
2147483647
-2147483648
overflow detectado
```

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| Overflow silencioso | Aritmética int normal | `Math.*Exact` o tipo mayor |
| Pérdida de decimales | Cast a int | Usar `Math.round`, `BigDecimal` o mantener `double` según caso |
| Dinero impreciso | IEEE 754 binario | `BigDecimal` para dinero real |

#### Verificación rápida

1. Observa `19.99` -> `19`.
2. Observa overflow a negativo y detección por `addExact`.
3. Cambia `long` por `int` en población: debe fallar compilación.

</details>

### Tema 6: String, entrada/salida y formato · Básico · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

Recibes nombre por consola, normalizas espacios, saludas con formato y comparas respuestas. Las trampas típicas: `==` en strings, `String` inmutable y mezcla de entrada por tokens/líneas.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo no / riesgo | Verificación |
|---|---|---|---|---|---|
| `String` | Objeto inmutable que representa secuencia UTF-16. | Texto. | Nombres, mensajes, IDs. | `==` para contenido; asumir mutación in-place. | `equals` true, `==` puede ser false. |
| Entrada (stdin) | Lectura de `System.in` vía `Scanner`/`BufferedReader`. | Recibir datos. | CLIs, ejercicios. | Mezclar `nextInt()` y `nextLine()`. | Entrada produce salida esperada. |
| Salida (stdout/stderr) | Escritura a `System.out/err`. | Mostrar resultado/errores. | CLIs, diagnóstico. | Usar stdout para logs sensibles. | Texto visible en consola. |
| Formato | Plantillas con `printf/format`, `%n`, concatenación controlada. | Salida legible y portable. | Reportes, CLIs. | Formato dependiente de locale sin intención. | `printf` produce formato esperado. |
| Comparación de texto | `equals`/`equalsIgnoreCase` comparan contenido. | Validar respuestas. | Comandos, flags. | `==` compara referencia. | `"java".equals(new String("java"))` |

**Contrato / invariantes / reglas.** `String` es inmutable; métodos devuelven nuevo objeto. `Scanner.nextLine()` consume línea; token methods consumen tokens. `%n` es salto de línea portable. Cerrar `Scanner` sobre `System.in` al final del programa.

**Modelo mental.** `String` es texto impreso: no lo editas, creas otra copia. `==` pregunta “¿es el mismo papel?”; `equals` pregunta “¿dice lo mismo?”.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa | Arreglo |
|---|---|---|
| Comparación falla con mismo texto | Usaste `==` | Usa `equals` |
| `NullPointerException` | `variable.equals(...)` con null | `"literal".equals(variable)` |
| Entrada saltada | Mezcla `nextInt`/`nextLine` | Normalizar estrategia de lectura |

#### Verificación rápida

- [ ] `equals` distingue contenido correctamente.
- [ ] `trim()` elimina espacios extremos.
- [ ] Comparación null-safe funciona.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Implementación desde cero

`TextoIO.java`

```java
import java.util.Scanner;

public class TextoIO {
    public static void main(String[] args) {
        String lenguaje = "Java";
        System.out.println("Lenguaje: " + lenguaje);
        System.out.println("Longitud: " + lenguaje.length());
        System.out.println("Mayúsculas: " + lenguaje.toUpperCase());
        System.out.printf("Formato: %-10s | v%d%n", lenguaje, 25);

        Scanner scanner = new Scanner(System.in);
        System.out.print("Escribe tu nombre: ");
        String nombre = scanner.nextLine().trim();
        if (nombre.isEmpty()) {
            System.out.println("Nombre vacío");
        } else {
            System.out.println("Hola, " + nombre);
        }
        scanner.close();
    }
}
```

`CompararStrings.java`

```java
public class CompararStrings {
    public static void main(String[] args) {
        String a = "java";
        String b = new String("java");
        System.out.println(a == b);          // referencia
        System.out.println(a.equals(b));     // contenido
        System.out.println("si".equalsIgnoreCase("SI"));
        String respuesta = null;
        System.out.println("si".equals(respuesta)); // null-safe
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `toUpperCase()` | Devuelve nuevo String | String inmutable | No modifica original |
| `trim()` | Limpia espacios extremos | Normaliza entrada | Nombre con espacios sobrantes |
| `printf` + `%n` | Formato portable | Controla presentación | Saltos de línea no portables |
| `equals` | Compara contenido | Correcto para texto | `==` da falsos negativos |
| `"si".equals(respuesta)` | Null-safe | Evita NPE | NPE si respuesta es null |

#### Ejecución y salida real

```bash
javac CompararStrings.java && java CompararStrings
```

Salida real observada (2026-05-22):

```text
false
true
true
false
```

`TextoIO` es interactivo; verifícalo con nombre vacío y con espacios.

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| `==` falla | Referencia distinta | `equals` |
| NPE en comparación | Llamaste equals sobre null | Literal primero |
| `nextLine()` vacío tras `nextInt()` | Quedó `\n` en buffer | Consumir línea o usar solo `nextLine()` |

#### Verificación rápida

1. Ejecuta `CompararStrings`: `false,true,true,false`.
2. Ejecuta `TextoIO` con `"  Ada  "`: debe saludar `Ada`.

</details>

### Tema 7: Operadores, expresiones y precedencia · Básico · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

Calculas total, promedio y permiso de acceso. Un paréntesis mal puesto o una división entera puede cambiar el resultado sin romper compilación.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo no / riesgo | Verificación |
|---|---|---|---|---|---|
| Operadores | Símbolos que aplican operaciones aritméticas, relacionales, lógicas, asignación. | Calcular y comparar. | Toda lógica. | Confundir `=` con `==`. | Salida numérica/booleana esperada. |
| Expresiones | Combinaciones evaluables que producen valor. | Componer cálculos/condiciones. | Asignaciones y condiciones. | Expresiones crípticas. | Extraer variables mejora claridad. |
| Precedencia | Orden de evaluación entre operadores. | Interpretar expresión. | Mezcla de operadores. | Asumir izquierda-derecha siempre. | Paréntesis cambian resultado. |
| Asociatividad | Desempate cuando misma precedencia. | Resolver empates. | `a-b-c`, asignaciones. | Malinterpretar. | Prueba con valores. |
| Cortocircuito | `&&`/`||` evalúan lado derecho solo si es necesario. | Evitar NPE/trabajo innecesario. | Guardas null-safe. | Efectos secundarios en lado derecho. | `null != x && x.length()` seguro. |

**Contrato / invariantes / reglas.** División entre enteros trunca hacia cero. División entera por cero lanza `ArithmeticException`. `==` compara valor en primitivos, referencia en objetos. Ante duda, usa paréntesis.

**Modelo mental.** La precedencia es la gramática de la expresión; los paréntesis hacen explícita la intención.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa | Arreglo |
|---|---|---|
| `4` en vez de `4.5` | División entera | Usar `2.0` o cast |
| NPE en condición | Evaluaste lado derecho sin guarda | `obj != null && ...` |
| Condición incorrecta | Precedencia mal asumida | Paréntesis y variables booleanas |

#### Verificación rápida

- [ ] `(5+4)/2.0` da `4.5`.
- [ ] `5+4/2.0` da `7.0` (demuestra precedencia).
- [ ] Guarda null-safe no lanza NPE.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Implementación desde cero

`Operadores.java`

```java
public class Operadores {
    public static void main(String[] args) {
        int a = 10;
        int b = 3;
        System.out.println(a + b);
        System.out.println(a - b);
        System.out.println(a * b);
        System.out.println(a / b); // división entera
        System.out.println(a % b);

        double promedio = (5 + 4) / 2.0;
        System.out.println(promedio);

        int edad = 20;
        boolean tienePermiso = true;
        boolean puedeEntrar = (edad >= 18) && tienePermiso;
        System.out.println(puedeEntrar);

        String nombre = null;
        boolean seguro = nombre != null && nombre.length() > 0;
        System.out.println(seguro);
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `a / b` enteros | Trunca | Regla de Java para enteros | Esperar decimal da bug |
| `(5+4)/2.0` | Fuerza división real | Paréntesis + double | Sin paréntesis cambia resultado |
| `&&` cortocircuito | Evalúa derecho solo si necesario | Evita NPE | Invertir guarda causa NPE |
| `edad >= 18` | Relacional booleana | Condición clara | `=` sería asignación/no compila aquí |

#### Ejecución y salida real

Salida real observada (2026-05-22):

```text
13
7
30
3
1
4.5
true
false
```

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| Resultado entero inesperado | División entera | Usar `double` |
| NPE | Sin cortocircuito | Guarda `!= null` primero |
| Condición difícil de leer | Expresión grande | Extraer booleanos con nombre |

#### Verificación rápida

1. Cambia `2.0` a `2`: observa `4`.
2. Quita `nombre != null &&`: observa NPE.
3. Agrega paréntesis para dejar intención explícita.

</details>

### Tema 8: Control de flujo: decisiones y repeticiones · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

Validas edad, traduces un número de día y cuentas hacia atrás. El programa debe elegir rutas y repetir acciones sin bucles infinitos ni casos sin cubrir.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo no / riesgo | Verificación |
|---|---|---|---|---|---|
| Control de flujo | Sentencias que alteran secuencia: selección, iteración, salto. | Implementar lógica real. | Reglas, menús, procesamiento. | Flujo spaghetti. | Casos de prueba por rama. |
| Decisiones (`if/switch`) | Selección por condición booleana o casos discretos. | Validar/clasificar. | Reglas de negocio. | `switch` sin default; condiciones incompletas. | Entrada inesperada cubierta. |
| Repeticiones (`for/while/do-while`) | Ejecutan bloque mientras condición/iteración lo indique. | Recorrer, acumular, reintentar. | Rangos, colecciones. | Bucle infinito, off-by-one. | Borde 0,1,N. |
| `break/continue` | Salida anticipada o salto a siguiente iteración. | Control fino. | Buscar/saltar inválidos. | Uso excesivo oculta lógica. | Test de caso saltado. |
| Condición booleana | Expresión `true/false`. | Dirigir flujo. | `if/while/for`. | Java no acepta enteros como booleanos. | Compila solo con boolean. |

**Contrato / invariantes / reglas.** Condiciones deben ser booleanas. `switch` con `->` evita fall-through accidental; `default` cubre casos no previstos. Todo bucle necesita progreso o salida explícita. `do/while` ejecuta al menos una vez.

**Modelo mental.** Decisiones son bifurcaciones; bucles son rotondas. Toda rotonda necesita señal de salida.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa | Arreglo |
|---|---|---|
| Bucle infinito | Sin progreso | `i++`, `n--`, condición revisada |
| Caso no manejado | Falta `default` | Agregar default/validación |
| Off-by-one | `<` vs `<=` | Probar bordes |
| Fall-through inesperado | `switch` clásico sin `break` | Usar `->` o `break` |

#### Verificación rápida

- [ ] `edad 16` y `20` producen ramas distintas.
- [ ] `dia 9` cae en default.
- [ ] Bucle termina.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Implementación desde cero

`Flujo.java`

```java
public class Flujo {
    public static void main(String[] args) {
        int edad = 20;
        if (edad >= 18) {
            System.out.println("Mayor de edad");
        } else {
            System.out.println("Menor de edad");
        }

        int dia = 3;
        String nombreDia = switch (dia) {
            case 1 -> "Lunes";
            case 2 -> "Martes";
            case 3 -> "Miércoles";
            default -> "Día no válido";
        };
        System.out.println(nombreDia);

        for (int i = 1; i <= 3; i++) {
            if (i == 2) continue;
            System.out.println("for:" + i);
        }

        int n = 3;
        while (n > 0) {
            System.out.println("while:" + n);
            n--;
        }

        int intentos = 0;
        do {
            intentos++;
        } while (intentos < 1);
        System.out.println("intentos:" + intentos);
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `if/else` | Elige rama | Regla binaria | Casos sin cubrir |
| `switch ->` | Mapea caso discreto | Legible y sin fall-through | `default` faltante da comportamiento pobre |
| `continue` | Salta iteración | Omite caso puntual | Procesaría el 2 |
| `n--` | Progreso | Garantiza terminación | Bucle infinito |
| `do/while` | Ejecuta al menos una vez | Útil en intentos/menús | `while` puede no ejecutar |

#### Ejecución y salida real

Salida real observada (2026-05-22):

```text
Mayor de edad
Miércoles
for:1
for:3
while:3
while:2
while:1
intentos:1
```

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| Nunca termina | Condición siempre true | Asegura progreso |
| Resultado inesperado en switch clásico | Fall-through | Usar `->` o `break` |
| Off-by-one | Límite incorrecto | Probar 0,1,N |

#### Verificación rápida

1. Cambia `edad` a 16 => `Menor de edad`.
2. Cambia `dia` a 9 => `Día no válido`.
3. Cambia `n--` por `n++` mentalmente: identifica bucle infinito.

</details>

### Tema 9: Arreglos y métodos básicos · Básico · 50 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Caso guía

Tienes varias notas y quieres imprimirlas y calcular el promedio. Necesitas una estructura de tamaño fijo para varios valores y un método reutilizable para el cálculo.

#### Fundamento técnico y modelo mental

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Cuándo no / riesgo | Verificación |
|---|---|---|---|---|---|
| Arreglo | Objeto de tamaño fijo, elementos homogéneos, índice 0-based, campo `length`. | Colección fija. | Tamaño conocido. | Acceso fuera de rango; tamaño dinámico. | `length` y recorrido correcto. |
| Índice/`length` | Índices válidos `0..length-1`. | Acceso seguro. | Bucles y bordes. | Off-by-one. | No lanza `AIOOBE`. |
| Método | Bloque nombrado con parámetros y retorno. | Reutilizar y nombrar intención. | Cálculo, validación. | Métodos largos sin responsabilidad clara. | Test unitario/manual. |
| Parámetros/retorno | Java pasa argumentos por valor; para arreglos se copia la referencia. | Contrato de entrada/salida. | APIs pequeñas. | Mutar arreglo sin documentar. | Salida esperada. |
| Recorrido `for/for-each` | `for` con índice; `for-each` sobre elementos. | Procesar elementos. | Suma, búsqueda, impresión. | `for-each` cuando necesitas índice. | Imprime todos los elementos. |

**Contrato / invariantes / reglas.** Tamaño fijo tras creación. Acceso fuera de rango lanza `ArrayIndexOutOfBoundsException`. `for-each` no expone índice. Método que recibe arreglo puede mutar su contenido.

**Modelo mental.** Arreglo = casilleros numerados desde 0. Método = máquina con entrada, proceso y salida.

#### ► LO QUE PUEDE SALIR MAL

| Síntoma | Causa | Arreglo |
|---|---|---|
| `ArrayIndexOutOfBoundsException` | Índice inválido | `i < length` |
| Promedio entero | División entera | Cast a `double` |
| `NullPointerException` | Arreglo null | Validar entrada |

#### Verificación rápida

- [ ] Imprime 4 notas.
- [ ] Promedio 8.5.
- [ ] `length` es 4.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Implementación desde cero

`Notas.java`

```java
public class Notas {
    static double promedio(int[] valores) {
        if (valores.length == 0) {
            return 0.0;
        }
        int suma = 0;
        for (int i = 0; i < valores.length; i++) {
            suma += valores[i];
        }
        return (double) suma / valores.length;
    }

    static void imprimir(int[] valores) {
        for (int nota : valores) {
            System.out.println("Nota: " + nota);
        }
    }

    public static void main(String[] args) {
        int[] notas = {10, 8, 9, 7};
        imprimir(notas);
        System.out.println("Promedio: " + promedio(notas));
        System.out.println("Cantidad: " + notas.length);
    }
}
```

#### Desglose del código

| Bloque | Qué hace | Por qué | Si lo omites/cambias |
|---|---|---|---|
| `int[] notas = {...}` | Crea arreglo tamaño 4 | Contiene datos | Sin arreglo no hay colección |
| `i < valores.length` | Límite seguro | Evita AIOOBE | `<=` causa excepción |
| `(double) suma / valores.length` | División real | Promedio correcto | Entero trunca |
| `for-each` en imprimir | Lee elementos | Simple y claro | `for` con índice también sirve |
| Método `promedio` | Reutiliza lógica | Separa cálculo de salida | Mezclar todo dificulta pruebas |

#### Ejecución y salida real

Salida real observada (2026-05-22):

```text
Nota: 10
Nota: 8
Nota: 9
Nota: 7
Promedio: 8.5
Cantidad: 4
```

#### Errores comunes y troubleshooting

| Síntoma | Causa | Corrección |
|---|---|---|
| `ArrayIndexOutOfBoundsException` | Límite mal | `i < length` |
| Promedio incorrecto | División entera | Cast a double |
| `NullPointerException` | Arreglo null | Validar precondición |

#### Verificación rápida

1. Cambia notas a `{10,10,9}` => promedio `9.666...`.
2. Cambia a `{}` => `0.0`.
3. Confirma que no hay acceso fuera de rango.

</details>

## Cierre del módulo

Pasaste por el ciclo completo de fundamentos: entorno JDK, compilación/ejecución, bytecode/JVM, tipos, texto, operadores, control de flujo, arreglos y métodos. En el siguiente módulo ese código se organiza en clases, objetos, encapsulación y contratos.

**Checklist de calidad del módulo (aplicada)**
- [x] 9 temas con Caso guía, Fundamento técnico/modelo mental, cobertura por concepto, Implementación desde cero, Desglose, Ejecución/salida real, Errores comunes, Verificación rápida.
- [x] Ejemplos Java ejecutados en `/tmp` con JDK 27 (2026-05-22): PrecioFinal, HolaJVM/javap, EntornoOk, SaludoArgs, TiposYConversiones/Desbordamiento, CompararStrings, Operadores, Flujo, Notas.
- [x] No se asumió proyecto previo; cada tema incluye comandos y contexto.
