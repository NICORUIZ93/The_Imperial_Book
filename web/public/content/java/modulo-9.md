# Módulo 9: Testing con JUnit 5 y Mockito

El código que no se prueba se rompe en silencio. Las pruebas automatizadas no garantizan ausencia de bugs, pero sí crean una red de seguridad para cambiar con confianza. Este módulo cubre JUnit Jupiter, Mockito, tests parametrizados y pruebas basadas en propiedades.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Escribir tests claros con JUnit Jupiter y su ciclo de vida |
| 2 | Aislar dependencias con Mockito |
| 3 | Parametrizar tests y medir cobertura con criterio |
| 4 | Usar property-based testing para reglas generales |

## Aprende construyendo

### Tema 1: JUnit 6 (Jupiter) — anotaciones y ciclo de vida · Avanzado · 40 min

**Caso guía**

Tienes una calculadora de descuentos. Quieres probar casos normales, bordes y errores sin ejecutar todo manualmente.

**Concepto clave / modelo mental**

JUnit Jupiter proporciona el modelo de pruebas moderno de JUnit. Conceptos clave:

| Anotación | Uso |
|---|---|
| `@Test` | Método de prueba |
| `@BeforeEach` | Se ejecuta antes de cada test |
| `@AfterEach` | Se ejecuta después de cada test |
| `@BeforeAll/@AfterAll` | Una vez por clase (método estático) |
| `@DisplayName` | Nombre legible |

Un buen test es: rápido, aislado, determinista y claro.

**Implementación desde cero**

```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class DescuentoService {
    int aplicar(int precio, int porcentaje) {
        if (precio < 0 || porcentaje < 0 || porcentaje > 100) {
            throw new IllegalArgumentException("datos inválidos");
        }
        return precio - (precio * porcentaje / 100);
    }
}

class DescuentoServiceTest {
    DescuentoService service;

    @BeforeEach
    void setUp() { service = new DescuentoService(); }

    @Test
    void aplicaDescuento() {
        assertEquals(80, service.aplicar(100, 20));
    }

    @Test
    void rechazaPorcentajeInvalido() {
        assertThrows(IllegalArgumentException.class, () -> service.aplicar(100, 120));
    }
}
```

**Desglose del código**

- `@BeforeEach` crea un estado limpio para cada test.
- `assertEquals` verifica el resultado esperado.
- `assertThrows` verifica que el contrato de error se cumple.
- Nombra tests por comportamiento esperado, no por detalles de implementación.

**Ejecución y salida real**

```bash
./gradlew test
# o
mvn test
```

Salida típica: tests ejecutados, fallos 0, errores 0.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Tests dependientes entre sí | Estado compartido mutable | Inicializa en `@BeforeEach` |
| Test verde pero frágil | Aserciones débiles | Aserta comportamiento observable relevante |
| Test lento | Dependencias externas | Aísla con dobles/mocks |

**Verificación rápida**

Rompe deliberadamente la lógica de `aplicar` y confirma que el test falla; luego corrígela.

### Tema 2: Mockito — aislar dependencias · Avanzado · 40 min

**Caso guía**

Tu servicio envía notificaciones usando un cliente externo. En tests no quieres enviar correos reales. Necesitas un doble de prueba que simule la dependencia.

**Concepto clave / modelo mental**

Mockito crea mocks/stubs para dependencias. Un mock permite:

- definir comportamiento (`when(...).thenReturn(...)`);
- verificar interacciones (`verify(...)`).

Usa mocks en límites externos o dependencias costosas. No mockees todo: si mockeas el objeto bajo prueba, el test no sirve.

**Implementación desde cero**

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

interface EmailClient { void send(String to, String body); }

class Notifier {
    private final EmailClient email;
    Notifier(EmailClient email) { this.email = email; }
    void avisar(String to) {
        if (to == null || to.isBlank()) throw new IllegalArgumentException("to requerido");
        email.send(to, "Hola");
    }
}

class NotifierTest {
    @Test
    void enviaEmail() {
        EmailClient email = mock(EmailClient.class);
        Notifier notifier = new Notifier(email);

        notifier.avisar("ada@example.com");

        verify(email).send("ada@example.com", "Hola");
    }

    @Test
    void noEnviaSiInvalido() {
        EmailClient email = mock(EmailClient.class);
        Notifier notifier = new Notifier(email);
        assertThrows(IllegalArgumentException.class, () -> notifier.avisar(""));
        verifyNoInteractions(email);
    }
}
```

**Desglose del código**

- `mock(EmailClient.class)` crea un doble.
- Inyectas la dependencia por constructor: diseño fácil de probar.
- `verify` comprueba que se llamó con los argumentos esperados.
- `verifyNoInteractions` asegura que no hubo efectos laterales indebidos.

**Ejecución y salida real**

El test pasa si la interacción ocurre como se espera.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Test acoplado a implementación interna | Demasiados `verify` innecesarios | Verifica comportamiento relevante |
| Mock de clases de valor simples | Sobreuso | Usa objetos reales cuando son baratos |
| `NullPointerException` en mock | No stubbeaste método usado | Define `when(...).thenReturn(...)` |

**Verificación rápida**

Cambia `notifier.avisar` para no enviar email y observa que `verify` falla.

### Tema 3: Tests parametrizados y cobertura · Avanzado · 40 min

**Caso guía**

Quieres probar la misma regla con muchos valores. Copiar/pegar tests genera ruido y omite casos.

**Concepto clave / modelo mental**

Los tests parametrizados ejecutan la misma aserción con distintos inputs. Cobertura mide qué líneas/ramas ejecutaron los tests, pero cobertura alta no equivale a buena calidad.

**Implementación desde cero**

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

class Calc {
    static int doble(int n) { return n * 2; }
}

class CalcTest {
    @ParameterizedTest
    @CsvSource({"1,2","2,4","-3,-6","0,0"})
    void duplica(int input, int esperado) {
        assertEquals(esperado, Calc.doble(input));
    }
}
```

**Desglose del código**

- `@ParameterizedTest` marca el test como parametrizado.
- `@CsvSource` provee casos de entrada/salida.
- Agrega casos borde: cero, negativos, máximos, valores inválidos.
- Usa cobertura (JaCoCo) para detectar huecos, no como objetivo ciego.

**Ejecución y salida real**

Se ejecuta un caso por fila del `CsvSource`; todos deben pasar.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Muchos tests repetidos | No usaste parametrización | Usa `@ParameterizedTest` |
| 100% cobertura, bugs igual | Aserciones pobres | Prueba comportamientos y bordes |
| Caso falla por parsing | Tipos de `CsvSource` incompatibles | Ajusta tipos/parámetros |

**Verificación rápida**

Agrega un caso borde más en `CsvSource`. Si el comportamiento cambia, el test debe detectarlo.

### Tema 4: Pruebas basadas en propiedades: reglas que se cumplen para cualquier entrada · Avanzado · 45 min

**Caso guía**

En vez de probar solo ejemplos, quieres verificar una regla: “revertir una lista dos veces devuelve la lista original” para muchas entradas generadas.

**Concepto clave / modelo mental**

Property-based testing genera muchos inputs y verifica propiedades/invariantes. No reemplaza tests de ejemplo: los complementa.

Herramientas comunes en Java: jqwik, QuickTheories.

Propiedad típica:

- idempotencia;
- inversa (`reverse(reverse(x)) == x`);
- invariantes (`size` no cambia);
- equivalencia con implementación de referencia.

**Implementación desde cero**

Ejemplo conceptual con jqwik:

```java
import net.jqwik.api.*;
import java.util.*;

class ReversePropertyTest {
    @Property
    boolean reverseTwiceIsOriginal(@ForAll List<Integer> list) {
        List<Integer> copy = new ArrayList<>(list);
        Collections.reverse(copy);
        Collections.reverse(copy);
        return copy.equals(list);
    }
}
```

**Desglose del código**

- `@Property` indica una propiedad a verificar con muchos datos.
- `@ForAll` genera entradas variadas.
- La propiedad debe ser verdadera para cualquier entrada válida del dominio.
- Cuando falla, el framework intenta reducir el caso a un contraejemplo mínimo.

**Ejecución y salida real**

El runner de jqwik reporta cantidad de intentos y, si falla, el contraejemplo reducido.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Propiedad falsa por dominio mal definido | Generaste inputs inválidos | Restringe generadores |
| Test lento o flaky | Propiedad costosa/no determinista | Limita tamaño, evita tiempo/aleatoriedad no controlada |
| Confías solo en properties | Faltan casos de ejemplo legibles | Combina ejemplos + propiedades |

**Verificación rápida**

Agrega una propiedad simple sobre una función pura y verifica que el runner ejecuta múltiples casos.

## Cierre del módulo

Con JUnit, Mockito, tests parametrizados y propiedades, puedes construir una red de seguridad real. El siguiente módulo entra al diseño interno de la JVM: classloaders, bytecode, GC y JIT.
