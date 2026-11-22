package com.academia.orders;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderController {
  private final InventoryClient inventory;

  public OrderController(InventoryClient inventory) {
    this.inventory = inventory;
  }

  @GetMapping("/orders/{sku}")
  public Map<String, Object> order(@PathVariable String sku) {
    return Map.of("sku", sku, "inventory", inventory.getStock(sku));
  }
}
