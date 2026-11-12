package academia.rutaflow.cloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

@EnableConfigServer
@SpringBootApplication
public class CloudConfigDiscoveryApplication {
    public static void main(String[] args) {
        SpringApplication.run(CloudConfigDiscoveryApplication.class, args);
    }
}
