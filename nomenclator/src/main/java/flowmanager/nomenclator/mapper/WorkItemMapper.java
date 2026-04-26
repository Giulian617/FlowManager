package flowmanager.nomenclator.mapper;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.model.*;
import flowmanager.nomenclator.repository.ProjectRepository;
import flowmanager.nomenclator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class WorkItemMapper {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public WorkItem toEntity(WorkItemCreateDto dto, Project project) {
        return WorkItem.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .type(dto.getType())
                .severity(dto.getSeverity())
                .dueDate(dto.getDueDate())
                .createdAt(LocalDateTime.now())
                .project(project)
                .status(Status.To_do)
                .reporter(userRepository.findById(1).orElseThrow(
                        () -> new NotFoundException(String.format("User with id %d not found", 1)))) // TODO: get the user from the context here
                .build();
    }

    public void updateEntityFromDto(WorkItemUpdateDto dto, WorkItem workItem) {
        Optional.ofNullable(dto.getTitle()).ifPresent(workItem::setTitle);
        Optional.ofNullable(dto.getDescription()).ifPresent(workItem::setDescription);
        Optional.ofNullable(dto.getStatus()).ifPresent(workItem::setStatus);
        Optional.ofNullable(dto.getSeverity()).ifPresent(workItem::setSeverity);
        Optional.ofNullable(dto.getDueDate()).ifPresent(workItem::setDueDate);
    }

    public WorkItemSummaryDto toSummaryDto(WorkItem workItem) {
        return WorkItemSummaryDto.builder()
                .id(workItem.getId())
                .itemType(workItem.getType())
                .title(workItem.getTitle())
                .status(workItem.getStatus())
                .build();
    }


    public WorkItemResponseDto toResponseDto(WorkItem workItem) {
        User reporter = workItem.getReporter();
        UserSummaryDto reporterDto = new UserSummaryDto(
                reporter.getId(),
                reporter.getUsername()
        );

        List<UserSummaryDto> assigneeDtos = mapAssignees(workItem.getAssignees());

        ProjectSummaryDto projectDto = ProjectSummaryDto.builder()
                .id(workItem.getProject().getId())
                .name(workItem.getProject().getName())
                .description(workItem.getProject().getDescription())
                .build();

        WorkItemSummaryDto parentDto = null;
        if (workItem.getParent() != null) {
            parentDto = toSummaryDto(workItem.getParent());
        }

        List<WorkItemSummaryDto> childrenDtos = List.of();
        if (workItem.getChildren() != null) {
            childrenDtos = workItem.getChildren().stream()
                    .map(this::toSummaryDto)
                    .toList();
        }

        return WorkItemResponseDto.builder()
                .id(workItem.getId())
                .project(projectDto)
                .title(workItem.getTitle())
                .description(workItem.getDescription())
                .reporter(reporterDto)
                .assignees(assigneeDtos)
                .itemType(workItem.getType())
                .status(workItem.getStatus())
                .severity(workItem.getSeverity())
                .createdAt(workItem.getCreatedAt())
                .dueDate(workItem.getDueDate())
                .parent(parentDto)
                .children(childrenDtos)
                .build();
    }

    public List<WorkItemSummaryDto> toSummaryDtoList(List<WorkItem> workItems) {
        return workItems.stream()
                .map(this::toSummaryDto)
                .collect(Collectors.toList());
    }

    private List<UserSummaryDto> mapAssignees(Set<WorkItemAssignment> assignments) {
        if (assignments == null) return List.of();

        return assignments.stream()
                .map(assignment -> new UserSummaryDto(
                        assignment.getUser().getId(),
                        assignment.getUser().getUsername()
                ))
                .collect(Collectors.toList());
    }
}