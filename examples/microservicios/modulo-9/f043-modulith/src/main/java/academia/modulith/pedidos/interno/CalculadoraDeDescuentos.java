package academia.modulith.pedidos.interno;

import org.springframework.stereotype.Component;

/** Detalle interno de pedidos: ningún otro módulo debe usarlo (Spring Modulith lo comprueba). */
@Component
public class CalculadoraDeDescuentos {

    public int porcentajePara(int cantidad) {
        return cantidad >= 10 ? 5 : 0;
    }
}
