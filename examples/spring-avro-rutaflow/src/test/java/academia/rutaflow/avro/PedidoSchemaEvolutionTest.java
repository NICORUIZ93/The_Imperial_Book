package academia.rutaflow.avro;

import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericDatumReader;
import org.apache.avro.generic.GenericDatumWriter;
import org.apache.avro.generic.GenericRecord;
import org.apache.avro.io.BinaryDecoder;
import org.apache.avro.io.BinaryEncoder;
import org.apache.avro.io.DecoderFactory;
import org.apache.avro.io.EncoderFactory;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PedidoSchemaEvolutionTest {
    private final Schema v1 = cargar("PedidoDespachado-v1.avsc");
    private final Schema v2 = cargar("PedidoDespachado-v2.avsc");
    private final Schema incompatible = cargar("PedidoDespachado-incompatible.avsc");

    @Test
    void lectorV2RellenaElCampoAusenteConSuDefault() throws IOException {
        GenericRecord antiguo = new GenericData.Record(v1);
        antiguo.put("pedidoId", "pedido-42");
        antiguo.put("estado", "DESPACHADO");

        byte[] bytes = escribir(v1, antiguo);
        GenericRecord leido = leer(v1, v2, bytes);

        assertThat(leido.get("pedidoId").toString()).isEqualTo("pedido-42");
        assertThat(leido.get("zonaEntrega")).isNull();
    }

    @Test
    void lectorNoPuedeExigirUnCampoQueNoExisteEnElRegistroAntiguo() throws IOException {
        GenericRecord antiguo = new GenericData.Record(v1);
        antiguo.put("pedidoId", "pedido-42");
        antiguo.put("estado", "DESPACHADO");

        assertThatThrownBy(() -> leer(v1, incompatible, escribir(v1, antiguo)))
                .isInstanceOf(org.apache.avro.AvroTypeException.class);
    }

    private GenericRecord leer(Schema writer, Schema reader, byte[] bytes) throws IOException {
        BinaryDecoder decoder = DecoderFactory.get().binaryDecoder(bytes, null);
        return new GenericDatumReader<GenericRecord>(writer, reader).read(null, decoder);
    }

    private byte[] escribir(Schema schema, GenericRecord record) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        BinaryEncoder encoder = EncoderFactory.get().binaryEncoder(bytes, null);
        new GenericDatumWriter<GenericRecord>(schema).write(record, encoder);
        encoder.flush();
        return bytes.toByteArray();
    }

    private Schema cargar(String file) {
        try {
            return new Schema.Parser().parse(Path.of("src/main/avro", file).toFile());
        } catch (IOException error) {
            throw new IllegalStateException("No se pudo leer el esquema " + file, error);
        }
    }
}
