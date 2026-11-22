package com.academia.domain;
public class GreetingService {
    public String greet(String name) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("name requerido");
        return "Hola " + name;
    }
}
