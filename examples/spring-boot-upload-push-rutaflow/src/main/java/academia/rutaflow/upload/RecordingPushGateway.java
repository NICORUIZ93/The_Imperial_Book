package academia.rutaflow.upload;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Component;

@Component
public class RecordingPushGateway implements PushGateway {
    private final List<UploadAccepted> sent = new CopyOnWriteArrayList<>();

    @Override public void send(UploadAccepted event) { sent.add(event); }
    public List<UploadAccepted> sent() { return List.copyOf(sent); }
    public void clear() { sent.clear(); }
}
