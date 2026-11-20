package academia.motores;

import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
@Profile("mysql")
class InventarioMysql implements Inventario {
    private final JdbcClient jdbc;

    InventarioMysql(JdbcClient jdbc) { this.jdbc = jdbc; }

    @Override
    public void sumarStock(String sku, String nombre, int cantidad) {
        // "AS nuevo" reemplaza a VALUES(stock), obsoleto desde MySQL 8.0.20.
        jdbc.sql("""
                INSERT INTO productos (sku, nombre, stock) VALUES (:sku, :nombre, :cantidad) AS nuevo
                ON DUPLICATE KEY UPDATE
                stock = productos.stock + nuevo.stock, actualizado = CURRENT_TIMESTAMP(6)
                """)
            .param("sku", sku).param("nombre", nombre).param("cantidad", cantidad)
            .update();
    }
}
