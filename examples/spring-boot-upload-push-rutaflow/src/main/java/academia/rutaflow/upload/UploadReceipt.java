package academia.rutaflow.upload;

public record UploadReceipt(String uploadId, String mediaType, long bytes, int width, int height) {}
