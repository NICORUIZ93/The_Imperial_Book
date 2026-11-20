# syntax=docker/dockerfile:1
# F081 · Dockerfile multi-stage + distroless para el servicio «catalogo» (Spring Boot 4.1.3, JDK 25)
# Construye desde examples/microservicios/modulo-16:
#   docker build -t academia/catalogo:1.0.0 app
#   docker build -t academia/catalogo:1.1.0 --build-arg VERSION=1.1.0 app

# ---------- Etapa 1: compilar (JDK completo + Maven; NO llega a la imagen final) ----------
FROM maven:3.10.0-eclipse-temurin-25 AS compilacion
WORKDIR /fuente
# 1) Solo el pom.xml: esta capa (las dependencias) se reutiliza mientras el pom no cambie.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
# 2) El código cambia a menudo: va DESPUÉS, para no invalidar la capa de dependencias.
COPY src ./src
RUN mvn -B -q package -DskipTests
# 3) Extrae el jar en capas: dependencias, loader, snapshots y aplicación (de menos a más cambiante).
RUN java -Djarmode=tools -jar target/catalogo.jar extract --layers --destination extraido

# ---------- Etapa 2: ejecutar (solo la JRE 25; sin shell, sin apt, usuario no root 65532) ----------
FROM gcr.io/distroless/java25-debian13:nonroot
WORKDIR /app
COPY --from=compilacion /fuente/extraido/dependencies/ ./
COPY --from=compilacion /fuente/extraido/spring-boot-loader/ ./
COPY --from=compilacion /fuente/extraido/snapshot-dependencies/ ./
COPY --from=compilacion /fuente/extraido/application/ ./
# La versión queda grabada en la imagen: /api/info la muestra (Blue-Green y Canary la usan para distinguir pods).
ARG VERSION=1.0.0
ENV CATALOGO_VERSION=${VERSION}
# La JVM respeta el límite de memoria del contenedor; 75 % para el heap, el resto para metaspace, hilos y buffers.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"
EXPOSE 8080
# Forma «exec» (JSON): java es el PID 1 y recibe SIGTERM directamente (apagado ordenado).
ENTRYPOINT ["java", "-jar", "catalogo.jar"]
