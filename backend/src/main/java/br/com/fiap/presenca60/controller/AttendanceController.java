package br.com.fiap.presenca60.controller;

import br.com.fiap.presenca60.model.Attendance;
import br.com.fiap.presenca60.model.User;
import br.com.fiap.presenca60.repository.AttendanceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


// CRUD dos registros de presença. @AuthenticationPrincipal = usuário que veio do token
@RestController
@RequestMapping("/attendances")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;

    public AttendanceController(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    // POST /attendances -> cria um registro
    @PostMapping
    public Attendance create(@AuthenticationPrincipal User user, @RequestBody Attendance attendance) {
        validate(attendance);
        if (attendanceRepository.existsByUserIdAndDate(user.getId(), attendance.getDate())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um registro nesta data");
        }
        attendance.setUser(user);
        return attendanceRepository.save(attendance);
    }

    // PUT /attendances/5 -> edita um registro
    @PutMapping("/{id}")
    public Attendance update(@AuthenticationPrincipal User user, @PathVariable Long id, @RequestBody Attendance data) {
        validate(data);
        Attendance attendance = findOwn(user, id);

        boolean changedDate = !attendance.getDate().equals(data.getDate());
        if (changedDate && attendanceRepository.existsByUserIdAndDate(user.getId(), data.getDate())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um registro nesta data");
        }

        attendance.setDate(data.getDate());
        attendance.setType(data.getType());
        attendance.setNote(data.getNote());
        return attendanceRepository.save(attendance);
    }

    // DELETE /attendances/5 -> exclui um registro
    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        attendanceRepository.delete(findOwn(user, id));
    }

    // Busca o registro e confere se ele é do usuário logado
    private Attendance findOwn(User user, Long id) {
        Attendance attendance = attendanceRepository.findById(id).orElse(null);
        if (attendance == null || !attendance.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro não encontrado");
        }
        return attendance;
    }

    private void validate(Attendance attendance) {
        if (attendance.getDate() == null || attendance.getType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a data e o tipo");
        }
    }
}
