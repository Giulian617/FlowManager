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
import flowmanager.nomenclator.security.KeycloakAdminService;
import flowmanager.nomenclator.security.Utils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    public List<UserSummaryDto> findAllUsers(Role role) {
        Specification<User> specs = Specification.allOf();

        if (role != null) {
            specs = specs.and((root, query, cb) -> cb.equal(root.get("role"), role));
        }

        return userRepository
                .findAll(specs)
                .stream()
                .map(userMapper::toSummaryDto)
                .toList();
    }

    public UserSummaryDto getCurrentUser(Authentication auth) {
        String keycloakId = Utils.getCurrentUserId(auth);
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return userMapper.toSummaryDto(user);
    }

    public List<CommentResponseUserDto> findAllCommentsByUserId(Integer userId) {
        return getUser(userId)
                .getComments()
                .stream()
                .map(commentMapper::toResponseUserDto)
                .toList();
    }

    public List<ProjectSummaryDto> findAllProjectsByUserId(Integer userId) {
        return getUser(userId)
                .getProjects()
                .stream()
                .map(projectMapper::toSummaryDto)
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

    public List<TeamSummaryUserDto> findAllManagedTeamsByUserId(Integer userId) {
        return getUser(userId)
                .getManagedTeams()
                .stream()
                .map(teamMapper::toSummaryUserDto)
                .toList();
    }

    public List<TeamSummaryUserDto> findAllAssignedTeamsByUserId(Integer userId) {
        return getUser(userId)
                .getAssignedTeams()
                .stream()
                .map(teamMapper::toSummaryUserDto)
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

    public UserResponseDto findUserById(Integer userId) {
        return userMapper.toResponseDto(getUser(userId));
    }

    public UserResponseDto createUser(UserCreateDto userCreateDto) {
        if(userRepository.existsByEmail(userCreateDto.getEmail()))
            throw new DuplicateAttributeException(String.format("Email %s already exists", userCreateDto.getEmail()));
        if(userRepository.existsByUsername(userCreateDto.getUsername()))
            throw new DuplicateAttributeException(String.format("Username %s already exists", userCreateDto.getUsername()));

        String keycloakId = keycloakAdminService.createUser(userCreateDto);

        try {
            if (userRepository.existsByKeycloakId(keycloakId))
                throw new DuplicateAttributeException("User already registered");

            Role role = userCreateDto.getRole() != null ? userCreateDto.getRole() : Role.USER;
            keycloakAdminService.assignRole(keycloakId, role);

            User user = userMapper.toEntity(userCreateDto, keycloakId);

            if (userCreateDto.getOrganizationId() != null) {
                Organization organization = organizationRepository.findById(userCreateDto.getOrganizationId())
                        .orElseThrow(() -> new NotFoundException(String.format("Organization with id %d not found", userCreateDto.getOrganizationId())));
                if (!user.getMemberOrganizations().contains(organization)) {
                    user.getMemberOrganizations().add(organization);
                }
                organization.getMembers().add(user);
            }
            return userMapper.toResponseDto(userRepository.save(user));
        } catch (Exception e) {
            keycloakAdminService.deleteUser(keycloakId);
            throw e;
        }
    }

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

        if (userUpdateDto.getRole() != null) {
            keycloakAdminService.updateUserRole(user.getKeycloakId(), userUpdateDto.getRole());
        }

        if (userUpdateDto.getOrganizationId() != null) {
            Organization organization = organizationRepository.findById(userUpdateDto.getOrganizationId())
                    .orElseThrow(() -> new NotFoundException(String.format("Organization with id %d not found", userUpdateDto.getOrganizationId())));
            if (!user.getMemberOrganizations().contains(organization)) {
                user.getMemberOrganizations().add(organization);
            }
            if(!organization.getMembers().contains(user)) {
                organization.getMembers().add(user);
            }
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
        userRepository.deleteById(userId);
    }
}