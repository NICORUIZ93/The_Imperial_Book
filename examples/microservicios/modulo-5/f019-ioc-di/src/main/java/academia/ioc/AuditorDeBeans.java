package academia.ioc;

import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;

/** Un BeanPostProcessor ve pasar cada bean ya inicializado: aquí Spring crea los proxies (AOP, @Transactional). */
@Component
public class AuditorDeBeans implements BeanPostProcessor {
    @Override
    public Object postProcessAfterInitialization(Object bean, String nombre) {
        if (bean instanceof ServicioPedidos) {
            Ciclo.registrar("5. BeanPostProcessor: " + nombre + " listo para usarse");
        }
        return bean;
    }
}
