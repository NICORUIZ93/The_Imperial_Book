// M1 · Tema 4 · nivel maestro: cada conversión es una instrucción de bytecode (i2l, i2d, d2i, l2i, i2b, i2c).
// Mira: javac -d out Conv.java && javap -c -cp out Conv
public class Conv {
    static void f(int gramos, double tarifa, long carga) {
        long l = gramos;
        double d = gramos;
        int i = (int) tarifa;
        int j = (int) carga;
        byte b = (byte) gramos;
        char c = (char) gramos;
        double kilos = gramos / 1000;
        double bien = gramos / 1000.0;
    }
}
