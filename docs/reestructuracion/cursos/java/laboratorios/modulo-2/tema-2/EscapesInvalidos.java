// tema-2/EscapesInvalidos.java — el fallo deliberado: translateEscapes no conoce las secuencias de barra + u.
// Ejecutar: javac --release 25 -d out EscapesInvalidos.java && java -cp out EscapesInvalidos
public class EscapesInvalidos {

    public static void main(String[] args) {
        String compilado = (char) 0x41 + "BC";              // 'A' + "BC"
        System.out.println("compilado como carácter : " + compilado + " · longitud " + compilado.length());

        // Mismo aspecto en pantalla, pero guardado como TEXTO: barra, u, 0, 0, 4, 1, B, C.
        String guardado = "\\" + "u0041BC";
        System.out.println("guardado como texto     : " + guardado + " · longitud " + guardado.length());
        System.out.println("primer carácter         : " + guardado.charAt(0) + " (código " + (int) guardado.charAt(0) + ")");

        // Aquí llega el fallo: translateEscapes traduce las secuencias de printf-style (\n, \t, \s…),
        // pero la forma de punto de código hexadecimal no está entre las que reconoce.
        System.out.println("translateEscapes        : " + guardado.translateEscapes());
    }
}
