package com.quickcart.repository;

import com.quickcart.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);

    List<Product> findBySubCategoryId(Long subCategoryId);

    List<Product> findByIsDailyOfferTrue();

    List<Product> findByNameContainingIgnoreCase(String name);

    Optional<Product> findByName(String name);
}
