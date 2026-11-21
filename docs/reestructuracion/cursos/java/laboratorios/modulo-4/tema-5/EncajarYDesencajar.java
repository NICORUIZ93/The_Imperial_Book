// M4 · Tema 5 · Autoboxing: donde se encaja un int en una caja y donde se saca, sin escribir nada.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out EncajarYDesencajar
import java.util.ArrayList;
import java.util.List;

public class EncajarYDesencajar {

    // El parametro es Integer: quien llame con un int se encaja solo.
    static double tarifaPorKilo(Integer gramos) {
        return gramos / 1000.0 * 8500;             // aqui se DESENCAJA para la aritmetica
    }

    // Devolver int desde un Integer: se desencaja en el return.
    static int redondea(Integer valor) {
        return valor;
    }

    public static void main(String[] args) {
        Integer caja = 1250;                        // boxed: valueOf, no new
        int suelto = caja;                          // unboxed: intValue
        System.out.println("caja / suelto          : " + caja + " / " + suelto);

        System.out.println("parametro int -> Integer: " + tarifaPorKilo(3400));
        System.out.println("Integer -> int de vuelta: " + redondea(caja));

        // En la aritmetica las cajas se desempaquetan solas y el resultado se vuelve a empaquetar.
        Integer total = 0;
        for (Integer peso : List.of(1250, 3400, 890)) {
            total += peso;
        }
        System.out.println("suma con cajas         : " + total + " · clase " + total.getClass().getSimpleName());

        // valueOf (con cache) frente a new (siempre un objeto nuevo, y deprecado).
        Integer porValueOf = Integer.valueOf(30000);
        Integer porNew = new Integer(30000);        // deprecado: el compilador lo avisa
        System.out.println("valueOf vs new         : " + (porValueOf == porNew) + " · equals "
                + porValueOf.equals(porNew) + " · hashCode igual: " + (porValueOf.hashCode() == porNew.hashCode()));

        // Las listas guardan cajas: un List<Integer> jamas acepta un int suelto en su tipo.
        List<Integer> pesos = new ArrayList<>();
        pesos.add(1250);                            // add(int) se encaja a add(Integer)
        pesos.add(Integer.valueOf(3400));
        System.out.println("lista de cajas         : " + pesos + " · suma " + (pesos.get(0) + pesos.get(1)));

        // De texto a numero hay dos caminos: parseInt da un int suelto, valueOf da una caja.
        int desdeParse = Integer.parseInt("890");
        Integer desdeValueOf = Integer.valueOf("890");
        System.out.println("parseInt / valueOf     : " + desdeParse + " · " + desdeValueOf);
        // Uno es int suelto y el otro una caja: se comparan desempacando, no con == de identidad.
        System.out.println("int == Integer         : " + (desdeParse == desdeValueOf)
                + " · parseInt en contexto int: " + (desdeParse + 1));

        // Comparar cajas: == es identidad, equals es valor, compareTo es orden.
        Integer a = 1000, b = 1000;
        System.out.println("1000 == 1000 con cajas : " + (a == b) + " · equals " + a.equals(b)
                + " · compareTo " + a.compareTo(b));
    }
}
