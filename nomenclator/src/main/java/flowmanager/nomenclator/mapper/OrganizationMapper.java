package flowmanager.nomenclator.mapper;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OrganizationMapper {
    private final UserRepository userRepository;

    public Organization toEntity(OrganizationCreateDto dto, User manager) {
        return Organization.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .industry(dto.getIndustry())
                .createdAt(LocalDateTime.now())
                .manager(manager)
                .build();
    }

    public void updateEntityFromDto(OrganizationUpdateDto dto, Organization organization, User manager) {
        Optional.ofNullable(dto.getName()).ifPresent(organization::setName);
        Optional.ofNullable(dto.getDescription()).ifPresent(organization::setDescription);
        Optional.ofNullable(dto.getIndustry()).ifPresent(organization::setIndustry);
        organization.setManager(manager);
    }

    public OrganizationSummaryDto toSummaryDto(Organization organization) {
        return OrganizationSummaryDto.builder()
                .id(organization.getId())
                .name(organization.getName())
                .description(organization.getDescription())
                .build();
    }

    public OrganizationResponseDto toResponseDto(Organization organization) {
        User manager = organization.getManager();
        UserSummaryDto managerDto = new UserSummaryDto(
                manager.getId(),
                manager.getUsername()
        );

        List<TeamSummaryOrganizationDto> teamsDto = new ArrayList<>();
        if(organization.getTeams() != null) {
            teamsDto = organization.getTeams()
                    .stream()
                    .map(team -> new TeamSummaryOrganizationDto(
                                    team.getId(),
                                    team.getName(),
                                    new UserSummaryDto(
                                            team.getManager().getId(),
                                            team.getManager().getUsername()
                                    )
                            )
                    )
                    .toList();
        }

        return OrganizationResponseDto.builder()
                .id(organization.getId())
                .name(organization.getName())
                .description(organization.getDescription())
                .industry(organization.getIndustry())
                .createdAt(organization.getCreatedAt())
                .manager(managerDto)
                .teams(teamsDto)
                .build();
    }
}