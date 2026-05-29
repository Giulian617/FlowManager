package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.ProjectMapper;
import flowmanager.nomenclator.mapper.TeamMapper;
import flowmanager.nomenclator.mapper.UserMapper;
import flowmanager.nomenclator.mapper.WorkItemMapper;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.Team;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.TeamRepository;
import flowmanager.nomenclator.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final TeamMapper teamMapper;
    private final UserMapper userMapper;
    private final ProjectMapper projectMapper;
    private final WorkItemMapper workItemMapper;

    private Team getTeam(Integer teamId) {
        return teamRepository.findById(teamId).orElseThrow(
                () -> new NotFoundException(String.format("Team with id %d not found", teamId))
        );
    }

    public List<TeamSummaryDto> findAllTeams() {
        return teamRepository
                .findAll()
                .stream()
                .map(teamMapper::toSummaryDto)
                .toList();
    }

    public List<UserSummaryDto> findAllMembersByTeamId(Integer teamId) {
        Team team = getTeam(teamId);

        return team.getMembers().stream()
                .map(userMapper::toSummaryDto)
                .toList();
    }

    public List<ProjectSummaryDto> findAllProjectsByTeamId(Integer teamId) {
        Team team = getTeam(teamId);

        return team.getProjects().stream()
                .map(projectMapper::toSummaryDto)
                .toList();
    }

    public List<WorkItemSummaryDto> findAllWorkItemsByTeamId(Integer teamId) {
        Team team = getTeam(teamId);

        return team.getMembers().stream()
                .flatMap(member -> member.getAssignedWorkItems().stream())
                .distinct()
                .map(workItemMapper::toSummaryDto)
                .toList();
    }

    public TeamResponseDto findTeamById(Integer teamId) {
        return teamMapper.toResponseDto(teamRepository.findById(teamId).orElseThrow(
                () -> new NotFoundException(String.format("Team with id %d not found", teamId))
        ));
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