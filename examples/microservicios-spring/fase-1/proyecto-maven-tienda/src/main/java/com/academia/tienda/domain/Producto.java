package com.academia.tienda.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String nombre;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;

    protected Producto() {
        // JPA necesita un constructor sin argumentos para reconstruir la entidad.
    }

    public Producto(String nombre, BigDecimal precio) {
        this.nombre = Objects.requireNonNull(nombre, "nombre no puede ser nulo").trim();
        this.precio = Objects.requireNonNull(precio, "precio no puede ser nulo");
        if (this.nombre.isBlank()) {
            throw new IllegalArgumentException("nombre no puede estar vacío");
        }
        if (this.nombre.length() > 160) {
            throw new IllegalArgumentException("nombre no puede superar 160 caracteres");
        }
        if (this.precio.signum() <= 0) {
            throw new IllegalArgumentException("precio debe ser mayor que cero");
        }
        this.precio = this.precio.setScale(2, java.math.RoundingMode.UNNECESSARY);
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public BigDecimal getPrecio() {
        return precio;
    }
}
