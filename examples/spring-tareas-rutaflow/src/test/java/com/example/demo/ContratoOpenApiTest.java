package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ContratoOpenApiTest {
    @Value("${local.server.port}")
    int puerto;

    @Test
    void publicaLasRutasYRespuestasQueUsaElBackend() throws Exception {
        HttpRequest request = HttpRequest.newBuilder(
                URI.create("http://localhost:" + puerto + "/v3/api-docs"))
                .GET()
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient().send(
                request, HttpResponse.BodyHandlers.ofString());
        String contrato = response.body();

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(contrato)
                .contains("/api/tareas")
                .contains("/api/tareas/{id}")
                .contains("Crear una tarea")
                .contains("Consultar una tarea por ID")
                .contains("Tarea inexistente")
                .contains("Datos inválidos")
                .contains("ApiError")
                .contains("Listar tareas por página")
                .contains("Parámetros inválidos")
                .contains("\"200\"")
                .contains("\"201\"")
                .contains("\"400\"")
                .contains("\"404\"");
    }
}
