package com.example.demo;

import java.util.List;
import org.springframework.data.domain.Page;

public record PaginaTareasDTO(
        List<TareaDTO> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext) {
    public static PaginaTareasDTO from(Page<TareaDTO> resultado) {
        return new PaginaTareasDTO(
                resultado.getContent(),
                resultado.getNumber(),
                resultado.getSize(),
                resultado.getTotalElements(),
                resultado.getTotalPages(),
                resultado.hasNext());
    }
}
