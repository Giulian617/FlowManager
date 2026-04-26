package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<Organization, Integer> {
}