package flowmanager.nomenclator.repository.spec;

import flowmanager.nomenclator.model.Project;
import flowmanager.nomenclator.model.Role;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class ProjectSpecifications {

    private static final int NEAR_DEADLINE_DAYS = 14;

    private ProjectSpecifications() {}

    public static Specification<Project> managerIdEquals(Integer managerId) {
        return managerId == null ? null
                : (root, query, cb) -> cb.equal(root.join("manager", JoinType.LEFT).get("id"), managerId);
    }

    public static Specification<Project> organizationIdEquals(Integer organizationId) {
        return organizationId == null ? null
                : (root, query, cb) -> cb.equal(root.get("organization").get("id"), organizationId);
    }

    public static Specification<Project> visibleTo(Role role, Integer userId) {
        if (role == Role.ADMIN) return null;
        return (root, query, cb) -> {
            if (query != null) query.distinct(true);
            Predicate assigned = cb.equal(
                    root.join("teams", JoinType.LEFT).join("members", JoinType.LEFT).get("id"), userId);
            if (role == Role.MANAGER) {
                Predicate managed = cb.equal(root.join("manager", JoinType.LEFT).get("id"), userId);
                return cb.or(managed, assigned);
            }
            return assigned;
        };
    }

    public static Specification<Project> search(String text) {
        if (text == null || text.isBlank()) return null;
        String like = "%" + text.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), like),
                cb.like(cb.lower(root.get("description")), like),
                cb.like(cb.lower(root.join("manager", JoinType.LEFT).get("username")), like)
        );
    }

    public static Specification<Project> deadline(String bucket) {
        if (bucket == null || bucket.isBlank() || bucket.equalsIgnoreCase("all")) return null;
        LocalDate today = LocalDate.now();
        LocalDate near = today.plusDays(NEAR_DEADLINE_DAYS);
        return switch (bucket) {
            case "overdue" -> (root, query, cb) -> cb.lessThan(root.get("endDate"), today);
            case "nearDeadline" -> (root, query, cb) -> cb.between(root.get("endDate"), today, near);
            case "onTrack" -> (root, query, cb) -> cb.greaterThan(root.get("endDate"), near);
            default -> null;
        };
    }
}
