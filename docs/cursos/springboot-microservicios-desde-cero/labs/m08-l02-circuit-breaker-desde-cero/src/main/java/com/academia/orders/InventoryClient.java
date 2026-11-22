package com.academia.orders;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class InventoryClient {
  private final InventoryRemote remote;

  public InventoryClient(InventoryRemote remote) {
    this.remote = remote;
  }

  @CircuitBreaker(name = "inventory", fallbackMethod = "fallback")
  public Map<String, Object> getStock(String sku) {
    return remote.fetchStock(sku);
  }

  public Map<String, Object> fallback(String sku, Throwable ex) {
    return Map.of("sku", sku, "stock", -1, "fallback", true, "cause", ex.getClass().getSimpleName());
  }
}
