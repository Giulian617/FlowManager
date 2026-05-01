package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.CommentMapper;
import flowmanager.nomenclator.model.*;
import flowmanager.nomenclator.repository.CommentRepository;
import flowmanager.nomenclator.repository.WorkItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

public class CommentServiceTests {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private WorkItemRepository workItemRepository;

    @Mock
    private CommentMapper commentMapper;

    @InjectMocks
    private CommentService commentService;

    private User buildAuthor() {
        return User.builder()
                .id(1)
                .email("user1@example.com")
                .username("User1")
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .active(false)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();
    }

    private WorkItem buildWorkItem() {
        return WorkItem.builder()
                .id(1)
                .title("Work item 1")
                .description("Description work item 1")
                .itemType(ItemType.Task)
                .status(Status.To_do)
                .severity(Severity.Low)
                .createdAt(LocalDateTime.of(2026, 3, 20, 18, 33, 30))
                .build();
    }

    private UserSummaryDto buildAuthorDto(User author) {
        return UserSummaryDto.builder()
                .id(author.getId())
                .username(author.getUsername())
                .build();
    }

    private WorkItemSummaryDto buildWorkItemDto(WorkItem workItem) {
        return WorkItemSummaryDto.builder()
                .id(workItem.getId())
                .title(workItem.getTitle())
                .itemType(workItem.getItemType())
                .status(workItem.getStatus())
                .severity(workItem.getSeverity())
                .build();
    }

    private CommentResponseDto buildCommentResponseDto(
            Comment comment,
            UserSummaryDto authorDto,
            WorkItemSummaryDto workItemDto
    ) {
        return CommentResponseDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .author(authorDto)
                .workItem(workItemDto)
                .build();
    }

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAllComments_Valid() {
        User author = buildAuthor();
        UserSummaryDto authorDto = buildAuthorDto(author);

        WorkItem workItem = buildWorkItem();
        WorkItemSummaryDto workItemDto = buildWorkItemDto(workItem);

        Comment comment1 = Comment.builder()
                .id(1)
                .content("Comentariul 1")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .author(author)
                .workItem(workItem)
                .build();

        Comment comment2 = Comment.builder()
                .id(2)
                .content("Comentariul 2")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 24, 21))
                .updatedAt(LocalDateTime.of(2026, 5, 1, 15, 28, 44))
                .author(author)
                .workItem(workItem)
                .build();

        CommentResponseDto dto1 = buildCommentResponseDto(comment1, authorDto, workItemDto);
        CommentResponseDto dto2 = buildCommentResponseDto(comment2, authorDto, workItemDto);

        when(commentRepository.findAll()).thenReturn(List.of(comment1, comment2));
        when(commentMapper.toResponseDto(comment1)).thenReturn(dto1);
        when(commentMapper.toResponseDto(comment2)).thenReturn(dto2);

        List<CommentResponseDto> result = commentService.findAllComments();

        assertEquals(2, result.size());
        assertEquals(dto1, result.get(0));
        assertEquals(dto2, result.get(1));
        verify(commentRepository, times(1)).findAll();
        verify(commentMapper, times(1)).toResponseDto(comment1);
        verify(commentMapper, times(1)).toResponseDto(comment2);
    }

    @Test
    void testFindAllComments_EmptyList() {
        when(commentRepository.findAll()).thenReturn(List.of());

        List<CommentResponseDto> result = commentService.findAllComments();

        assertEquals(0, result.size());
        verify(commentRepository, times(1)).findAll();
        verify(commentMapper, never()).toResponseDto(any());
    }

    @Test
    void testCreateComment_Valid() {
        User author = buildAuthor();
        UserSummaryDto authorDto = buildAuthorDto(author);
        WorkItem workItem = buildWorkItem();
        WorkItemSummaryDto workItemDto = buildWorkItemDto(workItem);

        Comment comment = Comment.builder()
                .content("Comentariul 1")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .author(author)
                .workItem(workItem)
                .build();

        Comment savedComment = Comment.builder()
                .id(1)
                .content("Comentariul 1")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .author(author)
                .workItem(workItem)
                .build();

        CommentCreateDto createDto = new CommentCreateDto(
                "Comentariul 1",
                1
        );
        CommentResponseDto responseDto = buildCommentResponseDto(savedComment, authorDto, workItemDto);

        when(workItemRepository.findById(1)).thenReturn(Optional.of(workItem));
        when(commentMapper.toEntity(createDto,workItem)).thenReturn(comment);
        when(commentRepository.save(comment)).thenReturn(savedComment);
        when(commentMapper.toResponseDto(savedComment)).thenReturn(responseDto);

        CommentResponseDto result = commentService.createComment(createDto);

        assertEquals(responseDto, result);
        verify(workItemRepository, times(1)).findById(1);
        verify(commentMapper, times(1)).toEntity(createDto, workItem);
        verify(commentRepository, times(1)).save(comment);
        verify(commentMapper, times(1)).toResponseDto(savedComment);
    }

    @Test
    void testCreateComment_Invalid() {
        CommentCreateDto createDto = new CommentCreateDto(
                "Comentariul 1",
                1
        );

        when(workItemRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> commentService.createComment(createDto));

        assertEquals("WorkItem with id 1 not found", exception.getMessage());
    }

    @Test
    void testUpdateComment_Valid() {
        User author = buildAuthor();
        UserSummaryDto authorDto = buildAuthorDto(author);

        WorkItem workItem = buildWorkItem();
        WorkItemSummaryDto workItemDto = buildWorkItemDto(workItem);

        Comment comment = Comment.builder()
                .content("Comentariul 1")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .author(author)
                .workItem(workItem)
                .build();

        Comment updatedComment = Comment.builder()
                .id(1)
                .content("Comentariul 1 actualizat")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .updatedAt(LocalDateTime.of(2026, 5, 1, 15, 28, 44))
                .author(author)
                .workItem(workItem)
                .build();

        CommentUpdateDto updateDto = new CommentUpdateDto("Comentariul 1 actualizat");
        CommentResponseDto responseDto = buildCommentResponseDto(updatedComment, authorDto, workItemDto);

        when(commentRepository.findById(1)).thenReturn(Optional.of(comment));
        doNothing().when(commentMapper).updateEntityFromDto(updateDto, comment);
        when(commentRepository.save(comment)).thenReturn(updatedComment);
        when(commentMapper.toResponseDto(updatedComment)).thenReturn(responseDto);

        CommentResponseDto result = commentService.updateComment(1, updateDto);

        assertEquals(responseDto, result);
        verify(commentRepository, times(1)).findById(1);
        verify(commentMapper, times(1)).updateEntityFromDto(updateDto, comment);
        verify(commentRepository, times(1)).save(comment);
        verify(commentMapper, times(1)).toResponseDto(updatedComment);
    }

    @Test
    void testUpdateComment_Invalid() {
        CommentUpdateDto updateDto = new CommentUpdateDto("Comentariul 1 actualizat");

        when(commentRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> commentService.updateComment(1, updateDto));

        assertEquals("Comment with id 1 not found", exception.getMessage());
    }

    @Test
    void testDeleteComment_Valid() {
        doNothing().when(commentRepository).deleteById(1);

        commentService.deleteComment(1);

        verify(commentRepository, times(1)).deleteById(1);
    }
}
