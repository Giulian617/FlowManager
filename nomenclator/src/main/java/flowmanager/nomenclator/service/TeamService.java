package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.TeamMapper;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.Team;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.TeamRepository;
import flowmanager.nomenclator.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final TeamMapper teamMapper;

    public List<TeamSummaryDto> findAllTeams() {
        return teamRepository
                .findAll()
                .stream()
                .map(teamMapper::toSummaryDto)
                .toList();
    }

    public TeamResponseDto findTeamById(Integer teamId) {
        return teamMapper.toResponseDto(teamRepository.findById(teamId).orElseThrow(
                () -> new NotFoundException(String.format("Team with id %d not found", teamId))
        ));
    }

    public TeamResponseDto createTeam(TeamCreateDto teamCreateDto) {
        Organization organization = organizationRepository.findById(teamCreateDto.getOrganizationId()).orElseThrow(
                () -> new NotFoundException(String.format("Organization with id %d not found", teamCreateDto.getOrganizationId()))
        );
        Team team = teamMapper.toEntity(teamCreateDto, organization);
        return teamMapper.toResponseDto(teamRepository.save(team));
    }

    public TeamResponseDto updateTeam(Integer teamId, TeamUpdateDto teamUpdateDto) {
        Team team = teamRepository.findById(teamId).orElseThrow(
                () -> new NotFoundException(String.format("Team with id %d not found", teamId))
        );
        Organization organization = team.getOrganization();
        if(teamUpdateDto.getOrganizationId() != null) {
            organization = organizationRepository.findById(teamUpdateDto.getOrganizationId()).orElseThrow(
                    () -> new NotFoundException(String.format("Organization with id %d not found", teamUpdateDto.getOrganizationId()))
            );
        }
        User manager = team.getManager();
        if(teamUpdateDto.getManagerId() != null) {
            manager = userRepository.findById(teamUpdateDto.getManagerId()).orElseThrow(
                    () -> new NotFoundException(String.format("Manager with id %d not found", teamUpdateDto.getManagerId()))
            );
        }
        teamMapper.updateEntityFromDto(teamUpdateDto, team, organization, manager);

        return teamMapper.toResponseDto(teamRepository.save(team));
    }

    @Transactional
    public TeamResponseDto assignUsers(Integer teamId, TeamAssignDto teamAssignDto) {
        Team team = teamRepository.findById(teamId).orElseThrow(
                () -> new NotFoundException(String.format("Team with id %d not found", teamId))
        );

        List<User> users = userRepository.findAllById(teamAssignDto.getAssigneesIds());
        if(users.size() != teamAssignDto.getAssigneesIds().size()) {
            throw new NotFoundException("One or more users were not found");
        }

        team.setUsers(users);
        users.forEach(user -> {
            if(!user.getAssignedTeams().contains(team)) {
                user.getAssignedTeams().add(team);
            }
        });

        return teamMapper.toResponseDto(teamRepository.save(team));
    }

    public void deleteTeam(Integer teamId) {
        teamRepository.deleteById(teamId);
    }
}