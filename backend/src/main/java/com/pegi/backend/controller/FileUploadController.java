package com.pegi.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class FileUploadController {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.endpoint}")
    private String endpoint;

    public FileUploadController(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File kosong.");
        }

        try {
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String key = UUID.randomUUID() + "_" + originalName.replaceAll("\\s+", "_");

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Build public URL: <endpoint>/<bucket>/<key>
            String normalizedEndpoint = endpoint.endsWith("/") ? endpoint.substring(0, endpoint.length() - 1) : endpoint;
            String fileUrl = normalizedEndpoint + "/" + bucket + "/" + key;

            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Gagal upload file: " + e.getMessage());
        }
    }

    @GetMapping("/files/{filename}")
    public ResponseEntity<Void> getFile(@PathVariable String filename) {
        // Build the direct S3 URL and redirect the client to it
        String normalizedEndpoint = endpoint.endsWith("/") ? endpoint.substring(0, endpoint.length() - 1) : endpoint;
        String s3Url = normalizedEndpoint + "/" + bucket + "/" + filename;
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(s3Url))
                .build();
    }
}