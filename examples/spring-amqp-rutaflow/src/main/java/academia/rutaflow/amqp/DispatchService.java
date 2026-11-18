package academia.rutaflow.amqp;

import org.springframework.stereotype.Service;

@Service
public class DispatchService {
    public void createDispatch(String trackingCode) {
        if (trackingCode == null || !trackingCode.matches("RF-[0-9]{4}")) {
            throw new InvalidDispatchException("Usa el formato RF-1234");
        }
        System.out.println("guía creada=" + trackingCode);
    }
}
