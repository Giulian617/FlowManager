package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.awt.print.Book;
import java.util.Arrays;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    @Query("""
                SELECT DISTINCT c
                FROM Comment c
                WHERE c.user.id = :userId
            """)
    List<Comment> findAllCommentsByUserId(@Param("userId") Integer userId);
}
