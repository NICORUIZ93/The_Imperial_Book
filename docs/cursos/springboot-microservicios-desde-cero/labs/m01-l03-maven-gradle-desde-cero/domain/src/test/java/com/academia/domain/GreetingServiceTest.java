package com.academia.domain;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class GreetingServiceTest {
    @Test void greets() { assertEquals("Hola Ana", new GreetingService().greet("Ana")); }
}
