package academia.rutaflow.cache;

import java.util.Optional;

public interface TarifaRepository {
    Optional<Tarifa> buscarPorZona(String zona);
    Tarifa guardar(Tarifa tarifa);
    int lecturas();
    void restaurarDatosDePrueba();
}
