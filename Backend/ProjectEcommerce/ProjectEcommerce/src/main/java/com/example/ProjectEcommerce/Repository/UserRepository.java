package com.example.ProjectEcommerce.Repository;

import com.example.ProjectEcommerce.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmailAndPassword(String email, String password);
    User findByEmail(String email); // optional but useful for checking existing users
}
