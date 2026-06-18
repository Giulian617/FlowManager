package flowmanager.nomenclator.repository.spec;

import flowmanager.nomenclator.model.Organization;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

public final class OrganizationSpecifications {

    private OrganizationSpecifications() {}

    public static Specification<Organization> managerIdEquals(Integer managerId) {
        return managerId == null ? null
                : (root, query, cb) -> cb.equal(root.join("manager", JoinType.LEFT).get("id"), managerId);
    }

    public static Specification<Organization> industryEquals(String industry) {
        return (industry == null || industry.isBlank() || industry.equalsIgnoreCase("all")) ? null
                : (root, query, cb) -> cb.equal(root.get("industry"), industry);
    }

    public static Specification<Organization> search(String text) {
        if (text == null || text.isBlank()) return null;
        String like = "%" + text.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), like),
                cb.like(cb.lower(root.get("description")), like),
                cb.like(cb.lower(root.get("industry")), like),
                cb.like(cb.lower(root.join("manager", JoinType.LEFT).get("username")), like)
        );
    }

    public static Specification<Organization> orderBySize(String collection, Sort.Direction direction) {
        return (root, query, cb) -> {
            if (query != null && query.getResultType() != Long.class && query.getResultType() != long.class) {
                var size = cb.size(root.get(collection));
                query.orderBy(direction == Sort.Direction.ASC ? cb.asc(size) : cb.desc(size));
            }
            return cb.conjunction();
        };
    }
}
