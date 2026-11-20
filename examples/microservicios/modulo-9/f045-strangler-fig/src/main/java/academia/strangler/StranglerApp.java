package academia.strangler;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class StranglerApp {

    public static void main(String[] args) {
        SpringApplication.run(StranglerApp.class, args);
    }
}
