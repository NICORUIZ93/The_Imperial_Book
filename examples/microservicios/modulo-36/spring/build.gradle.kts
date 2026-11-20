// Módulo 32 (modulo-36) · Proyecto raíz: no tiene código. Declara los plugins una sola vez
// ("apply false" = disponibles para los subproyectos, sin aplicarlos aquí).
plugins {
    alias(libs.plugins.spring.boot) apply false
    alias(libs.plugins.spring.dependency.management) apply false
    alias(libs.plugins.gatling) apply false
}
