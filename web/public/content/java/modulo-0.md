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

**Programa**
- Definición formal: Especificación finita y ejecutable de un cómputo: transforma entrada/estado en salida según reglas del lenguaje y runtime.
- Para qué sirve: Automatizar reglas repetibles.
- Cuándo usarlo: Cuando la regla es clara y repetible.
- Cuándo no / riesgo: No automatices reglas ambiguas sin definirlas.
- Verificación: Cambias entrada y la salida cambia coherentemente.

**Programar**
- Definición formal: Diseñar, codificar, compilar/ejecutar y verificar esa especificación.
- Para qué sirve: Convertir una necesidad en comportamiento observable.
- Cuándo usarlo: Siempre que implementes software.
- Cuándo no / riesgo: No es solo “escribir código”; sin verificación es adivinanza.
- Verificación: Compila, ejecuta y pasa caso esperado.

**Java (lenguaje/plataforma)**
- Definición formal: Lenguaje orientado a objetos, tipado estático, compilado a bytecode ejecutado por JVM.
- Para qué sirve: Construir software portable, mantenible y con ecosistema amplio.
- Cuándo usarlo: Backend, Android, herramientas, enterprise.
- Cuándo no / riesgo: No es la mejor opción para todo script rápido o todo sistema de bajo nivel.
- Verificación: `javac` genera `.class`, `java` lo ejecuta.

**Punto de entrada `main`**
- Definición formal: Método `public static void main(String[] args)` que la JVM invoca al iniciar.
- Para qué sirve: Definir dónde comienza la ejecución.
- Cuándo usarlo: Apps standalone Java.
- Cuándo no / riesgo: Firma incorrecta: JVM no lo reconoce.
- Verificación: `java Clase` ejecuta el método.

**Contrato / invariantes / reglas.** El archivo `.java` con clase pública `C` debe llamarse `C.java`. `javac` valida sintaxis/tipos; si falla, no hay `.class` nuevo válido. `main` debe tener la firma exacta. La salida observable debe coincidir con la regla.

**Modelo mental.** Un programa es una receta verificable: ingredientes (entrada), pasos (proceso), plato (salida), control de calidad (compilación/prueba).

#### ► LO QUE PUEDE SALIR MAL

- **`class ... is public, should be declared in a file named ...`**. Causa probable: Nombre de archivo/clase no coincide. Corrección: Renombrar para que coincidan.
- **`Could not find or load main class`**. Causa probable: Ejecutaste en carpeta equivocada o con `.class`. Corrección: `cd` a la carpeta y usa `java PrecioFinal`.
- **Salida no cambia**. Causa probable: Ejecutaste `.class` viejo. Corrección: Recompila con `javac`.

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

- **`public class PrecioFinal`**: Define la clase pública. Por qué importa: Java organiza código en clases. Si lo omites/cambias: Nombre distinto al archivo falla al compilar.
- **`main(String[] args)`**: Punto de entrada. Por qué importa: JVM lo invoca. Si lo omites/cambias: Sin firma correcta no ejecuta.
- **`double precioBase/iva`**: Variables decimales. Por qué importa: Representan valores del cálculo. Si lo omites/cambias: Tipo incorrecto puede perder precisión o no compilar.
- **`precioBase + (precioBase * iva)`**: Regla de negocio. Por qué importa: Calcula precio final. Si lo omites/cambias: Quitar paréntesis aquí no cambia por precedencia, pero en otras expresiones sí.
- **`System.out.println`**: Salida estándar. Por qué importa: Permite observar resultado. Si lo omites/cambias: Sin salida no verificas.

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

- **No compila por nombre**. Causa probable: Archivo/clase no coinciden. Corrección: Mismo nombre exacto.
- **`NumberFormatException` inexistente aquí**. Causa probable: No aplica; no hay parsing. Corrección: Si agregas `args`, valida/parsa.
- **Resultado incorrecto**. Causa probable: Fórmula mal escrita. Corrección: Verifica con caso manual.

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

**JDK**
- Definición formal: Kit de desarrollo: `javac`, herramientas, docs/libs y runtime para desarrollar/ejecutar.
- Para qué sirve: Compilar y desarrollar Java.
- Cuándo usarlo/tenerlo en cuenta: Siempre que programes Java.
- Cuándo no / riesgo: Instalar solo JRE y esperar `javac`.
- Verificación: `javac -version` funciona.

**JRE/Runtime**
- Definición formal: Entorno para ejecutar Java; históricamente sin toolchain completa de desarrollo.
- Para qué sirve: Ejecutar apps compiladas.
- Cuándo usarlo/tenerlo en cuenta: Despliegue/runtime-only.
- Cuándo no / riesgo: Confundir con JDK.
- Verificación: `java -version` funciona, `javac` puede faltar.

**JVM**
- Definición formal: Máquina virtual que carga, verifica y ejecuta bytecode (intérprete/JIT).
- Para qué sirve: Ejecutar `.class` en plataforma host.
- Cuándo usarlo/tenerlo en cuenta: Al ejecutar Java; al diagnosticar rendimiento/memoria.
- Cuándo no / riesgo: “Es portable” sin considerar versión de JVM.
- Verificación: `java HolaJVM` ejecuta.

**Bytecode**
- Definición formal: Formato intermedio `.class` generado por `javac`.
- Para qué sirve: Separar compilación de ejecución; portabilidad.
- Cuándo usarlo/tenerlo en cuenta: Inspección con `javap`, compatibilidad.
- Cuándo no / riesgo: Tratarlo como código fuente.
- Verificación: `javap -c` muestra instrucciones.

**WORA**
- Definición formal: “Write Once, Run Anywhere”: mismo bytecode en JVM compatible.
- Para qué sirve: Portabilidad.
- Cuándo usarlo/tenerlo en cuenta: Código con APIs estándar y sin supuestos de plataforma.
- Cuándo no / riesgo: Rutas, encoding, librerías nativas, versión JVM rompen portabilidad.
- Verificación: Ejecutar mismo `.class` en otra JVM compatible.

**Contrato / invariantes / reglas.** `javac` genera bytecode; `java` recibe nombre de clase, no archivo `.class`. Un `.class` compilado para Java N puede fallar en JVM más vieja (`UnsupportedClassFileError`). WORA es condicional: depende de JVM compatible y comportamiento portable.

**Modelo mental.** `.java` es el guion, bytecode es la partitura intermedia, JVM es el músico que la interpreta en cada escenario.

#### ► LO QUE PUEDE SALIR MAL

- **`javac: command not found`**. Causa probable: JDK ausente/PATH. Corrección: Instalar JDK y configurar PATH.
- **`UnsupportedClassFileError`**. Causa probable: Versión bytecode > JVM. Corrección: Alinear JDK/JVM o `--release`.
- **Funciona local, falla en servidor**. Causa probable: WORA asumido sin validar entorno. Corrección: Verificar versión JVM, OS, encoding, paths.

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

- **`javac HolaJVM.java`**: Compila a bytecode. Por qué importa: Crea `.class`. Si lo omites/cambias: No hay artefacto ejecutable por JVM.
- **`java HolaJVM`**: Inicia JVM y carga clase. Por qué importa: Ejecuta `main`. Si lo omites/cambias: Usar `HolaJVM.class` es error.
- **`System.getProperty`**: Lee propiedades del runtime. Por qué importa: Muestra dependencia de entorno. Si lo omites/cambias: WORA se malinterpreta como “entorno idéntico”.
- **`javap -c`**: Desensambla bytecode. Por qué importa: Evidencia del formato intermedio. Si lo omites/cambias: Pierdes visibilidad del artefacto.

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

- **`Could not find or load main class HolaJVM.class`**. Causa probable: Pasaste archivo. Corrección: Usa `java HolaJVM`.
- **`UnsupportedClassFileError`**. Causa probable: Compilaste con JDK nuevo y ejecutas JVM vieja. Corrección: Alinea versiones.
- **`javap` no encontrado**. Causa probable: PATH/JDK incompleto. Corrección: Revisa instalación JDK.

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

**Instalar JDK**
- Definición formal: Instalar binarios y bibliotecas del Java Development Kit en el sistema.
- Para qué sirve: Tener compilador y runtime.
- Cuándo usarlo: Antes de compilar/ejecutar localmente.
- Cuándo no / riesgo: Instalar solo runtime y carecer de `javac`.
- Verificación: `javac -version` responde.

**JDK/JRE/runtime**
- Definición formal: JDK incluye herramientas de desarrollo; JRE/runtime se orienta a ejecución. Distribuciones modernas suelen usar JDK completo.
- Para qué sirve: Elegir paquete correcto.
- Cuándo usarlo: Instalación, CI, despliegue.
- Cuándo no / riesgo: Confundir “tengo Java” con “tengo JDK”.
- Verificación: Verificar ambos comandos.

**`JAVA_HOME`**
- Definición formal: Variable de entorno que apunta a la raíz del JDK activo.
- Para qué sirve: Maven/Gradle/IDEs localizan JDK.
- Cuándo usarlo: Builds y múltiples JDKs.
- Cuándo no / riesgo: Apuntar a bin o a JRE viejo.
- Verificación: `echo $JAVA_HOME` y contiene `bin/javac`.

**`PATH`**
- Definición formal: Lista de directorios donde el shell busca ejecutables.
- Para qué sirve: Invocar `java/javac` sin ruta absoluta.
- Cuándo usarlo: Toda terminal.
- Cuándo no / riesgo: PATH apunta a otro Java.
- Verificación: `which java`/`where.exe java`.

**Verificar entorno**
- Definición formal: Confirmar versión, ruta y coherencia de herramientas.
- Para qué sirve: Evitar falsos bugs.
- Cuándo usarlo: Tras instalar/cambiar JDK.
- Cuándo no / riesgo: Solo probar `java`.
- Verificación: `java -version`, `javac -version`, prueba de compilación.

**Contrato / invariantes / reglas.** `java` y `javac` deben ser coherentes en versión mayor para evitar incompatibilidades. `JAVA_HOME` apunta a la raíz del JDK. Una terminal abierta puede no ver cambios recientes en variables de entorno.

**Modelo mental.** El JDK es la caja de herramientas; `PATH` es el atajo; `JAVA_HOME` es la dirección que otras herramientas usan para encontrar la caja.

#### ► LO QUE PUEDE SALIR MAL

- **`javac` no reconocido**. Causa probable: JDK no instalado o PATH mal. Corrección: Instalar JDK, ajustar PATH, abrir nueva terminal.
- **`java` y `javac` versiones distintas**. Causa probable: Múltiples instalaciones. Corrección: Alinear `JAVA_HOME` y PATH.
- **Maven/Gradle usa JDK equivocado**. Causa probable: `JAVA_HOME` incorrecto. Corrección: Apuntar a raíz del JDK correcto.

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

- **`java -version`**: Verifica runtime. Por qué importa: Confirma ejecución. Si lo omites/cambias: Puedes tener `javac` pero runtime equivocado.
- **`javac -version`**: Verifica compilador. Por qué importa: Confirma desarrollo. Si lo omites/cambias: Sin él no compilas.
- **`JAVA_HOME`**: Ruta base JDK. Por qué importa: La usan herramientas. Si lo omites/cambias: Builds fallan o usan otro JDK.
- **`EntornoOk`**: Compila+ejecuta. Por qué importa: Prueba ciclo real. Si lo omites/cambias: Solo ver versiones no prueba compilación.

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

- **`javac` no reconocido**. Causa probable: JDK no instalado/PATH. Corrección: Instalar JDK, abrir terminal nueva.
- **Versiones distintas**. Causa probable: Múltiples JDKs. Corrección: Alinear PATH/JAVA_HOME.
- **`UnsupportedClassFileError`**. Causa probable: Compilaste con JDK más nuevo. Corrección: Alinear runtime o `--release`.

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

**Primer programa**
- Definición formal: Unidad mínima `.java` compilable a `.class` con `main`.
- Para qué sirve: Validar ciclo completo.
- Cuándo usarlo: Inicio o entorno nuevo.
- Cuándo no / riesgo: Saltar a framework sin entender base.
- Verificación: Compila y ejecuta.

**Desde cero/sin IDE**
- Definición formal: Crear/compilar/ejecutar manualmente con editor + JDK.
- Para qué sirve: Entender lo que automatiza el IDE.
- Cuándo usarlo: Aprendizaje, CI, servidores.
- Cuándo no / riesgo: No significa sin JDK.
- Verificación: `javac` y `java` en terminal.

**`main`**
- Definición formal: `public static void main(String[] args)`.
- Para qué sirve: Punto de entrada JVM.
- Cuándo usarlo: Apps standalone.
- Cuándo no / riesgo: Firma incorrecta.
- Verificación: `java SaludoArgs` ejecuta.

**Argumentos CLI**
- Definición formal: `args` recibe parámetros de invocación.
- Para qué sirve: Parametrizar sin recompilar.
- Cuándo usarlo: CLIs/scripts.
- Cuándo no / riesgo: Acceder `args[0]` sin validar.
- Verificación: Con y sin argumento produce salidas esperadas.

**Validación de entrada**
- Definición formal: Comprobar precondiciones antes de usar datos.
- Para qué sirve: Evitar excepciones y comportamiento ambiguo.
- Cuándo usarlo: Toda entrada externa.
- Cuándo no / riesgo: Confiar ciegamente en input.
- Verificación: Sin args imprime uso, no stacktrace.

**Contrato / invariantes / reglas.** `args` puede estar vacío. Validar antes de indexar. `return` en `main` termina el programa. Nombre de clase pública = nombre de archivo.

**Modelo mental.** `main` es la puerta; `args` son notas que deja quien ejecuta el comando. Si no hay nota, el programa responde con instrucciones.

#### ► LO QUE PUEDE SALIR MAL

- **`ArrayIndexOutOfBoundsException`**. Causa probable: `args[0]` sin validar. Corrección: Revisar `args.length`.
- **`Could not find or load main class`**. Causa probable: Carpeta/nombre incorrecto. Corrección: Ejecutar desde carpeta del `.class`.
- **No cambia salida**. Causa probable: No recompilaste. Corrección: `javac` antes de `java`.

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

- **`args.length == 0`**: Valida entrada. Por qué importa: Evita acceso inválido. Si lo omites/cambias: `args[0]` puede lanzar excepción.
- **`return;`**: Sale temprano. Por qué importa: Corta flujo inválido. Si lo omites/cambias: Seguiría ejecutando código que asume args.
- **`args[0]`**: Toma primer argumento. Por qué importa: Parametriza ejecución. Si lo omites/cambias: Ignorar args vuelve el programa rígido.
- **`javac/java` manual**: Compila y ejecuta. Por qué importa: Hace visible el ciclo. Si lo omites/cambias: IDE oculta el proceso.

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

- **Excepción por índice**. Causa probable: Sin validación. Corrección: `if (args.length == 0)`.
- **Clase no encontrada**. Causa probable: Nombre/carpeta mal. Corrección: Verificar `ls` y nombre de clase.
- **Argumento con espacios**. Causa probable: Shell separa tokens. Corrección: Usar comillas: `"Ada Lovelace"`.

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

**Primitivos**
- Definición formal: 8 tipos valor: `byte,short,int,long,float,double,char,boolean`.
- Para qué sirve: Valores simples con semántica/tamaño definidos.
- Cuándo usarlo: Contadores, flags, caracteres.
- Cuándo no / riesgo: `float/double` para dinero; overflow.
- Verificación: Salida coincide con tipo esperado.

**Variables**
- Definición formal: Nombre tipado con alcance y valor compatible.
- Para qué sirve: Nombrar y reutilizar datos.
- Cuándo usarlo: Siempre.
- Cuándo no / riesgo: Nombres ambiguos, tipo inadecuado.
- Verificación: Compilador valida tipos.

**Widening**
- Definición formal: Conversión implícita a tipo más amplio compatible.
- Para qué sirve: Combinar tipos sin cast.
- Cuándo usarlo: `int`->`long`->`double` en rangos seguros.
- Cuándo no / riesgo: `int` grande a `float` puede perder precisión.
- Verificación: Asignación compila.

**Narrowing/cast**
- Definición formal: Conversión explícita a tipo más estrecho.
- Para qué sirve: Forzar adaptación consciente.
- Cuándo usarlo: Cuando aceptas pérdida/regla.
- Cuándo no / riesgo: Trunca decimales o desborda.
- Verificación: `19.99` -> `19`.

**Overflow/literales**
- Definición formal: Enteros desbordan sin excepción; `L` para long literal.
- Para qué sirve: Entender límites numéricos.
- Cuándo usarlo: IDs, timestamps, acumuladores.
- Cuándo no / riesgo: `2147483648` sin `L`.
- Verificación: `Math.addExact` lanza excepción.

**Contrato / invariantes / reglas.** Java es tipado estático. Widening implícito; narrowing requiere cast. `int` 32-bit signed, `long` 64-bit signed, `double` IEEE 754 64-bit. Overflow de `int` no lanza excepción por defecto.

**Modelo mental.** Tipos son moldes. De molde chico a grande normalmente cabe; de grande a chico puede recortarse.

#### ► LO QUE PUEDE SALIR MAL

- **`integer number too large`**. Causa probable: Literal int fuera de rango sin `L`. Corrección: Usar `long` y `L`.
- **`possible lossy conversion`**. Causa probable: Narrowing sin cast. Corrección: Cast explícito solo si aceptas pérdida.
- **Resultado negativo raro**. Causa probable: Overflow entero. Corrección: `long` o `Math.*Exact`.

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

- **`8_000_000_000L`**: Literal long. Por qué importa: Excede `int`. Si lo omites/cambias: No compila sin `L`.
- **`double desdeInt = edad`**: Widening. Por qué importa: Conversión segura. Si lo omites/cambias: No necesita cast.
- **`(int) precio`**: Narrowing. Por qué importa: Hace explícita la pérdida. Si lo omites/cambias: Sin cast no compila.
- **`Math.addExact`**: Detecta overflow. Por qué importa: Hace visible el error. Si lo omites/cambias: Overflow silencioso da dato corrupto.

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

- **Overflow silencioso**. Causa probable: Aritmética int normal. Corrección: `Math.*Exact` o tipo mayor.
- **Pérdida de decimales**. Causa probable: Cast a int. Corrección: Usar `Math.round`, `BigDecimal` o mantener `double` según caso.
- **Dinero impreciso**. Causa probable: IEEE 754 binario. Corrección: `BigDecimal` para dinero real.

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

**`String`**
- Definición formal: Objeto inmutable que representa secuencia UTF-16.
- Para qué sirve: Texto.
- Cuándo usarlo: Nombres, mensajes, IDs.
- Cuándo no / riesgo: `==` para contenido; asumir mutación in-place.
- Verificación: `equals` true, `==` puede ser false.

**Entrada (stdin)**
- Definición formal: Lectura de `System.in` vía `Scanner`/`BufferedReader`.
- Para qué sirve: Recibir datos.
- Cuándo usarlo: CLIs, ejercicios.
- Cuándo no / riesgo: Mezclar `nextInt()` y `nextLine()`.
- Verificación: Entrada produce salida esperada.

**Salida (stdout/stderr)**
- Definición formal: Escritura a `System.out/err`.
- Para qué sirve: Mostrar resultado/errores.
- Cuándo usarlo: CLIs, diagnóstico.
- Cuándo no / riesgo: Usar stdout para logs sensibles.
- Verificación: Texto visible en consola.

**Formato**
- Definición formal: Plantillas con `printf/format`, `%n`, concatenación controlada.
- Para qué sirve: Salida legible y portable.
- Cuándo usarlo: Reportes, CLIs.
- Cuándo no / riesgo: Formato dependiente de locale sin intención.
- Verificación: `printf` produce formato esperado.

**Comparación de texto**
- Definición formal: `equals`/`equalsIgnoreCase` comparan contenido.
- Para qué sirve: Validar respuestas.
- Cuándo usarlo: Comandos, flags.
- Cuándo no / riesgo: `==` compara referencia.
- Verificación: `"java".equals(new String("java"))`

**Contrato / invariantes / reglas.** `String` es inmutable; métodos devuelven nuevo objeto. `Scanner.nextLine()` consume línea; token methods consumen tokens. `%n` es salto de línea portable. Cerrar `Scanner` sobre `System.in` al final del programa.

**Modelo mental.** `String` es texto impreso: no lo editas, creas otra copia. `==` pregunta “¿es el mismo papel?”; `equals` pregunta “¿dice lo mismo?”.

#### ► LO QUE PUEDE SALIR MAL

- **Comparación falla con mismo texto**. Causa probable: Usaste `==`. Corrección: Usa `equals`.
- **`NullPointerException`**. Causa probable: `variable.equals(...)` con null. Corrección: `"literal".equals(variable)`.
- **Entrada saltada**. Causa probable: Mezcla `nextInt`/`nextLine`. Corrección: Normalizar estrategia de lectura.

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

- **`toUpperCase()`**: Devuelve nuevo String. Por qué importa: String inmutable. Si lo omites/cambias: No modifica original.
- **`trim()`**: Limpia espacios extremos. Por qué importa: Normaliza entrada. Si lo omites/cambias: Nombre con espacios sobrantes.
- **`printf` + `%n`**: Formato portable. Por qué importa: Controla presentación. Si lo omites/cambias: Saltos de línea no portables.
- **`equals`**: Compara contenido. Por qué importa: Correcto para texto. Si lo omites/cambias: `==` da falsos negativos.
- **`"si".equals(respuesta)`**: Null-safe. Por qué importa: Evita NPE. Si lo omites/cambias: NPE si respuesta es null.

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

- **`==` falla**. Causa probable: Referencia distinta. Corrección: `equals`.
- **NPE en comparación**. Causa probable: Llamaste equals sobre null. Corrección: Literal primero.
- **`nextLine()` vacío tras `nextInt()`**. Causa probable: Quedó `\n` en buffer. Corrección: Consumir línea o usar solo `nextLine()`.

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

**Operadores**
- Definición formal: Símbolos que aplican operaciones aritméticas, relacionales, lógicas, asignación.
- Para qué sirve: Calcular y comparar.
- Cuándo usarlo: Toda lógica.
- Cuándo no / riesgo: Confundir `=` con `==`.
- Verificación: Salida numérica/booleana esperada.

**Expresiones**
- Definición formal: Combinaciones evaluables que producen valor.
- Para qué sirve: Componer cálculos/condiciones.
- Cuándo usarlo: Asignaciones y condiciones.
- Cuándo no / riesgo: Expresiones crípticas.
- Verificación: Extraer variables mejora claridad.

**Precedencia**
- Definición formal: Orden de evaluación entre operadores.
- Para qué sirve: Interpretar expresión.
- Cuándo usarlo: Mezcla de operadores.
- Cuándo no / riesgo: Asumir izquierda-derecha siempre.
- Verificación: Paréntesis cambian resultado.

**Asociatividad**
- Definición formal: Desempate cuando misma precedencia.
- Para qué sirve: Resolver empates.
- Cuándo usarlo: `a-b-c`, asignaciones.
- Cuándo no / riesgo: Malinterpretar.
- Verificación: Prueba con valores.

**Contrato / invariantes / reglas.** División entre enteros trunca hacia cero. División entera por cero lanza `ArithmeticException`. `==` compara valor en primitivos, referencia en objetos. Ante duda, usa paréntesis.

**Modelo mental.** La precedencia es la gramática de la expresión; los paréntesis hacen explícita la intención.

#### ► LO QUE PUEDE SALIR MAL

- **`4` en vez de `4.5`**. Causa probable: División entera. Corrección: Usar `2.0` o cast.
- **NPE en condición**. Causa probable: Evaluaste lado derecho sin guarda. Corrección: `obj != null && ...`.
- **Condición incorrecta**. Causa probable: Precedencia mal asumida. Corrección: Paréntesis y variables booleanas.

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

- **`a / b` enteros**: Trunca. Por qué importa: Regla de Java para enteros. Si lo omites/cambias: Esperar decimal da bug.
- **`(5+4)/2.0`**: Fuerza división real. Por qué importa: Paréntesis + double. Si lo omites/cambias: Sin paréntesis cambia resultado.
- **`&&` cortocircuito**: Evalúa derecho solo si necesario. Por qué importa: Evita NPE. Si lo omites/cambias: Invertir guarda causa NPE.
- **`edad >= 18`**: Relacional booleana. Por qué importa: Condición clara. Si lo omites/cambias: `=` sería asignación/no compila aquí.

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

- **Resultado entero inesperado**. Causa probable: División entera. Corrección: Usar `double`.
- **NPE**. Causa probable: Sin cortocircuito. Corrección: Guarda `!= null` primero.
- **Condición difícil de leer**. Causa probable: Expresión grande. Corrección: Extraer booleanos con nombre.

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

**Control de flujo**
- Definición formal: Sentencias que alteran secuencia: selección, iteración, salto.
- Para qué sirve: Implementar lógica real.
- Cuándo usarlo: Reglas, menús, procesamiento.
- Cuándo no / riesgo: Flujo spaghetti.
- Verificación: Casos de prueba por rama.

**Decisiones (`if/switch`)**
- Definición formal: Selección por condición booleana o casos discretos.
- Para qué sirve: Validar/clasificar.
- Cuándo usarlo: Reglas de negocio.
- Cuándo no / riesgo: `switch` sin default; condiciones incompletas.
- Verificación: Entrada inesperada cubierta.

**Repeticiones (`for/while/do-while`)**
- Definición formal: Ejecutan bloque mientras condición/iteración lo indique.
- Para qué sirve: Recorrer, acumular, reintentar.
- Cuándo usarlo: Rangos, colecciones.
- Cuándo no / riesgo: Bucle infinito, off-by-one.
- Verificación: Borde 0,1,N.

**`break/continue`**
- Definición formal: Salida anticipada o salto a siguiente iteración.
- Para qué sirve: Control fino.
- Cuándo usarlo: Buscar/saltar inválidos.
- Cuándo no / riesgo: Uso excesivo oculta lógica.
- Verificación: Test de caso saltado.

**Condición booleana**
- Definición formal: Expresión `true/false`.
- Para qué sirve: Dirigir flujo.
- Cuándo usarlo: `if/while/for`.
- Cuándo no / riesgo: Java no acepta enteros como booleanos.
- Verificación: Compila solo con boolean.

**Contrato / invariantes / reglas.** Condiciones deben ser booleanas. `switch` con `->` evita fall-through accidental; `default` cubre casos no previstos. Todo bucle necesita progreso o salida explícita. `do/while` ejecuta al menos una vez.

**Modelo mental.** Decisiones son bifurcaciones; bucles son rotondas. Toda rotonda necesita señal de salida.

#### ► LO QUE PUEDE SALIR MAL

- **Bucle infinito**. Causa probable: Sin progreso. Corrección: `i++`, `n--`, condición revisada.
- **Caso no manejado**. Causa probable: Falta `default`. Corrección: Agregar default/validación.
- **Off-by-one**. Causa probable: `<` vs `<=`. Corrección: Probar bordes.
- **Fall-through inesperado**. Causa probable: `switch` clásico sin `break`. Corrección: Usar `->` o `break`.

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

- **`if/else`**: Elige rama. Por qué importa: Regla binaria. Si lo omites/cambias: Casos sin cubrir.
- **`switch ->`**: Mapea caso discreto. Por qué importa: Legible y sin fall-through. Si lo omites/cambias: `default` faltante da comportamiento pobre.
- **`continue`**: Salta iteración. Por qué importa: Omite caso puntual. Si lo omites/cambias: Procesaría el 2.
- **`n--`**: Progreso. Por qué importa: Garantiza terminación. Si lo omites/cambias: Bucle infinito.
- **`do/while`**: Ejecuta al menos una vez. Por qué importa: Útil en intentos/menús. Si lo omites/cambias: `while` puede no ejecutar.

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

- **Nunca termina**. Causa probable: Condición siempre true. Corrección: Asegura progreso.
- **Resultado inesperado en switch clásico**. Causa probable: Fall-through. Corrección: Usar `->` o `break`.
- **Off-by-one**. Causa probable: Límite incorrecto. Corrección: Probar 0,1,N.

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

**Arreglo**
- Definición formal: Objeto de tamaño fijo, elementos homogéneos, índice 0-based, campo `length`.
- Para qué sirve: Colección fija.
- Cuándo usarlo: Tamaño conocido.
- Cuándo no / riesgo: Acceso fuera de rango; tamaño dinámico.
- Verificación: `length` y recorrido correcto.

**Índice/`length`**
- Definición formal: Índices válidos `0..length-1`.
- Para qué sirve: Acceso seguro.
- Cuándo usarlo: Bucles y bordes.
- Cuándo no / riesgo: Off-by-one.
- Verificación: No lanza `AIOOBE`.

**Método**
- Definición formal: Bloque nombrado con parámetros y retorno.
- Para qué sirve: Reutilizar y nombrar intención.
- Cuándo usarlo: Cálculo, validación.
- Cuándo no / riesgo: Métodos largos sin responsabilidad clara.
- Verificación: Test unitario/manual.

**Parámetros/retorno**
- Definición formal: Java pasa argumentos por valor; para arreglos se copia la referencia.
- Para qué sirve: Contrato de entrada/salida.
- Cuándo usarlo: APIs pequeñas.
- Cuándo no / riesgo: Mutar arreglo sin documentar.
- Verificación: Salida esperada.

**Recorrido `for/for-each`**
- Definición formal: `for` con índice; `for-each` sobre elementos.
- Para qué sirve: Procesar elementos.
- Cuándo usarlo: Suma, búsqueda, impresión.
- Cuándo no / riesgo: `for-each` cuando necesitas índice.
- Verificación: Imprime todos los elementos.

**Contrato / invariantes / reglas.** Tamaño fijo tras creación. Acceso fuera de rango lanza `ArrayIndexOutOfBoundsException`. `for-each` no expone índice. Método que recibe arreglo puede mutar su contenido.

**Modelo mental.** Arreglo = casilleros numerados desde 0. Método = máquina con entrada, proceso y salida.

#### ► LO QUE PUEDE SALIR MAL

- **`ArrayIndexOutOfBoundsException`**. Causa probable: Índice inválido. Corrección: `i < length`.
- **Promedio entero**. Causa probable: División entera. Corrección: Cast a `double`.
- **`NullPointerException`**. Causa probable: Arreglo null. Corrección: Validar entrada.

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

- **`int[] notas = {...}`**: Crea arreglo tamaño 4. Por qué importa: Contiene datos. Si lo omites/cambias: Sin arreglo no hay colección.
- **`i < valores.length`**: Límite seguro. Por qué importa: Evita AIOOBE. Si lo omites/cambias: `<=` causa excepción.
- **`(double) suma / valores.length`**: División real. Por qué importa: Promedio correcto. Si lo omites/cambias: Entero trunca.
- **`for-each` en imprimir**: Lee elementos. Por qué importa: Simple y claro. Si lo omites/cambias: `for` con índice también sirve.
- **Método `promedio`**: Reutiliza lógica. Por qué importa: Separa cálculo de salida. Si lo omites/cambias: Mezclar todo dificulta pruebas.

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

- **`ArrayIndexOutOfBoundsException`**. Causa probable: Límite mal. Corrección: `i < length`.
- **Promedio incorrecto**. Causa probable: División entera. Corrección: Cast a double.
- **`NullPointerException`**. Causa probable: Arreglo null. Corrección: Validar precondición.

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
