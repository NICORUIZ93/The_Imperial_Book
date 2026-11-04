package academia.rutaflow.amqp;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.io.IOException;

import com.rabbitmq.client.Channel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DispatchListenerTest {
    private DispatchService service;
    private Channel channel;
    private DispatchListener listener;

    @BeforeEach
    void setUp() {
        service = mock(DispatchService.class);
        channel = mock(Channel.class);
        listener = new DispatchListener(service);
    }

    @Test
    void confirmaSoloDespuesDeCrearLaGuia() throws IOException {
        listener.receive("RF-1200", channel, 42L);

        verify(service).createDispatch("RF-1200");
        verify(channel).basicAck(42L, false);
        verify(channel, never()).basicNack(42L, false, false);
    }

    @Test
    void enviaDatoInvalidoALaDeadLetterQueue() throws IOException {
        org.mockito.Mockito.doThrow(new InvalidDispatchException("formato inválido"))
                .when(service).createDispatch("sin-formato");

        listener.receive("sin-formato", channel, 7L);

        verify(channel).basicNack(7L, false, false);
        verify(channel, never()).basicAck(7L, false);
    }
}
