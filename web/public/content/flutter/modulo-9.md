# Módulo 9: Pruebas en Flutter: unitarias, de widgets, con dobles, golden y de integración

**Entorno comprobado para esta edición (2026-11-24):** Flutter 3.50.1 (canal estable) con Dart 3.14.0 en Linux
x86_64, con `material_ui` 1.11.1 y `mocktail` 1.0.5. Todo el código se analizó con `flutter analyze` (`No issues
found!`) y todas las pruebas se ejecutaron ese día, en `/home/estudiante/labs/flutter/m9` (tu `~/labs/flutter/m9`):
las unitarias, de widgets y golden con `flutter test`, y la de integración con la app real de escritorio Linux en una
pantalla virtual. Las imágenes del Tema 4 son las que genera Flutter cuando una prueba golden falla.

Los módulos anteriores usaron pruebas para medir y para obtener pantallazos. Este módulo las ordena: qué tipo de
prueba sirve para qué, cómo se escribe cada una para que falle cuando debe y diga por qué, y cómo saber qué parte del
código no está probada. Todas las pruebas son sobre la misma pantalla de la ruta, con su tarifa y su marcado
optimista.

**Al terminar este módulo podrás:**
- escribir pruebas unitarias con `group`, `test`, `expect` y casos límite, y leer un fallo;
- probar una pantalla con `WidgetTester`: construir, buscar, tocar y comprobar;
- reemplazar dependencias con dobles de prueba: falsos hechos a mano y mocks con `mocktail`;
- proteger el diseño con pruebas golden y leer las imágenes de diferencia;
- probar un flujo completo en la app compilada y medir la cobertura.

**Esquema del módulo:** Tema 1 (pruebas unitarias) → Tema 2 (pruebas de widgets) → Tema 3 (dobles de prueba con
`mocktail`) → Tema 4 (pruebas golden) → Tema 5 (integración y cobertura) → Proyecto 26.

**Qué necesitas saber antes:** el Módulo 8; del Módulo 4, **`ChangeNotifier`** y **reemplazar dependencias** (Temas
2 y 6); del Módulo 7, **las pruebas de integración en Linux** (Tema 1); del Módulo 1, **la herramienta de
pantallazos**.

**Qué no se repite:** las pruebas de medición de rendimiento (Módulo 8, Tema 3) y de restauración (Módulo 6, Tema 4);
aquí se usan las mismas herramientas para comprobar comportamiento.

**Prepara el proyecto:**

```text
$ cd ~/labs/flutter
$ flutter create --org com.academia --platforms=linux,web m9
$ cd m9
$ flutter pub add dev:mocktail 'dev:integration_test:{"sdk":"flutter"}'
```

El código que se prueba en todo el módulo: la regla de la tarifa, el controlador de la ruta y la pantalla.

```dart
// lib/tarifas.dart — la regla de la tarifa de envío: lógica pura, ideal para pruebas unitarias
int tarifaEnvio({required int pesoGramos, required int distanciaKm, bool urgente = false}) {
  if (pesoGramos <= 0) throw ArgumentError.value(pesoGramos, 'pesoGramos', 'debe ser positivo');
  if (distanciaKm < 0) throw ArgumentError.value(distanciaKm, 'distanciaKm', 'no puede ser negativa');
  final kilosExtra = ((pesoGramos - 1) ~/ 1000);                    // el primer kilo va en la base
  var tarifa = 5000 + kilosExtra * 1000;
  if (distanciaKm > 20) tarifa += 2000;
  if (urgente) tarifa = ((tarifa * 1.5) / 100).ceil() * 100;         // redondea hacia arriba a la centena
  return tarifa;
}

/// «$ 6.500»: separador de miles con punto, como se escribe en Colombia.
String pesos(int valor) {
  final texto = valor.toString();
  final grupos = <String>[];
  for (var fin = texto.length; fin > 0; fin -= 3) {
    grupos.insert(0, texto.substring(fin - 3 < 0 ? 0 : fin - 3, fin));
  }
  return '\$ ${grupos.join('.')}';
}
```

```dart
// lib/ruta.dart — el repositorio (interfaz) y el controlador de la ruta, que la pantalla usa
import 'package:material_ui/material_ui.dart';

class Entrega {
  const Entrega(this.guia, this.pesoGramos, this.distanciaKm, {this.entregada = false});
  final String guia;
  final int pesoGramos;
  final int distanciaKm;
  final bool entregada;
  Entrega marcada() => Entrega(guia, pesoGramos, distanciaKm, entregada: true);
}

abstract interface class RepositorioEntregas {
  Future<List<Entrega>> pendientes();
  Future<void> marcar(String guia);
}

enum EstadoRuta { cargando, lista, error }

class ControladorRuta extends ChangeNotifier {
  ControladorRuta(this._repo);
  final RepositorioEntregas _repo;
  var estado = EstadoRuta.cargando;
  var entregas = <Entrega>[];
  String? aviso;

  Future<void> cargar() async {
    estado = EstadoRuta.cargando;
    notifyListeners();
    try {
      entregas = await _repo.pendientes();
      estado = EstadoRuta.lista;
    } catch (_) {
      estado = EstadoRuta.error;
    }
    notifyListeners();
  }

  /// Optimista: marca en pantalla de inmediato y deshace si el servidor falla.
  Future<void> marcar(String guia) async {
    final antes = entregas;
    entregas = [for (final e in entregas) e.guia == guia ? e.marcada() : e];
    aviso = null;
    notifyListeners();
    try {
      await _repo.marcar(guia);
    } catch (_) {
      entregas = antes;                                             // vuelve al estado anterior
      aviso = 'No se pudo marcar $guia. Inténtalo de nuevo.';
      notifyListeners();
    }
  }
}
```

```dart
// lib/pantalla_ruta.dart — la pantalla que prueban los Temas 2, 4 y 5
import 'package:material_ui/material_ui.dart';

import 'ruta.dart';
import 'tarifas.dart';

class TarjetaEntrega extends StatelessWidget {
  const TarjetaEntrega(this.entrega, {super.key, this.alMarcar});
  final Entrega entrega;
  final VoidCallback? alMarcar;

  @override
  Widget build(BuildContext context) {
    final texto = Theme.of(context).textTheme;
    final colores = Theme.of(context).colorScheme;
    return Card.outlined(
      child: ListTile(
        key: Key('fila-${entrega.guia}'),
        leading: Icon(entrega.entregada ? Icons.check_circle : Icons.inventory_2_outlined,
            color: entrega.entregada ? colores.primary : null),
        title: Text(entrega.guia),
        subtitle: Text('${(entrega.pesoGramos / 1000).toStringAsFixed(1)} kg · ${entrega.distanciaKm} km'),
        trailing: Text(pesos(tarifaEnvio(pesoGramos: entrega.pesoGramos, distanciaKm: entrega.distanciaKm)),
            style: texto.titleMedium),
        onTap: entrega.entregada ? null : alMarcar,
      ),
    );
  }
}

class PantallaRuta extends StatefulWidget {
  const PantallaRuta(this.controlador, {super.key});
  final ControladorRuta controlador;

  @override
  State<PantallaRuta> createState() => _PantallaRutaState();
}

class _PantallaRutaState extends State<PantallaRuta> {
  @override
  void initState() {
    super.initState();
    widget.controlador.addListener(_alCambiar);
    widget.controlador.cargar();
  }

  void _alCambiar() {
    final aviso = widget.controlador.aviso;
    if (aviso != null) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(aviso)));
  }

  @override
  void dispose() {
    widget.controlador.removeListener(_alCambiar);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Ruta de hoy')),
        body: ListenableBuilder(
          listenable: widget.controlador,
          builder: (context, _) => switch (widget.controlador.estado) {
            EstadoRuta.cargando => const Center(child: CircularProgressIndicator()),
            EstadoRuta.error => Center(
                child: FilledButton(onPressed: widget.controlador.cargar, child: const Text('Reintentar')),
              ),
            EstadoRuta.lista => ListView(
                padding: const EdgeInsets.all(8),
                children: [
                  for (final e in widget.controlador.entregas)
                    TarjetaEntrega(e, alMarcar: () => widget.controlador.marcar(e.guia)),
                ],
              ),
          },
        ),
      );
}
```

```dart
// lib/main.dart — la pantalla con un repositorio de demostración
import 'package:material_ui/material_ui.dart';

import 'pantalla_ruta.dart';
import 'ruta.dart';

class RepositorioDemo implements RepositorioEntregas {
  @override
  Future<List<Entrega>> pendientes() async => const [Entrega('EN-4471', 1200, 8), Entrega('EN-4472', 350, 25)];
  @override
  Future<void> marcar(String guia) async {}
}

void main() => runApp(MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorSchemeSeed: Colors.indigo),
      home: PantallaRuta(ControladorRuta(RepositorioDemo())),
    ));
```


## Aprende construyendo


### Tema 1: Pruebas unitarias: reglas, casos límite y fallos que se entienden · Básico · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- organizar pruebas con `group` y `test`, y comprobar con `expect` y *matchers*;
- elegir casos límite (el valor justo antes y justo después de una regla);
- comprobar que una función rechaza datos imposibles;
- leer un fallo: valor esperado, valor obtenido y motivo.

**Conceptos clave:** prueba unitaria, `expect` y *matcher*, caso límite, prueba parametrizada, mensaje de fallo

#### El problema
La tarifa tiene cuatro reglas: base, kilos adicionales, distancia y urgencia. Un cambio pequeño («el primer kilo va
en la base») puede romper otra regla sin que nadie lo note hasta que un cliente reclama un cobro. Las reglas de
negocio necesitan pruebas que corran en milisegundos y digan exactamente qué se rompió.

Este tema usa **funciones con parámetros con nombre** (Módulo 0, Tema 2), **excepciones** (Módulo 0, Tema 3) y
**records** (Módulo 0, Tema 6).

#### Glosario del tema

**prueba unitaria**
- **Definición técnica:** prueba de una función o clase aislada, sin interfaz ni red, que se ejecuta con `test()` en milisegundos.
- **En palabras sencillas:** comprobar una pieza suelta.
- **Dónde se rompe la comparación:** una pieza puede funcionar sola y fallar al unirse con otras; para eso están los otros tipos de prueba.
- **Ejemplo:** `tarifaEnvio(pesoGramos: 350, distanciaKm: 8)` debe dar 5000.
- **Error típico:** probar la regla de la tarifa a través de la pantalla: lento y frágil.

**`expect` y matcher**
- **Definición técnica:** `expect(valor, matcher)` comprueba un valor contra un *matcher* (`equals`, `isTrue`, `contains`, `throwsArgumentError`, `isA<T>().having(...)`); un valor simple equivale a `equals`.
- **En palabras sencillas:** «espero que esto sea así».
- **Dónde se rompe la comparación:** los *matchers* compuestos describen qué esperaban; por eso los fallos se entienden.
- **Ejemplo:** `throwsA(isA<ArgumentError>().having((e) => e.name, 'name', 'distanciaKm'))`.
- **Error típico:** `expect(a == b, isTrue)`: si falla, solo dice «esperaba true».

**caso límite**
- **Definición técnica:** entrada en el borde de una regla: el último valor que no la activa y el primero que sí.
- **En palabras sencillas:** probar justo en la raya.
- **Dónde se rompe la comparación:** los errores de «mayor que» frente a «mayor o igual» solo aparecen en la raya.
- **Ejemplo:** 1000 g y 1001 g; 20 km y 21 km.
- **Error típico:** probar solo valores «típicos» (350 g, 8 km).

**prueba parametrizada**
- **Definición técnica:** varias pruebas generadas a partir de una lista de casos, cada una con su nombre.
- **En palabras sencillas:** la misma prueba con distintos datos.
- **Dónde se rompe la comparación:** cada caso es una prueba aparte: si falla uno, los demás siguen.
- **Ejemplo:** el `for` con records `(valor, esperado)` en el grupo `pesos`.
- **Error típico:** un solo `test` con muchos `expect`: el primer fallo oculta los siguientes.

**mensaje de fallo**
- **Definición técnica:** lo que imprime una prueba que falla: `Expected`, `Actual`, el `reason` y la línea.
- **En palabras sencillas:** la explicación del error.
- **Dónde se rompe la comparación:** el `reason` es tuyo: escríbelo para quien lea el fallo dentro de seis meses.
- **Ejemplo:** `Expected: <13450>  Actual: <13500>`.
- **Error típico:** nombres de prueba como «test 1».

#### ► CÓMO FUNCIONA

##### 1. La idea en lenguaje sencillo
Piensa en la báscula de una oficina de envíos. Cada mañana alguien pone encima una pesa de 1 kg conocida y mira si
marca 1000 g. No pesa paquetes de clientes para comprobarlo: usa un valor cuyo resultado sabe de antemano.

Una prueba unitaria hace lo mismo con una función. Llamas a `tarifaEnvio` con un peso y una distancia cuyo precio
calculaste a mano desde la regla. Si el resultado coincide, la prueba pasa; si no, te dice cuánto esperabas, cuánto
salió y en qué línea.

La tarifa tiene cuatro reglas que se combinan. Un cambio en una puede romper otra sin que la pantalla lo muestre.
Con pruebas que corren en milisegundos, ese error aparece al guardar el archivo, no cuando un cliente reclama.

##### 2. Definición formal y vocabulario
Una **prueba unitaria** ejecuta una función o una clase aislada, sin interfaz, sin red y sin disco. En Dart se
declara con `test(descripción, cuerpo)`. Las pruebas relacionadas se agrupan con `group`, que antepone su nombre al
de cada prueba.

La comprobación se escribe con **`expect` y *matcher***. `expect(valor, matcher)` compara un valor real con una
descripción de lo esperado. Un *matcher* es un objeto que sabe si un valor cumple una condición y cómo describirla en
palabras.

Un **caso límite** es una entrada en el borde de una regla. Una **prueba parametrizada** genera varias pruebas desde
una lista de casos. El **mensaje de fallo** es el texto que la prueba imprime al fallar: `Expected`, `Actual`, tu
`reason` y la pila de llamadas.

Estas funciones vienen del paquete `test` de Dart. `flutter_test` las reexporta, por eso basta un import en
`tarifas_test.dart`.

##### 3. Cómo funciona por dentro, paso a paso
Al ejecutar `flutter test test/tarifas_test.dart` ocurre esto:

1. La herramienta compila el archivo de prueba con tu código y lo arranca en un proceso de prueba sin ventana.
2. Se ejecuta `main()`. Las llamadas a `group` y `test` no prueban nada todavía: solo registran las pruebas en una
   lista, con su nombre completo.
3. El corredor de pruebas recorre esa lista en orden y ejecuta el cuerpo de cada `test`. Si el cuerpo devuelve un
   `Future`, espera a que termine.
4. Cada `expect` evalúa su *matcher*. Si se cumple, no hace nada y la prueba sigue.
5. Si no se cumple, `expect` lanza una excepción `TestFailure`. La prueba se detiene en esa línea.
6. El corredor atrapa la excepción, marca la prueba como fallida e imprime la descripción del *matcher*.
7. Al final, imprime el total. Si alguna falló, la orden termina con código de salida 1, el dato que mira un CI.

```dart
for (final (valor, esperado) in [(500, r'$ 500'), (6500, r'$ 6.500'), (1234567, r'$ 1.234.567')]) {
  test('$valor → $esperado', () => expect(pesos(valor), esperado));
}
```

Este bucle corre en el paso 2. Desestructura cada record en `valor` y `esperado` y registra tres pruebas con nombres
distintos. Por eso la salida lista `pesos 500 → $ 500` y llega a `+8`.

```mermaid
flowchart LR
    T["flutter test test/tarifas_test.dart"] --> M["main registra las pruebas"]
    M --> G1["group tarifaEnvio: 5 tests"]
    M --> G2["group pesos: 3 tests generados"]
    G1 --> E["expect con su matcher"]
    G2 --> E
    E -->|cumple| OK["la prueba sigue y suma +1"]
    E -->|no cumple| F["TestFailure: Expected, Actual, reason, línea"]
    F --> X["suma -1 y código de salida 1"]
```

El contador de la salida resume el recorrido. `+5` significa cinco pruebas que pasaron hasta ese momento y `-1`, una
que falló. Una prueba omitida con `skip` aparecería como `~1`.

##### 4. Reglas, variantes y casos límite
Si pasas un valor simple en lugar de un *matcher*, `expect` lo envuelve en `equals`. Así, `expect(x, 5000)` compara
con `==`. Para decimales usa `closeTo(valor, margen)`, porque la igualdad exacta entre `double` falla por redondeo.

Un `expect` fallido detiene su prueba. En el ejemplo que falla, los tres primeros pasan y el cuarto corta. Por eso
conviene una prueba por regla: un fallo no oculta los siguientes.

Las excepciones se prueban pasando una función, no un resultado. `expect(() => tarifaEnvio(...), throwsArgumentError)`
deja que `expect` llame a la función y atrape el error. Sin el `() =>`, la excepción saltaría antes de llegar a
`expect` y la prueba fallaría por error, no por expectativa.

`isA<T>().having(...)` comprueba el tipo y además una propiedad. En el ejemplo verifica que el `ArgumentError` nombra
`distanciaKm`. Si falla, el mensaje incluye la etiqueta `'name'` que le diste.

Elige los casos límite a ambos lados de cada comparación: 1000 y 1001 g, 20 y 21 km. Un `>` cambiado por `>=` solo se
nota en la raya, como comprobarás en el Paso 4.

Para código asíncrono, el cuerpo de `test` puede ser `async` y usar `await`. Con *matchers* de futuros, como
`completion` o `throwsA` sobre un `Future`, usa `expectLater` y espéralo con `await`.

Hay más controles útiles. `setUp` y `tearDown` corren antes y después de cada prueba de su grupo. `flutter test
--plain-name 'pesos'` ejecuta solo las pruebas cuyo nombre contiene ese texto.

##### 5. Relación con lo que ya sabes y lo que viene
Este tema aplica el Módulo 0. Los parámetros con nombre (Tema 2) hacen legibles las llamadas de prueba. Las
excepciones (Tema 3) son lo que `throwsArgumentError` atrapa, y los records (Tema 6) dan forma a cada caso
parametrizado.

En el Módulo 8 usaste `testWidgets` para medir y tomar pantallazos. Una prueba unitaria es más simple: no construye
widgets ni avanza relojes. Por eso es la más rápida y la que más escribirás.

El Tema 2 sube un nivel y prueba la pantalla que muestra esta tarifa. El Tema 3 resuelve cómo probar el controlador,
que depende de un repositorio. El Tema 5 medirá qué líneas de `tarifas.dart` quedaron cubiertas.

#### Problema resuelto 1.1
Escribe las pruebas de la tarifa y del formato de pesos, con casos límite y datos imposibles. Después, lee el fallo
de una prueba con una expectativa equivocada.

**Razonamiento:**
1. Un grupo por función; dentro, una prueba por regla.
2. Cada regla se prueba en su raya: 1000 y 1001 g, 20 y 21 km.
3. Los datos imposibles se prueban con `throwsArgumentError` y con `having` para comprobar qué parámetro falló.
4. El formato de pesos se prueba con una lista de casos.
5. La prueba que falla a propósito está en `ejemplos_que_fallan/`, fuera de `test/`.

```dart
// test/tarifas_test.dart — pruebas unitarias: entradas, salida esperada y casos límite
import 'package:flutter_test/flutter_test.dart';
import 'package:m9/tarifas.dart';

void main() {
  group('tarifaEnvio', () {
    test('un paquete liviano y cercano paga la base', () {
      expect(tarifaEnvio(pesoGramos: 350, distanciaKm: 8), 5000);
    });

    test('cada kilo empezado después del primero suma 1000', () {
      expect(tarifaEnvio(pesoGramos: 1000, distanciaKm: 0), 5000, reason: 'exactamente 1 kg sigue en la base');
      expect(tarifaEnvio(pesoGramos: 1001, distanciaKm: 0), 6000, reason: 'un gramo más ya es otro kilo');
      expect(tarifaEnvio(pesoGramos: 2300, distanciaKm: 0), 7000);
    });

    test('más de 20 km suma 2000; 20 km exactos no', () {
      expect(tarifaEnvio(pesoGramos: 500, distanciaKm: 20), 5000);
      expect(tarifaEnvio(pesoGramos: 500, distanciaKm: 21), 7000);
    });

    test('urgente: por 1,5 y redondeado hacia arriba a la centena', () {
      expect(tarifaEnvio(pesoGramos: 1200, distanciaKm: 25, urgente: true), 12000);   // (6000 + 2000) × 1,5
      expect(tarifaEnvio(pesoGramos: 4100, distanciaKm: 0, urgente: true), 13500);    // 9000 × 1,5
    });

    test('rechaza datos imposibles', () {
      expect(() => tarifaEnvio(pesoGramos: 0, distanciaKm: 5), throwsArgumentError);
      expect(
        () => tarifaEnvio(pesoGramos: 100, distanciaKm: -1),
        throwsA(isA<ArgumentError>().having((e) => e.name, 'name', 'distanciaKm')),
      );
    });
  });

  group('pesos', () {
    for (final (valor, esperado) in [(500, r'$ 500'), (6500, r'$ 6.500'), (1234567, r'$ 1.234.567')]) {
      test('$valor → $esperado', () => expect(pesos(valor), esperado));
    }
  });
}
```

```text
$ flutter test test/tarifas_test.dart
00:00 +0: loading /home/estudiante/labs/flutter/m9/test/tarifas_test.dart
00:00 +0: tarifaEnvio un paquete liviano y cercano paga la base
00:00 +1: tarifaEnvio cada kilo empezado después del primero suma 1000
00:00 +2: tarifaEnvio más de 20 km suma 2000; 20 km exactos no
00:00 +3: tarifaEnvio urgente: por 1,5 y redondeado hacia arriba a la centena
00:00 +4: tarifaEnvio rechaza datos imposibles
00:00 +5: pesos 500 → $ 500
00:00 +6: pesos 6500 → $ 6.500
00:00 +7: pesos 1234567 → $ 1.234.567
00:00 +8: All tests passed!
```

```dart
// ejemplos_que_fallan/tarifa_mal_test.dart — FALLA A PROPÓSITO: la expectativa supone que «urgente» suma 50 %
// sin redondear. Ejecútalo con: flutter test ejemplos_que_fallan/tarifa_mal_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:m9/tarifas.dart';

void main() {
  test('urgente con un valor que no termina en centena', () {
    expect(tarifaEnvio(pesoGramos: 100, distanciaKm: 0, urgente: true), 7500);
    expect(tarifaEnvio(pesoGramos: 1100, distanciaKm: 30, urgente: true), 12000,
        reason: '(6000 + 2000) × 1,5 = 12000');
    expect(tarifaEnvio(pesoGramos: 1100, distanciaKm: 30, urgente: true) % 100, 0);
    expect(tarifaEnvio(pesoGramos: 2100, distanciaKm: 30, urgente: true), 13450,
        reason: 'creí que 1,5 × 9000 = 13450');
  });
}
```

```text
$ flutter test ejemplos_que_fallan/tarifa_mal_test.dart
00:00 +0: loading /home/estudiante/labs/flutter/m9/ejemplos_que_fallan/tarifa_mal_test.dart
00:00 +0: urgente con un valor que no termina en centena
00:00 +0 -1: urgente con un valor que no termina en centena [E]
  Expected: <13450>
    Actual: <13500>
  creí que 1,5 × 9000 = 13450
  
  package:matcher                                     expect
  package:flutter_test/src/widget_tester.dart 473:18  expect
  ejemplos_que_fallan/tarifa_mal_test.dart 12:5       main.<fn>
  
00:00 +0 -1: Some tests failed.

Failing tests:
  /home/estudiante/labs/flutter/m9/ejemplos_que_fallan/tarifa_mal_test.dart: urgente con un valor que no termina en centena
[código de salida: 1]
```

**Explicación por partes.**
- `reason:` en la prueba de kilos explica la regla en el mismo lugar donde se comprueba.
- La salida muestra 8 pruebas: 5 de la tarifa y 3 generadas para `pesos`, cada una con su nombre.
- En el ejemplo que falla, los tres primeros `expect` pasan y el cuarto da `Expected: <13450>  Actual: <13500>`, con
  el `reason` y la línea 12: la expectativa olvidaba que el urgente se redondea hacia arriba a la centena.
- El fallo dice exactamente qué valor y dónde; no hace falta depurar.

> **Error común.** Copiar el resultado de la función en la prueba («salió 13500, pongo 13500»). La prueba queda
> comprobando lo que el código hace, no lo que debería hacer. Calcula el esperado a mano, desde la regla.

> **Error común.** Probar solo el caso feliz. Los errores de cobro están en los límites y en los datos raros.

> **Buena práctica.** Nombra cada prueba con la regla que comprueba («más de 20 km suma 2000; 20 km exactos no»): la
> lista de pruebas se convierte en la documentación de la regla.

> **Prevenir errores.** Ejecuta las pruebas unitarias en cada guardado (`flutter test` es rápido) y en el CI en cada
> pull request.

#### Checkpoint 1.1
¿Qué tarifa da 1000 g a 21 km, urgente?

Respuesta: 10 500. Base 5000 (1000 g está en el primer kilo), más 2000 por la distancia: 7000; por 1,5: 10 500, que ya
termina en centena.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Crea los archivos
Crea `lib/tarifas.dart` y `test/tarifas_test.dart`.

#### Paso 2 · Ejecuta
Ejecuta `flutter test test/tarifas_test.dart` y después el ejemplo que falla.

#### Paso 3 · Agrega un caso
Agrega una prueba para 1000 g a 21 km, urgente, con el valor del Checkpoint.

#### Paso 4 · Rompe la regla
Cambia en `tarifaEnvio` el `> 20` por `>= 20` y ejecuta. ¿Qué prueba falla y qué dice?

#### Paso 5 · Agrega una regla
Agrega «los domingos +30 %» con un parámetro `domingo` y escribe sus pruebas antes de implementarla.

#### Resumen
- Una **prueba unitaria** comprueba una pieza aislada con **`expect` y un *matcher***.
- Los **casos límite** encuentran los errores de comparación.
- Una **prueba parametrizada** genera una prueba por caso.
- Un buen **mensaje de fallo** dice qué, cuánto y dónde.

#### Ejercicio verificable 1
Básico. ¿Cuántas pruebas ejecuta `test/tarifas_test.dart`?

Respuesta esperada: 8 (`All tests passed!` con `+8`).

#### Ejercicio verificable 2
Intermedio. En el Paso 4, ¿qué prueba falla?

Respuesta esperada: «más de 20 km suma 2000; 20 km exactos no», con `Expected: <5000>  Actual: <7000>` para 500 g a
20 km.

#### Ejercicio verificable 3
Reto. ¿Por qué el ejemplo que falla usa `pesoGramos: 2100` para el caso de 9000?

Respuesta esperada: porque 2100 g son 2 kilos extra (5000 + 2000), más 2000 por 30 km: 9000. Por 1,5 son 13 500, y
la expectativa de 13 450 es el error.

#### En el trabajo
Las pruebas unitarias son la base de cualquier estrategia de pruebas: muchas, rápidas y precisas. En los equipos
maduros, una regla de negocio no se fusiona sin sus pruebas, y los nombres de las pruebas se leen como
especificación.

</details>

### Tema 2: Pruebas de widgets: construir, buscar, tocar y comprobar · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- construir una pantalla en una prueba con `pumpWidget` y avanzar con `pump`;
- encontrar widgets con `find.text`, `find.byKey`, `find.byIcon` y `find.descendant`;
- simular toques y comprobar el resultado con `findsOneWidget` y `findsNothing`;
- probar un flujo con error usando un repositorio falso hecho a mano.

**Conceptos clave:** `WidgetTester`, *finder*, `pump`, `findsOneWidget`, falso hecho a mano

#### El problema
La regla de la tarifa está probada, pero ¿la pantalla muestra la tarifa correcta en cada fila? ¿Tocar una fila la
marca? ¿Si el servidor falla, la marca se deshace y aparece un aviso? Son preguntas sobre la interfaz, y probarlas a
mano en cada cambio no escala.

Este tema usa **pruebas de widgets** (Módulo 1), **keys** (Módulo 1, Tema 5) y **el controlador con
`ChangeNotifier`** (Módulo 4, Tema 2).

#### Glosario del tema

**`WidgetTester`**
- **Definición técnica:** objeto que `testWidgets` entrega para construir widgets, avanzar el reloj, simular gestos e inspeccionar el árbol, sin abrir una ventana.
- **En palabras sencillas:** un usuario de mentira con cronómetro.
- **Dónde se rompe la comparación:** no hay código nativo ni red real; es un entorno controlado.
- **Ejemplo:** `tester.pumpWidget(...)`, `tester.tap(...)`.
- **Error típico:** usar `Future.delayed` real dentro de `testWidgets`: el reloj es simulado.

**finder**
- **Definición técnica:** descripción de qué widgets buscar (`find.text`, `find.byKey`, `find.byType`, `find.byIcon`, `find.descendant`), que se evalúa contra el árbol actual.
- **En palabras sencillas:** la forma de señalar algo en la pantalla.
- **Dónde se rompe la comparación:** un *finder* no busca hasta que se usa; si el árbol cambia, el resultado cambia.
- **Ejemplo:** `find.descendant(of: find.byKey(Key('fila-EN-4472')), matching: find.byIcon(Icons.check_circle))`.
- **Error típico:** buscar por texto algo que se traduce o cambia; para eso están las keys.

**`pump`**
- **Definición técnica:** avanza el reloj de la prueba y construye un cuadro; `pumpAndSettle` repite hasta que no queden animaciones.
- **En palabras sencillas:** pasar a la página siguiente.
- **Dónde se rompe la comparación:** un `Future` resuelto termina en el siguiente `pump`; uno con espera real, no.
- **Ejemplo:** después de tocar, un `pump` muestra la marca optimista y `pump(100 ms)`, el error que la deshace.
- **Error típico:** comprobar justo después de `tap` sin `pump`: la pantalla todavía no cambió.

**`findsOneWidget`**
- **Definición técnica:** *matcher* que exige que el *finder* encuentre exactamente un widget; también existen `findsNothing`, `findsNWidgets(n)` y `findsWidgets`.
- **En palabras sencillas:** «hay exactamente uno».
- **Dónde se rompe la comparación:** «exactamente uno» falla si hay dos; a veces eso es lo que se quiere detectar.
- **Ejemplo:** `expect(find.text(r'$ 6.000'), findsOneWidget)`.
- **Error típico:** `findsWidgets` cuando se espera uno: no detecta duplicados.

**falso hecho a mano**
- **Definición técnica:** implementación simple de una interfaz, escrita para las pruebas, con datos fijos y comportamiento configurable.
- **En palabras sencillas:** un repositorio de utilería.
- **Dónde se rompe la comparación:** no comprueba cómo se usa; para eso están los mocks (Tema 3).
- **Ejemplo:** `RepositorioFalso(fallarAlMarcar: true)` y su lista `marcadas`.
- **Error típico:** falsos tan complejos que necesitan sus propias pruebas.

#### ► CÓMO FUNCIONA

##### 1. La idea en lenguaje sencillo
Imagina un ensayo de teatro con el tiempo en tus manos. Puedes detener la obra, mirar el escenario, mover a un actor
y avanzar exactamente dos segundos. Nada pasa por su cuenta: todo espera tu orden.

Una prueba de widgets te da ese control sobre una pantalla. Construyes `PantallaRuta` sin abrir ninguna ventana,
señalas la fila `EN-4471`, la tocas y avanzas el reloj 100 ms. Después compruebas lo que vería el conductor: el visto,
la tarifa o el aviso de error.

El Tema 1 probó la regla de la tarifa. Pero la regla puede estar bien y la pantalla mostrar otro número, o no
reaccionar al toque. Este tipo de prueba responde preguntas sobre lo que se ve y lo que se hace.

##### 2. Definición formal y vocabulario
Una prueba de widgets se declara con `testWidgets`. Su cuerpo recibe un **`WidgetTester`**, el objeto que construye
widgets, simula gestos, avanza el reloj e inspecciona el árbol. Todo ocurre en un entorno de prueba sin dispositivo
ni código nativo.

Un ***finder*** describe qué widgets buscar: `find.text`, `find.byKey`, `find.byIcon`, `find.byType` o
`find.descendant`. Es perezoso. En sencillo: es una instrucción para señalar, que solo se cumple cuando la usas.

**`pump`** avanza el reloj simulado y produce un cuadro. `pumpAndSettle` repite `pump` hasta que no quedan cuadros
pendientes.

**`findsOneWidget`** es un *matcher* que se aplica a un *finder*: exige exactamente un resultado. Sus parientes son
`findsNothing`, `findsWidgets` y `findsNWidgets(n)`. El **falso hecho a mano** es la clase `RepositorioFalso`: una
implementación de prueba con datos fijos y un fallo que se activa a pedido.

##### 3. Cómo funciona por dentro, paso a paso
`testWidgets` prepara un entorno especial antes de ejecutar tu cuerpo. Usa un *binding* de prueba, la pieza que une el
framework con la plataforma, y un reloj falso. Los `Timer` y los `Future.delayed` solo avanzan cuando la prueba lo
pide.

Sigue la tercera prueba, la del error:

1. `pumpWidget` monta el `MaterialApp` en una vista de prueba y produce el primer cuadro. `initState` llama a
   `cargar()`, que pide `pendientes()` al falso.
2. El primer `pump` ejecuta las microtareas pendientes. El `Future` de `pendientes()` ya estaba resuelto, el
   controlador notifica y el cuadro muestra la lista.
3. `tester.tap` evalúa el *finder*, calcula el centro de la fila y envía un evento de puntero que baja y sube en ese
   punto. El `ListTile` recibe el toque y llama a `marcar`.
4. `marcar` cambia la lista de inmediato y notifica. Pero `tap` no produce cuadros: la pantalla aún muestra el estado
   anterior.
5. El segundo `pump` construye un cuadro con la marca optimista. El falso sigue esperando su `Future.delayed` de
   100 ms, que en el reloj falso no ha vencido.
6. `pump(100 ms)` adelanta el reloj, vence ese `Timer` y el falso lanza `Exception('sin red')`. El controlador
   restaura la lista y publica el aviso, y el cuadro muestra el `SnackBar`.

```dart
await tester.tap(find.byKey(const Key('fila-EN-4471')));
await tester.pump();                                            // marca optimista: ya se ve el visto
expect(find.byIcon(Icons.check_circle), findsOneWidget);
```

Estas tres líneas corresponden a los pasos 3 a 5. El `expect` evalúa el *finder* contra el árbol de ese momento. Si
movieras el `expect` antes del `pump`, encontraría cero vistos.

```mermaid
sequenceDiagram
    participant T as Prueba
    participant P as PantallaRuta
    participant F as RepositorioFalso
    T->>P: pumpWidget
    P->>F: pendientes()
    T->>P: pump, la lista se ve
    T->>P: tap en fila-EN-4471
    P->>F: marcar, espera 100 ms simulados
    T->>P: pump, marca optimista con visto
    T->>P: pump de 100 ms
    F-->>P: Exception sin red
    P-->>T: deshace la marca y muestra el SnackBar
```

##### 4. Reglas, variantes y casos límite
Los *finders* son perezosos y se reevalúan en cada uso. Puedes guardar uno en una variable y usarlo antes y después de
un `pump`: cada vez mira el árbol actual.

Por defecto, los *finders* ignoran los widgets fuera de escena (*offstage*). Si una fila no entra en pantalla y un
`ListView.builder` no la construyó, ningún *finder* la encuentra. Usa `tester.scrollUntilVisible` o
`tester.dragUntilVisible` para llevarla a la vista.

`tap` comprueba que el punto calculado realmente toque ese widget. Si otro widget lo tapa, imprime una advertencia en
la salida de la prueba. Lee esas advertencias: suelen explicar un toque que «no hizo nada».

`pumpAndSettle` falla si las animaciones nunca terminan. Con un `CircularProgressIndicator` girando, por ejemplo,
agota su tiempo límite y lanza un error. Por eso este tema usa `pump` con duraciones exactas.

Al terminar, el entorno comprueba que no queden `Timer` pendientes. Si no avanzas el reloj lo suficiente para que
venzan, la prueba falla aunque todos los `expect` hayan pasado.

Una excepción lanzada durante `build` no detiene tu código de prueba al instante. El *binding* la captura y la prueba
falla al final. Si quieres comprobar esa excepción, la recuperas con `tester.takeException()`.

La vista de prueba mide 800 × 600 píxeles lógicos por defecto. Si la pantalla depende del tamaño, fíjalo antes de
construir, como hace la herramienta de pantallazos del Módulo 1.

##### 5. Relación con lo que ya sabes y lo que viene
Ya usaste `testWidgets` en el Módulo 1 para los pantallazos y en el Módulo 8 para ver animaciones cuadro a cuadro. Las
keys del Módulo 1, Tema 5 vuelven aquí como asas para buscar filas sin depender del texto.

El controlador con `ChangeNotifier` (Módulo 4, Tema 2) es lo que la prueba recorre. La marca optimista y su reversión
son su lógica, vista desde la pantalla.

Compara con el Tema 1. Allí llamabas a la función y mirabas el número. Aquí llegas al mismo número a través de lo que
se ve, `$ 6.000` en una fila. Prueba cada regla en el nivel más bajo posible y usa este nivel para comprobar que las
piezas se conectan.

El falso hecho a mano tiene un límite: no dice cuántas veces lo llamaron ni con qué argumentos. El Tema 3 resuelve eso
con `mocktail`, y el Tema 4 compara la pantalla píxel a píxel.

#### Problema resuelto 2.1
Prueba la pantalla de la ruta: que muestre las tarifas, que tocar una fila la marque y que un fallo del servidor
deshaga la marca y muestre un aviso.

**Razonamiento:**
1. El falso devuelve dos entregas fijas y registra las guías marcadas; puede fallar a pedido.
2. `abrir` construye la pantalla y avanza un cuadro; las tres pruebas lo reutilizan.
3. Las filas tienen keys (`fila-EN-4471`) para buscarlas sin depender del texto.
4. El falso tarda 100 ms en responder, como un servidor. La prueba del error avanza un cuadro para ver la marca
   optimista y después 100 ms para ver la respuesta con error. **La primera versión del falso fallaba de inmediato**,
   y la marca optimista y la reversión ocurrían en el mismo cuadro: la prueba no podía ver el estado intermedio.

```dart
// test/pantalla_test.dart — pruebas de widgets: construir, buscar, tocar y comprobar lo que se ve
import 'package:flutter_test/flutter_test.dart';
import 'package:m9/pantalla_ruta.dart';
import 'package:m9/ruta.dart';
import 'package:material_ui/material_ui.dart';

/// Un repositorio falso hecho a mano: devuelve datos fijos y puede fallar a pedido.
class RepositorioFalso implements RepositorioEntregas {
  RepositorioFalso({this.fallarAlMarcar = false});
  final bool fallarAlMarcar;
  final marcadas = <String>[];

  @override
  Future<List<Entrega>> pendientes() async => const [Entrega('EN-4471', 1200, 8), Entrega('EN-4472', 350, 25)];

  @override
  Future<void> marcar(String guia) async {
    await Future<void>.delayed(const Duration(milliseconds: 100));   // como un servidor real: tarda
    if (fallarAlMarcar) throw Exception('sin red');
    marcadas.add(guia);
  }
}

Future<RepositorioFalso> abrir(WidgetTester tester, {bool fallar = false}) async {
  final repo = RepositorioFalso(fallarAlMarcar: fallar);
  await tester.pumpWidget(MaterialApp(home: PantallaRuta(ControladorRuta(repo))));
  await tester.pump();                                              // termina la carga (Future ya resuelto)
  return repo;
}

void main() {
  testWidgets('muestra cada entrega con su tarifa', (tester) async {
    await abrir(tester);
    expect(find.text('EN-4471'), findsOneWidget);
    expect(find.text(r'$ 6.000'), findsOneWidget);                  // 1,2 kg a 8 km
    expect(find.text(r'$ 7.000'), findsOneWidget);                  // 0,35 kg a 25 km
    expect(find.byIcon(Icons.check_circle), findsNothing);
  });

  testWidgets('tocar una fila la marca', (tester) async {
    final repo = await abrir(tester);
    await tester.tap(find.byKey(const Key('fila-EN-4472')));
    await tester.pump(const Duration(milliseconds: 100));          // la respuesta del servidor
    expect(repo.marcadas, ['EN-4472']);
    expect(
      find.descendant(of: find.byKey(const Key('fila-EN-4472')), matching: find.byIcon(Icons.check_circle)),
      findsOneWidget,
    );
  });

  testWidgets('si el servidor falla, deshace y avisa', (tester) async {
    await abrir(tester, fallar: true);
    await tester.tap(find.byKey(const Key('fila-EN-4471')));
    await tester.pump();                                            // marca optimista: ya se ve el visto
    expect(find.byIcon(Icons.check_circle), findsOneWidget);
    await tester.pump(const Duration(milliseconds: 100));          // llega el error y deshace
    expect(find.byIcon(Icons.check_circle), findsNothing);
    expect(find.text('No se pudo marcar EN-4471. Inténtalo de nuevo.'), findsOneWidget);
  });
}
```

```text
$ flutter test test/pantalla_test.dart
00:00 +0: loading /home/estudiante/labs/flutter/m9/test/pantalla_test.dart
00:00 +0: muestra cada entrega con su tarifa
00:00 +1: tocar una fila la marca
00:00 +2: si el servidor falla, deshace y avisa
00:01 +3: All tests passed!
```

**Explicación por partes.**
- La primera prueba comprueba lo que ve el usuario: las guías y las tarifas formateadas, que salen de la regla del
  Tema 1.
- La segunda comprueba los dos lados: el falso registró `EN-4472` y la fila muestra el visto.
- La tercera prueba el camino del error, que es el que más se olvida: primero se ve el visto (marca optimista) y,
  cuando llega el error, desaparece y el aviso explica qué pasó.
- Ninguna prueba usa la red ni el reloj real; las tres corren en menos de un segundo.

> **Error común.** Probar widgets por su estructura interna («hay un `Padding` dentro de un `Row`»). Cualquier
> rediseño rompe la prueba sin que haya un error. Prueba lo que el usuario ve y hace.

> **Error común.** Olvidar el segundo `pump` en flujos asíncronos y concluir que «la pantalla no se actualiza».

> **Buena práctica.** Pon keys estables en los elementos con los que se interactúa (filas, botones principales).
> Hacen las pruebas legibles y resistentes a cambios de texto y de traducción.

> **Prevenir errores.** Por cada pantalla, prueba al menos: el estado con datos, la acción principal y el camino de
> error.

#### Checkpoint 2.1
¿Qué pasaría en la tercera prueba con un solo `pump` después de tocar?

Respuesta: la prueba fallaría en `findsNothing`: el falso todavía no respondió (tarda 100 ms), así que la fila sigue
con la marca optimista. Con un falso que falla de inmediato, en cambio, no se podría ver la marca optimista: por eso
el falso de este tema tarda.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Crea el archivo
Crea `test/pantalla_test.dart`.

#### Paso 2 · Ejecuta
Ejecuta `flutter test test/pantalla_test.dart`.

#### Paso 3 · Quita la espera
En la prueba del error, quita la línea `await tester.pump(const Duration(milliseconds: 100));` y lee el fallo.

#### Paso 4 · Prueba el estado de error
Agrega un falso cuyo `pendientes()` lance una excepción y comprueba que aparece «Reintentar»; tócalo y comprueba que
se vuelve a llamar a `pendientes()`.

#### Paso 5 · Prueba una entrega ya marcada
Haz que el falso devuelva una entrega con `entregada: true` y comprueba que tocarla no llama a `marcar`.

#### Resumen
- **`WidgetTester`** construye y opera la pantalla; los ***finders*** señalan widgets.
- **`pump`** avanza el reloj; **`findsOneWidget`** y sus parientes comprueban cuántos hay.
- Un **falso hecho a mano** controla los datos y los errores.

#### Ejercicio verificable 1
Básico. ¿Por qué la tarifa de `EN-4472` es `$ 7.000` si pesa solo 350 g?

Respuesta esperada: porque está a 25 km: base 5000 más 2000 por pasar de 20 km.

#### Ejercicio verificable 2
Intermedio. En el Paso 3, ¿qué mensaje da la prueba?

Respuesta esperada: `Expected: no matching candidates`, `Actual: _IconWidgetFinder:<Found 1 widget with icon
"IconData(U+0E159)": ...>` y `Which: means one was found but none were expected`: todavía hay un visto en pantalla.

#### Ejercicio verificable 3
Reto. En el Paso 5, ¿por qué no se llama a `marcar`?

Respuesta esperada: porque `TarjetaEntrega` pone `onTap: null` cuando la entrega ya está marcada; el toque no hace
nada y la lista `marcadas` del falso queda vacía.

#### En el trabajo
Las pruebas de widgets son la mayor parte de las pruebas de una app Flutter: corren rápido, sin dispositivo, y cubren
la lógica de presentación. En las revisiones de código se pide al menos una prueba por pantalla nueva con su camino
de error.

</details>

### Tema 3: Dobles de prueba con mocktail: qué responde y qué se llamó · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- crear un mock de una interfaz con `mocktail`;
- decir qué debe responder con `when(...).thenAnswer` y `thenThrow`;
- comprobar qué se llamó, cuántas veces y con qué argumentos con `verify`, `captureAny` y `verifyInOrder`;
- elegir entre un falso, un *stub* y un mock.

**Conceptos clave:** doble de prueba, mock, *stub*, `verify`, captura de argumentos, `setUp`

#### El problema
El falso del Tema 2 sirvió para la pantalla, pero para probar el controlador hacen falta preguntas que el falso no
responde con facilidad: ¿se llamó al repositorio una sola vez?, ¿con qué guía?, ¿en qué orden?, ¿nunca se intentó
marcar al cargar? Escribir un falso para cada combinación se vuelve inmanejable.

Este tema usa **el controlador de la ruta** (código del módulo), **interfaces** (Módulo 4, Tema 4) y **funciones
anónimas** (Módulo 0, Tema 2).

#### Glosario del tema

**doble de prueba**
- **Definición técnica:** objeto que reemplaza a una dependencia real en una prueba; los tipos más comunes son falsos, *stubs* y mocks.
- **En palabras sencillas:** el doble de riesgo de una película.
- **Dónde se rompe la comparación:** un doble demasiado distinto del real hace que la prueba pase y la app falle.
- **Ejemplo:** `RepositorioFalso` (Tema 2) y `RepositorioMock`.
- **Error típico:** usar dobles para todo, también para la lógica que se quiere probar.

**mock**
- **Definición técnica:** doble que registra las llamadas que recibe para comprobarlas después; con `mocktail` se crea extendiendo `Mock` e implementando la interfaz.
- **En palabras sencillas:** un doble que toma nota de todo.
- **Dónde se rompe la comparación:** si no se le dice qué responder, devuelve `null` (y con tipos no nulos, falla).
- **Ejemplo:** `class RepositorioMock extends Mock implements RepositorioEntregas {}`.
- **Error típico:** verificar cada llamada interna: la prueba se rompe con cualquier refactorización.

**stub**
- **Definición técnica:** respuesta programada para una llamada: `when(() => repo.pendientes()).thenAnswer(...)`.
- **En palabras sencillas:** el guion del doble.
- **Dónde se rompe la comparación:** para `Future` se usa `thenAnswer((_) async => ...)`, no `thenReturn`.
- **Ejemplo:** `thenThrow(Exception('503'))` para el camino de error.
- **Error típico:** `thenReturn(Future.value(...))`: `mocktail` lo rechaza porque reutilizaría el mismo `Future`.

**`verify`**
- **Definición técnica:** comprueba que una llamada ocurrió (`.called(n)` para la cantidad); `verifyNever` comprueba que no ocurrió; `verifyInOrder`, el orden.
- **En palabras sencillas:** revisar las notas del doble.
- **Dónde se rompe la comparación:** comprueba interacción, no resultado; las dos cosas se complementan.
- **Ejemplo:** `verifyNever(() => repo.marcar(any()))`.
- **Error típico:** usar `verify` cuando basta con comprobar el estado final.

**captura de argumentos**
- **Definición técnica:** `captureAny()` dentro de `verify` guarda los argumentos con que se llamó, en `.captured`.
- **En palabras sencillas:** guardar lo que se le pasó al doble.
- **Dónde se rompe la comparación:** para argumentos con nombre se usa `captureAny(named: 'x')`.
- **Ejemplo:** `verify(() => repo.marcar(captureAny())).captured.single`.
- **Error típico:** usar `any()` sin registrar un valor de respaldo para tipos propios (`registerFallbackValue`).

**`setUp`**
- **Definición técnica:** función que se ejecuta antes de cada prueba de su grupo para crear un estado limpio; `tearDown` se ejecuta después.
- **En palabras sencillas:** preparar la mesa antes de cada comida.
- **Dónde se rompe la comparación:** `setUpAll` se ejecuta una sola vez; compartir mocks entre pruebas mezcla las llamadas.
- **Ejemplo:** un mock y un controlador nuevos por prueba.
- **Error típico:** crear el mock una vez para todo el archivo: `verify(...).called(1)` cuenta las llamadas de todas las pruebas.

#### ► CÓMO FUNCIONA

##### 1. La idea en lenguaje sencillo
En el rodaje de una película, la escena peligrosa no la hace el actor: la hace un doble. El doble sigue un guion
exacto y, además, el director revisa la grabación para comprobar qué hizo y en qué orden.

Un mock es ese doble con cámara. Reemplaza al repositorio real del controlador de la ruta. Le das un guion («si te
piden las pendientes, devuelve `EN-4471`») y, al final, le preguntas qué le pidieron, cuántas veces y con qué
argumento.

El falso del Tema 2 ya reemplazaba al repositorio, pero solo respondía. Para saber si `cargar` nunca intentó marcar,
tendrías que añadirle contadores y listas a mano. Con un mock, esas preguntas vienen incluidas.

##### 2. Definición formal y vocabulario
Un **doble de prueba** es cualquier objeto que reemplaza una dependencia real durante una prueba. La terminología
clásica distingue varios. El falso tiene una implementación simple que funciona. El ***stub*** devuelve respuestas
programadas. El **mock** además registra las llamadas para comprobarlas.

En `mocktail`, un mock es una clase que extiende `Mock` e implementa la interfaz. El guion se escribe con
`when(...).thenAnswer`, `thenReturn` o `thenThrow`. Cada uno de esos guiones es un *stub*.

**`verify`** comprueba que una llamada ocurrió; `.called(n)` exige un número exacto. `verifyNever` exige que no
ocurriera y `verifyInOrder`, un orden. La **captura de argumentos** con `captureAny()` guarda los valores recibidos en
la lista `captured`.

**`setUp`** es una función del paquete `test` que se ejecuta antes de cada prueba de su grupo. Aquí crea un mock y un
controlador nuevos, para que ninguna prueba herede llamadas de otra.

##### 3. Cómo funciona por dentro, paso a paso
Primero, ¿cómo compila una clase que no implementa ningún método?

```dart
class RepositorioMock extends Mock implements RepositorioEntregas {}
```

Dart permite que una clase concreta deje miembros de su interfaz sin implementar si hereda un `noSuchMethod` propio.
`Mock` lo tiene. El compilador genera entonces métodos que reenvían cada llamada a `noSuchMethod`, con un objeto
`Invocation` que describe el nombre y los argumentos.

Con esa pieza, sigue la cuarta prueba:

1. `setUp` crea el mock y programa `pendientes()`. `when` activa un modo de grabación y ejecuta la función anónima.
2. En ese modo, la llamada `repo.pendientes()` no responde nada real. `noSuchMethod` la guarda como la llamada que se
   va a programar.
3. `thenAnswer` asocia a esa llamada una función que crea la respuesta. El mock guarda el par llamada y respuesta.
4. La prueba añade su propio `when(() => repo.marcar(any())).thenThrow(...)`. `any()` es un comparador de argumentos:
   coincide con cualquier guía.
5. El controlador llama a `pendientes()` y luego a `marcar('EN-4471')`. En cada una, `noSuchMethod` anota la llamada y
   busca un guion que coincida.
6. Para `marcar` encuentra `thenThrow` y lanza `Exception('sin red')`. El controlador la atrapa y deshace la marca.
7. `verifyInOrder` vuelve a usar el modo de grabación. Compara las llamadas descritas con las anotadas y exige ese
   orden.

```mermaid
flowchart LR
    S["setUp: mock nuevo y when de pendientes"] --> T["prueba: when de marcar con thenThrow"]
    T --> C["controlador: cargar y marcar"]
    C --> M["RepositorioMock: noSuchMethod busca el guion y anota la llamada"]
    M --> V["verify, verifyInOrder y captured"]
    C --> E["expect sobre el estado"]
```

El diagrama separa las dos comprobaciones. `expect` mira el estado del controlador; `verify` mira la conversación con
el repositorio. La cuarta prueba usa las dos.

##### 4. Reglas, variantes y casos límite
Si dos guiones coinciden con la misma llamada, gana el último que registraste. Por eso el `thenThrow` de la segunda
prueba reemplaza el guion de `setUp` sin borrarlo.

Si una llamada no tiene guion, el mock devuelve `null`. Cuando el tipo de retorno no admite `null`, como
`Future<void>`, Dart lanza un `TypeError`. Eso explica el Checkpoint 3.1.

Para un `Future` usa `thenAnswer((_) async => ...)`. `thenReturn(Future.value(...))` está prohibido: entregaría el
mismo `Future` en cada llamada, y `mocktail` lo rechaza con el mensaje del Ejercicio verificable 3.

`any()` y `captureAny()` necesitan un valor del tipo del parámetro mientras graban. `mocktail` trae valores de
respaldo para tipos básicos, como `String`. Para tus propias clases debes llamar antes a `registerFallbackValue`.

Para parámetros con nombre, el comparador lleva ese nombre: `any(named: 'urgente')`. Si lo olvidas, la llamada grabada
no coincide con la real.

`called(1)` cuenta todas las llamadas anotadas desde que el mock existe. Un mock compartido entre pruebas suma las
llamadas de todas. Por eso el `setUp` crea uno nuevo cada vez.

Hay utilidades para casos menos comunes. `verifyNoMoreInteractions` falla si quedó alguna llamada sin verificar.
`reset` borra guiones y anotaciones de un mock.

`mocktail` no genera código. Su alternativa más conocida, `mockito`, crea las clases de mock con `build_runner` desde
que Dart incorporó la seguridad frente a nulos.

##### 5. Relación con lo que ya sabes y lo que viene
La pieza que lo hace posible es la interfaz `RepositorioEntregas` (Módulo 4, Tema 4). Como el controlador depende de
una interfaz y no de una clase concreta, aceptas cualquier implementación: la real, el falso o el mock.

Las funciones anónimas del Módulo 0, Tema 2 aparecen en cada `when` y cada `verify`. Esa función no se ejecuta para
obtener un resultado: `mocktail` la ejecuta para grabar qué llamada describes.

Compara con el Tema 2. Allí el falso hecho a mano era más legible para probar la pantalla. Aquí el mock responde mejor
a preguntas sobre la interacción. Usa el mock cuando el cómo importa; si solo importa el resultado, basta un falso.

El Tema 5 cierra el círculo. Medirá qué líneas del controlador recorrieron estas pruebas y probará el flujo con la app
real, sin dobles.

#### Problema resuelto 3.1
Prueba el controlador de la ruta con un mock: la secuencia de estados al cargar, el error al cargar, el argumento con
que se marca y el orden de las llamadas cuando marcar falla.

**Razonamiento:**
1. El mock se declara en una línea; la interfaz `RepositorioEntregas` hace todo posible.
2. `setUp` crea todo nuevo y registra los estados que avisa el controlador.
3. Cada prueba cambia solo el guion que necesita.
4. Se comprueban estado (`expect`) e interacciones (`verify`) en la misma prueba.

```dart
// test/controlador_test.dart — dobles de prueba con mocktail: decir qué responde y comprobar qué se llamó
import 'package:flutter_test/flutter_test.dart';
import 'package:m9/ruta.dart';
import 'package:mocktail/mocktail.dart';

class RepositorioMock extends Mock implements RepositorioEntregas {}

void main() {
  late RepositorioMock repo;
  late ControladorRuta controlador;
  late List<EstadoRuta> estados;

  setUp(() {                                                        // antes de cada prueba: todo nuevo
    repo = RepositorioMock();
    controlador = ControladorRuta(repo);
    estados = [];
    controlador.addListener(() => estados.add(controlador.estado));
    when(() => repo.pendientes()).thenAnswer((_) async => const [Entrega('EN-4471', 1200, 8)]);
  });

  test('cargar pasa por «cargando» y termina en «lista»', () async {
    await controlador.cargar();
    expect(estados, [EstadoRuta.cargando, EstadoRuta.lista]);
    verify(() => repo.pendientes()).called(1);
    verifyNever(() => repo.marcar(any()));
  });

  test('un error al cargar deja el estado en «error»', () async {
    when(() => repo.pendientes()).thenThrow(Exception('503'));
    await controlador.cargar();
    expect(controlador.estado, EstadoRuta.error);
  });

  test('marcar llama al repositorio con la guía', () async {
    when(() => repo.marcar(any())).thenAnswer((_) async {});
    await controlador.cargar();
    await controlador.marcar('EN-4471');
    final guia = verify(() => repo.marcar(captureAny())).captured.single;   // captura el argumento
    expect(guia, 'EN-4471');
    expect(controlador.entregas.single.entregada, isTrue);
  });

  test('si marcar falla, se deshace y hay aviso', () async {
    when(() => repo.marcar(any())).thenThrow(Exception('sin red'));
    await controlador.cargar();
    await controlador.marcar('EN-4471');
    expect(controlador.entregas.single.entregada, isFalse);
    expect(controlador.aviso, contains('EN-4471'));
    verifyInOrder([() => repo.pendientes(), () => repo.marcar('EN-4471')]);
  });
}
```

```text
$ flutter test test/controlador_test.dart
00:00 +0: loading /home/estudiante/labs/flutter/m9/test/controlador_test.dart
00:00 +0: cargar pasa por «cargando» y termina en «lista»
00:00 +1: un error al cargar deja el estado en «error»
00:00 +2: marcar llama al repositorio con la guía
00:00 +3: si marcar falla, se deshace y hay aviso
00:00 +4: All tests passed!
```

**Explicación por partes.**
- Primera prueba: la lista de estados avisados es `[cargando, lista]`, y `verifyNever` confirma que cargar no marca
  nada.
- Segunda: `thenThrow` reemplaza el guion de `setUp` solo para esta prueba.
- Tercera: `captureAny()` recupera la guía con que se llamó a `marcar`.
- Cuarta: el estado vuelve atrás y hay aviso; `verifyInOrder` comprueba que primero se cargó y después se intentó
  marcar.

> **Error común.** Verificar detalles que no importan («`notifyListeners` se llamó exactamente 3 veces»). Una mejora
> interna rompe la prueba. Verifica lo que define el comportamiento.

> **Error común.** Usar mocks para clases de datos (`Entrega`). Se crean instancias reales; los dobles son para
> dependencias con efectos (red, disco, hora).

> **Buena práctica.** Falso hecho a mano para pruebas de pantalla (más legible) y mock con `mocktail` cuando importa
> cómo se llamó a la dependencia.

> **Prevenir errores.** Todo nuevo en `setUp`: mocks compartidos entre pruebas son la causa de pruebas que pasan
> solas y fallan juntas.

#### Checkpoint 3.1
¿Qué pasa si quitas el `when(() => repo.marcar(any())).thenAnswer((_) async {})` de la tercera prueba?

Respuesta: el mock devuelve `null` para `marcar`, que debía devolver un `Future<void>`, y Dart lanza un `TypeError`
porque `null` no es de ese tipo; el controlador lo atrapa como un fallo, deshace la marca, y la prueba falla en `isTrue`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Crea el archivo
Crea `test/controlador_test.dart`.

#### Paso 2 · Ejecuta
Ejecuta `flutter test test/controlador_test.dart`.

#### Paso 3 · Cuenta llamadas
Agrega una prueba que llame dos veces a `cargar` y compruebe `verify(() => repo.pendientes()).called(2)`.

#### Paso 4 · Rompe el orden
En la cuarta prueba, invierte el orden de la lista de `verifyInOrder` y lee el fallo.

#### Paso 5 · Usa `thenReturn` con un Future
Cambia el guion de `setUp` a `when(() => repo.pendientes()).thenReturn(Future.value(const [...]))` y ejecuta.

#### Resumen
- Un **doble de prueba** reemplaza una dependencia; un **mock** anota sus llamadas y un ***stub*** define sus
  respuestas.
- **`verify`** y la **captura de argumentos** comprueban la interacción.
- **`setUp`** da un estado limpio a cada prueba.

#### Ejercicio verificable 1
Básico. ¿Qué lista de estados registra la primera prueba?

Respuesta esperada: `[EstadoRuta.cargando, EstadoRuta.lista]`.

#### Ejercicio verificable 2
Intermedio. En el Paso 4, ¿qué tipo de fallo aparece?

Respuesta esperada: `Matching call #1 not found. All calls: RepositorioMock.pendientes(),
RepositorioMock.marcar(EN-4471)`. `mocktail` muestra todas las llamadas que sí ocurrieron, en orden, para comparar.

#### Ejercicio verificable 3
Reto. En el Paso 5, ¿qué pasa?

Respuesta esperada: fallan todas las pruebas, con este mensaje de `mocktail`:

```text
Invalid argument(s): `thenReturn` should not be used to return a Future. Instead, use `thenAnswer((_) => future)`.
```

Un `Future` es un resultado de un solo uso; con `thenAnswer`, cada llamada recibe uno nuevo.

#### En el trabajo
`mocktail` es la biblioteca de mocks más usada en Flutter porque no necesita generación de código. En las revisiones
se busca el equilibrio: pocos `verify`, enfocados en lo que importa, y pruebas que sigan pasando después de
refactorizar.

</details>

### Tema 4: Pruebas golden: el diseño también se prueba · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- escribir una prueba golden que compare una pantalla con una imagen de referencia aprobada;
- actualizar la referencia cuando un cambio de diseño es intencional;
- leer el fallo de una prueba golden y las imágenes de diferencia que genera Flutter;
- evitar las causas comunes de goldens inestables (fuentes, tamaño, sombras, animaciones).

**Conceptos clave:** prueba golden, imagen de referencia, `--update-goldens`, imágenes de diferencia, golden inestable

#### El problema
Alguien cambia el estilo de la tarifa de `titleMedium` a `titleSmall` «porque se veía grande». Todas las pruebas de
los Temas 1 a 3 pasan: la tarifa sigue siendo correcta y se sigue mostrando. Pero el diseño cambió en todas las
tarjetas de la app, y nadie lo revisó. Las pruebas de comportamiento no ven el diseño; las golden, sí.

Este tema usa **la herramienta de pantallazos** (Módulo 1), que ya era una prueba golden, y **el sistema de diseño**
(Módulo 2, Tema 6).

#### Glosario del tema

**prueba golden**
- **Definición técnica:** prueba de widgets que renderiza un widget y compara la imagen, píxel a píxel, con un archivo de referencia (`matchesGoldenFile`).
- **En palabras sencillas:** comparar con una foto aprobada.
- **Dónde se rompe la comparación:** compara píxeles, no intención: un cambio bueno y uno malo fallan igual; una persona decide.
- **Ejemplo:** `pantallazo('m9-tarjeta')`.
- **Error típico:** una golden de la pantalla completa con datos que cambian (fechas, horas): falla siempre.

**imagen de referencia**
- **Definición técnica:** el archivo PNG aprobado (*golden file*) que se guarda en el repositorio junto a la prueba.
- **En palabras sencillas:** la foto oficial.
- **Dónde se rompe la comparación:** depende de las fuentes y del motor de render: generada en Linux, puede diferir en macOS.
- **Ejemplo:** `test/pantallazos/m9-tarjeta.png`.
- **Error típico:** generar las referencias en un equipo y compararlas en otro con otro sistema.

**`--update-goldens`**
- **Definición técnica:** opción de `flutter test` que, en lugar de comparar, escribe la imagen actual como nueva referencia.
- **En palabras sencillas:** «la nueva foto es la oficial».
- **Dónde se rompe la comparación:** aprueba cualquier cosa; la revisión ocurre al mirar la imagen en el pull request.
- **Ejemplo:** `flutter test --update-goldens test/golden_test.dart`.
- **Error típico:** usarlo cada vez que una golden falla, sin mirar por qué.

**imágenes de diferencia**
- **Definición técnica:** archivos que Flutter escribe en `test/failures/` cuando una golden falla: la referencia (`masterImage`), la actual (`testImage`) y las diferencias (`isolatedDiff`, `maskedDiff`).
- **En palabras sencillas:** la foto vieja, la nueva y dónde cambian.
- **Dónde se rompe la comparación:** no se versionan: se miran y se borran.
- **Ejemplo:** las tres imágenes de este tema.
- **Error típico:** subir la carpeta `failures/` al repositorio.

**golden inestable**
- **Definición técnica:** golden que falla sin cambios de diseño por diferencias de entorno: fuentes no cargadas, tamaño de pantalla distinto, animaciones a medias, sombras o datos variables.
- **En palabras sencillas:** una foto que nunca sale igual.
- **Dónde se rompe la comparación:** la solución no es subir la tolerancia, sino fijar el entorno.
- **Ejemplo:** `cargarFuentes()`, `tamanoPantalla(...)` y datos fijos.
- **Error típico:** goldens con la fuente de prueba de Flutter (cuadros grises), que no muestran el texto real.

#### ► CÓMO FUNCIONA

##### 1. La idea en lenguaje sencillo
Piensa en la prueba de color de una imprenta. Antes de imprimir mil folletos, el cliente aprueba una hoja. Desde
entonces, cada tirada se compara con esa hoja. Si un tono cambia, alguien lo nota antes de repartir.

Una prueba golden hace esa comparación con la interfaz. Construye la tarjeta de entrega, toma una imagen y la compara
con una imagen aprobada que vive en el repositorio. Si un solo píxel cambia, la prueba falla y te deja las imágenes
para que decidas.

El problema del tema lo explica bien. Cambiar `titleMedium` por `titleSmall` no altera ningún dato: la tarifa sigue
correcta y visible. Las pruebas de los Temas 1 a 3 pasan. Solo una comparación de imágenes detecta que el diseño
cambió.

##### 2. Definición formal y vocabulario
Una **prueba golden** es una prueba de widgets que compara una imagen renderizada con un archivo aprobado. En Flutter
se escribe con el *matcher* asíncrono `matchesGoldenFile`, que se usa con `expectLater`. La función `pantallazo` del
curso es solo un envoltorio de esa llamada.

La **imagen de referencia** (*golden file*) es ese PNG aprobado, aquí `test/pantallazos/m9-tarjeta.png`. La ruta es
relativa al archivo de prueba y se guarda en el control de versiones junto al código.

**`--update-goldens`** es la opción de `flutter test` que cambia el comportamiento del *matcher*: en lugar de comparar,
escribe la imagen actual como nueva referencia.

Las **imágenes de diferencia** son los cuatro PNG que Flutter escribe en `test/failures/` cuando la comparación falla.
Una **golden inestable** es la que falla sin cambio de diseño, por algo del entorno que no fijaste.

##### 3. Cómo funciona por dentro, paso a paso
Sigue una ejecución normal, sin `--update-goldens`:

1. `setUpAll(cargarFuentes)` carga Roboto y la fuente de íconos de Material desde la caché de Flutter. Sin ese paso,
   el texto se dibujaría con la fuente de prueba.
2. `tamanoPantalla` fija la vista en 360 × 200 puntos lógicos con densidad 2. También enciende las sombras, que en las
   pruebas vienen apagadas.
3. `pumpWidget` construye el `MaterialApp` con las dos tarjetas y produce un cuadro completo: construcción,
   maquetación y pintura.
4. `matchesGoldenFile` busca el objeto de render que corresponde al *finder* y sube hasta el primer límite de
   repintado. Es la misma idea de capa del Módulo 8, Tema 5.
5. Pide a esa capa una imagen en píxeles físicos: 720 × 400, es decir, 288.000 píxeles.
6. Entrega la imagen al comparador global, `goldenFileComparator`. El de serie lee el PNG de referencia y compara los
   píxeles uno a uno.
7. Si todos coinciden, el *matcher* se cumple. Si no, falla con el porcentaje y escribe las imágenes de diferencia.

```dart
await expectLater(find.byType(MaterialApp).first, matchesGoldenFile('pantallazos/$nombre.png'));
```

Esta línea es el corazón de `pantallazo`. Usa `expectLater` porque capturar la imagen es asíncrono: hay que esperar a
que termine antes de seguir.

Con `--update-goldens`, los pasos 1 a 5 son iguales. En el paso 6, el comparador escribe la imagen como referencia y
la prueba pasa sin comparar.

La cifra del fallo se comprueba a mano. 3315 píxeles distintos sobre 288.000 dan el 1,15 % que muestra la salida
real. Solo cambiaron los dos importes.

```mermaid
flowchart TD
    A["flutter test --update-goldens"] --> R["test/pantallazos/m9-tarjeta.png, la referencia"]
    B["flutter test"] --> P["captura de la capa: 720 x 400 px"]
    P --> C{"¿la imagen actual es igual?"}
    R --> C
    C -->|sí| OK["la prueba pasa"]
    C -->|no| F["falla: % y px distintos"]
    F --> D["test/failures/: master, test, isolatedDiff, maskedDiff"]
    D --> H{"¿el cambio es intencional?"}
    H -->|sí| A
    H -->|no| X["corregir el código"]
```

El diagrama muestra el ciclo de revisión. La herramienta detecta; una persona decide si el cambio era intencional.

##### 4. Reglas, variantes y casos límite
El comparador de serie no tiene tolerancia: un píxel distinto basta para fallar. Si necesitas margen, puedes escribir
tu propio comparador y asignarlo a `goldenFileComparator`. Hazlo solo después de fijar el entorno, no para esconder
diferencias.

Las referencias dependen del sistema. El suavizado de bordes y el dibujo de las letras cambian entre Linux, macOS y
Windows. Genera y compara siempre en el mismo entorno, como el contenedor de Linux del CI.

Sin fuentes cargadas, Flutter usa su fuente de prueba, que dibuja cada letra como un rectángulo. La golden seguiría
detectando cambios de tamaño, pero no serviría para revisar la tipografía, como verás en el Paso 5.

Las sombras vienen apagadas en las pruebas mediante `debugDisableShadows`. Por eso `tamanoPantalla` las enciende y
las vuelve a apagar al terminar con `addTearDown`.

Captura siempre un estado quieto. Si una animación está a medias, la imagen depende del instante. Avanza con `pump` o
`pumpAndSettle` hasta el estado final antes de comparar.

Evita datos que cambian solos, como fechas, horas o números aleatorios. Esa es la causa más común de una golden
inestable. Fija los datos de entrada, como hace la prueba con `EN-4471` y `EN-4472`.

Si el widget no cabe en la vista, Flutter avisa del desbordamiento y la prueba falla antes de comparar. Le pasó a la
primera versión de este tema: con 170 de alto, `A RenderFlex overflowed by 6.0 pixels on the bottom`.

Para configurar todo un directorio, Flutter lee `flutter_test_config.dart` si existe en `test/`. Ahí puedes cargar
fuentes o instalar un comparador una sola vez.

##### 5. Relación con lo que ya sabes y lo que viene
Desde el Módulo 1 usas `pantallazo` para obtener las figuras del curso. Sin saberlo, escribías pruebas golden: este
tema explica qué hacía esa herramienta por dentro.

El sistema de diseño del Módulo 2, Tema 6 define los estilos de texto y los roles de color. Una golden por componente
lo protege: cualquier cambio en un token aparece como diferencia de píxeles.

Compara con el Tema 2. Allí `find.text(r'$ 6.000')` confirmaba que la tarifa estaba. Aquí confirmas cómo se ve. Las
dos pruebas se complementan: una vigila el contenido y la otra la forma.

El Módulo 10 cambia temas, modo oscuro y contraste; las goldens en ambos modos te avisarán de cada efecto visual. El
Tema 5 de este módulo deja los píxeles y prueba el flujo en la app compilada.

#### Problema resuelto 4.1
Protege con una golden el diseño de la tarjeta de entrega en sus dos estados. Después, cambia el estilo de la tarifa y
lee el fallo y las imágenes de diferencia.

**Razonamiento:**
1. La prueba usa la herramienta de pantallazos: fuentes reales, tamaño fijo y sombras encendidas.
2. Una sola imagen con las dos tarjetas (pendiente y entregada) cubre los dos estados.
3. El cambio de `titleMedium` a `titleSmall` se hizo en el laboratorio solo para provocar el fallo y después se
   revirtió.
4. **La primera versión usaba una pantalla de 360 × 170**: las dos tarjetas no cabían y la prueba falló con `A
   RenderFlex overflowed by 6.0 pixels on the bottom`. Con 200 de alto, cabe.

```dart
// test/golden_test.dart — prueba golden: la tarjeta debe verse igual que la imagen de referencia aprobada
import 'package:flutter_test/flutter_test.dart';
import 'package:m9/pantalla_ruta.dart';
import 'package:m9/ruta.dart';
import 'package:material_ui/material_ui.dart';

import 'pantallazo.dart';

void main() {
  setUpAll(cargarFuentes);                                          // fuentes reales: sin ellas, cuadros grises

  testWidgets('tarjeta de entrega pendiente y entregada', (tester) async {
    tamanoPantalla(tester, tamano: const Size(360, 200));
    await tester.pumpWidget(MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorSchemeSeed: Colors.indigo),
      home: const Scaffold(
        body: Padding(
          padding: EdgeInsets.all(8),
          child: Column(children: [
            TarjetaEntrega(Entrega('EN-4471', 1200, 8)),
            TarjetaEntrega(Entrega('EN-4472', 350, 25, entregada: true)),
          ]),
        ),
      ),
    ));
    await pantallazo('m9-tarjeta');                                 // compara con test/pantallazos/m9-tarjeta.png
  });
}
```

```text
$ flutter test test/golden_test.dart
00:00 +0: loading /home/estudiante/labs/flutter/m9/test/golden_test.dart
00:00 +0: (setUpAll)
00:00 +0: tarjeta de entrega pendiente y entregada
00:00 +1: (tearDownAll)
00:00 +1: All tests passed!
```

Con el estilo de la tarifa cambiado a `titleSmall`:

```text
$ flutter test test/golden_test.dart
00:00 +0: loading /home/estudiante/labs/flutter/m9/test/golden_test.dart
00:00 +0: (setUpAll)
00:00 +0: tarjeta de entrega pendiente y entregada
══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞════════════════════════════════════════════════════
The following assertion was thrown while running async test code:
Golden "pantallazos/m9-tarjeta.png": Pixel test failed, 1.15%, 3315px diff detected.
Failure feedback can be found at /home/estudiante/labs/flutter/m9/test/failures
...
00:00 +0 -1: tarjeta de entrega pendiente y entregada [E]
00:00 +0 -1: Some tests failed.
```

![Las imágenes de la prueba golden fallida: a la izquierda, la referencia con las tarifas grandes; en el centro, la imagen actual con las tarifas más pequeñas; a la derecha, la diferencia aislada, en blanco salvo los dos importes, que es lo único que cambió](content/figures/flutter/m9-t4-diferencia.png)

**Explicación por partes.**
- `Pixel test failed, 1.15%, 3315px diff detected`: cambió poco más del 1 % de la imagen, y la prueba lo detectó.
- La diferencia aislada (derecha) muestra exactamente qué cambió: solo los dos importes. Es lo que se mira en una
  revisión.
- Si el cambio era intencional, se ejecuta `--update-goldens`, se revisa la imagen nueva y se sube junto con el
  código; si no, se corrige el estilo.
- Las pruebas de los Temas 1 a 3 siguieron pasando con el cambio: solo la golden lo vio.

> **Error común.** Aceptar con `--update-goldens` sin abrir `failures/`. La prueba existe para que una persona mire la
> diferencia.

> **Error común.** Goldens de pantallas completas para todo. Una golden por componente (tarjeta, botón, estado vacío)
> es más estable y su diferencia se entiende mejor.

> **Buena práctica.** Genera y compara las goldens siempre en el mismo entorno (el contenedor del CI, por ejemplo), con
> las fuentes reales cargadas.

> **Prevenir errores.** Agrega `test/failures/` al `.gitignore` y haz que el CI suba esa carpeta como artefacto cuando
> una golden falla: así el revisor ve las imágenes sin descargar nada.

#### Checkpoint 4.1
¿Por qué la diferencia aislada no muestra nada en las guías ni en los íconos?

Respuesta: porque no cambiaron. El cambio afectó solo al estilo de la tarifa; el resto de los píxeles es idéntico a
la referencia.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Crea la prueba
Crea `test/golden_test.dart` y genera la referencia con `--update-goldens`.

#### Paso 2 · Provoca el fallo
Cambia el estilo de la tarifa a `titleSmall`, ejecuta sin `--update-goldens` y abre las cuatro imágenes de
`test/failures/`.

#### Paso 3 · Revierte
Vuelve a `titleMedium`, ejecuta y borra `test/failures/`.

#### Paso 4 · Agrega el modo oscuro
Agrega una segunda golden con `ThemeData(brightness: Brightness.dark, ...)`.

#### Paso 5 · Quita las fuentes
Quita `setUpAll(cargarFuentes)`, genera la referencia y mírala. ¿Sirve para revisar el diseño?

#### Resumen
- Una **prueba golden** compara contra una **imagen de referencia**.
- **`--update-goldens`** aprueba el cambio; las **imágenes de diferencia** ayudan a decidir.
- Una **golden inestable** se corrige fijando el entorno, no subiendo la tolerancia.

#### Ejercicio verificable 1
Básico. ¿Qué porcentaje de la imagen cambió con `titleSmall`?

Respuesta esperada: 1,15 % (3315 píxeles).

#### Ejercicio verificable 2
Intermedio. ¿Cuáles son las cuatro imágenes de `test/failures/`?

Respuesta esperada: `m9-tarjeta_masterImage.png` (referencia), `m9-tarjeta_testImage.png` (actual),
`m9-tarjeta_isolatedDiff.png` (solo diferencias) y `m9-tarjeta_maskedDiff.png` (la referencia con las diferencias
marcadas).

#### Ejercicio verificable 3
Reto. En el Paso 5, ¿qué se ve en la imagen?

Respuesta esperada: el texto aparece como rectángulos (la fuente de prueba de Flutter dibuja así cada letra) y los
íconos tampoco se ven como deben: la golden detectaría cambios de tamaño, pero no sirve para revisar la tipografía.

#### En el trabajo
Las goldens son la red de seguridad de los sistemas de diseño: los equipos con bibliotecas de componentes tienen una
golden por componente y por tema. En los pull requests, las imágenes de diferencia se revisan como cualquier otro
cambio.

</details>

### Tema 5: Integración y cobertura: la app completa y lo que falta probar · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- escribir una prueba de integración que abra la app con su `main` y recorra un flujo;
- ejecutarla en la app compilada para Linux;
- medir la cobertura de las pruebas con `flutter test --coverage`;
- leer el informe y decidir qué falta probar.

**Conceptos clave:** prueba de integración de flujo, pirámide de pruebas, cobertura, `lcov.info`, línea sin cubrir

#### El problema
Las pruebas de los Temas 1 a 4 prueban piezas: una regla, una pantalla con un falso, un controlador con un mock, una
tarjeta. ¿Funciona la app completa, con su `main`, su repositorio y la plataforma real? ¿Y qué parte del código no
recorre ninguna prueba?

Este tema usa **las pruebas de integración en Linux** (Módulo 7, Tema 1) y **todas las pruebas del módulo**.

#### Glosario del tema

**prueba de integración de flujo**
- **Definición técnica:** prueba que arranca la app real (`app.main()`) en un dispositivo o en el escritorio y recorre un flujo de usuario de principio a fin.
- **En palabras sencillas:** usar la app como un usuario, pero automático.
- **Dónde se rompe la comparación:** usa la configuración real (aquí, el repositorio de demostración); para la red real se necesita un servidor de pruebas.
- **Ejemplo:** abrir la ruta y marcar `EN-4471`.
- **Error típico:** querer cubrir cada caso con integración: lento y frágil.

**pirámide de pruebas**
- **Definición técnica:** proporción recomendada: muchas pruebas unitarias, bastantes de widgets y pocas de integración.
- **En palabras sencillas:** la base ancha es rápida y barata; la punta, lenta y cara.
- **Dónde se rompe la comparación:** en Flutter, las pruebas de widgets son tan rápidas que ocupan la mayor parte de la pirámide.
- **Ejemplo:** 8 unitarias, 3 de widgets, 4 de controlador, 1 golden y 1 de integración.
- **Error típico:** solo pruebas de integración («prueban todo»): tardan minutos y fallan por cosas ajenas.

**cobertura**
- **Definición técnica:** proporción de líneas del código que se ejecutaron durante las pruebas.
- **En palabras sencillas:** qué parte del código pisaron las pruebas.
- **Dónde se rompe la comparación:** una línea ejecutada no es una línea comprobada: una prueba sin `expect` también «cubre».
- **Ejemplo:** 98,6 % en este módulo.
- **Error típico:** exigir 100 % y escribir pruebas sin valor para llegar.

**`lcov.info`**
- **Definición técnica:** archivo de texto en formato LCOV que `flutter test --coverage` escribe en `coverage/`, con las líneas ejecutadas de cada archivo.
- **En palabras sencillas:** la planilla de qué líneas se visitaron.
- **Dónde se rompe la comparación:** solo incluye archivos que alguna prueba importó; un archivo nunca importado no aparece (aquí, `main.dart`).
- **Ejemplo:** `SF:lib/tarifas.dart`, `LF:13`, `LH:13`.
- **Error típico:** leer el porcentaje sin notar los archivos que faltan.

**línea sin cubrir**
- **Definición técnica:** línea con contador 0 en el informe: ninguna prueba la ejecutó.
- **En palabras sencillas:** una puerta que nadie abrió.
- **Dónde se rompe la comparación:** algunas no valen la pena (registros de depuración); otras esconden caminos importantes.
- **Ejemplo:** la línea 66 de `pantalla_ruta.dart`: el botón «Reintentar» del estado de error.
- **Error típico:** ignorar las líneas sin cubrir de los caminos de error.

#### ► CÓMO FUNCIONA

##### 1. La idea en lenguaje sencillo
Un fabricante de bicicletas revisa cada pieza en el banco: frenos, cadena, ruedas. Aun así, antes de vender, alguien
monta la bicicleta armada y da una vuelta. Las piezas pueden estar bien y fallar juntas: un cable corto, un tornillo
mal apretado.

La prueba de integración es esa vuelta. Abre la app con su `main` real, con su repositorio y en la plataforma de
verdad, y recorre un flujo: ver la ruta y marcar `EN-4471`. Comprueba que las piezas de los Temas 1 a 4 funcionan
montadas.

La cobertura responde otra pregunta: ¿qué partes del código no pisó ninguna prueba? Es como marcar en un plano las
calles que recorrió el repartidor. Las que quedan sin marcar te dicen dónde mirar.

##### 2. Definición formal y vocabulario
Una **prueba de integración de flujo** se escribe con `testWidgets`, como una prueba de widgets, pero vive en
`integration_test/` y usa `IntegrationTestWidgetsFlutterBinding`. Corre dentro de la app compilada, en un dispositivo
o en el escritorio.

La **pirámide de pruebas** es un modelo de proporciones. La base son muchas pruebas unitarias, rápidas y baratas. En
medio van las de widgets. En la punta, pocas de integración, lentas y más frágiles.

La **cobertura** es la proporción de líneas ejecutables que alguna prueba ejecutó. `flutter test --coverage` la
registra en **`lcov.info`**, un archivo de texto en formato LCOV, un estándar que leen muchas herramientas.

Una **línea sin cubrir** es una línea con contador 0. En el informe de este tema hay una sola: la 66 de
`pantalla_ruta.dart`, el botón «Reintentar».

##### 3. Cómo funciona por dentro, paso a paso
Primero, la prueba de integración. Al ejecutar `flutter test integration_test/flujo_test.dart -d linux` ocurre esto:

1. La herramienta compila la app para Linux, con la prueba como punto de entrada en lugar de `lib/main.dart`.
2. Arranca el ejecutable, aquí dentro de la pantalla virtual de `xvfb-run`.
3. `IntegrationTestWidgetsFlutterBinding.ensureInitialized()` instala un *binding* que deja correr la app de verdad y
   devuelve los resultados a la herramienta.
4. `app.main()` llama a `runApp` con el `RepositorioDemo`, exactamente como al abrir la app.
5. `pumpAndSettle` espera cuadros reales hasta que no queda nada pendiente. Aquí el reloj no es falso.
6. `tap` y `expect` funcionan igual que en el Tema 2. Al terminar, la herramienta recibe el resultado y cierra la app.

Ahora la cobertura. Al ejecutar `flutter test --coverage`:

1. Cada archivo de `test/` corre como siempre, pero con la recolección de cobertura activada en la máquina virtual de
   Dart.
2. La máquina virtual cuenta cuántas veces se ejecuta cada línea de las bibliotecas cargadas.
3. Al terminar cada archivo, la herramienta pide esos contadores y los acumula.
4. Finalmente escribe `coverage/lcov.info`, con un bloque por archivo de tu paquete.

```text
$ tail -8 coverage/lcov.info
DA:66,0
DA:68,2
DA:70,1
DA:71,3
DA:72,6
LF:40
LH:39
end_of_record
```

Este es el final del bloque de `lib/pantalla_ruta.dart`, que empieza con una línea `SF:` con el nombre del archivo.
Cada `DA` da un número de línea y su contador. `LF` cuenta las líneas ejecutables y `LH`, las ejecutadas. `DA:66,0` es
la línea sin cubrir.

```mermaid
flowchart LR
    subgraph P["Pirámide de este módulo"]
        U["8 unitarias"] --- W["3 de widgets, 4 de controlador y 1 golden"] --- I["1 de integración"]
    end
    T["flutter test --coverage"] --> L["coverage/lcov.info"]
    L --> R["resumen: líneas cubiertas por archivo"]
    R --> X["línea 66 sin cubrir: falta una prueba"]
```

El diagrama junta las dos ideas. La pirámide dice cuántas pruebas de cada tipo tienes; la cobertura dice qué dejaron
sin tocar entre todas.

##### 4. Reglas, variantes y casos límite
El informe solo incluye archivos que alguna prueba cargó. `main.dart` no aparece porque nada en `test/` lo importa. Un
archivo ausente no figura como 0 %: no figura. Revisa la lista de archivos antes de leer el total.

Una línea cubierta no es una línea comprobada. Una prueba sin `expect` puede recorrer todo `ruta.dart` y dar 100 %. La
cobertura señala lo que falta; no certifica lo que hay.

La cobertura de este informe es de líneas. Una línea con un `if` cuenta como cubierta aunque solo se haya probado una
de sus ramas. Por eso los casos límite del Tema 1 importan más que el porcentaje.

Las pruebas de integración usan reloj real. `pumpAndSettle` espera cuadros de verdad y un indicador que gira sin fin
lo bloquea hasta su tiempo límite. También son más lentas: compilar y arrancar la app cuesta segundos.

En Android e iOS, la misma prueba corre en un dispositivo o en un emulador con `-d <dispositivo>`. En la nube,
servicios como Firebase Test Lab ejecutan el mismo código en muchos modelos de teléfono.

El archivo LCOV se convierte en un informe HTML con `genhtml`, de la herramienta `lcov`. Los servicios de cobertura de
un CI leen el mismo archivo para comentar cada pull request.

##### 5. Relación con lo que ya sabes y lo que viene
Las pruebas de integración en Linux del Módulo 7, Tema 1 son la base técnica. En el Módulo 8, Tema 3 usaste el mismo
*binding* con `traceAction` para medir cuadros. Aquí lo usas para comprobar un flujo.

Este tema reúne todo el módulo. Las 16 pruebas de `test/` son las de los Temas 1 a 4: 8 unitarias, 3 de pantalla, 4
de controlador y 1 golden. La línea 66 sin cubrir corresponde al Paso 4 del Tema 2, que nadie había escrito.

Compara con el Tema 2. Allí un falso controlaba los datos y el reloj; aquí no controlas nada, y eso es lo que pruebas.
Usa la integración para pocos flujos críticos y deja el detalle a los niveles inferiores.

El Módulo 11 automatiza esta secuencia. El CI ejecuta análisis, pruebas con cobertura, goldens e integración en cada
cambio antes de firmar y publicar la app.

#### Problema resuelto 5.1
Prueba el flujo «abrir la ruta y marcar una entrega» en la app compilada. Mide la cobertura de todas las pruebas y
encuentra qué línea no recorre ninguna.

**Razonamiento:**
1. La prueba de integración importa `main.dart` y llama a `app.main()`.
2. Se ejecuta con `xvfb-run` en la app de Linux, como en el Módulo 7.
3. `flutter test --coverage` corre las 16 pruebas de `test/` (sin la de integración).
4. El resumen se hace con un programa de consola en Dart, `bin/cobertura.dart`, para no depender de herramientas
   extra.

```dart
// integration_test/flujo_test.dart — la app completa, compilada para Linux, con su main y su repositorio
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:m9/main.dart' as app;
import 'package:material_ui/material_ui.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('el conductor abre la ruta y marca una entrega', (tester) async {
    app.main();                                                     // la app real, como al abrirla
    await tester.pumpAndSettle();
    expect(find.text('Ruta de hoy'), findsOneWidget);
    expect(find.text('EN-4471'), findsOneWidget);

    await tester.tap(find.text('EN-4471'));
    await tester.pumpAndSettle();
    expect(find.byIcon(Icons.check_circle), findsOneWidget);
    debugPrint('flujo completo: ${find.byType(Card).evaluate().length} tarjetas, 1 marcada');
  });
}
```

```text
$ xvfb-run -a flutter test integration_test/flujo_test.dart -d linux
...
00:00 +0: el conductor abre la ruta y marca una entrega
flujo completo: 2 tarjetas, 1 marcada
00:02 +1: (tearDownAll)
00:02 +1: All tests passed!
```

```dart
// bin/cobertura.dart — resume coverage/lcov.info: líneas cubiertas por archivo (sin herramientas extra)
// ignore_for_file: avoid_print — es un programa de consola: imprimir es su salida
import 'dart:io';

void main(List<String> args) {
  final resumen = <(String, int, int)>[];
  var (archivo, lf, lh) = ('', 0, 0);
  for (final linea in File(args.isEmpty ? 'coverage/lcov.info' : args.first).readAsLinesSync()) {
    if (linea.startsWith('SF:')) archivo = linea.substring(3);
    if (linea.startsWith('LF:')) lf = int.parse(linea.substring(3));
    if (linea.startsWith('LH:')) lh = int.parse(linea.substring(3));
    if (linea == 'end_of_record') resumen.add((archivo, lh, lf));
  }
  String fila(String nombre, int h, int f) =>
      '${nombre.padRight(28)} ${'$h'.padLeft(3)}/${'$f'.padRight(3)} ${(100 * h / f).toStringAsFixed(1).padLeft(5)} %';
  resumen.sort((a, b) => a.$1.compareTo(b.$1));
  for (final (a, h, f) in resumen) {
    print(fila(a, h, f));
  }
  final cubiertas = resumen.fold(0, (s, r) => s + r.$2);
  final total = resumen.fold(0, (s, r) => s + r.$3);
  print(fila('total', cubiertas, total));
}
```

```text
$ flutter test --coverage
...
00:07 +16: All tests passed!
$ dart run bin/cobertura.dart
lib/pantalla_ruta.dart        39/40   97.5 %
lib/ruta.dart                 19/19  100.0 %
lib/tarifas.dart              13/13  100.0 %
total                         71/72   98.6 %
```

**Explicación por partes.**
- La prueba de integración usó el `main` real, con el repositorio de demostración, en la app compilada.
- La cobertura es alta (98,6 %), pero el informe muestra la única línea que ninguna prueba ejecutó: la 66 de
  `pantalla_ruta.dart`, el botón «Reintentar» del estado de error. Es exactamente el Paso 4 del Tema 2.
- `main.dart` no aparece en el informe: ninguna prueba de `test/` lo importa. La prueba de integración lo recorre,
  pero no se incluye en este informe.
- 16 pruebas en 7 segundos: la base de la pirámide es rápida.
- `bin/cobertura.dart` lee `lcov.info` línea a línea. `SF:` abre un archivo, `LF:` y `LH:` dan sus líneas
  ejecutables y ejecutadas, y `end_of_record` cierra el bloque y lo guarda como record `(archivo, cubiertas, total)`.
  Después ordena por nombre, imprime cada fila con `fila` y suma los totales con `fold`.

> **Error común.** Celebrar el porcentaje. Un 98,6 % con el camino de error sin probar es peor que un 90 % con todos los
> errores cubiertos.

> **Error común.** Pruebas de integración que dependen de un servidor compartido. Fallan cuando otro equipo cambia
> datos. Usa un servidor de pruebas propio o un repositorio de demostración.

> **Buena práctica.** Revisa en cada pull request las líneas nuevas sin cubrir, no el total: ahí está lo que se olvidó
> probar.

> **Prevenir errores.** Ejecuta en el CI, en este orden: análisis, pruebas unitarias y de widgets con cobertura,
> goldens y, por último, integración. El orden falla rápido con lo barato.

#### Checkpoint 5.1
Si agregas la prueba del Paso 4 del Tema 2 («Reintentar»), ¿cuánto queda la cobertura de `pantalla_ruta.dart`?

Respuesta: 40/40, 100 %: la línea 66 era la única sin cubrir.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Crea la prueba de integración
Crea `integration_test/flujo_test.dart` y ejecútala con `xvfb-run -a flutter test ... -d linux`.

#### Paso 2 · Mide la cobertura
Ejecuta `flutter test --coverage` y `dart run bin/cobertura.dart`.

#### Paso 3 · Cubre la línea 66
Agrega la prueba del Paso 4 del Tema 2 y vuelve a medir.

#### Paso 4 · Cobertura de la integración
Ejecuta la prueba de integración con `--coverage` y compara el informe.

#### Paso 5 · Arma el CI
Escribe un `ci.sh` que ejecute `flutter analyze`, `flutter test --coverage`, las goldens y la integración, y se
detenga en el primero que falle.

#### Resumen
- Una **prueba de integración de flujo** usa la app real; va en la punta de la **pirámide de pruebas**.
- La **cobertura** (en `lcov.info`) muestra qué no se ejecutó; la **línea sin cubrir** importa más que el total.

#### Ejercicio verificable 1
Básico. ¿Cuántas pruebas ejecuta `flutter test --coverage`?

Respuesta esperada: 16 (`+16: All tests passed!`): 8 unitarias, 3 de pantalla, 4 de controlador y 1 golden.

#### Ejercicio verificable 2
Intermedio. Con el Paso 3, ¿cuál es el total?

Respuesta esperada: 72/72, 100 %, con `pantalla_ruta.dart` en 40/40.

#### Ejercicio verificable 3
Reto. ¿Por qué `main.dart` no aparece en el informe del Paso 2?

Respuesta esperada: porque ninguna prueba de `test/` lo importa, y `flutter test --coverage` solo informa los archivos
que se cargaron. Un archivo que ninguna prueba toca no aparece como 0 %, simplemente no aparece.

#### En el trabajo
Los equipos publican la cobertura en cada pull request (con Codecov o similares) y miran las líneas nuevas sin
cubrir. Las pruebas de integración se ejecutan en dispositivos reales o en granjas de dispositivos (Firebase Test Lab)
antes de cada versión.

</details>

### Proyecto 26: la red de pruebas de la ruta

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

Vas a proteger la ruta del día con una estrategia de pruebas completa: reglas de negocio, pantallas, interacción con
dependencias, diseño y flujo real, con un CI que falle en el primer problema.

**Qué debe cumplir:**
- Toda regla de negocio (tarifa, formato de pesos, validaciones) tiene pruebas unitarias con casos límite (Tema 1).
- Cada pantalla tiene pruebas de widgets de su estado con datos, su acción principal y su camino de error (Tema 2).
- Los controladores se prueban con mocks y verifican solo las interacciones que importan (Tema 3).
- Los componentes del sistema de diseño tienen goldens en modo claro y oscuro (Tema 4).
- Un flujo de usuario completo se prueba en la app compilada, y la cobertura no tiene líneas sin cubrir en los caminos
  de error (Tema 5).

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

**Pruebas que debes ejecutar y su evidencia esperada:**

| Prueba | Cómo | Evidencia esperada |
|---|---|---|
| Unitarias | `flutter test test/tarifas_test.dart` | todos los límites de cada regla |
| Widgets | pantalla con falso que tarda y falla | marca optimista visible y después deshecha |
| Controlador | `mocktail` con `verifyInOrder` | estados y llamadas esperadas |
| Golden | cambio de estilo provocado | fallo con porcentaje e imágenes en `failures/` |
| Integración | `xvfb-run ... -d linux` | el flujo completo pasa |
| Cobertura | `flutter test --coverage` | 100 % en los caminos de error |

**Entregables:** el proyecto; `ci.sh`; el informe de cobertura; las imágenes de una diferencia golden; y
`pruebas.md` con la pirámide del proyecto (cuántas pruebas de cada tipo y por qué).

</details>
