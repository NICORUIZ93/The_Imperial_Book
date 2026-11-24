import java.security.SecureRandom;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;

public class Tokenizacion {

    /** Bóveda: el único componente que guarda números de tarjeta reales. */
    static class Boveda {
        private final Map<String, String> tarjetaPorToken = new HashMap<>();
        private final SecureRandom azar = new SecureRandom();

        String tokenizar(String numeroTarjeta) {
            byte[] bytes = new byte[12];
            azar.nextBytes(bytes);                      // aleatorio: no se deriva de la tarjeta
            String token = "tok_" + HexFormat.of().formatHex(bytes);
            tarjetaPorToken.put(token, numeroTarjeta);
            return token;
        }

        /** Solo el procesador de pagos, dentro del perímetro seguro, puede hacer esto. */
        String recuperar(String token) {
            String tarjeta = tarjetaPorToken.get(token);
            if (tarjeta == null) throw new IllegalArgumentException("token desconocido");
            return tarjeta;
        }
    }

    record PedidoGuardado(String id, String tokenTarjeta, String ultimos4) {}

    public static void main(String[] args) {
        var boveda = new Boveda();
        String tarjeta = "4111111111111111";            // tarjeta de prueba, no real

        String token = boveda.tokenizar(tarjeta);
        var pedido = new PedidoGuardado("P-1", token, tarjeta.substring(12));

        System.out.println("La tienda guarda: " + pedido.id() + ", token de "
                + pedido.tokenTarjeta().length() + " caracteres, tarjeta ****" + pedido.ultimos4());
        System.out.println("¿El token contiene la tarjeta? " + pedido.tokenTarjeta().contains(tarjeta));
        System.out.println("La bóveda la recupera: " + boveda.recuperar(token).equals(tarjeta));
    }
}
