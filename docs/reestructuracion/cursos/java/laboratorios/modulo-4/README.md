# Java · Laboratorio del módulo 4 · Arreglos y primeras colecciones

Código de todos los ejemplos de [modulo-4.md](../../modulo-4.md) y el **manifiesto de carga** de
`rutaflow-nucleo`: las tres formas de crear un arreglo y sus valores por defecto, las matrices y la clase
`Arrays`, la covarianza con su `ArrayStoreException`, `ArrayList` y `HashMap`, los envoltorios con la caché
de `Integer` y dos algoritmos escritos a mano con su coste contado. Al publicar el curso, esta carpeta pasa a
`examples/java/modulo-4/`.

## Qué cambia respecto al módulo 3

Parte del proyecto Gradle de los módulos 0 a 3 (mismo wrapper, toolchain y catálogo). Cambia:

- `src/main/java/rutaflow/nucleo/Manifiesto.java`: nuevo punto de entrada (sustituye a `Despachador`). Resuelve
  el mismo manifiesto de guías **dos veces**: con arreglos (`gramos`, `suma`, `mayor`, `sobreElTope`,
  `mayoresQue`, `sinMalformados`, `primerMayorQue` —los dos últimos con `Arrays.sort` +
  `Arrays.binarySearch`—) y con colecciones (`gramosLista`, `totalesPorZona` con `merge`, `mayoresQueLista`,
  `zonaDe`, `totalesOrdenados` —copia `keySet()` a un `ArrayList`, lo ordena con `Collections.sort` y lee el mapa
  por clave, que es la forma determinista de imprimir un `HashMap`—). `main` acepta el tope como `args[0]`.
- Se va `Despachador.java`: era el motor del módulo 3 y aquí no se usa. `Zona.java` se conserva intacto.
- Pruebas: `ManifiestoTest`, **9 pruebas**. Cada una compara las dos versiones del mismo cálculo —longitud,
  suma ignorando malformadas, mayor sin inventar sobre el manifiesto vacío, corte por tope, filtro contra
  `binarySearch`, lista contra arreglo, `merge` acumulando, los dos reportes cuadrando y leer la zona sin que
  la guía tenga tres partes— en vez de comprobar un resultado suelto.
- `build.gradle.kts`: versión 0.5.0 y clase principal `rutaflow.nucleo.Manifiesto`.

Para ver una prueba fallar y luego pasar: en `Manifiesto.mayoresQue` cambia la frontera
`ordenado[desde] <= tope` por `ordenado[desde] < tope` y ejecuta `./gradlew test`: falla
`contarConBusquedaCoincideConFiltrar` con `tope 700` —el corte deja entrar la guía de exactamente 700 g, pero
el conteo con `binarySearch` la deja fuera— y las otras ocho siguen en verde. Cambia también
`totales.merge(zona, g, Integer::sum)` por `totales.put(zona, g)` y fallan dos:
`losTotalesPorZonaAcumulan` (NORTE pasa de 1950 a 700: la segunda guía borra a la primera) y
`lasDosVersionesDelReporteCuadran`, que imprime los totales. Restaura y vuelve a verde.

## Versiones

JDK 25 (toolchain) · Gradle 9.8.2 (wrapper) · JUnit 6.0.3 (`gradle/libs.versions.toml`).

## Verificar

```bash
./verificar.sh                                             # necesita JDK 25 en PATH
GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts" ./verificar.sh
EXIGIR_GRADLE=1 ./verificar.sh                             # convierte en fallo la omisión de Gradle
```

El segundo mando es para una máquina **sin JDK 25 instalado**: `.herramienta-local.init.gradle.kts` no forma
parte del curso, es un script de inicialización de Gradle que presta el toolchain 27 para que el `test` se
ejecute aquí. Con JDK 25 instalado no hace falta nada de eso: basta `./verificar.sh`.

## Qué hay

| Carpeta | Tema | Ejemplos | Errores reproducibles (`errores/`) | Por dentro (`por-dentro/`) |
|---|---|---|---|---|
| `tema-1/` | crear el arreglo, recorrerlo y qué hay dentro antes de escribir | `CrearYRecorrer`, `ValoresPorDefecto` | `IndiceHastaLength`, `IndiceNegativo`, `ConfundeParentesisConLength`, `InicializadorFueraDeDeclaracion` | `FormaDeUnArreglo` |
| `tema-2/` | matrices y la clase `Arrays` | `Matrices`, `UsosDeArrays`, `BuscaSinOrdenar`, `UnaListaDeUnArreglo` | `SinMetodosPropios`, `FilaNula`, `AsListDePrimitivos`, `AnadeAAsList` | `FormaDeUnaMatriz` |
| `tema-3/` | covarianza y `ArrayStoreException` | `Covarianza`, `EscribeEnObject` | `CastInvalido`, `ListaNoCovariante`, `PrimitivosNoSonObjectArray` | `UnaInstruccionParaGuardar`, `ListaSinGuarda`, `MatrizCovariante` |
| `tema-4/` | `ArrayList` y `HashMap` | `ListaDeGuias`, `MapaDeZonas`, `BorrarSinRomper`, `FijasYMutables` | `IterarYBorrar`, `VaciaConIndice`, `ImmutablesNoCrecen` | `RecorridoEnBytecode`, `Crecimiento` |
| `tema-5/` | envoltorios, autoboxing y la caché de `Integer` | `EncajarYDesencajar`, `CacheDeInteger` | `SumaCajaNula`, `TernarioDesempacota`, `LongSinEle`, `BordeDeByte` | `AutoboxingEnBytecode` |
| `tema-6/` | búsqueda e inserción escritas a mano y su coste | `BuscarYOrdenarAMano`, `Crecimiento`, `OrdenRoto` | `BurbujaFueraDeRango`, `BusquedaQueNoTermina`, `ComparaConMenorQue` | `CosteEnBytecode` |
| raíz | manifiesto de carga | proyecto Gradle con las 9 pruebas | — | — |

Cada ejemplo se ejecuta compilando con `javac --release 25 -d out clase.java` y luego
`java -Dstdout.encoding=UTF-8 -cp out Clase`. Hay **una excepción**: `tema-4/por-dentro/Crecimiento.java` lee
por reflexión el arreglo interno `elementData` de `ArrayList`, así que necesita
`java --add-opens java.base/java.util=ALL-UNNAMED -cp out Crecimiento`; sin la apertura el propio programa lo
dice (`sin la apertura no hay medida: InaccessibleObjectException`) y sale con código 1, es decir **falla en vez
de fingir**. Los de `errores/` están hechos para fallar: unos no compilan y
otros lanzan una excepción; `verificar.sh` comprueba el mensaje exacto.

## Estado de la verificación (2026-11-21, Temurin 27.0.1.0.2+1, macOS arm64, locale `es_CO`)

- **Ejecutado y comprobado:** `GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts"
  ./verificar.sh` termina en `RESULTADO: OK` con **188** comprobaciones, 0 fallidas y 0 omitidas. De esas
  188, 184 son los ejemplos sueltos de los seis temas —todos compilados con `javac --release 25` y ejecutados
  con la JVM 27— y 4 el proyecto Gradle. Reparto por bloque: T1 25 · T2 35 · T3 30 · T4 43 · T5 29 · T6 22 ·
  Gradle 4. El total subió de 187 a 188 porque `EncajarYDesencajar.java` ahora imprime el caso del literal que
  cabe en `byte` y se encaja, y esa línea tiene su comprobación nueva; las dos del contador por zona siguen
  apuntando a las líneas `… ordenado`.
- **Sin el script de inicialización** (`GRADLE="./gradlew --offline"`) fallan exactamente las 3 de Gradle
  (`Cannot find a Java installation … matching {languageVersion=25}`) y el total queda en 185 / 3 / 0; la
  comprobación del `build.gradle.kts` no invoca Gradle y sigue en verde.
- **Dos comprobaciones escritas a mano fallaron en la primera corrida** y se corrigieron mirando la salida,
  no aflojando el filtro: se esperaba una línea `String[][]` que `FormaDeUnArreglo.java` nunca imprime (la
  que sí imprime es `clase real de un int[][] : [[I`), y se buscaba la palabra `aastore` en la **salida de
  consola** de `UnaInstruccionParaGuardar.java`, donde solo aparece en el `javap` —esa ya la cubre la
  comprobación de bytecode.
- **Proyecto Gradle, ejecutado con el wrapper y otra toolchain:** `./gradlew --offline -I
  .herramienta-local.init.gradle.kts test` — 9 pruebas en verde. `run` sin argumentos imprime `suma: 8340`,
  `mayor: 3400`, `sobre el tope 1000 : [1250, 2100, 3400] · contando con binarySearch: 3` y
  `las dos versiones cuadran: true`; con `--args="2100"` el corte deja `sobre el tope 2100 : [3400]` y la
  cantidad en `1`. Las dos rutas —arreglos y colecciones— dan la misma suma, el mismo mayor y el mismo
  conjunto filtrado. La distribución 9.8.2 y JUnit 6.0.3 salen de la caché local (`--offline`).
- **Cosas que dependen de la JVM y no del lenguaje: se comprueban invariantes, no cifras.** El orden de un
  `HashMap` no es estable: `MapaDeZonas.java` imprime el contador dos veces —una cruda (`merge acumulando`) y una
  ordenada por clave (`merge ordenado`, con el helper `porClave`)— y las dos comprobaciones del contador cifran
  **la ordenada**. La cruda sigue imprimiéndose para que se vea la diferencia, pero ninguna puerta la compara.
  Del `HashMap` solo se comprueba el invariante «no conserva el orden de inserción» (`… ? false`); la secuencia
  literal sí se cita de `LinkedHashMap` (`[Medellin, Bogota, Cali]`), que es garantía de contrato. La caché de
  `Integer` es configurable: `-Djava.lang.Integer.IntegerCache.high=5000` movió el corte medido de `128` a `5001`
  en esta misma máquina, así que el documento enseña el corte como algo que **se mide**, no como un 127 perpetuo. El
  número de marcos y los `stack trace` internos (`ArrayList$Itr.checkForComodification(ArrayList.java:1104)`)
  nunca entran en una comprobación; los textos de excepción sí se citan literalmente porque los emite la
  biblioteca (`Index 5 out of bounds for length 5`,
  `Cannot read the array length because "porFila[i]" is null`,
  `class java.lang.Integer cannot be cast to class java.lang.String`). Lo que se evita es imprimir el
  `toString` de un arreglo —`[[I@1b6d3586` lleva hash de identidad—: esa línea se cambió por tres hechos
  deterministas: «empieza `[[I`», «tiene `@`» y «2 trozos».
- **Diez creencias habituales que la máquina desmintió mientras se escribía el módulo**, y que por eso tienen
  su comprobación en `verificar.sh`:
  1. «un arreglo de arreglos ya trae filas»: `new int[3][]` crea **tres `null`**, y el primer
     `porFila[i].length` lanza `NullPointerException`. Las filas hay que crearlas.
  2. «`final int[][] POR_FILA = …` congela la matriz»: congela la referencia. `POR_FILA[0][0] = 9999` sigue
     siendo legal y se ve al leerla.
  3. «`Arrays.asList` copia los datos»: es una **vista**; `vista.set(0, …)` modifica el arreglo original y
     `add` lanza `UnsupportedOperationException`.
  4. «`Arrays.asList(int[])` da una lista de números»: da una lista de **un** elemento, y ese elemento se
     firma `[I`. Con `Integer[]` salen los tres elementos.
  5. «`binarySearch` sobre un arreglo desordenado es solo ineficiente»: es **falso**. Medido: sobre
     `[1250, 3400, 890, 7600, 250]` devuelve `2` para 1250 (acierto casual) y `-1` para 890, que sí está en
     el índice 3.
  6. «`Object[]` y `String[]` son intercambiables»: hacia arriba sí (misma identidad, sin copia), y la
     escritura ilegal deja el arreglo **a medio escribir** con `ArrayStoreException`; el cast de vuelta falla
     al **leer** con `ClassCastException`, y `Object[]` → `String[]` lo niega la JVM en tiempo de ejecución.
  7. «`pesos.remove(1)` quita el valor 1» en una `List<Integer>`: quita la **posición** (queda `[10, 7]`);
     por valor hay que escribir `remove(Integer.valueOf(7))`.
  8. «`(bajo + alto) / 2` no tiene nada que ver con el desbordamiento de `int`»: medido en `OrdenRoto`, con
     `bajo = Integer.MAX_VALUE - 1` y `alto = Integer.MAX_VALUE` da `-1` —y con `bajo = MAX_VALUE - 2` da `-2`: el
     valor depende de cuánto se salga la suma—, así que la búsqueda se va por el lado equivocado sin avisar.
     `bajo + (alto - bajo) / 2` da `2147483646` en los dos casos.
  9. «la covarianza es cosa de la primera fila»: en `Object[][] vista = new String[2][]` la guarda se hace
     contra el **componente**, que es `String[]`, así que `vista[0] = new Integer[1]` también se rechaza —
     medido en `MatrizCovariante`, con mensaje `[Ljava.lang.Integer;` y la casilla 0 en `null` mientras la 1
     acepta su `String[]`.
  10. «`ArrayList` se agranda en cada `add`»: medido por reflexión sobre `elementData`, el hueco pasa
      `0 → 10 → 15 → 22`, o sea **hueco viejo + hueco viejo/2** en dos saltos (5 y 7 casillas nuevas), no uno
      por elemento. Sin `--add-opens java.base/java.util=ALL-UNNAMED` el programa no mide: avisa y sale con 1.
- **Pendiente en el Mac del dueño:** `./verificar.sh` con JDK 25 en PATH (sin el script de inicialización) y
  `EXIGIR_GRADLE=1 ./verificar.sh`.
