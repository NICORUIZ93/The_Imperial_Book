package academia.rutaflow.upload;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Iterator;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ImageContentValidator {
    private final long maxBytes;
    private final long maxPixels;

    public ImageContentValidator(
        @Value("${app.upload.max-bytes:5242880}") long maxBytes,
        @Value("${app.upload.max-pixels:12000000}") long maxPixels
    ) {
        this.maxBytes = maxBytes;
        this.maxPixels = maxPixels;
    }

    public DetectedImage validate(byte[] bytes, String declaredMediaType) {
        if (bytes == null || bytes.length == 0 || bytes.length > maxBytes) {
            throw new InvalidImageException("El archivo está vacío o supera el tamaño permitido");
        }
        if (declaredMediaType == null || declaredMediaType.isBlank()) {
            throw new InvalidImageException("Falta declarar el tipo de contenido");
        }

        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            if (input == null) throw new InvalidImageException("El contenido no es una imagen reconocida");
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw new InvalidImageException("El contenido no es una imagen reconocida");

            ImageReader reader = readers.next();
            try {
                reader.setInput(input, true, true);
                String format = reader.getFormatName().toLowerCase(java.util.Locale.ROOT);
                String detectedType = switch (format) {
                    case "png" -> "image/png";
                    case "jpeg", "jpg" -> "image/jpeg";
                    default -> throw new InvalidImageException("Solo se aceptan PNG y JPEG");
                };
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (width < 1 || height < 1 || (long) width * height > maxPixels) {
                    throw new InvalidImageException("La imagen supera las dimensiones permitidas");
                }
                if (!detectedType.equalsIgnoreCase(declaredMediaType)) {
                    throw new InvalidImageException("El tipo declarado no coincide con la imagen detectada");
                }
                // Lee píxeles; una cabecera con firma PNG/JPEG pero truncada no basta para aprobar.
                if (reader.read(0) == null) throw new InvalidImageException("No se pudo decodificar la imagen");
                return new DetectedImage(detectedType, width, height);
            } finally {
                reader.dispose();
            }
        } catch (IOException exception) {
            throw new InvalidImageException("El contenido no se pudo leer como imagen completa", exception);
        }
    }
}
