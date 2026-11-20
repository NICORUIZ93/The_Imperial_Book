package academia.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

/** DTO de SALIDA: el contrato público. No tiene hashClave ni notaInterna. */
@JsonInclude(JsonInclude.Include.NON_NULL)          // los campos null no se escriben
public record ClienteResponse(
        long id,
        @JsonProperty("nombre_completo") String nombreCompleto,
        String email,
        String telefono,
        @JsonProperty("cliente_desde") @JsonFormat(pattern = "dd/MM/yyyy") LocalDate fechaRegistro) { }
