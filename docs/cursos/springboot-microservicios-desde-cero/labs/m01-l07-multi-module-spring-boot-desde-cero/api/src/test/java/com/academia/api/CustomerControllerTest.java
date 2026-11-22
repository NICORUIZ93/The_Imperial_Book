package com.academia.api;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest
@AutoConfigureMockMvc
class CustomerControllerTest {
    @Autowired MockMvc mvc;
    @Test void returnsDomainObject() throws Exception {
        mvc.perform(get("/customers/7")).andExpect(status().isOk())
           .andExpect(jsonPath("$.id").value("7"))
           .andExpect(jsonPath("$.name").value("Cliente-7"));
    }
}
