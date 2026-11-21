// M3 · Tema 2 · por dentro: el $SwitchMap$ que si aparece cuando el enum viene de otra unidad.
// Java 25. Ejecuta: javac --release 25 -d out ZonaExt.java UsaZonaExterna.java
//                  javap -c -p -cp out UsaZonaExterna
//                  javap -c -p -cp out 'UsaZonaExterna$1'
// Medido aqui: la clase sintetica UsaZonaExterna$1 declara static final int[] $SwitchMap$ZonaExt,
// la rellena en su bloque estatico leyendo ordinal() de cada constante, y cada escritura va
// protegida por catch (NoSuchFieldError). El switch de UsaZonaExterna no mira el ordinal del enum:
// mira el valor que este mapa le asigno, con lookupswitch.
public class UsaZonaExterna {
    static int tarifario(ZonaExt z) {
        int r;
        switch (z) {
            case OCCIDENTE: r = 1500; break;
            case ISLAS: r = 1900; break;
            default: r = 2100;
        }
        return r;
    }

    public static void main(String[] args) {
        for (ZonaExt z : ZonaExt.values()) System.out.println(z + " -> " + tarifario(z));
    }
}
