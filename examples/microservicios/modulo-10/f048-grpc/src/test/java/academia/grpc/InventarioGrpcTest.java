package academia.grpc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import academia.grpc.proto.ConsultaRequest;
import academia.grpc.proto.Existencia;
import academia.grpc.proto.InventarioGrpc;
import academia.grpc.proto.Reserva;
import academia.grpc.proto.ResumenReservas;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.grpc.test.autoconfigure.AutoConfigureTestGrpcTransport;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.grpc.client.GrpcChannelFactory;

/** Servidor y cliente en el mismo proceso (sin puertos): prueba el contrato completo en milisegundos. */
@SpringBootTest
@AutoConfigureTestGrpcTransport
class InventarioGrpcTest {

    @Autowired
    GrpcChannelFactory canales;

    private InventarioGrpc.InventarioBlockingStub bloqueante() {
        return InventarioGrpc.newBlockingStub(canales.createChannel("0.0.0.0:0"));
    }

    @Test
    void unarioDevuelveLaExistencia() {
        Existencia e = bloqueante().consultar(ConsultaRequest.newBuilder().setSku("CAFE").build());
        assertThat(e.getDisponibles()).isEqualTo(12);
    }

    @Test
    void unSkuDesconocidoEsNotFound() {
        assertThatThrownBy(() -> bloqueante().consultar(ConsultaRequest.newBuilder().setSku("TE").build()))
            .isInstanceOf(StatusRuntimeException.class)
            .extracting(e -> ((StatusRuntimeException) e).getStatus().getCode())
            .isEqualTo(Status.Code.NOT_FOUND);
    }

    @Test
    void elServidorEnviaTresMensajesPorElMismoStream() {
        List<Integer> recibidos = new ArrayList<>();
        bloqueante().seguirExistencias(ConsultaRequest.newBuilder().setSku("CAFE").build())
            .forEachRemaining(e -> recibidos.add(e.getDisponibles()));
        assertThat(recibidos).containsExactly(12, 11, 10);
    }

    @Test
    void elClienteEnviaUnLoteYRecibeUnResumen() throws Exception {
        var resultado = new CompletableFuture<ResumenReservas>();
        var asincrono = InventarioGrpc.newStub(canales.createChannel("0.0.0.0:0"));
        StreamObserver<Reserva> envio = asincrono.reservarLote(new StreamObserver<>() {
            public void onNext(ResumenReservas r) { resultado.complete(r); }
            public void onError(Throwable t) { resultado.completeExceptionally(t); }
            public void onCompleted() { }
        });
        envio.onNext(Reserva.newBuilder().setSku("CAFE").setCantidad(2).build());
        envio.onNext(Reserva.newBuilder().setSku("TAZA").setCantidad(3).build());
        envio.onCompleted();
        ResumenReservas resumen = resultado.get(5, TimeUnit.SECONDS);
        assertThat(resumen.getReservas()).isEqualTo(2);
        assertThat(resumen.getUnidades()).isEqualTo(5);
    }
}
