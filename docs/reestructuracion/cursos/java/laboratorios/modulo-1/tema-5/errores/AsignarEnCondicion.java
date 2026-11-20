// No compila: = asigna, == compara. En Java una condición debe ser boolean.
public class AsignarEnCondicion {
    public static void main(String[] args) {
        int pesoGramos = 2500;
        if (pesoGramos = 0) {
            System.out.println("sin peso");
        }
        byte cajas = 10;
        cajas = cajas + 5;
    }
}
