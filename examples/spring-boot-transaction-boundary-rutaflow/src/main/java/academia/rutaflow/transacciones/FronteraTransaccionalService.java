package academia.rutaflow.transacciones;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class FronteraTransaccionalService {
    private final TrabajoTransaccional trabajo;

    public FronteraTransaccionalService(TrabajoTransaccional trabajo) {
        this.trabajo = trabajo;
    }

    @Transactional
    public boolean transaccionIniciadaPorElProxy() {
        return TransactionSynchronizationManager.isActualTransactionActive();
    }

    public boolean llamadaInternaConThis() {
        return this.metodoInternoAnotado();
    }

    @Transactional
    public boolean metodoInternoAnotado() {
        return TransactionSynchronizationManager.isActualTransactionActive();
    }

    public boolean llamadaEntreBeans() {
        return trabajo.ejecutar();
    }
}
