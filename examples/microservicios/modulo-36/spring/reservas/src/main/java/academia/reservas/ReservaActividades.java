package academia.reservas;

import io.temporal.activity.ActivityInterface;

/** Módulo 32 · F182 · Actividades de la saga. Todas idempotentes por reservaId (Temporal las reintenta). */
@ActivityInterface
public interface ReservaActividades {
    void reservarPlaza(Reserva r);
    void liberarPlaza(Reserva r);
    String cobrar(Reserva r);
    void reembolsar(String reservaId, String cobroId);
    void confirmar(Reserva r, String cobroId);
    void cancelar(Reserva r, String motivo);
}
