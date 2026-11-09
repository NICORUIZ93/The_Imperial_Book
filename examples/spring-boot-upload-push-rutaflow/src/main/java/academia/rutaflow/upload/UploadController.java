package academia.rutaflow.upload;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/fotos")
public class UploadController {
    private final UploadService uploads;

    public UploadController(UploadService uploads) { this.uploads = uploads; }

    @PostMapping
    public ResponseEntity<UploadReceipt> upload(@RequestParam("file") MultipartFile file) throws java.io.IOException {
        UploadReceipt receipt = uploads.accept(file.getBytes(), file.getContentType());
        return ResponseEntity.status(HttpStatus.CREATED).body(receipt);
    }

    @ExceptionHandler(InvalidImageException.class)
    public ResponseEntity<String> invalidImage(InvalidImageException exception) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(exception.getMessage());
    }
}
