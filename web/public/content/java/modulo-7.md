# Módulo 7: Sealed classes y pattern matching

**Prerrequisito:** `record` se enseña en [M1 T5](/curso/java/1); este módulo lo combina con jerarquías `sealed` y patrones.


## Aprende construyendo

### Tema 1: sealed — jerarquías cerradas y exhaustividad

**¿Por qué es importante?** estados de negocio conocidos no deben quedar sin manejar cuando el dominio crece.

#### Subtema 1.1: Declara estados permitidos · 10 min

**1. Contexto**

Una entrega del prototipo tiene exactamente los estados creada, en ruta o entregada.

**2. Hazlo tú**

Crea `src/EstadoEntrega.java`:

```java
sealed interface EstadoEntrega permits Creada, EnRuta, Entregada {}
record Creada() implements EstadoEntrega {}
record EnRuta(String zona) implements EstadoEntrega {}
record Entregada(String receptor) implements EstadoEntrega {}

public class EstadoEntregaDemo {
    public static void main(String[] args) {
        EstadoEntrega estado = new EnRuta("Norte");
        System.out.println(estado);
    }
}
```

Ejecuta:

```bash
javac -d out src/EstadoEntrega.java
java -cp out EstadoEntregaDemo
```

**Resultado esperado:** imprime `EnRuta[zona=Norte]`.

**Fallo deliberado:** declara otra clase `class Devuelto implements EstadoEntrega {}` sin añadirla a `permits`. **Diagnóstico:** el compilador rechaza implementaciones fuera de la lista.

**3. Entiende**

`sealed` limita las implementaciones; cada subtipo debe ser `final`, `sealed` o `non-sealed` (los records ya son finales).

**4. Cierra**

Guarda el error del compilador y la lista de estados autorizados.

#### Subtema 1.2: Añade un estado con intención · 10 min

**1. Contexto**

Operaciones necesita representar una entrega cancelada y revisar todos los puntos donde el estado se procesa.

**2. Hazlo tú**

En `src/EstadoEntrega.java`, añade `Cancelada(String motivo)` a `permits` y declara el record correspondiente. Ejecuta:

```bash
javac -d out src/EstadoEntrega.java
java -cp out EstadoEntregaDemo
```

Después busca `EstadoEntrega` en el archivo para revisar consumidores.

**Resultado esperado:** la jerarquía compila y la cancelación solo puede crearse con el motivo indicado.

**Fallo deliberado:** añade el record, pero olvida incluirlo en `permits`. **Diagnóstico:** permiso y subtipo deben concordar.

**3. Entiende**

La lista cerrada es adecuada para un dominio controlado por el mismo equipo; un punto de extensión de plugins de terceros suele necesitar una interfaz abierta.

**4. Cierra**

Registra quién puede ampliar esta jerarquía en el producto real.

#### Subtema 1.3: Distingue jerarquía cerrada de abierta · 10 min

**1. Contexto**

El equipo debe decidir si transportistas externos podrán añadir sus propios estados.

**2. Hazlo tú**

En `src/EstadoEntrega.java`, comenta `sealed` y `permits` y compila:

```bash
javac -d out src/EstadoEntrega.java
```

Observa que una implementación nueva deja de ser rechazada por la jerarquía. Restaura `sealed` y recompila.

**Resultado esperado:** identificas el cambio de contrato entre jerarquía abierta y cerrada.

**Fallo deliberado:** deja la jerarquía abierta aunque todos los consumidores dependen de conocer cada estado. **Diagnóstico:** el compilador ya no puede probar que los switches cubren todos los casos.

**3. Entiende**

La decisión afecta extensibilidad y exhaustividad; `sealed` no es una mejora automática para toda interfaz.

**4. Cierra**

Escribe una frase que justifique la decisión de RutaFlow. Fuente: [JEP 409](https://openjdk.org/jeps/409).

**Decide cuándo cerrar:** `sealed` sirve si el equipo controla los estados y puede revisar consumidores al añadir uno. Una interfaz abierta conviene si otras aplicaciones aportan implementaciones. Añade `Cancelada`, busca cada `switch` que usa `EstadoEntrega` y crea una prueba para ese estado. `permits` restringe quién implementa la jerarquía, pero no valida los datos del record. Fuente: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html.

**Proyecto integrador:** el motor de asignación de entregas modela sus estados de guía con esta misma jerarquía `sealed`, porque el equipo controla exactamente qué estados existen. **Práctica:** agrega un cuarto estado `Rechazada(String motivo)` a `permits`, declara su record y corrige el `switch` del Tema 2 hasta que vuelva a ser exhaustivo.

### Tema 2: Pattern matching exhaustivo y para instanceof

**¿Por qué es importante?** manejar cada estado evita que una regla de negocio asigne un resultado incorrecto a un tipo nuevo.

#### Subtema 2.1: Calcula una regla con switch · 10 min

**1. Contexto**

Solo las entregas aún activas se pueden reprogramar.

**2. Hazlo tú**

Crea `src/Reprogramar.java` con `EstadoEntrega` y sus records del Tema 1. Añade:

```java
static boolean sePuedeReprogramar(EstadoEntrega e) {
    return switch (e) {
        case Creada c -> true;
        case EnRuta r -> true;
        case Entregada x -> false;
    };
}
public static void main(String[] args) {
    System.out.println(sePuedeReprogramar(new EnRuta("Norte")));
}
```

Compila ambos archivos juntos y ejecuta:

```bash
javac -d out src/EstadoEntrega.java src/Reprogramar.java
java -cp out Reprogramar
```

**Resultado esperado:** `true`, sin casteos manuales ni rama `default`.

**Fallo deliberado:** añade `Cancelada` al `permits` sin rama al `switch`. **Diagnóstico:** vuelve a compilar; el error señala el switch no exhaustivo.

**3. Entiende**

El patrón del `case` comprueba el subtipo y declara una variable con tipo correcto. `sealed` permite que el compilador conozca todos los casos.

**4. Cierra**

Guarda el error de exhaustividad y la corrección.

#### Subtema 2.2: Extrae el tipo con instanceof · 10 min

**1. Contexto**

Un resumen necesita mostrar la zona solo cuando el estado es `EnRuta`.

**2. Hazlo tú**

En `src/Reprogramar.java` agrega `if (estado instanceof EnRuta ruta) System.out.println(ruta.zona());` y ejecútalo con `new EnRuta("Norte")`:

```bash
javac -d out src/EstadoEntrega.java src/Reprogramar.java
java -cp out Reprogramar
```

**Resultado esperado:** imprime `Norte` sin casteo posterior.

**Fallo deliberado:** usa `estado.zona()` antes de verificar su tipo. **Diagnóstico:** `EstadoEntrega` no define ese método; primero comprueba `instanceof EnRuta`.

**3. Entiende**

La variable `ruta` solo existe donde la comprobación garantiza que el objeto es de ese tipo.

**4. Cierra**

Conserva el fragmento y señala la comprobación que hace seguro el acceso.

#### Subtema 2.3: Compara con casteo clásico · 10 min

**1. Contexto**

Revisas código heredado que comprueba el tipo y después realiza un cast explícito.

**2. Hazlo tú**

En `src/Reprogramar.java` implementa una segunda versión con `if (estado instanceof EnRuta) { EnRuta ruta = (EnRuta) estado; ... }`. Ejecuta ambas variantes con `EnRuta` y `Entregada`:

```bash
javac -d out src/EstadoEntrega.java src/Reprogramar.java
java -cp out Reprogramar
```

**Resultado esperado:** ambas dan el mismo resultado; pattern matching elimina el cast repetido.

**Fallo deliberado:** cambia el tipo del cast por `Entregada`. **Diagnóstico:** el patrón clásico puede fallar en ejecución si el cast no coincide; usa el tipo ligado por `instanceof`.

**3. Entiende**

Usa switch para clasificar todos los casos; usa `instanceof` cuando solo necesitas una rama condicional.

**4. Cierra**

Elige una forma para la regla completa y justifica tu elección. Fuente: [pattern matching en Java](https://docs.oracle.com/en/java/javase/25/language/pattern-matching.html).

**Proyecto integrador:** la regla de reprogramación del motor de entregas usa exactamente este `switch` exhaustivo sobre `EstadoEntrega`, de modo que agregar un estado nuevo obliga a actualizar la regla en tiempo de compilación. **Límite:** usa `switch` con pattern matching cuando necesitas cubrir todos los subtipos de una jerarquía `sealed`; usa `instanceof` suelto solo para una comprobación puntual de un único tipo, no para clasificar varios casos a la vez. **Práctica:** agrega el estado `Rechazada` (del Tema 1) a `sePuedeReprogramar` y confirma que el compilador exige la rama nueva.

### Tema 3: Unnamed variables y patterns (_, Java 22)

**¿Por qué es importante?** distinguir lo que se descarta intencionalmente de una variable olvidada reduce ruido y hace visibles errores reales.

#### Subtema 3.1: Descarta un componente de record pattern · 10 min

**1. Contexto**

El aviso solo requiere mostrar el destino; las dimensiones del paquete no intervienen.

**2. Hazlo tú**

Crea `src/ResumenPaquete.java`:

```java
record Dimensiones(int x, int y, int z) {}
record Paquete(Dimensiones dimensiones, String destino) {}
public class ResumenPaquete {
    static String resumen(Object valor) {
        return switch (valor) {
            case Paquete(Dimensiones _, String destino) -> "Destino: " + destino;
            default -> "No es un paquete";
        };
    }
    public static void main(String[] args) {
        System.out.println(resumen(new Paquete(new Dimensiones(1, 2, 3), "Norte")));
    }
}
```

Compila y ejecuta:

```bash
javac -d out src/ResumenPaquete.java
java -cp out ResumenPaquete
```

**Resultado esperado:** `Destino: Norte`.

**Fallo deliberado:** intenta usar `_` como variable dentro del resultado. **Diagnóstico:** el guion bajo marca un valor descartado y no crea un binding.

**3. Entiende**

El record pattern separa la forma del dato de los componentes que necesita el código.

**4. Cierra**

Guarda la salida y marca qué componente se ignoró deliberadamente.

#### Subtema 3.2: Ignora una excepción sin ocultar el caso · 10 min

**1. Contexto**

El programa convierte una cantidad opcional y usa un valor predeterminado ante texto inválido; no necesita imprimir el stack trace en esta demo.

**2. Hazlo tú**

Crea `src/Convertir.java` con `try { System.out.println(Integer.parseInt(args[0])); } catch (NumberFormatException _) { System.out.println("Cantidad inválida"); }`. Ejecuta:

```bash
javac -d out src/Convertir.java
java -cp out Convertir abc
```

**Resultado esperado:** imprime `Cantidad inválida` sin declarar una excepción que no se usa.

**Fallo deliberado:** captura `Exception _` y continúa como si nada para cualquier error. **Diagnóstico:** captura la excepción concreta que sabes manejar; no escondas fallos de programación.

**3. Entiende**

`_` indica descarte deliberado, pero no convierte automáticamente una recuperación segura en tal.

**4. Cierra**

Explica por qué se captura `NumberFormatException` y no `Exception`.

#### Subtema 3.3: Escribe texto multilínea legible · 10 min

**1. Contexto**

Una consulta SQL de reporte es más fácil de revisar en varias líneas que como concatenación larga.

**2. Hazlo tú**

Crea `src/Consulta.java` y asigna a `String sql` el text block `"""\nSELECT numero, estado\nFROM entregas\nWHERE estado = 'EN_RUTA'\n""";`. Imprime el texto y ejecuta:

```bash
javac -d out src/Consulta.java
java -cp out Consulta
```

**Resultado esperado:** tres líneas legibles; no necesitas concatenar ni escapar cada salto de línea.

**Fallo deliberado:** mueve la comilla de cierre al inicio de línea y compara sangría. **Diagnóstico:** la posición del cierre participa en qué sangría incidental se elimina.

**3. Entiende**

Los text blocks sirven para texto multilínea; no validan ni parametrizan una consulta SQL.

**4. Cierra**

Guarda la consulta y anota qué mecanismo usarías para valores dinámicos. Fuente: [variables y patrones sin nombre](https://openjdk.org/jeps/456).

**Proyecto integrador:** el resumen de paquetes del motor de entregas descarta las dimensiones con `_` en el record pattern cuando el reporte solo necesita el destino, igual que en el Subtema 3.1. **Límite:** usa `_` solo cuando de verdad no vas a leer ese valor en ningún punto del bloque; si existe la posibilidad de necesitarlo más adelante, dale un nombre real en vez de descartarlo prematuramente. **Práctica:** modifica `ResumenPaquete.java` para agregar un segundo caso que también muestre el volumen (`x * y * z`) cuando el destino sea `"Norte"`, sin descartar `Dimensiones` en ese caso.

---

## Construcción guiada del capítulo

**Objetivo del laboratorio:** modelar un dominio inmutable con records y sealed interfaces, con pattern matching exhaustivo.

**Requisitos previos:** Módulos 0-6 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Definir `Punto` como record | Ver Tema 5 del Módulo 1 | Verifica los métodos generados automáticamente |
| 2 | Definir `Forma` como sealed interface | Ver Tema 1 | Con `Circulo` y `Cuadrado` como records |
| 3 | Escribir un switch exhaustivo sin `default` | Ver Tema 2 | Verifica el error del compilador si falta un caso |
| 4 | Usar pattern matching para instanceof | Ver Tema 2 | Sin casteo manual |
| 5 | Escribir un text block para SQL multilínea | Ver Tema 3 | Con `"""`, cuidando la sangría de la comilla de cierre |
| 6 | Descartar un componente de un record pattern con `_` | Ver Tema 3 | Sin ruido de lint por variables no utilizadas |

**Verificación:** el laboratorio se considera exitoso si agregar una nueva implementación a `permits` sin actualizar el switch existente produce un error de compilación (no un bug silencioso), si el modelo de dominio es completamente inmutable, y si el linter no reporta ninguna advertencia sobre los componentes descartados con `_`.

**Errores comunes y soluciones**

- **Agregar una rama `default` innecesaria a un switch exhaustivo sobre una sealed interface.** Omítela para que el compilador verifique exhaustividad real.
- **Intentar mutar un componente de un record.** Los records son inmutables; construye una nueva instancia con los valores actualizados.
- **Usar el casteo manual clásico donde pattern matching para instanceof sería más claro.** Prefiere `if (obj instanceof Tipo variable)`.
- **Nombrar un binding descartado con un identificador real.** Usa `_` para que el linter no mezcle ese ruido con advertencias legítimas de variables olvidadas.

---
