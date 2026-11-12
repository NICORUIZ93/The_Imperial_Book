package academia.pedidos;

import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class EnvioJdbcRepository {
    private static final String COLUMNAS = "referencia, estado";
    private final JdbcTemplate jdbc;

    public EnvioJdbcRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public int crear(String referencia, String estado) {
        return jdbc.update(
            "insert into envio(referencia, estado) values (?, ?)", referencia, estado);
    }

    public Optional<EnvioRegistro> buscar(String referencia) {
        return jdbc.query(
            "select " + COLUMNAS + " from envio where referencia = ?",
            (rs, fila) -> new EnvioRegistro(rs.getString("referencia"), rs.getString("estado")),
            referencia
        ).stream().findFirst();
    }

    public List<EnvioRegistro> porEstadoOrdenados(String estado, String ordenarPor) {
        String columna = switch (ordenarPor) {
            case "referencia" -> "referencia";
            case "estado" -> "estado";
            default -> throw new IllegalArgumentException("Orden no permitido: " + ordenarPor);
        };
        return jdbc.query(
            "select " + COLUMNAS + " from envio where estado = ? order by " + columna,
            (rs, fila) -> new EnvioRegistro(rs.getString("referencia"), rs.getString("estado")),
            estado
        );
    }
}
