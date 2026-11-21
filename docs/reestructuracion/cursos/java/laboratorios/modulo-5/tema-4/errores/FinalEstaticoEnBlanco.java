// Java · M5 · Tema 4 · error 5
// Un `static final` en blanco tiene que rellenarse en el INICIALIZADOR DE CLASE, no en un constructor:
// si no, ni siquiera se puede escribir desde el constructor.
public class FinalEstaticoEnBlanco {

    static final int LOTE;             // en blanco, y sin bloque static que lo cierre

    FinalEstaticoEnBlanco() {
        LOTE = 7;                      // error: cannot assign a value to static final variable LOTE
    }

    public static void main(String[] args) {
        System.out.println(LOTE);      // y aqui: variable LOTE might not have been initialized
    }
}
