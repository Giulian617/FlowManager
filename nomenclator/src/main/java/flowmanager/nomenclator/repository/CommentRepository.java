package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findAllByAuthorId(Integer authorId);
    List<Comment> findAllByWorkItemId(Integer workItemId);
    void deleteByAuthorId(Integer authorId);
}
