// Java · M5 · Tema 4 · error 7
// Un `static final` en blanco tiene que cerrarse en el inicializador de clase. Aqui no hay bloque `static`,
// asi que la variable no esta asignada cuando alguien la usa.
public class FinalEstaticoNuncaAsignado {

    static final int LOTE;

    public static void main(String[] args) {
        System.out.println(LOTE);
    }
}
