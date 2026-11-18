package academia.rutaflow.operations;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class Journey {
    private JourneyStatus status = JourneyStatus.OPEN;
    private final List<Position> positions = new ArrayList<>();

    public void record(Position position) {
        if (status == JourneyStatus.CLOSED) {
            throw new JourneyAlreadyClosed();
        }
        positions.add(Objects.requireNonNull(position));
    }

    public void close() {
        status = JourneyStatus.CLOSED;
    }

    public List<Position> positions() {
        return List.copyOf(positions);
    }

    public JourneyStatus status() {
        return status;
    }
}
