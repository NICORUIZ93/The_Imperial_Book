package academia.rutaflow.amqp;

public class InvalidDispatchException extends RuntimeException {
    public InvalidDispatchException(String message) {
        super(message);
    }
}
