package academia.pedidos;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Optional;
import javax.sql.DataSource;

/** JDBC directo para comparar PreparedStatement y transacciones con JPA. */
public final class EnvioDao {
    private final DataSource dataSource;

    public EnvioDao(DataSource dataSource) { this.dataSource = dataSource; }

    public Optional<String> buscarEstado(String referencia) throws SQLException {
        String sql = "select estado from envio where referencia = ?";
        try (Connection connection = dataSource.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setString(1, referencia);
            try (var result = statement.executeQuery()) {
                return result.next() ? Optional.of(result.getString("estado")) : Optional.empty();
            }
        }
    }

    public void liquidar(String referencia, BigDecimal importe) throws SQLException {
        String insertarCobro = "insert into cobro(referencia, importe) values (?, ?)";
        String cambiarEstado = "update envio set estado = 'LIQUIDADO' where referencia = ?";
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try {
                try (var cobro = connection.prepareStatement(insertarCobro)) {
                    cobro.setString(1, referencia);
                    cobro.setBigDecimal(2, importe);
                    cobro.executeUpdate();
                }
                try (var envio = connection.prepareStatement(cambiarEstado)) {
                    envio.setString(1, referencia);
                    if (envio.executeUpdate() != 1) {
                        throw new SQLException("No existe el envío: " + referencia);
                    }
                }
                connection.commit();
            } catch (SQLException error) {
                connection.rollback();
                throw error;
            }
        }
    }
}
