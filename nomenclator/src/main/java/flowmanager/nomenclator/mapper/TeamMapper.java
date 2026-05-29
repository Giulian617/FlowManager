package flowmanager.nomenclator.mapper;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.Project;
import flowmanager.nomenclator.model.Team;
import flowmanager.nomenclator.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TeamMapper {
    public Team toEntity(TeamCreateDto dto, Organization organization, User manager) {
        return Team.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .createdAt(LocalDate.now())
                .organization(organization)
                .manager(manager)
                .build();
    }

    public void updateEntityFromDto(TeamUpdateDto dto, Team team, User manager) {
        Optional.ofNullable(dto.getName()).ifPresent(team::setName);
        Optional.ofNullable(dto.getDescription()).ifPresent(team::setDescription);
        team.setManager(manager);
    }

    private OrganizationSummaryDto getOrganizationSummaryDto(Team team) {
        Organization organization = team.getOrganization();
        return new OrganizationSummaryDto(
                organization.getId(),
                organization.getName(),
                organization.getDescription()
        );
    }

    private UserSummaryDto getManagerSummaryDto(Team team) {
        User manager = team.getManager();
        return new UserSummaryDto(
                manager.getId(),
                manager.getUsername(),
                manager.getRole()
        );
    }

    public TeamSummaryUserDto toSummaryUserDto(Team team) {
        return TeamSummaryUserDto.builder()
                .id(team.getId())
                .name(team.getName())
                .organization(getOrganizationSummaryDto(team))
                .build();
    }

    public TeamSummaryOrganizationDto toSummaryOrganizationDto(Team team) {
        List<UserSummaryDto> membersDto = new ArrayList<>();
        if(team.getMembers() != null) {
            membersDto = team.getMembers()
                    .stream()
                    .map(this::mapUserSummary)
                    .toList();
        }

        return TeamSummaryOrganizationDto.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .manager(getManagerSummaryDto(team))
                .createdAt(team.getCreatedAt())
                .members(membersDto)
                .build();
    }

    public TeamSummaryDto toSummaryDto(Team team) {
        return TeamSummaryDto.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .organization(getOrganizationSummaryDto(team))
                .manager(getManagerSummaryDto(team))
                .build();
    }

    private ProjectSummaryDto mapProjectSummary(Project project) {
        return ProjectSummaryDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .build();
    }

    private UserSummaryDto mapUserSummary(User user) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    public TeamResponseDto toResponseDto(Team team) {
        List<ProjectSummaryDto> projectsDto = new ArrayList<>();
        if(team.getProjects() != null) {
            projectsDto = team.getProjects()
                    .stream()
                    .map(this::mapProjectSummary)
                    .toList();
        }

        List<UserSummaryDto> membersDto = new ArrayList<>();
        if(team.getMembers() != null) {
            membersDto = team.getMembers()
                    .stream()
                    .map(this::mapUserSummary)
                    .toList();
        }

        return TeamResponseDto.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .createdAt(team.getCreatedAt())
                .organization(getOrganizationSummaryDto(team))
                .manager(getManagerSummaryDto(team))
                .projects(projectsDto)
                .members(membersDto)
                .build();
    }
}
