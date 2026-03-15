package com.quickcart.controller;

import com.quickcart.entity.Address;
import com.quickcart.entity.User;
import com.quickcart.repository.UserRepository;
import com.quickcart.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Address>> getMyAddresses(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(addressService.getUserAddresses(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Address> addAddress(@RequestBody Address address, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(addressService.addAddress(user.getId(), address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(@PathVariable Long id, @RequestBody Address address,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(addressService.updateAddress(user.getId(), id, address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        addressService.deleteAddress(user.getId(), id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/set-default")
    public ResponseEntity<Void> setDefault(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        addressService.setDefaultAddress(user.getId(), id);
        return ResponseEntity.ok().build();
    }
}
