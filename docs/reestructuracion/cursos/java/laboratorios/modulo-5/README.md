# Java · Laboratorio del módulo 5 · Objetos y clases

Código de los ejemplos de [modulo-5.md](../../modulo-5.md). Al cerrar el módulo, el manifiesto de carga de
`rutaflow-nucleo` pasa a escribirse aquí como proyecto Gradle (mismo wrapper y toolchain que los módulos 0 a 4)
y esta carpeta irá a `examples/java/modulo-5/`.

**Estado real: tema 2 de 7 escrito.** `tema-1/` y `tema-2/` tienen ejemplos y `verificar.sh` comprueba esos dos
temas (**89 comprobaciones**). Los temas 3 a 7 no tienen carpeta todavía: no es que estén sin documentar, es que no
existe nada que ejecutar.

## Qué hay

| Carpeta | Tema | Ejemplos | Errores reproducibles (`errores/`) | Por dentro (`por-dentro/`) |
|---|---|---|---|---|
| `tema-1/` | clases, objetos, campos, métodos y `this` | `ClaseYObjetos`, `SombraDeCampo` | `ThisDesdeStatic`, `MetodoSinObjeto`, `LocalSinValor`, `DosPublicasEnUnArchivo`, `ComparaTiposDistintos` | `CamposEnBytecode` |
| `tema-2/` | constructores, `this(...)`, bloques y orden de inicialización | `ConstructoresYOrden`, `EncadenamientoSilencioso` | `ThisAntesDeTiempo`, `CampoAntesDeSuper`, `ConstructorRecursivo`, `FinalSinAsignar`, `ReferenciaAdelantada`, `SinConstructorPorDefecto` | `OrdenEnBytecode`, `SinEncadenar` |
| — | `tema-3/` encapsulación y modificadores de acceso | pendiente | | |
| — | `tema-4/` `static`: campos, métodos y constantes | pendiente | | |
| — | `tema-5/` paquetes e importaciones | pendiente | | |
| — | `tema-6/` `toString`, `equals` y `hashCode` | pendiente | | |
| — | `tema-7/` inmutables y `record` | pendiente | | |

Los cinco nombres de los temas pendientes son el mapa de
[modulo-5.md](../../modulo-5.md), no una promesa de contenido: cada uno se abre con su carpeta, sus ejemplos
ejecutados y sus comprobaciones dentro de `verificar.sh`.

## Versiones

Lo que sigue es lo que se ejecutó para escribir los temas 1 y 2: **Temurin 27.0.1.0.2+1** en macOS arm64,
compilando con `javac --release 25`. El curso enseña Java 25, así que toda salida citada en el documento viene de
un compilador que fija el lenguaje en 25 y de una JVM 27. Queda **pendiente reejecutar con JDK 25 real**; lo que
cambia con eso son los mensajes de texto de `javac` y del `NullPointerException` y, en el tema 2, el **número de
instrucciones** de cada `<init>` (11/6/7 con cadena, 11/14/17 sin ella), que es política del generador de código y
no regla del lenguaje. El reparto de los inicializadores (2/0/0 con `this()`, 2/2/2 sin ella) sí lo fija §12.5.

Todavía no hay proyecto Gradle en esta carpeta, así que tampoco hay versión de Gradle ni de JUnit que anotar: se
declarará cuando exista el manifiesto de carga.

## Verificar

```bash
./verificar.sh                       # 89 comprobaciones (41 del tema 1 + 48 del tema 2), 0 fallidas, 0 omitidas
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
