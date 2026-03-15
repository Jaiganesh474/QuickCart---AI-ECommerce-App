package com.quickcart.controller;

import com.quickcart.entity.Category;
import com.quickcart.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> addCategory(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String description = request.get("description");
        String imageUrl = request.get("imageUrl");

        if (name == null || name.trim().isEmpty()) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Category name is required");
            return ResponseEntity.badRequest().body(resp);
        }

        if (categoryRepository.findByName(name).isPresent()) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Category already exists");
            return ResponseEntity.badRequest().body(resp);
        }

        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setImageUrl(imageUrl);
        categoryRepository.save(category);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Category added successfully");
        response.put("category", category);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String name = request.get("name");
        String description = request.get("description");
        String imageUrl = request.get("imageUrl");

        return categoryRepository.findById(id).map(category -> {
            if (name != null && !name.trim().isEmpty()) {
                category.setName(name);
            }
            if (description != null) {
                category.setDescription(description);
            }
            if (imageUrl != null) {
                category.setImageUrl(imageUrl);
            }
            categoryRepository.save(category);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Category updated successfully");
            resp.put("category", category);
            return ResponseEntity.ok().body(resp);
        }).orElseGet(() -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Category not found");
            return ResponseEntity.badRequest().body(resp);
        });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id).map(category -> {
            try {
                categoryRepository.delete(category);
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("message", "Category deleted successfully");
                return ResponseEntity.ok().body(resp);
            } catch (Exception e) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", false);
                resp.put("message", "Cannot delete category. It may have subcategories or products linked to it.");
                return ResponseEntity.badRequest().body(resp);
            }
        }).orElseGet(() -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Category not found");
            return ResponseEntity.badRequest().body(resp);
        });
    }
}
