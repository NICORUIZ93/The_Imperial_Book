package academia.rutaflow.hexagonal;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

class HexagonalArchitectureTest {
    private final JavaClasses project = new ClassFileImporter()
        .importPackages("academia.rutaflow.hexagonal");

    @Test
    void dominioNoDependeDeDetallesDeInfraestructura() {
        ArchRule rule = noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure..");

        rule.check(project);
    }

    @Test
    void aplicacionNoDependeDeDetallesDeInfraestructura() {
        ArchRule rule = noClasses().that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure..");

        rule.check(project);
    }

    @Test
    void adaptersDeInfraestructuraSeIdentificanComoRepository() {
        ArchRule rule = classes().that().resideInAPackage("..infrastructure..")
            .should().haveSimpleNameEndingWith("Repository");

        rule.check(project);
    }
}
