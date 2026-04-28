package flowmanager.nomenclator.mapper;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.model.Project;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.model.WorkItem;
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
                    .map(workItem -> new WorkItemSummaryDto(
                            workItem.getId(),
                            workItem.getItemType(),
                            workItem.getTitle(),
                            workItem.getStatus(),
                            workItem.getSeverity()
                    ))
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
                .build();
    }
}
