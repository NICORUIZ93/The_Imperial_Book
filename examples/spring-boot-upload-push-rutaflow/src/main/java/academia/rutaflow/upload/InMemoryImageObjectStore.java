package academia.rutaflow.upload;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.stereotype.Component;

@Component
public class InMemoryImageObjectStore implements ImageObjectStore {
    private final ConcurrentMap<String, byte[]> objects = new ConcurrentHashMap<>();

    @Override public void put(String key, byte[] content) { objects.put(key, content.clone()); }
    @Override public void delete(String key) { objects.remove(key); }
    public int objectCount() { return objects.size(); }
    public void clear() { objects.clear(); }
}
