package academia.rutaflow.cache;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class TarifaService {
    private final TarifaRepository repository;

    public TarifaService(TarifaRepository repository) {
        this.repository = repository;
    }

    @Cacheable(cacheNames = "tarifas", key = "#zona")
    public Tarifa buscar(String zona) {
        return repository.buscarPorZona(zona)
                .orElseThrow(() -> new IllegalArgumentException("Zona desconocida: " + zona));
    }

    @CacheEvict(cacheNames = "tarifas", key = "#tarifa.zona")
    public Tarifa actualizar(Tarifa tarifa) {
        return repository.guardar(tarifa);
    }

    @CachePut(cacheNames = "tarifas", key = "#result.zona")
    public Tarifa actualizarYCachear(Tarifa tarifa) {
        return repository.guardar(tarifa);
    }
}
