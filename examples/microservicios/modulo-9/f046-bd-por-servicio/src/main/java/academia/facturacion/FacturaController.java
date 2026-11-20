package academia.facturacion;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * Responde con datos propios: la tabla cargos y la copia local envios_conocidos.
 * NO consulta la base de Envíos: no puede (no tiene permiso) y no debe (acoplamiento por esquema).
 */
@RestController
class FacturaController {

    private final JdbcClient jdbc;

    FacturaController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    record Factura(String envioId, long totalCop, String estadoEnvio) {
    }

    @GetMapping("/facturas/{envioId}")
    ResponseEntity<Factura> factura(@PathVariable String envioId) {
        return jdbc.sql("""
                SELECT c.envio_id, c.total_cop, e.estado
                FROM cargos c JOIN envios_conocidos e USING (envio_id)
                WHERE c.envio_id = :id""")
            .param("id", envioId)
            .query((rs, n) -> new Factura(rs.getString("envio_id"), rs.getLong("total_cop"), rs.getString("estado")))
            .optional()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
