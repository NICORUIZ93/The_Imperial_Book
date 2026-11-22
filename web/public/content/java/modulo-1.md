# Módulo 1: Programación orientada a objetos


## Aprende construyendo


### Tema 1: Clases, objetos, constructores y encapsulación · Básico · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por clases, objetos, constructores y encapsulación con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender clases, objetos, constructores y encapsulación te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en clases, objetos, constructores y encapsulación como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que clases, objetos, constructores y encapsulación resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Clases, objetos, constructores y encapsulación se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Clases, objetos, constructores y encapsulación | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses clases, objetos, constructores y encapsulación por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: clases, objetos, constructores y encapsulación funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Clases, objetos, constructores y encapsulación existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve clases, objetos, constructores y encapsulación en tu contexto?
2. ¿Cómo sabrías que clases, objetos, constructores y encapsulación no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar clases, objetos, constructores y encapsulación?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
public final class Guia {
    String numero;
    String destino;

    Guia(String numero, String destino) {
        this.numero = numero;
        this.destino = destino;
    }

    public static void main(String[] args) {
        Guia primera = new Guia("RF-101", "Medellin");
        Guia segunda = new Guia("RF-102", "Envigado");
        System.out.println(primera.numero + " -> " + primera.destino);
        System.out.println(segunda.numero + " -> " + segunda.destino);
    }
}
```

```bash
mkdir -p out
javac -d out src/Guia.java
java -cp out Guia
```

```java
public final class Guia {
    private final String numero;
    private String destino;

    public Guia(String numero, String destino) {
        this.numero = numero;
        this.destino = destino;
    }

    public String getNumero() {
        return numero;
    }

    public String getDestino() {
        return destino;
    }

    public void cambiarDestino(String nuevoDestino) {
        destino = nuevoDestino;
    }
}
```

```java
public final class Principal {
    public static void main(String[] args) {
        Guia guia = new Guia("RF-101", "Medellin");
        guia.cambiarDestino("Envigado");
        System.out.println(guia.getNumero() + " -> " + guia.getDestino());
    }
}
```

```bash
javac -d out src/Guia.java src/Principal.java
java -cp out Principal
```

```java
public final class Guia {
    private final String numero;
    private String destino;

    public Guia(String numero, String destino) {
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException("El numero es obligatorio");
        }
        if (destino == null || destino.isBlank()) {
            throw new IllegalArgumentException("El destino es obligatorio");
        }
        this.numero = numero;
        this.destino = destino;
    }

    public String getNumero() { return numero; }
    public String getDestino() { return destino; }

    public void cambiarDestino(String nuevoDestino) {
        if (nuevoDestino == null || nuevoDestino.isBlank()) {
            throw new IllegalArgumentException("El destino es obligatorio");
        }
        destino = nuevoDestino;
    }

    public static void main(String[] args) {
        Guia guia = new Guia("RF-101", "Medellin");
        System.out.println(guia.getNumero() + " -> " + guia.getDestino());
        try {
            new Guia("", "Envigado");
        } catch (IllegalArgumentException error) {
            System.out.println("Rechazada: " + error.getMessage());
        }
    }
}
```

</details>

### Tema 2: Herencia y sobreescritura · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por herencia y sobreescritura con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender herencia y sobreescritura te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en herencia y sobreescritura como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que herencia y sobreescritura resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Herencia y sobreescritura se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Herencia y sobreescritura | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses herencia y sobreescritura por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: herencia y sobreescritura funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Herencia y sobreescritura existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve herencia y sobreescritura en tu contexto?
2. ¿Cómo sabrías que herencia y sobreescritura no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar herencia y sobreescritura?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
class Vehiculo {
    String codigo;
    Vehiculo(String codigo) { this.codigo = codigo; }
    String entregar() { return codigo + " entrega paquete"; }
}

class Bicicleta extends Vehiculo {
    Bicicleta(String codigo) { super(codigo); }
}

public class EntregaDemo {
    public static void main(String[] args) {
        Bicicleta bici = new Bicicleta("BI-7");
        System.out.println(bici.entregar());
    }
}
```

```bash
mkdir -p out
javac -d out src/EntregaDemo.java
java -cp out EntregaDemo
```

```java
class Vehiculo {
    String codigo;
    Vehiculo(String codigo) { this.codigo = codigo; }
    String entregar() { return codigo + " entrega paquete"; }
}

class Bicicleta extends Vehiculo {
    Bicicleta(String codigo) { super(codigo); }
    @Override
    String entregar() { return codigo + " entrega en bicicleta"; }
}

public class EntregaDemo {
    public static void main(String[] args) {
        Bicicleta bici = new Bicicleta("BI-7");
        System.out.println(bici.entregar());
    }
}
```

```java
import java.util.List;

class Vehiculo {
    String codigo;
    Vehiculo(String codigo) { this.codigo = codigo; }
    String entregar() { return codigo + " entrega paquete"; }
}

class Bicicleta extends Vehiculo {
    Bicicleta(String codigo) { super(codigo); }
    @Override String entregar() { return codigo + " entrega en bicicleta"; }
}

class Furgoneta extends Vehiculo {
    Furgoneta(String codigo) { super(codigo); }
    @Override String entregar() { return codigo + " entrega en furgoneta"; }
}

public class EntregaDemo {
    public static void main(String[] args) {
        List<Vehiculo> flota = List.of(
            new Bicicleta("BI-7"), new Furgoneta("FU-2"));
        for (Vehiculo vehiculo : flota) {
            System.out.println(vehiculo.entregar());
        }
    }
}
```

```bash
javac -d out src/EntregaDemo.java
java -cp out EntregaDemo
```

```java
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.annotation.ElementType;
import java.lang.reflect.Method;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Auditable {
    String accion();
}

class ServicioEntrega {
    @Auditable(accion = "confirmar-entrega")
    public void confirmar() { }
}

public class EntregaDemo {
    public static void main(String[] args) throws Exception {
        Method metodo = ServicioEntrega.class.getMethod("confirmar");
        Auditable marca = metodo.getAnnotation(Auditable.class);
        System.out.println(marca.accion());
    }
}
```

</details>

### Tema 3: Interfaces, clases abstractas y cuándo usar cada una · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por interfaces, clases abstractas y cuándo usar cada una con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender interfaces, clases abstractas y cuándo usar cada una te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en interfaces, clases abstractas y cuándo usar cada una como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que interfaces, clases abstractas y cuándo usar cada una resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Interfaces, clases abstractas y cuándo usar cada una se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Interfaces, clases abstractas y cuándo usar cada una | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses interfaces, clases abstractas y cuándo usar cada una por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: interfaces, clases abstractas y cuándo usar cada una funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Interfaces, clases abstractas y cuándo usar cada una existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve interfaces, clases abstractas y cuándo usar cada una en tu contexto?
2. ¿Cómo sabrías que interfaces, clases abstractas y cuándo usar cada una no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar interfaces, clases abstractas y cuándo usar cada una?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
interface Confirmable {
    String confirmar();
}

class EntregaLocal implements Confirmable {
    public String confirmar() { return "Entrega local confirmada"; }
}

class AdaptadorMovil implements Confirmable {
    public String confirmar() { return "Confirmación recibida del móvil"; }
}

public class ContratoDemo {
    static void procesar(Confirmable entrega) {
        System.out.println(entrega.confirmar());
    }

    public static void main(String[] args) {
        procesar(new EntregaLocal());
        procesar(new AdaptadorMovil());
    }
}
```

```bash
mkdir -p out
javac -d out src/ContratoDemo.java
java -cp out ContratoDemo
```

```java
abstract class ServicioEntrega {
    private final String guia;

    ServicioEntrega(String guia) {
        if (guia == null || guia.isBlank()) {
            throw new IllegalArgumentException("La guia es obligatoria");
        }
        this.guia = guia;
    }

    String guia() { return guia; }
    abstract int minutosEstimados();
    String resumen() { return guia + ": " + minutosEstimados() + " min"; }
}

class EntregaLocal extends ServicioEntrega {
    EntregaLocal(String guia) { super(guia); }
    int minutosEstimados() { return 45; }
}

public class ContratoDemo {
    public static void main(String[] args) {
        System.out.println(new EntregaLocal("RF-201").resumen());
    }
}
```

```java
import java.util.List;

interface Confirmable {
    String confirmar();
}

abstract class ServicioEntrega implements Confirmable {
    private final String guia;
    ServicioEntrega(String guia) { this.guia = guia; }
    abstract int minutosEstimados();
    public String confirmar() { return guia + " confirmada en " + minutosEstimados() + " min"; }
}

class EntregaLocal extends ServicioEntrega {
    EntregaLocal(String guia) { super(guia); }
    int minutosEstimados() { return 45; }
}

class EntregaExpress extends ServicioEntrega {
    EntregaExpress(String guia) { super(guia); }
    int minutosEstimados() { return 20; }
}

public class ContratoDemo {
    static void procesar(List<Confirmable> entregas) {
        for (Confirmable entrega : entregas) {
            System.out.println(entrega.confirmar());
        }
    }

    public static void main(String[] args) {
        procesar(List.of(new EntregaLocal("RF-201"), new EntregaExpress("RF-202")));
    }
}
```

```bash
javac -d out src/ContratoDemo.java
java -cp out ContratoDemo
```

</details>

### Tema 4: Sobrecarga vs sobreescritura, y modificadores de acceso · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por sobrecarga vs sobreescritura, y modificadores de acceso con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender sobrecarga vs sobreescritura, y modificadores de acceso te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en sobrecarga vs sobreescritura, y modificadores de acceso como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que sobrecarga vs sobreescritura, y modificadores de acceso resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Sobrecarga vs sobreescritura, y modificadores de acceso se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Sobrecarga vs sobreescritura, y modificadores de acceso | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses sobrecarga vs sobreescritura, y modificadores de acceso por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: sobrecarga vs sobreescritura, y modificadores de acceso funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Sobrecarga vs sobreescritura, y modificadores de acceso existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve sobrecarga vs sobreescritura, y modificadores de acceso en tu contexto?
2. ¿Cómo sabrías que sobrecarga vs sobreescritura, y modificadores de acceso no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar sobrecarga vs sobreescritura, y modificadores de acceso?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
class Tarifa {
    static int calcular(int kilometros) { return kilometros * 1200; }
    static double calcular(double kilometros) { return kilometros * 1200.0; }
}

public class TarifaDemo {
    public static void main(String[] args) {
        System.out.println(Tarifa.calcular(3));
        System.out.println(Tarifa.calcular(2.5));
    }
}
```

```bash
mkdir -p out
javac -d out src/TarifaDemo.java
java -cp out TarifaDemo
```

```java
class Calculador {
    String calcular(int kilometros) { return "base=" + kilometros; }
}

class CalculadorExpress extends Calculador {
    @Override
    String calcular(int kilometros) { return "express=" + kilometros; }

    String calcular(double kilometros) { return "decimal=" + kilometros; }
}

public class TarifaDemo {
    public static void main(String[] args) {
        Calculador calculador = new CalculadorExpress();
        System.out.println(calculador.calcular(3));
        System.out.println(((CalculadorExpress) calculador).calcular(2.5));
    }
}
```

```java
package modelo;

public class Guia {
    private final String numero;
    int intentos;
    protected String estado = "lista";

    public Guia(String numero) { this.numero = numero; }
    public String numero() { return numero; }
}
```

```java
package modelo;

public class Control {
    public static void main(String[] args) {
        Guia guia = new Guia("RF-301");
        guia.intentos++;
        System.out.println(guia.numero() + " intentos=" + guia.intentos);
    }
}
```

```java
package app;

import modelo.Guia;

public class Bicicleta extends Guia {
    public Bicicleta() { super("RF-302"); }

    public String resumen() {
        return numero() + " estado=" + estado;
    }

    public static void main(String[] args) {
        System.out.println(new Bicicleta().resumen());
    }
}
```

</details>

### Tema 5: record — modelos inmutables sin boilerplate · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por record — modelos inmutables sin boilerplate con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender record — modelos inmutables sin boilerplate te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en record — modelos inmutables sin boilerplate como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que record — modelos inmutables sin boilerplate resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| record — modelos inmutables sin boilerplate se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar record — modelos inmutables sin boilerplate | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses record — modelos inmutables sin boilerplate por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: record — modelos inmutables sin boilerplate funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- record — modelos inmutables sin boilerplate existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve record — modelos inmutables sin boilerplate en tu contexto?
2. ¿Cómo sabrías que record — modelos inmutables sin boilerplate no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar record — modelos inmutables sin boilerplate?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
public record Guia(String numero, double pesoKg) {
    public Guia {
        if (numero == null || numero.isBlank()) throw new IllegalArgumentException("Falta número");
        if (pesoKg <= 0) throw new IllegalArgumentException("Peso debe ser positivo");
    }
    public static void main(String[] args) {
        System.out.println(new Guia("RT-1", 2.5));
    }
}
```

```bash
javac -d out src/Guia.java
java -cp out Guia
```

```bash
javac -d out src/Guia.java
java -cp out Guia
```

```bash
javac -d out src/Guia.java
java -cp out Guia
```

</details>

### Tema 6: Constructores flexibles (Java 25): validar y preparar antes de `super(...)` · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por constructores flexibles (java 25): validar y preparar antes de `super(...)` con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender constructores flexibles (java 25): validar y preparar antes de `super(...)` te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en constructores flexibles (java 25): validar y preparar antes de `super(...)` como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que constructores flexibles (java 25): validar y preparar antes de `super(...)` resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Constructores flexibles (Java 25): validar y preparar antes de `super(...)` se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Constructores flexibles (Java 25): validar y preparar antes de `super(...)` | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses constructores flexibles (java 25): validar y preparar antes de `super(...)` por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: constructores flexibles (java 25): validar y preparar antes de `super(...)` funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Constructores flexibles (Java 25): validar y preparar antes de `super(...)` existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve constructores flexibles (java 25): validar y preparar antes de `super(...)` en tu contexto?
2. ¿Cómo sabrías que constructores flexibles (java 25): validar y preparar antes de `super(...)` no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar constructores flexibles (java 25): validar y preparar antes de `super(...)`?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
class Vehiculo {
    private final String placa;
    private final int capacidadKg;

    Vehiculo(String placa, int capacidadKg) {
        this.placa = placa;
        this.capacidadKg = capacidadKg;
        System.out.println("Vehiculo creado: " + descripcion());
    }

    String descripcion() {
        return placa + " (" + capacidadKg + " kg)";
    }
}

class Moto extends Vehiculo {
    private final boolean conCaja;

    Moto(String placa, int capacidadKg, boolean conCaja) {
        if (capacidadKg > 30) {
            throw new IllegalArgumentException("Una moto lleva hasta 30 kg: " + capacidadKg);
        }
        String normalizada = placa.strip().toUpperCase();
        this.conCaja = conCaja;
        super(normalizada, capacidadKg);
    }

    @Override
    String descripcion() {
        return super.descripcion() + (conCaja ? " con caja" : " sin caja");
    }
}

public class ConstructorFlexible {
    public static void main(String[] args) {
        new Moto(" abc12d ", 25, true);
        try {
            new Moto("XYZ98E", 80, false);
        } catch (IllegalArgumentException e) {
            System.out.println("Rechazada: " + e.getMessage());
        }
    }
}
```

```text
Vehiculo creado: ABC12D (25 kg) con caja
Rechazada: Una moto lleva hasta 30 kg: 80
```

```java
class Camion extends Vehiculo {
    Camion(String placa, double toneladas) {
        if (toneladas <= 0) {
            throw new IllegalArgumentException("Capacidad inválida: " + toneladas);
        }
        int kilos = (int) Math.round(toneladas * 1000);
        super(placa, kilos);
    }
}
```

</details>
