package academia.rutaflow.upload;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class PushAfterCommitListener {
    private final PushGateway gateway;

    public PushAfterCommitListener(PushGateway gateway) { this.gateway = gateway; }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void afterCommit(UploadAccepted event) { gateway.send(event); }
}
