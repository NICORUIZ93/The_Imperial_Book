// Java · M5 · Tema 5 · el paquete que se importa desde afuera
// Un paquete es un espacio de nombres, no una carpeta: lo declara la linea `package`, y varias carpetas
// pueden declararlo a la vez (ver `otros-src/bodega/Balanza.java`).
package bodega;

public class Envio {

    public static final int LOTE = 24;   // constante: quien la importa recibe el 24 horneado
    public static int vivas = 3;         // no constante: se lee por referencia al campo de esta clase

    static final String FIRMA = "bodega";   // acceso de paquete: lo ve Balanza, que vive en otra carpeta

    int gramos = 1250;                      // de instancia: `import static` de esto es un error

    public static class Sello {
        public static String pauta() {
            return "Sello-RutaFlow";
        }
    }

    public static void dicePaquete() {
        System.out.println("paquete de Envio     : " + Envio.class.getPackageName());
        System.out.println("nombre binario       : " + Envio.class.getName());
    }
}
