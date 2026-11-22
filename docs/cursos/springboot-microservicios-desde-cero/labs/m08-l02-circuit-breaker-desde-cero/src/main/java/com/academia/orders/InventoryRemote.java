package com.academia.orders;

import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class InventoryRemote {
  public Map<String, Object> fetchStock(String sku) {
    throw new IllegalStateException("inventory down for " + sku);
  }
}
