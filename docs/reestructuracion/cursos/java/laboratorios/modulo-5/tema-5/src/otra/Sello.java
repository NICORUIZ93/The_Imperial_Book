// Java · M5 · Tema 5 · un tipo que choca con un miembro estatico importado
// Se llama igual que `bodega.Envio.Sello`, que este paquete no ve: solo hace falta que los dos nombres
// lleguen al mismo archivo para que la importacion estatica pierda.
package otra;

public class Sello {
    String pauta() { return "Sello-otra"; }
}
