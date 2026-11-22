package com.academia.cond;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import static org.assertj.core.api.Assertions.assertThat;
class ConditionalTest {
    private final ApplicationContextRunner runner = new ApplicationContextRunner().withUserConfiguration(CondApplication.class);
    @Test void defaultsToSms() {
        runner.run(ctx -> assertThat(ctx.getBean(NotificationSender.class).type()).isEqualTo("sms"));
    }
    @Test void emailWhenPropertySet() {
        runner.withPropertyValues("app.notify.type=email")
              .run(ctx -> assertThat(ctx.getBean(NotificationSender.class).type()).isEqualTo("email"));
    }
}
