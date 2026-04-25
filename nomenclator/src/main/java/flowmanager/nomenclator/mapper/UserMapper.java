package flowmanager.nomenclator.mapper;

import flowmanager.nomenclator.dto.UserCreateDto;
import flowmanager.nomenclator.dto.UserResponseDto;
import flowmanager.nomenclator.dto.UserSummaryDto;
import flowmanager.nomenclator.dto.UserUpdateDto;
import flowmanager.nomenclator.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserMapper {
    public User toEntity(UserCreateDto dto) {
        return User.builder()
                .email(dto.getEmail())
                .password(dto.getPassword())
                .username(dto.getUsername())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .phoneNumber(dto.getPhoneNumber())
                .active(Boolean.FALSE)
                .creationDate(LocalDateTime.now())
                .build();
    }

    public void updateEntityFromDto(UserUpdateDto dto, User user) {
        Optional.ofNullable(dto.getEmail()).ifPresent(user::setEmail);
        Optional.ofNullable(dto.getPassword()).ifPresent(user::setPassword);
        Optional.ofNullable(dto.getUsername()).ifPresent(user::setUsername);
        Optional.ofNullable(dto.getFirstName()).ifPresent(user::setFirstName);
        Optional.ofNullable(dto.getLastName()).ifPresent(user::setLastName);
        Optional.ofNullable(dto.getPhoneNumber()).ifPresent(user::setPhoneNumber);
    }

    public UserSummaryDto toSummaryDto(User user) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .active(user.getActive())
                .lastLogin(user.getLastLogin())
                .build();
    }

    public UserResponseDto toResponseDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .active(user.getActive())
                .creationDate(user.getCreationDate())
                .lastLogin(user.getLastLogin())
                .build();
    }
}