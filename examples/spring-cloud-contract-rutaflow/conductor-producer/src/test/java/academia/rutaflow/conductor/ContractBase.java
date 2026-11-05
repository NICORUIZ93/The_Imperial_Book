package academia.rutaflow.conductor;

import io.restassured.module.mockmvc.RestAssuredMockMvc;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
public abstract class ContractBase {
    @Autowired
    MockMvc mockMvc;

    @BeforeEach
    void configureMockMvc() {
        RestAssuredMockMvc.mockMvc(mockMvc);
    }
}
