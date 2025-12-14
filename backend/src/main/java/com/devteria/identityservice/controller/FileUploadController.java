package com.devteria.identityservice.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.service.S3Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileUploadController {

    S3Service s3Service;

    /**
     * Upload a file to S3
     * @param file MultipartFile to upload
     * @param folder Folder/prefix in the bucket (e.g., "tours", "tour-points")
     * @return Public URL of the uploaded file
     */
    @PostMapping
    public ApiResponse<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "images") String folder) {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Validate file type (only images)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("File size must be less than 10MB");
        }

        String fileUrl = s3Service.uploadFile(file, folder);

        return ApiResponse.<String>builder()
                .code(1000)
                .result(fileUrl)
                .build();
    }

    /**
     * Delete a file from S3
     * @param fileUrl The full URL of the file to delete
     */
    @DeleteMapping
    public ApiResponse<String> deleteFile(@RequestParam("fileUrl") String fileUrl) {
        s3Service.deleteFile(fileUrl);
        return ApiResponse.<String>builder()
                .code(1000)
                .message("File deleted successfully")
                .build();
    }
}
