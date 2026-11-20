package academia.errores;

/** Excepción de NEGOCIO: no sabe nada de HTTP. El ControllerAdvice la traduce. */
public class ProductoNoEncontradoException extends RuntimeException {
    private final String sku;

    public ProductoNoEncontradoException(String sku) {
        super("No existe el producto con SKU " + sku);
        this.sku = sku;
    }

    public String sku() { return sku; }
}
