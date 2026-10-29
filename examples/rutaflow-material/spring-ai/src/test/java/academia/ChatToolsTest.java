package academia;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class ChatToolsTest {
    static class Consulta {
        @Tool(description = "Consulta el estado del envío autorizado de esta sesión")
        public String estado(String envioId) {
            if (!"ENV-42".equals(envioId)) throw new IllegalArgumentException("Sin permiso");
            return "creado";
        }
    }
    @Test void chatClientUsaElModeloSustituible() {
        ChatModel modeloControlado = prompt -> {
            assertTrue(prompt.getInstructions().stream().anyMatch(m -> m.getText().contains("ENV-42")));
            return new ChatResponse(List.of(new Generation(new AssistantMessage("Estado: creado"))));
        };
        var client = ChatClient.builder(modeloControlado).build();
        assertEquals("Estado: creado", client.prompt().user("Consulta ENV-42").call().content());
    }
    @Test void callbackRealRespetaLaFronteraDeAutorizacion() {
        var callbacks = MethodToolCallbackProvider.builder().toolObjects(new Consulta()).build().getToolCallbacks();
        assertEquals(1, callbacks.length);
        assertTrue(callbacks[0].call("{\"envioId\":\"ENV-42\"}").contains("creado"));
        assertThrows(RuntimeException.class, () -> callbacks[0].call("{\"envioId\":\"ENV-ajeno\"}"));
    }
}
