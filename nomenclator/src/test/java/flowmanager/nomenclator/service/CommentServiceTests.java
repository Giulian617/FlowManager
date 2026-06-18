package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.CommentCreateDto;
import flowmanager.nomenclator.dto.CommentResponseDto;
import flowmanager.nomenclator.dto.CommentUpdateDto;
import flowmanager.nomenclator.dto.PageResponseDto;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.CommentMapper;
import flowmanager.nomenclator.model.Comment;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.model.WorkItem;
import flowmanager.nomenclator.repository.CommentRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.repository.WorkItemRepository;
import flowmanager.nomenclator.utils.BuildDtos;
import flowmanager.nomenclator.utils.BuildInstances;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

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
    private UserRepository userRepository;

    @Mock
    private CommentMapper commentMapper;

    @InjectMocks
    private CommentService commentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAllComments_Valid() {
        List<Comment> comments = BuildInstances.buildComments();
        List<CommentResponseDto> commentsDto = comments.stream()
                .map(BuildDtos::buildCommentResponseDto)
                .toList();

        when(commentRepository.findAll(ArgumentMatchers.<Specification<Comment>>any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(comments));
        when(commentMapper.toResponseDto(comments.get(0))).thenReturn(commentsDto.get(0));
        when(commentMapper.toResponseDto(comments.get(1))).thenReturn(commentsDto.get(1));

        PageResponseDto<CommentResponseDto> result = commentService.findAllComments(null, null, Pageable.unpaged());

        assertEquals(2, result.content().size());
        assertEquals(commentsDto.get(0), result.content().get(0));
        assertEquals(commentsDto.get(1), result.content().get(1));
        verify(commentRepository, times(1))
                .findAll(ArgumentMatchers.<Specification<Comment>>any(), any(Pageable.class));
        verify(commentMapper, times(1)).toResponseDto(comments.get(0));
        verify(commentMapper, times(1)).toResponseDto(comments.get(1));
    }

    @Test
    void testFindAllComments_EmptyList() {
        when(commentRepository.findAll(ArgumentMatchers.<Specification<Comment>>any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        PageResponseDto<CommentResponseDto> result = commentService.findAllComments(null, null, Pageable.unpaged());

        assertEquals(0, result.content().size());
        verify(commentMapper, never()).toResponseDto(any());
    }

    @Test
    void testCreateComment_Valid() {
        User author = BuildInstances.buildUser();
        WorkItem workItem = BuildInstances.buildWorkItem();

        Comment comment = Comment.builder()
                .content("Comentariul 1")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .author(author)
                .workItem(workItem)
                .build();
        Comment savedComment = BuildInstances.buildComment();
        CommentCreateDto createDto = new CommentCreateDto(
                "Comentariul 1",
                1
        );
        CommentResponseDto responseDto = BuildDtos.buildCommentResponseDto(savedComment);

        when(workItemRepository.findById(workItem.getId())).thenReturn(Optional.of(workItem));
        when(userRepository.findByKeycloakId(author.getKeycloakId())).thenReturn(Optional.of(author));
        when(commentMapper.toEntity(createDto, workItem, author)).thenReturn(comment);
        when(commentRepository.save(comment)).thenReturn(savedComment);
        when(commentMapper.toResponseDto(savedComment)).thenReturn(responseDto);

        CommentResponseDto result = commentService.createComment(createDto, author.getKeycloakId());

        assertEquals(responseDto, result);
        verify(workItemRepository, times(1)).findById(workItem.getId());
        verify(userRepository, times(1)).findByKeycloakId(author.getKeycloakId());
        verify(commentMapper, times(1)).toEntity(createDto, workItem, author);
        verify(commentRepository, times(1)).save(comment);
        verify(commentMapper, times(1)).toResponseDto(savedComment);
    }

    @Test
    void testCreateComment_WorkItemNotFound() {
        String keycloakId = "keycloak-uuid-1";
        CommentCreateDto createDto = new CommentCreateDto(
                "Comentariul 1",
                1
        );

        when(workItemRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> commentService.createComment(createDto, keycloakId));

        assertEquals("WorkItem with id 1 not found", exception.getMessage());
    }

    @Test
    void testCreateComment_UserNotFound() {
        String keycloakId = "keycloak-uuid-1";
        WorkItem workItem = BuildInstances.buildWorkItem();
        CommentCreateDto createDto = new CommentCreateDto(
                "Comentariul 1",
                1
        );

        when(workItemRepository.findById(1)).thenReturn(Optional.of(workItem));
        when(userRepository.findByKeycloakId(keycloakId)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> commentService.createComment(createDto, keycloakId));

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void testUpdateComment_Valid() {
        User author = BuildInstances.buildUser();
        WorkItem workItem = BuildInstances.buildWorkItem();

        Comment comment = BuildInstances.buildComment();
        Comment updatedComment = Comment.builder()
                .id(1)
                .content("Comentariul 1 actualizat")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .updatedAt(LocalDateTime.of(2026, 5, 1, 15, 28, 44))
                .author(author)
                .workItem(workItem)
                .build();
        CommentUpdateDto updateDto = new CommentUpdateDto("Comentariul 1 actualizat");
        CommentResponseDto responseDto = BuildDtos.buildCommentResponseDto(updatedComment);

        when(commentRepository.findById(comment.getId())).thenReturn(Optional.of(comment));
        doNothing().when(commentMapper).updateEntityFromDto(updateDto, comment);
        when(commentRepository.save(comment)).thenReturn(updatedComment);
        when(commentMapper.toResponseDto(updatedComment)).thenReturn(responseDto);

        CommentResponseDto result = commentService.updateComment(comment.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(commentRepository, times(1)).findById(comment.getId());
        verify(commentMapper, times(1)).updateEntityFromDto(updateDto, comment);
        verify(commentRepository, times(1)).save(comment);
        verify(commentMapper, times(1)).toResponseDto(updatedComment);
    }

    @Test
    void testUpdateComment_CommentNotFound() {
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
