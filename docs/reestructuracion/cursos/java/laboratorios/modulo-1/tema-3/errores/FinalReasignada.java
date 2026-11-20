// No compila: una variable final solo se asigna una vez.
public class FinalReasignada {
    public static void main(String[] args) {
        final int TOPE_GRAMOS = 30_000;
        TOPE_GRAMOS = 35_000;
        System.out.println(TOPE_GRAMOS);
    }
}
