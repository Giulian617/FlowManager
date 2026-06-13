package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.Project;
import flowmanager.nomenclator.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Integer> {
    long countByTeamsContaining(Team team);
}
