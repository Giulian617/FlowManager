package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Integer> {
    @Query("""
                SELECT DISTINCT p
                FROM Project p
                WHERE p.manager.id = :userId
            """)
    List<Project> findAllProjectsByUserId(@Param("userId") Integer userId);
}
