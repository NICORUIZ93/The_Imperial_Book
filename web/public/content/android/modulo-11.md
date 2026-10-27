# Módulo 11: Publicación en Google Play


## Aprende construyendo

### Tema 1: Firma de la app

#### Paso 1 · Objetivo y preparación

Al finalizar podrás generar una keystore real, configurar la firma de un build de release leyendo credenciales desde variables de entorno, y explicar por qué perder la keystore original es en gran medida irreversible.

**Conocimiento previo:** Gradle (Módulo 0 de este track); gestión de secretos (DevOps, Módulo 11).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** La firma verifica que las actualizaciones futuras provienen del mismo desarrollador original; perder la keystore es en gran medida irreversible y puede forzar a republicar la app desde cero, perdiendo todo el historial acumulado.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** identidad criptográfica de la app, requisito de Play para actualizaciones.

Firmar una app con una keystore establece su identidad criptográfica: Google Play usa esa firma para verificar que una actualización futura efectivamente proviene del mismo desarrollador que la publicó originalmente, rechazando cualquier intento de subir una actualización firmada con una clave distinta. Leer las credenciales desde variables de entorno (`System.getenv(...)`) en vez de hardcodearlas evita que queden expuestas en el control de versiones, el mismo principio de mantener secretos fuera del código (DevOps, Módulo 11).

**Analogía:** la firma de una app es como el sello notarial único de un documento oficial: cualquier "actualización" sin ese mismo sello exacto se rechaza como potencialmente fraudulenta, y perder el sello original hace imposible certificar futuras versiones bajo la misma identidad legal.

**Diagrama:**

```
┌── keystore.jks (identidad criptográfica) ────┐
│  firma la app release v1.0                        │
└──────────┬─────────────────────────────┘
           │ actualización futura DEBE firmarse
           │ con la MISMA keystore
           ▼
┌── Google Play verifica la firma ─────────────┐
│  ¿misma keystore? → acepta la actualización         │
│  ¿keystore distinta? → RECHAZA (identidad no coincide) │
└───────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), genera una keystore real con `keytool` (la misma herramienta que Android Studio usa internamente) y crea `app/build.gradle.kts.fragmento` para leerla desde variables de entorno:

```bash
mkdir -p academia-android/app
cd academia-android
export KEYSTORE_PASSWORD="clave-de-prueba-academia"
export KEY_PASSWORD="clave-de-prueba-academia"
keytool -genkeypair -v -keystore app/keystore.jks -alias mi-app \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$KEYSTORE_PASSWORD" -keypass "$KEY_PASSWORD" \
  -dname "CN=The Imperial Book, OU=Desarrollo, O=Academia, L=Ciudad, S=Estado, C=CL"
cat > app/build.gradle.kts.fragmento <<'EOF'
android {
    signingConfigs {
        create("release") {
            storeFile = file("keystore.jks")
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = "mi-app"
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }
}
EOF
```

**Explicación línea por línea:** `keytool -genkeypair` genera un par de claves RSA real y lo almacena en `keystore.jks`, protegido por `storepass`/`keypass`; `-validity 10000` establece que el certificado es válido por unos 27 años (Google recomienda una validez larga, dado que la keystore debe seguir siendo válida para toda la vida útil de la app); el fragmento de `build.gradle.kts` lee esas mismas credenciales desde `System.getenv(...)`, nunca hardcodeadas en el archivo.

Verifica con `keytool` real que la keystore generada contiene el certificado esperado, y confirma su huella digital (fingerprint), el valor que Google Play y otros sistemas usan para verificar la identidad de la firma:

```bash
keytool -list -v -keystore app/keystore.jks -alias mi-app -storepass "$KEYSTORE_PASSWORD" | grep -A1 "SHA256:"
```

**Resultado esperado:** el comando muestra la huella digital SHA-256 real del certificado generado, un valor único que identifica criptográficamente esta keystore específica; cualquier actualización futura de la app deberá producir exactamente esta misma huella digital al firmarse, o Google Play la rechazará como proveniente de un desarrollador distinto.

**Fallo deliberado:** genera una segunda keystore distinta (`keytool -genkeypair -v -keystore app/keystore-otra.jks -alias mi-app -keyalg RSA -keysize 2048 -validity 10000 -storepass "otra-clave" -keypass "otra-clave" -dname "CN=Otro,OU=Otro,O=Otro,L=Otro,S=Otro,C=CL"`) y compara su huella digital con la primera:

```bash
keytool -list -v -keystore app/keystore-otra.jks -alias mi-app -storepass "otra-clave" | grep "SHA256:"
keytool -list -v -keystore app/keystore.jks -alias mi-app -storepass "$KEYSTORE_PASSWORD" | grep "SHA256:"
```

Las huellas digitales son completamente distintas — diagnostica confirmando que, aunque ambas keystores podrían firmar técnicamente el mismo APK/AAB, Google Play las trataría como identidades de desarrollador completamente distintas: subir una actualización firmada con `keystore-otra.jks` para una app ya publicada con `keystore.jks` sería rechazado, exactamente el escenario irreversible que hace crítico respaldar la keystore original.

#### Paso 5 · Práctica guiada

Genera un tercer alias dentro de la misma keystore (`keytool -genkeypair -keystore app/keystore.jks -alias mi-app-debug ...`) y usa `keytool -list -keystore app/keystore.jks` (sin `-alias`) para listar todos los alias contenidos, confirmando que una única keystore puede almacenar múltiples identidades de firma distintas. **Pista:** una keystore es, en esencia, un contenedor de múltiples pares de claves, cada uno identificado por su propio alias.

#### Paso 6 · Práctica independiente

Documenta en una frase qué harías si sospecharas que la keystore de release de tu app se filtró (por ejemplo, se subió accidentalmente a un repositorio público), relacionándolo con por qué no puedes simplemente "rotarla" de la misma forma que rotarías una API key comprometida.

#### Paso 7 · Cierre y evidencia

Ya generas una keystore real, la configuras para leerse desde variables de entorno, y explicas por qué su pérdida o filtración es un problema grave y en gran medida irreversible. El siguiente tema cubre el formato de artefacto que Google Play requiere para la distribución. **Evidencia:** entrega la huella digital SHA-256 real generada por `keytool`, y el resultado confirmando que dos keystores distintas producen huellas completamente diferentes. Fuente oficial: [Android Developers — Sign your app](https://developer.android.com/studio/publish/app-signing).

**Errores comunes:** hardcodear las credenciales de la keystore en `build.gradle.kts`, exponiéndolas en el control de versiones; no mantener un respaldo seguro de la keystore original, arriesgando perder para siempre la capacidad de actualizar la app.

**Cuándo no usarlo:** para un build de debug usado exclusivamente en desarrollo local, la keystore de debug automática que Android Studio genera es suficiente; la keystore de release, gestionada con el cuidado de este Tema, es específicamente para builds destinados a publicación real.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Prepara una variante de prueba firmada y registra la huella del certificado sin guardar la clave en Git. Instala dos versiones consecutivas con esa firma y comprueba que la actualización conserva las entregas locales.

### Tema 2: App Bundle vs APK

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

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea, dentro de `app/src/`, un modelo con archivos reales de distinto tamaño que represente la diferencia entre un artefacto universal y artefactos optimizados por configuración:

```bash
# modela lo que Gradle produciría con ./gradlew bundleRelease, antes de medir el efecto real
mkdir -p academia-android/app/src
cd academia-android
mkdir -p simulacion-bundle/recursos-es simulacion-bundle/recursos-en simulacion-bundle/recursos-pt
# genera contenido real (no solo metadatos) para medir tamaño real en disco
for idioma in es en pt; do
  head -c $((50 * 1024)) /dev/urandom > "simulacion-bundle/recursos-$idioma/strings.dat"
done
cat simulacion-bundle/recursos-es/strings.dat simulacion-bundle/recursos-en/strings.dat simulacion-bundle/recursos-pt/strings.dat > simulacion-bundle/apk-universal-simulado.dat
ls -la simulacion-bundle/*.dat simulacion-bundle/recursos-*/*.dat
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

#### Paso 7 · Cierre y evidencia

Ya explicas por qué Google Play requiere un App Bundle en vez de un APK universal, y mides concretamente la reducción de tamaño que esto representa para cada usuario. El siguiente tema cubre el versionado y los tracks progresivos de validación antes de producción. **Evidencia:** entrega el porcentaje real de reducción de tamaño calculado, y el resultado del fallo mostrando cómo un recurso mal configurado anula esa ventaja. Fuente oficial: [Android Developers — About Android App Bundles](https://developer.android.com/guide/app-bundle).

**Errores comunes:** incluir por error un recurso pesado en todas las variantes del bundle, anulando la ventaja de tamaño; seguir generando y distribuyendo un APK universal manualmente en vez de adoptar el formato `.aab` requerido por Play.

**Cuándo no usarlo:** para distribuir una app fuera de Google Play (por ejemplo, un APK de prueba compartido directamente por email o instalado manualmente sin pasar por ninguna tienda), un APK universal generado directamente sigue siendo necesario, dado que no hay ninguna infraestructura de Play que genere variantes optimizadas fuera de la tienda.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Genera el App Bundle de la app de reparto con `./gradlew bundleRelease` y revisa con App Bundle Explorer que los recursos de idioma/densidad no se dupliquen entre variantes. Verifica con un número real cuánto pesa la APK que Play entregaría a un conductor con un dispositivo de gama media en español, frente al universal.

### Tema 3: Versionado, tracks y políticas

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

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea `app/build.gradle.kts.fragmento-version` verificando programáticamente la regla de incremento estricto:

```bash
mkdir -p academia-android/app
cd academia-android
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

#### Paso 7 · Cierre y evidencia

Ya distingues `versionCode` de `versionName`, y explicas el propósito de los tracks progresivos de validación antes de producción. Esto cierra el módulo de publicación en Google Play; el siguiente módulo del track aborda características avanzadas de la plataforma. **Evidencia:** entrega el resultado de la simulación mostrando qué `versionCode` serían aceptados o rechazados por Play Console, y explica por qué un `versionName` "hacia atrás" no sería detectado automáticamente por la plataforma. Fuente oficial: [Android Developers — Set up your app's version code](https://developer.android.com/studio/publish/versioning).

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
