#!/usr/bin/env python3
"""Build tailored 30-step beginner-to-advanced plans for the 53 curriculum topics."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "roadmaps"
WEB_OUTPUT = ROOT / "web" / "public" / "roadmap-data"
LEGACY_WEB_OUTPUT = ROOT / "web" / "public" / "roadmaps"


@dataclass(frozen=True)
class Topic:
    title: str
    scenario: str
    focus: str
    tool: str
    practice: str
    pitfall: str
    deliverable: str
    bridge: str
    source: str


@dataclass(frozen=True)
class Block:
    slug: str
    title: str
    topics: tuple[Topic, ...]


def t(title: str, scenario: str, focus: str, tool: str, practice: str,
      pitfall: str, deliverable: str, bridge: str, source: str) -> Topic:
    return Topic(title, scenario, focus, tool, practice, pitfall, deliverable, bridge, source)


BLOCKS = (
    Block("01-fundamentos-java", "Fundamentos de programación y Java", (
        t("Fundamentos de programación", "calcular el precio total y el envío de un pedido",
          "entradas, estado, decisiones, iteración y funciones", "Python 3 y terminal",
          "implementar un presupuesto con tres casos límite", "confundir asignación con comparación o ignorar el límite",
          "programa de consola con pruebas de caja negra", "algoritmos antes de elegir un lenguaje",
          "Python Tutorial: control flow, data structures y functions"),
        t("Introducción a Java", "procesar una orden de logística en una aplicación Java",
          "JDK/JRE/JVM, compilación, bytecode, main y releases LTS 8/11/17/21", "JDK, jshell, javac y java",
          "compilar una clase, inspeccionar bytecode con javap y ejecutar entradas", "confundir JDK con JVM o asumir que todo Java moderno corre en Java 8",
          "proyecto Java con versión destino y notas de compatibilidad", "fundamentos de programación y herramientas de build",
          "dev.java/learn y documentación de Oracle Java"),
        t("POO en Java", "proteger las reglas de una guía de envío con peso y estado válidos",
          "clases, encapsulación, herencia, polimorfismo, interfaces, overload y override", "JDK y JUnit",
          "modelar una orden con invariantes y dos estrategias de tarifa", "crear jerarquías solo para reutilizar código o exponer setters inválidos",
          "modelo de dominio con pruebas de contrato y polimorfismo", "tipos, métodos, colecciones y pruebas",
          "dev.java/learn/classes-objects y dev.java/learn/inheritance"),
        t("Colecciones y estructuras de datos", "buscar pedidos, eliminar duplicados y priorizar entregas urgentes",
          "List/Set/Map/Queue, árboles, grafos, Big-O y Comparable frente a Comparator", "JDK, JUnit y profiler sencillo",
          "comparar búsqueda y ordenamiento en datos de entregas", "elegir una colección por moda sin considerar operaciones y orden",
          "benchmark reproducible y elección argumentada de estructuras", "POO, igualdad, hashing y algoritmos",
          "dev.java/learn/api/collections y documentación de java.util"),
        t("Excepciones, Streams, Optional y Date/Time", "importar eventos de entrega y reportar retrasos por zona horaria",
          "errores explícitos, pipelines, ausencia opcional e instantes frente a fechas locales", "JDK, JUnit y archivos CSV",
          "filtrar eventos, agruparlos y manejar filas inválidas sin perder el diagnóstico", "tragar excepciones, usar Optional en campos indiscriminadamente o ignorar zona horaria",
          "pipeline de importación con tests de fechas, datos faltantes y fallos", "colecciones, funciones y límites de datos",
          "dev.java/learn/api/streams y Java Date-Time API"),
        t("Multithreading y concurrencia", "consultar múltiples transportistas y actualizar el estado de un pedido",
          "race conditions, locks, volatile, atomics, executors, pools y CompletableFuture", "JDK, JUnit y VisualVM",
          "reproducir una carrera en un contador y corregirla con una abstracción de concurrencia", "suponer que volatile hace atómica una operación compuesta",
          "servicio concurrente con cancelación, timeout y prueba determinista", "tipos seguros, colecciones concurrentes y errores",
          "dev.java/learn/concurrency y Java Concurrency Utilities"),
        t("Generics, Lambdas y programación funcional", "crear reglas de filtrado reutilizables para rutas y paquetes",
          "parámetros de tipo, wildcards, interfaces funcionales, lambdas y composición", "JDK, jshell y JUnit",
          "implementar un validador genérico y componer predicados con lambdas", "abusar de wildcards o esconder efectos laterales dentro de una lambda",
          "biblioteca pequeña de transformaciones tipadas y probadas", "colecciones, Streams y contratos de métodos",
          "dev.java/learn/generics y dev.java/learn/lambdas"),
        t("Maven: build lifecycle", "construir, probar y distribuir un servicio Java reproduciblemente",
          "validate, compile, test, package, verify, install, site y deploy", "Maven y Maven Wrapper",
          "añadir una prueba fallida y observar qué fases ejecuta cada comando", "confundir lifecycle phases con goals o depender de Maven global",
          "proyecto con wrapper, plugins versionados y pipeline verify", "Java, tests y artefactos de build",
          "maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html"),
        t("Roadmap Java completo", "evolucionar un sistema de consola hasta una aplicación Java desplegable",
          "ocho etapas: fundamentos, introducción, conceptos, POO, API, avanzada, aplicaciones y proyectos", "JDK LTS, Git, Maven y JUnit",
          "construir un pequeño servicio por incrementos con una prueba por etapa", "saltar fundamentos por perseguir frameworks o medir progreso por temas leídos",
          "portafolio Java con releases, decisiones y pruebas", "algoritmos, lenguaje, diseño, APIs y operación",
          "dev.java/learn, JEP Index y OpenJDK release roadmap"),
    )),
    Block("02-backend-spring", "Backend con Java y Spring", (
        t("Fundamentos de Spring y Spring Boot", "ensamblar un servicio de pedidos sin que las clases creen sus dependencias",
          "IoC, DI, beans, ApplicationContext, autoconfiguración y starters", "Spring Initializr, Maven y Spring Boot",
          "inyectar una interfaz por constructor y sustituirla en una prueba", "confundir anotaciones con arquitectura o inyectar por campo por defecto",
          "servicio por capas con dependencias explícitas y test aislado", "Java, interfaces y módulos Maven",
          "docs.spring.io/spring-framework/reference/core/beans.html"),
        t("Spring Boot explicado en nueve capas", "seguir una petición desde el arranque hasta la observabilidad de producción",
          "fundamentos, REST, datos, seguridad, arquitectura, servicios, integración, despliegue y monitoreo", "Spring Boot, Actuator y Docker local",
          "mapear una funcionalidad a dominio, aplicación, infraestructura y API", "tratar las capas como carpetas decorativas sin límites de dependencia",
          "mapa de arquitectura con una ruta de petición trazable", "IoC, contratos HTTP, persistencia y operación",
          "docs.spring.io/spring-boot/reference/"),
        t("APIs REST con Spring Boot", "exponer la creación y consulta de envíos a clientes web y móviles",
          "verbos, status codes, DTOs, validación, ControllerAdvice y versionado", "Spring Web, Bean Validation y curl",
          "implementar POST/GET con validación y errores JSON consistentes", "devolver entidades JPA o responder 200 a todos los resultados",
          "API documentada con contrato y tests de casos inválidos", "HTTP, serialización, seguridad y persistencia",
          "docs.spring.io/spring-framework/reference/web/webmvc.html"),
        t("Spring Data JPA e Hibernate", "leer órdenes y sus paquetes sin multiplicar consultas inesperadamente",
          "relaciones, LAZY/EAGER, N+1, cascada, transacciones, query methods y migraciones", "Spring Data JPA, PostgreSQL, Flyway y SQL logging",
          "medir N+1 y comparar LAZY con fetch join o EntityGraph bajo un caso de uso", "cambiar todo a EAGER, serializar entidades o asumir que LAZY siempre evita consultas",
          "repositorio con migración, SQL observado y plan de fetch probado", "modelo de dominio, REST y transacciones",
          "docs.spring.io/spring-data/jpa/reference/ y jakarta.ee/specifications/persistence/"),
        t("Spring Security, JWT, OAuth2, OIDC y Keycloak", "proteger el acceso de operador y cliente a los envíos",
          "firma JWT HMAC/RSA, filtros, roles, PreAuthorize, OAuth2, OIDC e IdP", "Spring Security Test y Keycloak local",
          "validar issuer, audience, expiración y rol con tokens de prueba", "confiar en claims sin validar firma o tratar OAuth2 y OIDC como sinónimos",
          "API con matriz de permisos y pruebas de acceso/denegación", "REST, identidad, secretos y límites de confianza",
          "docs.spring.io/spring-security/reference/ y keycloak.org/documentation"),
        t("Arquitectura de microservicios", "separar pedidos y tracking cuando el dominio justifica despliegue independiente",
          "bounded contexts, sync/async, gateway, circuit breaker, Saga, CQRS y Outbox", "diagramas C4, Spring Cloud y broker local",
          "contrastar un monolito modular con una división de servicios y justificar el coste operativo", "llamar microservicio a cualquier Spring Boot con REST y Docker",
          "ADR con límites de dominio, fallos parciales y estrategia de consistencia", "DDD, APIs, eventos, observabilidad y despliegue",
          "microservices.io y docs.spring.io/spring-cloud/reference/"),
        t("Apache Kafka con Spring Boot", "publicar cambios de envío y consumirlos con recuperación de fallos",
          "brokers, topics, partitions, offsets, consumer groups, réplica, retries, DLT e idempotencia", "Kafka local, Spring Kafka Test y Docker Compose",
          "forzar una excepción, observar retry topic y DLT y procesarla con @DltHandler", "confundir orden global con orden por partición o asumir exactly-once extremo a extremo",
          "producer/consumer con clave estable, backoff, DLT y prueba de replay", "eventos de dominio, Outbox, observabilidad y resiliencia",
          "kafka.apache.org/documentation/ y docs.spring.io/spring-kafka/reference/"),
        t("Spring Batch", "reconciliar cientos de miles de movimientos logísticos reiniciando tras un fallo",
          "Job, Step, ItemReader/Processor/Writer, chunk, skip/retry, restart, partitioning y JobRepository", "Spring Batch, PostgreSQL y dataset sintético",
          "fallar a mitad de un chunk, reiniciar el Job y probar que no duplica registros", "procesar todo en memoria o llamar restartable a un job con efectos duplicables",
          "importación chunk-oriented con estado, métricas y política de errores", "transacciones, persistencia, idempotencia y operaciones",
          "docs.spring.io/spring-batch/reference/"),
    )),
    Block("03-qa-automation", "QA Automation", (
        t("Introducción al API Testing", "verificar el contrato de tracking consumido por varios clientes",
          "REST, HTTP, status codes, JSON, JSONPath y primer flujo en Postman", "Postman y API local de práctica",
          "crear casos para éxito, validación, no encontrado y autorización", "validar solo el código HTTP sin comprobar la respuesta útil",
          "matriz de pruebas con contrato, datos y resultados esperados", "REST, JSON y estrategia de testing",
          "learning.postman.com/docs/"),
        t("Postman desde cero", "organizar requests de autenticación, pedidos y seguimiento",
          "requests, collections, variables, environments y auth Basic/Bearer/OAuth2/API Key", "Postman Desktop",
          "mover una colección entre local y CI sin guardar secretos reales", "duplicar URLs y credenciales en cada request",
          "collection versionada con environment de ejemplo y variables secretas externas", "contratos HTTP y pruebas automatizadas",
          "learning.postman.com/docs/getting-started/"),
        t("Automatización en Postman", "detectar automáticamente regresiones del API de órdenes",
          "pm.test, pm.expect, assertions de status/body/schema/tiempo, datos dinámicos y chaining", "Postman Sandbox y JSON Schema",
          "encadenar creación y consulta usando un ID de respuesta", "tests dependientes del orden sin cleanup o assertions demasiado laxas",
          "suite determinista con aserciones positivas, negativas y datos dinámicos", "API Testing, environments y calidad de datos",
          "learning.postman.com/docs/tests-and-scripts/"),
        t("Newman", "ejecutar una colección Postman en terminal y CI",
          "CLI, variables por opción, data files CSV/JSON y reporter HTML htmlextra", "Node.js LTS, Newman y reporter",
          "correr los mismos casos con dos filas de datos y guardar un reporte HTML", "usar variables secretas en comandos registrados o ignorar el exit code",
          "comando reproducible y reporte conservado incluso al fallar", "Postman, scripting y CI",
          "github.com/postmanlabs/newman y github.com/DannyDainton/newman-reporter-htmlextra"),
        t("Jenkins para QA", "ejecutar smoke, regresión y nightly con evidencia consultable",
          "jobs, pipelines, Jenkinsfile declarativo, Newman, artifacts y notificaciones", "Jenkins LTS en entorno aislado",
          "crear stages de instalación, smoke y reporte con publicación de artifacts", "guardar credenciales en Jenkinsfile o publicar solo el estado final",
          "pipeline declarativo con credenciales gestionadas y reporte HTML archivado", "Git, Newman y políticas de CI",
          "jenkins.io/doc/book/pipeline/"),
        t("Proyecto final QA Automation", "automatizar un flujo de compra y entrega de principio a fin",
          "pipeline Postman → Newman → Jenkins con reportes y tipos de ejecución", "Postman, Newman, Jenkins y API demo",
          "separar smoke rápido de regresión completa y programar ejecución nocturna", "hacer que toda prueba dependa de datos remotos inestables",
          "repositorio reproducible con collection, pipeline, reportes y guía de fallo", "contratos, datos de prueba y observabilidad CI",
          "Postman Learning Center y Jenkins Pipeline documentation"),
    )),
    Block("04-bases-datos", "Bases de datos", (
        t("SQL y bases de datos relacionales", "consultar pedidos, clientes, pagos y paquetes sin duplicar datos",
          "SELECT, JOIN, GROUP BY, subconsultas, índices y normalización", "PostgreSQL o MySQL en contenedor local",
          "modelar el esquema y comparar un JOIN con consultas separadas", "usar SELECT * y añadir índices sin medir escritura ni selectividad",
          "esquema normalizado, consultas explicadas y plan de ejecución registrado", "persistencia JPA, transacciones y consultas de API",
          "postgresql.org/docs/current/tutorial-sql.html"),
        t("Datos espaciales con MySQL", "encontrar centros y entregas dentro de una zona geográfica",
          "GEOMETRY, POINT, SRID, índices espaciales y funciones ST_*", "MySQL con soporte espacial y dataset sintético",
          "insertar puntos con SRID explícito y comprobar distancia/intersección", "mezclar SRIDs, unidades angulares y metros o invertir latitud/longitud",
          "consultas espaciales reproducibles con casos dentro/fuera del polígono", "GPS móvil, sensores y modelo de base de datos",
          "dev.mysql.com/doc/refman/8.4/en/spatial-types.html"),
        t("PostgreSQL", "operar datos de entrega con copias verificables",
          "esquemas, roles, backup lógico/físico, restauración y extensiones", "psql, pg_dump y contenedor PostgreSQL",
          "restaurar en una base vacía y comparar conteos y restricciones", "confundir que un dump se generó con que el backup es restaurable",
          "runbook de backup/restore con evidencia de integridad", "SQL, despliegue, permisos y confiabilidad",
          "postgresql.org/docs/current/backup.html"),
        t("NoSQL con MongoDB", "guardar documentos de tracking cuyo patrón de lectura cambia",
          "documentos, índices, consistencia y criterios NoSQL frente a SQL", "MongoDB local y mongosh",
          "modelar el mismo caso en documentos y relacional y comparar consultas", "elegir NoSQL por moda o duplicar datos sin estrategia de actualización",
          "ADR SQL/NoSQL basado en consultas, integridad y evolución", "modelado relacional, eventos y consistencia",
          "mongodb.com/docs/manual/"),
    )),
    Block("05-devops-cloud", "DevOps y cloud", (
        t("Docker", "empaquetar una API Java reproducible y segura",
          "imágenes, capas, volúmenes, redes, -e, .env, ENV, Compose, multi-stage y no-root", "Docker Engine/OrbStack y BuildKit",
          "comparar imagen multi-stage con una imagen de desarrollo y examinar usuario efectivo", "incluir secretos en ENV o construir como root sin necesidad",
          "imagen mínima, .dockerignore, healthcheck y variables explicadas", "Maven, CI/CD, Kubernetes y Floci",
          "docs.docker.com/get-started/"),
        t("Alternativas a Docker Desktop", "levantar un laboratorio de contenedores con preferencias locales",
          "Dory, OrbStack y Podman: compatibilidad, licencia, daemonless y plataforma", "Podman u OrbStack según sistema",
          "ejecutar el mismo compose y comparar sockets, redes y persistencia", "asumir que comandos compatibles implican comportamiento idéntico",
          "tabla de decisión reproducible con comandos y límites observados", "Docker, virtualización y flujo de desarrollo",
          "podman.io/docs y documentación oficial del runtime elegido"),
        t("CI/CD", "validar y liberar cambios de una API sin pasos manuales ocultos",
          "integración, entrega/despliegue continuo, Jenkins, Actions, GitLab, Azure, CircleCI y rollout", "GitHub Actions y Jenkins local",
          "crear build/test/security stages y simular rolling o canary con rollback", "confundir pipeline verde con despliegue seguro o guardar secretos en YAML",
          "pipeline reproducible con gates, artifacts y estrategia de rollback", "Git, pruebas, contenedores e IaC",
          "docs.github.com/actions y jenkins.io/doc/book/pipeline/"),
        t("Kubernetes", "mantener disponible la API de entregas durante cambios",
          "Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, HPA, Helm y probes", "kind o minikube",
          "romper readiness deliberadamente y observar cómo cambia el tráfico", "usar liveness para dependencias externas o almacenar secretos en ConfigMap",
          "manifiestos comentados con probes, límites y prueba de rollout", "Docker, CI/CD, redes y observabilidad",
          "kubernetes.io/docs/concepts/"),
        t("Terraform y OpenTofu", "provisionar infraestructura local/cloud de forma revisable",
          "HCL, providers, variables, outputs, state, backend remoto, módulos y lifecycle", "Terraform u OpenTofu en laboratorio",
          "ejecutar fmt/validate/plan y destruir únicamente recursos de sandbox", "editar state manualmente o ejecutar apply sin revisar el plan",
          "módulo pequeño con backend documentado y plan revisado", "cloud local, CI/CD, secretos y control de cambios",
          "developer.hashicorp.com/terraform/docs y opentofu.org/docs"),
        t("Cloud local con LocalStack y Floci", "probar S3, SQS, SNS, Lambda y DynamoDB sin una cuenta cloud",
          "StackPort, AWS CLI local, endpoints 4566/4577/4588 y credenciales test/test en us-east-1", "Docker Compose, Floci y AWS CLI",
          "crear bucket y cola, enviar mensaje y comprobar estado/puerto del emulador", "usar credenciales de laboratorio contra nube real o asumir paridad completa",
          "laboratorio local repetible con teardown y límites anotados", "Docker, SDKs cloud, mensajería y pruebas",
          "README/guía oficial del emulador y AWS CLI Command Reference"),
    )),
    Block("06-frontend", "Frontend", (
        t("Angular moderno", "construir un tablero reactivo de tracking",
          "standalone, Signals, httpResource, computed, effect, OnPush, control flow, Forms, Router, SSR y zoneless", "Angular CLI y TypeScript",
          "derivar vista desde estado de carga/error/éxito y probar navegación", "usar effect para derivar estado o afirmar que zoneless elimina todo trabajo de detección",
          "feature standalone con formulario accesible y tests de estado", "HTTP, observabilidad del usuario y arquitectura de componentes",
          "angular.dev/essentials"),
        t("Angular 22: estado HTTP", "presentar estados de red sin booleanos inconsistentes",
          "manejo declarativo de loading/data/error y APIs HTTP de la versión objetivo", "Angular CLI fijado a Angular 22 y docs versionadas",
          "modelar request lento, cancelado, fallido y reintentado en una vista", "tratar httpResource u otra API experimental como estable sin verificar versión",
          "pantalla con estados tipados y pruebas de transición", "Signals, cancelación, UX accesible y pruebas",
          "angular.dev/guide/http y notas oficiales de Angular 22"),
        t("Angular 22: OnPush", "reducir trabajo de render en una lista de seguimiento",
          "marcado de vistas, signals, inputs, eventos, async data y zoneless", "Angular DevTools y fixture de lista",
          "medir renders antes/después de mutación y actualización inmutable", "creer que OnPush impide renders o mutar objetos sin notificar",
          "comparativa medida y test que captura actualización observable", "estado reactivo, rendimiento y arquitectura",
          "angular.dev/best-practices/skipping-subtrees y guía oficial Angular 22"),
        t("Angular Native", "evaluar una UI móvil nativa desde una base Angular",
          "Angular Native, React Native Fabric y Expo según estado Alpha del ecosistema", "repositorio/demo oficial de la versión disponible",
          "verificar matriz de compatibilidad, render nativo, navegación y módulos puente", "presentar una integración Alpha como opción estable de producción",
          "spike aislado con riesgos, dispositivos y alternativa web documentados", "Angular, React Native, accesibilidad y ciclo móvil",
          "repositorio y documentación primaria de Angular Native/Expo/React Native"),
        t("React y Next.js", "renderizar una página pública de tracking y una vista de cliente",
          "componentes, hooks, estado, Context, hooks propios, fetching, SSR/SSG/ISR y App Router", "React y Next.js con versiones fijadas",
          "trazar render y fetching en server/client y medir hydration", "llamar a hooks condicionalmente o compartir datos sensibles en HTML público",
          "página con límites server/client y estrategia SSR/SSG justificada", "APIs, estado, accesibilidad y despliegue",
          "react.dev/learn y nextjs.org/docs"),
    )),
    Block("07-movil", "Móvil", (
        t("Android con Kotlin y Jetpack Compose", "mostrar posición y estado de una entrega en Android",
          "coroutines, Flow, Room, Hilt, ViewModel, navegación y Retrofit/Ktor", "Android Studio y emulador",
          "simular rotación, proceso recreado y red desconectada", "lanzar trabajo largo en main o acoplar UI directamente al repositorio",
          "feature Compose con estado restaurable, Room y pruebas", "HTTP, permisos, persistencia y backend",
          "developer.android.com/courses/android-basics-compose"),
        t("Kotlin Multiplatform", "compartir reglas de cálculo entre cliente Android e iOS",
          "lógica compartida, source sets, expect/actual y límites de plataforma", "Kotlin Multiplatform Wizard y dos targets disponibles",
          "compartir una regla pura y mantener GPS/notificaciones en implementaciones específicas", "compartir abstracciones de UI o API nativas sin comprobar compatibilidad",
          "módulo común probado y matriz explícita de capacidades por plataforma", "Kotlin, Android, Swift e interoperabilidad",
          "kotlinlang.org/docs/multiplatform/"),
        t("iOS con SwiftUI", "crear una pantalla de entrega observable y segura ante concurrencia",
          "optionals, value types, State/Binding/Observable, lifecycle, async/await, actors, SwiftData, navegación y MainActor", "Xcode y Simulator",
          "provocar respuestas asíncronas fuera de orden y proteger estado de UI", "forzar unwrap de optionals o actualizar UI desde contexto no principal",
          "feature SwiftUI con estados vacíos/error, persistencia local y tests", "servicios HTTP, permisos y concurrencia estructurada",
          "developer.apple.com/tutorials/swiftui"),
        t("Flutter", "mostrar entregas en mapa con ubicación y eventos en tiempo real",
          "widget tree, Stateless/Stateful, Riverpod/Provider/BLoC, navegación, Dio, Maps, sockets y almacenamiento", "Flutter SDK y emulador con location mock",
          "simular permiso denegado, socket caído y reconexión con caché", "mover lógica de negocio a build() o filtrar errores de socket",
          "feature con estado explícito, tests y datos offline controlados", "backend, permisos de plataforma, mapas y observabilidad",
          "docs.flutter.dev/learn"),
    )),
    Block("08-electronica", "Ingeniería electrónica", (
        t("Matemáticas aplicadas", "dimensionar un filtro y estimar la respuesta de un sensor",
          "cálculo, álgebra lineal, ecuaciones diferenciales, Laplace, Fourier y series", "Python, NumPy y Jupyter opcional",
          "resolver una respuesta de primer orden y verificarla numéricamente", "manipular fórmulas sin unidades ni comprobar hipótesis",
          "notebook reproducible con derivación, unidades y gráfica contrastada", "circuitos, señales y control",
          "MIT OpenCourseWare y documentación NumPy"),
        t("Circuitos eléctricos", "analizar una red de alimentación DC y una carga AC",
          "Kirchhoff, Thévenin, Norton, superposición, RC/RL/RLC y factor de potencia", "LTspice o ngspice y multímetro virtual",
          "resolver un equivalente didáctico de Thévenin y contrastar simulación", "confundir polaridad, fasor RMS y pico o presentar el ejemplo como página del PDF ausente",
          "solución paso a paso con diagrama, unidades y comparación simulada", "matemáticas, analógica y potencia",
          "All About Circuits y manual oficial del simulador"),
        t("Electrónica analógica", "acondicionar una señal débil de sensor antes del ADC",
          "diodos, BJT/MOSFET, op-amps, fuentes, filtros y osciladores", "LTspice/ngspice y hoja de datos",
          "simular rectificador y amplificador con límites de alimentación reales", "tratar el op-amp como ideal fuera del rango común/salida",
          "diseño con punto de operación, respuesta y límites del componente", "circuitos, instrumentación y PCB",
          "hojas de datos del fabricante y All About Circuits"),
        t("Electrónica digital", "codificar el estado de una máquina de clasificación",
          "Boolean algebra, compuertas, combinacionales/secuenciales, TTL/CMOS, contadores, registros y FSM", "Logisim Evolution o HDL simulator",
          "construir tabla de verdad y derivar una FSM con reset definido", "ignorar rebote, estados no alcanzables o timing",
          "diagrama, tabla, simulación y casos de transición", "lógica, firmware y arquitectura de MCU",
          "Nand2Tetris y documentación del simulador"),
        t("Microcontroladores", "leer un sensor y activar un actuador con límites seguros",
          "C/C++, GPIO, ADC, PWM, UART, I2C, SPI, interrupciones, timers, RTOS y firmware", "simulador Wokwi o placa de desarrollo",
          "adquirir sensor por I2C y enviar muestras por UART con timeout", "hacer polling bloqueante en ISR o no validar rangos del ADC",
          "firmware con diagrama de estados, telemetría y prueba de fallo", "digital, señales, protocolos IoT y backend",
          "datasheet y reference manual del microcontrolador elegido"),
        t("Sistemas de comunicación", "transmitir una lectura IoT por canal con ruido",
          "AM/FM, modulación digital, Shannon, Nyquist, codificación de línea, detección de errores, antenas y propagación", "GNU Radio o simulador",
          "comparar BER en dos esquemas a SNR controlado", "confundir ancho de banda con tasa útil o aplicar Shannon como garantía física",
          "experimento con canal, parámetros y gráfica reproducibles", "señales, DSP, antenas y protocolos",
          "GNU Radio documentation y notas universitarias abiertas de comunicaciones"),
        t("Señales y sistemas", "caracterizar la respuesta del filtro de entrada del dispositivo",
          "clasificación, convolución, correlación, Fourier/Laplace/Z, LTI, muestreo y reconstrucción", "Python con SciPy signal",
          "calcular y graficar respuesta impulsional y frecuencial de un sistema LTI", "confundir muestreo con reconstrucción ideal o no comprobar estabilidad",
          "análisis temporal/frecuencial con supuestos declarados", "matemáticas, DSP, comunicaciones y control",
          "docs.scipy.org/doc/scipy/reference/signal.html"),
        t("Procesamiento de señales", "filtrar ruido de una señal de temperatura sin borrar cambios reales",
          "DSP, filtros analógicos/digitales, Z y compresión de audio/imagen/video", "Python, NumPy y SciPy",
          "comparar filtros por retardo, atenuación y señal útil preservada", "elegir el filtro por apariencia sin medir distorsión ni latencia",
          "pipeline reproducible con señal cruda, parámetros y métricas", "señales, sensores, audio e inferencia",
          "docs.scipy.org/doc/scipy/reference/signal.html"),
        t("Instrumentación y sensores", "convertir una magnitud física en lectura calibrada y trazable",
          "temperatura/presión/humedad/luz/posición, acondicionamiento, DAQ, calibración y actuadores", "datasheet, simulador y hoja de calibración",
          "tomar puntos de referencia, ajustar calibración y calcular error/incertidumbre", "confundir resolución ADC con exactitud del sistema",
          "registro de calibración con unidades, incertidumbre y condiciones ambientales", "analógica, ADC, control y telemetría",
          "datasheets del fabricante y documentación NI sobre DAQ"),
        t("Control automático", "regular velocidad de un motor ante cambios de carga",
          "modelado, respuesta, estabilidad Routh/Nyquist/Bode, PID y compensadores", "Python Control Systems Library o simulador",
          "sintonizar PID en modelo y probar saturación, retardo y perturbación", "ajustar gains mirando solo la respuesta ideal sin anti-windup",
          "modelo, margen de estabilidad y curva temporal comparada", "Laplace, sensores, potencia y firmware",
          "python-control.readthedocs.io y notas abiertas de control"),
        t("Electrónica de potencia", "alimentar un motor desde una fuente DC con eficiencia y temperatura acotadas",
          "rectificadores, inversores, convertidores DC-DC/AC, motores, fuentes conmutadas y gestión térmica", "LTspice/ngspice y datasheets",
          "simular buck con carga variable y medir rizado y disipación", "dimensionar un switch sin revisar SOA, pérdidas o refrigeración",
          "diseño de conversión con medición de eficiencia y límites térmicos", "circuitos, control, motores y PCB",
          "datasheets de semiconductores y documentación de TI Power Management"),
        t("Diseño de PCB", "pasar del prototipo de sensor a una placa fabricable y comprobable",
          "esquemático, layout, ruteo, reglas, integridad de señal, fabricación y test", "KiCad",
          "diseñar circuito de sensor, ejecutar ERC/DRC y preparar Gerbers", "rutar primero y olvidar retorno de corriente, desacoplo y manufactura",
          "proyecto KiCad con reglas, BOM, Gerbers y plan de test", "analógica, potencia, EMC y fabricación",
          "docs.kicad.org y reglas de diseño del fabricante"),
        t("Electromagnetismo", "analizar acoplamiento y propagación alrededor de una línea de sensor",
          "Coulomb, campo, Faraday, Maxwell, ondas y líneas de transmisión", "Python para cálculo y simulador EM introductorio",
          "estimar campo inducido en lazo y reflexiones por desadaptación", "aplicar Maxwell sin condiciones de frontera ni escala de frecuencia",
          "modelo con geometría, condiciones y orden de magnitud verificado", "comunicaciones, PCB, antenas y EMC",
          "MIT OpenCourseWare electromagnetism y recursos universitarios abiertos"),
        t("Programación de bajo nivel", "diagnosticar memoria y rendimiento de firmware que procesa muestras",
          "C/C++, Python, ASM, estructuras, algoritmos, depuración y buenas prácticas", "GCC/Clang, GDB y sanitizers",
          "trazar pila/heap y diagnosticar un acceso fuera de límites", "usar punteros sin ownership/invariantes o confundir UB con comportamiento portable",
          "programa pequeño con warnings, pruebas, sanitizer y mapa de memoria", "microcontroladores, drivers y toolchain",
          "en.cppreference.com y GNU GDB manual"),
        t("Gestión y habilidades", "coordinar un equipo que entrega un prototipo IoT con riesgo técnico",
          "planificación, documentación, colaboración, pensamiento crítico e innovación", "GitHub Projects o tablero equivalente",
          "convertir un objetivo en entregables, riesgos, criterios de aceptación y revisión", "medir actividad por horas o esconder bloqueos hasta el final",
          "plan de entrega con decisiones, evidencias, riesgos y retrospectiva", "comunicación técnica, calidad y liderazgo",
          "Atlassian Team Playbook y guías de documentación técnica"),
    )),
    Block("09-herramientas-practicas", "Herramientas y prácticas", (
        t("Git y control de versiones", "colaborar en una modificación urgente del flujo de pedidos",
          "commit, branch, merge/rebase, conflictos, PR, trunk-based, tags y releases", "Git CLI y repositorio de práctica",
          "resolver un conflicto con intención y etiquetar un release reproducible", "forzar push a rama compartida o reescribir historia publicada sin acuerdo",
          "historial revisable con PR, tests, tag y notas de release", "CI, revisión de código y colaboración",
          "git-scm.com/book/en/v2"),
        t("Testing de software", "prevenir regresión en reglas de negocio y adaptadores externos",
          "JUnit, Mockito, MockMvc, Testcontainers, TDD/BDD, pirámide y cobertura", "JUnit 5, Maven y Testcontainers",
          "seguir rojo-verde-refactor y añadir integración real con dependencia aislada", "confundir cobertura alta con detección de defectos o mockear todo",
          "suite por riesgo con tests rápidos e integración representativa", "Java, Spring, CI y diagnóstico",
          "junit.org/junit5/docs/current/user-guide/ y testcontainers.com"),
        t("Postman vs Bruno", "elegir un cliente API para un equipo con colecciones versionadas",
          "local-first, Git-native, secretos, colaboración y compatibilidad de colecciones", "Postman y Bruno",
          "migrar una colección pequeña y comparar scripts, colaboración y diffs", "elegir solo por interfaz o subir tokens en archivos de entorno",
          "ADR con casos de uso, coste de migración y repositorio sin secretos", "API testing, Git y automatización CI",
          "learning.postman.com/docs y docs.usebruno.com"),
        t("Patrones de diseño y SOLID", "extender cálculo de tarifas sin editar todas las ramas del servicio",
          "cinco Singletons, Factory, Builder, Prototype, Adapter, Decorator, Facade, Observer, Strategy, Command, Repository, Clean/Hexagonal", "Java, JUnit y diagramas UML/C4",
          "comparar Strategy con condicionales y probar el cambio de política", "aplicar patrón porque tiene nombre o esconder estado global en Singleton",
          "ADR de diseño respaldado por tests y costes de cambio", "POO, arquitectura, pruebas y microservicios",
          "refactoring.guru/design-patterns y Martin Fowler"),
        t("Algoritmos y estructuras de datos", "hallar ruta de menor coste para una flota de entregas",
          "Big-O, búsquedas, ordenamientos, hash, árboles, BFS/DFS, Dijkstra y programación dinámica", "Python, pytest y profiler",
          "implementar Dijkstra, compararlo con BFS en grafos ponderados y validar contra casos conocidos", "usar búsqueda binaria en datos no ordenados o Dijkstra con pesos negativos",
          "algoritmos testeados, medidos y vinculados a sus precondiciones", "Java collections, bases de datos y logística",
          "visualgo.net y Python docs"),
        t("Visual Studio Code", "configurar un flujo de trabajo repetible para estudiar y depurar",
          "atajos, navegación, terminal, debugger, perfiles, extensiones y settings", "VS Code y un repositorio sandbox",
          "resolver una incidencia usando búsqueda, breakpoint, test y terminal integrada", "instalar extensiones indiscriminadamente o versionar secretos de settings",
          "perfil ligero documentado con tareas y atajos usados", "Git, Python/Java, testing y productividad",
          "code.visualstudio.com/docs"),
        t("Windows: WinUtil", "evaluar ajustes de Windows sin desactivar controles críticos a ciegas",
          "PowerShell, telemetría, servicios, privacidad, rendimiento, snapshots y reversibilidad", "WinUtil oficial en VM o máquina de prueba respaldada",
          "leer el script, revisar diff de ajustes y probar restore point antes del cambio", "ejecutar scripts elevados sin inspeccionar origen, alcance ni rollback",
          "registro de cambios, estado antes/después y procedimiento de reversión", "seguridad, sistemas operativos y operación",
          "repositorio oficial de WinUtil y Microsoft Learn PowerShell"),
        t("Manim y ManimGX", "explicar visualmente un concepto mediante una escena reproducible",
          "Scene, mobjects, transformaciones, texto, color, timing y diferencias entre CE/GX", "Python compatible y Manim CE o ManimGX según versión",
          "renderizar una transformación con una escena mínima y un concepto medible", "inventar APIs o asegurar compatibilidad sin renderizar en la versión objetivo",
          "archivo ejecutable, comando de render y salida revisada", "matemáticas, algoritmos y comunicación técnica",
          "docs.manim.community y manimgx.academa.ai"),
    )),
    Block("10-ia-aplicada", "IA aplicada al estudio", (
        t("Prompting para aprender cualquier tema", "estudiar un concepto técnico y detectar si una explicación quedó superficial",
          "esencia, analogía, descomposición, errores, preguntas, práctica y malentendidos", "modelo de IA disponible y fuentes primarias",
          "pedir una explicación, resolver ejercicios sin mirar y comprobar afirmaciones", "confundir fluidez textual con comprensión o aceptar citas no verificadas",
          "ficha de estudio con preguntas, respuestas propias y fuentes comprobadas", "metacognición, documentación y práctica deliberada",
          "fuentes oficiales del tema estudiado y guía institucional de IA"),
        t("Prompting para roadmaps de 30 pasos", "convertir una meta profesional en un plan progresivo con dependencias reales",
          "diagnóstico inicial, prerrequisitos, milestones, práctica, evidencia y ajuste", "plantilla de prompt y tablero de seguimiento",
          "generar un roadmap, encontrar saltos de prerrequisito y probar un primer paso", "medir avance por cantidad de pasos o aceptar secuencias genéricas",
          "roadmap revisado con esfuerzo, criterios de salida y enlaces a fuentes", "planificación, currículo y evaluación",
          "documentación oficial de cada tecnología y fuentes educativas abiertas"),
        t("Humanizador de texto IA", "editar un borrador técnico manteniendo precisión y autoría",
          "tono conversacional, variación, claridad, citas, trazabilidad y declaración de asistencia", "editor de texto, control de cambios y política académica",
          "comparar borrador y revisión, verificando que no se agregaron afirmaciones falsas", "usar humanización para evadir detección o simular experiencia no vivida",
          "texto revisado con registro de cambios y declaración transparente", "escritura técnica, integridad y revisión de fuentes",
          "política institucional de integridad académica y guías de citación"),
        t("Riesgos éticos del prompting", "responder a la petición de fabricar una tesis o aparentar trabajo no realizado",
          "integridad académica, atribución, privacidad, sesgo, alucinación y responsabilidad", "guía institucional, registro de fuentes y análisis de riesgo",
          "reformular una petición engañosa hacia una revisión honesta con evidencia propia", "presentar trabajo inventado como propio o enviar datos sensibles a un servicio sin autorización",
          "política de uso responsable con ejemplo de rechazo y alternativa ética", "prompting, privacidad, investigación y comunicación",
          "política institucional de investigación e integridad académica"),
    )),
)

OLD_TOPICS = {topic.title: topic for block in BLOCKS for topic in block.topics}


def combine(
    title: str,
    sources: tuple[str, ...],
    scenario: str,
    focus: str,
    practice: str,
    deliverable: str,
    bridge: str,
    *,
    pitfall: str | None = None,
    tool: str | None = None,
    source: str | None = None,
) -> Topic:
    source_topics = [OLD_TOPICS[name] for name in sources]
    return Topic(
        title=title,
        scenario=scenario,
        focus=focus,
        tool=tool or ", ".join(dict.fromkeys(topic.tool for topic in source_topics)),
        practice=practice,
        pitfall=pitfall or "; ".join(dict.fromkeys(topic.pitfall for topic in source_topics)),
        deliverable=deliverable,
        bridge=bridge,
        source=source or "; ".join(dict.fromkeys(topic.source for topic in source_topics)),
    )


REVISED_BLOCKS = (
    Block("01-fundamentos-programacion", "Fundamentos de programación", (
        combine("Fundamentos de programación", ("Fundamentos de programación",),
                "automatizar una regla de pedidos de una tienda", "algoritmos, variables, tipos, operadores, control, funciones",
                "implementar una función de precio con decisiones y casos límite", "programa pequeño trazable con entradas, salidas y pruebas",
                "algoritmos y lógica como base para elegir cualquier lenguaje"),
    )),
    Block("02-java", "Java", (
        combine("Java — Fundamentos", ("Introducción a Java",),
                "compilar y ejecutar una orden logística en Java", "JDK/JRE/JVM, source-to-bytecode, main, classpath, packages, LTS 8/11/17/21, historia y Virtual Threads",
                "compilar con javac, inspeccionar bytecode y ejecutar la misma tarea en una versión LTS objetivo", "proyecto Java ejecutable con matriz de versiones y notas de compatibilidad",
                "fundamentos de programación, Maven y Spring"),
        combine("Java — POO", ("POO en Java",),
                "proteger invariantes de una guía de envío", "clases, objetos, constructores, this, encapsulamiento, herencia, super, polimorfismo, abstracción, modifiers, static/final y SOLID",
                "implementar un dominio con invariantes y extensiones comprobadas mediante tests", "modelo Java con pruebas que demuestran principios SOLID aplicados con criterio",
                "tipos, diseño, patrones y Spring DI"),
        combine("Java — Colecciones y estructuras de datos", ("Colecciones y estructuras de datos",),
                "buscar y priorizar paquetes en un centro logístico", "ArrayList/LinkedList, Sets, Maps, Queue/Deque/PriorityQueue/Stack, iteradores, comparadores y Big-O",
                "medir operaciones representativas en estructuras ordenadas y no ordenadas", "benchmark reproducible con elección de colección y complejidad explicada",
                "POO, algoritmos y persistencia"),
        combine("Java — Excepciones y APIs modernas", ("Excepciones, Streams, Optional y Date/Time",),
                "importar escaneos de entrega y resumir retrasos por fecha y zona", "try/catch/finally, throw/throws, checked/unchecked, resources, custom exceptions, Streams, Optional y Date/Time",
                "procesar un archivo con errores recuperables, pipeline y tests de fechas", "pipeline de importación con errores explícitos, recursos cerrados y zona horaria probada",
                "colecciones, lambdas, IO y backend"),
        combine("Java — Multithreading y concurrencia", ("Multithreading y concurrencia",),
                "consultar proveedores en paralelo y actualizar una orden compartida", "Thread/Runnable/Callable, lifecycle, races, locks, volatile, atomics, executors, pools, CompletableFuture y deadlocks",
                "reproducir race condition, detectarla y resolverla con sincronización o actoría apropiada", "servicio concurrente con tests de carrera, timeout, cancelación y estrategia para deadlocks",
                "Java API, Kafka y resiliencia"),
        combine("Java — Generics y programación funcional", ("Generics, Lambdas y programación funcional",),
                "componer filtros y transformaciones tipadas para paquetes", "generics, bounds, wildcards, Function/Predicate/Consumer/Supplier, lambdas, method references y Streams",
                "crear un pipeline tipado con flatMap y reducción sin efectos laterales innecesarios", "librería Java de funciones de dominio con tests y contratos genéricos",
                "colecciones, Streams y diseño reusable"),
        combine("Java — Build y proyectos", ("Maven: build lifecycle", "Roadmap Java completo"),
                "entregar un proyecto Java repetible para varios entornos", "Maven lifecycle y comandos, Gradle, proyecto por etapas y plan Java de 30 días",
                "configurar wrapper, build verify, tests y comparación acotada con Gradle", "proyecto Java con build reproducible, CI y plan de 30 días por hitos",
                "fundamentos, POO, API y despliegue"),
    )),
    Block("03-spring", "Spring y arquitectura de backend", (
        combine("Spring — Fundamentos", ("Fundamentos de Spring y Spring Boot",),
                "ensamblar un servicio de pedidos con dependencias inyectadas", "IoC/DI, Beans, ApplicationContext, stereotype annotations, autoconfiguración, starters y configuration files",
                "crear beans y probar inyección por constructor y condiciones de autoconfiguración", "app Spring Boot mínima con configuración tipada y pruebas de contexto",
                "Java, interfaces, REST y persistencia"),
        t("Spring — Estructura enterprise", "organizar un flujo de compra que permita cambiar adaptadores sin filtrar framework al dominio",
          "domain/application/infrastructure/api/shared, entidades y puertos, usecases, DTO/mappers, adapters, Clean Architecture, DDD y Hexagonal",
          "Spring Boot, Maven y diagramas C4",
          "trazar dependencias y probar un use case sin inicializar Spring",
          "crear carpetas domain sin respetar dirección de dependencias",
          "feature vertical con dominio puro, puerto y adaptador reemplazable",
          "POO, SOLID, Spring DI y microservicios",
          "docs.spring.io/spring-modulith/reference/; martinfowler.com/bliki/HexagonalArchitecture.html"),
        combine("Spring — APIs REST", ("APIs REST con Spring Boot",),
                "exponer pedidos a web, Android e iOS con contratos estables", "HTTP verbs/status, mappings, path/body/query, DTO/entity, validation, advice y versioning",
                "crear endpoint idempotente con validación y contrato de error", "API versionada con pruebas de contrato, validación y errores consistentes",
                "HTTP, seguridad, JPA y QA automation"),
        combine("Spring — Acceso a datos (JPA/Hibernate)", ("Spring Data JPA e Hibernate",),
                "cargar pedidos y líneas de pedido midiendo exactamente el SQL generado", "entities/IDs/relations, LAZY/EAGER, N+1, fetch joins/EntityGraph, cascades/orphan removal, transaction, repositories/query methods y migrations",
                "reproducir N+1 con fixture real, contar consultas y comparar planes LAZY/EAGER", "API JPA con migración versionada, caso N+1 medido y fetch plan explícito por caso de uso",
                "modelado SQL, REST, transacciones y rendimiento"),
        combine("Spring — Seguridad", ("Spring Security, JWT, OAuth2, OIDC y Keycloak",),
                "autorizar a cliente y operador sin confiar en datos enviados por el cliente", "Spring Security, JWT header/payload/signature, HMAC/RSA, login/token/filter, roles, OAuth2/OIDC, Keycloak, CORS y Cognito comparison",
                "verificar firma, issuer, audience, expiry y permisos con pruebas de autorización negativa", "API con matriz de roles y login local IdP documentado",
                "identidad, HTTP, secretos y zero trust",
        ),
        t("Spring — Servicios avanzados", "ejecutar tareas programadas, reaccionar a cambios y evitar cálculos repetidos",
          "Scheduling, ApplicationEvent/@EventListener, Batch, cache y email", "Spring Boot, scheduler controlable, cache test y mail sink local",
          "implementar tarea idempotente y evento de dominio comprobable con fake clock", "publicar emails duplicados o usar cache sin política de invalidación",
          "servicios de aplicación con scheduler, listener, cache y email reemplazables en tests",
          "transacciones, idempotencia, Batch y observabilidad",
          "docs.spring.io/spring-framework/reference/integration.html; docs.spring.io/spring-batch/reference/"),
        t("Spring — Integración y APIs externas", "consultar transportistas y manejar latencia, errores y cambios de contrato",
          "RestTemplate legado, WebClient, Feign, APIs externas y llamadas entre servicios", "WebClient/HTTP Interface/Feign según versión Spring objetivo, WireMock",
          "simular timeout, 429 y respuesta inválida sin llamar un tercero real", "reintentar POST no idempotente o confundir cliente HTTP bloqueante con reactivo",
          "adaptador externo con timeout, mapping de errores y tests contractuales",
          "REST, microservicios, resiliencia y secretos",
          "docs.spring.io/spring-framework/reference/integration/rest-clients.html"),
        t("Spring — Monitoreo y observabilidad", "diagnosticar un retraso que cruza API, base de datos y broker",
          "Actuator, Prometheus/Grafana, ELK, Sentry, logs, métricas y trazas", "Micrometer, OpenTelemetry, Prometheus/Grafana local",
          "propagar trace/correlation ID y conectar un span HTTP a una dependencia lenta", "registrar tokens/PII o confundir logs con trazas distribuidas",
          "dashboard mínimo con SLI definidos, trazas correlacionadas y política de redacción",
          "microservicios, Kafka, Kubernetes y respuesta a incidentes",
          "docs.spring.io/spring-boot/reference/actuator/; opentelemetry.io/docs/"),
        t("Spring — Ecosistema y milestones", "evaluar una actualización del ecosistema sin desplegar una milestone accidentalmente",
          "Spring AI/Data/Security/Integration/AMQP/Cloud, SemVer/prerelease, BOM y compatibilidad",
          "Spring Initializr, Maven dependency tree, release notes oficiales",
          "comprobar coordenada, estado GA/RC/M y compatibilidad antes de habilitar un BOM",
          "copiar números de milestone del cuaderno como versiones estables o ignorar compatibilidad",
          "ADR de upgrade con fuentes fechadas, dependency tree y plan de rollback",
          "Maven, Spring Boot, seguridad de cadena de suministro",
          "spring.io/projects; github.com/spring-projects"),
        combine("Spring Batch", ("Spring Batch",),
                "conciliar millones de eventos reiniciando tras una falla", "Job/Step/JobRepository, chunk, reader/processor/writer, skip, retry, restart, partitioning y parallelism",
                "fallar entre chunks, reanudar y probar idempotencia de escrituras", "job con restart comprobado, métrica por chunk y política de errores",
                "base de datos, transacciones, scheduler y operación"),
        combine("Arquitectura de microservicios", ("Arquitectura de microservicios",),
                "decidir si separar pedidos de facturación o mantener un monolito modular", "monolith comparison, bounded contexts, gateway, sync/async, circuit breaker, bulkhead, observability, DB-per-service, deployment, Saga",
                "mapear fallos y costes operativos antes de separar un bounded context", "ADR que demuestra por qué Spring Boot + REST + Docker no es criterio suficiente para microservicios",
                "DDD, REST, Kafka, Saga, CQRS y Outbox"),
        combine("Apache Kafka", ("Apache Kafka con Spring Boot",),
                "propagar el estado de paquetes con retries acotados y DLQ operable", "broker/topic/partition/offset/group, KafkaTemplate/listener, replication, retries/backoff, DLT/@DltHandler, idempotency y Kafka vs REST",
                "provocar fallo de consumer y seguir offset→retry topic→DLT→replay", "flujo probado por partición, idempotent producer y DLT con alerta y replay controlado",
                "Outbox, microservices, resiliencia y observabilidad"),
    )),
    Block("04-qa-automation", "QA Automation", tuple(OLD_TOPICS[name] for name in (
        "Introducción al API Testing", "Postman desde cero", "Automatización en Postman", "Newman", "Jenkins para QA", "Proyecto final QA Automation",
    ))),
    Block("05-bases-datos", "Bases de datos", (
        combine("Bases de datos: SQL, PostgreSQL, MySQL espacial y MongoDB", (
            "SQL y bases de datos relacionales", "Datos espaciales con MySQL", "PostgreSQL", "NoSQL con MongoDB",
        ), "persistir pedidos y localizar entregas por zona sin imponer el mismo modelo a toda carga",
          "SQL/JOIN/GROUP BY/subqueries/indexes/normalization, Postgres backup/extensions, MySQL GEOMETRY/ST_*, MongoDB and SQL-vs-NoSQL",
          "comparar dos modelos para la misma consulta espacial y verificar un restore", "modelo relacional migrable, consultas espaciales con SRID y ADR SQL/NoSQL con backup restaurado",
          "JPA, GPS móvil, integridad, índices y eventos"),
    )),
    Block("06-docker", "Docker y runtimes locales", (
        combine("Docker y alternativas", ("Docker", "Alternativas a Docker Desktop"),
                "empaquetar un backend multi-stage y ejecutar el mismo compose en runtimes compatibles",
                "images/layers/Dockerfile/volumes/networks; env -e/.env/ENV; compose; multi-stage; .dockerignore; non-root; Dory/OrbStack/Podman",
                "inspeccionar usuario y capas, montar persistencia y comparar un runtime alternativo",
                "stack reproducible con imagen no-root, entorno documentado y comparativa local-first",
                "CI/CD, Kubernetes, Floci y seguridad de artefactos",
                pitfall="secretos embebidos en imagen o asumir paridad total de CLI/runtimes"),
    )),
    Block("07-cicd", "CI/CD", (OLD_TOPICS["CI/CD"],)),
    Block("08-kubernetes", "Kubernetes", (OLD_TOPICS["Kubernetes"],)),
    Block("09-iac", "Infraestructura como código", (OLD_TOPICS["Terraform y OpenTofu"],)),
    Block("10-cloud-local", "Cloud local", (OLD_TOPICS["Cloud local con LocalStack y Floci"],)),
    Block("11-frontend-angular", "Frontend Angular", (
        combine("Angular moderno y Angular 22", ("Angular moderno", "Angular 22: estado HTTP", "Angular 22: OnPush"),
                "construir un tablero de tracking reactivo que mantenga loading/data/error coherentes",
                "standalone, Signals/httpResource/computed/effect, OnPush, @if/@for, Signal Forms, Router, SSR y zoneless",
                "medir render, probar error/cancelación y validar navegación/formulario",
                "feature Angular con estados HTTP discriminados, pruebas y render medido",
                "REST, accesibilidad y rendimiento",
                pitfall="mezclar Angular 22 sin verificar APIs disponibles o derivar estado con effects",
        ),
        OLD_TOPICS["Angular Native"],
    )),
    Block("12-frontend-react", "Frontend React", (OLD_TOPICS["React y Next.js"],)),
    Block("13-movil", "Desarrollo móvil", tuple(OLD_TOPICS[name] for name in (
        "Android con Kotlin y Jetpack Compose", "Kotlin Multiplatform", "iOS con SwiftUI", "Flutter",
    ))),
    Block("14-git", "Git y control de versiones", (OLD_TOPICS["Git y control de versiones"],)),
    Block("15-testing", "Testing y clientes API", (
        OLD_TOPICS["Testing de software"],
        OLD_TOPICS["Postman vs Bruno"],
    )),
    Block("16-patrones-arquitectura", "Patrones de diseño y arquitectura", (
        t("SOLID", "cambiar reglas de una plataforma logística sin reescribir su núcleo",
          "SRP, OCP, LSP, ISP y DIP; cada principio con ejemplo incorrecto/correcto y reflejo en Spring",
          "Java 17+, JUnit y estructura Spring",
          "refactorizar una clase God-like principio por principio y mostrar pruebas antes/después",
          "convertir SOLID en receta de interfaces por clase o ignorar el coste de abstracción",
          "diagrama y diff de refactorización con ejemplos positivos/negativos ejecutables",
          "POO, DI, Strategy, Adapter y arquitectura hexagonal",
          "objectmentor.com/resources/articles/Principles_and_Patterns.pdf; docs.spring.io; "
          "web/public/content/java/modulo-12.md; web/public/content/spring-boot/modulo-15.md"),
        t("Patrones creacionales", "crear notificadores y pedidos válidos para canales y configuraciones variables",
          "Singleton Eager/Lazy/Synchronized/DCL/Enum, Factory Method, Abstract Factory, Builder y Prototype",
          "Java 17+, JUnit y plantillas Maven",
          "ejecutar cada variante/fábrica con salida esperada y comparar composición, concurrencia y testabilidad",
          "usar Singleton global para estado mutable o construir fábricas sin variación real",
          "ejemplos Java ejecutables para 5 variantes Singleton y 4 patrones creacionales",
          "SOLID, inmutabilidad, DI y patrones estructurales",
          "refactoring.guru/design-patterns/creational-patterns; "
          "examples/java/patrones-rutaflow/CreationalPatternsDemo.java"),
        t("Patrones estructurales", "integrar una pasarela legacy sin cambiar el contrato del dominio",
          "Adapter, Decorator, Facade, Composite, Proxy y Bridge",
          "Java 17+, JUnit y diagramas UML",
          "envolver un SDK de pago legacy con Adapter y añadir logging con Decorator", "apilar capas sin necesidad o usar Proxy y Adapter con intenciones indistinguibles",
          "seis ejemplos Java ejecutables con estructura, salida, coste y alternativa",
          "SOLID, Factory, microservicios y boundaries",
          "refactoring.guru/design-patterns/structural-patterns; "
          "examples/java/patrones-rutaflow/StructuralPatternsDemo.java"),
        t("Patrones de comportamiento", "desacoplar cambios de pedidos, políticas y pasos de procesamiento",
          "Observer, Strategy, Command, Template Method, Chain, State, Iterator, Mediator, Memento y Visitor",
          "Java 17+, JUnit y consola",
          "modelar el ciclo de pedido con State y emitir observers desacoplados, comparando con eventos Spring/Kafka",
          "usar herencia para cada variación o ignorar orden, concurrencia y ciclo de vida",
          "diez ejemplos Java completos con main, salida y ejercicio incremental",
          "Spring Events, Kafka, SOLID y patrones de arquitectura",
          "refactoring.guru/design-patterns/behavioral-patterns; "
          "examples/java/patrones-rutaflow/BehavioralPatternsDemo.java"),
        t("Patrones de arquitectura", "evolucionar RutaFlow desde una app única a límites de dominio justificados",
          "Monolith, Modular Monolith, Microservices, EDA, Hexagonal, Clean, CQRS, Event Sourcing, Saga, Outbox, Gateway, BFF, Serverless, Layered, Pipeline, Space-Based y Microkernel",
          "Java 17+, Spring Boot, Kafka, Maven y C4",
          "construir un ejemplo ejecutable de Outbox y contrastar 4 servicios/gateway frente a un monolito modular",
          "distribuir servicios sin autonomía de datos o introducir event sourcing sin requisito de historial",
          "catálogo comparativo con ejemplos/runnable skeletons y decisiones explícitas para cada patrón",
          "DDD, base de datos, eventos, seguridad y operación",
          "martinfowler.com/architecture/; microservices.io/patterns/; "
          "web/public/content/spring-boot/modulo-10.md; modulo-12.md; modulo-15.md; modulo-21.md"),
        t("Principios de arquitectura", "revisar una solución que ya tiene requisitos, usuarios y límites cambiantes",
          "SOLID, DRY/KISS/YAGNI, Demeter, Hollywood, separation, cohesion/coupling, idempotency, stateless/stateful y 12-Factor",
          "Java, tests, ADR y aplicación de referencia",
          "evaluar tres decisiones contra contexto y documentar cuándo un principio entra en tensión con otro",
          "aplicar DRY creando abstracciones antes de conocer variaciones o tratar 12-factor como arquitectura completa",
          "checklist razonada con ADR y ejemplo donde no aplicar una regla sería mejor",
          "Clean Architecture, microservices y operación cloud",
          "12factor.net; martinfowler.com/bliki/"),
        t("Anti-patrones", "diagnosticar degradación de un servicio antes de multiplicar excepciones y parches",
          "God Object, Spaghetti, Big Ball of Mud, Lava Flow, Golden Hammer, premature optimization, copy-paste, Singleton misuse, Anemic Domain y Distributed Monolith",
          "Java, tests, static analysis y C4",
          "identificar causa observable y escoger una refactorización incremental con test de regresión",
          "usar etiquetas para juzgar código sin contexto o intentar una reescritura big-bang",
          "catálogo de síntomas, consecuencias, señales y plan de salida verificable",
          "SOLID, métricas, refactoring y microservicios",
          "martinfowler.com/bliki/AntiPattern.html; refactoring.guru"),
    )),
    Block("17-algoritmos", "Algoritmos y estructuras de datos", (
        combine("Algoritmos y estructuras de datos", ("Algoritmos y estructuras de datos",),
                "calcular una ruta para repartidores y justificar coste frente a tamaño del grafo",
                "Big-O, búsqueda/ordenamiento, BFS/DFS, Dijkstra, hash/tree/graph y dynamic programming",
                "implementar y visualizar búsqueda, ordenamiento y Dijkstra con casos y métricas",
                "suite comparativa con grafos de prueba, correctitud y rendimiento",
                "colecciones Java, mapas, persistencia y logística",
                pitfall="usar Dijkstra con pesos negativos o medir complejidad solo con un ejemplo pequeño"),
    )),
    Block("18-herramientas", "Herramientas de desarrollo", (
        combine("Herramientas de desarrollo", ("Visual Studio Code", "Windows: WinUtil", "Manim y ManimGX"),
                "elegir y usar herramientas sin ejecutar cambios irreversibles a ciegas",
                "VS Code, WinUtil, Manim/ManimGX, Exercism, CodeCademy/Codedden* y QuickRef",
                "resolver un ejercicio en plataforma, generar un quick reference y renderizar una visualización tras verificar la API",
                "perfil editor documentado, ejercicios fechados y escena renderizada con versión fijada",
                "Git, práctica deliberada, algoritmos y documentación",
                pitfall="confiar en nombre dudoso de producto o ejecutar herramienta elevada sin revisar cambios",
                source="code.visualstudio.com/docs; exercism.org; docs.manim.community; revisar nombre y disponibilidad de plataforma citada"),
    )),
    Block("19-ia-aplicada", "IA aplicada al estudio", (
        combine("IA aplicada al estudio", ("Prompting para aprender cualquier tema", "Prompting para roadmaps de 30 pasos", "Humanizador de texto IA", "Riesgos éticos del prompting"),
                "aprender un tema técnico y demostrar dominio sin fingir autoría",
                "prompting por fases, roadmap progresivo, revisión de tono y riesgos de fabricación de tesis",
                "usar IA para elaborar preguntas, verificar con fuentes y responderlas con evidencia propia",
                "plan verificado, notas propias y declaración de asistencia IA",
                "metacognición, investigación, ética y documentación",
                pitfall="presentar texto generado como tesis/datos/trabajo no realizado o enviar datos privados",
                source="fuentes primarias del dominio y política de integridad académica local"),
    )),
    Block("20-proyecto-integrador", "Proyecto integrador RutaFlow", (
        t("RutaFlow: plataforma logística IoT", "seguir una entrega desde un sensor/móvil hasta el cliente con trazabilidad",
          "Flutter, Spring Boot, MySQL espacial, Kafka, JWT, Socket.IO, QA Postman/Newman/Jenkins, PostgreSQL, Docker/K8s/CI/IaC/LocalStack, Angular Signals; Repository, Observer, Strategy, Saga, Outbox y API Gateway",
          "repositorio RutaFlow, Docker Compose y emuladores locales",
          "entregar el flujo incremental de alta, ubicación, notificación, batch de conciliación, prueba y despliegue",
          "construir un monolito distribuido en carpetas sin propiedad clara de datos ni observabilidad",
          "demo con contrato, pruebas, trazas, modelo geoespacial y escena arquitectónica",
          "los 19 bloques anteriores; integrar por cortes verticales con hipótesis verificables",
          "examples/rutaflow/README.md y documentación oficial citada en cada bloque"),
    )),
)

OBSOLETE_ROADMAPS = (
    "01-fundamentos-java.md",
    "02-backend-spring.md",
    "03-qa-automation.md",
    "04-bases-datos.md",
    "05-devops-cloud.md",
    "06-frontend.md",
    "07-movil.md",
    "08-electronica.md",
    "09-herramientas-practicas.md",
    "10-ia-aplicada.md",
)


def render_steps(topic: Topic) -> list[str]:
    steps = [
        f"Describe el problema de industria «{topic.scenario}» y quién recibe valor de resolverlo.",
        f"Escribe el resultado experto observable: {topic.deliverable}.",
        f"Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar {topic.title.lower()}.",
        f"Define un glosario propio para las piezas de {topic.focus}.",
        f"Dibuja el modelo, flujo o sistema físico de {topic.focus} antes de memorizar términos.",
        f"Prepara {topic.tool}; registra versión, comandos y una forma segura de limpiar el laboratorio.",
        f"Encuentra en {topic.source} una explicación oficial y anota qué conceptos confirma.",
        f"Traza un caso exitoso de «{topic.scenario}» desde la entrada hasta el resultado.",
        f"Resuelve «{topic.practice}» con la solución más pequeña que funcione.",
        f"Provoca el error «{topic.pitfall}» en un entorno desechable y captura la evidencia.",
        f"Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.",
        f"Implementa la pieza central de {topic.focus} y sepárala de presentación/configuración cuando corresponda.",
        f"Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.",
        f"Compara dos enfoques para «{topic.scenario}» y registra un criterio medible para elegir.",
        f"Especifica entradas, salidas, errores esperados y supuestos del componente de {topic.title.lower()}.",
        f"Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a {topic.focus}.",
        f"Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.",
        f"Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.",
        f"Optimiza solo una limitación demostrada y compara la medición antes/después.",
        f"Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «{topic.deliverable}».",
        f"Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.",
        f"Documenta una decisión técnica y enlaza evidencia primaria consultada en {topic.source}.",
        f"Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.",
        f"Completa un laboratorio autónomo que produzca «{topic.deliverable}» y guarda entrada, salida y pruebas.",
        f"Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.",
        f"Conecta {topic.title.lower()} con {topic.bridge}; dibuja el contrato entre ambos conocimientos.",
        f"Diseña una parte del proyecto integrador para «{topic.scenario}» y registra dependencias y riesgos.",
        f"Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.",
        f"Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.",
        f"Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «{topic.deliverable}».",
    ]
    assert len(steps) == 30
    return steps


def render_block(block: Block, block_number: int) -> str:
    topic_number = sum(len(previous.topics) for previous in REVISED_BLOCKS[:block_number - 1])
    lines = [
        f"# Bloque {block_number}: {block.title}",
        "",
        f"Este bloque contiene {len(block.topics)} roadmaps independientes. Cada roadmap avanza en 30 pasos, "
        "desde cero hasta una evidencia de nivel avanzado; no presupone experiencia previa en el tema.",
        "",
        "Los pasos 1–10 construyen fundamentos, 11–20 desarrollan práctica y diagnóstico, y 21–30 integran "
        "el tema en un resultado más cercano al trabajo profesional. Marca cada casilla solo cuando puedas "
        "mostrar la evidencia indicada.",
        "",
    ]
    for index, topic in enumerate(block.topics, start=1):
        global_number = topic_number + index
        lines.extend([
            f"## Tema {global_number}: {topic.title}",
            "",
            f"**Meta:** {topic.deliverable}",
            "",
            f"**Contexto de práctica:** {topic.scenario}",
            "",
            f"**Conocimientos que conecta:** {topic.bridge}",
            "",
        ])
        steps = render_steps(topic)
        for start in range(0, 30, 10):
            level = ("Principiante", "Intermedio", "Avanzado")[start // 10]
            lines.extend([f"### Pasos {start + 1}–{start + 10}: nivel {level}", ""])
            for offset, step in enumerate(steps[start:start + 10], start=start + 1):
                lines.append(f"- [ ] **Paso {offset}.** {step}")
            lines.append("")
        lines.extend([
            f"**Criterio de salida:** entrega «{topic.deliverable}», explica «{topic.pitfall}» y demuestra "
            f"cómo {topic.title.lower()} se conecta con {topic.bridge}.",
            "",
            f"**Fuentes primarias para iniciar:** {topic.source}.",
            "",
        ])
    return "\n".join(lines).rstrip() + "\n"


def render_index() -> str:
    lines = [
        "# Roadmaps de 30 pasos: de principiante a avanzado",
        "",
        "Currículo renovado de 20 bloques y 53 temas. Cada tema tiene su propia secuencia de 30 pasos "
        "y una meta verificable; los pasos comunes marcan la progresión didáctica, mientras que "
        "la práctica, errores, herramienta, integración y entregable se adaptan a cada tema.",
        "",
        "También están disponibles dentro de la aplicación web en la ruta `/roadmaps`, con navegación "
        "por bloques y temas y progreso de pasos guardado en este navegador.",
        "",
        "| Bloque | Temas | Roadmaps |",
        "|---|---|---:|",
    ]
    topic_count = 0
    for number, block in enumerate(REVISED_BLOCKS, start=1):
        first, last = topic_count + 1, topic_count + len(block.topics)
        lines.append(
            f"| {number}. {block.title} | {first}–{last} | "
            f"[Abrir roadmap](./{block.slug}.md) ({len(block.topics)}) |"
        )
        topic_count = last
    lines.extend([
        "",
        f"**Total: {topic_count} temas, {topic_count * 30:,} pasos individualizados.**",
        "",
        "## Uso recomendado",
        "",
        "Los [exámenes integradores por bloque](./evaluaciones.md) proponen una práctica verificable "
        "por tema y una rúbrica común; el examen final integra las 20 áreas en RutaFlow.",
        "",
        "1. Empieza por los pasos 1–10 del tema elegido y reserva tiempo para ejecutar, no solo leer.",
        "2. Conserva evidencias: código, pruebas, mediciones, diagramas, decisiones o notas de laboratorio.",
        "3. Avanza a pasos 11–20 cuando puedas explicar el modelo y resolver el ejercicio inicial sin copiar.",
        "4. Avanza a pasos 21–30 cuando diagnostiques fallos, compares alternativas y puedas integrar el tema.",
        "5. Trata la meta como un objetivo de práctica deliberada, no como promesa de expertise instantáneo.",
        "",
        "## Modo intensivo sin saltarse la práctica",
        "",
        "Trabaja en sesiones enfocadas de 60–90 minutos. Lee únicamente lo necesario para ejecutar el paso actual; "
        "al final, cierra la guía y reconstruye la idea de memoria, revisa el error que más enseñó y guarda evidencia. "
        "Si ya demuestras un paso con un artefacto y una explicación, márcalo y sigue: no repitas contenido que ya "
        "dominas. Reserva los pasos de prueba, fallos y revisión; eliminarlos acelera la lectura, pero no el aprendizaje.",
        "",
        "Las etapas se adaptan a cada dominio: un circuito usa simulación y medición; una API usa contratos y tests; "
        "una habilidad profesional produce decisiones y evidencia de colaboración. No se inventan circuitos "
        "del PDF ausente: los ejercicios eléctricos se identifican como ejemplos didácticos equivalentes.",
        "",
    ])
    return "\n".join(lines)


def render_web_index() -> str:
    blocks = []
    topic_number = 1
    for number, block in enumerate(REVISED_BLOCKS, start=1):
        topics = [
            {"number": topic_number + offset, "title": topic.title}
            for offset, topic in enumerate(block.topics)
        ]
        blocks.append({
            "number": number,
            "slug": block.slug,
            "title": block.title,
            "topics": topics,
        })
        topic_number += len(block.topics)
    return json.dumps(
        {"totalTopics": topic_number - 1, "totalSteps": (topic_number - 1) * 30, "blocks": blocks},
        ensure_ascii=False,
        indent=2,
    ) + "\n"


def render_assessments() -> str:
    lines = [
        "# Exámenes integradores y proyecto final",
        "",
        "Este cuaderno acompaña los roadmaps de 30 pasos. Cada bloque termina con una evaluación "
        "práctica; no es un examen de memoria: entrega código, pruebas, mediciones, diagramas o "
        "decisiones reproducibles según el tema.",
        "",
        "## Rúbrica por tema",
        "",
        "Puntúa cada criterio de 0 a 3: **0** sin evidencia; **1** con ayuda o con defectos importantes; "
        "**2** correcto en el caso normal y sus límites; **3** correcto, reproducible y defendido con "
        "evidencia. Cuatro criterios suman 12 puntos. Aprobación sugerida: 9/12, sin obtener 0 en "
        "corrección ni en diagnóstico. Repite únicamente la parte que no alcance el criterio.",
        "",
    ]
    for block_number, block in enumerate(REVISED_BLOCKS, start=1):
        lines.extend([
            f"## Bloque {block_number}: {block.title}",
            "",
            f"**Caso integrador:** {block.topics[0].scenario}. Entrega un incremento que use "
            f"{block.topics[0].focus} y alcance «{block.topics[-1].deliverable}».",
            "",
        ])
        for topic_number, topic in enumerate(block.topics, start=1):
            lines.extend([
                f"### Reto {block_number}.{topic_number}: {topic.title}",
                "",
                f"1. **Construye:** resuelve {topic.practice} para el escenario «{topic.scenario}».",
                f"2. **Diagnostica:** reproduce «{topic.pitfall}», explica la causa y demuestra la corrección.",
                f"3. **Justifica:** muestra cómo {topic.focus} se conecta con {topic.bridge}; compara una alternativa.",
                f"4. **Entrega:** presenta {topic.deliverable}, sus pruebas y las fuentes consultadas: {topic.source}.",
                "",
            ])
        lines.extend([
            "**Cierre del bloque:** ejecuta una revisión integrada de los retos, registra dependencias "
            "entre entregables y describe un fallo que atraviese más de un tema.",
            "",
        ])
    lines.extend([
        "## Proyecto final: RutaFlow",
        "",
        "Construye por cortes verticales una plataforma demostrable de seguimiento de envíos. El "
        "proyecto debe conectar una aplicación móvil, API Spring Boot, persistencia con consulta "
        "espacial, publicación de eventos Kafka, cliente web, automatización QA y despliegue local.",
        "",
        "### Entregables obligatorios",
        "",
        "1. **Contrato y arquitectura:** diagrama C4/flujo, límites de dominio, API versionada, ADR "
        "monolito modular frente a microservicios y dirección de dependencias.",
        "2. **Flujo funcional:** crear envío, validar ubicación, persistirla, consultar historial y "
        "notificar un cambio de estado a un cliente.",
        "3. **Datos y eventos:** migraciones, estrategia LAZY/fetch plan por caso de uso, evento con "
        "clave estable, consumidor idempotente, Outbox explicado y manejo demostrable de duplicado/DLT.",
        "4. **Seguridad y calidad:** autenticación/autorización, datos de prueba, pruebas unitarias, "
        "integración, contrato y colección ejecutable en CI; no subir secretos.",
        "5. **Operación:** Docker Compose local, health/readiness, logs correlacionados, métricas, "
        "trazas, backup/restore probado y procedimiento documentado de recuperación.",
        "6. **Evidencia:** instrucciones de arranque desde una copia limpia, comandos, salidas "
        "esperadas, fallos deliberados, resultados medidos, límites conocidos y demo grabable.",
        "",
        "### Rúbrica final",
        "",
        "| Criterio | Evidencia mínima |",
        "|---|---|",
        "| Corrección | El flujo completo funciona; validaciones y transiciones inválidas tienen pruebas. |",
        "| Diseño | Los límites y patrones resuelven necesidades demostradas y explican cuándo no aplicarlos. |",
        "| Resiliencia | Reintento, duplicado, indisponibilidad y recuperación se prueban sin éxito silencioso. |",
        "| Seguridad y privacidad | Permisos comprobados, secretos fuera del repositorio y datos sensibles redactados. |",
        "| Operabilidad | Build repetible, CI, observabilidad, backup/restore y guía de respuesta verificables. |",
        "| Aprendizaje | La persona puede reconstruir decisiones, diagnosticar un fallo y enseñar la solución. |",
        "",
        "La puntuación final se calcula con la rúbrica de seis criterios (0–3 cada uno). Para aprobar "
        "se requieren 14/18 puntos y al menos 2 en corrección, seguridad y operabilidad. Un entregable "
        "no demostrado no se sustituye por una explicación de lo que se habría hecho.",
        "",
    ])
    return "\n".join(lines)


def expected_content() -> dict[Path, str]:
    generated = {
        OUTPUT / "README.md": render_index(),
        OUTPUT / "evaluaciones.md": render_assessments(),
        WEB_OUTPUT / "index.json": render_web_index(),
    }
    for number, block in enumerate(REVISED_BLOCKS, start=1):
        content = render_block(block, number)
        path = OUTPUT / f"{block.slug}.md"
        generated[path] = content
        generated[WEB_OUTPUT / f"{block.slug}.md"] = content
    return generated


def validate(paths: list[Path]) -> None:
    assessment = (OUTPUT / "evaluaciones.md").read_text(encoding="utf-8")
    block_exams = re.findall(r"^## Bloque \d+:", assessment, flags=re.MULTILINE)
    topic_challenges = re.findall(r"^### Reto \d+\.\d+:", assessment, flags=re.MULTILINE)
    if len(block_exams) != 20 or len(topic_challenges) != 53:
        raise SystemExit(
            f"Evaluaciones incompletas: {len(block_exams)} bloques y {len(topic_challenges)} retos"
        )
    if "## Proyecto final: RutaFlow" not in assessment:
        raise SystemExit("Falta la evaluación final del proyecto RutaFlow.")

    topic_total = step_total = 0
    block_paths = [
        path for path in paths
        if path.parent == OUTPUT and path.suffix == ".md" and path.name not in {"README.md", "evaluaciones.md"}
    ]
    for path in block_paths:
        text = path.read_text(encoding="utf-8")
        topic_sections = re.findall(r"^## Tema \d+:", text, flags=re.MULTILINE)
        steps = re.findall(r"^- \[ \] \*\*Paso \d+\.\*\*", text, flags=re.MULTILINE)
        expected_steps = len(topic_sections) * 30
        if len(steps) != expected_steps:
            raise SystemExit(f"{path.relative_to(ROOT)}: se esperaban {expected_steps} pasos, hay {len(steps)}")
        for section in re.split(r"(?=^## Tema \d+:)", text, flags=re.MULTILINE)[1:]:
            section_steps = re.findall(r"^- \[ \] \*\*Paso (\d+)\.\*\*", section, flags=re.MULTILINE)
            if section_steps != [str(number) for number in range(1, 31)]:
                raise SystemExit(f"{path.relative_to(ROOT)}: secuencia de pasos inválida en {section.splitlines()[0]}")
        topic_total += len(topic_sections)
        step_total += len(steps)
    if topic_total != 53 or step_total != 1590:
        raise SystemExit(f"Inventario inválido: {topic_total} temas, {step_total} pasos")
    index = paths[0].read_text(encoding="utf-8")
    if "20 bloques" not in index or "53 temas" not in index or "1,590 pasos" not in index:
        raise SystemExit("El índice no anuncia correctamente el total.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="verifica que los roadmaps generados estén actualizados")
    args = parser.parse_args()
    if args.check:
        expected = expected_content()
        stale = [
            path.relative_to(ROOT)
            for path, content in expected.items()
            if not path.exists() or path.read_text(encoding="utf-8") != content
        ]
        if stale:
            raise SystemExit("Roadmaps desactualizados: " + ", ".join(map(str, stale)))
        obsolete = [OUTPUT / name for name in OBSOLETE_ROADMAPS if (OUTPUT / name).exists()]
        if obsolete:
            raise SystemExit("Persisten roadmaps del currículo anterior: " + ", ".join(map(str, obsolete)))
        expected_web_files = {path.name for path in expected if path.parent == WEB_OUTPUT}
        stale_web_files = [
            path for path in WEB_OUTPUT.glob("*")
            if path.is_file() and path.name not in expected_web_files
        ] if WEB_OUTPUT.exists() else []
        if stale_web_files:
            raise SystemExit("Roadmaps web obsoletos: " + ", ".join(str(path.relative_to(ROOT)) for path in stale_web_files))
        legacy_files = [
            LEGACY_WEB_OUTPUT / name
            for name in ["index.json", *(f"{block.slug}.md" for block in REVISED_BLOCKS)]
            if (LEGACY_WEB_OUTPUT / name).is_file()
        ]
        if legacy_files:
            raise SystemExit("Recursos de roadmaps en ruta web reservada: " + ", ".join(
                str(path.relative_to(ROOT)) for path in legacy_files
            ))
        validate(list(expected))
        print(f"Roadmaps OK: 53 temas, 1,590 pasos en {len(expected)} archivos.")
    else:
        expected = expected_content()
        for path, content in expected.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
        for name in OBSOLETE_ROADMAPS:
            (OUTPUT / name).unlink(missing_ok=True)
        expected_web_files = {path.name for path in expected if path.parent == WEB_OUTPUT}
        for name in ["index.json", *(f"{block.slug}.md" for block in REVISED_BLOCKS)]:
            (LEGACY_WEB_OUTPUT / name).unlink(missing_ok=True)
        if WEB_OUTPUT.exists():
            for path in WEB_OUTPUT.glob("*"):
                if path.is_file() and path.name not in expected_web_files:
                    path.unlink()
        validate(list(expected))
        print(f"Generados 53 roadmaps (1,590 pasos) para {OUTPUT.relative_to(ROOT)} y {WEB_OUTPUT.relative_to(ROOT)}.")


if __name__ == "__main__":
    main()
