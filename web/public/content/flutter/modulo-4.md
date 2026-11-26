# Módulo 4: Gestión de estado: de setState a Riverpod, con pantallas que muestran cada estado

**Entorno comprobado para esta edición (2026-11-24):** Flutter 3.50.1 (canal estable) con Dart 3.14.0 en Linux
x86_64, con `material_ui` 1.11.1, `flutter_riverpod` 3.5.0 y `flutter_bloc` 9.1.1. Todo el código se analizó con
`flutter analyze` (`No issues found!`) y se ejecutó con `flutter test` ese día, en
`/home/estudiante/labs/flutter/m4` (tu `~/labs/flutter/m4`). **Los pantallazos los dibujó Flutter** con la
herramienta del Módulo 1; cuando una figura muestra varios estados, son pantallazos separados puestos uno al lado del
otro. Las salidas de texto son literales; los tiempos (`00:01`) cambian en tu equipo.

El estado es todo lo que la pantalla necesita recordar: qué entregas están hechas, qué filtro eligió el conductor, si
la ruta está cargando o falló, qué escribió en el formulario. Mientras vive en un solo widget, `setState` basta. Cuando
lo necesitan varias pantallas, cuando viene de un servidor o cuando hay que probarlo sin abrir la app, hace falta
sacarlo del árbol de widgets y decidir quién se entera de cada cambio. Este módulo recorre ese camino con la misma
lista de entregas, midiendo en cada paso cuántas filas se reconstruyen y mostrando cómo se ve cada estado.

**Al terminar este módulo podrás:**
- subir el estado al ancestro común y reconocer cuándo `setState` deja de alcanzar;
- sacar la lógica a un `ChangeNotifier` y probarla sin pantalla;
- usar Riverpod (`Notifier`, `Provider` derivado, `select`) para que cada widget escuche solo lo que necesita;
- cargar datos con `AsyncNotifier` y diseñar los estados de carga, vacío, error y datos;
- construir un formulario con validación por campo y un envío con estado;
- reemplazar dependencias en las pruebas y comparar Riverpod con Cubit.

**Esquema del módulo:** Tema 1 (`setState` y sus límites) → Tema 2 (`ChangeNotifier`) → Tema 3 (Riverpod) → Tema 4
(datos asíncronos y sus estados) → Tema 5 (formularios) → Tema 6 (pruebas, inyección y Cubit) → Proyecto 21.

**Qué necesitas saber antes:** el Módulo 3 completo, en especial **`ChangeNotifier`** y **`refreshListenable`**
(Tema 4) y **`mounted`** después de `await` (Tema 1); del Módulo 1, **`StatefulWidget`**, **keys** y **los tres
árboles** (Temas 4 a 6); del Módulo 0, **`sealed`**, **patrones** y **`switch` de expresión** (Tema 6).

**Qué no se repite:** el diseño de listas, filas y pantallas de mensaje sigue el sistema del Módulo 2, Tema 6; aquí no
se vuelve a explicar. Las llamadas reales al servidor son del Módulo 5: en este módulo, el «servidor» es una espera
simulada detrás de una interfaz.

**Prepara el proyecto:**

```text
$ cd ~/labs/flutter
$ flutter create --org com.academia --platforms=web,linux --empty m4
$ cd m4
$ flutter pub add flutter_riverpod flutter_bloc
```

Copia `test/pantallazo.dart` del Módulo 1. Todos los temas comparten el modelo:

```dart
// lib/modelo.dart — el modelo compartido por los temas: una entrega con su estado
enum Estado { pendiente, entregada, novedad }

class Entrega {
  const Entrega(this.guia, this.direccion, {this.estado = Estado.pendiente});
  final String guia;
  final String direccion;
  final Estado estado;

  Entrega con(Estado nuevo) => Entrega(guia, direccion, estado: nuevo);   // inmutable: se crea otra
}

const rutaInicial = [
  Entrega('EN-4471', 'Calle 80 # 68-45'),
  Entrega('EN-4472', 'Carrera 15 # 93-20'),
  Entrega('EN-4475', 'Avenida 68 # 22-10'),
  Entrega('EN-4478', 'Calle 26 # 59-41'),
  Entrega('EN-4480', 'Carrera 7 # 72-13'),
];

/// Cuenta cuántas veces se construye cada fila, para comparar las técnicas.
final construcciones = <String, int>{};
void anotarConstruccion(String guia) => construcciones[guia] = (construcciones[guia] ?? 0) + 1;
int totalConstrucciones() => construcciones.values.fold(0, (a, b) => a + b);
```

`Entrega` es inmutable: para cambiar el estado se crea otra con `con(...)`. Las funciones de `construcciones` no son
parte de una app real; cuentan cuántas veces se construye cada fila para comparar las técnicas.

```dart
// lib/main.dart — la ruta con Riverpod del Tema 3; ProviderScope guarda el estado de todos los providers
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import 'tema3/con_riverpod.dart';

void main() => runApp(
      ProviderScope(
        child: MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: ThemeData(colorSchemeSeed: Colors.indigo),
          home: const RutaConRiverpod(),
        ),
      ),
    );
```


## Aprende construyendo


### Tema 1: setState y sus límites: el estado en el ancestro común · Básico · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- identificar qué widgets necesitan un mismo dato y subir el estado a su ancestro común;
- pasar el dato hacia abajo por constructores y las acciones hacia arriba con funciones;
- medir cuántos widgets reconstruye un `setState`;
- reconocer las señales de que el estado debe salir del árbol de widgets.

**Conceptos clave:** estado local, subir el estado, ancestro común, prop drilling, estado inmutable

#### El problema
La lista de la ruta tiene una casilla por entrega, y la barra superior muestra cuántas quedan pendientes. Las dos
piezas necesitan el mismo dato. Si cada fila guarda su propia casilla, el contador no se entera. ¿Dónde debe vivir el
estado?

Este tema usa **`StatefulWidget`** y **`setState`** (Módulo 1, Tema 4) y **`Badge`** (componente de Material 3).

#### Glosario del tema

**estado local**
- **Definición técnica:** dato guardado en el `State` de un widget y modificado con `setState`; solo ese widget y sus descendientes lo conocen.
- **En palabras sencillas:** algo que una pantalla recuerda para sí misma.
- **Dónde se rompe la comparación:** si otro widget fuera del subárbol lo necesita, no tiene cómo leerlo.
- **Ejemplo:** `_ruta` en `_RutaConSetStateState`.
- **Error típico:** usar estado local para datos que deben sobrevivir al cerrar la pantalla.

**subir el estado**
- **Definición técnica:** mover un dato desde los widgets que lo usan hasta su ancestro común, que lo guarda y lo reparte.
- **En palabras sencillas:** guardar el dato en el lugar donde lo pueden ver todos los que lo necesitan.
- **Dónde se rompe la comparación:** cuanto más arriba vive el estado, más widgets se reconstruyen cuando cambia.
- **Ejemplo:** la ruta vive en la pantalla, no en las filas, para que el contador y la lista coincidan.
- **Error típico:** duplicar el dato en dos lugares y sincronizarlos «a mano».

**ancestro común**
- **Definición técnica:** el widget más bajo del árbol que contiene a todos los widgets que usan un dato.
- **En palabras sencillas:** el jefe común de todos los interesados.
- **Dónde se rompe la comparación:** si los interesados están en pantallas distintas, el ancestro común puede ser la app entera.
- **Ejemplo:** `RutaConSetState`, que contiene al `AppBar` y a la lista.
- **Error típico:** subir el estado a `main.dart` «por si acaso»: toda la app se reconstruye por un cambio pequeño.

**prop drilling**
- **Definición técnica:** pasar un dato o una función por constructores a través de widgets intermedios que no lo usan, solo para que llegue a un descendiente.
- **En palabras sencillas:** pasar un recado de mano en mano.
- **Dónde se rompe la comparación:** con dos niveles está bien; con cinco, cada cambio de firma toca muchos archivos.
- **Ejemplo:** `FilaEntrega(e, alTocar: ...)` recibe el callback por constructor.
- **Error típico:** agregar parámetros a diez widgets para que un dato llegue al último.

**estado inmutable**
- **Definición técnica:** estado que no se modifica: cada cambio crea un valor nuevo, y comparar el viejo con el nuevo indica si hubo cambio.
- **En palabras sencillas:** en lugar de borrar y escribir en la misma hoja, se escribe una hoja nueva.
- **Dónde se rompe la comparación:** crear valores nuevos cuesta poco en Dart para listas como esta, pero no es gratis.
- **Ejemplo:** `_ruta = [for (final e in _ruta) ...]` crea otra lista.
- **Error típico:** modificar la lista en el lugar (`_ruta[1] = ...`) sin `setState`: el dato cambia y la pantalla no.

#### ► CÓMO FUNCIONA

##### 1. La idea en lenguaje sencillo
Piensa en una bodega donde cada conductor anota en su libreta qué entregó. El supervisor quiere saber cuántas faltan,
pero no puede leer veinte libretas. La solución es un tablero único en la pared: todos escriben ahí y todos leen de ahí.

En la ruta pasa lo mismo. La casilla de cada fila y el número del camión en la barra superior hablan del mismo dato:
qué entregas siguen pendientes. Si cada fila guarda su casilla, el número no tiene de dónde leer. El tablero de la
pared es el widget que contiene a ambos, y ahí debe vivir la lista.

Este tema trata de esa decisión: dónde guardar un dato que varias partes de la pantalla necesitan. También trata de su
costo, porque cada vez que el tablero cambia, Flutter vuelve a dibujar todo lo que cuelga de él.

##### 2. Definición formal y vocabulario
Un `StatefulWidget` crea un objeto `State` que persiste entre reconstrucciones. Los campos de ese objeto son su
**estado local**: datos que solo ese widget y sus descendientes conocen. La documentación de Flutter lo llama estado
efímero (*ephemeral state*) y lo distingue del estado de la app, que comparten muchas pantallas.

`setState(fn)` es el método de `State` que avisa al framework que el estado interno cambió. Ejecuta la función que le
pasas y marca el widget para reconstruirse. No guarda nada por sí mismo: el dato ya cambió dentro de la función.

**Subir el estado** (en inglés, *lifting state up*) es mover el dato hasta el **ancestro común** de los widgets que lo
usan. El ancestro común es el widget más bajo que los contiene a todos. Desde ahí, el dato baja por constructores y
las acciones suben como funciones (`VoidCallback`). Cuando ese paso de mano en mano atraviesa widgets que no usan el
dato, se llama ***prop drilling***.

El **estado inmutable** completa la idea: en lugar de modificar la lista, creas otra con el cambio. Así el valor viejo
y el nuevo son objetos distintos, y comparar los dos dice si algo cambió.

##### 3. Cómo funciona por dentro, paso a paso
Sigue un toque sobre `EN-4472` desde el dedo hasta la pantalla:

1. `CheckboxListTile` recibe el toque y llama a `onChanged`, que ejecuta `alTocar()`. Esa función la creó el ancestro.
2. `alTocar` llama a `_alternar('EN-4472')` en `_RutaConSetStateState`. La acción subió sin que la fila sepa nada de la
   lista.
3. `setState` ejecuta la función de forma sincrónica. Al volver, `_ruta` ya apunta a una lista nueva.
4. `setState` marca el elemento de la pantalla como «sucio» y pide un cuadro nuevo. Todavía no se construye nada.
5. En el cuadro siguiente, el `BuildOwner` recorre los elementos sucios y ejecuta `build` del ancestro.
6. `build` crea objetos nuevos: un `ContadorPendientes` y cinco `FilaEntrega`. Son widgets, descripciones baratas.
7. Cada elemento compara su widget viejo con el nuevo. Si el tipo y la *key* coinciden, el elemento se reutiliza y
   ejecuta el `build` del widget nuevo.
8. Los objetos de render solo cambian donde cambió una propiedad: la casilla de `EN-4472` y el texto tachado.

```dart
void _alternar(String guia) => setState(() {
      _ruta = [
        for (final e in _ruta)
          e.guia == guia ? e.con(e.estado == Estado.entregada ? Estado.pendiente : Estado.entregada) : e,
      ];
    });
```

En este esquema, la lista nueva reutiliza las cuatro entregas que no cambiaron: son los mismos objetos. Solo la
entrega tocada es un objeto nuevo, creado con `con(...)`.

El paso 7 explica la medición del problema resuelto. Las cinco `FilaEntrega` son instancias nuevas, así que Flutter
ejecuta los cinco `build`, aunque cuatro filas dibujen lo mismo. El paso 8 explica por qué no es grave con cinco filas:
el trabajo caro, pintar, solo ocurre donde algo cambió.

```mermaid
flowchart TD
    S["RutaConSetState<br/>estado: _ruta"] -->|"pendientes: 4"| C["ContadorPendientes"]
    S -->|"entrega + alTocar"| F1["FilaEntrega EN-4471"]
    S -->|"entrega + alTocar"| F2["FilaEntrega EN-4472"]
    S -->|"..."| F5["FilaEntrega EN-4480"]
    F2 -.->|"alTocar() → setState"| S
```

##### 4. Reglas, variantes y casos límite
`setState` tiene reglas que el framework comprueba en modo de depuración. Conócelas antes de que aparezcan en la consola:

- La función que recibe debe ser sincrónica. Si devuelve un `Future` (por ejemplo, `setState(() async {...})`), Flutter
  lanza un error que dice que el callback devolvió un `Future`. Haz el `await` antes y llama a `setState` después.
- Solo se llama con el widget montado. Tras `dispose`, el error empieza con `setState() called after dispose()`. Por
  eso, después de un `await`, compruebas `mounted` primero (Módulo 3, Tema 1).
- No se llama durante un `build`. El mensaje es `setState() or markNeedsBuild() called during build.`
- Llamar varias veces a `setState` antes del siguiente cuadro no produce varias reconstrucciones. El elemento ya está
  marcado y se construye una sola vez.

Un caso límite importante es el widget `const`. Si el ancestro crea `const Icon(...)`, en cada `build` recibe el mismo
objeto. Flutter detecta que el widget es idéntico y no lo reconstruye. `FilaEntrega` no puede ser `const` porque recibe
datos que cambian.

Otro caso límite es la lista. En Dart, `==` entre listas compara identidad, no contenido. Si modificas `_ruta` en el
lugar, el objeto sigue siendo el mismo y nada externo puede notar el cambio. Dentro de `setState` funcionaría hoy, pero
los Temas 3 y 6 dependen de comparar valores y fallarían.

La documentación de Flutter admite que no hay una regla universal entre estado efímero y estado de la app. Una regla
práctica sirve de punto de partida. Si un dato lo usa un solo widget, déjalo local. Si lo usan varios widgets cercanos,
súbelo al ancestro común. Si cruza pantallas o necesita pruebas sin interfaz, sácalo del árbol.

##### 5. Relación con lo que ya sabes y lo que viene
Este tema usa tres piezas del Módulo 1. `StatefulWidget` y el ciclo de vida de `State` vienen del Tema 4. Las *keys*
del Tema 5 deciden si un elemento se reutiliza en el paso 7. Los tres árboles del Tema 6 explican por qué reconstruir
widgets es barato y repintar no lo es.

Del Módulo 3, Tema 1, viene `mounted`: la misma regla que protege a `Navigator` después de un `await` protege a
`setState`. Del Módulo 0, Tema 2, viene la clase inmutable con campos `final` y constructor `const`, que es la forma
de `Entrega`.

Fíjate en la diferencia con lo que viene. Aquí el estado vive dentro del árbol, y solo lo ven los descendientes del
ancestro. El Tema 2 lo saca a un `ChangeNotifier`, que cualquier pantalla puede escuchar. El Tema 3 usa Riverpod para
que cada fila escuche solo su entrega y la medición baje de 5 filas a 1.

#### Problema resuelto 1.1
Construye la ruta con contador y casillas usando solo `setState`. Mide cuántas filas se reconstruyen al marcar una
entrega.

**Razonamiento:**
1. El estado (`_ruta`) sube a la pantalla, el ancestro común del contador y de la lista.
2. Las filas son `StatelessWidget`: reciben la entrega y una función para avisar el toque.
3. `_alternar` crea una lista nueva con la entrega cambiada.
4. La prueba de los Temas 1 a 3 limpia el contador de construcciones, toca `EN-4472` y lo imprime.

```dart
// lib/tema1/con_setstate.dart — el estado vive en el ancestro común y baja por constructores
import 'package:material_ui/material_ui.dart';

import '../modelo.dart';

class RutaConSetState extends StatefulWidget {
  const RutaConSetState({super.key});

  @override
  State<RutaConSetState> createState() => _RutaConSetStateState();
}

class _RutaConSetStateState extends State<RutaConSetState> {
  var _ruta = rutaInicial;                                          // el estado sube al ancestro común

  void _alternar(String guia) => setState(() {
        _ruta = [
          for (final e in _ruta)
            e.guia == guia ? e.con(e.estado == Estado.entregada ? Estado.pendiente : Estado.entregada) : e,
        ];
      });

  @override
  Widget build(BuildContext context) {
    final pendientes = _ruta.where((e) => e.estado == Estado.pendiente).length;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ruta de hoy'),
        actions: [ContadorPendientes(pendientes)],                   // baja por constructor
      ),
      body: ListView(
        children: [
          for (final e in _ruta) FilaEntrega(e, alTocar: () => _alternar(e.guia)),   // el callback también baja
        ],
      ),
    );
  }
}

class ContadorPendientes extends StatelessWidget {
  const ContadorPendientes(this.pendientes, {super.key});
  final int pendientes;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(right: 16),
        child: Badge(
          label: Text('$pendientes'),
          isLabelVisible: pendientes > 0,
          child: const Icon(Icons.local_shipping_outlined),
        ),
      );
}

class FilaEntrega extends StatelessWidget {
  const FilaEntrega(this.entrega, {super.key, required this.alTocar});
  final Entrega entrega;
  final VoidCallback alTocar;

  @override
  Widget build(BuildContext context) {
    anotarConstruccion(entrega.guia);
    final hecha = entrega.estado == Estado.entregada;
    return CheckboxListTile(
      value: hecha,
      onChanged: (_) => alTocar(),
      title: Text(entrega.guia, style: hecha ? const TextStyle(decoration: TextDecoration.lineThrough) : null),
      subtitle: Text(entrega.direccion),
    );
  }
}
```

La misma prueba sirve para los Temas 1, 2 y 3; cada tema mira sus líneas de la salida.

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:m4/modelo.dart';
import 'package:m4/tema1/con_setstate.dart';
import 'package:m4/tema2/ruta_notifier.dart';
import 'package:m4/tema3/con_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import 'pantallazo.dart';

Widget app(Widget pantalla) => MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorSchemeSeed: Colors.indigo),
      home: pantalla,
    );

/// Toca una guía y cuenta cuántas filas se reconstruyeron por ese toque.
Future<void> medir(WidgetTester tester, String tecnica) async {
  construcciones.clear();
  await tester.tap(find.text('EN-4472'));
  await tester.pump();
  final n = totalConstrucciones();
  debugPrint('$tecnica: un toque reconstruyó $n ${n == 1 ? 'fila ' : 'filas'} $construcciones');
}

void main() {
  setUpAll(cargarFuentes);

  testWidgets('tema 1: setState', (tester) async {
    tamanoPantalla(tester, tamano: const Size(390, 460));
    await tester.pumpWidget(app(const RutaConSetState()));
    await medir(tester, 'setState      ');
    await tester.pumpAndSettle();
    await pantallazo('m4-t1-ruta');
  });

  testWidgets('tema 2: ChangeNotifier', (tester) async {
    final ruta = Ruta();
    addTearDown(ruta.dispose);
    await tester.pumpWidget(app(RutaConNotifier(ruta)));
    await medir(tester, 'ChangeNotifier');
  });

  test('tema 2: la lógica se prueba sin widgets', () {
    final ruta = Ruta()
      ..alternar('EN-4471')
      ..alternar('EN-4475');
    debugPrint('sin pantalla: pendientes = ${ruta.pendientes}');
  });

  testWidgets('tema 3: Riverpod con select', (tester) async {
    tamanoPantalla(tester, tamano: const Size(390, 520));
    await tester.pumpWidget(ProviderScope(child: app(const RutaConRiverpod())));
    await medir(tester, 'Riverpod      ');
    await tester.tap(find.text('EN-4478'));
    await tester.tap(find.text('Pendientes'));
    await tester.pumpAndSettle();
    debugPrint('filtro Pendientes: ${find.byType(FilaConsumidora).evaluate().length} filas');
    await pantallazo('m4-t3-filtro');
  });

  test('tema 3: el provider se prueba sin widgets', () {
    final contenedor = ProviderContainer.test();
    contenedor.read(rutaProvider.notifier).alternar('EN-4471');
    contenedor.read(filtroProvider.notifier).elegir(Filtro.entregadas);
    debugPrint('sin pantalla: visibles = ${contenedor.read(guiasVisiblesProvider)}, '
        'pendientes = ${contenedor.read(pendientesProvider)}');
  });
}
```

```text
$ flutter test test/tema123_test.dart
00:00 +0: loading /home/estudiante/labs/flutter/m4/test/tema123_test.dart
00:00 +0: (setUpAll)
00:00 +0: tema 1: setState
setState      : un toque reconstruyó 5 filas {EN-4471: 1, EN-4472: 1, EN-4475: 1, EN-4478: 1, EN-4480: 1}
00:00 +1: tema 2: ChangeNotifier
ChangeNotifier: un toque reconstruyó 5 filas {EN-4471: 1, EN-4472: 1, EN-4475: 1, EN-4478: 1, EN-4480: 1}
00:01 +2: tema 2: la lógica se prueba sin widgets
sin pantalla: pendientes = 3
00:01 +3: tema 3: Riverpod con select
Riverpod      : un toque reconstruyó 1 fila  {EN-4472: 1}
filtro Pendientes: 3 filas
00:01 +4: tema 3: el provider se prueba sin widgets
sin pantalla: visibles = [EN-4471], pendientes = 4
00:01 +5: (tearDownAll)
00:01 +5: All tests passed!
```

![La ruta de hoy con setState: EN-4472 marcada y tachada, las demás pendientes, y el ícono del camión en la barra superior con el número 4](content/figures/flutter/m4-t1-ruta.png)

**Explicación por partes.**
- Línea 14: el estado vive en la pantalla; es la única fuente de verdad del contador y de las filas.
- Líneas 16–21: la lista nueva cambia solo la entrega tocada; las demás son los mismos objetos.
- Líneas 29 y 33: el dato baja por constructor y la acción sube por la función.
- En la salida, la primera línea: un toque reconstruyó **5 filas**, aunque solo cambió una. Con 5 filas no importa;
  con 300 y una animación, sí.

> **Error común.** Guardar en cada fila su propio `bool` de casilla. El contador nunca coincide con las casillas, y al
> desplazar la lista las filas que salen de pantalla pierden su estado (Módulo 1, Tema 5).

> **Error común.** Llamar a `setState` en un widget alto por un cambio pequeño, como el texto de un buscador. Cada
> letra reconstruye toda la pantalla. Baja ese estado al widget que lo usa.

> **Buena práctica.** Empieza con `setState` y súbelo solo hasta donde haga falta. Pasa a una de las técnicas de los
> temas siguientes cuando aparezcan las señales: el dato cruza pantallas, el *prop drilling* pasa de dos niveles o
> necesitas probar la lógica sin pantalla.

> **Prevenir errores.** Trata el estado como inmutable desde el principio: los Temas 3 y 6 dependen de comparar el
> valor viejo con el nuevo, y una lista modificada en el lugar parece no haber cambiado.

#### Checkpoint 1.1
Si la ruta tuviera 300 entregas, ¿cuántas filas reconstruiría un toque con esta técnica?

Respuesta: todas las que están en pantalla (unas diez). El `build` de la pantalla crea los 300 objetos `FilaEntrega`,
que son baratos, pero la lista solo ejecuta el `build` de las filas visibles. El problema no desaparece: con cada
toque, todas las visibles se rehacen aunque solo cambió una.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Crea los archivos
Crea `lib/modelo.dart`, `lib/tema1/con_setstate.dart` y `test/tema123_test.dart`.

#### Paso 2 · Ejecuta
Ejecuta `flutter test --update-goldens test/tema123_test.dart` y abre `m4-t1-ruta.png`.

#### Paso 3 · Agrega una pantalla
Agrega un botón en la barra que abra con `Navigator.push` una pantalla «Resumen» con el número de entregadas. Pásale el
dato por constructor.

#### Paso 4 · Marca desde el resumen
Agrega al resumen un botón «Marcar todas». ¿Qué tienes que pasarle por constructor para que funcione?

#### Paso 5 · Rompe la inmutabilidad
Cambia `_alternar` para modificar la lista en el lugar (`_ruta = List.of(_ruta)..[i] = ...`) sin `setState` y observa
qué pasa en la prueba.

#### Resumen
- El **estado local** vive en un `State`; cuando varios widgets lo necesitan, se **sube el estado** al **ancestro
  común**.
- El dato baja por constructores y las acciones suben por funciones; demasiados niveles son ***prop drilling***.
- El **estado inmutable** permite comparar el antes y el después.

#### Ejercicio verificable 1
Básico. ¿Qué número muestra el contador después de marcar `EN-4472` y `EN-4475`?

Respuesta esperada: `3`. Quedan pendientes `EN-4471`, `EN-4478` y `EN-4480`.

#### Ejercicio verificable 2
Intermedio. En el Paso 3, si marcas una entrega mientras el resumen está abierto, ¿se actualiza el número del
resumen?

Respuesta esperada: no. El resumen recibió el número por constructor al abrirse; es una copia. Para verlo actualizado
habría que cerrarlo y abrirlo, o sacar el estado del árbol (Temas 2 y 3).

#### Ejercicio verificable 3
Reto. En el Paso 4, ¿qué necesitas pasar y qué problema de diseño aparece?

Respuesta esperada: una función `marcarTodas` creada en `_RutaConSetStateState`. Aparece el problema del Ejercicio 2
al revés: la lista se actualiza, pero el resumen abierto sigue mostrando el número viejo. Es la señal de que el estado
cruza pantallas y debe salir del árbol.

#### En el trabajo
En las entrevistas de Flutter se pregunta con frecuencia «¿cuándo dejarías de usar `setState`?». La respuesta que se
espera no es «nunca» ni «siempre»: son las señales de este tema. Muchos equipos mantienen `setState` para el estado de
una sola pantalla (una pestaña abierta, una animación) y usan Riverpod o Bloc para el resto.

</details>

### Tema 2: ChangeNotifier: sacar el estado del árbol de widgets · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- escribir la lógica de la ruta en un `ChangeNotifier`, fuera de los widgets;
- escuchar sus cambios con `ListenableBuilder` en las partes de la pantalla que lo necesitan;
- probar la lógica con una prueba unitaria, sin construir la pantalla;
- explicar por qué escuchar un objeto completo sigue reconstruyendo de más.

**Conceptos clave:** `ChangeNotifier`, `notifyListeners`, `ListenableBuilder`, separación de lógica y presentación

#### El problema
En el Tema 1, la lógica de la ruta (alternar, contar pendientes) vive mezclada con el `build` de la pantalla. Para
probarla hay que construir la pantalla, y para usarla en otra pantalla hay que pasarla por constructores. Además, la
pantalla de resumen abierta no se entera de los cambios.

Este tema usa **subir el estado** y **estado inmutable** (Tema 1) y **`ChangeNotifier`** (Módulo 3, Tema 4).

#### Glosario del tema

**`ChangeNotifier`**
- **Definición técnica:** clase de Flutter que mantiene una lista de oyentes y les avisa con `notifyListeners()`; es un `Listenable`.
- **En palabras sencillas:** un objeto que guarda datos y avisa cuando cambian.
- **Dónde se rompe la comparación:** avisa «cambié», no «qué cambió»: el oyente vuelve a leer todo.
- **Ejemplo:** `Ruta` con `entregas`, `pendientes` y `alternar`.
- **Error típico:** no llamar a `dispose()` cuando ya no se usa; quedan oyentes registrados.

**`notifyListeners`**
- **Definición técnica:** método de `ChangeNotifier` que llama a todos los oyentes registrados, de forma sincrónica.
- **En palabras sencillas:** tocar la campana.
- **Dónde se rompe la comparación:** no compara valores: aunque el dato no haya cambiado, avisa.
- **Ejemplo:** al final de `alternar`.
- **Error típico:** olvidarlo después de cambiar un dato; la pantalla queda con el valor viejo.

**`ListenableBuilder`**
- **Definición técnica:** widget que escucha un `Listenable` y vuelve a ejecutar su `builder` cada vez que este avisa.
- **En palabras sencillas:** un pedazo de pantalla que se redibuja cuando suena la campana.
- **Dónde se rompe la comparación:** reconstruye todo lo que está dentro de su `builder`, aunque solo haya cambiado una parte.
- **Ejemplo:** uno para el contador y otro para la lista.
- **Error típico:** un solo `ListenableBuilder` alrededor de toda la pantalla: vuelve al problema del Tema 1.

**separación de lógica y presentación**
- **Definición técnica:** principio de diseño que pone las reglas del negocio en clases sin widgets y deja a los widgets solo la tarea de mostrar y reenviar acciones.
- **En palabras sencillas:** quien decide no es quien dibuja.
- **Dónde se rompe la comparación:** algunas decisiones son de presentación (el color de una casilla) y se quedan en el widget.
- **Ejemplo:** `Ruta.pendientes` se calcula en la clase, no en el `build`.
- **Error típico:** calcular reglas en el `build` y no poder probarlas sin pantalla.

#### ► CÓMO FUNCIONA

##### 1. La idea en lenguaje sencillo
Imagina la oficina de despacho con un tablero de anuncios y una campana. Quien cambia algo en el tablero toca la
campana. Los interesados se acercan a leer. El tablero no sabe quién lee ni para qué: solo guarda los datos y avisa.

En el Tema 1, el tablero era la propia pantalla: la lista vivía en un `State`. Para leerla había que estar dentro de
ese widget. Ahora la lista pasa a un objeto propio, `Ruta`, que no es un widget. La pantalla, una prueba o una segunda
pantalla pueden tenerlo y escuchar su campana.

Ese cambio separa dos trabajos. `Ruta` decide qué significa alternar una entrega y cuántas quedan. Los widgets solo
muestran lo que `Ruta` dice y le reenvían los toques.

##### 2. Definición formal y vocabulario
**`ChangeNotifier`** es una clase de la biblioteca `foundation` de Flutter que puedes extender o mezclar. Implementa
`Listenable`: mantiene una lista de oyentes, funciones `VoidCallback` sin parámetros, que registras con
`addListener` y quitas con `removeListener`.

**`notifyListeners`** recorre esa lista y llama a cada oyente, de forma sincrónica, antes de devolver el control. No
dice qué cambió ni compara valores: solo anuncia que algo cambió. Por eso el oyente vuelve a leer lo que le interesa.

**`ListenableBuilder`** es el widget que conecta un `Listenable` con la pantalla. Recibe `listenable` y `builder`, y
ejecuta el `builder` cada vez que llega un aviso. Tiene un parámetro opcional, `child`, para un subárbol que no depende
del dato y se construye una sola vez.

La **separación de lógica y presentación** es el principio que justifica todo esto. Las reglas viven en una clase sin
widgets; los widgets solo dibujan. La prueba es inmediata: si puedes ejercer la regla sin construir una pantalla,
está bien separada.

##### 3. Cómo funciona por dentro, paso a paso
Sigue el mismo toque sobre `EN-4472` del Tema 1, ahora con `Ruta`:

1. Al construirse, cada `ListenableBuilder` llama a `ruta.addListener` con una función propia. `Ruta` tiene dos oyentes.
2. El toque llega a `FilaEntrega` y ejecuta `ruta.alternar('EN-4472')`. La fila no sabe nada de widgets externos.
3. `alternar` reemplaza `_entregas` por una lista nueva. En este instante nadie lo sabe todavía.
4. `notifyListeners()` llama a los dos oyentes, uno detrás de otro.
5. Cada oyente hace lo mismo que `setState` en el Tema 1: marca su elemento como sucio.
6. En el cuadro siguiente, Flutter ejecuta los dos `builder`. Uno crea el contador, el otro el `ListView` con cinco filas.
7. `Scaffold`, `AppBar` y el título no se reconstruyen: no escuchan a `Ruta`.

```dart
void alternar(String guia) {
  _entregas = [
    for (final e in _entregas)
      e.guia == guia ? e.con(e.estado == Estado.entregada ? Estado.pendiente : Estado.entregada) : e,
  ];
  notifyListeners();                                              // avisa a quien escuche
}
```

Este método resume el contrato: primero cambias el dato, después avisas. Si inviertes el orden, los oyentes leen el
valor viejo. Si olvidas el aviso, el dato cambia y la pantalla no.

El paso 6 explica por qué la medición sigue en **5 filas**. El `ListenableBuilder` de la lista sabe que hubo un cambio,
no cuál. Su `builder` vuelve a crear las cinco `FilaEntrega`, y cada una ejecuta su `build`.

```mermaid
flowchart LR
    R["Ruta (ChangeNotifier)<br/>fuera del árbol"] -->|"notifyListeners"| LB1["ListenableBuilder → contador"]
    R -->|"notifyListeners"| LB2["ListenableBuilder → lista (5 filas)"]
    F["FilaEntrega"] -->|"ruta.alternar(guía)"| R
    T["Prueba unitaria"] -->|"alternar, pendientes"| R
```

##### 4. Reglas, variantes y casos límite
La documentación de `ChangeNotifier` fija su costo: agregar un oyente es O(1); quitarlo y notificar son O(N), con N
oyentes. Está pensado para pocos oyentes por objeto, no para miles.

Después de `dispose()`, el objeto queda inservible. La documentación indica que `addListener` lanza un error si se
llama sobre un objeto liberado. Quien crea el `ChangeNotifier` es quien lo libera; en la prueba del tema lo hace
`addTearDown(ruta.dispose)`.

`notifyListeners` avisa siempre, aunque el valor sea idéntico. Eso es lo que mide el Paso 4 del laboratorio: alternar
una guía inexistente produce un aviso inútil. La comprobación de «¿cambió algo?» es tu responsabilidad.

Existe una variante que sí compara: `ValueNotifier<T>`, un `ChangeNotifier` que envuelve un solo valor. Al asignar
`value`, solo avisa si el valor nuevo es distinto del anterior según `==`. Sirve para un dato simple, no para una clase
con varias reglas.

`ListenableBuilder` tiene la misma implementación que `AnimatedBuilder`. La documentación recomienda `AnimatedBuilder`
cuando escuchas una animación, solo por legibilidad. Su parámetro `child` evita reconstruir lo que no depende del dato.

Tres reglas de uso salen de aquí. Crea el notificador fuera de `build`, o perderás el estado en cada reconstrucción.
Expón métodos, no listas modificables. Y pon el `ListenableBuilder` lo más abajo posible, alrededor de lo que cambia.

##### 5. Relación con lo que ya sabes y lo que viene
Ya usaste `ChangeNotifier` en el Módulo 3, Tema 4: `refreshListenable` de go_router escuchaba la sesión para decidir
redirecciones. Aquí el mismo mecanismo alimenta la pantalla. `dispose` y su obligación de liberar recursos vienen del
Módulo 1, Tema 4.

Compáralo con el Tema 1. `setState` vive dentro de un `State` y solo sirve a sus descendientes. `ChangeNotifier` vive
fuera del árbol y sirve a cualquiera que tenga la referencia. Ganas lógica comprobable y compartible. No ganas
precisión: un aviso sigue rehaciendo todo lo que escucha.

El Tema 3 resuelve esa precisión. Riverpod cambia la campana por un valor: cada widget elige qué parte observar, y solo
se reconstruye si esa parte cambió según `==`. El paquete `provider`, antecesor de Riverpod, se construyó sobre
`ChangeNotifier`; Riverpod 3 conserva `ChangeNotifierProvider` solo como API heredada.

#### Problema resuelto 2.1
Pasa la lógica de la ruta a un `ChangeNotifier`, escúchala desde la pantalla y prueba la lógica sin pantalla.

**Razonamiento:**
1. `Ruta` tiene el mismo `alternar` del Tema 1 y calcula `pendientes`.
2. La pantalla recibe la `Ruta` y es un `StatelessWidget`: ya no tiene estado propio.
3. Un `ListenableBuilder` envuelve el contador y otro la lista.
4. La prueba unitaria crea una `Ruta`, llama a `alternar` dos veces y lee `pendientes`.

```dart
// lib/tema2/ruta_notifier.dart — el estado sale del árbol de widgets: un ChangeNotifier
import 'package:material_ui/material_ui.dart';

import '../modelo.dart';
import '../tema1/con_setstate.dart' show ContadorPendientes, FilaEntrega;

class Ruta extends ChangeNotifier {
  List<Entrega> _entregas = rutaInicial;
  List<Entrega> get entregas => _entregas;
  int get pendientes => _entregas.where((e) => e.estado == Estado.pendiente).length;

  void alternar(String guia) {
    _entregas = [
      for (final e in _entregas)
        e.guia == guia ? e.con(e.estado == Estado.entregada ? Estado.pendiente : Estado.entregada) : e,
    ];
    notifyListeners();                                              // avisa a quien escuche
  }
}

class RutaConNotifier extends StatelessWidget {
  const RutaConNotifier(this.ruta, {super.key});
  final Ruta ruta;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('Ruta de hoy'),
          actions: [
            ListenableBuilder(                                      // solo esto se reconstruye para el contador
              listenable: ruta,
              builder: (context, _) => ContadorPendientes(ruta.pendientes),
            ),
          ],
        ),
        body: ListenableBuilder(
          listenable: ruta,
          builder: (context, _) => ListView(
            children: [for (final e in ruta.entregas) FilaEntrega(e, alTocar: () => ruta.alternar(e.guia))],
          ),
        ),
      );
}
```

La prueba está en `test/tema123_test.dart` (Tema 1): son las líneas `ChangeNotifier: ...` y `sin pantalla:
pendientes = 3` de la salida.

**Explicación por partes.**
- Líneas 7–19: la lógica sin widgets. `Ruta` se puede usar en cualquier pantalla y probar sin ninguna.
- Línea 17: `notifyListeners` avisa a los dos `ListenableBuilder`.
- Líneas 30–33: el contador se reconstruye solo, sin rehacer el `AppBar`.
- En la salida, el toque siguió reconstruyendo **5 filas**: el `ListenableBuilder` de la lista no sabe qué entrega
  cambió y rehace todas. Ganamos lógica comprobable, no todavía precisión.
- `sin pantalla: pendientes = 3`: la prueba unitaria no construyó ningún widget.

> **Error común.** Crear el `ChangeNotifier` dentro de `build` (`final ruta = Ruta();`). Cada reconstrucción crea una
> ruta nueva y se pierde el estado. Créalo una vez: en un `State`, en `main` o con un provider (Tema 3).

> **Error común.** Modificar el estado desde el widget (`ruta.entregas.add(...)`) en lugar de llamar a un método.
> Nadie llama a `notifyListeners` y la pantalla no cambia. Expón solo métodos para cambiar el estado.

> **Buena práctica.** Nombra los métodos del notificador como acciones del dominio (`alternar`, `marcarTodas`,
> `reportarNovedad`), no como operaciones técnicas (`setLista`). Así el widget dice qué quiere, no cómo hacerlo.

> **Prevenir errores.** Escribe primero la prueba unitaria del notificador y después la pantalla. Si la lógica no se
> puede probar sin pantalla, todavía está mezclada.

#### Checkpoint 2.1
¿Qué hace falta para que la pantalla de resumen del Ejercicio 2 del Tema 1 se actualice sola?

Respuesta: pasarle la misma `Ruta` y mostrar el número dentro de un `ListenableBuilder`. Al marcar en la lista, la
`Ruta` avisa y el resumen se redibuja.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Crea el archivo
Crea `lib/tema2/ruta_notifier.dart`.

#### Paso 2 · Ejecuta
Ejecuta `flutter test test/tema123_test.dart` y busca las dos líneas de este tema.

#### Paso 3 · Agrega una regla
Agrega a `Ruta` el método `marcarTodas()` y una prueba unitaria que compruebe que `pendientes` queda en 0.

#### Paso 4 · Avisa sin cambiar
Llama a `ruta.alternar('EN-9999')` (una guía que no existe) en una prueba con un oyente que cuente avisos. ¿Cuántos
avisos llegan?

#### Paso 5 · Evita avisos inútiles
Haz que `alternar` no llame a `notifyListeners` si la guía no existe, y repite el Paso 4.

#### Resumen
- Un **`ChangeNotifier`** guarda la lógica fuera de los widgets y avisa con **`notifyListeners`**.
- **`ListenableBuilder`** redibuja solo la parte que lo escucha, pero toda esa parte.
- La **separación de lógica y presentación** permite probar las reglas sin pantalla.

#### Ejercicio verificable 1
Básico. ¿Qué imprime `(Ruta()..alternar('EN-4471')..alternar('EN-4471')).pendientes`?

Respuesta esperada: `5`. Alternar dos veces la misma guía la deja como estaba.

#### Ejercicio verificable 2
Intermedio. En el Paso 4, ¿cuántos avisos llegan?

Respuesta esperada: uno. `notifyListeners` avisa aunque la lista nueva tenga las mismas entregas: no compara valores.

#### Ejercicio verificable 3
Reto. En el Paso 5, ¿cómo sabes si la guía existe sin recorrer la lista dos veces?

Respuesta esperada: con una bandera dentro del mismo recorrido, por ejemplo `var cambio = false;` y `cambio = true`
cuando `e.guia == guia`, y `if (cambio) notifyListeners();` al final. El aviso queda en 0.

#### En el trabajo
`ChangeNotifier` viene con Flutter y es la base de muchos paquetes (incluido `provider`, el antecesor de Riverpod).
Aparece en código existente de muchas empresas, y su limitación (avisar sin decir qué cambió) es lo que motiva las
técnicas del Tema 3.

</details>

### Tema 3: Riverpod: providers, estado derivado y escuchar solo lo necesario · Intermedio · 55 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- declarar el estado con `Notifier` y `NotifierProvider`, y leerlo con `ref.watch` desde un `ConsumerWidget`;
- calcular estado derivado (filtros, conteos) con `Provider`;
- usar `select` para que cada fila se reconstruya solo cuando cambia su entrega;
- probar providers con `ProviderContainer`, sin pantalla.

**Conceptos clave:** provider, `Notifier`, `ref.watch` y `ref.read`, estado derivado, `select`, igualdad por valor

#### El problema
Con `ChangeNotifier` la lógica ya se prueba sola, pero un toque sigue reconstruyendo las cinco filas, y para usar la
ruta en otra pantalla hay que pasarla por constructores. Además, el conductor pidió filtrar por «Pendientes» y
«Entregadas». Cada pieza de la pantalla debería pedir exactamente el dato que usa y enterarse solo cuando ese dato
cambia.

Este tema usa **`ChangeNotifier`** y **separación de lógica y presentación** (Tema 2), **keys** (Módulo 1, Tema 5) y
**`operator ==`** (Módulo 0, Tema 2).

#### Glosario del tema

**provider**
- **Definición técnica:** objeto global e inmutable que declara cómo crear un valor; el valor vive en un contenedor (`ProviderScope` en la app, `ProviderContainer` en pruebas) y se crea la primera vez que alguien lo lee.
- **En palabras sencillas:** una receta con nombre para obtener un dato, que se prepara una vez y se comparte.
- **Dónde se rompe la comparación:** la variable es global, pero el valor no: cada contenedor tiene el suyo, y por eso las pruebas no se mezclan.
- **Ejemplo:** `rutaProvider`, `filtroProvider`, `pendientesProvider`.
- **Error típico:** olvidar el `ProviderScope` en `main`: la app falla al primer `ref.watch`.

**`Notifier`**
- **Definición técnica:** clase de Riverpod con un método `build` que devuelve el estado inicial y métodos que asignan un estado nuevo a `state`; se expone con `NotifierProvider`.
- **En palabras sencillas:** el `ChangeNotifier` de Riverpod, pero que avisa solo si el estado nuevo es distinto.
- **Dónde se rompe la comparación:** no hay `notifyListeners`: asignar `state` es lo que avisa.
- **Ejemplo:** `RutaNotifier.alternar` asigna `state = [...]`.
- **Error típico:** modificar la lista en el lugar (`state.add(...)`): el objeto es el mismo y nadie se entera.

**`ref.watch` y `ref.read`**
- **Definición técnica:** `watch` lee un provider y suscribe al widget (o al provider) para reconstruirse cuando cambie; `read` lee una vez, sin suscribirse.
- **En palabras sencillas:** `watch` es «avísame si cambia»; `read` es «dame el valor ahora».
- **Dónde se rompe la comparación:** dentro de un `onPressed` no tiene sentido suscribirse: ahí va `read`.
- **Ejemplo:** `ref.watch(guiasVisiblesProvider)` en `build`; `ref.read(rutaProvider.notifier).alternar(...)` al tocar.
- **Error típico:** `ref.read` en `build`: la pantalla muestra el primer valor y nunca se actualiza.

**estado derivado**
- **Definición técnica:** valor calculado a partir de otros providers con `Provider((ref) => ...)`; se recalcula cuando cambia alguno de los que observa.
- **En palabras sencillas:** un dato que no se guarda, se deduce.
- **Dónde se rompe la comparación:** se guarda en caché: si nada cambió, no se recalcula.
- **Ejemplo:** `guiasVisiblesProvider` (ruta + filtro) y `pendientesProvider`.
- **Error típico:** guardar el conteo de pendientes en otro `Notifier` y actualizarlo a mano: tarde o temprano no coincide.

**`select`**
- **Definición técnica:** variante de `watch` que observa solo una parte del valor de un provider; el widget se reconstruye solo si esa parte cambia según `==`.
- **En palabras sencillas:** «avísame solo si cambia MI entrega».
- **Dónde se rompe la comparación:** la función se ejecuta en cada cambio del provider; lo que se ahorra es la reconstrucción, no el cálculo.
- **Ejemplo:** `ref.watch(rutaProvider.select((ruta) => ruta.firstWhere((e) => e.guia == guia)))`.
- **Error típico:** devolver en `select` un objeto nuevo cada vez (una lista filtrada): `==` siempre es falso y no se ahorra nada.

**igualdad por valor**
- **Definición técnica:** implementar `operator ==` y `hashCode` para que dos objetos con el mismo contenido sean iguales; Riverpod la usa para decidir si avisar.
- **En palabras sencillas:** dos listas con las mismas guías cuentan como «la misma».
- **Dónde se rompe la comparación:** en Dart, `[1] == [1]` es `false`: las listas comparan identidad.
- **Ejemplo:** `GuiasVisibles` compara con `listEquals`.
- **Error típico:** un provider derivado que devuelve una lista nueva en cada cálculo: todos sus oyentes se reconstruyen siempre.

#### ► CÓMO FUNCIONA

##### 1. La idea en lenguaje sencillo
Vuelve a la oficina de despacho. Con la campana del Tema 2, cada aviso hacía levantar a todos. Ahora piensa en un
sistema de suscripciones: cada conductor pide «avísame solo si cambia mi entrega». El supervisor pide «avísame si
cambia el número de pendientes». Nadie se levanta por un cambio que no le toca.

Riverpod funciona así. Declaras una vez cómo obtener cada dato: la ruta, el filtro elegido, las guías visibles, el
número de pendientes. Cada widget dice qué dato observa, y a veces qué parte de él. Riverpod lleva la cuenta de quién
depende de qué y solo reconstruye a quien vio un valor distinto.

El resultado se mide en la salida del tema: el mismo toque sobre `EN-4472` pasa de reconstruir 5 filas a 1.

##### 2. Definición formal y vocabulario
Un **provider** es un objeto inmutable, normalmente una variable global `final`, que describe cómo crear un valor. El
valor no vive en el provider: vive en un contenedor. En la app, el contenedor lo crea `ProviderScope`; en una prueba,
lo creas tú con `ProviderContainer`. Cada contenedor tiene sus propios valores, aunque la variable sea global.

Un **`Notifier`** es la clase que guarda un estado que cambia. Su método `build` devuelve el estado inicial, y sus
métodos asignan un estado nuevo a `state`. Se expone con `NotifierProvider`. Al asignar `state`, Riverpod avisa a los
oyentes si el valor nuevo es distinto del anterior según `==`.

Desde un widget lees providers con un `WidgetRef`. **`ref.watch`** lee y suscribe: el widget se reconstruirá si el
valor cambia. **`ref.read`** lee una sola vez, sin suscribir; es para callbacks como `onChanged`.

El **estado derivado** es un `Provider((ref) => ...)` que calcula su valor observando otros providers. **`select`**
observa solo una parte del valor de un provider. Los dos deciden si avisar comparando con `==`, así que dependen de la
**igualdad por valor**: que dos objetos con el mismo contenido sean iguales.

##### 3. Cómo funciona por dentro, paso a paso
Sigue otra vez el toque sobre `EN-4472`, ahora con el filtro en «Todas»:

1. `ProviderScope` creó el contenedor al arrancar. `rutaProvider` no existía hasta que la pantalla lo leyó por primera
   vez: los providers se crean de forma perezosa.
2. El toque ejecuta `ref.read(rutaProvider.notifier).alternar('EN-4472')`. `read` obtiene el `RutaNotifier` sin
   suscribir la fila.
3. `alternar` asigna una lista nueva a `state`. Riverpod la compara con la anterior: son objetos distintos, así que hay
   cambio.
4. Riverpod marca como desactualizados a quienes dependen de `rutaProvider`: los dos derivados y los `select` de las
   cinco filas.
5. Cada fila evalúa su función de `select`. Cuatro filas obtienen el mismo objeto `Entrega` de antes: `==` es verdadero
   y no se reconstruyen. La fila `EN-4472` obtiene una `Entrega` nueva y se marca para reconstruirse.
6. `pendientesProvider` se recalcula: pasa de 5 a 4. El `Consumer` del contador se reconstruye.
7. `guiasVisiblesProvider` se recalcula y devuelve un `GuiasVisibles` con las mismas cinco guías. Gracias a su `==`, es
   igual al anterior: la lista no se entera.

```dart
final entrega = ref.watch(rutaProvider.select((ruta) => ruta.firstWhere((e) => e.guia == guia)));
```

Esta línea de `FilaConsumidora` es el paso 5. La función se ejecuta en cada cambio de la ruta; lo que se ahorra es el
`build`, no el cálculo del `select`.

El paso 7 explica el hallazgo del problema resuelto. Con `List<String>`, cada cálculo creaba una lista nueva. Como en
Dart `[1] == [1]` es `false`, Riverpod veía un cambio en cada toque y la lista reconstruía todas las filas.

```mermaid
flowchart TD
    R["rutaProvider (Notifier)"] --> G["guiasVisiblesProvider"]
    F["filtroProvider (Notifier)"] --> G
    R --> P["pendientesProvider"]
    G -->|"watch: avisa solo si cambian las guías"| L["RutaConRiverpod: la lista"]
    P -->|watch| C["Consumer: contador"]
    R -->|"select: solo EN-4472"| F2["FilaConsumidora EN-4472"]
    R -->|"select: solo EN-4471"| F1["FilaConsumidora EN-4471 (no cambia)"]
```

##### 4. Reglas, variantes y casos límite
Este curso usa `flutter_riverpod` 3.5.0. Riverpod 3.0 cambió varias reglas respecto a 2.x, y verás código viejo en
internet:

- Desde 3.0, todos los providers filtran los avisos con `==`. Antes, algunos usaban otras comparaciones. Puedes
  personalizarlo sobrescribiendo `updateShouldNotify`.
- `StateProvider`, `StateNotifierProvider` y `ChangeNotifierProvider` siguen existiendo, pero se movieron a
  `package:riverpod/legacy.dart` para indicar que ya no se recomiendan. Usa `Notifier`.
- `Ref` es un solo tipo, sin parámetro genérico. Tipos como `FutureProviderRef` desaparecieron.
- Cuando un widget deja de estar visible, sus suscripciones se pausan, y se reanudan al volver.
- `ProviderContainer.test()` crea un contenedor que se libera solo al terminar la prueba. Lo usa la prueba del tema.

Hay reglas de uso que el analizador no detecta. En `build` siempre `watch` o `select`; en callbacks, `read`. Nunca
modifiques `state` en el lugar (`state.add(...)`): el objeto es el mismo, `==` es verdadero y nadie se entera.

Un provider declarado sin `autoDispose` conserva su valor mientras viva el contenedor. Con
`NotifierProvider.autoDispose`, el valor se destruye cuando nadie lo escucha. La ruta del día puede vivir siempre; una
búsqueda temporal, no.

`select` tiene un límite que muestra el Checkpoint 3.1. Evita las reconstrucciones que vienen del provider, no las que
vienen del padre. Si la lista crea un widget `FilaConsumidora` nuevo, ese widget se construye aunque su entrega no haya
cambiado.

##### 5. Relación con lo que ya sabes y lo que viene
La igualdad por valor viene del Módulo 0, Tema 2, donde implementaste `operator ==` y `hashCode`. Las `ValueKey` de
cada fila vienen del Módulo 1, Tema 5: permiten que Flutter reutilice el elemento correcto cuando el filtro cambia el
orden.

Compáralo con el Tema 2. `ChangeNotifier` avisa «cambié» y el oyente relee todo. `Notifier` publica un valor nuevo, y
Riverpod compara antes de avisar. `ref.watch` cumple el papel de `ListenableBuilder`, pero lo usas dentro de cualquier
`ConsumerWidget`.

Lo que viene se apoya en este tema. El Tema 4 usa `AsyncNotifier`, el mismo `Notifier` para datos que tardan. El Tema
5 agrega `ref.listen` para efectos de una sola vez. El Tema 6 explica cuándo se recalculan los derivados y compara este
modelo con Cubit.

#### Problema resuelto 3.1
Haz la ruta con Riverpod y un filtro por estado. Consigue que un toque reconstruya una sola fila y prueba los
providers sin pantalla.

**Razonamiento:**
1. La ruta y el filtro son `Notifier`; las guías visibles y los pendientes son `Provider` derivados.
2. La lista recibe solo las guías (texto), no las entregas: así un cambio de estado no cambia la lista.
3. `GuiasVisibles` implementa la igualdad por valor; sin ella, el derivado avisaría en cada cambio.
4. Cada fila usa `select` sobre su entrega, con una `ValueKey` por guía.
5. El filtro es un `SegmentedButton`, el componente de Material 3 para elegir una opción entre pocas.

```dart
// lib/tema3/con_riverpod.dart — Riverpod: el estado en un provider y cada widget elige qué parte escuchar
import 'package:flutter/foundation.dart' show listEquals;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import '../modelo.dart';
import '../tema1/con_setstate.dart' show ContadorPendientes;

class RutaNotifier extends Notifier<List<Entrega>> {
  @override
  List<Entrega> build() => rutaInicial;                            // estado inicial

  void alternar(String guia) => state = [
        for (final e in state)
          e.guia == guia ? e.con(e.estado == Estado.entregada ? Estado.pendiente : Estado.entregada) : e,
      ];
}

final rutaProvider = NotifierProvider<RutaNotifier, List<Entrega>>(RutaNotifier.new);

enum Filtro { todas, pendientes, entregadas }

class FiltroNotifier extends Notifier<Filtro> {
  @override
  Filtro build() => Filtro.todas;
  void elegir(Filtro f) => state = f;
}

final filtroProvider = NotifierProvider<FiltroNotifier, Filtro>(FiltroNotifier.new);

/// Lista con igualdad por contenido: dos listas con las mismas guías son «iguales» y no avisan cambio.
@immutable
class GuiasVisibles {
  const GuiasVisibles(this.guias);
  final List<String> guias;

  @override
  bool operator ==(Object other) => other is GuiasVisibles && listEquals(other.guias, guias);

  @override
  int get hashCode => Object.hashAll(guias);

  @override
  String toString() => '$guias';
}

/// Estado derivado: se recalcula cuando cambian la ruta o el filtro, y avisa solo si cambió su valor.
final guiasVisiblesProvider = Provider<GuiasVisibles>((ref) {
  final filtro = ref.watch(filtroProvider);
  return GuiasVisibles([
    for (final e in ref.watch(rutaProvider))
      if (filtro == Filtro.todas ||
          (filtro == Filtro.pendientes && e.estado == Estado.pendiente) ||
          (filtro == Filtro.entregadas && e.estado == Estado.entregada))
        e.guia,
  ]);
});

final pendientesProvider = Provider<int>(
  (ref) => ref.watch(rutaProvider).where((e) => e.estado == Estado.pendiente).length,
);

class RutaConRiverpod extends ConsumerWidget {
  const RutaConRiverpod({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final guias = ref.watch(guiasVisiblesProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ruta de hoy'),
        actions: [Consumer(builder: (context, ref, _) => ContadorPendientes(ref.watch(pendientesProvider)))],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: SegmentedButton<Filtro>(
              showSelectedIcon: false,                              // el ícono partía «Pendientes» en dos líneas
              segments: const [
                ButtonSegment(value: Filtro.todas, label: Text('Todas')),
                ButtonSegment(value: Filtro.pendientes, label: Text('Pendientes')),
                ButtonSegment(value: Filtro.entregadas, label: Text('Entregadas')),
              ],
              selected: {ref.watch(filtroProvider)},
              onSelectionChanged: (s) => ref.read(filtroProvider.notifier).elegir(s.first),
            ),
          ),
          Expanded(
            child: ListView(children: [for (final g in guias.guias) FilaConsumidora(g, key: ValueKey(g))]),
          ),
        ],
      ),
    );
  }
}

/// Cada fila escucha solo SU entrega: al marcar una, las demás no se reconstruyen.
class FilaConsumidora extends ConsumerWidget {
  const FilaConsumidora(this.guia, {super.key});
  final String guia;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final entrega = ref.watch(rutaProvider.select((ruta) => ruta.firstWhere((e) => e.guia == guia)));
    anotarConstruccion(guia);
    final hecha = entrega.estado == Estado.entregada;
    return CheckboxListTile(
      value: hecha,
      onChanged: (_) => ref.read(rutaProvider.notifier).alternar(guia),   // read: para actuar, no para escuchar
      title: Text(guia, style: hecha ? const TextStyle(decoration: TextDecoration.lineThrough) : null),
      subtitle: Text(entrega.direccion),
    );
  }
}
```

La prueba es la de `test/tema123_test.dart` (Tema 1): son las líneas `Riverpod: ...`, `filtro Pendientes: 3 filas` y
la última, `sin pantalla: ...`.

![La ruta con Riverpod: arriba, el selector segmentado con Todas, Pendientes y Entregadas, con Pendientes elegido; debajo, las tres entregas pendientes EN-4471, EN-4475 y EN-4480, y el contador del camión en 3](content/figures/flutter/m4-t3-filtro.png)

**Explicación por partes.**
- Líneas 9–19: el mismo `alternar` de los Temas 1 y 2, pero asignando `state`. Riverpod avisa solo porque el valor
  cambió.
- Líneas 31–45: la igualdad por valor. **La primera versión de este tema devolvía `List<String>` y la medición dio 5
  filas**, igual que `setState`: cada toque creaba una lista nueva de guías, distinta según `==`, y la pantalla
  reconstruía todas las filas. Con `GuiasVisibles`, el toque reconstruye **1 fila**.
- Línea 105: `select` hace que cada fila ignore los cambios de las demás entregas.
- Línea 110: `ref.read` dentro de `onChanged`: actuar no necesita suscribirse.
- Línea 79: `showSelectedIcon: false`. La primera versión mostraba el ícono de selección y partía «Pendientes» en dos
  líneas en 390 puntos de ancho; el pantallazo lo delató.
- `sin pantalla: visibles = [EN-4471], pendientes = 4`: la prueba unitaria usó un `ProviderContainer`, sin widgets.

> **Error común.** Envolver toda la pantalla en un `Consumer` que observa la ruta completa. Funciona, pero cada cambio
> rehace todo: es el Tema 1 con otra sintaxis.

> **Error común.** Leer un provider con `ref.read` en `build` «para optimizar». La pantalla no se entera de los
> cambios. En `build`, siempre `watch` (o `select`).

> **Buena práctica.** Guarda en `Notifier` solo el estado mínimo (la ruta, el filtro) y deriva todo lo demás. Los
> derivados no se desincronizan porque no se guardan.

> **Prevenir errores.** Mide. La cuenta de construcciones de este módulo detectó un problema (la lista nueva en cada
> cambio) que el código no dejaba ver. DevTools muestra lo mismo en la app real con «Track widget rebuilds».

#### Checkpoint 3.1
Con el filtro «Pendientes» elegido, ¿cuántas filas se reconstruyen al marcar `EN-4471` como entregada?

Respuesta: las cuatro que quedan (`EN-4472`, `EN-4475`, `EN-4478` y `EN-4480`), medido con el mismo contador.
`guiasVisiblesProvider` sí cambia (`EN-4471` sale), la lista se reconstruye y crea objetos `FilaConsumidora` nuevos;
un widget nuevo en la misma posición se vuelve a construir aunque su `select` no haya cambiado. `select` evita las
reconstrucciones que vienen del provider, no las que vienen del padre. Aquí es aceptable: ocurre solo cuando la lista
visible cambia, no en cada toque.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Crea el archivo
Crea `lib/tema3/con_riverpod.dart`. `lib/main.dart` ya abre esta pantalla.

#### Paso 2 · Ejecuta
Ejecuta `flutter test --update-goldens test/tema123_test.dart` y compara las tres líneas de medición.

#### Paso 3 · Quita la igualdad
Cambia `guiasVisiblesProvider` para que devuelva `List<String>` y ajusta la pantalla. Ejecuta y anota cuántas filas
se reconstruyen.

#### Paso 4 · Agrega un derivado
Crea `progresoProvider` que devuelva la fracción entregada (de 0 a 1) y muéstrala con un `LinearProgressIndicator`
debajo del selector.

#### Paso 5 · Prueba en la app
Ejecuta `flutter run -d chrome`, abre DevTools, activa «Track widget rebuilds» y marca entregas.

#### Resumen
- Un **provider** declara un valor; su contenedor lo guarda.
- Un **`Notifier`** cambia el estado asignando `state`; **`ref.watch`** escucha y **`ref.read`** actúa.
- El **estado derivado** se calcula de otros providers; **`select`** escucha solo una parte.
- Sin **igualdad por valor**, los derivados que crean listas avisan siempre.

#### Ejercicio verificable 1
Básico. Con el Paso 3, ¿cuántas filas reconstruye el toque?

Respuesta esperada: 5, como `setState`. Es exactamente la primera medición que se obtuvo al escribir este tema.

#### Ejercicio verificable 2
Intermedio. ¿Qué imprime la prueba sin pantalla si se marca también `EN-4472` antes de leer?

Respuesta esperada: `sin pantalla: visibles = [EN-4471, EN-4472], pendientes = 3`.

#### Ejercicio verificable 3
Reto. Con el Paso 4, ¿se reconstruye el `LinearProgressIndicator` al cambiar el filtro?

Respuesta esperada: no. `progresoProvider` depende solo de `rutaProvider`; cambiar el filtro no lo recalcula y su
valor no cambia.

#### En el trabajo
Riverpod es una de las soluciones de estado más usadas en apps Flutter nuevas, junto con Bloc (Tema 6). En las
revisiones de código se miran tres cosas: `read` en `build`, providers derivados sin igualdad por valor y `Consumer`
demasiado grandes. Las tres aparecieron en este tema.

</details>

### Tema 4: Datos asíncronos: AsyncNotifier y el diseño de cada estado · Intermedio · 50 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- cargar datos con `AsyncNotifier` y leer su estado como `AsyncValue`;
- diseñar las cuatro pantallas de una carga: cargando, datos, vacío y error;
- reintentar una carga fallida con `AsyncValue.guard`;
- reemplazar el origen de los datos en una prueba y controlar los reintentos automáticos de Riverpod 3.

**Conceptos clave:** `AsyncValue`, `AsyncNotifier`, esqueleto de carga, estado vacío, `AsyncValue.guard`, reintento automático

#### El problema
La ruta del día viene del servidor. Durante un segundo no hay datos; a veces la red falla; algunos días no hay
entregas. Una pantalla que solo diseñó el caso «con datos» muestra un círculo girando sin explicación, un error rojo de
Flutter o una pantalla en blanco que parece rota.

Este tema usa **`Notifier`** y **`ref.watch`** (Tema 3), **`switch` de expresión con patrones** (Módulo 0, Tema 6) y
las **pantallas de mensaje** del sistema de diseño (Módulo 2, Tema 6).

#### Glosario del tema

**`AsyncValue`**
- **Definición técnica:** tipo `sealed` de Riverpod con tres casos: `AsyncLoading`, `AsyncData` (con `value`) y `AsyncError` (con `error` y `stackTrace`).
- **En palabras sencillas:** «todavía no», «aquí está» o «falló», en un solo tipo.
- **Dónde se rompe la comparación:** puede estar cargando y tener un valor anterior a la vez (al recargar); los patrones del `switch` deciden qué mostrar.
- **Ejemplo:** `switch (entregas) { AsyncData(...) => ..., AsyncError() => ..., _ => ... }`.
- **Error típico:** usar `entregas.value!` sin mirar el caso: falla mientras carga.

**`AsyncNotifier`**
- **Definición técnica:** `Notifier` cuyo `build` devuelve un `Future`; su estado empieza en `AsyncLoading` y pasa a `AsyncData` o `AsyncError` cuando el `Future` termina.
- **En palabras sencillas:** un `Notifier` que sabe esperar.
- **Dónde se rompe la comparación:** `build` se vuelve a ejecutar si cambia un provider que observa, y la carga se repite.
- **Ejemplo:** `EntregasDelDia.build` llama al repositorio.
- **Error típico:** guardar `cargando` y `error` en campos aparte: se pueden contradecir (cargando y con error a la vez).

**esqueleto de carga**
- **Definición técnica:** versión gris y sin texto de la interfaz que se está cargando, con la misma forma que tendrá el contenido.
- **En palabras sencillas:** el contorno de la lista antes de la lista.
- **Dónde se rompe la comparación:** si la carga tarda menos de unos 300 ms, el esqueleto parpadea y molesta más que ayuda.
- **Ejemplo:** `EsqueletoLista`: cinco filas con un círculo y dos barras.
- **Error típico:** un círculo girando en el centro de una pantalla vacía: no dice qué va a aparecer ni cuánto falta.

**estado vacío**
- **Definición técnica:** pantalla diseñada para el caso de datos válidos pero sin elementos.
- **En palabras sencillas:** «no hay nada, y eso está bien».
- **Dónde se rompe la comparación:** no es un error: no lleva color de error ni botón de reintentar.
- **Ejemplo:** «No tienes entregas hoy».
- **Error típico:** mostrar una lista vacía: el usuario no distingue «no hay» de «no cargó».

**`AsyncValue.guard`**
- **Definición técnica:** función que ejecuta un `Future` y devuelve `AsyncData` si termina bien o `AsyncError` si lanza, sin dejar escapar la excepción.
- **En palabras sencillas:** un `try/catch` que deja el resultado listo para la pantalla.
- **Dónde se rompe la comparación:** atrapa el error; registrarlo para el equipo (Módulo 13) sigue siendo tu trabajo.
- **Ejemplo:** `state = await AsyncValue.guard(() => ...cargar())`.
- **Error típico:** un `try/catch` que deja el estado en `AsyncLoading` para siempre cuando falla.

**reintento automático**
- **Definición técnica:** en Riverpod 3, cuando un provider falla al construirse, se vuelve a intentar solo con esperas crecientes; se configura con `retry` en `ProviderScope` o en cada provider.
- **En palabras sencillas:** Riverpod insiste antes de rendirse.
- **Dónde se rompe la comparación:** mientras reintenta, el estado sigue en «cargando», así que el usuario no ve el error enseguida.
- **Ejemplo:** `retry: (intento, error) => null` desactiva los reintentos en la prueba.
- **Error típico:** probar el estado de error sin desactivarlos: la pantalla sigue cargando y la prueba no encuentra «Reintentar».

#### ► CÓMO FUNCIONA

##### 1. La idea en lenguaje sencillo
Cuando pides un domicilio, la aplicación no te muestra una pantalla en blanco mientras el restaurante confirma. Te dice
«preparando», luego «en camino» o «no pudimos procesar tu pedido». Cada momento tiene su mensaje, y tú sabes qué hacer
en cada uno.

La ruta del día también llega con demora. Durante un rato no hay datos; luego hay entregas, o no hay ninguna, o la red
falló. Son cuatro situaciones distintas, y el conductor debe distinguirlas de un vistazo, en la calle y con prisa.

Este tema convierte esas situaciones en un solo valor que la pantalla puede revisar con un `switch`. Así ningún caso
queda sin diseño, porque el compilador te obliga a cubrirlos.

##### 2. Definición formal y vocabulario
**`AsyncValue<T>`** es un tipo `sealed` de Riverpod con tres subtipos: `AsyncLoading`, `AsyncData` (con `value`) y
`AsyncError` (con `error` y `stackTrace`). Al ser sellado, un `switch` sobre él puede ser exhaustivo: el analizador
sabe que no hay un cuarto caso.

**`AsyncNotifier<T>`** es un `Notifier` cuyo `build` devuelve un `Future<T>`. Riverpod envuelve ese `Future`: el estado
empieza en `AsyncLoading` y pasa solo a `AsyncData` o `AsyncError` cuando termina. Se expone con
`AsyncNotifierProvider`.

**`AsyncValue.guard`** ejecuta una función asíncrona y devuelve `AsyncData` con el resultado o `AsyncError` con la
excepción. Nunca deja escapar el error: lo convierte en estado.

El **reintento automático** es una política de Riverpod 3: si un provider falla al construirse, Riverpod vuelve a
ejecutar su `build` después de una espera. El **esqueleto de carga** y el **estado vacío** no son APIs: son decisiones
de diseño que dan una pantalla propia a «cargando» y a «no hay datos».

##### 3. Cómo funciona por dentro, paso a paso
Sigue la prueba «error y reintento» del problema resuelto, con el repositorio falso que falla la primera vez:

1. `PantallaCarga` ejecuta `ref.watch(entregasProvider)`. Es la primera lectura, así que Riverpod crea `EntregasDelDia`
   y llama a su `build`.
2. `build` llama a `cargar()` y devuelve el `Future` sin esperarlo. El estado queda en `AsyncLoading` y el `switch` cae
   en `_`: se ve el esqueleto.
3. A los 500 ms, `cargar()` lanza `Exception('sin conexión')`. Riverpod atrapa el error y pasa el estado a
   `AsyncError`.
4. La prueba desactivó el reintento con `retry: (intento, error) => null`. El estado se queda en error y la pantalla
   muestra `EstadoError`.
5. El toque en «Reintentar» llama a `recargar()`. Este asigna `AsyncLoading` y la pantalla vuelve al esqueleto.
6. `AsyncValue.guard` espera la segunda llamada, que devuelve la ruta. El estado pasa a `AsyncData` con cinco entregas.

```dart
Future<void> recargar() async {
  state = const AsyncLoading();
  state = await AsyncValue.guard(() => ref.read(repositorioProvider).cargar());   // atrapa el error en el estado
}
```

Las dos asignaciones son dos avisos distintos. La primera hace visible que el toque funcionó; la segunda entrega el
resultado. Por eso la salida dice `al tocar Reintentar: esqueleto` y luego `segundo intento: 5 entregas`.

En el `switch` de la pantalla, el orden de los casos es la regla que decide entre vacío y datos. El patrón con `when
lista.isEmpty` va primero porque un patrón general `AsyncData(value: final lista)` también acepta la lista vacía.

```mermaid
stateDiagram-v2
    [*] --> Cargando: build()
    Cargando --> Datos: lista con entregas
    Cargando --> Vacío: lista vacía
    Cargando --> Error: excepción
    Error --> Cargando: Reintentar (guard)
    Datos --> Cargando: recargar()
```

##### 4. Reglas, variantes y casos límite
El reintento automático llegó con Riverpod 3.0. Por defecto reintenta cualquier error salvo los de tipo `Error` y
`ProviderException`. La primera espera es de 200 ms y se duplica en cada intento, hasta 6,4 segundos, con un máximo de
diez reintentos. Lo configuras con `retry` en `ProviderScope`, en `ProviderContainer` o en cada provider.

Esa política explica el fallo descrito en el problema resuelto. `Exception('sin conexión')` no es un `Error`, así que
Riverpod lo reintentaba. Mientras tanto, el estado seguía en «cargando» y el botón «Reintentar» no existía.

El reintento solo actúa cuando falla `build`. Si tú asignas `state` con `guard`, como en `recargar`, el error queda en
el estado y Riverpod no lo repite.

Riverpod 3 también cambió los nombres de lectura. `valueOrNull` pasó a llamarse `value`, que devuelve `null` si todavía
no hay datos. `requireValue` lanza un error si no los hay. En la pantalla prefiere el `switch`: no deja casos sin
mirar.

Un `AsyncLoading` puede llevar el valor anterior. Ocurre cuando `build` se repite porque cambió un provider observado,
o cuando usas `copyWithPrevious`, como en el Paso 5 del laboratorio. Ese estado sigue siendo `AsyncLoading`, no
`AsyncData`, así que el patrón `AsyncData(...)` no lo acepta.

Un último caso límite: el usuario puede salir de la pantalla mientras esperas. En Riverpod 3, usar un `Notifier` ya
destruido lanza un error. Después de un `await` largo, comprueba `ref.mounted` antes de asignar `state`.

En diseño, el esqueleto tiene su propio límite. Si la carga suele tardar menos de unos 300 ms, el esqueleto aparece y
desaparece de golpe. En ese caso es mejor no mostrar nada durante ese tiempo breve.

##### 5. Relación con lo que ya sabes y lo que viene
El `switch` con patrones y las clases selladas vienen del Módulo 0, Tema 6: `AsyncValue` es exactamente ese modelo
aplicado a una carga. `Future`, `async` y `await` vienen del Módulo 0, Tema 3.

Compáralo con el `Notifier` del Tema 3. Allí el estado existía desde el primer instante. Aquí el estado inicial no es
un valor tuyo: es `AsyncLoading`, y Riverpod lo cambia cuando el `Future` termina. Por eso no guardas banderas
`cargando` y `error` aparte: no se pueden contradecir.

Las pantallas de mensaje siguen el sistema de diseño del Módulo 2, Tema 6. El Tema 5 reutiliza `AsyncValue` para el
estado de un envío. El Tema 6 reemplaza el repositorio en una prueba con `overrides`. En el Módulo 5, ese repositorio
llamará a un servidor real.

#### Problema resuelto 4.1
Carga la ruta con un `AsyncNotifier`, diseña los cuatro estados y prueba cada uno con un repositorio falso que
responde lo que la prueba necesita.

**Razonamiento:**
1. El origen de los datos es una interfaz, `RepositorioEntregas`, expuesta por un provider; la app usa la demo y la
   prueba la reemplaza con `overrideWithValue`.
2. La pantalla usa un `switch` con patrones; el caso vacío va antes que el de datos (`when lista.isEmpty`).
3. Vacío y error comparten la misma estructura visual (`_Mensaje`), con distinto ícono y acción.
4. El repositorio falso tarda 500 ms y responde, en orden, lo que se le dio: una lista o un error.
5. La prueba desactiva el reintento automático para ver el error en el primer intento.

```dart
// lib/tema4/carga.dart — AsyncNotifier: cuatro estados de una pantalla que carga datos, cada uno diseñado
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import '../modelo.dart';

/// De dónde salen las entregas. La app real llamará a un servidor (Módulo 5).
abstract interface class RepositorioEntregas {
  Future<List<Entrega>> cargar();
}

class RepositorioDemo implements RepositorioEntregas {
  @override
  Future<List<Entrega>> cargar() async {
    await Future<void>.delayed(const Duration(milliseconds: 800));
    return rutaInicial;
  }
}

final repositorioProvider = Provider<RepositorioEntregas>((ref) => RepositorioDemo());

class EntregasDelDia extends AsyncNotifier<List<Entrega>> {
  @override
  Future<List<Entrega>> build() => ref.watch(repositorioProvider).cargar();   // el estado empieza en «cargando»

  Future<void> recargar() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(repositorioProvider).cargar());   // atrapa el error en el estado
  }
}

final entregasProvider = AsyncNotifierProvider<EntregasDelDia, List<Entrega>>(EntregasDelDia.new);

class PantallaCarga extends ConsumerWidget {
  const PantallaCarga({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final entregas = ref.watch(entregasProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Ruta de hoy')),
      body: switch (entregas) {                                       // un diseño por estado
        AsyncData(value: final lista) when lista.isEmpty => const EstadoVacio(),
        AsyncData(value: final lista) => ListView(
            children: [
              for (final e in lista)
                ListTile(leading: const Icon(Icons.inventory_2_outlined), title: Text(e.guia), subtitle: Text(e.direccion)),
            ],
          ),
        AsyncError() => EstadoError(alReintentar: () => ref.read(entregasProvider.notifier).recargar()),
        _ => const EsqueletoLista(),
      },
    );
  }
}

/// Mientras carga: la forma de la lista, sin datos. El usuario sabe qué va a aparecer.
class EsqueletoLista extends StatelessWidget {
  const EsqueletoLista({super.key});

  @override
  Widget build(BuildContext context) {
    final gris = Theme.of(context).colorScheme.surfaceContainerHighest;
    Widget barra(double ancho, double alto) => Container(
          width: ancho,
          height: alto,
          decoration: BoxDecoration(color: gris, borderRadius: BorderRadius.circular(4)),
        );
    return ListView(
      physics: const NeverScrollableScrollPhysics(),
      children: [
        for (var i = 0; i < 5; i++)
          ListTile(
            leading: CircleAvatar(backgroundColor: gris, radius: 12),
            title: Align(alignment: Alignment.centerLeft, child: barra(90, 14)),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Align(alignment: Alignment.centerLeft, child: barra(160, 12)),
            ),
          ),
      ],
    );
  }
}

class _Mensaje extends StatelessWidget {
  const _Mensaje({required this.icono, required this.titulo, required this.texto, this.accion});
  final IconData icono;
  final String titulo;
  final String texto;
  final Widget? accion;

  @override
  Widget build(BuildContext context) {
    final estilos = Theme.of(context).textTheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icono, size: 56, color: Theme.of(context).colorScheme.outline),
            const SizedBox(height: 16),
            Text(titulo, style: estilos.titleLarge, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(texto, style: estilos.bodyMedium, textAlign: TextAlign.center),
            if (accion != null) ...[const SizedBox(height: 24), accion!],
          ],
        ),
      ),
    );
  }
}

class EstadoVacio extends StatelessWidget {
  const EstadoVacio({super.key});

  @override
  Widget build(BuildContext context) => const _Mensaje(
        icono: Icons.inbox_outlined,
        titulo: 'No tienes entregas hoy',
        texto: 'Cuando el despacho te asigne una ruta, aparecerá aquí.',
      );
}

class EstadoError extends StatelessWidget {
  const EstadoError({super.key, required this.alReintentar});
  final VoidCallback alReintentar;

  @override
  Widget build(BuildContext context) => _Mensaje(
        icono: Icons.cloud_off_outlined,
        titulo: 'No pudimos cargar tu ruta',
        texto: 'Revisa tu conexión. Tus entregas no se perdieron.',
        accion: FilledButton.icon(onPressed: alReintentar, icon: const Icon(Icons.refresh), label: const Text('Reintentar')),
      );
}
```

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:m4/modelo.dart';
import 'package:m4/tema4/carga.dart';
import 'package:material_ui/material_ui.dart';

import 'pantallazo.dart';

/// Repositorio de prueba: responde lo que se le indique, después de una espera.
class RepositorioFalso implements RepositorioEntregas {
  RepositorioFalso(this.respuestas);
  final List<Object> respuestas;                    // una por llamada: una lista o un error
  var llamadas = 0;

  @override
  Future<List<Entrega>> cargar() async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    final r = respuestas[llamadas++];
    if (r is List<Entrega>) return r;
    throw r;
  }
}

Future<void> abrir(WidgetTester tester, RepositorioFalso repo) async {
  tamanoPantalla(tester, tamano: const Size(390, 440));
  await tester.pumpWidget(ProviderScope(
    overrides: [repositorioProvider.overrideWithValue(repo)],      // la pantalla usa el repositorio falso
    retry: (intento, error) => null,                                // sin reintentos automáticos en la prueba
    child: MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorSchemeSeed: Colors.indigo),
      home: const PantallaCarga(),
    ),
  ));
}

String visible(WidgetTester tester) => [
      if (find.byType(EsqueletoLista).evaluate().isNotEmpty) 'esqueleto',
      if (find.byType(EstadoError).evaluate().isNotEmpty) 'error',
      if (find.byType(EstadoVacio).evaluate().isNotEmpty) 'vacío',
      if (find.byType(ListTile).evaluate().isNotEmpty && find.byType(EsqueletoLista).evaluate().isEmpty)
        '${find.byType(ListTile).evaluate().length} entregas',
    ].join(', ');

void main() {
  setUpAll(cargarFuentes);

  testWidgets('cargando y después datos', (tester) async {
    await abrir(tester, RepositorioFalso([rutaInicial]));
    debugPrint('al abrir: ${visible(tester)}');
    await pantallazo('m4-t4-cargando');
    await tester.pump(const Duration(milliseconds: 500));
    debugPrint('a los 500 ms: ${visible(tester)}');
    await pantallazo('m4-t4-datos');
  });

  testWidgets('sin entregas', (tester) async {
    await abrir(tester, RepositorioFalso([<Entrega>[]]));
    await tester.pump(const Duration(milliseconds: 500));
    debugPrint('lista vacía: ${visible(tester)}');
    await pantallazo('m4-t4-vacio');
  });

  testWidgets('error y reintento', (tester) async {
    final repo = RepositorioFalso([Exception('sin conexión'), rutaInicial]);
    await abrir(tester, repo);
    await tester.pump(const Duration(milliseconds: 500));
    debugPrint('primer intento: ${visible(tester)}');
    await pantallazo('m4-t4-error');
    await tester.tap(find.text('Reintentar'));
    await tester.pump();
    debugPrint('al tocar Reintentar: ${visible(tester)}');
    await tester.pump(const Duration(milliseconds: 500));
    debugPrint('segundo intento: ${visible(tester)}; llamadas al repositorio: ${repo.llamadas}');
  });
}
```

```text
$ flutter test test/tema4_test.dart
00:00 +0: loading /home/estudiante/labs/flutter/m4/test/tema4_test.dart
00:00 +0: (setUpAll)
00:00 +0: cargando y después datos
al abrir: esqueleto
a los 500 ms: 5 entregas
00:00 +1: sin entregas
lista vacía: vacío
00:01 +2: error y reintento
primer intento: error
al tocar Reintentar: esqueleto
segundo intento: 5 entregas; llamadas al repositorio: 2
00:01 +3: (tearDownAll)
00:01 +3: All tests passed!
```

![Cuatro estados de la misma pantalla: el esqueleto con cinco filas grises; la lista con cinco entregas; el estado vacío con un ícono de bandeja y el texto No tienes entregas hoy; y el error con una nube tachada, No pudimos cargar tu ruta y el botón Reintentar](content/figures/flutter/m4-t4-estados.png)

**Explicación por partes.**
- Líneas 8–20: la interfaz y su provider. Ningún widget sabe de dónde salen las entregas.
- Línea 24: el estado empieza solo en `AsyncLoading`; no hay que asignarlo.
- Líneas 26–29: `recargar` vuelve a «cargando» para que la persona vea que su toque hizo algo, y `guard` convierte la
  excepción en `AsyncError`.
- Líneas 42–51: un caso del `switch` por estado. El orden importa: `when lista.isEmpty` debe ir antes que el caso
  general de datos.
- En la salida, el segundo intento llamó al repositorio por segunda vez (`llamadas al repositorio: 2`).
- Al escribir este tema, la prueba de error falló primero: sin `retry: ... => null`, la pantalla siguió mostrando el
  esqueleto (`primer intento: esqueleto`) porque Riverpod 3 estaba reintentando solo, y «Reintentar» no existía.

> **Error común.** Un solo diseño para «error» y «vacío». El conductor ve una nube tachada un día sin entregas y llama
> a soporte. Son dos mensajes distintos.

> **Error común.** Mostrar el texto de la excepción (`SocketException: Failed host lookup...`). Al usuario le sirve
> qué pasó en sus palabras y qué puede hacer; el detalle técnico va al registro de errores.

> **Buena práctica.** Diseña los cuatro estados antes de la pantalla con datos. Son los que se olvidan, y los que el
> usuario ve en el peor momento (sin red, en la calle).

> **Prevenir errores.** Prueba cada estado con un repositorio falso, como aquí. Probar contra el servidor real hace
> imposible reproducir el error y el vacío a voluntad.

#### Checkpoint 4.1
¿Por qué `EsqueletoLista` usa `NeverScrollableScrollPhysics`?

Respuesta: porque no hay contenido real que desplazar; si el usuario pudiera arrastrar el esqueleto, parecería una
lista que no responde.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Crea los archivos
Crea `lib/tema4/carga.dart` y `test/tema4_test.dart`.

#### Paso 2 · Ejecuta
Ejecuta `flutter test --update-goldens test/tema4_test.dart` y abre los cuatro pantallazos.

#### Paso 3 · Quita el control de reintentos
Borra la línea `retry: ...` de la prueba y ejecuta solo la prueba de error con
`flutter test test/tema4_test.dart --plain-name "error y reintento"`. Lee qué no encontró.

#### Paso 4 · Recarga deslizando
Envuelve la lista de datos en un `RefreshIndicator(onRefresh: () => ref.read(entregasProvider.notifier).recargar())`.

#### Paso 5 · Conserva los datos al recargar
Cambia `recargar` para usar `state = const AsyncLoading<List<Entrega>>().copyWithPrevious(state)` y muestra la lista
anterior con un indicador arriba mientras recarga.

#### Resumen
- **`AsyncValue`** representa cargando, datos y error en un solo tipo; **`AsyncNotifier`** lo produce.
- Cada estado tiene su diseño: **esqueleto de carga**, lista, **estado vacío** y error con reintento.
- **`AsyncValue.guard`** convierte excepciones en estado; el **reintento automático** de Riverpod 3 se controla con
  `retry`.

#### Ejercicio verificable 1
Básico. ¿Qué muestra la pantalla si el repositorio falso responde `[<Entrega>[]]`?

Respuesta esperada: el estado vacío, como imprime la prueba: `lista vacía: vacío`.

#### Ejercicio verificable 2
Intermedio. En el Paso 3, ¿qué mensaje da la prueba?

Respuesta esperada: `The finder "Found 0 widgets with text "Reintentar": []" (used in a call to "tap()") could not
find any matching widgets.`, después de imprimir `primer intento: esqueleto`.

#### Ejercicio verificable 3
Reto. Si mueves el caso `AsyncData(value: final lista) => ...` antes del caso con `when lista.isEmpty`, ¿qué pasa?

Respuesta esperada: el caso vacío nunca se elige: el primer patrón ya coincide con cualquier lista, también la vacía,
y se muestra una lista en blanco. El analizador avisa que el segundo caso es inalcanzable (`unreachable_switch_case`).

#### En el trabajo
Los estados de carga, vacío y error son parte de cualquier revisión de diseño seria, y en la mayoría de los sistemas
de diseño existen como componentes. En el Módulo 5 el repositorio llamará a un servidor real, y este mismo
`AsyncNotifier` mostrará los errores de red.

</details>

### Tema 5: Formularios: validación por campo y un envío con estado · Intermedio · 50 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- validar cada campo con funciones puras y mostrar el error debajo del campo;
- elegir cuándo validar: al enviar y, después del primer error, mientras el usuario escribe;
- representar el envío (inactivo, enviando, enviado, error) en un provider y bloquear el formulario mientras envía;
- separar el estado que se dibuja (`watch`) de los efectos que se disparan una vez (`listen`).

**Conceptos clave:** `Form` y `TextFormField`, validador, modo de validación automática, `TextEditingController`, efecto con `ref.listen`

#### El problema
El conductor reporta una novedad desde la calle: escribe la guía, un teléfono opcional y qué pasó. Si se equivoca en
el formato de la guía, debe verlo junto al campo, no en un mensaje genérico. Mientras se envía, no debe poder tocar
«Enviar» dos veces, y al terminar necesita una confirmación.

Este tema usa **`Notifier`**, **`ref.watch` y `ref.read`** (Tema 3), **`AsyncValue`** (Tema 4) y **`dispose`**
(Módulo 1, Tema 4).

#### Glosario del tema

**`Form` y `TextFormField`**
- **Definición técnica:** `Form` agrupa campos y expone `FormState` (`validate`, `save`, `reset`) a través de una `GlobalKey<FormState>`; `TextFormField` es un campo de texto que participa en el formulario con su validador.
- **En palabras sencillas:** la planilla y sus casillas, que se revisan juntas.
- **Dónde se rompe la comparación:** el `Form` no guarda los valores; los guardan los controladores o los campos.
- **Ejemplo:** `_clave.currentState!.validate()`.
- **Error típico:** crear la `GlobalKey` dentro de `build`: cada reconstrucción crea un formulario nuevo y se pierden los errores.

**validador**
- **Definición técnica:** función `String? Function(String?)` que devuelve el mensaje de error o `null` si el valor es válido.
- **En palabras sencillas:** la regla de un campo, que contesta «está bien» o «esto falla».
- **Dónde se rompe la comparación:** valida forma, no verdad: `EN-4472` puede tener buen formato y no existir.
- **Ejemplo:** `validarGuia('en-4472')` → `Formato: EN- y de 4 a 6 dígitos`.
- **Error típico:** mensajes como «Campo inválido»: no dicen cómo corregir.

**modo de validación automática**
- **Definición técnica:** `autovalidateMode` del `Form` o del campo; con `onUserInteraction`, cada campo se revalida cuando el usuario cambia su valor.
- **En palabras sencillas:** cuándo se muestran y se borran los errores.
- **Dónde se rompe la comparación:** los campos que el usuario no tocó no muestran error hasta que se llama a `validate()`.
- **Ejemplo:** después de enviar con errores, el error de la guía desaparece al escribir el formato correcto.
- **Error típico:** `always`: el formulario aparece lleno de errores antes de que el usuario escriba nada.

**`TextEditingController`**
- **Definición técnica:** objeto que guarda el texto y la selección de un campo; se crea en el `State` y se libera en `dispose`.
- **En palabras sencillas:** el acceso al texto de un campo desde el código.
- **Dónde se rompe la comparación:** es un `ChangeNotifier`: si no se libera, quedan oyentes registrados.
- **Ejemplo:** `_guia.text.trim()` al enviar.
- **Error típico:** crearlo en `build`: se pierde lo escrito en cada reconstrucción.

**efecto con `ref.listen`**
- **Definición técnica:** `ref.listen(provider, (antes, ahora) {...})` ejecuta una función cuando cambia el provider, sin reconstruir el widget; se usa para acciones de una sola vez.
- **En palabras sencillas:** reaccionar a un cambio en vez de dibujarlo.
- **Dónde se rompe la comparación:** recibe el valor anterior y el nuevo; con ellos se decide si la transición es la que interesa.
- **Ejemplo:** pasar de `AsyncLoading` a `AsyncData` muestra «Novedad enviada».
- **Error típico:** mostrar el `SnackBar` dentro de `build`: aparece cada vez que la pantalla se reconstruye.

#### ► CÓMO FUNCIONA

##### 1. La idea en lenguaje sencillo
En una oficina de correos, el funcionario revisa la planilla antes de recibirla. Si el código postal está mal, te
señala esa casilla, no te devuelve la hoja con un «inválido». Mientras sella el paquete, no te deja entregar otro
igual. Al final te da un comprobante, una sola vez.

El formulario de novedad sigue ese mismo orden. Primero, cada campo revisa su formato y muestra el problema debajo de
sí. Después, si todo está bien, empieza el envío, y durante el envío nada se puede tocar. Al terminar, aparece un aviso
de confirmación que no se repite.

Hay dos clases de estado en juego. El estado de los campos (qué escribió, qué error tiene) vive en el `State` del
formulario. El estado del envío (enviando, enviado, falló) vive en un provider, porque es lógica de la app.

##### 2. Definición formal y vocabulario
**`Form`** es un widget contenedor que agrupa campos de tipo `FormField`. Su estado, `FormState`, se obtiene con una
`GlobalKey<FormState>` y ofrece `validate()`, `save()` y `reset()`. **`TextFormField`** es un `FormField<String>` que
envuelve un `TextField` y se registra solo en el `Form` más cercano.

Un **validador** es una función con la firma `String? Function(String?)`. Recibe el valor del campo y devuelve el texto
del error, o `null` si es válido. Flutter muestra ese texto debajo del campo, con el color de error del tema.

El **modo de validación automática** (`autovalidateMode`) decide cuándo se validan los campos sin llamar a `validate()`.
Con `onUserInteraction`, un campo se valida cada vez que el usuario cambia su valor.

Un **`TextEditingController`** guarda el texto y la selección de un campo. Es un `ValueNotifier<TextEditingValue>`, es
decir, un `ChangeNotifier`. Por eso lo creas en el `State` y lo liberas en `dispose`.

Un **efecto con `ref.listen`** ejecuta una función cuando un provider cambia, sin reconstruir el widget. Recibe el
valor anterior y el nuevo, y es el lugar para acciones únicas, como un `SnackBar`.

##### 3. Cómo funciona por dentro, paso a paso
Sigue la prueba del tema, que primero envía con errores y después corrige:

1. El usuario toca «Enviar novedad». `_enviar` llama a `_clave.currentState!.validate()`.
2. `validate()` recorre los tres campos y ejecuta cada validador con su texto actual. Cada campo guarda su mensaje y se
   reconstruye.
3. Hay errores, así que `validate()` devuelve `false` y `_enviar` termina. La salida lo confirma: `errores visibles: 3 de 3`.
4. El usuario corrige. Como el `Form` usa `onUserInteraction`, cada cambio vuelve a validar ese campo y el error se
   desvanece con una animación.
5. El segundo toque pasa la validación. `_enviar` llama a `enviar` del `Notifier`, que asigna `AsyncLoading`.
6. `ref.watch(envioProvider)` reconstruye el formulario: `enviando` es verdadero, los campos se deshabilitan y
   `onPressed` queda en `null`.
7. Un segundo después, `guard` asigna `AsyncData`. El formulario se reconstruye otra vez, habilitado.
8. En la misma transición, el oyente de `ref.listen` recibe `antes` en `AsyncLoading` y `ahora` en `AsyncData`, y
   muestra «Novedad enviada».

```dart
ref.listen(envioProvider, (antes, ahora) {                      // efectos: avisar, no dibujar
  if (ahora is AsyncData && antes is AsyncLoading) {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Novedad enviada')));
  }
});
```

Observa la condición. No pregunta «¿hay datos?», sino «¿pasó de enviando a enviado?». Así una reconstrucción posterior,
con el estado todavía en `AsyncData`, no repite el aviso.

```mermaid
stateDiagram-v2
    [*] --> Editando
    Editando --> Editando: Enviar con errores (validate = false)
    Editando --> Enviando: Enviar válido
    Enviando --> Enviado: AsyncData → listen: SnackBar
    Enviando --> Error: AsyncError
    Error --> Enviando: Enviar otra vez
```

##### 4. Reglas, variantes y casos límite
`AutovalidateMode` tiene cinco valores en la documentación de Flutter. `disabled` no valida solo. `always` valida
incluso sin interacción, y llena de errores un formulario recién abierto. `onUserInteraction` valida después de cada
cambio del usuario. `onUnfocus` valida cuando el campo pierde el foco. `onUserInteractionIfError` revalida solo los
campos que ya tienen error.

El modo del `Form` aplica a todos sus campos, y cada `TextFormField` puede tener el suyo. Un campo que el usuario nunca
tocó no muestra error con `onUserInteraction`, hasta que llamas a `validate()`.

`FormState` tiene una variante útil: `validateGranularly()`. Valida igual que `validate()`, pero devuelve el conjunto de
campos inválidos. Sirve, por ejemplo, para llevar el foco al primero que falla.

La `GlobalKey<FormState>` se crea una vez, como campo del `State`. Si la creas en `build`, cada reconstrucción crea un
formulario nuevo y pierde los errores. Lo mismo pasa con los controladores, que además deben liberarse en `dispose`.

Un validador valida forma, no verdad. Que `EN-4472` cumpla `^EN-\d{4,6}$` no significa que la guía exista. Esa regla
solo la conoce el servidor, y su respuesta llega como `AsyncError` del envío.

Sobre `ref.listen`, una regla: llámalo en `build` de un `ConsumerWidget` o `ConsumerState`, nunca dentro de un
callback. Riverpod gestiona la suscripción con el ciclo de vida del widget.

Riverpod 3.0 trajo una variante experimental para envíos: `Mutation`, con estados `MutationIdle`, `MutationPending`,
`MutationError` y `MutationSuccess`. Este curso usa `Notifier` con `AsyncValue`, que es estable.

##### 5. Relación con lo que ya sabes y lo que viene
El `dispose` de los controladores es la regla del Módulo 1, Tema 4. El `SnackBar` y el `ScaffoldMessenger` vienen del
Módulo 3, Tema 6. La `GlobalKey` es una de las *keys* del Módulo 1, Tema 5, con un uso nuevo: dar acceso al `State`.

Compáralo con el Tema 4. Allí `AsyncValue` describía una carga que empieza sola. Aquí describe una acción que el
usuario dispara, y por eso hace falta `null` para «todavía no se envió». La diferencia entre `watch` y `listen` es
la misma que en el Tema 3 entre `watch` y `read`: dibujar o actuar.

El Módulo 2, Tema 5, explicó cómo el teclado reduce el espacio; este formulario usa `ListView` para que los campos
sigan alcanzables. En el Módulo 5, el envío simulado se convierte en una petición real, y sus errores tendrán mensajes
propios.

#### Problema resuelto 5.1
Construye el formulario de novedad con tres reglas de validación, un envío simulado de un segundo y su confirmación.
Prueba las reglas sin pantalla y el formulario completo con pantallazos de los errores y del envío.

**Razonamiento:**
1. Las reglas son funciones de nivel superior: se prueban con un `test` simple.
2. El estado del envío es `AsyncValue<void>?`: `null` significa que todavía no se envió.
3. Mientras envía, los campos se deshabilitan y el botón muestra un indicador pequeño en lugar del texto.
4. La prueba avanza el reloj 200 ms antes del pantallazo del envío, para que el indicador ya se vea girando.

```dart
// lib/tema5/formulario.dart — formulario con validación por campo y el estado del envío en un provider
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

/// Reglas de validación: funciones puras, fáciles de probar sin pantalla.
String? validarGuia(String? v) {
  if (v == null || v.trim().isEmpty) return 'Escribe la guía';
  if (!RegExp(r'^EN-\d{4,6}$').hasMatch(v.trim())) return 'Formato: EN- y de 4 a 6 dígitos';
  return null;
}

String? validarTelefono(String? v) {
  if (v == null || v.isEmpty) return null;                          // opcional
  if (!RegExp(r'^\d{10}$').hasMatch(v)) return 'Debe tener 10 dígitos';
  return null;
}

String? validarObservacion(String? v) =>
    (v == null || v.trim().length < 10) ? 'Cuéntanos qué pasó (mínimo 10 caracteres)' : null;

/// El envío: inactivo, enviando, enviado o con error.
class EnvioNovedad extends Notifier<AsyncValue<void>?> {
  @override
  AsyncValue<void>? build() => null;                                // null: todavía no se ha enviado

  Future<void> enviar(String guia, String observacion) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => Future<void>.delayed(const Duration(seconds: 1)));   // simula el servidor
  }
}

final envioProvider = NotifierProvider<EnvioNovedad, AsyncValue<void>?>(EnvioNovedad.new);

class FormularioNovedad extends ConsumerStatefulWidget {
  const FormularioNovedad({super.key});

  @override
  ConsumerState<FormularioNovedad> createState() => _FormularioNovedadState();
}

class _FormularioNovedadState extends ConsumerState<FormularioNovedad> {
  final _clave = GlobalKey<FormState>();
  final _guia = TextEditingController();
  final _telefono = TextEditingController();
  final _observacion = TextEditingController();

  @override
  void dispose() {                                                  // los controladores se liberan
    _guia.dispose();
    _telefono.dispose();
    _observacion.dispose();
    super.dispose();
  }

  void _enviar() {
    if (!_clave.currentState!.validate()) return;                   // muestra los errores y no envía
    ref.read(envioProvider.notifier).enviar(_guia.text.trim(), _observacion.text);
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(envioProvider, (antes, ahora) {                      // efectos: avisar, no dibujar
      if (ahora is AsyncData && antes is AsyncLoading) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Novedad enviada')));
      }
    });
    final enviando = ref.watch(envioProvider) is AsyncLoading;
    return Scaffold(
      appBar: AppBar(title: const Text('Reportar novedad')),
      body: Form(
        key: _clave,
        autovalidateMode: AutovalidateMode.onUserInteraction,       // revalida al escribir, después del primer error
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _guia,
              enabled: !enviando,
              decoration: const InputDecoration(labelText: 'Guía', hintText: 'EN-4472', border: OutlineInputBorder()),
              validator: validarGuia,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _telefono,
              enabled: !enviando,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Teléfono de quien recibe',
                helperText: 'Opcional',
                border: OutlineInputBorder(),
              ),
              validator: validarTelefono,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _observacion,
              enabled: !enviando,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Qué pasó', border: OutlineInputBorder()),
              validator: validarObservacion,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: enviando ? null : _enviar,                   // deshabilitado mientras envía
              child: enviando
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Enviar novedad'),
            ),
          ],
        ),
      ),
    );
  }
}
```

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:m4/tema5/formulario.dart';
import 'package:material_ui/material_ui.dart';

import 'pantallazo.dart';

void main() {
  setUpAll(cargarFuentes);

  test('las reglas, sin pantalla', () {
    for (final guia in ['', 'en-4472', 'EN-44', 'EN-4472']) {
      debugPrint('guía «$guia» → ${validarGuia(guia) ?? 'válida'}');
    }
    debugPrint('teléfono «» → ${validarTelefono('') ?? 'válido'}; «31055» → ${validarTelefono('31055')}');
  });

  testWidgets('enviar con errores, corregir y enviar', (tester) async {
    tamanoPantalla(tester, tamano: const Size(390, 600));
    await tester.pumpWidget(ProviderScope(
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: ThemeData(colorSchemeSeed: Colors.indigo),
        home: const FormularioNovedad(),
      ),
    ));
    final campos = find.byType(TextFormField);

    await tester.enterText(campos.at(0), 'en-4472');
    await tester.enterText(campos.at(1), '31055');
    await tester.tap(find.text('Enviar novedad'));
    await tester.pumpAndSettle();
    final errores = ['Formato: EN- y de 4 a 6 dígitos', 'Debe tener 10 dígitos', 'Cuéntanos qué pasó (mínimo 10 caracteres)'];
    debugPrint('errores visibles: ${errores.where((e) => find.text(e).evaluate().isNotEmpty).length} de 3');
    await pantallazo('m4-t5-errores');

    await tester.enterText(campos.at(0), 'EN-4472');
    await tester.enterText(campos.at(1), '3105551234');
    await tester.enterText(campos.at(2), 'Nadie atendió en la portería');
    await tester.pumpAndSettle();                                  // los errores se desvanecen con una animación
    debugPrint('errores después de corregir: ${errores.where((e) => find.text(e).evaluate().isNotEmpty).length}');

    await tester.tap(find.text('Enviar novedad'));
    await tester.pump();
    final boton = tester.widget<FilledButton>(find.byType(FilledButton));
    debugPrint('enviando: botón ${boton.onPressed == null ? 'deshabilitado' : 'habilitado'}, '
        'indicador ${find.byType(CircularProgressIndicator).evaluate().length}');
    await tester.pump(const Duration(milliseconds: 200));          // el indicador ya giró un poco
    await pantallazo('m4-t5-enviando');

    await tester.pump(const Duration(milliseconds: 800));
    await tester.pump();
    debugPrint('al terminar: ${find.text('Novedad enviada').evaluate().length == 1 ? 'aviso Novedad enviada' : '¿?'}');
  });
}
```

```text
$ flutter test test/tema5_test.dart
00:00 +0: loading /home/estudiante/labs/flutter/m4/test/tema5_test.dart
00:00 +0: (setUpAll)
00:00 +0: las reglas, sin pantalla
guía «» → Escribe la guía
guía «en-4472» → Formato: EN- y de 4 a 6 dígitos
guía «EN-44» → Formato: EN- y de 4 a 6 dígitos
guía «EN-4472» → válida
teléfono «» → válido; «31055» → Debe tener 10 dígitos
00:00 +1: enviar con errores, corregir y enviar
errores visibles: 3 de 3
errores después de corregir: 0
enviando: botón deshabilitado, indicador 1
al terminar: aviso Novedad enviada
00:01 +2: (tearDownAll)
00:01 +2: All tests passed!
```

![Dos momentos del formulario Reportar novedad: a la izquierda, los tres campos en rojo con sus mensajes (Formato: EN- y de 4 a 6 dígitos, Debe tener 10 dígitos y Cuéntanos qué pasó); a la derecha, los campos corregidos y deshabilitados y el botón gris con un indicador girando](content/figures/flutter/m4-t5-formulario.png)

**Explicación por partes.**
- Líneas 6–19: las reglas. El teléfono es opcional: vacío es válido.
- Líneas 22–32: el envío como estado. `AsyncValue.guard` deja listo el caso de error para cuando el envío sea real.
- Líneas 47–53: los tres controladores se liberan en `dispose`.
- Línea 56: si algo falla, `validate()` muestra los errores y la función termina; no hay envío.
- Líneas 62–66: el efecto. Solo la transición de «enviando» a «enviado» muestra el aviso.
- Al escribir este tema, la prueba contaba **1 error** después de corregir los tres campos. El estado del campo ya no
  tenía error (`errorText` era `null`), pero el texto seguía en pantalla: los errores se desvanecen con una animación,
  y la prueba solo había avanzado un cuadro. Con `pumpAndSettle`, el conteo da 0.

> **Error común.** Validar solo en el servidor. El conductor envía, espera, y recibe «datos inválidos» sin saber cuál.
> Valida el formato en la app y deja al servidor las reglas que solo él conoce (que la guía exista).

> **Error común.** Dejar el botón activo durante el envío. Un segundo toque envía dos novedades iguales.

> **Buena práctica.** Marca los campos opcionales («Opcional») en lugar de marcar con asterisco los obligatorios; en
> formularios cortos, la mayoría son obligatorios y el asterisco se vuelve ruido.

> **Prevenir errores.** Prueba las reglas de validación como funciones puras, con casos límite (vacío, minúsculas,
> longitud justa), antes de probarlas en la pantalla.

#### Checkpoint 5.1
¿Por qué el teléfono `31055` falla, pero un teléfono vacío no?

Respuesta: porque `validarTelefono` devuelve `null` si el valor está vacío (campo opcional) y solo exige 10 dígitos
cuando el usuario escribió algo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Crea los archivos
Crea `lib/tema5/formulario.dart` y `test/tema5_test.dart`.

#### Paso 2 · Ejecuta
Ejecuta `flutter test --update-goldens test/tema5_test.dart` y abre los dos pantallazos.

#### Paso 3 · Simula un error de envío
Cambia el envío para que lance `Exception('sin red')` y muestra debajo del botón un texto en `colorScheme.error` cuando
el estado sea `AsyncError`.

#### Paso 4 · Pasa de campo en campo
Agrega `textInputAction: TextInputAction.next` a los dos primeros campos y `onFieldSubmitted: (_) => _enviar()` al
último.

#### Paso 5 · Limpia después de enviar
En el `ref.listen`, cuando el envío termine bien, borra los tres campos con `clear()` y llama a
`_clave.currentState!.reset()`.

#### Resumen
- Un **`Form`** con **`TextFormField`** y un **validador** por campo muestra cada error junto a su campo.
- El **modo de validación automática** `onUserInteraction` borra los errores mientras el usuario corrige.
- Los **`TextEditingController`** se crean en el `State` y se liberan en `dispose`.
- El envío es estado (`watch`); la confirmación es un **efecto con `ref.listen`**.

#### Ejercicio verificable 1
Básico. ¿Qué devuelve `validarGuia(' EN-4472 ')`?

Respuesta esperada: `null` (válida): el validador usa `trim()` antes de comprobar el formato.

#### Ejercicio verificable 2
Intermedio. Con el Paso 3, ¿qué muestra el botón después del error?

Respuesta esperada: vuelve a estar habilitado con el texto «Enviar novedad», porque el estado ya no es `AsyncLoading`;
debajo aparece el mensaje de error y el conductor puede reintentar.

#### Ejercicio verificable 3
Reto. ¿Por qué la condición del `ref.listen` es `ahora is AsyncData && antes is AsyncLoading` y no solo
`ahora is AsyncData`?

Respuesta esperada: para reaccionar solo a la transición de un envío que terminó. Si en el futuro el provider pasa a
`AsyncData` por otra razón (por ejemplo, al restaurar un estado), no debe aparecer «Novedad enviada».

#### En el trabajo
Los formularios son donde más se nota la calidad de una app: errores claros, campos opcionales marcados, botón
bloqueado mientras envía. En las pruebas de usabilidad, los errores mostrados lejos del campo y los envíos dobles
aparecen entre los problemas más frecuentes.

</details>

### Tema 6: Pruebas e inyección: reemplazar dependencias y comparar con Cubit · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- reemplazar una dependencia de un provider en una prueba con `overrides`;
- escribir la misma ruta con Cubit (`flutter_bloc`) y reconstruir una fila por toque con `BlocSelector`;
- explicar la diferencia de tiempo entre las notificaciones de Riverpod y las de Cubit;
- elegir entre Riverpod y Bloc con criterios del equipo, no de moda.

**Conceptos clave:** inyección de dependencias, `overrides`, Cubit, `emit`, `BlocSelector`, notificaciones agrupadas

#### El problema
La ruta debe probarse con datos controlados (una bodega de prueba, una red que falla) sin tocar el código de la app.
Y el equipo que se une al proyecto viene de usar Bloc: ¿cuánto cambia el código, y se comporta igual?

Este tema usa **providers** y **`ProviderContainer`** (Tema 3), **`RepositorioEntregas`** y **`overrideWithValue`**
(Tema 4) y **`Stream`** (Módulo 0, Tema 5).

#### Glosario del tema

**inyección de dependencias**
- **Definición técnica:** dar a un componente las piezas que necesita desde fuera, en lugar de que las cree él mismo, para poder cambiarlas sin modificarlo.
- **En palabras sencillas:** enchufar la pieza que corresponda: la real en la app, la de prueba en la prueba.
- **Dónde se rompe la comparación:** en Riverpod no se pasa por constructor; se declara un provider y se reemplaza en el contenedor.
- **Ejemplo:** `repositorioProvider` devuelve la demo, y la prueba lo reemplaza por `RepositorioFijo`.
- **Error típico:** crear el repositorio dentro del `Notifier` (`RepositorioDemo()`): la prueba no puede cambiarlo.

**`overrides`**
- **Definición técnica:** lista de reemplazos que recibe `ProviderScope` o `ProviderContainer`; cada uno cambia el valor de un provider solo dentro de ese contenedor.
- **En palabras sencillas:** «en esta prueba, este provider vale esto».
- **Dónde se rompe la comparación:** los providers que dependen del reemplazado lo usan automáticamente.
- **Ejemplo:** `repositorioProvider.overrideWithValue(RepositorioFijo())`.
- **Error típico:** reemplazar el `AsyncNotifier` completo en lugar de su dependencia: la prueba deja de probar la lógica real.

**Cubit**
- **Definición técnica:** clase de `bloc` con un estado y métodos que publican el estado nuevo con `emit`; los widgets lo escuchan como un `Stream`.
- **En palabras sencillas:** un `Notifier` al estilo Bloc.
- **Dónde se rompe la comparación:** Bloc completo usa eventos en lugar de métodos; Cubit es su versión simple.
- **Ejemplo:** `RutaCubit.alternar`.
- **Error típico:** no cerrar el Cubit (`close()`); `BlocProvider` lo hace solo, pero uno creado a mano no.

**`emit`**
- **Definición técnica:** método de Cubit que reemplaza el estado y avisa a los oyentes, de inmediato, si el estado nuevo es distinto del actual según `==`.
- **En palabras sencillas:** publicar el estado nuevo.
- **Dónde se rompe la comparación:** como en Riverpod, si el estado es igual al anterior, no avisa.
- **Ejemplo:** tres `alternar` seguidos producen tres avisos: `[4, 3, 4]`.
- **Error típico:** modificar la lista y emitir la misma: `==` es verdadero y no pasa nada.

**`BlocSelector`**
- **Definición técnica:** widget que observa un Cubit, extrae una parte del estado con `selector` y reconstruye su `builder` solo si esa parte cambia.
- **En palabras sencillas:** el `select` de Bloc.
- **Dónde se rompe la comparación:** como `select`, no evita las reconstrucciones que vienen del padre.
- **Ejemplo:** cada `FilaCubit` selecciona su entrega.
- **Error típico:** usar `BlocBuilder` con la ruta completa en cada fila: vuelve a reconstruir todas.

**notificaciones agrupadas**
- **Definición técnica:** Riverpod recalcula los providers derivados y avisa a sus oyentes en el siguiente turno de la cola de eventos; varios cambios en el mismo turno producen un solo aviso con el valor final.
- **En palabras sencillas:** Riverpod espera a que termines de cambiar antes de avisar.
- **Dónde se rompe la comparación:** el `state` del `Notifier` cambia en el momento; lo que se demora es el aviso a los derivados.
- **Ejemplo:** tres cambios seguidos: `avisos antes de ceder el turno = []` y `avisos después = [4]`.
- **Error típico:** probar un derivado justo después de cambiar el estado, sin `await`: el oyente todavía no recibió nada.

#### ► CÓMO FUNCIONA

##### 1. La idea en lenguaje sencillo
Un simulador de vuelo usa la cabina real, con los mismos mandos y las mismas reglas. Lo que cambia es lo que está
enchufado detrás: en lugar de motores y cielo, hay un computador que produce la tormenta que el instructor quiere. Así
se practica una emergencia sin arriesgar un avión.

Probar la ruta funciona igual. La lógica de `EntregasDelDia` es la real. Detrás de ella enchufas un repositorio de
prueba que devuelve una bodega ficticia o falla cuando lo pides. Eso es la inyección de dependencias: quien usa una
pieza no la fabrica, la recibe.

La segunda parte del tema cambia de cabina. Escribes la misma ruta con Cubit, de la familia Bloc, y comparas. La lógica
es idéntica; cambia cuándo y cómo llegan los avisos.

##### 2. Definición formal y vocabulario
La **inyección de dependencias** consiste en entregar a un componente, desde fuera, los objetos que necesita. En
Riverpod no se hace por constructor: la dependencia es un provider (`repositorioProvider`) y quien la usa la lee con
`ref`.

Los **`overrides`** son la lista de reemplazos que recibe un `ProviderScope` o un `ProviderContainer`.
`repositorioProvider.overrideWithValue(RepositorioFijo())` dice: en este contenedor, ese provider vale esto. Todo
provider que dependa de él usa el reemplazo sin cambiar su código.

**Cubit** es una clase del paquete `bloc` que guarda un estado y expone métodos. Cada método publica el estado nuevo
con **`emit`**. Los widgets lo reciben a través de un `Stream`, por medio de `flutter_bloc`. **`BlocSelector`** observa
una parte del estado y reconstruye su `builder` solo si esa parte cambia.

Las **notificaciones agrupadas** describen una diferencia de tiempo. Riverpod no avisa a los oyentes de un derivado en
cada cambio: lo hace en el siguiente turno de la cola de eventos, con el valor final. Cubit, en cambio, produce un
evento por cada `emit`.

##### 3. Cómo funciona por dentro, paso a paso
Primero, la prueba de Riverpod con el repositorio reemplazado:

1. `ProviderContainer.test(overrides: [...])` crea un contenedor. Para él, `repositorioProvider` devuelve
   `RepositorioFijo`.
2. `contenedor.read(entregasProvider.future)` crea `EntregasDelDia` y espera su `build`. Ese `build` lee el
   repositorio reemplazado y carga `[EN-9001]`.
3. Los tres `alternar` cambian `state` de `RutaNotifier` en el momento, uno tras otro.
4. `pendientesProvider` queda marcado como desactualizado, pero su oyente todavía no recibe nada: `avisos antes de
   ceder el turno = []`.
5. Al ceder el turno, Riverpod recalcula el derivado una vez y avisa con el valor final: `[4]`.

Ahora el mismo trabajo con Cubit:

1. `RutaCubit()` arranca con `rutaInicial` como estado.
2. Cada `alternar` llama a `emit`. `emit` compara con `==`; la lista es nueva, así que reemplaza el estado y lo agrega
   al `stream`.
3. Tres `emit` producen tres eventos. La prueba cede el turno para que lleguen y obtiene `[4, 3, 4]`.

```dart
void alternar(String guia) => emit([                              // emit publica el estado nuevo
      for (final e in state)
        e.guia == guia ? e.con(e.estado == Estado.entregada ? Estado.pendiente : Estado.entregada) : e,
    ]);
```

Compara este método con el `alternar` del Tema 3. Solo cambia `state = [...]` por `emit([...])`. El fondo es el mismo:
estado inmutable, una lista nueva por cambio, igualdad para decidir si avisar.

```mermaid
flowchart LR
    subgraph RP["Riverpod"]
        N["RutaNotifier: state = ..."] -->|"fin del turno"| D["pendientesProvider"]
        O["overrides en ProviderContainer"] --> REP["repositorioProvider"]
    end
    subgraph BL["Bloc"]
        C["RutaCubit: emit(...)"] -->|"inmediato"| S["stream → BlocSelector"]
        BP["BlocProvider: crea y cierra"] --> C
    end
```

##### 4. Reglas, variantes y casos límite
La documentación de `bloc` fija las reglas de `emit`. No hace nada si el estado nuevo es igual al actual, salvo que
sea el primer `emit` de esa instancia. Después de `close()`, lanza `StateError('Cannot emit new states after calling
close')`.

`BlocProvider` crea el Cubit con `create` y lo cierra solo cuando su widget sale del árbol. Su variante
`BlocProvider.value` recibe un Cubit que ya existe y no lo cierra: quien lo creó debe cerrarlo. La prueba sin pantalla
crea el Cubit a mano, y por eso llama a `close()` al final.

Bloc tiene dos formas. Cubit expone métodos, como `alternar`. Bloc completo recibe objetos evento (`EntregaAlternada`,
por ejemplo) y los transforma en estados. Los eventos dejan un registro de cada acción, útil cuando el equipo necesita
trazarlas.

En Riverpod, el tiempo de los avisos tiene un caso límite que explica el Checkpoint 6.1. `contenedor.read` de un
derivado lo recalcula al momento; lo que espera al siguiente turno es el aviso a los oyentes. Si la prueba comprueba
un oyente, cede el turno antes.

`overrideWithValue` reemplaza un provider por un valor fijo. Para reemplazarlo por una función que también recibe
`ref`, existe `overrideWith`. Reemplaza las dependencias, no el `AsyncNotifier` que quieres probar: si lo reemplazas,
ya no pruebas su lógica.

Tanto `select` como `BlocSelector` comparan con `==`. Si el selector crea un objeto nuevo en cada llamada sin igualdad
por valor, siempre verá un cambio. Es el mismo error del Tema 3, con otra sintaxis.

##### 5. Relación con lo que ya sabes y lo que viene
El `Stream` de Cubit es el del Módulo 0, Tema 5: suscribirse, recibir eventos y cancelar. La prueba usa
`cubit.stream.listen` y `suscripcion.cancel()` igual que allí.

Este tema cierra el recorrido del módulo. El Tema 1 guardaba el estado en un `State`; el Tema 2 lo sacó a un
`ChangeNotifier`; el Tema 3 lo hizo observable por partes. Cubit se parece más a Riverpod que a `ChangeNotifier`:
publica valores nuevos y los compara, en lugar de avisar «cambié».

El `RepositorioEntregas` del Tema 4 es la costura que permite enchufar otra pieza. En el Módulo 5, esa costura recibe
un cliente HTTP real, y las pruebas siguen usando un repositorio falso. El Módulo 9 profundiza en los dobles de
prueba con mocktail.

#### Problema resuelto 6.1
Escribe la ruta con Cubit y mide las reconstrucciones. Prueba el Cubit y los providers sin pantalla, reemplazando el
repositorio en Riverpod, y compara cuándo llegan los avisos en cada uno.

**Razonamiento:**
1. `RutaCubit` tiene el mismo `alternar`, con `emit` en lugar de `state =`.
2. `BlocSelector` cumple el papel de `select` en el contador y en cada fila.
3. La prueba de Cubit escucha `stream` y cuenta los pendientes de cada estado emitido.
4. La prueba de Riverpod reemplaza el repositorio, espera la carga con `.future` y escucha `pendientesProvider` antes
   y después de ceder el turno con `await Future.delayed(Duration.zero)`.

```dart
// lib/tema6/con_cubit.dart — la misma ruta con Cubit (flutter_bloc): estado que cambia solo con emit
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:material_ui/material_ui.dart';

import '../modelo.dart';
import '../tema1/con_setstate.dart' show ContadorPendientes;

class RutaCubit extends Cubit<List<Entrega>> {
  RutaCubit() : super(rutaInicial);

  void alternar(String guia) => emit([                              // emit publica el estado nuevo
        for (final e in state)
          e.guia == guia ? e.con(e.estado == Estado.entregada ? Estado.pendiente : Estado.entregada) : e,
      ]);
}

class RutaConCubit extends StatelessWidget {
  const RutaConCubit({super.key});

  @override
  Widget build(BuildContext context) => BlocProvider(
        create: (_) => RutaCubit(),                                 // crea el Cubit y lo cierra al salir
        child: Scaffold(
          appBar: AppBar(
            title: const Text('Ruta de hoy'),
            actions: [
              BlocSelector<RutaCubit, List<Entrega>, int>(
                selector: (ruta) => ruta.where((e) => e.estado == Estado.pendiente).length,
                builder: (context, pendientes) => ContadorPendientes(pendientes),
              ),
            ],
          ),
          body: ListView(children: [for (final e in rutaInicial) FilaCubit(e.guia)]),
        ),
      );
}

class FilaCubit extends StatelessWidget {
  const FilaCubit(this.guia, {super.key});
  final String guia;

  @override
  Widget build(BuildContext context) => BlocSelector<RutaCubit, List<Entrega>, Entrega>(
        selector: (ruta) => ruta.firstWhere((e) => e.guia == guia),  // como select de Riverpod
        builder: (context, entrega) {
          anotarConstruccion(guia);
          final hecha = entrega.estado == Estado.entregada;
          return CheckboxListTile(
            value: hecha,
            onChanged: (_) => context.read<RutaCubit>().alternar(guia),
            title: Text(guia, style: hecha ? const TextStyle(decoration: TextDecoration.lineThrough) : null),
            subtitle: Text(entrega.direccion),
          );
        },
      );
}
```

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:m4/modelo.dart';
import 'package:m4/tema3/con_riverpod.dart';
import 'package:m4/tema4/carga.dart';
import 'package:m4/tema6/con_cubit.dart';
import 'package:material_ui/material_ui.dart';

class RepositorioFijo implements RepositorioEntregas {
  @override
  Future<List<Entrega>> cargar() async => const [Entrega('EN-9001', 'Bodega de prueba')];
}

void main() {
  testWidgets('Cubit con BlocSelector', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: RutaConCubit()));
    construcciones.clear();
    await tester.tap(find.text('EN-4472'));
    await tester.pump();
    debugPrint('Cubit: un toque reconstruyó ${totalConstrucciones()} fila $construcciones');
  });

  test('Cubit sin pantalla', () async {
    final cubit = RutaCubit();
    final estados = <int>[];
    final suscripcion = cubit.stream.listen((r) => estados.add(r.where((e) => e.estado == Estado.pendiente).length));
    cubit
      ..alternar('EN-4471')
      ..alternar('EN-4475')
      ..alternar('EN-4471');
    await Future<void>.delayed(Duration.zero);                      // deja pasar los eventos del stream
    debugPrint('Cubit: pendientes en cada emit = $estados');
    await suscripcion.cancel();
    await cubit.close();
  });

  test('Riverpod sin pantalla, con un repositorio reemplazado', () async {
    final contenedor = ProviderContainer.test(
      overrides: [repositorioProvider.overrideWithValue(RepositorioFijo())],   // inyección para la prueba
    );
    final lista = await contenedor.read(entregasProvider.future);
    debugPrint('Riverpod: con el repositorio de prueba carga ${lista.map((e) => e.guia).toList()}');
    final pendientes = <int>[];
    contenedor.listen(pendientesProvider, (_, n) => pendientes.add(n));
    contenedor.read(rutaProvider.notifier)
      ..alternar('EN-4471')
      ..alternar('EN-4475')
      ..alternar('EN-4471');
    debugPrint('Riverpod: avisos antes de ceder el turno = $pendientes');
    await Future<void>.delayed(Duration.zero);                      // Riverpod recalcula los derivados después
    debugPrint('Riverpod: avisos después = $pendientes');
    for (final guia in ['EN-4471', 'EN-4475', 'EN-4471']) {
      contenedor.read(rutaProvider.notifier).alternar(guia);
      await Future<void>.delayed(Duration.zero);
    }
    debugPrint('Riverpod: un cambio por turno = $pendientes');
  });
}
```

```text
$ flutter test test/tema6_test.dart
00:00 +0: loading /home/estudiante/labs/flutter/m4/test/tema6_test.dart
00:00 +0: Cubit con BlocSelector
Cubit: un toque reconstruyó 1 fila {EN-4472: 1}
00:00 +1: Cubit sin pantalla
Cubit: pendientes en cada emit = [4, 3, 4]
00:00 +2: Riverpod sin pantalla, con un repositorio reemplazado
Riverpod: con el repositorio de prueba carga [EN-9001]
Riverpod: avisos antes de ceder el turno = []
Riverpod: avisos después = [4]
Riverpod: un cambio por turno = [4, 3, 4, 5]
00:00 +3: All tests passed!
```

**Explicación por partes.**
- Con `BlocSelector`, un toque reconstruye **1 fila**, igual que Riverpod con `select`.
- Cubit: `[4, 3, 4]`, un aviso por cada `emit`, en el momento.
- Riverpod: los tres cambios en el mismo turno dieron **un solo aviso**, con el valor final (`[4]`). Cuando cada cambio
  cede el turno, llegan todos: `[4, 3, 4, 5]`. Para una pantalla esto es una ventaja: se dibuja una vez, no tres.
- `con el repositorio de prueba carga [EN-9001]`: el `AsyncNotifier` real usó el repositorio reemplazado, sin cambiar
  una línea de la app.

> **Error común.** Mezclar Riverpod y Bloc en la misma app sin una regla. Cada pantalla resuelve el estado distinto y
> el equipo no sabe dónde buscar. Elige uno como predeterminado.

> **Error común.** Probar con el servidor real «porque es más realista». Las pruebas se vuelven lentas, dependen de la
> red y no pueden provocar errores a voluntad. Reemplaza el repositorio.

> **Buena práctica.** Criterio para elegir: Riverpod si quieres estado derivado y reemplazos de dependencias simples;
> Bloc si el equipo ya lo conoce o necesita eventos explícitos y trazables (cada acción como un objeto). Los dos son
> mantenidos y usados en producción.

> **Prevenir errores.** En las pruebas de providers, cede el turno (`await Future<void>.delayed(Duration.zero)`) antes
> de comprobar oyentes de derivados, o lee el derivado con `container.read`, que lo recalcula al momento.

#### Checkpoint 6.1
Si en la prueba de Riverpod lees `contenedor.read(pendientesProvider)` justo después de los tres cambios, sin
`await`, ¿qué valor obtienes?

Respuesta: `4`. `read` recalcula el derivado en ese momento; lo que se demora hasta el final del turno es el aviso a
los oyentes, no el valor.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Crea los archivos
Crea `lib/tema6/con_cubit.dart` y `test/tema6_test.dart`.

#### Paso 2 · Ejecuta
Ejecuta `flutter test test/tema6_test.dart` y compara las líneas de Cubit y de Riverpod.

#### Paso 3 · Reemplaza con un error
Agrega una prueba que reemplace el repositorio por uno que lance `Exception('sin red')`, con
`ProviderContainer.test(overrides: [...], retry: (_, _) => null)`, y comprueba que `entregasProvider` termina en
`AsyncError`.

#### Paso 4 · Agrega el filtro al Cubit
Crea `FiltroCubit` y combina los dos en la pantalla con dos `BlocSelector`. Compara la cantidad de código con el
`guiasVisiblesProvider` del Tema 3.

#### Paso 5 · Usa `bloc_test`
Agrega `bloc_test` como dependencia de desarrollo y reescribe la prueba del Cubit con `blocTest(build: ..., act: ...,
expect: ...)`.

#### Resumen
- La **inyección de dependencias** con **`overrides`** permite probar la lógica real con datos controlados.
- Un **Cubit** cambia el estado con **`emit`**; **`BlocSelector`** observa una parte.
- Riverpod hace **notificaciones agrupadas**; Cubit avisa en cada `emit`.

#### Ejercicio verificable 1
Básico. ¿Qué imprime la prueba de Cubit si se llama a `alternar('EN-4471')` cuatro veces?

Respuesta esperada: `Cubit: pendientes en cada emit = [4, 5, 4, 5]`.

#### Ejercicio verificable 2
Intermedio. Con el Paso 3, ¿qué valor tiene `contenedor.read(entregasProvider)` después de esperar la carga?

Respuesta esperada: un `AsyncError` cuyo `error` es `Exception: sin red`. Para esperarlo, `await
contenedor.read(entregasProvider.future)` lanza la excepción; se captura con `expectLater(...,
throwsA(isA<Exception>()))`.

#### Ejercicio verificable 3
Reto. ¿Qué pasa si `RutaCubit.alternar` recibe una guía que no existe?

Respuesta esperada: `emit` recibe una lista nueva con las mismas entregas; como las listas de Dart no tienen igualdad
por valor, es distinta según `==` y el Cubit avisa igual. Con una clase de estado con igualdad por valor (como
`GuiasVisibles`), no avisaría.

#### En el trabajo
Riverpod y Bloc son las dos opciones que más aparecen en las ofertas de empleo de Flutter, y muchas empresas tienen
código con las dos. Saber traducir entre ellas y explicar sus diferencias con mediciones, como en este tema, es una
ventaja en las entrevistas.

</details>

### Proyecto 21: la ruta del día con estado completo

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

Vas a unir los seis temas en la pantalla principal del conductor: la ruta del día cargada desde un repositorio, con
filtro, contador, marcado de entregas y reporte de novedades, con todos sus estados diseñados y probados sin servidor.

**Qué debe cumplir:**
- El estado de una sola pantalla (una pestaña abierta, un campo con foco) usa `setState`; el estado compartido sale
  del árbol (Temas 1 y 2).
- La ruta, el filtro y los conteos son providers; marcar una entrega reconstruye una sola fila, comprobado con una
  prueba que cuente construcciones (Tema 3).
- La carga tiene sus cuatro estados diseñados, con recarga al deslizar y reintento tras el error (Tema 4).
- El reporte de novedad valida cada campo, bloquea el envío doble y confirma con un efecto (Tema 5).
- Todas las pruebas usan repositorios reemplazados, y una prueba documenta cuándo llegan los avisos (Tema 6).

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

**Pruebas que debes ejecutar y su evidencia esperada:**

| Prueba | Cómo | Evidencia esperada |
|---|---|---|
| Una fila por toque | contar construcciones al marcar una entrega con el filtro «Todas» | `1 fila` |
| Cuatro estados | repositorio falso con lista, vacío y error | un pantallazo por estado y el texto de cada uno |
| Reintento | error y después lista, con `retry: null` | dos llamadas al repositorio y la lista al final |
| Formulario | enviar con errores, corregir y enviar | 3 errores, después 0, botón deshabilitado y aviso final |
| Envío doble | tocar «Enviar» dos veces seguidas | una sola llamada al envío |
| Sin pantalla | `ProviderContainer.test` con reemplazos | el conteo de pendientes y la lista visible esperados |

**Entregables:** el proyecto con sus pruebas; `test/pantallazos/` con los cuatro estados de carga y los dos del
formulario; y `estado.md` con la tabla de qué estado vive dónde (`setState`, provider, derivado) y por qué.

</details>
