package academia.rutaflow.cache;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Repository;

@Repository
public class CatalogoTarifaRepository implements TarifaRepository {
    private final Map<String, Tarifa> tarifas = new ConcurrentHashMap<>();
    private final AtomicInteger lecturas = new AtomicInteger();

    public CatalogoTarifaRepository() {
        restaurarDatosDePrueba();
    }

    @Override
    public Optional<Tarifa> buscarPorZona(String zona) {
        lecturas.incrementAndGet();
        return Optional.ofNullable(tarifas.get(zona));
    }

    @Override
    public Tarifa guardar(Tarifa tarifa) {
        tarifas.put(tarifa.zona(), tarifa);
        return tarifa;
    }

    @Override
    public int lecturas() {
        return lecturas.get();
    }

    @Override
    public void restaurarDatosDePrueba() {
        tarifas.clear();
        tarifas.put("NORTE", new Tarifa("NORTE", 1200));
        tarifas.put("SUR", new Tarifa("SUR", 900));
        lecturas.set(0);
    }
}
