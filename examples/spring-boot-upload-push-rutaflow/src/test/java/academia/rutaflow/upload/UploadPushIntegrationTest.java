package academia.rutaflow.upload;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UploadPushIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired UploadService uploads;
    @Autowired RecordingPushGateway pushes;
    @Autowired InMemoryImageObjectStore objectStore;
    @Autowired PlatformTransactionManager transactionManager;

    @BeforeEach
    void reset() {
        jdbc.update("DELETE FROM uploads");
        pushes.clear();
        objectStore.clear();
    }

    @Test
    void imagenValidaSeGuardaYNotificaDespuesDelCommit() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "foto.png", "image/png", png(3, 2));

        mvc.perform(multipart("/api/fotos").file(file))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.mediaType").value("image/png"))
            .andExpect(jsonPath("$.width").value(3))
            .andExpect(jsonPath("$.height").value(2));

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM uploads", Integer.class)).isEqualTo(1);
        assertThat(pushes.sent()).hasSize(1);
        assertThat(objectStore.objectCount()).isEqualTo(1);
    }

    @Test
    void textoDisfrazadoComoJpegNoGuardaNiNotifica() throws Exception {
        MockMultipartFile disguised = new MockMultipartFile("file", "malware.jpg", "image/jpeg",
            "esto no son bytes de una imagen".getBytes(java.nio.charset.StandardCharsets.UTF_8));

        mvc.perform(multipart("/api/fotos").file(disguised))
            .andExpect(status().isUnsupportedMediaType());

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM uploads", Integer.class)).isZero();
        assertThat(pushes.sent()).isEmpty();
        assertThat(objectStore.objectCount()).isZero();
    }

    @Test
    void pngInvalidoConFirmaParcialSeRechaza() throws Exception {
        byte[] truncated = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        MockMultipartFile file = new MockMultipartFile("file", "foto.png", "image/png", truncated);

        mvc.perform(multipart("/api/fotos").file(file)).andExpect(status().isUnsupportedMediaType());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM uploads", Integer.class)).isZero();
        assertThat(pushes.sent()).isEmpty();
    }

    @Test
    void tipoDeclaradoQueNoCoincideConLaImagenRealSeRechaza() throws Exception {
        MockMultipartFile disguised = new MockMultipartFile("file", "foto.jpg", "image/jpeg", png(2, 2));

        mvc.perform(multipart("/api/fotos").file(disguised))
            .andExpect(status().isUnsupportedMediaType());

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM uploads", Integer.class)).isZero();
        assertThat(pushes.sent()).isEmpty();
    }

    @Test
    void archivoQueSuperaElLimiteConfiguradoSeRechaza() throws Exception {
        byte[] tooLarge = new byte[1_048_577];
        MockMultipartFile file = new MockMultipartFile("file", "large.png", "image/png", tooLarge);

        mvc.perform(multipart("/api/fotos").file(file))
            .andExpect(status().isUnsupportedMediaType());

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM uploads", Integer.class)).isZero();
        assertThat(pushes.sent()).isEmpty();
    }

    @Test
    void rollbackNoDejaArchivoMetadataNiPush() throws Exception {
        TransactionTemplate transaction = new TransactionTemplate(transactionManager);
        byte[] content = png(2, 2);

        assertThatThrownBy(() -> transaction.executeWithoutResult(status -> {
            uploads.accept(content, "image/png");
            throw new IllegalStateException("forzar rollback para practicar");
        })).isInstanceOf(IllegalStateException.class);

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM uploads", Integer.class)).isZero();
        assertThat(pushes.sent()).isEmpty();
        assertThat(objectStore.objectCount()).isZero();
    }

    private static byte[] png(int width, int height) throws Exception {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        image.setRGB(0, 0, 0x336699);
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ImageIO.write(image, "png", bytes);
        return bytes.toByteArray();
    }
}
