package com.chatapp.controller;

import com.chatapp.dto.ChatDTOs.*;
import com.chatapp.repository.UserRepository;
import com.chatapp.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<GroupDTO> createGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreateGroupRequest request) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(groupService.createGroup(userId, request));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupDTO> getGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroup(groupId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<GroupDTO>> getMyGroups(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(groupService.getUserGroups(userId));
    }

    @PostMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<GroupDTO> addMember(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @PathVariable Long memberId) {
        Long adminId = getUserId(userDetails);
        return ResponseEntity.ok(groupService.addMember(groupId, adminId, memberId));
    }

    @DeleteMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @PathVariable Long memberId) {
        Long adminId = getUserId(userDetails);
        groupService.removeMember(groupId, adminId, memberId);
        return ResponseEntity.ok().build();
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
