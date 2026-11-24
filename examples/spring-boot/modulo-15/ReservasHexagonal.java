import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ReservasHexagonal {

    // ───────── Dominio: no importa nada de Spring ni de JPA ─────────

    record Vehiculo(String placa) {}

    record Periodo(LocalDate desde, LocalDate hasta) {
        Periodo {
            if (hasta.isBefore(desde)) throw new IllegalArgumentException("el periodo termina antes de empezar");
        }
        boolean seCruzaCon(Periodo otro) {
            return !hasta.isBefore(otro.desde) && !otro.hasta.isBefore(desde);
        }
    }

    record Reserva(Vehiculo vehiculo, Periodo periodo) {}

    /** Puerto de salida: lo define el dominio y habla con tipos del dominio. */
    interface ReservaRepository {
        List<Reserva> deVehiculo(Vehiculo vehiculo);
        void guardar(Reserva reserva);
    }

    /** Caso de uso: la regla de negocio vive aquí, no en el controller ni en el repositorio. */
    static class ReservarVehiculo {
        private final ReservaRepository reservas;

        ReservarVehiculo(ReservaRepository reservas) { this.reservas = reservas; }

        Reserva ejecutar(Vehiculo vehiculo, Periodo periodo) {
            boolean ocupado = reservas.deVehiculo(vehiculo).stream()
                    .anyMatch(r -> r.periodo().seCruzaCon(periodo));
            if (ocupado) throw new IllegalStateException(vehiculo.placa() + " ya está reservado en esas fechas");
            Reserva nueva = new Reserva(vehiculo, periodo);
            reservas.guardar(nueva);
            return nueva;
        }
    }

    // ───────── Adaptador de salida: una implementación del puerto ─────────

    static class ReservaRepositoryEnMemoria implements ReservaRepository {
        private final List<Reserva> datos = new ArrayList<>();
        public List<Reserva> deVehiculo(Vehiculo v) {
            return datos.stream().filter(r -> r.vehiculo().equals(v)).toList();
        }
        public void guardar(Reserva r) { datos.add(r); }
    }

    // ───────── Prueba del caso de uso sin levantar Spring ─────────

    public static void main(String[] args) {
        var casoDeUso = new ReservarVehiculo(new ReservaRepositoryEnMemoria());
        var taxi = new Vehiculo("ABC-123");

        casoDeUso.ejecutar(taxi, new Periodo(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 5)));
        System.out.println("reserva 1-5 dic: aceptada");

        try {
            casoDeUso.ejecutar(taxi, new Periodo(LocalDate.of(2026, 12, 4), LocalDate.of(2026, 12, 8)));
        } catch (IllegalStateException e) {
            System.out.println("reserva 4-8 dic: rechazada → " + e.getMessage());
        }

        casoDeUso.ejecutar(taxi, new Periodo(LocalDate.of(2026, 12, 6), LocalDate.of(2026, 12, 9)));
        System.out.println("reserva 6-9 dic: aceptada");
    }
}
