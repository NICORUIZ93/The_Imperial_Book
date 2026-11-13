package academia.rutaflow.modules;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;
import static org.assertj.core.api.Assertions.assertThat;

class RutaflowModulesArchitectureTest {

    private final JavaClasses project = new ClassFileImporter()
        .importPackages("academia.rutaflow.modules");

    @Test
    void laImportacionRealmenteEncontroClases() {
        // Documenta la intención explícitamente: ArchUnit 1.5.1 ya falla por
        // defecto (failOnEmptyShould=true) si una regla no evalúa ninguna
        // clase, pero esta aserción deja la garantía visible en el código y
        // no depende de que esa configuración por defecto nunca cambie.
        assertThat(project).isNotEmpty();
    }

    @Test
    void facturacionNoAccedeAInternalsDeEnvios() {
        ArchRule rule = noClasses().that().resideOutsideOfPackage("..envios..")
            .should().dependOnClassesThat().resideInAPackage("..envios.internal..")
            .because("solo envios.internal puede depender de su propia implementación");

        rule.check(project);
    }

    @Test
    void losModulosEstanLibresDeCiclos() {
        ArchRule rule = slices().matching("academia.rutaflow.modules.(*)..")
            .should().beFreeOfCycles()
            .because("los módulos deben poder evolucionar en un orden acíclico");

        rule.check(project);
    }
}
