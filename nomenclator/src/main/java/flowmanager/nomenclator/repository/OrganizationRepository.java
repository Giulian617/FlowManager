package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Integer> {
    void deleteByManagerId(Integer userId);
}