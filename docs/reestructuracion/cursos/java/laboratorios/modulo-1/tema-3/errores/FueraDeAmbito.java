// No compila: recargo se declaró dentro del bloque y ya no existe fuera; peso se declara dos veces.
public class FueraDeAmbito {
    public static void main(String[] args) {
        int peso = 2500;
        {
            int recargo = 500;
            int peso = 100;
        }
        System.out.println(peso + recargo);
    }
}
