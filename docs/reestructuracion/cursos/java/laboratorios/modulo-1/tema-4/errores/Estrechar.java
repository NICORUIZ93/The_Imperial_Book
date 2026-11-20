// No compila: estrechar sin casting, y sumar dos byte (el resultado es int).
public class Estrechar {
    public static void main(String[] args) {
        double tarifa = 11399.6;
        int pesos = tarifa;
        long carga = 3_000_000_000L;
        int gramos = carga;
        byte a = 10, b = 20;
        byte suma = a + b;
        float precio = 19.99;
    }
}
