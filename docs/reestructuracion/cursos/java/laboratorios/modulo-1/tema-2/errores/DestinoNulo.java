// Compila, pero falla al ejecutar: se usa una referencia que no apunta a ningún objeto.
public class DestinoNulo {
    public static void main(String[] args) {
        String destino = null;
        System.out.println(destino.length());
    }
}
