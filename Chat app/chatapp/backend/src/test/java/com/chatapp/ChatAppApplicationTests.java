package com.chatapp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.data.redis.host=localhost",
    "spring.cache.type=none",
    "app.jwt.secret=test-secret-key-for-unit-tests-long-enough-12345678",
    "app.jwt.expiration=86400000",
    "app.jwt.refresh-expiration=604800000",
    "app.websocket.allowed-origins=http://localhost:3000",
    "app.cors.allowed-origins=http://localhost:3000"
})
class ChatAppApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the Spring context boots without errors
    }
}
