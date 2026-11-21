# Java · Laboratorio del módulo 5 · Objetos y clases

Código de los ejemplos de [modulo-5.md](../../modulo-5.md). Al cerrar el módulo, el manifiesto de carga de
`rutaflow-nucleo` pasa a escribirse aquí como proyecto Gradle (mismo wrapper y toolchain que los módulos 0 a 4)
y esta carpeta irá a `examples/java/modulo-5/`.

**Estado real: tema 4 de 7 escrito.** `tema-1/`, `tema-2/`, `tema-3/` y `tema-4/` tienen ejemplos y `verificar.sh`
comprueba esos cuatro temas (**243 comprobaciones**). Los temas 5 a 7 no tienen carpeta todavía: no es que estén sin
documentar, es que no existe nada que ejecutar.

## Qué hay

| Carpeta | Tema | Ejemplos | Errores reproducibles (`errores/`) | Por dentro (`por-dentro/`) |
|---|---|---|---|---|
| `tema-1/` | clases, objetos, campos, métodos y `this` | `ClaseYObjetos`, `SombraDeCampo` | `ThisDesdeStatic`, `MetodoSinObjeto`, `LocalSinValor`, `DosPublicasEnUnArchivo`, `ComparaTiposDistintos` | `CamposEnBytecode` |
| `tema-2/` | constructores, `this(...)`, bloques y orden de inicialización | `ConstructoresYOrden`, `EncadenamientoSilencioso` | `ThisAntesDeTiempo`, `CampoAntesDeSuper`, `ConstructorRecursivo`, `FinalSinAsignar`, `ReferenciaAdelantada`, `SinConstructorPorDefecto` | `OrdenEnBytecode`, `SinEncadenar` |
| `tema-3/` | encapsulación y modificadores de acceso | `src/bodega/{Envio,Inspectoria,Demo}`, `src/afuera/{Ruta,Cliente}` (dos paquetes, a propósito) | `PrivadoEnOtraClaseDelPaquete`, `PaqueteDesdeOtroPaquete`, `HerederoDeOtroPaqueteLeeLoDelPaquete`, `ProtegidoConReferenciaDelPadre`, `ReducirAccesoAlSobreescribir`, `OverrideDeUnPrivado` | `NivelesEnClass`, `NidoPrivate`, `jvm/` (el `IllegalAccessError` de un `.class` ya compilado) |
| `tema-4/` | `static`: campos de clase, métodos de clase, constantes e inicialización de la clase | `CamposEstaticos`, `InicializacionBajoDemanda`, `ContadorCompartido` | `CampoDeInstanciaDesdeStatic`, `CaseNoConstante`, `FinalEstaticoEnBlanco`, `FinalEstaticoNuncaAsignado`, `InstanceOverrideDeStatic`, `OverrideDeUnStatic`, `StaticEnClaseInterna`, `InitQueRevienta` | `FlagsEstaticos`, `constante/{Lector, v1/Config, v2/Config}` (el `Lector` **sin recompilar** contra dos `Config`) |
| — | `tema-5/` paquetes e importaciones | pendiente | | |
| — | `tema-6/` `toString`, `equals` y `hashCode` | pendiente | | |
| — | `tema-7/` inmutables y `record` | pendiente | | |

Los tres nombres de los temas pendientes son el mapa de
[modulo-5.md](../../modulo-5.md), no una promesa de contenido: cada uno se abre con su carpeta, sus ejemplos
ejecutados y sus comprobaciones dentro de `verificar.sh`.

## Versiones

Lo que sigue es lo que se ejecutó para escribir los temas 1 a 4: **Temurin 27.0.1.0.2+1** en macOS arm64,
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

El tema 4 trae un segundo contraste de `--release`, este **histórico**: `tema-4/errores/StaticEnClaseInterna.java` se
compila tres veces —con `--release 25`, con `--release 16` y con `--release 15`—. Los dos primeros dan compilación
limpia (dos guardas `vacio`) y el tercero da **dos** errores, uno por miembro `static` de la clase interna, con el
texto `modifier 'static' is only allowed in constant variable declarations`: esa es la cota exacta del JEP 395, y se
mide en las dos direcciones porque buscar el error nuevo sin buscar el viejo probaría solo una mitad. Si una JDK
futura dejara de aceptar `--release 15`, el `grep -c` de esos dos errores saca `0`, la guarda `igual` falla con nombre
propio y el recuento baja: no se omite nada.

Y una salida del tema 3 que **no es una regla del lenguaje**: `java.util.ImmutableCollections$List12` es el nombre
interno de la JDK para la lista que devuelve `List.copyOf` con uno o dos elementos. Con tres elementos sale `ListN`,
y con otra implementación de JDK puede salir otro nombre. Lo que se sostiene con especificación es que la copia es
inmutable (`UnsupportedOperationException`); el nombre de la clase es un dato de esta máquina.

Todavía no hay proyecto Gradle en esta carpeta, así que tampoco hay versión de Gradle ni de JUnit que anotar: se
declarará cuando exista el manifiesto de carga.

## Verificar

```bash
./verificar.sh                       # 243 comprobaciones (41 t1 + 48 t2 + 51 t3 + 103 t4), 0 fallidas, 0 omitidas
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

El tema 4 trajo **tres** guardas más, y las tres existen porque algo salió mal antes de funcionar. `flags_de` es la
hermana de `bandera` que busca una cabecera exacta del volcado `javap -v -p`; sus primeras llamadas fallaron porque
pedí `int codigo;` donde `javap` imprime `java.lang.String codigo;` —se corrigió el texto buscado, no la guarda: si la
cabecera no está, la comprobación tiene que caer—. `cuenta_en` corta el volcado **en la cabecera de un miembro** y
cuenta ocurrencias de una instrucción dentro de ese cuerpo; falló seis veces al primer intento por dos motivos
distintos (cuatro llamadas sin el argumento del volcado, y seis apuntando a `$VC`, el `-v -p`, donde entre la cabecera
y las instrucciones se interponen `descriptor:`, `flags:` y `stack=`) y se resolvió creando una captura nueva, `$CF`,
con `javap -c -p` puro. Relajar el corte para que el `-v` pasara habría convertido el contador en un ok vacío, que es
justo la falla que `igual_no_vacio` y `cero` ya cazaban en los temas 2 y 3. `no_entre` comprueba que una cadena **no**
aparezca entre dos anclas de la salida, y hace falta porque el paso 1 y el paso 4 de `InicializacionBajoDemanda`
comparten con el inicializador el prefijo de sangrado: un `grep` plano sobre la salida entera habría encontrado
`arranca(): inicializador de campo` y habría dado por bueno un programa que lo imprime en el paso 1. Las dos guardas
de orden se probaron sobre una copia del laboratorio en `/tmp`, cambiando el fuente y no el script: hacer que el
**paso 1** lea el campo vivo (una línea añadida) deja **241** correctas y tumba exactamente las **2** `no_entre`, con
su recuento de apariciones en el mensaje (`aparece 1 veces entre «paso 1 · …» y «paso 4 · …»`); invertir en el fuente
el par `texto 1` / `texto 2` deja **242** correctas y tumba **1**, la `antes`, que se ve obligada a decir `línea 9
frente a línea 8`. Ninguna de las dos mutaciones tocó las otras 241 o 242 comprobaciones: el orden del `<clinit>` está
controlizado por dos guardas y no por una.

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

Las 103 del tema 4, agrupadas por la variable del script que contiene cada evidencia y contadas sobre las líneas 401 a
568 de este mismo `verificar.sh`: **2** abren el tema con las compilaciones guardianas en `vacio` (los tres ejemplos
del tema sin un solo aviso, y `FlagsEstaticos` callado incluso con `-Xlint:all`); **18** sobre `CamposEstaticos`
ejecutado (16 `lleva` sobre sus 16 líneas, 1 `antes` de que la diferencia entre ocultar y sustituir se vea en la
**misma** variable y 1 `igual` sobre su código de salida 0); **10** sobre su volcado `javap -c -p` (2 `cuenta_en` del
`<init>` —un `putstatic` y un `putfield`—, 5 `igual` de conteos —5 `getstatic` de `creadas`, 0 `getfield`, 2
`invokevirtual` de `describe`, 5 `invokestatic` de `total`, 2 `sipush 25000`—, 2 `cero_en` —que `total` jamás sea
`invokevirtual` y que no quede ni una referencia a `Field PESO_MAXIMO`— y 1 `lleva` de la entrada del pool con su
clase exacta); **7** sobre `javap -v -p` de la clase y de sus anidadas `Topes` y `Tarifas` (6 `flags_de` y 1 `lleva`
del `ConstantValue: int 25000`); **5** del lint (1 `vacio` del `javac` sin bandera sobre el ejemplo, 1 `igual` sobre
el `5` de la línea final `5 warnings`, 2 `lleva` de los dos textos de aviso y 1 `cero_en` de que ninguno sea un
error); **12** sobre `FlagsEstaticos` (3 `lleva` de su salida, 2 `flags_de`, 2 `igual` sobre las líneas
`stack=…, locals=…, args_size=…` de `sumar` y `mover`, 4 `cuenta_en` del volcado `-c -p` puro —0 `aload_0` en el
método de clase, 3 en el de instancia, 1 `putstatic` en su `<clinit>` y 0 apariciones de `CONSTANTE` ahí— y 1 `lleva`
del `ConstantValue: int 42`); **6** del experimento de constantes (3 ejecuciones del **mismo** `Lector.class` contra
`v1` y contra `v2`, y 3 sobre su bytecode: el valor horneado dentro del `ldc`, cero referencias al campo constante y
un `getstatic` del vivo); **21** de cuándo y en qué orden corre `<clinit>` (17 sobre `InicializacionBajoDemanda`
ejecutado —7 `lleva`, 3 `no_entre`, 3 `antes`, 4 `veces`— y 4 sobre su bytecode: 3 `lleva` —el `ldc` de tipo del
literal, el `getstatic` del campo no constante y el texto horneado de la interface— y 1 `cero_en` del acceso a
`CONSTANTE`); **4** del contador global (3 `lleva` y el único `igual_no_vacio` del tema, que compara los `#1` de los
dos mostradores del remedio); **7** de los cortes del compilador (5 `no_compila` y 2 `lleva` de las dos líneas que
saca `InstanceOverrideDeStatic`); **4** de la cota del JEP 395 (2 `vacio` con `--release 25` y con `--release 16`, 1
`igual` sobre los **2** errores de `--release 15` y 1 `lleva` de su texto viejo); y **7** del inicializador que
revienta (1 `igual` del código de salida 1, 5 `lleva` repartidas entre las dos ejecuciones del mismo `.class` y 1
`cero_en` de que la línea del segundo contacto no se imprima jamás). 2+18+10+7+5+12+6+21+4+7+4+7 = 103.
Por tipo: 50 `lleva`, 11 `igual`, 8 `flags_de`, 6 `cuenta_en`, 6 `cero_en`, 5 `vacio`, 5 `no_compila`, 4 `veces`,
4 `antes`, 3 `no_entre`, 1 `igual_no_vacio` = 103.

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
10. `tema-4/CamposEstaticos.java` — dieciséis líneas y **cero avisos** con `javac` a secas: un contador que sube en la
    clase mientras el `codigo` sigue siendo de cada objeto, la misma variable `p` que da `hijo` por el objeto y
    `creadas=3 · fueraDePeso=1` por el tipo del fuente, y los tres accesos sobre `null` (dos funcionan y el de
    instancia lanza con el nombre del método y de la ranura). Añade `-Xlint:static` y aparecen **5** avisos sobre el
    mismo fuente que acabas de ver compilar limpio.
11. `tema-4/por-dentro/constante/` — el experimento que hay que hacer dos veces: compila `Lector` contra `v1`
    (`LIMITE_CONSTANTE = 5`), compila `v2` aparte (`99`) y ejecuta el **mismo** `Lector.class` con `-cp k2:k1`.
    Imprime `5/99`: la constante se horneó en el `ldc` del llamante y el campo vivo sí se busca en la clase al
    ejecutar. Es §13.1 y §13.4.9 en tres comandos.
12. `tema-4/InicializacionBajoDemanda.java` — nueve pasos: el literal `Bascula.class`, leer `CONSTANTE` y
    `Class.forName(.., false, ..)` **no** inicializan nada; el `<clinit>` corre una vez y en orden de texto, el padre
    antes que el hijo, y una interface de puras constantes nunca se inicializa al leer su campo.
13. `tema-4/ContadorCompartido.java` — la guía `RF-000999` sale `#1` o `#3` según el orden de dos bloques, con el mismo
    fuente y el mismo `new`, y tras 500 objetos descartados la clase sigue en `503`. El remedio (`Secuenciador` por
    objeto) da `#1` en los dos mostradores.
14. `tema-4/errores/InitQueRevienta.java` — ejecútalo dos veces, con y sin argumento: la primera da
    `ExceptionInInitializerError` **con** la causa y un frame `<clinit>`; la segunda da `NoClassDefFoundError:
    Could not initialize class …` y ya no imprime la causa. Ahí se ve por qué se busca el primer error del log.
