package com.academia.orders;

import static org.assertj.core.api.Assertions.assertThat;

import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class CircuitBreakerTest {
  @Autowired InventoryClient client;
  @Autowired CircuitBreakerRegistry registry;

  @Test
  void abreCircuitoYDevuelveFallback() {
    for (int i = 0; i < 6; i++) {
      Map<String, Object> res = client.getStock("sku1");
      assertThat(res.get("fallback")).isEqualTo(true);
    }
    var state = registry.circuitBreaker("inventory").getState().name();
    assertThat(state).isIn("OPEN", "FORCED_OPEN", "HALF_OPEN");
  }
}
