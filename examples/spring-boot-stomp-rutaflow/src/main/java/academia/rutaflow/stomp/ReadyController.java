package academia.rutaflow.stomp;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ReadyController {
    @MessageMapping("ready")
    @SendTo("/topic/ready")
    public ReadyAck ready(String ignored) {
        return new ReadyAck("subscription-ready");
    }
}
