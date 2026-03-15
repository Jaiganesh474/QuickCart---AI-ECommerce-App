package com.quickcart.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        return uploadResult.get("url").toString();
    }

    public void deleteImage(String imageUrl) throws IOException {
        // extract public id from url if needed.
        // For simplicity we just catch it, but a real app needs extracting the
        // public_id
        // from the cloudinary url to properly remove it.
        try {
            String[] parts = imageUrl.split("/");
            String lastPart = parts[parts.length - 1]; // e.g file.jpg
            String publicId = lastPart.substring(0, lastPart.lastIndexOf("."));
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
