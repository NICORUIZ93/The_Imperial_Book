package com.academia.ioc;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest
class GreetingServiceTest {
    @Autowired GreetingService service;
    @Autowired LifecycleTracker tracker;
    @Test void diAndLifecycleWork() {
        assertEquals("Hola desde repositorio", service.greet());
        assertTrue(tracker.events().contains("constructor"));
        assertTrue(tracker.events().contains("postConstruct"));
        assertTrue(tracker.events().indexOf("constructor") < tracker.events().indexOf("postConstruct"));
    }
}
