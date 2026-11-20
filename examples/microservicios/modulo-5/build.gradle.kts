// Módulo 1 (modulo-5) · Proyecto raíz: no tiene código. Declara los plugins una sola vez
// ("apply false" = disponibles para los subproyectos, sin aplicarlos aquí).
plugins {
    alias(libs.plugins.spring.boot) apply false
    alias(libs.plugins.spring.dependency.management) apply false
    alias(libs.plugins.graalvm.buildtools) apply false
}

// "./gradlew test" en la raíz recorre los subproyectos; F021 es un build incluido y hay que enlazarlo a mano.
tasks.register("test") {
    group = "verification"
    description = "Ejecuta también los tests del build incluido f021-multimodulo."
    dependsOn(gradle.includedBuild("f021-multimodulo").task(":tienda-dominio:test"))
    dependsOn(gradle.includedBuild("f021-multimodulo").task(":tienda-api:test"))
}
