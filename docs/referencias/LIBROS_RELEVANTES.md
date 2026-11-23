# Libros relevantes para Academia Floci

## Libros clave (leídos/analizados)

### 1. "Spring Boot Backend Arquitectura" — Rafael Benedettelli (2025)
- **Relevancia:** Alta para tracks Java, Spring Boot, Spring Microservicios
- **Enfoque:** Arquitectura en capas (Controller → Service → Persistence), microservicios con Spring Boot
- **Pedagogía:** Proyecto desde cero con Spring Initializr, capas claras, código real
- **Temas clave:** IoC/DI, REST CRUD, JPA, testing, microservicios con Eureka/Ribbon/Zuul
- **Build tool:** Maven (pero el usuario prefiere Gradle)
- **Aplicable a:** spring-microservices, spring-boot, java tracks

### 2. "Microservicios. Un enfoque integrado" — Roldán, Valderas, Torres (2018)
- **Relevancia:** Alta para spring-microservices track
- **Enfoque:** Microservicios con Java/Spring, desde conceptos hasta despliegue
- **Pedagogía:** 9 capítulos con introducción teórica + aplicación práctica con ejemplo didáctico
- **Temas clave:** Conceptos básicos, Gradle, Spring Boot, primer microservicio, balanceo/tolerancia a fallos, OAuth2, acceso a datos (eventos, sagas, CQRS), testing, Docker
- **Build tool:** Gradle (el usuario lo prefiere)
- **Aplicable a:** spring-microservices track completo

### 3. "Java a fondo 5ed" — Pablo Sznajdleder (2023/2024)
- **Relevancia:** Alta para java track
- **Enfoque:** Java completo desde fundamentos hasta avanzado
- **Pedagogía:** Muy detallado, estilo textbook, ejercicios y autoevaluación
- **Temas clave:** Elementos del lenguaje, OOP, herencia, polimorfismo, colecciones, genéricos, strings, excepciones, I/O, concurrencia
- **Aplicable a:** java track (M0-M22)

### 4. "Java el cambio es la única constante 2025" — (2025)
- **Relevancia:** Alta para java track (actualización)
- **Enfoque:** Java moderno (Java 21+), cambios recientes, JEPs
- **Aplicable a:** java track, actualización de contenido 2026

### 5. "Clean Code" — Robert C. Martin
- **Relevancia:** Media para todos los tracks
- **Enfoque:** Código limpio, nombres, funciones, clases, testing
- **Aplicable a:** Estilo de código en todos los ejemplos

### 6. "Sumergete en los patrones de diseño" — Alexander Shvets
- **Relevancia:** Media para java y spring-microservices
- **Enfoque:** Patrones de diseño GoF con ejemplos
- **Aplicable a:** java track (M12 patrones), spring-microservices

### 7. "Seguridad en aplicaciones Web Java" — (varios)
- **Relevancia:** Media para spring-microservices M8
- **Enfoque:** Seguridad web Java
- **Aplicable a:** M8 seguridad

### 8. "Docker - Guía práctica" y "Aprender Docker"
- **Relevancia:** Media para M12 deployment
- **Enfoque:** Docker práctico
- **Aplicable a:** M12 contenedores

### 9. "Desarrollo Web con Java desde Cero"
- **Relevancia:** Media para java/spring-boot
- **Enfoque:** Web Java desde cero
- **Aplicable a:** Fundamentos

### 10. "Core Java" (Horstmann) — Inglés
- **Relevancia:** Alta para java track (referencia técnica)
- **Enfoque:** Java completo y actualizado
- **Aplicable a:** java track

### 11. "Head First Java" — Sierra & Bates
- **Relevancia:** Media para java track
- **Enfoque:** Java pedagógico, visual, con humor
- **Aplicable a:** Estilo pedagógico

### 12. "Accelerate" — Forsgren, Humble, Kim
- **Relevancia:** Media para devops/observabilidad
- **Enfoque:** Métricas DORA, DevOps, entrega continua
- **Aplicable a:** M14 DORA, devops track

## Patrones pedagógicos clave de los libros

1. **Proyecto integrador real:** Los libros usan una aplicación de ejemplo que evoluciona. Tienda Aurora cumple este rol.
2. **Gradle como build tool:** El libro de microservicios usa Gradle. El usuario lo prefiere.
3. **Capas claras:** Controller → Service → Persistence. Separación de responsabilidades.
4. **Conceptos antes de herramientas:** Primero el problema, luego la solución.
5. **Ejercicios prácticos:** Cada capítulo tiene ejercicios verificables.
6. **Testing como ciudadano de primera clase:** Pirámide de tests, unit/integration/E2E.
7. **Docker para despliegue:** Contenedores desde el inicio.
8. **Seguridad integrada:** OAuth2, no como afterthought.

## Complemento con internet (2026)

Para actualizar el contenido a 2026, buscar:
- Java 25 LTS features (JEPs 506, 513, 514, 515, etc.)
- Spring Boot 4.x / Spring Framework 7
- HTTP Service Clients (declarativos)
- Nacos 2.x/3.x
- Floci (emulador AWS)
- OpenTelemetry (OTel) por defecto
- Zero-Trust, mTLS, OAuth2/OIDC
- SBOM, CVE scanning (Syft, Grype, Trivy)
- Native Image, CRaC, JVM tuning
- Spring AI, RAG, MCP
- ADRs, C4, FinOps, Team Topologies

## Libros NO relevantes para el sitio

Los libros de otras categorías (Electrónica, Física, Matemáticas, IA/ML, C/C++, Python, Android/Kotlin, Flutter, JavaScript/Node, Diseño UI/UX, Videojuegos, Seguridad/Hacking, etc.) no son directamente relevantes para Academia Floci, que se enfoca en Java/Spring/Microservicios.
