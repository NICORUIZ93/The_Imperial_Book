package academia.capas.servicio;

import academia.capas.modelo.Pedido;
import academia.capas.repositorio.PedidoRepositorio;
import org.springframework.stereotype.Service;

@Service
public class PedidoServicio {

    private final PedidoRepositorio repositorio;   // inyección por constructor: la regla de ArchUnit lo exige

    public PedidoServicio(PedidoRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    public Pedido obtener(long id) {
        return repositorio.buscar(id).orElseThrow();
    }
}
