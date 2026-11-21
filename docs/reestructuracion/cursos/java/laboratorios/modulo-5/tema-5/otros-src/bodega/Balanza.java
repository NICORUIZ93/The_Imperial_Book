// Java · M5 · Tema 5 · el MISMO paquete declarado en OTRA carpeta
// Este archivo no vive junto a `Envio.java`: esta en `otros-src/bodega/`. Aun asi es un miembro mas de
// `bodega`, y por eso puede tocar `Envio.FIRMA`, que es de paquete. La carpeta es opcion del host; el
// nombre binario lo pone la declaracion de paquete.
package bodega;

class Balanza {

    public static void mira() {
        System.out.println("FIRMA desde otra carpeta : " + Envio.FIRMA);
        System.out.println("nombre binario de Balanza : " + Balanza.class.getName());
        System.out.println("vecino de paquete         : " + new Flete().rota());
    }

    public static void main(String[] args) {
        mira();
        Envio.dicePaquete();
    }
}
