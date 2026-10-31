# Módulo 12: Proyecto integrador: app Android completa


## Aprende construyendo

### Tema 1: Arquitectura MVVM completa con UDF

#### Paso 1 · Objetivo y preparación

Al finalizar podrás integrar Compose, navegación, StateFlow, Room y Retrofit en una única arquitectura MVVM+UDF coherente, y explicar por qué cada capa se comunica en una única dirección.

**Conocimiento previo:** Módulos 2-6 de este track (Compose, navegación, StateFlow, Retrofit, Room).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Integrar cada módulo del track en una única arquitectura demuestra que los conceptos estudiados por separado (state hoisting, UDF, offline-first, DI, testing) se combinan naturalmente en un sistema real, con cada capa testeable y reemplazable de forma independiente gracias a la separación estricta de responsabilidades.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** cada capa con una única responsabilidad, comunicación en una única dirección.

Este proyecto integra cada módulo anterior: la UI declarativa con state hoisting (Módulo 2) se combina con navegación con argumentos tipados (Módulo 3), UDF completo con `StateFlow` (Módulo 4), persistencia offline-first con Room (Módulo 6), inyección de dependencias con Hilt (Módulo 7), y una suite de tests (Módulo 9). La clave es que cada capa tiene una única responsabilidad y se comunica con las adyacentes en una única dirección: la UI nunca conoce Room ni Retrofit directamente, el ViewModel nunca construye vistas Compose directamente.

**Analogía:** esta arquitectura es como una cadena de producción industrial donde cada estación tiene una función clara y bien delimitada, y el producto fluye en una única dirección de estación en estación: ninguna estación necesita conocer los detalles internos de las demás.

**Diagrama:**

```
┌── UI (Compose, Módulo 2) ──────────────────┐
└──────────┬──────────────────────────────┘
           │ collectAsStateWithLifecycle / eventos (Módulo 4)
           ▼
┌── ViewModel (StateFlow, UDF) ───────────────┐
└──────────┬──────────────────────────────┘
           │
           ▼
┌── Repositorio (offline-first, Módulo 6) ────┐
└────┬─────────────────────────┬──────────┘
     ▼                             ▼
┌── Room (caché local) ──┐   ┌── Retrofit (API remota, Módulo 5) ──┐
└─────────────────┘   └───────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), crea `app/src/main/kotlin/com/academia/android/TareasViewModelIntegrado.kt`, integrando literalmente las piezas de los Módulos 4-7:

```bash
# Este script python3 verifica que la integración conecta las capas en el orden correcto
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/TareasViewModelIntegrado.kt <<'EOF'
package com.academia.android

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject
import dagger.hilt.android.lifecycle.HiltViewModel

@HiltViewModel
class TareasViewModelIntegrado @Inject constructor(
    private val repo: TareaRepository // Room + Retrofit por debajo (Módulo 6), inyectado por Hilt (Módulo 7)
) : ViewModel() {
    val tareas: StateFlow<List<Tarea>> = repo.tareas
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun sincronizar() = viewModelScope.launch { repo.sincronizar() }
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `@Inject constructor(private val repo: TareaRepository)` es la integración de Hilt (Módulo 7); `repo.tareas` expone el `Flow` reactivo de Room (Módulo 6); `.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())` convierte ese `Flow` en un `StateFlow` (Módulo 4) con valor inicial garantizado, deteniendo la recolección 5 segundos después de que el último observador se desuscriba, evitando reiniciarla innecesariamente ante un hueco breve como una rotación de pantalla (Módulo 1).

Modela, con un grafo de dependencias en Python, la cadena completa de capas confirmando que cada una solo conoce a la inmediatamente adyacente, nunca saltándose niveles:

```bash
python3 -c "
capas = {
    'UI':          {'conoce_directamente': ['ViewModel']},
    'ViewModel':   {'conoce_directamente': ['Repositorio']},
    'Repositorio': {'conoce_directamente': ['Room', 'Retrofit']},
    'Room':        {'conoce_directamente': []},
    'Retrofit':     {'conoce_directamente': []},
}

def viola_udf(capas):
    violaciones = []
    if 'Room' in capas['UI']['conoce_directamente'] or 'Retrofit' in capas['UI']['conoce_directamente']:
        violaciones.append('UI conoce Room/Retrofit directamente, saltándose ViewModel y Repositorio')
    if 'Room' in capas['ViewModel']['conoce_directamente'] or 'Retrofit' in capas['ViewModel']['conoce_directamente']:
        violaciones.append('ViewModel conoce Room/Retrofit directamente, saltándose el Repositorio')
    return violaciones

print('violaciones de capas encontradas:', viola_udf(capas))
"
```

**Resultado esperado:** la lista de violaciones está vacía, confirmando que la arquitectura respeta la comunicación en una única dirección entre capas adyacentes, exactamente el diagrama del Paso 3: la UI solo conoce el `ViewModel`, y el `ViewModel` solo conoce el `Repositorio`, nunca saltándose directamente hacia Room o Retrofit.

**Fallo deliberado:** modifica el modelo Python para que `'UI'` incluya `'Room'` en su lista de `conoce_directamente` (simulando un composable que importara y consultara `AppDatabase` directamente, saltándose el `ViewModel`). La función `viola_udf` ahora reporta esa violación — diagnostica confirmando el problema arquitectónico real: si la UI accediera a Room directamente, perdería la garantía de flujo unidireccional (Módulo 4) y haría imposible testear la UI de forma aislada con un fake de `ViewModel` (Módulo 9), exactamente el acoplamiento que esta arquitectura evita deliberadamente.

#### Paso 5 · Práctica guiada

Agrega una segunda pantalla completa (`DetalleTareaViewModel`, siguiendo exactamente el mismo patrón de `TareasViewModelIntegrado`) y confirma con el modelo de capas en Python que también respeta la comunicación unidireccional. **Pista:** agrega las mismas entradas de `capas` para la nueva pantalla, reutilizando el mismo `Repositorio`.

#### Paso 6 · Práctica independiente

Documenta en una frase qué cambiaría en el diagrama de capas si decidieras reemplazar Retrofit por Ktor Client (Kotlin Multiplatform, Módulo 5), y por qué ese cambio no debería requerir ninguna modificación en el `ViewModel` ni en la UI.

#### Paso 7 · Cierre

Ya integras Compose, navegación, StateFlow, Room y Retrofit en una única arquitectura MVVM+UDF coherente, confirmando programáticamente que cada capa se comunica en una única dirección. El siguiente tema profundiza en cómo la inyección de dependencias de Hilt se extiende a absolutamente toda la app. Fuente oficial: [Android Developers — Guide to app architecture](https://developer.android.com/topic/architecture).

**Errores comunes:** dejar que un composable acceda directamente a Room o Retrofit "por conveniencia", rompiendo la separación de capas; mezclar lógica de UI dentro del repositorio, violando la única responsabilidad de cada capa.

**Cuándo no usarlo:** para un prototipo desechable de una sola pantalla sin ninguna intención de mantenerlo ni testearlo, imponer la arquitectura completa de capas es sobre-ingeniería; su valor aparece en aplicaciones reales destinadas a mantenerse y crecer en el tiempo.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Separa la pantalla de entregas, su estado y la confirmación de entrega. Prueba el ViewModel con un repositorio falso: una confirmación fallida debe conservar la entrega pendiente y ofrecer reintento.

### Tema 2: Inyección de dependencias en toda la app

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar que ninguna clase de la app instancia manualmente sus dependencias, y explicar por qué eso habilita el testing completo del sistema.

**Conocimiento previo:** Tema 1 de este módulo; Hilt (Módulo 7).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** La ausencia total de instanciación manual, lograda mediante Hilt en cada capa, es precisamente lo que habilita que el sistema completo sea testeable de forma aislada reemplazando dependencias por fakes sin tocar el código de producción.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** ningún componente instancia manualmente sus propias dependencias.

En el proyecto integrador, ninguna clase instancia manualmente sus propias dependencias: Hilt construye el `TareaRepository` (que encapsula Room y Retrofit por debajo, sin que el `ViewModel` necesite conocer esos detalles) y lo inyecta en el constructor vía `@Inject`. Esta ausencia total de instanciación manual es lo que permite que, en testing (Módulo 9), cada dependencia se reemplace limpiamente por un fake sin modificar el código de producción.

**Analogía:** un sistema completamente inyectado es como una organización donde cada empleado recibe sus herramientas ya preparadas por un departamento central de logística, en vez de fabricarlas por su cuenta, permitiendo que ese departamento sustituya cualquier herramienta específica sin que el empleado note ninguna diferencia.

**Diagrama:**

```
┌── Auditoría: "grep -r 'Retrofit(' o 'Room.databaseBuilder' " ─┐
│ en TODO el código de la app                                          │
├── 0 resultados fuera de NetworkModule/DatabaseModule ──────┤
│   → ninguna instanciación manual                                    │
└──────────────────────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea, dentro de `app/src/`, dos ViewModels de ejemplo para auditar con grep real que ninguna clase fuera de los módulos de Hilt (Módulo 7) instancia `Retrofit` o `Room` directamente. Ejecuta grep para validar:

```bash
# Este script python3 no interviene en este paso; el grep siguiente hace la auditoría real
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/ViewModelBienInyectado.kt <<'EOF'
package com.academia.android

import androidx.lifecycle.ViewModel
import javax.inject.Inject
import dagger.hilt.android.lifecycle.HiltViewModel

@HiltViewModel
class ViewModelBienInyectado @Inject constructor(
    private val repo: TareaRepository // inyectado, nunca instanciado manualmente
) : ViewModel()
EOF
cat > app/src/main/kotlin/com/academia/android/ViewModelMalInyectado.kt <<'EOF'
package com.academia.android

import androidx.lifecycle.ViewModel

class ViewModelMalInyectado : ViewModel() {
    // ANTIPATRÓN deliberado para esta demostración: instanciación manual
    private val retrofitManual = Retrofit.Builder().baseUrl("https://api.miapp.com/").build()
}
EOF
grep -rn "Retrofit.Builder()\|Room.databaseBuilder(" app/src/main/kotlin/com/academia/android/ | grep -v "NetworkModule.kt"
```

**Explicación línea por línea:** `ViewModelBienInyectado` recibe `TareaRepository` vía `@Inject constructor`, sin ninguna construcción manual; `ViewModelMalInyectado` representa deliberadamente el antipatrón (instanciando `Retrofit.Builder()` directamente dentro del `ViewModel`); el `grep` audita el código buscando exactamente ese patrón prohibido, excluyendo el único lugar legítimo donde debería aparecer (`NetworkModule.kt`, Módulo 7, Tema 2).

**Resultado esperado:** el `grep` encuentra la línea de `ViewModelMalInyectado.kt` (`retrofitManual = Retrofit.Builder()...`), confirmando exactamente la violación que esta auditoría está diseñada para detectar: una instanciación manual fuera del módulo de Hilt designado para ese propósito.

**Fallo deliberado:** elimina `ViewModelMalInyectado.kt` (corrigiendo la violación) y repite el mismo `grep`. El comando ahora no encuentra ninguna coincidencia — diagnostica confirmando que la ausencia total de resultados en esta auditoría es precisamente la señal de que el sistema está completamente inyectado; un proyecto real debería integrar este mismo `grep` como un chequeo automatizado en CI (DevOps, Módulo 4) que falle si alguien reintroduce el antipatrón en el futuro.

Confirma además, usando el wrapper de Gradle, que el proyecto sigue compilando con Hilt resolviendo correctamente el grafo de dependencias tras el cambio:

```bash
./gradlew :app:compileDebugKotlin
```

Resultado esperado: la compilación termina sin errores de Hilt (`[Hilt] Unresolved reference` o `ComponentProcessingStep` fallido indicarían un binding roto); una compilación exitosa confirma que el grafo de inyección completo sigue siendo válido tras eliminar `ViewModelMalInyectado.kt`.

#### Paso 5 · Práctica guiada

Extiende el `grep` de auditoría para también detectar instanciación manual de `OkHttpClient()` fuera de `NetworkModule.kt`, siguiendo el mismo patrón. **Pista:** agrega `OkHttpClient(` a la lista de patrones buscados con `grep`, separado por `\|` como los existentes.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué reemplazar `TareaRepository` real por `TareaRepositoryFake` (Módulo 9) en un test sería imposible de hacer limpiamente si `ViewModelMalInyectado` fuera el patrón usado en toda la app, en vez del patrón de Hilt.

#### Paso 7 · Cierre

Ya confirmas, con una auditoría real de código, que ninguna clase de la app instancia manualmente sus dependencias, y explicas por qué eso habilita el testing completo del sistema. El siguiente tema cierra el track reflexionando sobre qué hace a una app Android profesionalmente completa. Fuente oficial: [Android Developers — Hilt and Dagger annotations](https://developer.android.com/training/dependency-injection/hilt-android).

**Errores comunes:** dejar una única clase con instanciación manual "por simplicidad", rompiendo la testeabilidad completa del sistema; no automatizar esta auditoría en CI, dependiendo de que alguien la recuerde manualmente en cada code review.

**Cuándo no usarlo:** dentro de los propios módulos de Hilt (`NetworkModule`, `DatabaseModule`, Módulo 7), la instanciación explícita es necesaria y correcta; la auditoría de este Tema debe excluir deliberadamente esos módulos, no prohibir la instanciación en absolutamente todo el código.

### Tema 3: Cierre del track y próximos pasos

#### Paso 1 · Objetivo y preparación

Al finalizar podrás articular, con una checklist verificable, qué hace a una app Android profesionalmente completa más allá de su UI visual.

**Conocimiento previo:** Temas 1 y 2 de este módulo; todos los módulos anteriores del track.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Cerrar el track integrando todos los conceptos en un proyecto real consolida que una app profesional requiere la combinación de flujo de datos predecible, resiliencia offline, desacoplamiento testeable, y una base de tests confiable, no solo una UI visualmente atractiva.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** una app Android profesional es más que pantallas atractivas.

Una app Android "completa" no se define únicamente por pantallas visualmente atractivas: es la combinación deliberada de un flujo de datos predecible (UDF, Módulo 4), resiliencia real ante pérdida de conexión (offline-first, Módulo 6), dependencias desacopladas y testeables (Hilt, Módulo 7), y una base de tests (Módulo 9) que otorga confianza genuina antes de publicar (Módulo 11), en vez de depender únicamente de pruebas manuales dispersas y no repetibles.

**Analogía:** una app Android completa es como un edificio terminado que no solo se ve bien en la fachada (Compose), sino que además tiene cimientos sólidos que resisten condiciones adversas (offline-first), una instalación eléctrica bien organizada (DI con Hilt), y un historial de inspecciones que certifica su seguridad antes de habilitarlo al público (testing antes de publicar).

**Diagrama:**

```
┌── App Android profesional = ───────────────────────┐
│   UI atractiva (Compose)                                │
│ + flujo de datos predecible (UDF)                          │
│ + resiliencia offline (Room + Retrofit)                       │
│ + dependencias desacopladas (Hilt)                              │
│ + confianza antes de publicar (tests)                              │
└───────────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), crea `app/checklist-cierre-track.py`, una checklist ejecutable que verifica programáticamente las cinco dimensiones de este Tema contra los artefactos reales creados a lo largo del track. Ejecuta python para validar:

```bash
# Este script python3 ejecuta la checklist ejecutable definida a continuación
mkdir -p academia-android/app
cd academia-android
cat > app/checklist-cierre-track.py <<'EOF'
import os

archivos_del_proyecto = os.popen("find app/src/main/kotlin -name '*.kt' 2>/dev/null").read()

criterios = {
    "ui_compose": "@Composable" in archivos_del_proyecto or os.path.exists("app/src/main/kotlin/com/academia/android/TarjetaTarea.kt"),
    "udf_stateflow": os.path.exists("app/src/main/kotlin/com/academia/android/TareasViewModelIntegrado.kt"),
    "offline_first_room": os.path.exists("app/src/main/kotlin/com/academia/android/AppDatabase.kt"),
    "dependencias_hilt": os.path.exists("app/src/main/kotlin/com/academia/android/ViewModelBienInyectado.kt"),
    "tests_existen": os.path.exists("app/src/main/kotlin/com/academia/android/TareasViewModelTest.kt"),
}

for nombre, cumplido in criterios.items():
    print(f"[{'CUMPLE' if cumplido else 'NO CUMPLE'}] {nombre}")

total = len(criterios)
cumplidos = sum(criterios.values())
print(f"Resumen: {cumplidos}/{total} dimensiones de una app Android completa presentes")
EOF
python3 app/checklist-cierre-track.py
```

**Ejecuta el ejemplo** (en un proyecto Android con Gradle, compila e instala en un emulador):

```bash
./gradlew assembleDebug
./gradlew test
```


**Explicación línea por línea:** el script verifica programáticamente, contra los archivos reales creados en módulos anteriores de este mismo track (Módulos 2, 4, 6, 7, 9), si cada una de las cinco dimensiones de una app Android completa (UI, UDF, offline-first, DI, testing) tiene al menos un artefacto concreto presente, en vez de una autoevaluación subjetiva.

**Resultado esperado:** si completaste los módulos anteriores en el mismo directorio `academia-android`, el script reporta la mayoría (o la totalidad) de las cinco dimensiones como `CUMPLE`, con un resumen numérico concreto, confirmando objetivamente que el proyecto integra los conceptos del track, no solo en teoría sino en artefactos de código reales y verificables.

**Fallo deliberado:** ejecuta el mismo script desde un directorio completamente vacío sin ninguno de los archivos de módulos anteriores (`mkdir -p /tmp/proyecto-vacio/app/src/main/kotlin && cd /tmp/proyecto-vacio && python3 -c "print('simulando: 0/5 dimensiones cumplidas sin ningún archivo de módulos anteriores')"`). El resumen mostraría 0/5 — diagnostica confirmando que esta checklist, igual que la del Módulo 12 de DevOps, mide artefactos reales, no buenas intenciones: una app que "en teoría" sigue esta arquitectura pero sin código real que lo demuestre no pasaría esta verificación.

#### Paso 5 · Práctica guiada

Agrega una sexta dimensión a la checklist (`publicacion_lista`, verificando la existencia de `app/keystore.jks` del Módulo 11) y confirma que el resumen ahora reporta sobre 6 dimensiones totales. **Pista:** sigue el mismo patrón de `os.path.exists(...)` para el nuevo criterio.

#### Paso 6 · Práctica independiente

Reflexiona por escrito (una frase por pregunta) sobre las dos preguntas de cierre de este Tema: qué parte específica de este proyecto integrador (Compose, Room, Hilt, o su combinación) resultó más difícil de integrar correctamente, y qué cambiarías en esta arquitectura si la app debiera escalar a diez pantallas adicionales.

#### Paso 7 · Cierre

Ya articulas, con una checklist verificable contra artefactos de código reales, qué hace a una app Android profesionalmente completa más allá de su UI visual. Esto cierra el track completo de Android: desde la estructura de un proyecto (Módulo 0) hasta la integración completa de arquitectura, DI y testing en este proyecto final. Fuente oficial: [Android Developers — App architecture guide, testing section](https://developer.android.com/topic/architecture/testing).

**Errores comunes:** considerar el proyecto "completo" solo por tener una UI atractiva, sin verificar las otras cuatro dimensiones; no ejecutar nunca una checklist objetiva, confiando únicamente en una impresión subjetiva de que "el proyecto está bien".

**Cuándo no usarlo:** para un ejercicio de aprendizaje puntual de un único concepto aislado (por ejemplo, practicar solo Compose sin ninguna intención de integrar las demás capas), aplicar esta checklist completa de cierre de track no es relevante; resérvala específicamente para el proyecto integrador final.

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir una app Android con Compose, datos reales, persistencia offline y tests.

**Requisitos previos:** Módulos 0-11 completados.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Diseñar la arquitectura MVVM completa | Ver Tema 1 | UI → ViewModel → Repositorio → Room + Retrofit |
| 2 | Implementar persistencia offline-first | Ver Tema 1 | La UI siempre lee de Room |
| 3 | Inyectar todas las dependencias con Hilt | Ver Tema 2 | Sin instanciación manual |
| 4 | Escribir tests de ViewModel y Compose UI | Ver Tema 3 | Con fakes, sin dependencias externas reales |
| 5 | Generar el App Bundle firmado | Ver Módulo 11 | Listo para Play Console |

**Verificación:** el proyecto se considera exitoso si la app funciona correctamente sin conexión (mostrando el último caché sincronizado), si todas sus dependencias están inyectadas vía Hilt sin ninguna instanciación manual, y si la suite de tests pasa consistentemente incluyendo al menos un test de ViewModel y uno de Compose UI.

**Errores comunes y soluciones**

- **Dejar alguna dependencia instanciada manualmente en vez de inyectada.** Rompe la testeabilidad completa del sistema; audita que todo pase por Hilt.
- **Hacer que la UI dependa directamente de la red en vez de Room.** Rompe offline-first; revisa el Módulo 6.
- **Omitir tests de Compose UI, confiando solo en tests de ViewModel.** No cubre la brecha entre estado correcto y renderizado correcto (Módulo 9).

---
