# Módulo 0: Fundamentos de Dart

Este módulo establece las bases del lenguaje Dart necesarias para el resto de la ruta Flutter. Los ejemplos se centran en problemas pequeños del dominio de entregas para que cada concepto tenga un propósito observable: modelar datos que pueden faltar, compartir comportamiento, procesar resultados asíncronos, mantener calidad con análisis estático y usar características modernas del lenguaje.

## Antes de comenzar: entorno y verificación

Flutter incluye el SDK de Dart. Para seguir la ruta completa, instala Flutter desde la documentación oficial, agrega `flutter/bin` al `PATH` y valida la instalación con `flutter doctor -v`. Para los ejemplos puramente Dart de este módulo basta con tener `dart` disponible.

Entorno de referencia verificado en esta sesión (2026-11-22):

```bash
dart --version
```

```text
Dart SDK version: 3.14.0 (stable) (Wed Nov 4 16:28:39 2026 -0800) on "macos_arm64"
```

Los ejemplos Dart de este módulo se pueden ejecutar desde cualquier carpeta temporal con `dart run archivo.dart`. Los conceptos de Flutter/UI que aparecen en módulos posteriores requieren emulador o dispositivo; en este módulo se priorizan ejemplos Dart ejecutables por consola.

> **Aviso de versión (Flutter 3.50, 11-11-2026).** Los módulos 0 a 14 importan `package:flutter/material.dart`. Desde Flutter 3.50 esa librería, y `package:flutter/cupertino.dart`, están formalmente obsoletas (*deprecated*, no eliminadas): siguen compilando, pero el analizador mostrará avisos. Su reemplazo son los paquetes `material_ui` y `cupertino_ui` (`import 'package:material_ui/material_ui.dart';`). Puedes migrar después con `dart fix --apply --code=migrate_design_widgets`. Fuente: https://docs.flutter.dev/release/breaking-changes/material-ui-and-cupertino-ui.

## Aprende construyendo

### Tema 1: Sound null safety · Básico · 35 min

Caso guía: modelar una entrega donde el conductor y la foto de confirmación pueden no existir todavía, y obligar al compilador a exigir manejo explícito antes de usar esos valores.

#### Tipos nullable y no nullable

**Definición formal.** En Dart con sound null safety, un tipo `T` representa valores que no pueden ser `null`, mientras que `T?` representa valores del tipo `T` o `null`. El sistema de tipos hace que esta distinción forme parte del contrato estático del programa.

**Para qué sirve.** Sirve para expresar ausencia de valor en el modelo de datos y para que el analizador detecte accesos inseguros antes de ejecutar el programa.

**Cuándo usarlo y cuándo no usarlo.** Usa `T?` cuando la ausencia de valor es un estado válido del dominio, como un conductor aún no asignado. Usa `T` cuando el valor debe existir para que el objeto sea válido, como el identificador de guía. No uses `T?` por comodidad para evitar decisiones de modelo: si un campo siempre debe existir, declararlo nullable oculta errores y obliga a verificaciones innecesarias.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t1_nullable
cd /tmp/dart_t1_nullable
cat > main.dart << 'DART'
class Delivery {
  final String guia;
  final String? conductor;

  Delivery(this.guia, {this.conductor});
}

void main() {
  final entrega = Delivery('RF-4471');
  print(entrega.guia);
  print(entrega.conductor);
}
DART
dart run main.dart
```

**Caso de uso real.** En una app de entregas, la guía existe desde que se crea la orden, pero el conductor se asigna después. Modelar `conductor` como `String?` refleja ese estado intermedio sin usar valores centinela como cadenas vacías.

**Error común.** Declarar un campo como no nullable cuando el dato llega tarde desde la API. Síntoma: el código no compila o se fuerza una inicialización falsa. Causa: el modelo no representa el estado real. Corrección: usar `String?`, `late` solo cuando haya garantía real de inicialización, o un estado de dominio explícito.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
RF-4471
null
```

#### Operadores de acceso seguro y valor por defecto

**Definición formal.** El operador `?.` realiza acceso condicionado a nulidad: si el receptor es `null`, la expresión completa produce `null` en lugar de intentar el acceso. El operador `??` evalúa la expresión derecha solo cuando la izquierda es `null`, proporcionando un valor por defecto.

**Para qué sirve.** Permiten leer o transformar valores opcionales sin escribir condicionales verbosos, manteniendo el manejo de nulidad explícito.

**Cuándo usarlo y cuándo no usarlo.** Usa `?.` cuando la ausencia de valor implica ausencia del resultado derivado. Usa `??` cuando exista un valor por defecto seguro y con sentido de negocio o de presentación. No uses `??` para ocultar datos faltantes que deberían bloquear el flujo; por ejemplo, asignar un conductor ficticio puede provocar decisiones incorrectas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t1_ops
cd /tmp/dart_t1_ops
cat > main.dart << 'DART'
void main() {
  String? apodo;
  print(apodo?.length);
  print(apodo ?? 'Sin apodo');

  apodo = 'Ana';
  print(apodo?.toUpperCase());
  print(apodo ?? 'Sin apodo');
}
DART
dart run main.dart
```

**Caso de uso real.** Al mostrar el nombre del conductor en la UI, `entrega.conductor ?? 'Sin conductor asignado'` evita un fallo y comunica el estado actual.

**Error común.** Usar el operador de aserción nula `!` para silenciar al compilador. Síntoma: `Null check operator used on a null value` en ejecución. Causa: se afirmó que el valor existía sin garantía. Corrección: comprobar nulidad, usar `?.`, `??`, o reestructurar el flujo para que el valor esté garantizado.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
null
Sin apodo
ANA
Ana
```

#### Promoción de tipos por control de flujo

**Definición formal.** La promoción de tipos es el análisis de flujo por el cual el compilador de Dart trata una variable nullable como no nullable dentro de una rama donde se ha comprobado que no es `null`.

**Para qué sirve.** Permite acceder a miembros de un valor opcional con seguridad, sin casts ni aserciones innecesarias, después de una comprobación explícita.

**Cuándo usarlo y cuándo no usarlo.** Úsalo cuando necesites lógica condicional basada en la presencia del valor. Es preferible a `!` en la mayoría de casos. No dependas de promoción cuando la variable pueda ser reasignada por cierres o condiciones que el analizador no pueda garantizar; en esos casos, copia el valor a una variable local final.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t1_promo
cd /tmp/dart_t1_promo
cat > main.dart << 'DART'
void imprimirFoto(String? fotoConfirmacion) {
  if (fotoConfirmacion == null) {
    print('Sin foto de confirmación');
    return;
  }
  print('Foto cargada: ${fotoConfirmacion.toUpperCase()}');
}

void main() {
  imprimirFoto(null);
  imprimirFoto('firma-4471.png');
}
DART
dart run main.dart
```

**Caso de uso real.** Antes de subir o mostrar la foto de confirmación de una entrega, se verifica su presencia y solo entonces se procesa la ruta del archivo.

**Error común.** Comprobar nulidad pero seguir usando otra referencia o una propiedad que el analizador no puede promover. Síntoma: error de compilación "The property ... can't be unconditionally accessed because the receiver can be 'null'". Causa: la promoción aplica a la variable local analizada. Corrección: guardar el valor en una variable local y verificar esa variable.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
Sin foto de confirmación
Foto cargada: FIRMA-4471.PNG
```

### Tema 2: Clases y mixins · Intermedio · 35 min

Caso guía: compartir la capacidad de reportar posición entre `Conductor` y `Vehiculo`, dos entidades que no deberían heredar de una misma clase base solo por esa capacidad.

#### Clases y encapsulación básica

**Definición formal.** Una clase en Dart define un tipo con estado (campos) y comportamiento (métodos). Los constructores crean instancias y `final` en campos indica que la referencia asignada no cambia después de la inicialización.

**Para qué sirve.** Permite modelar entidades del dominio con datos y operaciones cohesionadas, estableciendo invariantes claros.

**Cuándo usarlo y cuándo no usarlo.** Úsala cuando un concepto del dominio tenga identidad, estado o comportamiento propio. No crees clases solo como contenedores de funciones sin estado si una función de nivel superior o una extensión es más simple.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t2_clase
cd /tmp/dart_t2_clase
cat > main.dart << 'DART'
class Conductor {
  final String nombre;
  final String licencia;

  Conductor(this.nombre, this.licencia);

  String descripcion() => '$nombre (licencia $licencia)';
}

void main() {
  final conductor = Conductor('Ana', 'B123');
  print(conductor.descripcion());
}
DART
dart run main.dart
```

**Caso de uso real.** `Conductor`, `Vehiculo` y `Entrega` son entidades con datos y reglas propias dentro de una aplicación logística.

**Error común.** Exponer campos mutables sin control. Síntoma: estado inconsistente desde cualquier parte del código. Causa: ausencia de encapsulación. Corrección: usar `final` cuando sea posible, exponer mutación mediante métodos que validen invariantes.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
Ana (licencia B123)
```

#### Mixins

**Definición formal.** Un mixin es una unidad de reutilización de código que aporta miembros a una clase mediante la cláusula `with`, sin establecer una relación de herencia de tipo padre-hijo como `extends`.

**Para qué sirve.** Permite compartir comportamiento transversal entre clases no relacionadas por jerarquía, evitando herencia múltiple y duplicación.

**Cuándo usarlo y cuándo no usarlo.** Úsalo cuando varias clases necesiten el mismo comportamiento pero no tengan una relación "es un" natural. No uses mixin cuando la relación sea realmente de especialización; en ese caso, `extends` o composición puede ser más claro. Tampoco uses mixins para acumular estado global implícito difícil de rastrear.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t2_mixin
cd /tmp/dart_t2_mixin
cat > main.dart << 'DART'
mixin Rastreable {
  String get idRastreable;
  String reportarPosicion(double lat, double lon) =>
      '$idRastreable en ($lat, $lon)';
}

class Conductor with Rastreable {
  final String nombre;
  Conductor(this.nombre);
  @override
  String get idRastreable => 'conductor:$nombre';
}

class Vehiculo with Rastreable {
  final String placa;
  Vehiculo(this.placa);
  @override
  String get idRastreable => 'vehiculo:$placa';
}

void main() {
  print(Conductor('Ana').reportarPosicion(4.6, -74.1));
  print(Vehiculo('ABC123').reportarPosicion(4.7, -74.0));
}
DART
dart run main.dart
```

**Caso de uso real.** En logística, tanto conductores como vehículos reportan posición GPS. El mixin `Rastreable` evita duplicar esa lógica y no fuerza una herencia artificial entre ambos.

**Error común.** Usar un mixin que depende de miembros no declarados sin expresar el contrato. Síntoma: el mixin asume métodos/campos que la clase no tiene, o el diseño se vuelve frágil. Causa: contrato implícito. Corrección: declarar getters/métodos abstractos en el mixin, o usar `on` para restringir el mixin a tipos que cumplen una interfaz/base.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
conductor:Ana en (4.6, -74.1)
vehiculo:ABC123 en (4.7, -74.0)
```

#### Restricción de mixins con `on`

**Definición formal.** La cláusula `on` en un mixin limita las clases que pueden aplicarlo a aquellas que extienden o implementan el tipo indicado, permitiendo que el mixin acceda de forma segura a miembros de ese tipo.

**Para qué sirve.** Hace explícito el contrato del mixin y permite reutilizar comportamiento que depende de una interfaz o clase base concreta.

**Cuándo usarlo y cuándo no usarlo.** Úsalo cuando el mixin necesite llamar métodos o leer propiedades definidas en un supertipo. No lo uses si el mixin puede ser autónomo; una restricción innecesaria reduce reutilización.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t2_on
cd /tmp/dart_t2_on
cat > main.dart << 'DART'
abstract class Identificable {
  String get id;
}

mixin Auditable on Identificable {
  String auditar(String evento) => '[$id] $evento';
}

class Entrega extends Identificable with Auditable {
  @override
  final String id;
  Entrega(this.id);
}

void main() {
  final entrega = Entrega('RF-4471');
  print(entrega.auditar('ENTREGADA'));
}
DART
dart run main.dart
```

**Caso de uso real.** Un mixin de auditoría puede exigir que la entidad tenga `id`, garantizando que todo evento auditado quede asociado a un identificador.

**Error común.** Aplicar un mixin con `on` a una clase que no cumple el supertipo. Síntoma: error de compilación indicando que la clase no implementa el tipo requerido. Causa: contrato no satisfecho. Corrección: extender/implementar el tipo requerido o rediseñar el mixin para no depender de él.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
[RF-4471] ENTREGADA
```

### Tema 3: Futures, async/await y colecciones funcionales · Intermedio · 40 min

Caso guía: consultar entregas de forma asíncrona, esperar el resultado sin bloquear el isolate, y calcular totales con transformaciones declarativas sobre colecciones.

#### Future y async/await

**Definición formal.** Un `Future<T>` representa un valor o error que estará disponible en el futuro. La palabra clave `async` marca una función que retorna un `Future`, y `await` suspende la ejecución de esa función hasta que el `Future` se completa, sin bloquear el isolate de eventos.

**Para qué sirve.** Permite modelar operaciones de I/O o demora, como consultas a red o disco, manteniendo código secuencial y legible.

**Cuándo usarlo y cuándo no usarlo.** Úsalo para operaciones asíncronas cuyo resultado se necesita antes de continuar. No uses `await` en cadena cuando tareas independientes pueden ejecutarse en paralelo; en ese caso, considera `Future.wait`. No uses `Future` para cómputo CPU-intensivo largo en el mismo isolate, porque la UI o el event loop pueden verse afectados.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t3_future
cd /tmp/dart_t3_future
cat > main.dart << 'DART'
Future<String> obtenerConductor(String guia) async {
  await Future.delayed(Duration(milliseconds: 10));
  return 'Ana';
}

Future<void> main() async {
  print('Consultando...');
  final conductor = await obtenerConductor('RF-4471');
  print('Conductor: $conductor');
}
DART
dart run main.dart
```

**Caso de uso real.** Una pantalla de detalle solicita al backend la información de una entrega y muestra un estado de carga hasta recibir la respuesta.

**Error común.** Olvidar `await` o no retornar/esperar un `Future`. Síntoma: el código continúa antes de tener el dato, aparece `Instance of 'Future<...>'` o se pierden errores. Causa: la operación asíncrona no fue encadenada correctamente. Corrección: usar `await`, retornar el `Future`, o manejarlo explícitamente con `then/catchError` cuando corresponda.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
Consultando...
Conductor: Ana
```

#### Colecciones funcionales: `where`, `map` y `fold`

**Definición formal.** `where` filtra elementos según un predicado y retorna un iterable perezoso. `map` transforma cada elemento en otro valor. `fold` acumula una colección en un único resultado a partir de un valor inicial y una función combinadora.

**Para qué sirve.** Permiten expresar transformaciones de datos de forma declarativa, reduciendo bucles manuales y errores de acumulación.

**Cuándo usarlo y cuándo no usarlo.** Úsalos cuando la transformación sea clara y local. No encadenes transformaciones complejas hasta volver el código ilegible; si la regla es difícil de leer, extrae funciones con nombre o usa un bucle explícito. Ten en cuenta que `where` y `map` son perezosos: no ejecutan trabajo hasta iterar el resultado.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t3_col
cd /tmp/dart_t3_col
cat > main.dart << 'DART'
class Entrega {
  final String guia;
  final double monto;
  final bool completada;
  Entrega(this.guia, this.monto, this.completada);
}

void main() {
  final entregas = [
    Entrega('RF-1', 20.0, true),
    Entrega('RF-2', 15.0, false),
    Entrega('RF-3', 30.0, true),
  ];

  final guiasCompletadas = entregas.where((e) => e.completada).map((e) => e.guia).toList();
  final total = entregas.where((e) => e.completada).fold<double>(0, (acc, e) => acc + e.monto);

  print(guiasCompletadas);
  print(total);
}
DART
dart run main.dart
```

**Caso de uso real.** En un resumen diario, se filtran entregas completadas y se calcula el total cobrado sin modificar la lista original.

**Error común.** Olvidar que `map`/`where` son perezosos y esperar efectos secundarios. Síntoma: no se ejecuta la transformación o no ocurre el efecto esperado. Causa: nadie consumió el iterable. Corrección: usar `toList()`, iterar, o usar un `for` si el objetivo es un efecto secundario.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
[RF-1, RF-3]
50.0
```

#### Manejo de errores asíncronos con `try/catch`

**Definición formal.** En una función `async`, las excepciones lanzadas por un `Future` esperado con `await` pueden capturarse con `try/catch/finally`, igual que en código sincrónico.

**Para qué sirve.** Permite traducir fallos de I/O o de negocio en respuestas controladas, como mostrar un mensaje al usuario o registrar el error.

**Cuándo usarlo y cuándo no usarlo.** Úsalo en límites donde puedas tomar una decisión: reintentar, mostrar error, devolver fallback o propagar. No captures toda excepción solo para ignorarla; eso oculta fallos reales y dificulta el diagnóstico.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t3_err
cd /tmp/dart_t3_err
cat > main.dart << 'DART'
Future<String> cargarEntrega(bool falla) async {
  await Future.delayed(Duration(milliseconds: 10));
  if (falla) throw Exception('timeout de red');
  return 'RF-4471';
}

Future<void> main() async {
  try {
    print(await cargarEntrega(false));
    await cargarEntrega(true);
  } catch (e) {
    print('Error controlado: $e');
  }
}
DART
dart run main.dart
```

**Caso de uso real.** Si la consulta de entregas falla por red, la app puede mostrar un estado de reintento en lugar de cerrar inesperadamente.

**Error común.** Capturar `catch (e)` y continuar como si nada hubiera pasado. Síntoma: la UI queda en estado inconsistente o con datos incompletos. Causa: manejo de error sin recuperación real. Corrección: registrar, transformar la excepción, mostrar estado de error o re-lanzar si no se puede resolver.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
RF-4471
Error controlado: Exception: timeout de red
```

### Tema 4: Lints y estilo con analysis_options.yaml · Intermedio · 35 min

Caso guía: configurar el analizador para detectar problemas de estilo y tipos antes de ejecutar, y corregir automáticamente los que tengan fix seguro.

#### Análisis estático con `analysis_options.yaml`

**Definición formal.** El análisis estático de Dart evalúa código fuente sin ejecutarlo, aplicando reglas de diagnóstico configuradas en `analysis_options.yaml`. Los diagnósticos pueden tener severidad como `info`, `warning` o `error`.

**Para qué sirve.** Detecta problemas temprano: uso de APIs riesgosas, tipos implícitos indeseados, estilo inconsistente o código muerto.

**Cuándo usarlo y cuándo no usarlo.** Úsalo en todo proyecto Dart/Flutter, especialmente en CI. No desactives reglas masivamente solo para silenciar ruido; primero entiende si la regla señala un problema real. Ajusta severidad o exclusiones de forma puntual y documentada.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t4_lints
cd /tmp/dart_t4_lints
cat > pubspec.yaml << 'YAML'
name: dart_t4_lints
environment:
  sdk: ^3.3.0
dev_dependencies:
  lints: ^5.0.0
YAML
cat > analysis_options.yaml << 'YAML'
include: package:lints/recommended.yaml

linter:
  rules:
    prefer_final_locals: true
    avoid_print: false
YAML
mkdir -p lib
cat > lib/main.dart << 'DART'
void main() {
  var ciudad = 'Bogotá';
  print(ciudad);
}
DART
dart pub get >/tmp/dart_t4_pubget.log 2>&1
dart analyze lib/main.dart
```

**Caso de uso real.** En un equipo, `dart analyze` en CI evita que entren cambios con problemas detectables automáticamente.

**Error común.** No incluir un paquete de lints o no ejecutar `dart pub get` después de configurarlo. Síntoma: el analizador no aplica las reglas esperadas o reporta que no encuentra el paquete incluido. Causa: configuración incompleta. Corrección: agregar `lints` o `flutter_lints` en `dev_dependencies`, ejecutar `dart pub get` y validar con `dart analyze`.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22). La salida incluyó el diagnóstico esperado:

```text
Analyzing main.dart...

   info - lib/main.dart:2:7 - The local variable 'ciudad' starts with 'var'. The type of the local variable should be prefixed with 'final'. Try adding the 'final' keyword. - prefer_final_locals

1 issue found.
```

#### Corrección automática con `dart fix`

**Definición formal.** `dart fix` aplica correcciones automáticas sugeridas por el analizador para diagnósticos que tienen fix disponible. Con `--dry-run` muestra los cambios posibles; con `--apply` los escribe.

**Para qué sirve.** Reduce trabajo mecánico y acelera la adopción de reglas o migraciones.

**Cuándo usarlo y cuándo no usarlo.** Úsalo para correcciones seguras y repetitivas, como agregar `final`, quitar imports no usados o migraciones soportadas. No lo apliques ciegamente en cambios masivos sin revisar el diff, especialmente en migraciones amplias.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t4_fix
cd /tmp/dart_t4_fix
cat > pubspec.yaml << 'YAML'
name: dart_t4_fix
environment:
  sdk: ^3.3.0
dev_dependencies:
  lints: ^5.0.0
YAML
cat > analysis_options.yaml << 'YAML'
include: package:lints/recommended.yaml
linter:
  rules:
    prefer_final_locals: true
YAML
mkdir -p lib
cat > lib/main.dart << 'DART'
void main() {
  var ciudad = 'Bogotá';
  print(ciudad);
}
DART
dart pub get >/tmp/dart_t4_fix_pubget.log 2>&1
dart fix --dry-run
```

**Caso de uso real.** Al activar una regla nueva en un repositorio existente, `dart fix --apply` puede normalizar gran parte del código antes de la revisión humana.

**Error común.** Esperar que `dart fix` resuelva todos los diagnósticos. Síntoma: quedan issues tras aplicar fixes. Causa: no todos los lint tienen corrección automática o la corrección requiere decisión de diseño. Corrección: revisar los issues restantes y corregirlos manualmente.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22). `dart fix --dry-run` reportó:

```text
Computing fixes in dart_t4_fix (dry run)...

1 proposed fix in 1 file.

lib/main.dart
  prefer_final_locals - 1 fix
```

#### Severidad y endurecimiento de reglas

**Definición formal.** La configuración del analizador puede elevar o cambiar la severidad de diagnósticos en `analyzer.errors` y activar reglas adicionales en `linter.rules`. También puede habilitar modos más estrictos de análisis de tipos.

**Para qué sirve.** Permite adaptar el estándar de calidad al contexto del proyecto, haciendo que ciertas violaciones bloqueen el CI.

**Cuándo usarlo y cuándo no usarlo.** Úsalo para reglas que protejan invariantes importantes del equipo. No conviertas todo en error desde el inicio en una base legacy grande; aumenta la exigencia gradualmente para no bloquear entregas sin plan de remediación.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t4_error
cd /tmp/dart_t4_error
cat > pubspec.yaml << 'YAML'
name: dart_t4_error
environment:
  sdk: ^3.3.0
dev_dependencies:
  lints: ^5.0.0
YAML
cat > analysis_options.yaml << 'YAML'
include: package:lints/recommended.yaml
analyzer:
  errors:
    avoid_print: error
linter:
  rules:
    avoid_print: true
YAML
mkdir -p lib
cat > lib/main.dart << 'DART'
void main() {
  print('debug');
}
DART
dart pub get >/tmp/dart_t4_error_pubget.log 2>&1
dart analyze lib/main.dart || true
```

**Caso de uso real.** Un proyecto puede prohibir `print` en código de producción y forzar uso de un logger estructurado.

**Error común.** Subir severidad sin alinear al equipo ni al pipeline. Síntoma: el código compila localmente según costumbre, pero CI falla. Causa: política de análisis no compartida. Corrección: versionar `analysis_options.yaml`, documentar reglas clave y ejecutar `dart analyze` en CI.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22). El diagnóstico fue reportado como error:

```text
Analyzing main.dart...

  error - lib/main.dart:2:3 - Don't invoke 'print' in production code. Try using a logging framework. - avoid_print

1 issue found.
```

### Tema 5: Streams en Dart: secuencias de eventos asíncronos con await for y StreamController · Intermedio · 40 min

Caso guía: consumir posiciones GPS emitidas a lo largo del tiempo, filtrar las relevantes y cancelar la suscripción cuando la pantalla ya no las necesita.

#### Stream y consumo con `await for`

**Definición formal.** Un `Stream<T>` representa una secuencia asíncrona de cero o más eventos de tipo `T`, posiblemente seguida de error o finalización. `await for` consume esos eventos en orden, esperando cada uno sin bloquear el isolate.

**Para qué sirve.** Modela fuentes de datos que llegan con el tiempo: ubicación, mensajes, eventos de UI, sockets o cambios en base de datos.

**Cuándo usarlo y cuándo no usarlo.** Úsalo cuando haya múltiples valores a lo largo del tiempo. No uses `Stream` cuando solo necesitas un único resultado futuro; en ese caso, `Future` es más simple. Tampoco uses `await for` si necesitas control fino de pausa/cancelación en medio de lógica más compleja; `listen` puede ser más adecuado.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t5_stream
cd /tmp/dart_t5_stream
cat > main.dart << 'DART'
Stream<double> posiciones() async* {
  var lat = 4.55;
  for (var i = 0; i < 4; i++) {
    await Future.delayed(Duration(milliseconds: 10));
    lat += 0.02;
    yield lat;
  }
}

Future<void> main() async {
  await for (final lat in posiciones()) {
    print(lat.toStringAsFixed(2));
  }
}
DART
dart run main.dart
```

**Caso de uso real.** Un mapa de entregas puede escuchar actualizaciones de posición del conductor cada pocos segundos.

**Error común.** Usar `await for` en un stream que nunca termina sin estrategia de salida. Síntoma: la función queda esperando indefinidamente. Causa: el stream es infinito o no se cierra. Corrección: limitar con condiciones, `take`, timeout, o cancelar la suscripción según el caso.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
4.57
4.59
4.61
4.63
```

#### Transformación de streams

**Definición formal.** Los streams exponen operadores como `where`, `map`, `take` y `asyncMap` que producen nuevos streams transformados a partir de los eventos recibidos.

**Para qué sirve.** Permite filtrar y adaptar eventos antes de consumirlos, separando la fuente de datos de la lógica de presentación o negocio.

**Cuándo usarlo y cuándo no usarlo.** Úsalo para transformaciones simples y componibles. No pongas lógica pesada o con efectos secundarios ocultos dentro de transformaciones encadenadas sin control; puede dificultar depuración y manejo de errores.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t5_map
cd /tmp/dart_t5_map
cat > main.dart << 'DART'
Stream<double> posiciones() async* {
  var lat = 4.55;
  for (var i = 0; i < 4; i++) {
    await Future.delayed(Duration(milliseconds: 10));
    lat += 0.02;
    yield lat;
  }
}

Future<void> main() async {
  final enZona = posiciones().where((lat) => lat < 4.62).map((lat) => 'lat ${lat.toStringAsFixed(2)}');
  await for (final texto in enZona) {
    print(texto);
  }
}
DART
dart run main.dart
```

**Caso de uso real.** Filtrar coordenadas fuera de la zona operativa antes de pintarlas en pantalla.

**Error común.** Asumir que `where` o `map` consumen el stream inmediatamente. Síntoma: parece que "no pasa nada". Causa: los operadores son perezosos. Corrección: escuchar el stream resultante con `await for`, `listen` o un operador terminal.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
lat 4.57
lat 4.59
lat 4.61
```

#### `StreamController` y cancelación de suscripción

**Definición formal.** `StreamController<T>` es un objeto que permite crear y controlar un stream imperativamente, agregando eventos con `add`, errores con `addError` y cerrándolo con `close`. La suscripción retornada por `listen` puede cancelarse con `cancel`.

**Para qué sirve.** Es útil para adaptar fuentes de eventos imperativas o para exponer un stream desde una clase que controla cuándo se emiten eventos.

**Cuándo usarlo y cuándo no usarlo.** Úsalo cuando no puedas expresar la fuente naturalmente con `async*` o cuando necesites control manual. No lo uses por defecto si `async*` es suficiente; el controlador manual exige cerrar y gestionar ciclos de vida. Siempre cancela suscripciones y cierra controladores cuando ya no se necesitan.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t5_ctrl
cd /tmp/dart_t5_ctrl
cat > main.dart << 'DART'
import 'dart:async';

Future<void> main() async {
  final controller = StreamController<int>();
  final recibidos = <int>[];

  final sub = controller.stream.listen(recibidos.add);
  controller.add(1);
  controller.add(2);
  await Future.delayed(Duration(milliseconds: 10));
  await sub.cancel();
  await controller.close();

  print(recibidos);
}
DART
dart run main.dart
```

**Caso de uso real.** Un servicio de ubicación puede exponer un `Stream` y cancelar la suscripción cuando el usuario sale de la pantalla, evitando trabajo y fugas de memoria.

**Error común.** No cancelar la suscripción o no cerrar el `StreamController`. Síntoma: fugas de memoria, callbacks ejecutándose después de salir de una pantalla, o tests que no terminan. Causa: ciclo de vida no gestionado. Corrección: guardar la `StreamSubscription`, llamar `cancel` en `dispose`/limpieza y cerrar el controlador cuando corresponda.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
[1, 2]
```

### Tema 6: Records y patterns en Dart: varios valores sin clases y switch exhaustivo · Intermedio · 40 min

Caso guía: devolver cotización con múltiples valores sin crear una clase ceremonial y modelar estados de envío con un `switch` que el compilador obliga a cubrir por completo.

#### Records

**Definición formal.** Un record es un valor compuesto, inmutable y tipado estructuralmente que agrupa múltiples campos posicionales y/o nombrados. En Dart se escribe con paréntesis, por ejemplo `(int, int)` o `({int centavos, int minutos})`.

**Para qué sirve.** Permite retornar o agrupar varios valores relacionados sin definir una clase adicional cuando no se necesita identidad nominal ni comportamiento extenso.

**Cuándo usarlo y cuándo no usarlo.** Úsalo para resultados locales, múltiples retornos y agrupaciones pequeñas y claras. No lo uses cuando el concepto del dominio merece nombre, validaciones, métodos o evolución independiente; en ese caso, una clase o tipo dedicado comunica mejor la intención.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t6_record
cd /tmp/dart_t6_record
cat > main.dart << 'DART'
({int centavos, int minutos}) cotizar(int kilos) =>
    (centavos: 1000 + kilos * 120, minutos: 30 + kilos * 5);

void main() {
  final resultado = cotizar(2);
  print(resultado.centavos);
  print(resultado.minutos);
}
DART
dart run main.dart
```

**Caso de uso real.** Una función de cotización puede devolver precio y tiempo estimado sin crear una clase `Cotizacion` si el valor solo se usa localmente.

**Error común.** Usar records posicionales largos donde el orden es ambiguo. Síntoma: llamadas como `(1200, 40)` difíciles de leer y propensas a inversión de campos. Causa: falta de nombres. Corrección: usar campos nombrados en el record o crear una clase.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
1240
40
```

#### Patterns y desestructuración

**Definición formal.** Los patterns permiten hacer coincidir y desestructurar valores según su forma. En Dart se usan en declaraciones, asignaciones, `if case`, `for` y `switch`, extrayendo partes del valor en variables locales.

**Para qué sirve.** Reduce código repetitivo al validar estructura y extraer datos en un solo paso.

**Cuándo usarlo y cuándo no usarlo.** Úsalo cuando la forma del dato sea conocida y quieras extraer campos con claridad. No fuerces patterns complejos si un acceso simple por propiedad es más legible. En datos externos, valida la estructura antes de asumirla.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t6_pattern
cd /tmp/dart_t6_pattern
cat > main.dart << 'DART'
({int centavos, int minutos}) cotizar(int kilos) =>
    (centavos: 1000 + kilos * 120, minutos: 30 + kilos * 5);

void main() {
  final (:centavos, :minutos) = cotizar(2);
  print('tarifa $centavos centavos, $minutos minutos');

  final json = {'codigo': 'ENV-42', 'kilos': 2};
  if (json case {'codigo': String codigo, 'kilos': int kilos} when kilos > 0) {
    print('JSON válido: $codigo con $kilos kg');
  }
}
DART
dart run main.dart
```

**Caso de uso real.** Al validar un payload JSON simple, `if case` permite comprobar forma, tipos y condición de negocio en una sola expresión.

**Error común.** Asumir que un `Map` externo tiene la forma esperada. Síntoma: `TypeError` o datos mal interpretados. Causa: falta de validación. Corrección: usar patterns con chequeos de tipo/guardas, o validar explícitamente antes de convertir.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
tarifa 1240 centavos, 40 minutos
JSON válido: ENV-42 con 2 kg
```

#### `sealed class` y `switch` exhaustivo

**Definición formal.** Una clase `sealed` restringe su jerarquía de subtipos al mismo ámbito de biblioteca, permitiendo al compilador conocer todos los casos posibles. Un `switch` exhaustivo sobre esa jerarquía debe cubrir todos los subtipos.

**Para qué sirve.** Modela estados o variantes cerradas y hace que agregar un nuevo caso obligue a actualizar los puntos de decisión.

**Cuándo usarlo y cuándo no usarlo.** Úsalo para estados de dominio finitos y conocidos, como estados de envío. No uses `sealed` cuando la jerarquía deba ser extensible por bibliotecas externas; en ese caso, un tipo abierto o otra estrategia es más apropiada.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t6_sealed
cd /tmp/dart_t6_sealed
cat > main.dart << 'DART'
sealed class EstadoEnvio {}
class Creado extends EstadoEnvio {}
class EnRuta extends EstadoEnvio { EnRuta(this.parada); final int parada; }
class Entregado extends EstadoEnvio { Entregado(this.firma); final String? firma; }

String describir(EstadoEnvio estado) => switch (estado) {
  Creado() => 'esperando recogida',
  EnRuta(parada: 1) => 'saliendo de bodega',
  EnRuta(:final parada) => 'en ruta, parada $parada',
  Entregado(firma: null) => 'entregado sin firma: revisar',
  Entregado(:final firma?) => 'entregado, firmó $firma',
};

void main() {
  for (final e in [Creado(), EnRuta(1), EnRuta(4), Entregado(null), Entregado('Ana')]) {
    print(describir(e));
  }
}
DART
dart run main.dart
```

**Caso de uso real.** El estado de un envío puede representarse como variantes cerradas para que la UI y la lógica de negocio manejen todos los casos.

**Error común.** Agregar un nuevo subtipo a una jerarquía sellada y olvidar actualizar un `switch`. Síntoma: error de compilación por switch no exhaustivo. Causa: el compilador detecta el caso faltante. Corrección: agregar el caso nuevo; este error es deseable porque evita omisiones silenciosas.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
esperando recogida
saliendo de bodega
en ruta, parada 4
entregado sin firma: revisar
entregado, firmó Ana
```

### Tema 7: Extension methods y extension types: agregar comportamiento sin heredar · Intermedio · 35 min

Caso guía: formatear montos y validar códigos de envío con tipos más expresivos, sin forzar herencia ni wrappers costosos en tiempo de ejecución.

#### Extension methods

**Definición formal.** Un extension method agrega miembros sintácticos a un tipo existente dentro del ámbito donde la extensión está visible. No modifica la clase original ni agrega estado en tiempo de ejecución; es azúcar estática resuelta por el compilador.

**Para qué sirve.** Mejora la legibilidad al colocar operaciones comunes cerca del tipo que las usa, como formateo o conversiones.

**Cuándo usarlo y cuándo no usarlo.** Úsalo para utilidades puras y descubribles. No lo uses para ocultar lógica de dominio importante en extensiones dispersas, ni para agregar comportamiento que dependa de estado que el tipo no posee. Si la operación es central al dominio, puede merecer un tipo propio.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t7_ext
cd /tmp/dart_t7_ext
cat > main.dart << 'DART'
extension Pesos on int {
  String get comoPesos =>
      '\$${toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+$)'), (_) => '.')}';
}

void main() {
  print(52000.comoPesos);
}
DART
dart run main.dart
```

**Caso de uso real.** Formatear montos en pesos colombianos en vistas o logs sin repetir la expresión regular en cada punto.

**Error común.** Definir extensiones con nombres o comportamientos ambiguos, o esperar despacho dinámico polimórfico. Síntoma: se llama un método inesperado o el método no se resuelve. Causa: las extensiones se resuelven estáticamente según el tipo estático y el import visible. Corrección: nombrar extensiones claramente, importarlas explícitamente y no usarlas como sustituto de polimorfismo.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
$52.000
```

#### Extension types

**Definición formal.** Un extension type en Dart crea un tipo estático distinto que envuelve una representación en tiempo de compilación, pero normalmente se borra a la representación subyacente en tiempo de ejecución. Puede agregar validación y miembros sin el costo de un objeto wrapper adicional.

**Para qué sirve.** Aporta seguridad de tipos y semántica de dominio sobre tipos primitivos o existentes, como IDs, códigos o unidades.

**Cuándo usarlo y cuándo no usarlo.** Úsalo cuando quieras distinguir valores con el mismo tipo subyacente, por ejemplo `CodigoEnvio` frente a `String`. No lo uses cuando necesites identidad de objeto independiente, mutabilidad encapsulada compleja o invariantes que deban sobrevivir a cualquier conversión implícita; una clase puede ser más adecuada.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t7_type
cd /tmp/dart_t7_type
cat > main.dart << 'DART'
extension type CodigoEnvio._(String valor) {
  factory CodigoEnvio(String texto) {
    if (!RegExp(r'^ENV-\d+$').hasMatch(texto)) {
      throw FormatException('código inválido: $texto');
    }
    return CodigoEnvio._(texto);
  }

  int get numero => int.parse(valor.substring(4));
  String get raw => valor;
}

String etiqueta(CodigoEnvio codigo, String cliente) => '${codigo.raw} para $cliente';

void main() {
  final codigo = CodigoEnvio('ENV-42');
  print(etiqueta(codigo, 'Ana'));
  print(codigo.numero);
}
DART
dart run main.dart
```

**Caso de uso real.** Evita pasar un `String` cualquiera donde se espera un código de envío válido, reduciendo errores de argumentos invertidos o formatos inválidos.

**Error común.** Creer que un extension type siempre impone validación en toda entrada. Síntoma: se construye un valor inválido si se omite el constructor/fábrica de validación o se usa la representación de forma insegura. Causa: el tipo se basa en una representación subyacente. Corrección: centralizar la construcción en fábricas validadoras y exponer APIs que preserven invariantes.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
ENV-42 para Ana
42
```

#### Validación y manejo de errores en extension types

**Definición formal.** Un extension type puede exponer constructores/fábricas que validen la representación antes de crear el valor tipado, lanzando excepciones como `FormatException` cuando el dato no cumple el contrato.

**Para qué sirve.** Permite fallar temprano ante datos inválidos y concentrar la regla de formato en un único punto.

**Cuándo usarlo y cuándo no usarlo.** Úsalo en límites donde los datos entran al sistema o se convierten desde texto/JSON. No uses excepciones de formato para control de flujo normal esperado en grandes volúmenes; si el caso inválido es frecuente, considera una API que retorne `null` o un resultado tipado.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/dart_t7_valid
cd /tmp/dart_t7_valid
cat > main.dart << 'DART'
extension type CodigoEnvio._(String valor) {
  factory CodigoEnvio(String texto) {
    if (!RegExp(r'^ENV-\d+$').hasMatch(texto)) {
      throw FormatException('código inválido: $texto');
    }
    return CodigoEnvio._(texto);
  }
  String get raw => valor;
}

void main() {
  try {
    CodigoEnvio('42');
  } on FormatException catch (e) {
    print(e.message);
  }
}
DART
dart run main.dart
```

**Caso de uso real.** Al importar códigos desde un CSV, la validación temprana permite reportar filas inválidas antes de persistir datos corruptos.

**Error común.** Atrapar la excepción y continuar sin registrar qué valor falló. Síntoma: datos rechazados silenciosamente. Causa: manejo incompleto. Corrección: incluir el valor/contexto en el error, registrar y decidir si abortar, saltar o acumular errores.

**Verificación/Evidencia.** Ejecución real en Dart 3.14.0 (2026-11-22):

```text
código inválido: 42
```
