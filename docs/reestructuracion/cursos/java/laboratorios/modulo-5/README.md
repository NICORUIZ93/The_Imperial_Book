# Java · Laboratorio del módulo 5 · Objetos y clases

Código de los ejemplos de [modulo-5.md](../../modulo-5.md). Al cerrar el módulo, el manifiesto de carga de
`rutaflow-nucleo` pasa a escribirse aquí como proyecto Gradle (mismo wrapper y toolchain que los módulos 0 a 4)
y esta carpeta irá a `examples/java/modulo-5/`.

**Estado real: tema 1 de 7 escrito.** Solo `tema-1/` tiene ejemplos, y `verificar.sh` comprueba solo ese tema.
Los temas 2 a 7 no tienen carpeta todavía: no es que estén sin documentar, es que no existe nada que ejecutar.

## Qué hay

| Carpeta | Tema | Ejemplos | Errores reproducibles (`errores/`) | Por dentro (`por-dentro/`) |
|---|---|---|---|---|
| `tema-1/` | clases, objetos, campos, métodos y `this` | `ClaseYObjetos`, `SombraDeCampo` | `ThisDesdeStatic`, `MetodoSinObjeto`, `LocalSinValor`, `DosPublicasEnUnArchivo`, `ComparaTiposDistintos` | `CamposEnBytecode` |
| — | `tema-2/` constructores y orden de inicialización | pendiente | | |
| — | `tema-3/` encapsulación y modificadores de acceso | pendiente | | |
| — | `tema-4/` `static`: campos, métodos y constantes | pendiente | | |
| — | `tema-5/` paquetes e importaciones | pendiente | | |
| — | `tema-6/` `toString`, `equals` y `hashCode` | pendiente | | |
| — | `tema-7/` inmutables y `record` | pendiente | | |

Los seis nombres de los temas pendientes son el mapa de
[modulo-5.md](../../modulo-5.md), no una promesa de contenido: cada uno se abre con su carpeta, sus ejemplos
ejecutados y sus comprobaciones dentro de `verificar.sh`.

## Versiones

Lo que sigue es lo que se ejecutó para escribir el tema 1: **Temurin 27.0.1.0.2+1** en macOS arm64, compilando
con `javac --release 25`. El curso enseña Java 25, así que toda salida citada en el documento viene de un
compilador que fija el lenguaje en 25 y de una JVM 27. Queda **pendiente reejecutar con JDK 25 real**; lo único
que cambia con eso son los mensajes de texto de `javac` y del `NullPointerException`, no las cifras.

Todavía no hay proyecto Gradle en esta carpeta, así que tampoco hay versión de Gradle ni de JUnit que anotar: se
declarará cuando exista el manifiesto de carga.

## Verificar

```bash
./verificar.sh                       # 41 comprobaciones del tema 1, 0 fallidas, 0 omitidas
```

El script necesita `javac` y `java` en el `PATH`; compila con `--release 25` y ejecuta con
`-Dstdout.encoding=UTF-8`, y escribe sus `.class` en un directorio temporal, no aquí. Cada comprobación es un
fragmento literal de una salida real (o una comparación entre dos salidas), así que el script falla si el
documento cita algo que ya no ocurre.

Las 41 comprobaciones se reparten así: 16 sobre la salida de `ClaseYObjetos` (dentro van las tres de
`System.identityHashCode` forzado con `-XX:hashCode=2` y las dos de compilar con `-g` y sin `-g`), 4 de
`SombraDeCampo`, 3 de `CamposEnBytecode` ejecutado, 6 sobre el volcado `javap -c -p` de su clase anidada `Punto`
(comprendida la comparación byte a byte de que los cuerpos de `conThis` y `sinThis` salgan idénticos), 4 sobre
los `.class` que produce un solo `.java` con una anidada, 3 sobre el volcado de `main` y 5 fallos de compilación
esperados.

## Qué hay que mirar de este tema, en dos minutos

1. `SombraDeCampo.java` — es el único ejemplo del módulo cuyo bug **no produce ningún mensaje**. Compílalo con
   `-Xlint:all`: el compilador calla. Ejecútalo: un campo está en `null` y el otro no.
2. `por-dentro/CamposEnBytecode.java` — los dos métodos `conThis` y `sinThis` son dos cuerpos de bytecode
   idénticos; `javap -c -p` lo demuestra y `verificar.sh` lo compara carácter a carácter.
3. `ClaseYObjetos.java` con `-XX:+UnlockExperimentalVMOptions -XX:hashCode=2` — dos objetos distintos devuelven
   el mismo `System.identityHashCode`. Es la prueba de que ese número no sirve como identidad.
