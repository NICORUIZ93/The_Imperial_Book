// M5 · Tema 3 · por dentro: los cuatro niveles NO son cuatro palabras del fuente, son bits del .class.
// javac --release 25 -encoding UTF-8 -d out tema-3/por-dentro/NivelesEnClass.java
// javap -p  -cp out NivelesEnClass           -> las palabras que se ven
// javap -v -cp out NivelesEnClass | grep flags -> los bits que son
// javap -c -p -cp out NivelesEnClass         -> como se llama a cada uno
//
// Tres cosas se comprueban aqui con el volcado y no de memoria:
// 1) el acceso de paquete se ve como la AUSENCIA de bandera (flags: 0x0000), no como una bandera;
// 2) un metodo publico y uno private, llamados desde la MISMA clase, salen con la MISMA instruccion
//    en --release 25: invokevirtual. Con --release 8 el private salia con invokespecial. El cambio
//    coincide con los nest de JDK 11, que es lo que permite el acceso directo (ver NidoPrivate.java);
// 3) un metodo de interface escrito SIN modificador sale public abstract en el .class (§6.6.1).
public class NivelesEnClass {

    public int publico;
    protected int protegido;
    int dePaquete;
    private int privado;

    // Interface: sin escribir nada, el metodo sale public en el volcado (§6.6.1).
    interface Tarifa {
        int calcula();
    }

    public void visible() {
        System.out.println("visible");
    }

    private void oculto() {
        System.out.println("oculto");
    }

    void llamar() {
        visible();
        oculto();
    }

    public static void main(String[] args) {
        NivelesEnClass n = new NivelesEnClass();
        n.dePaquete = 3;
        n.privado = 4;
        n.llamar();
        System.out.println("publico+protegido+paquete+privado = " + n.publico + n.protegido + n.dePaquete + n.privado);
    }
}
