// M5 · Tema 1 · error 5: dos referencias de clases sin parentesco no se pueden comparar, ni para equivocarse.
// Java 25. Esperado: NO compila. javac --release 25 -d out errores/ComparaTiposDistintos.java
public class ComparaTiposDistintos {

    static class Mal {
        String codigo;

        Mal(String codigo) {
            codigo = codigo;      // sombrea el campo: esta linea ya la estudiaste en SombraDeCampo.java
        }
    }

    static class Bien {
        String codigo;

        Bien(String codigo) {
            this.codigo = codigo;
        }
    }

    public static void main(String[] args) {
        Mal mal = new Mal("RF-000123");
        Bien bien = new Bien("RF-000123");
        System.out.println(mal.codigo + " | " + bien.codigo);
        System.out.println(mal != bien);              // mal: javac no permite ni preguntar
    }
}
