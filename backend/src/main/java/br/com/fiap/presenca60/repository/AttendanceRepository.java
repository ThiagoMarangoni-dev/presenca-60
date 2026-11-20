package br.com.fiap.presenca60.repository;

import br.com.fiap.presenca60.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

// O Spring cria o SQL sozinho a partir do nome de cada método
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    boolean existsByUserIdAndDate(Long userId, LocalDate date);

    List<Attendance> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);

    List<Attendance> findByUserIdOrderByDateDesc(Long userId);
}
