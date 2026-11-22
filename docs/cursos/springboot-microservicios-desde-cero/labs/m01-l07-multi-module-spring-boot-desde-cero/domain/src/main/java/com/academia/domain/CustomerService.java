package com.academia.domain;
public class CustomerService {
    public Customer byId(String id) { return new Customer(id, "Cliente-" + id); }
}
