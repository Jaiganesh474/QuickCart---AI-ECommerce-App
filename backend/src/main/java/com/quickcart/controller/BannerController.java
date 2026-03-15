package com.quickcart.controller;

import com.quickcart.entity.Banner;
import com.quickcart.repository.BannerRepository;
import com.quickcart.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/banners")
public class BannerController {

    @Autowired
    private BannerRepository bannerRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping
    public List<Banner> getAllActiveBanners() {
        return bannerRepository.findByIsActiveTrue();
    }

    @GetMapping("/all")
    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createBanner(@RequestParam("image") MultipartFile file) {
        try {
            String imageUrl = cloudinaryService.uploadImage(file);
            Banner banner = new Banner();
            banner.setImageUrl(imageUrl);
            bannerRepository.save(banner);
            return ResponseEntity.ok(Map.of("success", true, "message", "Banner added"));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Failed to upload image"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        return bannerRepository.findById(id).map(banner -> {
            try {
                // Delete image from cloudinary logic if needed (handled in service)
            } catch (Exception e) {
                // Ignore delete error
            }
            bannerRepository.delete(banner);
            return ResponseEntity.ok(Map.of("success", true, "message", "Banner deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
