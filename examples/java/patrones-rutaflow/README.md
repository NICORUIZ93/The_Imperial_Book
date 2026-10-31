# Patrones en el dominio RutaFlow

Laboratorio independiente, sin conexión al backend de RutaFlow. Código original de la academia para Java 17 o superior; el curso usa JDK 25. Desde la raíz del repositorio:

```sh
java examples/java/patrones-rutaflow/StrategyDemo.java
java examples/java/patrones-rutaflow/SingletonDemo.java
java examples/java/patrones-rutaflow/ObserverDemo.java
java examples/java/patrones-rutaflow/CreationalPatternsDemo.java
java examples/java/patrones-rutaflow/PrototypeDemo.java
java examples/java/patrones-rutaflow/StructuralPatternsDemo.java
java examples/java/patrones-rutaflow/BehavioralPatternsDemo.java
```

Salidas esperadas, en el mismo orden:

```text
normal=1500
express=2400
recogida=0
```

```text
misma instancia=true
produccion=COP
prueba=USD
```

```text
cliente=EN_CAMINO
auditoria=EN_CAMINO
auditoria=ENTREGADA
```

Añade `fallo` al final de cada comando para provocar, respectivamente, una distancia negativa, una dependencia global que ignora la configuración inyectada y un observador que impide notificar a los demás. Son excepciones deliberadas de estos ejemplos, no mensajes atribuidos a servicios externos.

`CreationalPatternsDemo` ejecuta cinco variantes Singleton (eager, lazy no sincronizada,
synchronized, double-checked locking y enum), Factory Method, Abstract Factory,
Builder y Prototype. La variante lazy se deja intencionalmente sin sincronización
para comparar sus límites; no debe usarse como singleton concurrente.

La demostración Abstract Factory crea dos familias completas: local (`Etiqueta` y
`Guia`) e internacional. Mantén una única fábrica por operación para no combinar
productos de variantes distintas. El Builder de `Pedido` es una API fluida con
campos obligatorios, una opción predeterminada y validación final; no implementa
un director ni representa varias formas de un mismo producto.

`StructuralPatternsDemo` ejecuta Adapter, Decorator, Facade, Composite, Proxy y
Bridge. `BehavioralPatternsDemo` ejecuta Observer, Strategy, Command, Template
Method, Chain of Responsibility, State, Iterator, Mediator, Memento y Visitor.
Cada salida comienza con el nombre del patrón para hacer verificable la
comparación desde terminal.

```text
singleton=eager,lazy-no-sync,synchronized,double-checked,enum
factory=email:RF-1,sms:RF-1
abstract-factory=LOCAL-RF-1,entrega-hoy;INT-RF-1,aduana-y-seguimiento
builder=Ana:RF-1:2
prototype=RF-2:750g
adapter=LEGACY-42
decorator=log[email(RF-1)]
facade=validado|reserva:RF-1|aviso:RF-1
composite=RF-1+RF-2+RF-3
proxy=1500
bridge=sms:estado=EN_CAMINO
observer=EN_CAMINO
strategy=1500
command=CANCELLED
template=validado>db:RF-1>notificado
chain=reintento
state=IN_TRANSIT
iterator=CREATED,IN_TRANSIT
mediator=cliente:DELIVERED
memento=Calle 1
visitor=zona:NORTE,demora:15
```

El [Módulo 12 de Java](../../../web/public/content/java/modulo-12.md) amplía
principios SOLID, patrones de arquitectura, principios y antipatrones.
Estos ejemplos de patrones GoF son educativos y en memoria: no implementan
persistencia, concurrencia de producción, Saga, Outbox ni entrega de eventos
entre procesos. La lección `web/public/content/java/modulo-12.md` desarrolla
diagnóstico, corrección y ejercicios para Builder, Factory Method, Abstract Factory,
Strategy, Prototype, patrones estructurales y SOLID.

`PrototypeDemo` hace visible la diferencia entre copiar el contenedor y compartir
accidentalmente una colección mutable. La ejecución normal modifica la copia sin
alterar el original. Añade `fallo` al comando para reproducir
`copia superficial compartio etiquetas` y diagnosticar la referencia compartida.
