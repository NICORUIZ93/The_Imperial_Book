package academia.rutaflow.clean.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DeliveryHttpTest {
    @Autowired
    private MockMvc mvc;

    @Test
    void httpAdapterCallsTheUseCaseAndReturnsTheAssignedDelivery() throws Exception {
        mvc.perform(post("/api/deliveries/D-HTTP-1/assignment")
                .contentType("application/json")
                .content("{\"destination\":\"Bogotá\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value("D-HTTP-1"))
            .andExpect(jsonPath("$.destination").value("Bogotá"))
            .andExpect(jsonPath("$.status").value("ASSIGNED"));
    }

    @Test
    void httpAdapterConvertsTheDomainRuleToConflict() throws Exception {
        String request = "{\"destination\":\"Cali\"}";
        mvc.perform(post("/api/deliveries/D-HTTP-2/assignment").contentType("application/json").content(request))
            .andExpect(status().isCreated());
        mvc.perform(post("/api/deliveries/D-HTTP-2/assignment").contentType("application/json").content(request))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("el envío ya tiene un destino asignado"));
    }
}
