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
        assertTrue(recuperar("A", "", List.of(new Document("Reembolso", Map.of("empresa", "A")))).isEmpty());
        assertTrue(recuperar("A", "factura", List.of(new Document("GPS", Map.of("empresa", "A")))).isEmpty());
    }
    @Test void filtraAntesDeLimitarYConservaReferencias() {
        var corpus = List.of(
            new Document("b-1", "Reembolso ajeno 1", Map.of("empresa", "B")),
            new Document("b-2", "Reembolso ajeno 2", Map.of("empresa", "B")),
            new Document("a-1", "Reembolso autorizado 1", Map.of("empresa", "A")),
            new Document("a-2", "Reembolso autorizado 2", Map.of("empresa", "A")),
            new Document("a-3", "Reembolso autorizado 3", Map.of("empresa", "A")));
        var docs = recuperar("A", "REEMBOLSO", corpus);
        assertEquals(List.of("a-1", "a-2"), docs.stream().map(Document::getId).toList());
        assertTrue(docs.stream().allMatch(d -> "A".equals(d.getMetadata().get("empresa"))));
    }
    @Test void documentoSinEmpresaNoSeCompartePorDefecto() {
        var corpus = List.of(new Document("Reembolso sin propietario", Map.of()));
        assertTrue(recuperar("A", "reembolso", corpus).isEmpty());
    }
}
