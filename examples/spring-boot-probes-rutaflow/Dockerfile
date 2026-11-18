FROM bellsoft/liberica-openjre-debian:25-cds
WORKDIR /application
COPY target/spring-boot-probes-rutaflow-0.1.0-SNAPSHOT.jar application.jar
ENTRYPOINT ["java", "-jar", "application.jar"]
