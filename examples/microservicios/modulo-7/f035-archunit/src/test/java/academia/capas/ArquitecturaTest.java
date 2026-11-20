package academia.capas;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;
import static com.tngtech.archunit.library.GeneralCodingRules.NO_CLASSES_SHOULD_USE_FIELD_INJECTION;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import org.springframework.stereotype.Service;

/**
 * Las reglas de arquitectura como TESTS: ArchUnit lee el bytecode compilado de academia.capas
 * y falla el build si alguien se salta una capa. Cada @ArchTest es un test.
 */
@AnalyzeClasses(packages = "academia.capas", importOptions = ImportOption.DoNotIncludeTests.class)
class ArquitecturaTest {

    @ArchTest
    static final ArchRule capas = layeredArchitecture().consideringOnlyDependenciesInLayers()
            .layer("Controller").definedBy("..controller..")
            .layer("Servicio").definedBy("..servicio..")
            .layer("Repositorio").definedBy("..repositorio..")
            .whereLayer("Controller").mayNotBeAccessedByAnyLayer()
            .whereLayer("Servicio").mayOnlyBeAccessedByLayers("Controller")
            .whereLayer("Repositorio").mayOnlyBeAccessedByLayers("Servicio");

    @ArchTest
    static final ArchRule controllersSinRepositorios = noClasses()
            .that().resideInAPackage("..controller..")
            .should().dependOnClassesThat().resideInAPackage("..repositorio..");

    @ArchTest
    static final ArchRule sinInyeccionPorCampo = NO_CLASSES_SHOULD_USE_FIELD_INJECTION;

    @ArchTest
    static final ArchRule serviciosTerminanEnServicio = classes()
            .that().areAnnotatedWith(Service.class)
            .should().haveSimpleNameEndingWith("Servicio");
}
