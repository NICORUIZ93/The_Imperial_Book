package com.aurora.inventario;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StockController {

    record Stock(String sku, int unidades) {}

    private final Map<String, Integer> stock = Map.of(
            "TEC-1042", 15,
            "HOG-2210", 4);

    @GetMapping("/stock/{sku}")
    public ResponseEntity<Stock> consultar(@PathVariable String sku) {
        Integer unidades = stock.get(sku);
        if (unidades == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new Stock(sku, unidades));
    }
}
