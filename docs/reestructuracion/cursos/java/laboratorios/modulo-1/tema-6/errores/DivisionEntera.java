// Compila, pero falla al ejecutar: entre enteros la división por cero sí lanza excepción.
public class DivisionEntera {
    public static void main(String[] args) {
        int paquetes = 0;
        System.out.println(7600 / 0.0);
        System.out.println(7600 / paquetes);
    }
}
