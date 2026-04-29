package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.WorkItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkItemRepository extends JpaRepository<WorkItem, Integer>, JpaSpecificationExecutor<WorkItem> {
    List<WorkItem> findAllByReporterId(Integer reporterId);
    void deleteByReporterId(Integer reporterId);
    void deleteByProjectId(Integer projectId);
}
