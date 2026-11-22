# Módulo 17: Compose profesional — layouts, formularios, listas y efectos

## Aprende construyendo

Este módulo convierte el conocimiento inicial de Compose en una interfaz mantenible.
Trabajarás sobre RutaFlow y separarás estado, presentación, interacción y efectos. Cada
tema deja una prueba observable; una captura bonita no sustituye comportamiento correcto.


### Tema 1: Constraints, Modifier y componentes con slots · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás explicar el ciclo medir–dimensionar–colocar, ordenar modificadores sin resultados accidentales y diseñar un componente por slots. Abre academia-android y crea el paquete com.academia.ui.componentes. Prerrequisitos: Compose básico del Módulo 2.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás explicar el ciclo medir–dimensionar–colocar, ordenar modificadores sin resultados accidentales y diseñar un componente por slots.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en constraints, modifier y componentes con slots como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    P[Padre envía constraints] --> M[Hijo mide]
    M --> T[Elige tamaño permitido]
    T --> U[Padre coloca]
    U --> D[Dibujo, semántica e interacción]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Constraints, Modifier y componentes con slots se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Constraints, Modifier y componentes con slots | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses constraints, modifier y componentes con slots por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: constraints, modifier y componentes con slots funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Constraints, Modifier y componentes con slots existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve constraints, modifier y componentes con slots en tu contexto?
2. ¿Cómo sabrías que constraints, modifier y componentes con slots no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar constraints, modifier y componentes con slots?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    P[Padre envía constraints] --> M[Hijo mide]
    M --> T[Elige tamaño permitido]
    T --> U[Padre coloca]
    U --> D[Dibujo, semántica e interacción]
```

```kotlin
@Composable
fun EntregaCard(
    titulo: String,
    modifier: Modifier = Modifier,
    estado: @Composable RowScope.() -> Unit,
    acciones: @Composable RowScope.() -> Unit,
) {
    Card(modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(titulo, style = MaterialTheme.typography.titleMedium)
            Row(content = estado)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), content = acciones)
        }
    }
}
```

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
./gradlew :app:test
./gradlew :app:assembleDebug
```

</details>

### Tema 2: LazyColumn, grids, claves estables y estado de scroll · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás renderizar colecciones grandes, preservar identidad al reordenar y medir rendimiento en release. Crea ui/entregas/ListaEntregas.kt; necesitas estado inmutable. Prerrequisitos: colecciones Kotlin y Paging del Módulo 16.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás renderizar colecciones grandes, preservar identidad al reordenar y medir rendimiento en release.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
`LazyColumn` y `LazyVerticalGrid` reciben un DSL. `key` debe ser única y estable; el
índice no lo es si insertas u ordenas. `contentType` permite reutilizar composiciones
entre estructuras equivalentes. `rememberLazyListState` conserva posición durante
recomposición; `rememberSaveable` o ViewModel cubren recreación según el requisito.
`derivedStateOf` reduce cambios observables y `snapshotFlow` convierte lecturas Compose
en Flow para telemetría. **Analogía:** una biblioteca trae a la mesa los libros visibles,
pero cada ejemplar conserva su ISBN aunque cambie de estante.

```mermaid
flowchart TD
    A[Colección de entregas] --> B[Viewport y margen]
    B --> C[Items compuestos]
    A --> D{Clave estable}
    D -->|id| E[Estado y animación siguen la entidad]
    D -->|índice| F[Estado salta al reordenar]
```

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    A[Colección de entregas] --> B[Viewport y margen]
    B --> C[Items compuestos]
    A --> D{Clave estable}
    D -->|id| E[Estado y animación siguen la entidad]
    D -->|índice| F[Estado salta al reordenar]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| LazyColumn, grids, claves estables y estado de scroll se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar LazyColumn, grids, claves estables y estado de scroll | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses lazycolumn, grids, claves estables y estado de scroll por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: lazycolumn, grids, claves estables y estado de scroll funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- LazyColumn, grids, claves estables y estado de scroll existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve lazycolumn, grids, claves estables y estado de scroll en tu contexto?
2. ¿Cómo sabrías que lazycolumn, grids, claves estables y estado de scroll no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar lazycolumn, grids, claves estables y estado de scroll?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    A[Colección de entregas] --> B[Viewport y margen]
    B --> C[Items compuestos]
    A --> D{Clave estable}
    D -->|id| E[Estado y animación siguen la entidad]
    D -->|índice| F[Estado salta al reordenar]
```

```kotlin
@Composable
fun ListaEntregas(entregas: List<Entrega>, onAbrir: (String) -> Unit) {
    val estado = rememberLazyListState()
    val mostrarSubir by remember { derivedStateOf { estado.firstVisibleItemIndex > 5 } }
    Box {
        LazyColumn(state = estado) {
            items(entregas, key = { it.id }, contentType = { "entrega" }) { entrega ->
                EntregaCard(entrega.titulo, Modifier.animateItem(),
                    estado = { Text(entrega.estado) },
                    acciones = { Button({ onAbrir(entrega.id) }) { Text("Abrir") } })
            }
        }
        if (mostrarSubir) Text("Volver arriba", Modifier.align(Alignment.BottomEnd))
    }
}
```

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
./gradlew :app:test
./gradlew :app:assembleRelease
```

</details>

### Tema 3: Formularios, IME, foco y validación accesible · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás modelar valor, error y envío; configurar teclado y foco; y conservar un borrador sin mezclar validación con widgets. Crea ui/entregas/EditarEntrega.kt. Prerrequisitos: state hoisting, ViewModel y SavedStateHandle.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás modelar valor, error y envío; configurar teclado y foco; y conservar un borrador sin mezclar validación con widgets.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en formularios, ime, foco y validación accesible como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
stateDiagram-v2
    [*] --> Editando
    Editando --> Enviando: envío válido
    Enviando --> Guardado: respuesta aceptada
    Enviando --> Error: timeout o rechazo
    Error --> Editando: corregir sin perder texto
    Guardado --> [*]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Formularios, IME, foco y validación accesible se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Formularios, IME, foco y validación accesible | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses formularios, ime, foco y validación accesible por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: formularios, ime, foco y validación accesible funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Formularios, IME, foco y validación accesible existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve formularios, ime, foco y validación accesible en tu contexto?
2. ¿Cómo sabrías que formularios, ime, foco y validación accesible no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar formularios, ime, foco y validación accesible?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
stateDiagram-v2
    [*] --> Editando
    Editando --> Enviando: envío válido
    Enviando --> Guardado: respuesta aceptada
    Enviando --> Error: timeout o rechazo
    Error --> Editando: corregir sin perder texto
    Guardado --> [*]
```

```kotlin
data class Formulario(val direccion: String = "", val tocado: Boolean = false) {
    val error get() = if (tocado && direccion.length < 8) "Escribe una dirección completa" else null
}

@Composable
fun CampoDireccion(form: Formulario, onCambio: (String) -> Unit, onSiguiente: () -> Unit) {
    OutlinedTextField(
        value = form.direccion, onValueChange = onCambio,
        label = { Text("Dirección") }, isError = form.error != null,
        supportingText = { form.error?.let { Text(it) } },
        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
        keyboardActions = KeyboardActions(onNext = { onSiguiente() }),
        modifier = Modifier.fillMaxWidth().semantics { form.error?.let { error(it) } }
    )
}
```

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
./gradlew :app:test
./gradlew :app:connectedDebugAndroidTest
```

</details>

### Tema 4: Side effects, lifecycle y APIs imperativas · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás elegir LaunchedEffect, DisposableEffect, SideEffect, rememberUpdatedState y produceState. Crea ui/mapa/SeguimientoEffect.kt y usa un fake antes de conectar ubicación real. Prerrequisitos: coroutines, lifecycle y UDF.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás elegir LaunchedEffect, DisposableEffect, SideEffect, rememberUpdatedState y produceState.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
`LaunchedEffect(key)` inicia una coroutine ligada a la presencia del nodo y reinicia al
cambiar la clave. `DisposableEffect` exige liberar listener. `SideEffect` publica estado
tras composición exitosa. `rememberUpdatedState` permite que un efecto largo invoque la
callback reciente sin reiniciarse. `produceState` adapta una fuente a `State`. Las claves
representan identidad, no valores casuales. Para Flow del ViewModel usa colección
lifecycle-aware. **Analogía:** un efecto es un contrato de alquiler: registra cuándo
entras, qué cambio exige mudanza y cómo devuelves las llaves.

```mermaid
flowchart LR
    C[Composición] --> L[LaunchedEffect con clave]
    C --> D[DisposableEffect con clave]
    L --> X[Coroutine cancelada al salir]
    D --> Y[onDispose libera el listener]
    K[Cambio de clave] --> L
    K --> D
```

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    C[Composición] --> L[LaunchedEffect con clave]
    C --> D[DisposableEffect con clave]
    L --> X[Coroutine cancelada al salir]
    D --> Y[onDispose libera el listener]
    K[Cambio de clave] --> L
    K --> D
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Side effects, lifecycle y APIs imperativas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Side effects, lifecycle y APIs imperativas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses side effects, lifecycle y apis imperativas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: side effects, lifecycle y apis imperativas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Side effects, lifecycle y APIs imperativas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve side effects, lifecycle y apis imperativas en tu contexto?
2. ¿Cómo sabrías que side effects, lifecycle y apis imperativas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar side effects, lifecycle y apis imperativas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
Al finalizar podrás elegir `LaunchedEffect`, `DisposableEffect`, `SideEffect`,
`rememberUpdatedState` y `produceState`. Crea `ui/mapa/SeguimientoEffect.kt` y usa un
fake antes de conectar ubicación real. **Prerrequisitos:** coroutines, lifecycle y UDF.

</details>

### Tema 5: Gestos, Canvas y componentes personalizados accesibles · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás elegir una abstracción de gesto, dibujar progreso y ofrecer una operación equivalente por semántica. Crea ui/ruta/ProgresoRuta.kt; necesitas coroutines y accesibilidad de los módulos 10 y 14. Prerrequisitos: Canvas, coroutines y semántica.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás elegir una abstracción de gesto, dibujar progreso y ofrecer una operación equivalente por semántica.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Gestos de alto nivel agregan foco, ripple, teclado y semántica. Detectores como
`detectDragGestures` consumen eventos dentro de `pointerInput`; su key controla reinicio.
Canvas usa píxeles bajo `DrawScope`, por lo que conviertes `Dp` con density. El estado no
pertenece al dibujo: recibe progreso normalizado y emite intención. Expón
`progressBarRangeInfo`, descripción y acciones; respeta tamaño táctil y reduce motion
cuando la animación no sea esencial. **Analogía:** Canvas pinta el tablero, pero la capa
semántica escribe instrucciones para lector, teclado y pruebas.

```mermaid
flowchart LR
    G[Gesto de puntero] --> E[Progreso normalizado]
    B[Botón o control estándar] --> E
    E --> V[Canvas dibuja]
    E --> S[Semántica anuncia el valor]
    S --> T[TalkBack y pruebas]
```

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    G[Gesto de puntero] --> E[Progreso normalizado]
    B[Botón o control estándar] --> E
    E --> V[Canvas dibuja]
    E --> S[Semántica anuncia el valor]
    S --> T[TalkBack y pruebas]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Gestos, Canvas y componentes personalizados accesibles se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Gestos, Canvas y componentes personalizados accesibles | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses gestos, canvas y componentes personalizados accesibles por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: gestos, canvas y componentes personalizados accesibles funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Gestos, Canvas y componentes personalizados accesibles existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve gestos, canvas y componentes personalizados accesibles en tu contexto?
2. ¿Cómo sabrías que gestos, canvas y componentes personalizados accesibles no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar gestos, canvas y componentes personalizados accesibles?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    G[Gesto de puntero] --> E[Progreso normalizado]
    B[Botón o control estándar] --> E
    E --> V[Canvas dibuja]
    E --> S[Semántica anuncia el valor]
    S --> T[TalkBack y pruebas]
```

```kotlin
@Composable
fun ProgresoRuta(progreso: Float, onCambio: (Float) -> Unit) {
    val valor = progreso.coerceIn(0f, 1f)
    Canvas(
        Modifier.fillMaxWidth().height(48.dp)
            .semantics {
                progressBarRangeInfo = ProgressBarRangeInfo(valor, 0f..1f)
                setProgress { onCambio(it.coerceIn(0f, 1f)); true }
            }
            .pointerInput(Unit) {
                detectTapGestures { onCambio((it.x / size.width).coerceIn(0f, 1f)) }
            }
    ) {
        drawLine(Color.Gray, Offset(0f, center.y), Offset(size.width, center.y), 8.dp.toPx())
        drawCircle(Color.Blue, 12.dp.toPx(), Offset(size.width * valor, center.y))
    }
}
```

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
./gradlew :app:test
./gradlew :app:connectedDebugAndroidTest
```

</details>
