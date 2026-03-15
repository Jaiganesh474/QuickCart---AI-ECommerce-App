package com.quickcart.config;

import com.quickcart.entity.Category;
import com.quickcart.entity.Product;
import com.quickcart.entity.SubCategory;
import com.quickcart.repository.CategoryRepository;
import com.quickcart.repository.ProductRepository;
import com.quickcart.repository.SubCategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.quickcart.repository.UserRepository;
import com.quickcart.entity.Role;
import com.quickcart.entity.User;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(CategoryRepository categoryRepo, 
                                     SubCategoryRepository subCategoryRepo, 
                                     ProductRepository productRepo,
                                     UserRepository userRepo,
                                     PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println("Initializing Market-standard Products and Categories...");

            // Create/Update admin user
            User admin = userRepo.findByEmail("jaiganeshrio474@gmail.com").orElse(new User());
            admin.setName("Jai Ganesh");
            admin.setEmail("jaiganeshrio474@gmail.com");
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setRole(Role.ADMIN);
            admin.setVerified(true);
            userRepo.save(admin);
            System.out.println("Admin user synchronized.");

            // 1. Categories
            Category electronics = getOrCreateCategory(categoryRepo, "Electronics", "Gadgets, Devices and more");
            Category fashion = getOrCreateCategory(categoryRepo, "Fashion", "Latest trends in clothing and accessories");
            Category home = getOrCreateCategory(categoryRepo, "Home & Kitchen", "Appliances and home decor");
            Category beauty = getOrCreateCategory(categoryRepo, "Beauty & Health", "Personal care and wellness");

            // 2. SubCategories
            SubCategory mobiles = getOrCreateSubCategory(subCategoryRepo, "Smartphones", electronics);
            SubCategory laptops = getOrCreateSubCategory(subCategoryRepo, "Laptops", electronics);
            SubCategory footwear = getOrCreateSubCategory(subCategoryRepo, "Footwear", fashion);
            SubCategory watches = getOrCreateSubCategory(subCategoryRepo, "Watches", fashion);
            SubCategory kitchen = getOrCreateSubCategory(subCategoryRepo, "Appliances", home);

            // 3. Products
            saveProductIfMissing(productRepo, "iPhone 15 Pro", "Apple", "128GB, Natural Titanium", 134900.0, 5.0, 50, "https://images.unsplash.com/photo-1695468305047-83ebce2d9196?auto=format&fit=crop&q=80&w=1000", electronics, mobiles, true);
            saveProductIfMissing(productRepo, "Samsung Galaxy S24 Ultra", "Samsung", "AI Integrated, 512GB", 129999.0, 10.0, 40, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=1000", electronics, mobiles, true);
            saveProductIfMissing(productRepo, "MacBook Air M3", "Apple", "13-inch, 8GB RAM, 256GB SSD", 114900.0, 0.0, 30, "https://images.unsplash.com/photo-1517336714460-4573f4511677?auto=format&fit=crop&q=80&w=1000", electronics, laptops, false);
            saveProductIfMissing(productRepo, "Sony WH-1000XM5", "Sony", "Wireless Noise Cancelling Headphones", 29990.0, 15.0, 100, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=1000", electronics, null, true);
            saveProductIfMissing(productRepo, "Air Jordan 1 Low", "Nike", "Classic sneakers for everyday wear", 8295.0, 0.0, 200, "https://images.sneakersnstuff.com/images/154424/original.jpg", fashion, footwear, false);
            saveProductIfMissing(productRepo, "Ultraboost 1.0", "Adidas", "Responsive running shoes", 17999.0, 20.0, 150, "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=1000", fashion, footwear, true);
            saveProductIfMissing(productRepo, "Rolex Submariner", "Rolex", "Luxury diver's watch", 850000.0, 0.0, 5, "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1000", fashion, watches, false);
            saveProductIfMissing(productRepo, "Dyson V15 Detect", "Dyson", "Powerful cordless vacuum cleaner", 65900.0, 10.0, 25, "https://images.unsplash.com/photo-1558389186-438424b00a32?auto=format&fit=crop&q=80&w=1000", home, kitchen, true);
            saveProductIfMissing(productRepo, "Nespresso Vertuo", "Nespresso", "Automatic coffee and espresso machine", 18500.0, 5.0, 60, "https://images.unsplash.com/photo-1559056191-7417565b163d?auto=format&fit=crop&q=80&w=1000", home, kitchen, false);

            System.out.println("Data Initialization Completed Successfully!");
        };
    }

    private Category getOrCreateCategory(CategoryRepository repo, String name, String desc) {
        return repo.findByName(name).orElseGet(() -> {
            Category c = new Category();
            c.setName(name);
            c.setDescription(desc);
            return repo.save(c);
        });
    }

    private SubCategory getOrCreateSubCategory(SubCategoryRepository repo, String name, Category cat) {
        return repo.findByNameAndCategoryId(name, cat.getId()).orElseGet(() -> {
            SubCategory s = new SubCategory();
            s.setName(name);
            s.setCategory(cat);
            return repo.save(s);
        });
    }

    private void saveProductIfMissing(ProductRepository repo, String name, String brand, String desc, Double price, Double offer, Integer stock, String img, Category cat, SubCategory sub, boolean isDaily) {
        if (!repo.findByName(name).isPresent()) {
            Product p = new Product();
            p.setName(name);
            p.setBrand(brand);
            p.setDescription(desc);
            p.setPrice(price);
            p.setOfferPercentage(offer);
            p.setStock(stock);
            p.setImageUrl(img);
            p.setCategory(cat);
            p.setSubCategory(sub);
            p.setDailyOffer(isDaily);
            repo.save(p);
        }
    }

    private Category createCategory(String name, String desc) {
        Category c = new Category();
        c.setName(name);
        c.setDescription(desc);
        return c;
    }

    private SubCategory createSubCategory(String name, String desc, Category cat) {
        SubCategory s = new SubCategory();
        s.setName(name);
        s.setDescription(desc);
        s.setCategory(cat);
        return s;
    }

    private Product createProduct(String name, String brand, String desc, Double price, Double offer, Integer stock, String img, Category cat, SubCategory sub, boolean isDaily) {
        Product p = new Product();
        p.setName(name);
        p.setBrand(brand);
        p.setDescription(desc);
        p.setPrice(price);
        p.setOfferPercentage(offer);
        p.setStock(stock);
        p.setImageUrl(img);
        p.setCategory(cat);
        p.setSubCategory(sub);
        p.setDailyOffer(isDaily);
        return p;
    }
}
