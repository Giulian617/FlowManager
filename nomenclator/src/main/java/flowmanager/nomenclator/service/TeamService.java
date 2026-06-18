package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.PageResponseDto;
import flowmanager.nomenclator.dto.TeamCreateDto;
import flowmanager.nomenclator.dto.TeamResponseDto;
import flowmanager.nomenclator.dto.TeamSummaryOrganizationDto;
import flowmanager.nomenclator.dto.TeamUpdateDto;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.TeamMapper;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.Team;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.TeamRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.repository.spec.TeamSpecifications;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class TeamService {
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final TeamMapper teamMapper;

    private Team getTeam(Integer teamId) {
        return teamRepository.findById(teamId).orElseThrow(
                () -> new NotFoundException(String.format("Team with id %d not found", teamId))
        );
    }

    private Page<Team> queryTeams(Specification<Team> scope, String search, Integer managerId, String size, Pageable pageable) {
        List<Specification<Team>> specs = new ArrayList<>(Stream.of(
                scope,
                TeamSpecifications.search(search),
                TeamSpecifications.managerIdEquals(managerId),
                TeamSpecifications.size(size)
        ).filter(Objects::nonNull).toList());

        Pageable effective = pageable;
        Sort.Order memberOrder = pageable.getSort().getOrderFor("members");
        if (memberOrder != null) {
            specs.add(TeamSpecifications.orderByMemberCount(memberOrder.getDirection()));
            effective = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        }

        return teamRepository.findAll(Specification.allOf(specs), effective);
    }

    public PageResponseDto<TeamResponseDto> findAllTeams(String search, Integer managerId, String size, Pageable pageable) {
        return PageResponseDto.from(queryTeams(null, search, managerId, size, pageable), teamMapper::toResponseDto);
    }

    public PageResponseDto<TeamSummaryOrganizationDto> findTeamsByOrganization(
            Integer organizationId, String keycloakId, String search, Integer managerId, String size, Pageable pageable) {
        User user = userRepository.findByKeycloakId(keycloakId).orElseThrow(
                () -> new NotFoundException("User not found")
        );
        Specification<Team> scope = Specification.allOf(
                Stream.of(
                        TeamSpecifications.organizationIdEquals(organizationId),
                        TeamSpecifications.visibleTo(user.getRole(), user.getId())
                ).filter(Objects::nonNull).toList()
        );
        return PageResponseDto.from(
                queryTeams(scope, search, managerId, size, pageable),
                teamMapper::toSummaryOrganizationDto);
    }

    public PageResponseDto<TeamSummaryOrganizationDto> findTeamsByProject(
            Integer projectId, String search, Integer managerId, String size, Pageable pageable) {
        return PageResponseDto.from(
                queryTeams(TeamSpecifications.projectIdEquals(projectId), search, managerId, size, pageable),
                teamMapper::toSummaryOrganizationDto);
    }

    @Transactional
    protected List<User> getMembers(List<Integer> membersIds) {
        List<User> users = userRepository.findAllById(membersIds);
        if(users.size() != membersIds.size()) {
            throw new NotFoundException("One or more users were not found");
        }
        return users;
    }

    @Transactional
    public TeamResponseDto createTeam(TeamCreateDto teamCreateDto, String keycloakId) {
        Organization organization = organizationRepository.findById(teamCreateDto.getOrganizationId()).orElseThrow(
                () -> new NotFoundException(String.format("Organization with id %d not found", teamCreateDto.getOrganizationId()))
        );
        User user = userRepository.findByKeycloakId(keycloakId).orElseThrow(
                () -> new NotFoundException("User not found")
        );
        Team team = teamMapper.toEntity(teamCreateDto, organization, user);

        List<User> members = new ArrayList<>();
        members.add(user);
        if (teamCreateDto.getMembersIds() != null && !teamCreateDto.getMembersIds().isEmpty()) {
            getMembers(teamCreateDto.getMembersIds()).forEach(member -> {
                if (!members.contains(member)) {
                    members.add(member);
                }
            });
        }
        members.forEach(member -> {
            if (!member.getAssignedTeams().contains(team)) {
                member.getAssignedTeams().add(team);
            }
        });
        team.setMembers(members);

        return teamMapper.toResponseDto(teamRepository.save(team));
    }

    @Transactional
    public TeamResponseDto updateTeam(Integer teamId, TeamUpdateDto teamUpdateDto) {
        Team team = getTeam(teamId);

        User manager = team.getManager();
        if(teamUpdateDto.getManagerId() != null) {
            manager = userRepository.findById(teamUpdateDto.getManagerId()).orElseThrow(
                    () -> new NotFoundException(String.format("Manager with id %d not found", teamUpdateDto.getManagerId()))
            );
        }

        if(teamUpdateDto.getMembersIds() != null) {
            List<User> previousMembers = team.getMembers();
            List<User> newMembers = getMembers(teamUpdateDto.getMembersIds());

            if (!newMembers.contains(manager)) {
                newMembers.add(manager);
            }

            previousMembers.forEach(user -> {
                if (!newMembers.contains(user)) {
                    user.getAssignedTeams().remove(team);
                }
            });

            newMembers.forEach(user -> {
                if (!user.getAssignedTeams().contains(team)) {
                    user.getAssignedTeams().add(team);
                }
            });

            team.setMembers(newMembers);
        }

        teamMapper.updateEntityFromDto(teamUpdateDto, team, manager);

        return teamMapper.toResponseDto(teamRepository.save(team));
    }

    @Transactional
    public void deleteTeam(Integer teamId) {
        Team team = teamRepository.findById(teamId).orElse(null);
        if(team == null) {
            return;
        }

        team.getManager().getManagedTeams().remove(team);
        team.getMembers()
                .forEach(user -> user.getAssignedTeams().remove(team));
        team.getProjects()
                .forEach(project -> project.getTeams().remove(team));
        teamRepository.deleteById(teamId);
    }
}