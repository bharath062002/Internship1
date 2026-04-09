package com.chatapp.repository;

import com.chatapp.model.ChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {

    @Query("SELECT g FROM ChatGroup g JOIN g.members m WHERE m.id = :userId")
    List<ChatGroup> findGroupsByUserId(@Param("userId") Long userId);

    @Query("SELECT g FROM ChatGroup g WHERE g.name LIKE %:query%")
    List<ChatGroup> searchGroups(@Param("query") String query);
}
