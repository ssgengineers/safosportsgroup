package com.nil.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Service
public class S3Service {

    private static final Logger logger = LoggerFactory.getLogger(S3Service.class);

    private final S3Client s3Client;
    private final String bucketName;

    public S3Service(S3Client s3Client, @Value("${aws.s3.bucket-name}") String bucketName) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
    }

    /**
     * Upload a file to S3
     * @param file The file to upload
     * @param folder Optional folder path (e.g., "athletes/", "brands/")
     * @return The S3 key (path) of the uploaded file
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        String key = (folder != null && !folder.isEmpty() ? folder : "") + fileName;

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            logger.info("File uploaded successfully to S3: {}", key);
            return key;
        } catch (Exception e) {
            logger.error("Error uploading file to S3: {}", e.getMessage(), e);
            throw new IOException("Failed to upload file to S3", e);
        }
    }

    /**
     * Upload athlete media file
     */
    public String uploadAthleteMedia(MultipartFile file) throws IOException {
        return uploadFile(file, "athletes/");
    }

    /**
     * Upload brand logo
     */
    public String uploadBrandLogo(MultipartFile file) throws IOException {
        return uploadFile(file, "brands/");
    }

    /**
     * Delete a file from S3
     * @param key The S3 key (path) of the file to delete
     */
    public void deleteFile(String key) {
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteRequest);
            logger.info("File deleted successfully from S3: {}", key);
        } catch (Exception e) {
            logger.error("Error deleting file from S3: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete file from S3", e);
        }
    }

    /**
     * Generate a presigned URL for secure file access
     * @param key The S3 key (path) of the file
     * @param expirationMinutes Minutes until the URL expires (default: 60)
     * @return Presigned URL
     */
    public String generatePresignedUrl(String key, int expirationMinutes) {
        try (S3Presigner presigner = S3Presigner.create()) {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(builder ->
                    builder.signatureDuration(Duration.ofMinutes(expirationMinutes))
                            .getObjectRequest(getObjectRequest));

            return presignedRequest.url().toString();
        } catch (Exception e) {
            logger.error("Error generating presigned URL: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate presigned URL", e);
        }
    }

    /**
     * Generate a presigned URL with default 60-minute expiration
     */
    public String generatePresignedUrl(String key) {
        return generatePresignedUrl(key, 60);
    }

    /**
     * Check if a file exists in S3
     * @param key The S3 key (path) of the file
     * @return true if file exists, false otherwise
     */
    public boolean fileExists(String key) {
        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.headObject(headRequest);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            logger.error("Error checking file existence in S3: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Get file metadata from S3
     * @param key The S3 key (path) of the file
     * @return HeadObjectResponse with file metadata
     */
    public HeadObjectResponse getFileMetadata(String key) {
        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            return s3Client.headObject(headRequest);
        } catch (Exception e) {
            logger.error("Error getting file metadata from S3: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get file metadata from S3", e);
        }
    }
}

