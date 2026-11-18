package academia.rutaflow.decision;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public class DeliveryRepository {
    private final DatabaseClient database;

    public DeliveryRepository(DatabaseClient database) {
        this.database = database;
    }

    public Mono<Delivery> findByTrackingCode(String trackingCode) {
        return database.sql("SELECT tracking_code, status FROM delivery WHERE tracking_code = :code")
                .bind("code", trackingCode)
                .map((row, metadata) -> new Delivery(
                        row.get("tracking_code", String.class), row.get("status", String.class)))
                .one();
    }

    public Flux<Delivery> findAll() {
        return database.sql("SELECT tracking_code, status FROM delivery ORDER BY tracking_code")
                .map((row, metadata) -> new Delivery(
                        row.get("tracking_code", String.class), row.get("status", String.class)))
                .all();
    }
}
