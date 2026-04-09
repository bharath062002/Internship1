package com.chatapp.config;

import com.chatapp.model.User;
import com.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @Profile("!prod")   // only runs in dev / test
    public CommandLineRunner seedData() {
        return args -> {
            if (userRepository.count() > 0) {
                log.info("Database already seeded — skipping.");
                return;
            }

            log.info("Seeding demo data...");

            List<User> demoUsers = List.of(
                User.builder()
                    .username("alice")
                    .email("alice@demo.com")
                    .password(passwordEncoder.encode("password123"))
                    .displayName("Alice Johnson")
                    .statusMessage("Hey there! I'm using Nexus Chat 🚀")
                    .onlineStatus(User.OnlineStatus.OFFLINE)
                    .build(),

                User.builder()
                    .username("bob")
                    .email("bob@demo.com")
                    .password(passwordEncoder.encode("password123"))
                    .displayName("Bob Smith")
                    .statusMessage("Available for a quick chat!")
                    .onlineStatus(User.OnlineStatus.OFFLINE)
                    .build(),

                User.builder()
                    .username("carol")
                    .email("carol@demo.com")
                    .password(passwordEncoder.encode("password123"))
                    .displayName("Carol White")
                    .statusMessage("Working from home today 💻")
                    .onlineStatus(User.OnlineStatus.OFFLINE)
                    .build(),

                User.builder()
                    .username("dave")
                    .email("dave@demo.com")
                    .password(passwordEncoder.encode("password123"))
                    .displayName("Dave Brown")
                    .statusMessage("In a meeting, back soon")
                    .onlineStatus(User.OnlineStatus.OFFLINE)
                    .build()
            );

            userRepository.saveAll(demoUsers);
            log.info("✅ Seeded {} demo users. Login with any username and password: password123", demoUsers.size());
        };
    }
}
