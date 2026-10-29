"""Generate standalone Manim CE scenes for the integrated 53-topic curriculum."""

from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "scenes"
REPOSITORY_ROOT = ROOT.parents[1]

# Snapshot de los 20 bloques / 53 temas del currículo integrado (título, escenario,
# foco, entregable por tema) usado solo para generar estas escenas de Manim.
# Copiado una vez desde la estructura real de los 14 tracks; no depende de la
# sección /roadmaps de la app (retirada) ni de ningún script externo.
_CURRICULUM_BLOCKS: tuple[tuple[str, str, tuple[tuple[str, str, str, str], ...]], ...] = (
    ('01-fundamentos-programacion', 'Fundamentos de programación', (
        ('Fundamentos de programación', 'automatizar una regla de pedidos de una tienda', 'algoritmos, variables, tipos, operadores, control, funciones', 'programa pequeño trazable con entradas, salidas y pruebas'),
    )),
    ('02-java', 'Java', (
        ('Java — Fundamentos', 'compilar y ejecutar una orden logística en Java', 'JDK/JRE/JVM, source-to-bytecode, main, classpath, packages, LTS 8/11/17/21, historia y Virtual Threads', 'proyecto Java ejecutable con matriz de versiones y notas de compatibilidad'),
        ('Java — POO', 'proteger invariantes de una guía de envío', 'clases, objetos, constructores, this, encapsulamiento, herencia, super, polimorfismo, abstracción, modifiers, static/final y SOLID', 'modelo Java con pruebas que demuestran principios SOLID aplicados con criterio'),
        ('Java — Colecciones y estructuras de datos', 'buscar y priorizar paquetes en un centro logístico', 'ArrayList/LinkedList, Sets, Maps, Queue/Deque/PriorityQueue/Stack, iteradores, comparadores y Big-O', 'benchmark reproducible con elección de colección y complejidad explicada'),
        ('Java — Excepciones y APIs modernas', 'importar escaneos de entrega y resumir retrasos por fecha y zona', 'try/catch/finally, throw/throws, checked/unchecked, resources, custom exceptions, Streams, Optional y Date/Time', 'pipeline de importación con errores explícitos, recursos cerrados y zona horaria probada'),
        ('Java — Multithreading y concurrencia', 'consultar proveedores en paralelo y actualizar una orden compartida', 'Thread/Runnable/Callable, lifecycle, races, locks, volatile, atomics, executors, pools, CompletableFuture y deadlocks', 'servicio concurrente con tests de carrera, timeout, cancelación y estrategia para deadlocks'),
        ('Java — Generics y programación funcional', 'componer filtros y transformaciones tipadas para paquetes', 'generics, bounds, wildcards, Function/Predicate/Consumer/Supplier, lambdas, method references y Streams', 'librería Java de funciones de dominio con tests y contratos genéricos'),
        ('Java — Build y proyectos', 'entregar un proyecto Java repetible para varios entornos', 'Maven lifecycle y comandos, Gradle, proyecto por etapas y plan Java de 30 días', 'proyecto Java con build reproducible, CI y plan de 30 días por hitos'),
    )),
    ('03-spring', 'Spring y arquitectura de backend', (
        ('Spring — Fundamentos', 'ensamblar un servicio de pedidos con dependencias inyectadas', 'IoC/DI, Beans, ApplicationContext, stereotype annotations, autoconfiguración, starters y configuration files', 'app Spring Boot mínima con configuración tipada y pruebas de contexto'),
        ('Spring — Estructura enterprise', 'organizar un flujo de compra que permita cambiar adaptadores sin filtrar framework al dominio', 'domain/application/infrastructure/api/shared, entidades y puertos, usecases, DTO/mappers, adapters, Clean Architecture, DDD y Hexagonal', 'feature vertical con dominio puro, puerto y adaptador reemplazable'),
        ('Spring — APIs REST', 'exponer pedidos a web, Android e iOS con contratos estables', 'HTTP verbs/status, mappings, path/body/query, DTO/entity, validation, advice y versioning', 'API versionada con pruebas de contrato, validación y errores consistentes'),
        ('Spring — Acceso a datos (JPA/Hibernate)', 'cargar pedidos y líneas de pedido midiendo exactamente el SQL generado', 'entities/IDs/relations, LAZY/EAGER, N+1, fetch joins/EntityGraph, cascades/orphan removal, transaction, repositories/query methods y migrations', 'API JPA con migración versionada, caso N+1 medido y fetch plan explícito por caso de uso'),
        ('Spring — Seguridad', 'autorizar a cliente y operador sin confiar en datos enviados por el cliente', 'Spring Security, JWT header/payload/signature, HMAC/RSA, login/token/filter, roles, OAuth2/OIDC, Keycloak, CORS y Cognito comparison', 'API con matriz de roles y login local IdP documentado'),
        ('Spring — Servicios avanzados', 'ejecutar tareas programadas, reaccionar a cambios y evitar cálculos repetidos', 'Scheduling, ApplicationEvent/@EventListener, Batch, cache y email', 'servicios de aplicación con scheduler, listener, cache y email reemplazables en tests'),
        ('Spring — Integración y APIs externas', 'consultar transportistas y manejar latencia, errores y cambios de contrato', 'RestTemplate legado, WebClient, Feign, APIs externas y llamadas entre servicios', 'adaptador externo con timeout, mapping de errores y tests contractuales'),
        ('Spring — Monitoreo y observabilidad', 'diagnosticar un retraso que cruza API, base de datos y broker', 'Actuator, Prometheus/Grafana, ELK, Sentry, logs, métricas y trazas', 'dashboard mínimo con SLI definidos, trazas correlacionadas y política de redacción'),
        ('Spring — Ecosistema y milestones', 'evaluar una actualización del ecosistema sin desplegar una milestone accidentalmente', 'Spring AI/Data/Security/Integration/AMQP/Cloud, SemVer/prerelease, BOM y compatibilidad', 'ADR de upgrade con fuentes fechadas, dependency tree y plan de rollback'),
        ('Spring Batch', 'conciliar millones de eventos reiniciando tras una falla', 'Job/Step/JobRepository, chunk, reader/processor/writer, skip, retry, restart, partitioning y parallelism', 'job con restart comprobado, métrica por chunk y política de errores'),
        ('Arquitectura de microservicios', 'decidir si separar pedidos de facturación o mantener un monolito modular', 'monolith comparison, bounded contexts, gateway, sync/async, circuit breaker, bulkhead, observability, DB-per-service, deployment, Saga', 'ADR que demuestra por qué Spring Boot + REST + Docker no es criterio suficiente para microservicios'),
        ('Apache Kafka', 'propagar el estado de paquetes con retries acotados y DLQ operable', 'broker/topic/partition/offset/group, KafkaTemplate/listener, replication, retries/backoff, DLT/@DltHandler, idempotency y Kafka vs REST', 'flujo probado por partición, idempotent producer y DLT con alerta y replay controlado'),
    )),
    ('04-qa-automation', 'QA Automation', (
        ('Introducción al API Testing', 'verificar el contrato de tracking consumido por varios clientes', 'REST, HTTP, status codes, JSON, JSONPath y primer flujo en Postman', 'matriz de pruebas con contrato, datos y resultados esperados'),
        ('Postman desde cero', 'organizar requests de autenticación, pedidos y seguimiento', 'requests, collections, variables, environments y auth Basic/Bearer/OAuth2/API Key', 'collection versionada con environment de ejemplo y variables secretas externas'),
        ('Automatización en Postman', 'detectar automáticamente regresiones del API de órdenes', 'pm.test, pm.expect, assertions de status/body/schema/tiempo, datos dinámicos y chaining', 'suite determinista con aserciones positivas, negativas y datos dinámicos'),
        ('Newman', 'ejecutar una colección Postman en terminal y CI', 'CLI, variables por opción, data files CSV/JSON y reporter HTML htmlextra', 'comando reproducible y reporte conservado incluso al fallar'),
        ('Jenkins para QA', 'ejecutar smoke, regresión y nightly con evidencia consultable', 'jobs, pipelines, Jenkinsfile declarativo, Newman, artifacts y notificaciones', 'pipeline declarativo con credenciales gestionadas y reporte HTML archivado'),
        ('Proyecto final QA Automation', 'automatizar un flujo de compra y entrega de principio a fin', 'pipeline Postman → Newman → Jenkins con reportes y tipos de ejecución', 'repositorio reproducible con collection, pipeline, reportes y guía de fallo'),
    )),
    ('05-bases-datos', 'Bases de datos', (
        ('Bases de datos: SQL, PostgreSQL, MySQL espacial y MongoDB', 'persistir pedidos y localizar entregas por zona sin imponer el mismo modelo a toda carga', 'SQL/JOIN/GROUP BY/subqueries/indexes/normalization, Postgres backup/extensions, MySQL GEOMETRY/ST_*, MongoDB and SQL-vs-NoSQL', 'modelo relacional migrable, consultas espaciales con SRID y ADR SQL/NoSQL con backup restaurado'),
    )),
    ('06-docker', 'Docker y runtimes locales', (
        ('Docker y alternativas', 'empaquetar un backend multi-stage y ejecutar el mismo compose en runtimes compatibles', 'images/layers/Dockerfile/volumes/networks; env -e/.env/ENV; compose; multi-stage; .dockerignore; non-root; Dory/OrbStack/Podman', 'stack reproducible con imagen no-root, entorno documentado y comparativa local-first'),
    )),
    ('07-cicd', 'CI/CD', (
        ('CI/CD', 'validar y liberar cambios de una API sin pasos manuales ocultos', 'integración, entrega/despliegue continuo, Jenkins, Actions, GitLab, Azure, CircleCI y rollout', 'pipeline reproducible con gates, artifacts y estrategia de rollback'),
    )),
    ('08-kubernetes', 'Kubernetes', (
        ('Kubernetes', 'mantener disponible la API de entregas durante cambios', 'Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, HPA, Helm y probes', 'manifiestos comentados con probes, límites y prueba de rollout'),
    )),
    ('09-iac', 'Infraestructura como código', (
        ('Terraform y OpenTofu', 'provisionar infraestructura local/cloud de forma revisable', 'HCL, providers, variables, outputs, state, backend remoto, módulos y lifecycle', 'módulo pequeño con backend documentado y plan revisado'),
    )),
    ('10-cloud-local', 'Cloud local', (
        ('Cloud local con LocalStack y Floci', 'probar S3, SQS, SNS, Lambda y DynamoDB sin una cuenta cloud', 'StackPort, AWS CLI local, endpoints 4566/4577/4588 y credenciales test/test en us-east-1', 'laboratorio local repetible con teardown y límites anotados'),
    )),
    ('11-frontend-angular', 'Frontend Angular', (
        ('Angular moderno y Angular 22', 'construir un tablero de tracking reactivo que mantenga loading/data/error coherentes', 'standalone, Signals/httpResource/computed/effect, OnPush, @if/@for, Signal Forms, Router, SSR y zoneless', 'feature Angular con estados HTTP discriminados, pruebas y render medido'),
        ('Angular Native', 'evaluar una UI móvil nativa desde una base Angular', 'Angular Native, React Native Fabric y Expo según estado Alpha del ecosistema', 'spike aislado con riesgos, dispositivos y alternativa web documentados'),
    )),
    ('12-frontend-react', 'Frontend React', (
        ('React y Next.js', 'renderizar una página pública de tracking y una vista de cliente', 'componentes, hooks, estado, Context, hooks propios, fetching, SSR/SSG/ISR y App Router', 'página con límites server/client y estrategia SSR/SSG justificada'),
    )),
    ('13-movil', 'Desarrollo móvil', (
        ('Android con Kotlin y Jetpack Compose', 'mostrar posición y estado de una entrega en Android', 'coroutines, Flow, Room, Hilt, ViewModel, navegación y Retrofit/Ktor', 'feature Compose con estado restaurable, Room y pruebas'),
        ('Kotlin Multiplatform', 'compartir reglas de cálculo entre cliente Android e iOS', 'lógica compartida, source sets, expect/actual y límites de plataforma', 'módulo común probado y matriz explícita de capacidades por plataforma'),
        ('iOS con SwiftUI', 'crear una pantalla de entrega observable y segura ante concurrencia', 'optionals, value types, State/Binding/Observable, lifecycle, async/await, actors, SwiftData, navegación y MainActor', 'feature SwiftUI con estados vacíos/error, persistencia local y tests'),
        ('Flutter', 'mostrar entregas en mapa con ubicación y eventos en tiempo real', 'widget tree, Stateless/Stateful, Riverpod/Provider/BLoC, navegación, Dio, Maps, sockets y almacenamiento', 'feature con estado explícito, tests y datos offline controlados'),
    )),
    ('14-git', 'Git y control de versiones', (
        ('Git y control de versiones', 'colaborar en una modificación urgente del flujo de pedidos', 'commit, branch, merge/rebase, conflictos, PR, trunk-based, tags y releases', 'historial revisable con PR, tests, tag y notas de release'),
    )),
    ('15-testing', 'Testing y clientes API', (
        ('Testing de software', 'prevenir regresión en reglas de negocio y adaptadores externos', 'JUnit, Mockito, MockMvc, Testcontainers, TDD/BDD, pirámide y cobertura', 'suite por riesgo con tests rápidos e integración representativa'),
        ('Postman vs Bruno', 'elegir un cliente API para un equipo con colecciones versionadas', 'local-first, Git-native, secretos, colaboración y compatibilidad de colecciones', 'ADR con casos de uso, coste de migración y repositorio sin secretos'),
    )),
    ('16-patrones-arquitectura', 'Patrones de diseño y arquitectura', (
        ('SOLID', 'cambiar reglas de una plataforma logística sin reescribir su núcleo', 'SRP, OCP, LSP, ISP y DIP; cada principio con ejemplo incorrecto/correcto y reflejo en Spring', 'diagrama y diff de refactorización con ejemplos positivos/negativos ejecutables'),
        ('Patrones creacionales', 'crear notificadores y pedidos válidos para canales y configuraciones variables', 'Singleton Eager/Lazy/Synchronized/DCL/Enum, Factory Method, Abstract Factory, Builder y Prototype', 'ejemplos Java ejecutables para 5 variantes Singleton y 4 patrones creacionales'),
        ('Patrones estructurales', 'integrar una pasarela legacy sin cambiar el contrato del dominio', 'Adapter, Decorator, Facade, Composite, Proxy y Bridge', 'seis ejemplos Java ejecutables con estructura, salida, coste y alternativa'),
        ('Patrones de comportamiento', 'desacoplar cambios de pedidos, políticas y pasos de procesamiento', 'Observer, Strategy, Command, Template Method, Chain, State, Iterator, Mediator, Memento y Visitor', 'diez ejemplos Java completos con main, salida y ejercicio incremental'),
        ('Patrones de arquitectura', 'evolucionar RutaFlow desde una app única a límites de dominio justificados', 'Monolith, Modular Monolith, Microservices, EDA, Hexagonal, Clean, CQRS, Event Sourcing, Saga, Outbox, Gateway, BFF, Serverless, Layered, Pipeline, Space-Based y Microkernel', 'catálogo comparativo con ejemplos/runnable skeletons y decisiones explícitas para cada patrón'),
        ('Principios de arquitectura', 'revisar una solución que ya tiene requisitos, usuarios y límites cambiantes', 'SOLID, DRY/KISS/YAGNI, Demeter, Hollywood, separation, cohesion/coupling, idempotency, stateless/stateful y 12-Factor', 'checklist razonada con ADR y ejemplo donde no aplicar una regla sería mejor'),
        ('Anti-patrones', 'diagnosticar degradación de un servicio antes de multiplicar excepciones y parches', 'God Object, Spaghetti, Big Ball of Mud, Lava Flow, Golden Hammer, premature optimization, copy-paste, Singleton misuse, Anemic Domain y Distributed Monolith', 'catálogo de síntomas, consecuencias, señales y plan de salida verificable'),
    )),
    ('17-algoritmos', 'Algoritmos y estructuras de datos', (
        ('Algoritmos y estructuras de datos', 'calcular una ruta para repartidores y justificar coste frente a tamaño del grafo', 'Big-O, búsqueda/ordenamiento, BFS/DFS, Dijkstra, hash/tree/graph y dynamic programming', 'suite comparativa con grafos de prueba, correctitud y rendimiento'),
    )),
    ('18-herramientas', 'Herramientas de desarrollo', (
        ('Herramientas de desarrollo', 'elegir y usar herramientas sin ejecutar cambios irreversibles a ciegas', 'VS Code, WinUtil, Manim/ManimGX, Exercism, CodeCademy/Codedden* y QuickRef', 'perfil editor documentado, ejercicios fechados y escena renderizada con versión fijada'),
    )),
    ('19-ia-aplicada', 'IA aplicada al estudio', (
        ('IA aplicada al estudio', 'aprender un tema técnico y demostrar dominio sin fingir autoría', 'prompting por fases, roadmap progresivo, revisión de tono y riesgos de fabricación de tesis', 'plan verificado, notas propias y declaración de asistencia IA'),
    )),
    ('20-proyecto-integrador', 'Proyecto integrador RutaFlow', (
        ('RutaFlow: plataforma logística IoT', 'seguir una entrega desde un sensor/móvil hasta el cliente con trazabilidad', 'Flutter, Spring Boot, MySQL espacial, Kafka, JWT, Socket.IO, QA Postman/Newman/Jenkins, PostgreSQL, Docker/K8s/CI/IaC/LocalStack, Angular Signals; Repository, Observer, Strategy, Saga, Outbox y API Gateway', 'demo con contrato, pruebas, trazas, modelo geoespacial y escena arquitectónica'),
    )),
)

BLOCKS = [
    (
        "01_fundamentos_java",
        "Fundamentos de programación y Java",
        [
            ("fundamentos_programacion", "Fundamentos de programación", "Entrada", "Algoritmo", "Resultado"),
            ("introduccion_java", "Introducción a Java", "Código fuente", "Bytecode / JVM", "Ejecución"),
            ("poo_java", "POO en Java", "Contrato", "Tipo concreto", "Polimorfismo"),
            ("colecciones_estructuras", "Colecciones y estructuras de datos", "Elementos", "Estructura", "Operación"),
            ("excepciones_streams", "Excepciones, Streams, Optional y Date/Time", "Datos", "Pipeline seguro", "Resultado"),
            ("concurrencia_java", "Multithreading y concurrencia", "Tareas", "Coordinación", "Resultado"),
            ("generics_lambdas", "Generics, Lambdas y programación funcional", "Tipo / función", "Composición", "Resultado"),
            ("maven_lifecycle", "Maven: build lifecycle", "Fuentes", "Fases Maven", "Artefacto"),
            ("roadmap_java", "Roadmap Java completo", "Fundamentos", "Práctica", "Proyecto"),
        ],
    ),
    (
        "02_backend_spring",
        "Backend con Java y Spring",
        [
            ("spring_fundamentos", "Fundamentos de Spring y Spring Boot", "Configuración", "IoC / DI", "Aplicación"),
            ("spring_nueve_capas", "Spring Boot en nueve capas", "Fundamentos", "Capas", "Operación"),
            ("spring_rest", "APIs REST con Spring Boot", "HTTP", "Controller / DTO", "Respuesta"),
            ("spring_jpa", "Spring Data JPA e Hibernate", "Relación", "Fetch plan", "SQL"),
            ("spring_security", "Spring Security, JWT, OAuth2 y OIDC", "Credencial", "Filtros / políticas", "Acceso"),
            ("microservicios", "Arquitectura de microservicios", "Contextos", "Contratos / eventos", "Servicios"),
            ("kafka_spring", "Apache Kafka con Spring Boot", "Producer", "Topic / retry", "Consumer / DLT"),
            ("spring_batch", "Spring Batch", "Reader", "Chunk / processor", "Writer"),
        ],
    ),
    (
        "03_qa_automation",
        "QA Automation",
        [
            ("api_testing", "Introducción al API Testing", "Request", "Contrato", "Response"),
            ("postman", "Postman desde cero", "Request", "Collection / env", "Respuesta"),
            ("postman_automatizacion", "Automatización en Postman", "Datos", "pm.test / expect", "Assertions"),
            ("newman", "Newman", "Collection", "CLI / data", "Reporte"),
            ("jenkins_qa", "Jenkins para QA", "Commit", "Pipeline", "Artefacto"),
            ("proyecto_qa", "Proyecto final QA Automation", "Postman", "Newman / Jenkins", "Reporte"),
        ],
    ),
    (
        "04_bases_datos",
        "Bases de datos",
        [
            ("sql_relacional", "SQL y bases de datos relacionales", "Tablas", "JOIN / índice", "Consulta"),
            ("mysql_espacial", "Datos espaciales con MySQL", "Coordenadas", "ST_*", "Geometría"),
            ("postgresql", "PostgreSQL", "Esquema", "Backup / restore", "Datos íntegros"),
            ("nosql", "NoSQL con MongoDB", "Documento", "Patrón de acceso", "Colección"),
        ],
    ),
    (
        "05_devops_cloud",
        "DevOps y cloud",
        [
            ("docker", "Docker", "Dockerfile", "Capas / runtime", "Contenedor"),
            ("alternativas_docker", "Alternativas a Docker Desktop", "CLI", "Runtime local", "Contenedores"),
            ("cicd", "CI/CD", "Cambio", "Build / test / deploy", "Release"),
            ("kubernetes", "Kubernetes", "Deployment", "Pod / Service", "Tráfico"),
            ("terraform_opentofu", "Terraform y OpenTofu", "HCL", "Plan / state", "Recursos"),
            ("cloud_local", "Cloud local con LocalStack y Floci", "AWS CLI", "Endpoint local", "Servicio emulado"),
        ],
    ),
    (
        "06_frontend",
        "Frontend",
        [
            ("angular_moderno", "Angular moderno", "Evento", "Signal graph", "Vista"),
            ("angular22_http", "Angular 22: estado HTTP", "Request", "Estado reactivo", "UI"),
            ("angular22_onpush", "Angular 22: OnPush", "Cambio", "Referencia / signal", "Render"),
            ("angular_native", "Angular Native", "Angular", "Fabric / Expo", "Vista nativa"),
            ("react_next", "React y Next.js", "Props / estado", "Render", "UI / SSR"),
        ],
    ),
    (
        "07_movil",
        "Móvil",
        [
            ("android_compose", "Android con Kotlin y Jetpack Compose", "Estado", "Composición", "UI"),
            ("kotlin_multiplatform", "Kotlin Multiplatform", "Lógica común", "Expect / actual", "Apps"),
            ("ios_swiftui", "iOS con SwiftUI", "Estado", "Diff de vistas", "UI"),
            ("flutter", "Flutter", "Widgets", "Widget tree", "Render tree"),
        ],
    ),
    (
        "08_electronica",
        "Ingeniería electrónica",
        [
            ("matematicas_aplicadas", "Matemáticas aplicadas", "Modelo", "Transformación", "Solución"),
            ("circuitos_electricos", "Circuitos eléctricos", "Fuente", "Red / leyes", "Respuesta"),
            ("electronica_analogica", "Electrónica analógica", "Señal", "Componente", "Salida"),
            ("electronica_digital", "Electrónica digital", "Entradas", "Lógica / estado", "Salida"),
            ("microcontroladores", "Microcontroladores", "Sensor", "Firmware / GPIO", "Actuador"),
            ("comunicaciones", "Sistemas de comunicación", "Mensaje", "Canal / codificación", "Recepción"),
            ("senales_sistemas", "Señales y sistemas", "Señal", "Sistema LTI", "Respuesta"),
            ("procesamiento_senales", "Procesamiento de señales", "Muestreo", "Filtro DSP", "Señal útil"),
            ("instrumentacion_sensores", "Instrumentación y sensores", "Magnitud física", "Acondicionamiento", "Medición"),
            ("control_automatico", "Control automático", "Referencia", "Controlador PID", "Planta"),
            ("electronica_potencia", "Electrónica de potencia", "Entrada", "Conversor", "Carga"),
            ("diseno_pcb", "Diseño de PCB", "Esquemático", "Layout / ruteo", "Placa"),
            ("electromagnetismo", "Electromagnetismo", "Carga / corriente", "Campo", "Onda"),
            ("bajo_nivel", "Programación de bajo nivel", "Código", "Memoria / CPU", "Hardware"),
            ("gestion_habilidades", "Gestión y habilidades", "Objetivo", "Colaboración", "Entrega"),
        ],
    ),
    (
        "09_herramientas",
        "Herramientas y prácticas",
        [
            ("git", "Git y control de versiones", "Working tree", "Commit / branch", "Historial"),
            ("testing_software", "Testing de software", "Riesgo", "Test pyramid", "Evidencia"),
            ("postman_bruno", "Postman vs Bruno", "Colección", "Flujo local", "Prueba versionada"),
            ("patrones_solid", "Patrones de diseño y SOLID", "Responsabilidad", "Abstracción", "Cambio aislado"),
            ("algoritmos", "Algoritmos y estructuras de datos", "Grafo", "BFS / DFS / Dijkstra", "Ruta"),
            ("vscode", "Visual Studio Code", "Código", "Editor / extensiones", "Flujo"),
            ("winutil", "Windows: WinUtil", "Equipo", "Script revisado", "Configuración"),
            ("manim", "Manim y ManimGX", "Concepto", "Geometría / animación", "Explicación"),
        ],
    ),
    (
        "10_ia_estudio",
        "IA aplicada al estudio",
        [
            ("prompting_aprender", "Prompting para aprender", "Objetivo", "Descomposición", "Práctica"),
            ("roadmaps_30", "Prompting para roadmaps", "Meta", "Dependencias", "30 pasos"),
            ("humanizador_ia", "Humanizador de texto IA", "Borrador", "Edición ética", "Voz propia"),
            ("etica_prompting", "Riesgos éticos del prompting", "Solicitud", "Verificación / límites", "Trabajo honesto"),
        ],
    ),
]

INTEGRATORS = [
    ("integrador_01_fundamentos_java", "Integrador: fundamentos y Java", "Problema real", "Java / pruebas", "Aplicación CLI"),
    ("integrador_02_backend_spring", "Integrador: backend Spring", "Dominio", "API / datos / eventos", "Servicio"),
    ("integrador_03_qa_automation", "Integrador: QA Automation", "API", "Postman / Newman", "Pipeline Jenkins"),
    ("integrador_04_bases_datos", "Integrador: persistencia", "Modelo", "SQL / geoespacial", "Consultas"),
    ("integrador_05_devops_cloud", "Integrador: DevOps y cloud", "Código", "CI / IaC / runtime", "Despliegue"),
    ("integrador_06_frontend", "Integrador: frontend", "API", "Estado reactivo", "Experiencia web"),
    ("integrador_07_movil", "Integrador: móvil", "Backend", "Estado / ubicación", "App móvil"),
    ("integrador_08_electronica", "Integrador: electrónica e IoT", "Sensor", "Firmware / red", "Evento IoT"),
    ("integrador_09_herramientas", "Integrador: herramientas", "Cambio", "Git / test / automatización", "Entrega confiable"),
    ("integrador_10_ia_estudio", "Integrador: estudio ético con IA", "Pregunta", "Fuentes / práctica", "Aprendizaje verificable"),
    ("integrador_final", "Proyecto final: plataforma logística IoT", "Dispositivo / app", "Spring / Kafka / datos", "Plataforma observable"),
]


def scene_source(class_name: str, title: str, stages: tuple[str, str, str]) -> str:
    labels = ", ".join(repr(stage) for stage in stages)
    return f'''from manim import *


class {class_name}(Scene):
    def construct(self):
        # El título sitúa el concepto que representa esta escena.
        title = Text({title!r}, font_size=30)
        title.scale_to_fit_width(12.5)
        title.to_edge(UP, buff=0.55)
        self.play(Write(title))

        # Las tres tarjetas separan entrada, transformación y resultado.
        labels = [{labels}]
        colors = [BLUE, YELLOW, GREEN]
        cards = VGroup()
        for index, (label, color) in enumerate(zip(labels, colors)):
            card = RoundedRectangle(
                width=3.55, height=1.55, corner_radius=0.15,
                stroke_color=color, stroke_width=3,
                fill_color=color, fill_opacity=0.18,
            )
            card.move_to(RIGHT * (index - 1) * 4.25 + DOWN * 0.1)
            text = Text(label, font_size=22).scale_to_fit_width(3.15)
            text.move_to(card)
            cards.add(VGroup(card, text))

        # Las flechas hacen explícito el flujo causal entre las etapas.
        arrows = VGroup(*[
            Arrow(
                cards[index][0].get_right(),
                cards[index + 1][0].get_left(),
                buff=0.12, stroke_width=4, max_tip_length_to_length_ratio=0.18,
            )
            for index in range(2)
        ])
        self.play(FadeIn(cards[0], shift=UP * 0.2))
        self.play(GrowArrow(arrows[0]), FadeIn(cards[1], shift=UP * 0.2))
        self.play(GrowArrow(arrows[1]), FadeIn(cards[2], shift=UP * 0.2))

        # El marco destaca el sistema completo y permite leerlo de izquierda a derecha.
        frame = SurroundingRectangle(
            VGroup(cards, arrows), color=WHITE, buff=0.35, corner_radius=0.18,
        )
        self.play(Create(frame))
        self.wait(2)
'''


def scene_id(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii").lower()
    slug = re.sub(r"[^a-z0-9]+", "_", normalized).strip("_")
    return re.sub(r"^\d+_", "", slug)


def scene_label(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    return text if len(text) <= 48 else text[:45].rsplit(" ", 1)[0] + "..."


def obsolete_generated_scenes(expected: dict[str, str]) -> set[str]:
    previous = {
        f"{topic[0]}.py"
        for _, _, topics in BLOCKS
        for topic in topics
    }
    previous.update(f"{integrator[0]}.py" for integrator in INTEGRATORS)
    return previous.difference(expected)


def generated_scenes() -> dict[str, str]:
    specs: list[tuple[str, str, tuple[str, str, str]]] = []
    topic_number = 0
    for block_number, (block_slug, block_title, topics) in enumerate(_CURRICULUM_BLOCKS, start=1):
        for title, scenario, focus, deliverable in topics:
            topic_number += 1
            specs.append((
                f"tema_{topic_number:02d}_{scene_id(title)}",
                title,
                tuple(scene_label(label) for label in (scenario, focus, deliverable)),
            ))
        specs.append((
            f"integrador_{block_number:02d}_{scene_id(block_slug)}",
            f"Integrador: {block_title}",
            (
                scene_label(block_title),
                scene_label("; ".join(title for title, _, _, _ in topics[:3])),
                scene_label(topics[-1][3]),
            ),
        ))
    specs.append((
        "proyecto_final_rutaflow",
        "Proyecto final: plataforma logística RutaFlow",
        ("Eventos de entrega", "Spring Boot / Kafka / Flutter", "Plataforma trazable y observable"),
    ))
    return {
        f"{scene_id}.py": scene_source(
            "".join(part.capitalize() for part in scene_id.split("_")) + "Scene",
            title,
            stages,
        )
        for scene_id, title, stages in specs
    }


def build(check: bool = False) -> int:
    expected = generated_scenes()
    if check:
        stale = sorted(name for name in obsolete_generated_scenes(expected) if (OUTPUT / name).exists())
        missing_or_changed = [
            name for name, content in expected.items()
            if not (OUTPUT / name).exists() or (OUTPUT / name).read_text(encoding="utf-8") != content
        ]
        if stale or missing_or_changed:
            raise SystemExit(
                f"Escenas desactualizadas; faltan/cambiaron: {missing_or_changed}; obsoletas: {stale}"
            )
        return len(expected)

    OUTPUT.mkdir(parents=True, exist_ok=True)
    for filename, content in expected.items():
        (OUTPUT / filename).write_text(content, encoding="utf-8")
    for filename in obsolete_generated_scenes(expected):
        (OUTPUT / filename).unlink(missing_ok=True)
    return len(expected)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="verify scenes are up to date")
    arguments = parser.parse_args()
    count = build(check=arguments.check)
    action = "Verified" if arguments.check else "Generated"
    print(f"{action} {count} standalone Manim CE scenes in {OUTPUT}")
