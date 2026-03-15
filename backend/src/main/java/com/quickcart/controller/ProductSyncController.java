package com.quickcart.controller;

import com.quickcart.service.ProductSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/sync")
public class ProductSyncController {

    @Autowired
    private ProductSyncService productSyncService;

    @PostMapping("/market")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerSync() {
        return ResponseEntity.ok(productSyncService.syncFromMarket());
    }
}
