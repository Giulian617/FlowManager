package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.WorkItemAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface WorkItemAssignmentRepository extends JpaRepository<WorkItemAssignment, Integer> {
    @Transactional
    void deleteByWorkItemId(Integer workItemId);
    List<WorkItemAssignment> findByWorkItemId(Integer workItemId);
}