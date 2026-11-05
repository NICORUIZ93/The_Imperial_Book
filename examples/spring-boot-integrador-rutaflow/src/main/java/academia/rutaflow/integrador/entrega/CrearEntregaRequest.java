package academia.rutaflow.integrador.entrega;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CrearEntregaRequest(@NotBlank @Size(max = 200) String destinatario) {}
