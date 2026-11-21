// Java · M5 · Tema 5 · como ve la JVM los nombres de paquete
// El nombre binario (`getName`) es el que ve la máquina virtual; el canonico (`getCanonicalName`) es el que escribe
// el programador. Los dos se construyen con el prefijo del paquete, y los arreglos le ponen corchetes
// DELANTERO del prefijo. Las primitivas y el paquete sin nombre no tienen prefijo.
import bodega.Envio;

public class NombresEnRuntime {

    public static void main(String[] args) {
        Class<?>[] cs = { NombresEnRuntime.class, Envio.class, Envio.Sello.class,
                          Envio[].class, String.class, int.class };
        for (Class<?> c : cs) {
            System.out.printf("binario=%-24s paquete=[%s] canonico=%s%n",
                    c.getName(), c.getPackageName(), c.getCanonicalName());
        }
    }
}
