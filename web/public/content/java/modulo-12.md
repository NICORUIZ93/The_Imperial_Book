# Módulo 12: Buenas prácticas y patrones de diseño


## Aprende construyendo

### Tema 1: Builder — configuración paso a paso y validación

**¿Por qué es importante?** cuando un objeto tiene varios datos opcionales, Builder evita constructores largos y deja visibles las opciones elegidas.

#### Subtema 1.1: Crea un envío con un builder · 10 min

**1. Contexto**

Una guía tiene datos requeridos y opciones como firma o entrega prioritaria.

**2. Hazlo tú**

Crea `src/Envio.java` con un `record Envio(String guia, boolean prioritario)` y una clase anidada `Builder` que guarde `guia`, exponga `prioritario(boolean)` y construya el record en `build()`. En `main`, imprime `new Envio.Builder("RT-1").prioritario(true).build()`. Ejecuta `javac -d out src/Envio.java` y `java -cp out Envio`.

**Resultado esperado:** se construye `Envio[guia=RT-1, prioritario=true]` sin pasar opciones en un constructor largo.

**Fallo deliberado:** omite `guia` al crear el builder. **Diagnóstico:** el builder debe rechazarlo al construir, antes de crear el envío.

**3. Entiende**

El builder acumula opciones y `build()` valida el objeto final.

**4. Cierra**

Conserva la salida e indica qué dato era obligatorio.

#### Subtema 1.2: Valida reglas en build() · 10 min

**1. Contexto**

Un paquete prioritario debe tener una ventana horaria válida.

**2. Hazlo tú**

En `src/Envio.java`, añade `String ventana` con método `ventana(String)` al builder. En `build()`, lanza `IllegalStateException` si `prioritario` y `ventana` está vacía. Ejecuta `javac -d out src/Envio.java` y `java -cp out Envio` con una variante prioritaria sin ventana.

**Resultado esperado:** el objeto inválido se rechaza al finalizar el builder.

**Fallo deliberado:** valida solo dentro del setter. **Diagnóstico:** el orden de llamadas puede dejar una combinación inválida; valida el estado completo en `build()`.

**3. Entiende**

La validación del resultado pertenece a la construcción final; un setter individual no conoce las otras opciones.

**4. Cierra**

Guarda el error y la configuración que sí cumple la regla.

#### Subtema 1.3: Decide si Builder es necesario · 10 min

**1. Contexto**

Un objeto de dos campos simples puede ser más claro con un constructor directo.

**2. Hazlo tú**

En `src/Envio.java`, implementa una variante de dos campos con constructor directo y otra con Builder. Ejecuta `javac -d out src/Envio.java` y `java -cp out Envio`; compara llamadas con uno y cinco campos opcionales.

**Resultado esperado:** identificas desde qué complejidad el encadenamiento mejora la lectura.

**Fallo deliberado:** añade un builder a cada tipo, incluso a un record de dos datos. **Diagnóstico:** elimina pasos sin decisión del usuario; el patrón tiene coste de código propio.

**3. Entiende**

Builder ayuda cuando hay muchas opciones o validación conjunta. Para pocos valores, constructor o record suele ser suficiente.

**4. Cierra**

Escribe el criterio que usaría el equipo antes de añadir Builder.

**Decisión de diseño:** compara `new Envio("RT-1", true, "10-12", false)` con `new Envio.Builder("RT-1").prioritario(true).ventana("10-12").build()`. Builder ayuda si hay varias opciones o combinaciones que deben validarse juntas. Con dos campos obligatorios, un constructor directo puede ser más claro. Lee la llamada desde quien crea el objeto y pregunta si debe recordar el orden de varios booleanos. Prueba que `build()` rechace configuraciones incompletas antes de devolver el objeto. Fuente primaria: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html.

### Tema 2: Factory Method y Strategy

**¿Por qué es importante?** separar la creación de una regla intercambiable reduce condicionales repetidos en el servicio.

#### Subtema 2.1: Elige estrategia por interfaz · 10 min

**1. Contexto**

La tarifa cambia según entrega estándar o prioritaria.

**2. Hazlo tú**

Crea `src/Tarifas.java` con `interface Tarifa { int calcular(int gramos); }`, dos implementaciones `Estandar` y `Prioritaria`, y un `main` que invoque ambas para 300 g. Ejecuta `javac -d out src/Tarifas.java` y `java -cp out Tarifas`.

**Resultado esperado:** la misma llamada produce tarifas distintas según estrategia.

**Fallo deliberado:** llama directamente a `new Estandar()` dentro del método de todas las pantallas. **Diagnóstico:** inyecta la interfaz para que el consumidor no dependa de una clase concreta.

**3. Entiende**

Strategy cambia el algoritmo elegido; la interfaz mantiene estable al consumidor.

**4. Cierra**

Guarda dos resultados y señala qué implementación se puede cambiar.

#### Subtema 2.2: Crea el objeto con Factory Method · 10 min

**1. Contexto**

Un servicio recibe un nombre de transportista y debe crear su estrategia correspondiente.

**2. Hazlo tú**

En `src/Tarifas.java`, añade `static Tarifa crear(String tipo)` que devuelva `new Estandar()` para `"estandar"` y `new Prioritaria()` para `"prioritaria"`; rechaza el resto. Ejecuta `javac -d out src/Tarifas.java` y `java -cp out Tarifas`.

**Resultado esperado:** el consumidor recibe una `Tarifa` sin conocer sus clases internas.

**Fallo deliberado:** devuelve `null` para un tipo desconocido. **Diagnóstico:** falla lejos del punto de entrada; lanza error con el valor recibido.

**3. Entiende**

Factory Method decide qué implementación crear; Strategy define qué comportamiento puede intercambiarse.

**4. Cierra**

Conserva el nombre de estrategia elegido y cómo se maneja un tipo desconocido.

#### Subtema 2.3: Inyecta la estrategia en el servicio · 10 min

**1. Contexto**

`Cotizador` no debe decidir la tarifa y calcularla a la vez.

**2. Hazlo tú**

Crea `src/Cotizador.java` con constructor que reciba `Tarifa` y método `cotizar(int gramos)` que delegue en `calcular`. En `main`, crea cotizadores con las dos estrategias de `Tarifas.java`. Ejecuta `javac -d out src/Tarifas.java src/Cotizador.java` y `java -cp out Cotizador`.

**Resultado esperado:** el mismo servicio trabaja con ambas tarifas mediante la interfaz.

**Fallo deliberado:** cambia `Cotizador` para instanciar `Estandar` internamente. **Diagnóstico:** vuelve a inyectar el contrato; la selección pertenece a la composición de la aplicación.

**3. Entiende**

Separar selección, algoritmo y uso evita que el servicio acumule creación y reglas de precio.

**4. Cierra**

Guarda el ejemplo con estrategia inyectada y di cuál clase ensambla el sistema.

**Comprueba los papeles:** Strategy cambia el cálculo; Factory Method escoge cuál implementación entregar. `Cotizador` recibe `Tarifa` y delega el cálculo, mientras una fábrica convierte el nombre de transportista en una estrategia conocida. Prueba ambas tarifas y un nombre desconocido. Rechaza ese nombre en el borde; no permitas que una cadena del usuario cargue clases arbitrarias. Si solo existe un algoritmo, no añadas fábrica e interfaz hasta que haya variación real que proteger. Fuente: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/Function.html.

### Tema 3: Abstract Factory y familias de productos compatibles

**¿Por qué es importante?** una fábrica abstracta crea un grupo de componentes que comparten proveedor o configuración.

#### Subtema 3.1: Define una familia de notificaciones · 10 min

**1. Contexto**

RutaFlow envía mensajes por correo o por SMS, pero el servicio debe usar el mismo contrato.

**2. Hazlo tú**

Crea `src/Notificaciones.java` con `interface Mensaje { String enviar(String texto); }`, `Correo` y `Sms` que implementen el contrato. En `main` invoca ambas implementaciones. Ejecuta `javac -d out src/Notificaciones.java` y `java -cp out Notificaciones`.

**Resultado esperado:** cada transporte entrega el mensaje con su propio formato.

**Fallo deliberado:** el servicio usa métodos específicos que solo existen en `Sms`. **Diagnóstico:** consume la abstracción común cuando el flujo no necesita funciones exclusivas.

**3. Entiende**

Un producto común evita acoplar al consumidor al protocolo concreto.

**4. Cierra**

Conserva la salida de ambos transportes.

#### Subtema 3.2: Construye familias compatibles · 10 min

**1. Contexto**

Una instalación puede elegir proveedor local o proveedor cloud; plantilla y transporte deben corresponder al mismo proveedor.

**2. Hazlo tú**

En `src/Notificaciones.java`, define `interface FabricaAvisos { Mensaje crearMensaje(); Plantilla crearPlantilla(); }` y crea `FabricaLocal` y `FabricaCloud`. Agrega tipos `PlantillaLocal` y `PlantillaCloud`. Ejecuta `javac -d out src/Notificaciones.java` y `java -cp out Notificaciones` imprimiendo los tipos creados.

**Resultado esperado:** una fábrica entrega solo productos de una familia compatible.

**Fallo deliberado:** combina fábrica local con plantilla cloud a mano. **Diagnóstico:** cambia el consumidor para pedir ambos productos a la misma fábrica.

**3. Entiende**

Abstract Factory crea familias de objetos relacionados; no es necesaria si solo existe un objeto sencillo.

**4. Cierra**

Anota qué familia selecciona cada fábrica.

#### Subtema 3.3: Añade una familia nueva sin cambiar el cliente · 10 min

**1. Contexto**

Operaciones quiere añadir proveedor regional manteniendo el mismo flujo de envío.

**2. Hazlo tú**

En `src/Notificaciones.java`, implementa `FabricaRegional` con `MensajeRegional` y `PlantillaRegional`. Cambia `main` para construirlo como `FabricaAvisos`, sin preguntar por clases concretas. Compila y ejecuta con `javac -d out src/Notificaciones.java` y `java -cp out Notificaciones`.

**Resultado esperado:** el cliente usa la nueva familia mediante el mismo contrato.

**Fallo deliberado:** agrega `if (proveedor.equals("regional"))` al cliente para cada producto. **Diagnóstico:** traslada la decisión a la fábrica y deja al cliente dependiente del contrato.

**3. Entiende**

Añadir una familia puede requerir una nueva fábrica y productos; el contrato del consumidor no cambia.

**4. Cierra**

Guarda la familia nueva y explica por qué es compatible.

**Prueba la familia:** pide `crearMensaje()` y `crearPlantilla()` a la misma fábrica, imprime el proveedor de ambos y comprueba que coincida. Intenta combinar una plantilla cloud con un mensaje local para observar el error que evita la fábrica. Tiene sentido si varios objetos deben cambiar juntos según proveedor o configuración. Si solo hay un producto, la abstracción añade navegación sin proteger una variación real. Deja al cliente dependiente del contrato común. Fuente: https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html.

### Tema 4: SOLID y cuándo NO aplicar un patrón

**¿Por qué es importante?** SOLID ayuda a señalar responsabilidades mezcladas y dependencias rígidas; no exige crear una clase por cada línea.

#### Subtema 4.1: Separa responsabilidades · 10 min

**1. Contexto**

Una clase `Envio` valida datos, guarda en disco y manda correo; un cambio de correo puede romper la validación.

**2. Hazlo tú**

Crea `src/Envio.java` con el record de datos y mueve persistencia a `RepositorioEnvios` y notificación a `Avisador`. En `src/Main.java` instancia cada pieza y coordina una entrega. Ejecuta `javac -d out src/Envio.java src/Main.java`.

**Resultado esperado:** cada clase tiene un cambio principal que puede describirse en una frase.

**Fallo deliberado:** crea una clase distinta para cada instrucción sin cohesión compartida. **Diagnóstico:** agrupa operaciones que cambian por la misma razón; SRP no es “una clase por método”.

**3. Entiende**

Responsabilidad única significa un motivo principal para cambiar, no un número fijo de líneas.

**4. Cierra**

Escribe el motivo de cambio de cada clase final.

#### Subtema 4.2: Sustituye una implementación sin romper el contrato · 10 min

**1. Contexto**

El servicio debe trabajar con cualquier repositorio que cumpla `RepositorioEnvios`.

**2. Hazlo tú**

En `src/Envio.java`, declara la interfaz `RepositorioEnvios { void guardar(String guia); }` y las clases `RepositorioMemoria` y `RepositorioArchivo` que implementan el método. Crea `src/Main.java` que reciba la interfaz por constructor y pruébala con ambas clases. Ejecuta `javac -d out src/Envio.java src/Main.java` y `java -cp out Main`.

**Resultado esperado:** `Main` compila sin importar una clase concreta.

**Fallo deliberado:** agrega un método exclusivo a una implementación y llámalo desde `Main`. **Diagnóstico:** el consumidor debe depender del contrato común, no de un detalle de una variante.

**3. Entiende**

Abierto/cerrado favorece añadir una implementación sin editar al consumidor; sustitución exige que las implementaciones respeten el contrato.

**4. Cierra**

Anota qué variante pudiste sustituir y qué regla debe compartir.

#### Subtema 4.3: Invierte la dependencia hacia una abstracción · 10 min

**1. Contexto**

La regla de negocio no debe importar una librería de base de datos concreta.

**2. Hazlo tú**

Crea `src/ServicioEnvios.java` que reciba `RepositorioEnvios` por constructor y llame `guardar`. Crea `src/Main.java` que ensamble `ServicioEnvios` con `RepositorioMemoria`. Ejecuta `javac -d out src/Envio.java src/ServicioEnvios.java src/Main.java` y `java -cp out Main`.

**Resultado esperado:** el servicio depende de interfaz y la aplicación elige la implementación.

**Fallo deliberado:** instancia `new RepositorioArchivo()` dentro de `ServicioEnvios`. **Diagnóstico:** mueve la selección a la composición para poder sustituir la dependencia en test o producción.

**3. Entiende**

La inversión de dependencias dirige ambos lados hacia una abstracción; no significa que todos los tipos deban convertirse en interfaces.

**4. Cierra**

Dibuja la dependencia entre servicio, interfaz e implementación. Fuente: [SOLID en Dev.java](https://dev.java/learn/).

### Tema 5: Prototype: copiar un objeto sin compartir sus datos

**¿Por qué es importante?** una copia independiente permite partir de una configuración base y modificarla sin contaminar la original.

#### Subtema 5.1: Implementa una copia independiente · 10 min

**1. Contexto**

Una plantilla de paquete se usa para preparar varias entregas.

**2. Hazlo tú**

Crea `src/Paquete.java` con campos `String guia`, `List<String> etiquetas` y constructor de copia que cree `new ArrayList<>(original.etiquetas)`. En `main`, copia, agrega una etiqueta a la copia y muestra ambas listas. Ejecuta `javac -d out src/Paquete.java` y `java -cp out Paquete`.

**Resultado esperado:** la etiqueta nueva aparece solo en la copia.

**Fallo deliberado:** asigna `etiquetas = original.etiquetas` en el constructor de copia. **Diagnóstico:** ambas referencias apuntan a la misma lista; crea una lista nueva.

**3. Entiende**

La copia superficial duplica la referencia al objeto interno; la copia profunda debe copiar también los objetos mutables que necesites aislar.

**4. Cierra**

Guarda el resultado de ambas listas.

#### Subtema 5.2: Copia solo lo que el contrato necesita · 10 min

**1. Contexto**

Una etiqueta puede ser texto inmutable; copiarla de nuevo no agrega independencia.

**2. Hazlo tú**

En `src/Paquete.java`, conserva `String` como elemento pero crea una lista nueva en la copia. Añade un campo mutable `List<String> eventos` y decide si forma parte de la configuración que se duplica. Ejecuta `javac -d out src/Paquete.java` y `java -cp out Paquete` con mutación en ambos campos.

**Resultado esperado:** puedes demostrar qué datos comparten valor inmutable y cuáles requieren copia propia.

**Fallo deliberado:** serializa todo y clona sin definir qué significa una copia. **Diagnóstico:** escribe primero el contrato: qué campos se copian, reinician o comparten.

**3. Entiende**

Prototype es una decisión sobre semántica de copia, no solamente implementar `Cloneable`.

**4. Cierra**

Anota el destino de cada campo mutable.

#### Subtema 5.3: Compara Prototype con una fábrica · 10 min

**1. Contexto**

El equipo tiene una plantilla casi lista y quiere saber si clonarla hace el flujo más simple.

**2. Hazlo tú**

En `src/Paquete.java`, crea el mismo paquete base una vez y copia con constructor de copia; añade otra forma que cree un `Paquete` desde valores de configuración. Ejecuta `javac -d out src/Paquete.java` y `java -cp out Paquete`, comparando asignaciones y mutaciones.

**Resultado esperado:** sabes cuál opción expresa mejor la creación de un paquete nuevo.

**Fallo deliberado:** usa Prototype cuando el estado sea muy pequeño y fácil de construir. **Diagnóstico:** conserva la opción más directa si no existe una plantilla compleja que reutilizar.

**3. Entiende**

Prototype es útil para objetos costosos o plantillas configuradas; una fábrica sencilla suele bastar para crear valores simples.

**4. Cierra**

Escribe qué evidencia justificaría usar Prototype en el producto.

**Alcance de la copia:** cambia una etiqueta en la copia y verifica que la lista original no cambie. `new ArrayList<>(original.etiquetas)` crea otra lista, pero no duplica cada objeto mutable que contiene. Para valores inmutables esa copia superficial suele bastar; para elementos modificables, copia también esos elementos o usa tipos inmutables. `List.copyOf` crea una lista no modificable. Documenta la regla antes de implementar `clone`. Fuente: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html.

### Tema 6: Patrones estructurales para conectar piezas existentes

**¿Por qué es importante?** adapter, decorator y facade ayudan a integrar sistemas sin mezclar sus contratos y detalles.

#### Subtema 6.1: Adapta un proveedor antiguo · 10 min

**1. Contexto**

Un proveedor antiguo recibe `String` con formato propio, mientras la aplicación usa `Notificador.enviar(Envio)`.

**2. Hazlo tú**

Crea `src/Integracion.java` con la interfaz `Notificador`, la clase `Envio(String guia)`, el proveedor existente `ProveedorViejo.enviarTexto(String)` y un `AdaptadorProveedor` que implemente `Notificador` convirtiendo el envío a texto. Compila con `javac -d out src/Integracion.java` y ejecuta `java -cp out Integracion`.

**Resultado esperado:** el servicio puede llamar el contrato nuevo y el adaptador traduce la llamada al viejo.

**Fallo deliberado:** modifica el proveedor viejo para que coincida con cada pantalla nueva. **Diagnóstico:** deja la traducción en un adapter y protege los consumidores de cambios externos.

**3. Entiende**

Adapter convierte una interfaz en otra; no necesita cambiar el proveedor que estás integrando.

**4. Cierra**

Conserva la llamada antes y después de la adaptación.

#### Subtema 6.2: Añade comportamiento con Decorator · 10 min

**1. Contexto**

Quieres medir duración de notificaciones sin modificar el transporte real.

**2. Hazlo tú**

En `src/Integracion.java`, agrega `Medido implements Notificador` que recibe otro `Notificador`, mide con `System.nanoTime()` antes y después de `enviar` y devuelve el resultado del delegado. Ejecuta `javac -d out src/Integracion.java` y `java -cp out Integracion` envolviendo `AdaptadorProveedor` con `Medido`.

**Resultado esperado:** el envío real ocurre una vez y el decorador reporta duración.

**Fallo deliberado:** copia en el decorador toda la lógica del proveedor. **Diagnóstico:** delega el trabajo y agrega solo el comportamiento extra.

**3. Entiende**

Decorator envuelve el mismo contrato y puede componerse; define un orden si hay varios decoradores.

**4. Cierra**

Muestra la cadena `Medido -> AdaptadorProveedor -> ProveedorViejo`.

#### Subtema 6.3: Simplifica una operación con Facade · 10 min

**1. Contexto**

Crear una guía requiere validar dirección, guardar datos y avisar al transportista.

**2. Hazlo tú**

En `src/Integracion.java`, crea `FacadeEnvios` que reciba `Notificador`, valide que `guia` no esté vacía, y coordine el guardado en memoria y el aviso. En `main`, el cliente llama un solo `crearYNotificar(envio)`. Ejecuta `javac -d out src/Integracion.java` y `java -cp out Integracion`.

**Resultado esperado:** el cliente inicia el flujo completo con una llamada y los colaboradores permanecen separados.

**Fallo deliberado:** expón todos los detalles de guardado a cada pantalla. **Diagnóstico:** ofrece una operación de alto nivel en facade; mantiene accesibles los componentes solo para casos que los necesiten.

**3. Entiende**

Facade simplifica un flujo; no es obligatorio esconder por completo los componentes del sistema.

**4. Cierra**

Conserva la llamada externa y enumera las tareas coordinadas. Fuente: [catálogo de patrones GoF](https://refactoring.guru/design-patterns/catalog).

---


## Construcción guiada del capítulo

**Objetivo del laboratorio:** refactorizar un módulo propio aplicando al menos dos patrones de diseño justificados por una necesidad real.

**Requisitos previos:** Módulos 0-11 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Implementar Builder para un objeto con campos opcionales | Ver Tema 1 | Evita confusión de orden de argumentos |
| 2 | Implementar una Factory simple según un parámetro | Ver Tema 2 | Centraliza la selección de un producto |
| 3 | Implementar Strategy para un algoritmo intercambiable | Ver Tema 2 | Sin modificar el código consumidor |
| 4 | Crear una familia local e internacional con Abstract Factory | Ver Tema 3 | Mantiene compatibles etiqueta y guía |
| 5 | Refactorizar una clase que viola SRP | Ver Tema 4 | Separa sus responsabilidades distintas |
| 6 | Identificar un caso de sobre-ingeniería en tu propio código | Ver Tema 4 | Documenta por qué el patrón no aportaría valor ahí |

**Verificación:** el laboratorio se considera exitoso si cada patrón responde a una variación concreta, el consumidor no conoce clases de productos de cada familia y el ejemplo de sobre-ingeniería está justificado con una razón específica.

**Errores comunes y soluciones**

- **Aplicar un patrón sin una necesidad real detrás.** Verifica primero que existe genuina variabilidad o complejidad que el patrón resuelve.
- **Dejar una clase acumulando responsabilidades no relacionadas con el tiempo.** Revisa periódicamente si una clase tiene más de una razón real para cambiar.
- **Confundir Factory con Strategy.** Factory decide qué crear; Strategy encapsula un algoritmo intercambiable ya creado.

---

## Laboratorio complementario: Strategy, Singleton y Observer en RutaFlow

### Objetivo y preparación

Compara tres decisiones distintas: intercambiar una tarifa, controlar una instancia y avisar a varios interesados. Crea una carpeta vacía y entra en ella. Después crea manualmente `StrategyDemo.java`, `SingletonDemo.java` y `ObserverDemo.java` con los contenidos completos indicados abajo; son programas sin dependencias externas y debes escribirlos tú.

```bash
mkdir laboratorio-strategy-singleton-observer
cd laboratorio-strategy-singleton-observer
```

Usa el JDK del curso y ejecuta todos los comandos dentro de esta carpeta. Este laboratorio modela el dominio del proyecto integrador RutaFlow; no está conectado a su backend.

### Strategy: elegir una política sin cambiar al consumidor

Escribe este contenido completo en `StrategyDemo.java`:

```java
public class StrategyDemo {
    interface Tarifa {
        int calcular(int kilometros);
    }

    static final class Normal implements Tarifa {
        public int calcular(int kilometros) {
            return 500 + 100 * kilometros;
        }
    }

    static final class Express implements Tarifa {
        public int calcular(int kilometros) {
            return 900 + 150 * kilometros;
        }
    }

    static final class Recogida implements Tarifa {
        public int calcular(int kilometros) {
            return 0;
        }
    }

    record Cotizador(Tarifa tarifa) {
        Cotizador {
            java.util.Objects.requireNonNull(tarifa, "tarifa");
        }

        int cotizar(int kilometros) {
            if (kilometros < 0) {
                throw new IllegalArgumentException("kilometros negativos");
            }
            return tarifa.calcular(kilometros);
        }
    }

    public static void main(String[] args) {
        if (args.length == 1 && args[0].equals("fallo")) {
            System.out.println("fallo=" + new Cotizador(new Normal()).cotizar(-1));
            return;
        }
        System.out.println("normal=" + new Cotizador(new Normal()).cotizar(10));
        System.out.println("express=" + new Cotizador(new Express()).cotizar(10));
        System.out.println("recogida=" + new Cotizador(new Recogida()).cotizar(10));
    }
}
```

Ejecuta:

```bash
java StrategyDemo.java
```

**Salida esperada:** `normal=1500`, `express=2400`, `recogida=0`, en líneas separadas. Los importes son centavos enteros para evitar errores de coma flotante. `Cotizador` valida la distancia y delega el cálculo a `Tarifa`; quien lo construye elige `Normal`, `Express` o `Recogida`. Es como contratar un transportista: el contrato de servicio permanece aunque cambie la política de cobro.

Una fábrica con `switch`, como la del Tema 2, es una **simple factory**. No equivale por sí sola al patrón GoF Factory Method, que permite variar la creación mediante subclases. Crear una estrategia y ejecutarla son responsabilidades distintas.

**Fallo deliberado:** ejecuta `java StrategyDemo.java fallo`. La primera línea del error contiene `java.lang.IllegalArgumentException: kilometros negativos`. El consumidor recibe `-1`; la guarda de `cotizar` rechaza una distancia inválida antes de delegar. **Corrección:** cambia la llamada `cotizar(-1)` por `cotizar(10)` y repite el comando; imprime `fallo=1500`. Conservar la validación protege todas las estrategias.

**Práctica independiente:** añade `TarifaEmpresa` con 300 centavos fijos y 80 por kilómetro. Para 10 km debe devolver 1100. Inyéctala sin editar `Cotizador`. Explica dónde decides qué tarifa corresponde a cada cliente.

**Cuándo no usarlo:** si solo existe una fórmula estable, una función basta. Strategy permite sustituir el cálculo; no resuelve por sí mismo selección por permisos, persistencia ni validación de reglas comerciales.

### Singleton: identidad única y dependencia explícita

Escribe este contenido completo en `SingletonDemo.java`:

```java
public class SingletonDemo {
    interface Config {
        String moneda();
    }

    enum Configuracion implements Config {
        INSTANCIA("COP");

        private final String moneda;

        Configuracion(String moneda) {
            this.moneda = moneda;
        }

        public String moneda() {
            return moneda;
        }
    }

    public static void main(String[] args) {
        Config produccion = Configuracion.INSTANCIA;
        Config prueba = () -> "USD";

        System.out.println("misma instancia=" + (produccion == Configuracion.INSTANCIA));
        System.out.println("produccion=" + produccion.moneda());
        System.out.println("prueba=" + prueba.moneda());

        if (args.length == 1 && args[0].equals("fallo")) {
            String actual = Configuracion.INSTANCIA.moneda();
            if (!"USD".equals(actual)) {
                throw new IllegalStateException(
                        "dependencia global: esperado USD, obtenido " + actual);
            }
        }
    }
}
```

Ejecuta:

```bash
java SingletonDemo.java
```

**Salida esperada:** `misma instancia=true`, `produccion=COP`, `prueba=USD`. El `enum Configuracion` tiene un único valor. El consumidor recibe una interfaz `Config`, por lo que una prueba puede suministrar otra moneda sin mutar estado global. La identidad única es local a la clase cargada: no coordina varias JVM ni réplicas del servicio.

| Implementación | Inicialización | Coste o límite |
|---|---|---|
| Eager, campo `static final` | Al inicializar la clase | Puede crear un recurso que no se necesita |
| Lazy sin sincronización | En el primer acceso | Dos hilos pueden construir instancias distintas |
| Método `static synchronized` | En el primer acceso | Usa el monitor en cada acceso |
| Double-checked locking | En el primer acceso | Requiere `volatile`, segunda comprobación dentro del bloqueo y cuidado con el modelo de memoria |
| `enum` con un valor | Al inicializar el enum | Conciso; no permite heredar de otra clase y sigue siendo una dependencia global si se consulta directamente |

Garantizar construcción segura no vuelve seguros los campos mutables. Tampoco convierte una conexión JDBC compartida en un pool. Prefiere inyección de dependencias cuando necesitas reemplazar recursos, aislar pruebas o controlar el cierre de conexiones.

**Fallo deliberado:** ejecuta `java SingletonDemo.java fallo`. Después de las tres salidas normales obtendrás `java.lang.IllegalStateException: dependencia global: esperado USD, obtenido COP`. La variable `actual` consulta directamente `Configuracion.INSTANCIA.moneda`, ignorando la configuración de prueba. **Corrección:** sustituye esa expresión por `prueba.moneda()` y repite el comando; la ejecución termina sin excepción. No cambies la expectativa a COP: ocultaría el acoplamiento.

**Práctica independiente:** inyecta dos configuraciones distintas en dos consumidores simultáneos y comprueba que ninguno cambia la moneda del otro. Explica por qué un singleton mutable global haría esta prueba más frágil.

### Observer: alta, notificación y baja

**¿Cuándo usarlo?**
- Un cambio de estado en un objeto debe disparar actualizaciones en otros sin que el primero conozca a los segundos.
- Varios interesados distintos (cliente, auditoría, métricas) necesitan enterarse del mismo evento sin coordinarse entre sí.
- Necesitas poder agregar un nuevo interesado sin modificar la clase que emite el evento.

**Beneficios:**
- Bajo acoplamiento: `Entrega` nunca importa ni conoce las clases concretas de sus observadores, solo el contrato `Observador`.
- Agregar o quitar un interesado no exige tocar el código que publica el evento.
- Las notificaciones son automáticas y ocurren en el mismo instante en que cambia el estado.

**Estructura formal (GoF) y cómo se mapea en este ejercicio:**

| Rol GoF | En esta demo |
|---|---|
| `Observer` (contrato de actualización) | Interfaz `Observador` con el método `actualizar(String estado)` |
| `Subject` (contrato de alta/baja/notificación) | Los métodos `suscribir`/`cancelar`/`publicar` de `Entrega` |
| `ConcreteSubject` (estado real que cambia) | La propia clase `Entrega` |
| `ConcreteObserver` (reacción concreta a la notificación) | Las lambdas `cliente` y `auditoria` que implementan `Observador` |

El GoF original separa `Subject` de `ConcreteSubject` en dos tipos distintos cuando el dominio tiene **varios tipos de sujetos** intercambiables (por ejemplo, distintas clases de eventos emitiendo notificaciones bajo el mismo contrato). Aquí hay un único tipo de sujeto (`Entrega`), así que fusionar el contrato y la implementación en una sola clase es una simplificación válida, no un error: extraer una interfaz `Subject` separada sin un segundo sujeto real que la implemente sería una abstracción prematura. Del mismo modo, usar lambdas en vez de clases `ConcreteObserverA`/`B`/`C` con nombre propio es idiomático en Java moderno para observadores con una sola responsabilidad: ambas formas implementan el mismo contrato `Observador`.

Escribe este contenido completo en `ObserverDemo.java`:

```java
import java.util.ArrayList;
import java.util.List;

public class ObserverDemo {
    interface Observador {
        void actualizar(String estado);
    }

    static final class Entrega {
        private final List<Observador> observadores = new ArrayList<>();

        void suscribir(Observador observador) {
            observadores.add(observador);
        }

        void cancelar(Observador observador) {
            observadores.remove(observador);
        }

        void publicar(String estado) {
            for (Observador observador : new ArrayList<>(observadores)) {
                observador.actualizar(estado);
            }
        }
    }

    public static void main(String[] args) {
        Observador cliente = estado -> System.out.println("cliente=" + estado);
        Observador auditoria = estado -> System.out.println("auditoria=" + estado);

        if (args.length == 1 && args[0].equals("fallo")) {
            Entrega entregaConFallo = new Entrega();
            entregaConFallo.suscribir(estado -> {
                throw new IllegalStateException("observador no disponible");
            });
            entregaConFallo.suscribir(cliente);
            entregaConFallo.suscribir(auditoria);
            entregaConFallo.publicar("EN_CAMINO");
            return;
        }

        Entrega entrega = new Entrega();
        entrega.suscribir(cliente);
        entrega.suscribir(auditoria);
        entrega.publicar("EN_CAMINO");
        entrega.cancelar(cliente);
        entrega.publicar("ENTREGADA");
    }
}
```

Ejecuta:

```bash
java ObserverDemo.java
```

**Salida esperada:** `cliente=EN_CAMINO`, `auditoria=EN_CAMINO`, `auditoria=ENTREGADA`. `Entrega` conoce únicamente el contrato `Observador`. Después de cancelar la suscripción del cliente, auditoría continúa recibiendo eventos. Es como una lista de avisos de entrega: cada interesado se registra y puede retirarse.

La implementación es síncrona, de un solo hilo y conserva el orden de registro. El patrón no exige ese orden en otras implementaciones. Se recorre una copia de la lista: una baja dentro de un callback se aplica al próximo evento. Registra cada observador una sola vez; esta versión permite duplicados.

**Fallo deliberado:** ejecuta `java ObserverDemo.java fallo`. Un primer observador lanza `java.lang.IllegalStateException: observador no disponible`; cliente y auditoría no reciben el evento porque la excepción interrumpe el bucle. **Corrección:** elimina la suscripción deliberadamente defectuosa y repite el comando con `fallo`; ahora aparecen `cliente=EN_CAMINO` y `auditoria=EN_CAMINO`. Ejecuta después sin argumentos para recuperar también la baja del cliente y la salida `auditoria=ENTREGADA`. Como ejercicio avanzado, decide si debes aislar cada callback con manejo de errores o fallar toda la operación. Si los aíslas, registra qué observador falló; nunca ignores la excepción silenciosamente.

**Práctica independiente:** agrega un observador de métricas, cancélalo después de `EN_CAMINO` y demuestra que no recibe `ENTREGADA`. Luego agrega uno que se desuscriba dentro de su callback y explica el efecto de la instantánea.

**Ejemplos reales de este mismo patrón:** notificaciones de redes sociales (un post nuevo avisa a cada seguidor suscrito), actualizaciones en tiempo real de un dashboard (un valor cambia y cada widget suscrito se redibuja), listeners de eventos en una GUI (un clic notifica a cada handler registrado), sistemas de mensajería pub/sub, y el propio par auditoría/cliente de este ejercicio — un registro de auditoría que nunca debería poder cancelarse igual que el cliente.

**Límites:** una lista en memoria no ofrece durabilidad, reintentos ni entrega entre procesos. Los callbacks lentos bloquean al emisor; olvidar cancelar suscripciones retiene referencias. Para eventos de negocio persistentes estudia outbox y mensajería en los módulos correspondientes.

### Diseño y evidencia

Entrega las tres salidas, el diagnóstico de cada fallo y tus ejercicios. En el proyecto integrador, redacta una decisión sobre dónde seleccionar tarifas, cómo inyectar configuración por cliente y qué hacer si auditoría falla después de registrar una entrega. Distingue una notificación de interfaz prescindible de un registro de negocio que debe sobrevivir a un reinicio.

<details>
<summary>Orientación para contrastar tu diseño</summary>

Selecciona la tarifa en la composición del caso de uso e inyecta su contrato. Mantén la configuración inmutable y explícita; una instancia global no sustituye el aislamiento entre clientes. Usa Observer para avisos locales cuando aceptas sus límites. Si la entrega y su evento deben persistir juntos, considera una transacción con outbox y consumidores idempotentes, documentando el coste operativo adicional.

</details>

Referencia de lectura: Alexander Shvets, *Sumérgete en los patrones de diseño*, edición v2021-1.7, páginas impresas 148–157, 358–373 y 391–405. Los ejemplos anteriores son originales de The Imperial Book. El registro de revisión y las páginas PDF están en `docs/biblioteca/shvets-patrones.md`.

---

## Proyecto integrador: conectar patrones en RutaFlow

**Objetivo:** decidir qué patrón resuelve cada variación real y conservar el flujo de envío legible.

1. Ejecuta `java examples/java/patrones-rutaflow/PrototypeDemo.java` y `java examples/java/patrones-rutaflow/StructuralPatternsDemo.java` desde la raíz. Conserva ambas salidas.
2. En `examples/java/patrones-rutaflow/StructuralPatternsDemo.java`, identifica las clases Adapter, Decorator y Facade; añade una variante de canal y confirma que el adaptador entrega el formato que espera el servicio.
3. Revisa el ejemplo de prototipo: agrega una etiqueta a la copia y demuestra que la original no cambió. Si se comparten objetos mutables dentro de una colección, describe si la copia debe profundizar.
4. Escribe `docs/decision-patrones-java.md` con una tabla: variación, patrón candidato, alternativa más simple, coste de mantenimiento y evidencia observada.

**Fallo deliberado:** convierte cada clase en interfaz/patrón aunque no exista variación. **Diagnóstico:** elimina la abstracción que solo añade navegación; conserva el patrón únicamente si aísla un cambio real.

**Evidencia:** las dos salidas, la copia independiente y la decisión escrita. En el sistema real, si un registro de negocio y un aviso deben guardarse juntos, estudia transacción y outbox en los temas de integración; Observer local no garantiza persistencia tras reinicio.

Referencia de lectura: Alexander Shvets, *Sumérgete en los patrones de diseño*, edición v2021-1.7, páginas impresas 148–157, 358–373 y 391–405. Los ejemplos son originales de The Imperial Book; registro en `docs/biblioteca/shvets-patrones.md`.
