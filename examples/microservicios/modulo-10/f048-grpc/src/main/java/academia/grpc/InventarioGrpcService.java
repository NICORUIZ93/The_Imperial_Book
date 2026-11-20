package academia.grpc;

import academia.grpc.proto.ConsultaRequest;
import academia.grpc.proto.Existencia;
import academia.grpc.proto.InventarioGrpc;
import academia.grpc.proto.Reserva;
import academia.grpc.proto.ResumenReservas;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

/** Implementación del servicio: Spring Boot registra cualquier bean BindableService en el servidor gRPC. */
@Service
public class InventarioGrpcService extends InventarioGrpc.InventarioImplBase {

    private final Map<String, Integer> stock = new ConcurrentHashMap<>(Map.of("CAFE", 12, "TAZA", 4));

    @Override
    public void consultar(ConsultaRequest peticion, StreamObserver<Existencia> respuesta) {
        Integer disponibles = stock.get(peticion.getSku());
        if (disponibles == null) {
            // Los errores viajan como Status (no como HTTP 404): NOT_FOUND + descripción.
            respuesta.onError(Status.NOT_FOUND.withDescription("sku desconocido: " + peticion.getSku())
                    .asRuntimeException());
            return;
        }
        respuesta.onNext(Existencia.newBuilder().setSku(peticion.getSku()).setDisponibles(disponibles).build());
        respuesta.onCompleted();
    }

    @Override
    public void seguirExistencias(ConsultaRequest peticion, StreamObserver<Existencia> respuesta) {
        // Simula tres cambios de stock enviados por el MISMO canal, uno detrás de otro.
        int actual = stock.getOrDefault(peticion.getSku(), 0);
        for (int i = 0; i < 3; i++) {
            respuesta.onNext(Existencia.newBuilder().setSku(peticion.getSku()).setDisponibles(actual - i).build());
        }
        respuesta.onCompleted();
    }

    @Override
    public StreamObserver<Reserva> reservarLote(StreamObserver<ResumenReservas> respuesta) {
        // El cliente envía reservas una a una; respondemos una sola vez cuando él termina (onCompleted).
        return new StreamObserver<>() {
            int reservas;
            int unidades;

            @Override
            public void onNext(Reserva reserva) {
                reservas++;
                unidades += reserva.getCantidad();
            }

            @Override
            public void onError(Throwable error) {
                // El cliente canceló: no hay a quién responder.
            }

            @Override
            public void onCompleted() {
                respuesta.onNext(ResumenReservas.newBuilder().setReservas(reservas).setUnidades(unidades).build());
                respuesta.onCompleted();
            }
        };
    }
}
