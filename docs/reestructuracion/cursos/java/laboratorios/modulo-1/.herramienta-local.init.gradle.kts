// Herramienta local de verificación (no forma parte del curso):
// esta máquina no tiene JDK 25, así que fuerza el toolchain al 27 instalado.
projectsEvaluated {
    rootProject.allprojects {
        extensions.findByType(JavaPluginExtension::class.java)?.apply {
            toolchain.languageVersion.set(JavaLanguageVersion.of(27))
        }
    }
}
