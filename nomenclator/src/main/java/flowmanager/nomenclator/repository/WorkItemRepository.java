package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.WorkItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkItemRepository extends JpaRepository<WorkItem, Integer>, JpaSpecificationExecutor<WorkItem> {
}
