package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.DuplicateAttributeException;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.CommentMapper;
import flowmanager.nomenclator.mapper.ProjectMapper;
import flowmanager.nomenclator.mapper.UserMapper;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.CommentRepository;
import flowmanager.nomenclator.repository.ProjectRepository;
import flowmanager.nomenclator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final ProjectRepository projectRepository;
    private final UserMapper userMapper;
    private final CommentMapper commentMapper;
    private final ProjectMapper projectMapper;

    public List<UserSummaryDto> findAllUsers() {
        return userRepository
                .findAll()
                .stream()
                .map(userMapper::toSummaryDto)
                .toList();
    }

    public List<CommentSummaryDto> findAllCommentsByUserId(Integer userId) {
        return commentRepository.findAllCommentsByUserId(userId)
                .stream()
                .map(commentMapper::toSummaryDto)
                .toList();
    }

    public List<ProjectSummaryDto> findAllProjectsByUserId(Integer userId) {
        return projectRepository.findAllProjectsByUserId(userId)
                .stream()
                .map(projectMapper::toSummaryDto)
                .toList();
    }

    public UserResponseDto findUserById(Integer userId) {
        return userMapper.toResponseDto(userRepository.findById(userId).orElseThrow(
                () -> new NotFoundException(String.format("User with id %d not found", userId))
        ));
    }

    public UserResponseDto createUser(UserCreateDto userCreateDto) {
        User user = userMapper.toEntity(userCreateDto);

        if(userRepository.existsByEmail(user.getEmail()))
            throw new DuplicateAttributeException("Email already exists");
        if(userRepository.existsByUsername(user.getUsername()))
            throw new DuplicateAttributeException("Username already exists");

        return userMapper.toResponseDto(userRepository.save(user));
    }

    public UserResponseDto updateUser(Integer userId, UserUpdateDto userUpdateDto) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new NotFoundException(String.format("User with id %d not found", userId))
        );
        userMapper.updateEntityFromDto(userUpdateDto, user);

        if (userUpdateDto.getEmail() != null && !userUpdateDto.getEmail().equals(user.getEmail()) &&
                userRepository.existsByEmail(userUpdateDto.getEmail())) {
            throw new DuplicateAttributeException("Email already exists");
        }

        if (userUpdateDto.getUsername() != null && !userUpdateDto.getUsername().equals(user.getUsername()) &&
                userRepository.existsByUsername(userUpdateDto.getUsername())) {
            throw new DuplicateAttributeException("Username already exists");
        }

        return userMapper.toResponseDto(userRepository.save(user));
    }

    public void deleteUser(Integer userId) {
        userRepository.deleteById(userId);
    }
}