package br.com.fiap.presenca60.service;

import br.com.fiap.presenca60.dto.MonthlySummary;
import br.com.fiap.presenca60.model.Attendance;
import br.com.fiap.presenca60.model.AttendanceType;
import br.com.fiap.presenca60.model.User;
import br.com.fiap.presenca60.repository.AttendanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashSet;
import java.util.Set;

@Service
public class SummaryService {

    private final AttendanceRepository attendanceRepository;
    private final Clock clock;

    public SummaryService(AttendanceRepository attendanceRepository, Clock clock) {
        this.attendanceRepository = attendanceRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public MonthlySummary summarize(User user, YearMonth month) {
        LocalDate today = LocalDate.now(clock);
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        int weekDays = (int) start.datesUntil(end.plusDays(1))
                .filter(SummaryService::isWeekDay)
                .count();

        Set<LocalDate> absences = new HashSet<>();
        Set<LocalDate> officeDates = new HashSet<>();
        for (Attendance attendance : attendanceRepository.findByUserIdAndDateBetween(user.getId(), start, end)) {
            LocalDate date = attendance.getDate();
            if (!isWeekDay(date)) continue;

            // Folgas planejadas também ajustam a quantidade de dias úteis do mês.
            if (attendance.getType() == AttendanceType.ABSENCE) {
                absences.add(date);
            } else if (attendance.getType() == AttendanceType.OFFICE && !date.isAfter(today)) {
                officeDates.add(date);
            }
        }
        officeDates.removeAll(absences);

        int eligibleDays = weekDays - absences.size();
        int officeDays = officeDates.size();
        int targetPercent = user.getTargetPercent();
        int requiredDays = (int) Math.ceil(eligibleDays * targetPercent / 100.0);
        int remainingDays = Math.max(requiredDays - officeDays, 0);
        Double attendancePercent = eligibleDays == 0
                ? null
                : Math.round(officeDays * 1000.0 / eligibleDays) / 10.0;
        boolean targetReached = eligibleDays > 0 && officeDays >= requiredDays;

        return new MonthlySummary(month.toString(), today, eligibleDays, officeDays, requiredDays,
                remainingDays, attendancePercent, targetPercent, targetReached);
    }

    private static boolean isWeekDay(LocalDate date) {
        return date.getDayOfWeek() != DayOfWeek.SATURDAY && date.getDayOfWeek() != DayOfWeek.SUNDAY;
    }
}
