package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.DuplicateAttributeException;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.*;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.model.WorkItem;
import flowmanager.nomenclator.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;
    private final TeamRepository teamRepository;
    private final WorkItemRepository workItemRepository;
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

    private User getUser(Integer userId) {
        return userRepository.findById(userId).orElseThrow(
                () -> new NotFoundException(String.format("User with id %d not found", userId))
        );
    }

    public List<UserSummaryDto> findAllUsers() {
        return userRepository
                .findAll()
                .stream()
                .map(userMapper::toSummaryDto)
                .toList();
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

    public List<OrganizationSummaryDto> findAllOrganizationsByUserId(Integer userId) {
        return getUser(userId)
                .getOrganizations()
                .stream()
                .map(organizationMapper::toSummaryDto)
                .toList();
    }

    public List<TeamSummaryUserDto> findAllTeamsByUserIdWhereManager(Integer userId) {
        return getUser(userId)
                .getManagedTeams()
                .stream()
                .map(teamMapper::toSummaryUserDto)
                .toList();
    }

    public List<TeamSummaryUserDto> findAllTeamsByUserIdWhereAssignee(Integer userId) {
        return getUser(userId)
                .getAssignedTeams()
                .stream()
                .map(teamMapper::toSummaryUserDto)
                .toList();
    }

    public List<WorkItemSummaryDto> findAllWorkItemsByUserIdWhereReporter(Integer userId) {
        return getUser(userId)
                .getReportedWorkItems()
                .stream()
                .map(workItemMapper::toSummaryDto)
                .toList();
    }

    public List<WorkItemSummaryDto> findAllWorkItemsByUserIdWhereAssignee(Integer userId) {
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
        User user = userMapper.toEntity(userCreateDto);

        if(userRepository.existsByEmail(user.getEmail()))
            throw new DuplicateAttributeException("Email already exists");
        if(userRepository.existsByUsername(user.getUsername()))
            throw new DuplicateAttributeException("Username already exists");

        return userMapper.toResponseDto(userRepository.save(user));
    }

    public UserResponseDto updateUser(Integer userId, UserUpdateDto userUpdateDto) {
        User user = getUser(userId);

        if (userUpdateDto.getEmail() != null && !userUpdateDto.getEmail().equals(user.getEmail()) &&
                userRepository.existsByEmail(userUpdateDto.getEmail())) {
            throw new DuplicateAttributeException("Email already exists");
        }

        if (userUpdateDto.getUsername() != null && !userUpdateDto.getUsername().equals(user.getUsername()) &&
                userRepository.existsByUsername(userUpdateDto.getUsername())) {
            throw new DuplicateAttributeException("Username already exists");
        }

        userMapper.updateEntityFromDto(userUpdateDto, user);
        return userMapper.toResponseDto(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId).orElse(null);
        if(user == null) {
            return;
        };

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

        commentRepository.deleteAll(user.getComments());
        userRepository.deleteById(userId);
    }
}