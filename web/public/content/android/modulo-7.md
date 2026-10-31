# Módulo 7: Inyección de dependencias con Hilt


## Aprende construyendo

### Tema 1: Configuración básica de Hilt

#### Paso 1 · Objetivo y preparación

Al finalizar podrás anotar una `Application` y un `ViewModel` con Hilt, y explicar por qué la inyección de dependencias evita que cada clase conozca cómo construir sus propias dependencias.

**Conocimiento previo:** `ViewModel` (Módulo 1); repositorios (Módulo 6 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Hilt resuelve el acoplamiento de que cada clase deba conocer cómo construir sus propias dependencias, centralizando ese conocimiento y permitiendo cambiar implementaciones (por ejemplo, para tests) sin modificar el código que las consume.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** generación de código en tiempo de compilación, grafo de dependencias completo.

Hilt (construido sobre Dagger) requiere anotar la clase `Application` con `@HiltAndroidApp` para inicializar el contenedor de dependencias raíz, y cada `ViewModel` que participe con `@HiltViewModel`, permitiendo que Hilt construya automáticamente sus dependencias marcando el constructor con `@Inject`. Sin inyección de dependencias, cada clase que necesita un `TareaRepository` tendría que saber exactamente cómo construirlo, duplicando ese conocimiento en cada punto de uso; con Hilt, ese conocimiento vive centralizado (los módulos, Tema 2).

**Analogía:** Hilt es como un servicio de entrega centralizado que sabe exactamente cómo fabricar y entregar cada componente que un empleado necesita, en vez de que cada empleado fabrique sus propias herramientas desde cero.

**Diagrama:**

```
┌── SIN inyección de dependencias ─────────────┐
│ class TareasViewModel {                          │
│   val repo = TareaRepositoryImpl(Retrofit(...))    │  ← conoce CÓMO construir todo
│ }                                                     │
└───────────────────────────────────────────┘
┌── CON Hilt (@Inject) ────────────────────────┐
│ class TareasViewModel @Inject constructor(         │
│   private val repo: TareaRepository)                 │  ← solo declara QUÉ necesita
│ )                                                      │
└───────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), crea `app/src/main/kotlin/com/academia/android/MiApp.kt`, y modela el mismo principio de construcción centralizada en Python para verificarlo en ejecución real antes de confiar en la generación de código de Hilt:

```bash
# Este script python3 modela el mismo grafo de dependencias para verificar el principio
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/MiApp.kt <<'EOF'
package com.academia.android

import android.app.Application
import androidx.lifecycle.ViewModel
import dagger.hilt.android.HiltAndroidApp
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltAndroidApp
class MiApp : Application()

@HiltViewModel
class TareasViewModelInyectado @Inject constructor(
    private val repo: TareaRepository
) : ViewModel()
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `@HiltAndroidApp` en `MiApp` inicializa el contenedor de dependencias raíz de toda la aplicación; `@HiltViewModel` junto con `@Inject constructor(private val repo: TareaRepository)` le dice a Hilt que construya automáticamente `TareasViewModelInyectado`, resolviendo `TareaRepository` desde el grafo de dependencias sin que el desarrollador escriba ese código de construcción manualmente.

Modela el mismo grafo de dependencias en Python puro (sin ningún framework) para confirmar, en ejecución real, que un contenedor centralizado resuelve dependencias sin que el consumidor las construya:

```bash
python3 -c "
class TareaRepository:
    def obtener(self):
        return ['Comprar leche', 'Pagar alquiler']

class TareasViewModel:
    def __init__(self, repo):  # recibe la dependencia YA CONSTRUIDA, no la construye
        self.repo = repo

class ContenedorDeDependencias:
    def __init__(self):
        self._instancias = {}
    def resolver(self, tipo, fabrica):
        if tipo not in self._instancias:
            self._instancias[tipo] = fabrica()
        return self._instancias[tipo]

contenedor = ContenedorDeDependencias()
repo = contenedor.resolver('TareaRepository', lambda: TareaRepository())
view_model = TareasViewModel(repo)  # nunca construye TareaRepository() directamente
print('ViewModel obtuvo sus tareas vía la dependencia inyectada:', view_model.repo.obtener())
"
```

**Resultado esperado:** `TareasViewModel` recibe una instancia ya construida de `TareaRepository` a través de su constructor, sin invocar `TareaRepository()` en ningún lugar de su propio código, confirmando en ejecución real el mismo principio que `@Inject constructor` aplica en Kotlin: el consumidor declara qué necesita, no cómo construirlo.

**Fallo deliberado:** modifica `TareasViewModel` para que construya `TareaRepository()` directamente dentro de su propio `__init__` en vez de recibirlo como parámetro (`self.repo = TareaRepository()`). Ejecuta de nuevo — el código "funciona" igual de bien en este caso simple, pero ahora `TareasViewModel` conoce y depende directamente de la clase concreta `TareaRepository` — diagnostica confirmando el problema real: si `TareaRepository` necesitara más adelante un parámetro de configuración (una URL, un token), CADA lugar que la construya directamente tendría que actualizarse, mientras que con inyección de dependencias solo el contenedor centralizado necesita ese cambio.

#### Paso 5 · Práctica guiada

Agrega una segunda dependencia a `TareasViewModel` (una clase `ServicioDeNotificaciones` simulada) y confirma que el `ContenedorDeDependencias` la resuelve de la misma forma que `TareaRepository`, sin que `TareasViewModel` la construya directamente. **Pista:** agrega un segundo parámetro al constructor y un segundo `contenedor.resolver(...)` antes de instanciar el ViewModel.

#### Paso 6 · Práctica independiente

Documenta en una frase qué cambiaría en tu código si `TareaRepository` pasara de tener un constructor sin parámetros a necesitar una URL de API, comparando cuántos lugares tendrías que modificar con inyección de dependencias frente a sin ella.

#### Paso 7 · Cierre

Ya anotas una `Application` y un `ViewModel` con Hilt, y explicas por qué centralizar la construcción de dependencias reduce el acoplamiento. El siguiente tema cubre cómo declarar explícitamente cómo construir dependencias externas o mapear interfaces a implementaciones. Fuente oficial: [Android Developers — Dependency injection with Hilt](https://developer.android.com/training/dependency-injection/hilt-android).

**Errores comunes:** instanciar manualmente una dependencia dentro de una clase en vez de recibirla inyectada, reintroduciendo el acoplamiento que Hilt evita; olvidar anotar la clase `Application` con `@HiltAndroidApp`, lo cual hace que Hilt no pueda inicializar el contenedor raíz.

**Cuándo no usarlo:** para un script o prototipo de un solo archivo sin ninguna dependencia real que inyectar, adoptar Hilt es una complejidad innecesaria; su valor aparece con un grafo de dependencias no trivial compartido entre varias clases.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Inyecta el repositorio de entregas en el ViewModel. Sustitúyelo en pruebas sin modificar la pantalla y comprueba que la versión de producción utiliza la implementación persistente configurada.

### Tema 2: @Provides y @Binds

#### Paso 1 · Objetivo y preparación

Al finalizar podrás decidir entre `@Provides` y `@Binds` según si una dependencia es una clase externa o una interfaz propia con implementación inyectable.

**Conocimiento previo:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** `@Provides` permite construir dependencias externas no anotables directamente; `@Binds` mapea eficientemente una interfaz a su implementación cuando esta última ya es constructible por Hilt, manteniendo el resto de la app desacoplado de la implementación concreta.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** dos formas de declarar cómo construir una dependencia, según si la clase es propia o externa.

`@Provides` se usa cuando la dependencia es una clase externa que no se puede anotar con `@Inject` directamente (como `Retrofit`, de una librería de terceros): un método dentro de un `@Module` describe explícitamente cómo construirla. `@Binds` se usa para mapear una interfaz (`TareaRepository`) a su implementación concreta (`TareaRepositoryImpl`) cuando esa implementación sí puede anotarse con `@Inject`: es una declaración más eficiente que simplemente le dice a Hilt qué implementación entregar cuando alguien pida la interfaz.

**Analogía:** `@Provides` es como una receta explícita que alguien debe seguir para fabricar un componente externo sin instrucciones propias de ensamblaje; `@Binds` es simplemente una etiqueta que dice "cuando pidan este producto genérico, entrega esta marca específica", sin necesitar una receta completa porque el producto ya sabe fabricarse a sí mismo.

**Diagrama:**

```
┌── @Provides (clase EXTERNA, sin @Inject propio) ──┐
│ @Provides fun provideRetrofit(): Retrofit =            │
│   Retrofit.Builder().baseUrl(URL).build()                │
└─────────────────────────────────────────┘
┌── @Binds (interfaz PROPIA, implementación con @Inject) ─┐
│ @Binds abstract fun bindTareaRepository(                     │
│   impl: TareaRepositoryImpl): TareaRepository                    │
└─────────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea `app/src/main/kotlin/com/academia/android/NetworkModule.kt`:

```bash
# Este script python3 modela ambos patrones (provides y binds) para verificar la diferencia en ejecución real
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/NetworkModule.kt <<'EOF'
package com.academia.android

import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit = Retrofit.Builder().baseUrl("https://api.miapp.com/").build()
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindTareaRepository(impl: TareaRepositoryImpl): TareaRepository
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `provideRetrofit()` construye explícitamente la instancia de `Retrofit` (una clase externa que Hilt no puede anotar directamente en su constructor); `bindTareaRepository` simplemente declara la asociación entre la interfaz `TareaRepository` y su implementación `TareaRepositoryImpl` (Módulo 6), sin escribir código adicional de construcción, porque `TareaRepositoryImpl` ya tiene su propio constructor `@Inject`. Para que esto compile, el constructor de `TareaRepositoryImpl(private val dao: TareaDao, private val api: ApiService)` definido en el Módulo 6 debe anotarse ahora como `@Inject constructor(...)`: con Room (`TareaDao`, Módulo 6) y Retrofit (`ApiService`, aquí arriba) ya resolubles por Hilt, eso es todo lo que Hilt necesita para construir `TareaRepositoryImpl` automáticamente al resolver la interfaz `TareaRepository`.

Modela ambos patrones en Python, confirmando en ejecución real la diferencia entre "construir explícitamente" y "simplemente mapear":

```bash
python3 -c "
class Retrofit:
    def __init__(self, base_url):
        self.base_url = base_url

class TareaRepository:  # interfaz/contrato
    def obtener(self):
        raise NotImplementedError

class TareaRepositoryImpl(TareaRepository):  # implementación concreta
    def obtener(self):
        return ['Comprar leche']

class Modulo:
    # equivalente a @Provides: describe explícitamente CÓMO construir una clase externa
    def provide_retrofit(self):
        return Retrofit(base_url='https://api.miapp.com/')

    # equivalente a @Binds: solo MAPEA la interfaz a la implementación, sin lógica de construcción
    def bind_tarea_repository(self, impl: TareaRepositoryImpl) -> TareaRepository:
        return impl

modulo = Modulo()
retrofit = modulo.provide_retrofit()
print('Retrofit construido explícitamente con @Provides, base_url:', retrofit.base_url)

repo_concreto = TareaRepositoryImpl()
repo: TareaRepository = modulo.bind_tarea_repository(repo_concreto)
print('TareaRepository resuelto vía @Binds:', repo.obtener())
"
```

**Resultado esperado:** `provide_retrofit()` ejecuta lógica de construcción real (invoca el constructor con un parámetro); `bind_tarea_repository()` no construye nada, solo retorna la misma instancia ya construida, con el tipo de retorno declarado como la interfaz (`TareaRepository`), confirmando que `@Binds` es puramente una declaración de mapeo, no una fábrica.

**Fallo deliberado:** intenta escribir un `@Provides` (en vez de `@Binds`) para `TareaRepository` que invoque manualmente `TareaRepositoryImpl()` sin ningún parámetro adicional (`@Provides fun provideTareaRepository(): TareaRepository = TareaRepositoryImpl()`, redundante frente a simplemente usar `@Binds`). En Kotlin real, esto compila y funciona, pero es código innecesario: Hilt ya sabe construir `TareaRepositoryImpl` porque tiene su propio `@Inject constructor` — diagnostica confirmando que usar `@Provides` donde `@Binds` bastaría no es un error de compilación, pero sí una redundancia que el linting de Hilt suele señalar como código que puede simplificarse.

#### Paso 5 · Práctica guiada

Agrega un segundo `@Provides` a `NetworkModule` para un `OkHttpClient` con los interceptores del Módulo 5, y confirma con el script Python equivalente que también requiere lógica de construcción explícita (no un simple mapeo). **Pista:** sigue el mismo patrón de `provide_retrofit()`, ahora construyendo un objeto que representa `OkHttpClient`.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué `@Binds` requiere que el método sea `abstract` dentro de una clase también `abstract` (a diferencia de `@Provides`, que es un método concreto dentro de un `object`), relacionándolo con que `@Binds` nunca ejecuta código propio, solo declara una asociación de tipos.

#### Paso 7 · Cierre

Ya decides entre `@Provides` y `@Binds` según si una dependencia es externa o una interfaz propia, evitando código de construcción redundante. El siguiente tema cubre los scopes que controlan cuánto tiempo vive cada dependencia, y cómo reemplazarlas en tests. Fuente oficial: [Android Developers — Hilt modules](https://developer.android.com/training/dependency-injection/hilt-android#hilt-modules).

**Errores comunes:** usar `@Provides` para una clase que ya se puede anotar con `@Inject` directamente, generando código redundante; olvidar `@InstallIn(SingletonComponent::class)`, dejando el módulo sin instalar en ningún componente del grafo.

**Cuándo no usarlo:** para una dependencia que nunca varía entre entornos (test, producción) ni necesita ninguna configuración externa, y que ya es directamente instanciable con `@Inject`, ni `@Provides` ni `@Binds` son necesarios: el propio `@Inject constructor` de la clase basta.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Proporciona el cliente HTTP y enlaza la interfaz del repositorio con su implementación. Una prueba debe resolver el grafo y consultar una guía falsa sin construir dependencias dentro del composable.

### Tema 3: Scopes y testing con Hilt

#### Paso 1 · Objetivo y preparación

Al finalizar podrás elegir el scope correcto para una dependencia según su tiempo de vida necesario, y reemplazar un módulo real por uno de test.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Elegir el scope correcto evita recrear objetos costosos innecesariamente o retenerlos más tiempo del necesario; `@UninstallModules` permite testear con dependencias fake sin modificar el código de producción bajo prueba.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** tiempo de vida controlado por scope, reemplazo de módulos reales por fakes en tests.

`@Singleton` vincula una dependencia al `SingletonComponent`, viviendo mientras la app entera vive; `@ViewModelScoped` vincula una dependencia al ciclo de vida de un `ViewModel` específico. Elegir el scope correcto evita dos problemas opuestos: recrear innecesariamente un objeto costoso (scope demasiado corto), o retenerlo más tiempo del necesario (scope demasiado amplio). `@UninstallModules` permite reemplazar por completo un módulo de producción por uno de test equivalente, sin modificar el código bajo prueba.

**Analogía:** los scopes de Hilt son como distintos tipos de contrato de alquiler: uno de larga duración para toda la vida del edificio (`@Singleton`), y uno de corto plazo que se renueva junto con cada inquilino específico (`@ViewModelScoped`); `@UninstallModules` es como reemplazar temporalmente el proveedor real de un servicio por uno de práctica durante un simulacro.

**Diagrama:**

```
┌── @Singleton ──────────────────────┐
│  UNA instancia, vive mientras la app vive │
└───────────────────────────────┘
┌── @ViewModelScoped ────────────────┐
│  UNA instancia por ViewModel,           │
│  destruida cuando ese ViewModel muere      │
└───────────────────────────────┘
┌── @UninstallModules(NetworkModule::class) ─┐
│  reemplaza el módulo real por uno de test       │
└───────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea `app/src/main/kotlin/com/academia/android/TareasFlowTest.kt` junto a un modelo Python que confirma la diferencia real de comportamiento entre scopes:

```bash
# Este script python3 modela scopes reales para contar cuántas instancias se crean de cada tipo
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/TareasFlowTest.kt <<'EOF'
package com.academia.android

import dagger.hilt.android.testing.HiltAndroidTest
import dagger.hilt.android.testing.UninstallModules

@HiltAndroidTest
@UninstallModules(NetworkModule::class) // reemplaza el módulo real por uno de test
class TareasFlowTest
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `@HiltAndroidTest` habilita la inyección de Hilt dentro del test; `@UninstallModules(NetworkModule::class)` desinstala el módulo de producción, permitiendo que un módulo de test equivalente provea, en su lugar, un `Retrofit` apuntando a un servidor de pruebas en vez del real.

Modela, contando instancias reales creadas, la diferencia entre `@Singleton` y un scope sin caché (equivalente a `@ViewModelScoped` con múltiples ViewModels):

```bash
python3 -c "
class ObjetoCostoso:
    contador_de_construcciones = 0
    def __init__(self):
        ObjetoCostoso.contador_de_construcciones += 1

class ContenedorSingleton:
    def __init__(self):
        self._instancia = None
    def obtener(self):
        if self._instancia is None:
            self._instancia = ObjetoCostoso()
        return self._instancia

class ContenedorSinCache:  # equivalente a un scope corto sin reutilización
    def obtener(self):
        return ObjetoCostoso()

ObjetoCostoso.contador_de_construcciones = 0
singleton = ContenedorSingleton()
for _ in range(5):
    singleton.obtener()
print('con @Singleton, construcciones tras 5 solicitudes:', ObjetoCostoso.contador_de_construcciones)

ObjetoCostoso.contador_de_construcciones = 0
sin_cache = ContenedorSinCache()
for _ in range(5):
    sin_cache.obtener()
print('SIN singleton (scope corto), construcciones tras 5 solicitudes:', ObjetoCostoso.contador_de_construcciones)
"
```

**Resultado esperado:** con el contenedor `@Singleton`, solo se construye 1 instancia sin importar cuántas veces se solicite; sin esa caché, se construyen 5 instancias nuevas para las mismas 5 solicitudes, confirmando en ejecución real por qué elegir `@Singleton` para un objeto costoso (como `Retrofit` o `AppDatabase`) evita reconstruirlo innecesariamente.

**Fallo deliberado:** marca `AppDatabase` (Módulo 6) como si tuviera un scope corto en vez de `@Singleton` (simulado usando `ContenedorSinCache` para la base de datos). Cada "solicitud" abriría una nueva conexión a la misma base de datos SQLite física — diagnostica confirmando el problema real que un scope mal elegido causaría: múltiples conexiones simultáneas e innecesarias a la misma base de datos, cuando una única instancia compartida (`@Singleton`) sería tanto más eficiente como más correcta para un recurso que debe ser único durante toda la vida de la app.

#### Paso 5 · Práctica guiada

Extiende el script de conteo de instancias para simular tres `ViewModel` distintos, cada uno con su propia dependencia `@ViewModelScoped` (una instancia nueva por `ViewModel`, pero reutilizada dentro del mismo), y confirma que el conteo total de construcciones es 3, no 1 ni 5. **Pista:** necesitas un contenedor por instancia de `ViewModel`, no uno global compartido como en `ContenedorSingleton`.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué reemplazar `NetworkModule` con `@UninstallModules` en un test es preferible a modificar temporalmente el código de producción para que apunte a un servidor de pruebas y luego revertir ese cambio manualmente antes de cada commit.

#### Paso 7 · Cierre

Ya eliges el scope correcto para una dependencia según su tiempo de vida necesario, y reemplazas módulos completos por versiones de test sin tocar el código de producción. Esto cierra el módulo de inyección de dependencias; el siguiente módulo del track aborda Material Design y theming. Fuente oficial: [Android Developers — Hilt testing guide](https://developer.android.com/training/dependency-injection/hilt-testing).

**Errores comunes:** elegir `@Singleton` para una dependencia que debería vivir solo mientras un `ViewModel` específico vive, reteniéndola más tiempo del necesario; modificar código de producción temporalmente para apuntar a un entorno de test en vez de usar `@UninstallModules`.

**Cuándo no usarlo:** para una dependencia extremadamente barata de construir y sin ningún estado compartido relevante (una función pura simple), ningún scope especial es necesario; el scope por defecto (sin anotación, una nueva instancia cada vez) es suficiente y evita la complejidad adicional de gestionar su ciclo de vida explícitamente.

---

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Comprueba el alcance del repositorio compartido entre lista y detalle. En pruebas instala un reemplazo controlado y demuestra que una actualización se observa en ambas pantallas sin crear almacenes independientes.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una app con todas sus dependencias (repos, servicios) inyectadas vía Hilt.

**Requisitos previos:** Módulo 6 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Anotar `Application` y un `ViewModel` con Hilt | Ver Tema 1 | `@HiltAndroidApp`, `@HiltViewModel` |
| 2 | Inyectar un repositorio con `@Inject` en el constructor | Ver Tema 1 | Sin instanciación manual |
| 3 | Crear un `@Module` con `@Provides` para Retrofit | Ver Tema 2 | Clase externa no anotable |
| 4 | Usar `@Binds` para mapear interfaz a implementación | Ver Tema 2 | Repositorio propio |
| 5 | Configurar un módulo de test con `@UninstallModules` | Ver Tema 3 | Reemplaza dependencia real por fake |

**Verificación:** el laboratorio se considera exitoso si ninguna clase de la app instancia manualmente sus dependencias (todo llega vía constructor inyectado por Hilt), y si el test instrumentado corre correctamente con el módulo real reemplazado por uno de test.

**Errores comunes y soluciones**

- **Usar `@Provides` para una clase que ya se puede anotar con `@Inject` directamente.** Prefiere `@Inject` en el constructor cuando sea posible; usa `@Provides` solo para clases externas.
- **Elegir `@Singleton` para una dependencia que debería vivir solo mientras un `ViewModel` específico vive.** Retiene el objeto más tiempo del necesario; usa `@ViewModelScoped`.
- **Instanciar manualmente una dependencia dentro de una clase en vez de inyectarla.** Reintroduce el acoplamiento que Hilt está diseñado para evitar.

---
