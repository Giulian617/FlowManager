package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Integer> {
    List<Project> findALlByManagerId(Integer managerId);
    void deleteByManagerId(Integer managerId);
}
