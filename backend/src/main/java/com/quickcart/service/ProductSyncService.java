package com.quickcart.service;

import com.quickcart.entity.Category;
import com.quickcart.entity.Product;
import com.quickcart.repository.CategoryRepository;
import com.quickcart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ProductSyncService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Run every 12 hours
    @Scheduled(fixedRate = 43200000)
    public void autoSyncProducts() {
        System.out.println("Auto-triggering Market Data Sync...");
        syncFromMarket();
    }

    public Map<String, Object> syncFromMarket() {
        Map<String, Object> result = new HashMap<>();
        try {
            // 1. Fetch products from DummyJSON as a base
            String dummyJsonUrl = "https://dummyjson.com/products?limit=30";
            Map<String, Object> dummyResp = restTemplate.getForObject(dummyJsonUrl, Map.class);
            List<Map<String, Object>> rawProducts = (List<Map<String, Object>>) dummyResp.get("products");

            // 2. Pass to AI for "Brandification" and premium updates
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("products", rawProducts);
            
            Map<String, Object> aiResponse = restTemplate.postForObject(aiServiceUrl + "/api/market-sync", aiRequest, Map.class);
            List<Map<String, Object>> marketProducts = (List<Map<String, Object>>) aiResponse.get("products");

            int updatedCount = 0;
            for (Map<String, Object> pData : marketProducts) {
                String name = (String) pData.get("name");
                Optional<Product> existing = productRepository.findByName(name);
                
                Product p = existing.orElse(new Product());
                p.setName(name);
                p.setBrand((String) pData.get("brand"));
                p.setDescription((String) pData.get("description"));
                p.setPrice(Double.valueOf(pData.get("price").toString()));
                p.setImageUrl((String) pData.get("imageUrl"));
                p.setStock(100); // Default stock for sync
                
                // Keep existing category if it was already matched, or assign a random one from existing categories
                if (p.getCategory() == null) {
                    List<Category> allCats = categoryRepository.findAll();
                    if (!allCats.isEmpty()) {
                        p.setCategory(allCats.get(new Random().nextInt(allCats.size())));
                    }
                }
                
                productRepository.save(p);
                updatedCount++;
            }

            result.put("success", true);
            result.put("message", "Successfully synced " + updatedCount + " real-branded products from market.");
            return result;

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Sync failed: " + e.getMessage());
            return result;
        }
    }
}
