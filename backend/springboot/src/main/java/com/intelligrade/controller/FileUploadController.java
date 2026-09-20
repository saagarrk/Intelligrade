package com.intelligrade.controller;

import com.intelligrade.dto.common.ApiResponseDto;
import com.intelligrade.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Controller for Exam Answer Sheet Upload & Multi-part File Handling
 * Flow: FileUploadController -> FileStorageService
 */
@RestController
@RequestMapping("/api/v1/files")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponseDto<Map<String, String>>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponseDto.error("Uploaded file is empty"));
        }

        try {
            String fileUrl = fileStorageService.storeFile(
                    file.getOriginalFilename(),
                    file.getBytes(),
                    file.getContentType()
            );
            return ResponseEntity.ok(ApiResponseDto.ok("File uploaded successfully", Map.of(
                    "fileUrl", fileUrl,
                    "filename", file.getOriginalFilename(),
                    "size", String.valueOf(file.getSize())
            )));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(ApiResponseDto.error("Failed to process file upload: " + e.getMessage()));
        }
    }

    @PostMapping("/upload-base64")
    public ResponseEntity<ApiResponseDto<Map<String, String>>> uploadBase64(@RequestBody Map<String, String> body) {
        String base64 = body.get("imageBase64");
        String prefix = body.getOrDefault("prefix", "answer_sheet");
        if (base64 == null || base64.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponseDto.error("Missing base64 data"));
        }

        String fileUrl = fileStorageService.storeBase64Image(prefix, base64);
        if (fileUrl == null) {
            return ResponseEntity.badRequest().body(ApiResponseDto.error("Invalid base64 payload"));
        }

        return ResponseEntity.ok(ApiResponseDto.ok("Base64 image stored", Map.of("fileUrl", fileUrl)));
    }

    @GetMapping("/{fileKey}")
    public ResponseEntity<byte[]> getFile(@PathVariable String fileKey) {
        byte[] data = fileStorageService.loadFile(fileKey);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(data);
    }
}
