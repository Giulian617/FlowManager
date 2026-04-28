package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.WorkItemAssignment;
import flowmanager.nomenclator.model.WorkItemAssignment.WorkItemAssignmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkItemAssignmentRepository extends JpaRepository<WorkItemAssignment, WorkItemAssignmentId> {
    void deleteByWorkItemId(Integer workItemId);
    void deleteByUserId(Integer userId);
    List<WorkItemAssignment> findAllByUserId(Integer userId);
}