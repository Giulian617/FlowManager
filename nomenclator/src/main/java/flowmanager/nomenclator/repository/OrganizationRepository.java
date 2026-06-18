package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Integer>, JpaSpecificationExecutor<Organization> {
    boolean existsByIdAndManagerKeycloakId(Integer organizationId, String keycloakId);
    boolean existsByIdAndMembersKeycloakId(Integer organizationId, String keycloakId);
    boolean existsByManagerKeycloakIdAndTeamsMembersKeycloakId(String managerKeycloakId, String memberKeycloakId);
}