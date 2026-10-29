# Huecos del track Android frente a la biblioteca externa


## Estado (2026-10-28)
Resuelto con el nuevo **Módulo 15 «Android como plataforma»**: Intents implícitos, BroadcastReceiver, foreground service de ubicación y FileProvider. ⚠️ **No ejecutado**: requiere Android Studio y emulador. Pruébalo antes de publicar.

**Fecha:** 2026-10-28 · **Método:** índice textual del PDF cruzado con `android` + palabras clave.

## Libros cotejados
- **Programacion_Android_11_Movil_Guia_Intermedio.pdf** (809 págs.): componentes de una app, Activities/Fragments, Services, Intents, Broadcast Receivers, Content Providers, sensores, localización, multimedia, persistencia.
- **Programacion_Android_Things_IoT_Tutorial_Avanzado.pdf** (440 págs.): Android en IoT (Android Things ya está descontinuado).

## Huecos
El track es moderno (Compose, Hilt, Room, WorkManager), pero le faltan **los componentes clásicos del sistema**, que siguen existiendo en Compose:

| Tema del libro | Estado en el track | Prioridad |
|---|---|---|
| **Broadcast Receivers** (eventos del sistema) | 0 menciones | **Alta** |
| **Content Providers** y compartir datos entre apps | 0 menciones | Media |
| **Intents implícitos** (compartir, abrir mapa, cámara del sistema) | 1 mención | **Alta** |
| **Foreground Services** (tracking, reproducción) | Mencionado; sin tema propio | **Alta**: clave para una app de mensajeros |
| **Sensores** (`SensorManager`) | Pocas menciones | Baja |
| **Multimedia** (CameraX, ExoPlayer/Media3) | 0 menciones | Media |
| **Localización** (FusedLocationProvider, mapas) | 2 menciones | **Alta**: el proyecto RutaFlow es de entregas |

## Fuera de alcance
Android Things (descontinuado) y la evolución de versiones Cupcake–Pie.

## Propuesta
Módulo nuevo **"Android como plataforma: componentes del sistema"** con Intents implícitos, Broadcast Receivers, Foreground Services con localización y Content Providers, además de un tema de CameraX/Media3.
