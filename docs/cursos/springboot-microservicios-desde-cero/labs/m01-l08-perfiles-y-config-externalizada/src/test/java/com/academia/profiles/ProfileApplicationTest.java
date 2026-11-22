package com.academia.profiles;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import static org.assertj.core.api.Assertions.assertThat;

class ProfileApplicationTest {
    @Nested @SpringBootTest @ActiveProfiles("dev")
    class Dev {
        @Autowired AppProperties p;
        @Test void devProfile() { assertThat(p.message()).isEqualTo("mensaje-dev"); assertThat(p.featureX()).isTrue(); }
    }
    @Nested @SpringBootTest @ActiveProfiles("prod")
    class Prod {
        @Autowired AppProperties p;
        @Test void prodProfile() { assertThat(p.message()).isEqualTo("mensaje-prod"); }
    }
    @Nested @SpringBootTest @ActiveProfiles("prod") @TestPropertySource(properties = "app.message=override")
    class Override {
        @Autowired AppProperties p;
        @Test void envOverride() { assertThat(p.message()).isEqualTo("override"); }
    }
}
