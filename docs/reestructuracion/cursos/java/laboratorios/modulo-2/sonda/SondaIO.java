// Sonda de compilación: qué métodos de java.lang.IO existen realmente con --release 25.
// No es un ejemplo de la lección; se compila y se le quita. Ver tema-6.
import java.io.IOException;

public class SondaIO {
    public static void main(String[] args) throws IOException {
        String s1 = IO.read();
        String s2 = IO.read("p: ");
        String l1 = IO.readln();
        String l2 = IO.readln("p: ");
        Integer i1 = IO.readInteger();
        Integer i2 = IO.readInteger("p: ");
        Long g1 = IO.readLong();
        Long g2 = IO.readLong("p: ");
        Float f1 = IO.readFloat();
        Float f2 = IO.readFloat("p: ");
        Double d1 = IO.readDouble();
        Double d2 = IO.readDouble("p: ");
        Boolean b1 = IO.readBoolean();
        Boolean b2 = IO.readBoolean("p: ");
        Character c1 = IO.readChar();
        Character c2 = IO.readChar("p: ");
        byte[] y1 = IO.readBytes();
        byte[] y2 = IO.readBytes("p: ");
        IO.write("x");
        IO.write(1);
        IO.write(1L);
        IO.write(1.0f);
        IO.write(1.0);
        IO.write(true);
        IO.write('c');
        IO.writeln("x");
        IO.writeln();
        System.out.println(s1 + s2 + l1 + l2 + i1 + i2 + g1 + g2 + f1 + f2 + d1 + d2 + b1 + b2 + c1 + c2
                + y1.length + y2.length + IO.class.getName());
    }
}
