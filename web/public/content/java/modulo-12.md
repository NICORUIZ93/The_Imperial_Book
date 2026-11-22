# Módulo 12: Buenas prácticas y patrones de diseño

## Aprende construyendo


### Tema 1: Builder — configuración paso a paso y validación · Básico · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por builder — configuración paso a paso y validación con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender builder — configuración paso a paso y validación te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en builder — configuración paso a paso y validación como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que builder — configuración paso a paso y validación resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Builder — configuración paso a paso y validación se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Builder — configuración paso a paso y validación | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses builder — configuración paso a paso y validación por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: builder — configuración paso a paso y validación funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Builder — configuración paso a paso y validación existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve builder — configuración paso a paso y validación en tu contexto?
2. ¿Cómo sabrías que builder — configuración paso a paso y validación no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar builder — configuración paso a paso y validación?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
// src/Envio.java
public class Envio {
    static final class Builder {
        private final String guia;
        private boolean prioritario;
        Builder(String guia) { this.guia = guia; }
        Builder prioritario(boolean valor) { this.prioritario = valor; return this; }
        Envio build() { return new Envio(guia, prioritario); }
    }
}
```

```bash
javac -d out src/Envio.java
java -cp out Envio
```

</details>

### Tema 2: Factory Method y Strategy · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por factory method y strategy con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender factory method y strategy te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en factory method y strategy como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que factory method y strategy resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Factory Method y Strategy se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Factory Method y Strategy | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses factory method y strategy por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: factory method y strategy funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Factory Method y Strategy existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve factory method y strategy en tu contexto?
2. ¿Cómo sabrías que factory method y strategy no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar factory method y strategy?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
// src/Tarifas.java
interface Tarifa { int calcular(int gramos); }

static Tarifa crear(String tipo) {
    return switch (tipo) {
        case "estandar" -> new Estandar();
        case "prioritaria" -> new Prioritaria();
        default -> throw new IllegalArgumentException("tipo desconocido: " + tipo);
    };
}
```

```bash
javac -d out src/Tarifas.java src/Cotizador.java
java -cp out Cotizador
```

</details>

### Tema 3: Abstract Factory y familias de productos compatibles · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por abstract factory y familias de productos compatibles con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender abstract factory y familias de productos compatibles te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en abstract factory y familias de productos compatibles como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que abstract factory y familias de productos compatibles resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Abstract Factory y familias de productos compatibles se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Abstract Factory y familias de productos compatibles | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses abstract factory y familias de productos compatibles por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: abstract factory y familias de productos compatibles funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Abstract Factory y familias de productos compatibles existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve abstract factory y familias de productos compatibles en tu contexto?
2. ¿Cómo sabrías que abstract factory y familias de productos compatibles no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar abstract factory y familias de productos compatibles?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
// src/Notificaciones.java
interface FabricaAvisos {
    Mensaje crearMensaje();
    Plantilla crearPlantilla();
}

static final class FabricaLocal implements FabricaAvisos {
    public Mensaje crearMensaje() { return new Sms(); }
    public Plantilla crearPlantilla() { return new PlantillaLocal(); }
}
```

```bash
javac -d out src/Notificaciones.java
java -cp out Notificaciones
```

</details>

### Tema 4: SOLID y cuándo NO aplicar un patrón · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por solid y cuándo no aplicar un patrón con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender solid y cuándo no aplicar un patrón te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en solid y cuándo no aplicar un patrón como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que solid y cuándo no aplicar un patrón resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| SOLID y cuándo NO aplicar un patrón se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar SOLID y cuándo NO aplicar un patrón | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses solid y cuándo no aplicar un patrón por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: solid y cuándo no aplicar un patrón funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- SOLID y cuándo NO aplicar un patrón existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve solid y cuándo no aplicar un patrón en tu contexto?
2. ¿Cómo sabrías que solid y cuándo no aplicar un patrón no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar solid y cuándo no aplicar un patrón?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
// src/ServicioEnvios.java
public class ServicioEnvios {
    private final RepositorioEnvios repositorio;
    ServicioEnvios(RepositorioEnvios repositorio) { this.repositorio = repositorio; }
    void registrar(String guia) { repositorio.guardar(guia); }
}
```

```bash
javac -d out src/Envio.java src/ServicioEnvios.java src/Main.java
java -cp out Main
```

</details>

### Tema 5: Prototype: copiar un objeto sin compartir sus datos · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por prototype: copiar un objeto sin compartir sus datos con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender prototype: copiar un objeto sin compartir sus datos te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en prototype: copiar un objeto sin compartir sus datos como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que prototype: copiar un objeto sin compartir sus datos resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Prototype: copiar un objeto sin compartir sus datos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Prototype: copiar un objeto sin compartir sus datos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses prototype: copiar un objeto sin compartir sus datos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: prototype: copiar un objeto sin compartir sus datos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Prototype: copiar un objeto sin compartir sus datos existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve prototype: copiar un objeto sin compartir sus datos en tu contexto?
2. ¿Cómo sabrías que prototype: copiar un objeto sin compartir sus datos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar prototype: copiar un objeto sin compartir sus datos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
// src/Paquete.java
public class Paquete {
    String guia;
    List<String> etiquetas;

    Paquete(Paquete original) {
        this.guia = original.guia;
        this.etiquetas = new ArrayList<>(original.etiquetas); // copia, no la misma lista
    }
}
```

```bash
javac -d out src/Paquete.java
java -cp out Paquete
```

</details>

### Tema 6: Patrones estructurales para conectar piezas existentes · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por patrones estructurales para conectar piezas existentes con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender patrones estructurales para conectar piezas existentes te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en patrones estructurales para conectar piezas existentes como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que patrones estructurales para conectar piezas existentes resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Patrones estructurales para conectar piezas existentes se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Patrones estructurales para conectar piezas existentes | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses patrones estructurales para conectar piezas existentes por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: patrones estructurales para conectar piezas existentes funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Patrones estructurales para conectar piezas existentes existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve patrones estructurales para conectar piezas existentes en tu contexto?
2. ¿Cómo sabrías que patrones estructurales para conectar piezas existentes no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar patrones estructurales para conectar piezas existentes?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```java
// src/Integracion.java
class AdaptadorProveedor implements Notificador {
    private final ProveedorViejo proveedor = new ProveedorViejo();
    public void enviar(Envio envio) {
        proveedor.enviarTexto("GUIA:" + envio.guia());
    }
}
```

```bash
javac -d out src/Integracion.java
java -cp out Integracion
```

</details>

### Objetivo y preparación

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por objetivo y preparación con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender objetivo y preparación te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en objetivo y preparación como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que objetivo y preparación resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Objetivo y preparación se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Objetivo y preparación | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses objetivo y preparación por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: objetivo y preparación funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Objetivo y preparación existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve objetivo y preparación en tu contexto?
2. ¿Cómo sabrías que objetivo y preparación no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar objetivo y preparación?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir laboratorio-strategy-singleton-observer
cd laboratorio-strategy-singleton-observer
```

</details>

### Strategy: elegir una política sin cambiar al consumidor

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por strategy: elegir una política sin cambiar al consumidor con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender strategy: elegir una política sin cambiar al consumidor te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en strategy: elegir una política sin cambiar al consumidor como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que strategy: elegir una política sin cambiar al consumidor resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Strategy: elegir una política sin cambiar al consumidor se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Strategy: elegir una política sin cambiar al consumidor | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses strategy: elegir una política sin cambiar al consumidor por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: strategy: elegir una política sin cambiar al consumidor funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Strategy: elegir una política sin cambiar al consumidor existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve strategy: elegir una política sin cambiar al consumidor en tu contexto?
2. ¿Cómo sabrías que strategy: elegir una política sin cambiar al consumidor no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar strategy: elegir una política sin cambiar al consumidor?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
java StrategyDemo.java
```

</details>

### Singleton: identidad única y dependencia explícita

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por singleton: identidad única y dependencia explícita con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender singleton: identidad única y dependencia explícita te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en singleton: identidad única y dependencia explícita como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que singleton: identidad única y dependencia explícita resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Singleton: identidad única y dependencia explícita se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Singleton: identidad única y dependencia explícita | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses singleton: identidad única y dependencia explícita por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: singleton: identidad única y dependencia explícita funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Singleton: identidad única y dependencia explícita existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve singleton: identidad única y dependencia explícita en tu contexto?
2. ¿Cómo sabrías que singleton: identidad única y dependencia explícita no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar singleton: identidad única y dependencia explícita?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
java SingletonDemo.java
```

</details>

### Observer: alta, notificación y baja

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por observer: alta, notificación y baja con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender observer: alta, notificación y baja te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en observer: alta, notificación y baja como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que observer: alta, notificación y baja resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Observer: alta, notificación y baja se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Observer: alta, notificación y baja | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses observer: alta, notificación y baja por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: observer: alta, notificación y baja funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Observer: alta, notificación y baja existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve observer: alta, notificación y baja en tu contexto?
2. ¿Cómo sabrías que observer: alta, notificación y baja no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar observer: alta, notificación y baja?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
java ObserverDemo.java
```

</details>

### Diseño y evidencia

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por diseño y evidencia con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender diseño y evidencia te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en diseño y evidencia como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que diseño y evidencia resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Diseño y evidencia se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Diseño y evidencia | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses diseño y evidencia por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: diseño y evidencia funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Diseño y evidencia existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve diseño y evidencia en tu contexto?
2. ¿Cómo sabrías que diseño y evidencia no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar diseño y evidencia?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar diseño y evidencia.

</details>
