// tema-3/errores/ConstructorReutilizado.java — el builder NO es un texto: es una caja mutable compartida.
// Dos errores reales de consola: acumular sin vaciar, y entregar el builder en vez de una foto del contenido.
// Ejecutar: javac --release 25 -d out tema-3/errores/ConstructorReutilizado.java
//           java -Dstdout.encoding=UTF-8 -cp out ConstructorReutilizado
public class ConstructorReutilizado {

    public static void main(String[] args) {
        // Error 1: reutilizar el mismo builder para cada línea sin vaciarlo.
        StringBuilder linea = new StringBuilder();
        for (int i = 1; i <= 3; i++) {
            linea.append("envío ").append(i);
            System.out.println("con setLength olvidado: " + linea);
        }

        // Arreglo: vaciar (o crear uno nuevo) antes de la siguiente línea.
        StringBuilder limpia = new StringBuilder();
        for (int i = 1; i <= 3; i++) {
            limpia.setLength(0);
            limpia.append("envío ").append(i);
            System.out.println("con setLength(0)       : " + limpia);
        }

        // Error 2: dos referencias a la misma caja; «otra» cambia sin que nadie la toque.
        StringBuilder guia = new StringBuilder("RF-000123");
        StringBuilder otra = guia;
        guia.append(" · frágil");
        System.out.println("otra.toString()        : " + otra);
        System.out.println("otra == guia           : " + (otra == guia));

        // La foto sí es independiente: toString() crea un String nuevo e inmutable.
        String foto = guia.toString();
        guia.setLength(0);
        System.out.println("foto tras vaciar       : " + foto);
        System.out.println("guia tras vaciar       : «" + guia + "» · longitud " + guia.length());
    }
}
