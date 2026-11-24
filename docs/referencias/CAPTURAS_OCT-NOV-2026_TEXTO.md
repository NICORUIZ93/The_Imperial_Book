# Capturas de cursos y publicaciones de programación (oct–nov 2026) — texto

Texto de *Capturas_cursos_y_publicaciones_programacion_(oct-nov-2026).pdf*, de 38 páginas: las 35 del PDF de octubre más las 3 capturas de noviembre (páginas 36 a 38). Se transcribió leyendo cada página, sin reconocimiento automático (OCR). Se quitaron los textos de interfaz de las redes sociales (likes, «Seguir», horas, etc.).

En las páginas con contenido útil se transcribe la información completa. Las que no sirven para los cursos se describen en una línea. Las notas entre corchetes **[Nota]** son aclaraciones o correcciones añadidas, no forman parte de la captura.

## Índice de páginas

| Pág. | Tema | Curso |
|---|---|---|
| 1 | Taller Clean Architecture y DDD con Spring Boot (temario) | Spring Boot |
| 2 | 7 estrategias de despliegue en Kubernetes | DevOps |
| 3 | Patrón SAGA en una transferencia bancaria (NovaBank) | Microservicios |
| 4 | Patrón SAGA: qué es, ejemplo, idea clave, orquestación y coreografía | Microservicios |
| 5 | Angular Native en iPhone como build de Release | Angular |
| 6 | Records en C# frente a clase inmutable | Java (comparación) |
| 7 | Git: chuleta de 80 comandos | DevOps / Fundamentos |
| 8 | Hoja de ruta de diseño de sistemas | Microservicios / DevOps |
| 9 | Java 27; curso Kafka & RabbitMQ; computación distribuida | Java / referencias |
| 10 | (juegos, no útil) | — |
| 11 | Libro *Blockchain práctico* | Referencia |
| 12 | Spring Boot en 9 capas | Spring Boot |
| 13 | C4 y ADR | Arquitectura |
| 14 | Ejercicio: modelo y diagrama de bloques de un circuito RLC con dos fuentes | Control 1 |
| 15 | Streams e interfaces funcionales | Java |
| 16 | Spring AI 2026 | Spring Boot |
| 17 | Arquitectura hexagonal: puertos con tipos del dominio | Spring Boot |
| 18 | Tokenización de tarjetas | Seguridad |
| 19 | Curso VPS seguro en Ubuntu | DevOps |
| 20 | OSRM en Docker para calcular rutas | Flutter / DevOps |
| 21 | Curso Kafka + Spring Boot (publicidad) | Referencia |
| 22 | Libro *Programación nativa de dispositivos móviles* | Android / iOS |
| 23 | Temario: app de rutas con Flutter + backend Spring Boot | Flutter / Spring Boot |
| 24 | Coddy, lecciones cortas de programación | Práctica |
| 25–30 | (reels de cine y frases, no útil) | — |
| 31 | Nuevos milestones del ecosistema Spring | Spring Boot |
| 32 | Humble Bundle de cursos de Java (publicidad) | — |
| 33 | Archify: de texto a diagrama de arquitectura | Herramientas |
| 34 | Flint: IA de programación local | Herramientas |
| 35 | (calendario escolar personal, no se transcribe) | — |
| 36 | El ecosistema de Docker | DevOps |
| 37 | La arquitectura de Kubernetes | DevOps |
| 38 | Quiz: regulador de tensión en serie | Control 1 |

---

## Texto por página

### Pág. 1 — Taller «Clean Architecture y DDD con Spring Boot» (DAS Academy, publicidad)

Taller en vivo de 5 clases de 2 horas. Modela el negocio con DDD táctico (value objects, entidades y un agregado con sus invariantes) y ordena el código con la Clean Architecture de Robert C. Martin.

1. Entidades con DDD táctico.
2. Casos de uso: interactors y boundaries.
3. Adaptadores de interfaz: controllers y presenters.
4. Frameworks y drivers: Spring Boot, JPA y H2.
5. Código completo: del modelo del negocio a la API.

Stack: Java, Spring Boot, Spring Data JPA, H2.

**Uso:** referencia de temario para el módulo de arquitectura de Spring Boot.

### Pág. 2 — 7 estrategias de despliegue en Kubernetes (Cloudly DevOps)

Tres vienen integradas en Kubernetes. Las otras cuatro necesitan un balanceador, una malla de servicios (*service mesh*) o una herramienta de entrega. Referencia citada: Octopus Deploy.

| # | Estrategia | Cómo funciona | Tipo | Configuración / costo |
|---|---|---|---|---|
| 1 | Rolling update | Reemplaza los pods por lotes | Integrada | `replicas: 6`, `maxSurge: 2`, `maxUnavailable: 2`; en el ejemplo, 4 de 6 pods ya en v2 |
| 2 | Ramped (despliegue lento) | Un pod a la vez, verificando cada paso | Integrada | `replicas: 4`, `maxSurge: 1`, `maxUnavailable: 1`; monitorizar cada paso |
| 3 | Recreate | Elimina todos los v1 y luego arranca v2 | Integrada | `strategy.type: Recreate`; no hay versiones mezcladas, pero hay caída de servicio y los usuarios ven errores |
| 4 | Blue/Green | Dos entornos completos; se cambia el Service de uno a otro | Necesita herramientas | `selector: app: my-app-blue`; rollback = volver a cambiar; costo: el doble de pods |
| 5 | Canary | Un pequeño % de usuarios recibe primero la versión nueva | Necesita herramientas | `my-app`: 10 réplicas, `my-app-canary`: 2; necesita tráfico real; si va bien, 25 % |
| 6 | A/B testing | Compara versiones según métricas de negocio | Necesita herramientas | `my-app-v1`: 5 réplicas, `my-app-v2`: 5; se divide por usuario o cabecera; ejemplo de conversión 2,3 % frente a 3,4 % |
| 7 | Shadow | Copia el tráfico real a v2; las respuestas de v2 se descartan | Necesita herramientas | `my-app-shadow`: 4; espejo de tráfico; sin impacto en el usuario; sirve de prueba de carga con producción |

### Pág. 3 — Patrón SAGA en una transferencia bancaria (NovaBank)

Coordinación de microservicios mediante eventos para garantizar la consistencia de datos. Propiedades que destaca: transacciones distribuidas, procesamiento asíncrono, tolerancia a fallos y consistencia de datos.

**Flujo exitoso** (la SAGA coordina los pasos mediante eventos de Kafka):

1. **Cliente:** solicita una transferencia de 200 €.
2. **Servicio de Orquestación:** crea la SAGA, guarda su estado en la «BD SAGA» y publica el evento de inicio.
3. **Apache Kafka:** transporta los eventos `transferencia.iniciada`, `cuenta.origen.debitada`, `cuenta.destino.acreditada`, `transferencia.completada` y `transferencia.fallida`.
4. **Servicio de Cuentas:** valida el saldo, debita el importe y publica `CuentaOrigenDebitada`.
5. **Servicio de Operaciones:** valida la cuenta destino, acredita el importe y publica `CuentaDestinoAcreditada`.
6. **Servicio de Notificaciones:** registra el resultado, notifica al cliente, cierra la SAGA y publica `TransferenciaCompletada`.

**Flujo de compensación (error)** (si un paso falla, se ejecutan las acciones de compensación):

1. El cliente solicita la transferencia.
2. El Servicio de Orquestación detecta el error y ejecuta la compensación.
3. Kafka transporta `transferencia.iniciada`, `cuenta.origen.debitada`, `transferencia.fallida` y `compensacion.ejecutada`.
4. **Error en el proceso:** por ejemplo, falla la acreditación en la cuenta destino.
5. **Acción de compensación (Servicio de Cuentas):** devuelve el importe y publica el evento de compensación.
6. **Transferencia fallida (Notificaciones):** registra el error, notifica al cliente y cierra la SAGA.

**Eventos principales:** `TransferenciaIniciada`, `CuentaOrigenDebitada`, `CuentaDestinoAcreditada`, `TransferenciaCompletada`, `TransferenciaFallida`, `CompensacionEjecutada`.

### Pág. 4 — Patrón SAGA («El profe DiegoH enseña»)

Pregunta de partida: ¿qué pasa si creas un pedido, reservas el stock y el pago falla?

1. **¿Qué es?** Una SAGA coordina transacciones locales entre varios servicios que forman una sola operación de negocio. Si una etapa falla y no puede recuperarse, se ejecutan compensaciones para revertir los efectos de los pasos anteriores, cuando corresponda.
2. **Ejemplo, una compra online.** Ejecución normal: crear pedido ✓ → reservar stock ✓ → cobrar pago ✗ (pago rechazado). Si el fallo no puede resolverse, empieza la compensación en orden inverso: liberar stock → cancelar pedido.
3. **La idea clave.** Compensar no es retroceder el tiempo: es ejecutar una acción nueva que contrarresta los efectos de otra. Durante una SAGA pueden verse estados intermedios.
4. **Dos formas de coordinar.**
   - **Orquestación:** un coordinador central dirige los pasos y las compensaciones.
   - **Coreografía:** los servicios reaccionan a eventos y desencadenan los pasos siguientes, sin coordinador central.

**¡Atención!** Diseña compensaciones idempotentes y reintentos seguros, porque una compensación también puede fallar.

### Pág. 5 — Angular Native en un iPhone (Victor Moreno, HorizonTech)

- Angular Native ya corre en un iPhone como build de Release: sin Metro ni Expo Go, instalada como cualquier app y sin WebView.
- El camino fue el de cualquier app de Expo: la misma plantilla, el mismo *prebuild* y el mismo `app.json`. Angular pone los componentes, los signals y el router; Expo pone el teléfono.
- En la demo se ven Face ID con un signal, una cola de canjes que espera sin red y se envía al volver, una lista de 2.000 filas que solo dibuja las visibles (`virtual-list`), ocho flujos de Maestro pasando y 241 pruebas en Node.
- La versión ng-native 0.18.2 salió el 25 de octubre con soporte para Expo SDK 58.
- Dos cosas con las que cualquiera se va a encontrar:
  - Expo Go en iPhone solo acepta el SDK más nuevo.
  - La build de Release pide `bundleIdentifier` y tu propio *team* en `app.json`.
- Idea de la captura sobre listas: un `scroll-view` monta todas las filas; un `virtual-list` monta solo las cercanas a la pantalla y las recicla al desplazarte.

### Pág. 6 — Records en C# frente a clase inmutable (Alejandro Cruz Arenas)

- Una clase inmutable «tradicional» necesita propiedades `init`, un constructor, `GetHashCode` y `Equals`: unas 20 líneas.
- El record expresa el mismo contrato en una línea: `public record LogAuditoriaRecord(int Id, string Accion, DateTime Fecha);`.
- Mensaje: menos código, más seguridad. Inmutabilidad por defecto y comparación por valor.

**[Nota]** El `record` de Java (desde Java 16) hace lo mismo: genera `equals`, `hashCode` y `toString` a partir de sus componentes. Ver Java, sección 2.2.

### Pág. 7 — Git: chuleta de 80 comandos (Swadesh Kumar)

**[Nota]** La imagen original trae varios errores de escritura («git bratus», «git shorting», «cherry-pirk», «--ammed», «git rebase --shert»…). Aquí van ya corregidos.

**1. Configuración**
1. `git config --global user.name "Tu Nombre"`
2. `git config --global user.email "tu@ejemplo.com"`
3. `git config --global core.editor "code --wait"`
4. `git config --list`
5. `git config --global --list`
6. `git init`
7. `git clone <url>`
8. `git clone <url> <carpeta>`

**2. Instantánea básica**
9. `git status`
10. `git add <archivo>`
11. `git add .`
12. `git commit -m "mensaje"`
13. `git commit -am "mensaje"` (añade y confirma los archivos ya rastreados)
14. `git restore --staged <archivo>`
15. `git restore <archivo>`
16. `git rm <archivo>`
17. `git mv <viejo> <nuevo>`
18. `git diff`
19. `git diff --staged`
20. `git diff <archivo>`

**3. Ramas y fusiones**
21. `git branch`
22. `git branch <nombre>`
23. `git switch <rama>`
24. `git switch -c <rama-nueva>`
25. `git merge <rama>`
26. `git merge --no-ff <rama>`
27. `git branch -d <rama>`
28. `git branch -D <rama>` (fuerza el borrado)
29. `git log --oneline --graph --all`
30. `git log --decorate --graph`

**4. Repositorios remotos**
31. `git remote -v`
32. `git remote add origin <url>`
33. `git remote remove origin`
34. `git fetch`
35. `git pull`
36. `git pull origin <rama>`
37. `git push`
38. `git push origin <rama>`
39. `git push -u origin <rama>`
40. `git push --force-with-lease`

**5. Historial**
41. `git log`
42. `git log --oneline`
43. `git log --stat`
44. `git log --graph --oneline --all`
45. `git show <commit>`
46. `git blame <archivo>`
47. `git shortlog -sn`
48. `git reflog`
49. `git bisect start`
50. `git bisect good <commit>`
51. `git bisect bad <commit>`
52. `git bisect reset`

**6. Stash** (guardar cambios sin confirmar)
53. `git stash`
54. `git stash list`
55. `git stash pop`
56. `git stash apply`
57. `git stash drop`
58. `git stash clear`

**7. Deshacer**
59. `git reset --soft <commit>`
60. `git reset --mixed <commit>`
61. `git reset --hard <commit>` (ejemplo: historial A–B–C–D; tras `git reset --hard C` queda A–B–C)
62. `git revert <commit>`
63. `git revert <commit1>..<commit2>`
64. `git restore <archivo>`
65. `git restore --staged <archivo>`

**8. Avanzado**
66. `git cherry-pick <commit>`
67. `git rebase <rama>`
68. `git rebase -i <commit>`
69. `git clean -n` (simula qué se borraría) **[Nota: la imagen dice `-v`]**
70. `git clean -fd`
71. `git tag`
72. `git tag <nombre>`
73. `git push origin <tag>`
74. `git archive --format=zip -o <archivo.zip> <rama>`
75. `git submodule add <url> <ruta>`
76. `git submodule update --init`

**9. Atajos de flujo**
77. `git commit --amend`
78. `git commit --amend --no-edit`
79. `git rebase --abort`
80. `git rebase --continue`

**[Nota]** En 79–80 la imagen trae texto ilegible («--shert», «--worklowe»). Se sustituyeron por las dos opciones de `rebase` de uso diario.

**Los 3 árboles de Git:** directorio de trabajo (tu carpeta) → área de preparación (*staging*, lo añadido con `git add`) → repositorio (HEAD, los commits).
**Estrategias de fusión:** *fast-forward* (la rama avanza en línea recta) y *three-way merge* (se crea un commit de fusión).
**Consejos:** haz commits a menudo, escribe mensajes con sentido, haz `pull` antes de `push`, usa ramas para cada funcionalidad y revisa antes de fusionar.

### Pág. 8 — Hoja de ruta de diseño de sistemas (Rocky Bhatia)

| Etapa | Conceptos | Herramientas |
|---|---|---|
| Fundamentos | Cliente-servidor; HTTP/HTTPS; APIs; DNS (traduce dominios a IP); latencia (demora entre petición y respuesta); throughput (peticiones atendidas por unidad de tiempo) | Postman, Bruno, Swagger, Chrome DevTools |
| Arquitectura base | Balanceador de carga; CDN (contenido estático desde ubicaciones cercanas); proxy inverso; caché; limitación de tasa (*rate limiting*); API Gateway (rutas, autenticación, límites y monitoreo) | NGINX, HAProxy, Kong, Cloudflare |
| Bases de datos y almacenamiento | SQL (relaciones y transacciones); NoSQL (datos flexibles y de gran escala); índices; replicación; *sharding* (repartir una BD en varios nodos); almacenamiento de objetos (*blob*) | PostgreSQL, MySQL, MongoDB, Amazon S3, Redis |
| APIs y comunicación | REST; GraphQL (el cliente pide solo los datos que necesita); gRPC (protocol buffers); WebSockets (tiempo real bidireccional); colas de mensajes; pub/sub | Apollo, Kafka, NATS, RabbitMQ, AWS SQS |
| Microservicios y sistemas distribuidos | Límites de servicio por capacidad de negocio; patrón Saga; idempotencia; circuit breaker; teorema CAP (consistencia, disponibilidad y tolerancia a particiones); elección de líder (un nodo coordina las decisiones del clúster) | Docker, Kubernetes, Istio, ZooKeeper, Consul, etcd |
| Cloud, DevOps y seguridad | Contenedores; Kubernetes; serverless; CI/CD; autenticación; gestión de secretos | AWS, Azure, Google Cloud, Terraform, Vault, GitHub Actions |
| Observabilidad y crecimiento | Monitoreo; trazas distribuidas; diagramación con IA; revisión de diseño; planificación de capacidad; pensar en producción (fallos, escala y costo) | Grafana, Prometheus, Datadog, OpenTelemetry, ChatGPT, Claude |

Comentario de Prasad Rao (AWS) en la misma captura: entender latencia frente a throughput es un tema pequeño con grandes implicaciones de arquitectura.

### Pág. 9 — Java 27 y referencias

- **Java 27:** versión publicada en septiembre de 2026. Sigue la innovación en rendimiento, concurrencia y productividad, construyendo sobre Java 25 y anteriores.
- **Publicidad de Galaxy Training Perú:** pack «Kafka for Developers» + «RabbitMQ for Developers», 48 horas académicas, desde el 31 de octubre.
- **Facialix:** «Introducción a la computación distribuida», libro de nivel intermedio.

### Pág. 10 — (no útil)

Publicación de ROMs de videojuegos.

### Pág. 11 — Libro *Blockchain práctico* (Joaquim de Dalmases, Marcombo)

Guía para llevar a los programadores desde los fundamentos teóricos hasta el desarrollo de aplicaciones descentralizadas (DApps). Compartido por Dogram Code: dogramcode.com/libro/blockchain.

### Pág. 12 — Spring Boot en 9 capas

| # | Capa | Contenido | Tecnologías |
|---|---|---|---|
| 1 | Fundamentos y configuración | Conceptos básicos, estructura del proyecto, configuración inicial | Spring Boot, Java, Spring Initializr, `application.yml` |
| 2 | APIs REST | Endpoints REST, manejo de peticiones y respuestas | `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping` |
| 3 | Acceso a datos | Repositorios y operaciones CRUD | Spring Data JPA, Hibernate, MySQL, PostgreSQL, MongoDB |
| 4 | Seguridad | Autenticación, autorización, roles, protección de endpoints | Spring Security, JWT, OAuth 2.0, roles y permisos, CORS |
| 5 | Arquitectura y buenas prácticas | Separación en capas, validaciones, manejo de errores | Arquitectura en capas, DTOs, validaciones, manejo de excepciones, patrones |
| 6 | Servicios avanzados | Tareas programadas, segundo plano, caché, correo | Spring Scheduling, Spring Events, Spring Batch, caché, envío de emails |
| 7 | Integración y APIs externas | Consumo de servicios externos | RestTemplate, WebClient, Feign Client, microservicios |
| 8 | Despliegue y DevOps | Contenedores, integración continua, nube | Docker, Docker Compose, Jenkins, GitHub Actions, AWS |
| 9 | Monitoreo y observabilidad | Métricas, logs, trazabilidad | Spring Actuator, Prometheus, Grafana, ELK Stack, Sentry |

**[Nota]** En Spring Boot 3.2 y posteriores, el cliente síncrono recomendado es `RestClient`; `RestTemplate` está en mantenimiento.

### Pág. 13 — C4 y ADR: del diagrama a la memoria de decisiones

- **Modelo C4**, cuatro niveles de zoom:
  - **Context:** el sistema en su entorno.
  - **Containers:** aplicaciones y servicios principales (app web, API, worker, base de datos).
  - **Components:** componentes dentro de un contenedor (controlador, lógica de negocio, repositorio).
  - **Code:** clases y módulos.
- **ADR (Architecture Decision Record)**, cuatro secciones:
  - **Contexto:** ¿cuál es el problema o la situación?
  - **Decisión:** ¿qué se decidió y por qué?
  - **Alternativas:** ¿qué otras opciones se consideraron?
  - **Consecuencias:** ¿qué implica la decisión?
- Consejo del autor: dibuja el sistema con C4 y pregúntate por cada decisión importante «¿dentro de un año alguien entenderá por qué hicimos esto?». Si la respuesta es no, ahí necesitas un ADR. Los diagramas documentan sistemas; las decisiones documentan el pensamiento arquitectónico.

### Pág. 14 — Ejercicio: modelo matemático y diagrama de bloques (grupo «Ayuda Circuitos Eléctricos»)

**Enunciado:** para el sistema eléctrico de la figura, hallar el modelo matemático y construir un diagrama de bloques.

**Circuito:** fuente \(v_1\) → inductor \(L\) (corriente \(i_L\)) → nodo central; resistencia \(R\) del nodo central a tierra; condensador \(C\) (corriente \(i_C\), tensión \(v_C\)) del nodo central a la fuente \(v_2\).

**[Nota: solución propuesta, comprobada con álgebra simbólica (SymPy)]** Sea \(v_R\) la tensión del nodo central. Por la ley de corrientes de Kirchhoff (LCK) en ese nodo:

\[ i_L = \frac{v_R}{R} + i_C, \qquad L\frac{di_L}{dt} = v_1 - v_R, \qquad i_C = C\frac{d(v_R - v_2)}{dt} \]

En Laplace, con condiciones iniciales nulas:

\[ V_R(s) = \frac{R\,V_1(s) + s^2 RLC\,V_2(s)}{s^2 RLC + sL + R} \]

Las dos funciones de transferencia, con denominador común, son:

\[ \frac{V_R}{V_1} = \frac{R}{RLCs^2 + Ls + R}, \qquad \frac{V_R}{V_2} = \frac{RLCs^2}{RLCs^2 + Ls + R} \]

El diagrama de bloques tiene dos ramas que se suman: \(V_1\) por la primera función de transferencia y \(V_2\) por la segunda. El denominador es el mismo de un RLC de segundo orden, así que sirve para relacionarlo con \(\omega_n\) y \(\zeta\) en el módulo 12.

### Pág. 15 — Streams e interfaces funcionales en Java (David L.)

| Interfaz | Verbo | Método típico | Qué hace |
|---|---|---|---|
| `Predicate<T>` | decide | `filter()` | regla o condición: `true` o `false` |
| `Function<T,R>` | transforma | `map()` | convierte un valor en otro: entrada → salida |
| `Consumer<T>` | actúa | `forEach()` | recibe un valor y no devuelve resultado |
| `Supplier<T>` | provee | `generate()` | entrega un valor cuando se necesita |

Idea central: los Streams no son el fundamento; son una API que compone comportamiento.
- ¿Condición? → `Predicate`.
- ¿Transformación? → `Function`.
- ¿Acción? → `Consumer`.
- ¿Fuente de valores? → `Supplier`.

Cuando entiendes estas interfaces, los Streams dejan de ser solo métodos y empiezan a verse como composición de comportamiento.

### Pág. 16 — Spring AI 2026 (Viron Technologies)

- **Spring Boot 4:** framework de nueva generación, arquitectura modular, mejor rendimiento, soporte de Java 25.
- **Spring AI 2.0:** versión GA con integración mejorada de LLM, agentes y *tool calling*, capacidades empresariales.
- **Agentes de IA:** llamada a herramientas y ejecución de funciones, sistemas multiagente, integración con herramientas empresariales, automatización de procesos.
- **RAG:** mejor búsqueda en documentos, respuestas con contexto, integración de datos empresariales, soporte de bases vectoriales.
- **Bases vectoriales:** embeddings mejorados, mejor recuperación y anclaje de datos (casos en banca, salud y comercio).
- **Microservicios y cloud native:** mejor soporte de Kubernetes, despliegues en contenedores, serverless, escalabilidad y resiliencia.
- **Integración empresarial:** OpenAI, Anthropic y otros LLM; despliegues seguros.
- **API y experiencia del desarrollador:** clientes HTTP mejorados, versionado de APIs, configuración simplificada.
- **Observabilidad:** logs y trazas mejorados, monitoreo de cargas de IA.
- **Seguridad:** OAuth2 y JWT mejorados, escaneo de vulnerabilidades de dependencias, cumplimiento normativo.

**[Nota]** Es un post promocional; verificar cada novedad en spring.io antes de llevarla al curso.

### Pág. 17 — Arquitectura hexagonal: el dominio no debe conocer Spring (Sergi Rivero Galán)

Si tu dominio sabe que existe Spring, no tienes arquitectura hexagonal: tienes carpetas con nombres bonitos. El síntoma más claro está en los puertos.

```java
// ✗ Puerto atado al framework
public interface ReservaRepository {
    Page<ReservaEntity> buscar(Pageable pageable);
}

// ✓ Puerto con tipos del dominio
public interface ReservaRepository {
    List<Reserva> buscarDisponibles(Vehiculo vehiculo, Periodo periodo);
}
```

En el primero, el dominio depende de Spring Data y de una entidad JPA. En el segundo habla el idioma del negocio. El adaptador de infraestructura traduce: recibe la llamada, usa JPA, `Pageable` o lo que quiera, y devuelve objetos del dominio.

**Qué ganas:**
- Pruebas del dominio sin levantar Spring, en milisegundos.
- Cambiar de base de datos o de framework sin tocar las reglas de negocio.
- Código que un compañero nuevo entiende leyendo el dominio, no el framework.

### Pág. 18 — La tokenización y por qué protege tus pagos con tarjeta (Félix Tena)

- **¿Qué es?** Reemplaza los datos reales de la tarjeta (p. ej. `1234 5678 9000 3456`) por un código único o token (p. ej. `K9*X2-Y8`). Si alguien roba el token, no le sirve.
- **¿Cómo funciona?** Al pagar en línea viaja el token en lugar del número real. Si hackean al comercio, el atacante obtiene datos inútiles.
- **¿Por qué importa?** Menos riesgo de fraude, pagos con un clic (Apple Pay, Google Pay), más confianza y seguridad.

### Pág. 19 — Curso «VPS seguro en Ubuntu 20.04 con Let's Encrypt, Cloudflare y más» (Udemy)

Aprender a preparar, asegurar y mantener un servidor VPS propio para publicar proyectos de forma segura y sin restricciones. Gestionar sitios con y sin `www`. Creado por JuanD MeGon (ProgramaYa). Valoración 4,8 con 389 opiniones y 1.611 estudiantes.

**[Nota]** Ubuntu 20.04 ya no recibe soporte estándar; aplicar lo mismo a una versión LTS actual. Útil para publicar The Imperial Book en un VPS.

### Pág. 20 — OSRM en Docker para calcular rutas (comentario en «Codex en Español»)

OSRM (*Open Source Routing Machine*) corre en un contenedor de Docker. Se descarga el archivo de mapas de tu país. Si solo necesitas tu estado o región, recórtalo con los polígonos de esa zona (hay páginas para descargarlos) y elimina los demás para que no pese tanto. Sirve para calcular rutas de un punto A a un punto B. El autor no lo ha probado para mostrar puntos en un mapa.

### Pág. 21 — Curso «Kafka y Spring Boot: arquitectura event-driven» (DevTalles, publicidad)

Curso de Gabriel Alejandro Chaldu. Precio de lanzamiento: 14 USD con un cupón promocional. La misma página tiene una pregunta de un grupo de electricidad sin contenido útil.

### Pág. 22 — Libro *Programación nativa de dispositivos móviles: arquitectura, rendimiento, seguridad e identidad digital* (José Antonio Álvarez Bermejo)

No es una introducción a Kotlin ni un recetario de Android Studio. Parte del dispositivo real: el SoC, la jerarquía de memoria, la gestión térmica y la cadena de arranque.

### Pág. 23 — Temario: app de rutas en tiempo real

**App (Flutter):**
1. Diseño de pantallas.
2. Riverpod (gestor de estado).
3. Mapas de Google.
4. Localización en tiempo real.
5. Socket.IO.
6. Trazado y actualización de rutas.
7. Animaciones de localización.
8. Almacenamiento local.
9. Manejo de imágenes.
10. Peticiones HTTP (Dio).
11. Notificaciones push.

**Backend:**
1. Spring Boot (Java).
2. MySQL.
3. Datos espaciales con MySQL.
4. JPA/Hibernate.
5. Spring Security.
6. Socket.IO (tiempo real).
7. Almacenamiento de archivos.
8. API CRUD (crear, leer, actualizar y borrar).
9. JWT (Bearer token).
10. Protección de rutas por roles de usuario.
11. Notificaciones push.

### Pág. 24 — Coddy (coddy.tech)

Plataforma de lecciones cortas donde se escribe código real: Python, HTML, JavaScript, Java, C++ y otros. Útil para practicar entre capítulos.

### Págs. 25–30 — (no útiles)

- Reels de recomendaciones de cine y libros: *El escultor*, *Memorias de un caracol*, *American Pop*, *Meet the Feebles* y una escena de thriller (la pág. 30 repite la 29).
- La pág. 26 trae la frase «La vida solo puede ser comprendida hacia atrás, pero debe ser vivida hacia adelante».

### Pág. 31 — Nuevos milestones del ecosistema Spring (Aitor M.)

| Proyecto | Versión |
|---|---|
| Spring Boot | 4.2.0-M2 |
| Spring Framework | 7.1.0-M2 |
| Spring AI | 2.1.0-M1 |
| Spring Data | 2026.1.0-M2 |
| Spring Security | 7.2.0-M2 |
| Spring Integration | 7.2.0-M2 |
| Spring AMQP | 4.2.0-M2 |
| Spring Cloud | 2026.0.0-M1 («Paddington») |

**[Nota]** Son versiones *milestone*, no estables. El curso debe usar las versiones GA.

### Pág. 32 — Humble Bundle «The Complete Java Developer Bundle» (publicidad)

Más de 25 cursos: pipelines CI/CD con Jenkins, Spring Framework, Selenium WebDriver, estructuras de datos y algoritmos.

### Pág. 33 — Archify (vídeo de midudev)

«From plain English to architecture in seconds»: convierte una descripción del sistema o del código en un mapa de arquitectura interactivo. Genera una representación intermedia en JSON y la compila a HTML/SVG. Proyecto de código abierto con licencia MIT en GitHub.

### Pág. 34 — Flint: IA de programación local (ia.evoluciona)

Modelo de IA para programar que se descarga y ejecuta en el propio computador, sin suscripción ni internet. Según el post, procesa más de 125 tokens por segundo en un MacBook Pro. Licencia Apache 2.0.

### Pág. 35 — (no se transcribe)

Calendario escolar de noviembre de un colegio. Es información personal, no de los cursos.

### Pág. 36 — El ecosistema de Docker (naiker.codes)

Quién hace qué cuando una app se empaqueta y corre en contenedores.

- **Fundamentos:** Docker Engine, Docker Desktop, Docker CLI, Dockerfile, imagen Docker, contenedor Docker.
- **Construcción e imágenes:** BuildKit, Docker Buildx, multi-stage builds, Docker Hub, registro privado, etiquetas de imagen (*tags*).
- **Redes y comunicación:** red bridge, red host, red overlay, DNS interno, descubrimiento de servicios, mapeo de puertos.
- **Datos y persistencia:** volúmenes, *bind mounts*, tmpfs, backups, *storage drivers*, secretos y configs.
- **Seguridad y observabilidad:** Docker Scout, Trivy, Falco, logs, métricas, Prometheus/Grafana.
- **Flujo de Docker:** el desarrollador escribe código fuente + Dockerfile → build/empaquetado → imagen Docker (se publica en Docker Hub o un registro) → Docker Engine/runtime → contenedor en ejecución, con su red y sus volúmenes de datos.
- **Capa operativa:**
  - **Compose:** servicios ↔ app.
  - **Swarm:** contenedores ↔ clúster.
  - Ambos definen, conectan y despliegan servicios (API, BD, caché) en entornos locales o distribuidos.
- **Resultado:** logs y métricas, seguridad y escaneo, acciones y despliegue → apps y datos → operación confiable.

### Pág. 37 — La arquitectura de Kubernetes (naiker.codes)

Quién hace qué cuando una app corre dentro de un clúster.

- **Componentes del control plane:** API Server, etcd, Scheduler, Controller Manager, Cloud Controller, Admission Controllers.
- **Workloads y recursos:** Pods, Deployments, ReplicaSets, StatefulSets, DaemonSets, Jobs/CronJobs.
- **Redes y exposición:** Services, ClusterIP, NodePort, LoadBalancer, Ingress, CoreDNS.
- **Configuración y almacenamiento:** ConfigMaps, Secrets, Persistent Volumes, Persistent Volume Claims, StorageClass, CSI Drivers.
- **Observabilidad y seguridad:** RBAC, Namespaces, Network Policies, Metrics Server, Prometheus/Grafana, logs/tracing.
- **Flujo de Kubernetes:** el desarrollador escribe manifiestos YAML + kubectl → API Server → Scheduler, Controller Manager y etcd → clúster / nodo worker con los pods A, B y C → Service → Ingress → usuario/cliente.
- **Capa operativa:** escalado (HPA ↔ réplicas) y despliegue (*rolling update*). Orquesta, expone y escala aplicaciones en entornos distribuidos que sirven API, BD y caché.
- **Resultado:** monitoreo y métricas, seguridad y políticas, CI/CD y despliegue → apps y datos → operación escalable.

### Pág. 38 — Quiz: regulador de tensión en serie (Circuit Recipes)

**Enunciado:** calcular la tensión de salida regulada \(V_o\).
- Entrada \(V_i = 36\) V.
- Un diodo zener de 6,2 V, polarizado por una resistencia de 1 kΩ, fija la entrada no inversora (+) de un amplificador operacional.
- La salida del op-amp maneja la base del transistor de paso \(Q_1\), entre \(V_i\) y \(V_o\).
- La salida realimenta la entrada inversora (−) con un divisor de 30 kΩ (arriba) y 10 kΩ (abajo).

Opciones: A) 12,4 V · B) 18,6 V · C) 24,8 V · D) 30,0 V.

**[Nota: solución]** Con realimentación negativa, el op-amp ajusta \(Q_1\) hasta que sus dos entradas tienen la misma tensión:

\[ V_o\,\frac{10}{30+10} = 6{,}2 \;\Rightarrow\; V_o = 6{,}2\left(1+\frac{30}{10}\right) = 24{,}8\ \text{V} \]

**Respuesta: C) 24,8 V.** Es el amplificador no inversor \(V_o = V_{ref}(1 + R_1/R_2)\); el transistor solo aporta la corriente. Margen: \(V_i - V_o = 11{,}2\) V, de sobra para los ~0,7 V de \(V_{BE}\).
