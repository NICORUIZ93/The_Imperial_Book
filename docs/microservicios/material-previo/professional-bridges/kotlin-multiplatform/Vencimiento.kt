class Oferta(private val venceEnMs: Long, private val ahoraMs: () -> Long) {
    fun vencida(): Boolean = ahoraMs() >= venceEnMs
}

fun main() {
    var reloj = 1_000L
    val oferta = Oferta(31_000L) { reloj }
    check(!oferta.vencida())
    reloj = 30_999L
    check(!oferta.vencida())
    reloj = 31_000L
    check(oferta.vencida()) // El límite también pertenece al contrato.
    reloj = 31_001L
    check(oferta.vencida())
    println("Antes, límite y después: correctos")
}
