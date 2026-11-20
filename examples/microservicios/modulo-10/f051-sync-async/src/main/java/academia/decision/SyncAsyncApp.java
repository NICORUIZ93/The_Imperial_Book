package academia.decision;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class SyncAsyncApp {

    public static void main(String[] args) {
        SpringApplication.run(SyncAsyncApp.class, args);
    }
}
