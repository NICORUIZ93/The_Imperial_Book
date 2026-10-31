# Revisión parcial: Sumérgete en los patrones de diseño

Fecha: 2026-10-13. Archivo relativo a la biblioteca: `Programacion/Arquitectura_Patrones_CleanCode/Sumergete en los patrones de diseno - Alexander Shvets.pdf`. Edición visible: v2021-1.7. 437 páginas PDF. La huella está en `catalogo.json`.

## Alcance comprobado

Índice y capítulos Singleton, Observer y Strategy, por extracción de texto. Páginas PDF 5–7, 149–158, 359–374 y 392–406; numeración impresa de capítulos 148–157, 358–373 y 391–405. También se inspeccionó el texto de principios de diseño y Factory Method, páginas PDF 35–75 y 79–95. En esta continuación se revisaron Abstract Factory y Builder, páginas PDF 96–111 y 112–132. Se contrastaron familias de productos compatibles, pasos de construcción y el rol opcional del director con las demostraciones existentes.

El 2026-10-30 se consultó además la versión de prueba oficial en internet: su índice confirma Prototype en las páginas impresas 132–147 y los patrones estructurales en 158–265. Las páginas conceptuales oficiales de Prototype y del catálogo estructural se usaron como contraste editorial; esto no se registra como lectura de los capítulos completos del PDF externo. No se ha revisado el resto del libro ni verificado visualmente todos sus diagramas. La extracción y la consulta web no sustituyen esa revisión.

## Hallazgos aplicados

| Hallazgo | Destino | Evidencia |
|---|---|---|
| Separar selección de algoritmo y ejecución | `web/public/content/java/modulo-12.md`, laboratorio Strategy | Tres tarifas, mismo consumidor; distancia negativa rechazada |
| Identidad global frente a dependencias reemplazables | Mismo módulo, laboratorio Singleton | Configuración de prueba USD independiente de COP; fallo por consulta global |
| Ciclo de suscripción y cancelación | Mismo módulo, laboratorio Observer | Cliente recibe primer evento; auditoría recibe ambos |
| Costes de errores y acoplamiento | Límites y ejercicios de los tres laboratorios | Excepción de callback interrumpe la notificación, sin prometer entrega persistente |
| Separar Factory simple de Factory Method | `web/public/content/java/modulo-12.md`, Tema 2 | `switch` centralizado frente a método de creación redefinido por creadores; demostración `CreationalPatternsDemo.java` |
| Relacionar los principios SOLID con señales observables | Mismo módulo, Tema 4 | Ejemplos del dominio RutaFlow para SRP, OCP, LSP, ISP y DIP; ejercicio de composición frente a herencia |
| Mantener compatibles familias de productos | `web/public/content/java/modulo-12.md`, Tema 3 | `TransportistaFactory` produce juntos `Etiqueta` y `Guia` local o internacional; ejercicio detecta combinaciones cruzadas |
| Distinguir Builder fluido y Builder GoF | Mismo módulo, Tema 1 | Validación del producto inmutable existente; explicación de constructores alternativos y de que el director es opcional |
| Copiar un prototipo sin compartir estado mutable | Mismo módulo, Tema 5 | `PrototypeDemo.java` contrasta constructor de copia profunda y fallo por lista compartida |
| Elegir patrones estructurales por intención | Mismo módulo, Tema 6 | Adapter, Bridge, Composite, Decorator, Facade y Proxy se ejecutan y comparan; Flyweight queda como ampliación explícita |

Código original: `examples/java/patrones-rutaflow/`. Los ejemplos no reproducen el pseudocódigo del libro. Los matices de Java y decisiones de mensajería son adaptación editorial, no afirmaciones de haber verificado una implementación del libro.

Fuentes de contraste: [índice oficial de la edición v2021-1.7](https://refactoring.guru/files/design-patterns-es-demo.pdf), [Prototype](https://refactoring.guru/design-patterns/prototype), [patrones estructurales](https://refactoring.guru/design-patterns/structural-patterns), [Factory Method](https://refactoring.guru/design-patterns/factory-method), [Strategy](https://refactoring.guru/design-patterns/strategy), [Singleton](https://refactoring.guru/design-patterns/singleton), [Observer](https://refactoring.guru/design-patterns/observer) y [JLS, enums y campos](https://docs.oracle.com/en/java/javase/26/docs/specs/jls/jls-8.html).

## Temas del índice aún por revisar

Fundamentos POO; Chain of Responsibility; Command; Iterator; Mediator; Memento; State; Template Method y Visitor. El índice de esta edición anuncia 22 patrones, no 23. Prototype y los patrones estructurales tienen contraste editorial con páginas oficiales en internet y ejemplos originales ejecutables, pero sus capítulos del PDF externo continúan pendientes de lectura completa. Principios SOLID, Factory Method, Abstract Factory y Builder tienen una revisión textual acotada.

## Validación ejecutada

En JDK 26.0.2: tres comandos normales terminaron con código 0 y las salidas documentadas; tres comandos con `fallo` terminaron con código 1 y los mensajes esperados. No se ha ejecutado aún en JDK 25. No son pruebas de concurrencia ni de integración con el backend.

## Siguiente lectura

Cuando el disco esté disponible, leer por completo Prototype (132–147) y los patrones estructurales (158–265), contrastar cada diagrama y corregir las adaptaciones si aparece un matiz omitido. Después continuar con Chain of Responsibility. Registrar el rango exacto leído y no declarar revisado el resto del libro.
