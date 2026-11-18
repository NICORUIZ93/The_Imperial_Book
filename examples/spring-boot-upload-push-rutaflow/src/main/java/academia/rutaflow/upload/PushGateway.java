package academia.rutaflow.upload;

public interface PushGateway {
    void send(UploadAccepted event);
}
