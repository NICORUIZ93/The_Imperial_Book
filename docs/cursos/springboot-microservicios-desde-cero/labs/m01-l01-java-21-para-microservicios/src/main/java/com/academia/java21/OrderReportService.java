package com.academia.java21;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public class OrderReportService {
    public BigDecimal totalPaid(List<OrderSummary> orders) {
        return orders.stream()
                .map(OrderSummary::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Optional<String> findEmail(List<OrderSummary> orders, String orderId) {
        return orders.stream()
                .filter(o -> o.orderId().equals(orderId))
                .map(OrderSummary::customerEmail)
                .filter(email -> email != null && !email.isBlank())
                .findFirst();
    }

    public List<String> highValueIds(List<OrderSummary> orders, BigDecimal min) {
        return orders.stream()
                .filter(o -> o.total().compareTo(min) >= 0)
                .map(OrderSummary::orderId)
                .toList();
    }
}
