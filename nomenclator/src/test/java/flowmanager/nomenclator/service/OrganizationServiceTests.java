package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.CommentMapper;
import flowmanager.nomenclator.mapper.OrganizationMapper;
import flowmanager.nomenclator.mapper.TeamMapper;
import flowmanager.nomenclator.model.*;
import flowmanager.nomenclator.repository.CommentRepository;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.repository.WorkItemRepository;
import flowmanager.nomenclator.utils.BuildDtos;
import flowmanager.nomenclator.utils.BuildInstances;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

public class OrganizationServiceTests {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationMapper organizationMapper;

    @Mock
    private TeamService teamService;

    @Mock
    private TeamMapper teamMapper;

    @InjectMocks
    private OrganizationService organizationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAllOrganization_Valid() {
        List<Organization> organizations = BuildInstances.buildOrganizations();
        List<OrganizationSummaryDto> organizationsDto = organizations.stream()
                .map(BuildDtos::buildOrganizationSummaryDto)
                .toList();

        when(organizationRepository.findAll()).thenReturn(organizations);
        when(organizationMapper.toSummaryDto(organizations.get(0))).thenReturn(organizationsDto.get(0));
        when(organizationMapper.toSummaryDto(organizations.get(1))).thenReturn(organizationsDto.get(1));

        List<OrganizationSummaryDto> result = organizationService.findAllOrganizations();

        assertEquals(2, result.size());
        assertEquals(organizationsDto.get(0), result.get(0));
        assertEquals(organizationsDto.get(1), result.get(1));
        verify(organizationRepository, times(1)).findAll();
        verify(organizationMapper, times(1)).toSummaryDto(organizations.get(0));
        verify(organizationMapper, times(1)).toSummaryDto(organizations.get(1));
    }

    @Test
    void testFindAllOrganizations_EmptyList() {
        when(organizationRepository.findAll()).thenReturn(List.of());

        List<OrganizationSummaryDto> result = organizationService.findAllOrganizations();

        assertEquals(0, result.size());
        verify(organizationRepository, times(1)).findAll();
        verify(organizationMapper, never()).toResponseDto(any());
    }

    @Test
    void testFindAllTeamsByOrganizationId_Valid() {
        Organization organization = BuildInstances.buildOrganization();
        List<Team> teams = BuildInstances.buildTeams();
        organization.setTeams(teams);

        List<TeamSummaryOrganizationDto> teamsDto = teams.stream()
                .map(BuildDtos::buildTeamSummaryOrganizationDto)
                .toList();

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(teamMapper.toSummaryOrganizationDto(teams.get(0))).thenReturn(teamsDto.get(0));
        when(teamMapper.toSummaryOrganizationDto(teams.get(1))).thenReturn(teamsDto.get(1));

        List<TeamSummaryOrganizationDto> result = organizationService.findAllTeamsByOrganizationId(organization.getId());

        assertEquals(2, result.size());
        assertEquals(teamsDto.get(0), result.get(0));
        assertEquals(teamsDto.get(1), result.get(1));

        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(teamMapper, times(1)).toSummaryOrganizationDto(teams.get(0));
        verify(teamMapper, times(1)).toSummaryOrganizationDto(teams.get(1));
    }

    @Test
    void testFindAllTeamsByOrganizationId_Empty() {
        Organization organization = BuildInstances.buildOrganization();

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));

        List<TeamSummaryOrganizationDto> result = organizationService.findAllTeamsByOrganizationId(organization.getId());
        assertEquals(0, result.size());

        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(teamMapper, never()).toSummaryOrganizationDto(any());
    }

    @Test
    void testFindAllTeamsByOrganizationId_NotFound() {
        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.findAllTeamsByOrganizationId(1));

        assertEquals("Organization with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindOrganizationById_Valid() {
        Organization organization = BuildInstances.buildOrganization();
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(organization);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(organizationMapper.toResponseDto(organization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.findOrganizationById(organization.getId());
        assertEquals(responseDto, result);

        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(organizationMapper, times(1)).toResponseDto(organization);
    }

    @Test
    void testFindOrganizationById_NotFound() {
        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.findOrganizationById(1));

        assertEquals("Organization with id 1 not found", exception.getMessage());
    }

    @Test
    void testCreateOrganization_Valid() {
        User manager = BuildInstances.buildUser();

        Organization organization = Organization.builder()
                .name("Organizatia 1")
                .description("Descriere 1")
                .industry("IT")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .manager(manager)
                .build();
        Organization savedOrganization = BuildInstances.buildOrganization();
        OrganizationCreateDto createDto = new OrganizationCreateDto(
                "Organizatia 1",
                "Descriere 1",
                "IT",
                1
        );
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(savedOrganization);

        when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        when(organizationMapper.toEntity(createDto, manager)).thenReturn(organization);
        when(organizationRepository.save(organization)).thenReturn(savedOrganization);
        when(organizationMapper.toResponseDto(savedOrganization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.createOrganization(createDto);

        assertEquals(responseDto, result);
        verify(userRepository, times(1)).findById(manager.getId());
        verify(organizationMapper, times(1)).toEntity(createDto, manager);
        verify(organizationRepository, times(1)).save(organization);
        verify(organizationMapper, times(1)).toResponseDto(savedOrganization);
    }

    @Test
    void testCreateOrganization_UserNotFound() {
        OrganizationCreateDto createDto = new OrganizationCreateDto(
                "Organizatia 1",
                "Descriere 1",
                "IT",
                1
        );

        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.createOrganization(createDto));

        assertEquals("User with id 1 not found", exception.getMessage());
    }

    @Test
    void testUpdateOrganization_Valid() {
        User manager = BuildInstances.buildUser();
        List<Team> team = BuildInstances.buildTeams();

        Organization organization = BuildInstances.buildOrganization();
        Organization updatedOrganization = Organization.builder()
                .name("Organizatia 1 actualizata")
                .description("Descriere 1")
                .industry("IT")
                .manager(manager)
                .teams(new ArrayList<>())
                .build();

        OrganizationUpdateDto updateDto = new OrganizationUpdateDto("Organizatia 1 actualizat", "Descriere 1", "IT", 1);
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(updatedOrganization);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findById(1)).thenReturn(Optional.of(manager));
        doNothing().when(organizationMapper).updateEntityFromDto(updateDto, organization, manager);
        when(organizationRepository.save(organization)).thenReturn(updatedOrganization);
        when(organizationMapper.toResponseDto(updatedOrganization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.updateOrganization(organization.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, times(1)).findById(1);
        verify(organizationMapper, times(1)).updateEntityFromDto(updateDto, organization, manager);
        verify(organizationRepository, times(1)).save(organization);
        verify(organizationMapper, times(1)).toResponseDto(updatedOrganization);
    }

    @Test
    void testUpdateOrganization_OrganizationNotFound() {
        OrganizationUpdateDto updateDto = new OrganizationUpdateDto("Organizatia 1 actualizat", "Descriere 1", "IT", 1);

        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.updateOrganization(1, updateDto));

        assertEquals("Organization with id 1 not found", exception.getMessage());
    }

    @Test
    void testUpdateOrganization_ManagerIdNull() {
        Organization organization = BuildInstances.buildOrganization();
        User existingManager = organization.getManager();

        OrganizationUpdateDto updateDto = new OrganizationUpdateDto("Organizatia 1 actualizat", "Desc", "IT", null);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        doNothing().when(organizationMapper).updateEntityFromDto(updateDto, organization, existingManager);
        when(organizationRepository.save(organization)).thenReturn(organization);
        when(organizationMapper.toResponseDto(organization)).thenReturn(new OrganizationResponseDto());

        organizationService.updateOrganization(organization.getId(), updateDto);
        verify(userRepository, never()).findById(any());
    }

    @Test
    void testUpdateOrganization_ManagerNotFound() {
        Organization organization = BuildInstances.buildOrganization();

        OrganizationUpdateDto updateDto = new OrganizationUpdateDto("Organizatia 1 actualizat", "Descriere", "IT", 1);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findById(1)).thenReturn(Optional.empty());
        
        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.updateOrganization(organization.getId(), updateDto));

        assertEquals("User with id 1 not found", exception.getMessage());

        verify(userRepository, times(1)).findById(1);
        verify(organizationRepository, times(1)).findById(organization.getId());
    }

    @Test
    void testDeleteOrganization_Valid() {
        User manager = BuildInstances.buildUser();

        Organization organization = BuildInstances.buildOrganization();

        when(organizationRepository.findById(1)).thenReturn(Optional.of(organization));
        doNothing().when(teamService).deleteTeam(anyInt());
        doNothing().when(organizationRepository).deleteById(1);

        organizationService.deleteOrganization(1);

        verify(organizationRepository, times(1)).findById(1);
        verify(teamService, times(organization.getTeams().size())).deleteTeam(anyInt());
        verify(organizationRepository, times(1)).deleteById(1);
    }

    @Test
    void testDeleteOrganization_NotFound() {
        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        organizationService.deleteOrganization(1);

        verify(organizationRepository, times(1)).findById(1);
        verify(teamService, never()).deleteTeam(anyInt());
        verify(organizationRepository, never()).deleteById(anyInt());
    }
}
