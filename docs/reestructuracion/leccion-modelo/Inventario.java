// Lección modelo · ejemplo realista: existencias por (SKU, bodega). Java 25. Ejecuta: java Inventario.java
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class Inventario {
    // ANTES: clave mutable. El equipo le puso setters «por comodidad».
    static final class ClaveMutable {
        private String sku;
        private String bodega;
        ClaveMutable(String sku, String bodega) { this.sku = sku; this.bodega = bodega; }
        void setBodega(String bodega) { this.bodega = bodega; }
        @Override public boolean equals(Object o) {
            return o instanceof ClaveMutable c && sku.equals(c.sku) && bodega.equals(c.bodega);
        }
        @Override public int hashCode() { return Objects.hash(sku, bodega); }
        @Override public String toString() { return sku + "@" + bodega; }
    }

    // DESPUÉS: clave inmutable.
    record Clave(String sku, String bodega) {}

    public static void main(String[] args) {
        Map<ClaveMutable, Integer> existencias = new HashMap<>();
        ClaveMutable clave = new ClaveMutable("TEC-1", "BOG");
        existencias.put(clave, 40);

        clave.setBodega("MED");   // alguien «corrige» la bodega después de guardar

        System.out.println("ANTES (clave mutable)");
        System.out.println("  tamaño del mapa:            " + existencias.size());
        System.out.println("  get con la misma instancia: " + existencias.get(clave));
        System.out.println("  get con TEC-1@BOG:          " + existencias.get(new ClaveMutable("TEC-1", "BOG")));
        System.out.println("  get con TEC-1@MED:          " + existencias.get(new ClaveMutable("TEC-1", "MED")));
        System.out.println("  ¿aparece al recorrerlo?     " + existencias.keySet());

        Map<Clave, Integer> seguro = new HashMap<>();
        seguro.put(new Clave("TEC-1", "BOG"), 40);
        // Para «mover» existencias se quita una entrada y se pone otra: la clave no cambia nunca.
        Integer cantidad = seguro.remove(new Clave("TEC-1", "BOG"));
        seguro.put(new Clave("TEC-1", "MED"), cantidad);
        System.out.println("DESPUÉS (record inmutable)");
        System.out.println("  get con TEC-1@MED:          " + seguro.get(new Clave("TEC-1", "MED")));
        System.out.println("  get con TEC-1@BOG:          " + seguro.get(new Clave("TEC-1", "BOG")));
    }
}
