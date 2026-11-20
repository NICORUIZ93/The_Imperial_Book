package academia.contenedores;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

/** Usa dos cosas que SOLO tiene PostgreSQL (o que H2 imita a medias): ON CONFLICT ... RETURNING e ILIKE. */
@Repository
public class ClienteRepositorio {

    private final JdbcClient jdbc;

    ClienteRepositorio(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /** Inserta o suma una visita en UNA sentencia atómica; devuelve el total de visitas. */
    public int registrarVisita(String email, String nombre) {
        return jdbc.sql("""
                INSERT INTO cliente (email, nombre) VALUES (:email, :nombre)
                ON CONFLICT (email) DO UPDATE SET visitas = cliente.visitas + 1
                RETURNING visitas
                """)
                .param("email", email).param("nombre", nombre)
                .query(Integer.class).single();
    }

    /** Búsqueda sin distinguir mayúsculas. */
    public List<Cliente> buscarPorNombre(String fragmento) {
        return jdbc.sql("SELECT email, nombre, visitas FROM cliente WHERE nombre ILIKE :patron ORDER BY email")
                .param("patron", "%" + fragmento + "%")
                .query(Cliente.class).list();
    }
}
