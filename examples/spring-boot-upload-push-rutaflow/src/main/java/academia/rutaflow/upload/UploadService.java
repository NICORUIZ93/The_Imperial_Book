package academia.rutaflow.upload;

import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class UploadService {
    private final ImageContentValidator validator;
    private final ImageObjectStore objectStore;
    private final JdbcTemplate jdbc;
    private final ApplicationEventPublisher events;

    public UploadService(ImageContentValidator validator, ImageObjectStore objectStore,
                         JdbcTemplate jdbc, ApplicationEventPublisher events) {
        this.validator = validator;
        this.objectStore = objectStore;
        this.jdbc = jdbc;
        this.events = events;
    }

    @Transactional
    public UploadReceipt accept(byte[] bytes, String declaredMediaType) {
        DetectedImage image = validator.validate(bytes, declaredMediaType);
        String uploadId = UUID.randomUUID().toString();
        String storageKey = UUID.randomUUID().toString();
        objectStore.put(storageKey, bytes);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) objectStore.delete(storageKey);
            }
        });
        jdbc.update("INSERT INTO uploads (id, storage_key, media_type, byte_count, width, height) VALUES (?, ?, ?, ?, ?, ?)",
            uploadId, storageKey, image.mediaType(), bytes.length, image.width(), image.height());
        events.publishEvent(new UploadAccepted(uploadId, image.mediaType()));
        return new UploadReceipt(uploadId, image.mediaType(), bytes.length, image.width(), image.height());
    }
}
