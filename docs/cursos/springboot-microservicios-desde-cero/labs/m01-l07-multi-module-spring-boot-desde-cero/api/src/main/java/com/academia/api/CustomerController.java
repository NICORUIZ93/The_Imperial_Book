package com.academia.api;
import com.academia.domain.Customer;
import com.academia.domain.CustomerService;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/customers")
public class CustomerController {
    private final CustomerService service;
    public CustomerController(CustomerService service) { this.service = service; }
    @GetMapping("/{id}") public Customer get(@PathVariable("id") String id) { return service.byId(id); }
}
