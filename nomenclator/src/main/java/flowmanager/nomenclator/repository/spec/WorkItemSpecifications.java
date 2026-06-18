package flowmanager.nomenclator.repository.spec;

import flowmanager.nomenclator.model.ItemType;
import flowmanager.nomenclator.model.Severity;
import flowmanager.nomenclator.model.Status;
import flowmanager.nomenclator.model.WorkItem;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class WorkItemSpecifications {

    private WorkItemSpecifications() {}

    public static Specification<WorkItem> projectIdEquals(Integer projectId) {
        return projectId == null ? null
                : (root, query, cb) -> cb.equal(root.get("project").get("id"), projectId);
    }

    public static Specification<WorkItem> itemTypeIn(List<ItemType> itemTypes) {
        return (itemTypes == null || itemTypes.isEmpty()) ? null
                : (root, query, cb) -> root.get("itemType").in(itemTypes);
    }

    public static Specification<WorkItem> statusIn(List<Status> statuses) {
        return (statuses == null || statuses.isEmpty()) ? null
                : (root, query, cb) -> root.get("status").in(statuses);
    }

    public static Specification<WorkItem> severityIn(List<Severity> severities) {
        return (severities == null || severities.isEmpty()) ? null
                : (root, query, cb) -> root.get("severity").in(severities);
    }

    public static Specification<WorkItem> reporterIdIn(List<Integer> reporterIds) {
        return (reporterIds == null || reporterIds.isEmpty()) ? null
                : (root, query, cb) -> root.join("reporter", JoinType.LEFT).get("id").in(reporterIds);
    }

    public static Specification<WorkItem> assigneeFilter(List<Integer> assigneeIds, boolean includeUnassigned) {
        boolean hasIds = assigneeIds != null && !assigneeIds.isEmpty();
        if (!hasIds && !includeUnassigned) return null;
        return (root, query, cb) -> {
            if (query != null) query.distinct(true);
            List<Predicate> ors = new ArrayList<>();
            if (hasIds) {
                ors.add(root.join("assignees", JoinType.LEFT).get("id").in(assigneeIds));
            }
            if (includeUnassigned) {
                ors.add(cb.isEmpty(root.get("assignees")));
            }
            return cb.or(ors.toArray(new Predicate[0]));
        };
    }

    public static Specification<WorkItem> search(String text) {
        if (text == null || text.isBlank()) return null;
        String trimmed = text.startsWith("#") ? text.substring(1) : text;
        String like = "%" + trimmed.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), like),
                cb.like(root.get("id").as(String.class), "%" + trimmed + "%")
        );
    }
}
