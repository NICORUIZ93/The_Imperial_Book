package academia.reservas;

import io.temporal.client.WorkflowClient;
import io.temporal.serviceclient.WorkflowServiceStubs;
import io.temporal.serviceclient.WorkflowServiceStubsOptions;
import io.temporal.worker.Worker;
import io.temporal.worker.WorkerFactory;
import io.temporal.worker.WorkerOptions;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Módulo 32 · F182 · Conexión con Temporal y los dos workers: «reservas» (workflow + actividades propias) y «cobros»
 * (solo el proveedor), con el límite del ADR-0002 aplicado por el servidor a toda la cola.
 */
@Configuration
class TemporalConfig {

    @Bean(destroyMethod = "shutdown")
    WorkflowServiceStubs servicio(@Value("${temporal.direccion}") String direccion) {
        return WorkflowServiceStubs.newServiceStubs(WorkflowServiceStubsOptions.newBuilder().setTarget(direccion).build());
    }

    @Bean
    WorkflowClient cliente(WorkflowServiceStubs servicio) {
        return WorkflowClient.newInstance(servicio);
    }

    @Bean
    ReservaActividadesImpl actividades(RestClient.Builder http, @Value("${pagos.url}") String pagosUrl) {
        return new ReservaActividadesImpl(http.baseUrl(pagosUrl).build(), Map.of("concierto-1", 500));
    }

    @Bean(destroyMethod = "shutdown")
    WorkerFactory workers(WorkflowClient cliente, ReservaActividadesImpl actividades,
                          @Value("${reservas.cobros-por-segundo}") double cobrosPorSegundo) {
        WorkerFactory fabrica = WorkerFactory.newInstance(cliente);
        Worker reservas = fabrica.newWorker("reservas");
        reservas.registerWorkflowImplementationTypes(ReservaWorkflowImpl.class);
        reservas.registerActivitiesImplementations(actividades);
        WorkerOptions.Builder opciones = WorkerOptions.newBuilder();
        if (cobrosPorSegundo > 0) opciones.setMaxTaskQueueActivitiesPerSecond(cobrosPorSegundo);
        Worker cobros = fabrica.newWorker("cobros", opciones.build());
        cobros.registerActivitiesImplementations(actividades);
        fabrica.start();
        return fabrica;
    }
}
