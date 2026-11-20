// No compila: hay un camino (distanciaKm <= 300) en el que categoria no recibe valor.
public class SinInicializar {
    public static void main(String[] args) {
        int distanciaKm = 415;
        String categoria;
        if (distanciaKm > 300) {
            categoria = "larga distancia";
        }
        System.out.println(categoria);
    }
}
