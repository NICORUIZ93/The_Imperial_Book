package academia.nativo;

import java.math.BigDecimal;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@ImportRuntimeHints(ImpuestosHints.class)   // quita esta línea para ver fallar el binario nativo
@RestController
public class NativoApp {

    private final Calculadora calculadora;

    NativoApp(@Value("${impuestos.calculadora}") String clase) throws ReflectiveOperationException {
        // Reflexión: la clase concreta se decide en tiempo de ejecución.
        this.calculadora = (Calculadora) Class.forName(clase).getDeclaredConstructor().newInstance();
    }

    @GetMapping("/impuesto")
    Map<String, Object> impuesto(@RequestParam BigDecimal base) {
        return Map.of("base", base, "impuesto", calculadora.impuesto(base),
            "calculadora", calculadora.getClass().getSimpleName());
    }

    public static void main(String[] args) {
        SpringApplication.run(NativoApp.class, args);
    }
}
