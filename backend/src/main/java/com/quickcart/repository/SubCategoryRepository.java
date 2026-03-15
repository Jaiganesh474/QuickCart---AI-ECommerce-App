package com.quickcart.repository;

import com.quickcart.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
    Optional<SubCategory> findByNameAndCategoryId(String name, Long categoryId);

    List<SubCategory> findByCategoryId(Long categoryId);
}
