package flowmanager.nomenclator.repository.spec;

import flowmanager.nomenclator.model.Comment;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public final class CommentSpecifications {

    private CommentSpecifications() {}

    public static Specification<Comment> authorIdEquals(Integer authorId) {
        return authorId == null ? null
                : (root, query, cb) -> cb.equal(root.join("author", JoinType.LEFT).get("id"), authorId);
    }

    public static Specification<Comment> search(String text) {
        if (text == null || text.isBlank()) return null;
        String like = "%" + text.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("content")), like),
                cb.like(cb.lower(root.join("author", JoinType.LEFT).get("username")), like)
        );
    }
}
