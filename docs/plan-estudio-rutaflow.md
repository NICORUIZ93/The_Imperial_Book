# Plan de estudio RutaFlow — de cero a profesional

Fuente principal: **IMG_1030** (temario maestro del proyecto, dividido en APP y BACKEND),
complementado con el material técnico extraído del resto de imágenes de Descargas
(ver `docs/inventario-imagenes.md`).

RutaFlow es una aplicación de logística/entregas con geolocalización en tiempo real:
- **APP**: Flutter (gestión de estado con Riverpod, mapas, tiempo real).
- **BACKEND**: Spring Boot + Java + MySQL, con autenticación, tiempo real y notificaciones.

> **Regla aplicada:** los temas se reordenaron por dependencias (lo básico antes de
> lo que se apoya en ello). No se inventó ningún tema fuera del temario de IMG_1030;
> donde faltaba un prerrequisito para la linealidad, se marca como **[vacío a cubrir]**
> en lugar de rellenarlo.

---

## Temario original (tal cual aparece en IMG_1030)

### APP
1. Diseño de pantallas
2. Riverpod (Gestor de estado)
3. Mapas de Google
4. Localización en tiempo real
5. Socket IO
6. Trazado y actualización de rutas
7. Animaciones de localización
8. Almacenamiento local
9. Manejo de imágenes
10. Peticiones HTTP (DIO)
11. Notificaciones Push

### BACKEND
1. Spring Boot (Lenguaje Java)
2. MySQL (Base de datos)
3. Datos espaciales con MySQL
4. JPA Hibernate
5. Spring Security
6. Socket IO (Tiempo real)
7. Almacenamiento de archivos
8. CRUD API
9. (Create, Read, Update, Delete)
10. JWT (Bearer Token)
11. Protección de rutas por ROLES de usuario
12. Notificaciones Push

---

## Ruta BACKEND (Spring Boot) — ordenada por dependencias

> El backend debe construirse **antes o en paralelo temprano** con la app, porque la app
> consume su API. El orden del temario original mezcla capas; aquí se reordena para que
> cada tema se apoye en el anterior.

| # | Tema | Tecnología | Qué se aprende | Se practica en RutaFlow | Prerrequisitos |
|---|------|-----------|----------------|--------------------------|----------------|
| B1 | **[vacío a cubrir]** Fundamentos de Java | Java | Sintaxis, POO, colecciones, interfaces funcionales y Streams (ver 7D30EBD9) | Base del servicio | — |
| B2 | Spring Boot: primer servicio | Spring Boot | Arrancar un proyecto, inyección de dependencias, estructura por capas | Esqueleto del backend | B1 |
| B3 | MySQL (base de datos) | MySQL | Modelado relacional, tablas, claves, consultas | Esquema de usuarios, pedidos, repartidores | B2 |
| B4 | JPA / Hibernate | Spring Data JPA | Mapear entidades a tablas, repositorios, relaciones | Entidades Usuario, Pedido, Ruta | B3 |
| B5 | CRUD API (Create, Read, Update, Delete) | Spring Web (REST) | Endpoints REST, DTOs, códigos de estado | API de pedidos y repartidores | B4 |
| B6 | Datos espaciales con MySQL | MySQL Spatial | Tipos geométricos (POINT), consultas por distancia | Guardar y consultar ubicaciones | B3, B4 |
| B7 | Spring Security | Spring Security | Autenticación, filtros, contexto de seguridad | Login de usuarios y repartidores | B5 |
| B8 | JWT (Bearer Token) | JWT | Emitir y validar tokens, sesiones sin estado | Token tras login; config tipo Keycloak (ver image.png) | B7 |
| B9 | Protección de rutas por ROLES | Spring Security | Autorización por rol (cliente, repartidor, admin) | Endpoints según rol | B8 |
| B10 | Socket IO (tiempo real) | WebSocket / Socket.IO | Canales en tiempo real servidor→cliente | Emitir posición del repartidor | B5, B8 |
| B11 | Almacenamiento de archivos | Spring + storage | Subir y servir archivos | Fotos de entrega / perfil | B5 |
| B12 | Notificaciones Push | FCM / push | Enviar notificaciones al dispositivo | Avisar "pedido en camino" | B8, B10 |

## Ruta APP (Flutter) — ordenada por dependencias

| # | Tema | Tecnología | Qué se aprende | Se practica en RutaFlow | Prerrequisitos |
|---|------|-----------|----------------|--------------------------|----------------|
| A0 | **[vacío a cubrir]** Fundamentos de Dart + Flutter | Dart / Flutter | Widgets, layout, navegación básica | Base de la app | — |
| A1 | Diseño de pantallas | Flutter (UI) | Construir pantallas, componentes, navegación | Pantallas de login, mapa, pedidos | A0 |
| A2 | Riverpod (gestor de estado) | Riverpod | Estado reactivo, providers, separación UI/lógica | Estado de sesión, pedidos, ubicación | A1 |
| A3 | Peticiones HTTP (DIO) | Dio | Consumir la API REST del backend, manejar errores | Llamar al CRUD API (B5) y al login (B8) | A2, B5, B8 |
| A4 | Almacenamiento local | shared_preferences / local DB | Persistir token y datos en el dispositivo | Guardar el JWT y la sesión | A3 |
| A5 | Manejo de imágenes | Flutter + Dio | Seleccionar, mostrar y subir imágenes | Foto de entrega (usa B11) | A3 |
| A6 | Mapas de Google | google_maps_flutter | Mostrar mapa, marcadores, cámara | Mapa principal de la entrega | A2 |
| A7 | Localización en tiempo real | geolocator / location | Obtener y seguir la posición del dispositivo | Posición del repartidor | A6 |
| A8 | Socket IO | socket_io_client | Recibir eventos en tiempo real del backend (B10) | Ver el repartidor moverse en vivo | A3, A7, B10 |
| A9 | Trazado y actualización de rutas | Maps + routing (ver DA1606C0 / OSRM) | Dibujar la ruta A→B y actualizarla | Ruta del repartidor al cliente | A6, A8 |
| A10 | Animaciones de localización | Flutter (animaciones) | Interpolar el movimiento del marcador | Mover el pin suavemente | A7, A9 |
| A11 | Notificaciones Push | firebase_messaging | Recibir notificaciones del backend (B12) | Aviso "pedido en camino" | A4, B12 |

---

## Orden recomendado global (de cero a profesional)

1. **Fundamentos** — Java (B1) y Dart/Flutter (A0). *[vacíos a cubrir en el temario original]*
2. **Backend base** — B2 → B3 → B4 → B5 (ya hay una API CRUD funcionando).
3. **App base** — A1 → A2 → A3 (la app ya consume la API).
4. **Seguridad** — B7 → B8 → B9 en el backend; A4 en la app (guardar el token).
5. **Geolocalización** — B6 (datos espaciales) y A6 → A7 (mapa + posición).
6. **Tiempo real** — B10 (backend) + A8 → A9 → A10 (app).
7. **Extras** — B11/A5 (archivos/imágenes) y B12/A11 (push).

## Vacíos a cubrir — RESUELTOS tras el cruce con el repo
> Ver `docs/cruce-rutaflow-vs-repo.md`. Lo que marqué como "vacío" **sí existe** en el repo:
- ~~Fundamentos de Java~~ → **cubierto**: track Java, Módulo 0 (completo).
- ~~Fundamentos de Dart/Flutter~~ → **cubierto**: track Flutter, Módulos 0 y 1.
- **Arquitectura** del backend (4620C2A8 hexagonal/DDD, 07DB3F7B C4+ADR): aparece en
  Spring Boot M10 (DDD) y M15 (hexagonal con ArchUnit). Queda como lectura de apoyo.

## Lo que sí queda pendiente (coherencia, no contenido faltante)
1. Unificar **Socket.IO vs STOMP** entre app (Flutter M14) y backend (Spring Boot M14).
2. Enlazar **Keycloak** (Spring Boot M10) desde el módulo RutaFlow del backend.
3. Confirmar **MySQL Spatial** como motor geoespacial consistente en todos los módulos.

## Material de apoyo (del inventario de imágenes)
- **Versiones Spring 2026** (IMG_1324, 1832B290): contrastar siempre contra la doc oficial;
  las de la imagen son *milestones* (M1/M2), no estables.
- **Rutas/geo** (DA1606C0): OSRM en Docker como alternativa/# complemento a Google Maps para routing.
- **Diagramas** (IMG_1353): Archify, ya integrado en el repo.
