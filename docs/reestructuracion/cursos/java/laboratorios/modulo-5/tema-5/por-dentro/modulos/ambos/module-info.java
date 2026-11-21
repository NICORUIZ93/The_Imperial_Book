// Java · M5 · Tema 5 · paquete partido entre modulos, el lector que ve los dos
// JLS 7.4.3: un tipo es univocamente visible solo si su paquete viene de UN modulo. Al que lee los dos,
// javac le cierra la compilacion entera.
module ambos {
    requires uno;
    requires dos;
}
