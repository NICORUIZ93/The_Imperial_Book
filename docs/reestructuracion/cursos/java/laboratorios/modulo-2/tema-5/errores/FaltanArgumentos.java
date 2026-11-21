// tema-5/errores/FaltanArgumentos.java — tantas conversiones como argumentos: si faltan, no se imprime nada.
// Ejecutar: javac --release 25 -d out tema-5/errores/FaltanArgumentos.java && java -cp out FaltanArgumentos
public class FaltanArgumentos {

    public static void main(String[] args) {
        System.out.printf("guía %s · destino %s · peso %d g%n", "RF-000123", "Bogotá");
    }
}
