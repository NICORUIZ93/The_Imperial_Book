package academia.ddd.ventas;

/** El agregado rechaza un cambio que rompería una de sus invariantes. */
public class ReglaDeNegocioViolada extends RuntimeException {

    public ReglaDeNegocioViolada(String mensaje) {
        super(mensaje);
    }
}
