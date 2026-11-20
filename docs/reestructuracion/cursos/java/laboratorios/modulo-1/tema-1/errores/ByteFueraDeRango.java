// No compila: 200 no cabe en byte (-128 a 127).
public class ByteFueraDeRango {
    public static void main(String[] args) {
        byte cajas = 200;
        System.out.println(cajas);
    }
}
