// M3 · Tema 2 · por dentro: el dia que el $SwitchMap$ desaparece.
// Java 25. Ejecuta: javac --release 25 -d out ZonaExt.java SwitchConNull.java
//                  ls out                     -> SwitchConNull.class, SIN SwitchConNull$1.class
//                  javap -c -p -cp out SwitchConNull      -> invokedynamic ... enumSwitch
//                  javap -v -p -cp out SwitchConNull | awk '/^BootstrapMethods:/{f=1} f'
// Medido aqui: UsaZonaExterna.java (mismo enum, SIN «case null») si genera UsaZonaExterna$1 con
// $SwitchMap$ZonaExt. Este archivo hace el MISMO switch sobre el MISMO enum de otra unidad, pero con
// una rama «case null». Al aparecer case null, javac deja de usar el mapa y emite
// java/lang/runtime/SwitchBootstraps.enumSwitch con los nombres de las constantes como argumentos
// estaticos. El null entra al tableswitch como -1, no como un caso aparte.
public class SwitchConNull {
    static int tarifario(ZonaExt z) {
        return switch (z) {
            case NORTE -> 1200;
            case OCCIDENTE -> 1500;
            case ISLAS -> 1900;
            case null, default -> 2100;
        };
    }

    public static void main(String[] args) {
        for (ZonaExt z : ZonaExt.values()) {
            System.out.println(z + " -> " + tarifario(z));
        }
        System.out.println("null -> " + tarifario(null));
    }
}
