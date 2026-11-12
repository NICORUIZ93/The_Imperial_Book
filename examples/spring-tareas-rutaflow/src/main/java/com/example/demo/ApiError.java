package com.example.demo;

import java.util.Map;

public record ApiError(
        String codigo,
        String mensaje,
        Map<String, String> campos) {
}
