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
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

class ChatToolsTest {
    static class Consulta {
        // En producción, estos permisos vienen de la sesión verificada del servidor.
        private final Set<String> enviosPermitidos;
        Consulta() { this(Set.of("ENV-42")); }
        Consulta(Set<String> enviosPermitidos) { this.enviosPermitidos = Set.copyOf(enviosPermitidos); }
        @Tool(description = "Consulta el estado del envío autorizado de esta sesión")
        public String estado(String envioId) {
            if (!enviosPermitidos.contains(envioId)) throw new IllegalArgumentException("Sin permiso");
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
    @Test void dosSesionesNoCompartenPermisos() {
        var ana = MethodToolCallbackProvider.builder()
            .toolObjects(new Consulta(Set.of("ENV-42"))).build().getToolCallbacks()[0];
        var bruno = MethodToolCallbackProvider.builder()
            .toolObjects(new Consulta(Set.of("ENV-99"))).build().getToolCallbacks()[0];
        assertTrue(ana.call("{\"envioId\":\"ENV-42\"}").contains("creado"));
        assertTrue(bruno.call("{\"envioId\":\"ENV-99\"}").contains("creado"));
        assertThrows(RuntimeException.class, () -> ana.call("{\"envioId\":\"ENV-99\"}"));
        assertThrows(RuntimeException.class, () -> bruno.call("{\"envioId\":\"ENV-42\"}"));
    }
    @Test void contratoNoSolicitaIdentidadAlModelo() {
        var callback = MethodToolCallbackProvider.builder()
            .toolObjects(new Consulta()).build().getToolCallbacks()[0];
        String schema = callback.getToolDefinition().inputSchema();
        assertTrue(schema.contains("envioId"));
        assertFalse(schema.contains("usuario"));
        assertFalse(schema.contains("empresa"));
    }
}
