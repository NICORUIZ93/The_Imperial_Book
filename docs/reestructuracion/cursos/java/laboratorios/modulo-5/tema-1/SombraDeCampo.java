// M5 · Tema 1 · el bug silencioso: un parametro que tapa al campo hace que `codigo = codigo` no escriba en el objeto.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out SombraDeCampo
public class SombraDeCampo {

    static class Mal {
        String codigo;

        Mal(String codigo) {
            codigo = codigo;      // mal: asigna el parametro contra si mismo; el campo no se toca
        }
    }

    static class Bien {
        String codigo;

        Bien(String codigo) {
            this.codigo = codigo; // bien: la mano izquierda dice de que objeto es la casilla
        }
    }

    public static void main(String[] args) {
        Mal mal = new Mal("RF-000123");
        Bien bien = new Bien("RF-000123");
        Bien copia = new Bien("RF-000123");
        System.out.println("campo con el parametro tapando : " + mal.codigo);
        System.out.println("campo con this.                : " + bien.codigo);
        System.out.println("dos Bien con el mismo codigo   : " + (bien == copia));
        Object cualquiera = new Object();
        System.out.println("contra Object si se puede      : " + (cualquiera == bien));
    }
}
