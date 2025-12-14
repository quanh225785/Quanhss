package com.devteria.identityservice.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.endpoint}")
    private String endpoint;

    /**
     * Upload a file to S3 and return the public URL
     * @param file MultipartFile to upload
     * @param folder Folder/prefix in the bucket (e.g., "tours", "tour-points")
     * @return Public URL of the uploaded file
     */
    public String uploadFile(MultipartFile file, String folder) {
        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String key = folder + "/" + UUID.randomUUID().toString() + extension;

            // Upload to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Return the public URL
            String fileUrl = endpoint + "/" + bucketName + "/" + key;
            log.info("File uploaded successfully: {}", fileUrl);
            return fileUrl;

        } catch (IOException e) {
            log.error("Failed to upload file to S3", e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Delete a file from S3
     * @param fileUrl The full URL of the file to delete
     */
    public void deleteFile(String fileUrl) {
        try {
            // Extract key from URL
            String prefix = endpoint + "/" + bucketName + "/";
            if (!fileUrl.startsWith(prefix)) {
                log.warn("Invalid S3 URL format: {}", fileUrl);
                return;
            }
            String key = fileUrl.substring(prefix.length());

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("File deleted successfully: {}", fileUrl);

        } catch (Exception e) {
            log.error("Failed to delete file from S3: {}", fileUrl, e);
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }
}
