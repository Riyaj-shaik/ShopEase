package com.example.ProjectEcommerce.Repository;


import com.example.ProjectEcommerce.Entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
