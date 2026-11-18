package academia.rutaflow.grpc;

import io.grpc.stub.StreamObserver;
import org.springframework.grpc.server.service.GrpcService;

@GrpcService
public class TarifaServiceImpl extends TarifaServiceGrpc.TarifaServiceImplBase {
    private static final double PRECIO_POR_KM = 1500.0;

    @Override
    public void calcular(TarifaRequest request, StreamObserver<TarifaResponse> responseObserver) {
        double monto = request.getDistanciaKm() * PRECIO_POR_KM;
        responseObserver.onNext(TarifaResponse.newBuilder().setMonto(monto).build());
        responseObserver.onCompleted();
    }
}
