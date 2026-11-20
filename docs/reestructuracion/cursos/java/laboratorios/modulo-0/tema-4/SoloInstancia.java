// M0 · Tema 4 · nivel maestro: con main de instancia, el lanzador crea primero el objeto.
// Ejecuta: java SoloInstancia.java
public class SoloInstancia {
    SoloInstancia() {
        System.out.println("1. el lanzador llama al constructor sin parámetros");
    }

    void main() {
        System.out.println("2. y después llama a main() sobre ese objeto");
    }
}
