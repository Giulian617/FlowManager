package flowmanager.nomenclator.repository.spec;

import flowmanager.nomenclator.model.Role;
import flowmanager.nomenclator.model.Team;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

public final class TeamSpecifications {

    private TeamSpecifications() {}

    public static Specification<Team> orderByMemberCount(Sort.Direction direction) {
        return (root, query, cb) -> {
            if (query != null && query.getResultType() != Long.class && query.getResultType() != long.class) {
                var memberCount = cb.size(root.get("members"));
                query.orderBy(direction == Sort.Direction.ASC ? cb.asc(memberCount) : cb.desc(memberCount));
            }
            return cb.conjunction();
        };
    }

    public static Specification<Team> managerIdEquals(Integer managerId) {
        return managerId == null ? null
                : (root, query, cb) -> cb.equal(root.join("manager", JoinType.LEFT).get("id"), managerId);
    }

    public static Specification<Team> organizationIdEquals(Integer organizationId) {
        return organizationId == null ? null
                : (root, query, cb) -> cb.equal(root.get("organization").get("id"), organizationId);
    }

    public static Specification<Team> projectIdEquals(Integer projectId) {
        return projectId == null ? null : (root, query, cb) -> {
            if (query != null) query.distinct(true);
            return cb.equal(root.join("projects", JoinType.LEFT).get("id"), projectId);
        };
    }

    public static Specification<Team> visibleTo(Role role, Integer userId) {
        if (role == Role.ADMIN) return null;
        return (root, query, cb) -> {
            if (query != null) query.distinct(true);
            Predicate member = cb.equal(root.join("members", JoinType.LEFT).get("id"), userId);
            if (role == Role.MANAGER) {
                Predicate managed = cb.equal(root.join("manager", JoinType.LEFT).get("id"), userId);
                return cb.or(managed, member);
            }
            return member;
        };
    }

    public static Specification<Team> size(String bucket) {
        if (bucket == null || bucket.isBlank() || bucket.equalsIgnoreCase("all")) return null;
        return switch (bucket) {
            case "small" -> (root, query, cb) -> cb.between(cb.size(root.get("members")), 1, 3);
            case "medium" -> (root, query, cb) -> cb.between(cb.size(root.get("members")), 4, 7);
            case "large" -> (root, query, cb) -> cb.greaterThanOrEqualTo(cb.size(root.get("members")), 8);
            default -> null;
        };
    }

    public static Specification<Team> search(String text) {
        if (text == null || text.isBlank()) return null;
        String like = "%" + text.toLowerCase() + "%";
        return (root, query, cb) -> {
            if (query != null) query.distinct(true);
            var manager = root.join("manager", JoinType.LEFT);
            var members = root.join("members", JoinType.LEFT);
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("description")), like),
                    cb.like(cb.lower(manager.get("username")), like),
                    cb.like(cb.lower(members.get("username")), like)
            );
        };
    }
}
