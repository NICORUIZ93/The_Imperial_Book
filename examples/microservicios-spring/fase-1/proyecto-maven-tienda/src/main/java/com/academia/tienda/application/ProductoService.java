package com.academia.tienda.application;

import com.academia.tienda.domain.Producto;
import com.academia.tienda.persistence.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProductoService {

    private final ProductoRepository repository;

    public ProductoService(ProductoRepository repository) {
        this.repository = repository;
    }

    public List<Producto> listar() {
        return repository.findAll();
    }

    @Transactional
    public Producto crear(String nombre, BigDecimal precio) {
        return repository.save(new Producto(nombre, precio));
    }
}
