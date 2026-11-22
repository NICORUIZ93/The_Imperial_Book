package com.academia.java21;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class OrderReportServiceTest {
    private final OrderReportService service = new OrderReportService();
    private final List<OrderSummary> orders = List.of(
            new OrderSummary("o-1", "ana@demo.test", new BigDecimal("10.00")),
            new OrderSummary("o-2", "  ", new BigDecimal("25.50")),
            new OrderSummary("o-3", "luis@demo.test", new BigDecimal("5.00"))
    );

    @Test
    void totalPaidSumsAllOrders() {
        assertEquals(new BigDecimal("40.50"), service.totalPaid(orders));
    }

    @Test
    void findEmailReturnsOptional() {
        assertEquals("ana@demo.test", service.findEmail(orders, "o-1").orElseThrow());
        assertTrue(service.findEmail(orders, "o-2").isEmpty());
        assertTrue(service.findEmail(orders, "missing").isEmpty());
    }

    @Test
    void highValueIdsFiltersByThreshold() {
        assertEquals(List.of("o-1", "o-2"), service.highValueIds(orders, new BigDecimal("10.00")));
    }

    @Test
    void recordValidatesInput() {
        assertThrows(IllegalArgumentException.class, () -> new OrderSummary("", "a@b.test", BigDecimal.ONE));
        assertThrows(IllegalArgumentException.class, () -> new OrderSummary("o-x", "a@b.test", new BigDecimal("-1")));
    }
}
