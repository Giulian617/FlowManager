package flowmanager.nomenclator.security.model;

import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.model.Comment;
import flowmanager.nomenclator.repository.CommentRepository;
import flowmanager.nomenclator.security.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("commentSecurity")
@RequiredArgsConstructor
public class CommentSecurity {
    private final CommentRepository commentRepository;

    public boolean canModify(Authentication auth, Integer commentId) {
        if (Utils.isNotAuthenticated(auth))
            return false;
        if (Utils.isAdmin(auth))
            return true;

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException(String.format("Comment with id %d not found", commentId)));

        String currentUserId = Utils.getCurrentUserId(auth);
        if (comment.getAuthor().getKeycloakId().equals(currentUserId))
            return true;
        return comment.getWorkItem().getReporter().getKeycloakId().equals(currentUserId);
    }

    public boolean canDelete(Authentication auth, Integer commentId) {
        return canModify(auth, commentId);
    }
}