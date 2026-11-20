# F069 · DESPUÉS (seguro): versión fijada, solo el JRE, usuario sin privilegios y healthcheck.
FROM eclipse-temurin:25-jre
RUN groupadd --system --gid 10001 app && useradd --system --uid 10001 --gid app app
COPY --chown=app:app target/app.jar /app/app.jar
USER 10001
HEALTHCHECK --interval=30s --timeout=3s CMD ["java", "-version"]
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
