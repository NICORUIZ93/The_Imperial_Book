package academia.reservas;

import java.util.List;

/** Resultado de la saga: CONFIRMADA o CANCELADA, con el motivo y las compensaciones ejecutadas. */
public record ResultadoSaga(String reservaId, String estado, String motivo, List<String> compensadas) { }
