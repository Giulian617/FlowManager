package flowmanager.nomenclator.security.model;

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

        Integer currentUserId = Utils.getCurrentUserId(auth);
        return commentRepository.findById(commentId).map(comment -> {
            if (comment.getAuthor().getId().equals(currentUserId)) {
                return true;
            }
            return comment.getWorkItem().getReporter().getId().equals(currentUserId);
        }).orElse(false);
    }
}