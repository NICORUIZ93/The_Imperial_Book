package academia;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class RagScopeTest {
    // Recuperador léxico didáctico: no simula embeddings ni búsqueda vectorial.
    List<Document> recuperar(String empresaAutorizada, String termino, List<Document> corpus) {
        if (termino.isBlank()) return List.of();
        return corpus.stream()
            .filter(d -> empresaAutorizada.equals(d.getMetadata().get("empresa")))
            .filter(d -> d.getText().toLowerCase(java.util.Locale.ROOT)
                .contains(termino.toLowerCase(java.util.Locale.ROOT)))
            .limit(2).toList();
    }
    @Test void filtraAntesDeConstruirContexto() {
        var corpus = List.of(
            new Document("Reembolso: revisar comprobante", Map.of("empresa", "A")),
            new Document("Reembolso secreto de B", Map.of("empresa", "B")));
        var docs = recuperar("A", "reembolso", corpus);
        assertEquals(1, docs.size());
        assertFalse(docs.getFirst().getText().contains("secreto"));
        assertEquals("A", docs.getFirst().getMetadata().get("empresa"));
    }
    @Test void sinEvidenciaNoSeInventaContexto() {
        assertTrue(recuperar("A", "", List.of()).isEmpty());
        assertTrue(recuperar("A", "factura", List.of(new Document("GPS", Map.of("empresa", "A")))).isEmpty());
    }
}
