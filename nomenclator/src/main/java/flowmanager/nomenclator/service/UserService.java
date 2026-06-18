package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.DuplicateAttributeException;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.*;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.Role;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.CommentRepository;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.repository.spec.UserSpecifications;
import flowmanager.nomenclator.security.KeycloakAdminService;
import flowmanager.nomenclator.security.Utils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final OrganizationRepository organizationRepository;
    private final UserMapper userMapper;
    private final CommentMapper commentMapper;
    private final ProjectMapper projectMapper;
    private final OrganizationMapper organizationMapper;
    private final TeamMapper teamMapper;
    private final WorkItemMapper workItemMapper;
    private final ProjectService projectService;
    private final TeamService teamService;
    private final OrganizationService organizationService;
    private final WorkItemService workItemService;
    private final KeycloakAdminService keycloakAdminService;

    private User getUser(Integer userId) {
        return userRepository.findById(userId).orElseThrow(
                () -> new NotFoundException(String.format("User with id %d not found", userId))
        );
    }

    public PageResponseDto<UserResponseDto> findAllUsers(String search, Role role, Boolean active, Pageable pageable) {
        Specification<User> spec = Specification.allOf(
                Stream.of(
                        UserSpecifications.search(search),
                        UserSpecifications.roleEquals(role),
                        UserSpecifications.activeEquals(active)
                ).filter(Objects::nonNull).toList()
        );
        return PageResponseDto.from(userRepository.findAll(spec, pageable), userMapper::toResponseDto);
    }

    public UserResponseDto getCurrentUser(Authentication auth) {
        String keycloakId = Utils.getCurrentUserId(auth);
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return userMapper.toResponseDto(user);
    }

    public List<ProjectResponseDto> findAllManagedProjectsByUserId(Integer userId) {
        return getUser(userId)
                .getProjects()
                .stream()
                .map(projectMapper::toResponseDto)
                .toList();
    }

    public List<ProjectResponseDto> findAllAssignedProjectsByUserId(Integer userId) {
        return getUser(userId).getAssignedTeams()
                .stream()
                .flatMap(team -> team.getProjects().stream())
                .map(projectMapper::toResponseDto)
                .toList();
    }

    public List<OrganizationSummaryDto> findAllManagedOrganizationsByUserId(Integer userId) {
        return getUser(userId)
                .getOrganizations()
                .stream()
                .map(organizationMapper::toSummaryDto)
                .toList();
    }

    public List<OrganizationSummaryDto> findAllMemberOrganizationsByUserId(Integer userId) {
        User user = getUser(userId);

        Set<Organization> organizations = new HashSet<>(user.getOrganizations());
        organizations.addAll(user.getMemberOrganizations());

        return organizations.stream()
                .map(organizationMapper::toSummaryDto)
                .toList();
    }

    public List<TeamResponseDto> findAllManagedTeamsByUserId(Integer userId) {
        return getUser(userId)
                .getManagedTeams()
                .stream()
                .map(teamMapper::toResponseDto)
                .toList();
    }

    public List<TeamResponseDto> findAllAssignedTeamsByUserId(Integer userId) {
        return getUser(userId)
                .getAssignedTeams()
                .stream()
                .map(teamMapper::toResponseDto)
                .toList();
    }

    public List<WorkItemSummaryDto> findAllReportedWorkItemsByUserId(Integer userId) {
        return getUser(userId)
                .getReportedWorkItems()
                .stream()
                .map(workItemMapper::toSummaryDto)
                .toList();
    }

    public List<WorkItemSummaryDto> findAllAssignedWorkItemsByUserId(Integer userId) {
        return getUser(userId)
                .getAssignedWorkItems()
                .stream()
                .map(workItemMapper::toSummaryDto)
                .toList();
    }

    @Transactional
    protected List<Organization> getOrganizations(List<Integer> organizationsIds) {
        List<Organization> organizations = organizationRepository.findAllById(organizationsIds);
        if(organizations.size() != organizationsIds.size()) {
            throw new NotFoundException("One or more organizations were not found");
        }
        return organizations;
    }

    @Transactional
    public UserResponseDto createUser(UserCreateDto userCreateDto) {
        if(userRepository.existsByEmail(userCreateDto.getEmail()))
            throw new DuplicateAttributeException(String.format("Email %s already exists", userCreateDto.getEmail()));
        if(userRepository.existsByUsername(userCreateDto.getUsername()))
            throw new DuplicateAttributeException(String.format("Username %s already exists", userCreateDto.getUsername()));

        String keycloakId = keycloakAdminService.createUser(userCreateDto);

        try {
            if (userRepository.existsByKeycloakId(keycloakId))
                throw new DuplicateAttributeException("User already registered");

            Role role = userCreateDto.getRole();
            keycloakAdminService.assignRole(keycloakId, role);

            User user = userMapper.toEntity(userCreateDto, keycloakId);

            if (userCreateDto.getOrganizationIds() != null && !userCreateDto.getOrganizationIds().isEmpty()) {
                List<Organization> organizations = getOrganizations(userCreateDto.getOrganizationIds());
                organizations.forEach(organization -> {
                    if (!user.getMemberOrganizations().contains(organization)) {
                        user.getMemberOrganizations().add(organization);
                    }

                    if (!organization.getMembers().contains(user)) {
                        organization.getMembers().add(user);
                    }

                    organizationRepository.save(organization);
                });
            }
            return userMapper.toResponseDto(userRepository.save(user));
        } catch (Exception e) {
            keycloakAdminService.deleteUser(keycloakId);
            throw e;
        }
    }

    @Transactional
    public UserResponseDto updateUser(Integer userId, UserUpdateDto userUpdateDto) {
        User user = getUser(userId);

        if (userUpdateDto.getEmail() != null && !userUpdateDto.getEmail().equals(user.getEmail()) &&
                userRepository.existsByEmail(userUpdateDto.getEmail())) {
            throw new DuplicateAttributeException(String.format("Email %s already exists", userUpdateDto.getEmail()));
        }
        if (userUpdateDto.getUsername() != null && !userUpdateDto.getUsername().equals(user.getUsername()) &&
                userRepository.existsByUsername(userUpdateDto.getUsername())) {
            throw new DuplicateAttributeException(String.format("Username %s already exists", userUpdateDto.getUsername()));
        }

        keycloakAdminService.updateUser(user, userUpdateDto);
        if (userUpdateDto.getRole() != null) {
            keycloakAdminService.updateUserRole(user.getKeycloakId(), userUpdateDto.getRole());
        }

        if (userUpdateDto.getOrganizationIds() != null) {
            user.getMemberOrganizations().forEach(org -> org.getMembers().remove(user));
            organizationRepository.saveAll(user.getMemberOrganizations());
            user.getMemberOrganizations().clear();

            List<Organization> organizations = getOrganizations(userUpdateDto.getOrganizationIds());
            organizations.forEach(organization -> {
                user.getMemberOrganizations().add(organization);
                organization.getMembers().add(user);
            });
            organizationRepository.saveAll(organizations);
        }

        if (userUpdateDto.getActive() != null) {
            keycloakAdminService.setUserEnabled(user.getKeycloakId(), userUpdateDto.getActive());
        }

        userMapper.updateEntityFromDto(userUpdateDto, user);
        return userMapper.toResponseDto(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId).orElse(null);
        if(user == null) {
            return;
        }

        user.getAssignedWorkItems()
                .forEach(workItem -> workItem.getAssignees().remove(user));
        user.getAssignedTeams()
                .forEach(team -> team.getMembers().remove(user));
        user.getReportedWorkItems()
                .forEach(workItem -> workItemService.deleteWorkItem(workItem.getId()));
        user.getProjects()
                .forEach(project -> projectService.deleteProject(project.getId()));
        user.getManagedTeams()
                .forEach(team -> teamService.deleteTeam(team.getId()));
        user.getOrganizations()
                .forEach(organization -> organizationService.deleteOrganization(organization.getId()));
        user.getMemberOrganizations()
                .forEach(organization -> organization.getMembers().remove(user));

        commentRepository.deleteAll(user.getComments());

        keycloakAdminService.deleteUser(user.getKeycloakId());
        userRepository.deleteById(userId);
    }
}