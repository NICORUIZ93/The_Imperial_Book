# Java · Laboratorio del módulo 5 · Objetos y clases

Código de los ejemplos de [modulo-5.md](../../modulo-5.md). Al cerrar el módulo, el manifiesto de carga de
`rutaflow-nucleo` pasa a escribirse aquí como proyecto Gradle (mismo wrapper y toolchain que los módulos 0 a 4)
y esta carpeta irá a `examples/java/modulo-5/`.

**Estado real: tema 3 de 7 escrito.** `tema-1/`, `tema-2/` y `tema-3/` tienen ejemplos y `verificar.sh` comprueba
esos tres temas (**140 comprobaciones**). Los temas 4 a 7 no tienen carpeta todavía: no es que estén sin documentar,
es que no existe nada que ejecutar.

## Qué hay

| Carpeta | Tema | Ejemplos | Errores reproducibles (`errores/`) | Por dentro (`por-dentro/`) |
|---|---|---|---|---|
| `tema-1/` | clases, objetos, campos, métodos y `this` | `ClaseYObjetos`, `SombraDeCampo` | `ThisDesdeStatic`, `MetodoSinObjeto`, `LocalSinValor`, `DosPublicasEnUnArchivo`, `ComparaTiposDistintos` | `CamposEnBytecode` |
| `tema-2/` | constructores, `this(...)`, bloques y orden de inicialización | `ConstructoresYOrden`, `EncadenamientoSilencioso` | `ThisAntesDeTiempo`, `CampoAntesDeSuper`, `ConstructorRecursivo`, `FinalSinAsignar`, `ReferenciaAdelantada`, `SinConstructorPorDefecto` | `OrdenEnBytecode`, `SinEncadenar` |
| `tema-3/` | encapsulación y modificadores de acceso | `src/bodega/{Envio,Inspectoria,Demo}`, `src/afuera/{Ruta,Cliente}` (dos paquetes, a propósito) | `PrivadoEnOtraClaseDelPaquete`, `PaqueteDesdeOtroPaquete`, `HerederoDeOtroPaqueteLeeLoDelPaquete`, `ProtegidoConReferenciaDelPadre`, `ReducirAccesoAlSobreescribir`, `OverrideDeUnPrivado` | `NivelesEnClass`, `NidoPrivate`, `jvm/` (el `IllegalAccessError` de un `.class` ya compilado) |
| — | `tema-4/` `static`: campos, métodos y constantes | pendiente | | |
| — | `tema-5/` paquetes e importaciones | pendiente | | |
| — | `tema-6/` `toString`, `equals` y `hashCode` | pendiente | | |
| — | `tema-7/` inmutables y `record` | pendiente | | |

Los cinco nombres de los temas pendientes son el mapa de
[modulo-5.md](../../modulo-5.md), no una promesa de contenido: cada uno se abre con su carpeta, sus ejemplos
ejecutados y sus comprobaciones dentro de `verificar.sh`.

## Versiones

Lo que sigue es lo que se ejecutó para escribir los temas 1 a 3: **Temurin 27.0.1.0.2+1** en macOS arm64,
compilando con `javac --release 25`. El curso enseña Java 25, así que toda salida citada en el documento viene de
un compilador que fija el lenguaje en 25 y de una JVM 27. Queda **pendiente reejecutar con JDK 25 real**; lo que
cambia con eso son los mensajes de texto de `javac` y del `NullPointerException` y, en el tema 2, el **número de
instrucciones** de cada `<init>` (11/6/7 con cadena, 11/14/17 sin ella), que es política del generador de código y
no regla del lenguaje. El reparto de los inicializadores (2/0/0 con `this()`, 2/2/2 sin ella) sí lo fija §12.5.

El tema 3 añade una cosa que hay que mirar antes de dar por buena ninguna de sus salidas: **el arnés compila el
mismo fuente en dos `--release` distintos** (`8` y `25`) para ver el cambio de `invokespecial` a `invokevirtual` en
un método `private`, y el de `access$000` al `NestHost`/`NestMembers`. `javac --help --verbose` de este compilador
lista `Supported releases: 8, 9, 10, ..., 25, 26, 27`, así que el contraste es posible aquí. Con `--release 8`
`javac` saca tres avisos de opción obsoleta que el script descarta: lo medido es el bytecode, no el aviso. Si una
JDK futura dejara de aceptar el 8, el script no pasa por alto el paso: falla con nombre y el recuento baja.

Y una salida del tema 3 que **no es una regla del lenguaje**: `java.util.ImmutableCollections$List12` es el nombre
interno de la JDK para la lista que devuelve `List.copyOf` con uno o dos elementos. Con tres elementos sale `ListN`,
y con otra implementación de JDK puede salir otro nombre. Lo que se sostiene con especificación es que la copia es
inmutable (`UnsupportedOperationException`); el nombre de la clase es un dato de esta máquina.

Todavía no hay proyecto Gradle en esta carpeta, así que tampoco hay versión de Gradle ni de JUnit que anotar: se
declarará cuando exista el manifiesto de carga.

## Verificar

```bash
./verificar.sh                       # 140 comprobaciones (41 tema 1 + 48 tema 2 + 51 tema 3), 0 fallidas, 0 omitidas
```

El script necesita `javac` y `java` en el `PATH`; compila con `--release 25` y ejecuta con
`-Dstdout.encoding=UTF-8`, y escribe sus `.class` en un directorio temporal, no aquí. Cada comprobación es un
fragmento literal de una salida real (o una comparación entre dos salidas), así que el script falla si el
documento cita algo que ya no ocurre.

Cuatro guardas que existen porque algo falló una vez. `igual_no_vacio` se niega a dar por bueno un `igual()` entre
dos cadenas vacías (el extractor de cuerpos de método buscaba la firma en la columna 1, y `javap` la imprime con
dos espacios de sangrado: las dos cadenas salían vacías y la comparación pasaba sin comparar nada), y el extractor
compara ahora **con los desplazamientos incluidos**, no solo con los mnemotécnicos. `cero` es la misma trampa en
su forma «debe salir 0»: un `0` sacado de un volcado vacío parecía un éxito, así que ahora exige que el miembro
exista en el corte y falla si no. `vacio` hace lo contrario que `espera` —aquí el éxito es que el compilador no
diga nada, y se comprueba que realmente no dijo nada—. Y `veces` / `antes` miden **conteos y orden** sobre la
salida de un programa en lugar de citar una línea, porque «el `static` corre una vez y los inicializadores tres»
no se puede afirmar mirando un `grep`.

El tema 3 trajo cuatro guardas más, y las tres primeras existen por fallos que se dieron escribiéndolo. `bandera`
lee la línea `flags:` que sigue a la cabecera exacta de un miembro, y compara la línea entera: buscar `ACC_PUBLIC`
suelto daría ok aunque el campo fuera privado, porque la bandera está también en la clase. Sus tres primeras
llamadas fallaron al primer intento por una cabecera mal escrita (`int publico;` cuando `javap` imprime
`public int publico;`) —de ahí que `bandera` use `igual_no_vacio` y no `igual`: un extractor que no encuentra al
miembro devuelve vacío, y un vacío frente a un vacío es exactamente el ok falso que ya se había cazado en el tema 2
—. `lleva` y `cero_en` comprueban sobre una salida **ya capturada**, porque el `invokevirtual`/`invokespecial` del
mismo fuente en `--release 25` y en `--release 8` hay que compararlo, no relanzarlo. Y el `igual` sobre el código de
salida de la demo existe por una mutación: al pasar `comprueba` de `private` a `protected`, la red de seguridad de
`Ruta` empieza a funcionar y lanza, la demo se queda en 16 líneas (muere en `B4` con `IllegalStateException: peso
fuera de contrato: 50000` y código 1), y fallaban **catorce** comprobaciones: 7 `espera` que relanzan la JVM y
tropezan con el código 1 aunque su texto (`A1`, `A2`, `A3`, `A5`, `A6`, `B1`, `B6`) se imprimió bien; 1 el propio
código de salida, que ahora se comprueba primero y nombra la cascada; 4 conteos `veces` que se invierten (lo de
`bodega` pasa de 3 a 2 y lo de `Ruta` de 0 a 1); 1 el valor comparado de `B5`, que ya no se imprime; y 1
`falla_con`, el `errores/OverrideDeUnPrivado`, que **deja de dar error** porque con el padre abierto sí hay a quién
sustituir. Las cinco mutaciones que se probaron
sobre este tema, cada una con su número de fallos medido sobre una copia del laboratorio en `/tmp`:
`gramos` pasado a `public` (1: se cae el `errores/PrivadoEnOtraClaseDelPaquete`), `selloDePaquete` pasado a `public`
(2: los dos cortes de paquete), `hitosSeguros()` devolviendo la lista viva en vez de la copia (4), `privado` pasado
a `public` en `NivelesEnClass` (1, por la cabecera vacía de `bandera`) y `comprueba` pasado a `protected` (14).

Las 41 comprobaciones del tema 1 se reparten así: 16 sobre la salida de `ClaseYObjetos` (dentro van las tres de
`System.identityHashCode` forzado con `-XX:hashCode=2` y las dos de compilar con `-g` y sin `-g`), 4 de
`SombraDeCampo`, 3 de `CamposEnBytecode` ejecutado, 6 sobre el volcado `javap -c -p` de su clase anidada `Punto`
(comprendida la comparación byte a byte de que los cuerpos de `conThis` y `sinThis` salgan idénticos), 4 sobre
los `.class` que produce un solo `.java` con una anidada, 3 sobre el volcado de `main` y 5 fallos de compilación
esperados.

Las 48 del tema 2, sobre el propio script y no sumadas de memoria: 11 de `ConstructoresYOrden` ejecutado (5 de
texto, 3 conteos `veces`, 3 relaciones `antes`); 12 de los volcados de `OrdenEnBytecode` (4 de `espera` sobre
enlaces e instrucciones, 4 conteos `cuenta`, 3 `cero` y 1 `distinto` entre los dos `<init>`); 11 de la comparación
con `SinEncadenar` (1 `igual_no_vacio` de los valores impresos, 1 salida ejecutada, 9 conteos de instrucciones e
`invokestatic`); 3 de `EncadenamientoSilencioso` (2 salidas y el `-Xlint:all` vacío); 5 de anidación y del acceso
del constructor por defecto; y 6 fallos de compilación esperados.

Las 51 del tema 3, por fuente de evidencia y contadas sobre el propio script: **1** sobre la compilación conjunta
(`vacio` del `-Xlint:all`); **21** sobre `bodega.Demo` (7 `espera` que relanzan la JVM, 1 su código de salida,
9 comparaciones de valores ya capturados —7 `igual`, 1 `cero_en` de que la rama de éxito no aparezca y 1 `distinto`
entre los dos tipos devueltos— y 4 conteos `veces` de cuál comprobación corre y cuál no); **11** sobre
`NivelesEnClass` (5 `bandera` sobre el volcado `-v`, 1 `cero_en` de la palabra `package`, 1 interface
implícitamente pública y 4 `lleva` del `invokevirtual` frente al `invokespecial` en dos releases); **9** sobre
`NidoPrivate` (2 conteos de `access$`, 2 de instrucciones de enlace, 2 de atributos `Nest`, 1 `cero_en` y 2
ejecuciones); **3** sobre el trío `jvm/`; y **6** fallos de compilación esperados, dos de
ellos con el mensaje **idéntico** entre sí —`PaqueteDesdeOtroPaquete` y el heredero—, que es justo la prueba de que
heredar no abre lo de paquete—. Por tipo: 16 `espera`, 10 `igual`, 7 `falla_con`, 5 `bandera`, 4 `veces`, 4 `lleva`,
3 `cero_en`, 1 `vacio`, 1 `distinto`.

## Qué hay que mirar de este tema, en dos minutos

1. `tema-1/SombraDeCampo.java` — es el ejemplo cuyo bug **no produce ningún mensaje**. Compílalo con
   `-Xlint:all`: el compilador calla. Ejecútalo: un campo está en `null` y el otro no.
2. `tema-1/por-dentro/CamposEnBytecode.java` — los dos métodos `conThis` y `sinThis` son dos cuerpos de bytecode
   idénticos; `javap -c -p` lo demuestra y `verificar.sh` lo compara carácter a carácter.
3. `tema-1/ClaseYObjetos.java` con `-XX:+UnlockExperimentalVMOptions -XX:hashCode=2` — dos objetos distintos
   devuelven el mismo `System.identityHashCode`. Es la prueba de que ese número no sirve como identidad.
4. `tema-2/ConstructoresYOrden.java` — 37 líneas impresas por el propio objeto: el orden real de los siete pasos de
   §12.5, incluidas las cuatro líneas que se repiten en cada objeto y las tres del `static` que solo salen una vez.
5. `tema-2/por-dentro/OrdenEnBytecode.java` contra `tema-2/por-dentro/SinEncadenar.java` — el mismo caso con
   `this()` y sin él. Ejecuta los dos: **imprimen exactamente lo mismo**. Ahora `javap -c -p` sobre las dos clases
   anidadas: 6 y 7 instrucciones frente a 14 y 17. Eso es lo que cuesta no encadenar, y es invisible corriendo.
6. `tema-2/EncadenamientoSilencioso.java` — el segundo bug mudo del módulo: escribir un campo **antes** de
   `this()` compila con `-Xlint:all` vacío y el valor se pisa (`v = 9`, cuando el programa escribió `5`).
7. `tema-3/src/bodega/Demo.java` — dieciocho líneas y **cero avisos** de `javac -Xlint:all`. Dentro están los dos
   fallos mudos del tema: `A8`, donde el paquete `afuera` mete un hito en la lista interna sin llamar a ningún
   método de `Envio`, y `B4`/`B5`, donde la comprobación más estricta de `Ruta` jamás se ejecuta y entran 50 000 g.
   La línea `A9` es la explicación de la primera (`java.util.ArrayList`: te devolvió tu propia lista) y `B5` la de la
   segunda.
8. `tema-3/por-dentro/jvm/` — el único de los tres que enseña que el acceso se comprueba **también al enlazar**:
   compila `Lector` contra `v1` (campo `public`), cambia en el classpath el `.class` por el de `v2` (campo
   `private`) sin recompilar `Lector` y sale `IllegalAccessError`. Es la razón de que «ponerlo private luego» rompa
   a quien ya tenías compilado, y de que el `getfield` del `.class` guardara el **nombre** del campo, no su visibilidad.
9. `tema-3/por-dentro/NivelesEnClass.java` y `NidoPrivate.java` — los cuatro niveles como bits: `flags: (0x0000)`
   para lo de paquete (no existe una bandera de paquete: es la ausencia), `public abstract` añadido solo en la
   interface, y el mismo `private` llamado con `invokespecial` en `--release 8` y con `invokevirtual` en `--release 25`
   porque desde JDK 11 el `.class` declara su `NestHost`.
