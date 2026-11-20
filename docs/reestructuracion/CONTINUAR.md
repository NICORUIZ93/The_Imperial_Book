# Cómo continuar este trabajo (relevo para otra IA o persona)

Copia este archivo completo como primer mensaje a la IA que continúe. Está escrito para alguien que no
conoce nada de lo anterior. Última actualización: 2026-11-20.

## 1. Qué es y qué se está haciendo

The Imperial Book es una academia en español. Una app Angular (`web/`) dibuja lecciones Markdown de
`web/public/content/<curso>/modulo-N.md`. El dueño es Nicolás Ruiz; solo habla español y lee desde el
móvil, así que las respuestas van en español, cortas y con el resultado primero.

Se está reescribiendo toda la academia según un único plan: `specs/021-reestructuracion-total-de-la-academia.md`.
Léelo entero antes de tocar nada. El avance está en `docs/reestructuracion/ESTADO.md`.

El problema que se corrige: los cursos tenían temas repetidos, temas en el módulo equivocado, explicaciones
y ejemplos demasiado básicos, muchos temas faltantes y formatos distintos entre cursos.

## 2. Reglas que no se negocian

1. **Specs primero.** Antes de cambiar algo, lee `specs/README.md`. Trabajo nuevo = spec nueva con criterios
   numerados y su `Verificación:`.
2. **El dueño aprueba cada temario antes de escribir sus lecciones.** No escribas temas de un curso sin
   temario aprobado en `docs/temarios/<curso>-objetivo.md`.
3. **Exactitud.** Ningún dato técnico (versión, comando, salida, nombre de API) se escribe sin ejecutarlo o
   comprobarlo en una fuente primaria. Si no pudiste comprobarlo, dilo en la lección y en `pendiente.md`;
   no lo inventes ni pegues salidas imaginadas.
4. **Siempre la versión extendida.** El dueño no quiere variantes reducidas: cada curso va de cero a experto,
   con al menos la mitad de los temas en los tramos Integración y Experto.
5. **Formato único.** Todo tema nuevo o reescrito sigue `docs/reestructuracion/FORMATO-UNICO.md`: 12 secciones
   fijas y encabezado `### Tema N: Título · Nivel · NN min`. El ejemplo de referencia está en
   `docs/reestructuracion/leccion-modelo/`. Lo mide `scripts/validate_formato.py`.
6. **Un concepto, un curso dueño.** Si un tema ya lo enseña otro curso, se enlaza; no se repite.
7. **Nada se pierde.** Lo que se retira va a una etiqueta `retirado/*`, no se borra sin más. El repositorio
   solo tiene la rama `main`.
8. **Laboratorios JVM con Gradle** (Kotlin DSL, wrapper, catálogo `gradle/libs.versions.toml`). Maven ya no
   se usa en laboratorios nuevos.
9. **Nube en local con Floci** (`docker-compose.yml` de la raíz; AWS tarda unos 16 s en estar `healthy`).
10. **No envíes mensajes ni correos en nombre del dueño, ni borres comprobantes o documentos suyos, sin
    preguntarle.**
11. Antes de cada commit: `./scripts/validate.sh` debe terminar en `validate.sh: ok`.

## 3. Orden de trabajo (prioridad fijada por el dueño)

1. Java
2. Spring Boot
3. Microservicios con Spring Boot y Gradle (el curso insignia)
4. Flutter
5. iOS
6. Angular, con el bloque completo de Angular Native (el proyecto de https://ng-native.com, en alfa)

Gradle se escribe junto a Java y Spring porque sus laboratorios lo usan. Después: Fundamentos, JavaScript,
Node, React, Docker, Kubernetes, DevOps, Cloud, Android, Kotlin Multiplatform, Control, Diseño de sistemas y
RutaFlow al final.

## 4. Estado al 2026-11-20

**Temarios aprobados** (en `docs/temarios/`, cada uno con sus decisiones resueltas en la opción recomendada):

| Curso | Archivo | Temas | Módulos |
|---|---|---:|---:|
| Java | `java-objetivo.md` | 279 | 44 |
| Gradle | `gradle-objetivo.md` | 166 | 28 |
| Spring | `spring-objetivo.md` | 281 | 47 |
| Microservicios | `microservicios-objetivo.md` | 395 | 62 |
| Fundamentos | `fundamentos-objetivo.md` | 298 | 46 |
| Flutter | `flutter-objetivo.md` | 345 | 52 |
| iOS | `ios-objetivo.md` | 324 | 51 |
| Angular | `angular-objetivo.md` | 297 | 49 |

**Temarios que faltan** (hay que investigarlos y pedir aprobación): JavaScript, Node, React, Docker,
Kubernetes, DevOps, Cloud, Android, Kotlin Multiplatform, Control, Diseño de sistemas, RutaFlow.

**Lecciones en formato único:** solo Microservicios (187 fichas, 37 laboratorios verificados con Maven antes
de la migración). El resto de la academia sigue en formato antiguo.

**En curso, sin terminar:**
- Piloto de Java, módulos 0 y 1, en `docs/reestructuracion/cursos/java/` (puede estar sin commit).
- Los 13 laboratorios de Spring de Microservicios (`examples/microservicios/modulo-5..16` y `modulo-36/spring`)
  se migraron de Maven a Gradle **sin compilar con Gradle 9.9.2**. Hay que re-verificarlos; el detalle, con
  archivo y línea, está al final de `verificacion/microservicios/pendiente.md`. El wrapper quedó sin
  `distributionSha256Sum` y hay que regenerarlo.

**Equipo del dueño (confirmado el 2026-11-20):** tiene iPhone físico para pruebas. No tiene membresía de pago
de desarrollador de Apple ni cuenta de Google Play. Por eso los laboratorios que las exigen (push con APNs,
TestFlight, publicación en tiendas, compras reales, entrega por CI/CD) se escriben como ensayo documentado y
la lección debe decir que no se probaron de punta a punta. Lo que solo necesita el iPhone (cámara,
biometría, rendimiento, VoiceOver) sí se verifica en el dispositivo.

## 5. Qué hacer a continuación, en orden

1. Terminar el piloto de Java (M0 y M1) y enseñárselo al dueño como muestra del formato.
2. Re-verificar con Gradle los 13 laboratorios de Microservicios y corregir lo que falle.
3. Escribir Java completo según `java-objetivo.md`, por tramos (Fundamentos, Aplicación, Integración,
   Experto), cada tema con sus 12 secciones y código ejecutado.
4. Seguir con Spring, Microservicios (los 208 temas que faltan), Flutter, iOS y Angular, en ese orden.
5. Investigar los temarios que faltan y pedir aprobación de cada uno.
6. Fases posteriores del plan (ver `specs/021`): mapa de conceptos, que la app dibuje las 12 secciones con
   los mismos componentes, lección de entrada «Nube en local con Floci», cierre por curso.

## 6. Cómo se escribe un tema

- Lee el temario del curso: cada fila dice si el tema «ya está», «está pero básico» (y qué le falta) o «falta».
- Escribe las 12 secciones de `FORMATO-UNICO.md`. La sección 6 explica en tres niveles (desde cero,
  intermedio, por dentro). La 7 lleva código que corre y la salida real pegada.
- El laboratorio va en `examples/<curso>/modulo-N/` con un `verificar.sh` que termina en `RESULTADO: OK`.
- Tras editar lecciones: `python3 scripts/build_web_topic_index.py` y `./scripts/validate.sh`.
- `CLAUDE.md` declara cuántos cursos, módulos y temas hay; si cambian, actualízalo (lo exige la validación).

## 7. Comandos

```bash
cd web && npm ci && npm start        # http://localhost:4200
cd web && npm test -- --watch=false  # pruebas unitarias
./scripts/validate.sh                # debe terminar en "validate.sh: ok"
python3 scripts/build_web_topic_index.py
python3 scripts/validate_formato.py --check
docker compose up -d                 # Floci: AWS 4566, Azure 4577, GCP 4588
```

## 8. Dónde se verifica

Los laboratorios que necesitan Docker, Gradle con red, Xcode o Flutter se ejecutan en el Mac del dueño, en
su copia `~/Documents/GitHub/Academia_Floci` (su `origin` es este repositorio). En
`~/Downloads/imperial-verificacion/` hay scripts `.command` ya hechos: `verificar-lote.command`,
`subir-avance.command`, `actualizar-mi-carpeta.command` y otros, con sus registros en `logs/`.

Lecciones aprendidas en ese Mac: bash es 3.2; `node --test` necesita `--test-force-exit`; Trivy puede
recibir 429 de Maven Central; RabbitMQ 4 no admite colas transitorias no exclusivas.

## 9. Cómo informar al dueño

Corto, en español, resultado primero. Di siempre qué quedó hecho, qué no se pudo comprobar y qué decisión
necesitas de él. No digas que algo está verificado si no lo ejecutaste.
