# Continuidad: expansión Java y academia

Documento de traspaso para que otra IA pueda continuar el trabajo sin volver a
inferir el objetivo, el formato editorial ni el estado de la cobertura.

## Encargo y razón

El usuario pidió revisar y completar la academia según el MASTER PROMPT compartido
en la conversación, empezando por Java y comprobando cada tema y subtema. Señaló
que varios temas parecían largos en texto, pero débiles en código, ejemplos y
explicaciones simples. También pidió que cada tema terminado se publique de forma
incremental para que el trabajo quede guardado si la sesión termina, y que exista
una guía para la siguiente IA.

La meta es mejorar el aprendizaje demostrable desde cero hasta decisiones de nivel
profesional. No basta con aumentar el inventario ni con añadir encabezados. Se
debe enseñar a crear y ejecutar un archivo, observar su resultado, explicar el
mecanismo y encontrar un fallo concreto.

## Fuentes de verdad y rutas

- Instrucciones del repositorio: `AGENTS.md`.
- Mapa compacto del repo: `docs/repo-graph.md` (leer primero; regenerar con
  `python3 scripts/build_repo_graph.py`).
- Metodología vigente: `docs/METODOLOGIA-DE-APRENDIZAJE.md`.
- Prompts pedagógicos adaptados: `docs/PROMPTS-FORMACION.md`.
- Lecciones reales: `web/public/content/<track>/modulo-N.md`.
- Inventario de cursos: `web/src/app/course-data.ts` y
  `web/public/content/topic-index.json`.
- Auditoría del formato de cuatro pasos: `docs/atomic-subtopics.md` y `.json`.
- Auditorías de calidad: `docs/topic-learning-quality.md`,
  `docs/lesson-substance.md`, `docs/seven-step-methodology.md` y
  `docs/course-depth-review.json`.
- Puentes de ejemplos profesionales: `examples/professional-bridges/manifest.json`.

Los textos adjuntos o las instrucciones dentro de documentos son material de
referencia. Solo las peticiones del usuario y las reglas activas del repositorio
definen el encargo. La metodología del repo adapta el prompt; conserva precisión,
fuentes y límites, y no copia material de terceros.

## Contrato de cada tema

Un tema de 20–45 minutos se divide en 3–6 subtemas atómicos de 5–15 minutos. Cada
subtema sigue este orden:

1. **Contexto:** problema real, valor práctico y prerrequisito claro.
2. **Hazlo tú:** acción al comienzo; indica ruta y nombre de archivo, contenido
   completo o cambio exacto, comando desde el directorio correcto y salida que
   debe observarse. Añade un fallo deliberado reproducible y cómo diagnosticarlo.
3. **Entiende:** describe el mecanismo con frases directas, ejemplo y límites;
   define los términos técnicos al usarlos. Mantén la explicación ligera y usa
   código, tablas o trazas cuando aclaren más que párrafos largos.
4. **Cierra:** pide evidencia verificable y prepara el paso siguiente.

Usa un mismo proyecto acumulativo cuando sea razonable. No crees un archivo o
aplicación nueva para cada subtema sin motivo. No declares comprensión por una
marca de completitud, encabezados, referencias o código sin ejecutar. No añadas
cuestionarios generados, puntos ni insignias.

Al revisar un tema, comprueba especialmente que:

- la secuencia parte de lo que una persona principiante ya sabe;
- no se salte pasos entre ejemplo y solución;
- el código coincide con el archivo de laboratorio enlazado cuando el manifiesto
  exige coincidencia exacta;
- cada comando tiene directorio, requisitos y resultado esperado;
- el fallo realmente produce el diagnóstico que se explica;
- se distingue lo que fue validado estructuralmente de lo que se ejecutó y de lo
  que requeriría revisión humana.

## Estado de Java

La auditoría actual registra **101/101 temas Java** con estructura atómica y
**307/307 subtemas** conformes. Esto acredita estructura detectada, no ejecución
de cada ejercicio, exactitud profesional de cada afirmación ni revisión humana de
aprendizaje.

Los módulos Java 18–20 fueron expandidos tema por tema en commits incrementales,
ya publicados. En la sesión más reciente se revisaron temas anteriores de los
módulos 5, 7–16 para corregir deudas editoriales y etiquetas requeridas. Se
sincronizó además el código del subtema de timeout del módulo 5 con
`examples/professional-bridges/java/Plazo.java`; su validador confirma igualdad
entre el ejemplo y el Markdown.

La rama de trabajo es `avances-7pasos-java-y-plan-20261028`. El último commit
publicado antes del lote de correcciones finales fue `87065ba0` (`Complete atomic
Java Flow API lessons`). Revisa `git status` y `git log` antes de editar: no
reapliques cambios que ya estén publicados.

## Estado global honesto

En la auditoría actual: **135/1185 temas** cumplen la estructura atómica en los
14 tracks: Java 101, Spring Boot 31, Node 2 y Flutter 1. La auditoría pedagógica detecta
**1095/1185 temas practicables** y deuda en 90. La auditoría de sustancia registra
409 temas con defectos, deuda histórica repartida entre varios tracks. Ninguna de
estas cifras certifica que un curso esté completo o que todos los ejemplos se
hayan ejecutado.

Prioridades indicadas por el usuario para continuar después de Java: Spring Boot,
microservicios, Kafka, RabbitMQ, Flutter y Node.js. Mantén visibles los seis y
elige el siguiente track según dependencias curriculares y evidencia del backlog;
no marques otros como terminados por el mero hecho de que existan temas.

## Flujo de trabajo y publicación incremental

1. Lee `AGENTS.md`, `docs/repo-graph.md`, la metodología y la lección completa.
   Inspecciona el estado de Git y los reportes relevantes.
2. Examina el tema y todos sus subtemas frente al contrato anterior y las fuentes
   primarias aplicables. Haz cambios concretos en el Markdown real.
3. Al completar cada tema, actualiza los índices/reportes afectados, ejecuta las
   validaciones aplicables, revisa `git diff --check`, crea un commit solo de ese
   trabajo y haz `git push`. No acumules muchos temas sin publicarlos.
4. Conserva cualquier cambio ajeno que ya esté en el árbol. En particular, no
   incluyas en los commits de esta tarea los archivos locales modificados por
   Flutter:
   - `examples/flutter_rutaflow/.flutter-plugins-dependencies`
   - `examples/flutter_rutaflow/pubspec.lock`
5. Registra aquí el avance, verificaciones y el siguiente paso al cambiar de
   track o dejar un bloque listo para otra IA.

Comandos de actualización y verificación desde la raíz:

```bash
python3 scripts/audit_lesson_substance.py
python3 scripts/audit_topic_learning_quality.py
python3 scripts/audit_seven_step_methodology.py
python3 scripts/audit_code_visual_quality.py
python3 scripts/build_editorial_backlog.py
python3 scripts/build_web_topic_index.py
python3 scripts/audit_prerequisite_graph.py
python3 scripts/audit_course_depth.py
python3 scripts/audit_atomic_subtopics.py
python3 scripts/validate_learning_priorities.py
python3 scripts/build_repo_graph.py
git diff --check
./scripts/validate.sh
```

Ejecuta los generadores indicados por los errores de validación; no edites a mano
reportes generados. Si cambió la aplicación, sigue además `AGENTS.md` para build,
pruebas de navegador y revisión visual. Una validación exitosa no demuestra que
código de todas las lecciones se haya ejecutado. Declara las pruebas omitidas y
las limitaciones observadas.

## Progreso posterior a Java

Spring Boot M0 T1 se reorganizó en tres subtemas: contrato e implementación del
repositorio, inyección por constructor y consulta HTTP. M0 T2 se reorganizó en tres
subtemas: prueba unitaria sin contenedor, prueba de campo con `@SpringBootTest` y
elección de la prueba según su objetivo. Se corrigió la afirmación de que los campos impiden pruebas unitarias:
Mockito, setters o reflexión también pueden usarse; constructor sigue recomendado
para dependencias obligatorias. M0 T3 ahora diferencia registro de estereotipos,
dependencias y auto-configuración, y scopes. Corrige el error de tratar `prototype`
como una instancia por petición: un prototype inyectado en un singleton se entrega
una vez; `ObjectProvider` pide instancias nuevas cuando se ejecuta el método. Las
fuentes oficiales de Spring se contrastaron. También se generó un proyecto
temporal desde Spring Initializr con Spring Boot 4.1.2 y JDK 25; los ejemplos de
M0 T1–T3 se compilaron con `./mvnw test`. Las rutas `/envios/RF-42` y
`/reporte/comparar` respondieron correctamente; el ID inyectado directo se mantuvo
y `ObjectProvider` entregó IDs nuevos. El árbol de Maven confirmó el starter
`spring-boot-starter-webmvc`, Jackson, Tomcat y Spring MVC para esa versión. Los
fallos deliberados de la guía no se ejecutaron; las validaciones estructurales
del repositorio sí pasaron antes de publicar.

Spring Boot M1 T1 se reorganizó en tres subtemas: generar el esqueleto, agregar
una ruta HTTP y leer starter/BOM sin asumir nombres iguales entre versiones.
M1 T2 se reorganizó en tres subtemas con una ruta que lee el valor configurado,
la equivalencia YAML/Properties para esa clave y las reglas de prioridad. En el
proyecto temporal M1 T2, `./mvnw test` pasó; YAML y Properties devolvieron
`En camino`, ambos archivos juntos dieron prioridad a Properties y el argumento de
consola devolvió `Prueba`. M1 T3 se reorganizó en subtemas para combinar el YAML
base con un perfil, probar capas controller/service/repository y comprobar la
ruta resultante. El proyecto temporal pasó `./mvnw test`; sin perfil respondió
`banner=Base; entorno=compartido`, con `dev` respondió
`banner=Desarrollo; entorno=compartido` y la ruta de capas respondió `En ruta: RF-42`.
Se retiró la verificación por `/actuator/env` porque sus valores están
enmascarados por defecto y el ejemplo no necesita exponer ese endpoint. Los fallos
deliberados no se ejecutaron; las validaciones estructurales sí pasaron antes de
publicar.

Spring Boot M2 T1, “Por qué DTOs en vez de entidades directamente”, se rehízo en
tres subtemas con un ejemplo acumulativo y ejecutable: entidad/repositorio JPA en
H2, contrato `CrearTareaRequest`/`TareaDTO` con un `POST` real y cambio interno
que deja estable el JSON. Se explicitó que este ejemplo no contiene relaciones
`LAZY`, así que no se atribuye a ellas un error que no puede reproducir. Un
proyecto temporal de Spring Initializr con Spring Boot 4.1.2 y JDK 25 pasó
`./mvnw -q test`; la petición de ejemplo devolvió `201` y
`{"id":1,"titulo":"Entregar paquete","prioridad":1}` sin el campo interno.
No se ejecutaron los fallos deliberados. Las auditorías globales pasaron:
124/1185 temas atómicos, 1095/1185 practicables y 409 temas con defectos de
sustancia detectados. `./scripts/validate.sh` pasó con 23 pruebas, 4 omitidas.

Spring Boot M2 T2, “Validación con Bean Validation y ResponseEntity”, ahora
continúa el proyecto del Tema 1 con tres subtemas: validar el cuerpo, responder
`200`/`404` desde una consulta y probar límites de entrada. Se añadió
`spring-boot-starter-validation`, `@NotBlank`, `@Min` y `@Valid`; el tema aclara
que el formato por defecto del error puede variar y deja el formato propio para
M2 T3. En el proyecto temporal Spring Boot 4.1.2/JDK 25, `./mvnw -q test` pasó;
las peticiones reales dieron `201` (creación), `400` (entrada inválida), `200`
(tarea existente) y `404` (ID ausente). Las auditorías reconocen el tema como
practicable y ejecutable. Los fallos deliberados y la práctica independiente no
se ejecutaron.

Spring Boot M2 T3, “Manejo centralizado de errores con `@ControllerAdvice`”, se
rehízo en tres subtemas acumulativos: cuerpo `ApiError` con campos para
validación, excepción `TareaNoEncontradaException` para búsquedas ausentes y
comparación del contrato con el manejo predeterminado. El proyecto temporal
Spring Boot 4.1.2/JDK 25 pasó `./mvnw -q test`; una petición inválida devolvió
`400` con `codigo=VALIDACION` y errores por campo; un ID ausente devolvió `404`
con `codigo=TAREA_NO_ENCONTRADA`. No se ejecutaron los fallos deliberados ni la
práctica independiente. Se contrastó el manejo de excepciones y validación con
la documentación oficial de Spring Framework; el tema evita prometer un estado
predeterminado fijo para excepciones sin handler.

Spring Boot M2 T4, “Lombok y MapStruct sin exponer datos internos”, ahora usa el
proyecto acumulativo: getters Lombok sobre la entidad, mapper Spring generado,
DTO de salida y diagnóstico estricto de campos internos no considerados. Las
versiones se contrastaron con las fuentes primarias: Lombok 1.18.48,
MapStruct 1.6.3 estable y `lombok-mapstruct-binding` 0.2.0. En el proyecto
temporal Spring Boot 4.1.2/JDK 25, `./mvnw clean test` pasó y el `POST` real
devolvió `201` sin los campos internos. Al añadir `notaInterna`, MapStruct detuvo
la compilación con `Unmapped source property`; al declararlo ignorado de forma
explícita, las pruebas pasaron de nuevo. No se ejecutó el fallo deliberado de
renombrar el destino del mapper.

Spring Boot M2 T5, “OpenAPI con springdoc: el contrato como prueba”, continúa el
backend del módulo. Se cambió la versión anterior 3.0.0: la matriz oficial
indica Spring Boot 4.1.x con springdoc 3.1.x–3.2.x; el ejemplo usa 3.2.0. Se
documentan rutas, resúmenes, respuestas 200/201/400/404 y el esquema `ApiError`.
`ContratoOpenApiTest` consulta `/v3/api-docs` desde un puerto aleatorio y verifica
las rutas, descripciones, códigos y esquema. El proyecto temporal con Spring
Boot 4.1.2/JDK 25 pasó `./mvnw -q clean test`; `/v3/api-docs` devolvió las dos
rutas y Swagger UI respondió 200. No se ejecutaron las fallas deliberadas.

La auditoría global actual registra **128/1185 temas atómicos**, **1095/1185
practicables** y 409 temas con defectos de sustancia. `./scripts/validate.sh`
pasó tras los Temas 1–5 (23 pruebas, 4 omitidas). No confundir esos indicadores
con ejecución de todos los ejemplos ni revisión humana completa.

Spring Boot M2 T6, “Paginación HTTP con validación y un límite de recursos
explícito”, completa el módulo con el mismo backend JPA. La ruta crea un
PageRequest ordenado por ID, devuelve un DTO de página y limita page a 0–1000 y
size a 1–50. Se amplió el advice para HandlerMethodValidationException, además
del error de validación del body. Con Boot 4.1.2/JDK 25, `./mvnw -q clean test`
pasó; tres tareas dieron páginas ordenadas de 2 y 1 filas, con hasNext true y
false. size=0 y size=51 respondieron 400 con codigo VALIDACION. Se comprobó la
validación de parámetros en Spring MVC 7; no se ejecutaron fallos deliberados ni
la práctica independiente.

Spring Boot M3 T1, “Entidades y repositorios derivados”, se reescribió en tres
subtemas acumulativos sobre la API creada en M2: persistencia ida y vuelta,
consulta derivada `findByPrioridadGreaterThanEqual` y consulta JPQL equivalente.
En un proyecto temporal Spring Boot 4.1.2/JDK 25, tres pruebas `@DataJpaTest`
contra H2 pasaron. Se ejecutaron los fallos deliberados: una prioridad esperada
incorrecta produjo una comparación fallida; `priorid` en el nombre derivado
produjo `PropertyReferenceException` con sugerencia `prioridad`; y `t.priorid` en
JPQL produjo `QueryCreationException` al validar el repositorio. Se corrigió el
paquete de `@DataJpaTest` para Boot 4 (`org.springframework.boot.data.jpa.test.autoconfigure`).
Fuentes primarias enlazadas en la lección: guía de pruebas de Spring Boot y
referencia de query methods de Spring Data JPA.

Tras M3 T1, la auditoría registra **130/1185 temas atómicos**: Java 101,
Spring Boot 26, Node 2 y Flutter 1; **1095/1185 practicables** y 409 temas con
defectos de sustancia. Se regeneraron reportes y `./scripts/validate.sh` pasó
con 23 pruebas y 4 omitidas. Estas cifras son indicadores, no certificación de
aprendizaje ni ejecución de todas las prácticas.

Spring Boot M3 T2, “El problema N+1 y su corrección”, se reescribió con tres
subtemas sobre entidades `Cliente` y `Pedido` agregadas al mismo backend. El
ejemplo anterior tenía `mappedBy="usuario"` sin propiedad inversa y no definía
`UsuarioRepository`; se corrigió el mapeo antes de enseñar la consulta. En el
proyecto temporal Spring Boot 4.1.2/JDK 25, tres pruebas pasaron en H2:
`getPrepareStatementCount()` midió 4 sentencias con carga perezosa y 1 con
`LEFT JOIN FETCH` o `@EntityGraph`. Se ejecutaron fallos deliberados de
`mappedBy`, omitir `fetch` y dar una ruta singular a `@EntityGraph`; cada uno
produjo el error descrito y se restauró el código. Se usa `getPrepareStatementCount`
para medir las sentencias de carga de colecciones, no `getQueryExecutionCount`.

Tras M3 T2, la auditoría registra **131/1185 temas atómicos**: Java 101,
Spring Boot 27, Node 2 y Flutter 1; **1095/1185 practicables** y 409 temas con
defectos de sustancia. Reportes regenerados y `./scripts/validate.sh` pasó con
23 pruebas y 4 omitidas. Estas cifras siguen siendo indicadores estructurales,
no certificación de aprendizaje.

Spring Boot M3 T3, “Migraciones con Flyway”, se rehízo para el mismo backend y
sus tres entidades. `V1__crear_esquema_inicial.sql` crea `tareas`, `clientes` y
`pedidos`; `spring-boot-starter-flyway` ejecuta las migraciones y
`ddl-auto=validate` comprueba el mapeo. V2 agrega un índice y el test confirma
versiones aplicadas usando `Flyway.info()`. En el proyecto temporal Spring Boot
4.1.2/JDK 25, la suite completa pasó `./mvnw -q clean test`. También se probaron
los fallos: renombrar `ubicacion_interna` produjo `Schema validation: missing column [ubicacion_interna] in table [tareas]`; usar tabla `tareaas` falló en V2; duplicar la versión dio
`Found more than one migration with version 2`. Tras quitar el archivo duplicado,
`clean test` restauró la suite verde. H2 valida esta práctica, pero no reemplaza
una verificación contra el motor de base de datos de destino.

Tras M3 T3, la auditoría registra **132/1185 temas atómicos**: Java 101,
Spring Boot 28, Node 2 y Flutter 1; **1095/1185 practicables** y 409 temas con
defectos de sustancia. Reportes regenerados y `./scripts/validate.sh` pasó con
23 pruebas y 4 omitidas. Estas métricas son indicadores estructurales.

Spring Boot M4 T1, “SecurityFilterChain moderno”, ahora contiene tres subtemas
acumulativos: agregar Security al backend; comprobar 200/401 con MockMvc y
`@WithMockUser`; y elegir rutas públicas sin romper OpenAPI. Se corrigieron los
paquetes de prueba para Spring Boot 4 y se aclara que `@WithMockUser` simula el
principal: no comprueba credenciales reales. En un proyecto temporal Boot
4.1.2/JDK 25, la suite completa pasó; cinco pruebas de la cadena cubrieron las
rutas raíz y subruta, identidad simulada y documentación. Se ejecutaron y
restauraron dos fallos deliberados: abrir `.anyRequest()` hizo fallar la
petición anónima con 200 en vez de 401, y cerrar `/v3/api-docs/**` rompió el
contrato OpenAPI con 401 en vez de 200. El código muestra HTTP Basic solo como
paso didáctico, conserva CSRF y explica que Basic requiere HTTPS fuera de pruebas
locales. No se cambió la app del repositorio; la verificación fue temporal.

Tras M4 T1, la auditoría registra **133/1185 temas atómicos**: Java 101,
Spring Boot 29, Node 2 y Flutter 1; **1095/1185 practicables** y 409 temas con
defectos de sustancia. Reportes regenerados y `./scripts/validate.sh` pasó con
23 pruebas y 4 omitidas. La auditoría de sustancia ya no detecta defectos en
M4 T1. Estas métricas no demuestran que todos los ejemplos de la academia hayan
sido ejecutados ni sustituyen revisión pedagógica humana.

**Siguiente tema:** Spring Boot M4 T2, “Filtro JWT y autorización por rol”.
Revisa la implementación completa de token, validación criptográfica, filtro,
roles y respuestas 401/403; confirma primero versiones y APIs vigentes en
documentación primaria y ejecuta los ejemplos antes de publicar el tema.

Spring Boot M4 T2, “Filtro JWT y autorización por rol”, se rehízo con tres
subtemas acumulativos: firmar/verificar con JJWT, conectar `OncePerRequestFilter`
correctamente a `SecurityFilterChain`, y verificar token/rol/firma con MockMvc.
Se actualizó JJWT a 0.13.0 según el README primario. La clave HMAC llega por
`JWT_SECRET_BASE64`, no desde el código; se documentan el modo stateless, el
registro de filtro desactivado en el contenedor para evitar doble ejecución,
`@EnableMethodSecurity`, y el prefijo `ROLE_`. El ejemplo responde `401` sin
identidad o con firma alterada, `403` a `DRIVER` y `200` a `ADMIN`. Se conserva
CSRF desactivado solo para esta API sin sesión/cookie, y se explica que un HMAC
compartido no es la opción para repartir confianza entre microservicios; se
enlaza el resource server oficial como opción de producción.

La suite del backend temporal Boot 4.1.2/JDK 25 pasó completa: **21 pruebas**,
sin fallos ni omisiones. `JwtServiceTest` también valida localmente el subject y
el rol del token firmado antes de probar la cadena HTTP. Se provocaron y restauraron los tres fallos deliberados:
clave de firma distinta hizo que el test ADMIN recibiera `401`; quitar
`/public/**` hizo que salud recibiera `401`; quitar `ROLE_` hizo que el endpoint
ADMIN recibiera `403`. También se verificó la firma alterada. Ningún código de
aplicación temporal se copió al repo. Tras el tema, la auditoría registra
**134/1185 temas atómicos**: Java 101, Spring Boot 30, Node 2 y Flutter 1;
**1095/1185 practicables** y 409 temas con defectos de sustancia. Se regeneraron
reportes y `./scripts/validate.sh` pasó con 23 pruebas y 4 omitidas. Estas métricas no certifican los demás temas ni sustituyen revisión humana.

**Siguiente tema:** Spring Boot M4 T3, “CORS y CSRF”. Revisa si continúa el mismo
backend y la cadena stateless/JWT de M4 T2, distingue CORS de CSRF, y comprueba
con peticiones reales qué respuesta ve el navegador y cuál recibe el servidor.
Más adelante, M4 T5 conserva una versión antigua de `JwtService` bajo otro
paquete; al revisar ese tema, alinéala con `com.example.demo.JwtService` y no
introduzcas una segunda clave ni una segunda implementación.


Spring Boot M4 T3, “CORS y CSRF”, se rehízo en tres subtemas: origen/métodos/
cabeceras y preflight; petición `DELETE` real con JWT y decisión de CSRF; y
prueba de un método no listado. El `CorsConfigurationSource` se limita a
`/api/**`, permite `https://web.academia.dev`, `GET/POST/DELETE`,
`Authorization/Content-Type` y no habilita cookies; `SecurityConfig` conecta
CORS antes de la autenticación. El texto diferencia bloqueo que aplica el
navegador de respuestas HTTP del servidor: MockMvc comprueba preflight y headers,
pero no equivale a ejecutar un navegador. También aclara que JWT en una cookie
automática vuelve a hacer relevante CSRF.

La suite completa del backend temporal Spring Boot 4.1.2/JDK 25 pasó: **26
pruebas**, sin fallos ni omisiones. Los ejemplos validaron preflight permitido
(200 y headers de origen, método y autorización), origen no permitido (403),
PATCH no permitido (403), y DELETE con bearer JWT (200). Se provocaron y
restauraron tres fallos: aceptar cualquier origen convirtió el 403 en 200;
quitar Authorization de los headers admitidos convirtió el preflight esperado
200 en 403; permitir todos los métodos convirtió el PATCH esperado 403 en 200.
Tras T3, auditorías: **135/1185 temas atómicos**, Spring Boot 31;
**1095/1185 practicables**, 409 con defectos de sustancia. Reportes regenerados y
`./scripts/validate.sh` pasó con 23 pruebas y 4 omitidas. Estas métricas no son
certificación ni validación de navegador real.

Spring Boot M4 T4, “Reducir SSRF en clientes HTTP con `InetAddressFilter`”, se
rehízo con tres subtemas acumulativos: configurar `RestClient` con filtro,
timeouts y redirects detenidos; probar loopback con servidor local y control
positivo junto con clasificación de direcciones; verificar que un `302` no
llega a un segundo servidor. El laboratorio `examples/spring-ssrf` quedó en
Spring Boot 4.1.2/JDK 25 y ahora incluye Maven Wrapper para que el comando del
curso funcione desde el clon. No afirma que el filtro cierre SSRF, cubra todos
los clientes, evite DNS rebinding o sustituya reglas de proxy/egreso. El caso de
`169.254.169.254` solo prueba clasificación; no se conecta a metadatos reales.

La suite local `./mvnw -q clean test` pasó con tres pruebas. El fallo deliberado
de `DONT_FOLLOW` a `FOLLOW` fue detectado: la prueba esperaba `302`, recibió
`200`, y el destino local habría recibido el salto. También se comprobó el
selector documentado para las dos pruebas de destinos. Las auditorías registran
**136/1185 temas atómicos**: Java 101, Spring Boot 32, Node 2 y Flutter 1;
**1094/1185 practicables**, 409 con señales de defecto de sustancia. Se
regeneraron índices e informes y `./scripts/validate.sh` pasó: 23 pruebas, 4
omitidas. Las cifras son señales estructurales, no certificación ni revisión
pedagógica humana.

Spring Boot M4 T5, “Flujo de login completo”, se rehízo en tres subtemas: comparar
contraseña con `PasswordEncoder`; emitir y usar el `JwtService` ya creado en M4
T2; comprobar errores de credenciales y acceso protegido. Se unificó el paquete
en `com.example.demo`, se quitó la clase duplicada sugerida por el material
anterior y se cambió el test a `new ObjectMapper()` porque el starter usado en el
proyecto no registra ese mapper como bean. El usuario/hash en memoria se marca
como fixture de laboratorio; el material indica que producción debe usar un hash
persistido, TLS, límites y manejo estándar de autenticación.

En el backend acumulado Spring Boot 4.1.2/JDK 25, `./mvnw -q clean test` pasó
con **29 pruebas**, sin fallos ni omisiones. Los tests de login validan `200` y
token, `401` sin token, `200` con bearer y el mismo `401`/cuerpo ante email
desconocido o contraseña incorrecta. Se cambió deliberadamente el argumento de
`PasswordEncoder.matches`; el test del login válido falló con `401` en vez de
`200`; restaurado el código, el test dirigido volvió a pasar. Auditorías:
**137/1185 temas atómicos**: Java 101, Spring Boot 33, Node 2 y Flutter 1;
**1093/1185 practicables**, 409 con señales de defecto de sustancia. Índices e
informes están regenerados y `./scripts/validate.sh` pasó con 23 pruebas y 4
omitidas. Las métricas son señales estructurales, no certificación ni revisión
pedagógica humana.

Spring Boot M5 T1, “`@ConfigurationProperties` tipado”, ahora continúa la misma
aplicación: `security.jwt.secret-base64` sigue leyendo `JWT_SECRET_BASE64` y el
nuevo `JwtSettings` agrupa secreto y vencimiento. `DemoApplication` activa
`@ConfigurationPropertiesScan`; el `JwtService` existente recibe el record y
usa `expirationSeconds`, sin añadir otra clave ni servicio. El test de contexto
comprueba enlace correcto, texto que no convierte a `long` y vencimiento bajo
`@Min(60)`. Se aclaró que la conversión ocurre al enlazar durante el arranque,
no al compilar, y que `@NestedConfigurationProperty` solo orienta el procesador
de metadatos. Se actualizó también `src/test/resources/application.properties`:
reemplaza la configuración principal y debe incluir el nuevo vencimiento.

En el backend acumulado Spring Boot 4.1.2/JDK 25, `./mvnw -q clean test` pasó
con **32 pruebas**, sin fallos ni omisiones. Se retiró temporalmente `@Validated`
y la prueba de `59` segundos detectó que el contexto arrancaba cuando debía
fallar; restaurada la anotación, vuelve a pasar. También se fijó el vencimiento
del servicio en `900` en vez de leer el tipo: `JwtServiceTest` falló al comparar
los `120` segundos esperados con `900`; restaurada la configuración, la suite
completa pasó. La propiedad de producción usa `${JWT_SECRET_BASE64:}` para que
una variable ausente llegue vacía a `@NotBlank`. El test también exigió actualizar
`src/test/resources/application.properties`: este archivo reemplaza el principal
y debe incluir el nuevo vencimiento. Auditorías: **138/1185 temas atómicos**:
Java 101, Spring Boot 34, Node 2 y Flutter 1; **1093/1185 practicables**, 409
con señales de defecto de sustancia. `./scripts/validate.sh` pasó con 23 pruebas
y 4 omitidas; índices, informes y grafo están regenerados. Estas métricas son
estructurales, no certificación ni revisión humana.

Spring Boot M5 T2, “Fallar rápido al arranque”, se rehízo en tres subtemas sobre
`JwtSettings` existente: propiedad ausente, secreto vacío y prueba de la
validación quitando `@Validated`. `ApplicationContextRunner` verificó
`BindValidationException` como causa raíz para valor ausente y vacío; el campo
`long` con texto y el límite `59` también se rechazan. Se corrigió
`application.properties` de producción a `${JWT_SECRET_BASE64:}`: cuando falta
la variable, el placeholder vacío deja que `@NotBlank` detenga el arranque con
el nombre de propiedad. Se ejecutó `env -u JWT_SECRET_BASE64 ./mvnw -q
spring-boot:run`; el proceso acabó antes de atender HTTP y el log señaló
`secretBase64` como vacío. Sin el sufijo `:`, el proceso llegaba al decoder de
JJWT y fallaba como Base64 inválido, un diagnóstico menos claro.

La suite acumulada Boot 4.1.2/JDK 25 pasó con **34 pruebas**, sin fallos ni
omisiones. Se quitó `@Validated`; los casos de secreto ausente y vencimiento
menor al mínimo fallaron al encontrar un contexto que arrancaba. Restaurada la
anotación, la suite volvió a pasar. Auditorías: **138/1185 temas atómicos**:
Java 101, Spring Boot 34, Node 2 y Flutter 1; **1093/1185 practicables**, 409
con señales de defecto de sustancia. `./scripts/validate.sh` pasó con 23
pruebas y 4 omitidas; informes y grafo están regenerados.

Spring Boot M5 T3, “Manejo global de excepciones consistente entre entornos”,
se alineó con el contrato existente del Módulo 2. Ese backend usa `ApiError`
(`codigo`, `mensaje`, `campos`), no `ProblemDetail`; la nueva excepción
`LimiteParadasExcedidoException` se agrega al `GlobalExceptionHandler`
existente y devuelve `422`. El controller `RutasEntregaController` mantiene
exactamente 20 paradas y rechaza 21. El test usa MockMvc y bearer creado por el
`JwtService` real; cubre cuerpo JSON, status y límite exacto. La suite acumulada
Boot 4.1.2/JDK 25 pasó con **36 pruebas**, sin fallos ni omisiones. Cambiar el
status a 400 produjo `400` en vez de `422`; cambiar `>` por `>=` hizo fallar el
test del límite exacto con `422` en vez de `200`; ambos cambios se restauraron.
Auditorías: **139/1185 temas atómicos**: Java 101, Spring Boot 35, Node 2 y
Flutter 1; **1093/1185 practicables**, 409 con señales de defecto de sustancia.
`./scripts/validate.sh` pasó con 23 pruebas y 4 omitidas; informes e índices
regenerados. Estas medidas no sustituyen revisión humana ni certifican el resto.

Spring Boot M6 T1, “Probar un controller con `@WebMvcTest`”, se rehízo en tres
subtemas atómicos: petición POST con `MockMvc` y `ServicioTareas` simulado;
validación de título vacío y contrato existente `ApiError`; fallo deliberado al
retirar `@MockitoBean`. Reutiliza `TareaController`, `CrearTareaRequest`,
`TareaDTO` y `GlobalExceptionHandler` del proyecto acumulativo. Se corrigieron
los imports para Boot 4 (`org.springframework.boot.webmvc.test.autoconfigure`)
y se dejó claro que `addFilters=false` aísla MVC: este slice no vuelve a probar
JWT ni autorización. `JwtService` requiere mock porque el filtro del contexto lo
inyecta aunque los filtros no se registren en MockMvc.

La prueba dirigida pasó con dos métodos. Sin `@MockitoBean`, el contexto falló con
`NoSuchBeanDefinitionException` para `ServicioTareas`; restaurada la anotación,
la suite acumulada Boot 4.1.2/JDK 25 pasó con **38 pruebas**, sin fallos ni
omisiones. Se comprobaron `201`, el error `400`/`VALIDACION` y el mensaje de
campo con el controller y advice reales. El tiempo depende del equipo y no se
usa como comparación universal. Índices, backlog, temarios y grafos quedaron
regenerados. `./scripts/validate.sh` pasó: 23 pruebas de script, 4 omitidas;
las demás validaciones de contenido, trazabilidad, índices y gráficos también
terminaron correctamente. `git diff --check` pasó. Tras M6 T1 las auditorías
globales registran **140/1185 temas estructuralmente completos** y
**1092/1185 practicables**; 409 conservan señales de defectos de sustancia.
Estos indicadores no acreditan ejecución de todos los ejemplos ni revisión
pedagógica humana. No se modificó la aplicación del repo para el laboratorio;
el backend temporal vive en `/tmp/imperial-spring-m4-jwt/app`. Permanecen
excluidos del commit los dos cambios locales de Flutter ya existentes.

Spring Boot M6 T2, “Probar el repositorio contra PostgreSQL con
`@DataJpaTest`”, se rehízo en los subtemas 6.4–6.6: conectar el slice al
contenedor; confirmar motor y persistencia; detectar el retorno accidental a
H2. Se corrigieron las APIs para Boot 4 y Testcontainers 2.0.5: `DataJpaTest`
en `org.springframework.boot.data.jpa.test.autoconfigure`,
`AutoConfigureTestDatabase` en `org.springframework.boot.jdbc.test.autoconfigure`
y `PostgreSQLContainer` en `org.testcontainers.postgresql` sin tipo genérico.
El POM didáctico declara driver PostgreSQL y módulos separados de Testcontainers;
si la aplicación usa Flyway, se necesita `flyway-database-postgresql` para sus
migraciones. `@DynamicPropertySource` publica conexión/credenciales y
`Replace.NONE` impide sustituir el `DataSource` real.

En el backend acumulado Boot 4.1.2/JDK 25/Testcontainers 2.0.5, `test-compile`
pasó y las dos pruebas PostgreSQL pasaron contra PostgreSQL 16.15. Se usó el
Podman ya activo por su socket Docker compatible; Testcontainers pudo usarlo con
`DOCKER_HOST=unix:///tmp/imperial-podman.sock` y hubo que desactivar Ryuk solo en
este laboratorio (`TESTCONTAINERS_RYUK_DISABLED=true`). Se quitó deliberadamente
`@DynamicPropertySource`: el slice eligió H2 y falló con `expected PostgreSQL but
was H2`; restaurado el método, volvió a pasar. La suite acumulada pasó con
**40 pruebas**, sin fallos ni omisiones. La primera ejecución reveló que el POM
del laboratorio no tenía `flyway-database-postgresql`; se añadió al laboratorio
y se reflejó como dependencia condicional en la lección. No se cambió la app del
repositorio. La descarga de la imagen tardó; quedó cacheada en Podman.

`./scripts/validate.sh` pasó con 23 pruebas de script y 4 omitidas; las demás
validaciones de contenido, trazabilidad, índices y gráficos también pasaron.
`git diff --check` pasó. La auditoría global tras M6 T2 registra **139/1185 temas
estructuralmente completos**, **1091/1185 practicables** y 409 con señales de
defecto de sustancia. Los indicadores no prueban ejecución de los demás
laboratorios ni sustituyen revisión humana.

Spring Boot M6 T3, “Integrar el flujo con `@SpringBootTest`”, se rehízo en tres
subtemas: POST autenticado seguido de GET del registro persistido; ruta protegida
sin JWT devuelve `401`; fallo deliberado cuando el servicio deja de guardar.
Reutiliza el `JwtService`, filtro, controller, servicio y repositorio reales del
proyecto acumulativo, con H2 de pruebas. Se aclara el límite: `@SpringBootTest`
con MockMvc carga el contexto completo, pero no inicia un servidor real ni prueba
TLS o el navegador; el token se firma directamente y no prueba login.

Los dos métodos dirigidos pasaron. Al sustituir temporalmente `crear` por un DTO
falso con ID `999`, el POST conservó `201`, pero el GET recibió `404` en vez de
`200`; se restauró el guardado en repositorio. La suite acumulada Boot 4.1.2/JDK
25 pasó con **42 pruebas**, sin fallos ni omisiones; Testcontainers requiere el
mismo socket Podman y los valores de entorno del tema T2 en este equipo. Los
cambios fueron solo de contenido y reportes: el backend temporal está en
`/tmp/imperial-spring-m4-jwt/app`.

`./scripts/validate.sh` pasó con 23 pruebas de script y 4 omitidas; las demás
validaciones de contenido, trazabilidad, índices y gráficos pasaron.
`git diff --check` pasó. Las auditorías globales tras M6 T3 registran
**140/1185 temas estructuralmente completos**, **1090/1185 practicables** y
409 con señales de defecto de sustancia. Las mediciones estructurales no
acreditan la ejecución de los demás ejemplos ni una revisión pedagógica humana.

Spring Boot M7 T1, “Actuator y health checks personalizados”, se rehízo en
subtemas 7.1–7.3. Usa `spring-boot-starter-actuator` y las APIs Boot 4 bajo
`org.springframework.boot.health.contributor`. Se corrigió un conflicto del
borrador: el indicador ahora se llama `pasarelaPagos`, separado del bean
`ServicioExterno`. El health endpoint queda protegido por el `SecurityConfig`
existente; el test firma un JWT real, cubre `200/UP`, `503/DOWN` y `401` anónimo.
Los detalles (`show-details` y `show-components`) se habilitan solo en
`src/test/resources/application.properties`. En producción el tema conserva el
predeterminado que oculta detalles y explica la opción de puerto/red de gestión.
También aclara que la caída de una dependencia afecta readiness, no liveness.

En el backend acumulado Boot 4.1.2/JDK 25, los tres tests dirigidos pasaron. Al
invertir la rama `DOWN` a `UP`, el caso de caída detectó `200` en vez de `503`;
restaurada la lógica, `./mvnw -q clean test` pasó con **45 pruebas**, sin fallos
ni omisiones. Cambios solo en Markdown/reportes del repositorio; código temporal
en `/tmp/imperial-spring-m4-jwt/app`.

`./scripts/validate.sh` pasó con 23 pruebas de script y 4 omitidas; las demás
validaciones de contenido, trazabilidad, índices y gráficos también pasaron.
`git diff --check` pasó. Las auditorías tras M7 T1 registran **139/1185 temas
estructuralmente completos**, **1089/1185 practicables** y 409 con señales de
defecto de sustancia.

Spring Boot M7 T2, “Contar operaciones de negocio con Micrometer”, se rehízo en
subtemas 7.4–7.6. Agrega `MeterRegistry` y un `Counter` de cardinalidad acotada
a `ServicioTareas.crear`; lo incrementa después del guardado. El test crea una
tarea por la API, compara el contador antes/después y comprueba nombre/tag/valor
en `/actuator/metrics`. La exposición `health,metrics` vive solo en propiedades
de test y el endpoint sigue protegido por JWT; el tema aclara que el counter en
memoria no reemplaza la fuente persistida de negocio.

En el backend acumulado Boot 4.1.2/JDK 25, los dos métodos dirigidos pasaron. Al
quitar `tareasCreadas.increment()`, el test detectó `1.0` esperado frente a
`0.0`. La suite acumulada pasó con **47 pruebas**, sin fallos ni omisiones;
Testcontainers usó el socket Podman del tema M6 T2. Los cambios de la academia
son contenido y reportes; el código temporal está en
`/tmp/imperial-spring-m4-jwt/app`.

`./scripts/validate.sh` pasó con 23 pruebas de script y 4 omitidas; las demás
validaciones de contenido, trazabilidad, índices y gráficos también pasaron.
`git diff --check` pasó. Tras M7 T2, las auditorías globales registran
**140/1185 temas estructuralmente completos**, **1088/1185 practicables** y
409 con señales de defecto de sustancia.

Spring Boot M7 T3, “Liveness y readiness sin reinicios en cadena”, se rehízo
en subtemas 7.7–7.9. La guía oficial Boot 4.1.2 confirma que
`management.endpoint.health.probes.enabled=true` habilita `/actuator/health/liveness`
y `/actuator/health/readiness`; las dependencias no se agregan solas a readiness.
El ejercicio decide incluir `pasarelaPagos` únicamente en el grupo readiness y
advierte que una dependencia compartida caída puede retirar todas las réplicas.
Incluye un bloque de sondas Kubernetes para insertar dentro del contenedor del
Deployment y explica que `MockMvc` no valida el clúster ni la red.

`DisponibilidadProbesTest` publica `ReadinessState` y `LivenessState` mediante
`AvailabilityChangeEvent`, prueba dependencia caída (readiness `503`, liveness
`200`), `REFUSING_TRAFFIC`, `BROKEN` y autenticación JWT. Los estados se restauran
antes y después de cada prueba porque el contexto Spring se comparte. Una primera
suite completa de 51 pruebas encontró contaminación del estado liveness en un
test preexistente de health; tras añadir la restauración `@AfterEach`, la suite
completa pasó con **51 pruebas, 0 fallos, 0 errores y 0 omitidas**. También se
probó deliberadamente agregar `pasarelaPagos` a liveness: la expectativa `200`
falló al recibir `503`, y se restauró la configuración correcta. El código y los
tests viven solo en `/tmp/imperial-spring-m4-jwt/app`; el repositorio recibió
contenido y reportes, no cambios de la app.

Documentación primaria contrastada: Kubernetes Probes, `AvailabilityChangeEvent`
y `ApplicationAvailability` de Spring Boot 4.1.2. La lección mantiene separadas
la prueba del contexto Spring y la validación futura en Kubernetes. Tras T3, los
reportes registran **140/1185 temas estructuralmente completos**, **1087/1185
practicables** y 409 temas con señales de defecto de sustancia. Se regeneraron
los reportes de sustancia, calidad pedagógica, metodología, código/visuales,
backlog, índice web, grafo de prerrequisitos, profundidad, subtemas atómicos,
temarios prioritarios y grafo del repo. Estos indicadores no demuestran la
comprensión del estudiante ni ejecución de los otros laboratorios.

Spring Boot M8 T1, “Producers y consumers con Spring Kafka”, se revisó tema por
tema contra el laboratorio `examples/spring-kafka-rutaflow/` y la guía de Spring
Kafka 4.0. El tema ahora muestra el record, la llamada a `KafkaTemplate`, el
listener, la clave de agrupación y las aserciones reales de partición/offset; se
aclara que las colas del test son solo sincronización, no colas de Kafka. También
se distingue confirmación del envío de procesamiento del consumer, y la
idempotencia del productor de la idempotencia de negocio.

La prueba del laboratorio dejó ocho casos en verde con `./mvnw -q clean test`
(JDK 25, Spring Boot 4.1.2, Kafka 4.2.2). Se provocó el fallo reemplazando la
clave `envioId` por `eventId`: la prueba de orden falló de manera determinista
con partición 0 esperada y partición 2 observada; el productor se restauró. Al
investigar un `KafkaStorageException` de cierre, se añadió `@DirtiesContext` al
test como sugiere Spring Kafka para coordinar cierre de contexto y broker. La
suite volvió a pasar sin el error de archivos temporales; sigue apareciendo un
`WARN` interno de Kafka 4.2.2 al cerrar un cliente ya cerrado. Se reemplazó la
sobrecarga deprecada `KafkaTestUtils.consumerProps` por la versión 4.0. El
README registra el límite y el resultado; no se oculta la advertencia restante.

El laboratorio reúne código de temas posteriores (DLT, outbox/inbox); la lección
indica practicar solo las pruebas dirigidas de T1. Los ejemplos siguen usando
Kafka embebido y H2: esto comprueba contratos del ejercicio, no persistencia ni
operación en un clúster Kafka de producción.

Tras M8 T1, las auditorías globales registran **140/1185 temas estructuralmente
completos**, **1088/1185 practicables** y 409 con señales de defecto de sustancia.
Se regeneraron índices y reportes y `./scripts/validate.sh` pasó con 23 pruebas
de script y 4 omitidas; `git diff --check` también pasó. No se modificaron los
archivos locales de Flutter.

Spring Boot M8 T2, “Dead-letter queue”, se revisó con el comportamiento de
`DefaultErrorHandler`, `FixedBackOff` y `DeadLetterPublishingRecoverer` de Spring
Kafka 4.0. El test ahora compara el registro recuperado con el envío original:
key, partición y contenido JSON. Confirma tres entregas con `FixedBackOff(100L,
2)` y las mismas tres particiones en el topic original y su DLT.

La suite acumulada del laboratorio pasó con **8 pruebas, 0 fallos, 0 errores y 0
omitidas**. En copias temporales se ejecutaron tres fallos deliberados: retirar
`errorHandler` dejó el DLT vacío (`No records found for topic`); reemplazar la
key incorrecta por el `envioId` válido hizo vencer la espera de tres intentos;
y consultar `-dlt-mal` produjo error de lectura. También se cambió el backoff a
cero y se actualizó la expectativa a un intento; esa variante pasó. Las pruebas
se hicieron en `/tmp/spring-kafka-m8t2-copy`; el laboratorio original quedó
restaurado salvo la aserción de key/partición, que es el cambio intencional. Tras
M8 T2, las auditorías globales siguen en **140/1185 temas atómicos completos**,
**1088/1185 practicables** y 409 con señales de defecto de sustancia. Se
regeneraron los reportes e índice afectados; `./scripts/validate.sh` pasó con 23
pruebas de script y 4 omitidas, y `git diff --check` pasó.

Spring Boot M8 T3, “Transacciones Kafka y SQL: idempotencia y límites de
exactly-once”, queda revisado en cuatro subtemas. La lección separa reintentos
internos del productor, outbox SQL, deduplicación inbox y visibilidad de registros
abortados. No afirma que el test de idempotencia simule pérdida de ACK ni que una
transacción Kafka incluya PostgreSQL.

La suite del laboratorio pasó con **9 pruebas, 0 fallos, 0 errores y 0 omitidas**
mediante `./mvnw -q clean test` (Spring Boot 4.1.2, JDK 25 y Kafka embebido
4.2.2). El replay ahora fuerza una restricción que impide guardar `published_at`
después del primer ACK; al retirar la restricción se publica de nuevo el mismo
`eventId`, y el inbox conserva una sola proyección. Otro test aborta una
transacción de productor y contrasta dos consumidores: `read_committed` no ve el
registro y `read_uncommitted` sí.

En copias temporales, desactivar idempotencia dejó pasar la suite (el laboratorio
no induce la pérdida de ACK necesaria); retirar `@Transactional` hizo fallar el
rollback porque quedó la fila de envío; quitar la deduplicación inbox produjo
`DuplicateKeyException`; y configurar el consumer confirmado como
`read_uncommitted` hizo fallar la aserción porque vio el registro abortado. Las
mutaciones se restauraron. La suite conserva un `WARN` interno de Kafka al cerrar
un cliente ya cerrado; no se vio el error anterior de `KafkaStorageException`.

Límites: H2 y broker embebido no sustituyen PostgreSQL ni un clúster real. El test
de transacción mide visibilidad del productor abortado, no el flujo completo
Spring Kafka EOS con offsets. La consulta y el insert inbox se probaron
secuencialmente; la concurrencia requiere estrategia explícita ante conflicto de
unicidad. Tras regenerar índices y auditorías, la cobertura global queda en **140/1185
temas estructuralmente completos**, **1089/1185 practicables**, **1039/1185
completos en la auditoría de siete pasos** y 409 con señales automatizadas de
defecto de sustancia. Estas señales no miden comprensión humana ni certifican
los demás laboratorios. `./scripts/validate.sh` pasó con 23 pruebas de script
y 4 omitidas; `git diff --check` pasó.

Spring Boot M8 T4, “Rebalanceo de consumer groups y asignación de particiones”,
se revisó con un test de integración en el laboratorio existente. La lección se
reorganizó en cuatro subtemas 4.1–4.4, en formato Contexto → Hazlo tú → Entiende
→ Cierra. Se eliminaron afirmaciones absolutas de que todo cambio de miembros
reasigna todas las particiones, y se separaron membresía estática y asignadores
cooperativos. El texto aclara que el test mide callbacks y propiedad final en
Kafka embebido, no latencia de producción ni reinicios.

El test `unSegundoConsumidorProvocaRebalanceoYActualizaAsignaciones` arranca un
consumer con dos particiones, espera su asignación, une un segundo consumer al
mismo grupo y comprueba revocación más una partición final por instancia. La
suite acumulada del laboratorio pasó con **10 pruebas, 0 fallos, 0 errores y 0
omitidas** mediante `./mvnw -q clean test`. En una copia temporal se eliminó
`asignadas.removeAll(partitions)`; el test falló con 3 asignaciones locales en
vez de 2, reproduciendo estado obsoleto. Fuentes contrastadas: Apache Kafka
Consumer Configs 4.2 y protocolo de rebalanceo, más Spring Kafka 4.0 Rebalance
Listeners. `./scripts/validate.sh` pasó con 23 pruebas y 4 omitidas; `git diff --check`
pasó. La última auditoría global registra 140/1185 temas atómicos, 1088/1185
practicables, 1038/1185 completos en metodología de siete pasos y 409 temas con
señales automatizadas de defecto de sustancia. Estas métricas son estructurales,
no certifican la calidad pedagógica ni la comprensión humana.

Spring Boot M8 T5, “Kafka frente a RabbitMQ”, se reescribió en cuatro
subtemas atómicos: grupos/colas, retención/relectura, confirmación de publicación
frente a ack de consumo, y decisión por flujo con dos binders. Se corrigió la
simplificación falsa de que RabbitMQ no puede hacer fan-out (puede enrutar a
varias colas) o que siempre elimina al entregar (con ack manual puede reencolar).
También se acotó la retención Kafka a su política configurada. La guía reutiliza
código existente en `spring-kafka-rutaflow`, `node-messaging` y
`spring-stream-rutaflow`, sin prometer un test RabbitMQ/Testcontainers inexistente
en ese laboratorio.

Las pruebas del módulo Spring Cloud Stream pasaron (2 pruebas) y se cambió el
`OutputDestination.receive` deprecado por la variante con destino explícito
`routes.requested`; la advertencia desapareció. `npm test` en
`examples/node-messaging` pasó con 2 pruebas. No fue posible levantar los brokers
reales en este entorno: el comando `docker` no está instalado. El README del
laboratorio conserva la separación entre test binder (función/mapping) y broker
real. Para afirmar integración Kafka/Rabbit real, ejecutar los perfiles cuando
Docker esté disponible. Fuentes oficiales: documentación Kafka 4.2 sobre log y
retención; RabbitMQ sobre consumers y confirms; Spring AMQP sobre ack y publisher
confirms; Spring Cloud Stream sobre binder y test binder.

La validación de repo pasó con 23 pruebas de script (4 omitidas). La última
auditoría registra 140/1185 temas atómicos, 1087/1185 practicables, 1035/1185
completos en metodología de siete pasos y 409 con señales automatizadas de
defecto de sustancia. La auditoría estructural detecta contenido en 236 temas;
ninguna de estas cifras certifica la calidad pedagógica o comprensión humana.

Spring Boot M8 T6, “Spring Cloud Stream y binders de Kafka/RabbitMQ”, quedó
reescrito en cuatro subtemas con ejemplos tomados del laboratorio
`examples/spring-stream-rutaflow/`: `RouteFunctions`, records de entrada/salida,
bindings y perfiles Kafka/Rabbit. Se sustituyó el modelo inventado
`PedidoEvento/normalizarPedido` por `ShipmentCreated → RoutePlanningRequested`.
El tema aclara que el test binder es en memoria y no demuestra conexión, DLQ ni
creación de topología real del broker.

Se agregó la prueba `zonaXXSeRechazaParaRevisionManual`; la suite pasó con **3
pruebas** y sin la advertencia del método `OutputDestination.receive` deprecado.
En una copia temporal se sustituyó el código postal `XX101` por `10101`; la
prueba esperó una excepción que ya no ocurrió, como debía. Docker no está
instalado aquí, así que los perfiles Kafka/Rabbit reales y sus DLQ no se
verificaron en este entorno; queda explícito en la lección. Fuentes oficiales:
Spring Cloud Stream binder, test binder y manejo de errores.

Spring Boot M8 T7, “Kafka Streams con Spring para transformar eventos”, se
implementó en un laboratorio nuevo `examples/spring-kafka-streams-rutaflow/`,
con `@EnableKafkaStreams`, `StreamsBuilder`, filtrado `KStream` y conteo por
ventana con un store. Se agregó `TopologyTestDriver` para validar filtro/key y
conteos con tiempo controlado; su README contiene comandos para broker local,
creación de tópicos, producción y observación de ambas salidas. La lección quedó
en cuatro subtemas, distingue driver de broker y enlaza a documentación oficial
Spring Boot 4.0, Spring Kafka y Kafka 4.2.

`./mvnw -q clean test` pasó con **2 pruebas**. En copias temporales, cambiar el
filtro para aceptar PENDIENTE hizo fallar la aserción (`pedido-2` esperado,
`pedido-1/PENDIENTE` recibido); agrupar por pedido en vez de estado hizo fallar
el conteo (`2` esperado, `1` recibido). Las mutaciones se mantuvieron fuera del
repositorio. Docker no está instalado aquí, así que no se ejecutó la topología
contra broker real; el test driver no acredita red, ACL, tópicos ni restauración
de estado real. La suite muestra una advertencia JVM de acceso nativo de
RocksDB, sin fallos de test.

**Siguiente tema:** Spring Boot M8 T8, “Avro y Schema Registry para contratos de
eventos”. Revisa si hay un laboratorio real y versiones compatibles; distingue
compatibilidad del esquema de compatibilidad del payload y prueba productor y
consumidor con esquemas concretos.
