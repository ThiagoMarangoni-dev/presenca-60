package br.com.fiap.presenca60.controller;

import br.com.fiap.presenca60.model.User;
import br.com.fiap.presenca60.repository.AttendanceRepository;
import br.com.fiap.presenca60.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

// Dados do usuário logado (tela de Perfil)
@RestController
@RequestMapping("/users/me")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;

    public UserController(UserRepository userRepository, AttendanceRepository attendanceRepository) {
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
    }

    // GET /users/me
    @GetMapping
    public User me(@AuthenticationPrincipal User user) {
        return user;
    }

    // PUT /users/me -> altera nome e meta
    @PutMapping
    public User update(@AuthenticationPrincipal User user, @RequestBody User data) {
        if (data.getName() == null || data.getTargetPercent() == null
                || data.getTargetPercent() < 1 || data.getTargetPercent() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o nome e uma meta entre 1 e 100");
        }
        user.setName(data.getName());
        user.setTargetPercent(data.getTargetPercent());
        return userRepository.save(user);
    }

    // DELETE /users/me -> apaga os registros e depois a conta
    @DeleteMapping
    public void delete(@AuthenticationPrincipal User user) {
        attendanceRepository.deleteAll(attendanceRepository.findByUserIdOrderByDateDesc(user.getId()));
        userRepository.delete(user);
    }
}
