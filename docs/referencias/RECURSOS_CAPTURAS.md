# Recursos de capturas para los cursos

Unifica lo útil para The Imperial Book que hay en:

- **Descargas** (24-nov-2026): 3 capturas, hoy ordenadas en `Descargas/04_Imagenes/Recursos_cursos/`.
- **Drive › 05_Recursos_tecnicos**:
  - *Recopilacion_prompts_IA_y_recursos_programacion* (transcripción de las 69 páginas del PDF de 76 MB).
  - *Capturas_cursos_y_publicaciones_programacion_(oct-2026).pdf*.
  - *Cosas dinamicos.zip*.

La columna «En el curso hoy» viene de buscar el término en el contenido actual (`web/public/content`). Indica si el tema aparece, no si está bien explicado.

> **Uso correcto.** Las infografías y capturas son de terceros (naiker.codes, Circuit Recipes, Cloudly, LinkedIn, etc.). Sirven como guía de qué temas cubrir; no se copian al curso. Los diagramas del libro se dibujan de nuevo y el contenido se escribe con fuentes oficiales.

---

## 1. Capturas nuevas de Descargas

### 1.1 El ecosistema de Docker (naiker.codes)

`04_Imagenes/Recursos_cursos/DevOps_Docker/2026-11-23_ecosistema-docker_naiker-codes.png`

| Bloque | Conceptos | En el curso hoy |
|---|---|---|
| Fundamentos | Docker Engine, Docker Desktop, CLI, Dockerfile, imagen, contenedor | Sí (devops M2–M3, cloud M1) |
| Construcción e imágenes | BuildKit, Buildx, multi-stage builds, Docker Hub, registro privado, tags | Multi-stage y tags sí. **BuildKit, Buildx y registro privado no aparecen.** |
| Redes | bridge, host, overlay, DNS interno, service discovery, port mapping | Bridge y puertos sí. **Overlay no aparece.** |
| Datos y persistencia | volumes, bind mounts, tmpfs, backups, storage drivers, secrets/configs | Volúmenes sí; bind mount, tmpfs y secrets apenas. **Storage drivers y backups de volúmenes no aparecen.** |
| Seguridad y observabilidad | Docker Scout, Trivy, Falco, logs, métricas, Prometheus/Grafana | Trivy y Prometheus sí. **Docker Scout y Falco no aparecen.** |
| Capa operativa | Compose (servicios ↔ app), Swarm (contenedores ↔ clúster) | Compose sí. **Swarm no aparece** (basta una mención comparándolo con Kubernetes). |

**Flujo que muestra:** código + Dockerfile → build → imagen → registro → Docker Engine → contenedor (con red y volúmenes) → Compose/Swarm → servicios (API, BD, caché) → logs, seguridad y despliegue. Sirve como **mapa de apertura** del módulo de Docker.

### 1.2 La arquitectura de Kubernetes (naiker.codes)

`04_Imagenes/Recursos_cursos/DevOps_Kubernetes/2026-11-23_arquitectura-kubernetes_naiker-codes.png`

| Bloque | Conceptos | En el curso hoy |
|---|---|---|
| Control plane | API Server, etcd, Scheduler, Controller Manager, Cloud Controller, Admission Controllers | API Server, etcd y Scheduler en 1 archivo. **Controller Manager y Cloud Controller no aparecen.** |
| Workloads | Pods, Deployments, ReplicaSets, StatefulSets, DaemonSets, Jobs/CronJobs | Sí, pero cada uno en 1–2 archivos. |
| Redes y exposición | Services, ClusterIP, NodePort, LoadBalancer, Ingress, CoreDNS | Sí, salvo **CoreDNS, que no aparece**. |
| Configuración y almacenamiento | ConfigMaps, Secrets, PV, PVC, StorageClass, CSI Drivers | Sí, salvo **CSI, que no aparece**. |
| Observabilidad y seguridad | RBAC, Namespaces, Network Policies, Metrics Server, Prometheus/Grafana, logs/tracing | Sí (Network Policies y Metrics Server, solo 1 mención). |
| Capa operativa | escalado HPA ↔ réplicas, rolling update | HPA sí; rolling update en 2 archivos. |

**Flujo que muestra:** manifiestos YAML + kubectl → API Server → Scheduler, Controller Manager y etcd → nodo worker con pods → Service → Ingress → usuario. Es justo el recorrido que debe animar el **simulador del bucle de reconciliación** propuesto para devops M6.

### 1.3 Quiz: regulador de tensión en serie (Circuit Recipes)

`04_Imagenes/Recursos_cursos/Electronica_Control/2026-11-24_quiz-regulador-serie-zener-opamp_circuit-recipes.png`

**Enunciado.** Vi = 36 V. Un zener de 6,2 V, polarizado con una resistencia de 1 kΩ, fija la entrada no inversora de un amplificador operacional. La salida del op-amp maneja la base del transistor de paso Q1. La salida Vo realimenta la entrada inversora mediante un divisor de 30 kΩ (arriba) y 10 kΩ (abajo). Opciones: A) 12,4 V · B) 18,6 V · C) 24,8 V · D) 30,0 V.

**Solución.** El op-amp ajusta la base de Q1 hasta que sus dos entradas quedan iguales. Por eso la tensión del divisor vale lo mismo que la del zener:

\[ V_o \cdot \frac{10\,k\Omega}{30\,k\Omega + 10\,k\Omega} = 6{,}2\ V \;\Rightarrow\; V_o = 6{,}2\left(1 + \frac{30}{10}\right) = 24{,}8\ V \]

**Respuesta: C) 24,8 V.** Es la ecuación del amplificador no inversor, \(V_o = V_{ref}(1 + R_1/R_2)\), aplicada a un regulador. Q1 solo aporta la corriente. Hay margen suficiente: Vi − Vo = 11,2 V, mucho más que los ~0,7 V de V_BE.

**Dónde va:** control-1 M7 (*Circuitos y amplificadores operacionales*), como ejercicio aplicado de realimentación negativa. Hoy el curso menciona reguladores o zener en un solo módulo (M29).

---

## 2. Lo útil de Drive, ordenado por curso

Fuente «Doc p. N» = página N del documento de 69 páginas. «PDF oct» = PDF de capturas de octubre.

### Java
| Tema | Fuente | En el curso hoy | Acción |
|---|---|---|---|
| Interfaces funcionales detrás de Streams (Predicate, Function, Consumer, Supplier) | PDF oct | Sí (5 archivos) | Usar el esquema «¿condición? → Predicate; ¿transformación? → Function…» como resumen del capítulo de Streams. |
| Patrones Observer, Strategy, Singleton | Doc p. 7, 66, 69 | Strategy y Singleton sí; **Observer no aparece en Java** | Añadir Observer al módulo de patrones (M12). |
| Concurrencia y multithreading | Doc p. 36 | Sí (M5) | Contrastar el temario. |
| Evolución de Java 1.0 → 21, y Java 27 (sept. 2026) | Doc p. 26, PDF oct | — | Línea de tiempo para el capítulo 0. |
| Roadmaps Java y Developer Journey | Doc p. 16, 39, 68 | — | Contrastar con el temario de la certificación 1Z0-830. |
| record frente a clase inmutable (ejemplo en C#) | PDF oct | Sí (equals/hashCode, 2.2) | El mismo argumento aplica a `record` de Java. |

### Spring Boot
| Tema | Fuente | En el curso hoy | Acción |
|---|---|---|---|
| Arquitectura hexagonal: puertos con tipos del dominio, no `Page<Entity>` | PDF oct | 1 mención | Ejemplo «puerto mal / puerto bien» para el módulo de arquitectura (M15). |
| Estructura empresarial Clean Architecture/DDD | Doc p. 12; PDF oct (taller DAS Academy) | Parcial | Referencia de estructura de carpetas. |
| Ciclo de vida de Maven (validate → … → deploy) | Doc p. 40 | — | Tabla para el módulo 1 (estructura de proyecto). |
| LAZY frente a EAGER en JPA | Doc p. 35 | Sí (2 archivos) | Revisar que tenga ejemplo con N+1. |
| Kafka: reintentos con backoff, retry topics y DLT (`@DltHandler`) | Doc p. 25 | **1 mención** | Tema completo en el módulo de Kafka (M10), con un taller como el de circuit breaker. |
| Kafka + Spring Boot, eventos en tiempo real | Doc p. 38; PDF oct | Sí | — |
| Mapa «Spring Boot en 9 capas» | PDF oct | — | Contrastar con el temario del curso. |
| Novedades: Boot 4.2-M2, Framework 7.1-M2, Spring AI 2.1-M1, Cloud 2026.0 | Doc p. 61; PDF oct | Spring AI, 1 mención | Verificar versiones en spring.io antes de citarlas. |
| Keycloak | Doc p. 62 | Sí (3 archivos) | — |

### Microservicios
| Tema | Fuente | En el curso hoy | Acción |
|---|---|---|---|
| Patrón SAGA: orquestación frente a coreografía; compensaciones idempotentes, que también pueden fallar | PDF oct (2 capturas) | Sí (4 archivos) | Usar el caso «pedido → stock → pago rechazado → compensar en orden inverso» como taller (M11). |
| 10 patrones de arquitectura: qué resuelven y qué cuestan | Doc p. 60 | — | Tabla «problema / costo» para el cierre del curso. |
| API Gateway (entrada única, rutas, seguridad) | Doc p. 56 | Sí | — |
| Roadmap de diseño de sistemas: latencia/throughput, CAP, leader election, rate limiting | PDF oct | Throughput sí; **leader election solo en Fundamentos** | Revisar la cobertura en M4 y M14. |
| C4 + ADR («los diagramas documentan sistemas; las decisiones, el pensamiento») | PDF oct | Sí | — |

### DevOps / Cloud
| Tema | Fuente | En el curso hoy | Acción |
|---|---|---|---|
| Ecosistema Docker y arquitectura de Kubernetes | §1.1 y §1.2 | Ver tablas | Cerrar los huecos marcados. |
| 7 estrategias de despliegue en Kubernetes: rolling update, ramped, recreate (nativas); blue/green, canary, A/B, shadow (requieren herramientas) | PDF oct (Cloudly) | Canary en 3 archivos; **blue/green y shadow, 1 cada uno** | Tema propio en devops M5 (CD) con una tabla comparativa y el simulador de despliegues. |
| CI/CD en DevOps | Doc p. 13 | Sí | — |
| Variables de entorno en Docker | Doc p. 32 | Sí | — |
| OpenTofu (Terraform libre) | Doc p. 17 | 1 mención | Nota en el módulo de Terraform (M8). |
| Dory (alternativa a Docker Desktop en macOS) | Doc p. 18 | — | Nota en «Prepara tu máquina». |
| Servidor VPS seguro (Ubuntu, Let's Encrypt, Cloudflare) | PDF oct (Udemy) | — | Útil para publicar el libro (Coolify/VPS). |

### Angular
| Tema | Fuente | En el curso hoy | Acción |
|---|---|---|---|
| `httpResource` y estados HTTP con signals | Doc p. 14 | Sí (2 archivos) | — |
| OnPush + signals | Doc p. 19 | 1 mención | Reforzar en el módulo de rendimiento (M11). |
| Angular Native: build de Release en iPhone, virtual-list, Expo SDK 58 | Doc p. 52, 58; PDF oct | Sí (M16 opcional) | Actualizar versión (ng-native 0.18.2). |

### Flutter / móvil
| Tema | Fuente | En el curso hoy | Acción |
|---|---|---|---|
| Temario app de rutas: Riverpod, Google Maps, Socket.IO, trazado de rutas, notificaciones push; backend Spring Boot + MySQL espacial + JWT | Doc p. 23; PDF oct | Riverpod sí; Socket.IO en 2 archivos | Contrastar con flutter M14 (mapas, GPS y tiempo real). |
| OSRM en Docker para calcular rutas (recortar el mapa a tu región) | PDF oct | **No aparece** | Nota práctica en flutter M14. |

### Fundamentos / algoritmos / herramientas
| Tema | Fuente | En el curso hoy | Acción |
|---|---|---|---|
| Dijkstra (ruta más corta) | Doc p. 22 | Sí (Fundamentos) | — |
| SOLID y patrones | Doc p. 51 | Sí | — |
| JWT: login con tokens | Doc p. 8 | Sí | — |
| Tokenización de tarjetas | PDF oct | 1 mención | Ejemplo en el módulo de seguridad. |
| Git: chuleta de 80 comandos, los tres árboles, estrategias de merge | PDF oct | Sí (devops M1) | — |
| Alternativas a Postman (Bruno) y QA de APIs con Postman | Doc p. 9, 11, 41 | Sí | — |
| Quick Reference (chuletas libres), Exercism (75 lenguajes), Coddy | Doc p. 2, 3, 27; PDF oct | — | Lista «Para practicar más» al final de cada curso. |
| Atajos de VS Code | Doc p. 50 | — | Anexo de Fundamentos. |

### Control 1 / electrónica
| Tema | Fuente | En el curso hoy | Acción |
|---|---|---|---|
| Regulador serie con zener y op-amp | §1.3 | 1 módulo | Ejercicio resuelto en M7. |
| Estado de cuatro diodos | Doc p. 65 | 1 módulo | Ejercicio en el módulo de circuitos. |
| Equivalente de Thévenin (Vab) | Doc p. 67 | 1 módulo | Ejercicio en el módulo de circuitos. |
| Modelado de un sistema eléctrico y su diagrama de bloques | PDF oct | Sí (M4–M5) | Ejercicio para M8. |
| IEC 61131-3 (control industrial: E/S, bus de campo, alarmas) | Doc p. 42 | 1 mención | Lectura complementaria. |
| Temas que debe saber un ingeniero electrónico (8 áreas) | Doc p. 4 | — | Contrastar con tu ruta de bases (álgebra → cálculo → circuitos → Laplace). |
| Proyecto Simulink/Simscape «Cosas dinamicos» (ensamblaje STEP + modelo `.slx`) | zip | — | Material de universidad, no del libro. Sirve de ejemplo para «Modelado de sistemas físicos» (M8). |

### Método de estudio y prompts
| Tema | Fuente | Acción |
|---|---|---|
| Prompt «Aprende cualquier tema más rápido» (esencia en una frase, analogía, partes, 3 errores comunes, 5 preguntas) | Doc p. 1 | Es casi la estructura v3 del libro; sirve de chequeo para cada sección. |
| Prompt «Hoja de ruta de principiante a experto» (30 pasos) | Doc p. 21 | — |
| Técnica Shadow Study | Doc p. 49 | Capítulo «Cómo estudiar con este libro». |

---

## 3. Lo que no sirve para los cursos

- Publicidad de cursos y bootcamps: DAS Academy, Galaxy Training, DevTalles, MitoCode, Humble Bundle, Udemy. Solo sirven para contrastar temarios.
- Ofertas de empleo (Doc p. 28, 47; PDF oct). Son para la búsqueda de empleo, no para el libro.
- Cine, juegos y ROMs, reels, memes y frases (Doc p. 5, 10, 34, 43, 48; PDF oct).
- Herramientas sin relación con los cursos: optimizador de Windows (Doc p. 59), humanizador de texto IA (Doc p. 55), motor 3D en Python (Doc p. 64), Open Design (Doc p. 6, 29), IA local Flint.
- Un calendario escolar que aparece al final del PDF de octubre. Es personal y no se usa.

---

## 4. Prioridades sugeridas para el libro

1. **devops M5–M7:** estrategias de despliegue y huecos de Kubernetes (Controller Manager, CoreDNS, CSI), con el simulador de reconciliación.
2. **devops M2–M3:** huecos de Docker (BuildKit/Buildx, redes overlay, storage drivers, Scout/Falco, registro privado).
3. **spring-boot M10:** taller de Kafka con reintentos y DLT.
4. **spring-microservices M11:** taller SAGA con compensaciones.
5. **control-1 M7:** ejercicio del regulador serie y ejercicios de diodos y Thévenin.
