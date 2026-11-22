package com.academia.java21;

import java.math.BigDecimal;

public record OrderSummary(String orderId, String customerEmail, BigDecimal total) {
    public OrderSummary {
        if (orderId == null || orderId.isBlank()) throw new IllegalArgumentException("orderId requerido");
        if (total == null || total.signum() < 0) throw new IllegalArgumentException("total inválido");
    }
}
