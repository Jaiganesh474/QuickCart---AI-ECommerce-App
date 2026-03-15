package com.quickcart.controller;

import com.quickcart.entity.Category;
import com.quickcart.entity.SubCategory;
import com.quickcart.repository.CategoryRepository;
import com.quickcart.repository.SubCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/subcategories")
public class SubCategoryController {

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<SubCategory>> getAllSubCategories() {
        return ResponseEntity.ok(subCategoryRepository.findAll());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<SubCategory>> getByCategoryId(@PathVariable Long categoryId) {
        return ResponseEntity.ok(subCategoryRepository.findByCategoryId(categoryId));
    }

    @PostMapping
    public ResponseEntity<?> addSubCategory(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String description = (String) request.get("description");
        String imageUrl = (String) request.get("imageUrl");
        Long categoryId;

        try {
            categoryId = Long.valueOf(request.get("categoryId").toString());
        } catch (Exception e) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Valid Category ID is required");
            return ResponseEntity.badRequest().body(resp);
        }

        if (name == null || name.trim().isEmpty()) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "SubCategory name is required");
            return ResponseEntity.badRequest().body(resp);
        }

        Category category = categoryRepository.findById(categoryId).orElse(null);
        if (category == null) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Category not found");
            return ResponseEntity.badRequest().body(resp);
        }

        if (subCategoryRepository.findByNameAndCategoryId(name, categoryId).isPresent()) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "SubCategory already exists in this category");
            return ResponseEntity.badRequest().body(resp);
        }

        SubCategory subCategory = new SubCategory();
        subCategory.setName(name);
        subCategory.setDescription(description);
        subCategory.setCategory(category);
        subCategory.setImageUrl(imageUrl);
        subCategoryRepository.save(subCategory);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "SubCategory added successfully");
        response.put("subCategory", subCategory);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubCategory(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String description = (String) request.get("description");
        String imageUrl = (String) request.get("imageUrl");
        Long categoryId = null;
        if (request.get("categoryId") != null) {
            try {
                categoryId = Long.valueOf(request.get("categoryId").toString());
            } catch (Exception e) {
            }
        }
        Long finalCategoryId = categoryId;

        return subCategoryRepository.findById(id).map(subCategory -> {
            if (name != null && !name.trim().isEmpty()) {
                subCategory.setName(name);
            }
            if (description != null) {
                subCategory.setDescription(description);
            }
            if (finalCategoryId != null) {
                Category category = categoryRepository.findById(finalCategoryId).orElse(null);
                if (category != null) {
                    subCategory.setCategory(category);
                }
            }
            if (imageUrl != null) {
                subCategory.setImageUrl(imageUrl);
            }
            subCategoryRepository.save(subCategory);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "SubCategory updated successfully");
            resp.put("subCategory", subCategory);
            return ResponseEntity.ok().body(resp);
        }).orElseGet(() -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "SubCategory not found");
            return ResponseEntity.badRequest().body(resp);
        });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubCategory(@PathVariable Long id) {
        return subCategoryRepository.findById(id).map(subCategory -> {
            try {
                subCategoryRepository.delete(subCategory);
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("message", "SubCategory deleted successfully");
                return ResponseEntity.ok().body(resp);
            } catch (Exception e) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", false);
                resp.put("message", "Cannot delete subcategory. It may have products linked to it.");
                return ResponseEntity.badRequest().body(resp);
            }
        }).orElseGet(() -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "SubCategory not found");
            return ResponseEntity.badRequest().body(resp);
        });
    }
}
