// M0 · Tema 4 · error común: un main privado no es un punto de entrada.
public class MainPrivado {
    private static void main(String[] args) {
        System.out.println("nunca se ejecuta");
    }
}
