# Módulo 6: Persistencia local con Room


## Aprende construyendo

### Tema 1: Entities, DAOs y Database

#### Paso 1 · Objetivo y preparación

Al finalizar podrás declarar una `@Entity`, un `@Dao` y una `@Database` de Room, y explicar por qué Room verifica las queries en tiempo de compilación.

**Conocimiento previo:** Kotlin básico; ninguna experiencia previa en bases de datos requerida.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Room verifica las queries SQL en tiempo de compilación, detectando errores antes de ejecutar la app, y comparte el mismo principio de SQL tipado que SQLDelight en Kotlin Multiplatform, aunque específico para Android.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** SQL tipado y verificado en tiempo de compilación.

Room es una capa de abstracción sobre SQLite (el motor embebido de Android) que verifica las queries escritas en anotaciones (`@Query("SELECT * FROM Tarea")`) en tiempo de compilación, detectando errores de sintaxis o columnas inexistentes antes de que la app se ejecute. Una `@Entity` mapea directamente a una tabla; un `@Dao` declara las operaciones permitidas como métodos de interfaz, con Room generando la implementación real en compilación. Este patrón es análogo a SQLDelight en Kotlin Multiplatform (Módulo 7 de ese track), multiplataforma en vez de específico para Android.

**Analogía:** Room es como un traductor certificado que revisa cada instrucción escrita en un idioma (SQL) antes de enviarla a su destinatario final (SQLite), rechazando de antemano cualquier instrucción mal formada, en vez de dejar que el destinatario descubra el error al ejecutarla.

**Diagrama:**

```
┌── @Entity Tarea ────────────────────┐
│  data class Tarea(id, titulo, completada) │
└──────────┬───────────────────────┘
           │ Room genera la tabla SQL real
           ▼
┌── @Dao TareaDao ────────────────────┐
│  @Query("SELECT * FROM Tarea")            │
│  verificado en COMPILACIÓN, no en runtime    │
└───────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), crea `app/src/main/kotlin/com/academia/android/AppDatabase.kt`, y valida la tabla equivalente en SQLite real (el motor que Room usa internamente) para confirmar que el esquema es válido:

```bash
# Este script python3 (vía sqlite3) valida el esquema SQL real que Room generaría
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/AppDatabase.kt <<'EOF'
package com.academia.android

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase
import kotlinx.coroutines.flow.Flow

@Entity
data class Tarea(@PrimaryKey val id: String, val titulo: String, val completada: Boolean)

@Dao
interface TareaDao {
    @Query("SELECT * FROM Tarea")
    fun observarTodas(): Flow<List<Tarea>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertar(tarea: Tarea)
}

@Database(entities = [Tarea::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun tareaDao(): TareaDao
}
EOF
python3 -c "
import sqlite3
# el esquema equivalente que Room generaría a partir de la @Entity Tarea
con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE Tarea (id TEXT PRIMARY KEY NOT NULL, titulo TEXT NOT NULL, completada INTEGER NOT NULL)')
con.execute(\"INSERT INTO Tarea VALUES ('1', 'Comprar leche', 0)\")
filas = con.execute('SELECT * FROM Tarea').fetchall()
print('esquema válido, filas:', filas)
con.close()
"
```

**Ejecuta el ejemplo** (en un proyecto Android con Gradle, compila e instala en un emulador):

```bash
./gradlew assembleDebug
./gradlew test
```


**Explicación línea por línea:** `@Entity` mapea `Tarea` a una tabla SQL con las mismas columnas que sus propiedades; `@PrimaryKey` corresponde a `PRIMARY KEY` en SQL; `@Query("SELECT * FROM Tarea")` es la query literal que Room verifica contra el esquema declarado en tiempo de compilación; el script Python con `sqlite3` confirma, contra el motor SQLite real, que ese esquema y esa query son válidos y ejecutables.

Simula el error que Room detectaría en tiempo de compilación si la query referenciara una columna inexistente, ejecutando esa misma query contra SQLite real:

```bash
python3 -c "
import sqlite3
con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE Tarea (id TEXT PRIMARY KEY, titulo TEXT, completada INTEGER)')
try:
    con.execute('SELECT columnaInexistente FROM Tarea').fetchall()
    print('la query se ejecutó sin error (INESPERADO)')
except sqlite3.OperationalError as e:
    print('SQLite rechazó la query:', e)
con.close()
"
```

**Resultado esperado:** SQLite rechaza la consulta con `no such column: columnaInexistente`; Room, al verificar la misma clase de error en tiempo de **compilación** (no en tiempo de ejecución como aquí), evita que la app siquiera se compile con esa query inválida, deteniendo el error mucho antes en el ciclo de desarrollo.

**Fallo deliberado:** modifica el script para insertar una fila con un tipo incorrecto para `completada` (una cadena de texto en vez de un entero, `con.execute("INSERT INTO Tarea VALUES ('2', 'Otra tarea', 'no-es-un-booleano')")`). SQLite, por su tipado dinámico, podría aceptar silenciosamente ese valor incorrecto — diagnostica confirmando que esta es precisamente una limitación de SQLite puro que Room mitiga: al generar el código de acceso desde tipos Kotlin fuertemente tipados (`Boolean`), Room nunca permitiría que un valor de tipo incorrecto llegue a insertarse en primer lugar, algo que SQLite sin esa capa adicional no garantiza por sí solo.

#### Paso 5 · Práctica guiada

Agrega una segunda entidad `Ruta` a `AppDatabase.kt` (con `id`, `nombre`) y su propio `RutaDao`, y confirma con un script `sqlite3` equivalente que ambas tablas pueden coexistir en la misma base de datos sin conflicto. **Pista:** agrega `Ruta::class` a la lista `entities` de `@Database`.

#### Paso 6 · Práctica independiente

Documenta en una frase qué error de compilación esperarías de Room (no solo en tiempo de ejecución) si escribieras `@Query("SELECT * FROM TareaQueNoExiste")` referenciando una tabla que nunca declaraste como `@Entity`.

#### Paso 7 · Cierre y evidencia

Ya declaras `@Entity`, `@Dao` y `@Database` de Room, y explicas cómo verifica las queries en tiempo de compilación frente al tipado dinámico de SQLite puro. El siguiente tema conecta esta capa con `Flow` reactivo y las migraciones de esquema. **Evidencia:** entrega el resultado del rechazo de SQLite ante una columna inexistente, y explica por qué Room detecta ese mismo tipo de error antes, en tiempo de compilación. Fuente oficial: [Android Developers — Room persistence library](https://developer.android.com/training/data-storage/room).

**Errores comunes:** olvidar `@PrimaryKey` en una `@Entity`, lo cual Room rechaza en tiempo de compilación; devolver tipos no soportados directamente desde un `@Dao` sin un `TypeConverter` para tipos complejos.

**Cuándo no usarlo:** para datos puramente transitorios que no necesitan sobrevivir ni siquiera un cierre normal de la app (Módulo 1, Tema 2: `remember` simple), Room es una capa de persistencia innecesaria; resérvalo para datos que deben sobrevivir entre sesiones completas de la app.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Persiste guías y eventos de sincronización mediante entidades y DAOs separados. Reinicia la app sin red y verifica que la ruta guardada sigue disponible con sus estados pendientes.

### Tema 2: Room + Flow reactivo, y migraciones

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar por qué un DAO que devuelve `Flow` mantiene la UI sincronizada automáticamente, y escribir una migración que preserve datos existentes.

**Conocimiento previo:** Tema 1 de este módulo; `StateFlow` (Módulo 4).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un DAO que devuelve `Flow` mantiene la UI sincronizada automáticamente con los cambios en la base de datos, sin consultas manuales repetidas; las migraciones permiten evolucionar el esquema sin perder los datos ya almacenados en el dispositivo del usuario.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** la UI se actualiza automáticamente cuando cambian los datos subyacentes.

Un DAO que devuelve `Flow<List<Tarea>>` en vez de `List<Tarea>` establece una suscripción reactiva: Room emite automáticamente una nueva lista cada vez que los datos de la tabla cambian, sin que el desarrollador consulte manualmente de nuevo. Esto encaja directamente con `StateFlow` en el `ViewModel` (Módulo 4), cerrando el flujo reactivo completo desde la base de datos hasta la pantalla. A medida que el esquema evoluciona, una migración declara explícitamente cómo transformar los datos existentes hacia el nuevo esquema, sin perderlos; omitir una migración necesaria provoca una excepción en tiempo de ejecución por discrepancia de versión.

**Analogía:** un `Flow` de Room es como una suscripción a las actualizaciones de un tablero público que notifica automáticamente a todos los suscriptores cada vez que cambia algo, en vez de que cada interesado revise manualmente. Una migración es como una remodelación cuidadosa de un edificio habitado que preserva todo el contenido existente mientras agrega una habitación nueva.

**Diagrama:**

```
┌── Room table cambia (insert/update/delete) ──┐
└──────────┬─────────────────────────┘
           │ Flow emite automáticamente la nueva lista
           ▼
┌── StateFlow del ViewModel se actualiza ──────┐
└──────────┬─────────────────────────┘
           │
           ▼
┌── UI recompone (Módulo 2) ───────────────────┐
└───────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea `app/src/main/kotlin/com/academia/android/Migraciones.kt`, validando la migración equivalente contra SQLite real antes:

```bash
# Este script python3 (vía sqlite3) ejecuta la migración real y confirma que preserva los datos
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/Migraciones.kt <<'EOF'
package com.academia.android

import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE Tarea ADD COLUMN prioridad INTEGER NOT NULL DEFAULT 0")
    }
}
EOF
python3 -c "
import sqlite3
con = sqlite3.connect(':memory:')
# versión 1 del esquema, con datos ya existentes del usuario
con.execute('CREATE TABLE Tarea (id TEXT PRIMARY KEY, titulo TEXT, completada INTEGER)')
con.execute(\"INSERT INTO Tarea VALUES ('1', 'Comprar leche', 0)\")
con.execute(\"INSERT INTO Tarea VALUES ('2', 'Pagar alquiler', 1)\")
print('antes de migrar:', con.execute('SELECT * FROM Tarea').fetchall())

# la migración real (idéntica a MIGRATION_1_2 en SQL)
con.execute('ALTER TABLE Tarea ADD COLUMN prioridad INTEGER NOT NULL DEFAULT 0')
print('después de migrar:', con.execute('SELECT * FROM Tarea').fetchall())
con.close()
"
```

**Ejecuta el ejemplo** (en un proyecto Android con Gradle, compila e instala en un emulador):

```bash
./gradlew assembleDebug
./gradlew test
```


**Explicación línea por línea:** `MIGRATION_1_2` declara explícitamente el `ALTER TABLE` que transforma la versión 1 del esquema a la versión 2; el script Python ejecuta ese mismo SQL literal contra una base de datos SQLite real con datos preexistentes, confirmando que las dos filas ya insertadas sobreviven la migración con el nuevo valor por defecto (`0`) para la columna agregada.

Simula el escenario de omitir la migración: una discrepancia entre la versión de esquema declarada y la que existe realmente en el archivo de base de datos:

```bash
python3 -c "
import sqlite3
con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE Tarea (id TEXT PRIMARY KEY, titulo TEXT, completada INTEGER)')
con.execute(\"INSERT INTO Tarea VALUES ('1', 'Comprar leche', 0)\")

# la app AHORA espera la columna 'prioridad' (versión 2), pero la migración nunca se aplicó
try:
    con.execute('SELECT prioridad FROM Tarea').fetchall()
    print('INESPERADO: la columna existe sin migración')
except sqlite3.OperationalError as e:
    print('Discrepancia de esquema detectada:', e)
con.close()
"
```

**Resultado esperado:** el primer script confirma que ambas tareas preexistentes sobreviven la migración, ahora con `prioridad = 0`; el segundo confirma que, sin aplicar la migración, consultar la columna nueva falla con `no such column: prioridad`, exactamente la discrepancia que Room detecta y convierte en una excepción explícita en tiempo de ejecución si la migración correspondiente no se declaró.

**Fallo deliberado:** en vez de `ALTER TABLE`, simula "perder los datos" recreando la tabla desde cero (`DROP TABLE Tarea; CREATE TABLE Tarea (...)` con la nueva columna, sin ningún `INSERT` de los datos anteriores). Verifica que la tabla ahora está vacía — diagnostica confirmando exactamente el error que una migración mal escrita (o la estrategia destructiva `fallbackToDestructiveMigration()` de Room) provocaría: perder todos los datos existentes del usuario en vez de preservarlos, la razón por la que declarar una migración explícita y correcta importa.

#### Paso 5 · Práctica guiada

Escribe una segunda migración `MIGRATION_2_3` (agregando una columna `fechaVencimiento`) y extiende el script de verificación para confirmar que aplicar ambas migraciones en secuencia (`1→2` luego `2→3`) preserva los datos originales con ambas columnas nuevas presentes. **Pista:** aplica los dos `ALTER TABLE` en secuencia sobre la misma conexión SQLite.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué un DAO que devuelve `Flow<List<Tarea>>` haría innecesario, en la mayoría de los casos, un botón de "refrescar" manual en la UI, a diferencia de un DAO que devolviera `List<Tarea>` simple.

#### Paso 7 · Cierre y evidencia

Ya explicas por qué un `Flow` de Room mantiene la UI sincronizada automáticamente, y escribes migraciones que preservan datos existentes al evolucionar el esquema. El siguiente tema construye sobre esto la estrategia offline-first completa. **Evidencia:** entrega el resultado de la migración preservando ambas tareas existentes, y el error de discrepancia de esquema al omitirla. Fuente oficial: [Android Developers — Migrate your Room database](https://developer.android.com/training/data-storage/room/migrating-db-versions).

**Errores comunes:** usar `fallbackToDestructiveMigration()` en producción, perdiendo silenciosamente todos los datos del usuario ante cualquier cambio de esquema no migrado explícitamente; olvidar incrementar la `version` en `@Database` al agregar una migración nueva.

**Cuándo no usarlo:** durante desarrollo temprano sin usuarios reales todavía, `fallbackToDestructiveMigration()` es aceptable y ahorra esfuerzo; en cuanto existen usuarios con datos reales, las migraciones explícitas dejan de ser opcionales.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Añade una columna de intento de entrega mediante migración. Abre una base de la versión anterior y verifica tanto los registros conservados como la actualización reactiva de la lista después de escribir.

### Tema 3: Estrategia offline-first

#### Paso 1 · Objetivo y preparación

Al finalizar podrás implementar un repositorio donde la UI siempre lee del caché local mientras la red sincroniza en segundo plano.

**Conocimiento previo:** Temas 1 y 2 de este módulo; Retrofit (Módulo 5).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Offline-first mejora la experiencia incluso con buena conexión (datos instantáneos desde el caché local mientras la sincronización ocurre en background) y mantiene la app funcional incluso sin conexión a internet, en vez de depender directamente y de forma bloqueante de la red en cada renderizado.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** la UI lee siempre de la fuente local, la red sincroniza en segundo plano.

Una estrategia offline-first invierte el orden de prioridad habitual entre red y caché: la UI siempre lee del caché local (Room, vía `Flow`, Tema 2), mientras un proceso de sincronización separado actualiza ese caché en segundo plano con datos frescos de la API (Módulo 5). Esto significa que la app permanece funcional (mostrando al menos los últimos datos sincronizados) incluso sin conexión, en vez de mostrar un error o carga indefinida. Esta estrategia mejora la experiencia incluso con buena conexión: la UI muestra datos instantáneamente sin esperar latencia de red.

**Analogía:** offline-first es como un noticiero que siempre muestra las últimas noticias impresas disponibles (el caché local), mientras un equipo de reporteros trabaja en segundo plano recabando noticias más recientes, en vez de dejar la pantalla en blanco esperando una noticia nueva desde el terreno.

**Diagrama:**

```
┌── UI ──────────────┐
│  SIEMPRE lee de       │
└──────────┬─────────┘
           ▼
┌── Room (Flow reactivo) ──────┐
│         ▲                          │
│         │ Repositorio sincroniza      │
│         │ en background                 │
│         ▼                                 │
└── API remota (Módulo 5) ───────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea `app/src/main/kotlin/com/academia/android/TareaRepository.kt`. Ejecuta `python3` y `gradle` para validar el comportamiento offline-first:

```bash
# Este script python3 simula, con sqlite3 real, que la UI sigue funcionando sin red
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/TareaRepository.kt <<'EOF'
package com.academia.android

import kotlinx.coroutines.flow.Flow

interface TareaRepository {
    val tareas: Flow<List<Tarea>> // la UI SIEMPRE lee de aquí
    suspend fun sincronizar()
}

class TareaRepositoryImpl(private val dao: TareaDao, private val api: ApiService) : TareaRepository {
    override val tareas: Flow<List<Tarea>> = dao.observarTodas()

    override suspend fun sincronizar() {
        val remotas = api.obtenerTareas()
        remotas.forEach { dao.insertar(Tarea(it.id, it.titulo, false)) } // sincroniza en background
    }
}
EOF
python3 -c "
import sqlite3

con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE Tarea (id TEXT PRIMARY KEY, titulo TEXT, completada INTEGER)')

def sincronizar_desde_api_simulada(conexion_disponible):
    if not conexion_disponible:
        print('sin conexión: la sincronización no ocurre, pero la UI sigue leyendo del caché existente')
        return
    con.execute(\"INSERT OR REPLACE INTO Tarea VALUES ('1', 'Comprar leche (actualizado de la API)', 0)\")
    print('sincronización exitosa: caché actualizado con datos frescos')

def ui_lee_siempre_de_room():
    return con.execute('SELECT * FROM Tarea').fetchall()

con.execute(\"INSERT INTO Tarea VALUES ('1', 'Comprar leche (versión local)', 0)\")
print('UI muestra (antes de cualquier sincronización):', ui_lee_siempre_de_room())

sincronizar_desde_api_simulada(conexion_disponible=False)  # simula estar sin conexión
print('UI sigue mostrando (sin conexión, offline-first):', ui_lee_siempre_de_room())

sincronizar_desde_api_simulada(conexion_disponible=True)  # la conexión vuelve
print('UI muestra (tras sincronizar con éxito):', ui_lee_siempre_de_room())
con.close()
"
```

**Ejecuta el ejemplo** (en un proyecto Android con Gradle, compila e instala en un emulador):

```bash
./gradlew assembleDebug
./gradlew test
```


**Explicación línea por línea:** `TareaRepository` se declara como interfaz (no como clase concreta) desde ahora, para poder inyectarla con Hilt (Módulo 7) y sustituirla por un fake en tests (Módulo 9) más adelante sin cambiar el código que la consume; `TareaRepositoryImpl.tareas` expone directamente `dao.observarTodas()` como la única fuente que la UI consulta; `sincronizar()` es un método completamente separado que actualiza la base de datos en background — la UI nunca llama directamente a `api.obtenerTareas()`, solo observa `tareas`, que siempre refleja el estado del caché local, se haya sincronizado recientemente o no.

**Resultado esperado:** la UI muestra la versión local incluso sin conexión (no un error ni una pantalla vacía), y automáticamente refleja los datos frescos después de una sincronización exitosa, sin que el código de la UI necesite cambiar en absoluto entre ambos escenarios — el mismo `SELECT * FROM Tarea` de siempre, con el contenido que Room mantiene actualizado.

**Fallo deliberado:** reescribe `ui_lee_siempre_de_room` para que, en su lugar, llame directamente a una función simulada de red (`obtener_de_api_directamente(conexion_disponible)` que lanza una excepción si `conexion_disponible=False`). Repite la secuencia sin conexión — la función lanzaría una excepción en vez de mostrar cualquier dato — diagnostica confirmando exactamente el problema que offline-first evita: una UI acoplada directamente a la red se queda sin nada que mostrar (o en un estado de error) apenas falla la conexión, mientras que una UI acoplada al caché local (Room) siempre tiene algo razonable que mostrar.

#### Paso 5 · Práctica guiada

Agrega un `StateFlow<Boolean>` adicional a `TareaRepositoryImpl` llamado `sincronizando` (y su declaración correspondiente en la interfaz `TareaRepository`), que se ponga en `true` al inicio de `sincronizar()` y en `false` al final, permitiendo que la UI muestre un indicador sutil de sincronización en progreso sin bloquear la visualización de los datos ya cacheados. **Pista:** este indicador es un buen candidato para exponerse junto al `Flow` principal de tareas, no en su reemplazo.

#### Paso 6 · Práctica independiente

Documenta en una frase qué pasaría con la experiencia de usuario si `sincronizar()` lanzara una excepción de red no capturada (por ejemplo, un `IOException`, Módulo 5) y esa excepción no se manejara dentro del propio repositorio, relacionándolo con por qué offline-first exige manejar errores de sincronización sin que afecten la lectura del caché ya exitosa.

#### Paso 7 · Cierre y evidencia

Ya implementas un repositorio offline-first donde la UI siempre lee del caché local mientras la red sincroniza en segundo plano, sin acoplar la disponibilidad de la app a la conectividad. Esto cierra el módulo de persistencia local; el siguiente módulo del track aborda trabajo en background con WorkManager. **Evidencia:** entrega el resultado mostrando que la UI sigue mostrando datos sin conexión y se actualiza tras sincronizar, y explica por qué una UI acoplada directamente a la red no tendría ese mismo comportamiento. Fuente oficial: [Android Developers — Offline-first apps](https://developer.android.com/topic/architecture/data-layer/offline-first).

**Errores comunes:** hacer que la UI dependa directamente de la respuesta de la API en vez de Room, rompiendo offline-first; no separar la lectura (siempre local) de la sincronización (en background), acoplando accidentalmente ambas responsabilidades.

**Cuándo no usarlo:** para una app que requiere estrictamente datos en tiempo real sin ninguna tolerancia a mostrar información potencialmente desactualizada (por ejemplo, un panel de precios de trading en vivo), offline-first no es apropiado; ese caso prioriza mostrar solo datos verificados como actuales, incluso si eso implica no mostrar nada mientras no hay conexión.

---

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Haz que la lista lea desde Room y que la sincronización actualice esa fuente. Crea un cambio offline, reinicia y reconecta; demuestra que el cambio no desaparece entre la caché y el servidor.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una app con caché local en Room que funciona sin conexión a internet.

**Requisitos previos:** Módulo 5 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Definir `@Entity Tarea` y `@Dao` con `Flow<List<Tarea>>` | Ver Tema 1 | CRUD tipado y verificado en compilación |
| 2 | Observar el `Flow` desde el `ViewModel` | Ver Tema 2 | Confirma actualización automática de la UI |
| 3 | Agregar una migración de esquema | Ver Tema 2 | Añade columna sin perder datos existentes |
| 4 | Implementar offline-first: UI lee de Room, repositorio sincroniza | Ver Tema 3 | Sincronización en background |

**Verificación:** el laboratorio se considera exitoso si la app muestra datos correctamente incluso con el dispositivo en modo avión (usando el último caché sincronizado), y si la migración de esquema preserva los datos existentes al agregar la nueva columna.

**Errores comunes y soluciones**

- **Hacer que la UI dependa directamente de la respuesta de la API en vez de Room.** Rompe offline-first; la UI debe leer siempre del caché local.
- **Omitir la migración al cambiar el esquema.** Provoca una excepción en tiempo de ejecución por discrepancia de versión de esquema.
- **Devolver `List<Tarea>` en vez de `Flow<List<Tarea>>` desde el DAO.** Pierde la actualización automática reactiva de la UI ante cambios en los datos.

---
