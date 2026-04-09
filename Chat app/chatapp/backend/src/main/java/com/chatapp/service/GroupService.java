package com.chatapp.service;

import com.chatapp.dto.ChatDTOs.*;
import com.chatapp.model.ChatGroup;
import com.chatapp.model.User;
import com.chatapp.repository.ChatGroupRepository;
import com.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupService {

    private final ChatGroupRepository groupRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional
    public GroupDTO createGroup(Long creatorId, CreateGroupRequest request) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        ChatGroup group = ChatGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(creator)
                .build();

        group.getAdmins().add(creator);
        group.getMembers().add(creator);
        creator.getGroups().add(group);

        if (request.getMemberIds() != null) {
            for (Long memberId : request.getMemberIds()) {
                userRepository.findById(memberId).ifPresent(member -> {
                    group.getMembers().add(member);
                    member.getGroups().add(group);
                });
            }
        }

        groupRepository.save(group);
        log.info("Group created: {} by user {}", group.getName(), creatorId);
        return mapToGroupDTO(group);
    }

    @Cacheable(value = "groups", key = "#groupId")
    public GroupDTO getGroup(Long groupId) {
        ChatGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return mapToGroupDTO(group);
    }

    public List<GroupDTO> getUserGroups(Long userId) {
        return groupRepository.findGroupsByUserId(userId).stream()
                .map(this::mapToGroupDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "groups", key = "#groupId")
    public GroupDTO addMember(Long groupId, Long adminId, Long newMemberId) {
        ChatGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        boolean isAdmin = group.getAdmins().stream().anyMatch(a -> a.getId().equals(adminId));
        if (!isAdmin) throw new RuntimeException("Only admins can add members");

        User newMember = userRepository.findById(newMemberId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        group.getMembers().add(newMember);
        newMember.getGroups().add(group);
        groupRepository.save(group);
        return mapToGroupDTO(group);
    }

    @Transactional
    @CacheEvict(value = "groups", key = "#groupId")
    public void removeMember(Long groupId, Long adminId, Long memberId) {
        ChatGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        boolean isAdmin = group.getAdmins().stream().anyMatch(a -> a.getId().equals(adminId));
        boolean isSelf = adminId.equals(memberId);

        if (!isAdmin && !isSelf) throw new RuntimeException("Not authorized");

        group.getMembers().removeIf(m -> m.getId().equals(memberId));
        groupRepository.save(group);
    }

    private GroupDTO mapToGroupDTO(ChatGroup group) {
        List<UserDTO> members = group.getMembers().stream()
                .map(authService::mapToUserDTO)
                .collect(Collectors.toList());

        return GroupDTO.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .avatarUrl(group.getAvatarUrl())
                .createdBy(authService.mapToUserDTO(group.getCreatedBy()))
                .members(members)
                .memberCount(members.size())
                .createdAt(group.getCreatedAt())
                .build();
    }
}
