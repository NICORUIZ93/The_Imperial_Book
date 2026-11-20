package academia.saludo.autoconfigure;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * @Conditional "a mano": Spring llama a matches() ANTES de registrar el bean.
 * Las anotaciones @ConditionalOnXxx de Spring Boot son condiciones como esta, ya escritas.
 */
public class ModoFormalCondition implements Condition {
    @Override
    public boolean matches(ConditionContext contexto, AnnotatedTypeMetadata metadatos) {
        return contexto.getEnvironment().getProperty("saludo.formal", Boolean.class, false);
    }
}
