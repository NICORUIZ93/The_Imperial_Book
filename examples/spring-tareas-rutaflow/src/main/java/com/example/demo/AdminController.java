package com.example.demo;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminController {
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/api/entregas/{id}")
    public void eliminar(@PathVariable long id) { }
}
