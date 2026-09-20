package com.intelligrade.service;

import java.io.InputStream;

public interface FileStorageService {
    String storeFile(String filename, byte[] content, String contentType);
    String storeBase64Image(String filenamePrefix, String base64Data);
    byte[] loadFile(String fileKey);
    boolean deleteFile(String fileKey);
}
