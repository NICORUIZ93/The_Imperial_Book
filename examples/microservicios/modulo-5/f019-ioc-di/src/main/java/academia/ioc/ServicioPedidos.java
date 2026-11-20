package academia.ioc;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.time.Clock;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class ServicioPedidos implements InitializingBean, DisposableBean {

    private final Notificador notificador;
    private Clock reloj;

    // DI por constructor: la dependencia obligatoria llega al crear el objeto.
    public ServicioPedidos(Notificador notificador) {
        this.notificador = notificador;
        Ciclo.registrar("1. constructor: recibe " + notificador.getClass().getSimpleName());
    }

    // DI por setter: dependencia que se inyecta después del constructor.
    @Autowired
    void setReloj(Clock reloj) {
        this.reloj = reloj;
        Ciclo.registrar("2. setter: recibe Clock");
    }

    @PostConstruct
    void alIniciar() { Ciclo.registrar("3. @PostConstruct"); }

    @Override
    public void afterPropertiesSet() { Ciclo.registrar("4. afterPropertiesSet"); }

    @EventListener(ApplicationReadyEvent.class)
    void cuandoLaAppEstaLista() { Ciclo.registrar("6. ApplicationReadyEvent: la app atiende"); }

    @PreDestroy
    void alCerrar() { Ciclo.registrar("7. @PreDestroy"); }

    @Override
    public void destroy() { Ciclo.registrar("8. destroy"); }

    public String confirmar(String pedido) {
        return notificador.enviar("pedido " + pedido + " confirmado (zona " + reloj.getZone() + ")");
    }
}
