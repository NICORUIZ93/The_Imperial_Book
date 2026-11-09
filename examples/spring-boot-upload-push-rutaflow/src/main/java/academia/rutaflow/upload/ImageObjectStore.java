package academia.rutaflow.upload;

public interface ImageObjectStore {
    void put(String key, byte[] content);
    void delete(String key);
}
