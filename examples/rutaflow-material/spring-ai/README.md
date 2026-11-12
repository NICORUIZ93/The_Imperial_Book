# Spring AI · fronteras locales de herramientas y recuperación

Requiere JDK 25. Maven Wrapper incluido. Desde esta carpeta:

```bash
./mvnw -q clean test
```

Ocho pruebas: cuatro ChatToolsTest y cuatro RagScopeTest. Spring AI 2.0.2 y Boot
4.0.9 permanecen fijados en pom.xml. No requiere claves ni llamadas de red a un
modelo; Maven puede descargar dependencias la primera vez.

ChatClient recibe un ChatModel controlado. El callback de herramienta es real,
pero se invoca directamente: no hay bucle de selección de herramientas por un
LLM. Dos objetos Consulta representan permisos de sesiones independientes; en
un servidor real deben construirse desde identidad autenticada y no reutilizarse
como singleton con permisos de otro usuario. No se implementa login aquí.

RagScopeTest busca texto literalmente, filtra empresa antes de limitar a dos y
conserva IDs. No tiene embeddings, vector store, ranking semántico ni generación.
El orden es el del corpus. Un documento sin empresa se excluye. La empresa
permitida debe obtenerse de la sesión del servidor, nunca de la pregunta del modelo.
No demuestra resistencia a prompt injection ni calidad de respuestas de un LLM.

Fuentes: https://docs.spring.io/spring-ai/reference/api/chatclient.html
https://docs.spring.io/spring-ai/reference/api/tools.html
https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html

## Alternativa Gradle

Desde esta misma carpeta, con JDK 25:

```bash
./gradlew clean classes test
```

Usa las mismas fuentes y pruebas del laboratorio. Consulta la [guía del curso](../../../docs/SPRING-BOOT-GRADLE.md)
para perfiles, filtros de tests, procesadores y tareas especiales. Los resultados
JUnit de Gradle están en `build/test-results/`; una compilación sin tests no
acredita el escenario de integración. Los scripts que llaman a `mvnw` siguen
usando Maven y su carpeta `target/`.
