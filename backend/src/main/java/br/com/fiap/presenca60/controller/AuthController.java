package br.com.fiap.presenca60.controller;

import br.com.fiap.presenca60.model.User;
import br.com.fiap.presenca60.repository.UserRepository;
import br.com.fiap.presenca60.security.TokenService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    // POST /auth/register -> cria a conta e já devolve o token
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {
        if (user.getName() == null || user.getEmail() == null || user.getPassword() == null
                || user.getPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Preencha nome, e-mail e senha (mínimo 6 caracteres)");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já está cadastrado");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword())); // nunca salvar a senha pura
        user.setTargetPercent(60);
        userRepository.save(user);

        return Map.of("token", tokenService.generateToken(user.getEmail()), "user", user);
    }

    // POST /auth/login -> confere e-mail e senha e devolve o token
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody User login) {
        User user = userRepository.findByEmail(login.getEmail()).orElse(null);

        if (user == null || login.getPassword() == null || !passwordEncoder.matches(login.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos");
        }

        return Map.of("token", tokenService.generateToken(user.getEmail()), "user", user);
    }
}
