package academia.rutaflow.transacciones;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class TrabajoTransaccional {
    @Transactional
    public boolean ejecutar() {
        return TransactionSynchronizationManager.isActualTransactionActive();
    }
}
