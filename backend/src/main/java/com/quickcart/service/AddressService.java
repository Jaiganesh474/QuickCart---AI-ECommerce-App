package com.quickcart.service;

import com.quickcart.entity.Address;
import com.quickcart.entity.User;
import com.quickcart.repository.AddressRepository;
import com.quickcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Address> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional
    public Address addAddress(Long userId, Address address) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (address.isDefault()) {
            resetDefaultAddresses(userId);
        } else if (addressRepository.findByUserId(userId).isEmpty()) {
            address.setDefault(true);
        }

        address.setUser(user);
        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(Long userId, Long addressId, Address addressDetails) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (addressDetails.isDefault() && !address.isDefault()) {
            resetDefaultAddresses(userId);
        }

        address.setFullName(addressDetails.getFullName());
        address.setPhoneNumber(addressDetails.getPhoneNumber());
        address.setStreetAddress(addressDetails.getStreetAddress());
        address.setCity(addressDetails.getCity());
        address.setState(addressDetails.getState());
        address.setZipCode(addressDetails.getZipCode());
        address.setCountry(addressDetails.getCountry());
        address.setDefault(addressDetails.isDefault());

        return addressRepository.save(address);
    }

    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        addressRepository.delete(address);
    }

    @Transactional
    public void setDefaultAddress(Long userId, Long addressId) {
        resetDefaultAddresses(userId);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        address.setDefault(true);
        addressRepository.save(address);
    }

    private void resetDefaultAddresses(Long userId) {
        List<Address> defaults = addressRepository.findByUserIdAndIsDefaultTrue(userId);
        for (Address a : defaults) {
            a.setDefault(false);
            addressRepository.save(a);
        }
    }
}
