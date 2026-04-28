package flowmanager.nomenclator.repository;

import flowmanager.nomenclator.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Integer> {
    List<Organization> findAllByManagerId(Integer userId);
    void deleteByManagerId(Integer userId);
}