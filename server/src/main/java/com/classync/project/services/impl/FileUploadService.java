package com.classync.project.services.impl;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;

@Service
public class FileUploadService {

    public File convertToFile(MultipartFile multipartFile, String fileName) throws IOException {
        File tempFile = new File(fileName);
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(multipartFile.getBytes());
        }
        return tempFile;
    }

    private final String FOLDER_NAME = "assignments/";

    public String uploadPdf(File file, String fileName) throws IOException {

        String bucketName = "doc-scheduler-6e8de.appspot.com";

        BlobId blobId = BlobId.of(bucketName, FOLDER_NAME + fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType("application/pdf").build();

        InputStream inputStream = FileUploadService.class.getClassLoader()
                .getResourceAsStream("doc-scheduler-6e8de-firebase-adminsdk-ed6lt-6ddee1704e.json");

        if (inputStream == null) {
            throw new IOException("Firebase credentials file not found");
        }

        GoogleCredentials credentials = GoogleCredentials.fromStream(inputStream);
        Storage storage = StorageOptions.newBuilder().setCredentials(credentials).build().getService();

        storage.create(blobInfo, Files.readAllBytes(file.toPath()));
        String DOWNLOAD_URL = "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media";
        return String.format(DOWNLOAD_URL, bucketName, URLEncoder.encode(fileName, StandardCharsets.UTF_8));
    }

    private String getDownloadUrl(String filePath) {
        String bucketName = "doc-scheduler-6e8de.appspot.com";
        String DOWNLOAD_URL = "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media";
        return String.format(DOWNLOAD_URL, bucketName, URLEncoder.encode(filePath, StandardCharsets.UTF_8));
    }
}
