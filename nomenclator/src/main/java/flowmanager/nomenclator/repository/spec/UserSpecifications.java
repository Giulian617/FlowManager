package flowmanager.nomenclator.repository.spec;

import flowmanager.nomenclator.model.Role;
import flowmanager.nomenclator.model.User;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public final class UserSpecifications {

    private UserSpecifications() {}

    public static Specification<User> roleEquals(Role role) {
        return role == null ? null : (root, query, cb) -> cb.equal(root.get("role"), role);
    }

    public static Specification<User> memberOfOrganization(Integer organizationId) {
        return organizationId == null ? null : (root, query, cb) -> {
            if (query != null) query.distinct(true);
            return cb.equal(root.join("memberOrganizations", JoinType.LEFT).get("id"), organizationId);
        };
    }

    public static Specification<User> activeEquals(Boolean active) {
        return active == null ? null : (root, query, cb) -> cb.equal(root.get("active"), active);
    }

    public static Specification<User> search(String text) {
        if (text == null || text.isBlank()) return null;
        String like = "%" + text.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("firstName")), like),
                cb.like(cb.lower(root.get("lastName")), like),
                cb.like(cb.lower(root.get("username")), like),
                cb.like(cb.lower(root.get("email")), like)
        );
    }
}
