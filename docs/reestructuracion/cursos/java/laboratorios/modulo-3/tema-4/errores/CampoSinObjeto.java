// M3 · Tema 4 · el campo de instancia no existe todavia cuando el metodo es static.
// Java 25. Ejecuta: javac --release 25 -d out CampoSinObjeto.java   (debe fallar)
// Medido aqui, el mensaje exacto de javac en la linea 13:
//   error: non-static variable conduccion cannot be referenced from a static context
// main es static: pertenece a la clase, no a ningun objeto. El campo pertenece a CADA objeto, y
// en este punto no hay ninguno. La salida no es quitar el static del campo (eso cambia el
// programa), es crear el objeto y leer el campo a traves de el, como hace Llamadas con
// desdeInstancia(new Llamadas()).
public class CampoSinObjeto {
    private final String conduccion = "ruta 12";

    public static void main(String[] args) {
        System.out.println(conduccion);          // <- aqui no hay objeto todavia
    }
}
