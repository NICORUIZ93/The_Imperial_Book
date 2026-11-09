# Temario completo de Spring Boot — índice de expansión

> Documento vivo de cobertura. Los archivos de lección enlazados son el contenido canónico. El índice conserva todos los temas existentes; un tema sin subtemas 4-pasos sigue pendiente aunque ya tenga explicación anterior.

**Proyecto continuo:** RutaFlow: plataforma de entregas basada en servicios.
**Prerrequisito de entrada:** Java, HTTP, SQL y pruebas; los módulos iniciales vuelven a presentar cada herramienta..
**Duración objetivo:** temas de 20–45 minutos; cada tema se divide en 3–6 acciones de 5–15 minutos.
**Estado estructural:** 53/111 temas migrados; auditoría estructural actualizada el 2026-11-03.

## Índice de módulos y temas

Los enlaces abren el Markdown de lección que la aplicación publica. La etiqueta `[4 pasos]` refleja solo criterios estructurales detectados; no significa que el ejemplo se haya ejecutado ni que una revisión pedagógica humana lo haya aprobado.

### Módulo 0: Fundamentos de Spring — IoC y DI

[Abrir lección completa](../web/public/content/spring-boot/modulo-0.md)

- [4 pasos] Tema 1: Inversión de control y el contenedor de Spring
  - ✓ Subtema 1.1: Declara el contrato y la primera implementación · 10 min
  - ✓ Subtema 1.2: Deja que Spring conecte el servicio · 10 min
  - ✓ Subtema 1.3: Observa el cableado con una petición HTTP · 10 min
- [4 pasos] Tema 2: Inyección por constructor vs por campo
  - ✓ Subtema 2.1: Prueba la regla sin iniciar Spring · 10 min
  - ✓ Subtema 2.2: Observa la inyección de campo con el contexto · 10 min
  - ✓ Subtema 2.3: Elige la prueba que responde tu pregunta · 10 min
- [4 pasos] Tema 3: Estereotipos, autoconfiguración y scopes
  - ✓ Subtema 3.1: Asigna a cada estereotipo un papel claro · 10 min
  - ✓ Subtema 3.2: Inspecciona lo que aporta una dependencia · 10 min
  - ✓ Subtema 3.3: Pide un bean nuevo cuando de verdad lo necesitas · 15 min

### Módulo 1: Spring Boot CLI y estructura de proyecto

[Abrir lección completa](../web/public/content/spring-boot/modulo-1.md)

- [4 pasos] Tema 1: Spring Initializr y starters
  - ✓ Subtema 1.1: Genera el proyecto y encuentra sus piezas · 10 min
  - ✓ Subtema 1.2: Conecta el starter web con una ruta · 10 min
  - ✓ Subtema 1.3: Revisa qué agrupa el starter y quién fija versiones · 10 min
- [4 pasos] Tema 2: application.yml vs application.properties
  - ✓ Subtema 2.1: Lee una clave desde YAML · 10 min
  - ✓ Subtema 2.2: Escribe la misma clave en Properties y observa prioridad · 10 min
  - ✓ Subtema 2.3: Sobrescribe el archivo desde la terminal · 10 min
- [4 pasos] Tema 3: Perfiles y estructura por capas
  - ✓ Subtema 3.1: Combina una configuración base con un perfil · 10 min
  - ✓ Subtema 3.2: Activa el perfil y comprueba el valor aplicado · 10 min
  - ✓ Subtema 3.3: Separa HTTP, regla y acceso a datos · 15 min

### Módulo 2: REST APIs con Spring Web

[Abrir lección completa](../web/public/content/spring-boot/modulo-2.md)

- [pendiente de migrar] Tema 1: Por qué DTOs en vez de entidades directamente
  - ✓ Subtema 1.1: Crea una entidad y guárdala en H2 · 10 min
  - ✓ Subtema 1.2: Devuelve solo el contrato público · 15 min
  - pendiente Subtema 1.3: Cambia el modelo interno sin cambiar la API · 10 min
- [4 pasos] Tema 2: Validación con Bean Validation y ResponseEntity
  - ✓ Subtema 2.1: Rechaza datos inválidos antes de guardar · 10 min
  - ✓ Subtema 2.2: Devuelve 200 o 404 según exista la tarea · 15 min
  - ✓ Subtema 2.3: Comprueba las reglas con casos límite · 10 min
- [4 pasos] Tema 3: Manejo centralizado de errores con @ControllerAdvice
  - ✓ Subtema 3.1: Da un formato útil al error de validación · 15 min
  - ✓ Subtema 3.2: Convierte un ID ausente en 404 con el mismo formato · 15 min
  - ✓ Subtema 3.3: Sigue el error desde la petición hasta la respuesta · 10 min
- [4 pasos] Tema 4: Lombok y MapStruct sin exponer datos internos
  - ✓ Subtema 4.1: Genera getters durante la compilación · 10 min
  - ✓ Subtema 4.2: Genera el mapeo con MapStruct · 15 min
  - ✓ Subtema 4.3: Haz que cada campo interno nuevo exija una decisión · 10 min
- [4 pasos] Tema 5: OpenAPI con springdoc: el contrato como prueba
  - ✓ Subtema 5.1: Publica el contrato de tu API · 10 min
  - ✓ Subtema 5.2: Describe éxito y errores en cada endpoint · 15 min
  - ✓ Subtema 5.3: Evita cambios silenciosos con una prueba · 15 min
- [4 pasos] Tema 6: Paginación HTTP con validación y un límite de recursos explícito
  - ✓ Subtema 6.1: Devuelve una página desde JPA · 15 min
  - ✓ Subtema 6.2: Rechaza tamaños fuera del contrato · 15 min
  - ✓ Subtema 6.3: Comprueba el límite y el costo del paginado · 10 min

### Módulo 3: Persistencia con Spring Data JPA

[Abrir lección completa](../web/public/content/spring-boot/modulo-3.md)

- [4 pasos] Tema 1: Entidades y repositorios derivados
  - ✓ Subtema 3.1 · Guardar y recuperar una entidad · 8 min
  - ✓ Subtema 3.2 · Filtrar con el nombre del método · 10 min
  - ✓ Subtema 3.3 · Escribir JPQL cuando ayuda a leer · 10 min
- [4 pasos] Tema 2: El problema N+1 y su corrección
  - ✓ Subtema 3.4 · Relacionar clientes y pedidos y medir · 12 min
  - ✓ Subtema 3.5 · Cargar la relación con `JOIN FETCH` · 10 min
  - ✓ Subtema 3.6 · Elegir `@EntityGraph` y revisar el límite · 10 min
- [4 pasos] Tema 3: Migraciones con Flyway
  - ✓ Subtema 3.7 · Crear el esquema con V1 · 12 min
  - ✓ Subtema 3.8 · Aplicar un cambio nuevo con V2 · 10 min
  - ✓ Subtema 3.9 · Diagnosticar versiones repetidas · 8 min

### Módulo 4: Spring Security

[Abrir lección completa](../web/public/content/spring-boot/modulo-4.md)

- [4 pasos] Tema 1: SecurityFilterChain moderno
  - ✓ Subtema 4.1 · Proteger rutas del backend · 10 min
  - ✓ Subtema 4.2 · Verificar 200, 401 y usuario autenticado · 10 min
  - ✓ Subtema 4.3 · Decidir qué rutas son públicas · 10 min
- [4 pasos] Tema 2: Filtro JWT y autorización por rol
  - ✓ Subtema 4.4 · Firmar y validar un token · 10 min
  - ✓ Subtema 4.5 · Poner el filtro dentro de Spring Security · 10 min
  - ✓ Subtema 4.6 · Probar identidad, rol y firma · 10 min
- [4 pasos] Tema 3: CORS y CSRF
  - ✓ Subtema 4.7 · Permitir un origen y responder al preflight · 10 min
  - ✓ Subtema 4.8 · Llamar con el JWT y decidir CSRF · 10 min
  - ✓ Subtema 4.9 · Ajustar métodos y detectar configuraciones amplias · 10 min
- [4 pasos] Tema 4: Reducir SSRF en clientes HTTP con InetAddressFilter
  - ✓ Subtema 4.10 · Crear un RestClient con límites · 10 min
  - ✓ Subtema 4.11 · Probar destinos internos con un servidor local · 10 min
  - ✓ Subtema 4.12 · Impedir redirects y definir el límite de protección · 10 min
- [4 pasos] Tema 5: Flujo de login completo — de `/api/auth/login` a una ruta protegida
  - ✓ Subtema 4.13 · Comparar la contraseña sin guardarla en texto plano · 10 min
  - ✓ Subtema 4.14 · Usar el token en una ruta protegida · 10 min
  - ✓ Subtema 4.15 · Rechazar credenciales incorrectas · 10 min

### Módulo 5: Configuración, perfiles y manejo de errores

[Abrir lección completa](../web/public/content/spring-boot/modulo-5.md)

- [4 pasos] Tema 1: @ConfigurationProperties tipado
  - ✓ Subtema 4.16 · Agrupar la configuración JWT existente · 10 min
  - ✓ Subtema 4.17 · Probar enlace y límites con un contexto pequeño · 10 min
  - ✓ Subtema 4.18 · Inyectar el record en el JwtService · 10 min
- [pendiente de migrar] Tema 2: Fallar rápido al arranque
  - ✓ Subtema 4.19 · Probar el valor obligatorio ausente · 10 min
  - ✓ Subtema 4.20 · Rechazar también un secreto vacío · 10 min
  - pendiente Subtema 4.21 · Quitar la validación y observar el riesgo · 10 min
- [4 pasos] Tema 3: Manejo global de excepciones consistente entre entornos
  - ✓ Subtema 4.22 · Lanzar una excepción del dominio · 10 min
  - ✓ Subtema 4.23 · Extender el manejador sin cambiar el formato · 10 min
  - ✓ Subtema 4.24 · Comprobar el borde del límite con MockMvc · 10 min

### Módulo 6: Testing en Spring Boot

[Abrir lección completa](../web/public/content/spring-boot/modulo-6.md)

- [pendiente de migrar] Tema 1: Probar un controller con `@WebMvcTest`
  - pendiente Subtema 6.1 · Recortar la prueba a la web (10 min)
  - pendiente Subtema 6.2 · Ver la validación y el error JSON (10 min)
  - pendiente Subtema 6.3 · Diagnosticar una dependencia que falta (10 min)
- [pendiente de migrar] Tema 2: Probar el repositorio contra PostgreSQL con `@DataJpaTest`
  - pendiente Subtema 6.4 · Conectar el slice a un PostgreSQL desechable (10 min)
  - pendiente Subtema 6.5 · Comprobar motor y operación del repositorio (10 min)
  - pendiente Subtema 6.6 · Detectar que el test cayó en H2 (10 min)
- [pendiente de migrar] Tema 3: Integrar el flujo con `@SpringBootTest`
  - pendiente Subtema 6.7 · Crear y consultar con las capas reales (10 min)
  - pendiente Subtema 6.8 · Separar error de autenticación y flujo válido (10 min)
  - pendiente Subtema 6.9 · Ver qué integración detecta el test (10 min)

### Módulo 7: Observabilidad con Actuator

[Abrir lección completa](../web/public/content/spring-boot/modulo-7.md)

- [pendiente de migrar] Tema 1: Actuator y health checks personalizados
  - pendiente Subtema 7.1 · Registrar una dependencia y su indicador (10 min)
  - pendiente Subtema 7.2 · Comprobar `UP`, `DOWN` y acceso protegido (10 min)
  - pendiente Subtema 7.3 · Diagnosticar un estado `UP` falso (10 min)
- [pendiente de migrar] Tema 2: Contar operaciones de negocio con Micrometer
  - pendiente Subtema 7.4 · Registrar un contador en el servicio real (10 min)
  - pendiente Subtema 7.5 · Verificar valor y tag en el endpoint (10 min)
  - pendiente Subtema 7.6 · Detectar un contador que nunca sube (10 min)
- [4 pasos] Tema 3: Liveness y readiness sin reinicios en cadena
  - ✓ Subtema 7.7 · Habilitar las sondas de Spring Boot · 5 min
  - ✓ Subtema 7.8 · Revisar la dependencia solo en readiness · 10 min
  - ✓ Subtema 7.9 · Probar estados distintos y diagnosticar el error · 10 min

### Módulo 8: Mensajería — Kafka/RabbitMQ

[Abrir lección completa](../web/public/content/spring-boot/modulo-8.md)

- [4 pasos] Tema 1: Producers y consumers con Spring Kafka
  - ✓ Subtema 1.1: Publica el evento con la clave del envío · 10 min
  - ✓ Subtema 1.2: Conecta dos grupos consumidores · 10 min
  - ✓ Subtema 1.3: Comprueba orden y entrega con un broker · 15 min
- [4 pasos] Tema 2: Dead-letter queue
  - ✓ Subtema 2.1: Configura reintentos limitados y DLT · 10 min
  - ✓ Subtema 2.2: Provoca un mensaje inválido y comprueba los intentos · 10 min
  - ✓ Subtema 2.3: Ajusta la política y atiende los mensajes recuperados · 15 min
- [4 pasos] Tema 3: Transacciones Kafka y SQL: idempotencia y límites de exactly-once
  - ✓ Subtema 3.1 · Reintentar el productor sin duplicar registros de Kafka · 10 min
  - ✓ Subtema 3.2 · Guardar envío y evento en la misma transacción SQL · 15 min
  - ✓ Subtema 3.3 · Procesar un `eventId` repetido sin duplicar el efecto · 15 min
  - ✓ Subtema 3.4 · Leer solo registros confirmados de una transacción Kafka · 10 min
- [pendiente de migrar] Tema 4: Rebalanceo de consumer groups y asignación de particiones
  - pendiente Subtema 4.1 · Una partición pertenece a un consumer del grupo · 10 min
  - pendiente Subtema 4.2 · Mantener el estado local con callbacks reales · 10 min
  - pendiente Subtema 4.3 · Ver el rebalanceo al entrar el segundo consumer · 15 min
  - pendiente Subtema 4.4 · Usar membresía estática solo para reinicios breves · 10 min
- [pendiente de migrar] Tema 5: Kafka frente a RabbitMQ
  - pendiente Subtema 5.1 · Repartir mensajes o dar una copia a cada grupo · 10 min
  - pendiente Subtema 5.2 · Releer historial o conservar mensajes pendientes · 10 min
  - ✓ Subtema 5.3 · Distinguir confirmación de publicación y confirmación de consumo · 10 min
  - ✓ Subtema 5.4 · Elegir por el flujo y comprobar ambos binders · 15 min
- [pendiente de migrar] Tema 6: Spring Cloud Stream y binders de Kafka/RabbitMQ
  - pendiente Subtema 6.1 · Recorrer la función y los destinos reales · 10 min
  - ✓ Subtema 6.2 · Cambiar el binder sin cambiar la función · 10 min
  - pendiente Subtema 6.3 · Rechazar una entrada y ubicar la política de reintento · 10 min
  - pendiente Subtema 6.4 · Probar en memoria y después contra el broker · 15 min
- [pendiente de migrar] Tema 7: Kafka Streams con Spring para transformar eventos
  - pendiente Subtema 7.1 · Filtrar sin cambiar la clave del pedido · 10 min
  - pendiente Subtema 7.2 · Contar por estado dentro de una ventana · 15 min
  - pendiente Subtema 7.3 · Probar la topología sin confundirla con el clúster · 10 min
  - pendiente Subtema 7.4 · Configurar Spring y el application.id · 15 min
- [pendiente de migrar] Tema 8: Avro y Schema Registry para contratos de eventos
  - pendiente Subtema 8.1 · Definir el evento en un archivo Avro · 10 min
  - pendiente Subtema 8.2 · Añadir un campo compatible con registros anteriores · 15 min
  - pendiente Subtema 8.3 · Serializar usando un Registry de prueba en memoria · 10 min
  - ✓ Subtema 8.4 · Registrar versiones y consultar compatibilidad real · 15 min
- [4 pasos] Tema 9: RabbitMQ con Spring AMQP: routing, ack y prefetch
  - ✓ Subtema 9.1 · Declarar exchange, cola, binding y DLQ · 10 min
  - ✓ Subtema 9.2 · Publicar y distinguir confirm de return · 10 min
  - ✓ Subtema 9.3 · Confirmar después del trabajo y mandar fallos permanentes a DLQ · 10 min
  - ✓ Subtema 9.4 · Limitar entregas en vuelo con prefetch · 10 min

### Módulo 9: Programación reactiva con WebFlux

[Abrir lección completa](../web/public/content/spring-boot/modulo-9.md)

- [4 pasos] Tema 1: Mono y Flux
  - ✓ Subtema 1.1 · Elegir entre un resultado y una secuencia · 10 min
  - ✓ Subtema 1.2 · Diferenciar vacío, valor y error · 10 min
  - ✓ Subtema 1.3 · Ver cuándo se calcula un valor · 10 min
  - ✓ Subtema 1.4 · Pedir una secuencia por partes · 10 min
- [4 pasos] Tema 2: WebClient y composición no bloqueante
  - ✓ Subtema 2.1 · Configurar WebClient para un servicio externo · 10 min
  - ✓ Subtema 2.2 · Encadenar dos llamadas dependientes · 10 min
  - ✓ Subtema 2.3 · Dejar que el estado HTTP llegue como error reactivo · 10 min
  - ✓ Subtema 2.4 · Poner un límite a la espera · 10 min
- [4 pasos] Tema 3: Cuándo WebFlux vale la complejidad, y R2DBC
  - ✓ Subtema 3.1 · Elegir el modelo por las dependencias · 10 min
  - ✓ Subtema 3.2 · Ver el bloqueo que Reactor sí puede detectar · 10 min
  - ✓ Subtema 3.3 · Mantener la consulta SQL reactiva con R2DBC · 10 min
  - ✓ Subtema 3.4 · Aislar una operación bloqueante que aún no puedes reemplazar · 10 min

### Módulo 10: Microservicios con Spring Cloud

[Abrir lección completa](../web/public/content/spring-boot/modulo-10.md)

- [4 pasos] Tema 1: Config Server y service discovery
  - ✓ Subtema 1.1: Sirve configuración desde archivos · 15 min
  - ✓ Subtema 1.2: Separa configuración por perfil y diagnostica una app desconocida · 10 min
  - ✓ Subtema 1.3: Resuelve una instancia por nombre lógico · 10 min
- [4 pasos] Tema 2: Spring Cloud Gateway
  - ✓ Subtema 2.1: Crea una ruta para pedidos · 15 min
  - ✓ Subtema 2.2: Cambia el path que recibe el servicio · 10 min
  - ✓ Subtema 2.3: Diagnostica una ruta que no coincide · 10 min
- [4 pasos] Tema 3: Circuit breaker con Resilience4j
  - ✓ Subtema 3.1: Abre el circuito después de cuatro fallos · 10 min
  - ✓ Subtema 3.2: Comprueba que OPEN detiene llamadas reales · 10 min
  - ✓ Subtema 3.3: Prueba recuperación en HALF_OPEN · 10 min
- [4 pasos] Tema 4: OAuth2/OIDC, Keycloak y Token Relay sin perder la frontera de autorización
  - ✓ Subtema 4.1: Valida el emisor del token · 15 min
  - ✓ Subtema 4.2: Separa token válido de permiso de escritura · 10 min
  - ✓ Subtema 4.3: Comprueba que el pedido pertenece al sujeto del token · 10 min
  - ✓ Subtema 4.4: Reenvía el access token desde el Gateway · 10 min
- [pendiente de migrar] Tema 5: HTTP Interfaces, deadlines y descubrimiento según el entorno
  - pendiente Subtema 5.1: Declara el contrato HTTP · 10 min
  - pendiente Subtema 5.2: Corta la espera de una respuesta lenta · 15 min
  - pendiente Subtema 5.3: Resuelve el nombre del servicio por entorno · 10 min
  - pendiente Subtema 5.4: Ajusta el cliente al presupuesto de la operación · 5 min
- [pendiente de migrar] Tema 6: Spring gRPC, contrato HTTP/2 y evolución segura
  - pendiente Subtema 6.1: Define el mensaje y el método remoto · 10 min
  - pendiente Subtema 6.2: Expón la implementación en Spring · 10 min
  - pendiente Subtema 6.3: Llama el stub por el canal · 10 min
  - pendiente Subtema 6.4: Cambia el contrato sin romper datos · 10 min
- [pendiente de migrar] Tema 7: DDD para decidir límites y propiedad de datos
  - pendiente Subtema 7.1: Encuentra quién es dueño de la regla · 10 min
  - pendiente Subtema 7.2: Prueba la invariante sin infraestructura · 10 min
  - pendiente Subtema 7.3: Evita compartir almacenamiento entre contextos · 5 min
  - pendiente Subtema 7.4: Decide si separar el despliegue · 10 min
- [4 pasos] Tema 8: Orquestar pedidos con Temporal y Spring Boot
  - ✓ Subtema 8.1: Separa el plan de los efectos · 10 min
  - ✓ Subtema 8.2: Registra Workers y código Spring · 10 min
  - ✓ Subtema 8.3: Reintenta un error transitorio · 10 min
  - ✓ Subtema 8.4: Compensa solo lo que ya ocurrió · 15 min
- [4 pasos] Tema 9: Comprueba módulos antes de separar servicios
  - ✓ Subtema 9.1: Traza las dependencias de paquetes · 10 min
  - ✓ Subtema 9.2: Haz que la arquitectura falle cuando se cruza un límite · 10 min
  - ✓ Subtema 9.3: Define el evento público del módulo · 10 min
  - ✓ Subtema 9.4: Comprueba la interacción entre módulos · 15 min
- [4 pasos] Tema 10: Spring Cloud Bus para propagar cambios de configuración
  - ✓ Subtema 10.1: Arranca el broker y revisa las dependencias · 8 min
  - ✓ Subtema 10.2: Levanta dos instancias con identidades distintas · 8 min
  - ✓ Subtema 10.3: Propaga un valor y refresca el bean · 12 min
  - ✓ Subtema 10.4: Diagnostica propagación y limita el endpoint · 10 min
- [4 pasos] Tema 11: Micrometer Tracing entre servicios
  - ✓ Subtema 11.1: Arranca Jaeger y conoce el rastro · 8 min
  - ✓ Subtema 11.2: Sigue una petición HTTP entre procesos · 12 min
  - ✓ Subtema 11.3: Encuentra la traza común y un span de negocio · 12 min
  - ✓ Subtema 11.4: Ajusta sampling y cuida lo que exportas · 10 min
- [4 pasos] Tema 12: Contract testing entre productor y consumidor
  - ✓ Subtema 12.1: Define la respuesta pública que necesita Pedidos · 8 min
  - ✓ Subtema 12.2: Ejecuta la prueba que genera el contrato · 10 min
  - ✓ Subtema 12.3: Usa el stub desde el cliente de Pedidos · 12 min
  - ✓ Subtema 12.4: Detecta una rotura y define publicación · 10 min

### Módulo 11: Empaquetado y despliegue

[Abrir lección completa](../web/public/content/spring-boot/modulo-11.md)

- [4 pasos] Tema 1: Fat JAR vs capas de Docker
  - ✓ Subtema 1.1: Mira qué contiene el JAR · 8 min
  - ✓ Subtema 1.2: Pide a Spring Boot el mapa de capas · 10 min
  - ✓ Subtema 1.3: Extrae y copia las capas en el orden correcto · 12 min
  - ✓ Subtema 1.4: Comprueba qué se reutiliza y diagnostica una capa faltante · 10 min
- [4 pasos] Tema 2: GraalVM native image
  - ✓ Subtema 2.1: Distingue AOT de un binario nativo · 10 min
  - ✓ Subtema 2.2: Registra un recurso dinámico para Native Image · 12 min
  - ✓ Subtema 2.3: Construye el ejecutable nativo · 12 min
  - ✓ Subtema 2.4: Ejecuta y compara con JVM · 15 min
- [4 pasos] Tema 3: Health checks para Kubernetes
  - ✓ Subtema 3.1: Enciende los probes de Spring · 8 min
  - ✓ Subtema 3.2: Distingue vivo de listo para tráfico · 10 min
  - ✓ Subtema 3.3: Conecta Actuator con el Deployment · 12 min
  - ✓ Subtema 3.4: Evita reinicios en cascada · 10 min

### Módulo 12: Proyecto integrador — microservicio productivo

[Abrir lección completa](../web/public/content/spring-boot/modulo-12.md)

- [4 pasos] Tema 1: Arquitectura del microservicio integrador
  - ✓ Subtema 12.1.1: Sigue una petición por las capas · 8 min
  - ✓ Subtema 12.1.2: Deja que Flyway cree la tabla · 10 min
  - ✓ Subtema 12.1.3: Valida la solicitud antes de guardar · 10 min
  - ✓ Subtema 12.1.4: Comprueba HTTP y PostgreSQL juntos · 12 min
- [4 pasos] Tema 2: Integra seguridad JWT y observabilidad
  - ✓ Subtema 12.2.1: Verifica un JWT firmado · 10 min
  - ✓ Subtema 12.2.2: Distingue identidad de permiso · 10 min
  - ✓ Subtema 12.2.3: Cuenta solo las entregas guardadas · 10 min
  - ✓ Subtema 12.2.4: Consulta la métrica sin abrirla a todos · 10 min
- [4 pasos] Tema 3: Cierra el servicio con evidencia y próximos pasos
  - ✓ Subtema 12.3.1: Protege la migración con una prueba de configuración · 8 min
  - ✓ Subtema 12.3.2: Comprueba el flujo integrado completo · 10 min
  - ✓ Subtema 12.3.3: Declara lo que todavía falta para desplegar · 8 min
  - ✓ Subtema 12.3.4: Deja una ruta técnica para el siguiente nivel · 8 min

### Módulo 13: Consistencia, contratos y operación distribuida

[Abrir lección completa](../web/public/content/spring-boot/modulo-13.md)

- [4 pasos] Tema 1: `@Transactional` funciona en una frontera, no como encantamiento
  - ✓ Subtema 13.1.1: Detecta la transacción al entrar por el proxy · 8 min
  - ✓ Subtema 13.1.2: Observa una llamada interna con `this` · 8 min
  - ✓ Subtema 13.1.3: Corrige el límite extrayendo otro bean · 10 min
  - ✓ Subtema 13.1.4: Comprueba la frontera antes de añadir escrituras · 8 min
- [4 pasos] Tema 2: Recuperación implica duplicación segura
  - ✓ Subtema 13.2.1: Deja que la base imponga la clave única · 8 min
  - ✓ Subtema 13.2.2: Registra un intento sin lanzar una excepción · 8 min
  - ✓ Subtema 13.2.3: Fuerza una carrera entre dos solicitudes · 10 min
  - ✓ Subtema 13.2.4: Separa reintentos HTTP de reenvíos Kafka · 10 min
- [pendiente de migrar] Tema 3: Contratos ejecutables protegen despliegues independientes
  - pendiente Subtema 13.3.1: Lee la respuesta que recibe la app · 8 min
  - pendiente Subtema 13.3.2: Fija nombres y valores que usa el cliente · 8 min
  - pendiente Subtema 13.3.3: Comprueba el error que ve el consumidor · 8 min
  - pendiente Subtema 13.3.4: Protege cambios entre despliegues · 10 min
- [pendiente de migrar] Tema 4: Observabilidad sirve a un objetivo y a una decisión
  - pendiente Subtema 13.4.1: Instrumenta el trabajo de negocio · 8 min
  - pendiente Subtema 13.4.2: Sigue una solicitud entre servicios · 10 min
  - pendiente Subtema 13.4.3: Mantén las etiquetas de métricas acotadas · 8 min
  - pendiente Subtema 13.4.4: Convierte la señal en una decisión · 10 min

### Módulo 14: Backend de entregas: MySQL espacial, archivos y tiempo real

[Abrir lección completa](../web/public/content/spring-boot/modulo-14.md)

- [pendiente de migrar] Tema 1: CRUD API y contratos
  - pendiente Subtema 14.1.1: Modela estados que sí existen · 8 min
  - pendiente Subtema 14.1.2: Devuelve un contrato público pequeño · 8 min
  - pendiente Subtema 14.1.3: Cancela sin destruir el historial · 10 min
  - pendiente Subtema 14.1.4: Repite DELETE sin cambiar el resultado · 8 min
- [pendiente de migrar] Tema 2: MySQL y datos espaciales
  - pendiente Subtema 14.2.1: Guarda puntos con un SRID fijo · 8 min
  - pendiente Subtema 14.2.2: Especifica cómo leer latitud y longitud · 10 min
  - pendiente Subtema 14.2.3: Comprueba el índice con EXPLAIN · 8 min
  - pendiente Subtema 14.2.4: Separa candidatos cercanos de una ruta · 8 min
- [pendiente de migrar] Tema 3: JPA e Hibernate Spatial
  - pendiente Subtema 14.3.1: Crea un punto Java con el SRID correcto · 8 min
  - pendiente Subtema 14.3.2: Mapea Point al campo de la entidad · 8 min
  - pendiente Subtema 14.3.3: Detecta dos escrituras sobre versiones distintas · 10 min
  - pendiente Subtema 14.3.4: Observa la pérdida si quitas @Version · 8 min
- [pendiente de migrar] Tema 4: JWT Bearer y autorización por roles
  - pendiente Subtema 14.4.1: Verifica el Bearer firmado · 8 min
  - pendiente Subtema 14.4.2: Distingue autenticación de rol · 8 min
  - pendiente Subtema 14.4.3: Comprueba que el recurso pertenece al subject · 10 min
  - pendiente Subtema 14.4.4: Reproduce y corrige acceso horizontal · 8 min
- [pendiente de migrar] Tema 5: Tiempo real con STOMP
  - pendiente Subtema 14.5.1: Abre la conexión y define destinos · 8 min
  - pendiente Subtema 14.5.2: Suscríbete y recibe una posición · 10 min
  - pendiente Subtema 14.5.3: Evita procesar dos veces la misma secuencia · 8 min
  - pendiente Subtema 14.5.4: Diagnostica destinos y límites de producción · 10 min
- [pendiente de migrar] Tema 6: Archivos y notificaciones push
  - pendiente Subtema 14.6.1: Recibe el archivo con límites · 8 min
  - pendiente Subtema 14.6.2: Comprueba el contenido de la imagen · 10 min
  - pendiente Subtema 14.6.3: Notifica solo tras guardar · 10 min
  - pendiente Subtema 14.6.4: Traza el archivo y define qué falta · 8 min

### Módulo 15: Spring Master: hexagonal, reactivo y microservicios

[Abrir lección completa](../web/public/content/spring-boot/modulo-15.md)

- [pendiente de migrar] Tema 1: Backpressure real en WebFlux con reactor-test
  - pendiente Subtema 15.1.1: Empieza con cero solicitudes · 8 min
  - pendiente Subtema 15.1.2: Solicita tres y luego siete · 8 min
  - pendiente Subtema 15.1.3: Mira la demanda sin límite · 8 min
  - pendiente Subtema 15.1.4: Observa cómo `limitRate` cambia las tandas · 10 min
- [pendiente de migrar] Tema 2: Contenedores Testcontainers reutilizados entre clases
  - pendiente Subtema 15.2.1: Arranca el singleton una sola vez · 8 min
  - pendiente Subtema 15.2.2: Comprueba la base desde cada clase · 8 min
  - pendiente Subtema 15.2.3: Aísla los datos compartidos · 8 min
  - pendiente Subtema 15.2.4: Decide si conviene compartir · 8 min
- [pendiente de migrar] Tema 3: Arquitectura hexagonal verificada con ArchUnit
  - pendiente Subtema 15.3.1: Ubica el puerto y el adaptador · 8 min
  - pendiente Subtema 15.3.2: Escribe la regla sobre el bytecode · 8 min
  - pendiente Subtema 15.3.3: Protege también el caso de uso · 8 min
  - pendiente Subtema 15.3.4: Decide qué reglas merece mantener · 8 min
- [pendiente de migrar] Tema 4: Bulkhead y RateLimiter de Resilience4j
  - pendiente Subtema 15.4.1: Separa concurrencia de ritmo · 8 min
  - pendiente Subtema 15.4.2: Mantén la llamada dentro del Bulkhead · 8 min
  - pendiente Subtema 15.4.3: Cuenta permisos por período · 8 min
  - pendiente Subtema 15.4.4: Decide el límite y observa sus fronteras · 8 min
- [pendiente de migrar] Tema 5: Saga con compensación real
- [pendiente de migrar] Tema 6: Event Sourcing con replay real
- [pendiente de migrar] Tema 7: Compensación que falla: conservar trabajo pendiente y reintentar sin duplicar
- [pendiente de migrar] Tema 8: Clean Architecture y DDD táctico: caso de uso antes que framework

### Módulo 16: JPA de Spring Boot — Hibernate, Lazy vs Eager y N+1

[Abrir lección completa](../web/public/content/spring-boot/modulo-16.md)

- [pendiente de migrar] Tema 1: Relaciones, lado propietario y ciclo de vida
- [pendiente de migrar] Tema 2: LAZY, EAGER, N+1 y consultas de caso de uso

### Módulo 17: JDBC, DAO y transacciones en Spring Boot

[Abrir lección completa](../web/public/content/spring-boot/modulo-17.md)

- [pendiente de migrar] Tema 1: DataSource, JdbcTemplate y DAO
- [pendiente de migrar] Tema 2: `@Transactional`, rollback y límites de transacción

### Módulo 18: Autenticación y backend seguro con Spring Security

[Abrir lección completa](../web/public/content/spring-boot/modulo-18.md)

- [pendiente de migrar] Tema 1: SecurityFilterChain y autorización
- [pendiente de migrar] Tema 2: DTO validation, CORS, JWT/OIDC y clientes HTTP

### Módulo 19: Spring Batch — jobs, chunks y procesamiento masivo

[Abrir lección completa](../web/public/content/spring-boot/modulo-19.md)

- [pendiente de migrar] Tema 1: Job, Step, Tasklet y chunk processing
- [pendiente de migrar] Tema 2: Reinicio, JobParameters, retry, skip y listeners

### Módulo 20: Integraciones Spring — scheduling, eventos, correo y caché

[Abrir lección completa](../web/public/content/spring-boot/modulo-20.md)

- [pendiente de migrar] Tema 1: Scheduling y tareas periódicas
- [pendiente de migrar] Tema 2: Eventos locales, eventos transaccionales y mensajería
- [pendiente de migrar] Tema 3: Correo con Spring Mail y entrega recuperable
- [pendiente de migrar] Tema 4: Caché con Spring Cache, Caffeine y Redis
- [pendiente de migrar] Tema 5: @Async y ejecutores: trabajo en segundo plano con límites
- [pendiente de migrar] Tema complementario: Integraciones empresariales, SOAP y fronteras de protocolo
- [pendiente de migrar] Tema 6: Spring AI: ChatClient y herramientas con autorización fuera del modelo
- [pendiente de migrar] Tema 7: RAG desde la frontera de datos: recuperar evidencia autorizada antes de generar

### Módulo 21: Eventos con Spring Kafka

[Abrir lección completa](../web/public/content/spring-boot/modulo-21.md)

- [4 pasos] Tema 1: Productor, tópico, key y consumidor
  - ✓ Subtema 1.1 · Publica el evento con la key del envío · 8 min
  - ✓ Subtema 1.2 · Recibe el evento en dos grupos · 8 min
  - ✓ Subtema 1.3 · Comprueba partición y orden · 9 min
- [4 pasos] Tema 2: Reintentos, DLT, entrega al menos una vez e idempotencia
  - ✓ Subtema 2.1 · Limita reintentos y guarda en DLT · 10 min
  - ✓ Subtema 2.2 · Evita aplicar el mismo evento dos veces · 10 min
  - ✓ Subtema 2.3 · Revierte inbox y proyección juntas · 10 min
- [4 pasos] Tema 3: Outbox transaccional y flujo de negocio
  - ✓ Subtema 3.1 · Guarda envío y evento en una transacción · 10 min
  - ✓ Subtema 3.2 · Publica y marca después del ack · 10 min
  - ✓ Subtema 3.3 · Reproduce el envío y comprueba deduplicación · 10 min

### Módulo 22: Arquitectura: puertos, C4 y decisiones

[Abrir lección completa](../web/public/content/spring-boot/modulo-22.md)

- [pendiente de migrar] Tema 1: Hexagonal: puertos que hablan el idioma del dominio
- [pendiente de migrar] Tema 2: C4: contexto, contenedores, componentes y código
- [pendiente de migrar] Tema 3: ADR: decisiones con contexto, alternativas y consecuencias

### Módulo 23: Spring Modulith y límites del monolito modular

[Abrir lección completa](../web/public/content/spring-boot/modulo-23.md)

- [pendiente de migrar] Tema 1: módulos y límites entre paquetes
- [pendiente de migrar] Tema 2: eventos entre módulos sin importar implementación
- [pendiente de migrar] Tema 3: documentación generada y mapa de dependencias
- [pendiente de migrar] Tema 4: pruebas de integración por módulo

### Módulo 24: Spring GraphQL para pedidos y entregas

[Abrir lección completa](../web/public/content/spring-boot/modulo-24.md)

- [pendiente de migrar] Tema 1: schema-first con tipos y consultas
- [pendiente de migrar] Tema 2: data fetchers, relaciones y problema N+1
- [pendiente de migrar] Tema 3: mutations y subscriptions
- [pendiente de migrar] Tema 4: pruebas GraphQL con GraphQlTester

### Módulo 25: La misma función con Kafka y RabbitMQ

[Abrir lección completa](../web/public/content/spring-boot/modulo-25.md)

- [4 pasos] Tema 1: bindings y destinations
  - ✓ Subtema 1.1: Transforma un envío en una ruta · 8 min
  - ✓ Subtema 1.2: Conecta la función a destinos · 8 min
  - ✓ Subtema 1.3: Rechaza una entrada incompleta · 9 min
- [4 pasos] Tema 2: binder Kafka y binder RabbitMQ
  - ✓ Subtema 2.1: Publica y consume con Kafka · 10 min
  - ✓ Subtema 2.2: Publica y consume con RabbitMQ · 10 min
  - ✓ Subtema 2.3: Compara lo que realmente cambia · 10 min
- [4 pasos] Tema 3: reintentos, error handler y dead-letter
  - ✓ Subtema 3.1: Limita los reintentos en Kafka · 10 min
  - ✓ Subtema 3.2: Declara DLQ en RabbitMQ · 10 min
  - ✓ Subtema 3.3: Distingue fallo transitorio de dato inválido · 10 min
- [4 pasos] Tema 4: test binder y límites de la prueba
  - ✓ Subtema 4.1: Verifica mapping en memoria · 8 min
  - ✓ Subtema 4.2: Comprueba una entrada inválida · 8 min
  - ✓ Subtema 4.3: Separa prueba local y broker real · 9 min

## Comparación de cobertura con fuentes de referencia

La tabla registra presencia de áreas en el inventario del track, no profundidad profesional. La columna de migración usa la auditoría automática de estructura; los temas pendientes requieren revisión de contenidos, ejemplos y fuentes antes de declarar el curso exhaustivo.

| Área de referencia | Módulos del inventario | Estado de contenido | Estado de cuatro pasos |
|---|---|---|---|
| IoC, beans, configuración, AOP y starters | M0–M1, M5 | Inventariada; revisión temática manual pendiente | Migración parcial |
| REST, MVC, validación y documentación | M2, M17 | Inventariada; revisión temática manual pendiente | Migración parcial |
| JDBC, JPA, transacciones y migraciones | M3, M13, M16–M17 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Seguridad, autenticación y autorización | M4, M18 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Pruebas, observabilidad y Actuator | M6–M7 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Kafka, eventos, entrega e idempotencia | M8, M13–M15, M21 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Microservicios, Spring Cloud y resiliencia | M10, M20–M22, M25 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Batch, GraphQL, Modulith y empaquetado | M9, M11–M12, M19, M23–M24 | Inventariada; revisión temática manual pendiente | Migración parcial |

### Fuentes consultadas

- [roadmap.sh Spring Boot](https://roadmap.sh/spring-boot)
- [Spring Boot Reference](https://docs.spring.io/spring-boot/reference/)
- [Spring Cloud Stream Reference](https://docs.spring.io/spring-cloud-stream/reference/)

### Huecos y límites reportados

- El repositorio contiene 111 temas en 26 módulos; 53 cumplen hoy los marcadores estructurales de 3–6 subtemas y cuatro pasos.
- No hay base para afirmar que el track esté completo: la comparación con la fuente de referencia está pendiente de revisión humana módulo por módulo.
- Los elementos de la fuente que todavía deben verificarse de forma explícita están enumerados en la tabla anterior; cualquier técnica crítica que no tenga tema propio debe añadirse conservando el currículo base.
- La ejecución de ejemplos, el comportamiento con brokers/plataformas reales y la calidad pedagógica humana se registran por separado.

## Proyecto integrador y hito final

Evoluciona el proyecto **RutaFlow: plataforma de entregas basada en servicios** a través de los módulos. Al cerrar cada módulo, conserva el código, salida esperada, fallo diagnosticado y evidencia de la decisión técnica. El capstone queda pendiente hasta que el índice completo y sus huecos de referencia hayan sido revisados.
