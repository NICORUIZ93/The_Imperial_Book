package academia.grpc;

import academia.grpc.proto.ConsultaRequest;
import academia.grpc.proto.InventarioGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;
import java.util.concurrent.TimeUnit;

/**
 * Cliente gRPC mínimo (sin Spring) contra el servidor en localhost:9090.
 * Ejecuta: ./mvnw -q spring-boot:run -Dspring-boot.run.main-class=academia.grpc.ClienteDeConsola
 */
public final class ClienteDeConsola {

    public static void main(String[] args) throws InterruptedException {
        ManagedChannel canal = ManagedChannelBuilder.forAddress("localhost", 9090).usePlaintext().build();
        try {
            // Deadline: el cliente decide cuánto está dispuesto a esperar (aquí, 2 segundos).
            var stub = InventarioGrpc.newBlockingStub(canal).withDeadlineAfter(2, TimeUnit.SECONDS);
            var existencia = stub.consultar(ConsultaRequest.newBuilder().setSku("CAFE").build());
            System.out.println("Unario   -> " + existencia.getSku() + " = " + existencia.getDisponibles());
            stub.seguirExistencias(ConsultaRequest.newBuilder().setSku("CAFE").build())
                .forEachRemaining(e -> System.out.println("Stream   -> " + e.getSku() + " = " + e.getDisponibles()));
            try {
                stub.consultar(ConsultaRequest.newBuilder().setSku("TE").build());
            } catch (StatusRuntimeException e) {
                System.out.println("Error    -> " + e.getStatus().getCode() + ": " + e.getStatus().getDescription());
            }
        } finally {
            canal.shutdown().awaitTermination(2, TimeUnit.SECONDS);
        }
    }
}
