package rutaflow.outbox;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * M4 T2 · Polling publisher: lee lotes pendientes de la tabla outbox, los entrega al broker y los marca
 * como publicados en la misma transacción que los bloqueó.
 *
 * Variables: PGURL (por defecto jdbc:postgresql://127.0.0.1:5432/rutaflow), PGUSER, PGPASSWORD.
 * Argumentos: --una-vez            procesa un lote y termina
 *             --caer-tras-publicar  publica el lote y termina sin COMMIT (fallo deliberado)
 */
public final class PublicadorOutbox {
  record Mensaje(long id, String eventoId, String tipo, String payload) { }

  /** Puerto hacia el broker. En el laboratorio imprime; en M7 se reemplaza por un broker real. */
  interface Broker {
    void publicar(Mensaje mensaje);
  }

  private static final String RECLAMAR = """
      SELECT id, evento_id::text, tipo, payload::text
      FROM outbox
      WHERE publicado_en IS NULL
      ORDER BY id
      LIMIT ?
      FOR UPDATE SKIP LOCKED""";
  private static final String MARCAR = "UPDATE outbox SET publicado_en = now() WHERE id = ?";

  private final Connection conexion;
  private final Broker broker;
  private final int tamanoLote;

  PublicadorOutbox(Connection conexion, Broker broker, int tamanoLote) throws SQLException {
    this.conexion = conexion;
    this.conexion.setAutoCommit(false);
    this.broker = broker;
    this.tamanoLote = tamanoLote;
  }

  /** Devuelve cuántos mensajes publicó. Si el broker falla, la transacción se revierte y el lote se reintenta. */
  int publicarLote(boolean caerTrasPublicar) throws SQLException {
    List<Mensaje> lote = new ArrayList<>();
    try (PreparedStatement consulta = conexion.prepareStatement(RECLAMAR)) {
      consulta.setInt(1, tamanoLote);
      try (var filas = consulta.executeQuery()) {
        while (filas.next()) {
          lote.add(new Mensaje(filas.getLong(1), filas.getString(2), filas.getString(3), filas.getString(4)));
        }
      }
    }
    try {
      for (Mensaje mensaje : lote) broker.publicar(mensaje);
      if (caerTrasPublicar) {
        System.out.println("CAIDA tras publicar " + lote.size() + " mensaje(s) y antes del COMMIT");
        Runtime.getRuntime().halt(1); // simula un kill -9: sin COMMIT ni limpieza
      }
      try (PreparedStatement marcar = conexion.prepareStatement(MARCAR)) {
        for (Mensaje mensaje : lote) {
          marcar.setLong(1, mensaje.id());
          marcar.addBatch();
        }
        marcar.executeBatch();
      }
      conexion.commit();
      return lote.size();
    } catch (RuntimeException | SQLException error) {
      conexion.rollback();
      throw error;
    }
  }

  public static void main(String[] args) throws Exception {
    String url = System.getenv().getOrDefault("PGURL", "jdbc:postgresql://127.0.0.1:5432/rutaflow");
    boolean unaVez = List.of(args).contains("--una-vez");
    boolean caer = List.of(args).contains("--caer-tras-publicar");
    Broker consola = m -> System.out.println("BROKER <- " + m.tipo() + " evento=" + m.eventoId() + " " + m.payload());
    try (Connection conexion = DriverManager.getConnection(url, System.getenv("PGUSER"), System.getenv("PGPASSWORD"))) {
      var publicador = new PublicadorOutbox(conexion, consola, 10);
      do {
        int publicados = publicador.publicarLote(caer);
        System.out.println("LOTE publicados=" + publicados);
        if (!unaVez && publicados == 0) Thread.sleep(500); // sin pendientes: espera antes de volver a consultar
      } while (!unaVez);
    }
  }
}
