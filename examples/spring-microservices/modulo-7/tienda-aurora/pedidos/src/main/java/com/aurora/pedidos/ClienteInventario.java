package com.aurora.pedidos;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@Service
public class ClienteInventario {

    record RespuestaInventario(String sku, int unidades) {}

    private final RestClient http;

    public ClienteInventario(RestClient.Builder builder,
                             @Value("${inventario.url}") String url) {
        var tiempos = new SimpleClientHttpRequestFactory();
        tiempos.setConnectTimeout(Duration.ofSeconds(1));
        tiempos.setReadTimeout(Duration.ofSeconds(2));
        this.http = builder.baseUrl(url).requestFactory(tiempos).build();
    }

    @CircuitBreaker(name = "inventario", fallbackMethod = "stockDesconocido")
    public Stock consultar(String sku) {
        RespuestaInventario r = http.get()
                .uri("/stock/{sku}", sku)
                .retrieve()
                .body(RespuestaInventario.class);
        return new Stock(r.sku(), r.unidades(), "inventario");
    }

    public Stock stockDesconocido(String sku, Throwable causa) {
        return new Stock(sku, null, "respaldo");
    }
}
