# Cruce: temario RutaFlow (IMG_1030) vs. contenido existente del repo

Comparo el temario maestro de la imagen con lo que **ya está escrito** en el repo
(`web/public/content`), basándome en `topic-index.json`.

**Hallazgo principal:** el temario de RutaFlow **ya está integrado** en el repo, repartido
entre los tracks que corresponden a cada tecnología. Existen incluso módulos dedicados
que lo reproducen casi literalmente:
- **Flutter → Módulo 14** ("Diseño de pantallas y Riverpod | Google Maps y localización en
  tiempo real | Socket.IO y actualización de rutas | Animaciones de localización |
  Almacenamiento local, imágenes y offline | Dio y notificaciones push").
- **Spring Boot → Módulo 14** ("CRUD API y contratos | MySQL y datos espaciales | JPA e
  Hibernate Spatial | JWT Bearer y autorización por roles | Tiempo real con STOMP |
  Archivos y notificaciones push").
- Además, un **track `rutaflow` completo** (8 módulos) que trata el proyecto como sistema
  end-to-end (logística, geo, ledger, rutas, facturación, infra).

Es decir: el temario de la imagen **no es contenido faltante**, es el guion que el repo ya
convirtió en módulos. Lo que sigue es el detalle de dónde está cada tema.

---

## RutaFlow APP (Flutter) — cobertura

| Tema IMG_1030 | ¿Cubierto? | Dónde en el repo |
|---|---|---|
| 1. Diseño de pantallas | ✅ | Flutter M1 (Stateless/Stateful, layout) + M14 ("Diseño de pantallas y Riverpod") |
| 2. Riverpod (gestor de estado) | ✅ | Flutter M4 (Riverpod, Formz) + M14 |
| 3. Mapas de Google | ✅ | Flutter M14 ("Google Maps y localización") |
| 4. Localización en tiempo real | ✅ | Flutter M14 |
| 5. Socket IO | ✅ | Flutter M14 ("Socket.IO y actualización de rutas") |
| 6. Trazado y actualización de rutas | ✅ | Flutter M14 |
| 7. Animaciones de localización | ✅ | Flutter M8 (animaciones) + M14 ("Animaciones de localización") |
| 8. Almacenamiento local | ✅ | Flutter M6 (shared_preferences, sqflite, Hive) + M14 (offline) |
| 9. Manejo de imágenes | ✅ | Flutter M7 ("Cámara, galería y carga multipart") + M14 |
| 10. Peticiones HTTP (DIO) | ✅ | Flutter M5 (http vs dio, interceptores) + M14 ("Dio y...") |
| 11. Notificaciones Push | ✅ | Flutter M14 ("...notificaciones push") |

**APP: 11/11 cubiertos.** Fundamentos de Dart/Flutter (el "vacío" que marqué en el plan)
**sí existe**: Flutter M0 (null safety, clases, async) y M1 (widgets). → El vacío queda resuelto.

## RutaFlow BACKEND (Spring Boot + Java) — cobertura

| Tema IMG_1030 | ¿Cubierto? | Dónde en el repo |
|---|---|---|
| 1. Spring Boot (Java) | ✅ | Spring Boot M0–M1 + track Java M0–M1 completo |
| 2. MySQL (base de datos) | ✅ | Spring Boot M3 (JPA/repos) + M14 ("MySQL y datos espaciales") |
| 3. Datos espaciales con MySQL | ✅ | Spring Boot M14 ("JPA e Hibernate Spatial") + rutaflow M1 ("Geografía con precisión útil") |
| 4. JPA Hibernate | ✅ | Spring Boot M3 + M16 (relaciones, N+1); Java M16 (entidades JPA) |
| 5. Spring Security | ✅ | Spring Boot M4 (SecurityFilterChain, JWT) + M18 |
| 6. Socket IO (tiempo real) | ✅ (variante) | Spring Boot M14 ("Tiempo real con **STOMP**") — ⚠️ ver nota |
| 7. Almacenamiento de archivos | ✅ | Spring Boot M14 ("Archivos y...") |
| 8. CRUD API | ✅ | Spring Boot M2 (DTOs, ResponseEntity) + M14 ("CRUD API y contratos") |
| 9. (Create, Read, Update, Delete) | ✅ | (es el detalle del punto 8) |
| 10. JWT (Bearer Token) | ✅ | Spring Boot M4 + M14 ("JWT Bearer y autorización por roles") |
| 11. Protección de rutas por ROLES | ✅ | Spring Boot M4 ("autorización por rol") + M14 |
| 12. Notificaciones Push | ✅ | Spring Boot M14 ("...notificaciones push") |

**BACKEND: 12/12 cubiertos.** Fundamentos de Java (el otro "vacío" del plan) **sí existe**:
track Java M0 completo. → El vacío queda resuelto.

---

## Diferencias / cosas a revisar (no son faltantes, son matices)

1. **Socket.IO vs STOMP/WebSocket.** El temario de la imagen dice "Socket IO" tanto en app
   como en backend. El repo implementa el tiempo real del backend con **STOMP** (Spring M14)
   y la app con `socket_io_client` (Flutter M14). Socket.IO y STOMP **no son el mismo
   protocolo**. Conviene decidir uno y que app y backend coincidan, o documentar que la app
   usa un cliente compatible. *Es la única incoherencia técnica real del cruce.*

2. **Keycloak / recuperación de contraseña.** La captura `image.png` y el `.env` muestran que
   el backend real usa **Keycloak** y recuperación de contraseña. En el repo, Keycloak/OIDC
   aparece en Spring Boot **M10** (OAuth2/OIDC, Keycloak, Token Relay), no en el módulo M14
   de RutaFlow. Si RutaFlow usa Keycloak, el módulo M14 debería enlazar a M10. **[posible
   enlace a añadir, no es un vacío]**

3. **Datos espaciales: MySQL vs PostGIS.** El temario dice "datos espaciales con **MySQL**".
   El repo lo cubre con Hibernate Spatial (Spring M14), correcto. Pero ojo: el track
   `rutaflow` M1 habla de geografía con precisión; verificar que ambos usen el mismo motor
   (MySQL Spatial), no PostGIS, para no confundir.

4. **Routing/trazado de rutas.** El material DA1606C0 (OSRM en Docker) no aparece como tema;
   el repo cubre "trazado de rutas" desde el lado app (Flutter M14) y algoritmos de rutas en
   `rutaflow` M5 ("Grafos y problema de rutas"). Si se quiere routing real servidor, OSRM
   sería un añadido, pero **no está en el temario de la imagen**, así que queda como opción.

---

## Conclusión

- **23/23 temas del temario RutaFlow (IMG_1030) ya están cubiertos** en el repo.
- Los dos "vacíos" que marqué en `plan-estudio-rutaflow.md` (fundamentos de Java y de
  Flutter) **no son vacíos**: existen en Java M0 y Flutter M0–M1. Actualizo esa nota.
- No hay que crear módulos nuevos. Lo que queda es **pulir coherencia**, no cubrir faltantes:
  1. Unificar **Socket.IO vs STOMP** entre app y backend (único punto técnico real).
  2. Enlazar **Keycloak (Spring M10)** desde el módulo RutaFlow M14.
  3. Confirmar **MySQL Spatial** como motor geoespacial consistente.
- El track `rutaflow` (8 módulos) ya trata el proyecto como sistema completo, por encima del
  temario de la imagen (añade ledger contable, facturación, SLO, incidentes). Es más
  ambicioso que IMG_1030, lo cual es bueno.
