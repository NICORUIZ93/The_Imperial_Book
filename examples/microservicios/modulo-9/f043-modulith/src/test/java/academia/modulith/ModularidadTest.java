package academia.modulith;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

/** Falla si un módulo usa clases internas de otro o si hay ciclos entre módulos. */
class ModularidadTest {

    ApplicationModules modulos = ApplicationModules.of(ModulithApp.class);

    @Test
    void laEstructuraModularEsValida() {
        modulos.forEach(System.out::println);   // imprime cada módulo, su API y sus dependencias
        modulos.verify();
    }
}
