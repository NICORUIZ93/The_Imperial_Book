package com.aurora.inventario;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(StockController.class)
class StockControllerTest {

    @Autowired
    MockMvc mvc;

    @Test
    void devuelveElStockDeUnSkuConocido() throws Exception {
        mvc.perform(get("/stock/TEC-1042"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.unidades").value(15));
    }

    @Test
    void responde404ParaUnSkuQueNoExiste() throws Exception {
        mvc.perform(get("/stock/XXX-0000"))
           .andExpect(status().isNotFound());
    }
}
