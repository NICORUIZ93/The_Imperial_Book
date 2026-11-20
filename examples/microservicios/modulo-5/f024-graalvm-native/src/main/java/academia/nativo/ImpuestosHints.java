package academia.nativo;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;

/**
 * Native Image analiza el código en compilación ("mundo cerrado"): lo que solo se
 * usa por reflexión desaparece del binario. Este registrar le avisa que lo conserve.
 */
public class ImpuestosHints implements RuntimeHintsRegistrar {
    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        hints.reflection().registerType(CalculadoraIva.class, MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS);
    }
}
