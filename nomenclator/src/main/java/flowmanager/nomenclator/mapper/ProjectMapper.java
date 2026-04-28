package flowmanager.nomenclator.mapper;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.model.*;
import flowmanager.nomenclator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProjectMapper {
    private final UserRepository userRepository;
    private final WorkItemMapper workItemMapper;

    public Project toEntity(ProjectCreateDto dto) {
        return Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .manager(userRepository.findById(1).orElseThrow(
                        () -> new NotFoundException(String.format("User with id %d not found", 1)))) //TODO: get the user from the context here
                .build();
    }

    public void updateEntityFromDto(ProjectUpdateDto dto, User manager, Project project) {
        Optional.ofNullable(dto.getName()).ifPresent(project::setName);
        Optional.ofNullable(dto.getDescription()).ifPresent(project::setDescription);
        Optional.ofNullable(dto.getStartDate()).ifPresent(project::setStartDate);
        Optional.ofNullable(dto.getEndDate()).ifPresent(project::setEndDate);
        project.setManager(manager);
    }

    public ProjectSummaryDto toSummaryDto(Project project) {
        return ProjectSummaryDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .build();
    }

    private TeamSummaryDto mapTeamSummary(Team team) {
        Organization organization = team.getOrganization();
        OrganizationSummaryDto organizationSummaryDto =  new OrganizationSummaryDto(
                organization.getId(),
                organization.getName(),
                organization.getDescription()
        );

        User manager = team.getManager();
        UserSummaryDto managerSummaryDto = new UserSummaryDto(
                manager.getId(),
                manager.getUsername()
        );

        return TeamSummaryDto.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .organization(organizationSummaryDto)
                .manager(managerSummaryDto)
                .build();
    }

    public ProjectResponseDto toResponseDto(Project project) {
        User manager = project.getManager();
        UserSummaryDto managerDto = new UserSummaryDto(
                manager.getId(),
                manager.getUsername()
        );

        List<WorkItem> workItems = project.getWorkItems();
        List<WorkItemSummaryDto> workItemsDto = new ArrayList<>();
        if(workItems != null) {
            workItemsDto = workItems.stream()
                    .map(workItemMapper::toSummaryDto)
                    .toList();
        }

        List<Team> teams = project.getTeams();
        List<TeamSummaryDto> teamsDto = new ArrayList<>();
        if(teams != null) {
            teamsDto = teams.stream()
                    .map(this::mapTeamSummary)
                    .toList();
        }

        return ProjectResponseDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .manager(managerDto)
                .workItems(workItemsDto)
                .teams(teamsDto)
                .build();
    }
}
