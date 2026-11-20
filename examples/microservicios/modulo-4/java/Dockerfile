# Módulo 0.5 · Imagen Docker del «Hola Mundo» Java.
# Imagen base oficial: eclipse-temurin:25-jdk (JDK 25 LTS de Eclipse Adoptium).
FROM eclipse-temurin:25-jdk
WORKDIR /app
COPY HolaServidor.java .
RUN javac HolaServidor.java
ENV PUERTO=8080
EXPOSE 8080
CMD ["java", "HolaServidor"]
