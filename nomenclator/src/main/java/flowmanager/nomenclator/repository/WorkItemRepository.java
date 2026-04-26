package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.Project;
import flowmanager.nomenclator.model.WorkItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkItemRepository extends JpaRepository<WorkItem, Integer> {
    @Query("SELECT w FROM WorkItem w LEFT JOIN FETCH w.assignees WHERE w.id = :id")
    Optional<WorkItem> findByIdWithAssignees(@Param("id") Integer id);

    @Query("SELECT w FROM WorkItem w WHERE w.reporter.id = :userId")
    List<WorkItem> findAllByReporterId(@Param("userId") Integer userId);

    @Query("SELECT w FROM WorkItem w JOIN w.assignees a WHERE a.user.id = :userId")
    List<WorkItem> findAllAssignedToUser(@Param("userId") Integer userId);
}
