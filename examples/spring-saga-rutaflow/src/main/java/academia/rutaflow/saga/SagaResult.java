package academia.rutaflow.saga;

import java.util.List;

public record SagaResult(Status status, List<String> actions) {
    public enum Status { COMPLETED, COMPENSATED }

    public SagaResult {
        actions = List.copyOf(actions);
    }
}
