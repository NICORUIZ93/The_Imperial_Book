package academia.motores;

import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
@Profile("postgres")
class InventarioPostgres implements Inventario {
    private final JdbcClient jdbc;

    InventarioPostgres(JdbcClient jdbc) { this.jdbc = jdbc; }

    @Override
    public void sumarStock(String sku, String nombre, int cantidad) {
        jdbc.sql("""
                INSERT INTO productos (sku, nombre, stock) VALUES (:sku, :nombre, :cantidad)
                ON CONFLICT (sku) DO UPDATE
                SET stock = productos.stock + EXCLUDED.stock, actualizado = now()
                """)
            .param("sku", sku).param("nombre", nombre).param("cantidad", cantidad)
            .update();
    }
}
