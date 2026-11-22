package com.academia.app;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class AppTest { @Test void usesDomain() { assertEquals("Hola Mundo", new App().run("Mundo")); } }
