// tema-1/Inmutables.java — qué objetos se crean de verdad y cuáles se reutilizan.
// Ejecutar: javac --release 25 -d out tema-1/Inmutables.java
//           java -Dstdout.encoding=UTF-8 -cp out Inmutables
public class Inmutables {

    public static void main(String[] args) {
        String guia = "RF-000123";

        // substring() devuelve un String NUEVO (desde JDK 7u6 no comparte la matriz interna).
        String prefijo = guia.substring(0, 5);
        System.out.println("substring(0,5)             : «" + prefijo + "» · equals «RF-00»: "
                + prefijo.equals("RF-00") + " · ¿misma referencia: " + (prefijo == "RF-00"));
        System.out.println("prefijo.intern() == \"RF-00\": " + (prefijo.intern() == "RF-00"));

        // Caso límite: cortar «todo» el texto devuelve el mismo objeto, sin copiar nada.
        System.out.println("substring(0, length) == this: " + (guia.substring(0, guia.length()) == guia));
        System.out.println("substring(5) == this        : " + (guia.substring(5) == guia));

        // replace() también devuelve un objeto nuevo cuando algo cambia...
        String conBarra = guia.replace('-', '/');
        System.out.println("replace cambia             : «" + conBarra + "» · ¿otro objeto: " + (conBarra != guia));
        // ...y el mismo cuando nada cambia.
        System.out.println("replace no encuentra       : ¿mismo objeto: " + (guia.replace('z', 'y') == guia));

        // toUpperCase() puede alargar o acortar el texto: otro objeto, otra longitud.
        String ciudad = "Bogotá";
        System.out.println("toUpperCase                : " + ciudad.toUpperCase() + " · longitud "
                + ciudad.toUpperCase().length() + " · ¿mismo objeto: " + (ciudad.toUpperCase() == ciudad));

        // valueOf no crea nada nuevo para un String; new String sí copia.
        System.out.println("valueOf(guia) == guia      : " + (String.valueOf(guia) == guia));
        System.out.println("new String(guia) == guia   : " + (new String(guia) == guia));
        System.out.println("new String(guia).equals    : " + (new String(guia).equals(guia)));

        // Un método no puede cambiar el contenido de un String: solo devolver otro.
        System.out.println("tras intentar 'mutar'      : " + mutar(guia) + " · la variable de arriba sigue siendo " + guia);
    }

    /** Intento de «poner en minúsculas el mismo objeto»: devuelve otro texto, no toca el original. */
    static String mutar(String s) {
        s = s.toLowerCase();
        return s;
    }
}
