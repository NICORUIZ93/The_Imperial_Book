// F021 · Proyecto raíz del multi-proyecto: no produce ningún jar, solo agrupa.
// Declara los plugins una vez; cada subproyecto aplica los que necesita.
plugins {
    alias(libs.plugins.spring.boot) apply false
    alias(libs.plugins.spring.dependency.management) apply false
}

// Lo común a todos los subproyectos se declara una sola vez (como <groupId> y <version> del POM padre)
subprojects {
    group = "academia.microservicios"
    version = "1.0.0"
}
