package com.example.demo;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    @Query("select c from Cliente c")
    List<Cliente> buscarSinPedidos();

    @Query("select distinct c from Cliente c left join fetch c.pedidos")
    List<Cliente> buscarTodosConPedidos();

    @Override
    @EntityGraph(attributePaths = "pedidos")
    List<Cliente> findAll();
}
