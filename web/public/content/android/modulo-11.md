# Módulo 11: Publicación en Google Play


## Aprende construyendo

### Tema 1: Firma de la app · Avanzado · 40 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás generar una keystore real, configurar la firma de un build de release leyendo credenciales desde variables de entorno, y explicar por qué perder la keystore original es en gran medida irreversible.

**Conocimiento previo:** Gradle (Módulo 0 de este track); gestión de secretos (DevOps, Módulo 11).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** La firma verifica que las actualizaciones futuras provienen del mismo desarrollador original. En Google Play, las apps nuevas usan obligatoriamente Play App Signing: tú firmas con una **clave de subida** y Google firma lo que instalan los usuarios con la **clave de firma de la app**. Perder la clave de subida se resuelve con un restablecimiento en Play Console; perder la clave de firma sin Play App Signing impide publicar actualizaciones.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** identidad criptográfica de la app, requisito de Play para actualizaciones.

Firmar una app establece su identidad criptográfica. Android solo instala una actualización si está firmada con la misma clave de firma de la app que la versión instalada. Con Play App Signing, esa clave la custodia Google; tu keystore contiene la clave de subida, con la que Play Console comprueba que cada subida viene de ti y rechaza las firmadas con otra clave. Leer las credenciales desde variables de entorno (`System.getenv(...)`) en vez de hardcodearlas evita que queden expuestas en el control de versiones, el mismo principio de mantener secretos fuera del código (DevOps, Módulo 11).

**Analogía:** la firma de una app es como el sello notarial único de un documento oficial: cualquier "actualización" sin ese mismo sello exacto se rechaza como potencialmente fraudulenta, y perder el sello original hace imposible certificar futuras versiones bajo la misma identidad legal.

**Diagrama:**

```
┌── tu clave de subida (academia-upload.jks) ──┐
│  firma el .aab que subes a Play Console          │
└──────────┬─────────────────────────────┘
           │ Play comprueba la clave de subida
           ▼
┌── Play App Signing (clave de firma de la app) ┐
│  Google firma los APK que instalan los usuarios    │
│  clave de subida perdida → restablecimiento        │
└───────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Continuando en `academia-android` (el proyecto creado en el Módulo 0; si no lo tienes, créalo primero con su Tema 1), genera tu **clave de subida** con `keytool` (la misma herramienta que Android Studio usa internamente) **fuera del repositorio**, y configura la firma de release leyendo ruta y contraseñas desde variables de entorno:

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p "$HOME/claves-android"                        # fuera del proyecto: nunca se sube a Git
export KEYSTORE_PATH="$HOME/claves-android/academia-upload.jks"
export KEYSTORE_PASSWORD="clave-de-prueba-academia"
export KEY_PASSWORD="clave-de-prueba-academia"
keytool -genkeypair -v -keystore "$KEYSTORE_PATH" -alias subida \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$KEYSTORE_PASSWORD" -keypass "$KEY_PASSWORD" \
  -dname "CN=The Imperial Book, OU=Desarrollo, O=Academia, L=Ciudad, S=Estado, C=CL"
# por si alguien copia una clave dentro del proyecto, que Git la ignore
grep -qx '*.jks' .gitignore 2>/dev/null || echo '*.jks' >> .gitignore
```

Ahora edita el `app/build.gradle.kts` **real** (no un archivo aparte, que Gradle nunca leería). Dentro del bloque `android { }` que ya existe, añade `signingConfigs` y asígnalo al tipo de build `release` que ya trae la plantilla:

```kotlin
android {
    // ...lo que ya tienes...
    signingConfigs {
        create("release") {
            storeFile = System.getenv("KEYSTORE_PATH")?.let { file(it) }
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = "subida"
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            // ...lo que ya tienes (isMinifyEnabled, proguardFiles)...
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

Genera el App Bundle firmado desde la misma terminal (para que vea las variables de entorno) y comprueba con qué certificado quedó firmado:

```bash
./gradlew :app:bundleRelease
keytool -printcert -jarfile app/build/outputs/bundle/release/app-release.aab | grep "SHA256:"
```


**Explicación línea por línea:** `keytool -genkeypair` genera un par de claves RSA real y lo almacena en `academia-upload.jks`, fuera del proyecto y protegido por `storepass`/`keypass`; `-validity 10000` establece que el certificado es válido por unos 27 años (Google recomienda una validez larga, dado que la keystore debe seguir siendo válida para toda la vida útil de la app); el bloque `signingConfigs` lee la ruta y las credenciales desde `System.getenv(...)`, nunca hardcodeadas en el archivo, y `signingConfig = …` lo aplica al build `release`, que es el que `bundleRelease` produce.

Verifica con `keytool` real que la keystore generada contiene el certificado esperado, y confirma su huella digital (fingerprint), el valor que Google Play y otros sistemas usan para verificar la identidad de la firma:

```bash
keytool -list -v -keystore "$KEYSTORE_PATH" -alias subida -storepass "$KEYSTORE_PASSWORD" | grep "SHA256:"
```

**Resultado esperado:** el comando muestra la huella digital SHA-256 del certificado generado, y es **la misma** que imprimió `keytool -printcert` sobre `app-release.aab`: el bundle quedó firmado con tu clave de subida. Con Play App Signing (obligatorio para apps nuevas en Google Play), esa es la huella que Play registra para aceptar tus subidas; Play vuelve a firmar los APK que instalan los usuarios con la **clave de firma de la app**, que Google custodia.

**Fallo deliberado:** genera una segunda keystore distinta (`keytool -genkeypair -v -keystore "$HOME/claves-android/otra.jks" -alias subida -keyalg RSA -keysize 2048 -validity 10000 -storepass "otra-clave" -keypass "otra-clave" -dname "CN=Otro,OU=Otro,O=Otro,L=Otro,S=Otro,C=CL"`) y compara su huella digital con la primera:

```bash
keytool -list -v -keystore "$HOME/claves-android/otra.jks" -alias subida -storepass "otra-clave" | grep "SHA256:"
keytool -list -v -keystore "$KEYSTORE_PATH" -alias subida -storepass "$KEYSTORE_PASSWORD" | grep "SHA256:"
```

Las huellas digitales son completamente distintas. **Diagnóstico:** ambas claves pueden firmar técnicamente el mismo AAB, pero Play Console rechaza una subida firmada con una clave de subida distinta de la registrada. Con Play App Signing esto **no** es irreversible: si pierdes la clave de subida o se filtra, generas una nueva y solicitas en Play Console el restablecimiento de la clave de subida; la clave de firma de la app que reciben los usuarios no cambia. Solo las apps antiguas que no usan Play App Signing y pierden su clave de firma pierden la capacidad de publicar actualizaciones.

#### Paso 5 · Práctica guiada

Genera un segundo alias dentro de la misma keystore (`keytool -genkeypair -keystore "$KEYSTORE_PATH" -alias subida-pruebas ...`) y usa `keytool -list -keystore "$KEYSTORE_PATH"` (sin `-alias`) para listar todos los alias contenidos, confirmando que una única keystore puede almacenar múltiples identidades de firma distintas. **Pista:** una keystore es, en esencia, un contenedor de múltiples pares de claves, cada uno identificado por su propio alias.

#### Paso 6 · Práctica independiente

Documenta en una frase qué harías si sospecharas que tu clave de subida se filtró (por ejemplo, se subió accidentalmente a un repositorio público): con Play App Signing, genera una clave nueva y solicita en Play Console el restablecimiento de la clave de subida. Explica también por qué la clave de firma de la app, en cambio, no se rota como una API key.

#### Paso 7 · Cierre

Ya generas una clave de subida fuera del repositorio, la configuras desde variables de entorno, produces un `.aab` firmado y distingues la clave de subida (restablecible en Play Console) de la clave de firma de la app (custodiada por Google con Play App Signing). El siguiente tema cubre el formato de artefacto que Google Play requiere para la distribución. Fuente oficial: [Android Developers — Sign your app](https://developer.android.com/studio/publish/app-signing).

**Errores comunes:** hardcodear las credenciales de la keystore en `build.gradle.kts`, exponiéndolas en el control de versiones; guardar la keystore dentro del proyecto (acaba en Git) y no tener un respaldo seguro de la clave de subida: con Play App Signing se puede restablecer, pero el proceso detiene tus publicaciones mientras tanto.

**Cuándo no usarlo:** para un build de debug usado exclusivamente en desarrollo local, la keystore de debug automática que Android Studio genera es suficiente; la keystore de release, gestionada con el cuidado de este Tema, es específicamente para builds destinados a publicación real.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Prepara una variante de prueba firmada y registra la huella del certificado sin guardar la clave en Git. Instala dos versiones consecutivas con esa firma y comprueba que la actualización conserva las entregas locales.

### Tema 2: App Bundle vs APK · Avanzado · 40 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar por qué Google Play requiere un App Bundle en vez de un APK universal, y cómo eso reduce el tamaño de descarga real por dispositivo.

**Conocimiento previo:** Tema 1 de este módulo; Gradle (Módulo 0).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Google Play requiere un App Bundle en vez de un APK universal porque permite generar APKs optimizados por dispositivo a partir de un único artefacto, reduciendo el tamaño de descarga real para cada usuario sin trasladar esa responsabilidad de optimización al desarrollador.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** optimización de descarga por dispositivo, generada por Play a partir de un único artefacto.

Google Play requiere subir un App Bundle (`.aab`) en vez de un APK universal: a partir de ese único bundle, Play genera automáticamente APKs optimizados y específicos para cada combinación de arquitectura de CPU, idioma y densidad de pantalla del dispositivo de cada usuario, reduciendo el tamaño de descarga comparado con un APK universal que incluiría recursos para todas las configuraciones posibles simultáneamente. Este modelo traslada la responsabilidad de optimización de tamaño desde el desarrollador hacia la infraestructura de Google Play.

**Analogía:** un App Bundle es como enviar el molde maestro completo de un producto a un centro de distribución que fabrica localmente la versión exacta que cada tienda regional necesita, en vez de fabricar de antemano una única versión universal que contenga todas las variantes posibles simultáneamente.

**Diagrama:**

```
┌── app-release.aab (UN único artefacto) ──────┐
└──────────┬─────────────────────────────┘
           │ Google Play genera automáticamente
     ┌─────┼──────────┬──────────────┐
     ▼                 ▼               ▼
APK (ARM64,      APK (x86,        APK (ARM64,
 español,          inglés,          portugués,
 xxhdpi)           hdpi)            xhdpi)
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (el proyecto del Módulo 0) y crea, dentro de `app/src/`, un modelo con archivos reales de distinto tamaño que represente la diferencia entre un artefacto universal y artefactos optimizados por configuración:

```bash
# modela lo que Gradle produciría con ./gradlew bundleRelease, antes de medir el efecto real
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src
mkdir -p simulacion-bundle/recursos-es simulacion-bundle/recursos-en simulacion-bundle/recursos-pt
# genera contenido real (no solo metadatos) para medir tamaño real en disco
for idioma in es en pt; do
  head -c $((50 * 1024)) /dev/urandom > "simulacion-bundle/recursos-$idioma/strings.dat"
done
cat simulacion-bundle/recursos-es/strings.dat simulacion-bundle/recursos-en/strings.dat simulacion-bundle/recursos-pt/strings.dat > simulacion-bundle/apk-universal-simulado.dat
ls -la simulacion-bundle/*.dat simulacion-bundle/recursos-*/*.dat
```

**Ejecuta el ejemplo** (en un proyecto Android con Gradle, compila e instala en un emulador):

```bash
./gradlew assembleDebug
./gradlew test
```


**Explicación línea por línea:** cada archivo `recursos-<idioma>/strings.dat` simula los recursos reales de un idioma específico (50 KB de datos reales, generados con `head -c ... /dev/urandom` para que el tamaño en disco sea genuino, no solo un número); `apk-universal-simulado.dat` concatena los tres, representando un APK universal que debe incluir TODOS los idiomas simultáneamente sin saber cuál necesitará cada usuario.

Mide, con `ls -la` (tamaños reales en disco), cuánto pesaría descargar el "APK universal" frente a un "APK optimizado" que solo incluye el idioma del dispositivo del usuario:

```bash
tamano_universal=$(stat -c%s simulacion-bundle/apk-universal-simulado.dat 2>/dev/null || stat -f%z simulacion-bundle/apk-universal-simulado.dat)
tamano_optimizado=$(stat -c%s simulacion-bundle/recursos-es/strings.dat 2>/dev/null || stat -f%z simulacion-bundle/recursos-es/strings.dat)
echo "tamaño del 'APK universal' (los 3 idiomas): $tamano_universal bytes"
echo "tamaño del 'APK optimizado' (solo español, generado por Play): $tamano_optimizado bytes"
awk -v u="$tamano_universal" -v o="$tamano_optimizado" 'BEGIN { printf "reducción real: %.1f%%\n", (1 - o/u) * 100 }'
```

**Resultado esperado:** el "APK universal" pesa aproximadamente 150 KB (los tres idiomas concatenados), mientras que el "APK optimizado" para un usuario específico (solo español) pesa aproximadamente 50 KB, una reducción real medible de aproximadamente 66%, ilustrando concretamente por qué generar APKs optimizados por configuración reduce el tamaño de descarga real que recibe cada usuario individual.

**Fallo deliberado:** intenta generar un "APK optimizado" que, por un error de configuración del bundle, incluya accidentalmente los tres idiomas de todas formas (`cat simulacion-bundle/recursos-*/strings.dat > simulacion-bundle/apk-mal-configurado.dat`) en vez de solo el correspondiente al dispositivo. Compara su tamaño con el optimizado correcto — es idéntico al "universal" — diagnostica confirmando el problema real mencionado en los casos de uso de este Tema: un recurso pesado incluido por error en todas las variantes anula la ventaja del App Bundle, exactamente lo que el App Bundle Explorer de Android Studio ayuda a detectar antes de un release.

#### Paso 5 · Práctica guiada

Extiende la simulación agregando una cuarta variante de densidad de pantalla (`xxhdpi`, con recursos de imagen de mayor tamaño, por ejemplo 200 KB) y calcula cuánto pesaría un APK universal que incluya las 3 combinaciones de idioma × 2 densidades (6 combinaciones) frente a un APK optimizado para una única combinación específica. **Pista:** multiplica el número de combinaciones por el tamaño promedio de cada una para el caso universal.

#### Paso 6 · Práctica independiente

Documenta en una frase, usando tus propios números reales (ejecutando `./gradlew bundleRelease` sobre un proyecto real si tienes uno, o estimando según los idiomas y densidades que tu app soporta), qué reducción de tamaño de descarga esperarías para tus propios usuarios comparado con un APK universal hipotético.

#### Paso 7 · Cierre

Ya explicas por qué Google Play requiere un App Bundle en vez de un APK universal, y mides concretamente la reducción de tamaño que esto representa para cada usuario. El siguiente tema cubre el versionado y los tracks progresivos de validación antes de producción. Fuente oficial: [Android Developers — About Android App Bundles](https://developer.android.com/guide/app-bundle).

**Errores comunes:** incluir por error un recurso pesado en todas las variantes del bundle, anulando la ventaja de tamaño; seguir generando y distribuyendo un APK universal manualmente en vez de adoptar el formato `.aab` requerido por Play.

**Cuándo no usarlo:** para distribuir una app fuera de Google Play (por ejemplo, un APK de prueba compartido directamente por email o instalado manualmente sin pasar por ninguna tienda), un APK universal generado directamente sigue siendo necesario, dado que no hay ninguna infraestructura de Play que genere variantes optimizadas fuera de la tienda.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Genera el App Bundle de la app de reparto con `./gradlew bundleRelease` y revisa con App Bundle Explorer que los recursos de idioma/densidad no se dupliquen entre variantes. Verifica con un número real cuánto pesa la APK que Play entregaría a un conductor con un dispositivo de gama media en español, frente al universal.

### Tema 3: Versionado, tracks y políticas · Avanzado · 40 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás distinguir `versionCode` de `versionName`, y explicar el propósito de los tracks progresivos de validación en Play Console.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** `versionCode` y `versionName` cumplen roles distintos (ordenamiento técnico interno vs comunicación legible al usuario); los tracks de Play Console permiten detectar problemas con impacto limitado antes del lanzamiento completo; las políticas de Play pueden causar rechazo o suspensión incluso después de una publicación inicial exitosa.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** dos identificadores con propósitos distintos, validación gradual antes de producción.

`versionCode` es un entero que debe incrementarse estrictamente en cada release subido a Play Console, usado internamente para determinar cuál build es "más nueva"; `versionName` es un string libre, visible al usuario, típicamente siguiendo versionado semántico. Cada track de Play Console (Pruebas internas → cerradas → abiertas → Producción) permite validar la app progresivamente con un grupo cada vez más amplio de usuarios reales, detectando problemas con impacto limitado antes de exponer la app a toda la base de usuarios.

**Analogía:** `versionCode` es como el número de serie interno incremental de un producto industrial; `versionName` es como el nombre comercial de la versión que ve el consumidor. Los tracks de Play son como fases sucesivas de un ensayo clínico, cada una reduciendo el riesgo antes de la aprobación completa.

**Diagrama:**

```
┌── versionCode: 11 → 12 → 13 ── entero, SIEMPRE incremental, uso interno de Play ┐
└─────────────────────────────────────────────────────────┘
┌── versionName: "1.2.0" → "1.3.0" ── string semver, visible al usuario ────────┐
└─────────────────────────────────────────────────────────┘
┌── Pruebas internas → Pruebas cerradas → Pruebas abiertas → Producción ────────┐
└─────────────────────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (el proyecto del Módulo 0) y crea `app/build.gradle.kts.fragmento-version` verificando programáticamente la regla de incremento estricto:

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app
cat > app/build.gradle.kts.fragmento-version <<'EOF'
android {
    defaultConfig {
        versionCode = 12
        versionName = "1.3.0"
    }
}
EOF
version_code=$(grep -oE 'versionCode = [0-9]+' app/build.gradle.kts.fragmento-version | grep -oE '[0-9]+')
version_name=$(grep -oE 'versionName = "[^"]+"' app/build.gradle.kts.fragmento-version | sed -E 's/versionName = "(.*)"/\1/')
echo "versionCode actual: $version_code"
echo "versionName actual: $version_name"
if [[ "$version_name" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "versionName sigue semver correctamente (MAJOR.MINOR.PATCH)"
else
  echo "versionName NO sigue MAJOR.MINOR.PATCH" >&2
  exit 1
fi
```

**Ejecuta el ejemplo** (en un proyecto Android con Gradle, compila e instala en un emulador):

```bash
./gradlew assembleDebug
./gradlew test
```


**Explicación línea por línea:** `versionCode = 12` es el entero que Play Console compara contra el último ya publicado; `versionName = "1.3.0"` es el string que el usuario ve en la ficha de la app; el `grep`/`sed` extraen ambos valores del fragmento real, y la expresión regular de bash (`[[ ... =~ ... ]]`) confirma que `versionName` efectivamente sigue el formato `MAJOR.MINOR.PATCH` de versionado semántico.

Simula, con una lista de releases ya publicados, la regla real de Play Console que rechaza un `versionCode` menor o igual al ya existente:

```bash
releases_ya_publicados=(10 11 12)  # versionCode ya subidos a Play

play_console_acepta_upload() {
  local nuevo_version_code="$1"
  local ultimo_publicado=0
  for vc in "${releases_ya_publicados[@]}"; do
    (( vc > ultimo_publicado )) && ultimo_publicado=$vc
  done
  (( nuevo_version_code > ultimo_publicado ))
}

for candidato in 12 13 5; do
  if play_console_acepta_upload "$candidato"; then
    echo "versionCode $candidato: ACEPTADO"
  else
    echo "versionCode $candidato: RECHAZADO"
  fi
done
```

**Resultado esperado:** `versionCode 12` (igual al último publicado) y `versionCode 5` (menor) son `RECHAZADOS`; solo `versionCode 13` (estrictamente mayor al último publicado, 12) es `ACEPTADO`, confirmando la regla real que Play Console aplica en cada upload.

**Fallo deliberado:** intenta subir un release con `versionName = "1.2.0"` (una versión "anterior" en semver) pero con `versionCode = 13` (correctamente incrementado). Según la simulación, Play Console lo aceptaría (`versionCode` es mayor) aunque el `versionName` sea confuso para el usuario — diagnostica confirmando que Play Console solo valida `versionCode` técnicamente; mantener `versionName` coherente con la progresión real de cambios es responsabilidad exclusiva del desarrollador, sin ninguna validación automática de la plataforma.

#### Paso 5 · Práctica guiada

Extiende la simulación de `play_console_acepta_upload` para que además valide que `versionName` no se repite exactamente entre releases (una buena práctica adicional, aunque Play no la exige), y prueba el caso de intentar reutilizar `"1.3.0"` para dos `versionCode` distintos. **Pista:** mantén un segundo conjunto (`set`) de `versionName` ya usados para verificar la no repetición.

#### Paso 6 · Práctica independiente

Documenta en una frase, para un cambio hipotético de tu propia app (una corrección de bug menor frente a una nueva funcionalidad grande), qué incremento de `versionName` semver aplicarías en cada caso (`PATCH` vs `MINOR`) y por qué esa distinción comunica algo útil a tus usuarios.

#### Paso 7 · Cierre

Ya distingues `versionCode` de `versionName`, y explicas el propósito de los tracks progresivos de validación antes de producción. Esto cierra el módulo de publicación en Google Play; el siguiente módulo del track aborda características avanzadas de la plataforma. Fuente oficial: [Android Developers — Set up your app's version code](https://developer.android.com/studio/publish/versioning).

**Errores comunes:** olvidar incrementar `versionCode` en un nuevo release, siendo rechazado por Play Console; ignorar la sección de Data Safety antes de publicar, arriesgando rechazo o suspensión de la app en revisión.

**Cuándo no usarlo:** para una app de distribución completamente interna (nunca publicada en Play Store, instalada manualmente vía APK en dispositivos de una organización), los tracks de Play Console no aplican; sin embargo, `versionCode`/`versionName` siguen siendo relevantes para cualquier mecanismo propio de control de versiones que la organización use.

---

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Define versiones para el canal interno de repartidores. Documenta qué build reemplaza a cuál y prueba una actualización con datos offline pendientes; el cambio de versión no debe borrar la cola de sincronización.

## Laboratorio práctico

**Objetivo del laboratorio:** generar un App Bundle firmado, listo para subir a un track de pruebas internas en Play Console.

**Requisitos previos:** Módulo 10 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Generar una keystore y configurar la firma | Ver Tema 1 | `signingConfigs` en `build.gradle.kts` |
| 2 | Generar el `.aab` firmado | `./gradlew bundleRelease` | En vez de un APK universal |
| 3 | Subir el `.aab` a pruebas internas | Play Console | Primer track de validación |
| 4 | Definir `versionCode`/`versionName` con semver | Ver Tema 3 | Incremental y legible respectivamente |
| 5 | Revisar al menos 3 políticas relevantes | Ver Tema 3 | Privacidad, permisos, contenido |

**Verificación:** el laboratorio se considera exitoso si el `.aab` generado está correctamente firmado con la keystore de release, y si se sube exitosamente al track de pruebas internas de Play Console sin errores de validación.

**Errores comunes y soluciones**

- **Hardcodear las credenciales de la keystore en `build.gradle.kts`.** Léelas desde variables de entorno para no exponerlas en el control de versiones.
- **Olvidar incrementar `versionCode` en un nuevo release.** Play rechaza el upload si no es estrictamente mayor al ya publicado.
- **Ignorar la sección de Data Safety antes de publicar.** Puede causar rechazo o suspensión de la app en revisión.

---
