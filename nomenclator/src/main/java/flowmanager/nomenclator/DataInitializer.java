package flowmanager.nomenclator;

import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User user = new User();
                user.setEmail("admin@gmail.com");
                user.setUsername("admin");
                user.setFirstName("admin");
                user.setLastName("admin");
                user.setPhoneNumber("+407777777777");
                user.setActive(Boolean.TRUE);
                user.setCreatedAt(LocalDateTime.now());
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);
            }
        };
    }
}