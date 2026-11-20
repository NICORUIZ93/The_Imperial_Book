package academia.registro;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.HexFormat;

import academia.avro.Pedido;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericDatumReader;
import org.apache.avro.generic.GenericRecord;
import org.apache.avro.io.BinaryEncoder;
import org.apache.avro.io.DecoderFactory;
import org.apache.avro.io.EncoderFactory;
import org.apache.avro.specific.SpecificDatumWriter;
import org.junit.jupiter.api.Test;

/** Avro puro (sin Kafka ni Schema Registry): cómo se ven los bytes y cómo se resuelve un esquema nuevo. */
class AvroSinInfraestructuraTest {

    static byte[] serializar(Pedido pedido) throws Exception {
        var salida = new ByteArrayOutputStream();
        BinaryEncoder encoder = EncoderFactory.get().binaryEncoder(salida, null);
        new SpecificDatumWriter<>(Pedido.class).write(pedido, encoder);
        encoder.flush();
        return salida.toByteArray();
    }

    @Test
    void losBytesNoLlevanNombresDeCampo() throws Exception {
        Pedido pedido = Pedido.newBuilder().setId("P-1").setCliente("ana").setTotalCentavos(125000L).build();
        byte[] bytes = serializar(pedido);
        System.out.println("Avro (" + bytes.length + " bytes): " + HexFormat.ofDelimiter(" ").formatHex(bytes));
        // 06 = longitud 3 (zigzag), "P-1"; 06 "ana"; 90 a1 0f = 125000 (zigzag + varint)
        assertThat(HexFormat.of().formatHex(bytes)).isEqualTo("06502d3106616e6190a10f");
        // El mismo dato en JSON ocupa 51 bytes: más de 4 veces más
        String json = "{\"id\":\"P-1\",\"cliente\":\"ana\",\"totalCentavos\":125000}";
        assertThat(json.length()).isEqualTo(51);
    }

    @Test
    void unLectorConElEsquemaV2LeeDatosEscritosConV1UsandoElDefault() throws Exception {
        Pedido v1 = Pedido.newBuilder().setId("P-2").setCliente("beto").setTotalCentavos(990L).build();
        Schema escritor = Pedido.getClassSchema();
        Schema lector;
        try (InputStream in = getClass().getResourceAsStream("/pedido-v2-compatible.avsc")) {
            lector = new Schema.Parser().parse(in);
        }
        var reader = new GenericDatumReader<GenericRecord>(escritor, lector, GenericData.get());
        GenericRecord leido = reader.read(null, DecoderFactory.get().binaryDecoder(serializar(v1), null));
        System.out.println("Leído con v2: " + leido);
        assertThat(leido.get("canal").toString()).isEqualTo("web");
        assertThat(leido.get("totalCentavos")).isEqualTo(990L);
    }
}
