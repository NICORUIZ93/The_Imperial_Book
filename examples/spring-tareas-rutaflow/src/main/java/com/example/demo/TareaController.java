package com.example.demo;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.Page;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tareas")
@Tag(name = "Tareas", description = "Crear y consultar tareas")
public class TareaController {
    private final ServicioTareas servicio;

    public TareaController(ServicioTareas servicio) {
        this.servicio = servicio;
    }

    @PostMapping
    @Operation(summary = "Crear una tarea")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tarea creada"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))})
    public ResponseEntity<TareaDTO> crear(
            @Valid @RequestBody CrearTareaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servicio.crear(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar una tarea por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tarea encontrada"),
            @ApiResponse(responseCode = "404", description = "Tarea inexistente",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))})
    public ResponseEntity<TareaDTO> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(servicio.buscar(id));
    }

@GetMapping
@Operation(summary = "Listar tareas por página")
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Página de tareas"),
        @ApiResponse(responseCode = "400", description = "Parámetros inválidos",
                content = @Content(schema = @Schema(implementation = ApiError.class)))})
public ResponseEntity<PaginaTareasDTO> listar(
        @RequestParam(defaultValue = "0") @Min(0) @Max(1000) int page,
        @RequestParam(defaultValue = "20") @Min(1) @Max(50) int size) {
    Page<TareaDTO> resultado = servicio.listar(page, size);
    return ResponseEntity.ok(PaginaTareasDTO.from(resultado));
}

}
