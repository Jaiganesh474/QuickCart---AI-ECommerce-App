package com.quickcart.controller;

import com.quickcart.entity.Product;
import com.quickcart.entity.User;
import com.quickcart.entity.Wishlist;
import com.quickcart.repository.ProductRepository;
import com.quickcart.repository.UserRepository;
import com.quickcart.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<?> getWishlist(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        List<Wishlist> wishlist = wishlistRepository.findByUser(user);
        List<Product> products = wishlist.stream()
                .map(Wishlist::getProduct)
                .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long productId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();

        if (wishlistRepository.findByUserAndProduct(user, product).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product already in wishlist"));
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        wishlistRepository.save(wishlist);

        return ResponseEntity.ok(Map.of("message", "Added to wishlist"));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long productId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();

        wishlistRepository.findByUserAndProduct(user, product).ifPresent(wishlistRepository::delete);
        
        return ResponseEntity.ok(Map.of("message", "Removed from wishlist"));
    }
}
