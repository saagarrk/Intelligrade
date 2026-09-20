package com.intelligrade.service.impl;

import com.intelligrade.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    private final Map<String, byte[]> memoryStore = new ConcurrentHashMap<>();

    @Override
    public String storeFile(String filename, byte[] content, String contentType) {
        String key = "scan_" + UUID.randomUUID().toString() + "_" + filename;
        memoryStore.put(key, content);
        log.info("Stored file with key: {}, size: {} bytes", key, content.length);
        return "/api/v1/files/" + key;
    }

    @Override
    public String storeBase64Image(String filenamePrefix, String base64Data) {
        if (base64Data == null || base64Data.isBlank()) {
            return null;
        }
        String pureBase64 = base64Data.contains(",") ? base64Data.split(",")[1] : base64Data;
        try {
            byte[] bytes = java.util.Base64.getDecoder().decode(pureBase64);
            return storeFile(filenamePrefix + ".png", bytes, "image/png");
        } catch (Exception e) {
            log.error("Failed to decode base64 image: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public byte[] loadFile(String fileKey) {
        return memoryStore.get(fileKey);
    }

    @Override
    public boolean deleteFile(String fileKey) {
        return memoryStore.remove(fileKey) != null;
    }
}
