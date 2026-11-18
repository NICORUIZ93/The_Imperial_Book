package academia.rutaflow.clean;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

class ArchitectureBoundariesTest {
    private final JavaClasses application = new ClassFileImporter()
        .importPackages("academia.rutaflow.clean");

    @Test
    void domainDoesNotDependOnSpringOrWeb() {
        ArchRule rule = noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAnyPackage("org.springframework..", "..web..");

        rule.check(application);
    }

    @Test
    void applicationDoesNotDependOnInfrastructureOrWebAdapters() {
        ArchRule rule = noClasses().that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAnyPackage("..infrastructure..", "..web..");

        rule.check(application);
    }
}
