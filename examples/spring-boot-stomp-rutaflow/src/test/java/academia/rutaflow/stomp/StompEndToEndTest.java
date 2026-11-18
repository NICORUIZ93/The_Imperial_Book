package academia.rutaflow.stomp;

import java.lang.reflect.Type;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class StompEndToEndTest {
    @LocalServerPort int port;
    @Autowired PositionPublisher publisher;

    @Test
    void publicaAlTopicCorrectoYDescartaSecuenciasDuplicadas() throws Exception {
        WebSocketStompClient client = new WebSocketStompClient(new StandardWebSocketClient());
        client.setMessageConverter(new MappingJackson2MessageConverter());
        BlockingQueue<PositionEvent> events = new LinkedBlockingQueue<>();
        BlockingQueue<ReadyAck> ready = new LinkedBlockingQueue<>();
        StompSession session = client.connectAsync("ws://localhost:" + port + "/ws-entregas",
            new StompSessionHandlerAdapter() {}).get(5, TimeUnit.SECONDS);

        session.subscribe("/topic/entregas/SHP-1", handler(PositionEvent.class, events));
        session.subscribe("/topic/ready", handler(ReadyAck.class, ready));
        session.send("/app/ready", "start");
        assertThat(ready.poll(3, TimeUnit.SECONDS)).isEqualTo(new ReadyAck("subscription-ready"));

        PositionEvent first = new PositionEvent("SHP-1", 1, "2026-11-09T10:00:00Z", 1);
        assertThat(publisher.publish(first)).isTrue();
        assertThat(publisher.publish(first)).isFalse();
        assertThat(events.poll(3, TimeUnit.SECONDS)).isEqualTo(first);
        assertThat(events.poll(250, TimeUnit.MILLISECONDS)).isNull();

    }

    private static <T> StompFrameHandler handler(Class<T> type, BlockingQueue<T> queue) {
        return new StompFrameHandler() {
            @Override public Type getPayloadType(StompHeaders headers) { return type; }
            @Override public void handleFrame(StompHeaders headers, Object payload) {
                queue.add(type.cast(payload));
            }
        };
    }
}
