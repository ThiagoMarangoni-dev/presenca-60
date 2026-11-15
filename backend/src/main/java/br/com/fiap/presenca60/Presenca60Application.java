package br.com.fiap.presenca60;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// exclude: desliga o usuário/senha padrão do Spring Security (usamos JWT)
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class Presenca60Application {
    public static void main(String[] args) {
        SpringApplication.run(Presenca60Application.class, args);
    }
}
