package com.academia.hello;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
public class HelloController {
    @GetMapping("/health")
    public Map<String, String> health() { return Map.of("status", "UP"); }
}
