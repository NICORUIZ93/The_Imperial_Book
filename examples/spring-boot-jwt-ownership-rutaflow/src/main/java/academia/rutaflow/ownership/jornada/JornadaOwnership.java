package academia.rutaflow.ownership.jornada;

import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class JornadaOwnership {
    private final Map<String, String> duenios = Map.of("jornada-1", "conductor-A");

    public boolean perteneceA(String jornadaId, String subject) {
        return subject.equals(duenios.get(jornadaId));
    }
}
