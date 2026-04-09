package com.chatapp.repository;

import com.chatapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username LIKE %:query% OR u.displayName LIKE %:query% OR u.email LIKE %:query%")
    List<User> searchUsers(@Param("query") String query);

    @Query("SELECT u FROM User u WHERE u.onlineStatus = 'ONLINE'")
    List<User> findOnlineUsers();
}
