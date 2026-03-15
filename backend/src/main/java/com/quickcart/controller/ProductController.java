package com.quickcart.controller;

import com.quickcart.entity.Category;
import com.quickcart.entity.Product;
import com.quickcart.entity.SubCategory;
import com.quickcart.repository.CategoryRepository;
import com.quickcart.repository.ProductRepository;
import com.quickcart.repository.SubCategoryRepository;
import com.quickcart.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/daily-offers")
    public ResponseEntity<List<Product>> getDailyOffers() {
        return ResponseEntity.ok(productRepository.findByIsDailyOfferTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isPresent()) {
            return ResponseEntity.ok(productOpt.get());
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", false);
        resp.put("message", "Product not found");
        return ResponseEntity.status(404).body(resp);
    }

    @PostMapping
    public ResponseEntity<?> addProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam(value = "offerPercentage", defaultValue = "0") Double offerPercentage,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "isDailyOffer", defaultValue = "false") Boolean isDailyOffer,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "subCategoryId", required = false) Long subCategoryId,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        Map<String, Object> resp = new HashMap<>();

        try {
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setOfferPercentage(offerPercentage);
            product.setStock(stock);
            product.setDailyOffer(isDailyOffer);
            product.setBrand(brand);

            if (categoryId != null) {
                Category category = categoryRepository.findById(categoryId).orElse(null);
                product.setCategory(category);
            }

            if (subCategoryId != null) {
                SubCategory subCategory = subCategoryRepository.findById(subCategoryId).orElse(null);
                product.setSubCategory(subCategory);
            }

            if (image != null && !image.isEmpty()) {
                String uploadedUrl = cloudinaryService.uploadImage(image);
                product.setImageUrl(uploadedUrl);
            } else if (imageUrl != null && !imageUrl.isEmpty()) {
                product.setImageUrl(imageUrl);
            }

            productRepository.save(product);

            resp.put("success", true);
            resp.put("message", "Product created successfully");
            resp.put("product", product);
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", "Failed to create product: " + e.getMessage());
            return ResponseEntity.status(500).body(resp);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Map<String, Object> resp = new HashMap<>();
        Optional<Product> optProduct = productRepository.findById(id);
        if (optProduct.isPresent()) {
            Product product = optProduct.get();
            if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                try {
                    cloudinaryService.deleteImage(product.getImageUrl());
                } catch (Exception e) {
                    System.err.println("Failed to delete image: " + e.getMessage());
                }
            }
            productRepository.deleteById(id);
            resp.put("success", true);
            resp.put("message", "Product deleted successfully");
            return ResponseEntity.ok(resp);
        }

        resp.put("success", false);
        resp.put("message", "Product not found");
        return ResponseEntity.status(404).body(resp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "offerPercentage", required = false) Double offerPercentage,
            @RequestParam(value = "stock", required = false) Integer stock,
            @RequestParam(value = "isDailyOffer", required = false) Boolean isDailyOffer,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "subCategoryId", required = false) Long subCategoryId,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        Map<String, Object> resp = new HashMap<>();

        try {
            Optional<Product> optProduct = productRepository.findById(id);
            if (!optProduct.isPresent()) {
                resp.put("success", false);
                resp.put("message", "Product not found");
                return ResponseEntity.status(404).body(resp);
            }

            Product product = optProduct.get();
            if (name != null)
                product.setName(name);
            if (description != null)
                product.setDescription(description);
            if (price != null)
                product.setPrice(price);
            if (offerPercentage != null)
                product.setOfferPercentage(offerPercentage);
            if (stock != null)
                product.setStock(stock);
            if (isDailyOffer != null)
                product.setDailyOffer(isDailyOffer);
            if (brand != null)
                product.setBrand(brand);

            if (categoryId != null) {
                Category category = categoryRepository.findById(categoryId).orElse(null);
                if (category != null)
                    product.setCategory(category);
            }

            if (subCategoryId != null) {
                SubCategory subCategory = subCategoryRepository.findById(subCategoryId).orElse(null);
                if (subCategory != null)
                    product.setSubCategory(subCategory);
            }

            if (image != null && !image.isEmpty()) {
                if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                    try {
                        cloudinaryService.deleteImage(product.getImageUrl());
                    } catch (Exception e) {
                    }
                }
                String uploadedUrl = cloudinaryService.uploadImage(image);
                product.setImageUrl(uploadedUrl);
            } else if (imageUrl != null && !imageUrl.isEmpty()) {
                product.setImageUrl(imageUrl);
            }

            productRepository.save(product);
            resp.put("success", true);
            resp.put("message", "Product updated successfully");
            resp.put("product", product);
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", "Failed to update product: " + e.getMessage());
            return ResponseEntity.status(500).body(resp);
        }
    }
}
