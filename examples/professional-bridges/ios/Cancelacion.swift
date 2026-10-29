import Foundation

@main struct Demo {
    static func main() async {
        let consulta = Task { () throws -> String in
            try await Task.sleep(for: .seconds(5))
            try Task.checkCancellation()
            return "ENV-42 recibido"
        }
        // Marcamos la tarea antes de aceptar su resultado.
        consulta.cancel()
        do {
            let resultado = try await consulta.value
            print(resultado)
        } catch is CancellationError {
            print("Consulta cancelada; no se publica resultado")
        } catch {
            print("Fallo real: \(error)")
        }
    }
}
