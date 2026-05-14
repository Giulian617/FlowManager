package flowmanager.nomenclator.mapper;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.Project;
import flowmanager.nomenclator.model.Team;
import flowmanager.nomenclator.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProjectMapper {
    private final WorkItemMapper workItemMapper;

    public Project toEntity(ProjectCreateDto dto, User manager) {
        return Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .manager(manager)
                .build();
    }

    public void updateEntityFromDto(ProjectUpdateDto dto, Project project, User manager) {
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

        List<WorkItemSummaryDto> workItemsDto = new ArrayList<>();
        if(project.getWorkItems() != null) {
            workItemsDto = project.getWorkItems()
                    .stream()
                    .map(workItemMapper::toSummaryDto)
                    .toList();
        }

        List<TeamSummaryDto> teamsDto = new ArrayList<>();
        if(project.getTeams() != null) {
            teamsDto = project.getTeams()
                    .stream()
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
