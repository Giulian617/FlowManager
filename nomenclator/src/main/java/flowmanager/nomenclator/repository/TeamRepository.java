package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Integer> {
    void deleteByManagerId(Integer managerId);
    void deleteByOrganizationId(Integer organizationId);
}
